// src/lib/subdomainParser.ts

const ROOT_DOMAINS = ["toolkits.gg", "www.toolkits.gg", "localhost"];

export function parseSubdomain(hostname: string): string | null {
	// Strip port (e.g. localhost:3000)
	const host = hostname.split(":")[0];

	// No subdomain possible on bare localhost
	if (host === "localhost") return null;

	// Check against known root domains
	for (const root of ROOT_DOMAINS) {
		if (host === root) return null;
	}

	// e.g. "chess.mysite.gg" → ["chess", "mysite", "gg"]
	const parts = host.split(".");

	// Need at least 3 parts for a subdomain: [sub, domain, tld]
	if (parts.length < 3) return null;

	const subdomain = parts[0];

	// Reject "www" explicitly in case it slips through
	if (subdomain === "www") return null;

	// Optionally validate against your game registry
	// to avoid treating unrelated subdomains as gameIds
	// import { GAMES } from '~/games/registry'
	// if (!GAMES[subdomain]) return null

	return subdomain;
}

// For dev: support ?_game=chess as a subdomain override
// Usage: http://localhost:3000?_game=chess
export function parseDevGameOverride(): string | null {
	if (import.meta.env.PROD) return null;
	const params = new URLSearchParams(window.location.search);
	return params.get("_game");
}
