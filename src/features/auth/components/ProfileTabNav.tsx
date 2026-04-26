import { Tabs } from "@mantine/core";
import { useNavigate, useRouterState } from "@tanstack/react-router";

type ProfileTabNavProps = {
	userId: string;
	isOwner: boolean;
};

const TABS = [
	{ label: "Home", path: "" },
	{ label: "Collection Stats", path: "collection-stats" },
	{ label: "Liked Builds", path: "liked-builds" },
	{ label: "Build Collections", path: "build-collections" },
	{ label: "Created Builds", path: "created-builds" },
] as const;

const OWNER_TABS = [{ label: "Data Sync", path: "data-sync" }] as const;

export function ProfileTabNav({ userId, isOwner }: ProfileTabNavProps) {
	const navigate = useNavigate();
	const location = useRouterState({ select: (s) => s.location });
	const basePath = `/account/profile/${userId}`;

	const getTabValue = (path: string) =>
		path === "" ? basePath : `${basePath}/${path}`;

	const activeTab = (() => {
		const pathname = location.pathname.replace(/\/$/, "");
		if (pathname === basePath) return basePath;
		const allTabs = [...TABS, ...OWNER_TABS];
		for (const tab of allTabs) {
			if (tab.path && pathname.endsWith(`/${tab.path}`)) {
				return `${basePath}/${tab.path}`;
			}
		}
		return basePath;
	})();

	const tabs = isOwner ? ([...TABS, ...OWNER_TABS] as readonly { label: string; path: string }[]) : (TABS as readonly { label: string; path: string }[]);

	const handleTabChange = (value: string | null) => {
		if (!value) return;
		navigate({ to: value });
	};

	return (
		<Tabs value={activeTab} onChange={handleTabChange}>
			<Tabs.List>
				{tabs.map((tab) => {
					const value = getTabValue(tab.path);
					return (
						<Tabs.Tab key={value} value={value}>
							{tab.label}
						</Tabs.Tab>
					);
				})}
			</Tabs.List>
		</Tabs>
	);
}
