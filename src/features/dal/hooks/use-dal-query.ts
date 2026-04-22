import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { toQueryOptions } from "#/features/dal/core/to-query-options";
import type { DalReadAction } from "#/features/dal/core/types";
import { useDalContextSource } from "#/features/dal/hooks/use-dal-context-source";

export function useDalQuery<I, O>(action: DalReadAction<I, O>, input: I) {
	const ctxGetter = useDalContextSource();
	return useQuery(toQueryOptions(action, input, ctxGetter));
}

export function useDalSuspenseQuery<I, O>(
	action: DalReadAction<I, O>,
	input: I,
) {
	const ctxGetter = useDalContextSource();
	return useSuspenseQuery(toQueryOptions(action, input, ctxGetter));
}
