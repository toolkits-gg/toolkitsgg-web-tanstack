import type {
	DalReadAction,
	DalWriteAction,
} from "#/features/dal/core/types";

export function defineDalRead<I, O>(
	config: Omit<DalReadAction<I, O>, "kind">,
): DalReadAction<I, O> {
	return { kind: "read", ...config };
}

export function defineDalWrite<I, O>(
	config: Omit<DalWriteAction<I, O>, "kind">,
): DalWriteAction<I, O> {
	return { kind: "write", ...config };
}
