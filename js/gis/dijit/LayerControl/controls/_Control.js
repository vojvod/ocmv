define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    //'dojo/_base/array',
    'dojo/on',
    'dojo/topic',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/dom-class',
    'dojo/dom-attr',
    'dojo/fx',
    'dojo/html',
    './../plugins/LayerMenu',
    'dojo/text!./templates/Control.html'
], function (
    declare,
    lang,
    //array,
    on,
    topic,
    domConst,
    domStyle,
    domClass,
    domAttr,
    fx,
    html,
    LayerMenu,
    template
) {
    var _Control = declare([], {
        templateString: template, // widget template
        controller: null, // LayerControl instance
        layer: null, // the layer object
        layerTitle: 'Layer Title', // default title
        controlOptions: null, // control options
        layerMenu: null, //the controls menu
        icons: null,
        _reorderUp: null, // used by LayerMenu
        _reorderDown: null, // used by LayerMenu
        _scaleRangeHandler: null, // handle for scale range awareness
        _expandClickHandler: null, // the click handler for the expandNode
        constructor: function (params) {
            if (params.controller) {
                this.icons = params.controller.icons;
            } // if not you've got bigger problems
        },
        postCreate: function () {
            this.inherited(arguments);
            if (!this.controller) {
                topic.publish('viewer/handleError', {
                    source: 'LayerControl/_Control',
                    error: 'controller option is required'
                });
                this.destroy();
                return;
            }
            if (!this.layer) {
                topic.publish('viewer/handleError', {
                    source: 'LayerControl/_Control',
                    error: 'layer option is required'
                });
                this.destroy();
                return;
            }

            this._initialize();

        },
        // initialize the control
        _initialize: function () {
            // an optional function in each control widget called before widget init
            if (this._layerTypePreInit) {
                this._layerTypePreInit();
            }
            var layer = this.layer,
                controlOptions = this.controlOptions;
            // set checkbox
            this._setLayerCheckbox(layer, this.checkNode);
            // wire up layer visibility
            on(this.checkNode, 'click', lang.hitch(this, '_setLayerVisibility', layer, this.checkNode));
            // set title
            html.set(this.labelNode, this.layerTitle);


            // create layer menu
            if ((controlOptions.noMenu !== true && this.controller.noMenu !== true) || (this.controller.noMenu === true && controlOptions.noMenu === false)) {
                this.layerMenu = new LayerMenu({
                    control: this,
                    contextMenuForWindow: false,
                    targetNodeIds: [this.menuNode],
                    leftClickToOpen: true
                });
                this.layerMenu.startup();
            } else {
                domClass.remove(this.menuNode, 'fa, layerControlMenuIcon, ' + this.icons.menu);
                domStyle.set(this.menuClickNode, 'cursor', 'default');
            }

            // a function in each control widget for layer type specifics like legends and such
            this._layerTypeInit();
            // show expandNode
            //   no harm if click handler wasn't created
            if (controlOptions.expanded && controlOptions.sublayers) {
                this.expandClickNode.click();
            }

        },
        // add on event to expandClickNode
        _expandClick: function () {
            var i = this.icons;
            this._expandClickHandler = on(this.expandClickNode, 'click', lang.hitch(this, function () {
                var expandNode = this.expandNode,
                    iconNode = this.expandIconNode;
                if (domStyle.get(expandNode, 'display') === 'none') {
                    fx.wipeIn({
                        node: expandNode,
                        duration: 300
                    }).play();
                    domClass.replace(iconNode, i.collapse, i.expand);
                } else {
                    fx.wipeOut({
                        node: expandNode,
                        duration: 300
                    }).play();
                    domClass.replace(iconNode, i.expand, i.collapse);
                }
            }));
        },
        // removes the icons and cursor:pointer from expandClickNode and destroys expandNode
        _expandRemove: function () {
            domClass.remove(this.expandIconNode, ['fa', this.icons.expand, 'layerControlToggleIcon']);
            domStyle.set(this.expandClickNode, 'cursor', 'default');
            domConst.destroy(this.expandNode);
        },
        // set layer visibility and update icon
        _setLayerVisibility: function (layer, checkNode) {
            if (layer.layer.getVisible()) {
                layer.layer.setVisible(false);
                topic.publish('layerControl/layerToggle', {
                    id: layer.id,
                    visible: layer.layer.getVisible()
                });
                this._setLayerCheckbox(layer, checkNode);
            } else {
                layer.layer.setVisible(true);
                topic.publish('layerControl/layerToggle', {
                    id: layer.id,
                    visible: layer.layer.getVisible()
                });
                this._setLayerCheckbox(layer, checkNode);
            }

        },
        // set checkbox based on layer so it's always in sync
        _setLayerCheckbox: function (layer, checkNode) {
            var i = this.icons;
            if (layer.layer.getVisible()) {
                domAttr.set(checkNode, 'data-checked', 'checked');
                domClass.replace(checkNode, i.checked, i.unchecked);
            } else {
                domAttr.set(checkNode, 'data-checked', 'unchecked');
                domClass.replace(checkNode, i.unchecked, i.checked);
            }
        },

        // anything the widget may need to do before update
        _updateStart: function () {
            // clone a layer state before layer updates for use after update
            this._layerState = lang.clone({
                visible: this.layer.visible,
                visibleLayers: this.layer.visibleLayers || null
            });
        },
        // anything the widget may need to do after update
        _updateEnd: function () {
            // how to handle external layer.setVisibleLayers() ???
            //
            // without topics to get/set sublayer state this will be challenging
            // still up for debate...

            // anything needing before update layer state
            if (!this._layerState) {
                // clear
                this._layerState = null;
                return;
            }
        },
        // anything the widget may need to do after visibility change
        _visibilityChange: function (r) {
            // if the checkbox doesn't match layer visibility correct it by calling _setLayerCheckbox
            if ((r.visible && domAttr.get(this.checkNode, 'data-checked') === 'unchecked') || (!r.visible && domAttr.get(this.checkNode, 'data-checked') === 'checked')) {
                this._setLayerCheckbox(this.layer, this.checkNode);
            }
        }
    });
    return _Control;
});