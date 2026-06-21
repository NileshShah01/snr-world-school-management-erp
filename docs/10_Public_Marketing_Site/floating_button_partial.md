# Floating Button Partial — `floating-button.html`

> **Type:** Partial — floating action buttons on right edge
> **CMS-Driven:** Yes (Gmail link, WhatsApp link)
> **Location:** `D:\Snredu\floating-button.html`
> **Plan ref:** `Plan/pages/partials/floating-button.md`
> **Date:** June 2026

---

## 1. Purpose

Floating action buttons on the right edge of all public pages. Quick access to Student Login, Gmail, Inquiry, and WhatsApp.

---

## 2. Current Working State

4 floating buttons with distinct colors:
1. **Student Login** → `portal/student-login.html` (blue)
2. **Gmail** → `data-school-field="gmailLink"` (red)
3. **Inquiry** → `/inquiry.html` (⚠️ MISSING) (yellow)
4. **WhatsApp** → `data-school-field="whatsappLink"` (green)

---

## 3. Gaps

| Gap | Severity | Detail |
|---|---|---|
| Inquiry → 404 | **P0** | Missing target page |
| Gmail link may be empty | P2 | If CMS doesn't set gmailLink |
| WhatsApp link may be empty | P2 | If CMS doesn't set whatsappLink |
| No Admin Login floating button | P2 | Missing |
| No phone click-to-call | P2 | Missing "Call School" |
| No tooltips | P3 | Icons only — not clear to all users |

---

## 4. Perfect Version

1. **Fix inquiry link** or remove button
2. **Add phone click-to-call** button
3. **Tooltips** on hover
4. **Admin Dashboard floating link** (when session detected)
5. **Fallback** — if gmailLink/whatsappLink empty, hide the button
