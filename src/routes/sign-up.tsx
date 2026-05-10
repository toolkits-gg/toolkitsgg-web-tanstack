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
import { LuSwords } from "react-icons/lu";
import { authClient } from "#/integrations/better-auth/auth-client";

const SignUpPage = () => {
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const handleDiscord = async () => {
		await authClient.signIn.social({ provider: "discord", callbackURL: "/" });
	};

	const form = useForm({
		defaultValues: {
			email: "",
			username: "",
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			const result = await authClient.signUp.email({
				email: value.email,
				password: value.password,
				name: value.username,
				callbackURL: "/",
			});
			if (result.error) {
				setServerError(result.error.message ?? "Sign up failed");
			} else {
				await navigate({ to: "/" });
			}
		},
	});

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
									onBlur: ({ value }) => {
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
								name="username"
								validators={{
									onChange: ({ value }) =>
										!value ? "Username is required" : undefined,
								}}
							>
								{(field) => (
									<TextInput
										label="Username"
										placeholder="Username"
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
									onChange: ({ value }) => {
										if (!value) return "Password is required";
										if (value.length < 8)
											return "Password must be at least 8 characters";
										return undefined;
									},
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
							<form.Field
								name="confirmPassword"
								validators={{
									onChangeListenTo: ["password"],
									onChange: ({ value, fieldApi }) => {
										const password = fieldApi.form.getFieldValue("password");
										if (value !== password) return "Passwords do not match";
										return undefined;
									},
								}}
							>
								{(field) => (
									<PasswordInput
										label="Confirm Password"
										placeholder="Confirm password"
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
								<Anchor component={Link} to="/sign-in" c="dimmed" size="xs">
									Already have an account? Sign in
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
											Create account
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

const Route = createFileRoute("/sign-up")({ component: SignUpPage });
export { Route };
