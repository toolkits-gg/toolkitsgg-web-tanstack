import type { QueryKey } from "@tanstack/react-query";
import type { Backend } from "#/features/dal/core/choose-backend";
import type {
	PendingOp,
	PendingOpOperation,
} from "#/features/dal/queue/pending-ops";

export interface DalContext {
	anonUserId: string;
	authUserId: string | null;
	backend: Backend;
}

export type SyncResult =
	| { status: "applied" }
	| { status: "conflict"; serverRecordJson: string }
	| { status: "noop" }
	| { status: "error"; message: string };

export interface DalReadAction<I, O> {
	kind: "read";
	queryKey: (input: I) => QueryKey;
	remote: (input: I, ctx: DalContext) => Promise<O>;
	local: (input: I, ctx: DalContext) => Promise<O>;
}

export interface DalWriteAction<I, O> {
	kind: "write";
	entity: string;
	operation: PendingOpOperation;
	buildIdempotencyKey: (input: I, ctx: DalContext) => string;
	invalidates: readonly string[];
	remote: (input: I, ctx: DalContext) => Promise<O>;
	local: (input: I, ctx: DalContext) => Promise<O>;
	sync: (op: PendingOp) => Promise<SyncResult>;
}

export type DalAction<I = unknown, O = unknown> =
	| DalReadAction<I, O>
	| DalWriteAction<I, O>;
