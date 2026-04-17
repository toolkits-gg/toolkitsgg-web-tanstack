import { allGameDBSeeds } from '@/features/game/constants/all-game-db-seeds';
import { logger } from '@/lib/logger';

import { auth } from '../src/integrations/better-auth/better-auth';
import { prisma } from './client';

const seededUsers = [
  {
    username: 'admin',
    email: 'yo@toolkits.gg',
    emailVerified: true,
  },
];

const seededUserProfiles = [
  {
    displayName: 'Toolkit Admin',
    bio: 'Toolkit Admin bio here',
    avatarUrl: undefined,
  },
  {
    displayName: 'Toolkit User',
    bio: 'Toolkit User bio here',
    avatarUrl: undefined,
  },
];

const seed = async () => {
  const t0 = performance.now();
  logger.info('DB Seed: Started ...');

  // Clean up existing data (ignore errors if tables don't exist yet)
  try {
    await Promise.all([
      prisma.userProfile.deleteMany(),
      prisma.userFavoriteGame.deleteMany(),
      prisma.userFollowedUsers.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  } catch (_error: unknown) {
    logger.warn('DB Seed: Skipping cleanup (fresh database)');
  }

  const seededLocalPassword = 'useruser!';

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
          userId: userId,
        },
      });

      return result.user;
    })
  );

  // Seed items for each game
  await Promise.all(
    Object.entries(allGameDBSeeds).map(async ([gameId, gameSeed]) => {
      logger.info(`DB Seed: Seeding items for ${gameId}...`);
      await gameSeed.seed();
    })
  );

  // Wrapping up
  const t1 = performance.now();
  logger.info(`DB Seed: Finished (${t1 - t0}ms)`);
};

seed();
