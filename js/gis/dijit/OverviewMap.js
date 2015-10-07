define([
    'dojo/_base/declare'
], function (declare) {
    return declare(null, {
        constructor: function (options, node) {
            this.options = options;
            this.parentNode = node;
        },
        startup: function () {
            this.options.map.addControl(new ol.control.OverviewMap());
        }
    });
});