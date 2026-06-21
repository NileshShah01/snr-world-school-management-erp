# ExamCraft AI — `portal/tool-question-formatter.html`

> **Type:** Portal — AI-powered question paper formatter
> **Location:** `D:\Snredu\portal/tool-question-formatter.html`
> **Script:** `D:\Snredu\js\tool-question-formatter.js` (11.6 KB)
> **Plan ref:** `Plan/pages/portal/tool-question-formatter.md`
> **Date:** June 2026

---

## 1. Purpose

Question paper creation tool with AI extraction (Gemini Vision), manual section editing, image upload, and PDF download. Positions as "ExamCraft AI" — one of SNR's key differentiators.

---

## 2. Current Working State

### Features
1. **Header** — syncs with school name via `syncHeaderWithTenant()`
2. **Sections** — add/edit/delete sections with marks, questions, instructions
3. **Image upload** — supports question-paper images (Base64)
4. **AI Extract button** — **DISABLED** (no Gemini API key configured)
5. **PDF Download** — jsPDF-based A4-formatted question paper
6. **Print-styled A4 preview**

### Working Logic
```
Page load
  → AuthGuard.requireAuth() (teacher/admin)
  → syncHeaderWithTenant() → school name, logo in header
Manual mode:
  → Add section (name, marks, instructions)
  → Add questions to each section
  → Preview rendered question paper
AI mode (DISABLED):
  → Upload image of question paper
  → Click "Extract with AI"
  → [Should call Gemini Vision API → parse text → populate sections]
  → Currently shows "AI Extraction Coming Soon"
Output:
  → PDF download via jsPDF
  → Print via window.print()
```

---

## 3. Gaps

| Gap | Severity | Detail |
|---|---|---|
| **AI extraction disabled** | **P0** | Main selling point — not functional |
| **No Gemini API key configured** | **P0** | No key in code or env |
| **No question bank integration** | P2 | Cannot save/load questions from a library |
| **No answer key generation** | P2 | No separate answer key PDF |
| **No grading rubric** | P2 | No rubric/auto-grading support |
| **No question type variety** | P2 | Only text questions — no MCQ, true/false, match, fill-in-blank |
| **No math formula support** | P3 | No LaTeX/MathJax/Katex rendering |
| **No question pool** | P3 | Can't create question pool and randomize per exam |

---

## 4. Competitor Comparison

| Feature | SNR WORLD | Education Desk | Fedena | Classe365 |
|---|---|---|---|---|
| AI question extraction | ✗ (disabled) | ✗ | ✗ | ✗ |
| Manual question paper builder | ✓ | ✓ | ✓ | ✓ |
| Section-based structure | ✓ | ✓ | ✓ | ✓ |
| PDF download | ✓ | ✓ | ✓ | ✓ |
| Question bank | ✗ | ✓ | ✓ | ✓ |
| Answer key | ✗ | ✗ | ✓ | ✓ |
| Math formula support | ✗ | ✗ | ✗ | ✓ |

**Upper Hand:** When functional, AI extraction from image is unique. No competitor offers AI question paper extraction. This is a genuine differentiator if completed.

---

## 5. Perfect Version

1. **Working Gemini Vision API** extraction — upload image → AI extracts questions → populates sections
2. **Question bank** with search, filter by class/subject, tags
3. **Multiple question types**: MCQ, true/false, match columns, fill-in-blank, short answer, long answer, case study
4. **Answer key** auto-generated alongside question paper
5. **Grading rubric** per question
6. **LaTeX/Katex** support for math formulas
7. **Randomized question selection** from pool
8. **Template library** — pre-built question paper structures per subject
9. **Blue-print mapping** — map questions to Bloom's taxonomy, chapters, competency
