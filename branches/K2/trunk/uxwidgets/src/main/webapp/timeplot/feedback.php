<?php
require_once "util.php";

output_header("Plant Evolution Timeline - Feedback", "Plant Evolution Timeline - Feedback", false);

if (isset($_POST['submit'])) {
$name = parse_post("fbname");
$email = parse_post("fbemail");
$pos = parse_post("fbpos");
$year = parse_post("fbyear");
$comment = parse_post("fbcomment");
$message = "You have received feedback about the timeline:\n\n";
$message .= "Name: $name \nEmail: $email \nPosition: $pos \nYear: $year \n\nComment: $comment";
// array of emails to send feedback to
$emails = array("bgr25@cam.ac.uk", "nicola.peart@cantab.net");
foreach ($emails as $e) {
  mail($e, "Timeline feedback", $message, ($email == "") ? null : "From: $email");
}
?>
<br/><p>
Your feedback has been received.
</p>
<?php
} else {
?>
<br/>
<p>
Please tell us what you think of the timeline currently, together with what features / other pages
you would like to see in future versions:
</p>
<form method="POST">
<table>
<tr><td style="width: 200px">Name:</td><td style="width: 250px;"><input id="fbname" style="width: 100%;" name="fbname"/><p/></td></tr>
<tr><td>Email:<br/>(if you would like a reply)</td><td><input id="fbemail" style="width: 100%;" name="fbemail"/><p/></td></tr>
<tr><td>Position:<br/>(e.g. student/supervisor)</td><td><input id="fbpos" style="width: 100%;" name="fbpos"/></td></tr>
<tr><td>Year:<br/>(if student)</td><td><input id="fbyear" style="width: 100%;" name="fbyear"/></td></tr>
<tr><td style="vertical-align: top;">Comment:</td><td><textarea name="fbcomment" rows="10" cols="120" id="fbcomment" style="width: 100%;"></textarea></td></tr>
<tr><td/><td><input name="submit" type="submit" value="Submit"/></td></tr>
</table>
</form>
<p/>

<?php 
}
output_footer();
?>
