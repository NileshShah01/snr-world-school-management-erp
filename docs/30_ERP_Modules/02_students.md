# Module: Student Information System (SIS)

## Purpose
Manage student master data — admissions, profiles, bulk import, RFID assignment, promotions, and public display settings.

## Current Working State

### Firestore Collection (Top-Level)
| Collection | Document ID | Fields |
|---|---|---|
| `students` | `{studentId}` (auto-generated or imported) | `name`, `dob`, `gender`, `bloodGroup`, `nationality`, `religion`, `aadhaar`, `classId`, `section`, `rollNo`, `fatherName`, `fatherPhone`, `fatherEmail`, `motherName`, `motherPhone`, `motherEmail`, `guardianName`, `guardianRelation`, `guardianPhone`, `address`, `city`, `state`, `pincode`, `transportRoute`, `pickupPoint`, `medicalNotes`, `bloodGroup`, `rteStatus`, `udiseId`, `house`, `photo` (Base64), `isActive`, `createdAt`, `updatedAt` |
| `classes` | `{classId}` | `name`, `section`, `teacherId`, `studentCount` |
| `academicYears` | `{yearId}` | `name`, `startDate`, `endDate`, `isCurrent` |

### JS Files
| File | Purpose |
|---|---|
| `js/admin-dashboard.js` | Student CRUD (~4000 lines, includes Student Management sections) |
| `js/cms-settings.js` | Public student directory display settings |
| `js/student-dashboard.js` | Student portal profile view |

### Portal Pages
- `portal/admin-dashboard.html` — Student CRUD UI (bulk import, edit, promote, RFID)
- `portal/student-dashboard.html` — Student profile, attendance, fees, results

### Key Operations
- **CRUD**: Full create/read/update in admin dashboard. Delete is soft (isActive = false).
- **Bulk Import**: CSV upload via Papa Parse library. Maps CSV columns to student fields.
- **RFID Update**: Assign/update RFID tag per student. Used for attendance.
- **Promotions**: Bulk promote students to next class at year-end. New `academicYear` doc created.
- **Photo**: Stored as Base64 string in Firestore (not Firebase Storage).

## Gaps

| Priority | Gap | Impact |
|---|---|---|
| P1 | **Aadhaar field not field-level protected** in Firestore rules — any authenticated user can read | Sensitive PII exposure |
| P2 | **No attendance/marks denormalized** on student doc — requires separate queries for dashboard | Slow profile load |
| P2 | **No TC (Transfer Certificate) digital workflow** — TC issued manually outside system | No exit process tracking |
| P2 | **No alumni tracking** — students marked inactive lost forever | No alumni network/engagement |
| P2 | **No document storage per student** — no upload for birth cert, mark sheets, photos (Base64 is not scalable) | No document management |
| P3 | **No sibling linking** — no `familyId` or sibling relationship tracking | Can't link siblings for discounts/communication |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | SNR WORLD (Current) |
|---|---|---|---|---|
| Student profiles | Full with documents | Full with photos + docs | Full with enrollment history | Full (no docs) |
| Bulk import | CSV/Excel | CSV | CSV/Excel | CSV (Papa Parse) |
| Document upload | Yes (cloud storage) | Yes (attachments) | Yes | **No** |
| Aadhaar/PII protection | Field-level encryption | Role-based masking | Field-level access | **None** |
| Alumni tracking | Yes | No | Yes | **No** |
| TC workflow | Yes | Yes | Yes | **No** |
| Sibling linking | Yes | Yes | Yes | **No** |
| Photo storage | Cloud CDN | File upload | Cloud | **Base64 in Firestore** |

## Perfect Version

- **Student Profile**: All current fields plus `enrollmentHistory[]`, `siblingIds[]`, `previousSchool`, `exitDate`, `exitReason`, `tcIssued`, `tcNumber`.
- **Document Management**: Firebase Storage per student (`students/{studentId}/documents/{docId}`). Upload birth certificate, mark sheets, transfer certificate, photos. File types restricted, max 5 MB each.
- **Aadhaar Protection**: Field-level encryption (AES-256-GCM with Cloud KMS) or Firestore rules denying read unless role is `admin` or `accountant`. Masked display (xxxx-xxxx-1234).
- **Bulk Import**: CSV + Google Sheets API sync. Validation before write. Duplicate detection by Aadhaar/phone.
- **Promotion**: Batch transaction — update classId, create academic year record, archive old attendance/fees.
- **TC Workflow**: TC request → approval workflow → auto-generate TC PDF → mark student as transferred.
- **Alumni**: Separate `alumni` subcollection on transfer. Email/SMS engagement campaigns.
- **Performance**: Denormalize `attendancePercent` and `currentFeeStatus` on student doc. Use Firebase Functions to keep in sync.
