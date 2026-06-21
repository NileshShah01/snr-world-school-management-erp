# Website Menu Setup

Route: /employee/page-setup

Title: Education Desk

HTML Size: 82.3 KB

## Forms

### Form 1
- Action: page-setup
- Method: POST

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| parent_priv_input_1 | checkbox |  | 1 |
| parent_priv_input_50 | checkbox |  | 50 |
| child_priv_input_51 | checkbox |  | 51 |
| child_priv_input_52 | checkbox |  | 52 |
| child_priv_input_53 | checkbox |  | 53 |
| child_priv_input_54 | checkbox |  | 54 |
| child_priv_input_55 | checkbox |  | 55 |
| child_priv_input_56 | checkbox |  | 56 |
| child_priv_input_57 | checkbox |  | 57 |
| parent_priv_input_100 | checkbox |  | 100 |
| child_priv_input_101 | checkbox |  | 101 |
| parent_priv_input_102 | checkbox |  | 102 |
| child_priv_input_103 | checkbox |  | 103 |
| child_priv_input_104 | checkbox |  | 104 |
| child_priv_input_105 | checkbox |  | 105 |
| child_priv_input_106 | checkbox |  | 106 |
| child_priv_input_107 | checkbox |  | 107 |
| parent_priv_input_108 | checkbox |  | 108 |
| child_priv_input_109 | checkbox |  | 109 |
| child_priv_input_110 | checkbox |  | 110 |
| child_priv_input_111 | checkbox |  | 111 |
| child_priv_input_112 | checkbox |  | 112 |
| parent_priv_input_150 | checkbox |  | 150 |
| child_priv_input_151 | checkbox |  | 151 |
| child_priv_input_152 | checkbox |  | 152 |
| child_priv_input_153 | checkbox |  | 153 |
| parent_priv_input_200 | checkbox |  | 200 |
| child_priv_input_201 | checkbox |  | 201 |
| child_priv_input_202 | checkbox |  | 202 |
| child_priv_input_203 | checkbox |  | 203 |
| child_priv_input_204 | checkbox |  | 204 |
| child_priv_input_205 | checkbox |  | 205 |
| child_priv_input_206 | checkbox |  | 206 |
| parent_priv_input_250 | checkbox |  | 250 |
| parent_priv_input_251 | checkbox |  | 251 |
| child_priv_input_253 | checkbox |  | 253 |
| child_priv_input_252 | checkbox |  | 252 |
| parent_priv_input_300 | checkbox |  | 300 |
| child_priv_input_301 | checkbox |  | 301 |
| parent_priv_input_350 | checkbox |  | 350 |
| parent_priv_input_400 | checkbox |  | 400 |
| child_priv_input_401 | checkbox |  | 401 |
| child_priv_input_402 | checkbox |  | 402 |
| parent_priv_input_450 | checkbox |  | 450 |
| child_priv_input_451 | checkbox |  | 451 |
| child_priv_input_452 | checkbox |  | 452 |
| hidden_parent_priv_fields | hidden |  |  |
| hidden_child_priv_fields | hidden |  |  |

### Form 2
- Action: add-designation
- Method: GET

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| edit_designation | hidden |  |  |

## JS Functions

- getNewDesignation()
- getSubChildPriv()
- childPrivileges()
- getSubmitWithPrivileges()

## Inline Events

- onchange=getSubChildPriv(this,1)
- onchange=getSubChildPriv(this,50)
- onchange=getSubChildPriv(this,100)
- onchange=getSubChildPriv(this,102)
- onchange=getSubChildPriv(this,108)
- onchange=getSubChildPriv(this,150)
- onchange=getSubChildPriv(this,200)
- onchange=getSubChildPriv(this,250)
- onchange=getSubChildPriv(this,251)
- onchange=getSubChildPriv(this,300)
- onchange=getSubChildPriv(this,350)
- onchange=getSubChildPriv(this,400)
- onchange=getSubChildPriv(this,450)
- onclick=getSubmitWithPrivileges()

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

