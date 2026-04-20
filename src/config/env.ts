// src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url(),
	NODE_ENV: z.enum(["development", "production", "test"]),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.url(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	IMAGEKIT_CLIENT_ID: z.string(),
	IMAGEKIT_CLIENT_SECRET: z.string(),
	IMAGEKIT_ENDPOINT_URL: z.url(),
	RESEND_KEY: z.string(),
});

const clientEnvSchema = z.object({
	VITE_APP_NAME: z.string(),
	VITE_APP_URL: z.url(),
	VITE_CLOUDFRONT_URL: z.url(),
});

// Validate server environment
export const serverEnv = envSchema.parse(process.env);

// Validate client environment
export const clientEnv = clientEnvSchema.parse(import.meta.env);
