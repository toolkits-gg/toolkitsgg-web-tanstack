export type LwwComparison = "local-wins" | "server-wins" | "equal";

export interface HasUpdatedAt {
	updatedAt: string | Date | null | undefined;
}

function toTime(value: string | Date | null | undefined): number | null {
	if (!value) return null;
	const date = typeof value === "string" ? new Date(value) : value;
	const time = date.getTime();
	return Number.isFinite(time) ? time : null;
}

export function compareTimestamps(
	serverRecord: HasUpdatedAt | null | undefined,
	op: { serverUpdatedAt?: string | null; updatedAt?: string | null },
): LwwComparison {
	const serverTime = toTime(serverRecord?.updatedAt);
	const baselineTime = toTime(op.serverUpdatedAt);
	const opTime = toTime(op.updatedAt);

	if (serverTime === null) return "local-wins";
	if (baselineTime === null) {
		if (opTime === null) return "server-wins";
		if (opTime > serverTime) return "local-wins";
		if (opTime < serverTime) return "server-wins";
		return "equal";
	}
	if (serverTime > baselineTime) return "server-wins";
	if (serverTime < baselineTime) return "local-wins";
	return "equal";
}
