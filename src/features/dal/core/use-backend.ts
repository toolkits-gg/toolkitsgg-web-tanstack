import { type Backend, chooseBackend } from "#/features/dal/core/choose-backend";
import { useOnlineStatus } from "#/features/dal/online/use-online-status";
import { useSession } from "#/integrations/better-auth/auth-client";

export function useBackend(): Backend {
	const { data } = useSession();
	const online = useOnlineStatus();
	return chooseBackend({ authed: !!data?.user?.id, online });
}
