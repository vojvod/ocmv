define({
    map: true, //return map
    basemaps: true, //return basemap layers
    layers: true, //return map layers (no basemap layers)
    mapClickMode: true,
    configProxy: true,

	identifies: {
        easyTemparature: {  //layer tittle
			0: ['temperature (oC)'] //fields to be displayed
		},
        easywind: {  //layer tittle
            0: ['Band1','Band2'] //fields to be displayed
        },
        USA: {  //layer tittle
            0: ['admin','pop_est','lastcensus','economy'] //fields to be displayed
        }
	}
});