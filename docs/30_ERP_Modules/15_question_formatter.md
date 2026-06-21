# Module 15: Question Paper Formatter (ExamCraft AI)

**Firebase Project:** `apex-public-school-portal`
**Status:** ⚠️ Partial — Works as manual formatter; AI extraction is disabled

---

## Purpose

Section-based question paper builder with A4 print-styled preview, PDF download via jsPDF, and school-branded headers. The headline feature — AI-powered question extraction from uploaded documents — is DISABLED (no Gemini API key configured).

---

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document | Usage |
|---|---|---|
| `schools` | `{schoolId}` | School name, logo for paper header branding |

### JavaScript Files
| File | Path | Size | Role |
|---|---|---|---|
| `tool-question-formatter.js` | `D:\Snredu\js\tool-question-formatter.js` | 11.6 KB | Question formatter engine: section management, question entry, A4 layout, PDF generation |
| `i18n.js` | `D:\Snredu\js\i18n.js` | 14.7 KB | Bilingual labels (Hindi/English) |
| `portal.js` | `D:\Snredu\js\portal.js` | — | Multi-tenant sync via `syncHeaderWithTenant()` |

### Portal Pages
| Page | Path |
|---|---|
| Question Formatter | `D:\Snredu\portal\tool-question-formatter.html` | 16 KB |

### Key Functions
- `syncHeaderWithTenant()` — applies school branding to paper header (logo, name, address)
- `addSection(sectionName, marks)` — adds a question section (e.g., "Section A: 20 marks")
- `addQuestion(sectionId, questionText, marks)` — adds question under a section
- `generatePDF()` — exports the paper to A4 PDF using jsPDF
- `printPreview()` — renders A4-styled preview for browser print
- `extractWithAI()` — **DISABLED** — intended to extract questions from uploaded Word/PDF documents via Gemini API

### Current Features (Working)
- Manual question entry with sections
- A4 print-styled preview
- PDF download via jsPDF
- School branding in header
- Section-wise marks breakdown
- Total marks auto-calculation

---

## Gaps

| Priority | Gap | Details |
|---|---|---|
| **P0** | **AI EXTRACTION DISABLED** | The `extractWithAI()` function is written but behind a dead API key check. This is the main selling point — without it, the tool is a simple text editor. |
| P2 | No question bank | No persistent storage of questions; all data is in-memory and lost on refresh |
| P2 | No answer key | Can't attach model answers or marking scheme to each question |
| P2 | No grading rubric | No rubric editor for subjective questions |
| P2 | No question type variety | Limited to text questions; no MCQ, true/false, match-the-following, diagram questions |
| P3 | No math formula support | No LaTeX or MathML rendering for mathematical expressions |
| P3 | No question pool | Cannot create a pool of questions and draw randomly for each paper |
| P2 | No blueprint editor | No design for weightage (chapter-wise, difficulty-wise distribution) |
| P2 | No previous years | No archive of previously generated papers |
| P2 | No collaboration | Single-user tool; no teacher collaboration on paper setting |

---

## Competitor Comparison

| Feature | SNR World | Education Desk | Fedena | Classe365 |
|---|---|---|---|---|
| Question Formatter | ✅ Manual only | ❌ No | ✅ Basic manual | ✅ Basic manual |
| AI Question Extraction | ✅ **Built but DISABLED** | ❌ No | ❌ No | ❌ No |
| Question Bank | ❌ No | ❌ No | ✅ Yes | ❌ No |
| Answer Key | ❌ No | ❌ No | ✅ Yes | ❌ No |
| PDF Export | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| Math Formula Support | ❌ No | ❌ No | ❌ No | ❌ No |
| Blueprint Editor | ❌ No | ❌ No | ❌ No | ❌ No |

**When functional, this is a unique differentiator.** No competitor has AI-powered question extraction. The manual formatter alone matches but does not exceed Fedena/Classe365.

---

## Perfect Version

1. **Enable AI extraction (P0)** — integrate Gemini API (or OpenAI/Claude) to extract questions from uploaded PDF/Word/image files and auto-populate sections
2. **Question bank** — persistent Firestore collection storing all created questions with tags (class, subject, chapter, difficulty, type)
3. **Answer key** — attach model answers per question; toggle answer key visibility in final PDF
4. **Grading rubric** — per-question rubric with criteria, levels, and marks
5. **Question types** — MCQ (single/multi), true/false, fill-in-the-blank, match-the-following, diagram-based, comprehension passage
6. **Math formula support** — LaTeX/MathML renderer for mathematical notation in questions
7. **Question pool + auto-generation** — create pools by topic/difficulty; auto-generate balanced papers with blueprint weightage
8. **Blueprint editor** — visual marks distribution across chapters, difficulty levels, and question types
9. **Previous years archive** — searchable archive of all generated question papers by class, subject, year
10. **Collaboration** — share draft paper with other teachers; comments and version history
