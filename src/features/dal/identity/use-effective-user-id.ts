import { useEffect, useState } from "react";
import { getOrCreateAnonUserId } from "#/features/dal/identity/anon-id";
import { useSession } from "#/integrations/better-auth/auth-client";

type EffectiveUserId = {
	id: string;
	kind: "auth" | "anon" | "none";
};

const useEffectiveUserId = (): EffectiveUserId => {
	const { data } = useSession();
	const authId = data?.user?.id ?? null;
	const [anonId, setAnonId] = useState<string | null>(null);

	useEffect(() => {
		if (!authId) {
			setAnonId(getOrCreateAnonUserId());
		} else {
			setAnonId(null);
		}
	}, [authId]);

	if (authId) return { id: authId, kind: "auth" };
	if (anonId) return { id: anonId, kind: "anon" };
	return { id: "", kind: "none" };
};

export { useEffectiveUserId };
