import { ActionIcon, Avatar, Box, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { LuCamera } from "react-icons/lu";
import { AvatarPicker } from "#/features/auth/core/AvatarPicker";
import { useResolvedAvatar } from "#/features/auth/hooks/use-resolved-avatar";
import classes from "./ProfileHeader.module.css";

type ProfileHeaderProps = {
	displayName: string;
	bio: string;
	serverAvatarUrl: string | null;
	isOwner: boolean;
};

function openAvatarPicker() {
	modals.open({
		title: "Choose avatar",
		size: "lg",
		children: <AvatarPicker />,
	});
}

export function ProfileHeader({
	displayName,
	bio,
	serverAvatarUrl,
	isOwner,
}: ProfileHeaderProps) {
	const { avatarUrl: clientAvatarUrl } = useResolvedAvatar();
	const avatarUrl =
		isOwner && clientAvatarUrl ? clientAvatarUrl : serverAvatarUrl;

	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<Box>
			<Box className={classes.banner} />
			<Box className={classes.profileContent}>
				<Group align="flex-end" gap="md">
					<Box className={classes.avatarWrapper}>
						<Avatar
							src={avatarUrl}
							size={96}
							radius="md"
							className={classes.avatar}
						>
							{initials}
						</Avatar>
						{isOwner && (
							<ActionIcon
								variant="filled"
								size="sm"
								radius="xl"
								onClick={openAvatarPicker}
								aria-label="Change avatar"
								style={{ position: "absolute", bottom: 4, right: 4 }}
							>
								<LuCamera size={14} />
							</ActionIcon>
						)}
					</Box>
					<Stack className={classes.info} gap={4}>
						<Text fw={700} size="xl">
							{displayName}
						</Text>
						<Text size="sm" c="dimmed">
							{bio}
						</Text>
					</Stack>
				</Group>
			</Box>
		</Box>
	);
}
