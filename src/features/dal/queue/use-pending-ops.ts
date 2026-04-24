import { useQuery } from "@tanstack/react-query";
import {
	type ListOpsFilter,
	listOps,
	type PendingOp,
} from "#/features/dal/queue/pending-ops";

export function usePendingOps(filter?: ListOpsFilter) {
	return useQuery<PendingOp[]>({
		queryKey: ["dal-queue", filter?.status ?? "all", filter?.entity ?? "all"],
		queryFn: () => listOps(filter),
		refetchOnWindowFocus: false,
	});
}
