import type { GameAvatar } from "#/features/game/types/game-avatar";
import { CHARACTERS } from "#/games/slaythespire2/item-data/characters";

const AVATARS: GameAvatar[] = CHARACTERS.filter((c) => c.imageUrl).map(
	({ id, name, imageUrl, category }) => ({
		id,
		name,
		imageUrl: imageUrl as string,
		category,
	}),
);

export { AVATARS };
