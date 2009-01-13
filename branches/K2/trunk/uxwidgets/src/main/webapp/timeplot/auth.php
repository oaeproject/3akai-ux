<?php

class auth {
  var $PART_IA = 0;
  var $PART_II = 1;
  var $ADMIN = 2;
  var $PART = 0;
  
  function authenticate() {
    $crsid = $_SERVER['REMOTE_USER'];
  
    $part = $this->NO_PART;
  
    $FILE = fopen("/etc/apache2/groups/devadmin.grp", "r");
    while (!feof($FILE)) {
      $string = fgets($FILE);
      if (strpos($string, $crsid) !== FALSE) {
        $grp = explode(":", $string);
	$grp = $grp[0];
	$newpart = ($grp == "admins") ? $this->ADMIN : 
		   ($grp == "partII") ? $this->PART_II : $this->PART_IA;
        $part = max($part, $newpart); // give the user the maximum priviledge they have allowed
      }
    }
  
    fclose($FILE);
    $this->PART = $part;
  }

  function isPartIA() {
    return $this->PART == $this->PART_IA;
  }

  function isPartII() {
    return $this->PART == $this->PART_II;
  }

  function isAdmin() {
    return $this->PART == $this->ADMIN;
  }
}
?>
