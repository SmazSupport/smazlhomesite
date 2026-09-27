# Style Guide — Budget App

> Visual design decisions for the budget app. An agent building the UI should
> follow this file. Update it whenever design preferences change.
>
> **Owner:** Fill in or change anything marked with `[DECISION NEEDED]` below.

---

## Baseline: Inherit from smazl.com

The budget app should feel like it belongs to the same family as smazl.com, but
use a dashboard-oriented layout (cards, tables, summary numbers) rather than the
portfolio's page-based layout.

### From smazl.com (keep these)

| Element | Value | Notes |
|---------|-------|-------|
| Font family | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | Same as portfolio |
| Dark/light theme | Support both via `data-theme` attribute | Same toggle pattern |
| Accent primary | `#3b82f6` (blue) | Light mode |
| Accent primary (dark) | `#60a5fa` | Dark mode |
| Accent secondary | `#8b5cf6` / `#a78bfa` (purple) | Gradients, highlights |
| Accent gradient | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | Headers, accents |
| Border color | `#e2e8f0` (light) / `#334155` (dark) | Cards, dividers |
| Border radius | Consistent rounding on cards and buttons | Match portfolio feel |

### Budget-specific (dashboard style)

| Element | Value | Notes |
|---------|-------|-------|
| Layout | Dashboard with cards/panels | Not a single-page scroll like the portfolio |
| Primary view | Summary numbers at top, detail below | Like a financial dashboard |
| Typography scale | Larger numbers for key figures ($8,700/mo) | Financial data should be scannable |
| Status colors | Green = surplus/good, Red = shortfall/warning, Yellow = caution | Standard financial convention |
| Tables | Clean, compact, alternating row shading | Lots of tabular data in this app |
| Charts | `[DECISION NEEDED]` — bar charts? line charts? minimal or detailed? | For monthly trends, cash flow, etc. |

---

## Color Palette (extending smazl.com)

### Status / Financial Colors

These are additions specific to a financial app:

| Purpose | Light Mode | Dark Mode | Notes |
|---------|-----------|-----------|-------|
| Positive / surplus | `#22c55e` (green-500) | `#4ade80` (green-400) | Money available, on track |
| Negative / shortfall | `#ef4444` (red-500) | `#f87171` (red-400) | Over budget, deficit |
| Warning / caution | `#f59e0b` (amber-500) | `#fbbf24` (amber-400) | Close to limit, estimated |
| Neutral / info | `#3b82f6` (blue-500) | `#60a5fa` (blue-400) | Informational, same as accent |
| Muted / inactive | `#94a3b8` (slate-400) | `#64748b` (slate-500) | Ended obligations, past dates |

`[DECISION NEEDED]` — Are these colors okay or do you want different ones?

---

## Layout Direction

### Dashboard Sections (suggested order)

1. **Top summary bar** — Monthly need, income, surplus/shortfall, bare minimum
2. **Cash-flow timeline** — Upcoming bills and income events
3. **Obligations list** — All bills/expenses, filterable by category
4. **Income sources** — All income, pay schedule
5. **Debt drop-off timeline** — When payments end
6. **Scenarios** — What-if simulations
7. **Accounts** — Current balances

`[DECISION NEEDED]` — Does this order make sense? Would you rearrange anything?

---

## Mobile / Responsive

`[DECISION NEEDED]` — How important is mobile?

| Option | Description |
|--------|-------------|
| Mobile-first | Design for phone screens first, scale up to desktop |
| Desktop-first | Design for desktop/laptop, make it usable on phone |
| Desktop-only | Don't worry about phone layout for now |

Recommendation: **Desktop-first** with basic phone usability, since this is a
data-heavy dashboard. But the Cloudflare Access subdomain means you'll hit it
from your phone sometimes.

---

## Tech Stack Preferences

`[DECISION NEEDED]` — These affect how the app gets built in Phase 3.

| Decision | Options | Notes |
|----------|---------|-------|
| Frontend framework | Plain HTML/CSS/JS, React, Vue, Svelte | Portfolio uses plain HTML/JS — keep it simple? |
| Data storage | JSON file, SQLite, PostgreSQL | JSON is simplest, SQLite for queries, Postgres if hosting separately |
| Server | Add routes to existing Express server, or own service | Adding to Express is simpler but couples it to the portfolio |

Recommendation: Start with plain HTML/CSS/JS + JSON file (like the `/tasks/` app
already does on smazl.com). Upgrade to a database later if needed.

---

## Design References

`[DECISION NEEDED]` — If you've seen a dashboard or financial app whose look you
like, paste a link or describe it here. This helps an agent match your taste.

Examples of the general vibe (not endorsements, just style references):
- Mint.com summary page
- YNAB (You Need A Budget) dashboard
- Notion financial tracker templates
- Simple bank account overview screens

Preferred reference: _______________

---

## Things to Avoid

- Don't make it look like a banking app (too sterile)
- Don't over-animate — this is for reading numbers quickly
- Don't use tiny fonts for financial figures — they need to be scannable
- Don't hide important numbers behind clicks — key figures should be visible immediately
