# Change Request Process

> How to propose, approve, and track new work on this project.

---

## When to Use This Process

- Adding new fields to the data model
- Changing how calculations work
- Adding a new feature or view
- Changing technology decisions
- Anything that affects the spec or master plan

---

## Steps

### 1. Document the Request
Write down what the user wants in plain language. Include:
- What they're asking for
- Why they need it
- Any examples they gave

### 2. Assess Impact
- Does this change the data model? Update `docs/specs/data-model.md`
- Does this add tasks? Update `docs/ops/master-plan.md`
- Does this conflict with existing design decisions?

### 3. Get Approval
Before implementing anything significant, confirm the plan with the owner (Mark).

### 4. Implement
- Follow the master plan task order
- Log changes in `docs/ops/changelog.md`
- Create a session log if the work is substantial

### 5. Update Docs
- Master plan (mark tasks done, add new ones)
- Data model (if changed)
- README (if project overview changed)
- AGENTS.md (if status or structure changed)
