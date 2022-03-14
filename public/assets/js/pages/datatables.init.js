/*
Template Name: Skote - Admin & Dashboard Template
Author: Themesbrand
Website: https://themesbrand.com/
Contact: themesbrand@gmail.com
File: Datatables Js File
*/

$(document).ready(function() {
    $('#datatable').DataTable();

    //Buttons examples
    $('#datatable-buttons').DataTable({
        dom: 
    "<'row'<'col-sm-3'l><'col-sm-6'B><'col-sm-3'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-5'i><'col-sm-7'p>>",
    buttons: [{
        extend: 'excelHtml5',
        text: '<i class="fa fa-file-text-o"></i> Export to Excel',
        titleAttr: 'Export to Excel',
        title: $('#datatable-buttons').data('report')+" Report",
        exportOptions: {
          columns: ':not(:last-child)',
        }
      }]
    });
    

    $(".dataTables_length select").addClass('form-select form-select-sm');
});