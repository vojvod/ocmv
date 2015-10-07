<?php

$url = $_GET['url'];

$BBOX = $_GET['BBOX'];
$CRS = $_GET['CRS'];
$FORMAT = $_GET['FORMAT'];
$HEIGHT = $_GET['HEIGHT'];
$I = $_GET['I'];
$INFO_FORMAT = $_GET['INFO_FORMAT'];
$J = $_GET['J'];
$LAYERS = $_GET['LAYERS'];
$QUERY_LAYERS = $_GET['QUERY_LAYERS'];
$REQUEST = $_GET['REQUEST'];
$STYLES = $_GET['STYLES'];
$TRANSPARENT = $_GET['TRANSPARENT'];
$VERSION = $_GET['VERSION'];
$WIDTH = $_GET['WIDTH'];

$request = $url.
                "&BBOX=".$BBOX.
                "&CRS=".$CRS.
                "&FORMAT=".$FORMAT.
                "&HEIGHT=".$HEIGHT.
                "&I=".$I.
                "&J=".$J.
                "&INFO_FORMAT=".$INFO_FORMAT.
                "&LAYERS=".$LAYERS.
                "&QUERY_LAYERS=".$QUERY_LAYERS.
                "&REQUEST=".$REQUEST.
                "&STYLES=".$STYLES.
                "&TRANSPARENT=".$TRANSPARENT.
                "&VERSION=".$VERSION.
                "&WIDTH=".$WIDTH;


$str = file_get_contents($request);

echo $str;

?>

