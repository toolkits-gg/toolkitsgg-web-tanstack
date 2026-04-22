import {
	defineDalRead,
	defineDalWrite,
} from "#/features/dal/core/define-action";
import type { DalContext } from "#/features/dal/core/types";
import {
	deleteLocalFavoriteGame,
	listLocalFavoriteGames,
	upsertLocalFavoriteGame,
} from "#/features/dal/local/favorite-games-idb";
import type { LocalUserFavoriteGame } from "#/features/dal/local/local-db";
import {
	favoriteGameServerFn,
	listFavoriteGamesServerFn,
	unfavoriteGameServerFn,
} from "#/features/dal/server/favorite-games";
import { applyPendingOpServerFn } from "#/features/dal/server/sync";
import type { GameId } from "@/prisma";

interface FavoriteGameInput {
	gameId: GameId;
}

function resolveLocalUserId(ctx: DalContext): string {
	return ctx.authUserId ?? ctx.anonUserId;
}

export const favoriteGameActions = {
	list: defineDalRead<void, LocalUserFavoriteGame[]>({
		queryKey: () => ["userFavoriteGame", "list"] as const,
		remote: async () => {
			const rows = await listFavoriteGamesServerFn();
			return rows.map((r) => ({
				userId: r.userId,
				gameId: r.gameId,
				createdAt: r.createdAt.toISOString(),
				updatedAt: r.updatedAt.toISOString(),
			}));
		},
		local: async (_input, ctx) => {
			const userId = resolveLocalUserId(ctx);
			if (!userId) return [];
			return listLocalFavoriteGames(userId);
		},
	}),

	favorite: defineDalWrite<FavoriteGameInput, LocalUserFavoriteGame>({
		entity: "userFavoriteGame",
		operation: "upsert",
		invalidates: ["userFavoriteGame"],
		buildIdempotencyKey: (input, ctx) =>
			`userFavoriteGame:upsert:${ctx.anonUserId}:${input.gameId}`,
		remote: async (input) => {
			const row = await favoriteGameServerFn({ data: input });
			return {
				userId: row.userId,
				gameId: row.gameId,
				createdAt: row.createdAt.toISOString(),
				updatedAt: row.updatedAt.toISOString(),
			};
		},
		local: async (input, ctx) => {
			const userId = resolveLocalUserId(ctx);
			return upsertLocalFavoriteGame({ userId, gameId: input.gameId });
		},
		sync: (op) => applyPendingOpServerFn({ data: op }),
	}),

	unfavorite: defineDalWrite<FavoriteGameInput, { ok: true }>({
		entity: "userFavoriteGame",
		operation: "delete",
		invalidates: ["userFavoriteGame"],
		buildIdempotencyKey: (input, ctx) =>
			`userFavoriteGame:delete:${ctx.anonUserId}:${input.gameId}`,
		remote: async (input) => unfavoriteGameServerFn({ data: input }),
		local: async (input, ctx) => {
			const userId = resolveLocalUserId(ctx);
			await deleteLocalFavoriteGame({ userId, gameId: input.gameId });
			return { ok: true as const };
		},
		sync: (op) => applyPendingOpServerFn({ data: op }),
	}),
};
