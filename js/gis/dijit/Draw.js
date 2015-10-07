define([
    // basics
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/aspect',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./Draw/templates/Draw.html',
    'dojo/i18n!./Draw/nls/resource',

    'dijit/form/Button',
    'tools/xstyle/css!./Draw/css/Draw.css',
    'tools/xstyle/css!./Draw/css/adw-icons.css'
], function (declare, lang,
             topic, aspect,
             _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
             template, i18n) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'gis_DrawDijit',
        i18n: i18n,
        mapClickMode: null,
        typeSelect: 'None',
        draw: null,
        drawsource: null,
        drawVector: null,

        postCreate: function () {
            this.inherited(arguments);

            this.drawsource = new ol.source.Vector({wrapX: false});

            this.drawVector = new ol.layer.Vector({
                source: this.drawsource,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ffcc33'
                        })
                    })
                })
            });

            this.map.addLayer(this.drawVector);

            this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));
            if (this.parentWidget && this.parentWidget.toggleable) {
                this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
                    this.onLayoutChange(this.parentWidget.open);
                })));
            }

        },

        StartDrawPoint: function(){
            this.typeSelect = 'Point';
            this.drawModeTextNode.innerHTML  = this.typeSelect;
            if(this.draw){
                this.map.removeInteraction(this.draw);
            }
            this.startdraw();
        },

        StartDrawCircle: function(){
            this.typeSelect = 'Circle';
            this.drawModeTextNode.innerHTML  = this.typeSelect;
            if(this.draw){
                this.map.removeInteraction(this.draw);
            }
            this.startdraw();
        },

        StartDrawPolyline: function(){
            this.typeSelect = 'LineString';
            this.drawModeTextNode.innerHTML  = this.typeSelect;
            if(this.draw){
                this.map.removeInteraction(this.draw);
            }
            this.startdraw();
        },

        StartDrawPolygon: function(){
            this.typeSelect = 'Polygon';
            this.drawModeTextNode.innerHTML  = this.typeSelect;
            if(this.draw){
                this.map.removeInteraction(this.draw);
            }
            this.startdraw();
        },

        StartDrawFPolygon: function(){
            this.typeSelect = 'Square';
            this.drawModeTextNode.innerHTML  = this.typeSelect;
            if(this.draw){
                this.map.removeInteraction(this.draw);
            }
            this.startdraw();
        },

        startdraw: function(){
            topic.publish('mapClickMode/setCurrent', 'draw');
            var value = this.typeSelect;
            if (value !== 'None') {
                var geometryFunction, maxPoints;
                if (value === 'Square') {
                    value = 'Circle';
                    geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
                } else if (value === 'Box') {
                    value = 'LineString';
                    maxPoints = 2;
                    geometryFunction = function(coordinates, geometry) {
                        if (!geometry) {
                            geometry = new ol.geom.Polygon(null);
                        }
                        var start = coordinates[0];
                        var end = coordinates[1];
                        geometry.setCoordinates([
                            [start, [start[0], end[1]], end, [end[0], start[1]], start]
                        ]);
                        return geometry;
                    };
                }
                this.draw = new ol.interaction.Draw({
                    source: this.drawsource,
                    type: /** @type {ol.geom.GeometryType} */ (value),
                    geometryFunction: geometryFunction,
                    maxPoints: maxPoints
                });
                this.map.addInteraction(this.draw);
            }
        },

        stopDrawing: function(){
            topic.publish('mapClickMode/setDefault');
            if(this.draw){
                this.map.removeInteraction(this.draw);
                this.drawModeTextNode.innerHTML  = 'None';
            }
        },

        clearGraphics: function(){
            this.drawsource.clear();
        },

        onLayoutChange: function (open) {
            // end drawing on close of title pane
            if (!open) {
                //this.endDrawing();
                if (this.mapClickMode === 'draw') {
                    topic.publish('mapClickMode/setDefault');
                }
                this.stopDrawing();
            }
        },

        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
        }


    });
});
