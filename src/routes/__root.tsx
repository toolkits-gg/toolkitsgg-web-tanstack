import "@mantine/core/styles.layer.css";
// ‼️ import carousel and notifications styles after core package styles
import "@mantine/carousel/styles.layer.css";
import "@mantine/notifications/styles.css";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import {
	AppShell,
	Box,
	Burger,
	ColorSchemeScript,
	Divider,
	Flex,
	Group,
	mantineHtmlProps,
	ScrollArea,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { DefaultLogo } from "#/components/AppLogo";
import { getNavLinks } from "#/components/navigation/get-nav-links";
import { NavbarLinksGroup } from "#/components/navigation/NavbarLinksGroup";
import { SocialMedia } from "#/components/SocialMedia";
import { GameProvider } from "#/features/game/components/GameProvider";
import { GameSwitcher } from "#/features/game/components/GameSwitcher";
import { ScreenshotPreviewProvider } from "#/features/screenshot/providers/ScreenshotPreviewProvider";
import { ChangeThemeButton } from "#/features/theme/components/ChangeThemeButton";
import { MantineProviderWithTheme } from "#/features/theme/providers/MantineProviderWithTheme";
import classes from "./Root.module.css";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Toolkits.gg",
			},
		],
		links: [],
	}),
	shellComponent: RootDocument,
	notFoundComponent: () => {
		return (
			<Box p="md">
				<Title order={1}>404 - Not Found</Title>
				<Text>The page you are looking for does not exist.</Text>
			</Box>
		);
	},
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const [navbarOpened, { toggle: toggleNavbar }] = useDisclosure();

	const navLinks = getNavLinks();

	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
				<HeadContent />
			</head>
			<body
				style={{
					color: `var(--mantine-color-baseFg-5)`,
					backgroundColor: `var(--mantine-color-base-5)`,
					fontFamily: `'Geist', sans-serif`,
				}}
			>
				<GameProvider>
					<MantineProviderWithTheme>
						<ScreenshotPreviewProvider />
						<AppShell
							padding="md"
							header={{ height: 60 }}
							footer={{ height: 48 }}
							navbar={{
								width: 300,
								breakpoint: "sm",
								collapsed: { mobile: !navbarOpened },
							}}
						>
							<AppShell.Header px="sm" className={classes.header}>
								<Group h="100%" justify="space-between">
									<Flex justify="start" align="center">
										<Burger
											opened={navbarOpened}
											onClick={toggleNavbar}
											hiddenFrom="sm"
											size="sm"
											color="var(--mantine-color-primary-4)"
										/>
									</Flex>

									<Flex flex={1} align="center" justify="center" gap="xs">
										<GameSwitcher />
									</Flex>

									<Flex justify="end" align="center">
										{/* <NotificationBellMenu /> */}
									</Flex>
								</Group>
							</AppShell.Header>

							<AppShell.Navbar className={classes.navbar}>
								<Flex
									component="nav"
									w={{ base: 350, sm: 300 }}
									className={classes.navbarInner}
								>
									<ScrollArea className={classes.scrollArea}>
										<div className={classes.scrollAreaContent}>
											{navLinks.map((navLink) => (
												<NavbarLinksGroup {...navLink} key={navLink.label} />
											))}
										</div>
									</ScrollArea>

									<Flex className={classes.themeChangerWrapper}>
										<ChangeThemeButton gameId="none" />
									</Flex>

									<Flex className={classes.userMenuWrapper}>User Menu</Flex>
								</Flex>
							</AppShell.Navbar>

							<AppShell.Main className={classes.main}>{children}</AppShell.Main>

							<AppShell.Footer p="xs" className={classes.footer}>
								<Flex justify="center" align="center" gap="sm" wrap="wrap">
									<DefaultLogo size={24} />
									<Text size="xs" c="dimmed">
										© {new Date().getFullYear()} Toolkits.gg
									</Text>
									<Divider orientation="vertical" />
									<SocialMedia />
								</Flex>
							</AppShell.Footer>
						</AppShell>
					</MantineProviderWithTheme>
				</GameProvider>

				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
