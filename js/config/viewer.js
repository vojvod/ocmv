define([
    'dojo/i18n!./nls/resource'
], function (i18n) {


    return {
        // used for debugging your app
        isDebug: true,

        titles: {
            header: i18n.header,
            subHeader: i18n.subHeader,
            pageTitle: i18n.pageTitle
        },

        //default mapClick mode, mapClickMode lets widgets know what mode the map is in to avoid multipult map click actions from taking place (ie identify while drawing).
        defaultMapClickMode: 'identify',
        // map options, passed to map constructor.
        mapOptions: {
            center: [-100, 39],
            zoom: 3,
            basemaps: {
                //MapQuest basemap layers
                basemap1: {
                    type: 'MapQuest',
                    style: 'sat',
                    title: 'MapQuest Sat'
                },
                basemap2: {
                    type: 'MapQuest',
                    style: 'osm',
                    title: 'MapQuest OSM'
                },
                //Bing basemap layers
                basemap3: {
                    type: 'BingMap',
                    style: 'Road',
                    title: 'BingMap Road'
                },
                basemap4: {
                    type: 'BingMap',
                    style: 'Aerial',
                    title: 'BingMap Aerial'
                },
                basemap5: {
                    type: 'BingMap',
                    style: 'AerialWithLabels',
                    title: 'BingMap AerialWithLabels'
                },
                //OpenStreetMap
                basemap6: {
                    type: 'OSM',
                    title: 'OSM'
                },
                //ESRI map service basemap layer
                basemap7: {
                    type: 'ESRI',
                    url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer',
                    title: 'ESRI'
                },
                //WMS basemap layer
                basemap8: {
                    type: 'Tiled WMS',
                    url: 'http://demo.boundlessgeo.com/geoserver/ne/wms',
                    params: {
                        LAYERS: 'ne:ne_10m_admin_0_countries'
                    },
                    serverType: 'geoserver',
                    title: 'Tiled WMS'
                }
            },
            visible: 2, //Selected basemap on the start
            scaleLineUnits: 'metric' //degrees, imperial, us, nautical or metric
        },
        // panes: {
        // 	left: {
        // 		splitter: true
        // 	},
        // 	right: {
        // 		id: 'sidebarRight',
        // 		placeAt: 'outer',
        // 		region: 'right',
        // 		splitter: true,
        // 		collapsible: true
        // 	},
        // 	bottom: {
        // 		id: 'sidebarBottom',
        // 		placeAt: 'outer',
        // 		splitter: true,
        // 		collapsible: true,
        // 		region: 'bottom'
        // 	},
        // 	top: {
        // 		id: 'sidebarTop',
        // 		placeAt: 'outer',
        // 		collapsible: true,
        // 		splitter: true,
        // 		region: 'top'
        // 	}
        // },
        // collapseButtonsPane: 'center', //center or outer

        // operationalLayers: Array of Layers to load on top of the basemaps: valid 'type' options: 'TileWMS' and 'ImageWMS'
        operationalLayers: [

            {
                type: 'TileWMS',
                title: 'USA',
                extent: [-13884991, 2870341, -7455066, 6338219],
                options: {
                    serverType: 'geoserver',
                    params: {
                        LAYERS: 'ne:ne',
                        STYLES: '',
                        VERSION: '1.3.0',
                        TILED: true
                    },
                    ratio: 1.5,
                    url: 'http://demo.boundlessgeo.com/geoserver/wms'
                },
                layerControlLayerInfos: {
                    noLegend: false,
                    noZoom: false,
                    noTransparency: false,
                    swipe: false,
                    expanded: false,
                    sublayers: true,
                    metadataUrl: {
                        include: true,
                        url: 'http://demo.boundlessgeo.com/geoserver/wms?service=wms&version=1.3.0&request=GetCapabilities'
                    }
                }

            },

            {
                type: 'ImageWMS',
                title: 'topp:states',
                extent: [-13884991, 2870341, -7455066, 6338219],
                options: {
                    serverType: 'geoserver',
                    params: {
                        LAYERS: 'topp:states',
                        STYLES: '',
                        VERSION: '1.3.0'
                    },
                    ratio: 1.5,
                    url: 'http://demo.boundlessgeo.com/geoserver/wms',
                    visible: true
                },
                layerControlLayerInfos: {
                    noLegend: false,
                    noZoom: false,
                    noTransparency: false,
                    swipe: false,
                    expanded: false,
                    sublayers: true,
                    metadataUrl: {
                        include: true,
                        url: 'http://demo.boundlessgeo.com/geoserver/wms?service=wms&version=1.3.0&request=GetCapabilities'
                    }
                }

            }

            


        ],
        // set include:true to load. For titlePane type set position the the desired order in the sidebar
        widgets: {
            mapLegend: {
                include: false,
                id: 'mapLegend',
                type: 'titlePane',
                path: 'gis/dijit/Legend',
                title: i18n.legend,
                open: false,
                position: 0,
                options: {
                    map: true
                }
            },
            layerControl: {
                include: true,
                id: 'layerControl',
                type: 'titlePane',
                path: 'gis/dijit/LayerControl',
                title: 'Layers',
                open: false,
                position: 1,
                options: {
                    map: true,
                    basemaps: true,
                    layers: true
                }
            },
            identify: {
                include: true,
                id: 'identify',
                type: 'titlePane',
                path: 'gis/dijit/Identify',
                title: 'Identify',
                open: false,
                position: 2,
                options: 'config/identify'
            },
            bookmarks: {
                include: true,
                id: 'bookmarks',
                type: 'titlePane',
                path: 'gis/dijit/Bookmarks',
                title: 'Bookmarks',
                open: false,
                position: 2,
                options: 'config/bookmarks'
            },
            measurement: {
                include: true,
                id: 'measurement',
                type: 'titlePane',
                path: 'gis/dijit/Measurement',
                title: i18n.measurement,
                open: false,
                position: 3,
                options: {
                    map: true,
                    mapClickMode: true
                }
            },
            draw: {
                include: true,
                id: 'draw',
                type: 'titlePane',
                path: 'gis/dijit/Draw',
                title: i18n.draw,
                open: false,
                position: 4,
                options: {
                    map: true,
                    mapClickMode: true
                }
            },
            print: {
                include: false,
                id: 'print',
                type: 'titlePane',
                canFloat: false,
                path: 'gis/dijit/Print',
                title: 'Print',
                open: false,
                position: 5,
                options: {
                    map: true

                }
            },
            streetview: {
                include: true,
                id: 'streetview',
                type: 'titlePane',
                canFloat: false,
                position: 6,
                path: 'gis/dijit/StreetView',
                title: 'Google Street View',
                options: {
                    map: true,
                    mapClickMode: true,
                    mapRightClickMenu: true
                }
            },
            help: {
                include: true,
                id: 'help',
                type: 'floating',
                path: 'gis/dijit/Help',
                title: 'Help',
                options: {}
            },
            homeButton: {
                include: true,
                id: 'homeButton',
                type: 'domNode',
                path: 'gis/dijit/HomeButton',
                srcNodeRef: 'homeButton',
                options: {
                    map: true,
                    center: [40, 20],
                    zoom: 3
                }
            },
            locateButton: {
                include: true,
                id: 'locateButton',
                type: 'domNode',
                path: 'gis/dijit/LocateButton',
                srcNodeRef: 'locateButton',
                options: {
                    map: true,
                    publishGPSPosition: true,
                    highlightLocation: true,
                    useTracking: true,
                    geolocationOptions: {
                        maximumAge: 0,
                        timeout: 15000,
                        enableHighAccuracy: true
                    }
                }
            },
            mapInfo: {
                include: true,
                id: 'mapInfo',
                type: 'domNode',
                path: 'gis/dijit/MapInfo',
                srcNodeRef: 'mapInfoDijit',
                options: {
                    map: true,
                    mode: 'EPSG:4326' //EPSG:4326, EPSG:3857, EPSG:2100
                }
            },
            growler: {
                include: true,
                id: 'growler',
                type: 'domNode',
                path: 'gis/dijit/Growler',
                srcNodeRef: 'growlerDijit',
                options: {}
            },
            overviewMap: {
                include: true,
                id: 'overviewMap',
                type: 'invisible',
                path: 'gis/dijit/OverviewMap',
                options: {
                    map: true
                }
            }

        }
    };
});