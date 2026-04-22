import {
	Badge,
	Button,
	Card,
	Container,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { resolveWriteAction } from "#/features/dal/actions/registry";
import { useEffectiveUserId } from "#/features/dal/identity/use-effective-user-id";
import { useOnlineStatus } from "#/features/dal/online/use-online-status";
import {
	clearSynced,
	deleteOp,
	type PendingOp,
} from "#/features/dal/queue/pending-ops";
import { syncOps } from "#/features/dal/queue/sync-runner";
import { usePendingOps } from "#/features/dal/queue/use-pending-ops";
import { useSession } from "#/integrations/better-auth/auth-client";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
	const { data: session } = useSession();
	const effective = useEffectiveUserId();
	const online = useOnlineStatus();
	const queryClient = useQueryClient();

	const pending = usePendingOps();
	const canSync = !!session?.user?.id && online;

	const syncAll = useMutation({
		mutationFn: async () => {
			if (!pending.data) return null;
			return syncOps(pending.data, { resolveAction: resolveWriteAction });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["dal-queue"] });
			queryClient.invalidateQueries({ queryKey: ["dal"] });
		},
	});

	const clear = useMutation({
		mutationFn: () => clearSynced(),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dal-queue"] }),
	});

	return (
		<Container size="md" py="lg">
			<Stack gap="lg">
				<Title order={2}>Profile</Title>

				<Card withBorder>
					<Stack gap="xs">
						<Group gap="xs">
							<Text fw={600}>Identity</Text>
							<Badge color={effective.kind === "auth" ? "green" : "gray"}>
								{effective.kind}
							</Badge>
							<Badge color={online ? "blue" : "red"}>
								{online ? "online" : "offline"}
							</Badge>
						</Group>
						<Text size="sm" c="dimmed">
							{session?.user
								? `Signed in as ${session.user.email}`
								: "Signed out — writes are stored locally until you sign in."}
						</Text>
						<Text size="xs" c="dimmed">
							local id: {effective.id || "—"}
						</Text>
					</Stack>
				</Card>

				<Card withBorder>
					<Stack gap="sm">
						<Group justify="space-between">
							<Title order={4}>Pending sync</Title>
							<Group gap="xs">
								<Button
									size="xs"
									variant="default"
									onClick={() => clear.mutate()}
									disabled={clear.isPending}
								>
									Clear synced
								</Button>
								<Button
									size="xs"
									onClick={() => syncAll.mutate()}
									disabled={!canSync || syncAll.isPending || !pending.data?.length}
								>
									{syncAll.isPending ? "Syncing…" : "Sync all"}
								</Button>
							</Group>
						</Group>
						{!canSync ? (
							<Text size="sm" c="dimmed">
								Sign in and come online to push pending changes.
							</Text>
						) : null}
						<PendingList
							ops={pending.data ?? []}
							onDelete={(id) => {
								deleteOp(id).then(() =>
									queryClient.invalidateQueries({ queryKey: ["dal-queue"] }),
								);
							}}
						/>
					</Stack>
				</Card>
			</Stack>
		</Container>
	);
}

function PendingList({
	ops,
	onDelete,
}: {
	ops: PendingOp[];
	onDelete: (id: string) => void;
}) {
	if (!ops.length) {
		return (
			<Text size="sm" c="dimmed">
				No pending changes.
			</Text>
		);
	}
	return (
		<Stack gap="xs">
			{ops.map((op) => (
				<Group
					key={op.id}
					justify="space-between"
					wrap="nowrap"
					align="center"
					gap="sm"
				>
					<Stack gap={0}>
						<Group gap="xs">
							<Badge>{op.entity}</Badge>
							<Badge variant="light">{op.operation}</Badge>
							<Badge color={statusColor(op.status)} variant="outline">
								{op.status}
							</Badge>
						</Group>
						<Text size="xs" c="dimmed">
							{op.idempotencyKey}
						</Text>
						{op.lastError ? (
							<Text size="xs" c="red">
								{op.lastError}
							</Text>
						) : null}
					</Stack>
					<Button
						size="xs"
						variant="subtle"
						color="red"
						onClick={() => onDelete(op.id)}
					>
						Discard
					</Button>
				</Group>
			))}
		</Stack>
	);
}

function statusColor(status: PendingOp["status"]) {
	switch (status) {
		case "pending":
			return "gray";
		case "syncing":
			return "blue";
		case "synced":
			return "green";
		case "conflict":
			return "orange";
		case "failed":
			return "red";
	}
}
