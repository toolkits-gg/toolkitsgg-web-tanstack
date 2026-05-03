import type { ImageProps } from "@mantine/core";
import { AppImage } from "#/components/AppImage";
import { useGameId } from "#/features/game/core/use-game-id";

type GameImageProps = ImageProps & {};

/**
 * Small AppImage wrapper that automatically resolves the image URL
 * based on the current game ID.
 */
const GameImage = ({ src, ...rest }: GameImageProps) => {
	const gameId = useGameId();

	if (gameId === "none") {
		throw new Error(`Game ID is required to resolve image URL: ${src}`);
	}

	return <AppImage src={`games/${gameId}/${src}`} {...rest} />;
};

export { GameImage, type GameImageProps };
