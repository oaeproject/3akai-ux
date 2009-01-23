<?php

function parse_post($id, $default="") {
  return isset($_POST[$id]) ? $_POST[$id] : $default;
}

function parse_get($id, $default="") {
  return isset($_GET[$id]) ? $_GET[$id] : $default;
}

function output_header($section_title = "Plant Evolution Timeline", $title = "Plant Evolution Timeline", $plot = false, $scripts = array()) {
  global $AUTH;
?>
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <link rel="stylesheet" href="http://www.ensemble.ac.uk/projects/style/layout.css" type="text/css" media="all" />
  <link rel="Shortcut Icon" href="http://www.cam.ac.uk/favicon.ico" />
  <title><?php echo $title ?></title>
<?php if ($plot) { ?>
  <script type="text/javascript" src="http://www.ensemble.ac.uk/projects/camstatic/timeplot/api/1.0/timeplot-api.js"></script>
<?php } 
foreach ($scripts as $s) {
  echo "<script type='text/javascript' src='$s'></script>";
}
?>
  <link rel="stylesheet" type="text/css" href="http://www.ensemble.ac.uk/dev/plants/timeplot/styles/plants.css"></link>
  </head>
<?php if ($plot) { ?>
  <body class="home secondary" onload="onLoad()" onresize="onResize()">
<?php } else { ?>
  <body class="home secondary">
<?php } ?>
  <div id="header">
    <div id="branding"><a href="http://www.cam.ac.uk/" accesskey="1">
    <img src="http://www.cam.ac.uk/global/images/identifier4.gif" alt="University of Cambridge" class="header-logo" /></a><a href="http://www.cam.ac.uk/800/">
    <img src="http://www.cam.ac.uk/global/images/800-2.gif" alt="800 Years, 1209 - 2009" /></a>
    </div> <!-- #branding ends -->
  </div> <!-- #header ends -->
  <div id="container"> <a name="skip-content" id="skip-content"></a>
  <ul id="nav-breadcrumb">
  <li class="first"><a href="http://www.cam.ac.uk/">University of Cambridge</a></li>
  <li><a href="http://www.plantsci.cam.ac.uk/">Plant Sciences</a></li>
  <li class="last"><a href="./">Plant Evolution Timeline</a></li>
  </ul>
  <!--breadcrumb-->
  <div id="content">
  <div id="sub-brand">
    <p id="title" class="section"><?php echo $section_title ?>
    </p>
    <span class="links">
    <a class="link" href="http://www.ensemble.ac.uk/dev/plants/timeplot/">Home</a>&nbsp;&middot;&nbsp;
    <a class="link" href="http://www.ensemble.ac.uk/dev/plants/timeplot/partIA/">Timeline</a>&nbsp;&middot;&nbsp;
    <a class="link" href="http://www.ensemble.ac.uk/dev/plants/timeplot/partII/">Timeline</a>&nbsp;&middot;&nbsp;
    <a class="link" href="http://www.ensemble.ac.uk/dev/plants/timeplot/questions.php">Questions</a>&nbsp;&middot;&nbsp;
    <a class="link" href="http://www.ensemble.ac.uk/dev/plants/timeplot/help.php">Help</a>&nbsp;&middot;&nbsp;
    <a class="link" href="http://www.ensemble.ac.uk/dev/plants/timeplot/feedback.php">Feedback</a>
    </span>
  </div>
<?php
}

function output_footer() {
?>
  <ul id="site-info">
    <li class="copy">&copy; 2008 Nicola Peart, Ben Roberts<br/></li>
  </ul>
  </div>
  </body>
  </html>
<?php } ?>
