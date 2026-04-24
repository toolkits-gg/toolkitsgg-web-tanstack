import { useNetwork } from "@mantine/hooks";
import { useCallback, useRef } from "react";
import { chooseBackend } from "#/features/dal/core/choose-backend";
import type { DalContext } from "#/features/dal/core/types";
import { getOrCreateAnonUserId } from "#/features/dal/identity/anon-id";
import { useSession } from "#/integrations/better-auth/auth-client";

export type DalContextGetter = () => DalContext;

export function useDalContextSource(): DalContextGetter {
	const { data } = useSession();
	const { online } = useNetwork();
	const sourceRef = useRef<DalContext>({
		anonUserId: "",
		authUserId: null,
		backend: "local",
	});

	sourceRef.current = {
		anonUserId: getOrCreateAnonUserId(),
		authUserId: data?.user?.id ?? null,
		backend: chooseBackend({ authed: !!data?.user?.id, online }),
	};

	return useCallback(() => sourceRef.current, []);
}
