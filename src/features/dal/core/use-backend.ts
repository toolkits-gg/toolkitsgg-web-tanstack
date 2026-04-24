import { useNetwork } from "@mantine/hooks";
import {
	type Backend,
	chooseBackend,
} from "#/features/dal/core/choose-backend";
import { useSession } from "#/integrations/better-auth/auth-client";

export function useBackend(): Backend {
	const { data } = useSession();
	const { online } = useNetwork();
	return chooseBackend({ authed: !!data?.user?.id, online });
}
