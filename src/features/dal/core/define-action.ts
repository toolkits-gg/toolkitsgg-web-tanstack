import type { DalReadAction, DalWriteAction } from "#/features/dal/core/types";

const defineDalRead = <Input, Output>(
	config: Omit<DalReadAction<Input, Output>, "kind">,
): DalReadAction<Input, Output> => {
	return { kind: "read", ...config };
};

const defineDalWrite = <Input, Output>(
	config: Omit<DalWriteAction<Input, Output>, "kind">,
): DalWriteAction<Input, Output> => {
	return { kind: "write", ...config };
};

export { defineDalRead, defineDalWrite };
