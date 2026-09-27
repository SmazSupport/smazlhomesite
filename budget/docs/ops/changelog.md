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
