# Print Notice

Route: /employee/print-notice

Title: Education Desk

HTML Size: 56 KB

## Forms

### Form 1
- Action: print-notice
- Method: POST

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| notice_name | text | Enter Template Name |  |
| notice_save | checkbox |  |  |

#### Selects
- no_of_print: 10 options
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 
  -  = 

### Form 2
- Action: print-notice
- Method: POST

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| edit_email_template_id | hidden |  | 0 |
| edit_mode | hidden |  | 1 |
| action_type | hidden |  | LOAD |

### Form 3
- Action: print-notice
- Method: POST

#### Input Fields
| Name | Type | Placeholder | Default |
|------|------|-------------|---------|
| delete_email_template_id | hidden |  | 0 |
| action_type | hidden |  | DELETE |

## Data Table Columns

1. Name
2. Create Date
3. Enabled
4. Delete

## JS Functions

- editFun()
- copyData()
- removeTemplate()
- removeConfirmation()

## Inline Events

- onsubmit=copyData();
- onclick=removeConfirmation();

## Sidebar

- Log Out -> /employee/emp-logout
-  -> javascript:;

## Assets

### CSS (38)
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
- /static/vendors/wysiwyg-editor/css/froala_editor.css
- /static/vendors/wysiwyg-editor/css/froala_style.css
- /static/vendors/wysiwyg-editor/css/plugins/code_view.css
- /static/vendors/wysiwyg-editor/css/plugins/draggable.css
- /static/vendors/wysiwyg-editor/css/plugins/colors.css
- /static/vendors/wysiwyg-editor/css/plugins/emoticons.css
- /static/vendors/wysiwyg-editor/css/plugins/image_manager.css
- /static/vendors/wysiwyg-editor/css/plugins/image.css
- /static/vendors/wysiwyg-editor/css/plugins/line_breaker.css
- /static/vendors/wysiwyg-editor/css/plugins/table.css
- /static/vendors/wysiwyg-editor/css/plugins/char_counter.css
- /static/vendors/wysiwyg-editor/css/plugins/video.css
- /static/vendors/wysiwyg-editor/css/plugins/fullscreen.css
- /static/vendors/wysiwyg-editor/css/plugins/file.css
- /static/vendors/wysiwyg-editor/css/plugins/quick_insert.css
- /static/vendors/wysiwyg-editor/css/plugins/help.css
- /static/vendors/wysiwyg-editor/css/plugins/special_characters.css

### JS (89)
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
- /static/vendors/wysiwyg-editor/js/froala_editor.min.js
- /static/vendors/wysiwyg-editor/js/plugins/align.min.js
- /static/vendors/wysiwyg-editor/js/plugins/char_counter.min.js
- /static/vendors/wysiwyg-editor/js/plugins/code_beautifier.min.js
- /static/vendors/wysiwyg-editor/js/plugins/code_view.min.js
- /static/vendors/wysiwyg-editor/js/plugins/colors.min.js
- /static/vendors/wysiwyg-editor/js/plugins/draggable.min.js
- /static/vendors/wysiwyg-editor/js/plugins/emoticons.min.js
- /static/vendors/wysiwyg-editor/js/plugins/entities.min.js
- /static/vendors/wysiwyg-editor/js/plugins/file.min.js
- /static/vendors/wysiwyg-editor/js/plugins/font_size.min.js
- /static/vendors/wysiwyg-editor/js/plugins/font_family.min.js
- /static/vendors/wysiwyg-editor/js/plugins/fullscreen.min.js
- /static/vendors/wysiwyg-editor/js/plugins/image.min.js
- /static/vendors/wysiwyg-editor/js/plugins/image_manager.min.js
- /static/vendors/wysiwyg-editor/js/plugins/line_breaker.min.js
- /static/vendors/wysiwyg-editor/js/plugins/inline_style.min.js
- /static/vendors/wysiwyg-editor/js/plugins/link.min.js
- /static/vendors/wysiwyg-editor/js/plugins/lists.min.js
- /static/vendors/wysiwyg-editor/js/plugins/paragraph_format.min.js
- /static/vendors/wysiwyg-editor/js/plugins/paragraph_style.min.js
- /static/vendors/wysiwyg-editor/js/plugins/quick_insert.min.js
- /static/vendors/wysiwyg-editor/js/plugins/quote.min.js
- /static/vendors/wysiwyg-editor/js/plugins/table.min.js
- /static/vendors/wysiwyg-editor/js/plugins/save.min.js
- /static/vendors/wysiwyg-editor/js/plugins/url.min.js
- /static/vendors/wysiwyg-editor/js/plugins/video.min.js
- /static/vendors/wysiwyg-editor/js/plugins/help.min.js
- /static/vendors/wysiwyg-editor/js/plugins/print.min.js
- /static/vendors/wysiwyg-editor/js/plugins/special_characters.min.js
- /static/vendors/wysiwyg-editor/js/plugins/word_paste.min.js

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

