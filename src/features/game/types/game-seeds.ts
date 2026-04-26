type GameIDBSeed = {
	/** localStorage flag key to prevent re-seeding, e.g. 'idb-seeded-remnant2' */
	seedFlag: string;
	/** Seeds game-specific items into IDB. Calls getIDBClient() internally. */
	seed: () => Promise<void>;
};

type GameDBSeed = {
	/** Seeds game-specific items into PostgreSQL. Uses prisma client internally. */
	seed: () => Promise<void>;
};

export type { GameDBSeed, GameIDBSeed };
