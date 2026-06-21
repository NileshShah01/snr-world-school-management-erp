# Module: Fee Management

## Purpose
Handle fee master setup, monthly fee generation, payment allocation (FIFO), demand receipts, late fee rules, discounts, and collection tracking.

## Current Working State

### Firestore Collections (Top-Level)
| Collection | Document ID | Fields |
|---|---|---|
| `feeMaster` | `{feeMasterId}` | `classId`, `feeHeads[]` (name, amount, isOptional), `totalAmount`, `academicYearId`, `isActive` |
| `studentFee` | `{studentFeeId}` | `studentId`, `classId`, `monthlyBreakdown[]` (month, year, amount, paid, due, status), `totalDue`, `totalPaid`, `concession` |
| `feeTransactions` | `{txnId}` | `studentId`, `amount`, `mode` (Cash/Cheque/DD/Online), `date`, `receivedBy`, `allocations[]` (month, year, amount), `receiptNo` |
| `lateFeeRules` | `{ruleId}` | `classId`, `afterDate`, `penaltyAmount`, `penaltyType` (flat/percentage), `maxPenalty` |
| `discounts` | `{discountId}` | `studentId`/`classId`, `type`, `amount`/`percentage`, `appliedTo`, `approvedBy` |

### JS Files
| File | Purpose |
|---|---|
| `js/erp-fees.js` | (~37 KB) Fee master CRUD, generation, collection UI, reports |
| `js/services/payment-service.js` | FIFO atomic allocation via Firestore transactions — allocates payments by month+year order, handles excess |
| `js/fee-dues-tool.js` | Search and display due list per class/section |
| `js/demand-receipt.js` | Generate demand receipt PDF (jsPDF) |

### Portal Pages
- `portal/admin-dashboard.html` — Fee management sections (master setup, collection, reports, dues)

### Key Operations
- **Fee Master**: Define fee heads per class (tuition, transport, library, etc.). Set optional/compulsory.
- **Monthly Generation**: Generate studentFee records from master for each active student.
- **Payment Allocation**: `PaymentService.allocatePayment()` — Firestore transaction reads existing allocations, finds earliest unpaid month (FIFO), writes allocated amounts. Excess amount rolls forward.
- **Demand Receipt**: PDF with fee breakdown, paid amount, balance due, late fee if applicable.
- **Late Fee**: Configurable rules — penalty after due date. Flat or percentage.
- **Discounts**: Bulk discount per class or individual concession per student.

## Gaps

| Priority | Gap | Impact |
|---|---|---|
| P0 | **No payment gateway** — no Razorpay/Cashfree/PhonePe integration. All fees collected in cash/cheque/DD. | Can't collect online — table-stakes in India 2026 |
| P0 | **No online payment link generation** — no way to send UPI link via WhatsApp/SMS | Parents must visit school to pay |
| P1 | **No defaulter dashboard with UPI deep-links** — can't bulk-send payment links to defaulters | Manual follow-up required |
| P1 | **No sibling discount engine** — discounts applied per-student, not family-wide | Inefficient for multi-child families |
| P2 | **No auto-receipt PDF** — receipts generated manually | Admin overhead |
| P2 | **No Tally export** — no ledger export for accounting software | Manual data entry for accounts |
| P2 | **No GST receipt format** — no GST-compliant invoice | Compliance gap |
| P2 | **Late fee auto-calculation not triggered** — must be manually run | Late fees often missed |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | SNR WORLD (Current) |
|---|---|---|---|---|
| Payment gateway | Yes | Razorpay/Cashfree | Yes (multiple) | **No** |
| UPI/link sharing | Yes | Yes | Yes | **No** |
| Auto-receipt PDF | Yes | Yes | Yes | Manual |
| Tally/accounting export | Yes | Yes | Yes | **No** |
| GST invoice | Yes | Yes | Yes | **No** |
| Sibling discount | Yes | Manual | Yes | **No** |
| FIFO allocation | Yes | Yes | Yes | Yes |
| Defaulter dashboard | Yes | Yes | Yes | Basic dues list |

## Perfect Version

- **Payment Gateway**: Razorpay UPI/Credit Card/NetBanking integration. Webhook handler for payment confirmation. Auto-allocate via FIFO on callback.
- **Payment Links**: Cloud Function generates short UPI deep-link (`upi://pay?pa=...`). Send via WhatsApp/SMS to defaulters. Track link status (sent/opened/paid).
- **Receipts**: Auto-generated PDF receipt on successful payment. Stored in Firebase Storage. Shareable link sent to parent.
- **Sibling Discount**: `familyId` on student doc. Discount engine calculates family-level concession (e.g., 10% off for 2nd child).
- **Tally Export**: CSV export in Tally-importable format. Ledger-wise breakdown per fee head.
- **GST Invoice**: GST-compliant receipt format with SAC code, HSN, CGST/SGST split. For optional GST-registered schools.
- **Late Fee Engine**: Firestore Scheduled Function runs daily — checks feeMaster due dates, applies penalty to studentFee records if payment not received by `afterDate`. Capped at `maxPenalty`.
- **Collection Dashboard**: Real-time class-wise collection %, due aging, defaulters list with UPI deep-link send button, daily collection summary.
