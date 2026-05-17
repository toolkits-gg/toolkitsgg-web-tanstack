import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { parseSubdomain } from "#/features/game/core/utils";
import type { GameId } from "@/prisma";

// Reads the request's Host header and resolves a registered gameId from any
// subdomain prefix.
// This is the only way to get the game id on the server
const getSubdomainGameIdServerFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<GameId | null> => {
	const request = getRequest();
	const host = request.headers.get("host") ?? "";
	const subdomain = parseSubdomain(host);
	return subdomain ? (subdomain as GameId) : null;
});

export { getSubdomainGameIdServerFn };
