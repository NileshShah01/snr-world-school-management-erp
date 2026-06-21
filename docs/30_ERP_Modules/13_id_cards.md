# Module 13: ID Card Generator

**Firebase Project:** `apex-public-school-portal`
**Status:** ✅ Live & Functional — SNR's STRONGEST differentiator

---

## Purpose

Generate premium, print-ready CR80-format ID cards (54mm x 86mm) for students with photo, barcode, and school branding. Supports individual and bulk generation with 13+ professionally designed templates.

---

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document | Usage |
|---|---|---|
| `students` | `{studentId}` | Student name, class, roll, photo URL, batch, parent info |
| `schools` | `{schoolId}` | School name, logo URL, address, branding (theme colors) |

### JavaScript Files
| File | Path | Size | Role |
|---|---|---|---|
| `erp-id-cards.js` | `D:\Snredu\js\erp-id-cards.js` | 19.9 KB | ID card generation engine: student selection, template rendering, print layout, bulk mode |
| `id-card-templates.js` | `D:\Snredu\js\id-card-templates.js` | 66.1 KB | 13+ template definitions: teal-amber, corp-blue, wave-dark, curve-primary, stark-modern, plus variants |
| `id-cards.css` | `D:\Snredu\css\id-cards.css` | 3.8 KB | Base card layout, CR80 sizing, print media queries |
| `id-card-premium.css` | `D:\Snredu\css\id-card-premium.css` | 1.4 KB | Premium template styles (wave-dark, curve-primary, stark-modern) |

### Key Functions
- `generateIDCard(studentId, templateName)` — renders single card
- `generateBulkIDCards(classId, templateName)` — batch generation for entire class
- `printIDCards(cardElements)` — triggers browser print dialog with CR80 dimensions
- `renderTemplate(templateName, studentData)` — applies template-specific CSS classes and layout

### Portal Pages
| Page | Path |
|---|---|
| ID Card Generator | `D:\Snredu\portal\id-cards.html` (if exists) |

---

## Gaps

| Priority | Gap | Details |
|---|---|---|
| P2 | No student self-photo upload | Students cannot upload own photo; must be added by admin |
| P2 | No QR code for attendance/entry | Card lacks QR encoding student UID for scan-based attendance or gate entry |
| P3 | No expiry date on card | No printed/embedded expiry date; cards are perpetual |
| P2 | No digital ID card for mobile | No mobile wallet pass or downloadable digital card (PDF only) |
| P3 | No parent ID card generation | Parents cannot receive a separate guardian ID card |
| P2 | No staff-only card variant | Staff cards use same templates; no distinct staff designation styling |
| P3 | No card reprint tracking | No logging of reprints, no "lost card" workflow |
| P2 | No barcode/QR live preview | Barcode preview not shown before print |
| P3 | No bulk download as ZIP | User must print each card; no packaged digital download |

---

## Competitor Comparison

| Feature | SNR World | Education Desk | Fedena | Classe365 |
|---|---|---|---|---|
| ID Card Generation | ✅ Yes | ✅ Basic | ✅ Basic | ✅ Basic |
| Number of Templates | **13+** | 1–2 | 2–3 | 1–2 |
| CR80 Print Format | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Photo + Barcode | ✅ Yes | ✅ Photo only | ✅ Yes | ✅ Basic |
| Bulk Generation | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Mobile Digital Card | ❌ No | ❌ No | ❌ No | ❌ No |
| QR Attendance Integration | ❌ No | ❌ No | ❌ No | ❌ No |
| Parent/Staff Variants | ❌ No | ❌ No | ❌ No | ❌ No |

**SNR leads significantly** — 13 templates is unmatched in the market. The CR80 print-ready format with professional designs (teal-amber, wave-dark, curve-primary, stark-modern) sets SNR apart from all competitors.

---

## Perfect Version

1. **Self-service photo upload** via portal (student/parent upload with admin approval)
2. **QR code** on every card encoding `schoolId|studentId|batch` for attendance scanning and gate entry
3. **Expiry date** field with configurable validity period (annual/semester)
4. **Digital ID card** — download as mobile wallet pass (Apple Wallet / Google Pay) or shareable link
5. **Parent ID card** variant with guardian name, relation, and student reference
6. **Staff ID card** variant with designation, department, employee code
7. **Reprint tracker** — log reprints with reason, date, fee (if chargeable)
8. **Bulk ZIP download** — generate all cards in class/section as individual PNGs in a zip
9. **Template editor** — drag-and-drop card designer to let schools customise layout
10. **Card access control** — use QR scan for library, bus, and gate entry (integrate with module)
