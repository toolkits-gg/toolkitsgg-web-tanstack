import { createCollectedItemSyncHandler } from "#/features/dal/server/collected-item-sync-handler";
import { prisma } from "@/prisma";

export const collectedItemSyncHandler = createCollectedItemSyncHandler(
	prisma.clairObscurCollectedItem,
);
