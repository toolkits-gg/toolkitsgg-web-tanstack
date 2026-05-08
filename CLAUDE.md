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
pnpm db:push          # push schema changes directly to the database (no migration files)
pnpm db:studio        # Prisma Studio
pnpm db:seed          # run prisma/seed.ts
```

This project does **not** use Prisma migrations — schema changes are applied with `pnpm db:push`. After editing any `.prisma` file, run `pnpm db:generate` to regenerate both the Postgres and IndexedDB clients, then `pnpm db:push` to sync the schema to the database.

Two Prisma clients are generated from a single `schema.prisma`:
- `prisma/generated/prisma` — Postgres server client (used via `src/db.ts` and `prisma/client.ts`).
- `prisma/generated/prisma-idb` — IndexedDB client for the browser (via `@prisma-idb/idb-client-generator`), used offline/client-side in `src/integrations/prisma-idb`.

Per-game Prisma models live in separate files imported by `schema.prisma`: `prisma/models/clairobscur.prisma`, `prisma/models/remnant2.prisma`, `prisma/models/slaythespire2.prisma`. When adding a new game, create a corresponding `prisma/models/<gameId>.prisma`.

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
- **React 19** with the **React Compiler** enabled. `babel-plugin-react-compiler` is installed as a dev dependency and is auto-detected by `@vitejs/plugin-react` v6+ — no explicit babel config is required, but the package must remain installed for the compiler to run. Write idiomatic React (no manual `useMemo`/`useCallback`/`React.memo` for values that don't need stable identity); the compiler handles memoization.
- **Mantine v9** for UI (core, dates, modals, notifications, carousel, spotlight, tiptap, code-highlight). `next-themes` drives the theme class on `<html>`.
- **Better Auth** for auth, mounted as a catch-all route at `src/routes/api/auth/$.ts`. Prisma adapter, Discord OAuth, email/password with Resend-sent verification + reset emails (React Email templates in `src/emails/auth/`).
- **TanStack Query** integrated with the router via `setupRouterSsrQueryIntegration` in `src/router.tsx`. Shared `QueryClient` is created in `src/integrations/tanstack-query/get-context.ts` and attached to router context.

### Routing

- Routes live in `src/routes/`. `routeTree.gen.ts` is **generated** — do not edit (also marked read-only in `.vscode/settings.json` and excluded from Biome).
- Root shell is `src/routes/__root.tsx`: renders `<html>`, global providers (`GameProvider` → `MantineProviderWithTheme` → `ModalsProvider`), and the Mantine `AppShell` (header + navbar + footer).
- Game-scoped URLs live under `src/routes/$gameId/` — the `gameId` param is written into the game store on mount.
- Profile routes:
  - `src/routes/profile/` — the anonymous/offline-friendly profile shell. Always reachable, even when signed out or offline (it renders the local DAL view). When the user is both authenticated **and** online, `route.tsx` redirects to `/account/profile/$userId` with the current session's user id.
  - `src/routes/account/profile/$userId/` — the canonical, userId-keyed profile route. Used for both the current user (after the redirect above) and public views of other users.

### Game registry pattern

Everything game-specific hangs off a central registry. Each game under `src/games/<gameId>/` exposes a `core/game-config/index.ts` that exports:

```typescript
export const GAME_CONFIG = {
  ITEMS,         // { all, collectable, categorized, categories, uncollectableCategories }
  THEME,         // ToolkitThemeDefinition
  METADATA,      // id, name, label, description, faviconSourcePath, renderLogo(), externalResources[]
  PAGES,         // { renderItemLookup: () => ReactNode }
  SEARCH_PARAMS, // nuqs search param cache (optional — `undefined` if the game has no custom filters)
  AVATARS,       // GameAvatar[] (optional)
  DAL,           // { collectedItems: GameCollectedItemsDal }
} satisfies GameConfig<LocalItem, CategoryEnum>
```

`src/features/game/registry/game-registry.tsx` wires every `gameId` to its `GameConfig` and exports: `GAME_REGISTRY`, `REGISTERED_GAME_IDS`, `getGameConfig()`, `getGameConfigTyped<TId>()`, `getGameItems()`, `getGameTheme()`, `getGameMetadata()`, `getGamePages()`, `getGameAvatars()`, `getGameLogo()`, `getGameSearchParams()`, `getAllRegisteredThemeDefinitions()`, `getAllRegisteredThemeClassNames()`, `isRegisteredGameId()`, `getValidatedGameId()`.

The `GameId` enum is defined in `schema.prisma` and imported from `@/prisma`. `getAllRegisteredThemeDefinitions()` expands each game theme into light+dark variants plus a base `default-light`/`default-dark`.

### Feature/game separation rule

Game-specific logic (Prisma queries, sync handlers, server functions, DAL actions) must live in `src/games/<gameId>/`. Never add game-keyed branches or inline game handlers to files under `src/features/`.

DAL actions split by scope:
- **Cross-game** (e.g. `favoriteGames`, `userProfile`) → `src/features/<feature>/dal/<entity>/` — currently all under `src/features/auth/dal/` since both belong to the authenticated-user surface area.
- **Game-specific** (e.g. `collectedItems`) → `src/games/<gameId>/dal/`

Within each cross-game DAL folder, files follow a consistent suffix convention:

- `<entity>.ts` — TanStack Start server functions (Postgres reads/writes via Prisma)
- `<entity>.idb.ts` — IndexedDB layer (local reads/writes via the prisma-idb client)
- `<entity>.actions.ts` — `defineDalRead` / `defineDalWrite` action definitions wiring `remote` to the server functions and `local` to the IDB helpers
- `sync-handler.server.ts` — server-side sync handler invoked by `applyPendingOpServerFn`

All cross-game aggregation maps (registries) belong in `src/features/game/registry/`. When adding a new game, that folder is the single place to look for all maps that need a new entry — `game-registry.tsx`, `game-sync-handler-registry.ts`, `game-db-seed-registry.ts`, `game-idb-seed-registry.ts`, `favicon-registry.json`. Registry files may import from `src/games/` but must not contain any per-game business logic inline.

### Adding a new game

Follow these steps in order. The registry is the single place to check; no other `src/features/` files need changes.

1. **Add the enum value** — open `prisma/schema.prisma` and append the new id to `enum GameId`.

2. **Create game models** — copy an existing `prisma/models/<gameId>.prisma` as a template and create `prisma/models/<newGameId>.prisma`. Add the `@@prisma.import` line in `schema.prisma`.

3. **Generate & push** — `pnpm db:generate && pnpm db:push`.

4. **Scaffold the game directory** — create `src/games/<newGameId>/` with the two top-level folders `core/` and `dal/`:

   ```
   core/
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
     item-data/          # raw item definitions consumed by game-config/items.ts
     types.ts            # game-specific TypeScript types (LocalItem, etc.)
     constants.ts        # game-specific constants
     Logo.tsx            # game logo component referenced by metadata.renderLogo()
   dal/
     collected-items.ts  # exports the GameCollectedItemsDal via createCollectedItemsDal()
     server/
       collected-items.ts # TanStack Start server functions for collect/uncollect/list
       sync-handler.ts    # collectedItemSyncHandler — registered in game-sync-handler-registry.ts
   ```

   The DAL action file (`dal/collected-items.ts`) is a thin wrapper that calls `createCollectedItemsDal({ entityName, getModel, serverFns })` from `#/features/dal/core/create-collected-items-dal`.

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

- Mantine theme objects live in `src/features/theme/themes/` and per-game `src/games/<gameId>/core/game-config/theme.ts`.
- `MantineProviderWithTheme` reads the active Mantine theme from `theme-store.ts` and feeds `next-themes` with the full list of registered theme class names (`getAllRegisteredThemeClassNames()`), so `html[data-theme]`/`className` toggling is driven off the registry.
- `SyncAndApplyTheme` syncs `next-themes` ↔ the Mantine store and persists `autoChangeTheme` in `localStorage`.

### DAL (offline-first)

The DAL (`src/features/dal/`) is an offline-first data layer. Every read/write executes against either a **remote** backend (TanStack Start server functions → Postgres) or a **local** backend (IndexedDB). The backend is chosen automatically by `chooseBackend()`: remote when the user is authenticated and online, local otherwise. Local writes are queued as `PendingOp`s and synced later with last-write-wins conflict resolution.

`src/features/dal/` contains:

- `core/` — `define-action.ts` (action factories), `create-collected-items-dal.ts` (the per-game DAL builder), `choose-backend.ts`, `to-query-options.ts`, `registry.ts`, `types.ts`
- `hooks/` — `useDalQuery`, `useDalMutation`, `useBackend`, `useDalContextSource`
- `identity/` — anon-id generation/persistence and `useEffectiveUserId`
- `local/` — IndexedDB constants, `local-db.ts` (prisma-idb client wrapper), and shared local row types
- `queue/` — `PendingOp` storage (`pending-ops.ts`), the `syncOps()` runner, last-write-wins resolution, and the `usePendingOps` hook
- `server/` — `apply-pending-ops.ts` server function and the cross-cutting collected-item handler/sync glue

See `src/features/dal/DIAGRAM.md` for mermaid diagrams of the read/write, sync, and LWW conflict-resolution flows.

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
import { requireUserId, getOptionalUserId } from "#/features/auth/dal/require-user.server";
const userId = await requireUserId();     // throws 401 if no session
const userId = await getOptionalUserId(); // returns null if unauthenticated
```

### Imports & path aliases

Three aliases resolve to the same place — use the one already in the file:

- `#/*` → `./src/*` (declared in `package.json` imports **and** `tsconfig.json` paths).
- `@/prisma` → `./prisma/client` — this is how you import `prisma` and generated types/enums (e.g. `import type { GameId } from "@/prisma"`). Do **not** import directly from `prisma/generated/prisma`.

### Env vars

Validated with zod in `src/config/env.ts`. `.env.local.example` is the template. **Never read `process.env` directly** — always use the type-safe accessors below.

**Server (private) vars** — import `serverEnv` from `#/config/env`. Keys: `DATABASE_URL`, `NODE_ENV`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `IMAGEKIT_CLIENT_ID`, `IMAGEKIT_CLIENT_SECRET`, `IMAGEKIT_ENDPOINT_URL`, `RESEND_KEY`.

```typescript
import { serverEnv } from "#/config/env";
const url = serverEnv.DATABASE_URL;
```

**Client (public) vars** — must be prefixed `VITE_*` and accessed via `import.meta.env`. Keys: `VITE_APP_NAME`, `VITE_APP_URL`, `VITE_CLOUDFRONT_URL`.

```typescript
const appUrl = import.meta.env.VITE_APP_URL;
```

## Code style

- **Tabs** for indentation, double quotes (Biome config). Organize-imports runs on save in VS Code.
- TypeScript is strict with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` — always use `import type` for type-only imports.
- `routeTree.gen.ts` and `styles.css` are excluded from Biome; don't hand-edit them.
