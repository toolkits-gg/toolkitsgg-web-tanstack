import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { DEFAULT_NEXT_THEME } from "@/features/theme/constants/default-next-theme";
import { useMantineThemeStore } from "@/features/theme/store/theme-store";

const allThemeClassNames: string[] = []; // TODO: all-theme-classnames.ts - This feature was game-aware, need to rework it

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
				<Notifications />
				<ModalsProvider>{children}</ModalsProvider>
			</MantineProvider>
		</NextThemesProvider>
	);
};

export { MantineProviderWithTheme };
