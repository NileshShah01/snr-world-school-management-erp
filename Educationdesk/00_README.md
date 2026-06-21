# Education Desk - Complete Reverse-Engineer

## Competitor
**APEX PUBLIC SCHOOL** via Education Desk ERP  
**URL:** https://apexps.educationdesk.in/employee/search-student  
**Login:** apex / baby  
**Vendor:** educationdesk.in (Cloud School ERP)

## Document Index

### Root Documentation
| File | Description |
|------|-------------|
| [00_TECH_STACK.md](00_root/00_TECH_STACK.md) | Architecture, frameworks, database, security |
| [00_AUTH_AND_SESSION.md](00_root/00_AUTH_AND_SESSION.md) | Login flow, session management, cookies |
| [00_GLOBAL_ASSETS.md](00_root/00_GLOBAL_ASSETS.md) | All CSS/JS files, versions, purposes |
| [00_CONNECTIVITY_MAP.md](00_root/00_CONNECTIVITY_MAP.md) | All endpoints, data flows, integrations |

### Module Documentation (166 pages)

#### 01_Home
- [home.md](01_Home/home.md) - Dashboard v1

#### 02_Employee
- [add-employee.md](02_Employee/add-employee.md) - Add new employee
- [search-employee.md](02_Employee/search-employee.md) - Search employees
- [add-designation.md](02_Employee/add-designation.md) - Manage designations
- [add-department.md](02_Employee/add-department.md) - Manage departments
- [upload-employee.md](02_Employee/upload-employee.md) - Bulk upload employees
- [employee-id-print.md](02_Employee/employee-id-print.md) - Print employee IDs

#### 03_Class_Management
- [add-batch.md](03_Class_Management/add-batch.md) - Add sessions/years
- [add-course.md](03_Class_Management/add-course.md) - Add classes
- [add-course-details.md](03_Class_Management/add-course-details.md) - Class details
- [add-subject.md](03_Class_Management/add-subject.md) - Add subjects
- [add-non-subject.md](03_Class_Management/add-non-subject.md) - Add non-academic subjects
- [add-syllabus.md](03_Class_Management/add-syllabus.md) - Add syllabus
- [all-syllabus.md](03_Class_Management/all-syllabus.md) - Manage syllabus

#### 04_Time_Table
- [add-time-table.md](04_Time_Table/add-time-table.md) - Create timetable
- [view-time-table.md](04_Time_Table/view-time-table.md) - View timetable
- [time-table-assign.md](04_Time_Table/time-table-assign.md) - Assign timetable
- [view-time-table-assign.md](04_Time_Table/view-time-table-assign.md) - View assignments
- [employee-time-table.md](04_Time_Table/employee-time-table.md) - Employee timetable
- [session-time-table.md](04_Time_Table/session-time-table.md) - Session timetable

#### 05_Admission_Enquiry
- [start-admission.md](05_Admission_Enquiry/start-admission.md) - Begin admission
- [add-primary-source.md](05_Admission_Enquiry/add-primary-source.md) - Add lead sources
- [add-admission-enquiry.md](05_Admission_Enquiry/add-admission-enquiry.md) - Create enquiry
- [my-admission-enquiry.md](05_Admission_Enquiry/my-admission-enquiry.md) - My enquiries
- [all-admission-enquiry.md](05_Admission_Enquiry/all-admission-enquiry.md) - All enquiries
- [enquiry-report.md](05_Admission_Enquiry/enquiry-report.md) - Enquiry reports
- [upload-enquiry.md](05_Admission_Enquiry/upload-enquiry.md) - Bulk upload enquiries

#### 06_Student
- [add-student.md](06_Student/add-student.md) - Add new student
- [search-student.md](06_Student/search-student.md) - Search students (TARGET)
- [upload-student.md](06_Student/upload-student.md) - Bulk upload students
- [elective-subject-mapping.md](06_Student/elective-subject-mapping.md) - Map elective subjects
- [promote-student.md](06_Student/promote-student.md) - Promote to next class
- [student-id-print.md](06_Student/student-id-print.md) - Print student IDs
- [student-pickup-id-print.md](06_Student/student-pickup-id-print.md) - Print pickup IDs
- [student-rfid-update.md](06_Student/student-rfid-update.md) - Bulk RFID update
- [hostel-search-student.md](06_Student/hostel-search-student.md) - Hostel student report
- [transport-search-student.md](06_Student/transport-search-student.md) - Transport student report

#### 07_Fees_Management
- [add-course-fee-type.md](07_Fees_Management/add-course-fee-type.md) - Add fee types
- [add-transport-fee-type.md](07_Fees_Management/add-transport-fee-type.md) - Transport fee types
- [manage-course-fee.md](07_Fees_Management/manage-course-fee.md) - Manage class fees
- [course-fee-structure.md](07_Fees_Management/course-fee-structure.md) - Fee structures
- [manage-transport-route-fee.md](07_Fees_Management/manage-transport-route-fee.md) - Route fees

#### 08_Payments
- [course-fee-payment.md](08_Payments/course-fee-payment.md) - Student fee payment
- [monthly-fee-payment.md](08_Payments/monthly-fee-payment.md) - Monthly payments
- [add-course-fee-payment.md](08_Payments/add-course-fee-payment.md) - Add payment record
- [demand-receipt.md](08_Payments/demand-receipt.md) - Generate demand receipt
- [bulk-discount.md](08_Payments/bulk-discount.md) - Bulk discount
- [bulk-extra-fee.md](08_Payments/bulk-extra-fee.md) - Bulk extra fee
- [late-fee-fine-rule.md](08_Payments/late-fee-fine-rule.md) - Late fee rules

#### 09_Attendance
- [employee-attendance.md](09_Attendance/employee-attendance.md) - Mark employee attendance
- [view-employee-attendance.md](09_Attendance/view-employee-attendance.md) - View employee attendance
- [view-all-employee-attendance.md](09_Attendance/view-all-employee-attendance.md) - All employee attendance
- [student-daily-attendance.md](09_Attendance/student-daily-attendance.md) - Mark student attendance
- [view-student-daily-attendance.md](09_Attendance/view-student-daily-attendance.md) - View student attendance
- [view-all-student-daily-attendance.md](09_Attendance/view-all-student-daily-attendance.md) - All student attendance
- [smart-card-student-attendance.md](09_Attendance/smart-card-student-attendance.md) - Smart card attendance
- [attendance-monthly-report.md](09_Attendance/attendance-monthly-report.md) - Monthly report

#### 10_Order
- [add-order.md](10_Order/add-order.md) - Create order
- [my-order.md](10_Order/my-order.md) - My orders
- [all-order.md](10_Order/all-order.md) - All orders

#### 11_Study_Document
- [create-study-document.md](11_Study_Document/create-study-document.md) - Create document
- [view-study-document.md](11_Study_Document/view-study-document.md) - View documents

#### 12_Homework
- [create-homework.md](12_Homework/create-homework.md) - Create homework
- [manage-homework.md](12_Homework/manage-homework.md) - Manage homework
- [update-homework-report.md](12_Homework/update-homework-report.md) - Update report
- [download-homework-report.md](12_Homework/download-homework-report.md) - Download report

#### 13_Exam_Management
- [setup-exam-grading-config.md](13_Exam_Management/setup-exam-grading-config.md) - Setup grading
- [manage-exam.md](13_Exam_Management/manage-exam.md) - Create exams
- [manage-exam-schedule.md](13_Exam_Management/manage-exam-schedule.md) - Schedule exams
- [view-exam-schedule.md](13_Exam_Management/view-exam-schedule.md) - View schedule
- [publish-exam-schedule.md](13_Exam_Management/publish-exam-schedule.md) - Publish schedule
- [exam-hall-ticket.md](13_Exam_Management/exam-hall-ticket.md) - Generate hall tickets
- [exam-attendance-card.md](13_Exam_Management/exam-attendance-card.md) - Attendance cards
- [student-exam-attendance.md](13_Exam_Management/student-exam-attendance.md) - Mark exam attendance
- [view-student-exam-attendance.md](13_Exam_Management/view-student-exam-attendance.md) - View exam attendance
- [exam-hall-plan.md](13_Exam_Management/exam-hall-plan.md) - Hall allocation
- [exam-hall-detail.md](13_Exam_Management/exam-hall-detail.md) - Hall details
- [exam-sitting-plan.md](13_Exam_Management/exam-sitting-plan.md) - Sitting arrangement

#### 14_Result_Management
- [manage-exam-subject-result.md](14_Result_Management/manage-exam-subject-result.md) - Manage subject results
- [add-exam-subject-result.md](14_Result_Management/add-exam-subject-result.md) - Enter results
- [manage-exam-result.md](14_Result_Management/manage-exam-result.md) - Manage all results
- [view-exam-result.md](14_Result_Management/view-exam-result.md) - View results
- [manage-nonsubject-result.md](14_Result_Management/manage-nonsubject-result.md) - Non-subject results
- [view-nonsubject-result.md](14_Result_Management/view-nonsubject-result.md) - View non-subject results
- [publish-exam-result.md](14_Result_Management/publish-exam-result.md) - Publish results
- [update-report-card-remarks.md](14_Result_Management/update-report-card-remarks.md) - Update remarks
- [generate-report-card.md](14_Result_Management/generate-report-card.md) - Generate report cards
- [view-report-card.md](14_Result_Management/view-report-card.md) - View report cards
- [publish-report-card.md](14_Result_Management/publish-report-card.md) - Publish report cards

#### 15_Employee_Leave
- [employee-leave-type.md](15_Employee_Leave/employee-leave-type.md) - Define leave types
- [employee-leave-assign.md](15_Employee_Leave/employee-leave-assign.md) - Assign leaves
- [add-employee-leave.md](15_Employee_Leave/add-employee-leave.md) - Add leave record
- [apply-self-employee-leave.md](15_Employee_Leave/apply-self-employee-leave.md) - Self apply
- [approve-employee-leave.md](15_Employee_Leave/approve-employee-leave.md) - Approve leaves

#### 16_Employee_Salary
- [manage-salary-head.md](16_Employee_Salary/manage-salary-head.md) - Salary components
- [manage-salary-structure.md](16_Employee_Salary/manage-salary-structure.md) - Salary structures
- [assign-salary-structure.md](16_Employee_Salary/assign-salary-structure.md) - Assign structures
- [salary-payment.md](16_Employee_Salary/salary-payment.md) - Create salary payment
- [salary-payment-process.md](16_Employee_Salary/salary-payment-process.md) - Process payments
- [delete-salary-payment-process.md](16_Employee_Salary/delete-salary-payment-process.md) - Delete pending
- [print-salary-payslip.md](16_Employee_Salary/print-salary-payslip.md) - Print payslips
- [create-salary-loan.md](16_Employee_Salary/create-salary-loan.md) - Create loan
- [approve-salary-loan.md](16_Employee_Salary/approve-salary-loan.md) - Approve loan
- [approved-salary-loan.md](16_Employee_Salary/approved-salary-loan.md) - View approved loans
- [manage-salary-emi-payment.md](16_Employee_Salary/manage-salary-emi-payment.md) - EMI payments
- [view-salary-loan-transaction.md](16_Employee_Salary/view-salary-loan-transaction.md) - Loan transactions
- [salary-loan-report.md](16_Employee_Salary/salary-loan-report.md) - Loan reports
- [my-salary-loan.md](16_Employee_Salary/my-salary-loan.md) - My loans

#### 17_Transport
- [manage-vehicle-detail.md](17_Transport/manage-vehicle-detail.md) - Manage vehicles
- [manage-driver-detail.md](17_Transport/manage-driver-detail.md) - Manage drivers
- [manage-stoppage.md](17_Transport/manage-stoppage.md) - Manage stoppages
- [manage-transport-route.md](17_Transport/manage-transport-route.md) - Manage routes
- [assign-stoppage-to-route.md](17_Transport/assign-stoppage-to-route.md) - Assign stops
- [assign-student-to-route.md](17_Transport/assign-student-to-route.md) - Assign students
- [student-transport-report.md](17_Transport/student-transport-report.md) - Transport report

#### 18_Holiday
- [add-event-and-holiday.md](18_Holiday/add-event-and-holiday.md) - Add events/holidays
- [view-event-and-holiday.md](18_Holiday/view-event-and-holiday.md) - View events

#### 19_Configuration
- [email-template.md](19_Configuration/email-template.md) - Email templates
- [sms-template.md](19_Configuration/sms-template.md) - SMS templates
- [system-sms-template.md](19_Configuration/system-sms-template.md) - System SMS templates
- [sms-balance.md](19_Configuration/sms-balance.md) - SMS balance
- [whatsapp-balance.md](19_Configuration/whatsapp-balance.md) - WhatsApp balance
- [notification-configuration.md](19_Configuration/notification-configuration.md) - Notifications
- [dashboard-configuration.md](19_Configuration/dashboard-configuration.md) - Dashboard config

#### 20_Mobile_App
- [parent-login-manage.md](20_Mobile_App/parent-login-manage.md) - Manage parent logins
- [create-parent-login.md](20_Mobile_App/create-parent-login.md) - Create parent login

#### 21_Online_Class
- [add-online-class.md](21_Online_Class/add-online-class.md) - Create online class
- [all-online-class.md](21_Online_Class/all-online-class.md) - View all classes
- [attend-online-class.md](21_Online_Class/attend-online-class.md) - Attend class

#### 22_Communication
- [student-communication.md](22_Communication/student-communication.md) - SMS to students
- [student-app-communication.md](22_Communication/student-app-communication.md) - App notifications
- [student-whatsapp-communication.md](22_Communication/student-whatsapp-communication.md) - WhatsApp
- [employee-communication.md](22_Communication/employee-communication.md) - Employee SMS
- [print-notice.md](22_Communication/print-notice.md) - Print notices
- [notice-board-management.md](22_Communication/notice-board-management.md) - Notice board
- [daily-dairy-manage.md](22_Communication/daily-dairy-manage.md) - Daily diary
- [school-newsletter.md](22_Communication/school-newsletter.md) - Newsletter

#### 23_Certificate
- [school-leaving-certificate.md](23_Certificate/school-leaving-certificate.md) - Leaving certificate
- [student-bonafide-certificate.md](23_Certificate/student-bonafide-certificate.md) - Bonafide certificate

#### 24_Finance
- [create-finance-account.md](24_Finance/create-finance-account.md) - Create account
- [add-finance-account-head.md](24_Finance/add-finance-account-head.md) - Account heads
- [add-finance-expense-record.md](24_Finance/add-finance-expense-record.md) - Record expense
- [add-finance-income-record.md](24_Finance/add-finance-income-record.md) - Record income
- [account-balance-transfer.md](24_Finance/account-balance-transfer.md) - Transfer balance
- [finance-account-statement.md](24_Finance/finance-account-statement.md) - Account statement
- [finance-daily-register.md](24_Finance/finance-daily-register.md) - Daily register
- [finance-profit-and-loss.md](24_Finance/finance-profit-and-loss.md) - Profit & Loss

#### 25_Product_Inventory
- [add-product-category.md](25_Product_Inventory/add-product-category.md) - Product categories
- [add-product.md](25_Product_Inventory/add-product.md) - Add products
- [product-inventory-stock-in.md](25_Product_Inventory/product-inventory-stock-in.md) - Stock in
- [product-inventory-stock-out.md](25_Product_Inventory/product-inventory-stock-out.md) - Stock out
- [manage-product-inventory.md](25_Product_Inventory/manage-product-inventory.md) - View inventory
- [product-additional-fields-mapping.md](25_Product_Inventory/product-additional-fields-mapping.md) - Custom fields

#### 26_Rate_Plan_Tax
- [add-product-rate-plan.md](26_Rate_Plan_Tax/add-product-rate-plan.md) - Add rate plan
- [all-product-rate-plan.md](26_Rate_Plan_Tax/all-product-rate-plan.md) - View rate plans
- [product-tax-rule.md](26_Rate_Plan_Tax/product-tax-rule.md) - Tax rules

#### 27_Reports
- [download-payment-receipt-pdf.md](27_Reports/download-payment-receipt-pdf.md) - Receipt PDF
- [download-payment-receipt.md](27_Reports/download-payment-receipt.md) - Receipt details
- [download-due-payment.md](27_Reports/download-due-payment.md) - Due payments
- [due-payment-with-detail.md](27_Reports/due-payment-with-detail.md) - Due with details
- [admission-report.md](27_Reports/admission-report.md) - Admission report
- [receipt-revert-report.md](27_Reports/receipt-revert-report.md) - Receipt revert report

#### 28_Website
- [flash-news.md](28_Website/flash-news.md) - Flash news management
- [page-setup.md](28_Website/page-setup.md) - CMS page setup
- [page-content-setup.md](28_Website/page-content-setup.md) - Page content

## Raw Data
- `99_RAW/*.html` - Raw HTML of all 166 pages
- `99_RAW/extracted/*.json` - Structured data extracted from each page
- `99_RAW/routes.json` - Complete route manifest
- `99_RAW/session.json` - Auth session cookies

## Statistics
- **Total Pages:** 166
- **Total Forms:** ~350+
- **Total AJAX Endpoints:** ~100+
- **Total JS Functions:** ~200+
- **Total CSS Files:** 21
- **Total JS Files:** 56
- **Module Categories:** 28
