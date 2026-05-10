import { AppImage, type AppImageProps } from "#/components/AppImage";
import { useGameId } from "#/features/game/core/use-game-id";

type GameImageProps = AppImageProps & {};

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
