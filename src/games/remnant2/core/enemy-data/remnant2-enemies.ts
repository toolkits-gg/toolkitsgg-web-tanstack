import { aberrationEnemies } from "#/games/remnant2/core/enemy-data/aberrations";
import { addsEnemies } from "#/games/remnant2/core/enemy-data/adds";
import { bossEnemies } from "#/games/remnant2/core/enemy-data/bosses";
import { enemies } from "#/games/remnant2/core/enemy-data/enemies";
import type { Enemy } from "#/games/remnant2/core/enemy-data/types";
import { worldBossEnemies } from "#/games/remnant2/core/enemy-data/world-bosses";

const ENEMIES: Enemy[] = [
	...aberrationEnemies,
	...addsEnemies,
	...bossEnemies,
	...enemies,
	...worldBossEnemies,
];

export { ENEMIES };
