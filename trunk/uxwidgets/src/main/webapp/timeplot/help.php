<?php
require_once "util.php";

output_header("Plant Evolution Timeline - Help", "Plant Evolution Timeline - Help", false,
  array("http://www.ensemble.ac.uk/projects/camstatic/ajax/api-2.0/simile-ajax-api.js", "scripts/help.js"));
$type = parse_get("type");
if ($type == "image") {
?>
<br/><p>
Click on the red boxes to find out about the timeline
</p>
<div style="position: relative;">
<img src="./images/help/pet.png"/>
<div class="help-tt" style="left: 20px; top: 340px; width: 971px; height: 59px;" 
  onclick="showBubble(event,0)"></div>
<div class="help-tt" style="left: 3px; top: 279px; width: 137px; height: 28px;" 
  onclick="showBubble(event,1)"></div>
<div class="help-tt" style="left: 202px; top: 747px; width: 65px; height: 20px;" 
  onclick="showBubble(event,2)"></div>
<div class="help-tt" style="left: 181px; top: 573px; width: 811px; height: 17px;" 
  onclick="showBubble(event,3)"></div>
<div class="help-tt" style="left: 417px; top: 601px; width: 11px; height: 107px;" 
  onclick="showBubble(event,4)"></div>
</div>
<p/>
<?php } else if ($type == "video") { ?>
<br/><p>
Video will be embedded here
</p>
<?php } else { ?>
<br/><p>
This page serves as an introduction to the <a href="./plants.php">Plant Evolution Timeline</a>.
</p>
<p> You may also find the following pages useful: </p>
<ul>
<li><a href="./help.php?type=video">Video tutorial</a> - a short video showing the different elements of the timeline.</li>
<li><a href="./help.php?type=image">Image information</a> - an interactive screenshot of the timeline with tooltips explaining
  the various features it has.</li>
</ul>
<p><strong>Plots - General</strong></p>
<p class="help-text">
Each plot is associated with a checkbox, allowing you to turn on and off plots as you
require. The checkbox labels are coloured to match the colour of the associate plot,
allowing for quick identification of what information is currently being displayed.
Below each checkbox there is a <i>source info</i> link. Clicking on this will bring
up information detailing where the information used to produce that particular dataset
was derived from; information allowing you to place the data in context with
the lectures, and links to the original data.
</p>
<p><strong>Continuous Plots</strong></p>
<p class="help-text">
Continuous plots are represented as a series of points joined by straight lines (i.e. there
is no attempt to smooth the 'curve'). Some plots, when hovered over with the cursor, display
the current date (the x-axis position of the cursor) together with the values of the 
plots at that point. The value labels are colour-coded, and the units can be found next
to the checkbox label. 
</p><p class="help-text">
N.B. The labels are <i>not</i> interpolated; they simply show the value of the 
point immediately to the left of where the cursor is positioned, thus, if a value is
given as 1337 for a point located at 300 Ma, but the next point does not occur until 
250 Ma, then 1337 will be shown all the way between 300 and 250 Ma with no interpolation
computed. Please consider this if using the quantitative data for any purposes. 
</p>
<p><strong>Block Events</strong></p>
<p class="help-text">
Some events occur over a particular time period.
These are represented as blocks on the diagram, some as full-height blocks such as
the ice ages, which are (relatively) short when compared with the timescales visible, others
as narrow horizontal bars, such as those representing important evolutionary events. 
Where the start / end times are not exactly know, the bars fade in / out to show this, 
and can be clicked on to display more information about the event.
</p>
<p><strong>Point Events</strong></p>
<p class="help-text">
Some events are single points in time, such as the emergence of certain plant species. These
again can be clicked on to display more information and useful links about the species, but to
aid the location of the required species, when the cursor is hovered over the event, a small
box is displayed with the date and the species name, to avoid having to click on the 
event to find out what it relates to.
</p>
<p><strong>Timeline Key</strong></p>
<p class="help-text">
Clicking on the central key will cause the timelines to zoom in on the selected period. 
To aid in knowing what period is currently being viewed, the period title will appear at
the top of both timelines, together with appearing at the top of the page in the heading.
</p>
<p class="help-text">
Together with zooming in, a bubble is displayed giving information about the duration of 
the period, a link to a Wikipedia page for that period, and images showing the positions
of tectonic plates during that period. 
</p>
<?php 
}
output_footer();
?>
