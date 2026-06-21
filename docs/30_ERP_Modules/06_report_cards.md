# Module: Report Cards & Results

## Purpose
Generate student report cards — progress reports, final results, analytics dashboards. Support for jsPDF-based premium templates.

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document ID | Fields |
|---|---|---|
| `reportCards` | `{reportCardId}` | `studentId`, `examId`, `academicYearId`, `subjectMarks[]`, `grades[]`, `totalMarks`, `percentage`, `rank`, `teacherRemarks`, `principalRemarks`, `attendance`, `generatedAt` |
| `examResults` | `{resultId}` | Shared with Exam module |
| `gradingRules` | `{ruleId}` | Shared with Exam module |

### JS Files
| File | Purpose |
|---|---|
| `js/report-card-factory.js` | (~19.7 KB) jsPDF-based premium report card generation engine |
| `js/erp-report-card-tool-v2.js` | (~6 KB) Second version of report card tool |
| `js/erp-report-card-tool.js` | First version — largely a stub/minimal implementation |
| `js/report-card-upload.js` | (~8 KB) Upload report card images/PDFs for manual entries |
| `js/erp-analytics.js` | Result analytics — pass %, toppers, subject averages |
| `js/admin-dashboard.js` | Result/Report card UI sections |

### Portal Pages
- `portal/admin-dashboard.html` — Report card generation, manage templates, analytics

### Key Operations
- **Report Generation**: `report-card-factory.js` takes student marks + grading rules → generates PDF via jsPDF with school logo, header, subject table, grades, remarks, attendance summary.
- **Bulk Generation**: Generate report cards for entire class/section at once.
- **Upload**: `report-card-upload.js` — manually upload scanned report cards (for legacy/offline generated cards) with student mapping.
- **Analytics**: `erp-analytics.js` — pass/fail stats, subject toppers, class ranking, exam trend.

## Gaps

| Priority | Gap | Impact |
|---|---|---|
| P1 | **No CBSE/ICSE templates** — report card format cannot be set to CBSE/ICSE prescribed format | Can't comply with board guidelines |
| P1 | **No NEP 2020 Holistic Progress Card (HPC)** — no co-curricular, life skills, self-assessment, peer assessment | Outdated assessment model |
| P1 | **No parent portal download** — parents cannot download report cards from student portal | Must be printed and distributed |
| P2 | **3 coexisting tools need consolidation** — `report-card-factory.js`, `erp-report-card-tool-v2.js`, `erp-report-card-tool.js` all do overlapping things | Code confusion, maintenance burden |
| P2 | **No auto-grade comments** — teacher remarks are manual free-text only | Inconsistent report quality |
| P2 | **No bulk PDF download** — each report card downloaded individually | Admin overhead |
| P2 | **No marks verification workflow** — no approval before report card generation | Errors propagate to printed cards |
| P2 | **No state-board templates** (Bihar, UP, Maharashtra, etc.) | Limited to generic format |
| P2 | **No competency mapping** — no skill/competency tracking per subject (NEP requirement) | Lacks modern assessment |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | SNR WORLD (Current) |
|---|---|---|---|---|
| Report card generation | Basic templates | Customizable per board | CBSE/ICSE built-in | Generic jsPDF |
| NEP 2020 HPC | No | No | Yes | **No** |
| CBSE/ICSE templates | Basic | Yes | Yes | **No** |
| State board templates | No | Yes | No | **No** |
| Parent portal download | Yes | Yes | Yes | **No** |
| Bulk PDF download | Yes | Yes | Yes | **No** |
| Auto-grade comments | No | Yes | Yes | **No** |
| Verification workflow | No | Yes | Yes | **No** |
| Competency mapping | No | Yes | Yes | **No** |

## Perfect Version

- **Consolidation**: Single `report-card-engine.js` replacing all 3 tools. Template-based architecture with pluggable layouts.
- **Templates**: Pre-built templates for CBSE (Grades VI–VIII Continuous Comprehensive Evaluation format, Grades IX–X subject-wise with CGPA), ICSE (subject group-wise), NEP 2020 Holistic Progress Card, and state-board formats (Bihar Board, UP Board, Maharashtra SSC). Custom template builder with drag-drop fields.
- **NEP 2020 HPC**: Include sections — self-assessment (student fills), peer assessment, teacher assessment (co-curricular, life skills, attitudes & values, participation in activities), academic progress, goals for next term. Each competency rated (Beginning/Developing/Proficient/Advanced).
- **Parent Portal**: Dedicated "Results" section in student portal. Download PDF report card. View historic results across terms/academic years. Push notification when new report card published.
- **Bulk Operations**: Select class → generate all report cards → bulk download as ZIP. Each PDF named `{rollNo}_{studentName}.pdf`.
- **Auto-Comments**: Rule-based comment engine — based on performance band (90%+ = "Excellent progress", 75-89% = "Good, keep improving", etc.) + subject-specific suggestions. Teacher can override.
- **Verification Workflow**: Marks entered → HoD reviews → Principal approves → Report card generation enabled. Status tracked in Firestore. Approver ID + timestamp logged.
- **Analytics Dashboard**: Class/subject pass %, toppers, avg marks trend, grade distribution pie chart, subject-wise weak areas heatmap. Export all reports + analytics to CSV.
- **Competency Mapping**: Define competencies per subject (e.g., "problem-solving", "critical thinking"). Rate per exam term. Show progress across terms. Aligned to NEP 2020 framework.
- **Print Quality**: jsPDF with embedded fonts (Noto Sans Devanagari for Hindi/regional languages). Print-layout CSS for browser print. Watermark option.
