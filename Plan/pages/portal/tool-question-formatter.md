# `portal/tool-question-formatter.html` — ExamCraft AI Tool

## Purpose
- Standalone web tool for teachers to create professional exam papers.
- Two-pane editor: left = input form, right = live A4 preview.
- Includes **AI Question Extractor** (upload handwritten photos, AI transcribes them).
- Exports to PDF via `html2pdf.js` (CDN) or print.

## File facts
- 323 lines, 15.8 KB
- Loads `/js/tool-question-formatter.js` (310 lines)
- Tailwind CDN + Lucide icons
- A4 print stylesheet (lines 32-52)

## Scripts loaded
1. Firebase 9.22.1 compat (auth not used — Firestore only for storage?)
2. `html2pdf.js` (CDN) — for PDF export
3. `/js/firebase-config.js`
4. `/js/tool-question-formatter.js`

## Features
- **AI Extractor** (lines 100-127): Upload photos, click "Extract with AI" → button is disabled until photos are uploaded
- **General Info form** (lines 130-231): School name, branch, exam name, subject, class, full marks (default 40), time limit (default 2hrs), exam date
- **Section Builder** (lines 234-251): Add dynamic sections (e.g., Section A, Section B) with questions
- **Live A4 Preview** (right pane, line 274-311): Renders the formatted paper in real-time
- **Print** button (line 261) — uses `window.print()`
- **Download PDF** button (line 266) — uses `html2pdf.js`

## Print/PDF
- Print stylesheet hides all non-paper content
- PDF generated via `html2pdf.bundle.min.js` (line 318)
- Footer: "Generated via SNR World ExamCraft AI"

## AI Extractor gap
- **🔴 "Extract with AI" button is always disabled** (line 119: `disabled`) — there's no code in the HTML to enable it when files are uploaded
- The actual AI integration (Gemini / OpenAI / Cloud Vision) is presumably in `tool-question-formatter.js` but is not yet wired up
- This is a **promised-but-not-delivered** feature visible to users

## Gaps
- **🔴 AI Extractor is non-functional** — button is disabled, no upload handler in HTML, actual AI integration is unclear (likely TBD in JS file)
- **🔴 No API key configuration UI** — Gemini / OpenAI / etc. keys must be in environment or hard-coded (security risk if hard-coded)
- **🔴 Firebase loaded but purpose unclear** — likely for saving question bank, but no save button visible
- **🔴 No "Save Draft" or "Save to Question Bank"** — work is lost if browser closes
- **🔴 No "Open existing paper"** — must start from scratch every time
- **🔴 Print preview doesn't show the dynamic sections until they're built** — first-time users see only the header skeleton
- **🔴 No subject/section templates** — must add sections manually each time
- **🔴 No bilingual support** (Hindi/English questions)
- **🔴 No math equation rendering** (MathJax/KaTeX) — math/science questions can't be properly formatted
- **🔴 No image insertion in questions** — diagrams/figures not supported
- **🔴 No "Question Bank" or "Reuse Question"** — common questions must be re-typed
- **🔴 No page-break preview** — when sections overflow, users don't know until print
- **🔴 No watermark / school logo in PDF** — branded but not visually stamped
- **🔴 No "Answer Key" mode** — paper has questions but no separate answer sheet
- **`max-width` on the right pane** causes the A4 paper to be narrower than expected on wide screens
- **Tailwind CDN** — production should compile locally
- **No file size limit on photo uploads** — large multi-MB photos can hang the browser
- **No OCR fallback** for non-English handwritten text (Hindi, regional languages)
- **"Generated via SNR World ExamCraft AI" footer** is in the printed paper (line 308) — branding is hard-coded

## Recommended plan
1. **🔴 Implement the AI Extractor end-to-end** (Gemini Vision API or Cloud Vision) + add API key management.
2. **🔴 Add a "Save Draft" button** that writes to Firestore `questionPapers/drafts`.
3. **🔴 Add a "Question Bank" panel** — save frequently-used questions, drag into new papers.
4. **🔴 Add bilingual support** (Hindi + English) using `lang` attribute on questions.
5. **Add math rendering** (KaTeX via CDN) for science/math questions.
6. **Add image insertion** in questions (via `image-storage.js` Base64).
7. **Add an "Answer Key" mode** — toggle between Question Paper and Answer Sheet layouts.
8. **Add page-break preview** in the editor (live A4 boundaries).
9. **Add school logo to the printed header** (from CMS, current tenant).
10. **Add subject/section templates** (predefined structures for Math, English, Science).
11. **Remove Tailwind CDN** — compile locally.
12. **Add file size + count limits** on photo uploads (e.g., 5 photos, 2 MB each).
13. **Add structured data** + share preview for completed papers.
14. **Add an "Open existing paper" file picker** to resume work.
