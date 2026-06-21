# Facilities Page — `facilities.html`

> **Type:** Public marketing — school facilities showcase
> **CMS-Driven:** Yes (hero, slider, gallery, facility descriptions)
> **Location:** `D:\Snredu\facilities.html`
> **Plan ref:** `Plan/pages/public/facilities.md`
> **Date:** June 2026

---

## 1. Purpose

Showcases school infrastructure: campus facilities, smart classrooms, sports, transport, security, and learning environment.

---

## 2. Current Working State

### Sections (7)
1. **Facility Hero** — CSS background image (Facilities-Slide-img1.jpeg)
2. **Title** — "Campus Life and Facilities"
3. **Auto-scrolling slider** — `#facilitiesSliderTrack` with 8 images, 40s CSS `slide` animation
4. **School Facilities hover grid** — 6 items (Smart Class, Computer Lab, Sports, CCTV, Transport, Playground)
5. **Facilities Gallery** — slider with 6 images
6. **Academic Strength stats bar** — animated counters
7. **Info cards** — 3 (Safe Campus, Learning Environment, Sports & Activities)

### Data Attributes
- `data-snr-media` — 15+ images (slider + gallery)
- `data-target` — stat counters

### Forms/CTAs
- "Contact School" → `contact.html`

---

## 3. Gaps & Mismatches

| Gap | Severity | Detail |
|---|---|---|
| Facilities grid hardcoded to 6 items | P2 | Not CMS-editable list; can't add new facility types |
| Facility images per item not CMS | P2 | Each facility has static images, not linked to CMS gallery |
| Slider uses CSS animation (40s) | P3 | Very slow; no manual navigation controls |
| No virtual tour | P3 | 360° photos or video walkthrough absent |
| No testimonial link to facilities | P2 | No "how facility helped" quotes tied to each facility |
| No capacity/area information | P3 | No specs (lab capacity, playground area, bus fleet size) |

---

## 4. Perfect Version

1. **CMS-driven facility list** — admin adds name, description, images per facility
2. **Facility-specific galleries** — each facility has its own photo album
3. **Interactive navigation controls** on slider (arrows + dots)
4. **Facility stats** (Smart Classrooms: 12, Computers: 40, Bus Fleet: 4, Playground: 2 acres)
5. **360° virtual tour** embed option
6. **Student/staff testimonials** linked to specific facilities
7. **Accessibility info** — ramp, elevator, disabled-friendly features
