<?php
require_once "util.php";
$error = parse_get("err");
$title = "";
$message = "";

output_header("Plant Evolution Timeline", "Plant Evolution Timeline", false);

switch($error) {
  case 404: {
    $title = "Internal Server Conspiracy #0xEF68B404";
    $message =<<<MSG
<pre>
[server1@conspiracy ~]$ echo 'query result: 404 error'
[server1@conspiracy ~]$ echo 'uh...this is good'
[server1@conspiracy ~]$ echo 'yo mate, have you got this file anywhere?'

[server2@conspiracy ~]$ echo 'hold on...I'll go check'
[server2@conspiracy ~]$ locate 
MSG;
$message .= $_SERVER['REQUEST_URI'];
  $message .=<<<MSG

[server2@conspiracy ~]$ echo 'nope looks like I've lost it'

[server1@conspiracy ~]$ echo 'hm my id10t of a webmaster must have deleted it'

[server2@conspiracy ~]$ echo 'or it could just be a typo'

[server1@conspiracy ~]$ echo 'true'
[server1@conspiracy ~]$ echo 'oi you! yes, you! the one with the mouse!'
[server1@conspiracy ~]$ echo 'try typing the address again'
[server1@conspiracy ~]$ echo 'this time check your speling'
[server1@conspiracy ~]$ !! | sed 's/speling/spelling/'
[server1@conspiracy ~]$ echo 'oops'

[server1@conspiracy ~]$ echo 'you know, some days I feel like shutting down'
[server1@conspiracy ~]$ echo 'just like that, gone, bye bye'
[server1@conspiracy ~]$ echo 'THEN what would you do?'

[user@localhost ~]$ firefox http://www.google.com &

[server1@conspiracy ~]$ echo 'OK, you win'

[user@localhost ~]$ ctrl-C
</pre>
MSG;
    break;
  }
  default :{
    $title = "$error error";
    $message = "oops";
    break;
  }
}

echo "<h2>$title</h2><span>$message</span><br/><br/>";

output_footer();
?>
