// src/hooks/useGameId.ts

import { useStore } from "@tanstack/react-store";
import { gameStore } from "#/features/game/core/store";
import type { GameId } from "@/prisma";

export function useGameId(): GameId {
	return useStore(gameStore, (state) => state.gameId) ?? "none";
}

// If you ever need the full state (e.g. to read source)
export function useGameState() {
	return useStore(gameStore, (state) => state);
}
