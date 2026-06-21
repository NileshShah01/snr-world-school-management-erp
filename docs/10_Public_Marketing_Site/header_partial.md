# Header Partial — `header.html`

> **Type:** Partial — shared navigation header
> **CMS-Driven:** Yes (school branding, i18n)
> **Location:** `D:\Snredu\header.html`
> **Plan ref:** `Plan/pages/partials/header.md`
> **Date:** June 2026

---

## 1. Purpose

Shared top navigation bar for all public school pages: school logo, name, location, UDISE registration, nav menu, and portal CTAs.

---

## 2. Current Working State

### Content (39 lines)
- **Logo section** — `data-school-field="logoUrl"`, schoolName, schoolLocation, schoolUdiseReg
- **Mobile menu toggle** — responsive hamburger
- **Nav menu** — 8 links: Home, About, Academics, Admissions, Facilities, Gallery, Contact, Inquiry
- **Portal buttons** — Student Portal + Admin Login

### Data Attributes
- `data-school-field` — logoUrl, schoolName, schoolLocation, schoolUdiseReg
- `data-i18n`, `data-i18n-attr` — every nav link has EN/HI hooks

### CTAs
- "Student Portal" → `portal/student-login.html`
- "Admin Login" → `portal/admin-login.html`
- "Inquiry" → `inquiry.html` (⚠️ MISSING FILE)

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| Inquiry link → 404 | **P0** | Missing target page |
| No "Book Demo" link | P1 | No SaaS lead gen CTA in header |
| No WhatsApp contact button | P2 | No click-to-chat |
| No active link highlighting | P2 | Current page not highlighted |
| No sticky behavior on mobile | P2 | Header scrolls away on mobile |

---

## 4. Perfect Version

1. **Fix inquiry link** or remove
2. **Active page highlighting** with CSS class
3. **Sticky header** on scroll (mobile + desktop)
4. **Book Demo CTA** in nav (for snredu-erp context)
5. **WhatsApp icon** with click-to-chat
6. **Phone number** for click-to-call
