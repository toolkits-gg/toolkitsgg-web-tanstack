import { aberrationEnemies } from "#/games/remnant2/enemy-data/aberrations";
import { addsEnemies } from "#/games/remnant2/enemy-data/adds";
import { bossEnemies } from "#/games/remnant2/enemy-data/bosses";
import { enemies } from "#/games/remnant2/enemy-data/enemies";
import type { Enemy } from "#/games/remnant2/enemy-data/types/enemy";
import { worldBossEnemies } from "#/games/remnant2/enemy-data/world-bosses";

const ENEMIES: Enemy[] = [
	...aberrationEnemies,
	...addsEnemies,
	...bossEnemies,
	...enemies,
	...worldBossEnemies,
];

export { ENEMIES };
