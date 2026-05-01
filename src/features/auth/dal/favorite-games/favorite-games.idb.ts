import { STORE_USER_FAVORITE_GAME } from "#/features/dal/local/constants";
import { getLocalDB } from "#/features/dal/local/local-db";
import type { LocalUserFavoriteGame } from "#/features/dal/local/types";
import type { GameId } from "@/prisma";

const listLocalFavoriteGames = async (
	userId: string,
): Promise<LocalUserFavoriteGame[]> => {
	const db = await getLocalDB();
	if (!db) return [];
	return db.getAllFromIndex(STORE_USER_FAVORITE_GAME, "userId", userId);
};

const upsertLocalFavoriteGame = async (input: {
	userId: string;
	gameId: GameId;
}): Promise<LocalUserFavoriteGame> => {
	const now = new Date().toISOString();
	const db = await getLocalDB();
	const record: LocalUserFavoriteGame = {
		userId: input.userId,
		gameId: input.gameId,
		createdAt: now,
		updatedAt: now,
	};
	if (!db) return record;
	const existing = await db.get(STORE_USER_FAVORITE_GAME, [
		input.userId,
		input.gameId,
	]);
	const next: LocalUserFavoriteGame = existing
		? { ...existing, updatedAt: now }
		: record;
	await db.put(STORE_USER_FAVORITE_GAME, next);
	return next;
};

const deleteLocalFavoriteGame = async (input: {
	userId: string;
	gameId: GameId;
}): Promise<void> => {
	const db = await getLocalDB();
	if (!db) return;
	await db.delete(STORE_USER_FAVORITE_GAME, [input.userId, input.gameId]);
};

export {
	listLocalFavoriteGames,
	upsertLocalFavoriteGame,
	deleteLocalFavoriteGame,
};
