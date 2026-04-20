import { useEffect } from "react";
import { setGame } from "#/features/game/store/game-store";
import {
	parseDevGameOverride,
	parseSubdomain,
} from "#/features/game/utils/parse-subdomain";

export function GameProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const subdomainGame =
			parseSubdomain(window.location.hostname) ?? parseDevGameOverride();

		if (subdomainGame) {
			setGame(subdomainGame, "subdomain");
		}
	}, []);

	return <>{children}</>;
}
