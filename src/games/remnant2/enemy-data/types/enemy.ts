import type { Remnant2ItemLocation } from '@/games/remnant2/data/locations/types/item-location';
import type { Remnant2DLC } from '@/prisma';

type EnemyCategory = 'add' | 'enemy' | 'boss' | 'world boss' | 'aberration';

type EnemyModifier =
  | 'resistBleed'
  | 'resistFire'
  | 'resistShock'
  | 'resistAcid'
  | 'resistMelee';

type BossCategory = 'boss' | 'world boss' | 'aberration';

interface Enemy {
  slug: string;
  name: string;
  imageUrl?: string;
  dlc?: Remnant2DLC;
  category: EnemyCategory;
  location?: Remnant2ItemLocation;
  wikiLink: string | undefined;
  modifiers: { [K in EnemyModifier]?: number | 'immune' } | undefined;
  notes?: string;
}

export type { BossCategory, Enemy, EnemyCategory, EnemyModifier };
