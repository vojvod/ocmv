define([
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/has',
    'dojo/topic',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/html',
    'dijit/registry',
    'dojox/gfx',
    'dojo/_base/xhr',
    // temp
    'dojo/i18n!./../nls/resource'
], function (array,
             lang,
             has,
             topic,
             domConst,
             domClass,
             domStyle,
             html,
             registry,
             gfx,
             xhr,
             i18n) {


    return {
        /////////////////////
        // utility methods //
        /////////////////////
        // check controlOptions and controller to determine legend/no legend
        // aliases e.g. controlOptions.noLegend
        isLegend: function (controlOptions, controller) {
            if (controller === null || controller === false) {
                if (controlOptions === true) {
                    return false;
                } else {
                    return true;
                }
            } else if (controller === true) {
                if (controlOptions === false) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        /////////////////////////
        // WMS layer legend //
        /////////////////////////
        // width and height of surface
        _surfaceDims: [20, 20],
        // determine what the renderer is and handle appropriately
        wmsLegend: function (layer, expandNode) {

            var legengURL = layer.options.url + '?REQUEST=GetLegendGraphic&sld_version=1.0.0&layer=' + layer.options.params.LAYERS + '&format=image/png';

            //create legend table
            var table = domConst.create('table');
            domClass.add(table, 'layerControlLegendTable');

            //create a table row and symbol
            var row = domConst.create('tr', {}, table, 'last'),
            symbol = domConst.create('td', {
               'class': 'layerControlLegendImage'
            }, row, 'first');

            // create image
            var img = domConst.create('img', {
                src: legengURL
            }, symbol);
            domStyle.set(img, {
                'width': '100%'
            });
            domClass.add(img, layer.options.params.LAYERS + '-layerLegendImage');

            // place legend in expandNode
            domConst.place(table, expandNode);

        }
    };
});