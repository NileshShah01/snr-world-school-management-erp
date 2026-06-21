# 09 — Library Module

## Purpose

Manage the school library book catalog, circulation (issue/return), and fine tracking. Supports accession-number-based tracking with duplicate checking, stock maintenance, and borrower history.

## Current Working State

- **JS File:** `D:\Snredu\js\erp-library.js` (8.2 KB)
- **Firestore Collections:**
  - `books` — top-level collection. Each doc represents a physical book copy (`accessionNo`, `isbn`, `title`, `authors`, `publisher`, `category`, `edition`, `rackNo`, `copies`, `availableCopies`, `status`).
  - `issues` — top-level collection. Tracks currently issued books (`bookId`, `accessionNo`, `studentId`, `studentName`, `className`, `issueDate`, `dueDate`, `returnDate`, `status`: issued/returned, `fine`, `finePaid`).
- **Key Functions:**
  - `loadBooks()` — fetches all books catalog (filtered by search query).
  - `addBook()` — creates book entry with duplicate accessionNo check.
  - `updateBook()` — edits book details and recalculates `availableCopies`.
  - `deleteBook()` — removes book (with issue check).
  - `issueBook()` — creates issue record, decrements `availableCopies`.
  - `returnBook()` — marks return, calculates fine, increments `availableCopies`.
  - `calculateFine()` — computes overdue fine based on configured daily rate.
  - `markFinePaid()` — records fine payment.
- **Access:** Librarian/admin in admin dashboard. No student/parent library view in student portal.
- **v3 Target:** `schools/{id}/library/{bookId}/issues/{issueId}` (nest issues under books).

## Gaps

| Priority | Gap | Notes |
|----------|-----|-------|
| P1 | No overdue auto-alerts | No notification sent to students/parents when book is due or overdue. |
| P2 | No barcode/QR scanning | All entry is manual — no barcode scanner integration for issue/return. |
| P2 | No student library history | No dashboard showing a student's borrowing history, current issues, fines. |
| P2 | No catalog search by ISBN/title/author | Current search is basic (single-field filter); no advanced multi-field search. |
| P2 | No library card generation | No printable library card with barcode/QR for students. |
| P2 | No category statistics | No breakdown of collection by category, most-issued genres, etc. |
| P3 | No book reservation | Students cannot reserve an issued book for when it is returned. |

## Competitor Comparison

| Feature | Education Desk | Fedena | Classe365 | SNR (Current) |
|---------|---------------|--------|-----------|---------------|
| Book catalog | Yes | Yes | Yes | Yes |
| Issue/Return | Basic | Barcode-based | Yes | Manual |
| Fine tracking | No | Yes | Yes | Yes |
| Barcode/QR scanning | No | Yes | Yes | No |
| Overdue alerts | No | Yes | Yes | No |
| Student library view | No | Yes | Yes | No |
| Book reservations | No | No | Yes | No |
| Catalog search | Basic | Yes | Advanced | Basic |
| Library cards | No | Yes | No | No |

## Perfect Version

- **Advanced catalog search** — filter by ISBN, title, author, publisher, category, rack number with partial/prefix matching.
- **Barcode/QR scanning** — webcam or handheld scanner integration for issue/return. Generate barcode labels for print.
- **Student library portal tab** — view current issues, due dates, fines, borrowing history. Option to renew online.
- **Overdue auto-alerts** — scheduled cloud function checks issues past due date daily → notifies via WhatsApp/Email/SMS.
- **Book reservation system** — students can reserve an issued book; librarian notified when returned; automatic allocation to next in queue.
- **Library card generator** — printable card with student name, class, photo, barcode.
- **Category & usage analytics** — most-issued books, category distribution, lost/damaged tracking, fine collection summary.
- **Lost/Damaged workflow** — mark book as lost, charge replacement fine, auto-remove from available copies.
- **v3 Data Model:**
  ```
  schools/{id}/library/{bookId}
  schools/{id}/library/{bookId}/issues/{issueId}
  schools/{id}/students/{studentId}/issues (derived)
  ```
