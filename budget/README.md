# Budget — Household Financial Obligations Tracker

A system for mapping every financial obligation the household has, understanding
what money needs to come in, when bills actually hit, and what changes over time.

This is **not** a transaction analyzer or spending tracker. It is a forward-looking
obligations and cash-flow system. The goal is to answer:

- What does this household **need** each month?
- What is the **bare minimum** if income drops?
- Are we okay between now and the **next payday**?
- Which payments **disappear** over the next year?
- What happens if someone's income changes?

---

## Who This Is For

A multi-person household (Mark, Alex, Lisa) where income sources may change and
expenses need to be understood clearly — especially during transitions like job
changes.

---

## Where This Lives

This project is a sub-app of the smazl.com website (`smazlmedia/website/`).

- Code: `smazlmedia/website/budget/`
- URL: `budget.smazl.com` (own subdomain, behind Cloudflare Access)
- Parent site (`www.smazl.com`) is not affected

---

## Project Structure

```
website/budget/
├── AGENTS.md                        # Agent entry point — start here
├── README.md                        # This file
├── docs/
│   ├── specs/
│   │   ├── data-model.md            # Complete data model specification
│   │   └── style-guide.md           # Visual design decisions
│   ├── ops/
│   │   ├── master-plan.md           # Phased task list with status
│   │   ├── changelog.md             # Running log of every change
│   │   ├── change-request-process.md # How to propose and track new work
│   │   ├── runbooks/                # Step-by-step procedures
│   │   └── sessions/                # Per-session work logs
└── scripts/                         # Automation scripts (future)
```

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| Obligation | Anything that requires money: bills, loans, subscriptions, insurance, etc. |
| Income source | Any money coming in: paychecks, side income, irregular income |
| Account | Where money lives: checking, savings, credit cards |
| Normalized view | What the household costs per month on average (spreads quarterly/annual costs) |
| Cash-flow view | What actually leaves and enters accounts on specific dates |
| Scenario | A what-if simulation (income loss, early payoff, cutting optional expenses) |

---

## Current Status

**Phase: Data Model & Requirements** — defining what needs to be recorded and
what the system should calculate. No app or code yet.

See `docs/ops/master-plan.md` for the full plan.
