var sakai = sakai || {};

sakai.sites = function(tuid,placement,showSettings){

	var me = false;
	var rootel = $("#" + tuid);
	var count = 0;

	if (showSettings) {
	
		$("#mainSitesContainer", $("#" + tuid)).html("No settings available");
	
	}
	else {
	
		sdata.widgets.WidgetLoader.insertWidgets(tuid);
		$("#" + tuid + " #create_new_site_link").bind("click", function(ev){
			createNewSite();
		});
		
		var createNewSite = function(){
			$("#" + tuid + " #createsitecontainer").show();
			sakai.createsite.initialise();
		}
		
		me = sdata.me;
		$.ajax({
			url: "/rest/sites",
			cache : false,
			success: function(data){
				loadSiteList(data, true);
			},
			error: function(status){
				loadSiteList("", false);
			}
		});
		
		var loadSiteList = function(response, exists){
			//var needsCreatingPersonalSite = true;
			var needsCreatingPersonalSite = false;
			if (exists) {
				var json = eval('(' + response + ')');
				var newjson = {};
				newjson.entry = [];
				if (json.entry) {
					for (var i = 0; i < json.entry.length; i++) {
						var site = json.entry[i];
						if (site.id.substring(0, 1) != "~") {
							newjson.entry[newjson.entry.length] = site;
						}
					}
				}
				doRender(newjson);		
			}
		}
		
	}
	
	var doSort = function(a,b){
		if (a.name > b.name) {
			return 1;
		} else if (a.name == b.name) {
			return 0;
		} else {
			return -1;
		}
	}
	
	var doRender = function(newjson){
		for (var i = 0; i < newjson.entry.length; i++){
			newjson.entry[i].location = newjson.entry[i].location.substring(1);
		}
		if (newjson.entry.length == 0){
			$("#" + tuid + " #sitelistwow").html("<span style='font-size:0.95em'>You aren't a member of any sites yet</span>");
		} else {
			newjson.entry = newjson.entry.sort(doSort);
			$("#" + tuid + " #sitelistwow").html(sdata.html.Template.render('sitelistwow_template', newjson));
		}
	}

};

sdata.widgets.WidgetLoader.informOnLoad("sites");