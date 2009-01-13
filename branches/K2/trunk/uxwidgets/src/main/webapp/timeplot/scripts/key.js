
var periods = new Array();

periods[0] = {name: "Phanerozoic", date: "542 - 0 Ma", link: "", image1: "", image2: "", start: "0542-01-01", end: "0000-00-00" };
periods[1] = {name: "Cenozoic", date: "65.5 - 0 Ma", link: "", image1: "", image2: "", start: "0065-01-01", end: "0000-00-00" };
periods[2] = {name: "Mesozoic", date: "251 - 65.5 Ma", link: "", image1: "", image2: "", start: "0251-01-01", end: "0065-01-01" };
periods[3] = {name: "Paleozoic", date: "542 - 251 Ma", link: "", image1: "", image2: "", start: "0542-01-01", end: "0251-01-01" };
periods[4] = {name: "Neogene", date: "23.03 - 0 Ma", link: "", image1: "20", image2: "present", start: "0023-01-01", end: "0000-01-01" };
periods[5] = {name: "Paleogene", date: "65.5 - 23.03", link: "", image1: "65", image2: "35", start: "0065-01-01", end: "0023-01-01" };
periods[6] = {name: "Cretaceous", date: "145.5 - 65.5 Ma", link: "", image1: "120", image2: "90", start: "0145-01-01", end: "0065-01-01" };
periods[7] = {name: "Jurassic", date: "199.6 - 145.5 Ma", link: "", image1: "170", image2: "150", start: "0199-01-01", end: "0145-01-01" };
periods[8] = {name: "Triassic", date: "251 - 199.6 Ma", link: "", image1: "220", image2: "200", start: "0251-01-01", end: "0199-01-01" };
periods[9] = {name: "Permian", date: "299 - 251 Ma", link: "", image1: "280", image2: "260", start: "0299-01-01", end: "0251-01-01" };
periods[10] = {name: "Carboniferous", date: "360.7 - 299 Ma", link: "", image1: "340", image2: "300", start: "0360-01-01", end: "0299-01-01" };
periods[11] = {name: "Devonian", date: "418.1 - 360.7 Ma", link: "", image1: "400", image2: "370", start: "0418-01-01", end: "0360-01-01" };
periods[12] = {name: "Silurian", date: "443.7 - 418.1 Ma", link: "", image1: "430", image2: "", start: "0443-01-01", end: "0418-01-01" };
periods[13] = {name: "Ordovician", date: "490 - 443.7 Ma", link: "", image1: "470", image2: "450", start: "0490-01-01", end: "0443-01-01" };
periods[14] = {name: "Cambrian", date: "542 - 490 Ma", link: "", image1: "540", image2: "500", start: "0542-01-01", end: "0490-01-01" };

function createContent(i) {
  var div = document.createElement("div");
  div.innerHTML = periods[i].name + "&nbsp;&nbsp;&nbsp;" + 
    "<a target='_BLANK' href='http://en.wikipedia.org/wiki/" + periods[i].name + "' style='font-size: 0.8em;'>(wiki)</a>&nbsp;&nbsp;&nbsp;" + 
    "<span class='timeline-event-bubble-time'>" + periods[i].date 
     + "</span>"
  if (i > 3) div.innerHTML += "<hr/><div style='text-align: center;'>";
  if (periods[i].image1 != "") 
    div.innerHTML += "<span style='float:left;'>"+periods[i].image1+" Ma</span><img style='width: 70%; margin: auto;' src='images/small/"+periods[i].image1+"moll.jpg'/><br/>";
  if (periods[i].image2 != "") 
    div.innerHTML += "<span style='float:left;'>"+periods[i].image2+" Ma</span><img style='width: 70%; margin: auto;' src='images/small/"+periods[i].image2+"moll.jpg'/>";
  div.innerHTML += "</div>";
  return div;
}

function displayBubble(e, i) {
  document.getElementById("title").innerHTML = "Plant Evolution Timeline (" + periods[i].name + ")";
  var c = SimileAjax.DOM.getEventPageCoordinates(e);
  SimileAjax.WindowManager.cancelPopups();
  var div = SimileAjax.Graphics.createBubbleForPoint(c.x, c.y, "310px", (i < 4) ? "30px" : "280px", "bottom");
  div.content.appendChild(createContent(i));
  var dateParser = tg1._unit.getParser("iso8601");
  tg1._min = dateParser(periods[i].end);
  tg1._max = dateParser(periods[i].start);
  tg2._min = dateParser(periods[i].end);
  tg2._max = dateParser(periods[i].start);
  timeplot1.putText("title", periods[i].name, "", {
    left: 0,
    top: -10,
    width: 1000,
    textAlign: "center"
    });
  timeplot2.putText("title", periods[i].name, "", {
    left: 0,
    top: -10,
    width: 1000,
    textAlign: "center"
    });
  timeplot1.update();
  timeplot2.update();
}


sdata.widgets.WidgetLoader.informOnLoad("timeplot");