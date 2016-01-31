define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dijit/form/Button',
    'dojo/dom-attr'
], function (declare, lang, topic, Button, domAttr) {
    return declare(null, {
        buttonShowStyle: 'display: block; width: 25px;background-color:#F5F5F5;',
        buttonNoShowStyle: 'display: none; width: 25px;background-color:#F5F5F5;',
        constructor: function (options, node) {
            this.options = options;
            this.parentNode = node;
        },
        flag: 0,
        startup: function () {

            var t = this;


            this.locateButton = new Button({
                iconClass: 'fa fa-globe',
                style: t.buttonShowStyle
            });


            this.locateButton.on('click', lang.hitch(this, '_GoTo3D'));
            this.locateButton.placeAt(this.parentNode);

            this.ol3d = new olcs.OLCesium({map: t.options.map}); // map is the ol.Map instance
            var scene = this.ol3d.getCesiumScene();
            scene.terrainProvider = new Cesium.CesiumTerrainProvider({
                url: 'https://assets.agi.com/stk-terrain/world'
            });
            this.ol3d.setEnabled(false);


        },

        _GoTo3D: function () {

            if(this.flag == 0){
                this.ol3d.setEnabled(true);
                this.flag = 1;
            }
            else{
                this.ol3d.setEnabled(false);
                this.flag = 0;
            }


        }
    });
});