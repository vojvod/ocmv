define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./Print/templates/Print.html',
    'dojo/on',

    //'js/gis/dijit/Print/tools/jspdf/jspdf.js',
    //'js/gis/dijit/Print/tools/jspdf/jspdf.plugin.from_html.js',

    'dijit/form/Button',
    'tools/xstyle/css!./Print/css/Print.css'
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, on) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'BookmarksWidget',
        projection: null,
        projectionCODE: null,
        places: [],
        postCreate: function () {
            var t = this;
            this.inherited(arguments);




        },

        Print: function () {

            //var doc = new jsPDF();
            //
            //doc.rect(5, 5, 200, 285);
            //
            //doc.text(10, 15, 'Map Title');
            //doc.text(10, 285, 'Map SubTitle');
            //doc.text(170, 285, '31-12-2015');
            //
            //
            //var specialElementHandlers = {
            //    '#mapInfoDijit': function(element, renderer){
            //        return true;
            //    }
            //};
            //
            //
            //doc.fromHTML(document.getElementById('print_parent'), 10, 20, {
            //    'width': 200,
            //    'elementHandlers': specialElementHandlers
            //});
            //
            //doc.save('OCMV.pdf');

            var t = this;
            var image = new Image();
            image.crossOrigin = 'anonymous';  // This enables CORS

            t.map.once('postcompose', function(event) {
                var canvas = event.context.canvas;
                image.src = canvas.toDataURL('image/png');
            });
            t.map.renderSync();











        }

        //pdfToHTML: function () {
        //    var pdf = new jsPDF('p', 'pt', 'letter');
        //    source = $('#pdf2htmldiv')[0];
        //    specialElementHandlers = {
        //        '#bypassme': function (element, renderer) {
        //            return true;
        //        }
        //    }
        //    margins = {
        //        top: 50,
        //        left: 60,
        //        width: 545
        //    };
        //    pdf.fromHTML(
        //        source // HTML string or DOM elem ref.
        //        , margins.left // x coord
        //        , margins.top // y coord
        //        , {
        //            'width': margins.width // max width of content on PDF
        //            , 'elementHandlers': specialElementHandlers
        //        },
        //        function (dispose) {
        //            // dispose: object with X, Y of the last line add to the PDF
        //            //          this allow the insertion of new lines after html
        //            pdf.save('html2pdf.pdf');
        //        }
        //    );
        //}


    });
});