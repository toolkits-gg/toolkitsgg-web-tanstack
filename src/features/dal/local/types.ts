import type { GameId } from "@/prisma";

interface LocalUserAvatarOverride {
	id: string;
	userId: string;
	gameId: GameId;
	avatarId: string;
	avatarGameId: GameId;
	createdAt: string;
	updatedAt: string;
}

interface LocalUserProfile {
	userId: string;
	displayName: string;
	bio: string;
	primaryAvatarId: string | null;
	primaryAvatarGameId: GameId | null;
	createdAt: string;
	updatedAt: string;
}

interface LocalUserFavoriteGame {
	userId: string;
	gameId: GameId;
	createdAt: string;
	updatedAt: string;
}

export type {
	LocalUserProfile,
	LocalUserFavoriteGame,
	LocalUserAvatarOverride,
};
