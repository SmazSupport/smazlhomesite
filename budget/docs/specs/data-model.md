# Data Model Specification — Household Financial Obligations

> This is the single source of truth for what data the system tracks, what each
> field means, and what the system should calculate. Any app built from this
> project must implement this spec.

---

## Design Philosophy

**Record the raw fact once. Let the system calculate everything else.**

- Enter a bill with its amount, frequency, and next due date.
- The system calculates the monthly equivalent, annual cost, future payment
  dates, and cash-flow impact automatically.
- Don't make the user compute or re-enter derived information.

---

## 1. Obligations (Expenses / Bills)

An obligation is anything that requires money to leave the household. Every
recurring bill, loan payment, subscription, insurance premium, and regular
expense is an obligation.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Human-readable name (e.g. "Mortgage", "Duke Energy", "Netflix") |
| `category` | enum | See category list below |
| `amount` | decimal | The amount for one payment cycle |
| `amount_type` | enum | `actual` / `estimated` / `average` |
| `frequency` | enum | How often the payment occurs (see frequency list below) |
| `next_due_date` | date | When the next payment is due |
| `required` | boolean | Is this a necessity (`true`) or discretionary (`false`)? |
| `owner` | enum | Who this expense belongs to (see owner list below) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `cost_behavior` | enum | `fixed` / `variable` / `seasonal` — defaults to `fixed` |
| `start_date` | date | When this obligation began |
| `end_date` | date | When this obligation ends (loans, financing, contracts) |
| `remaining_balance` | decimal | Outstanding balance (loans, financing) |
| `interest_rate` | decimal | APR as a percentage (loans, credit cards) |
| `minimum_payment` | decimal | Minimum required payment if different from `amount` |
| `autopay` | boolean | Is this on autopay? Defaults to `false` |
| `paid_from` | string | Which account this comes out of (references an Account name) |
| `can_delay` | boolean | Can this be deferred short-term without penalty? Defaults to `false` |
| `notes` | string | Anything unusual or worth remembering |

### Variable / Seasonal Cost Detail

For obligations where `cost_behavior` is `variable` or `seasonal`, record
additional range information so the system can calculate realistic monthly
estimates instead of misleading averages.

| Field | Type | Description |
|-------|------|-------------|
| `typical_low` | decimal | Typical low-end amount (e.g. summer gas bill) |
| `typical_high` | decimal | Typical high-end amount (e.g. winter gas bill) |
| `seasonal_pattern` | object | Optional month-by-month expected amounts (see below) |

**Seasonal pattern example (natural gas):**

```json
{
  "jan": 220, "feb": 200, "mar": 150, "apr": 90,
  "may": 50,  "jun": 45,  "jul": 40,  "aug": 40,
  "sep": 50,  "oct": 80,  "nov": 140, "dec": 200
}
```

This lets the system show that January actually costs $220 even though the
annual average is $109/month. When calculating "expensive months," the seasonal
pattern matters more than the average.

---

## 2. Income Sources

An income source is any money entering the household. Paychecks, side income,
freelance work, recurring transfers, etc.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `person` | string | Who earns this (Mark, Alex, Lisa, etc.) |
| `source` | string | Description (e.g. "Woobles salary", "freelance", "rental income") |
| `expected_amount` | decimal | Expected take-home (net) per pay period |
| `amount_type` | enum | `fixed` / `variable` — is the paycheck always the same? |
| `pay_frequency` | enum | `weekly` / `biweekly` / `twice_monthly` / `monthly` / `irregular` |
| `next_payday` | date | The next expected pay date |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `typical_low` | decimal | Lowest expected amount (for variable income) |
| `typical_high` | decimal | Highest expected amount (for variable income) |
| `start_date` | date | When this income source started |
| `end_date` | date | When this income source ends (if known — e.g. contract, job loss) |
| `reliable` | boolean | Is this income dependable? Defaults to `true` |
| `deposited_to` | string | Which account this goes into (references an Account name) |
| `notes` | string | Any relevant details |

### Pay Schedule Notes

- **Biweekly** = every 2 weeks (26 pay periods/year). Two months per year have
  3 paychecks. The system should identify which months those are.
- **Twice monthly** = 1st and 15th, or similar fixed dates (24 pay periods/year).
  Different from biweekly.
- **Irregular** = no predictable schedule. The system should use the expected
  amount for projections but flag it as uncertain.

---

## 3. Accounts

An account is where money lives. The system needs to know starting balances to
calculate cash-flow projections and runway.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Account name (e.g. "PNC Checking", "Ally Savings", "Chase Visa") |
| `type` | enum | `checking` / `savings` / `credit_card` |
| `current_balance` | decimal | Current balance (positive for bank accounts, positive for credit card debt owed) |
| `is_emergency_fund` | boolean | Should this be counted as emergency/reserve money? Defaults to `false` |
| `notes` | string | Any relevant details |

### Credit Card Notes

For credit cards, `current_balance` is what is currently owed. If the household
pays credit cards in full each month (not carrying a balance), the card itself
is just a payment method — the obligations that run through it are tracked
separately. If carrying a balance with interest, it should also be entered as
an obligation with the minimum payment, interest rate, and remaining balance.

---

## 4. Enumerations

### Categories

These cover where money goes. Keep the list manageable — don't over-categorize.

| Category | Examples |
|----------|----------|
| `housing` | Mortgage/rent, HOA, property tax (if not escrowed), home insurance |
| `utilities` | Electric, gas, water, sewer, trash |
| `internet_phone` | Internet, cell phone plans, home phone |
| `transportation` | Car payment, car insurance, gas/fuel, registration, maintenance |
| `insurance` | Health, dental, vision, life, umbrella (not car or home — those go in their category) |
| `debt` | Credit card payments, personal loans, student loans, medical debt |
| `groceries` | Grocery stores, household supplies |
| `subscriptions` | Streaming, software, memberships, gym |
| `kids` | Childcare, school, activities, supplies |
| `pets` | Vet, food, supplies, insurance |
| `medical` | Copays, prescriptions, dental, regular medical expenses |
| `personal` | Clothing, haircuts, personal care |
| `household` | Home maintenance, repairs, furnishings, lawn care |
| `food_dining` | Eating out, fast food, coffee shops (distinct from groceries) |
| `savings` | Emergency fund contributions, retirement, planned savings |
| `gifts_holidays` | Birthdays, Christmas, holidays, gifts |
| `other` | Anything that doesn't fit above |

### Frequency

| Value | Meaning | Payments/Year |
|-------|---------|---------------|
| `weekly` | Every week | 52 |
| `biweekly` | Every 2 weeks | 26 |
| `twice_monthly` | 2x per month (e.g. 1st and 15th) | 24 |
| `monthly` | Once per month | 12 |
| `quarterly` | Every 3 months | 4 |
| `semi_annually` | Every 6 months | 2 |
| `annually` | Once per year | 1 |
| `one_time` | Single occurrence | 1 |

### Owner

Who the expense or income belongs to. This is not about who pays — it's about
whose life creates the expense.

| Value | Description |
|-------|-------------|
| `household` | Shared expense (mortgage, utilities, groceries, etc.) |
| `mark` | Mark's personal expense |
| `alex` | Alex's personal expense |
| `lisa` | Lisa's personal expense (mother-in-law) |
| `kids` | Children's expenses |

### Amount Type (Obligations)

| Value | Meaning |
|-------|---------|
| `actual` | This is the exact known amount (e.g. mortgage = $1,850.00) |
| `estimated` | Best guess — real amount may differ (e.g. water bill ~$110) |
| `average` | Calculated average of varying amounts (e.g. electric averages $165) |

---

## 5. Calculated Outputs

The system should derive all of the following automatically from the raw data
entered above. **The user should never have to calculate or enter these.**

### Per-Obligation Calculations

| Output | How to calculate |
|--------|-----------------|
| Monthly equivalent | `amount * (payments_per_year / 12)` — e.g. $60 quarterly Hulu = $20/month |
| Annual cost | `amount * payments_per_year` |
| Remaining payments | `remaining_balance / amount` (for loans/debt with end date) |
| Months until payoff | From `end_date` minus today |
| Next N payment dates | Generate from `next_due_date` + `frequency` |

### Per-Income Calculations

| Output | How to calculate |
|--------|-----------------|
| Monthly equivalent | `expected_amount * (pay_periods_per_year / 12)` |
| Annual income | `expected_amount * pay_periods_per_year` |
| Pay dates for next 3 months | Generate from `next_payday` + `pay_frequency` |
| Three-paycheck months | For biweekly pay: identify which months have 3 paydays |

### Household Summary Calculations

These are the core numbers the system should always show:

| Output | Definition |
|--------|------------|
| **Normal monthly need** | Sum of all obligations (monthly equivalents), including both required and optional. This is what the household lifestyle actually costs. |
| **Bare-minimum monthly need** | Sum of only `required = true` obligations (monthly equivalents). This is survival mode. |
| **Cash-flow this month** | Sum of actual payment amounts due this specific calendar month (not normalized). Includes quarterly/annual bills that happen to fall this month. |
| **Total monthly income** | Sum of all income source monthly equivalents |
| **Monthly surplus / shortfall** | Total monthly income minus normal monthly need |
| **Safe income target** | Normal monthly need + a buffer (suggest 10-15%) for unexpected expenses |
| **Upcoming expensive months** | Months where cash-flow exceeds the normalized average by a significant amount (quarterly, annual, seasonal bills stacking up) |

### Debt / Payment Drop-Off Timeline

For every obligation with an `end_date`, show:

```
Today:        $8,700/month needed
Jan 2027:     $8,510/month   (furniture financing ends)
Apr 2027:     $8,426/month   (phone financing ends)
Jun 2027:     $7,811/month   (car loan ends)
```

This answers: "When does financial pressure come off?"

### Cash-Flow / Paycheck-to-Paycheck View

This is the most operationally useful view. For a given date range, show a
timeline of money in and money out:

```
Oct 2  — Paycheck (Mark):        +$2,350    Balance: $3,100
Oct 3  — Mortgage:                -$1,850    Balance: $1,250
Oct 5  — Car payment:             -$525      Balance: $725
Oct 7  — Duke Energy:             -$180      Balance: $545
Oct 9  — Car insurance:           -$240      Balance: $305
Oct 16 — Paycheck (Mark):        +$2,350    Balance: $2,655
Oct 18 — Hulu (quarterly):        -$60       Balance: $2,595
Oct 20 — Spectrum Internet:       -$85       Balance: $2,510
Oct 22 — Water (estimated):      ~$110       Balance: $2,400
```

The system generates this from: starting account balance + income pay dates +
obligation due dates. It shows whether there's enough money in the account
*when each bill hits*, not just whether the monthly totals work out.

### Runway Calculation

If household income drops by $X, how many months can current cash and reserves
cover the shortfall?

```
Normal monthly need:               $8,700
Current reliable income:           $7,600  (Lisa's income removed)
Monthly shortfall:                 $1,100
Combined checking + savings:       $12,400
Runway:                            ~11 months
```

---

## 6. Scenarios

Scenarios are saved what-if simulations. They modify income or obligations
**without changing the real data** and show the impact.

### Scenario Structure

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Descriptive name (e.g. "Lisa job loss", "Pay off car early") |
| `description` | string | What this scenario represents |
| `adjustments` | array | List of changes to apply (see below) |

### Adjustment Types

| Type | Fields | Example |
|------|--------|---------|
| `remove_income` | `person` or `source` | Remove Lisa's income entirely |
| `modify_income` | `person` or `source`, `new_amount` | Lisa's new job = $2,500/month |
| `remove_obligation` | `name` | Cancel Netflix |
| `modify_obligation` | `name`, `new_amount` | Electric goes to $350 in winter |
| `add_obligation` | full obligation fields | New car payment starting March |
| `remove_all_optional` | — | Remove all `required = false` obligations |

### Example Scenarios

**"Lisa between jobs"**
- Remove Lisa's income
- Shows: new monthly shortfall, new bare minimum, runway with reserves

**"Lisa new job starting December"**
- Remove Lisa's current income
- Add new income: Lisa, $2,500/month, starting Dec 1
- Shows: gap months (Oct-Nov), new normal after December

**"Pay off car early"**
- Remove car payment obligation
- Reduce checking balance by remaining car loan balance
- Shows: new monthly need, freed-up cash flow

**"Cut all optional spending"**
- Remove all obligations where `required = false`
- Shows: bare minimum number, how much is freed up

---

## 7. Non-Monthly Expenses — Important Note

Many real expenses are not monthly but are easy to forget because they don't
show up on a regular billing cycle. These **must** be captured as obligations
with the correct frequency:

- Car registration (annual)
- Property taxes (if not escrowed — annual or semi-annual)
- HOA dues (monthly, quarterly, or annual)
- Annual subscriptions (Amazon Prime, domains, software licenses)
- School costs (annual, seasonal)
- Holiday / birthday spending (annual — estimate and spread)
- Vehicle maintenance (estimated annual — oil changes, tires, inspection)
- Vet visits (estimated annual)
- Home maintenance (estimated annual — HVAC service, gutter cleaning, etc.)
- Vacations (estimated annual)
- Insurance paid semi-annually or annually

The system should convert these to monthly equivalents for the normalized view
while preserving the actual payment dates and amounts for the cash-flow view.

A $1,200 annual expense is **$100/month** in the normalized view, even though
$100 doesn't leave the account every month. Both perspectives matter.

---

## 8. Three Perspectives on Every Amount

For any expense or income, the system should track or calculate three values:

| Perspective | Meaning | Example |
|-------------|---------|---------|
| **Expected** | What we think it will be | Gas bill: ~$90 |
| **Actual** | What it really was (updated after the fact) | Gas bill: $82.14 |
| **Normalized monthly** | What it represents spread across the year | Hulu quarterly $60 = $20/month |

- **Expected** is what gets used for projections and cash-flow forecasting.
- **Actual** gets entered after a bill arrives or paycheck lands — this refines
  accuracy over time and helps adjust future estimates.
- **Normalized monthly** is always calculated, never manually entered.

---

## 9. Data Entry Guidance

### What the user enters manually:
- Each obligation (one time, update amount/actual as needed)
- Each income source (one time, update actual amounts as received)
- Account balances (periodically, or after significant changes)
- Scenarios (as needed for planning)

### What the system calculates automatically:
- Monthly / annual equivalents
- Future payment dates
- Remaining payments on loans
- Cash-flow timelines
- Surplus / shortfall
- Runway
- Expensive months
- Drop-off timeline
- Scenario impacts

### Keeping it maintainable:
- Update actuals when bills arrive (optional but improves accuracy)
- Update account balances weekly or when something significant changes
- Review and adjust estimated amounts quarterly
- Add/remove obligations as life changes (new bill, paid off a loan, etc.)
