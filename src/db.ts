import { PrismaPg } from "@prisma/adapter-pg";
import { serverEnv } from "#/config/env.js";
import { PrismaClient } from "../prisma/generated/prisma/client.js";

const adapter = new PrismaPg({
	connectionString: serverEnv.DATABASE_URL,
});

declare global {
	var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
	globalThis.__prisma = prisma;
}
