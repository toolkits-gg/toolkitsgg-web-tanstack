import { isRegisteredGameId } from "#/features/game/registry/game-registry.tsx";

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

	// e.g. "remnant2.toolkits.gg" -> ["remnant2", "toolkits", "gg"]
	const parts = host.split(".");

	// Need at least 3 parts for a subdomain: [sub, domain, tld]
	if (parts.length < 3) return null;

	const subdomain = parts[0];

	// Reject "www" explicitly in case it slips through
	if (subdomain === "www") return null;

	// Reject invalid subdomains
	if (!isRegisteredGameId(subdomain)) return null;

	return subdomain;
}

// For dev: support ?_game=remnant2 as a subdomain override
// Usage: http://localhost:3000?_game=remnant2
export function parseDevGameOverride(): string | null {
	if (import.meta.env.PROD) return null;
	const params = new URLSearchParams(window.location.search);
	return params.get("_game");
}
