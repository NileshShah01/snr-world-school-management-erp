# Class Details

Route: /employee/add-course

Title: Education Desk

HTML Size: 78.3 KB

## Forms

### Form 1
- Action: add-course
- Method: POST

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| name | text | Enter Name |  |
| course_id | hidden |  | 0 |
| course_type_session | text | Enter Session | 1 |
| course_code | text | Enter Course Code |  |
| course_enabled | checkbox |  |  |

#### Selects
- course_batch: 4 options
  -  = 
  -  = 
  -  = 
  -  = 
- department_id: 2 options
  -  = 
  -  = 
- course_type: 2 options
  -  = 
  -  = 
- course_index_id: 30 options
- section: 11 options

### Form 2
- Action: add-course
- Method: GET

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| edit_course_id | hidden |  | 0 |

## Data Table Columns

1. Session
2. Class
3. Class Type
4. No. Of Sessions
5. Code
6. Section
7. Status

## JS Functions

- editFun()

## Inline Events

- onclick=editFun(10526)
- onclick=editFun(10528)
- onclick=editFun(10530)
- onclick=editFun(10532)
- onclick=editFun(10534)
- onclick=editFun(10536)
- onclick=editFun(10538)
- onclick=editFun(10540)
- onclick=editFun(10542)
- onclick=editFun(10544)
- onclick=editFun(10546)
- onclick=editFun(10548)
- onclick=editFun(10550)
- onclick=editFun(10664)
- onclick=editFun(12782)
- onclick=editFun(12784)
- onclick=editFun(12786)
- onclick=editFun(12788)
- onclick=editFun(12790)
- onclick=editFun(12792)
- onclick=editFun(12794)
- onclick=editFun(12796)
- onclick=editFun(12798)
- onclick=editFun(12800)
- onclick=editFun(12802)
- onclick=editFun(15572)
- onclick=editFun(15574)
- onclick=editFun(15576)
- onclick=editFun(15578)
- onclick=editFun(15580)
- onclick=editFun(15582)
- onclick=editFun(15584)
- onclick=editFun(15586)
- onclick=editFun(15588)
- onclick=editFun(15590)
- onclick=editFun(21971)
- onclick=editFun(21973)
- onclick=editFun(21975)
- onclick=editFun(21977)
- onclick=editFun(21979)
- onclick=editFun(21981)
- onclick=editFun(21983)
- onclick=editFun(21985)
- onclick=editFun(21987)
- onclick=editFun(21989)
- onclick=editFun(24082)

## Sessions

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

Grid: col-md-3, col-md-12, col-md-6

