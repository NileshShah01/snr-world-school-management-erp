# Routes manifest: route -> relative output file
# All employee routes need /employee/ prefix
$routes = @{
  "01_Home" = @{
    "home" = "01_Home/home.html"
    "/app/dashboard" = "01_Home/dashboard_v2.html"
  }
  "02_Employee" = @{
    "add-employee" = "02_Employee/add-employee.html"
    "search-employee" = "02_Employee/search-employee.html"
    "add-designation" = "02_Employee/add-designation.html"
    "add-department" = "02_Employee/add-department.html"
    "upload-employee" = "02_Employee/upload-employee.html"
    "employee-id-print" = "02_Employee/employee-id-print.html"
  }
  "03_Class_Management" = @{
    "add-batch" = "03_Class_Management/add-batch.html"
    "add-course" = "03_Class_Management/add-course.html"
    "add-course-details" = "03_Class_Management/add-course-details.html"
    "add-subject" = "03_Class_Management/add-subject.html"
    "add-non-subject" = "03_Class_Management/add-non-subject.html"
    "add-syllabus" = "03_Class_Management/add-syllabus.html"
    "all-syllabus" = "03_Class_Management/all-syllabus.html"
  }
  "04_Time_Table" = @{
    "add-time-table" = "04_Time_Table/add-time-table.html"
    "view-time-table" = "04_Time_Table/view-time-table.html"
    "time-table-assign" = "04_Time_Table/time-table-assign.html"
    "view-time-table-assign" = "04_Time_Table/view-time-table-assign.html"
    "employee-time-table" = "04_Time_Table/employee-time-table.html"
    "session-time-table" = "04_Time_Table/session-time-table.html"
  }
  "05_Admission_Enquiry" = @{
    "start-admission" = "05_Admission_Enquiry/start-admission.html"
    "add-primary-source" = "05_Admission_Enquiry/add-primary-source.html"
    "add-admission-enquiry" = "05_Admission_Enquiry/add-admission-enquiry.html"
    "my-admission-enquiry" = "05_Admission_Enquiry/my-admission-enquiry.html"
    "all-admission-enquiry" = "05_Admission_Enquiry/all-admission-enquiry.html"
    "enquiry-report" = "05_Admission_Enquiry/enquiry-report.html"
    "upload-enquiry" = "05_Admission_Enquiry/upload-enquiry.html"
  }
  "06_Student" = @{
    "add-student" = "06_Student/add-student.html"
    "search-student" = "06_Student/search-student.html"
    "upload-student" = "06_Student/upload-student.html"
    "elective-subject-mapping" = "06_Student/elective-subject-mapping.html"
    "promote-student" = "06_Student/promote-student.html"
    "student-id-print" = "06_Student/student-id-print.html"
    "student-pickup-id-print" = "06_Student/student-pickup-id-print.html"
    "student-rfid-update" = "06_Student/student-rfid-update.html"
    "hostel-search-student" = "06_Student/hostel-search-student.html"
    "transport-search-student" = "06_Student/transport-search-student.html"
  }
  "07_Fees_Management" = @{
    "add-course-fee-type" = "07_Fees_Management/add-course-fee-type.html"
    "add-transport-fee-type" = "07_Fees_Management/add-transport-fee-type.html"
    "manage-course-fee" = "07_Fees_Management/manage-course-fee.html"
    "course-fee-structure" = "07_Fees_Management/course-fee-structure.html"
    "manage-transport-route-fee" = "07_Fees_Management/manage-transport-route-fee.html"
  }
  "08_Payments" = @{
    "course-fee-payment" = "08_Payments/course-fee-payment.html"
    "monthly-fee-payment" = "08_Payments/monthly-fee-payment.html"
    "add-course-fee-payment" = "08_Payments/add-course-fee-payment.html"
    "demand-receipt" = "08_Payments/demand-receipt.html"
    "bulk-discount" = "08_Payments/bulk-discount.html"
    "bulk-extra-fee" = "08_Payments/bulk-extra-fee.html"
    "late-fee-fine-rule" = "08_Payments/late-fee-fine-rule.html"
  }
  "09_Attendance" = @{
    "employee-attendance" = "09_Attendance/employee-attendance.html"
    "view-employee-attendance" = "09_Attendance/view-employee-attendance.html"
    "view-all-employee-attendance" = "09_Attendance/view-all-employee-attendance.html"
    "student-daily-attendance" = "09_Attendance/student-daily-attendance.html"
    "view-student-daily-attendance" = "09_Attendance/view-student-daily-attendance.html"
    "view-all-student-daily-attendance" = "09_Attendance/view-all-student-daily-attendance.html"
    "smart-card-student-attendance" = "09_Attendance/smart-card-student-attendance.html"
    "attendance-monthly-report" = "09_Attendance/attendance-monthly-report.html"
  }
  "10_Order" = @{
    "add-order" = "10_Order/add-order.html"
    "my-order" = "10_Order/my-order.html"
    "all-order" = "10_Order/all-order.html"
  }
  "11_Study_Document" = @{
    "create-study-document" = "11_Study_Document/create-study-document.html"
    "view-study-document" = "11_Study_Document/view-study-document.html"
  }
  "12_Homework" = @{
    "create-homework" = "12_Homework/create-homework.html"
    "manage-homework" = "12_Homework/manage-homework.html"
    "update-homework-report" = "12_Homework/update-homework-report.html"
    "download-homework-report" = "12_Homework/download-homework-report.html"
  }
  "13_Exam_Management" = @{
    "setup-exam-grading-config" = "13_Exam_Management/setup-exam-grading-config.html"
    "manage-exam" = "13_Exam_Management/manage-exam.html"
    "manage-exam-schedule" = "13_Exam_Management/manage-exam-schedule.html"
    "view-exam-schedule" = "13_Exam_Management/view-exam-schedule.html"
    "publish-exam-schedule" = "13_Exam_Management/publish-exam-schedule.html"
    "exam-hall-ticket" = "13_Exam_Management/exam-hall-ticket.html"
    "exam-attendance-card" = "13_Exam_Management/exam-attendance-card.html"
    "student-exam-attendance" = "13_Exam_Management/student-exam-attendance.html"
    "view-student-exam-attendance" = "13_Exam_Management/view-student-exam-attendance.html"
    "exam-hall-plan" = "13_Exam_Management/exam-hall-plan.html"
    "exam-hall-detail" = "13_Exam_Management/exam-hall-detail.html"
    "exam-sitting-plan" = "13_Exam_Management/exam-sitting-plan.html"
  }
  "14_Result_Management" = @{
    "manage-exam-subject-result" = "14_Result_Management/manage-exam-subject-result.html"
    "add-exam-subject-result" = "14_Result_Management/add-exam-subject-result.html"
    "manage-exam-result" = "14_Result_Management/manage-exam-result.html"
    "view-exam-result" = "14_Result_Management/view-exam-result.html"
    "manage-nonsubject-result" = "14_Result_Management/manage-nonsubject-result.html"
    "view-nonsubject-result" = "14_Result_Management/view-nonsubject-result.html"
    "publish-exam-result" = "14_Result_Management/publish-exam-result.html"
    "update-report-card-remarks" = "14_Result_Management/update-report-card-remarks.html"
    "generate-report-card" = "14_Result_Management/generate-report-card.html"
    "view-report-card" = "14_Result_Management/view-report-card.html"
    "publish-report-card" = "14_Result_Management/publish-report-card.html"
  }
  "15_Employee_Leave" = @{
    "employee-leave-type" = "15_Employee_Leave/employee-leave-type.html"
    "employee-leave-assign" = "15_Employee_Leave/employee-leave-assign.html"
    "add-employee-leave" = "15_Employee_Leave/add-employee-leave.html"
    "apply-self-employee-leave" = "15_Employee_Leave/apply-self-employee-leave.html"
    "approve-employee-leave" = "15_Employee_Leave/approve-employee-leave.html"
  }
  "16_Employee_Salary" = @{
    "manage-salary-head" = "16_Employee_Salary/manage-salary-head.html"
    "manage-salary-structure" = "16_Employee_Salary/manage-salary-structure.html"
    "assign-salary-structure" = "16_Employee_Salary/assign-salary-structure.html"
    "salary-payment" = "16_Employee_Salary/salary-payment.html"
    "salary-payment-process" = "16_Employee_Salary/salary-payment-process.html"
    "delete-salary-payment-process" = "16_Employee_Salary/delete-salary-payment-process.html"
    "print-salary-payslip" = "16_Employee_Salary/print-salary-payslip.html"
    "create-salary-loan" = "16_Employee_Salary/create-salary-loan.html"
    "approve-salary-loan" = "16_Employee_Salary/approve-salary-loan.html"
    "approved-salary-loan" = "16_Employee_Salary/approved-salary-loan.html"
    "manage-salary-emi-payment" = "16_Employee_Salary/manage-salary-emi-payment.html"
    "view-salary-loan-transaction" = "16_Employee_Salary/view-salary-loan-transaction.html"
    "salary-loan-report" = "16_Employee_Salary/salary-loan-report.html"
    "my-salary-loan" = "16_Employee_Salary/my-salary-loan.html"
  }
  "17_Transport" = @{
    "manage-vehicle-detail" = "17_Transport/manage-vehicle-detail.html"
    "manage-driver-detail" = "17_Transport/manage-driver-detail.html"
    "manage-stoppage" = "17_Transport/manage-stoppage.html"
    "manage-transport-route" = "17_Transport/manage-transport-route.html"
    "assign-stoppage-to-route" = "17_Transport/assign-stoppage-to-route.html"
    "assign-student-to-route" = "17_Transport/assign-student-to-route.html"
    "student-transport-report" = "17_Transport/student-transport-report.html"
  }
  "18_Holiday" = @{
    "add-event-and-holiday" = "18_Holiday/add-event-and-holiday.html"
    "view-event-and-holiday" = "18_Holiday/view-event-and-holiday.html"
  }
  "19_Configuration" = @{
    "email-template" = "19_Configuration/email-template.html"
    "sms-template" = "19_Configuration/sms-template.html"
    "system-sms-template" = "19_Configuration/system-sms-template.html"
    "sms-balance" = "19_Configuration/sms-balance.html"
    "whatsapp-balance" = "19_Configuration/whatsapp-balance.html"
    "notification-configuration" = "19_Configuration/notification-configuration.html"
    "dashboard-configuration" = "19_Configuration/dashboard-configuration.html"
  }
  "20_Mobile_App" = @{
    "parent-login-manage" = "20_Mobile_App/parent-login-manage.html"
    "create-parent-login" = "20_Mobile_App/create-parent-login.html"
  }
  "21_Online_Class" = @{
    "add-online-class" = "21_Online_Class/add-online-class.html"
    "all-online-class" = "21_Online_Class/all-online-class.html"
    "attend-online-class" = "21_Online_Class/attend-online-class.html"
  }
  "22_Communication" = @{
    "student-communication" = "22_Communication/student-communication.html"
    "student-app-communication" = "22_Communication/student-app-communication.html"
    "student-whatsapp-communication" = "22_Communication/student-whatsapp-communication.html"
    "employee-communication" = "22_Communication/employee-communication.html"
    "print-notice" = "22_Communication/print-notice.html"
    "notice-board-management" = "22_Communication/notice-board-management.html"
    "daily-dairy-manage" = "22_Communication/daily-dairy-manage.html"
    "school-newsletter" = "22_Communication/school-newsletter.html"
  }
  "23_Certificate" = @{
    "school-leaving-certificate" = "23_Certificate/school-leaving-certificate.html"
    "student-bonafide-certificate" = "23_Certificate/student-bonafide-certificate.html"
  }
  "24_Finance" = @{
    "create-finance-account" = "24_Finance/create-finance-account.html"
    "add-finance-account-head" = "24_Finance/add-finance-account-head.html"
    "add-finance-expense-record" = "24_Finance/add-finance-expense-record.html"
    "add-finance-income-record" = "24_Finance/add-finance-income-record.html"
    "account-balance-transfer" = "24_Finance/account-balance-transfer.html"
    "finance-account-statement" = "24_Finance/finance-account-statement.html"
    "finance-daily-register" = "24_Finance/finance-daily-register.html"
    "finance-profit-and-loss" = "24_Finance/finance-profit-and-loss.html"
  }
  "25_Product_Inventory" = @{
    "add-product-category" = "25_Product_Inventory/add-product-category.html"
    "add-product" = "25_Product_Inventory/add-product.html"
    "product-inventory-stock-in" = "25_Product_Inventory/product-inventory-stock-in.html"
    "product-inventory-stock-out" = "25_Product_Inventory/product-inventory-stock-out.html"
    "manage-product-inventory" = "25_Product_Inventory/manage-product-inventory.html"
    "product-additional-fields-mapping" = "25_Product_Inventory/product-additional-fields-mapping.html"
  }
  "26_Rate_Plan_Tax" = @{
    "add-product-rate-plan" = "26_Rate_Plan_Tax/add-product-rate-plan.html"
    "all-product-rate-plan" = "26_Rate_Plan_Tax/all-product-rate-plan.html"
    "product-tax-rule" = "26_Rate_Plan_Tax/product-tax-rule.html"
  }
  "27_Reports" = @{
    "download-payment-receipt-pdf" = "27_Reports/download-payment-receipt-pdf.html"
    "download-payment-receipt" = "27_Reports/download-payment-receipt.html"
    "download-due-payment" = "27_Reports/download-due-payment.html"
    "due-payment-with-detail" = "27_Reports/due-payment-with-detail.html"
    "admission-report" = "27_Reports/admission-report.html"
    "receipt-revert-report" = "27_Reports/receipt-revert-report.html"
  }
  "28_Website" = @{
    "flash-news" = "28_Website/flash-news.html"
    "page-setup" = "28_Website/page-setup.html"
    "page-content-setup" = "28_Website/page-content-setup.html"
  }
}

$total = 0
foreach ($m in $routes.Keys) { $total += $routes[$m].Count }
"Total routes: $total"
$routes | ConvertTo-Json -Depth 5 | Set-Content "D:\Snredu\Educationdesk\99_RAW\routes.json" -Encoding UTF8
"Saved routes manifest"
