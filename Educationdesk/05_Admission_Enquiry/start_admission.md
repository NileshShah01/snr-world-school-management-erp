# Add Student

Route: /employee/start-admission

Title: Education Desk

HTML Size: 114.4 KB

## Forms

### Form 1
- Action: add-student
- Method: POST

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| customer_id | hidden |  | 0 |
| enquiry_id | hidden |  | 0 |
| profile_pic_url | hidden |  | /static/images/student_profile_default.jpg |
| name | text | Enter Name |  |
| student_id | hidden |  | 0 |
| date_of_birth | text | Select DOB |  |
| phone | text | Enter Phone |  |
| email | email | Enter Email |  |
| rf_id_number | text | Enter Smart Card Number |  |
| aadhar_number | text | Enter Aadhar Number |  |
| student_religion_other | text | Enter Religion Other |  |
| student_category_other | text | Enter Category Other |  |
| student_cast | text | Enter Student Cast |  |
| total_height | text | Enter Student Height |  |
| total_weight | text | Enter Student Weight |  |
| pen_number | text | Enter Student P.E.N |  |
| apaar_number | text | Enter Student APAAR |  |
| father_aadhar_number | text | Enter Father's Aadhar Number |  |
| mother_aadhar_number | text | Enter Mother's Aadhar Number |  |
| enabled | checkbox |  |  |
| academic_row_count | hidden |  | 1 |
| academic_course_name_1 | text | Enter Course/Class Name |  |
| academic_passing_year_1 | text | Enter Passing Year |  |
| academic_total_marks_1 | text | Enter Marks or Grade |  |
| academic_college_name_1 | text | Enter College/School Name |  |
| admission_no | text | Enter Admission No |  |
| joining_date | text | Select Joining Date |  |
| student_code | text | Enter Student Registration | 574 |
| roll_code | text | Class Roll No |  |
| additinal_fee_add_count | hidden |  | 1 |
| hostel_alloted | checkbox |  | no |
| hostel_name | text | Hostel Name |  |
| hostel_room_no | text | Hostel Room Number |  |
| transport_alloted | checkbox |  | no |
| transport_route_name | text | Transport Route Name |  |
| transport_bus_no | text | Bus Number |  |
| father_name | text | Enter Father Name |  |
| mother_name | text | Enter Mother Name |  |
| father_occupation | text | Enter Father Occupation |  |
| mother_occupation | text | Enter Mother Occupation |  |
| father_qualification_other | text | Enter Father Qualification Other |  |
| mother_qualification_other | text | Enter Mother Qualification Other |  |
| guardian_name | text | Enter Guardian Name |  |
| guardian_phone | text | Enter Guardian Phone |  |
| guardian_email | text | Enter Guardian Email |  |
| city | text | Enter City |  |
| pincode | text | Enter Pincode |  |

#### Selects
- gender: 2 options
  -  = 
  -  = 
- blood_group: 8 options
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
- student_religion: 7 options
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
- student_category: 7 options
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
- course_batch: 4 options
  -  = 
  -  = 
  -  = 
  -  = 
- fee_plan_type: 2 options
  -  = 
  -  = 
- parent_course: 0 options
- section: 0 options
- father_qualification: 7 options
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
- mother_qualification: 7 options
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 

### Form 2
- Action: /employee/profile-img-upload
- Method: POST
- Enctype: multipart/form-data

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
|  | file |  |  |

### Form 3
- Action: /employee/document-upload
- Method: POST
- Enctype: multipart/form-data

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| file_name | text |  |  |
| document_input | file |  |  |

### Form 4
- Action: /employee/profile-img-upload
- Method: POST
- Enctype: multipart/form-data

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| file | file |  |  |
| profile_image | file |  |  |

## AJAX Endpoints

- /employee/get-parent-course?course_batch_id=
- /employee/get-fee-type-extra-add-payment?batch_id=
- /employee/get-transport-route-stoppage-option?transport_route_id=
- /employee/get-transport-route-fee-option?transport_route_id=
- get-parent-course-section?course_id=
- upload-profile-img-data

## Data Table Columns

1. File Name
2. Status
3. Download/View
4. Remove

## JS Functions

- editFun()
- loadParentCourse()
- changeImgDilogShow()
- changeImgDilogHide()
- uploadPicJqueryForm()
- checkFile()
- removeAcademicDetail()
- addAcademicDetail()
- uploadDocumentPopUp()
- uploadDocumentForm()
- checkDocumentFile()
- removeDoc()
- loadFeeForCourse()
- addExtraPayment()
- addExtraPaymentOption()
- downloadFeesStructure()
- loadStoppageForRoute()
- loadTransportFee()
- loadCourseSection()
- removeExtraPayment()
- reLoadCrop()
- selectOther()
- disableCamera()
- clickPhotoAttach()
- clickPhoto()
- changeDocumentName()

## Inline Events

- onchange=selectOther('student_religion',this)
- onchange=selectOther('student_category',this)
- onclick=addAcademicDetail()
- onchange=loadParentCourse(this);
- onchange=loadParentCourse('#course_batch');
- onchange=loadFeeForCourse(this);
- onchange=selectOther('father_qualification',this)
- onchange=selectOther('mother_qualification',this)
- onclick=uploadDocumentPopUp()
- onclick=uploadPicJqueryForm()
- onclick=uploadDocumentForm()
- onclick=clickPhotoAttach()
- onclick=clickPhoto()
- onclick=removeAcademicDetail('+academicRowCount+')

## Sessions

- 525 = 2023-2024
- 616 = 2024-2025
- 786 = 2025-2026
- 1127 = 2026-2027

## Sidebar

- Log Out -> /employee/emp-logout
-  -> javascript:;

## Assets

### CSS (22)
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
- /static/vendors/cropper/dist/cropper.min.css

### JS (60)
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
- /static/js/jquery-ui.min.js
- /static/js/jquery.form.js
- /static/vendors/cropper/dist/cropper.min.js
- /static/js/webcamjs/webcam.min.js

## Uploads

- document_input
- file
- profile_image

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

Grid: col-md-3, col-md-12, col-md-9, col-md-6, col-md-2, col-md-4

