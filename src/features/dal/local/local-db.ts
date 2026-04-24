import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { GameId } from "@/prisma";

const DB_NAME = "toolkitsgg-local";
const DB_VERSION = 1;

export const STORE_USER_FAVORITE_GAME = "userFavoriteGame";
export const STORE_USER_AVATAR_OVERRIDE = "userAvatarOverride";

export interface LocalUserFavoriteGame {
	userId: string;
	gameId: GameId;
	createdAt: string;
	updatedAt: string;
}

export interface LocalUserAvatarOverride {
	id: string;
	userProfileId: string;
	gameId: GameId;
	imageUrl: string;
	createdAt: string;
	updatedAt: string;
}

interface LocalDB extends DBSchema {
	userFavoriteGame: {
		key: [string, string];
		value: LocalUserFavoriteGame;
		indexes: { userId: string };
	};
	userAvatarOverride: {
		key: string;
		value: LocalUserAvatarOverride;
		indexes: { userProfileId: string };
	};
}

let dbPromise: Promise<IDBPDatabase<LocalDB>> | null = null;

export function getLocalDB(): Promise<IDBPDatabase<LocalDB>> | null {
	if (typeof indexedDB === "undefined") return null;
	if (!dbPromise) {
		dbPromise = openDB<LocalDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains(STORE_USER_FAVORITE_GAME)) {
					const store = db.createObjectStore(STORE_USER_FAVORITE_GAME, {
						keyPath: ["userId", "gameId"],
					});
					store.createIndex("userId", "userId");
				}
				if (!db.objectStoreNames.contains(STORE_USER_AVATAR_OVERRIDE)) {
					const store = db.createObjectStore(STORE_USER_AVATAR_OVERRIDE, {
						keyPath: "id",
					});
					store.createIndex("userProfileId", "userProfileId");
				}
			},
		});
	}
	return dbPromise;
}

export async function _resetLocalDBForTests(): Promise<void> {
	if (dbPromise) {
		const db = await dbPromise;
		db.close();
		dbPromise = null;
	}
	if (typeof indexedDB === "undefined") return;
	await new Promise<void>((resolve) => {
		const req = indexedDB.deleteDatabase(DB_NAME);
		req.onsuccess = () => resolve();
		req.onerror = () => resolve();
		req.onblocked = () => resolve();
	});
}
