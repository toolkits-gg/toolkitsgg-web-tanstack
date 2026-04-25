import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Divider,
	Flex,
	Group,
	ScrollArea,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { LuCamera, LuCheck, LuPlus } from "react-icons/lu";
import { GameImage } from "#/components/GameImage";
import { ScreenshotContainer, type WatermarkConfig } from "#/features/screenshot/components/ScreenshotContainer";
import { useScreenshot } from "#/features/screenshot/hooks/use-screenshot";
import { useGameId } from "#/features/game/hooks/use-game-id";
import { getGameMetadata } from "#/features/game/registry/game-registry";
import type { AppItem } from "#/features/game/item/types/app-item";
import { collectedItemActions } from "#/features/dal/actions/collected-items";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";

type ItemInfoModalProps = {
	item: AppItem;
	isCollectable: boolean;
	onCollect: (id: string) => void;
	onUncollect: (id: string) => void;
};

const ItemInfoModal = ({
	item,
	isCollectable,
	onCollect,
	onUncollect,
}: ItemInfoModalProps) => {
	const [screenshotMode, setScreenshotMode] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const gameId = useGameId();
	const metadata = getGameMetadata(gameId);
	const watermark: WatermarkConfig | false = metadata
		? { gameConfig: { METADATA: { renderLogo: metadata.renderLogo, label: metadata.label } } }
		: false;

	const { triggerScreenshot, screenshotLoading } = useScreenshot({
		ref: containerRef,
		filename: `${item.name}.png`,
	});

	const captureStartedRef = useRef(false);
	useEffect(() => {
		if (screenshotLoading) {
			captureStartedRef.current = true;
		} else if (captureStartedRef.current) {
			captureStartedRef.current = false;
			setScreenshotMode(false);
		}
	}, [screenshotLoading]);

	const handleCapture = () => {
		setScreenshotMode(true);
		triggerScreenshot();
	};

	const { data: collectedData } = useDalQuery(collectedItemActions.list, undefined);
	const isCollected = (collectedData ?? []).some((r) => r.itemId === item.id);
	const hasDescription =
		item.description.length > 0 && item.description[0] !== "";

	const handleToggleCollect = () => {
		if (isCollected) {
			onUncollect(item.id);
		} else {
			onCollect(item.id);
		}
	};

	const itemContent = (
		<Stack gap="md" p="md">
			<Flex gap="md" align="flex-start">
				{item.imageUrl ? (
					<Box style={{ flexShrink: 0, width: 96, height: 96 }}>
						<GameImage
							src={item.imageUrl}
							style={{ width: 96, height: 96, objectFit: "contain" }}
						/>
					</Box>
				) : null}

				<Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
					<Text size="xl" fw={700} lh={1.2} c="primary">
						{item.name}
					</Text>
					<Group gap="xs">
						<Badge variant="light" size="sm">
							{String(item.category)}
						</Badge>
						{item.subcategory && (
							<Badge variant="outline" size="sm">
								{String(item.subcategory)}
							</Badge>
						)}
					</Group>
					{!screenshotMode && isCollectable && (
						<Box mt="xs">
							<Button
								size="compact-sm"
								variant={isCollected ? "filled" : "light"}
								color={isCollected ? "green" : "primary"}
								leftSection={
									isCollected ? <LuCheck size={14} /> : <LuPlus size={14} />
								}
								onClick={handleToggleCollect}
							>
								{isCollected ? "Collected" : "Mark as Collected"}
							</Button>
						</Box>
					)}
				</Stack>
			</Flex>

			{hasDescription && (
				<>
					<Divider label="Description" />
					<Stack gap="xs">
						{item.description.map((line) => (
							<Text key={line} size="sm" style={{ whiteSpace: "pre-line" }}>
								{line}
							</Text>
						))}
					</Stack>
				</>
			)}

			{item.linkedItems && Object.keys(item.linkedItems).length > 0 && (
				<>
					<Divider label="Linked Items" />
					<Stack gap="xs">
						{Object.entries(item.linkedItems).map(([key, value]) => {
							const linkedArr = Array.isArray(value) ? value : [value];
							return linkedArr.map((linked) => {
								const imageUrl =
									screenshotMode &&
									"imageUrl" in linked &&
									typeof linked.imageUrl === "string"
										? linked.imageUrl
										: null;
								return (
									<Flex key={`${key}-${linked.name}`} align="center" gap="xs">
										<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
											{key}:
										</Text>
										{imageUrl && (
											<GameImage
												src={imageUrl}
												style={{ width: 24, height: 24, objectFit: "contain" }}
											/>
										)}
										<Text size="sm">{linked.name}</Text>
									</Flex>
								);
							});
						})}
					</Stack>
				</>
			)}
		</Stack>
	);

	return (
		<Stack gap="xs">
			<Group justify="flex-end" px="md">
				<Tooltip label="Screenshot" position="left">
					<ActionIcon
						variant="subtle"
						loading={screenshotLoading}
						onClick={handleCapture}
					>
						<LuCamera size={16} />
					</ActionIcon>
				</Tooltip>
			</Group>

			<ScreenshotContainer
				ref={containerRef}
				screenshotMode={screenshotMode}
				watermark={watermark}
			>
				{screenshotMode ? (
					itemContent
				) : (
					<ScrollArea mah="80vh">{itemContent}</ScrollArea>
				)}
			</ScreenshotContainer>
		</Stack>
	);
};

export { ItemInfoModal };
export type { ItemInfoModalProps };
