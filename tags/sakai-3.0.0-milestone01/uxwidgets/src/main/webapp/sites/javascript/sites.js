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
		
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/me?sid=" + Math.random(),
			onSuccess: function(data){
				me = eval('(' + data + ')');
				sdata.Ajax.request({
					httpMethod: "GET",
					url: "/sdata/mcp?sid=" + Math.random(),
					onSuccess: function(data){
						loadSiteList(data, true);
					},
					onFail: function(status){
						loadSiteList("", false);
					}
				});
			},
			onFail: function(status){
				alert("An error has occured");
			}
		});
		
		var loadSiteList = function(response, exists){
			var needsCreatingPersonalSite = true;
			if (exists) {
				var json = eval('(' + response + ')');
				var newjson = {};
				newjson.items = [];
				for (var i = 0; i < json.items.length; i++){
					var site = json.items[i];
					if (site.id.substring(0,1) != "~"){	
						newjson.items[newjson.items.length] = site;
					}
					if (site.id == "@" + me.items.userid){
						needsCreatingPersonalSite = false;
					}
				}
				if (needsCreatingPersonalSite){
					
					var sitetitle = me.items.userid;
					if (me.items.firstname && me.items.lastname){
						sitetitle = me.items.firstname + " " + me.items.lastname;
					}
					var type = "portfolio"; 
					var sitedescription = sitetitle;
					var siteid = "@" + me.items.userid;
					var url = "/sdata/newsite";
					var parameters = {"sitename" : sitetitle, "sitedescription" : sitedescription, "siteid" : siteid, "type" : type };

					var index = newjson.items.length;
					newjson.items[index] = {};
					newjson.items[index].id = siteid;
					newjson.items[index].description = sitedescription;
					newjson.items[index].title = sitetitle;
					newjson.items[index].type = "portfolio";

					sdata.Ajax.request({
						url :url,
						httpMethod : "POST",
						onSuccess : function(data) {
							doRender(newjson);	
						},
						onFail : function(status) {
							//alert("An error has occured");
						},
						postData : parameters,
						contentType : "application/x-www-form-urlencoded"
					});
					
				} else {
					doRender(newjson);	
				}	
			}
		}
		
	}
	
	var doRender = function(newjson){
		$("#" + tuid + " #sitelist").html(sdata.html.Template.render('sitelist_template2', newjson));
		$("#sites_category_uncategorized", rootel).bind("click", function(ev){
			$("#sites_list_uncategorized").toggle();
			if (count % 2 == 0){
				$("#sites-menu-icon", rootel).removeClass("sites-menu-min");
				$("#sites-menu-icon", rootel).addClass("sites-menu-plus");
			} else {
				$("#sites-menu-icon", rootel).removeClass("sites-menu-plus");
				$("#sites-menu-icon", rootel).addClass("sites-menu-min");
			}
			count++;
		});
	}

};

sdata.widgets.WidgetLoader.informOnLoad("sites");