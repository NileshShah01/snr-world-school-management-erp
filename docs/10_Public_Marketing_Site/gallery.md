# Gallery Page — `gallery.html`

> **Type:** Public marketing — photo gallery
> **CMS-Driven:** Yes (all images via `cms-settings.js`)
> **Location:** `D:\Snredu\gallery.html`
> **Plan ref:** `Plan/pages/public/gallery.md`
> **Date:** June 2026

---

## 1. Purpose

School photo gallery with category filtering, lightbox preview, and image download.

---

## 2. Current Working State

### Sections (4)
1. **Page header** — CMS-driven title
2. **Filter buttons** — 9 categories (Sports, Events, Museum, Science, Trip, Functions, Awards, Facilities, Others)
3. **Dynamic photo grid** — `#galleryDynamicGrid` populated from CMS
4. **Lightbox modal** — `#lightbox` with close, download via fetch-blob

### Data Attributes
- `data-filter` — category filter buttons
- `loading="lazy"` — native lazy loading on images

### Forms/CTAs
- **None** — view-only page
- Lightbox **download button** — downloads image via fetch-blob

### Working Logic
```
Page load → cms-settings.js loads gallery from Firestore
  → Images rendered in #galleryDynamicGrid
  → Category filter buttons toggle visibility (data-filter)
Click image → lightbox opens with full-size image + category badge
  → Download button fetches dataUri → creates blob → triggers download
```

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| Filter buttons hardcoded to 9 categories | P2 | Not CMS-driven; can't add new categories |
| No pagination | P3 | Large galleries (100+ photos) will be slow to load |
| No video support | P3 | No YouTube/Vimeo embed for school videos |
| No album grouping | P3 | All photos flat in one grid; no album hierarchy |
| Lightbox lacks navigation arrows | P3 | Can't swipe prev/next — must close and click next image |
| Download function not optimized for large Base64 | P3 | Large Base64 URIs cause memory pressure in fetch-blob |

---

## 4. Competitor Comparison

| Feature | SNR WORLD | Education Desk | Fedena |
|---|---|---|---|
| Category filtering | ✓ (9 static) | ✓ | ✓ |
| Lightbox | ✓ | ✗ | ✗ |
| Download | ✓ | ✗ | ✗ |
| Video embed | ✗ | ✗ | ✗ |
| Album organization | ✗ | ✗ | ✓ |
| Image lazy loading | ✓ | ✗ | ✗ |

**Upper Hand:** Lightbox + download is unique. Category filtering is standard. CMS-driven gallery means admin can add photos without touching HTML.

---

## 5. Perfect Version

1. **Album hierarchy** (Year → Event → Photos) with navigation
2. **CMS-driven categories** — admin adds/removes filter categories
3. **Video tab** — YouTube/Vimeo embeds alongside photos
4. **Lightbox with swipe navigation** (prev/next with keyboard support)
5. **Infinite scroll/pagination** for large galleries
6. **EXIF data display** (date taken, camera) if available
7. **Social share buttons** per photo
8. **Admin badge** — "Photos: 42" shown to admin only
