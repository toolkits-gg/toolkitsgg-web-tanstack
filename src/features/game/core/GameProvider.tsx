import { type PropsWithChildren, useEffect } from "react";
import { setGame } from "#/features/game/core/store";
import {
	parseDevGameOverride,
	parseSubdomain,
} from "#/features/game/core/utils";
import { getValidatedGameId } from "#/features/game/registry/game-registry";

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
