/**
 * Plot Layer
 * 
 * @fileOverview Plot Layer
 * @name Plot
 */
 
/**
 * A plot layer is the main building block for timeplots and it's the object
 * that is responsible for painting the plot itself. Each plot needs to have
 * a time geometry, either a DataSource (for time series
 * plots) or an EventSource (for event plots) and a value geometry in case 
 * of time series plots. Such parameters are passed along
 * in the 'plotInfo' map.
 * 
 * @constructor
 */
Timeplot.Plot = function(timeplot, plotInfo) {
    this._timeplot = timeplot;
    this._canvas = timeplot.getCanvas();
    this._plotInfo = plotInfo;
    this._id = plotInfo.id;
    this._timeGeometry = plotInfo.timeGeometry;
    this._valueGeometry = plotInfo.valueGeometry;
    this._theme = new Timeline.getDefaultTheme();
    this._dataSource = plotInfo.dataSource;
    this._eventSource = plotInfo.eventSource;
    this._bubble = null;
    this._labels = [];
};

Timeplot.Plot.prototype = {
    
    /**
     * Initialize the plot layer
     */
    initialize: function() {
        if (this._dataSource && this._dataSource.getValue) {
            this._timeFlag = this._timeplot.putDiv("timeflag","timeplot-timeflag");
            this._valueFlag = this._timeplot.putDiv(this._id + "valueflag","timeplot-valueflag");
            this._valueFlagLineLeft = this._timeplot.putDiv(this._id + "valueflagLineLeft","timeplot-valueflag-line");
            this._valueFlagLineRight = this._timeplot.putDiv(this._id + "valueflagLineRight","timeplot-valueflag-line");
            if (!this._valueFlagLineLeft.firstChild) {
                this._valueFlagLineLeft.appendChild(SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix + "images/line_left.png"));
                this._valueFlagLineRight.appendChild(SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix + "images/line_right.png"));
            }
            this._valueFlagPole = this._timeplot.putDiv(this._id + "valuepole","timeplot-valueflag-pole");

            this._valueFlag.style.backgroundColor = this._plotInfo.valuesColour;
	    this._valueFlag.style.borderColor = this._plotInfo.valuesBorder;
	    this._valueFlag.style.color = this._plotInfo.valuesText;

            var opacity = this._plotInfo.valuesOpacity;
            
            SimileAjax.Graphics.setOpacity(this._timeFlag, opacity);
            SimileAjax.Graphics.setOpacity(this._valueFlag, opacity);
            SimileAjax.Graphics.setOpacity(this._valueFlagLineLeft, opacity);
            SimileAjax.Graphics.setOpacity(this._valueFlagLineRight, opacity);
            SimileAjax.Graphics.setOpacity(this._valueFlagPole, opacity);

            var plot = this;
            
            var mouseOverHandler = function(elmt, evt, target) {
                if (plot._plotInfo.showValues) { 
	                plot._valueFlag.style.display = "block";
	                mouseMoveHandler(elmt, evt, target);
	            }
            }
        
            var day = 24 * 60 * 60 * 1000;
            var month = 30 * day;
            
            var mouseMoveHandler = function(elmt, evt, target) {
                if (typeof SimileAjax != "undefined" && plot._plotInfo.showValues) {
                    var c = plot._canvas;
                    var x = Math.round(SimileAjax.DOM.getEventRelativeCoordinates(evt,plot._canvas).x);
                    if (x > c.width) x = c.width;
                    if (isNaN(x) || x < 0) x = 0;
                    var t = plot._timeGeometry.fromScreen(x);
                    if (t == 0) { // something is wrong
                        plot._valueFlag.style.display = "none";
                        return;
                    }
                    var v = plot._dataSource.getValue(t);
                    if (plot._plotInfo.roundValues) v = Math.round(v);
                    plot._valueFlag.innerHTML = new String(v);
                    var d = new Date(t);
                    var p = plot._timeGeometry.getPeriod(); 
                    if (p < day) {
                        plot._timeFlag.innerHTML = d.toLocaleTimeString();
                    } else if (p > month) {
                        plot._timeFlag.innerHTML = plot._timeGeometry._reverseTime ? d.getFullYear() + " Ma" : d.toLocaleDateString();
                    } else {
                        plot._timeFlag.innerHTML = d.toLocaleString();
                    }

                    var tw = plot._timeFlag.clientWidth;
                    var th = plot._timeFlag.clientHeight;
                    var tdw = Math.round(tw / 2);
                    var vw = plot._valueFlag.clientWidth;
                    var vh = plot._valueFlag.clientHeight;
                    var y = plot._valueGeometry.toScreen(v);

                    if (x + tdw > c.width) {
                        var tx = c.width - tdw;
                    } else if (x - tdw < 0) {
                        var tx = tdw;
                    } else {
                        var tx = x;
                    }

                    if (plot._timeGeometry._timeValuePosition == "top") {
                        plot._timeplot.placeDiv(plot._valueFlagPole, {
                            left: x,
                            top: th - 5,
                            height: c.height - y - th + 6,
                            display: "block"
                        });
                        plot._timeplot.placeDiv(plot._timeFlag,{
                            left: tx - tdw,
                            top: -6,
                            display: "block"
                        });
                    } else {
                        plot._timeplot.placeDiv(plot._valueFlagPole, {
                            left: x,
                            bottom: th - 5,
                            height: y - th + 6,
                            display: "block"
                        });
                        plot._timeplot.placeDiv(plot._timeFlag,{
                            left: tx - tdw,
                            bottom: -6,
                            display: "block"
                        });
                    }

		    var right = plot._plotInfo.valuesRight;
/* Fix to try and place labels to the left if two or more overlap on
the right hand side. 
Not working yet completely */
/*		    var right = true;
		    var divs = plot._timeplot._containerDiv.firstChild.childNodes;
		    for (var i = 0; i < divs.length; i++) {
		      var div = divs[i];
		      if (div.id.indexOf("valueflag") < 0 ||
		          div.id.indexOf("valuesflagLine") > 0 ||
			  div.id.indexOf("-" + plot._id + "valueflag") > 0 ||
			  div.offsetLeft > x) continue;
		      var top = y + 14 + div.offsetHeight;
	 	      if (top > div.offsetTop && 
		          top < (div.offsetTop + (2 * div.clientHeight))) {
		        right = false;
			break;
		      }
		    }*/

                    if (x + vw + 14 > c.width && y + vh + 4 > c.height) {
                        plot._valueFlagLineLeft.style.display = "none";
                        plot._timeplot.placeDiv(plot._valueFlagLineRight,{
                            left: x - 14,
                            bottom: y - 14,
                            display: "block"
                        });
                        plot._timeplot.placeDiv(plot._valueFlag,{
                            left: x - vw - 13,
                            bottom: y - vh - 13,
                            display: "block"
                        });
                    } else if (!right || ( x + vw + 14 > c.width && y + vh + 4 < c.height)) {
                        plot._valueFlagLineRight.style.display = "none";
                        plot._timeplot.placeDiv(plot._valueFlagLineLeft,{
                            left: x - 14,
                            bottom: y,
                            display: "block"
                        });
                        plot._timeplot.placeDiv(plot._valueFlag,{
                            left: x - vw - 13,
                            bottom: y + 13,
                            display: "block"
                        });
                    } else if (right && (x + vw + 14 < c.width && y + vh + 4 > c.height)) {
                        plot._valueFlagLineRight.style.display = "none";
                        plot._timeplot.placeDiv(plot._valueFlagLineLeft,{
                            left: x,
                            bottom: y - 13,
                            display: "block"
                        });
                        plot._timeplot.placeDiv(plot._valueFlag,{
                            left: x + 13,
                            bottom: y - 13,
                            display: "block"
                        });
                    } else {
                        plot._valueFlagLineLeft.style.display = "none";
                        plot._timeplot.placeDiv(plot._valueFlagLineRight,{
                            left: x,
                            bottom: y,
                            display: "block"
                        });
                        plot._timeplot.placeDiv(plot._valueFlag,{
                            left: x + 13,
                            bottom: y + 13,
                            display: "block"
                        });
                    }
                }
            }

            var timeplotElement = this._timeplot.getElement();
            SimileAjax.DOM.registerEvent(timeplotElement, "mouseover", mouseOverHandler);
            SimileAjax.DOM.registerEvent(timeplotElement, "mousemove", mouseMoveHandler);
        }
    },

    /**
     * Dispose the plot layer and all the data sources and listeners associated to it
     */
    dispose: function() {
        if (this._dataSource) {
            this._dataSource.removeListener(this._paintingListener);
            this._paintingListener = null;
            this._dataSource.dispose();
            this._dataSource = null;
        }
    },

    /**
     * Hide the values
     */
    hideValues: function() {
        if (this._valueFlag) this._valueFlag.style.display = "none";
        if (this._timeFlag) this._timeFlag.style.display = "none";
        if (this._valueFlagLineLeft) this._valueFlagLineLeft.style.display = "none";
        if (this._valueFlagLineRight) this._valueFlagLineRight.style.display = "none";
        if (this._valueFlagPole) this._valueFlagPole.style.display = "none";
    },
    
    /**
     * Return the data source of this plot layer (it could be either a DataSource or an EventSource)
     */
    getDataSource: function() {
        return (this._dataSource) ? this._dataSource : this._eventSource;
    },

    /**
     * Return the time geometry associated with this plot layer
     */
    getTimeGeometry: function() {
        return this._timeGeometry;
    },

    /**
     * Return the value geometry associated with this plot layer
     */
    getValueGeometry: function() {
        return this._valueGeometry;
    },

    /**
     * Paint this plot layer
     */
    paint: function() {
	var ctx = this._canvas.getContext('2d');
        ctx.lineWidth = this._plotInfo.lineWidth;
        ctx.lineJoin = 'miter';
        this._clearLabels();
        if (this._dataSource) {     
            if (this._plotInfo.fillColor) {
                if (this._plotInfo.fillGradient) {
                    var gradient = ctx.createLinearGradient(0,this._canvas.height,0,0);
                    gradient.addColorStop(0,this._plotInfo.fillColor.toString());
                    gradient.addColorStop(0.5,this._plotInfo.fillColor.toString());
                    gradient.addColorStop(1, 'rgba(255,255,255,0)');

                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = this._plotInfo.fillColor.toString();
                }

                ctx.beginPath();
		var reversed = this.getTimeGeometry()._reverseTime;
                if (reversed) ctx.moveTo(this._canvas.width, 0);
		else ctx.moveTo(0,0);
                this._plot(function(x,y) {
                    ctx.lineTo(x,y);
                });
                if (this._plotInfo.fillFrom == Number.NEGATIVE_INFINITY) {
                    if (reversed) ctx.lineTo(0, 0);
		    else ctx.lineTo(this._canvas.width, 0);
                } else if (this._plotInfo.fillFrom == Number.POSITIVE_INFINITY) {
		    if (reversed) {
		      ctx.lineTo(0, this._canvas.height);
		      ctx.lineTo(this._canvas.width, this._canvas.height);
		    } else {
                      ctx.lineTo(this._canvas.width, this._canvas.height);
                      ctx.lineTo(0, this._canvas.height);
		    }
                } else {
                    ctx.lineTo(this._canvas.width, this._valueGeometry.toScreen(this._plotInfo.fillFrom));
                    ctx.lineTo(0, this._valueGeometry.toScreen(this._plotInfo.fillFrom));
                }
                ctx.fill();
            }
                    
            if (this._plotInfo.lineColor) {
                ctx.strokeStyle = this._plotInfo.lineColor.toString();
                ctx.beginPath();
                var first = true;
                this._plot(function(x,y) {
                        if (first) {
                             first = false;
                             ctx.moveTo(x,y);
                        }
                    ctx.lineTo(x,y);
                });
                ctx.stroke();
            }

            if (this._plotInfo.dotColor) {
                ctx.fillStyle = this._plotInfo.dotColor.toString();
                var r = this._plotInfo.dotRadius;
                this._plot(function(x,y) {
                    ctx.beginPath();
                    ctx.arc(x,y,r,0,2*Math.PI,true);
                    ctx.fill();
                });
            }
        }
        
	if (this._eventSource) {
            var gradient = ctx.createLinearGradient(0,0,0,this._canvas.height);
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.strokeStyle = gradient;
            ctx.fillStyle = gradient; 
            ctx.lineWidth = this._plotInfo.eventLineWidth;
            ctx.lineJoin = 'miter';
            
            var i = this._eventSource.getAllEventIterator();
            while (i.hasNext()) {
                var event = i.next();
                var color = event.getColor();
                color = (color) ? new Timeplot.Color(color) : this._plotInfo.lineColor;
                var eventStart = event.getStart().getTime();
                var eventEnd = event.getEnd().getTime();
                var top = 0;
                var height = this._canvas.height - 1;
                var id = event.getID();
                var text = "";
                if (eventStart == eventEnd) {
                    var c = color.toString();
                    gradient.addColorStop(0, c);
                    var start = this._timeGeometry.toScreen(eventStart);
                    start = Math.floor(start) + 0.5; // center it between two pixels (makes the rendering nicer)
                    var end = start;
                    ctx.beginPath();
                    ctx.moveTo(start,0);
                    ctx.lineTo(start,this._canvas.height);
                    ctx.stroke();
                    var x = start - 4;
                    var w = 7;
                } else {
                    var c = color.toString(0.5);
                    gradient.addColorStop(0, c);
                    var start = this._timeGeometry.toScreen(eventStart);
                    start = Math.floor(start) + 0.5; // center it between two pixels (makes the rendering nicer)
                    var end = this._timeGeometry.toScreen(eventEnd);
                    end = Math.floor(end) + 0.5; // center it between two pixels (makes the rendering nicer)
                    if (event.isBandEvent()) { // is a band event
                      var track = this._findFreeTrack(start, end, event._track);
                      ctx.fillStyle = c;
                      if (event.isImprecise()) {
                        var latestEventStart = event.getLatestStart().getTime();
                        var earliestEventEnd = event.getEarliestEnd().getTime();
                        var latestStart = this._timeGeometry.toScreen(latestEventStart);
                        var earliestEnd = this._timeGeometry.toScreen(earliestEventEnd);
                        latestStart = Math.floor(latestStart) + 0.5;
                        earliestEnd = Math.floor(earliestEnd) + 0.5;
                        var leftGradient = ctx.createLinearGradient(end,0,earliestEnd,0);
                        var rightGradient = ctx.createLinearGradient(latestStart,track,start,track);
                        leftGradient.addColorStop(0,'rgba(255,255,255,0)');
                        leftGradient.addColorStop(1,c);
                        rightGradient.addColorStop(1,'rgba(255,255,255,0)');
                        rightGradient.addColorStop(0,c);
                        ctx.fillRect(latestStart,this._canvas.height - track,earliestEnd-latestStart,17);
                  			ctx.fillStyle = leftGradient;
                        ctx.fillRect(end,this._canvas.height - track,earliestEnd-end,17);
			                  ctx.fillStyle = rightGradient;
                        ctx.fillRect(latestStart,this._canvas.height - track,start-latestStart,17);
                      } else {
                        ctx.fillRect(start,this._canvas.height - track,end - start,17);
                      }
                      ctx.fillStyle = gradient;
                      top = track - 18;
                      height = 17;
                      id = "band-" + event.getID();
                      text = event.getText();
                    } else if (event.hasMagnitude()) {
                      height = this._valueGeometry.toScreen(event.getMagnitude());
                      ctx.fillStyle = c;
                      ctx.fillRect(start,0,end-start,height);
                      ctx.fillStyle = gradient;
                      top = this._canvas.height - height;
                    } else { // standard full-height gradient event
                      ctx.fillRect(start,0,end - start, this._canvas.height);
                    }
		                if (start < end) {
		                  if (!((end < 0) || (start > this._canvas.width))) {
		                    start = (start < 0) ? 0 : start;
             		        end = (end > this._canvas.width) ? this._canvas.width : end;
		                  }
		                } else {
		                  if (!((start < 0) || (end > this._canvas.width))) {
		                    end = (end < 0) ? 0 : end;
		                    start = (start > this._canvas.width) ? this._canvas.width : start;
		                  }
		                }
                    var x = Math.min(start,end);
                    var w = Math.abs(end - start) - 1;
                }

                var div = this._timeplot.putText(id, text,"timeplot-event-box",{
                    left: Math.round(x),
                    width: Math.round(w),
                    top: top,
                    height: height,
                    overflow: "hidden"
                });

                var plot = this;
                var clickHandler = function(event) { 
                    return function(elmt, evt, target) { 
                        var doc = plot._timeplot.getDocument();
                        var coords = SimileAjax.DOM.getEventPageCoordinates(evt);
                        var elmtCoords = SimileAjax.DOM.getPageCoordinates(elmt);
			var plotCoords = SimileAjax.DOM.getPageCoordinates(plot._canvas);
                        plot._closeBubble();
                        plot._bubble = SimileAjax.Graphics.createBubbleForPoint(coords.x, 
			  elmtCoords.top + plot._canvas.height - (elmtCoords.top - plotCoords.top), plot._plotInfo.bubbleWidth, plot._plotInfo.bubbleHeight, "bottom");
                        event.fillInfoBubble(plot._bubble.content, plot._theme, plot._timeGeometry.getLabeler());
                    }
                };
		var mouseOverHandler = function(elmt, evt, target) {
		  elmt.oldClass = elmt.className;
		  elmt.className = elmt.className + " timeplot-event-box-highlight";
		};
                var mouseMoveHandler = function(showLabel, event) {
		  return function(elmt, evt, target) {
		    if (showLabel) {
		      var coords = SimileAjax.DOM.getEventRelativeCoordinates(evt, plot._canvas);
		      var x = Math.round(coords.x);
		      if (x > plot._canvas.width) x = plot._canvas.width;
		      if (isNaN(x) || x < 0) x = 0;
		      var t = plot._timeGeometry.fromScreen(x);
		      var d = new Date(t);
		      var p = plot._timeGeometry.getPeriod();
		      if (p < 24 * 60 * 60 * 1000) {
		        elmt.timeDiv.innerHTML = d.toLocaleTimeString();
		      } else if (p > 30 * 24 * 60 * 60 * 1000) {
		        elmt.timeDiv.innerHTML = plot._timeGeometry._reverseTime ? d.getFullYear() + " Ma" : d.toLocaleDateString();
		      } else {
		        elmt.timeDiv.innerHTML = d.toLocaleString();
		      }
	              plot._timeplot.placeDiv(elmt.labelDiv, {
		        bottom: plot._canvas.height - coords.y + 14,
			left: coords.x + 14,
			display: "block"
		      });
		      plot._timeplot.placeDiv(elmt.lineDiv, {
		        bottom: plot._canvas.height - coords.y,
			left : coords.x,
			display: "block"
		      });
		      plot._timeplot.placeDiv(elmt.poleDiv, {
		        bottom: elmt.timeDiv.clientHeight - 5, 
			left: coords.x,
			height: plot._canvas.height - coords.y - elmt.timeDiv.clientHeight + 5,
			display: "block"
		      });
		      var tw = Math.round(elmt.timeDiv.clientWidth / 2)
		      if (coords.x + tw > plot._canvas.width) {
		        var tx = plot._canvas.width - tdw;
		      } else if (x - tw < 0) {
		        var tx = tw;
		      } else {
		        var tx = coords.x;
		      }
		      plot._timeplot.placeDiv(elmt.timeDiv, {
		        left: tx - tw, 
			bottom: -6,
			display: "block"
		      });
		      elmt.labelDiv.innerHTML = event.getText();
		    }
		  }
                };
                var mouseOutHandler = function(elmt, evt, target) {
                    elmt.className = elmt.oldClass;
                    elmt.oldClass = null;
		    if (elmt.labelDiv) {
		      elmt.labelDiv.style.display = "none";
		      elmt.lineDiv.style.display = "none";
		      elmt.poleDiv.style.display = "none";
		      elmt.timeDiv.style.display = "none";
		    }
                };
		if (this._plotInfo.showLabel) {
		  div.labelDiv = plot._timeplot.putDiv("evtlabel", "timeplot-valueflag");
		  div.lineDiv = plot._timeplot.putDiv("evtline","timeplot-valueflag-line");
		  div.poleDiv = plot._timeplot.putDiv("evtplot","timeplot-valueflag-pole");
		  div.timeDiv = plot._timeplot.putDiv("evttime","timeplot-timeflag");
                  if (!div.lineDiv.firstChild) 
                    div.lineDiv.appendChild(SimileAjax.Graphics.createTranslucentImage(Timeplot.urlPrefix + "images/line_right.png"));
		}
                this._labels.push(div);
                if (!div.instrumented) {
                    SimileAjax.DOM.registerEvent(div, "click"    , clickHandler(event));
                    SimileAjax.DOM.registerEvent(div, "mouseover", mouseOverHandler);
                    SimileAjax.DOM.registerEvent(div, "mouseout" , mouseOutHandler);
                    SimileAjax.DOM.registerEvent(div, "mousemove" , mouseMoveHandler(this._plotInfo.showLabel, event));
                    div.instrumented = true;
                }
            }
        }
    },

    _plot: function(f) {
        var data = this._dataSource.getData();
        if (data) {
            var times = data.times;
            var values = data.values;
            var T = times.length;
            for (var t = 0; t < T; t++) {
                var x = this._timeGeometry.toScreen(times[t]);
                var y = this._valueGeometry.toScreen(values[t]);
                f(x, y);
            }
        }
    },
    
    _closeBubble: function() {
        if (this._bubble != null) {
            this._bubble.close();
            this._bubble = null;
        }
    },

    _clearLabels: function() {
      for (var i = 0; i < this._labels.length; i++) {
        var l = this._labels[i];
	var parent = l.parentNode;
	if (parent) parent.removeChild(l);
      }
    },

    _findFreeTrack: function(start, end, track) {
      if (track != null) return (22 * track) + 49.5;
      var track_height = 22;
      var top_track = 43.5; 
      var divs = this._timeplot._containerDiv.firstChild.childNodes;
      var used_tracks = [];
      
      for (var i = 0; i < this._canvas.height / 22; i++) used_tracks[i] = false;

      for (var i = 0; i < divs.length; i++) {
      	if (divs[i].id.indexOf("band-") < 0) continue;
	var size = SimileAjax.DOM.getSize(divs[i]);
	if (divs[i].offsetLeft < start && (divs[i].offsetLeft + size.w) > end) {
	  used_tracks[(divs[i].offsetTop - 43) / 22] = true;
//	  used_tracks[Math.ceil((divs[i].offsetTop - 43) / 25)] = true;
	}
      }

      for (var i = 0; i < this._canvas.height / 22; i++) {
        if (!used_tracks[i]) 
          return (22 * i) + 49.5;
      }
      return -50;
    }

}

sdata.widgets.WidgetLoader.informOnLoad("timeplot");