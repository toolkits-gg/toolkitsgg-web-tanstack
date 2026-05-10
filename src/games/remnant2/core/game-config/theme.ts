import type { MantineThemeOverride } from "@mantine/core";
import { generateThemeColors } from "#/features/theme/core/generate-palette";
import type { ToolkitThemeDefinition } from "#/features/theme/core/types";
import { createThemeColors } from "#/features/theme/core/utils";
import { baseTheme } from "#/features/theme/themes/base-theme";
import { GAME_ID } from "#/games/remnant2/core/constants";

const remnant2ThemeColors = createThemeColors(
	generateThemeColors({
		primary: "#991a1a",
		secondary: "#c46d2a",
		accent: "#de4141",
		ring: "accent",
		sidebar: { dark: "#150202" },
	}),
);

const remnant2Theme: MantineThemeOverride = {
	...baseTheme,
	colors: {
		...baseTheme.colors,
		...remnant2ThemeColors,
	},
};

const THEME: ToolkitThemeDefinition = {
	label: "Remnant 2",
	className: GAME_ID,
	theme: remnant2Theme,
};

export { remnant2Theme, THEME };
