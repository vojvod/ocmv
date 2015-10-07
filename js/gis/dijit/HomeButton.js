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
        startup: function () {

            var t = this;


            this.locateButton = new Button({
                iconClass: 'fa fa-home',
                style: t.buttonShowStyle
            });


            this.locateButton.on('click', lang.hitch(this, '_GoToHome'));
            this.locateButton.placeAt(this.parentNode);


        },

        _GoToHome: function () {
            var t = this;
            var pan = ol.animation.pan({
                source:t.options.map.getView().getCenter()
            });
            t.options.map.beforeRender(pan);

            t.options.map.getView().setCenter(t.options.center);
            t.options.map.getView().setZoom(t.options.zoom);

        }
    });
});