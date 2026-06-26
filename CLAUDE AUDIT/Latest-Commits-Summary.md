# Latest GitHub Commits — Apex Public School ERP Repo

## Summary

The repository has **two active branches** with different recency and completeness levels:

| Branch | Last Push | Days Old | Last Commit | Author |
|---|---|---|---|---|
| **`main`** (most complete SaaS build) | **2026-04-04 22:26:36 IST** | 20 days | "Fix: Remove Apex-specific default branding, use generic school logo" | Nilesh Shah |
| **`ERP-Full`** (GitHub default) | 2026-03-15 09:23:32 IST | 40 days | "feat: add ID card templates with corresponding CSS styles..." | Nilesh Shah |

---

## Latest Commit Details (`main` branch)

**Commit Hash:** `2c94a95837e8624028fca19058465cc3a44e62a5`

**Timestamp:** Saturday, April 4, 2026 at 10:26 PM IST (+0530)

**Author:** Nilesh Shah <nileshshah84870@gmail.com>

**Message:**
```
Fix: Remove Apex-specific default branding, use generic school logo
```

**Files Changed:** 1 file modified
- `M   portal/admin-login.html`

**What Changed:**  
The admin login page was updated to remove hardcoded "Apex Public School" branding and instead pull the school name and logo dynamically from the Firestore `schools` collection via the `applyAuthBranding()` function. This allows the same login page to work for any tenant school (SCH001, SCH002, etc.) without code changes — a key part of the multi-tenant SaaS pattern.

The branding function already existed in the codebase; this commit simply ensured the HTML template wasn't fighting it by hardcoding Apex-specific defaults. This is a classic SaaS pivot: "stop assuming every school is Apex."

---

## Development Activity Pattern

Looking at the commit history across both branches:

**`main` branch (last 20 commits / ~20 days):**  
Focused on **bug fixes and stabilization** — mostly focused on ID Card Generator syntax fixes, dropdown logic, menu name standardization, and image-caching issues. Not large feature additions, but steady cleanup work.

**`ERP-Full` branch (last 20 commits / ~40 days):**  
Focused on **feature additions** — ID card templates, admit card tools, admin panel expansions, CSS utility classes, gallery redesigns. The work is older and less actively maintained.

**Implication:** The repo has a clear active branch (`main`), and it's being actively developed, but the pace has slowed to mostly maintenance/fixes rather than new features — consistent with a product that's in stabilization/hardening phase rather than rapid feature velocity.

---

## Notable Absence: No Revert Commits

Both branches show a clean history with no "Revert" commits, suggesting:
- Either the developer is very careful with what gets committed (low churn, high confidence)
- Or this is a relatively young project without yet having hit major bugs that require reverting
- Or commits are being squashed/rewritten before push (which Git history can't tell)

---

## Related Context from Audit

This latest commit (removing Apex-specific defaults) is actually solving one of the issues flagged in the full audit: the logo path and school name hardcoding that made multi-tenant branding fragile. It shows the developer is actively addressing the multi-tenant surface area — this is the right direction for a SaaS product.

However, the **critical Firestore security rules** from Section 4 of the audit are not visible in the recent commit history, suggesting they haven't been tightened up yet. The route guards remain commented out. These remain blocking items for any real multi-tenant production deployment.
