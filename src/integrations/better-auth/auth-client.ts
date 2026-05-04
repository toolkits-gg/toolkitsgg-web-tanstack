import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_APP_URL || "http://localhost:3000",
});

// noinspection JSUnusedGlobalSymbols
const { signIn, signUp, signOut, useSession, resetPassword, verifyEmail } =
	authClient;

// noinspection JSUnusedGlobalSymbols
const signInWithDiscord = async () => {
	await authClient.signIn.social({
		provider: "discord",
	});
};

export {
	authClient,
	resetPassword,
	signIn,
	signInWithDiscord,
	signOut,
	signUp,
	useSession,
	verifyEmail,
};
