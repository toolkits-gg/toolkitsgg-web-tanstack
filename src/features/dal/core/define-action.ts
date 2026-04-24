import type { DalReadAction, DalWriteAction } from "#/features/dal/core/types";

export function defineDalRead<Input, Output>(
	config: Omit<DalReadAction<Input, Output>, "kind">,
): DalReadAction<Input, Output> {
	return { kind: "read", ...config };
}

export function defineDalWrite<Input, Output>(
	config: Omit<DalWriteAction<Input, Output>, "kind">,
): DalWriteAction<Input, Output> {
	return { kind: "write", ...config };
}
