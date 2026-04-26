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

export const Route = createFileRoute("/sign-in")({ component: SignInPage });

function SignInPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const handleDiscord = async () => {
		await authClient.signIn.social({ provider: "discord", callbackURL: "/" });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsPending(true);
		try {
			const result = await authClient.signIn.email({
				email,
				password,
				callbackURL: "/",
			});
			if (result.error) {
				setError(result.error.message ?? "Sign in failed");
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
					Sign in
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
							<PasswordInput
								required
								label="Password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.currentTarget.value)}
								radius="md"
							/>
							{error && (
								<Text size="sm" c="red">
									{error}
								</Text>
							)}
							<Group justify="space-between" mt="xs">
								<Anchor component={Link} to="/sign-up" c="dimmed" size="xs">
									{"Don't have an account? Register"}
								</Anchor>
								<Button type="submit" loading={isPending} radius="md">
									Sign in
								</Button>
							</Group>
						</Stack>
					</form>
				</Stack>
			</Paper>
		</Flex>
	);
}
