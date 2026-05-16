import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { SyncFavicon } from "#/features/game/core/SyncFavicon";
import { getAllRegisteredThemeClassNames } from "#/features/game/registry/game-registry";
import { DEFAULT_NEXT_THEME } from "#/features/theme/core/constants";
import { SyncAndApplyTheme } from "#/features/theme/core/SyncAndApplyTheme";
import { useMantineThemeStore } from "#/features/theme/core/store";

const allThemeClassNames: string[] = getAllRegisteredThemeClassNames();

type ThemeProviderProps = PropsWithChildren;

const MantineProviderWithTheme = ({
	children,
	...props
}: ThemeProviderProps) => {
	const mantineTheme = useMantineThemeStore((state) => state.theme);

	return (
		<NextThemesProvider
			{...props}
			enableSystem
			enableColorScheme={false} // not playing nice with the extra themes
			defaultTheme={DEFAULT_NEXT_THEME}
			disableTransitionOnChange
			themes={allThemeClassNames}
		>
			<MantineProvider
				theme={mantineTheme}
				defaultColorScheme="dark"
				deduplicateCssVariables
			>
				<SyncAndApplyTheme />
				<SyncFavicon />
				<Notifications />
				<ModalsProvider>{children}</ModalsProvider>
			</MantineProvider>
		</NextThemesProvider>
	);
};

export { MantineProviderWithTheme };
