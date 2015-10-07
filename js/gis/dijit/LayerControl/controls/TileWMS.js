define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_Contained',
    './_Control', // layer control base class
    './../plugins/legendWMSUtil'
], function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _Contained,
    _Control,
    legendWMSUtil
) {
    var WMSControl = declare([_WidgetBase, _TemplatedMixin, _Contained, _Control], {
        _layerType: 'TileWMS', // constant
        // create and legend
        _layerTypeInit: function () {

            if (legendWMSUtil.isLegend(this.controlOptions.noLegend, this.controller.noLegend)) {
                this._expandClick();
                legendWMSUtil.wmsLegend(this.layer, this.expandNode);
            } else {
                this._expandRemove();
            }
        }
    });
    return WMSControl;
});