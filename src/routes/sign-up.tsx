import {
	Anchor,
	Button,
	Divider,
	Flex,
	Group,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LuSwords } from "react-icons/lu";
import { authClient } from "#/integrations/better-auth/auth-client";

export const Route = createFileRoute("/sign-up")({ component: SignUpPage });

function SignUpPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const handleDiscord = async () => {
		await authClient.signIn.social({ provider: "discord", callbackURL: "/" });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		setIsPending(true);
		try {
			const result = await authClient.signUp.email({
				email,
				password,
				name: username,
				callbackURL: "/",
			});
			if (result.error) {
				setError(result.error.message ?? "Sign up failed");
			} else {
				await navigate({ to: "/" });
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Flex align="center" justify="center" p="xl" style={{ minHeight: "60vh" }}>
			<Paper radius="md" p="lg" withBorder w="100%" maw={400}>
				<Title order={3} mb="md">
					Create an account
				</Title>
				<Stack>
					<Button
						leftSection={<LuSwords size={18} />}
						variant="default"
						onClick={handleDiscord}
						fullWidth
					>
						Continue with Discord
					</Button>

					<Divider label="Or continue with email" labelPosition="center" />

					<form onSubmit={handleSubmit}>
						<Stack>
							<TextInput
								required
								label="Email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.currentTarget.value)}
								radius="md"
							/>
							<TextInput
								required
								label="Username"
								placeholder="Username"
								value={username}
								onChange={(e) => setUsername(e.currentTarget.value)}
								radius="md"
							/>
							<PasswordInput
								required
								label="Password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.currentTarget.value)}
								radius="md"
							/>
							<PasswordInput
								required
								label="Confirm Password"
								placeholder="Confirm password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.currentTarget.value)}
								radius="md"
							/>
							{error && (
								<Text size="sm" c="red">
									{error}
								</Text>
							)}
							<Group justify="space-between" mt="xs">
								<Anchor component={Link} to="/sign-in" c="dimmed" size="xs">
									Already have an account? Sign in
								</Anchor>
								<Button type="submit" loading={isPending} radius="md">
									Create account
								</Button>
							</Group>
						</Stack>
					</form>
				</Stack>
			</Paper>
		</Flex>
	);
}
