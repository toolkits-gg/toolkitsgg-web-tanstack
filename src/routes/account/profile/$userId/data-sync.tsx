import { Badge, Button, Group, Stack, Text, Title } from "@mantine/core";
import { useNetwork } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { resolveWriteAction } from "#/features/dal/actions/registry";
import {
	clearSynced,
	deleteOp,
	type PendingOp,
} from "#/features/dal/queue/pending-ops";
import { syncOps } from "#/features/dal/queue/sync-runner";
import { usePendingOps } from "#/features/dal/queue/use-pending-ops";
import { useSession } from "#/integrations/better-auth/auth-client";

export const Route = createFileRoute("/account/profile/$userId/data-sync")({
	component: DataSync,
});

function DataSync() {
	const { data: session } = useSession();
	const { online } = useNetwork();
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
		<Stack gap="sm">
			<Group justify="space-between">
				<Title order={3}>Data Sync</Title>
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
