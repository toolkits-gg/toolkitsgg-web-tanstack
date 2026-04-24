import { getOrCreateAnonUserId } from "#/features/dal/identity/anon-id";
import { useSession } from "#/integrations/better-auth/auth-client";

export type EffectiveUserId = {
	id: string;
	kind: "auth" | "anon" | "none";
};

export function useEffectiveUserId(): EffectiveUserId {
	const { data } = useSession();
	const authId = data?.user?.id ?? null;
	const anonId = authId ? null : getOrCreateAnonUserId();
	if (authId) return { id: authId, kind: "auth" };
	if (anonId) return { id: anonId, kind: "anon" };
	return { id: "", kind: "none" };
}
