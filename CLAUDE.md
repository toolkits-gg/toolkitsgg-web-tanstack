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

Always re-run `pnpm db:generate` after editing `schema.prisma`; both generators run together.

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

### Game registry pattern

Everything game-specific hangs off a central registry:

- `src/features/game/registry/game-registry.ts` wires games keyed by `gameId` to their `GameConfig` (`ITEMS` + `THEME`).
- Each game under `src/games/<gameId>/` exposes a `game-config/index.ts` that `satisfies GameConfig<...>` with game-specific item and category generics (e.g. `Remnant2LocalItem`, `Remnant2ItemCategory`).
- The `GameId` enum is defined in `schema.prisma` and imported from `@/prisma`. Adding a new game means: add the enum value, create `src/games/<id>/`, then register it in `game-registry.ts`.
- `getAllRegisteredThemeDefinitions()` expands each game theme into light+dark variants plus a base `default-light`/`default-dark`. Add themes by attaching them to a game's `game-config`, not by editing the registry output.

### Active-game resolution

The active game is tracked in a `@tanstack/store` at `src/features/game/store/game-store.ts` with a `source` priority: `subdomain` > `route` > `toggle`/`session` > `default`. Two providers write to it:

- `GameProvider` (client-only, mounted in `__root.tsx`) — reads `window.location.hostname` (`parseSubdomain`) with a `?_game=` dev override.
- `$gameId/route.tsx` — writes the route param on every navigation.

A `subdomain`-sourced value deliberately wins over later `route` writes — be careful if you change this precedence.

### Theme system

- Mantine theme objects live in `src/features/theme/themes/` and per-game `game-config/theme.ts`.
- `MantineProviderWithTheme` reads the active Mantine theme from `theme-store.ts` and feeds `next-themes` with the full list of registered theme class names (`getAllRegisteredThemeClassNames()`), so `html[data-theme]`/`className` toggling is driven off the registry.
- `SyncAndApplyTheme` syncs `next-themes` ↔ the Mantine store and persists `autoChangeTheme` in `localStorage`.

### Imports & path aliases

Three aliases resolve to the same place — use the one already in the file:

- `#/*` → `./src/*` (declared in `package.json` imports **and** `tsconfig.json` paths).
- `@/*` → `./src/*` (tsconfig only).
- `@/prisma` → `./prisma/client` — this is how you import `prisma` and generated types/enums (e.g. `import type { GameId } from "@/prisma"`). Do **not** import directly from `prisma/generated/prisma`.

### Env vars

Validated with zod in `src/config/env.ts`. Server keys (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DISCORD_*`, `IMAGEKIT_*`, `RESEND_KEY`) come from `process.env`; client keys must be `VITE_*` and come from `import.meta.env`. `.env.local.example` is the template.

## Code style

- **Tabs** for indentation, double quotes (Biome config). Organize-imports runs on save in VS Code.
- TypeScript is strict with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` — always use `import type` for type-only imports.
- `routeTree.gen.ts` and `styles.css` are excluded from Biome; don't hand-edit them.
