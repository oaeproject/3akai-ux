var sakai = sakai || {};

sakai.singlefile = function(tuid, placement, showSettings){

	var currentsite = false;
	var paging = {};

	var initStep = function(){
		$("#" + tuid + " #singlefile_update_selected").bind("click", function(e, ui){
			savePreferences();
		});	
		if (!showSettings){
			$("#" + tuid + " #singlefile_screen").show();
			fillScreen();
		} else {
			$("#" + tuid + " #singlefile_settings").show();
			sdata.Ajax.request({
				url :"/sdata/f/" + placement + "/" + tuid + "/fileurl?sid=" + Math.random(),
				httpMethod : "GET",
				onSuccess : function(data) {
					$("#" + tuid + " #singlefile_selected_txt").attr("value",data);
					loadSiteInfo();
				},
				onFail : function(status) {
					$("#" + tuid + " #singlefile_selected_txt").attr("value","");
					loadSiteInfo();
				}
			});
		}
	}
	
	var loadSiteInfo = function(response, exists){
		sdata.Ajax.request({
			url :"/sdata/site?siteid=" + placement.split("/")[0] + "&sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				currentsite = eval('(' + data + ')');
				loadFileList("/");
			},
			onFail : function(status) {
				loadFileList("/");
			}
		});
		
	}

	var loadFileList = function(path){
		
		var splitted = path.split("/");
		var link = '';
		paging.items = [];
		paging.items[0] = [];
		paging.items[0].title = sdata.util.URL.decode(currentsite.title);
		paging.items[0].path = "/";
				
		var splittedbis = path.split("/");
				
		if (path != "" && path != "/" && splittedbis.length >= 1){
			paging.items[0].classed = "paging";
		} 
				
		paging.size = 1;
		for (var i = 0; i < splitted.length; i++){
			if (splitted[i] != ""){
				var length = paging.items.length;
				paging.items[length] = [];
				paging.items[length].title = sdata.util.URL.decode(splitted[i].replace(/%20/g," "));
				link += "/" + splitted[i];
				paging.items[length].path = link;
       			if (i < splitted.length - 1){
					paging.items[length].classed = "paging";
				}
				paging.size ++;
			}
		}
		
		$('#' + tuid + ' #single_file_showpaging').html(sdata.html.Template.render('single_file_pagingtemplate',paging));
		$("#" + tuid + " .single_file_paging_helper_1").bind("click", function(ev){
			var id = ev.currentTarget.id.substring(25);
			loadFileList(id);
		});
		$("#" + tuid + " .single_file_paging_helper_2").bind("click", function(ev){
			var id = ev.currentTarget.id.substring(25);
			loadFileList(id);
		});
		
		sdata.Ajax.request({
			url :"/sdata/c/group/" + placement.split("/")[0] + path + "?d=1&sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				renderResources(data,true);
			},
			onFail : function(status) {
				alert("An error occured");
			}
		});
	}	

	var renderResources = function(response, exists){
		var json = eval('(' + response + ')');
		for (var i in json.items){
			for (var p in json.items[i].properties){
				if (p == 'DAV:getlastmodified'){
					json.items[i].lastmodified = formatDate(json.items[i].properties[p]);
				} else if (p == "CHEF:description"){
					json.items[i].description = json.items[i].properties[p];
				} else if (p == "DAV:displayname"){
					json.items[i].displayname = json.items[i].properties[p];
				} else if (p == "SAKAI:content_priority"){
					json.items[i].contentpriority = json.items[i].properties[p];
				}
			}
			if (json.items[i].available == false){
				json.items[i].unavailable = true;
			} else {
				json.items[i].unavailable = false;
			}
			json.items[i].icontype = getIconType(json.items[i].path);
			json.items[i].type = getType(json.items[i].path);
		}
		
		var items = [];
		items.items = [];
		for (var i in json.items){
			items.items[items.items.length] = json.items[i];
		}
	
		items.items.sort(doSort);
		$('#' + tuid + ' #single_file_showresources').html(sdata.html.Template.render('single_file_resourcestemplate',items));
		
		$("#" + tuid + ' .single_file_reference_helper').bind("click", function(ev){
			var id = ev.currentTarget.id;
			var path = id.substring(27);
			path = path.substring(path.indexOf("/") + 1);
			path = path.substring(path.indexOf("/") + 1);
			path = path.substring(path.indexOf("/") + 1);
			$("#" + tuid + ' #singlefile_selected_txt').attr("value",path);
		});
		$("#" + tuid + ' .single_file_reference_helper2').bind("click", function(ev){
			var id = ev.currentTarget.id;
			var path = id.substring(28);
			path = path.substring(path.indexOf("/") + 1);
			path = path.substring(path.indexOf("/") + 1);
			path = path.substring(path.indexOf("/") + 1);
			$("#" + tuid + ' #singlefile_selected_txt').attr("value",path);
		});
		$("#" + tuid + ' .single_file_reference_helper3').bind("click", function(ev){
			var id = ev.currentTarget.id;
			var path = id.substring(28);
			loadFileList(path);
		});
		$("#" + tuid + ' .single_file_reference_helper4').bind("click", function(ev){
			var id = ev.currentTarget.id;
			var path = id.substring(28);
			loadFileList(path);
		});
		
	}

	var formatDate = function(string){
		try {
			var year = string.substring(0,4);
			var month = string.substring(4,6);
			var day = string.substring(6,8);
			return "" + day + "/" + month + "/" + year;
		} catch (err) {
			return "Unknown";
		}
	}
	
	var doSort = function(a,b){
		try {
			if (a.contentpriority && b.contentpriority){
				if (parseInt(a.contentpriority) < parseInt(b.contentpriority)){
					return -1;
				} else {
					return 1;
				}
			} else if (a.contentpriority){
				return -1;
			} else if (b.contentpriority){
				return 1;
			} else {
				if (a.displayname.toLowerCase() < b.displayname.toLowerCase()){
					return -1;
				} else {
					return 1;
				}
			}
		} catch (err){
			return 0;
		}
	}
	
	var getIconType = function(string){
		try {
			var array = string.split(".");
			var extention = array[array.length - 1].toLowerCase();
			if (extention == "php" || extention == "html" || extention == "xml" || extention == "css" || extention == "js"){
				return "code";
			} else if (extention == "doc" || extention == "docx" || extention == "rtf"){
				return "doc";
			} else if (extention == "exe"){
				return "exe";
			} else if (extention == "mov" || extention == "avi" || extention == "mp4"){
				return "film";
			} else if (extention == "fla" || extention == "as" || extention == "flv"){
				return "flash";
			} else if (extention == "mp3" || extention == "wav" || extention == "midi" || extention == "asf"){
				return "music";
			} else if (extention == "pdf"){
				return "pdf";
			} else if (extention == "png" || extention == "gif" || extention == "jpeg" || extention == "jpg" || extention == "tiff" || extention == "bmp"){
				return "picture";
			} else if (extention == "ppt" || extention == "pptx" || extention == "pps" || extention == "ppsx"){
				return "ppt";
			} else if (extention == "txt"){
				return "txt";
			} else if (extention == "xls" || extention == "xlsx"){
				return "xls";
			} else if (extention == "zip" || extention == "rar"){
				return "zip";
			} else {
				return "other";
			}
		} catch (err){
			return "other";
		}
	}

	var getType = function(string){
		try {
			var array = string.split(".");
			var extention = array[array.length - 1].toLowerCase();
			if (extention == "php" || extention == "html" || extention == "xml" || extention == "css" || extention == "js"){
				return "Web document";
			} else if (extention == "doc" || extention == "docx" || extention == "rtf"){
				return "Word file";
			} else if (extention == "exe"){
				return "Program";
			} else if (extention == "mov" || extention == "avi" || extention == "mp4"){
				return "Movie";
			} else if (extention == "fla" || extention == "as" || extention == "flv"){
				return "Flash";
			} else if (extention == "mp3" || extention == "wav" || extention == "midi" || extention == "asf"){
				return "Audio";
			} else if (extention == "pdf"){
				return "PDF file";
			} else if (extention == "png" || extention == "gif" || extention == "jpeg" || extention == "jpg" || extention == "tiff" || extention == "bmp"){
				return "Picture";
			} else if (extention == "ppt" || extention == "pptx" || extention == "pps" || extention == "ppsx"){
				return "Powerpoint";
			} else if (extention == "txt"){
				return "Text file";
			} else if (extention == "xls" || extention == "xlsx"){
				return "Excel";
			} else if (extention == "zip" || extention == "rar"){
				return "Archive";
			} else {
				return "Other";
			}
		} catch (err){
			return "Other";
		}
	}

	var fillScreen = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/fileurl?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				loadFileReference(data);
			},
			onFail : function(status) {
				$("#" + tuid + " #singlefile_screen").text("No file found");
			}
		});
	}

	var loadFileReference = function(data){
		sdata.Ajax.request({
			url :"/sdata/c/group/" + placement.split("/")[0] + "/" + data + "?f=m&sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				var json = eval('(' + data + ')');
				var image = determineIcon(json.path);
				$("#" + tuid + " #singlefile_content").html("<a href='/sdata/c" + json.path + "' target='_blank'><img src='/devwidgets/singlefile/images/" + image + ".gif' border='0' width='45px'/></a><br/><a href='/sdata/c" + json.path + "' target='_blank'>" + json.properties["DAV:displayname"] + "</a>");
			},
			onFail : function(status) {
				$("#" + tuid + " #singlefile_screen").text("File does not exist");
			}
		});
	}

	var determineIcon = function(path){
		try {
			var iconstring = path.split(".")[path.split(".").length - 1];
			if (iconstring == "avi" || iconstring == "mp4" || iconstring == "wmv"){
				return "avi";
			} else if (iconstring == "txt" || iconstring == "xml" || iconstring == "css"){
				return "doc";
			} else if (iconstring == "html" || iconstring == "htm"){
				return "html";
			} else if (iconstring == "jpg" || iconstring == "jpeg" || iconstring == "gif" || iconstring == "png" || iconstring == "tiff"){
				return "jpg";
			} else if (iconstring == "mp3" || iconstring == "wav" || iconstring == "midi") {
				return "jpg";
			} else if (iconstring == "zip" || iconstring == "rar" || iconstring == "dmg") {
				return "zip";
			} else {
				return "other";
			}
		} catch (err) {
			return "other";	
		}
	}

	var savePreferences = function(){
		var val = $("#" + tuid + " #singlefile_selected_txt").attr("value");
		if (!val || val.replace(/ /g,"") == ""){
			sdata.Ajax.request({
				url :"/sdata/f/" + placement + "/" + tuid + "/fileurl?sid=" + Math.random(),
				httpMethod : "DELETE",
				onSuccess : function(data) {
					finishNewSettings(true);
				},
				onFail : function(status) {
					finishNewSettings(false);
				}
			});
		} else {
			sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "fileurl", val, finishNewSettings);
		}
	}

	var finishNewSettings = function(success){
		$("#" + tuid + " #singlefile_screen").show();
		$("#" + tuid + " #singlefile_settings").hide();
		fillScreen();
	}

	initStep();	

};

sdata.widgets.WidgetLoader.informOnLoad("singlefile");