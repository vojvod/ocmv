<?php

//http://demo.boundlessgeo.com/geoserver/wfs?service=wfs&version=2.0.0&request=DescribeFeatureType&TypeName=topp:states

$url = $_GET['url'];
$service = $_GET['service'];
$version = $_GET['version'];
$request = $_GET['request'];
$TypeName = $_GET['TypeName'];

$partTypeName = explode(",", $TypeName);

$returnArray = array();

foreach ($partTypeName as $Name) {

    $request_url = null;

    $request_url = $url."wfs?".
                    "&service=".$service.
                    "&version=".$version.
                    "&request=".$request.
                    "&TypeName=".$Name;

    $xml = file_get_contents($request_url);

    $doc = new DOMDocument();
    $doc->loadXML($xml);
    $complexTypes = $doc->getElementsByTagName('element');
    foreach ($complexTypes as $complexType) {
        $attribute =  $complexType->getAttribute('name');
        if($attribute != "the_geom"){
            array_push($returnArray, $attribute);
        }
    }
}

echo json_encode($returnArray);

?>

