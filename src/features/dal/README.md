# Data Access Layer (DAL)

An offline-first sync system that abstracts dual backends behind a unified API. Components never know if they're talking to Postgres (remote) or IndexedDB (local) — the DAL picks based on auth + network state.

**Backend selection rule** (`core/choose-backend.ts`):
- Authenticated + online → **remote** (server functions → Prisma → Postgres)
- Offline or unauthenticated → **local** (IndexedDB, queued for later sync)

---

## Core Layers

| Layer | Location | Purpose |
|---|---|---|
| Actions | `actions/` | Defines read/write ops with both remote + local implementations |
| Hooks | `hooks/` | React API: `useDalQuery`, `useDalMutation` |
| Server | `server/` | TanStack Start server functions that call Prisma |
| Local | `local/` | IndexedDB wrappers that mirror Prisma syntax |
| Queue | `queue/` | Pending ops store + sync runner |
| Identity | `identity/` | Auth ID vs. anonymous UUID resolution |

---

## How to Use It

### 1. Define an Action

Use `defineDalRead()` or `defineDalWrite()` to create an action:

```ts
// actions/my-entity.ts
export const myEntityActions = {
  list: defineDalRead({
    queryKey: (ctx, input) => ["my-entity", "list", ctx.authUserId],
    remote: async (ctx, input) => listMyEntityServerFn({ data: input }),
    local: async (ctx, input) => myEntityIdb.findMany(),
  }),

  create: defineDalWrite({
    entity: "my_entity",
    operation: "create",
    idempotencyKey: (input) => buildIdempotencyKey("my_entity", input.id),
    invalidates: ["my-entity"],
    remote: async (ctx, input) => createMyEntityServerFn({ data: input }),
    local: async (ctx, input) => myEntityIdb.upsert(input),
    sync: async (ctx, input) => applyPendingOpServerFn({ data: { entity: "my_entity", payload: input } }),
  }),
};
```

### 2. Register the write action

Add it to `actions/registry.ts` so the sync runner can replay it when coming back online:

```ts
export const actionRegistry = {
  my_entity: myEntityActions.create,
  // ...
};
```

### 3. Use hooks in components

```tsx
// Read
const { data, isLoading } = useDalQuery(myEntityActions.list, undefined);

// Write
const create = useDalMutation(myEntityActions.create);
create.mutate({ id: "abc", name: "foo" });
```

`useDalMutation` automatically:
- Calls the **remote** impl if online + authed
- Calls the **local** impl + **enqueues the op** if offline/guest
- Invalidates relevant query keys after success

---

## Offline Sync Flow

When a user comes back online, `syncOps()` (`queue/sync-runner.ts`) is called. It:

1. Reads all `pending` ops from the IndexedDB queue
2. For each op, resolves the write action via the registry
3. Calls the action's `sync` handler → `applyPendingOpServerFn`
4. The server handler compares timestamps (**last-write-wins**) and upserts via Prisma
5. Op status is updated: `applied`, `noop`, `conflict`, or `error`

---

## Adding a New Entity — Checklist

1. Add Prisma schema + run `pnpm db:generate`
2. Create `local/<entity>-idb.ts` (IndexedDB CRUD)
3. Create `server/<entity>.ts` (server functions with Prisma)
4. Create `actions/<entity>.ts` (read + write actions)
5. Register write actions in `actions/registry.ts`
6. Add a sync handler in `server/sync.ts`
7. Use `useDalQuery` / `useDalMutation` in your components

---

## Key Files

| File | Purpose |
|---|---|
| `core/types.ts` | Core interfaces: `DalAction`, `DalContext`, `SyncResult` |
| `core/define-action.ts` | Helper functions to create actions |
| `core/choose-backend.ts` | Backend selection: authed + online = remote, else local |
| `core/to-query-options.ts` | Converts actions to TanStack Query options |
| `actions/favorite-games.ts` | Example action set (list/favorite/unfavorite) |
| `actions/collected-items.ts` | Example action set (list/collect/uncollect) |
| `actions/registry.ts` | Central registry of all write actions |
| `hooks/use-dal-query.ts` | Read hook (`useDalQuery`, `useDalSuspenseQuery`) |
| `hooks/use-dal-mutation.ts` | Write hook with auto-enqueue |
| `hooks/use-dal-context-source.ts` | Provides `DalContext` (auth state, network, backend) |
| `server/favorite-games.ts` | Server functions for favorites |
| `server/collected-items.ts` | Server functions for collected items |
| `server/sync.ts` | Central sync endpoint + entity handlers |
| `server/require-user.ts` | Auth middleware for server functions |
| `local/favorite-games-idb.ts` | IndexedDB read/write for favorites |
| `local/local-db.ts` | IndexedDB schema and initialization |
| `queue/pending-ops.ts` | Pending ops queue (IndexedDB store) |
| `queue/sync-runner.ts` | Orchestrator for replaying pending ops |
| `queue/last-write-wins.ts` | Timestamp-based conflict resolution |
| `identity/anon-id.ts` | Generate/persist anonymous user IDs |
| `identity/use-effective-user-id.ts` | Hook: returns auth or anon ID |
