# Module 14: Website CMS

**Firebase Project:** `apex-public-school-portal`
**Status:** ✅ Live & Functional — SNR's STRONGEST differentiator, but has critical missing pages

---

## Purpose

Full 12-page public school website managed entirely from the admin dashboard. Bilingual (Hindi/English via i18n.js), multi-tenant (via `data-school-field`), with media resolution via `data-snr-media` attributes. CMS sections include hero slider, gallery with lightbox, staff directory, events, achievements, testimonials, and more.

---

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document | Usage |
|---|---|---|
| `cms` | `{sectionId}` | CMS content blocks (hero, intro, gallery, staff, holidays, events, testimonials, etc.) |
| `schools` | `{schoolId}` | School branding, theme colors, logo, banner |
| `media` | `{mediaId}` | Image/video assets referenced via `data-snr-media` |
| `students` | `{studentId}` | Achievement data (student of the month, academic toppers) |
| `staff` | `{staffId}` | Staff directory listing |
| `events` | `{eventId}` | Upcoming events on school.html |
| `holidays` | `{holidayId}` | Holiday list on school.html |

### JavaScript Files
| File | Path | Size | Role |
|---|---|---|---|
| `cms-admin.js` | `D:\Snredu\js\cms-admin.js` | 62.1 KB | Admin CMS dashboard: all section editors, image upload, theme settings, gallery management |
| `cms-settings.js` | `D:\Snredu\js\cms-settings.js` | 45.0 KB | CMS configuration: section visibility, banner settings, homepage layout |
| `media-loader.js` | `D:\Snredu\js\media-loader.js` | 9.3 KB | Resolves `data-snr-media` attributes to actual image/video URLs |
| `i18n.js` | `D:\Snredu\js\i18n.js` | 14.7 KB | Bilingual text rendering (Hindi/English) |
| `portal.js` | `D:\Snredu\js\portal.js` | — | Multi-tenant setup (`data-school-field` on header/footer/floating-button) |

### Public Pages (Portal)
| Page | Path | CMS Sections |
|---|---|---|
| `index.html` (homepage) | `D:\Snredu\portal\index.html` | Hero slider, school intro, theme/branding, global stats, achievements, testimonials, facilities |
| `about.html` | `D:\Snredu\portal\about.html` | School intro, page text, page imagery |
| `academics.html` | `D:\Snredu\portal\academics.html` | Page text, page imagery |
| `admissions.html` | `D:\Snredu\portal\admissions.html` | Admission status (open/closed), page text |
| `facilities.html` | `D:\Snredu\portal\facilities.html` | Facilities list, page imagery |
| `school.html` | `D:\Snredu\portal\school.html` | Events (upcoming), holidays, birthdays |
| `gallery.html` | `D:\Snredu\portal\gallery.html` | Gallery with lightbox |
| `staff.html` | `D:\Snredu\portal\staff.html` | Staff directory |
| `contact.html` | `D:\Snredu\portal\contact.html` | Contact form, map, page text |
| `achievements.html` | `D:\Snredu\portal\achievements.html` | Achievements, testimonials |
| `mandatory-disclosure.html` | `D:\Snredu\portal\mandatory-disclosure.html` | Page text |
| `student-dashboard.html` | `D:\Snredu\portal\student-dashboard.html` | Student dashboard controls |

### Key Functions
- `syncHeaderWithTenant()` — applies `data-school-field` branding to header/footer
- `renderCMSSection(sectionId)` — fetches CMS data from Firestore and renders to DOM
- `updateCMSBlock(sectionId, data)` — admin: saves CMS content to Firestore
- `resolveMedia(element)` — data-snr-media → actual URL via media-loader.js

---

## Gaps

| Priority | Gap | Details |
|---|---|---|
| **P0** | **inquiry.html MISSING** | All CTA buttons on 12 pages link to `inquiry.html` (e.g., "Inquire Now", "Apply Now") — returns 404. This breaks the primary conversion funnel. |
| **P0** | **6 "Under Construction" CMS modules** | Several CMS admin sections show placeholder "Under Construction" — no editor available |
| P2 | No CMS page editor | Admin cannot add or remove pages; page set is hardcoded to 12 |
| P2 | No media library view | Media uploads are file-picker only; no grid/browser view of all uploaded assets |
| P2 | No SEO settings per page | No meta title, meta description, or Open Graph tags per page |
| P2 | No blog/news module | No blog/noticeboard for publishing school news on the website |
| P3 | No form builder | Cannot create custom forms (e.g., transfer certificate request, alumni registration) |
| P2 | No analytics (page views) | No page-level view tracking; no way to measure which pages are visited |
| P2 | No scheduled publishing | Cannot schedule content to go live on a future date |
| P2 | No page draft/publish toggle | All edits go live immediately; no draft mode |

---

## Competitor Comparison

| Feature | SNR World | Education Desk | Fedena | Classe365 |
|---|---|---|---|---|
| Public Website CMS | ✅ Full 12-page site | ✅ Basic CMS | ❌ None | ❌ None |
| Bilingual (HI/EN) | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Multi-Tenant Branding | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Media Library | ⚠️ Partial (file upload, no grid) | ❌ No | ❌ No | ❌ No |
| Blog/News Module | ❌ No | ❌ No | ❌ No | ❌ No |
| SEO Controls | ❌ No | ❌ No | ❌ No | ❌ No |
| Inquiry Form | **❌ MISSING (404)** | ✅ Yes | ❌ No | ❌ No |

**SNR's CMS is unique in the ERP market** — it's actually a competitive advantage. No competitor offers a full public website managed from within the ERP. Fixing inquiry.html and the 6 pending modules would make this a category-defining feature.

---

## Perfect Version

1. **Fix inquiry.html (P0)** — build inquiry form with name, contact, class, message; store in Firestore `inquiries` collection; admin notification via portal
2. **Complete 6 "Under Construction" CMS modules** — audit and build the remaining editors
3. **Page editor** — admin can add, rename, reorder, or delete pages from the public site
4. **SEO manager** — per-page meta title, description, OG image, canonical URL, sitemap auto-generation
5. **Blog/news module** — write, schedule, publish posts with categories, tags, featured images
6. **Media library grid** — grid browser of all uploaded images/videos with search, filter by type, usage count
7. **Form builder** — drag-and-drop form builder with Firestore storage and email notification
8. **Analytics dashboard** — page views, popular pages, traffic sources, inquiry conversion funnel
9. **Draft/publish workflow** — edit pages in draft, preview, then publish
10. **Theme marketplace** — pre-built website themes that schools can install with one click
