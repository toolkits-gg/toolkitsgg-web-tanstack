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
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiDiscord } from "react-icons/si";
import { authClient } from "#/integrations/better-auth/auth-client";

const SignInPage = () => {
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const handleDiscord = async () => {
		await authClient.signIn.social({ provider: "discord", callbackURL: "/" });
	};

	const form = useForm({
		defaultValues: { email: "", password: "" },
		onSubmit: async ({ value }) => {
			setServerError(null);
			const result = await authClient.signIn.email({
				email: value.email,
				password: value.password,
				callbackURL: "/",
			});
			if (result.error) {
				setServerError(result.error.message ?? "Sign in failed");
			} else {
				await navigate({ to: "/" });
			}
		},
	});

	return (
		<Flex align="center" justify="center" p="xl" style={{ minHeight: "60vh" }}>
			<Paper radius="md" p="lg" withBorder w="100%" maw={400}>
				<Title order={3} mb="md">
					Sign in
				</Title>
				<Stack>
					<Button
						leftSection={<SiDiscord size={18} />}
						color="secondary.5"
						onClick={handleDiscord}
						fullWidth
					>
						Continue with Discord
					</Button>

					<Divider label="Or continue with email" labelPosition="center" />

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<Stack>
							<form.Field
								name="email"
								validators={{
									onBlur: ({ value, fieldApi }) => {
										if (!fieldApi.state.meta.isDirty) return undefined;
										if (!value) return "Email is required";
										if (!value.includes("@")) return "Enter a valid email";
										return undefined;
									},
									onSubmit: ({ value }) => {
										if (!value) return "Email is required";
										if (!value.includes("@")) return "Enter a valid email";
										return undefined;
									},
								}}
							>
								{(field) => (
									<TextInput
										label="Email"
										placeholder="you@example.com"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.currentTarget.value)}
										onBlur={field.handleBlur}
										error={
											field.state.meta.isTouched &&
											field.state.meta.errors.length > 0
												? field.state.meta.errors[0]
												: undefined
										}
										radius="md"
									/>
								)}
							</form.Field>
							<form.Field
								name="password"
								validators={{
									onBlur: ({ value, fieldApi }) => {
										if (!fieldApi.state.meta.isDirty) return undefined;
										return !value ? "Password is required" : undefined;
									},
									onSubmit: ({ value }) =>
										!value ? "Password is required" : undefined,
								}}
							>
								{(field) => (
									<PasswordInput
										label="Password"
										placeholder="Password"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.currentTarget.value)}
										onBlur={field.handleBlur}
										error={
											field.state.meta.isTouched &&
											field.state.meta.errors.length > 0
												? field.state.meta.errors[0]
												: undefined
										}
										radius="md"
									/>
								)}
							</form.Field>
							{serverError && (
								<Text size="sm" c="red">
									{serverError}
								</Text>
							)}
							<Group justify="space-between" mt="xs">
								<Anchor component={Link} to="/sign-up" c="dimmed" size="xs">
									{"Don't have an account? Register"}
								</Anchor>
								<form.Subscribe
									selector={(state) => ({
										isSubmitting: state.isSubmitting,
										canSubmit: state.canSubmit,
									})}
								>
									{({ isSubmitting, canSubmit }) => (
										<Button
											type="submit"
											loading={isSubmitting}
											disabled={!canSubmit}
											radius="md"
										>
											Sign in
										</Button>
									)}
								</form.Subscribe>
							</Group>
						</Stack>
					</form>
				</Stack>
			</Paper>
		</Flex>
	);
};

const Route = createFileRoute("/sign-in")({ component: SignInPage });
export { Route };
