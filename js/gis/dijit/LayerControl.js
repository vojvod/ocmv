define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/dom-attr',
    'dojo/dom-construct',
    'dijit/registry',
    'dijit/form/HorizontalSlider',
    'dijit/_WidgetBase',
    'dijit/_Container',
    'dojox/data/XmlStore',
    'dojo/request/xhr',
    'dijit/layout/ContentPane',
    'dijit/form/Button',
    'require',
    'tools/xstyle/css!./LayerControl/css/LayerControl.css'
], function (declare,
             array,
             lang,
             topic,
             domAttr,
             domConst,
             registry,
             HorizontalSlider,
             WidgetBase,
             Container,
             XmlStore,
             xhr,
             ContentPane,
             Button,
             require) {
    var LayerControl = declare([WidgetBase, Container], {
        map: null,
        layerInfos: [],
        icons: {
            expand: 'fa-plus-square-o',
            collapse: 'fa-minus-square-o',
            checked: 'fa-check-square-o',
            unchecked: 'fa-square-o',
            update: 'fa-refresh',
            menu: 'fa-bars',
            folder: 'fa-folder-o',
            folderOpen: 'fa-folder-open-o'
        },
        separated: false,
        overlayReorder: false,
        overlayLabel: false,
        vectorReorder: false,
        vectorLabel: false,
        noMenu: null,
        noLegend: null,
        noZoom: null,
        noTransparency: null,
        swipe: null,
        swiperButtonStyle: 'position:absolute;top:20px;left:120px;z-index:50;',
        // ^args
        baseClass: 'layerControlDijit',
        _vectorContainer: null,
        _overlayContainer: null,
        _swiper: null,
        _swipeLayerToggleHandle: null,
        _controls: {
            TileWMS: './LayerControl/controls/TileWMS',
            ImageWMS: './LayerControl/controls/ImageWMS'
        },
        constructor: function (options) {
            options = options || {};
            if (!options.map) {
                topic.publish('viewer/handleError', {
                    source: 'LayerControl',
                    error: 'map option is required'
                });
                return;
            }
            if (!options.layers) {
                topic.publish('viewer/handleError', {
                    source: 'LayerControl',
                    error: 'layers option is required'
                });
                return;
            }
        },
        postCreate: function () {
            this.inherited(arguments);

            var ControlContainer = declare([WidgetBase, Container]);

            // vector layer label
            if (this.vectorLabel !== false) {
                this.addChild(new ContentPane({
                    className: 'vectorLabelContainer',
                    content: this.vectorLabel
                }, domConst.create('div')), 'first');
            }
            // vector layer control container
            this._vectorContainer = new ControlContainer({
                className: 'vectorLayerContainer'
            }, domConst.create('div'));
            this.addChild(this._vectorContainer, 'last');
            // overlay layer label
            if (this.overlayLabel !== false) {
                this.addChild(new ContentPane({
                    className: 'overlayLabelContainer',
                    content: this.overlayLabel
                }, domConst.create('div')), 'last');
            }

            // overlay layer control container
            this._overlayContainer = new ControlContainer({
                className: 'overlayLayerContainer'
            }, domConst.create('div'));
            this.addChild(this._overlayContainer, 'last');


            // load only the modules we need
            var modules = [];
            // push layer control mods
            array.forEach(this.layers, function (layerInfo) {
                // check if control is excluded
                var mod = this._controls[layerInfo.type];
                if (mod) {
                    modules.push(mod);
                } else {
                    topic.publish('viewer/handleError', {
                        source: 'LayerControl',
                        error: 'the layer type "' + layerInfo.type + '" is not supported'
                    });
                }
            }, this);

            // load and go
            require(modules, lang.hitch(this, function () {
                array.forEach(this.layers, function (layerInfo) {
                    var control = this._controls[layerInfo.type];
                    if (control) {
                        require([control], lang.hitch(this, '_addControl', layerInfo));
                    }
                }, this);
            }));
        },
        // create layer control and add to appropriate _container
        _addControl: function (layerInfo, LayerControl) {

            var layerControl = new LayerControl({
                controller: this,
                layer: layerInfo, // check if we have a layer or just a layer id
                layerTitle: layerInfo.title,
                controlOptions: lang.mixin({
                    noLegend: null,
                    noZoom: null,
                    noTransparency: null,
                    swipe: null,
                    expanded: false,
                    sublayers: true,
                    enableTime: null,
                    metadataUrl: {
                        include: false,
                        url: ''
                    }
                }, layerInfo.controlOptions)
            });
            layerControl.startup();


            this._overlayContainer.addChild(layerControl, 'first');

            //if (this.separated) {
            //    if (layerControl._layerType === 'WMS') {
            //        this._overlayContainer.addChild(layerControl, 'first');
            //    } else {
            //        this._vectorContainer.addChild(layerControl, 'first');
            //    }
            //} else {
            //    this.addChild(layerControl, 'first');
            //}
        },

        // zoom to layer
        _zoomToLayer: function (layer) {
            this.map.getView().fit(layer.layer.getExtent(), this.map.getSize());
        },

        // enable time to layer
        _enableTimeToLayer: function (layer) {
            var url = layer.options.url;
            var layers = layer.options.params.LAYERS;
            dojo.xhrGet({
                url: 'proxy/getDimension_WMSCapabilities.php?url=' + url + '&layers=' + layers,
                load: function (result) {
                    var res1 = result.replace('"', '');
                    var res = res1.split(',');
                    var len = res.length;
                    var firstDate = null;
                    var step = null;
                    var lastDate = null;
                    if (len > 1) {
                        firstDate = new Date(res[0]);
                        step = new Date(res[1]) - new Date(res[0]);
                        lastDate = new Date(firstDate.getTime() + step * (len - 1));
                    }
                    else {

                        var resF = res1.split('\\\/');
                        firstDate = new Date(resF[0]);
                        lastDate = new Date(resF[1]);
                        step = resF[2];
                    }
                    domConst.destroy('closeDiv');
                    domConst.destroy('layerDiv');
                    domConst.destroy('timeDiv');
                    var p = registry.byId('slider');
                    if (p) {
                        p.destroyRecursive();
                    }

                    var discreteValues = (lastDate.getTime() - firstDate.getTime() + step) / step;

                    Number.prototype.padLeft = function(base,chr){
                        var  len = (String(base || 10).length - String(this).length)+1;
                        return len > 0? new Array(len).join(chr || '0')+this : this;
                    };

                    Number.prototype.padThreeLeft = function(base,chr){
                        var  len = (String(base || 10).length - String(this).length)+2;
                        return len > 0? new Array(len).join(chr || '0')+this : this;
                    };

                    var closeDiv = domConst.create('Div',{
                        id: 'closeDiv'
                    });
                    var layerDiv = domConst.create('Div',{
                        id: 'layerDiv',
                        style: 'background-color: white;padding: 5px;'
                    });
                    layerDiv.innerHTML = 'Layer: ' + layers;
                    var timeDiv = domConst.create('Div',{
                        id: 'timeDiv',
                        style: 'background-color: white;padding: 5px;'
                    });
                    var slider = new HorizontalSlider({
                        id: 'slider',
                        name: 'slider',
                        discreteValues: discreteValues,
                        value: firstDate.getTime(),
                        minimum: firstDate.getTime(),
                        maximum: lastDate.getTime(),
                        intermediateChanges: true,
                        style: 'width:300px;background-color: white;padding: 5px;',
                        showButtons: true,
                        onChange: function (value) {
                            var d = new Date(value);
                            var dformat = [ d.getFullYear(), (d.getMonth()+1).padLeft(), d.getDate().padLeft()].join('-') + 'T' +
                            [ d.getHours().padLeft(),d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(':') + ('.') + d.getMilliseconds().padThreeLeft() + 'Z';
                            var par = layer.layer.getSource().getParams();
                            par.TIME = dformat;
                            layer.layer.getSource().updateParams(par);
                            timeDiv.innerHTML = 'Timestamp: ' + [ d.getFullYear(), (d.getMonth()+1).padLeft(), d.getDate().padLeft()].join('-') + ' ' +
                            [ d.getHours().padLeft(),d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(':') + ('.') + d.getMilliseconds().padThreeLeft();
                        }
                    });
                    domConst.place(closeDiv,'timeSlider');
                    domConst.place(layerDiv,'timeSlider');
                    slider.placeAt('timeSlider');
                    domConst.place(timeDiv,'timeSlider');
                    document.getElementById('closeDiv').addEventListener('click', function(){
                        domConst.destroy('layerDiv');
                        domConst.destroy('timeDiv');
                        var p = registry.byId('slider');
                        if (p) {
                            p.destroyRecursive();
                        }
                        domConst.destroy('closeDiv');
                    }, false);
                }
            });
        },

        // move control up in controller and layer up in map
        _moveUp: function (control) {
            var node = control.domNode;
            if (control.getPreviousSibling()) {
                var layer_idx = -1;
                array.forEach(this.map.getLayers().getArray(), function (k, v) {
                    if (k == control.layer.layer) {
                        layer_idx = v;
                    }
                });
                this.map.getLayers().removeAt(layer_idx);
                this.map.getLayers().insertAt(layer_idx + 1, control.layer.layer);
                this._overlayContainer.containerNode.insertBefore(node, node.previousSibling);
                this._checkReorder();
            }
        },
        // move control down in controller and layer down in map
        _moveDown: function (control) {
            var node = control.domNode;
            if (control.getNextSibling()) {
                var layer_idx = -1;
                array.forEach(this.map.getLayers().getArray(), function (k, v) {
                    if (k == control.layer.layer) {
                        layer_idx = v;
                    }
                });
                this.map.getLayers().removeAt(layer_idx);
                this.map.getLayers().insertAt(layer_idx - 1, control.layer.layer);
                this._overlayContainer.containerNode.insertBefore(node, node.nextSibling.nextSibling);
                this._checkReorder();
            }
        },
        // enable/disable move up/down menu items when the last or first child respectively
        _checkReorder: function () {
            array.forEach(this._overlayContainer.getChildren(), function (child) {
                if (!child.getPreviousSibling()) {
                    child._reorderUp.set('disabled', true);
                } else {
                    child._reorderUp.set('disabled', false);
                }
                if (!child.getNextSibling()) {
                    child._reorderDown.set('disabled', true);
                } else {
                    child._reorderDown.set('disabled', false);
                }
            }, this);
        }


    });

    return LayerControl;
});