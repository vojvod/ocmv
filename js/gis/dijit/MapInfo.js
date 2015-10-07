define([
    'dojo/_base/declare'
], function (declare) {
    return declare(null, {
        constructor: function (options, node) {
            this.options = options;
            this.parentNode = node;
        },
        startup: function () {

            var t = this;

            var mousePosition = new ol.control.MousePosition({
                coordinateFormat: ol.coordinate.createStringXY(2),
                projection: t.options.mode,
                className: 'custom-mouse-position',
                target: t.parentNode,
                undefinedHTML: '&nbsp;'
            });

            this.options.map.addControl(mousePosition);
        }


    });
});