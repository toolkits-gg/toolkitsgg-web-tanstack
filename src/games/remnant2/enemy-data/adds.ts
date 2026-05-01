import type { Enemy } from "#/games/remnant2/enemy-data/types/enemy";

const addsEnemies = [
	{
		slug: "39Yoor",
		name: "Astropath Phantom (Orange)",
		dlc: "BASE",
		category: "add",
		wikiLink: undefined,
		modifiers: {
			resistBleed: "immune",
		},
		notes: "Immune to Bleeding Status",
	},
	{
		slug: "fV6d7N",
		name: "Astropath Phantom (Pink)",
		dlc: "BASE",
		category: "add",
		wikiLink: undefined,
		modifiers: {
			resistBleed: "immune",
		},
		notes: "Immune to Bleeding Status",
	},
	{
		slug: "Muo5Zc",
		name: "Magister Dullain Flightless Fae Soldiers",
		dlc: "BASE",
		category: "add",
		wikiLink: undefined,
		modifiers: {
			resistMelee: -15,
		},
	},
	{
		slug: "P6N7Rs",
		name: "One True King Weapon",
		dlc: "DLC1",
		category: "add",
		wikiLink: undefined,
		modifiers: undefined,
	},
	{
		slug: "h2k3rG",
		name: "Primogenitor Larva Corpse",
		dlc: "BASE",
		category: "add",
		wikiLink: undefined,
		modifiers: undefined,
	},
	{
		slug: "YQZeR8",
		name: "The Huntress Small Faerie",
		dlc: "BASE",
		category: "add",
		wikiLink: undefined,
		modifiers: {
			resistFire: -10,
			resistShock: -10,
		},
	},
	{
		slug: "s8vXqN",
		name: "The Nightweaver Bugs",
		dlc: "BASE",
		category: "add",
		wikiLink: undefined,
		modifiers: undefined,
	},

	{
		slug: "xMw8Bv",
		name: "The Red Prince Clone",
		dlc: "BASE",
		category: "add",
		wikiLink: undefined,
		modifiers: {
			resistBleed: 25,
		},
	},
] as const satisfies Enemy[];

export { addsEnemies };
