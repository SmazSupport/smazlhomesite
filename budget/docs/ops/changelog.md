# Changelog — Household Budget

> Every change to the project gets logged here.
> If it's not in this log, it didn't happen.

---

## How to Log

Use this format for every entry. Copy the template, fill it in, add it at the TOP
of the log (newest first).

```markdown
### YYYY-MM-DD — Short description
- **What:** What was changed
- **Why:** Why it was changed
- **Files changed:** List of files modified
- **By:** Who/what made the change
```

---

## Log

### 2026-09-27 — Fixed stale docs; clarified actuals, auth, seed.json, and deployment details
- **What:** Updated AGENTS.md architecture section to reflect the locked decision (isolated :3050 container) instead of stale "TBD" language. Added actuals history table spec to data-model.md section 8 (each payment is its own row — enables trend, seasonal learning, accuracy tracking). Clarified Phase 2 uses `seed.json` for data entry before app exists. Expanded Phase 4 with container, CNAME, tunnel route, and Access tasks. Documented: Cloudflare Access allows all 3 household emails (same policy as media server), no in-app auth needed.
- **Why:** Another agent flagged stale text in AGENTS.md and asked clarifying questions about actuals storage, data entry workflow, and auth scope. All questions resolved.
- **Files changed:** `AGENTS.md`, `docs/specs/data-model.md`, `docs/ops/master-plan.md`, `docs/ops/changelog.md`
- **By:** Agent (Devin)

---

### 2026-09-27 — Visual design decisions locked (Linear/Vercel minimalist card aesthetic)
- **What:** Finalized Section 7 of `docs/specs/style-guide.md`. Locked in modern minimalist card layout (Linear/Vercel style) with high-contrast metrics, clean slate borders, and slide-over edit sheets. Marked Phase 1 complete in `master-plan.md`. Zero open decision items remaining in specifications.
- **Why:** Owner requested Devin's recommendation on visual style and layout approach.
- **Files changed:** `docs/specs/style-guide.md`, `docs/ops/master-plan.md`, `docs/ops/changelog.md`
- **By:** Agent (Devin)

---

### 2026-09-27 — Architecture, mobile design, and tech stack finalized
- **What:** Refined `docs/specs/style-guide.md` into a full Style & Architecture Guide. Locked in decisions:
  - **Server model:** Isolated Docker container on port 3050 (`budget.smazl.com`), completely decoupled from port 3000 (`www.smazl.com`).
  - **Tech stack:** React (Vite) + Tailwind CSS + Lucide icons frontend, lightweight Node/Express API backend.
  - **Data storage:** SQLite (`better-sqlite3`) for ACID durability + automated JSON snapshot exports on write for human readability/backups.
  - **Mobile:** First-class responsive UI (bottom nav, 2x2 KPI grid, vertical timeline cards, touch FAB for quick-entry).
  - **Only 1 open decision left:** Card-style (Linear/Vercel) vs dense spreadsheet view.
- **Why:** Provide clear engineering direction for any agent or developer building Phase 3 without ambiguity.
- **Files changed:** `docs/specs/style-guide.md`, `docs/ops/master-plan.md`, `docs/ops/changelog.md`
- **By:** Agent (Devin)

---

### 2026-09-27 — Moved into smazlmedia/website/budget/ + style guide
- **What:** Moved budget project from standalone `Dev-Projects/Budget/` into `smazlmedia/website/budget/` so it lives alongside the smazl.com site. Created `docs/specs/style-guide.md` with design decisions (inherit smazl.com fonts/colors, dashboard layout, financial status colors, tech stack options). Updated AGENTS.md with architecture/hosting notes. Updated parent smazlmedia AGENTS.md and README.md to reference the budget sub-project.
- **Why:** Owner wants budget app under the website project. Will be hosted at `budget.smazl.com` (own subdomain behind Cloudflare Access), not as a path on smazl.com.
- **Files changed:** All budget files relocated; `docs/specs/style-guide.md` (new); parent `AGENTS.md` + `README.md` updated
- **By:** Agent (Devin)

---

### 2026-09-27 — Project created with data model specification
- **What:** Cleared old transaction-analyzer Budget project. Created new project structure with AGENTS.md, README, master plan, changelog, change-request process, and complete data model specification covering obligations, income, accounts, calculated outputs, scenarios, and enumerations.
- **Why:** Owner wants a forward-looking household financial obligations system instead of backward-looking transaction analysis. Needed a clean foundation with proper agent-readable docs (same pattern as smazlmedia project).
- **Files changed:** All files (new project). Key: `AGENTS.md`, `README.md`, `docs/specs/data-model.md`, `docs/ops/master-plan.md`, `docs/ops/changelog.md`, `docs/ops/change-request-process.md`
- **By:** Agent (Devin)

---
