<?php
require_once "util.php";

output_header("Plant Evolution Timeline - Questions", "Plant Evolution Timeline - Questions", false, 
  array("scripts/questions.js", "http://www.ensemble.ac.uk/projects/camstatic/ajax/api-2.0/simile-ajax-api.js"));
?>

<br/>
<p>
When using the timeplot you may wish to consider the following:
</p>
<p>
<ol>
<li> Do you like the timeplot? <br/>
  <a href="javascript:showHideDiv('question1')" class="questions">(answer)</a>
  <div class="questions" id="question1">
   Yes; it is amazingly brilliant.<br/>
   very useful.<br/>
   maybe.
  </div>
</li>
<li> What is the relationship between O2 and CO2? <br/>
  <a href="javascript:showHideDiv('question2')" class="questions">(answer)</a>
  <div class="questions" id="question2">
    I haven't hte foggiest;<br/>
    I'm a compsci.
  </div>
</li>
<li> And so on <br/>
  <a href="javascript:showHideDiv('question3')" class="questions">(answer)</a>
  <div class="questions" id="question3">
    Thta's not a question...
  </div>
</li>
</ol>
</p>
<?php 
output_footer();
?>
