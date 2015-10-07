<?php

$url = $_GET['url'] . "?service=wms&version=1.3.0&request=GetCapabilities";
$name = $_GET['layers'];

$str = file_get_contents($url);
$xml = simplexml_load_string( $str );

$returnArray = array();

foreach($xml->Capability->Layer->Layer as $child) {

	if (strlen(strpos($child->Name, $name)) > 0 ) {
  		//array_push($returnArray, array('name' => (string)$child->Name, 'title' => (string)$child->Title, 'Dimension' => (string)$child->Dimension));

  		array_push($returnArray, (string)$child->Dimension);

  		echo json_encode((string)$child->Dimension);
 	}

}

//echo json_encode($returnArray);


?>

