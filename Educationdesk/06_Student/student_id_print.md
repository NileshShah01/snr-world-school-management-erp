# Student Id Print

Route: /employee/student-id-print

Title: Education Desk

HTML Size: 137.1 KB

## Forms

### Form 1
- Action: student-id-print
- Method: POST

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| student_type_select | radio |  | batch |
| student_type_select | radio |  | course |
| student_type_select | radio |  | partial |
| communication_type_select | radio |  | vertical |
| communication_type_select | radio |  | horizontal |
| template_select | radio |  | 1 |
| template_select | radio |  | 2 |
| template_select | radio |  | 3 |
| template_select | radio |  | 4 |
| template_select | radio |  | 5 |
| template_select | radio |  | 6 |
| template_select | radio |  | 7 |
| template_select | radio |  | 8 |
| template_select | radio |  | 9 |
| template_select | radio |  | 10 |
| template_select | radio |  | 11 |
| template_select | radio |  | 12 |
| template_select | radio |  | 13 |
| template_select | radio |  | 14 |
| template_select | radio |  | 15 |
| template_select | radio |  | 16 |
| template_select | radio |  | 17 |
| template_select | radio |  | 18 |
| template_select | radio |  | 19 |
| template_select | radio |  | 20 |
| template_select | radio |  | 21 |
| template_select | radio |  | 22 |
| template_select | radio |  | 23 |
| template_select | radio |  | 24 |
| template_select | radio |  | 25 |
| template_select | radio |  | 26 |
| template_select | radio |  | 27 |
| template_select | radio |  | 28 |
| template_select | radio |  | 29 |
| template_select | radio |  | 30 |
| template_select | radio |  | 31 |
| template_select | radio |  | 32 |
| template_select | radio |  | 33 |
| template_select | radio |  | 34 |
| template_select | radio |  | 35 |
| template_select | radio |  | 36 |
| template_select | radio |  | 37 |
| template_select | radio |  | 38 |
| template_select | radio |  | 39 |
| template_select | radio |  | 40 |
| template_select | radio |  | 41 |
| template_select | radio |  | 42 |
| template_select | radio |  | 43 |
| template_select | radio |  | 100 |
| template_select | radio |  | 101 |
| template_select | radio |  | 102 |
| template_select | radio |  | 103 |
| template_select | radio |  | 104 |
| template_select | radio |  | 105 |
| template_select | radio |  | 100 |
| template_select | radio |  | 101 |
| template_select | radio |  | 102 |
| template_select | radio |  | 103 |
| template_select | radio |  | 104 |
| template_select | radio |  | 105 |
| template_select | radio |  | 106 |
| manual_color | color |  | #000000 |
| costomize_type_select | radio |  | default |
| costomize_type_select | radio |  | custom |
| old_design | checkbox |  | old |

#### Selects
- course_batch: 4 options
  -  = 
  -  = 
  -  = 
  -  = 
- batch_course: 0 options
- batch_course_batch: 4 options
  -  = 
  -  = 
  -  = 
  -  = 
- partial_course_batch: 4 options
  -  = 
  -  = 
  -  = 
  -  = 
- partial_batch_course: 0 options
- partial_student: 0 options
- partial_student_selected: 0 options
- id_card_type: 0 options
- heading_font: 19 options
- heading_font_size: 45 options
- heading_font_line_height: 50 options
- subtitle_font: 16 options
- subtitle_font_size: 25 options
- subtitle_font_line_height: 30 options
- id_detail_font_size: 25 options
- id_detail_line_height: 30 options
- id_name_title_font_size: 30 options

## AJAX Endpoints

- /employee/get-parent-course?course_batch_id=
- /employee/get-student-for-course?course_id=

## JS Functions

- loadBatchCourses()
- loadStudentsForCourses()
- fnFontChange()
- fnFontSizeChange()
- fnFontLineHeightChange()
- fnFontChangeSubtitle()
- fnFontSizeChangeSubtitle()
- fnFontLineHeightChangeSubtitle()
- fnFontSizeChangeIdDetail()
- fnFontLineHeightChangeIdDetail()
- fnFontLineHeightChangeNameTitle()
- copyToMultiSelect()

## Inline Events

- onsubmit=showLoader();
- onchange=loadBatchCourses(this)
- onchange=loadStudentsForCourses(this)
- onchange=copyToMultiSelect()
- onchange=fnFontChange(this)
- onchange=fnFontSizeChange(this)
- onchange=fnFontLineHeightChange(this)
- onchange=fnFontChangeSubtitle(this)
- onchange=fnFontSizeChangeSubtitle(this)
- onchange=fnFontLineHeightChangeSubtitle(this)
- onchange=fnFontSizeChangeIdDetail(this)
- onchange=fnFontLineHeightChangeIdDetail(this)
- onchange=fnFontLineHeightChangeNameTitle(this)

## Sessions

- 525 = 2023-2024
- 616 = 2024-2025
- 786 = 2025-2026
- 1127 = 2026-2027
- 525 = 2023-2024
- 616 = 2024-2025
- 786 = 2025-2026
- 1127 = 2026-2027
- 525 = 2023-2024
- 616 = 2024-2025
- 786 = 2025-2026
- 1127 = 2026-2027

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

Grid: col-md-3, col-md-12, col-md-4, col-md-6, col-md-2, col-md-9

