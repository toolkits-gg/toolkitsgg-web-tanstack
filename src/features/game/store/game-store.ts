// src/stores/gameStore.ts
import { Store } from "@tanstack/store";

type GameSource = "subdomain" | "route" | "toggle" | "session" | "default";

interface GameState {
	gameId: string | null;
	source: GameSource;
}

const STORAGE_KEY = "active-game";

// Rehydrate from localStorage on module load
const stored = (() => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
})();

export const gameStore = new Store<GameState>({
	gameId: stored?.gameId ?? null,
	source: stored?.source ?? "default",
});

export function setGame(id: string, source: GameSource) {
	gameStore.setState((prev) => {
		if (prev.source === "subdomain" && source === "route") return prev;
		const next = { gameId: id, source };
		// Persist side-effect lives here, not scattered across call sites
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		} catch {}
		return next;
	});
}
