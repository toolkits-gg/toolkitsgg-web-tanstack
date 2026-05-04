import { allGameDBSeeds } from "#/features/game/registry/game-db-seed-registry";

import { auth } from "#/integrations/better-auth/auth";
import { prisma } from "./client";

const seededUsers = [
	{
		username: "admin",
		email: "yo@toolkits.gg",
		emailVerified: true,
	},
];

const seededUserProfiles = [
	{
		displayName: "Toolkit Admin",
		bio: "Toolkit Admin bio here",
		avatarUrl: undefined,
	},
];

const seed = async () => {
	const t0 = performance.now();
	console.log("DB Seed: Started ...");

	try {
		await Promise.all([
			prisma.userAvatarOverride.deleteMany(),
			prisma.userProfile.deleteMany(),
			prisma.userFavoriteGame.deleteMany(),
			prisma.userFollowedUsers.deleteMany(),
			prisma.userRole.deleteMany(),
		]);
		await prisma.user.deleteMany();
	} catch (_error: unknown) {
		console.warn("DB Seed: Skipping cleanup (fresh database)");
	}

	const seededLocalPassword = "useruser!";

	await Promise.all(
		seededUsers.map(async (user, index) => {
			const result = await auth.api.signUpEmail({
				body: {
					email: user.email,
					password: seededLocalPassword,
					name: user.username,
					username: user.username,
				},
			});

			const userId = result.user.id;

			if (user.emailVerified) {
				await prisma.user.update({
					where: { id: userId },
					data: { emailVerified: true },
				});
			}

			await prisma.userProfile.create({
				data: {
					...seededUserProfiles[index],
					userId,
				},
			});

			return result.user;
		}),
	);

	await Promise.all(
		Object.entries(allGameDBSeeds).map(async ([gameId, gameSeed]) => {
			console.log(`DB Seed: Seeding items for ${gameId}...`);
			await gameSeed.seed();
		}),
	);

	const t1 = performance.now();
	console.log(`DB Seed: Finished (${t1 - t0}ms)`);
};

seed();
