var info = [
 {
   content: "<p>Clicking on a particular period will cause the timeline to zoom " + 
    "in on that period.</p><p>An information bubble is displayed with images displaying " +
    "the layout of the tectonic plates during that period.</p><p>The title at the top " +
    "of the page and above each timeline indicates what period is currently being viewed " +
    "to avoid possible confusion once the information bubble is closed.</p>" +
    "<img src='./images/help/key.png'/>",
   width: 350,
   orientation: "bottom"
 },
 {
   content: "<p>Each plot has an associated checkbox to allow you to add/remove it from " +
    "the timeline. Where applicable, the units associated with the plot are displayed " +
    "next to the checkbox title, with the scale on the left or right hand side of the " +
    "timeline. Only scales relevant to visible plots are displayed.</p><p> " +
    "The checkbox titles are colour-coded to match the colour of the plot line.</p>" +
    "<p>Hovering over the timeline will display values for some plots, again colour-coded " +
    "to help associate the value with the plot, together with a date label associated " +
    "with that value.</p>" +
    "<img src='./images/help/plot.png'/>",
    width: 300,
    orientation: "bottom"
 },
 {
   content: "<p>Clicking on the 'source info' link beneath each checkbox will " +
     "display a bubble containing details about the information source for the " +
     "given plot, including a link to the original data where possible.</p>" +
     "<p>Where possible, the information relates directly to the lecture notes " +
     "to help contextualise your work.</p>" +
     "<img src='./images/help/source.png'/>",
   width: 320,
   orientation: "top"
  },
  {
    content: "<p>Some plots are not continuous lines, but rather discrete events. " +
      "These are displayed as blocks on the timeline, and can be clicked on to display " +
      "details about the event.</p><p>Sometimes, the exact start/end times for events " +
      "are not known. In this case, a pair of dates representing the earliest/latest " +
      "start/end dates are shown instead.</p>" +
      "<img src='./images/help/block.png'/>",
    width: 350,
    orientation: "top"
  },
  {
    content: "<p>Point events are displayed as a vertical line on the timeline. " +
     "To avoid having to click on a line to bring up an information bubble to find out " +
     "what the event represents, the name of the plant species appears when you hover over " +
     "any of the events related to that dataset, to allow you to locate the required " +
     "species before investigating it further.</p>" +
     "<img src='./images/help/species.png'/>",
     width: 300,
     orientation: "top"
  }
]

function showBubble(event, index) {
  SimileAjax.WindowManager.initialize();
  var evt = SimileAjax.DOM.getEventPageCoordinates(event);
  SimileAjax.WindowManager.cancelPopups();
  var div = document.createElement("div");
  div.innerHTML = info[index].content;
  SimileAjax.Graphics.createBubbleForContentAndPoint(div, evt.x, evt.y, 
    info[index].width, info[index].orientation);
}

sdata.widgets.WidgetLoader.informOnLoad("timeplot");