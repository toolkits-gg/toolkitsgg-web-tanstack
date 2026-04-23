import {
	ActionIcon,
	Divider,
	Flex,
	Group,
	Popover,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { LuChevronRight, LuSearch, LuStar } from "react-icons/lu";

import { DefaultLogo } from "#/components/AppLogo";
import { favoriteGameActions } from "#/features/dal/actions/favorite-games";
import { useDalMutation } from "#/features/dal/hooks/use-dal-mutation";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import { useGameId } from "#/features/game/hooks/use-game-id";
import {
	getGameConfig,
	REGISTERED_GAME_IDS,
} from "#/features/game/registry/game-registry";
import { setGame } from "#/features/game/store/game-store";
import type { GameId } from "@/prisma";

import classes from "./GameSwitcher.module.css";

type GameEntry = {
	id: GameId;
	label: string;
};

const allGames: GameEntry[] = REGISTERED_GAME_IDS.map((id) => ({
	id: id as GameId,
	label: getGameConfig(id)?.THEME?.label ?? id,
}));

const sortByLabel = (a: GameEntry, b: GameEntry) =>
	a.label.localeCompare(b.label);

type GameRowProps = {
	entry: GameEntry;
	isFavorited: boolean;
	onSelect: (id: GameId) => void;
	onToggleFavorite: (id: GameId, isFavorited: boolean) => void;
};

function GameRow({
	entry,
	isFavorited,
	onSelect,
	onToggleFavorite,
}: GameRowProps) {
	return (
		<UnstyledButton
			className={classes.gameRow}
			onClick={() => onSelect(entry.id)}
		>
			<Group w="100%" justify="space-between" wrap="nowrap">
				<Text size="sm" fw={500}>
					{entry.label}
				</Text>
				<ActionIcon
					variant="subtle"
					size="sm"
					color={isFavorited ? "yellow" : "gray"}
					onClick={(e) => {
						e.stopPropagation();
						onToggleFavorite(entry.id, isFavorited);
					}}
					aria-label={
						isFavorited ? "Remove from favorites" : "Add to favorites"
					}
				>
					<LuStar
						size={14}
						style={isFavorited ? { fill: "currentColor" } : undefined}
					/>
				</ActionIcon>
			</Group>
		</UnstyledButton>
	);
}

function GameSwitcher() {
	const [opened, { toggle, close }] = useDisclosure(false);
	const [searchQuery, setSearchQuery] = useState("");
	const activeGameId = useGameId();

	const { data } = useDalQuery(favoriteGameActions.list, undefined);
	const favorite = useDalMutation(favoriteGameActions.favorite);
	const unfavorite = useDalMutation(favoriteGameActions.unfavorite);

	const favoriteGameIds = data?.map((r) => r.gameId) ?? [];

	const activeLabel =
		getGameConfig(activeGameId)?.THEME?.label ?? "Select a game";

	const filteredGames = allGames.filter((g) =>
		g.label.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const favoriteGames = filteredGames
		.filter((g) => favoriteGameIds.includes(g.id))
		.sort(sortByLabel);

	const otherGames = filteredGames
		.filter((g) => !favoriteGameIds.includes(g.id))
		.sort(sortByLabel);

	const handleClose = () => {
		close();
		setSearchQuery("");
	};

	const handleSelectGame = (id: GameId) => {
		setGame(id, "toggle");
		handleClose();
	};

	const handleToggleFavorite = (id: GameId, isFavorited: boolean) => {
		if (isFavorited) {
			unfavorite.mutate({ gameId: id });
		} else {
			favorite.mutate({ gameId: id });
		}
	};

	return (
		<Popover
			width={320}
			position="bottom-start"
			withArrow
			shadow="md"
			withinPortal
			opened={opened}
			onChange={(isOpen) => {
				if (!isOpen) handleClose();
			}}
			zIndex={1002}
			trapFocus
		>
			<Popover.Target>
				<UnstyledButton className={classes.trigger} onClick={toggle}>
					<Group wrap="nowrap" gap="xs" justify="space-between">
						<Flex align="center" gap="sm">
							<DefaultLogo size={36} />
							<Text size="sm" fw={600}>
								{activeLabel}
							</Text>
						</Flex>
						<LuChevronRight size={18} />
					</Group>
				</UnstyledButton>
			</Popover.Target>

			<Popover.Dropdown className={classes.dropdown}>
				<TextInput
					placeholder="Search games..."
					leftSection={<LuSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
					className={classes.searchInput}
					size="sm"
					data-autofocus
				/>

				<ScrollArea.Autosize mah={400} type="auto">
					{favoriteGames.length > 0 && (
						<>
							<Text
								size="xs"
								c="dimmed"
								tt="uppercase"
								fw={700}
								px="xs"
								pt="xs"
								pb={4}
							>
								Favorites
							</Text>
							<Stack gap={4}>
								{favoriteGames.map((entry) => (
									<GameRow
										key={entry.id}
										entry={entry}
										isFavorited
										onSelect={handleSelectGame}
										onToggleFavorite={handleToggleFavorite}
									/>
								))}
							</Stack>
							{otherGames.length > 0 && (
								<Divider my="xs" className={classes.separator} />
							)}
						</>
					)}

					{otherGames.length > 0 && (
						<>
							<Text
								size="xs"
								c="dimmed"
								tt="uppercase"
								fw={700}
								px="xs"
								pt="xs"
								pb={4}
							>
								All Games
							</Text>
							<Stack gap={2}>
								{otherGames.map((entry) => (
									<GameRow
										key={entry.id}
										entry={entry}
										isFavorited={false}
										onSelect={handleSelectGame}
										onToggleFavorite={handleToggleFavorite}
									/>
								))}
							</Stack>
						</>
					)}

					{favoriteGames.length === 0 && otherGames.length === 0 && (
						<Text c="dimmed" ta="center" py="md" size="sm">
							No games found
						</Text>
					)}
				</ScrollArea.Autosize>
			</Popover.Dropdown>
		</Popover>
	);
}

export { GameSwitcher };
