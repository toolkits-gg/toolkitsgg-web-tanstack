import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DalContext, DalWriteAction } from "#/features/dal/core/types";
import { useDalContextSource } from "#/features/dal/hooks/use-dal-context-source";
import { enqueueOp } from "#/features/dal/queue/pending-ops";

export interface UseDalMutationResultMeta<O> {
	result: O;
	branch: "remote" | "local";
	enqueuedOpId: string | null;
}

export function useDalMutation<I, O>(action: DalWriteAction<I, O>) {
	const ctxGetter = useDalContextSource();
	const queryClient = useQueryClient();

	return useMutation<UseDalMutationResultMeta<O>, Error, I>({
		mutationKey: ["dal", action.entity, action.operation],
		mutationFn: async (input: I) => {
			const ctx = ctxGetter();
			if (ctx.backend === "remote") {
				const result = await action.remote(input, ctx);
				return { result, branch: "remote", enqueuedOpId: null };
			}
			return runLocalWithEnqueue(action, input, ctx);
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["dal", action.entity] }),
				...action.invalidates.map((entity) =>
					queryClient.invalidateQueries({ queryKey: ["dal", entity] }),
				),
			]);
		},
	});
}

async function runLocalWithEnqueue<I, O>(
	action: DalWriteAction<I, O>,
	input: I,
	ctx: DalContext,
): Promise<UseDalMutationResultMeta<O>> {
	const result = await action.local(input, ctx);
	const op = await enqueueOp({
		anonUserId: ctx.anonUserId,
		entity: action.entity,
		operation: action.operation,
		payload: input,
		idempotencyKey: action.buildIdempotencyKey(input, ctx),
	});
	return { result, branch: "local", enqueuedOpId: op?.id ?? null };
}
