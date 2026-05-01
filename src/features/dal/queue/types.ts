type PendingOpOperation = "create" | "update" | "upsert" | "delete";
type PendingOpStatus = "pending" | "syncing" | "synced" | "failed" | "conflict";

interface PendingOp {
	id: string;
	createdAt: string;
	updatedAt: string;
	anonUserId: string;
	entity: string;
	operation: PendingOpOperation;
	payload: unknown;
	idempotencyKey: string;
	status: PendingOpStatus;
	lastError?: string;
	serverUpdatedAt?: string;
}

interface ListOpsFilter {
	status?: PendingOpStatus;
	entity?: string;
}

export type { PendingOp, PendingOpStatus, PendingOpOperation, ListOpsFilter };
