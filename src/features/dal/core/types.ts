import type { QueryKey } from "@tanstack/react-query";
import type { PendingOp, PendingOpOperation } from "#/features/dal/queue/types";

type Backend = "remote" | "local";

interface DalContext {
	anonUserId: string;
	authUserId: string | null;
	backend: Backend;
}

type SyncResult =
	| { status: "applied" }
	| { status: "conflict"; serverRecordJson: string }
	| { status: "noop" }
	| { status: "error"; message: string };

type SyncHandler = (op: PendingOp, userId: string) => Promise<SyncResult>;

interface DalReadAction<Input, Output> {
	kind: "read";
	queryKey: (input: Input) => QueryKey;
	remote: (input: Input, ctx: DalContext) => Promise<Output>;
	local: (input: Input, ctx: DalContext) => Promise<Output>;
}

interface DalWriteAction<Input, Output> {
	kind: "write";
	entity: string;
	operation: PendingOpOperation;
	buildIdempotencyKey: (input: Input, ctx: DalContext) => string;
	invalidates: readonly string[];
	remote: (input: Input, ctx: DalContext) => Promise<Output>;
	local: (input: Input, ctx: DalContext) => Promise<Output>;
	sync: (op: PendingOp) => Promise<SyncResult>;
}

type DalAction<Input = unknown, Output = unknown> =
	| DalReadAction<Input, Output>
	| DalWriteAction<Input, Output>;

export type {
	Backend,
	DalContext,
	DalReadAction,
	DalWriteAction,
	DalAction,
	SyncHandler,
	SyncResult,
};
