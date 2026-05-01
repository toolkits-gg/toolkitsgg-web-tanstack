import type { Backend } from "#/features/dal/core/types";

interface DispatchInput {
	authed: boolean;
	online: boolean;
}

const chooseBackend = ({ authed, online }: DispatchInput): Backend => {
	return authed && online ? "remote" : "local";
};

export { chooseBackend };
