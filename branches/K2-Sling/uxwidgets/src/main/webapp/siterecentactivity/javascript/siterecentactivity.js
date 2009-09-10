var sakai = sakai || {};

sakai.siterecentactivity = function(tuid, placement, showSettings){

	var rootel = $("#" + tuid);
	
	///////////////////////
	// Initial functions //
	///////////////////////
	
	$("#siterecentactivity_settings_submit",rootel).click(function(){
		sdata.container.informFinish(tuid);
	});
	$("#siterecentactivity_settings_cancel",rootel).click(function(){
		sdata.container.informCancel(tuid);
	});

	// Hide or show the settings
	if (showSettings){
		$("#siterecentactivity_output",rootel).hide();
		$("#siterecentactivity_settings",rootel).show();
	} else {
		$("#siterecentactivity_settings",rootel).hide();
		$("#siterecentactivity_output",rootel).show();
	}

};

sdata.widgets.WidgetLoader.informOnLoad("siterecentactivity");