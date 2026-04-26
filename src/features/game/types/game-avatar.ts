type GameAvatar = {
	id: string;
	name: string;
	imageUrl: string;
	category?: string;
};

type GameAvatars = GameAvatar[];

export type { GameAvatar, GameAvatars };
