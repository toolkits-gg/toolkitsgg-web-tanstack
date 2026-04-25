import type { LogoSize } from "#/components/AppLogo";
import type { GameMetadata } from "#/features/game/types/game-config";
import { SlayTheSpire2Logo } from "#/games/slaythespire2/components/Logo";
import { GAME_ID } from "#/games/slaythespire2/constants/game-id";

const METADATA: GameMetadata = {
	id: GAME_ID,
	name: "Slay the Spire II",
	label: "Slay the Spire 2",
	description: `The iconic roguelike deckbuilder returns. Craft a unique deck, encounter bizarre creatures, and discover relics of immense power in Slay the Spire 2!`,
	faviconSourcePath: "games/slaythespire2/logos/512STS2.png",
	renderLogo: (size: LogoSize) => <SlayTheSpire2Logo size={size} />,
	externalResources: [
		{
			label: "Wiki.gg",
			link: "https://slaythespire.wiki.gg",
		},
	],
};

export { METADATA };
