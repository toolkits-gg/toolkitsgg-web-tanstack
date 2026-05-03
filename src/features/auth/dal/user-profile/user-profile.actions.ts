import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";
import {
	getOptionalUserId,
	requireUserId,
} from "#/features/auth/dal/require-user.server";
import {
	removeAvatarOverrideServerFn,
	removePrimaryAvatarServerFn,
	updateAvatarServerFn,
} from "#/features/auth/dal/user-profile/user-profile";
import {
	deleteLocalAvatarOverride,
	getLocalAvatarOverrides,
	getLocalUserProfile,
	upsertLocalAvatarOverride,
	upsertLocalUserProfile,
} from "#/features/auth/dal/user-profile/user-profile.idb";
import {
	defineDalRead,
	defineDalWrite,
} from "#/features/dal/core/define-action";
import type { DalContext } from "#/features/dal/core/types";
import { applyPendingOpServerFn } from "#/features/dal/server/apply-pending-ops";
import type { GameId } from "@/prisma";

type UserProfileData = {
	displayName: string;
	bio: string;
	avatarUrl: string | null;
	primaryAvatarId: string | null;
	primaryAvatarGameId: GameId | null;
	avatarOverrides: { gameId: GameId; avatarId: string; avatarGameId: GameId }[];
};

const resolveLocalUserId = (ctx: DalContext): string => {
	return ctx.authUserId ?? ctx.anonUserId;
};

const userProfileActions = {
	getProfile: defineDalRead<void, UserProfileData | null>({
		queryKey: () => ["userProfile", "getProfile"] as const,
		remote: async () => {
			const user = await getUserProfileServerFn();
			if (!user?.userProfile) return null;
			const profile = user.userProfile;
			return {
				displayName: profile.displayName,
				bio: profile.bio,
				avatarUrl: profile.avatarUrl ?? null,
				primaryAvatarId: profile.primaryAvatarId ?? null,
				primaryAvatarGameId: (profile.primaryAvatarGameId as GameId) ?? null,
				avatarOverrides: profile.avatarOverrides.map((o) => ({
					gameId: o.gameId as GameId,
					avatarId: o.avatarId,
					// Server-side overrides don't store avatarGameId; use gameId as fallback
					avatarGameId: o.gameId as GameId,
				})),
			};
		},
		local: async (_input, ctx) => {
			const userId = resolveLocalUserId(ctx);
			const profile = await getLocalUserProfile(userId);
			const overrides = await getLocalAvatarOverrides(userId);
			return {
				displayName: profile?.displayName ?? "Traveler",
				bio: profile?.bio ?? "No bio provided.",
				avatarUrl: null,
				primaryAvatarId: profile?.primaryAvatarId ?? null,
				primaryAvatarGameId: (profile?.primaryAvatarGameId as GameId) ?? null,
				avatarOverrides: overrides.map((o) => ({
					gameId: o.gameId,
					avatarId: o.avatarId,
					avatarGameId: o.avatarGameId,
				})),
			};
		},
	}),

	updateAvatar: defineDalWrite<
		{ avatarId: string; avatarGameId: GameId; targetGameId?: GameId },
		{ ok: true }
	>({
		entity: "userAvatarOverride",
		operation: "upsert",
		invalidates: ["userProfile"],
		buildIdempotencyKey: (input, ctx) =>
			`userAvatarOverride:upsert:${ctx.anonUserId}:${input.targetGameId ?? "primary"}:${input.avatarId}`,
		remote: async (input) => updateAvatarServerFn({ data: input }),
		local: async (input, ctx) => {
			const userId = resolveLocalUserId(ctx);
			if (input.targetGameId) {
				await upsertLocalAvatarOverride({
					userId,
					gameId: input.targetGameId,
					avatarId: input.avatarId,
					avatarGameId: input.avatarGameId,
				});
			} else {
				await upsertLocalUserProfile({
					userId,
					primaryAvatarId: input.avatarId,
					primaryAvatarGameId: input.avatarGameId,
				});
			}
			return { ok: true as const };
		},
		sync: (op) => applyPendingOpServerFn({ data: op }),
	}),

	removePrimaryAvatar: defineDalWrite<void, { ok: true }>({
		entity: "userProfile",
		operation: "upsert",
		invalidates: ["userProfile"],
		buildIdempotencyKey: (_input, ctx) =>
			`userProfile:removePrimary:${ctx.anonUserId}`,
		remote: async () => removePrimaryAvatarServerFn(),
		local: async (_input, ctx) => {
			const userId = resolveLocalUserId(ctx);
			await upsertLocalUserProfile({
				userId,
				primaryAvatarId: null,
				primaryAvatarGameId: null,
			});
			return { ok: true as const };
		},
		sync: (op) => applyPendingOpServerFn({ data: op }),
	}),

	removeAvatarOverride: defineDalWrite<{ targetGameId: GameId }, { ok: true }>({
		entity: "userAvatarOverride",
		operation: "delete",
		invalidates: ["userProfile"],
		buildIdempotencyKey: (input, ctx) =>
			`userAvatarOverride:delete:${ctx.anonUserId}:${input.targetGameId}`,
		remote: async (input) => removeAvatarOverrideServerFn({ data: input }),
		local: async (input, ctx) => {
			const userId = resolveLocalUserId(ctx);
			await deleteLocalAvatarOverride(userId, input.targetGameId);
			return { ok: true as const };
		},
		sync: (op) => applyPendingOpServerFn({ data: op }),
	}),
};

const getViewerUserIdServerFn = createServerFn({
	method: "GET",
}).handler(async () => getOptionalUserId());

const getUserProfileServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await requireUserId();
		return prisma.user.findUnique({
			where: { id: userId },
			include: {
				userProfile: {
					include: { avatarOverrides: true },
				},
			},
		});
	},
);

export { getViewerUserIdServerFn, getUserProfileServerFn, userProfileActions };
