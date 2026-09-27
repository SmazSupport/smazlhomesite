# AGENTS.md — Budget / Household Financial Obligations

> **If you are an AI agent, start here.** This file tells you everything you need
> to know about this project, where to find information, and how to work on it.

---

## What is this project?

A household financial obligations tracker. The goal is to map every bill, loan,
subscription, and expense the household has — along with all income sources — so
the owner can answer questions like:

- What does the household need per month?
- What is the bare minimum if income drops?
- Which bills disappear over the next year?
- Are we okay between now and the next payday?
- What happens during a job transition?

This is **not** a transaction history or spending analyzer. It is forward-looking:
what obligations exist, what they cost, when they hit, and what income covers them.

---

## Quick Reference

| What | Where |
|------|-------|
| This project lives in | `smazlmedia/website/budget/` |
| Parent website project | `smazlmedia/website/` (smazl.com — Express + static) |
| Data model spec | `docs/specs/data-model.md` |
| Style guide | `docs/specs/style-guide.md` |
| Master plan | `docs/ops/master-plan.md` |
| Changelog | `docs/ops/changelog.md` |
| Change request process | `docs/ops/change-request-process.md` |
| Runbooks | `docs/ops/runbooks/` |
| Session logs | `docs/ops/sessions/` |
| Parent project AGENTS.md | `../../AGENTS.md` (smazlmedia server ops) |

---

## Household Members

| Person | Role |
|--------|------|
| Mark | Primary — manages this project |
| Alex | Household member |
| Lisa (mother-in-law) | Household member — potential job transition |

---

## Architecture & Hosting (DECIDED)

The budget app runs as its **own isolated Docker container** on port `:3050`,
completely decoupled from the portfolio site on port `:3000`. Source code lives
in `smazlmedia/website/budget/` but deployment is independent.

```
[ User (Phone / Laptop) ]
           │
    [ Cloudflare Access: Email OTP — mstevens@smazl.com, alexstevens@smazl.com, lisachir@aol.com ]
           │
    [ Cloudflare Tunnel (cloudflared on 192.168.68.70) ]
           │
           ├── budget.smazl.com ──► localhost:3050  (budget container)
           ├── www.smazl.com    ──► localhost:3000  (smazlsite — untouched)
           ├── media.postedus.com ──► localhost:5055 (Overseerr)
           └── dash.postedus.com  ──► localhost:3100 (Homepage dashboard)
```

### Key decisions (locked):
- **Server**: Same Ubuntu machine (192.168.68.70) as the media stack
- **Container port**: `:3050` — not published to WAN, only reachable via Cloudflare Tunnel
- **Tech stack**: React (Vite) + Tailwind CSS frontend, Node/Express REST API, SQLite (`better-sqlite3`) + automatic JSON snapshot backups
- **Auth**: Cloudflare Access only (email OTP, 3-user allow list). No in-app auth — the Express API is only reachable via `localhost:3050` on the server, so it's already locked down
- **Data persistence**: Host-side at `/opt/docker/budget/data/` so container rebuilds never lose data
- **`www.smazl.com` must NOT be affected** — completely separate container, zero coupling

---

## File Map

### Specifications
| File | Purpose |
|------|---------|
| `docs/specs/data-model.md` | **The spec.** Defines every field for obligations, income, accounts, and all calculated outputs. Read this before building anything. |
| `docs/specs/style-guide.md` | Visual design decisions — colors, fonts, layout direction. Update this before building UI. |

### Planning & Status
| File | Purpose |
|------|---------|
| `docs/ops/master-plan.md` | Phased task list with status. Check this first for what to work on. |
| `docs/ops/change-request-process.md` | How to propose, approve, and track new work |

### Logs
| File | Purpose |
|------|---------|
| `docs/ops/changelog.md` | Running log of every change |
| `docs/ops/sessions/` | Per-session work logs |

---

## How to Work on This Project

### Before making ANY change:

1. **Read `docs/specs/data-model.md`** — understand what data the system tracks
2. **Read `docs/specs/style-guide.md`** — understand the visual direction
3. **Read `docs/ops/master-plan.md`** — understand what phase we're in and what's next
4. **Check `docs/ops/changelog.md`** — see what was recently changed

### When making a change:

1. **Log every change** in `docs/ops/changelog.md` using the format defined there
2. **Create a session log** in `docs/ops/sessions/YYYY-MM-DD-description.md`
3. **Update `docs/ops/master-plan.md`** — mark tasks complete, add new ones discovered
4. **Update `docs/specs/data-model.md`** if the data model changed
5. **Update `README.md`** if the project overview changed

### When the user asks for something new:

Follow `docs/ops/change-request-process.md`:
1. Document what they want
2. Assess impact on the data model
3. Add tasks to the master plan
4. Get approval before executing

---

## Key Principles

1. **Record once, calculate everything else** — enter each obligation/income once, let the system derive monthly equivalents, future payment dates, totals, etc.
2. **Log everything** — if it's not in the changelog, it didn't happen
3. **Data model is the source of truth** — the spec defines what any app must implement
4. **Don't over-engineer** — this should be simple enough to actually maintain
5. **Keep docs current** — stale docs are worse than no docs
6. **Don't break smazl.com** — the portfolio site must remain unaffected

---

## Current Status (last updated: 2026-09-27)

- **Phase 1 (Specs & Architecture): COMPLETE** — zero open decisions.
- **Phase 2 (Data Entry)**: Not started. Will use a `seed.json` file matching
  the data model spec. The app imports this on first run to populate SQLite.
- **Phase 3 (App Build)**: Not started. Tech stack locked: React (Vite) +
  Tailwind CSS + Lucide, Express API, SQLite + auto JSON snapshots.
- **Phase 4 (Hosting)**: Not started. Isolated Docker container on `:3050`,
  `budget.smazl.com` via Cloudflare Tunnel + Access (3-user email OTP).

### Architecture clarifications (for agents):
- **Actuals are a history table**, not an overwrite. Each recorded payment is its
  own row (obligation_id, date, amount, notes). See data-model.md section 8.
- **No in-app auth.** Cloudflare Access handles authentication. The Express API
  is unauthenticated — it's only reachable via `localhost:3050` on the server.
- **Phase 2 and 3 can run in parallel.** Create `seed.json` for data entry while
  scaffolding the app. The app's first-run import reads `seed.json` into SQLite.
