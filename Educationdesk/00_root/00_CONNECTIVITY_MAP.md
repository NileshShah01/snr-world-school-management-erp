# Education Desk - Connectivity & API Map

## Known Endpoints

### Authentication
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /login | GET | Login form |
| /emp-login-process | POST | Process login |
| /forgot-password | GET | Password reset form |
| /admin | GET | Admin login |

### AJAX Endpoints (observed across pages)
| Endpoint | Method | Purpose | Returns |
|----------|--------|---------|---------|
| /employee/get-parent-course | POST | Load classes for session | HTML option list |
| /employee/get-course-fee | POST | Load fee structure | HTML |
| /employee/get-student-list | POST | Search students | HTML table rows |
| /employee/get-employee-list | POST | Search employees | HTML table rows |
| /employee/get-attendance | POST | Load attendance data | HTML |
| /employee/get-exam-list | POST | Load exams | HTML options |
| /employee/get-subject-list | POST | Load subjects | HTML options |
| /employee/get-batch-list | POST | Load sessions | HTML options |
| /employee/get-route-list | POST | Load transport routes | HTML |
| /employee/get-stoppage-list | POST | Load stoppages | HTML |
| /employee/get-vehicle-list | POST | Load vehicles | HTML |
| /employee/get-driver-list | POST | Load drivers | HTML |
| /employee/get-finance-accounts | POST | Load finance accounts | HTML |
| /employee/get-product-list | POST | Load products | HTML |
| /employee/get-rate-plan-list | POST | Load rate plans | HTML |

### Form Submission Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /employee/add-student | POST | Create student |
| /employee/search-student | POST | Search students |
| /employee/add-employee | POST | Create employee |
| /employee/search-employee | POST | Search employees |
| /employee/student-daily-attendance | POST | Mark attendance |
| /employee/course-fee-payment | POST | Process payment |
| /employee/salary-payment | POST | Process salary |
| /employee/create-homework | POST | Create homework |
| /employee/manage-exam | POST | Create/manage exam |
| /employee/add-exam-subject-result | POST | Enter results |
| /employee/generate-report-card | POST | Generate report card |
| /employee/student-communication | POST | Send communication |
| /employee/employee-communication | POST | Send to employees |
| /employee/create-finance-account | POST | Create finance account |
| /employee/add-finance-expense-record | POST | Record expense |
| /employee/add-finance-income-record | POST | Record income |
| /employee/add-product | POST | Create product |
| /employee/product-inventory-stock-in | POST | Stock in |
| /employee/product-inventory-stock-out | POST | Stock out |
| /employee/school-leaving-certificate | POST | Generate leaving cert |
| /employee/student-bonafide-certificate | POST | Generate bonafide |
| /employee/notice-board-management | POST | Create notice |
| /employee/daily-dairy-manage | POST | Create diary entry |
| /employee/add-online-class | POST | Create online class |
| /employee/page-setup | POST | Create CMS page |
| /employee/page-content-setup | POST | Create page content |
| /employee/flash-news | POST | Create flash news |
| /employee/email-template | POST | Manage email templates |
| /employee/sms-template | POST | Manage SMS templates |
| /employee/notification-configuration | POST | Configure notifications |
| /employee/dashboard-configuration | POST | Configure dashboard |
| /employee/parent-login-manage | POST | Manage parent logins |
| /employee/create-parent-login | POST | Create parent login |

## Data Flow

### Student Lifecycle
1. Admission Enquiry -> Start Admission -> Add Student
2. Student Search -> View Profile -> Edit
3. Promote Student (session to session)
4. Student ID Print, Pickup ID Print
5. School Leaving Certificate

### Academic Flow
1. Class Management -> Add Session -> Add Class -> Add Subject
2. Time Table -> Add/View/Assign
3. Homework -> Create -> Manage -> Report
4. Exam -> Setup Grading -> Manage Exam -> Schedule -> Hall Ticket -> Attendance
5. Result -> Add Result -> Publish -> Report Card -> Publish

### Financial Flow
1. Fee Structure -> Fee Type -> Course Fee -> Transport Fee
2. Payment -> Student Fee Payment -> Monthly Payment -> Receipt
3. Finance -> Create Account -> Record Income/Expense -> Statement -> P&L
4. Salary -> Structure -> Assign -> Payment -> Payslip
5. Salary Loan -> Create -> Approve -> EMI -> Report

### Communication Flow
1. Student Communication (SMS/Email/App/WhatsApp)
2. Employee Communication
3. Notice Board -> Print Notice
4. Daily Diary -> School Newsletter
5. Parent App Login

### Inventory Flow
1. Product Category -> Product -> Rate Plan -> Tax Rule
2. Stock In -> Stock Out -> View Transaction
3. Order -> My Order -> All Order

### Transport Flow
1. Vehicle -> Driver -> Stoppage -> Route
2. Assign Stoppage to Route
3. Assign Student to Route
4. Student Transport Report

### Configuration Flow
1. Email Template -> SMS Template -> System SMS Template
2. SMS Balance, WhatsApp Balance
3. Notification Configuration
4. Dashboard Configuration

## External Dependencies
| Service | Purpose | URL |
|---------|---------|-----|
| doc3.educationdesk.in | Image/document CDN | External |
| SMS Provider | Student/employee communication | Unknown |
| WhatsApp Provider | WhatsApp messaging | Unknown |
| Email Provider | Email communication | Unknown |
| Payment Gateway | Online fee collection | Unknown |

## Redirect Behavior
- Unauthenticated access to any /employee/* -> /login
- Successful login -> /employee/home
- Logout -> /login (implied)
- /app/dashboard -> Returns minimal page (531 bytes)
