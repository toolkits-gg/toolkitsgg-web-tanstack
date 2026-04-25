import type { LogoSize } from "#/components/AppLogo";
import type { GameMetadata } from "#/features/game/types/game-config";
import { Remnant2Logo } from "#/games/remnant2/components/Logo";
import { GAME_ID } from "#/games/slaythespire2/constants/game-id";

const METADATA: GameMetadata = {
	id: GAME_ID,
	name: "Remnant II",
	label: "Remnant 2",
	description: `REMNANT II® pits survivors of humanity against new deadly creatures and god-like bosses across terrifying worlds. Play solo or co-op with two other friends to explore the depths of the unknown to stop an evil from destroying reality itself.`,
	faviconSourcePath: "games/remnant2/logos/512R2.png",
	renderLogo: (size: LogoSize) => <Remnant2Logo size={size} />,
	externalResources: [
		{
			label: "Wiki.gg",
			link: "https://remnant2.wiki.gg/",
		},
	],
};

export { METADATA };
