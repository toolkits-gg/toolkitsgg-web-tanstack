// src/hooks/useGameId.ts

import { useSelector } from "@tanstack/react-store";
import { gameStore } from "#/features/game/core/store";
import type { GameId } from "@/prisma";

export function useGameId(): GameId {
	return useSelector(gameStore, (state) => state.gameId) ?? "none";
}

// If you ever need the full state (e.g. to read source)
export function useGameState() {
	return useSelector(gameStore, (state) => state);
}
