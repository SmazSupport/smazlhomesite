# Style & Architecture Guide — Budget App

> Visual design, architecture, and tech decisions for the budget app.
> An agent building the UI and backend should follow this specification.

---

## 1. Architecture & Linux Server Deployment

### Server Model (Clean Isolation)
The budget app will run on the Ubuntu server as its **own isolated Docker container**, completely decoupled from `smazlsite` (port 3000).

```
[ User (Phone / Laptop) ]
           │
           ▼
[ Cloudflare Edge ]
           │  (Cloudflare Access: Email OTP protection)
           ▼
[ Cloudflare Tunnel (cloudflared) ]
           │
           ├── budget.smazl.com ──► localhost:3050 (budget container)
           └── www.smazl.com    ──► localhost:3000 (smazlsite portfolio - untouched)
```

### Why this server model:
1. **Zero risk to `www.smazl.com`**: The public portfolio is on port 3000. The budget app runs on port 3050. If the budget app crashes, updates, or restarts, `smazl.com` has zero downtime.
2. **Hidden & Secure**: Port 3050 is not published to the WAN. Only Cloudflare Tunnel routes `budget.smazl.com` to `localhost:3050`. Cloudflare Access blocks anyone without an approved email OTP before traffic ever hits the container.
3. **Data persistence**: Stored host-side at `/opt/docker/budget/data/` so container rebuilds never lose data.

---

## 2. Tech Stack Specification

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | React (Vite) + Tailwind CSS + Lucide Icons | Reactive state makes recalculations (monthly need, runway, timeline) instant as bills/income are edited. Tailwind makes responsive mobile layouts trivial. |
| **Backend API** | Node.js / Express (lightweight JSON REST API) | Matches the stack Mark already uses across `website/`. Fast, tiny memory footprint, easy to run in a slim Alpine/Node container. |
| **Data Storage** | SQLite (`better-sqlite3`) with automatic JSON snapshot backups | **Best of both worlds:** SQLite handles relational data (obligations, income, splits, accounts, actuals) safely with ACID guarantees (no corruption if server reboots during write). An automated hook exports a clean `backup.json` on every change for easy human reading and disaster recovery. |
| **Charts** | Recharts (lightweight SVG charts) | Clean, responsive, dark-mode native, no canvas blurriness on mobile retina screens. |

---

## 3. Visual Design & Theme (Inherited from smazl.com)

The budget app inherits smazl.com's core brand tokens so it feels like a private extension of Mark's ecosystem, tailored for dense financial data.

### Brand Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--bg-primary` | `#ffffff` | `#0f172a` (slate-900) | App background |
| `--bg-card` | `#f8f9fa` | `#1e293b` (slate-800) | Metric cards, tables, panels |
| `--bg-secondary` | `#e9ecef` | `#334155` (slate-700) | Hover states, pill badges |
| `--text-primary` | `#1a1a1a` | `#f1f5f9` (slate-100) | Primary headers, key numbers |
| `--text-secondary` | `#4a5568` | `#94a3b8` (slate-400) | Labels, table subtext |
| `--accent-primary` | `#3b82f6` (blue-500) | `#60a5fa` (blue-400) | Buttons, active tabs, primary links |
| `--accent-gradient`| `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | Header accents, brand highlights |
| `--border-color` | `#e2e8f0` | `#334155` | Card borders, dividers |
| Font Family | `'Inter', system-ui, sans-serif` | Same across entire site |

### Financial Status Palette

| State | Color Token | Light Hex | Dark Hex | When to Use |
|-------|-------------|-----------|----------|-------------|
| **Surplus / Positive** | `emerald` | `#10b981` | `#34d399` | Income events, surplus balance, loans paid |
| **Deficit / Shortfall** | `rose` | `#f43f5e` | `#fb7185` | Negative cash flow, missed target |
| **Caution / Seasonal Spike**| `amber` | `#f59e0b` | `#fbbf24` | Lumpy expenses due, estimated bills, winter gas |
| **Discretionary / Optional** | `violet` | `#8b5cf6` | `#a78bfa` | Non-essential subscriptions that can be cut |
| **Paid / Inactive** | `slate` | `#94a3b8` | `#64748b` | Cleared bills, expired loans |

---

## 4. Layout & Navigation Structure

Rather than one giant scrolling page, use a **tabbed dashboard** so mobile and desktop navigation are clean and scannable:

### Views / Tabs
1. **Dashboard (Overview)**
   - **Top KPI Cards**: Normal Monthly Need, Bare Minimum Need, Monthly Net Income, Safe Target Buffer.
   - **Runway & Alert Banner**: Current reserve runway (e.g. "11 months at current rate") and any high-expense warnings for the current/next month.
   - **Paycheck-to-Paycheck Timeline**: The next 30-45 days showing each paycheck deposit and bill deduction with projected bank balance after each event.
2. **Obligations (Bills & Expenses)**
   - Filterable table / card view (Housing, Utilities, Debt, Subscriptions, Insurance, etc.).
   - Quick filters: `All`, `Required Only`, `Discretionary`, `Upcoming this Month`.
   - Ability to click any bill to update "Last Actual Paid" or edit details.
3. **Income & Pay Schedules**
   - Active earners (Mark, Alex, Lisa), expected net pay, frequencies, next paydays.
   - 3-paycheck month tracker for biweekly pay.
4. **Debt & Drop-Off Timeline**
   - Timeline chart showing upcoming loan payoff dates (car loan, financing) and how monthly required cash drops over time.
5. **Scenarios (What-If Sandbox)**
   - Preset cards: "Lisa Between Jobs", "Lisa New Job @ $X", "Cut Discretionary", "Pay Off Car Early".
   - Shows diff side-by-side with current reality without altering real data.

---

## 5. Mobile / Responsive Requirements

Mobile is a **first-class requirement** (accessed on phones via Cloudflare Access):

- **Header / Navigation**: Top tab bar on desktop; bottom navigation bar with icons on mobile (`Overview`, `Timeline`, `Bills`, `Scenarios`).
- **KPI Summary Cards**: 4-column row on desktop (`grid-cols-4`); 2x2 grid on mobile (`grid-cols-2`) with touch-friendly cards.
- **Paycheck Timeline**: Desktop shows side-by-side calendar/table; mobile shows a compact vertical card feed with colored badges (`+$2,350` green, `-$180` slate) and running account balance.
- **Quick-Action FAB (Floating Action Button)**: On mobile, a bottom-right `+` button allows quick-logging an actual payment or adding an unexpected expense in under 5 seconds.
- **Tables on Mobile**: Dense multi-column tables automatically switch to responsive card list format on screens `< 640px` to eliminate awkward horizontal scrolling.

---

## 6. Minimalist Charts Specification

Keep charts focused and non-distracting:
1. **Cash-Flow Projection Line**: 30-day forecast line chart showing checking balance dips and recoveries between paydays.
2. **Upcoming 12-Month Expense Bar Chart**: Simple 12-bar chart showing month-by-month total obligations, with seasonal spikes (gas, car registration, holidays) highlighted in amber.
3. **Drop-Off Step Chart**: Step-down line showing monthly requirement decreasing as debt payoffs hit.

---

## 7. Open Decisions for Mark

There is only one remaining decision that is purely personal taste:

### `[DECISION NEEDED]`
- **Design Reference / Vibe**: Do you prefer a very clean, Apple-Health / Linear-style modern minimalist card look, or a denser data-table spreadsheet vibe (like Google Sheets / Airtable)?
  - *Default recommendation:* **Modern minimalist cards (Linear/Vercel style)** with clean typography and dense tabular modals when editing.
