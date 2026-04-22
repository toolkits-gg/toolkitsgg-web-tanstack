export type Backend = "remote" | "local";

export interface DispatchInput {
	authed: boolean;
	online: boolean;
}

export function chooseBackend({ authed, online }: DispatchInput): Backend {
	return authed && online ? "remote" : "local";
}
