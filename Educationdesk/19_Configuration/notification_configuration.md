# Enable Disable Auto Notification

Route: /employee/notification-configuration

Title: Education Desk

HTML Size: 70.2 KB

## Forms

### Form 1
- Action: notification-configuration-additional
- Method: POST

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| resource_key_name_STUDENT_ABSENT_ALERT_SENT_TIME | hidden |  | STUDENT_ABSENT_ALERT_SENT_TIME |
| resource_key_value_STUDENT_ABSENT_ALERT_SENT_TIME | text |  | 01:10 PM |
| resource_key_name_PAYMENT_DETAIL_SMS_ENABLED | hidden |  | PAYMENT_DETAIL_SMS_ENABLED |
| resource_key_value_PAYMENT_DETAIL_SMS_ENABLED | checkbox |  | yes |
| resource_key_name_COLLEGE_STUDENT_REG_PRE_TEXT | hidden |  | COLLEGE_STUDENT_REG_PRE_TEXT |
| resource_key_value_COLLEGE_STUDENT_REG_PRE_TEXT | text |  |  |
| resource_key_name_DEMAND_RECEIPT_REMARKS_TEXT | hidden |  | DEMAND_RECEIPT_REMARKS_TEXT |
| resource_key_name_HALL_TICKET_REMARKS_TEXT | hidden |  | HALL_TICKET_REMARKS_TEXT |
| resource_key_name_SINGLE_PAGE_RECEIPT | hidden |  | SINGLE_PAGE_RECEIPT |
| resource_key_value_SINGLE_PAGE_RECEIPT | checkbox |  | yes |
| resource_key_name_STUDENT_DOB_REMOVE | hidden |  | STUDENT_DOB_REMOVE |
| resource_key_value_STUDENT_DOB_REMOVE | checkbox |  | no |
| resource_key_name_ATTEDANCE_SMS_SKIP_FOR_APP_USER | hidden |  | ATTEDANCE_SMS_SKIP_FOR_APP_USER |
| resource_key_value_ATTEDANCE_SMS_SKIP_FOR_APP_USER | checkbox |  | no |
| resource_key_name_ATTENDANCE_OUT_TIME_LIMIT | hidden |  | ATTENDANCE_OUT_TIME_LIMIT |
| resource_key_value_ATTENDANCE_OUT_TIME_LIMIT | text |  | 60 |

#### Checkboxes
- resource_key_value_PAYMENT_DETAIL_SMS_ENABLED = yes
- resource_key_value_SINGLE_PAGE_RECEIPT = yes
- resource_key_value_STUDENT_DOB_REMOVE = no
- resource_key_value_ATTEDANCE_SMS_SKIP_FOR_APP_USER = no

### Form 2
- Action: notification-configuration
- Method: POST

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| notification_name | hidden |  | NEW_ADMISSION_NOTIFICATION |
| noti_NEW_ADMISSION_NOTIFICATION_sms | checkbox |  | 1 |
| noti_NEW_ADMISSION_NOTIFICATION_email | checkbox |  | 1 |
| noti_NEW_ADMISSION_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_NEW_ADMISSION_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | ON_FEE_PAYMENT_NOTIFICATION |
| noti_ON_FEE_PAYMENT_NOTIFICATION_sms | checkbox |  | 1 |
| noti_ON_FEE_PAYMENT_NOTIFICATION_email | checkbox |  | 1 |
| noti_ON_FEE_PAYMENT_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_ON_FEE_PAYMENT_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | STUDENT_ATTENDANCE_IN_NOTIFICATION |
| noti_STUDENT_ATTENDANCE_IN_NOTIFICATION_sms | checkbox |  | 1 |
| noti_STUDENT_ATTENDANCE_IN_NOTIFICATION_email | checkbox |  | 1 |
| noti_STUDENT_ATTENDANCE_IN_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_STUDENT_ATTENDANCE_IN_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | STUDENT_ATTENDANCE_OUT_NOTIFICATION |
| noti_STUDENT_ATTENDANCE_OUT_NOTIFICATION_sms | checkbox |  | 1 |
| noti_STUDENT_ATTENDANCE_OUT_NOTIFICATION_email | checkbox |  | 1 |
| noti_STUDENT_ATTENDANCE_OUT_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_STUDENT_ATTENDANCE_OUT_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | EMPLOYEE_ATTENDANCE_IN_NOTIFICATION |
| noti_EMPLOYEE_ATTENDANCE_IN_NOTIFICATION_sms | checkbox |  | 1 |
| noti_EMPLOYEE_ATTENDANCE_IN_NOTIFICATION_email | checkbox |  | 1 |
| noti_EMPLOYEE_ATTENDANCE_IN_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_EMPLOYEE_ATTENDANCE_IN_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | EMPLOYEE_ATTENDANCE_OUT_NOTIFICATION |
| noti_EMPLOYEE_ATTENDANCE_OUT_NOTIFICATION_sms | checkbox |  | 1 |
| noti_EMPLOYEE_ATTENDANCE_OUT_NOTIFICATION_email | checkbox |  | 1 |
| noti_EMPLOYEE_ATTENDANCE_OUT_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_EMPLOYEE_ATTENDANCE_OUT_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | STUDENT_BIRTHDAY_NOTIFICATION |
| noti_STUDENT_BIRTHDAY_NOTIFICATION_sms | checkbox |  | 1 |
| noti_STUDENT_BIRTHDAY_NOTIFICATION_email | checkbox |  | 1 |
| noti_STUDENT_BIRTHDAY_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_STUDENT_BIRTHDAY_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | EMPLOYEE_BIRTHDAY_NOTIFICATION |
| noti_EMPLOYEE_BIRTHDAY_NOTIFICATION_sms | checkbox |  | 1 |
| noti_EMPLOYEE_BIRTHDAY_NOTIFICATION_email | checkbox |  | 1 |
| noti_EMPLOYEE_BIRTHDAY_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_EMPLOYEE_BIRTHDAY_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | EMPLOYEE_LEAVE_APPLY_NOTIFICATION |
| noti_EMPLOYEE_LEAVE_APPLY_NOTIFICATION_sms | checkbox |  | 1 |
| noti_EMPLOYEE_LEAVE_APPLY_NOTIFICATION_email | checkbox |  | 1 |
| noti_EMPLOYEE_LEAVE_APPLY_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_EMPLOYEE_LEAVE_APPLY_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | EMPLOYEE_LEAVE_APPROVE_NOTIFICATION |
| noti_EMPLOYEE_LEAVE_APPROVE_NOTIFICATION_sms | checkbox |  | 1 |
| noti_EMPLOYEE_LEAVE_APPROVE_NOTIFICATION_email | checkbox |  | 1 |
| noti_EMPLOYEE_LEAVE_APPROVE_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_EMPLOYEE_LEAVE_APPROVE_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | STUDENT_ABSENT_NOTIFICATION |
| noti_STUDENT_ABSENT_NOTIFICATION_sms | checkbox |  | 1 |
| noti_STUDENT_ABSENT_NOTIFICATION_email | checkbox |  | 1 |
| noti_STUDENT_ABSENT_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_STUDENT_ABSENT_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | PARENT_LOGIN_NOTIFICATION |
| noti_PARENT_LOGIN_NOTIFICATION_sms | checkbox |  | 1 |
| noti_PARENT_LOGIN_NOTIFICATION_email | checkbox |  | 1 |
| noti_PARENT_LOGIN_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_PARENT_LOGIN_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | STUDENT_PROMOTE_NOTIFICATION |
| noti_STUDENT_PROMOTE_NOTIFICATION_sms | checkbox |  | 1 |
| noti_STUDENT_PROMOTE_NOTIFICATION_email | checkbox |  | 1 |
| noti_STUDENT_PROMOTE_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_STUDENT_PROMOTE_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | HOMEWORK_CREATE_NOTIFICATION |
| noti_HOMEWORK_CREATE_NOTIFICATION_sms | checkbox |  | 1 |
| noti_HOMEWORK_CREATE_NOTIFICATION_email | checkbox |  | 1 |
| noti_HOMEWORK_CREATE_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_HOMEWORK_CREATE_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | DAILY_DIARY_CREATE_NOTIFICATION |
| noti_DAILY_DIARY_CREATE_NOTIFICATION_sms | checkbox |  | 1 |
| noti_DAILY_DIARY_CREATE_NOTIFICATION_email | checkbox |  | 1 |
| noti_DAILY_DIARY_CREATE_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_DAILY_DIARY_CREATE_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | STUDY_DOCUMENT_CREATE_NOTIFICATION |
| noti_STUDY_DOCUMENT_CREATE_NOTIFICATION_sms | checkbox |  | 1 |
| noti_STUDY_DOCUMENT_CREATE_NOTIFICATION_email | checkbox |  | 1 |
| noti_STUDY_DOCUMENT_CREATE_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_STUDY_DOCUMENT_CREATE_NOTIFICATION_whatsapp | checkbox |  | 1 |
| notification_name | hidden |  | ONLINE_REGISTRATION_NOTIFICATION |
| noti_ONLINE_REGISTRATION_NOTIFICATION_sms | checkbox |  | 1 |
| noti_ONLINE_REGISTRATION_NOTIFICATION_email | checkbox |  | 1 |
| noti_ONLINE_REGISTRATION_NOTIFICATION_app_notification | checkbox |  | 1 |
| noti_ONLINE_REGISTRATION_NOTIFICATION_whatsapp | checkbox |  | 1 |

### Form 3
- Action: setup-exam-grading-config
- Method: GET

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| edit_exam_grade_id | hidden |  | 0 |

## Data Table Columns

1. Configuration Name
2. Configuration Value
3. Notification Name
4. SMS
5. Email
6. App Notification
7. WhatsApp

## JS Functions

- editFun()

## Sidebar

- Log Out -> /employee/emp-logout
-  -> javascript:;

## Assets

### CSS (21)
- /static/vendors/bootstrap/dist/css/bootstrap.min.css
- /static/vendors/font-awesome/css/font-awesome.min.css
- /static/vendors/nprogress/nprogress.css
- /static/vendors/iCheck/skins/flat/green.css
- /static/vendors/bootstrap-progressbar/css/bootstrap-progressbar-3.3.4.min.css
- /static/vendors/animate.css/animate.min.css
- /static/vendors/jqvmap/dist/jqvmap.min.css
- /static/vendors/bootstrap-daterangepicker/daterangepicker.css
- /static/css/jquery-ui.min.css
- /static/vendors/select2/dist/css/select2.min.css
- /static/vendors/datatables.net-bs/css/dataTables.bootstrap.min.css
- /static/vendors/datatables.net-buttons-bs/css/buttons.bootstrap.min.css
- /static/vendors/datatables.net-fixedheader-bs/css/fixedHeader.bootstrap.min.css
- /static/vendors/datatables.net-responsive-bs/css/responsive.bootstrap.min.css
- /static/vendors/datatables.net-scroller-bs/css/scroller.bootstrap.min.css
- /static/vendors/pnotify/dist/pnotify.css
- /static/vendors/pnotify/dist/pnotify.buttons.css
- /static/vendors/pnotify/dist/pnotify.nonblock.css
- /static/assets/clockpicker/bootstrap-clockpicker.min.css
- /static/assets/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css
- /static/build/css/custom.min.css?v=2.6

### JS (56)
- /static/vendors/jquery/dist/jquery.min.js
- /static/vendors/bootstrap/dist/js/bootstrap.min.js?v=1.1
- /static/vendors/fastclick/lib/fastclick.js
- /static/vendors/nprogress/nprogress.js
- /static/vendors/Chart.js/dist/Chart.min.js
- /static/vendors/echarts/dist/echarts.min.js
- /static/vendors/gauge.js/dist/gauge.min.js
- /static/vendors/iCheck/icheck.min.js
- /static/vendors/bootstrap-progressbar/bootstrap-progressbar.min.js
- /static/vendors/skycons/skycons.js
- /static/vendors/Flot/jquery.flot.js
- /static/vendors/Flot/jquery.flot.pie.js
- /static/vendors/Flot/jquery.flot.time.js
- /static/vendors/Flot/jquery.flot.stack.js
- /static/vendors/Flot/jquery.flot.resize.js
- /static/vendors/flot.orderbars/js/jquery.flot.orderBars.js
- /static/vendors/flot-spline/js/jquery.flot.spline.min.js
- /static/vendors/flot.curvedlines/curvedLines.js
- /static/vendors/DateJS/build/date.js
- /static/vendors/jqvmap/dist/jquery.vmap.js
- /static/vendors/jqvmap/dist/maps/jquery.vmap.world.js
- /static/vendors/jqvmap/examples/js/jquery.vmap.sampledata.js
- /static/vendors/moment/min/moment.min.js
- /static/vendors/bootstrap-daterangepicker/daterangepicker.js?v=1.4
- /static/vendors/bootstrap-wysiwyg/js/bootstrap-wysiwyg.min.js
- /static/vendors/jquery.hotkeys/jquery.hotkeys.js
- /static/vendors/google-code-prettify/src/prettify.js
- /static/vendors/jquery.tagsinput/src/jquery.tagsinput.js
- /static/vendors/switchery/dist/switchery.min.js
- /static/vendors/select2/dist/js/select2.full.min.js
- /static/vendors/parsleyjs/dist/parsley.min.js
- /static/vendors/autosize/dist/autosize.min.js
- /static/vendors/devbridge-autocomplete/dist/jquery.autocomplete.min.js
- /static/vendors/starrr/dist/starrr.js
- /static/vendors/datatables.net/js/jquery.dataTables.min.js
- /static/vendors/datatables.net-bs/js/dataTables.bootstrap.min.js
- /static/vendors/datatables.net-buttons/js/dataTables.buttons.min.js
- /static/vendors/datatables.net-buttons-bs/js/buttons.bootstrap.min.js
- /static/vendors/datatables.net-buttons/js/buttons.flash.min.js
- /static/vendors/datatables.net-buttons/js/buttons.html5.min.js
- /static/vendors/datatables.net-buttons/js/buttons.print.min.js
- /static/vendors/datatables.net-fixedheader/js/dataTables.fixedHeader.min.js
- /static/vendors/datatables.net-keytable/js/dataTables.keyTable.min.js
- /static/vendors/datatables.net-responsive/js/dataTables.responsive.min.js
- /static/vendors/datatables.net-responsive-bs/js/responsive.bootstrap.js
- /static/vendors/jszip/dist/jszip.min.js
- /static/vendors/pdfmake/build/pdfmake.min.js
- /static/vendors/pdfmake/build/vfs_fonts.js
- /static/vendors/pnotify/dist/pnotify.js
- /static/vendors/pnotify/dist/pnotify.buttons.js
- /static/vendors/pnotify/dist/pnotify.nonblock.js
- /static/assets/clockpicker/bootstrap-clockpicker.min.js?v=1.6
- /static/assets/jquery-validation/js/jquery.validate.js
- /static/assets/bootstrap-switch/dist/js/bootstrap-switch.js
- /static/build/js/custom.js?v=4.2
- /static/build/js/common.js?v=2.4

## Links (168)

- home
- employee-profile
- /employee/emp-logout
- /app/dashboard
- add-employee
- search-employee
- add-designation
- add-department
- upload-employee
- employee-id-print
- add-batch
- add-course
- add-course-details
- add-subject
- add-non-subject
- add-syllabus
- all-syllabus
- add-time-table
- view-time-table
- time-table-assign
- ... and 148 more

## Layout

Grid: col-md-3, col-md-12

