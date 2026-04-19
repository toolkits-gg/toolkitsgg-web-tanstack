import type {
	BiomeNameForWorld,
	Injectable,
} from "#/games/remnant2/item-data/locations/biomes";
import type { LabyrinthDungeon } from "#/games/remnant2/item-data/locations/labyrinth";
import type { LosomnDungeon } from "#/games/remnant2/item-data/locations/losomn";
import type { NErudDungeon } from "#/games/remnant2/item-data/locations/nerud";
import type { RootEarthDungeon } from "#/games/remnant2/item-data/locations/root-earth";
import type { WorldLocation } from "#/games/remnant2/item-data/locations/worlds";
import type { YaeshaDungeon } from "#/games/remnant2/item-data/locations/yaesha";

type OtherLocation =
	| "World Drop"
	| "Vendor"
	| "Quest"
	| "Aberration"
	| "Linked Item";

// Generic helper types for location definitions
type WorldDungeonLocation<W extends WorldLocation, D> = {
	world: W;
	dungeon: D[] | OtherLocation;
	biome?: never;
	injectable?: Injectable;
};

type WorldBiomeLocation<W extends WorldLocation, B> = {
	world: W;
	dungeon?: never;
	biome: B;
	injectable?: Injectable;
};

type Remnant2ItemLocation =
	| WorldDungeonLocation<"Losomn", LosomnDungeon>
	| WorldBiomeLocation<"Losomn", BiomeNameForWorld<"Losomn">>
	| WorldDungeonLocation<`N'Erud`, NErudDungeon>
	| WorldBiomeLocation<`N'Erud`, BiomeNameForWorld<`N'Erud`>>
	| WorldDungeonLocation<"Yaesha", YaeshaDungeon>
	| WorldBiomeLocation<"Yaesha", BiomeNameForWorld<"Yaesha">>
	| WorldDungeonLocation<"Root Earth", RootEarthDungeon>
	| WorldDungeonLocation<"Labyrinth", LabyrinthDungeon>
	| { world: "Ward 13"; dungeon: "Ward 13" | OtherLocation }
	| { world: "The Backrooms"; dungeon: "The Backrooms" }
	| { world: "Any"; dungeon: OtherLocation };

export type { Remnant2ItemLocation };
