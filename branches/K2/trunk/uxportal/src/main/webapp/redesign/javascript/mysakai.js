var sakai = sakai || {};
sakai.dashboard = function(){

	var domyportal = false;
	var myportaljson = false;
	var startSaving = true;
	var person = false;

	var decideExists = function (response, exists){
		if (exists === false) {
			if (response === 401 || response === "error"){
				document.location = "/dev/index.html?url=/dev/redesign/my_sakai.html";
			} else {
				doInit();
			}
		} else {
			try {
				myportaljson = eval('(' + response + ')');
				var cleanContinue = true;
				for (var c in myportaljson.columns){
					for (var pi in myportaljson.columns[c]){
						if (pi != "contains") {
							if (!myportaljson.columns[c][pi].uid) {
								cleanContinue = false;
							}
						}
					}
				}
				if (cleanContinue){
					domyportal = true;
				} 
				doInit();
			} catch (err){
				doInit();
			}
		}
	}
	
	sakai.dashboard.showSettings = function(id, generic){
		var old = document.getElementById(id);
		var newel = document.createElement("div");
		newel.id = generic;
		newel.className = "widget_inline";
		old.parentNode.replaceChild(newel,old);
		document.getElementById("close_settings_" + generic).style.display = "";
		document.getElementById("show_settings_" + generic).style.display = "none";
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced(newel.parentNode.id,true);
	}
	
	sakai.dashboard.showWidgetContent = function(id, generic){
		var old = document.getElementById(id);
		var newel = document.createElement("div");
		newel.id = generic;
		newel.className = "widget_inline";
		old.parentNode.replaceChild(newel,old);
		document.getElementById("close_settings_" + generic).style.display = "none";
		document.getElementById("show_settings_" + generic).style.display = "";
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced(newel.parentNode.id,false);
	}

	var showInit = function(){
		
		var toAdd = new Array();
		var added = new Array();
		var grouptype = "General";
	
		var columns = [];
		var layout = "dev";
		var olayout = null;
		
		columns[0] = [];
		columns[1] = [];	

		columns[0][0] = "siteswow";
		columns[1][0] = "myprofilewow";
		columns[0][1] = "myfriendswow";

		var jsonobj = {};
		jsonobj.columns = {};
		
		for (var i = 0; i < columns.length; i++) {
			jsonobj.columns["column" + (i + 1)] = [];
			for (var ii = 0; ii < columns[i].length; ii++) {
				var index = jsonobj.columns["column" + (i + 1)].length;
				jsonobj.columns["column" + (i + 1)][index] = {};
				jsonobj.columns["column" + (i + 1)][index].name = columns[i][ii];
				jsonobj.columns["column" + (i + 1)][index].visible = "block";
				jsonobj.columns["column" + (i + 1)][index].uid = 'id' + Math.round(Math.random() * 10000000000000);
			}
		}
		
		jsonobj.layout = layout;
		
		myportaljson = jsonobj;
	
		sdata.widgets.WidgetPreference.save("/sdata/p/widgets","devstate",sdata.JSON.stringify(jsonobj), saveGroup);
		
	}
	
	sakai.dashboard.minimizeWidget = function(id){
		var el = $("#" + id + "_container");
		if (el.css('display') == "none"){
			el.show();
		} else {
			el.hide();	
		}
		saveState();
	}
	
	var tobindtolayoutpicker = function(){
		$(".layout-picker").bind("click", function(ev){
			var selected = this.id.split("-")[this.id.split("-").length - 1];
			var newjson = {};
			newjson.layouts = Widgets.layouts;
			newjson.selected = selected;
			currentselectedlayout = selected;
			$("#layouts_list").html(sdata.html.Template.render("layouts_template",newjson));
			tobindtolayoutpicker();
		});	
	}
	
	$("#select-layout-finished").bind("click", function(ev){
		if (currentselectedlayout == myportaljson.layout){
			$("#overlay-lightbox-layout").hide();
			$("#overlay-content-layout").hide();
		} else {
			
			var selectedlayout = currentselectedlayout;
			var columns = [];
			for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++){
				columns[i] = [];
			}
	
			var initlength = Widgets.layouts[myportaljson.layout].widths.length;
			var newlength = Widgets.layouts[selectedlayout].widths.length;
		
			var index = 0;
			for (var l in myportaljson.columns){
				if (index < newlength){
					for (var i = 0; i < myportaljson.columns[l].length; i++){
						columns[index][i] = new Object();
						columns[index][i].name = myportaljson.columns[l][i].name;
						columns[index][i].visible = myportaljson.columns[l][i].visible;
						columns[index][i].uid = myportaljson.columns[l][i].uid;
					}
					index++;
				}
			}
	
			index = 0;
			if (myportaljson.layout != selectedlayout){
				if (newlength < initlength){
					for (var l in myportaljson.columns){
						if (index >= newlength){
							for (var i = 0; i < myportaljson.columns[l].length; i++){
								var lowestnumber = -1;
								var lowestcolumn = -1;
								for (var iii = 0; iii < columns.length; iii++){
									var number = columns[iii].length;
									if (number < lowestnumber || lowestnumber == -1){
										lowestnumber = number;
										lowestcolumn = iii;
									}
								}
								var _i = columns[lowestcolumn].length;
								columns[lowestcolumn][_i] = new Object();
								columns[lowestcolumn][_i].name = myportaljson.columns[l][i].name;
								columns[lowestcolumn][_i].visible = myportaljson.columns[l][i].visible;
								columns[lowestcolumn][_i].uid = myportaljson.columns[l][i].uid;
							}
						}
						index++;
					}
				}
			}
			
			var jsonstring = '{"columns":{';
			for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++){
				jsonstring += '"column' + (i + 1) + '":[';
				for (var ii = 0; ii < columns[i].length; ii++){
					jsonstring += '{"name":"' + columns[i][ii].name + '","visible":"' + columns[i][ii].visible + '","uid":"' + columns[i][ii].uid + '"}';
					if (ii !== columns[i].length - 1){
						jsonstring += ',';
					}	
				}
				jsonstring += ']';
				if (i !== Widgets.layouts[selectedlayout].widths.length - 1){
					jsonstring += ',';
				}
			}
			jsonstring += '},"layout":"' + selectedlayout + '"}';
	
			myportaljson = eval('(' + jsonstring + ')');
	
			sdata.widgets.WidgetPreference.save("/sdata/p/widgets","devstate",jsonstring, beforeFinishAddWidgets);
			
		}
	});
	
	var beforeFinishAddWidgets = function(){
		showMyPortal();
		$("#change_layout_dialog").jqmHide();
	}

	var doInit = function (){

		person = sdata.me;
		inituser = person.preferences.uuid;
		if (!inituser || inituser == "anon") {
			document.location = "/dev/index.html";
		}
		else {
			
			$("#hispan").text(person.profile.firstName);
			
			if (person.profile.picture){
				var picture = eval('(' + person.profile.picture + ')');
				if (picture.name) {
					$("#picture_holder").html("<img src='/sdata/f/_private" + person.userStoragePrefix + picture.name + "'/>");
				}
			}
			
			$(".body-container").show();
					
			if (domyportal) {
				showMyPortal();
			}
			else {
				showInit();
			}
		}
	
	}

	var saveGroup = function (success){
	
		if (success){
	
			selected = "General"

			var jsonstring = '{"items":{"group":"' + selected + '"}}';
			
			sdata.widgets.WidgetPreference.save("/sdata/p/widgets","group",jsonstring, buildLayout);
	
		} else {
			alert("An error occured while saving your layout");
		}
	
	}

	var buildLayout = function (success){
	
		if (success){
			showMyPortal();
		} else {
			alert("An error occured while saving your group");
		}
	
	}

	var showMyPortal = function(){
	
		var layout = myportaljson;
		
		if (!Widgets.layouts[layout.layout]) {
		
			var selectedlayout = "";
			var layoutindex = 0;
			
			for (var l in Widgets.layouts) {
				if (layoutindex == 0) {
					selectedlayout = l;
					layoutindex++;
				}
			}
			
			var columns = [];
			for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++) {
				columns[i] = [];
			}
			
			var initlength = 0;
			for (var l in myportaljson.columns) {
				initlength++;
			}
			var newlength = Widgets.layouts[selectedlayout].widths.length;
			
			var index = 0;
			for (var l in myportaljson.columns) {
				if (index < newlength) {
					for (var i = 0; i < myportaljson.columns[l].length; i++) {
						columns[index][i] = new Object();
						columns[index][i].name = myportaljson.columns[l][i].name;
						columns[index][i].visible = myportaljson.columns[l][i].visible;
						columns[index][i].uid = myportaljson.columns[l][i].uid;
					}
					index++;
				}
			}
			
			index = 0;
			if (newlength < initlength) {
				for (var l in myportaljson.columns) {
					if (index >= newlength) {
						for (var i = 0; i < myportaljson.columns[l].length; i++) {
							var lowestnumber = -1;
							var lowestcolumn = -1;
							for (var iii = 0; iii < columns.length; iii++) {
								var number = columns[iii].length;
								if (number < lowestnumber || lowestnumber == -1) {
									lowestnumber = number;
									lowestcolumn = iii;
								}
							}
							var _i = columns[lowestcolumn].length;
							columns[lowestcolumn][_i] = new Object();
							columns[lowestcolumn][_i].name = myportaljson.columns[l][i].name;
							columns[lowestcolumn][_i].visible = myportaljson.columns[l][i].visible;
							columns[lowestcolumn][_i].uid = myportaljson.columns[l][i].uid;
						}
					}
					index++;
				}
			}
			
			var jsonstring = '{"columns":{';
			for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++) {
				jsonstring += '"column' + (i + 1) + '":[';
				for (var ii = 0; ii < columns[i].length; ii++) {
					jsonstring += '{"name":"' + columns[i][ii].name + '","visible":"' + columns[i][ii].visible + '","uid":"' + columns[i][ii].uid + '"}';
					if (ii !== columns[i].length - 1) {
						jsonstring += ',';
					}
				}
				jsonstring += ']';
				if (i !== Widgets.layouts[selectedlayout].widths.length - 1) {
					jsonstring += ',';
				}
			}
			
			jsonstring += '},"layout":"' + selectedlayout + '"}';
			
			myportaljson = eval('(' + jsonstring + ')');
			layout = myportaljson;
			
			sdata.widgets.WidgetPreference.save("/sdata/p/widgets", "devstate", jsonstring, null);
			
		}
		
		var final2 = {};
		final2.columns = [];
		final2.size = Widgets.layouts[layout.layout].widths.length;
		var currentindex = -1;
		var isvalid = true;
		
		try {
			for (var c in layout.columns) {
			
				currentindex++;
				var index = final2.columns.length;
				final2.columns[index] = {};
				final2.columns[index].portlets = [];
				final2.columns[index].width = Widgets.layouts[layout.layout].widths[currentindex];
				
				var columndef = layout.columns[c];
				for (var pi in columndef) {
					var portaldef = columndef[pi];
					if (portaldef.name && Widgets.widgets[portaldef.name]) {
						var widget = Widgets.widgets[portaldef.name];
						var iindex = final2.columns[index].portlets.length;
						final2.columns[index].portlets[iindex] = [];
						final2.columns[index].portlets[iindex].id = widget.id;
						final2.columns[index].portlets[iindex].iframe = widget.iframe;
						final2.columns[index].portlets[iindex].url = widget.url;
						final2.columns[index].portlets[iindex].title = widget.name;
						final2.columns[index].portlets[iindex].display = portaldef.visible;
						final2.columns[index].portlets[iindex].uid = portaldef.uid;
						final2.columns[index].portlets[iindex].placement = "~" + person.preferences.uuid;
						final2.columns[index].portlets[iindex].height = widget.height;
					}
				}
			}
			
		} 
		catch (err) {
			isvalid = false
		};
		
		
		if (isvalid) {
		
			document.getElementById('widgetscontainer').innerHTML = sdata.html.Template.render("widgetscontainer_template", final2);
			
			$(".widget1").hover(
				function(over){
					var id = this.id + "_settings";
					$("#" + id).show();
				}, 
				function(out){
					if ($("#widget_settings_menu").css("display") == "none" || this.id != currentSettingsOpen){
						var id = this.id + "_settings";
						$("#" + id).hide();	
					}
				}
			);
			
			$(".settings").bind("click", function(ev){
				if (this.id.split("_")[0] + "_" + this.id.split("_")[1] == currentSettingsOpen){
					$("#widget_" + currentSettingsOpen + "_settings").hide();
				}	
				currentSettingsOpen = this.id.split("_")[0] + "_" + this.id.split("_")[1];
				
				var el = $("#" + currentSettingsOpen.split("_")[1] + "_container");
				if (el.css('display') == "none"){
					$("#settings_hide_link").text("Show");
				} else {
					$("#settings_hide_link").text("Hide");
				}
				
				var x = $(this).position().left;
				var y = $(this).position().top;
				$("#widget_settings_menu").css("left",x - $("#widget_settings_menu").width() + 23 + "px");
				$("#widget_settings_menu").css("top", y + 18 + "px");
				$("#widget_settings_menu").show();
			});
			
			$(".more_option").hover(
				function(over){
					$(this).addClass("selected_option");
				},
				function(out){
					$(this).removeClass("selected_option");
				}
			);
			
			$("#settings_remove").bind("mousedown", function(ev){
				var id = currentSettingsOpen;
				var el = document.getElementById(id);
				var parent = el.parentNode;
				parent.removeChild(el);
				saveState();
				$("#widget_settings_menu").hide();
				$("#" + currentSettingsOpen + "_settings").hide();
				currentSettingsOpen = false;
				return false;
			});
			
			$("#settings_hide").bind("mousedown", function(ev){
				
				var el = $("#" + currentSettingsOpen.split("_")[1] + "_container");
				if (el.css('display') == "none"){
					el.show();
				} else {
					el.hide();	
				}
				saveState();
				
				$("#widget_settings_menu").hide();
				$("#" + currentSettingsOpen + "_settings").hide();
				currentSettingsOpen = false;
				return false;
			});
			
			$(document.body).bind("mousedown", function(ev){
				$("#widget_settings_menu").hide();
				$("#" + currentSettingsOpen + "_settings").hide();
				currentSettingsOpen = false;
			});
			
			var grabHandleFinder, createAvatar, options;

			grabHandleFinder = function(item){
				// the handle is the toolbar. The toolbar id is the same as the portlet id, with the
				// "portlet_" prefix replaced by "toolbar_".
				return jQuery("[id=draghandle_" + item.id + "]");
			};
			
			options = { 
	            styles:  {
	                mouseDrag: "orderable-mouse-drag",
	                dropMarker: "orderable-drop-marker-box",
	                avatar: "orderable-avatar-clone"
	            },
	             selectors: {
	                columns: ".groupWrapper",
	                modules: ".widget1",
	                grabHandle: grabHandleFinder
	            },
				listeners: {
	    			afterMove: saveState
				}
	        };
			
			fluid.reorderLayout("#widgetscontainer", options);
			
			sdata.widgets.WidgetLoader.insertWidgetsAdvanced("widgetscontainer");
			
		} else {
			showInit();
		}
	
	}		
	
	var currentSettingsOpen = false;

	var saveState = function (){
		
		serString = '{"columns":{';
		if (startSaving === true){
	
			var columns = $(".groupWrapper");
	   	 	for (var i = 0; i < columns.length; i++){
				if (i != 0){
					serString += ",";
				}
				serString += '"column' + (i + 1) + '":[';
				var column = columns[i];
				var iii = -1;
				for (var ii = 0; ii < column.childNodes.length; ii++){
					
					try {
						var node = column.childNodes[ii];
						
						if (node && node.style) {
						
							widgetdisplay = "block";
							var nowAt = 0;
							var id = node.style.display;
							var uid = Math.round(Math.random() * 100000000000);
							for (var y = 0; y < node.childNodes.length; y++) {
								if (node.childNodes[y].style) {
									if (nowAt == 1) {
										if (node.childNodes[y].style.display.toLowerCase() === "none") {
											widgetdisplay = "none";
										}
										uid = node.childNodes[y].id.split("_")[0];
									}
									nowAt++;
								}
							}
							
							iii++;
							if (iii != 0) {
								serString += ",";
							}
							serString += '{"name":"' + node.id.split("_")[0] + '","visible":"' + widgetdisplay + '","uid":"' + uid + '"}';
						
						}
					} catch (err){
						alert(err);
					}			
	
				}

				serString += "]";

			}

			serString += '},"layout":"' + myportaljson.layout + '"}';
	
			myportaljson = eval('(' + serString + ')');
			
			var isempty = true;
			for (var i in myportaljson.columns){
				if (myportaljson.columns[i].length > 0){
					isempty = false;
				}
			}

			sdata.widgets.WidgetPreference.save("/sdata/p/widgets","devstate",serString, checksucceed);
	
		}
		
	}

	var checksucceed= function (success){
		if (!success){
			window.alert("Connection with the server was lost");
		}
	}

	sakai.dashboard.showAddWidgets = function(){

		addingPossible = [];
		addingPossible.items = [];
		document.getElementById("addwidgetlist").innerHTML = "";
	
		for (var l in Widgets.widgets){
			var alreadyIn = false;
			if (! Widgets.widgets[l].multipleinstance) {
				for (var c in myportaljson.columns) {
					for (var ii = 0; ii < myportaljson.columns[c].length; ii++) {
						if (myportaljson.columns[c][ii].name === l) {
							alreadyIn = true;
						}
					}
				}
			}
			if (Widgets.widgets[l].personalportal){
				var index = addingPossible.items.length;
				addingPossible.items[index] = [];
				addingPossible.items[index].alreadyIn = alreadyIn;
				addingPossible.items[index].title = Widgets.widgets[l].name;
				addingPossible.items[index].id = Widgets.widgets[l].id;
				addingPossible.items[index].description = Widgets.widgets[l].description;
				addingPossible.items[index].img = Widgets.widgets[l].img;
			}
		}

		document.getElementById("addwidgetlist").innerHTML = sdata.html.Template.render("addwidgetlist_template", addingPossible);
		currentlyopen = addingPossible.items[0].id;

		$("#addWidgets_selected_title").text(addingPossible.items[0].title);
		$("#addWidgets_selected_description").text(addingPossible.items[0].description);
		$("#widget_img").attr("src",addingPossible.items[0].img);
		if (addingPossible.items[0].alreadyIn){
			$("#btnAddWidget").hide();
			$("#btnRemoveWidget").show();
		} else {
			$("#btnRemoveWidget").hide();
			$("#btnAddWidget").show();
		}
		
		$("#addwidgetslightbox").show();	
		$("#addwidgetslightbox2").show();
	}

	sakai.dashboard.finishAddWidgets = function(){
		document.reload(true);
	}

	var currentlyopen = "";

	sakai.dashboard.showdetails = function(id){
		for (var l in Widgets.widgets){
			if (Widgets.widgets[l].personalportal && Widgets.widgets[l].id == id){
				var alreadyIn = false;
				if (!Widgets.widgets[l].multipleinstance) {
					for (var c in myportaljson.columns) {
						for (var ii = 0; ii < myportaljson.columns[c].length; ii++) {
							if (myportaljson.columns[c][ii].name === l) {
								alreadyIn = true;
							}
						}
					}
				}
				currentlyopen = Widgets.widgets[l].id;
				$("#addWidgets_selected_title").text(Widgets.widgets[l].name);
				$("#addWidgets_selected_description").text(Widgets.widgets[l].description);
				$("#widget_img").attr("src",Widgets.widgets[l].img);
				if (alreadyIn){
					$("#btnAddWidget").hide();
					$("#btnRemoveWidget").show();
				} else {
					$("#btnRemoveWidget").hide();
					$("#btnAddWidget").show();
				}
			}
		}	
	}

	sakai.dashboard.removeWidget = function(){
		sakai.dashboard.closePortlet(currentlyopen);
		document.getElementById('li_' + currentlyopen).className = "";
		$("#btnRemoveWidget").hide();
		$("#btnAddWidget").show();
	}

	sakai.dashboard.addWidget = function(){
		
		var selectedlayout = myportaljson.layout;

		var columns = [];
		for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++){
			columns[i] = [];
		}

		var initlength = Widgets.layouts[myportaljson.layout].widths.length;
		var newlength = Widgets.layouts[selectedlayout].widths.length;
	
		var index = 0;
		for (var l in myportaljson.columns){
			if (index < newlength){
				for (var i = 0; i < myportaljson.columns[l].length; i++){
					columns[index][i] = new Object();
					columns[index][i].name = myportaljson.columns[l][i].name;
					columns[index][i].visible = myportaljson.columns[l][i].visible;
					columns[index][i].uid = myportaljson.columns[l][i].uid;
				}
				index++;
			}
		}

		index = 0;
		if (myportaljson.layout != selectedlayout){
			if (newlength < initlength){
				for (var l in myportaljson.columns){
					if (index >= newlength){
						for (var i = 0; i < myportaljson.columns[l].length; i++){
							var lowestnumber = -1;
							var lowestcolumn = -1;
							for (var iii = 0; iii < columns.length; iii++){
								var number = columns[iii].length;
								if (number < lowestnumber || lowestnumber == -1){
									lowestnumber = number;
									lowestcolumn = iii;
								}
							}
							var _i = columns[lowestcolumn].length;
							columns[lowestcolumn][_i] = new Object();
							columns[lowestcolumn][_i].name = myportaljson.columns[l][i].name;
							columns[lowestcolumn][_i].visible = myportaljson.columns[l][i].visible;
							columns[lowestcolumn][_i].uid = myportaljson.columns[l][i].uid;
						}
					}
					index++;
				}
			}
		} 

		var currentWidget = currentlyopen;
	
		var lowestnumber = -1;
		var lowestcolumn = -1;
		for (var iii = 0; iii < columns.length; iii++){
			var number = columns[iii].length;
			if (number < lowestnumber || lowestnumber == -1){
				lowestnumber = number;
				lowestcolumn = iii;
			}
		}
		var _i = columns[lowestcolumn].length;
		columns[lowestcolumn][_i] = new Object();
		columns[lowestcolumn][_i].name = currentWidget;
		columns[lowestcolumn][_i].visible = "block";
		columns[lowestcolumn][_i].uid = "id" + Math.round(Math.random() * 10000000000);
	
		var jsonstring = '{"columns":{';
		for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++){
			jsonstring += '"column' + (i + 1) + '":[';
			for (var ii = 0; ii < columns[i].length; ii++){
				jsonstring += '{"name":"' + columns[i][ii].name + '","visible":"' + columns[i][ii].visible + '","uid":"' + columns[i][ii].uid + '"}';
				if (ii !== columns[i].length - 1){
					jsonstring += ',';
				}	
			}
			jsonstring += ']';
			if (i !== Widgets.layouts[selectedlayout].widths.length - 1){
				jsonstring += ',';
			}
		}
		jsonstring += '},"layout":"' + selectedlayout + '"}';

		myportaljson = eval('(' + jsonstring + ')');

		sdata.widgets.WidgetPreference.save("/sdata/p/widgets","devstate",jsonstring, finishAddWidgets);

	}

	var finishAddWidgets = function (success){
		if (success){
			document.getElementById("widgetscontainer").innerHTML = "";
			if (!Widgets.widgets[currentlyopen].multipleinstance) {
				document.getElementById('li_' + currentlyopen).className = "awm-minus";
				$("#btnAddWidget").hide();
				$("#btnRemoveWidget").show();
			}
			showMyPortal();
		} 
		else {
			window.alert("The connection with the server has been lost");
		}
	}
	
	var currentselectedlayout = false;
	
	
	/*
		Change layout functionality 
	*/
	
	var renderLayouts = function(hash){
		var newjson = {};
		newjson.layouts = Widgets.layouts;
		newjson.selected = myportaljson.layout;
		currentselectedlayout = myportaljson.layout;
		$("#layouts_list").html(sdata.html.Template.render("layouts_template",newjson));
		tobindtolayoutpicker();
		hash.w.show();
	}
	
	$("#change_layout_dialog").jqm({
		modal: true,
		trigger: $('#edit-layout'),
		overlay: 20,
		toTop: true,
		onShow: renderLayouts
	});



	/*
		Search field functionality		 
	*/
	
	var searchHasFocus = false;
	
	$("#search_field").bind("focus", function(ev){
		if (!searchHasFocus){
			$("#search_field").css("color","#000000");
			$("#search_field").val("");
			searchHasFocus = true;
		}
	});
	
	$("#search_field").bind("keypress", function(ev){
		if (ev.which == 13){
			doSearch();
		}
	});
	
	$("#search_button").bind("click", function(ev){
		doSearch();
	});
	
	$("#search_form").bind("submit", function(ev){
		doSearch();
		return false;
	});
	
	var doSearch = function(){
		var value = $("#search_field").val();
		if (value){
			document.location = "search_b.html#1|" + value;
		}
	}


	sdata.widgets.WidgetPreference.get("devstate", decideExists);

};

sdata.registerForLoad("sakai.dashboard");