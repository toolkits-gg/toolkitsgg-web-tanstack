import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SyncResult } from "#/features/dal/core/types";
import { compareTimestamps } from "#/features/dal/queue/lww";
import { requireUserId } from "#/features/dal/server/require-user";
import { GameId, prisma } from "@/prisma";

const PendingOpSchema = z.object({
	id: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	anonUserId: z.string(),
	entity: z.string(),
	operation: z.enum(["create", "update", "upsert", "delete"]),
	payload: z.unknown(),
	idempotencyKey: z.string(),
	status: z.enum(["pending", "syncing", "synced", "failed", "conflict"]),
	lastError: z.string().optional(),
	serverUpdatedAt: z.string().optional(),
});

type PendingOpPayload = z.infer<typeof PendingOpSchema>;

type Handler = (
	op: PendingOpPayload,
	userId: string,
) => Promise<SyncResult>;

const DEDUPE_TTL_MS = 10 * 60 * 1000;
const seen = new Map<string, { result: SyncResult; seenAt: number }>();

function rememberResult(key: string, result: SyncResult) {
	seen.set(key, { result, seenAt: Date.now() });
}

function recallResult(key: string): SyncResult | null {
	const entry = seen.get(key);
	if (!entry) return null;
	if (Date.now() - entry.seenAt > DEDUPE_TTL_MS) {
		seen.delete(key);
		return null;
	}
	return entry.result;
}

const remnant2CollectedItemHandler: Handler = async (op, userId) => {
	const payload = op.payload as { itemId?: string } | null;
	const itemId = payload?.itemId;
	if (!itemId) return { status: "error", message: "missing itemId" };

	const record = await prisma.remnant2CollectedItem.findUnique({
		where: { userId_itemId: { userId, itemId } },
	});

	if (op.operation === "delete") {
		if (!record) return { status: "noop" };
		const cmp = compareTimestamps(record, op);
		if (cmp === "server-wins") return { status: "conflict", serverRecordJson: JSON.stringify(record) };
		await prisma.remnant2CollectedItem.deleteMany({
			where: { userId, itemId },
		});
		return { status: "applied" };
	}

	if (record) {
		const cmp = compareTimestamps(record, op);
		if (cmp === "server-wins") return { status: "conflict", serverRecordJson: JSON.stringify(record) };
		return { status: "noop" };
	}

	await prisma.remnant2CollectedItem.create({ data: { userId, itemId } });
	return { status: "applied" };
};

const userFavoriteGameHandler: Handler = async (op, userId) => {
	const payload = op.payload as { gameId?: string } | null;
	const rawGameId = payload?.gameId;
	if (!rawGameId) return { status: "error", message: "missing gameId" };
	const gameId = GameId[rawGameId as keyof typeof GameId];
	if (!gameId) return { status: "error", message: `unknown gameId ${rawGameId}` };

	const record = await prisma.userFavoriteGame.findUnique({
		where: { userId_gameId: { userId, gameId } },
	});

	if (op.operation === "delete") {
		if (!record) return { status: "noop" };
		const cmp = compareTimestamps(record, op);
		if (cmp === "server-wins")
			return { status: "conflict", serverRecordJson: JSON.stringify(record) };
		await prisma.userFavoriteGame.deleteMany({ where: { userId, gameId } });
		return { status: "applied" };
	}

	if (record) {
		const cmp = compareTimestamps(record, op);
		if (cmp === "server-wins")
			return { status: "conflict", serverRecordJson: JSON.stringify(record) };
		return { status: "noop" };
	}

	await prisma.userFavoriteGame.create({ data: { userId, gameId } });
	return { status: "applied" };
};

const handlers: Record<string, Handler | undefined> = {
	remnant2CollectedItem: remnant2CollectedItemHandler,
	userFavoriteGame: userFavoriteGameHandler,
};

export const applyPendingOpServerFn = createServerFn({ method: "POST" })
	.inputValidator((v: unknown) => PendingOpSchema.parse(v))
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const dedupeKey = `${userId}:${data.idempotencyKey}`;
		const cached = recallResult(dedupeKey);
		if (cached) return cached;

		const handler = handlers[data.entity];
		if (!handler) {
			return { status: "error", message: `no sync handler for ${data.entity}` };
		}

		try {
			const result = await handler(data, userId);
			rememberResult(dedupeKey, result);
			return result;
		} catch (err) {
			return {
				status: "error",
				message: err instanceof Error ? err.message : String(err),
			};
		}
	});
