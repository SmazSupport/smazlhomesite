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

## Architecture & Hosting

This app lives inside the smazl.com website project (`smazlmedia/website/`) as
its own sub-folder. However, it will be served on its **own subdomain**:

- **`budget.smazl.com`** — behind Cloudflare Access (email OTP authentication)
- **`www.smazl.com`** must NOT be affected — that's the portfolio site
- Same Cloudflare Tunnel + Access pattern used for `media.postedus.com` and
  `dash.postedus.com` (see `smazlmedia/docs/ops/runbooks/remote-access.md`)

The parent Express server (`website/server.js`) currently serves the portfolio
and sub-apps (`/tasks/`, `/formjet/`, `/landing-page/`). The budget app could
either be added as another Express route or run as its own service — decision
to be made in Phase 3.

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

- **Phase 1 (Specs & Architecture): COMPLETE**
  - Data model spec (`docs/specs/data-model.md`): All obligations, income, accounts, runway, and scenarios defined.
  - Style & architecture guide (`docs/specs/style-guide.md`): Tech stack, server model (:3050 isolated container), mobile layout, and Linear/Vercel visual vibe locked in. Zero open decisions remaining.
- **Next Phase: Phase 2 (Data Entry) or Phase 3 (App Build)**
  - Ready for data entry of household numbers or direct scaffolding of the React+Express app.
