import { ActionIcon, Avatar, Box, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { LuCamera, LuPencil } from "react-icons/lu";
import { AvatarPicker } from "#/features/auth/core/AvatarPicker";
import { ProfileEditForm } from "#/features/auth/core/ProfileEditForm";
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

function openProfileEdit(displayName: string, bio: string) {
	modals.open({
		title: "Edit profile",
		children: (
			<ProfileEditForm initialDisplayName={displayName} initialBio={bio} />
		),
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
						<Group gap="xs" align="center">
							<Text fw={700} size="xl">
								{displayName}
							</Text>
							{isOwner && (
								<ActionIcon
									variant="subtle"
									size="sm"
									radius="xl"
									onClick={() => openProfileEdit(displayName, bio)}
									aria-label="Edit profile"
								>
									<LuPencil size={14} />
								</ActionIcon>
							)}
						</Group>
						<Text size="sm" c="dimmed">
							{bio}
						</Text>
					</Stack>
				</Group>
			</Box>
		</Box>
	);
}
