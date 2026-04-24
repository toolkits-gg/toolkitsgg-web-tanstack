import type { ClairObscurCharacter } from "@/prisma";

type EquippableBy = ClairObscurCharacter[] | "ANY";

export type { EquippableBy };
