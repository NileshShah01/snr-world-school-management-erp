# `gallery.html` — Photo Gallery Page

## Purpose
- Public-facing visual proof of school life: events, sports, trips, celebrations.
- Drives emotional engagement ("I want my child to have this experience").
- Currently 9 category filters (Sports, Events, Museum, Science, Trip, Functions, Awards, Facilities, Others).

## File facts
- 321 lines, ~14 KB
- Has inline `<style>` for filter buttons, gallery cards, lightbox

## Scripts loaded
1. `/script.js`
2. Firebase 9.23.0 compat
3. `/js/firebase-config.js`
4. `/js/cms-settings.js`
5. Inline `openLightbox` / `closeLightbox` / `downloadImage` (lines 268-319)

## CMS-driven slots
| ID | Source | Purpose |
|---|---|---|
| `galleryHeaderTitle` / `Subtitle` | `settings/general` | Hero |
| `galleryFilters` (DOM, partially) | static + `cms/galleryCategories` | Filter buttons |
| `galleryDynamicGrid` (DOM) | `cms/galleryImages` (filtered by category) | Gallery cards |

## Hard-coded content
- 9 filter button categories (lines 225-233) — **hard-coded**, not CMS-driven
- "Loading school gallery..." placeholder (line 239)
- Lightbox markup (lines 244-254)

## Lightbox behavior
- `openLightbox(img)` — accepts HTML element or object `{src: ...}`
- `closeLightbox()` — hides lightbox, restores body scroll
- `downloadImage()` — fetches the image, creates blob, triggers download as `apex-gallery-{timestamp}.jpg`

## Gaps
- **Filter categories are hard-coded** (lines 225-233) — adding a new category requires editing this file
- **`downloadImage()` works for direct image URLs only** — fails on Cross-Origin (`no-cors` blob), so many CMS-loaded images may not download. Fallback is "open in new tab" but the experience is poor.
- **No lazy loading on filter-switched images** — re-rendering filters loads all images at once
- **No "All" filter button** — user must click a specific category to see anything
- **No infinite scroll / pagination** — if 200+ photos, page becomes huge
- **No alt text customization** — relies on `alt` attribute being set in CMS
- **No EXIF data stripping** — photos may leak location/device data. Important for DPDP compliance.
- **Lightbox doesn't show category/date/caption** — just the image
- **No share button** (WhatsApp/FB) — viral distribution blocked
- **No "Upload your photo" CTA for parents** — community engagement missed
- **`galleryCategories` collection in CMS likely doesn't exist** — this is aspirational

## Recommended plan
1. Move filter categories to `cms/galleryCategories` collection (id, label, order, visible).
2. Add an "All Photos" filter button (first in the list, always active by default).
3. Add pagination or "Load more" button (12 photos per page).
4. Add metadata strip to lightbox: category, date taken, photographer.
5. Add share buttons (WhatsApp, Facebook, copy link).
6. Strip EXIF data on upload (`js/image-storage.js` should use a server-side function, or warn in CMS).
7. Add "Upload" CTA for parents (creates a moderated queue in CMS).
8. Fix `downloadImage()` to handle CORS properly (proxy through Firebase Function or use `crossOrigin = "anonymous"` on `<img>`).
9. Add structured data (`ImageGallery` schema) for Google Images SEO.
10. Add keyboard navigation (← →) to lightbox.
