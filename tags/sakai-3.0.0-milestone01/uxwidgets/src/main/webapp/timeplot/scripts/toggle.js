
window.BN = {};
BN.Toggle = {};

/* 
 * id is the id of the div where the checkboxes will be located
 * timeplot is the timeplot object to associate with this list
 */
BN.Toggle.create = function(id, timeplot, columns, width) {
  return new BN.Toggle._Impl(id, timeplot, columns, width);
};

BN.Toggle._Impl = function(id, timeplot, columns, width) {
  var table = document.createElement("table");
  document.getElementById(id).appendChild(table);
  this._table = table;
  this._tr = undefined;
  this._columns = columns || 1;
  this._width = width || "100px";
  this._current = 0;
  this._timeplot = timeplot;
  this._plots = [];
  // create default cookies if they don't already exist
  var temp = readCookie("timelinePlots");
  if (temp == null) {
    createCookie("iceage", true, 30);
    createCookie("anggympte", true, 30);
  }
  createCookie("timelinePlots", true, 30);
};

BN.Toggle._Impl.prototype.addPlot = function(id, filename, plotinfo, datasource, separator, eventsource, type, colour, source, showValues) {
  this.addPlots(id, [BN.Toggle.createItem(filename, plotinfo, datasource, separator, eventsource, type, showValues || false)], colour, source);
}

BN.Toggle._Impl.prototype.addPlots = function(id, plots, colour, source) {
  var show = (readCookie(id) != null);
  this._plots[id] = plots;
  for (var i in plots) {
    plots[i].plotinfo.valueGeometry._count = 0;
  }
  // now add the checkbox
  var chk = document.createElement("input");
  chk.type = "checkbox";
  chk.id = id;
  chk.onclick = this.click;
  chk.style.paddingRight = "10px";
  chk.toggler = this;
  chk.checked = show || false;
  var span = document.createElement("span");
  span.innerHTML = "&nbsp;";
  span.innerHTML += source.source || "untitled";
  span.innerHTML += "&nbsp;&nbsp;";
  span.style.color = colour || "black";
  var unitSpan = document.createElement("span");
  unitSpan.innerHTML = source.unit ? "(" + source.unit + ")" :  "";
  var bubbleText = BN.Toggle.fillBubble(source);
  var td = document.createElement("td");
  td.style.width = this._width;
  td.appendChild(chk);
  td.appendChild(span);
  td.appendChild(unitSpan);
  if (bubbleText != "") {
    var br = document.createElement("br");
    var span2 = document.createElement("span");
    span2.innerHTML = "<a onclick='BN.Toggle.showBubble(event,this)' " +
    	"style='cursor: pointer;'>(source info)</a>";
    span2.bubbleText = bubbleText;
    td.appendChild(br);
    td.appendChild(span2);
  }
  // if we are on the first element, create a tr tag
  if (this._current == 0) {
    var tr = document.createElement("tr");
    this._tr = tr;
    this._table.appendChild(tr);
  }
  this._current = (this._current == this._columns - 1) ? 0 : this._current + 1;
  this._tr.appendChild(td);
  if (show) chk.onclick();
};

BN.Toggle._Impl.prototype.click = function() {
  var id = this.id;
  var t = this.toggler._timeplot;
  for (var i in this.toggler._plots[id]) {
    var p = this.toggler._plots[id][i];
    if (this.checked) {
      createCookie(id, true, 30);
      p.plotinfo.valueGeometry._count++;
      p.plotinfo.showValues = p.showValues;
      if (p.type == "xml") {
        t.loadXML(p.file, p.eventsrc);
      } else {
        t.loadText(p.file, p.sep, p.eventsrc); 
      }
    } else {
      eraseCookie(id);
      p.plotinfo.valueGeometry._count--;
      p.plotinfo.showValues = false;
      p.eventsrc.clear();
      if (p.datasrc) p.datasrc._clear();
    }
  }
};

BN.Toggle.showBubble = function(e,elmt){
  var div = document.createElement("div");
  div.innerHTML = elmt.parentNode.bubbleText;
  div.style.marginTop = "5px";
  var c = SimileAjax.DOM.getEventPageCoordinates(e);
  SimileAjax.WindowManager.cancelPopups();
  SimileAjax.Graphics.createBubbleForContentAndPoint(div, c.x, c.y, 400, "right");
};

BN.Toggle.fillBubble = function(source) {
  var html = "";
  html += (source.source) ? source.source : "";
  html += (source.unit) ? "&nbsp;&nbsp;(" + source.unit + ")" : "";
  if (html != "") html += "<hr/>";
  html += (source.authors) ? source.authors : "";
  html += (source.date) ? "&nbsp;&nbsp;(" + source.date + ")" : "";
  if (html != "") html += "<br/>";
  if (source.references && source.references[0]) {
    html += "<i>" + source.references[0] + "</i>";
    for (var i = 1; i < source.references.length; i++)
      html += "&nbsp;" + source.references[i];
  }
  if (html != "") html += "<br/>";
  if (source.link) {
    html += "<ul>";
    for (var i = 0; i < source.link.length; i++)
      html += "<li><a target='_BLANK' href='" + source.link[i] + "'>link"+i+"</a></li>";
    html += "</ul>";
  }
  if (html != "") html += "<br/>";
  html += (source.lectureNo) ? "Lecture No: " + source.lectureNo : "";
  if (html != "") html += "<br/>";
  if (source.image)
    html += "<img src='"+source.image+"'/>"
  return html;
};

BN.Toggle.createItem = function(filename, plotinfo, datasource, separator, eventsource, type, showValues) {
  return {
    file : filename,
    plotinfo : plotinfo,
    datasrc : datasource,
    sep : separator,
    eventsrc : eventsource,
    type : type,
    showValues: showValues
  };
};

sdata.widgets.WidgetLoader.informOnLoad("timeplot");