<?php
// set feed URL
$url = 'http://www.draxis-gis.com/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities';
echo $url."<br />";
// read feed into SimpleXML object
$sxml = simplexml_load_file($url);

// then you can do
var_dump($sxml);

// And now you'll be able to call `$sxml->marketstat->type->buy->volume` as well as other properties.
echo $sxml->Capability->Layer->Layer;


?>