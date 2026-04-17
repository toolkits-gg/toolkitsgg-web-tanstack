"use client";

import { ActionIcon } from "@mantine/core";
import { modals } from "@mantine/modals";
import { LuPalette } from "react-icons/lu";

import { ThemeChangerModalContent } from "@/features/theme/components/ThemeChangerModalContent";
import type { GameId } from "@/prisma";

type ThemeChangeProps = {
	gameId: GameId | undefined;
};

const ThemeChanger = ({ gameId }: ThemeChangeProps) => {
	const handleOpenThemeModal = () => {
		modals.open({
			title: "Change theme",
			children: <ThemeChangerModalContent gameId={gameId} />,
		});
	};

	return (
		<ActionIcon
			onClick={handleOpenThemeModal}
			aria-label="Theme settings"
			title="Change theme settings"
			variant="subtle"
			size="lg"
			color="primary.5"
			data-wizard-target="theme-changer"
		>
			<LuPalette />
		</ActionIcon>
	);
};

export { ThemeChanger };
