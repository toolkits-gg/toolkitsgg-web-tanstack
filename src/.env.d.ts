/// <reference types="vite/client" />

// Server-side environment variables
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly DATABASE_URL: string;
			readonly BETTER_AUTH_SECRET: string;
			readonly BETTER_AUTH_URL: string;
			readonly NODE_ENV: "development" | "production" | "test";
			readonly DISCORD_CLIENT_ID: string;
			readonly DISCORD_CLIENT_SECRET: string;
			readonly RESEND_KEY: string;
		}
	}
}

export {};
