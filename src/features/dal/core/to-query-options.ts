// Bridges DalReadAction to TanStack Query's queryOptions format.

import { queryOptions } from "@tanstack/react-query";
import type { DalReadAction } from "#/features/dal/core/types";
import type { DalContextGetter } from "#/features/dal/hooks/use-dal-context-source";

/**
 * Converts a DalReadAction into TanStack Query options.
 *
 * The `["dal", ...]` prefix namespaces every DAL query so mutations can
 * invalidate all DAL queries for an entity with a single key prefix.
 *
 * `ctxGetter` is a function (not the context value itself) so the backend
 * is evaluated at query execution time rather than at hook creation time.
 * This prevents stale backend reads when auth state changes between renders.
 */
const toQueryOptions = <Input, Output>(
	action: DalReadAction<Input, Output>,
	input: Input,
	ctxGetter: DalContextGetter,
) => {
	return queryOptions({
		queryKey: ["dal", ...(action.queryKey(input) as readonly unknown[])],
		queryFn: async () => {
			const ctx = ctxGetter();
			if (ctx.backend === "remote") return action.remote(input, ctx);
			return action.local(input, ctx);
		},
	});
};

export { toQueryOptions };
