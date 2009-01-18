var sakai = sakai || {};

sakai.navigation = function(tuid, placement, showSettings){

	var rootel = $("#" + tuid);
	var categories = {items:[{id: 1, name: "advocacy"},{id: 2, name: "community work"},{id: 3, name: "policy work"}]};
	var tussenjson = false;
	var chosencategory = false;
	var pages = false;
	var tosave = false;
	
	$("#nav_pages_cancel", rootel).bind("click", function(ev){
		$("#navigation_list_output",rootel).show();
		$("#nav_pages",rootel).hide();
	});
	$("#nav_link_custom", rootel).bind("click", function(ev){
		var checked = $("#nav_link_custom", rootel).attr("checked");
		if (checked){
			$("#nav_link_text", rootel).attr("disabled",false);
		} else {
			$("#nav_link_text", rootel).attr("disabled",true);
		}
	});
	
	var loadSettings = function(){
		
		var currentsite = placement.split("/")[0];
		
		sdata.Ajax.request( { 
			url : "/sdata/f/" + currentsite + "/pageconfiguration?sid=" + Math.random(),
			onSuccess :  function (response) {
				pages = eval('(' + response + ')');
				$("#nav_pages_list",rootel).html(sdata.html.Template.render("nav_pages_template", pages));
				doAddPage();
				
				sdata.Ajax.request({
					url :"/sdata/f/" + placement + "/" + tuid + "/config?sid=" + Math.random(),
					httpMethod : "GET",
					onSuccess : function(data) {
						fillSettings(data);
					},
					onFail : function(status) {
						fillSettings();
					}
				});
			},
			onFail : function(httpstatus) {			
	   	   		pages = {};
				pages.items = [];
				$("#nav_pages_list",rootel).html(sdata.html.Template.render("nav_pages_template", pages));
				doAddPage();
				
				sdata.Ajax.request({
					url :"/sdata/f/" + placement + "/" + tuid + "/config?sid=" + Math.random(),
					httpMethod : "GET",
					onSuccess : function(data) {
						fillSettings(data);
					},
					onFail : function(status) {
						fillSettings();
					}
				});
	   	   	}
	   	});
		
	}
	
	var doAddPage = function(){
		$(".nav_help_page", rootel).bind("click", function(ev){
			var clickOn = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			var index = tussenjson.length;
			tussenjson[index] = {};
			tussenjson[index].page = clickOn;
			tussenjson[index].category = chosencategory;
			if ($("#nav_link_custom", rootel).attr("checked")){
				tussenjson[index].title = $("#nav_link_text", rootel).attr("value");
			}
			tosave = sdata.JSON.stringify(tussenjson);
			sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "config", tosave, finishSaving);
		});
	}
	
	var finishSaving = function(){
		fillSettings(tosave);
		$("#navigation_list_output",rootel).show();
		$("#nav_pages",rootel).hide();
	}
	
	var fillSettings = function(response){
		var newjson = categories;
		for (var i = 0 ; i < newjson.items.length; i++){
			newjson.items[i].children = [];
		}
		if (response){
			tussenjson = eval('(' + response + ')');
		} else {
			tussenjson = [];
		}
		for (var i = 0 ; i < newjson.items.length; i++){
			for (var ii = 0; ii < tussenjson.length; ii++){
				if (tussenjson[ii].category == newjson.items[i].id){
					var index = newjson.items[i].children.length;
					newjson.items[i].children[index] = {};
					newjson.items[i].children[index].id = tussenjson[ii].page;
					if (tussenjson[ii].title) {
						newjson.items[i].children[index].title = tussenjson[ii].title;
					}
					else {
						for (var iii = 0; iii < pages.items.length; iii++) {
							if (pages.items[iii].id == tussenjson[ii].page) {
								newjson.items[i].children[index].title = pages.items[iii].title;
							}
						}
					}
				}
			}
		}
		$("#navigation_list_output", rootel).html(sdata.html.Template.render('navigation_list_template',newjson));
		
		$(".nav_helper_add",rootel).bind("click", function(ev){
			chosencategory = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			$("#navigation_list_output",rootel).hide();
			$("#nav_pages",rootel).show();
		});
		
	}

	var doOutput = function(){
	
		var currentsite = placement.split("/")[0];
		
		sdata.Ajax.request( { 
			url : "/sdata/f/" + currentsite + "/pageconfiguration?sid=" + Math.random(),
			onSuccess :  function (response) {
				pages = eval('(' + response + ')');
				$("#nav_pages_list", rootel).html(sdata.html.Template.render("nav_pages_template", pages));
				doAddPage();
				
				sdata.Ajax.request({
					url :"/sdata/f/" + placement + "/" + tuid + "/config?sid=" + Math.random(),
					httpMethod : "GET",
					onSuccess : function(data) {
						fillOutput(data);
					},
					onFail : function(status) {
						fillOutput();
					}
				});
			},
			onFail : function(httpstatus) {			
	   	   		pages = {};
				pages.items = [];
				$("#nav_pages_list",rootel).html(sdata.html.Template.render("nav_pages_template", pages));
				doAddPage();
				
				sdata.Ajax.request({
					url :"/sdata/f/" + placement + "/" + tuid + "/config?sid=" + Math.random(),
					httpMethod : "GET",
					onSuccess : function(data) {
						fillOutput(data);
					},
					onFail : function(status) {
						fillOutput();
					}
				});
	   	   	}
	   	});
	
	}
	
	var finishSaving = function(){
		fillSettings(tosave);
		$("#navigation_list_output",rootel).show();
		$("#nav_pages",rootel).hide();
	}
	
	var fillOutput = function(response){
		var newjson = categories;
		for (var i = 0 ; i < newjson.items.length; i++){
			newjson.items[i].children = [];
		}
		if (response){
			tussenjson = eval('(' + response + ')');
		} else {
			tussenjson = [];
		}
		for (var i = 0 ; i < newjson.items.length; i++){
			for (var ii = 0; ii < tussenjson.length; ii++){
				if (tussenjson[ii].category == newjson.items[i].id){
					var index = newjson.items[i].children.length;
					newjson.items[i].children[index] = {};
					newjson.items[i].children[index].id = tussenjson[ii].page;
					if (tussenjson[ii].title) {
						newjson.items[i].children[index].title = tussenjson[ii].title;
					}
					else {
						for (var iii = 0; iii < pages.items.length; iii++) {
							if (pages.items[iii].id == tussenjson[ii].page) {
								newjson.items[i].children[index].title = pages.items[iii].title;
							}
						}
					}
				}
			}
		}
		
		for (var i = 0; i < newjson.items.length; i++) {
			if (newjson.items[i].children.length > 0){
				newjson.items[i].hasChildren = true;
			}
		}
		
		$("#navigation_output", rootel).html(sdata.html.Template.render('nav_pages_output',newjson));
		
	}

	if (showSettings) {
		$("#navigation_settings",rootel).show();
		loadSettings();
	}
	else {
		$("#navigation_output",rootel).show();
		doOutput();
	}

};

sdata.widgets.WidgetLoader.informOnLoad("navigation");