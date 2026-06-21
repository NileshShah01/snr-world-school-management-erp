# Module 18: Analytics & Reports

**Firebase Project:** `apex-public-school-portal`
**Status:** ⚠️ Partial — Charts and dashboards exist but use hardcoded demo data; no real Firestore aggregation

---

## Purpose

Provide school leadership with visual analytics — fee collection trends, enrollment growth, exam result analysis, and principal dashboard overview. Charts rendered via Chart.js. Currently shows placeholder/demo data rather than real aggregated data from Firestore.

---

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document | Usage |
|---|---|---|
| `fees` | `{feeId}` | Fee records (collection data — not aggregated for charts) |
| `students` | `{studentId}` | Enrollment dates (not aggregated for growth charts) |
| `results` | `{resultId}` | Exam results (used by erp-analytics.js for real result analytics) |
| `schools` | `{schoolId}` | School-level reference for multi-tenant filtering |

### JavaScript Files
| File | Path | Size | Role |
|---|---|---|---|
| `dashboard-analytics.js` | `D:\Snredu\js\dashboard-analytics.js` | 3.7 KB | Principal dashboard charts — **hardcoded demo data** for fee collection bar chart and enrollment growth line chart |
| `erp-analytics.js` | `D:\Snredu\js\erp-analytics.js` | 6.3 KB | Result analytics: toppers list, average marks, grade distribution, pass/fail counts — **functional with real data** |
| `Chart.js` | (CDN) | — | Third-party charting library (bar, line, doughnut, pie) |

### Portal Pages
| Page | Path | Usage |
|---|---|---|
| `principal-dashboard.html` | `D:\Snredu\portal\principal-dashboard.html` | Principal overview with analytics widgets |
| Admin Dashboard | Embedded | Fee and enrollment chart display |

### Key Functions
- `renderFeeCollectionChart()` — **hardcoded demo data** — intended to show monthly fee collection as bar chart
- `renderEnrollmentGrowthChart()` — **hardcoded demo data** — intended to show enrollment over months/years as line chart
- `renderResultAnalytics(classId, examId)` — functional: fetches real result data, computes toppers, average, pass/fail, grade distribution
- `renderPrincipalStats()` — renders total students, total staff, total collections, pending fees (some hardcoded)
- `renderGradeDistribution(results)` — doughnut/pie chart showing grade-wise distribution
- `getPassFailRate(results)` — computes pass % and fail % from result records

### Current Features (Working)
- Result analytics: toppers list, average marks, pass/fail counts, grade distribution (REAL data)
- Principal dashboard: total students, staff, fee summary (PARTIALLY hardcoded)
- Fee collection bar chart (HARDCODED demo)
- Enrollment growth line chart (HARDCODED demo)

---

## Gaps

| Priority | Gap | Details |
|---|---|---|
| **P2** | **HARDCODED DATA in dashboards** | `renderFeeCollectionChart()` and `renderEnrollmentGrowthChart()` use inline demo arrays instead of aggregating from Firestore `fees` and `students` collections |
| P2 | No predictive analytics | No forecasting of enrollment trends, fee collection projections |
| P2 | No fee default prediction | No risk model to flag parents/students likely to default on fees |
| P2 | No attendance trend analysis | No chart showing class-wise or student-wise attendance patterns over time |
| P2 | No teacher performance metrics | No data on teacher effectiveness (result correlation, class performance by teacher) |
| P2 | No custom report builder | Admin cannot build custom reports selecting metrics and dimensions |
| P2 | No CSV/PDF export of analytics | Charts and tables are on-screen only; no download option |
| P2 | No real-time dashboard | Dashboards don't auto-refresh; data is stale until page reload |
| P3 | No BigQuery integration | No export to BigQuery for advanced analytics or data warehouse |
| P2 | No drop-out risk flagging | No algorithm to identify students at risk of dropping out based on attendance + fee + performance |
| P2 | No comparative analytics | No year-over-year or class-to-class comparative charts |
| P2 | No drill-down | Charts are top-level only; cannot click a bar to see month's fee breakdown |

---

## Competitor Comparison

| Feature | SNR World | Education Desk | Fedena | Classe365 | Schoolyn |
|---|---|---|---|---|---|
| Dashboard Charts | ⚠️ Hardcoded demo | ✅ Basic | ✅ Yes | ✅ Yes | ✅ Yes |
| Result Analytics | ✅ Yes (real data) | ⚠️ Basic | ✅ Yes | ✅ Yes | ✅ Yes |
| Fee Analytics | ⚠️ Hardcoded | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Attendance Trends | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Predictive Analytics | ❌ No | ❌ No | ❌ No | ❌ No | ✅ AI-powered |
| Custom Report Builder | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| CSV/PDF Export | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Data Aggregation | ❌ Manual | ✅ Automated | ✅ Automated | ✅ Automated | ✅ Automated |

**SNR's analytics module is the weakest area.** Education Desk, Fedena, Classe365 all offer real-data dashboards. Schoolyn has AI-powered predictive analytics — the industry leader. SNR's result analytics is the only functional real-data component.

---

## Perfect Version

1. **Real data aggregation** — replace all hardcoded demo data with Firestore aggregation queries (fee collection by month, enrollment by month/class, attendance by week)
2. **Predictive analytics** — ML-based forecasting for enrollment trends, fee collection, and attendance patterns
3. **Fee default prediction** — risk scoring model (payment history + past dues + communication response) flagging default-prone accounts
4. **Attendance trend analysis** — class-wise, section-wise, student-wise attendance line charts with comparison to class average
5. **Teacher performance metrics** — correlation of teacher assignment → class result averages → year-over-year improvement
6. **Custom report builder** — drag-and-drop metric/dimension selector; choose chart type; save as dashboard widget
7. **CSV/PDF export** — download any chart or table as CSV (raw data) or PDF (rendered report with school branding)
8. **Real-time dashboard** — WebSocket / Firestore `onSnapshot` listeners for live-updating charts
9. **Drop-out risk flagging** — composite risk score (attendance < 75% + fee default 2+ months + declining grades) → red-flagged student list
10. **BigQuery integration** — nightly export of aggregated data to BigQuery for complex SQL analytics and data warehouse
11. **Drill-down navigation** — click any chart segment to see underlying records (click fee bar → see payment list)
12. **Comparative analytics** — side-by-side charts: this year vs last year, Class A vs Class B, pre-vs-post intervention
