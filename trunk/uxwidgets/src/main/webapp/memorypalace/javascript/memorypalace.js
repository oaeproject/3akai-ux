var sakai = sakai || {};

sakai.memorypalace = function(tuid, placement, showSettings){

	var settings = false;
	var rootel = $("#" + tuid);
	var currentSelected = 1;

	var doInit = function(){
		if (showSettings){
			$("#mp_settings",rootel).show();
			$("#mp_generalsettings",rootel).show();
			$("#mp_sitemap",rootel).hide();
			$("#mp_output",rootel).hide();
			loadSettings();
		} else {
			$("#mp_output",rootel).show();
			$("#mp_settings",rootel).hide();
			renderSettings();
		}
	}
	
	var loadSiteMap = function(){
		var str = document.location.pathname;
		var spl = str.split("/");
		var currentsite = spl[2];
		sdata.Ajax.request({
			url: "/sdata/f/" + currentsite + "/pageconfiguration?sid=" + Math.random(),
			onSuccess: function(response){
				var pages = eval('(' + response + ')');
				$("#mp_sitemap_content").html(sdata.html.Template.render("mp_sitemap_content_template", pages));
				initClicks();
			},
			onFail: function(httpstatus){
				var pages = {};
				pages.items = [];
				$("#mp_sitemap_content").html(sdata.html.Template.render("mp_sitemap_content_template", pages));
				initClicks();
			}
		});
	}
	
	var initClicks = function(){
		$(".mp_selected_page").bind("click", function(ev){
			var page = this.id.split("_")[3];
			$("#mp_room" + currentSelected + "page").val(page);
			$("#mp_generalsettings",rootel).show();
			$("#mp_sitemap",rootel).hide();
		});
	}
	
	$("#mp_sitemap_cancel", rootel).bind("click", function(ev){
		$("#mp_generalsettings",rootel).show();
		$("#mp_sitemap",rootel).hide();
	});
	
	$("#select_page1",rootel).bind("click",function(ev){
		currentSelected = 1;
		showSiteMap();
	});
	$("#select_page2",rootel).bind("click",function(ev){
		currentSelected = 2;
		showSiteMap();
	});
	$("#select_page3",rootel).bind("click",function(ev){
		currentSelected = 3;
		showSiteMap();
	});
	$("#select_page4",rootel).bind("click",function(ev){
		currentSelected = 4;
		showSiteMap();
	});
	
	var showSiteMap = function(){
		$("#mp_generalsettings",rootel).hide();
		$("#mp_sitemap",rootel).show();
	}
	
	var loadSettings = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/config?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				fillInSettings(true, data);
			},
			onFail : function(status) {
				fillInSettings(false, status);
			}
		});
	}
	
	var renderSettings = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/config?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				doRender(true, data);
			},
			onFail : function(status) {
				doRender(false, status);
			}
		});
	}

	var doRender = function(exists, response){
		if (exists) {
			settings = eval('(' + response + ')');
			$("#link1",rootel).text(settings["room1"].name);	
			$("#link1",rootel).attr("href","#" + settings["room1"].page);
			$("#link2",rootel).text(settings["room2"].name);	
			$("#link2",rootel).attr("href","#" + settings["room2"].page);
			$("#link3",rootel).text(settings["room3"].name);	
			$("#link3",rootel).attr("href","#" + settings["room3"].page);
			$("#link4",rootel).text(settings["room4"].name);	
			$("#link4",rootel).attr("href","#" + settings["room4"].page);
		}
	}

	var fillInSettings = function(exists, response){
		if (exists){
			settings = eval('(' + response + ')');
			$("#mp_room1name",rootel).val(settings["room1"].name);
			$("#mp_room1page",rootel).val(settings["room1"].page);	
			$("#mp_room2name",rootel).val(settings["room2"].name);
			$("#mp_room2page",rootel).val(settings["room2"].page);	
			$("#mp_room3name",rootel).val(settings["room3"].name);
			$("#mp_room3page",rootel).val(settings["room3"].page);	
			$("#mp_room4name",rootel).val(settings["room4"].name);
			$("#mp_room4page",rootel).val(settings["room4"].page);	
		}
	}
	
	var renderPreview = function(success){
		if (success){
			showSettings = false;
			doInit();
		}
	}
	
	$("#mp_save").bind("click", function(ev){
		var room1 = {"name":$("#mp_room1name").val(),"page":$("#mp_room1page").val()};
		var room2 = {"name":$("#mp_room2name").val(),"page":$("#mp_room2page").val()};
		var room3 = {"name":$("#mp_room3name").val(),"page":$("#mp_room3page").val()};
		var room4 = {"name":$("#mp_room4name").val(),"page":$("#mp_room4page").val()};
		var rooms = {"room1":room1,"room2":room2,"room3":room3,"room4":room4}
		var tosave = sdata.JSON.stringify(rooms);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "config", tosave, renderPreview);
	});
	
	doInit();
	loadSiteMap();

};

sdata.widgets.WidgetLoader.informOnLoad("memorypalace");