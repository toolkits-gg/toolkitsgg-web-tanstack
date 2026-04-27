import {
	Badge,
	Button,
	Divider,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useNetwork } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const pending = usePendingOps();
	const canSync = !!session?.user?.id && online;

	const syncAll = useMutation({
		mutationFn: async () => {
			if (!pending.data) return null;
			return syncOps(pending.data, { resolveAction: resolveWriteAction });
		},
		onSuccess: (report) => {
			if (!report) return;
			const parts: string[] = [];
			if (report.applied) parts.push(`${report.applied} applied`);
			if (report.noops) parts.push(`${report.noops} already up-to-date`);
			if (report.conflicts) parts.push(`${report.conflicts} conflicts`);
			if (report.errors) parts.push(`${report.errors} errors`);
			const hasIssues = report.conflicts > 0 || report.errors > 0;
			notifications.show({
				title: hasIssues ? "Sync completed with issues" : "Sync complete",
				message: parts.length ? parts.join(", ") : "Nothing to sync.",
				color: hasIssues ? "orange" : "green",
			});
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
			{mounted && !canSync ? (
				<Text size="sm" c="dimmed">
					Sign in and come online to push pending changes.
				</Text>
			) : null}
			<PendingList
				ops={(pending.data ?? []).filter((op) => op.status !== "synced")}
				onDelete={(id) => {
					deleteOp(id).then(() =>
						queryClient.invalidateQueries({ queryKey: ["dal-queue"] }),
					);
				}}
			/>
			<SyncedList
				ops={(pending.data ?? []).filter((op) => op.status === "synced")}
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

function SyncedList({ ops }: { ops: PendingOp[] }) {
	if (!ops.length) return null;

	return (
		<>
			<Divider label="Completed" labelPosition="left" />
			<Stack gap="xs">
				{ops.map((op) => (
					<Group key={op.id} gap="xs" wrap="nowrap" align="center">
						<Badge>{op.entity}</Badge>
						<Badge variant="light">{op.operation}</Badge>
						<Badge color="green" variant="outline">
							synced
						</Badge>
						<Text size="xs" c="dimmed" style={{ flex: 1 }}>
							{op.idempotencyKey}
						</Text>
					</Group>
				))}
			</Stack>
		</>
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
