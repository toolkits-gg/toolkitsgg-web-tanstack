import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type {
	ListOpsFilter,
	PendingOp,
	PendingOpStatus,
} from "#/features/dal/queue/types";

const DB_NAME = "toolkitsgg-pending-ops";
const DB_VERSION = 1;
const STORE_NAME = "ops";

interface PendingOpsDB extends DBSchema {
	ops: {
		key: string;
		value: PendingOp;
		indexes: {
			createdAt: string;
			entity: string;
			status: PendingOpStatus;
		};
	};
}

let dbPromise: Promise<IDBPDatabase<PendingOpsDB>> | null = null;

const getDB = (): Promise<IDBPDatabase<PendingOpsDB>> | null => {
	if (typeof indexedDB === "undefined") return null;
	if (!dbPromise) {
		dbPromise = openDB<PendingOpsDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
				store.createIndex("createdAt", "createdAt");
				store.createIndex("entity", "entity");
				store.createIndex("status", "status");
			},
		});
	}
	return dbPromise;
};

type EnqueueInput = Omit<
	PendingOp,
	"id" | "createdAt" | "updatedAt" | "status"
> & {
	id?: string;
	status?: PendingOpStatus;
};

const enqueueOp = async (input: EnqueueInput): Promise<PendingOp | null> => {
	const db = await getDB();
	if (!db) return null;
	const now = new Date().toISOString();
	const op: PendingOp = {
		id: input.id ?? crypto.randomUUID(),
		createdAt: now,
		updatedAt: now,
		status: input.status ?? "pending",
		anonUserId: input.anonUserId,
		entity: input.entity,
		operation: input.operation,
		payload: input.payload,
		idempotencyKey: input.idempotencyKey,
		lastError: input.lastError,
		serverUpdatedAt: input.serverUpdatedAt,
	};
	await db.put(STORE_NAME, op);
	return op;
};

const listOps = async (filter?: ListOpsFilter): Promise<PendingOp[]> => {
	const db = await getDB();
	if (!db) return [];
	const all = await db.getAllFromIndex(STORE_NAME, "createdAt");
	if (!filter) return all;
	return all.filter((op) => {
		if (filter.status && op.status !== filter.status) return false;
		if (filter.entity && op.entity !== filter.entity) return false;
		return true;
	});
};

const getOp = async (id: string): Promise<PendingOp | null> => {
	const db = await getDB();
	if (!db) return null;
	return (await db.get(STORE_NAME, id)) ?? null;
};

const markStatus = async (
	id: string,
	status: PendingOpStatus,
	lastError?: string,
): Promise<PendingOp | null> => {
	const db = await getDB();
	if (!db) return null;
	const existing = await db.get(STORE_NAME, id);
	if (!existing) return null;
	const next: PendingOp = {
		...existing,
		status,
		updatedAt: new Date().toISOString(),
		lastError:
			lastError ?? (status === "failed" ? existing.lastError : undefined),
	};
	await db.put(STORE_NAME, next);
	return next;
};

const deleteOp = async (id: string): Promise<void> => {
	const db = await getDB();
	if (!db) return;
	await db.delete(STORE_NAME, id);
};

const clearSynced = async (): Promise<number> => {
	const db = await getDB();
	if (!db) return 0;
	const tx = db.transaction(STORE_NAME, "readwrite");
	const index = tx.store.index("status");
	let cursor = await index.openCursor("synced");
	let count = 0;
	while (cursor) {
		await cursor.delete();
		count += 1;
		cursor = await cursor.continue();
	}
	await tx.done;
	return count;
};

const _resetForTests = async (): Promise<void> => {
	if (dbPromise) {
		const db = await dbPromise;
		db.close();
		dbPromise = null;
	}
	if (typeof indexedDB !== "undefined") {
		await new Promise<void>((resolve, reject) => {
			const req = indexedDB.deleteDatabase(DB_NAME);
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
			req.onblocked = () => resolve();
		});
	}
};

export {
	enqueueOp,
	listOps,
	getOp,
	markStatus,
	deleteOp,
	clearSynced,
	_resetForTests,
};
