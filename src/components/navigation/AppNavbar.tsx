import { Flex, ScrollArea } from "@mantine/core";
import { ClientOnly } from "@tanstack/react-router";
import { getNavLinks } from "#/components/navigation/get-nav-links";
import { NavbarLinksGroup } from "#/components/navigation/NavbarLinksGroup";
import { UserMenu } from "#/features/auth/components/UserMenu";
import { useGameId } from "#/features/game/hooks/use-game-id";
import { ChangeThemeButton } from "#/features/theme/components/ChangeThemeButton";
import classes from "./AppNavbar.module.css";

type AppNavbarProps = {
	onGettingStartedWizard: () => void;
};

const AppNavbar = ({ onGettingStartedWizard }: AppNavbarProps) => {
	const gameId = useGameId();

	const navLinks = getNavLinks({
		gameId,
		onGettingStartedWizard,
	});

	return (
		<Flex
			component="nav"
			w={{ base: 350, sm: 300 }}
			className={classes.navbarInner}
		>
			<ClientOnly fallback={<div>Loading...</div>}>
				<ScrollArea className={classes.scrollArea}>
					<div className={classes.scrollAreaContent}>
						{navLinks.map((navLink) => (
							<NavbarLinksGroup {...navLink} key={navLink.label} />
						))}
					</div>
				</ScrollArea>
			</ClientOnly>

			<Flex className={classes.themeChangerWrapper}>
				<ChangeThemeButton gameId="none" />
			</Flex>

			<ClientOnly fallback={<Flex className={classes.userMenuWrapper} />}>
				<Flex className={classes.userMenuWrapper}>
					<UserMenu />
				</Flex>
			</ClientOnly>
		</Flex>
	);
};

export { AppNavbar };
