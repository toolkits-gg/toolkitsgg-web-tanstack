import { type PropsWithChildren, useEffect } from "react";
import { getValidatedGameId } from "#/features/game/registry/game-registry";
import { setGame } from "#/features/game/store/game-store";
import {
	parseDevGameOverride,
	parseSubdomain,
} from "#/features/game/utils/parse-subdomain";

export function GameProvider({ children }: PropsWithChildren) {
	useEffect(() => {
		const subdomainGame =
			parseSubdomain(window.location.hostname) ?? parseDevGameOverride();
		if (!subdomainGame) return;

		const validatedGameId = getValidatedGameId(subdomainGame);
		if (!validatedGameId) return;

		setGame(validatedGameId, "subdomain");
	}, []);

	return <>{children}</>;
}
