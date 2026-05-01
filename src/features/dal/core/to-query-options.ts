import { queryOptions } from "@tanstack/react-query";
import type { DalReadAction } from "#/features/dal/core/types";
import type { DalContextGetter } from "#/features/dal/hooks/use-dal-context-source";

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
