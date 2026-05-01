import { useQuery } from "@tanstack/react-query";
import { listOps } from "#/features/dal/queue/pending-ops";
import type { ListOpsFilter, PendingOp } from "#/features/dal/queue/types";

export function usePendingOps(filter?: ListOpsFilter) {
	return useQuery<PendingOp[]>({
		queryKey: ["dal-queue", filter?.status ?? "all", filter?.entity ?? "all"],
		queryFn: () => listOps(filter),
		refetchOnWindowFocus: false,
	});
}
