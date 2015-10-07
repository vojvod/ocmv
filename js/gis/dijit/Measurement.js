define([
    // basics
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/aspect',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./Measurement/templates/Measurement.html',
    'dojo/i18n!./Measurement/nls/resource',

    'dijit/form/Button',
    'tools/xstyle/css!./Measurement/css/Measurement.css',
    'tools/xstyle/css!./Measurement/css/adw-icons.css',
    'dijit/form/CheckBox'
], function (declare, lang,array,
             topic, aspect,
             _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
             template, i18n) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'gis_MeasurementDijit',
        i18n: i18n,
        mapClickMode: null,
        typeSelect: 'None',

        wgs84Sphere: new ol.Sphere(6378137),
        measureSource: null,
        measureVector: null,
        sketch: null,
        helpTooltipElement: null,
        helpTooltip: null,
        measureTooltipElement: null,
        measureTooltip: null,
        measureTooltipArray: [],
        continuePolygonMsg: 'Click to continue drawing the polygon',
        continueLineMsg: 'Click to continue drawing the line',

        draw: null,


        postCreate: function () {
            var t = this;
            this.inherited(arguments);

            this.measureSource = new ol.source.Vector();

            this.measureVector = new ol.layer.Vector({
                source: t.measureSource,
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

            this.map.addLayer(this.measureVector);

            this.own(topic.subscribe('mapClickMode/currentSet', lang.hitch(this, 'setMapClickMode')));
            if (this.parentWidget && this.parentWidget.toggleable) {
                this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
                    this.onLayoutChange(this.parentWidget.open);
                })));
            }

        },

        StartMeausereLength: function () {
            this.typeSelect = 'length';
            this.measureModeTextNode.innerHTML = this.typeSelect;
            if (this.draw) {
                this.map.removeInteraction(this.draw);
            }
            this.startMeasure();
        },
        StartMeausereArea: function () {
            this.typeSelect = 'area';
            this.measureModeTextNode.innerHTML = this.typeSelect;
            if (this.draw) {
                this.map.removeInteraction(this.draw);
            }
            this.startMeasure();
        },

        startMeasure: function () {
            var t = this;
            topic.publish('mapClickMode/setCurrent', 'measure');

            t.addInteraction();

            t.map.on('pointermove', t.pointerMoveHandler);

            t.map.C.view.on('mouseout', function () {
                t.helpTooltipElement.addClass('hidden');
            });

            //t.map.getViewport().on('mouseout', function () {
            //    t.helpTooltipElement.addClass('hidden');
            //});



        },

        pointerMoveHandler: function (evt) {
            if (evt.dragging) {
                return;
            }
            /** @type {string} */
            var helpMsg = 'Click to start drawing';

            if (this.sketch) {
                var geom = (this.sketch.getGeometry());
                if (geom instanceof ol.geom.Polygon) {
                    helpMsg = this.continuePolygonMsg;
                } else if (geom instanceof ol.geom.LineString) {
                    helpMsg = this.continueLineMsg;
                }
            }
        },

        addInteraction: function () {
            var t = this;
            var type = (t.typeSelect == 'area' ? 'Polygon' : 'LineString');

            t.draw = new ol.interaction.Draw({
                source: t.measureSource,
                type: /** @type {ol.geom.GeometryType} */ (type),
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.5)',
                        lineDash: [10, 10],
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 0, 0.7)'
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        })
                    })
                })
            });
            t.map.addInteraction(t.draw);

            t.createMeasureTooltip();
            t.createHelpTooltip();

            var listener;
            t.draw.on('drawstart',
                function (evt) {
                    // set sketch
                    t.sketch = evt.feature;

                    /** @type {ol.Coordinate|undefined} */
                    var tooltipCoord = evt.coordinate;

                    listener = t.sketch.getGeometry().on('change', function (evt) {
                        var geom = evt.target;
                        var output;
                        if (geom instanceof ol.geom.Polygon) {
                            output = t.formatArea(/** @type {ol.geom.Polygon} */ (geom));
                            tooltipCoord = geom.getInteriorPoint().getCoordinates();
                        } else if (geom instanceof ol.geom.LineString) {
                            output = t.formatLength(/** @type {ol.geom.LineString} */ (geom));
                            tooltipCoord = geom.getLastCoordinate();
                        }
                        t.measureTooltipElement.innerHTML = output;
                        t.measureTooltip.setPosition(tooltipCoord);
                    });
                }, this);

            t.draw.on('drawend',
                function (evt) {
                    t.measureTooltipElement.className = 'tooltip tooltip-static';
                    t.measureTooltip.setOffset([0, -7]);
                    // unset sketch
                    t.sketch = null;
                    // unset tooltip so that a new one can be created
                    t.measureTooltipElement = null;
                    t.createMeasureTooltip();
                    ol.Observable.unByKey(listener);
                }, this);
        },

        createHelpTooltip: function () {
            var t = this;
            if (t.helpTooltipElement) {
                t.helpTooltipElement.parentNode.removeChild(t.helpTooltipElement);
            }
            t.helpTooltipElement = document.createElement('div');
            t.helpTooltipElement.className = 'tooltip hidden';
            t.helpTooltip = new ol.Overlay({
                element: t.helpTooltipElement,
                offset: [15, 0],
                positioning: 'center-left'
            });
            t.map.addOverlay(t.helpTooltip);
        },

        createMeasureTooltip: function () {
            var t = this;
            if (t.measureTooltipElement) {
                t.measureTooltipElement.parentNode.removeChild(t.measureTooltipElement);
            }
            t.measureTooltipElement = document.createElement('div');
            t.measureTooltipElement.className = 'tooltip tooltip-measure';
            t.measureTooltip = new ol.Overlay({
                element: t.measureTooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center'
            });
            t.map.addOverlay(t.measureTooltip);

            t.measureTooltipArray.push(t.measureTooltip);
        },

        formatLength: function (line) {
            var t = this;
            var length;
            if (t.geodesicCheckbox.get('value')) {
                var coordinates = line.getCoordinates();
                length = 0;
                var sourceProj = t.map.getView().getProjection();
                for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                    var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
                    var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
                    length += t.wgs84Sphere.haversineDistance(c1, c2);
                }
            } else {
            length = Math.round(line.getLength() * 100) / 100;
            }
            var output;
            if (length > 100) {
                output = (Math.round(length / 1000 * 100) / 100) +
                ' ' + 'km';
            } else {
                output = (Math.round(length * 100) / 100) +
                ' ' + 'm';
            }
            return output;
        },

        formatArea: function(polygon) {
            var t = this;
            var area;
            if (t.geodesicCheckbox.get('value')) {
                var sourceProj = t.map.getView().getProjection();
                var geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(
                    sourceProj, 'EPSG:4326'));
                var coordinates = geom.getLinearRing(0).getCoordinates();
                area = Math.abs(t.wgs84Sphere.geodesicArea(coordinates));
            } else {
                area = polygon.getArea();
            }
            var output;
            if (area > 10000) {
                output = (Math.round(area / 1000000 * 100) / 100) +
                ' ' + 'km<sup>2</sup>';
            } else {
                output = (Math.round(area * 100) / 100) +
                ' ' + 'm<sup>2</sup>';
            }
            return output;
        },

        stopMeasuring: function(){
            topic.publish('mapClickMode/setDefault');
            if(this.draw){
                this.map.removeInteraction(this.draw);

                this.measureModeTextNode.innerHTML  = 'None';
            }
        },

        clearMeasuring: function(){
            var t = this;
            this.measureSource.clear();
            this.map.removeOverlay(this.helpTooltip);

            array.forEach(t.measureTooltipArray, function(overlay){
                t.map.removeOverlay(overlay);
            });

        },

        onLayoutChange: function (open) {
            // end drawing on close of title pane
            if (!open) {
                //this.endDrawing();
                if (this.mapClickMode === 'measure') {
                    topic.publish('mapClickMode/setDefault');
                }
                this.stopMeasuring();
            }
        },

        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
        }


    });
})
;
