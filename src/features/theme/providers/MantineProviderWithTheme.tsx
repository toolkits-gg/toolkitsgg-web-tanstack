import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { getAllRegisteredThemeClassNames } from "#/features/game/registry/game-registry";
import { SyncAndApplyTheme } from "#/features/theme/providers/SyncAndApplyTheme";
import { DEFAULT_NEXT_THEME } from "@/features/theme/constants/default-next-theme";
import { useMantineThemeStore } from "@/features/theme/store/theme-store";

const allThemeClassNames: string[] = getAllRegisteredThemeClassNames();

type ThemeProviderProps = React.PropsWithChildren;

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
			<MantineProvider theme={mantineTheme} defaultColorScheme="dark">
				<SyncAndApplyTheme />
				<Notifications />
				<ModalsProvider>{children}</ModalsProvider>
			</MantineProvider>
		</NextThemesProvider>
	);
};

export { MantineProviderWithTheme };
