# Master Plan — Household Budget

> This is the source of truth for what needs to happen, in what order, and what's done.
> Update this file after every work session.

---

## Goal

Build a system that answers: **How much money does this household need, when does
it need it, and what happens when income changes?**

---

## Phase 1: Data Model & Requirements

> Define what the system tracks and what it calculates. No code.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Define obligation fields | `DONE` | `docs/specs/data-model.md` |
| 1.2 | Define income source fields | `DONE` | `docs/specs/data-model.md` |
| 1.3 | Define account fields | `DONE` | `docs/specs/data-model.md` |
| 1.4 | Define calculated outputs | `DONE` | `docs/specs/data-model.md` |
| 1.5 | Define scenario system | `DONE` | `docs/specs/data-model.md` |
| 1.6 | Define enumerations (categories, frequencies, etc.) | `DONE` | `docs/specs/data-model.md` |
| 1.7 | Create style & architecture guide | `DONE` | `docs/specs/style-guide.md` — tech stack, mobile design, and server model specified |
| 1.8 | Owner review and approval of data model | `DONE` | Data model specification complete (`docs/specs/data-model.md`) |
| 1.9 | Visual vibe and design decisions locked | `DONE` | Modern minimalist cards (Linear/Vercel style) selected in `style-guide.md` |

---

## Phase 2: Data Entry (via `seed.json`)

> Enter all known household obligations, income sources, and account balances
> into a `seed.json` file matching the data model spec. The app will import
> this file on first run to populate the SQLite database. This lets data entry
> happen now without waiting for the UI to be built.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Create `seed.json` schema/template matching data-model.md | `TODO` | |
| 2.2 | Enter all known monthly bills (housing, utilities, internet, etc.) | `TODO` | |
| 2.3 | Enter all loan / debt payments (car, financing, credit cards) | `TODO` | |
| 2.4 | Enter all subscriptions (streaming, software, memberships) | `TODO` | |
| 2.5 | Enter all insurance payments | `TODO` | |
| 2.6 | Enter non-monthly / irregular expenses (annual, quarterly, seasonal) | `TODO` | |
| 2.7 | Enter all income sources with pay schedules | `TODO` | |
| 2.8 | Enter account balances | `TODO` | |
| 2.9 | Review for missing obligations (see data-model.md section 7) | `TODO` | |
| 2.10 | Tag variable/seasonal expenses with ranges | `TODO` | |

---

## Phase 3: App — Design & Build

> React (Vite) + Tailwind CSS frontend, Node/Express API, SQLite backend.
> Runs as isolated Docker container on port :3050.
> See `docs/specs/style-guide.md` for full architecture and visual spec.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Choose technology stack | `DONE` | React + Tailwind (Vite), Express API, SQLite + auto JSON snapshots (see style-guide.md) |
| 3.2 | Implement data storage (SQLite schema from data model + seed.json import) | `TODO` | Include actuals history table |
| 3.3 | Build data entry / management UI | `TODO` | |
| 3.4 | Implement core calculations (monthly need, surplus, etc.) | `TODO` | |
| 3.5 | Build dashboard / summary view | `TODO` | |
| 3.6 | Build cash-flow / paycheck-to-paycheck view | `TODO` | |
| 3.7 | Build debt drop-off timeline view | `TODO` | |
| 3.8 | Implement scenario system | `TODO` | |
| 3.9 | Implement runway calculation | `TODO` | |

---

## Phase 4: Hosting & Access

> Deploy the app so it's accessible from anywhere (phone, other devices),
> without exposing it publicly.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Create Dockerfile and docker-compose.yml for budget container (:3050) | `TODO` | Host data at `/opt/docker/budget/data/` |
| 4.2 | Deploy container on Ubuntu server (192.168.68.70) | `TODO` | Must not affect www.smazl.com (:3000) |
| 4.3 | Set up `budget.smazl.com` subdomain (CNAME) | `TODO` | |
| 4.4 | Add Cloudflare Tunnel route: `budget.smazl.com` → `localhost:3050` | `TODO` | Same pattern as media.postedus.com |
| 4.5 | Add Cloudflare Access app (email OTP: Mark, Alex, Lisa) | `TODO` | Reuse existing 3-email policy |
| 4.6 | Test remote access end-to-end from phone | `TODO` | |

---

## Phase 5: Refinement

> Ongoing improvements after the base system is working.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | Add actual vs expected tracking over time | `TODO` | |
| 5.2 | Add "expensive months" warning view | `TODO` | |
| 5.3 | Add three-paycheck month identification | `TODO` | |
| 5.4 | Improve seasonal cost projections with real data | `TODO` | |
| 5.5 | Add notifications or alerts for upcoming large bills | `TODO` | |

---

## Status Key

| Status | Meaning |
|--------|---------|
| `TODO` | Not started |
| `IN PROGRESS` | Currently being worked on |
| `DONE` | Completed and verified |
| `BLOCKED` | Cannot proceed — see Notes |
| `SKIPPED` | Intentionally skipped — see Notes |

---

## Change History

| Date | What changed | By |
|------|-------------|-----|
| 2026-09-27 | Plan created; Phase 1 data model spec written | Agent (Devin) |
| 2026-09-27 | Moved into smazlmedia/website/budget/; added style guide; updated parent AGENTS.md + README | Agent (Devin) |
| 2026-09-27 | Fixed stale AGENTS.md architecture section; clarified actuals as history table in data model; Phase 2 uses seed.json; Phase 4 expanded with container + Access details; Cloudflare Access: 3-user allow list (Mark, Alex, Lisa) | Agent (Devin) |
