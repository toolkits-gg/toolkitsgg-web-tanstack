import { useEffect } from "react";
import { useGameId } from "#/features/game/hooks/use-game-id";
import { isRegisteredGameId } from "#/features/game/registry/game-registry";

const FAVICON_BASE_PATH = "/favicons/";

const SyncFavicon = () => {
	const gameId = useGameId();

	useEffect(() => {
		const key =
			gameId !== "none" && isRegisteredGameId(gameId) ? gameId : "default";

		document
			.querySelectorAll<HTMLLinkElement>(
				'link[rel="icon"], link[rel="apple-touch-icon"]',
			)
			.forEach((link) => {
				link.href = link.href.replace(
					new RegExp(`${FAVICON_BASE_PATH}[^/]+/`),
					`${FAVICON_BASE_PATH}${key}/`,
				);
			});
	}, [gameId]);

	return null;
};

export { SyncFavicon };
