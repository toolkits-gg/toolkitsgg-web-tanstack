import type { SyncHandler } from "#/features/dal/core/types";
import { compareTimestamps } from "#/features/dal/queue/last-write-wins";
import { GameId, prisma } from "@/prisma";

const userFavoriteGameHandler: SyncHandler = async (op, userId) => {
	const payload = op.payload as { gameId?: string } | null;
	const rawGameId = payload?.gameId;
	if (!rawGameId) return { status: "error", message: "missing gameId" };
	const gameId = GameId[rawGameId as keyof typeof GameId];
	if (!gameId)
		return { status: "error", message: `unknown gameId ${rawGameId}` };

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

export { userFavoriteGameHandler };
