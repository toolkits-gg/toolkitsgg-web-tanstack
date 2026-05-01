import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { userFavoriteGameHandler } from "#/features/auth/dal/favorite-games/sync-handler.server";
import { requireUserId } from "#/features/auth/dal/require-user.server";
import {
	userAvatarOverrideHandler,
	userProfileHandler,
} from "#/features/auth/dal/user-profile/sync-handler.server";
import type { SyncHandler, SyncResult } from "#/features/dal/core/types";
import { gameSyncHandlers } from "#/features/game/registry/game-sync-handler-registry";

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

const DEDUPE_TTL_MS = 10 * 60 * 1000;
const seen = new Map<string, { result: SyncResult; seenAt: number }>();

const rememberResult = (key: string, result: SyncResult) => {
	seen.set(key, { result, seenAt: Date.now() });
};

const recallResult = (key: string): SyncResult | null => {
	const entry = seen.get(key);
	if (!entry) return null;
	if (Date.now() - entry.seenAt > DEDUPE_TTL_MS) {
		seen.delete(key);
		return null;
	}
	return entry.result;
};

const handlers: Record<string, SyncHandler | undefined> = {
	...gameSyncHandlers,
	userFavoriteGame: userFavoriteGameHandler,
	userAvatarOverride: userAvatarOverrideHandler,
	userProfile: userProfileHandler,
};

const applyPendingOpServerFn = createServerFn({ method: "POST" })
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

export { applyPendingOpServerFn };
