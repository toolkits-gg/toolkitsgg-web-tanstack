# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm**. Test runner is **Vitest**. Formatter/linter is **Biome** (not Prettier/ESLint).

```bash
pnpm dev              # Vite dev server on :3000
pnpm build            # Production build (TanStack Start)
pnpm preview          # Preview production build
pnpm test             # Run vitest once (CI-style)
pnpm check            # Biome check (lint + format)
pnpm format           # Biome format only
pnpm lint             # Biome lint only
pnpm type             # TypeScript type check (no emit)
```

Single test: `pnpm vitest run path/to/file.test.ts` or `pnpm vitest run -t "test name"`.

### Database

Postgres is required. Local dev uses the Docker Compose stack; all `db:*` scripts load `.env.local` via `dotenv-cli`.

```bash
pnpm db:local:start   # start local postgres (compose.local.yaml)
pnpm db:generate      # prisma generate → writes to prisma/generated/prisma & prisma/generated/prisma-idb
pnpm db:push          # push schema without a migration
pnpm db:migrate       # create + apply a dev migration
pnpm db:studio        # Prisma Studio
pnpm db:seed          # run prisma/seed.ts
```

Two Prisma clients are generated from a single `schema.prisma`:
- `prisma/generated/prisma` — Postgres server client (used via `src/db.ts` and `prisma/client.ts`).
- `prisma/generated/prisma-idb` — IndexedDB client for the browser (via `@prisma-idb/idb-client-generator`), used offline/client-side in `src/integrations/prisma-idb`.

Per-game Prisma models live in separate files imported by `schema.prisma`: `prisma/models/clairobscur.prisma`, `prisma/models/remnant2.prisma`, `prisma/models/slaythespire2.prisma`. When adding a new game, create a corresponding `prisma/models/<gameId>.prisma`.

Always re-run `pnpm db:generate` after editing any `.prisma` file; both generators run together.

## Skills

Skills live in `.claude/skills/`. Use the `/skill-name` slash command or reference them when working on relevant code.

| Skill | Use when |
|---|---|
| `tanstack-start` | Server functions, SSR, deployment |
| `tanstack-router` | Routes, loaders, search params, link generation |
| `tanstack-query` | `useQuery`, `useMutation`, query keys, cache invalidation |
| `tanstack-form` | Form state, validation, field arrays |
| `tanstack-virtual` | Virtualizing large lists |
| `tanstack-table` | Tables, sorting, filtering, pagination |
| `tanstack-store` | Reactive stores with `@tanstack/store` |
| `mantine-custom-components` | Creating components with Mantine Styles API, `factory()`, compound components |
| `better-auth-best-practices` | Auth config, plugins, session management |
| `web-design-guidelines` | Accessibility, UX review |

## Architecture

### Framework stack

- **TanStack Start** (SSR + server functions) on top of **TanStack Router** with file-based routing. `vite.config.ts` registers `tanstackStart()` before `@vitejs/plugin-react` — order matters.
- **React 19** with `babel-plugin-react-compiler` enabled.
- **Mantine v9** for UI (core, dates, modals, notifications, carousel, spotlight, tiptap, code-highlight). `next-themes` drives the theme class on `<html>`.
- **Better Auth** for auth, mounted as a catch-all route at `src/routes/api/auth/$.ts`. Prisma adapter, Discord OAuth, email/password with Resend-sent verification + reset emails (React Email templates in `src/emails/auth/`).
- **TanStack Query** integrated with the router via `setupRouterSsrQueryIntegration` in `src/router.tsx`. Shared `QueryClient` is created in `src/integrations/tanstack-query/get-context.ts` and attached to router context.

### Routing

- Routes live in `src/routes/`. `routeTree.gen.ts` is **generated** — do not edit (also marked read-only in `.vscode/settings.json` and excluded from Biome).
- Root shell is `src/routes/__root.tsx`: renders `<html>`, global providers (`GameProvider` → `MantineProviderWithTheme` → `ModalsProvider`), and the Mantine `AppShell` (header + navbar + footer).
- Game-scoped URLs live under `src/routes/$gameId/` — the `gameId` param is written into the game store on mount.
- Profile routes: `src/routes/profile/` (current user, must be signed in) and `src/routes/account/profile/$userId/` (public profiles).

### Game registry pattern

Everything game-specific hangs off a central registry. Each game under `src/games/<gameId>/` exposes a `game-config/index.ts` that exports:

```typescript
export const GAME_CONFIG = {
  ITEMS,        // { all, collectable, categorized, categories, uncollectableCategories }
  THEME,        // ToolkitThemeDefinition
  METADATA,     // id, name, label, description, faviconSourcePath, renderLogo(), externalResources[]
  PAGES,        // { renderItemLookup: () => ReactNode }
  SEARCH_PARAMS, // nuqs search param cache (optional)
  AVATARS,      // GameAvatar[] (optional)
  DAL,          // { collectedItems: GameCollectedItemsDal }
} satisfies GameConfig<LocalItem, CategoryEnum>
```

`src/features/game/registry/game-registry.tsx` wires every `gameId` to its `GameConfig` and exports convenience functions: `getGameConfig()`, `getGameItems()`, `getGameTheme()`, `getGameMetadata()`, `getGamePages()`, `getGameAvatars()`, `getGameConfigTyped<TId>()`, `getAllRegisteredThemeDefinitions()`, `getAllRegisteredThemeClassNames()`, `isRegisteredGameId()`, `getValidatedGameId()`.

The `GameId` enum is defined in `schema.prisma` and imported from `@/prisma`. `getAllRegisteredThemeDefinitions()` expands each game theme into light+dark variants plus a base `default-light`/`default-dark`.

### Feature/game separation rule

Game-specific logic (Prisma queries, sync handlers, server functions, DAL actions) must live in `src/games/<gameId>/`. Never add game-keyed branches or inline game handlers to files under `src/features/`.

DAL actions split by scope:
- **Cross-game** (e.g. `favoriteGames`, `userProfile`) → `src/features/dal/actions/`
- **Game-specific** (e.g. `collectedItems`) → `src/games/<gameId>/dal/`

All cross-game aggregation maps (registries) belong in `src/features/game/registry/`. When adding a new game, that folder is the single place to look for all maps that need a new entry — `game-registry.tsx`, `game-sync-handler-registry.ts`, `game-db-seed-registry.ts`, `game-idb-seed-registry.ts`, `favicon-registry.json`. Registry files may import from `src/games/` but must not contain any per-game business logic inline.

### Adding a new game

Follow these steps in order. The registry is the single place to check; no other `src/features/` files need changes.

1. **Add the enum value** — open `prisma/schema.prisma` and append the new id to `enum GameId`.

2. **Create game models** — copy an existing `prisma/models/<gameId>.prisma` as a template and create `prisma/models/<newGameId>.prisma`. Add the `@@prisma.import` line in `schema.prisma`.

3. **Generate & migrate** — `pnpm db:generate && pnpm db:migrate`.

4. **Scaffold the game directory** — create `src/games/<newGameId>/` with:

   ```
   game-config/
     index.ts          # exports GAME_CONFIG satisfies GameConfig<LocalItem, CategoryEnum>
     metadata.tsx      # id, name, label, description, faviconSourcePath, renderLogo()
     pages.tsx         # GamePages with renderItemLookup()
     theme.ts          # ToolkitThemeDefinition (colors, Mantine overrides)
     items.ts          # item data + categorization
     search-params.ts  # nuqs parsers (optional — only if custom filters needed)
     avatars.ts        # GameAvatar[] (optional)
     db-seed.ts        # GameDBSeed (initial Postgres data)
     idb-seed.ts       # GameIDBSeed (initial IndexedDB data)
   dal/
     collected-items.ts        # defineDalRead / defineDalWrite actions
     server/
       sync-handler.ts         # createCollectedItemSyncHandler export
       server-functions.ts     # TanStack Start server functions
   types/                      # game-specific TypeScript types
   constants/                  # game-specific constants
   item-data/                  # raw item definitions
   components/                 # game-specific UI (e.g. Logo.tsx)
   ```

5. **Register in all registry files** (all live in `src/features/game/registry/`):

   | File | What to add |
   |---|---|
   | `game-registry.tsx` | Entry in `GAME_REGISTRY` object |
   | `game-db-seed-registry.ts` | Entry in `allGameDBSeeds` |
   | `game-idb-seed-registry.ts` | Entry in `allGameIDBSeeds` |
   | `game-sync-handler-registry.ts` | Entry mapping entity name → `collectedItemSyncHandler` |
   | `favicon-registry.json` | `"<gameId>": "<favicon-path>"` |

### Active-game resolution

The active game is tracked in a `@tanstack/store` at `src/features/game/store/game-store.ts` with a `source` priority: `subdomain` > `route` > `toggle`/`session` > `default`. Two providers write to it:

- `GameProvider` (client-only, mounted in `__root.tsx`) — reads `window.location.hostname` (`parseSubdomain`) with a `?_game=` dev override.
- `$gameId/route.tsx` — writes the route param on every navigation.

A `subdomain`-sourced value deliberately wins over later `route` writes — be careful if you change this precedence.

### Theme system

- Mantine theme objects live in `src/features/theme/themes/` and per-game `game-config/theme.ts`.
- `MantineProviderWithTheme` reads the active Mantine theme from `theme-store.ts` and feeds `next-themes` with the full list of registered theme class names (`getAllRegisteredThemeClassNames()`), so `html[data-theme]`/`className` toggling is driven off the registry.
- `SyncAndApplyTheme` syncs `next-themes` ↔ the Mantine store and persists `autoChangeTheme` in `localStorage`.

### DAL (offline-first)

The DAL (`src/features/dal/`) is an offline-first data layer. Every read/write executes against either a **remote** backend (TanStack Start server functions → Postgres) or a **local** backend (IndexedDB). The backend is chosen automatically: remote when the user is authenticated and online, local otherwise. Local writes are queued as `PendingOp`s and synced later with last-write-wins conflict resolution.

```
Component
  └─ useDalQuery / useDalMutation
       └─ DalContext { anonUserId, authUserId, backend }
            ├─ "remote"  →  action.remote(input, ctx)   (server function)
            └─ "local"   →  action.local(input, ctx)    (IndexedDB)
                                 └─ [writes] enqueueOp() → PendingOp → syncOps()
```

**Key types:**

```typescript
interface DalContext {
  anonUserId: string;        // UUID from localStorage — always present
  authUserId: string | null; // set when signed in
  backend: "remote" | "local";
}
```

Use `ctx.authUserId ?? ctx.anonUserId` as the stable local user ID.

**Define actions** with the factory helpers:

```typescript
import { defineDalRead, defineDalWrite } from "#/features/dal/core/define-action";

// Read
const list = defineDalRead<void, MyItem[]>({
  queryKey: () => ["myEntity", "list"],
  remote: async (_input, _ctx) => myListServerFn(),
  local: async (_input, ctx) => listLocalItems(ctx.authUserId ?? ctx.anonUserId),
});

// Write
const upsert = defineDalWrite<MyInput, MyItem>({
  entity: "myEntity",
  operation: "upsert",
  invalidates: ["myEntity"],
  buildIdempotencyKey: (input, ctx) => `myEntity:upsert:${ctx.anonUserId}:${input.id}`,
  remote: async (input, _ctx) => myUpsertServerFn({ data: input }),
  local: async (input, ctx) => upsertLocalItem({ userId: ctx.authUserId ?? ctx.anonUserId, ...input }),
  sync: (op) => applyPendingOpServerFn({ data: op }),
});
```

**Use in components:**

```typescript
const { data } = useDalQuery(myActions.list, undefined);
const mutation = useDalMutation(myActions.upsert);
mutation.mutate({ id: "...", value: "..." });
```

**Server helpers** (use inside server functions only):

```typescript
import { requireUserId, getOptionalUserId } from "#/features/dal/server/require-user";
const userId = await requireUserId();   // throws 401 if no session
const userId = await getOptionalUserId(); // returns null if unauthenticated
```

See `src/features/dal/README.md` for the full sync queue, conflict resolution, and testing documentation.

### Imports & path aliases

Three aliases resolve to the same place — use the one already in the file:

- `#/*` → `./src/*` (declared in `package.json` imports **and** `tsconfig.json` paths).
- `@/*` → `./src/*` (tsconfig only).
- `@/prisma` → `./prisma/client` — this is how you import `prisma` and generated types/enums (e.g. `import type { GameId } from "@/prisma"`). Do **not** import directly from `prisma/generated/prisma`.

### Env vars

Validated with zod in `src/config/env.ts` (server) and `import.meta.env` (client). `.env.local.example` is the template.

Server keys (from `process.env`): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `IMAGEKIT_CLIENT_ID`, `IMAGEKIT_CLIENT_SECRET`, `IMAGEKIT_ENDPOINT_URL`, `RESEND_KEY`.

Client keys must be `VITE_*` (from `import.meta.env`): `VITE_APP_NAME`, `VITE_APP_URL`, `VITE_CLOUDFRONT_URL`.

## Code style

- **Tabs** for indentation, double quotes (Biome config). Organize-imports runs on save in VS Code.
- TypeScript is strict with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` — always use `import type` for type-only imports.
- `routeTree.gen.ts` and `styles.css` are excluded from Biome; don't hand-edit them.
