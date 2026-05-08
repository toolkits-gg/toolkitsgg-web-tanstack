// Orchestrates syncing a batch of pending ops to the server sequentially.

import type { DalWriteAction, SyncResult } from "#/features/dal/core/types";
import {
	deleteOp,
	markConflict,
	markStatus,
} from "#/features/dal/queue/pending-ops";
import type { PendingOp } from "#/features/dal/queue/types";

interface SyncAllOptions {
	/**
	 * Resolves a DalWriteAction by entity name.
	 * Passed as a callback (not a direct import) to avoid circular dependencies
	 * between the queue module and the core registry.
	 */
	resolveAction: (entity: string) => DalWriteAction<unknown, unknown> | null;
	/** Called before each op is processed — use to drive UI progress indicators. */
	onProgress?: (op: PendingOp, index: number, total: number) => void;
}

/** Summary of a completed sync run. */
interface SyncAllReport {
	/** Ops successfully written to the server. */
	applied: number;
	/** Ops where the server record was newer; user reconciliation required. */
	conflicts: number;
	/** Ops that were already reflected on the server (deleted from the queue). */
	noops: number;
	/** Ops that failed due to a network error or handler exception. */
	errors: number;
	/** Ops whose entity had no registered action (marked failed). */
	skipped: number;
}

/**
 * Processes each op sequentially (not in parallel) to preserve causal ordering.
 * Parallel execution could allow a delete to race an upsert for the same entity,
 * producing inconsistent server state.
 */
const syncOps = async (
	ops: PendingOp[],
	options: SyncAllOptions,
): Promise<SyncAllReport> => {
	const report: SyncAllReport = {
		applied: 0,
		conflicts: 0,
		noops: 0,
		errors: 0,
		skipped: 0,
	};
	for (let index = 0; index < ops.length; index += 1) {
		const op = ops[index];
		options.onProgress?.(op, index, ops.length);
		const action = options.resolveAction(op.entity);
		if (!action) {
			// Entity's DAL was removed or not yet registered — mark failed rather than silently dropping.
			report.skipped += 1;
			await markStatus(op.id, "failed", `no action for ${op.entity}`);
			continue;
		}

		const result = await runOnce(op, action);
		await applyResult(op.id, result, report);
	}
	return report;
};

/**
 * Re-attempts a single op with `force: true`, which asks the sync handler to
 * skip its LWW check. Intended for the "Keep mine" path from the data-sync UI
 * after a previous attempt produced a conflict.
 */
const forceSyncOp = async (
	op: PendingOp,
	action: DalWriteAction<unknown, unknown>,
): Promise<SyncResult> => {
	const result = await runOnce(op, action, { force: true });
	const report: SyncAllReport = {
		applied: 0,
		conflicts: 0,
		noops: 0,
		errors: 0,
		skipped: 0,
	};
	await applyResult(op.id, result, report);
	return result;
};

const runOnce = async (
	op: PendingOp,
	action: DalWriteAction<unknown, unknown>,
	options?: { force?: boolean },
): Promise<SyncResult> => {
	await markStatus(op.id, "syncing");
	try {
		return await action.sync(op, options);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { status: "error", message };
	}
};

const applyResult = async (
	opId: string,
	result: SyncResult,
	report: SyncAllReport,
): Promise<void> => {
	switch (result.status) {
		case "applied":
			report.applied += 1;
			await markStatus(opId, "synced");
			break;
		case "noop":
			report.noops += 1;
			await deleteOp(opId);
			break;
		case "conflict":
			report.conflicts += 1;
			await markConflict(opId, result.serverRecordJson);
			break;
		case "error":
			report.errors += 1;
			await markStatus(opId, "failed", result.message);
			break;
	}
};

export { syncOps, forceSyncOp };
