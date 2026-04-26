import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { GameId } from "@/prisma";

const DB_NAME = "toolkitsgg-local";
const DB_VERSION = 2;

export const STORE_USER_PROFILE = "userProfile";
export const STORE_USER_FAVORITE_GAME = "userFavoriteGame";
export const STORE_USER_AVATAR_OVERRIDE = "userAvatarOverride";

export interface LocalUserProfile {
	userId: string;
	displayName: string;
	bio: string;
	primaryAvatarId: string | null;
	primaryAvatarGameId: GameId | null;
	createdAt: string;
	updatedAt: string;
}

export interface LocalUserFavoriteGame {
	userId: string;
	gameId: GameId;
	createdAt: string;
	updatedAt: string;
}

export interface LocalUserAvatarOverride {
	id: string;
	userId: string;
	gameId: GameId;
	avatarId: string;
	avatarGameId: GameId;
	createdAt: string;
	updatedAt: string;
}

interface LocalDB extends DBSchema {
	userProfile: {
		key: string;
		value: LocalUserProfile;
		indexes: { userId: string };
	};
	userFavoriteGame: {
		key: [string, string];
		value: LocalUserFavoriteGame;
		indexes: { userId: string };
	};
	userAvatarOverride: {
		key: string;
		value: LocalUserAvatarOverride;
		indexes: { userId: string };
	};
}

let dbPromise: Promise<IDBPDatabase<LocalDB>> | null = null;

export function getLocalDB(): Promise<IDBPDatabase<LocalDB>> | null {
	if (typeof indexedDB === "undefined") return null;
	if (!dbPromise) {
		dbPromise = openDB<LocalDB>(DB_NAME, DB_VERSION, {
			upgrade(db, oldVersion) {
				if (oldVersion < 1) {
					if (!db.objectStoreNames.contains(STORE_USER_FAVORITE_GAME)) {
						const store = db.createObjectStore(STORE_USER_FAVORITE_GAME, {
							keyPath: ["userId", "gameId"],
						});
						store.createIndex("userId", "userId");
					}
					// v1 userAvatarOverride used imageUrl; we'll recreate it in v2
					if (!db.objectStoreNames.contains(STORE_USER_AVATAR_OVERRIDE)) {
						const store = db.createObjectStore(STORE_USER_AVATAR_OVERRIDE, {
							keyPath: "id",
						});
						store.createIndex("userId", "userId");
					}
				}

				if (oldVersion < 2) {
					// Recreate userAvatarOverride with avatarId/avatarGameId schema
					if (db.objectStoreNames.contains(STORE_USER_AVATAR_OVERRIDE)) {
						db.deleteObjectStore(STORE_USER_AVATAR_OVERRIDE);
					}
					const overrideStore = db.createObjectStore(
						STORE_USER_AVATAR_OVERRIDE,
						{ keyPath: "id" },
					);
					overrideStore.createIndex("userId", "userId");

					// Add userProfile store
					if (!db.objectStoreNames.contains(STORE_USER_PROFILE)) {
						const profileStore = db.createObjectStore(STORE_USER_PROFILE, {
							keyPath: "userId",
						});
						profileStore.createIndex("userId", "userId");
					}
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
