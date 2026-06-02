# `platform.html` — SNR Edu ERP Marketing Landing Page

## Purpose
- Marketing/sales page for the SNR Edu ERP platform itself (not for a specific school).
- Targets potential tenants ("School owners looking to digitize").
- Links to: `portal/super-admin-pro.html` (Super Admin Core) and `https://apex-public-school-portal.web.app` (Demo School).

## File facts
- 130 lines, ~5 KB
- Single self-contained page (Tailwind CDN, no JS dependencies)
- No Firebase, no CMS

## Structure
- **Top nav**: SNR Edu ERP logo, links (Features, Solutions, "Super Admin Core" button)
- **Hero**: "Empower Your Institution with Intelligent ERP" + "Enterprise Edition" badge
- **3 feature cards**: Multi-Tenant CMS, Live Analytics, Secured Infrastructure
- **Final CTA**: "Launch Dashboard" → `portal/super-admin-pro.html`
- **Footer**: "© 2026 SNR Edu ERP Systems. All rights reserved."

## Hard-coded content
- All copy (no CMS)
- Brand name: "SNR Edu ERP"
- "Enterprise Edition" badge
- External link: `https://apex-public-school-portal.web.app` for demo (line 84)
- Internal link: `/portal/super-admin-pro.html`

## Gaps
- **No CMS** — every change requires a code deploy
- **No actual demo signup form** — "Launch Dashboard" jumps straight to super-admin-pro (no lead capture, no trial signup)
- **No pricing** — even a "Starting at ₹X/student/month" placeholder
- **No customer logos / testimonials** — no social proof
- **No feature comparison** — no "vs. Education Desk / Teachmint / Fedena" table
- **"Solutions" nav link is `href="#solutions"`** — no target on page (broken anchor)
- **"Features" nav link is `href="#features"`** — works (links to `#features` section at line 91)
- **Tailwind CSS is loaded via CDN** (`https://cdn.tailwindcss.com`) — production should compile locally for CSP compliance
- **No favicon, no og:image, no structured data**
- **Single CTA flow** — no secondary conversion (download brochure, book demo, contact sales)
- **No Hindi translation** — primary market is India
- **No screenshots / product mockups** — just text and emoji-free icons
- **Tailwind CDN is 1.4MB+ on first load** — heavy for a marketing page

## Recommended plan
1. Add a "Book Demo" form modal (email, school name, student count, phone) that writes to `demoRequests` collection.
2. Add a "Pricing" section: "Starting at ₹4/student/month" (recorded as roadmap idea — needs business validation first; flag for confirmation before publishing pricing).
3. Add a customer logo strip (even if placeholder: "Trusted by 50+ schools across Bihar & UP").
4. Add a feature comparison table (SNR vs. competitors from `market-research-2026.md`).
5. Add a 2-min product video (YouTube embed).
6. Fix the "Solutions" nav link (add a `#solutions` section or remove).
7. Add favicon, og:image, `application/ld+json` `SoftwareApplication` schema.
8. Add a Hindi language toggle (`?lang=hi`) — for NEP 2020 + rural reach.
9. Replace Tailwind CDN with a built bundle; remove unused utilities.
10. Add structured data + sitemap entry for `platform.html` (currently it's not in `sitemap.xml` if one exists).
11. Add `rel="noopener"` to the external demo link (already has `target="_blank"` only).
