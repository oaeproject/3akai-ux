var sakai = sakai || {};

sakai.sparkline = function(tuid,placement,showSettings){

	if (showSettings){
		$("#mainSparkLineContainer", $("#" + tuid)).html("No settings available<br/><br/>");
	}

};

sdata.widgets.WidgetLoader.informOnLoad("sparkline");