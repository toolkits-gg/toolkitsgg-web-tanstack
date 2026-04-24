import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { toQueryOptions } from "#/features/dal/core/to-query-options";
import type { DalReadAction } from "#/features/dal/core/types";
import { useDalContextSource } from "#/features/dal/hooks/use-dal-context-source";

export function useDalQuery<Input, Output>(
	action: DalReadAction<Input, Output>,
	input: Input,
) {
	const ctxGetter = useDalContextSource();
	return useQuery(toQueryOptions(action, input, ctxGetter));
}

export function useDalSuspenseQuery<Input, Output>(
	action: DalReadAction<Input, Output>,
	input: Input,
) {
	const ctxGetter = useDalContextSource();
	return useSuspenseQuery(toQueryOptions(action, input, ctxGetter));
}
