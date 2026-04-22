import { useEffect, useState } from "react";

const DEFAULT_HEARTBEAT_MS = 30_000;
const HEARTBEAT_PATH = "/api/health";

export type UseOnlineStatusOptions = {
	heartbeatMs?: number;
	enableHeartbeat?: boolean;
};

export function useOnlineStatus(options?: UseOnlineStatusOptions): boolean {
	const heartbeatMs = options?.heartbeatMs ?? DEFAULT_HEARTBEAT_MS;
	const enableHeartbeat = options?.enableHeartbeat ?? true;

	const [online, setOnline] = useState<boolean>(
		typeof navigator === "undefined" ? true : navigator.onLine,
	);

	useEffect(() => {
		const up = () => setOnline(true);
		const down = () => setOnline(false);
		window.addEventListener("online", up);
		window.addEventListener("offline", down);
		return () => {
			window.removeEventListener("online", up);
			window.removeEventListener("offline", down);
		};
	}, []);

	useEffect(() => {
		if (!enableHeartbeat) return;
		const controller = new AbortController();
		let stopped = false;

		const tick = async () => {
			try {
				const response = await fetch(HEARTBEAT_PATH, {
					method: "GET",
					signal: controller.signal,
					cache: "no-store",
				});
				if (!stopped) setOnline(response.ok);
			} catch {
				if (!stopped) setOnline(false);
			}
		};

		const interval = window.setInterval(tick, heartbeatMs);
		return () => {
			stopped = true;
			controller.abort();
			window.clearInterval(interval);
		};
	}, [heartbeatMs, enableHeartbeat]);

	return online;
}
