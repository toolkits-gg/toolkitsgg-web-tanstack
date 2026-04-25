import type { LogoSize } from "#/components/AppLogo";
import type { AppItem } from "#/features/game/item/types/app-item";
import type { GameConfig } from "#/features/game/types/game-config";
import { defaultTheme } from "#/features/theme/themes/default-theme";
import type { ToolkitThemeDefinition } from "#/features/theme/types/toolkit-theme-definition";
import { GAME_CONFIG as CLAIROBSCUR_CONFIG } from "#/games/clairobscur/game-config";
import { GAME_CONFIG as REMNANT2_CONFIG } from "#/games/remnant2/game-config";
import { GAME_CONFIG as SLAYTHESPIRE2_CONFIG } from "#/games/slaythespire2/game-config";
import type { GameId } from "@/prisma";

// Widened type for runtime-keyed access (base AppItem, string category)
type AnyGameConfig = GameConfig<AppItem, string>;

// The registry — keys are the exact gameId strings
const GAME_REGISTRY = {
	clairobscur: CLAIROBSCUR_CONFIG,
	remnant2: REMNANT2_CONFIG,
	slaythespire2: SLAYTHESPIRE2_CONFIG,
} satisfies Record<Exclude<GameId, "none">, AnyGameConfig>;

// Derived union of valid keys — avoids hard-coding
type RegistryGameId = keyof typeof GAME_REGISTRY;

// All registered IDs (useful for iteration, nav menus, subdomain validation)
const REGISTERED_GAME_IDS: readonly RegistryGameId[] = Object.keys(
	GAME_REGISTRY,
) as RegistryGameId[];

// Type guard: narrows arbitrary string to RegistryGameId
function isRegisteredGameId(id: string): id is RegistryGameId {
	return id in GAME_REGISTRY;
}

// Generic runtime lookup — returns widened AnyGameConfig or undefined
function getGameConfig(gameId: string): AnyGameConfig | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId];
}

// Items shortcut — returns ITEMS bucket or undefined
function getGameItems(gameId: string): AnyGameConfig["ITEMS"] | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId]?.ITEMS;
}

// Logo shortcut - returns METADATA.renderLogo response or undefined
function getGameLogo(gameId: string, logoSize: LogoSize = 36): React.ReactNode {
	return GAME_REGISTRY[gameId as RegistryGameId]?.METADATA?.renderLogo?.(
		logoSize,
	);
}

// Theme shortcut — returns ToolkitThemeDefinition or undefined
function getGameTheme(gameId: string): ToolkitThemeDefinition | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId]?.THEME;
}

// Metadata shortcut - returns METADATA or undefined
function getGameMetadata(
	gameId: string,
): AnyGameConfig["METADATA"] | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId]?.METADATA;
}

// Pages shortcut — returns PAGES bucket or undefined
function getGamePages(gameId: string): AnyGameConfig["PAGES"] | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId]?.PAGES;
}

// Type-safe overload when the caller already holds a literal RegistryGameId.
// Return type preserves the original narrow generics from satisfies.
function getGameConfigTyped<TId extends RegistryGameId>(
	gameId: TId,
): (typeof GAME_REGISTRY)[TId] {
	return GAME_REGISTRY[gameId];
}

// Return an array of all THEME defintions across registered games (for validation, theme switcher dropdowns, etc.)
function getAllRegisteredThemeDefinitions(): ToolkitThemeDefinition[] {
	const definitions: ToolkitThemeDefinition[] = [
		{
			label: "Default Light",
			className: "default-light",
			theme: defaultTheme,
		},
		{
			label: "Default Dark",
			className: "default-dark",
			theme: defaultTheme,
		},
	];

	for (const gameId of REGISTERED_GAME_IDS) {
		const theme = getGameTheme(gameId);
		if (theme) {
			definitions.push({
				label: `${theme.label} - Light`,
				className: `${theme.className}-light`,
				theme: theme.theme,
			});
			definitions.push({
				label: `${theme.label} - Dark`,
				className: `${theme.className}-dark`,
				theme: theme.theme,
			});
		}
	}
	return definitions;
}

// Return an array of all THEME classNames across registered games (for validation, theme switcher dropdowns, etc.)
function getAllRegisteredThemeClassNames(): string[] {
	return getAllRegisteredThemeDefinitions()
		.map((def) => def.className)
		.sort();
}

export {
	GAME_REGISTRY,
	REGISTERED_GAME_IDS,
	getAllRegisteredThemeClassNames,
	getAllRegisteredThemeDefinitions,
	getGameConfig,
	getGameLogo,
	getGameItems,
	getGameMetadata,
	getGamePages,
	getGameTheme,
	getGameConfigTyped,
	isRegisteredGameId,
};

export type { AnyGameConfig, RegistryGameId };
