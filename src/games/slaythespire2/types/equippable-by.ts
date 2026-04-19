import type { SlayTheSpire2Character } from "@/prisma";

type EquippableBy = SlayTheSpire2Character[] | "ANY";

export type { EquippableBy };
