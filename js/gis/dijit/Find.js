define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/dom-construct',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/on',
    'dojo/keys',
    'dojo/store/Memory',
    'dojo/topic',
    'dojo/aspect',
    'dojo/text!./Find/templates/Find.html',
    'dojo/i18n!./Find/nls/resource',
    'viewer/Controller',
    'dijit/layout/TabContainer',
    'dijit/layout/ContentPane',
    'dojox/grid/DataGrid',
    'dojox/grid/EnhancedGrid',
    'dojo/data/ItemFileWriteStore',
    'dojox/xml/DomParser',
    'dojox/widget/Standby',

    'dojox/grid/enhanced/plugins/Pagination',
    'dojox/grid/enhanced/plugins/Filter',

    'dijit/form/Form',
    'dijit/form/FilteringSelect',
    'dijit/form/ValidationTextBox',
    'dijit/form/CheckBox',
    'tools/xstyle/css!./Find/css/Find.css',
    'tools/xstyle/css!./Find/css/adw-icons.css'
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, domConstruct, lang, array, on, keys, Memory, topic, aspect,
             FindTemplate, i18n, Controller,
             TabContainer, ContentPane, DataGrid, EnhancedGrid, ItemFileWriteStore, DomParser, Standby) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: FindTemplate,
        baseClass: 'gis_FindDijit',
        i18n: i18n,
        typeSelect: 'None',
        draw: null,
        drawsource: null,
        drawVector: null,
        searchName: 1,
        standby: null,
        style: null,
        gLayers: [],

        postCreate: function () {
            this.inherited(arguments);

            this.styles = [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'orange',
                        width: 3
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(229, 217, 50, 0.8)'
                    })
                }),
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 1,
                        fill: new ol.style.Fill({
                            color: 'orange'
                        })
                    }),
                    geometry: function(feature) {
                        // return the coordinates of the first ring of the polygon
                        var coordinates = feature.getGeometry().getCoordinates()[0];
                        return new ol.geom.MultiPoint(coordinates);
                    }
                })
            ];

            this.standby = new Standby({target: 'mapCenter'});
            document.body.appendChild(this.standby.domNode);
            this.standby.startup();

            this.tableTabContainer = new TabContainer({
                doLayout: false,
                style: 'height: 100%; width: 100%;'
            });
            this.tableTabContainer.placeAt('sidebarBottom');

            //Layer combobox
            var identifyItems = [];
            var i = this.basemaps.length - 1;
            array.forEach(this.layers, function (layer) {
                if (layer.type == 'ImageWMS' || layer.type == 'TileWMS') {
                    identifyItems.push({
                        name: layer.title,
                        id: i,
                        layer: layer.layer,
                        options: layer.options
                    });
                }
                i = i + 1;
            });
            var identify = new Memory({
                data: identifyItems
            });
            this.layerSelectDijit.set('store', identify);
            this.layerSelectDijit.set('value', this.basemaps.length - 1);

            //Draw
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

        StartDrawPolyline: function () {
            this.typeSelect = 'LineString';
            if (this.draw) {
                this.map.removeInteraction(this.draw);
            }
            this.startdraw();
        },

        StartDrawPolygon: function () {
            this.typeSelect = 'Polygon';
            if (this.draw) {
                this.map.removeInteraction(this.draw);
            }
            this.startdraw();
        },

        StartDrawFPolygon: function () {
            this.typeSelect = 'Square';
            if (this.draw) {
                this.map.removeInteraction(this.draw);
            }
            this.startdraw();
        },

        startdraw: function () {
            topic.publish('mapClickMode/setCurrent', 'search');
            var value = this.typeSelect;
            if (value !== 'None') {
                var geometryFunction, maxPoints;
                if (value === 'Square') {
                    value = 'Circle';
                    geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
                } else if (value === 'Box') {
                    value = 'LineString';
                    maxPoints = 2;
                    geometryFunction = function (coordinates, geometry) {
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

        onLayoutChange: function (open) {
            if (!open) {
                if (this.mapClickMode === 'search') {
                    topic.publish('mapClickMode/setDefault');
                }
                this.stopDrawing();
            }
        },

        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
        },

        stopDrawing: function () {
            topic.publish('mapClickMode/setDefault');
            if (this.draw) {
                this.map.removeInteraction(this.draw);
            }
        },

        clearGraphics: function () {
            this.drawsource.clear();
            this.stopDrawing();
        },

        loadLayersAttributes: function () {
            //Layers Attributes
            var t = this;
            t.standby.show();

            var url1 = this.layerSelectDijit.item.options.url.substr(0, this.layerSelectDijit.item.options.url.length - 3);
            var layers = this.layerSelectDijit.item.options.params.LAYERS;

            if (url1) {
                dojo.xhrGet({
                    url: 'proxy/getWFS_attribuutesName.php?url=' + url1 + '&service=wfs&version=2.0.0&request=DescribeFeatureType&TypeName=' + layers,
                    load: function (result) {

                        var s1 = result.replace('[', '');
                        var s2 = s1.replace(']', '');
                        var s3 = s2.replace(/"/g, '');

                        var results_array = s3.split(',');

                        //Layer attributes
                        var fields = [];
                        fields.push({
                            name: '---',
                            id: 0
                        });

                        var i = results_array.length - 1;
                        array.forEach(results_array, function (field) {
                            fields.push({
                                name: field,
                                id: i
                            });

                            i = i + 1;
                        });
                        var data = new Memory({
                            data: fields
                        });
                        t.exprSelectFieldDijit.set('store', data);
                        t.exprSelectFieldDijit.set('value', '0');

                        t.standby.hide();
                    }
                });
            }
            else{
                t.standby.hide();
            }
        },

        search: function () {
            var t = this;
            var geo = '';
            var s = this.conditionSelectDijit.item.value;

            array.forEach(this.drawsource.getFeatures(), function (feature) {
                var coords = feature.getGeometry().getCoordinates();
                var i = 1;

                if (typeof  coords[0][0][0] === 'undefined') {
                    geo = geo + 'LINESTRING(';
                    array.forEach(coords, function (xy) {
                        var newcoods = ol.proj.transform(xy, 'EPSG:3857', 'EPSG:4326');
                        if (i == coords.length) {
                            geo = geo + newcoods[0] + ' ' + newcoods[1];
                        }
                        else {
                            geo = geo + newcoods[0] + ' ' + newcoods[1] + ',';
                        }
                        i = i + 1;
                    });
                    geo = geo + ')';
                    s = 'CROSSES';
                }
                else{
                    geo = geo + 'POLYGON((';
                    array.forEach(coords[0], function (xy) {
                        var newcoods = ol.proj.transform(xy, 'EPSG:3857', 'EPSG:4326');
                        if (i == coords[0].length) {
                            geo = geo + newcoods[0] + ' ' + newcoods[1];
                        }
                        else {
                            geo = geo + newcoods[0] + ' ' + newcoods[1] + ',';
                        }
                        i = i + 1;
                    });
                    geo = geo + '))';
                }
            });

            var url1 = this.layerSelectDijit.item.options.url.substr(0, this.layerSelectDijit.item.options.url.length - 3);
            var layers = this.layerSelectDijit.item.options.params.LAYERS;

            var cql = '';

            if(geo === '' && (this.exprSelectFieldDijit.item.name == '---' || this.exprSelectFieldDijit.item.name == null)){
                cql = '';
            }
            else if(geo === '' && (this.exprSelectFieldDijit.item.name != '---' || this.exprSelectFieldDijit.item.name != null)){
                cql = this.exprSelectFieldDijit.item.name + this.exprSelectDijit.item.value + '\'' + this.fieldvariable.value + '\'';
            }

            else if(geo !== '' && (this.exprSelectFieldDijit.item.name == '---' || this.exprSelectFieldDijit.item.name == null)){
                cql = s + '(the_geom,' + geo + ')';
            }
            else{
                cql = this.exprSelectFieldDijit.item.name + this.exprSelectDijit.item.value + '\'' + this.fieldvariable.value + '\'' + ' AND ' + s + '(the_geom,' + geo + ')';
            }

            // check if an element exists in array using a comparer function
            // comparer : function(currentElement)
            Array.prototype.inArray = function(comparer) {
                for(var i=0; i < this.length; i++) {
                    if(comparer(this[i])){
                        return true;
                    }
                }
                return false;
            };

            // adds an element to the array if it does not already exist using a comparer
            // function
            Array.prototype.pushIfNotExist = function(element, comparer) {
                if (!this.inArray(comparer)) {
                    this.push(element);
                }
            };

            t.standby.show();

            if (url1) {
                dojo.xhrGet({
                    url: 'proxy/getWFS_getFeatures.php?url=' + url1 + '&service=wfs&version=2.0.0&request=GetFeature&TypeName=' + layers + '&cql_filter=' + cql,
                    load: function (result) {

                        var xml = DomParser.parse(result);

                        var data = {
                            identifier: 'featureid',
                            items: []
                        };

                        var structure = [];

                        array.forEach(xml.documentElement.childNodes, function(childNode){
                            var feature = {};
                            array.forEach(childNode.childNodes, function(node){
                                if( typeof node.childNodes[0] !== 'undefined'){
                                    feature[node.nodeName] = node.childNodes[0].nodeValue;
                                    var element = {name: node.nodeName, field: node.nodeName, width: 'auto', autoComplete: true};

                                    if(node.nodeName === 'the_geom' || node.nodeName === 'boundedBy'){
                                        return;
                                    }
                                    else{
                                        structure.pushIfNotExist(element, function(e) {
                                            return e.name === element.name;
                                        });
                                    }
                                }
                            });

                            data.items.push(feature);
                        });

                        var store = new ItemFileWriteStore({
                            id: 'attributeTableStore' + t.searchName,
                            data: data
                        });

                        var grid = new EnhancedGrid({
                            id: 'attributeTable' + t.searchName,
                            store: store,
                            structure: structure,
                            autoHeight: true,
                            loadingMessage: 'Loading...',
                            sortInfo: false,
                            selectionMode: 'single',
                            columnReordering: true,
                            plugins: {
                                pagination: {
                                    pageSizes: ['5', '10', '50', 'All'],
                                    description: true,
                                    sizeSwitch: true,
                                    pageStepper: true,
                                    gotoButton: true,
                                    maxPageStep: 4,
                                    position: 'bottom'
                                },
                                filter: {
                                    closeFilterbarButton: true,
                                    ruleCount: 5
                                }
                            }
                        });

                        grid.on('rowclick', function(evt){
                            var clickedGridItem = evt.grid.getItem(evt.rowIndex);

                            var b = clickedGridItem.boundedBy[0];

                            console.log(b);

                            var n = b.split(' ');
                            var m1 = n[0].split(',');
                            var m2 = n[1].split(',');
                            var xmm = ol.proj.transform([m1[0],m1[1]], 'EPSG:4326', 'EPSG:3857');
                            var ymm = ol.proj.transform([m2[0],m2[1]], 'EPSG:4326', 'EPSG:3857');

                            console.log(xmm);
                            console.log(ymm);

                            console.log(ol.proj.fromLonLat([m1[0],m1[1]], 'EPSG:4326'));


                            var extent = new ol.extent.createEmpty();
                            extent[0] = parseFloat(m1[0]);
                            extent[1] = parseFloat(m2[0]);
                            extent[2] = parseFloat(m1[1]);
                            extent[3] = parseFloat(m2[1]);

                            console.log(ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857'));


                            t.map.getView().fit(ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857'), t.map.getSize());

                        });

                        t.createLayerOverlay(data, t.searchName);

                        var tableContainerNode =  new ContentPane({
                            title: 'Search ' + t.searchName,
                            content: grid,
                            closable: true,
                            onClose: function(){
                                var name = t.searchName - 1;
                                var con = confirm('Do you really want to Close ' + 'Search ' + name +'?');
                                if(con){
                                    array.forEach(t.gLayers, function(layer){
                                        if(grid.id === 'attributeTable' + layer[0]){
                                            t.map.removeLayer(layer[1]);
                                        }
                                    });
                                    if(t.tableTabContainer.getChildren().length == 1){
                                        Controller.togglePane('bottom', 'none');
                                    }
                                    return true;
                                }
                                else{
                                    return false;
                                }
                            }
                        });
                        t.tableTabContainer.addChild(tableContainerNode);
                        t.tableTabContainer.selectChild(tableContainerNode);
                        t.searchName += 1;
                        Controller.togglePane('bottom', 'block');
                        t.standby.hide();

                    }
                });
            }
            else{
                t.standby.hide();
            }

        },

        createLayerOverlay: function(data, id){
            var t = this;
            var coordinates = [];
            array.forEach(data.items, function(item){
                var coords = item.the_geom.split(' ');
                array.forEach(coords, function(peritem){
                    var xy = peritem.split(',');
                    var x =  parseFloat(xy[0]);
                    var y =  parseFloat(xy[1]);
                    coordinates.push(ol.proj.transform([x,y], 'EPSG:4326', 'EPSG:3857'));
                });
            });
            var geojsonObject = {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:3857'
                    }
                },
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [coordinates]
                        }
                    }
                ]
            };
            var source = new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
            });
            var layer = new ol.layer.Vector({
                source: source,
                style: t.styles
            });
            t.map.addLayer(layer);
            t.gLayers.push([id,layer]);
        }


    });
});