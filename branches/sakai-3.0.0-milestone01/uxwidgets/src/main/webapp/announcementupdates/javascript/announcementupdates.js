var sakai = sakai || {};

sakai.announcementupdates = function(tuid,placement,showSettings){

	if (showSettings){
		$("#mainAnnouncementUpdateContainer", $("#" + tuid)).html("No settings available<br/><br/>");
	}

};

sdata.widgets.WidgetLoader.informOnLoad("announcementupdates");