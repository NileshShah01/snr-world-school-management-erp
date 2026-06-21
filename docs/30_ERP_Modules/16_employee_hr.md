# Module 16: Employee / HR Management

**Firebase Project:** `apex-public-school-portal`
**Status:** ⚠️ Partial — Staff CRUD + assignments work; Payroll, Leave, Attendance not implemented

---

## Purpose

Manage school staff records — personal info, employment details, salary structure, and class/subject assignments. Staff data powers the staff directory on the public CMS website and the class teacher / subject teacher assignments used throughout the ERP.

---

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document | Usage |
|---|---|---|
| `staff` | `{staffId}` | All staff records (personal, employment, salary, qualifications) |
| `schools` | `{schoolId}` | School reference for multi-tenant staff lookups |
| `classes` | `{classId}` | Class-teacher assignment via `classTeacher` field |
| `sections` | `{sectionId}` | Subject-teacher assignment in `subjects` sub-collection |

### JavaScript Files
| File | Path | Size | Role |
|---|---|---|---|
| `admin-dashboard.js` | `D:\Snredu\js\admin-dashboard.js` | — | Staff CRUD: add/edit/view staff records |
| `erp-class-mgmt.js` | `D:\Snredu\js\erp-class-mgmt.js` | — | Staff-to-class (class teacher) and staff-to-subject (subject teacher) assignment |
| `cms-admin.js` | `D:\Snredu\js\cms-admin.js` | 62.1 KB | Staff directory visibility settings on public website |
| `media-loader.js` | `D:\Snredu\js\media-loader.js` | 9.3 KB | Staff photo resolution via `data-snr-media` |
| `i18n.js` | `D:\Snredu\js\i18n.js` | 14.7 KB | Bilingual labels for staff fields |

### Staff Fields (in `staff/{staffId}`)
| Category | Fields |
|---|---|
| Personal | `name`, `dob`, `gender`, `photo`, `contact`, `email`, `address` |
| Employment | `designation`, `department`, `subjects`, `classes`, `doj`, `dol`, `employmentType` (permanent/contract/ad-hoc) |
| Salary | `basic`, `hra`, `da`, `allowances`, `pf`, `gross`, `net` |
| Qualifications | `qualifications`, `udiseId` |
| System | `schoolId`, `createdAt`, `updatedAt` |

### Designations Supported
Principal, VicePrincipal, PGT, TGT, PRT, NTT, Admin, Accountant, Librarian, Peon, Driver, Conductor, Security

### Portal Pages
| Page | Path |
|---|---|
| Staff Directory (Public) | `D:\Snredu\portal\staff.html` |
| Admin Staff Management | Embedded in admin dashboard |

### Key Functions
- `addStaff(staffData)` — creates staff record in Firestore
- `updateStaff(staffId, staffData)` — updates staff fields
- `deleteStaff(staffId)` — removes staff record
- `getStaffList(schoolId, filters)` — fetches staff with optional designation/department filter
- `assignClassTeacher(classId, staffId)` — sets class teacher via `erp-class-mgmt.js`
- `assignSubjectTeacher(classId, sectionId, subject, staffId)` — sets subject teacher
- `getStaffByDesignation(designation)` — used by CMS staff directory to filter by role

---

## Gaps

| Priority | Gap | Details |
|---|---|---|
| **P1** | **NO PAYROLL PROCESSING** | Salary structure fields exist (`basic`, `hra`, `da`, etc.) but there is NO payroll calculation, no salary processing, no month-end run |
| **P1** | **No payslip generation** | Cannot generate or print monthly payslips for staff |
| P2 | No leave management | No leave types, leave balance, leave application/approval workflow |
| P2 | No attendance for staff | Staff attendance is not tracked (no check-in/check-out, no absent/present marking) |
| P2 | No Form 16 | No annual tax statement generation for employees |
| P2 | No PF/ESI compliance | No Provident Fund or ESI deduction tracking or challan generation |
| P3 | No loan/advance management | No salary advance or loan recovery tracking |
| P3 | No staff appraisal | No performance review cycles, no appraisal records |
| P3 | No training records | No training/workshop attendance logs |
| P2 | No document storage | No document upload per employee (appointment letter, ID proof, certificates) |
| P2 | No staff transfer | No record of transfer between schools or departments |
| P2 | No separation management | No exit interview, no full-and-final settlement workflow |

---

## Competitor Comparison

| Feature | SNR World | Education Desk | Fedena | Classe365 |
|---|---|---|---|---|
| Staff CRUD | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Class/Subject Assignment | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Payroll Processing | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Payslip Generation | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Leave Management | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Staff Attendance | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| PF/ESI Compliance | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| Form 16 | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| Document Storage | ❌ No | ❌ No | ✅ Yes | ✅ Yes |

**SNR's HR module lags behind all major competitors** — Education Desk, Fedena, and Classe365 all have comprehensive HR + payroll. Payroll and payslip generation are the most critical P1 gaps.

---

## Perfect Version

1. **Payroll processing module** — monthly salary calculation based on attendance, leave, and deductions; auto-generate salary slips
2. **Payslip generator** — PDF payslip with school branding, earnings, deductions, net pay; email to staff
3. **Leave management** — leave types (CL, SL, EL, ML), leave policy configuration, application → approval → balance tracking
4. **Staff attendance** — daily check-in/check-out via biometric integration or portal; absent/present report
5. **PF/ESI compliance** — auto-calculate PF (12%), ESI (employer+employee), generate monthly challan, Form 5/10/12
6. **Form 16** — annual tax computation, Section 80C deductions, generate Form 16 PDF
7. **Document vault** — upload and categorise staff documents (appointment letter, ID, certificates, experience letters); expiry alerts
8. **Loan/advance** — staff loan application, approval, EMI deduction from salary
9. **Appraisal cycles** — goal setting, self-review, manager review, rating, increment recommendation
10. **Separation management** — resignation → acceptance → full-and-final settlement → experience letter → relieving letter
