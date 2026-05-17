# DAL Architecture Diagrams

## Read / Write Flow

How components read and write data — and how local writes get queued for sync.

```mermaid
flowchart TD
    C["Component"]

    subgraph H["Hooks"]
        Q["useDalQuery\nuseDalSuspenseQuery"]
        M["useDalMutation"]
        CTX["useDalContextSource\nDalContextGetter ref"]
    end

    subgraph BE["Backend Selection — chooseBackend()"]
        direction LR
        COND{"authed\n&&\nonline?"}
        REM["remote"]
        LOC["local"]
        COND -->|"yes"| REM
        COND -->|"no"| LOC
    end

    R[("Remote\nPostgres\nserver function")]
    L[("Local\nIndexedDB\nPrisma IDB")]

    subgraph SQ["Sync Queue"]
        EQ["enqueueOp()"]
        OPS[("toolkitsgg-pending-ops\nPendingOp[]")]
    end

    C -->|"read"| Q
    C -->|"write"| M
    Q --> CTX
    M --> CTX
    CTX -->|"useSession + useNetwork\n+ getOrCreateAnonUserId"| COND

    REM -.->|"read"| R
    LOC -.->|"read"| L
    REM -.->|"write — direct, no queue"| R
    LOC -.->|"write — IDB first"| L
    LOC -.->|"then enqueue"| EQ
    EQ --> OPS

    style R fill:#2d6a4f,color:#fff
    style L fill:#1d3557,color:#fff
    style OPS fill:#1d3557,color:#fff
```

---

## Sync Flow

How queued `PendingOp`s travel from IndexedDB to the server when the user comes online.

```mermaid
sequenceDiagram
    participant UI as UI / Sync Trigger
    participant SR as syncOps()
    participant IDB as PendingOp IDB
    participant SF as applyPendingOpServerFn
    participant SH as SyncHandler
    participant DB as Postgres
    participant LWW as compareTimestamps()

    UI->>IDB: listOps({ status: "pending" })
    IDB-->>UI: PendingOp[]
    UI->>SR: syncOps(ops, { resolveAction, onProgress })

    loop for each op — sequential to preserve causal order
        SR->>IDB: markStatus(id, "syncing")
        SR->>SF: action.sync(op)
        SF->>SF: requireUserId() + dedup check
        SF->>SH: handler(op, userId)
        SH->>DB: findUnique(userId, itemId)
        DB-->>SH: record | null
        SH->>LWW: compareTimestamps(record, op)
        LWW-->>SH: local-wins | server-wins | equal

        alt applied (local-wins, record absent)
            SH->>DB: create / delete
            SH-->>SR: { status: "applied" }
            SR->>IDB: markStatus(id, "synced")
        else noop (equal — already synced)
            SH-->>SR: { status: "noop" }
            SR->>IDB: deleteOp(id)
        else conflict (server-wins)
            SH-->>SR: { status: "conflict", serverRecordJson }
            SR->>IDB: markStatus(id, "conflict")
        else error
            SH-->>SR: { status: "error", message }
            SR->>IDB: markStatus(id, "failed", message)
        end
    end

    SR-->>UI: SyncAllReport { applied, conflicts, noops, errors, skipped }
```

---

## LWW Conflict Resolution

How `compareTimestamps()` decides whether a pending op should be applied, skipped, or treated as a conflict.

`op.serverUpdatedAt` is a snapshot of the server record's `updatedAt` captured **before** the local write. It acts as the baseline: if the server has moved past it by sync time, a concurrent writer won.

**Baseline tracking** is implemented for `collect` and `uncollect` actions via `getServerUpdatedAt`. Other actions (favorites, user-profile) use the fallback branch — add `getServerUpdatedAt` to their action definitions to upgrade them.

```mermaid
flowchart TD
    Start(["compareTimestamps(serverRecord, op)"])

    A{"server record\nexists?"}
    LW1["local-wins\napply the op"]

    B{"op.serverUpdatedAt\n(baseline) present?"}

    C{"serverTime\nvs baselineTime"}
    SW1["server-wins -> conflict\nanother writer committed\nafter this op was enqueued"]
    LW2["local-wins\napply the op"]
    EQ1["equal -> noop\nop already reflected\non server"]

    D{"opTime\nvs serverTime\n(fallback — action has no getServerUpdatedAt)"}
    SW2["server-wins -> conflict"]
    LW3["local-wins\napply the op"]
    EQ2["equal -> noop"]
    SW3["server-wins -> conflict\n(opTime unknown)"]

    Start --> A
    A -->|"null — no server record"| LW1
    A -->|"exists"| B

    B -->|"yes"| C
    B -->|"no — action has no getServerUpdatedAt"| D

    C -->|"server > baseline"| SW1
    C -->|"server < baseline"| LW2
    C -->|"server = baseline"| EQ1

    D -->|"opTime > serverTime"| LW3
    D -->|"opTime < serverTime"| SW2
    D -->|"opTime = serverTime"| EQ2
    D -->|"opTime null"| SW3
```

---

> _This documentation was generated with the help of AI, and reviewed and refined by a human._
