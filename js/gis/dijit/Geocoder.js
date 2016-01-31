define([
    'dojo/_base/declare',
    '//cdn.jsdelivr.net/openlayers.geocoder/latest/ol3-geocoder.js'
], function (declare) {
    return declare(null, {
        constructor: function (options, node) {
            this.options = options;
            this.parentNode = node;
        },
        startup: function () {
            var t = this;
            var geocoder = new Geocoder('nominatim', {
                provider: 'google',
                key: '',
                lang: 'en',
                placeholder: 'Search for ...',
                limit: 5,
                keepOpen: false
            });
            this.options.map.addControl(geocoder);
            var content = document.getElementById('popup-content');
            var overlay = this.options.map.getOverlays().getArray();
            geocoder.on('change:geocoder', function(evt){
                var
                    feature_id = evt.target.get('geocoder'),
                    feature = geocoder.getSource().getFeatureById(feature_id),
                    address_html = feature.get('address_html'),
                    address_obj = feature.get('address_obj'),
                    address_original = feature.get('address_original'),
                    coord = feature.getGeometry().getCoordinates()
                    ;
                content.innerHTML = '<p>'+address_html+'</p>';
                overlay[0].setPosition(coord);
                t.options.map.getView().setCenter(coord);
            });

            console.log(geocoder);
        }


    });
});