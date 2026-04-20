// src/hooks/useGameId.ts

import { useStore } from "@tanstack/react-store";
import { gameStore } from "#/features/game/store/game-store";

export function useGameId(): string {
	return useStore(gameStore, (state) => state.gameId) ?? "lobby";
}

// If you ever need the full state (e.g. to read source)
export function useGameState() {
	return useStore(gameStore, (state) => state);
}
