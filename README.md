# ocmv
Configureable Map Viewer using OpenLayers 3. A map viewer based on [CMV](https://github.com/cmv/cmv-app).

![alt tag](https://github.com/vojvod/ocmv/blob/master/ocmv1.jpg)

###Supported Data Types:
* WMS
 
###Current Widgets:
* Bookmarks
* Draw
* Growler
* Help
* Home button
* Identify popup
* Measure
* Locate button
* Map info
* Overview map
* StreetView

###Upcoming Widgets:
* Search
* Attribute table
* Edit
* Print

###Client technology used:
* [Openlayers 3](http://openlayers.org/)
* [Dojotoolkit](http://dojotoolkit.org/)

###Proxy
If you don't own or can't manage the server side to consume your WMS avoiding issues with Cross Origin requests - requests with different domain and/or port than your javascript application - you can setup a third party proxy app [like this one](https://github.com/Esri/resource-proxy).

Alternatively, you can [enable cors](http://enable-cors.org/index.html) on the software running GeoServer or others.

Once you have your proxy setted up, you can configure it on ocmv like this:

_viewer.js_
```javascript
return {
    // used for debugging your app
    isDebug : true,
    
    ...

    proxy : {
        enabled : true,
        address : 'http://myserver.com/proxy/proxy.ashx?', // in this case, using DotNet proxy
        alwaysUseProxy : false,
        useProxyWhen : [/mygeoserver-dev:8080/ig, /mygeoserver-prod:8080/ig],
        usePHPHandlers : false
    },
    
    ...
```
Where:

* `enabled` must be `true` if you wish to enable application's proxy handling;
* `address` must be your proxy app address part, which will be concatenated with the actual URL;
* `alwaysUseProxy` must be `false` if you wish that we proxy only URLs defined by you in the next attribute;
* `useProxyWhen` must be an array of RegExp patterns that will define URLs to be proxied or not.
* `usePHPHandlers` must be `true` if you wish to use ocmv's built-in PHP scripts (_[ocmv folder]/proxy_) to handle requests when necessary. It overrides any other proxy configuration except `enabled`, that still need to be `true`.

###Contributing
* Pull requests

