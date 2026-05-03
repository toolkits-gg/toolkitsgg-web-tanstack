import type { LogoSize } from "#/components/AppLogo";
import type { GameMetadata } from "#/features/game/core/types";
import { ClairObscurLogo } from "#/games/clairobscur/components/Logo";
import { GAME_ID } from "#/games/clairobscur/constants/game-id";

const METADATA: GameMetadata = {
	id: GAME_ID,
	name: "Clair Obscur: Expedition 33",
	label: "Clair Obscur",
	description: `Clair Obscur: Expedition 33 is a turn-based role-playing video game developed by French studio Sandfall Interactive and published by Kepler Interactive. It follows the volunteers of Expedition 33, who set out to destroy the Paintress, a being at the root of the yearly Gommage, which erases those above an ever-decreasing age.`,
	faviconSourcePath: "games/clairobscur/logos/512C33.png",
	renderLogo: (size: LogoSize) => <ClairObscurLogo size={size} />,
	externalResources: [
		{
			label: "Fandom Wiki",
			link: "https://clair-obscur.fandom.com/wiki/Clair_Obscur_Wiki",
		},
	],
};

export { METADATA };
