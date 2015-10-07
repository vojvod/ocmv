define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/json',
    'dojo/_base/array',
    'dojo/cookie',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dojox/grid/DataGrid',
    'dojo/data/ItemFileWriteStore',
    'dijit/form/Button',
    'dojo/text!./Bookmarks/templates/Bookmarks.html',
    'tools/xstyle/css!./Bookmarks/css/Bookmarks.css'
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, json, array, cookie, lang, domConstruct, DataGrid, ItemFileWriteStore, Button, template) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'BookmarksWidget',
        projection: null,
        projectionCODE: null,
        places: [],
        postCreate: function () {
            var t = this;
            this.inherited(arguments);

            var bookmarks = this.bookmarks; // from the options passed in


            //this.bookmarkItems = cookie('bookmarkItems');
            //if (this.bookmarkItems === undefined) {
            //    this.bookmarkItems = [];
            //} else {
            //    this.bookmarkItems = json.parse(this.bookmarkItems);
            //}

            array.forEach(bookmarks, function (bookmark) {
                var entry = domConstruct.create('div');
                var button = new Button({
                    label:  bookmark.name,
                    style: 'width:70%'
                });
                button.startup();
                button.on('click', function(evt) {
                    t.map.getView().fit(ol.proj.transformExtent(bookmark.extent, bookmark.spatialReference, 'EPSG:3857'), t.map.getSize());
                });
                button.placeAt(entry);

                var dellbutton = new Button({
                    iconClass: 'clearIcon',
                    showLabel:false
                });
                dellbutton.startup();
                dellbutton.on('click', function(evt) {
                    domConstruct.destroy(entry);
                });
                dellbutton.placeAt(entry);

                t.bookmarkList.appendChild(entry);

                t.places.push({
                    name: bookmark.name,
                    extent: ol.proj.transformExtent(bookmark.extent, bookmark.spatialReference, 'EPSG:3857')
                });

            });

        },

        test: function(){
            alert('You Clicked It!');
        },

        addBookmark: function () {

            var t = this;

            var entry = domConstruct.create('div');
            var button = new Button({
                label:  t.bookmark.get('value'),
                style: 'width:70%'
            });
            button.startup();
            button.on('click', function(evt) {
                array.forEach(t.places, function(place){
                    if(place.name == button.label){
                        t.map.getView().fit(place.extent, t.map.getSize());
                    }
                });
            });
            button.placeAt(entry);

            var dellbutton = new Button({
                iconClass: 'clearIcon',
                showLabel:false
            });
            dellbutton.startup();
            dellbutton.on('click', function(evt) {
                domConstruct.destroy(entry);
            });
            dellbutton.placeAt(entry);

            t.bookmarkList.appendChild(entry);

            t.places.push({
                name: t.bookmark.get('value'),
                extent: t.map.getView().calculateExtent(t.map.getSize())
            });

            //cookie('bookmarkItems', json.stringify({name:this.bookmark.get('value'), extent:this.map.getView().calculateExtent(this.map.getSize())}), {
            //    expires: 365
            //});
            //
            //console.log(this.bookmarkItems);
        }

        //_export: function () {
        //    return json.stringify(this.bookmarks.toJson());
        //}
    });
});