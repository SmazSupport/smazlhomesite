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
| 1.8 | Owner review and approval of data model | `TODO` | Mark to review and flag anything missing |
| 1.9 | Owner visual vibe confirmation | `TODO` | Confirm preference in style-guide.md section 7 |

---

## Phase 2: Data Entry

> Enter all known household obligations, income sources, and account balances.
> This can be done in a spreadsheet, JSON file, database, or whatever format the
> eventual app will use. The point is to get everything recorded.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Enter all known monthly bills (housing, utilities, internet, etc.) | `TODO` | |
| 2.2 | Enter all loan / debt payments (car, financing, credit cards) | `TODO` | |
| 2.3 | Enter all subscriptions (streaming, software, memberships) | `TODO` | |
| 2.4 | Enter all insurance payments | `TODO` | |
| 2.5 | Enter non-monthly / irregular expenses (annual, quarterly, seasonal) | `TODO` | |
| 2.6 | Enter all income sources with pay schedules | `TODO` | |
| 2.7 | Enter account balances | `TODO` | |
| 2.8 | Review for missing obligations (see data-model.md section 7) | `TODO` | |
| 2.9 | Tag variable/seasonal expenses with ranges | `TODO` | |

---

## Phase 3: App — Design & Build

> Build the actual application. Technology TBD — could be a web app, desktop
> app, or start as a CLI tool. Decision should be made at the start of this phase.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Choose technology stack | `DONE` | React + Tailwind (Vite), Express API, SQLite + auto JSON snapshots (see style-guide.md) |
| 3.2 | Implement data storage (database schema from data model) | `TODO` | |
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
| 4.1 | Set up subdomain (e.g. `budget.smazl.com`) | `TODO` | Must not affect www.smazl.com |
| 4.2 | Configure Cloudflare Tunnel route | `TODO` | Same pattern as media.postedus.com |
| 4.3 | Add Cloudflare Access authentication (email OTP) | `TODO` | |
| 4.4 | Test remote access end-to-end | `TODO` | |

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
