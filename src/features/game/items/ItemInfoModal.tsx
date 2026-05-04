import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Divider,
	Flex,
	Grid,
	Group,
	ScrollArea,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { Fragment, useEffect, useRef, useState } from "react";
import { LuCamera, LuCheck, LuPlus } from "react-icons/lu";
import { GameImage } from "#/components/GameImage";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import { useGameId } from "#/features/game/core/use-game-id";
import type {
	AppItem,
	CollectItemInput,
	GameCollectedItemsDal,
} from "#/features/game/items/types";
import { getGameMetadata } from "#/features/game/registry/game-registry";
import {
	ScreenshotContainer,
	type WatermarkConfig,
} from "#/features/screenshot/core/ScreenshotContainer";
import { useScreenshot } from "#/features/screenshot/hooks/use-screenshot";

type ItemInfoModalProps = {
	item: AppItem;
	resolveLinkedItems: (item: AppItem) => AppItem[];
	dal: GameCollectedItemsDal;
	isCollectable: boolean;
	onCollect: ({ itemId, itemName }: CollectItemInput) => void;
	onUncollect: ({ itemId, itemName }: CollectItemInput) => void;
};

const ItemInfoModal = ({
	item,
	resolveLinkedItems,
	dal,
	isCollectable,
	onCollect,
	onUncollect,
}: ItemInfoModalProps) => {
	const [_screenshotMode, setScreenshotMode] = useState(false);
	const screenshotMode = true; // TODO REVERT
	const containerRef = useRef<HTMLDivElement>(null);

	const gameId = useGameId();
	const metadata = getGameMetadata(gameId);
	const watermark: WatermarkConfig | false = metadata
		? {
				gameConfig: {
					METADATA: { renderLogo: metadata.renderLogo, label: metadata.label },
				},
			}
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

	const { data: collectedData } = useDalQuery(dal.list, undefined);
	const isCollected = (collectedData ?? []).some((r) => r.itemId === item.id);
	const hasDescription =
		item.description.length > 0 && item.description[0] !== "";

	const handleToggleCollect = () => {
		if (isCollected) {
			onUncollect({ itemId: item.id, itemName: item.name });
		} else {
			onCollect({ itemId: item.id, itemName: item.name });
		}
	};

	const linkedItems = resolveLinkedItems(item);

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

			{linkedItems.length > 0 && (
				<>
					<Divider label="Linked Items" />
					<Grid align="center" gap="xs">
						{linkedItems.map((linkedItem) => {
							return (
								<Fragment key={`${linkedItem.id}-${linkedItem.name}`}>
									<Grid.Col span={3}>
										<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
											{linkedItem.category}:
										</Text>
										<GameImage
											src={linkedItem.imageUrl}
											style={{
												width: 24,
												height: 24,
												objectFit: "contain",
											}}
										/>
									</Grid.Col>
									<Grid.Col span={3}>
										<Text size="xs">{linkedItem.name}</Text>
									</Grid.Col>
								</Fragment>
							);
						})}
					</Grid>
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
