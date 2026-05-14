import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { serverEnv } from "#/config/env";
import { prisma } from "@/prisma";

const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	secret: serverEnv.BETTER_AUTH_SECRET,
	baseURL:
		serverEnv.BETTER_AUTH_URL ||
		import.meta.env.VITE_APP_URL ||
		"http://localhost:3000",
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24 * 15, // 15 days - refresh session
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	user: {
		additionalFields: {
			username: {
				type: "string",
				required: true,
				unique: true,
			},
		},
	},
	socialProviders: {
		discord: {
			clientId: serverEnv.DISCORD_CLIENT_ID,
			clientSecret: serverEnv.DISCORD_CLIENT_SECRET,
			mapProfileToUser: (profile) => {
				// Discord provides a username field - use it as the default username
				// Better Auth will handle uniqueness by appending numbers if needed
				return {
					name: profile.username || profile.global_name || undefined,
					image: profile.avatar
						? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
						: undefined,
					email: profile.email,
					emailVerified: profile.verified ?? false,
					username:
						profile.username || profile.global_name || `discord_${profile.id}`,
				};
			},
		},
	},
	plugins: [nextCookies()],
});

type Auth = typeof auth;

export { type Auth, auth };
