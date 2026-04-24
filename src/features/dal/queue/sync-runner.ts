import type { DalWriteAction } from "#/features/dal/core/types";
import {
	deleteOp,
	markStatus,
	type PendingOp,
} from "#/features/dal/queue/pending-ops";

export interface SyncAllOptions {
	resolveAction: (entity: string) => DalWriteAction<unknown, unknown> | null;
	onProgress?: (op: PendingOp, index: number, total: number) => void;
}

export interface SyncAllReport {
	applied: number;
	conflicts: number;
	noops: number;
	errors: number;
	skipped: number;
}

export async function syncOps(
	ops: PendingOp[],
	options: SyncAllOptions,
): Promise<SyncAllReport> {
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
			report.skipped += 1;
			await markStatus(op.id, "failed", `no action for ${op.entity}`);
			continue;
		}

		await markStatus(op.id, "syncing");
		try {
			const result = await action.sync(op);
			switch (result.status) {
				case "applied":
					report.applied += 1;
					await markStatus(op.id, "synced");
					break;
				case "noop":
					report.noops += 1;
					await deleteOp(op.id);
					break;
				case "conflict":
					report.conflicts += 1;
					await markStatus(op.id, "conflict");
					break;
				case "error":
					report.errors += 1;
					await markStatus(op.id, "failed", result.message);
					break;
			}
		} catch (err) {
			report.errors += 1;
			const message = err instanceof Error ? err.message : String(err);
			await markStatus(op.id, "failed", message);
		}
	}
	return report;
}
