var sakai = sakai || {};

sakai.dashboard = function(){

	var domyportal = false;
	var myportaljson = false;
	var startSaving = true;
	var currentsite = null;
	var pages = false;
	var selectedpage = false;
	var pagetypes = {};
	var pagecontents = {};
	var editor = false;
	var pageconfiguration = false;
	
	var newwidget_id = false;
	var newwidget_uid = false;
	
	sakai.dashboard.generateUrl = function(){
		var value = $("#new_page_title").val().toLowerCase().replace(/ /g,"-");
		$("#new_page_id").val(value);
	}

	var doInit = function(){
		sdata.Ajax.request({
			url: "/rest/me",
			onSuccess: function(response){
				var person = eval('(' + response + ')');
				if (person.preferences.uuid){
					inituser = person.profile.firstName + " " + person.profile.lastName;
					$("#userid").text(inituser);
					$("#loginLink").hide();
				} else {
					$(".main_header_bar").hide();
					$("#widget_chat").hide();
					sakai._isAnonymous = true;
					$("#loginLink").show();
				}
				$("#body").show();
				loadPagesInitial();
			},
			onFail: function(httpstatus){
				//document.location = "/dev/index.html";
			}
		});
		
	};
	
	sakai.dashboard.showManageSite = function(){
		sakai.dashboard.showpopup("manage_site_settings");
	};
	
	sakai.dashboard.showSettings = function(id, generic){
		var old = document.getElementById(id);
		var newel = document.createElement("div");
		newel.id = generic;
		newel.className = "widget_inline";
		old.parentNode.replaceChild(newel, old);
		document.getElementById("close_settings_" + generic).style.display = "";
		document.getElementById("show_settings_" + generic).style.display = "none";
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced(newel.parentNode.id, true);
	};
	
	sakai.dashboard.showWidgetContent = function(id, generic){
		var old = document.getElementById(id);
		var newel = document.createElement("div");
		newel.id = generic;
		newel.className = "widget_inline";
		old.parentNode.replaceChild(newel, old);
		document.getElementById("close_settings_" + generic).style.display = "none";
		document.getElementById("show_settings_" + generic).style.display = "";
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced(newel.parentNode.id, false);
	};
	
	var totaltotry = 0;
	
	loadPagesInitial = function(){
	
		$("#initialcontent").show();
		totaltotry = 0;
		
		sdata.Ajax.request({
			url: "/sdata/f/" + currentsite.id + "/pageconfiguration?sid=" + Math.random(),
			onSuccess: function(response){
				pages = eval('(' + response + ')');
				pageconfiguration = pages;
				History.history_change();
			},
			onFail: function(httpstatus){
				
				
				pages = {};
				pages.items = {};
				pageconfiguration = pages;
				History.history_change();
				
			}
		});
		
	};
	
	checkRetry = function(success){
		totaltotry = totaltotry - 1;
		if (totaltotry <= 0){
			loadPagesInitial();
		}
	}
	
	loadPages = function(toopen){
	
		sdata.Ajax.request({
			url: "/sdata/f/" + currentsite.id + "/pageconfiguration?sid=" + Math.random(),
			onSuccess: function(response){
				continueLoadPages(response, true, toopen);
			},
			onFail: function(httpstatus){
				continueLoadPages(httpstatus, false, toopen);
			}
		});
		
	};
	
	continueLoadPages = function(response, exists, toopen){
	
		if (exists) {
			pages = eval('(' + response + ')');
			pageconfiguration = pages;
			if (toopen) {
				var exists = false;
				for (var i = 0; i < pages.items.length; i++) {
					if (pages.items[i].id == toopen) {
						sakai.dashboard.openPage(toopen);
						exists = true;
					}
				}
				if (exists == false) {
					for (var i = 0; i < pages.items.length; i++) {
						if (pages.items[i].top) {
							sakai.dashboard.openPage(pages.items[i].id);
							break;
						}
					}
				}
			}
			else {
				for (var i = 0; i < pages.items.length; i++) {
					if (pages.items[i].top) {
						sakai.dashboard.openPage(pages.items[i].id);
						break;
					}
				}
			}
		}
	}
	
	sakai.dashboard.createNewPage = function(){
	
		sakai.dashboard.showpopup("create_new_page");
		$("#new_page_title").val("");
		$("#new_page_id").val("");
		$("#new_page_title").focus();
		
	}
	
	
	loadCurrentSiteObject = function(){
		var qs = new Querystring();
		currentsite = qs.get("siteid","false");
		if (currentsite == "false") {
			//document.location = "/dev/";
		}
		else {
		
			$("#site_settings_link").attr("href", $("#site_settings_link").attr("href") + "?site=" + currentsite);
			
			sdata.Ajax.request({
				url: "/rest/site/get/" + currentsite + "?sid=" + Math.random(),
				onSuccess: function(response){
					continueLoad(response, true);
				},
				onFail: function(httpstatus){
					continueLoad(httpstatus, false);
				}
			});
		}
	}
	
	continueLoad = function(response, exists){
		if (exists) {
			currentsite = eval('(' + response + ')');
			
			if (currentsite.id.substring(0, 1) != "~") {
				$("#sitetitle").text(currentsite.name);
				if (!sakai._isAnonymous) {
					sdata.Ajax.request({
						url: "/sdata/me?user=" + currentsite.owner,
						onSuccess: function(response){
							var json = eval('(' + response + ')');
							if (json.items.firstname || json.items.lastname) {
								$("#portfolio_participant_name").text(json.items.firstname + " " + json.items.lastname);
							}
						},
						onFail: function(httpstatus){
						
						}
					});
				}
			}
			else {
				sdata.Ajax.request({
					url: "/sdata/me?user=" + currentsite.id.substring(1),
					onSuccess: function(response){
						var json = eval('(' + response + ')');
						$("#sitetitle").text(json.items.firstname + " " + json.items.lastname);
						$("#portfolio_participant_name").text(json.items.firstname + " " + json.items.lastname);
					},
					onFail: function(httpstatus){
					
					}
				});
			}
			
			sdata.Ajax.request({
				url: "/rest/me?sid=" + Math.random(),
				onSuccess: function(response){
					
					var userjson = eval('(' + response + ')');
					var isMaintainer = false;
			
					if (userjson.preferences.subjects) {
						for (var i = 0; i < userjson.preferences.subjects.length; i++) {
							var subject = userjson.preferences.subjects[i];
							var siteid = subject.split(":")[0];
							var role = subject.split(":")[1];
							if (siteid == currentsite.id && role == "owner"){							
								isMaintainer = true;
							}
						}
					}
					
					if (isMaintainer) {
						$("#management_bar").show();
						$("#sitefiles").show();
						$("#editbutton1").show();
						$("#editbutton2").show();
						$("#editbutton3").show();
						$("#addbutton").show();
						$("#editbutton").show();
						$("#admin_site_settings").show();
						$("#admin_site_files").show();
						$("#admin_page_management").show();
					}
					
					//deleteHistory();
					doInit();
					
				},
				onFail: function(httpstatus){
				
				}
			});
			
		}
	}
	
	sakai.dashboard.openPage = function(pageid){
		History.addBEvent(pageid);
	}
	
	sakai.dashboard.openPageH = function(pageid){
	
		if (!pageid) {
			for (var i = 0; i < pages.items.length; i++) {
				if (pages.items[i].top) {
					pageid = pages.items[i].id;
					break;
				}
			}
		}
		
		$("#loginLink").attr("href","/dev/index.html?url=" + sdata.util.URL.encode(document.location.pathname + document.location.search + document.location.hash));
		
		sakai.dashboard.hidepopup();
		$("#webpage_edit").hide();
		$("#dashboard_edit").hide();
		$("#tool_edit").hide();
		selectedpage = pageid;
		
		pages.selected = pageid;
		document.getElementById("sidebar-content-pages").innerHTML = sdata.html.Template.render("menu_template", pages);
		
		// Accessibility of right hand menu
		
		// Pull all the anchors out of the tab order
		jQuery("a", jQuery('#sidebar-content-pages')).tabindex(-1);
		
		// Keyboard support start here
		var tools = jQuery('#sidebar-content-pages');
		tools.tabbable();
		
		var rows = $(".menu_selectable", tools);
		
		tools.selectable({
			selectableElements: rows,
			onSelect: function(){
			}
		});
		var handler = function(el){
			var pagetoopen = el.id.split("_")[1];
			sakai.dashboard.openPage(pagetoopen);
		};
		rows.activatable(handler);
		
		// End Accessibility
		
		$("#sidebar-content-pages").show();
		if (currentsite.isMaintainer) {
			//$(".tool-menu1-del").show();
		}
		
		var el = document.getElementById("container");
		var hasopened = false;
		for (var i = 0; i < el.childNodes.length; i++) {
			try {
				el.childNodes[i].style.display = "none";
				if (el.childNodes[i].id == pageid.replace(/ /g, "%20")) {
					hasopened = true;
				}
			} 
			catch (err) {
			}
		}
		
		if (hasopened) {
			myportaljson = myportaljsons[pageid];
			if (pagetypes[pageid] == "webpage") {
				$("#webpage_edit").show();
			}
			else 
				if (pagetypes[pageid] == "dashboard") {
					$("#dashboard_edit").show();
				}
				else 
					if (pagetypes[pageid] == "tool") {
						$("#tool_edit").show();
					}
			var escaped = pageid.replace(/ /g, "\\%20");
			escaped = pageid.replace(/[.]/g, "\\\\\\.");
			$("#" + escaped).show();
		}
		else {
			var type = false;
			for (var i = 0; i < pages.items.length; i++) {
				if (pages.items[i].id == pageid) {
					type = pages.items[i].type;
				}
			}
			
			if (type) {
				pagetypes[selectedpage] = type;
				if (type == "dashboard") {
					var el = document.createElement("div");
					el.id = selectedpage.replace(/ /g, "%20");
					el.className = "container_child";
					var cel = document.createElement("div");
					cel.id = "widgetscontainer";
					cel.style.padding = "0px 7px 0px 7px";
					el.appendChild(cel);
					document.getElementById("container").appendChild(el);
					sdata.Ajax.request({
						url: "/sdata/f/" + currentsite.id + "/pages/" + selectedpage + "/state?sid=" + Math.random(),
						httpMethod: "GET",
						onSuccess: function(data){
							decideDashboardExists(data, true, el);
						},
						onFail: function(status){
							decideDashboardExists(status, false, el);
						},
						contentType: "multipart/form-data"
					});
				}
				else 
					if (type == "webpage") {
						sdata.Ajax.request({
							url: "/sdata/f/" + currentsite.id + "/pages/" + selectedpage + "/content" + "?sid=" + Math.random(),
							onSuccess: function(response){
								displayPage(response, true);
							},
							onFail: function(httpstatus){
								displayPage(httpstatus, false);
							}
						});
					}
					else 
						if (type == "tool") {
							var el = document.createElement("div");
							el.id = selectedpage.replace(/ /g, "%20");
							el.className = "container_child";
							document.getElementById("container").appendChild(el);
							
							showTool();
						}
			}
			else {
				$("#error_404").show();
			}
			
		}
		
	}
	
	myportaljson = false;
	myportaljsons = {};
	
	decideDashboardExists = function(response, exists, parent){
		$("#dashboard_edit").show();
		if (exists) {
			myportaljson = eval('(' + response + ')');
			myportaljsons[selectedpage] = myportaljson;
			showMyPortal();
		}
		else {
			myportaljson = {
				"columns": {
					"column1": [],
					"column2": [],
					"column3": []
				},
				"layout": "threecolumn"
			};
			myportaljsons[selectedpage] = myportaljson;
			parent.innerHTML = "<div id='widgetscontainer'>No widgets found</div>";
		}
	}
	
	var showMyPortal = function(){
	
		if (!initiallyLoadedPopups) {
			sdata.Ajax.request({
				url: "/dev/site_management_popups.html",
				httpMethod: "GET",
				onSuccess: function(data){
					$("#popupcontainer").html(data);
					$("#new_page_base_url").html(document.location.protocol + "//" + document.location.host + "/site/" + currentsite.id + "/");
					initiallyLoadedPopups = true;
					doShowMyPortal();
				},
				onFail: function(status){
				}
			});
		}
		else {
			doShowMyPortal();
		}
		
	}
	
	var doShowMyPortal = function(){
	
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
			
			var data = {
				"items": {
					"data": jsonstring,
					"fileName": "state",
					"contentType": "text/plain"
				}
			};
			sdata.Ajax.request({
				url: "/sdata/f/" + currentsite.id + "/pages/" + selectedpage.replace(/ /g, "%20"),
				httpMethod: "POST",
				onSuccess: function(data){
					//buildLayout(data,true);
				},
				onFail: function(status){
					//buildLayout(status,false);
				},
				postData: data,
				contentType: "multipart/form-data"
			});
			
		}
		
		var final = [];
		final.columns = [];
		var currentindex = -1;
		var isvalid = true;
		
		try {
			for (var c in layout.columns) {
			
				currentindex++;
				var index = final.columns.length;
				final.columns[index] = [];
				final.columns[index].portlets = [];
				final.columns[index].width = Widgets.layouts[layout.layout].widths[currentindex];
				
				var columndef = layout.columns[c];
				for (var pi in columndef) {
					var portaldef = columndef[pi];
					if (portaldef.name && Widgets.widgets[portaldef.name]) {
						var widget = Widgets.widgets[portaldef.name];
						var iindex = final.columns[index].portlets.length;
						final.columns[index].portlets[iindex] = [];
						final.columns[index].portlets[iindex].id = widget.id;
						final.columns[index].portlets[iindex].uid = portaldef.uid;
						final.columns[index].portlets[iindex].placement = currentsite.id + "/" + selectedpage.replace(/ /g, "%20");
						final.columns[index].portlets[iindex].iframe = widget.iframe;
						final.columns[index].portlets[iindex].url = widget.url;
						final.columns[index].portlets[iindex].title = widget.name;
						final.columns[index].portlets[iindex].display = portaldef.visible;
						final.columns[index].portlets[iindex].height = widget.height;
					}
				}
			}
			
		} 
		catch (err) {
			isvalid = false
		};
		
		
		if (isvalid) {
		
			if (currentsite.isMaintainer) {
			
				final.tuid = selectedpage.replace(/ /g, "%20");
				
				$("#" + selectedpage.replace(/ /g, "\\%20") + " #widgetscontainer").html(sdata.html.Template.render("widgetscontainer_template", final));
				
				/*
				 $('div.groupWrapper').Sortable(
				 {
				 accept: 'widget1',
				 helperclass: 'sortHelper',
				 activeclass: 'sortableactive',
				 hoverclass: 'sortablehover',
				 handle: 'div.widget1-head',
				 tolerance: 'pointer',
				 onChange: function(ser){
				 },
				 onStart: function(){
				 $.iAutoscroller.start(this, document.getElementsByTagName('body'));
				 },
				 onStop: function(){
				 $.iAutoscroller.stop();
				 saveState();
				 }
				 });
				 */
				/*
var layout, dropTargetPerms, grabHandle;
				
				var columnsdef = [];
				var tussen = 0;
				
				for (var c = 0; c < final.columns.length; c++) {
					var portlets = final.columns[c].portlets;
					tussen++;
					var index = columnsdef.length;
					columnsdef[index] = {};
					columnsdef[index].id = "column_uid_" + tussen;
					columnsdef[index].children = [];
					for (var p = 0; p < portlets.length; p++) {
						var index2 = columnsdef[index].children.length;
						columnsdef[index].children[index2] = portlets[p].id + "_" + portlets[p].uid;
					}
				}
				
				layout = {
					id: selectedpage.replace(/ /g, "%20"),
					columns: columnsdef
				};
				
				grabHandle = function(item){
					// the handle is the toolbar. The toolbar id is the same as the portlet id, with the
					// "portlet_" prefix replaced by "toolbar_".
					return jQuery("[id=draghandle_" + item.id + "]");
				};
				
				var classNames, options;
				
				classNames = {
					mouseDrag: "orderable-mouse-drag",
					dropMarker: "orderable-drop-marker-box",
					avatar: "orderable-avatar-clone"
				};
				
				createAvatar = function(el){
					var div = document.createElement("div");
					var element = $(el);
					div.style.width = element.width() + "px";
					div.style.height = element.height() + "px";
					div.innerHTML = el.innerHTML;
					//console.debug(element.width());
					div.style.backgroundColor = "#EEEEEE";
					div.className = "widget1";
					//div.style.border = "2px dashed #AAAAAA"
					return div;
				}
				
				options = {
					styles: classNames,
					dropWarningId: "drop-warning",
					grabHandle: grabHandle,
					avatarCreator: createAvatar,
					orderChangedCallback: saveState
				};
				
				fluid.initLayoutCustomizer(layout, dropTargetPerms, null, options);
*/
			
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
			
			fluid.reorderLayout("#" + selectedpage.replace(/ /g, "%20"), options);
				
			}
			else {
			
				$("#" + selectedpage.replace(/ /g, "\\%20") + " #widgetscontainer").html(sdata.html.Template.render("widgetscontainer_template_no_maintainer", final));
				
			}
			
			if (navigator.userAgent.indexOf("MSIE") != -1) {
				var items = $(".itemHeader");
				for (var i = 0; i < items.length; i++) {
					items[i].style.width = "100%";
				}
			}
			
			sdata.widgets.WidgetLoader.insertWidgetsAdvanced(selectedpage.replace(/ /g, "%20"));
			
		}
		else {
			showInit();
		}
		
	}
	
	sakai.dashboard.closePortlet = function(id){
		var el = $("#" + selectedpage.replace(/ /g, "\\%20") + " #" + id)[0];
		var parent = el.parentNode;
		parent.removeChild(el);
		saveState();
	}
	
	sakai.dashboard.removeWidget = function(){
		sakai.dashboard.closePortlet(currentlyopen);
		document.getElementById('li_' + currentlyopen).className = "";
		$("#btnRemoveWidget").hide();
		$("#btnAddWidget").show();
	}
	
	var saveState = function(){
	
		serString = '{"columns":{';
		if (startSaving === true) {
		
			var columns = $("#" + selectedpage.replace(/ /g, "\\%20") + " .groupWrapper");
			for (var i = 0; i < columns.length; i++) {
				if (i != 0) {
					serString += ",";
				}
				serString += '"column' + (i + 1) + '":[';
				var column = columns[i];
				var iii = -1;
				for (var ii = 0; ii < column.childNodes.length; ii++) {
				
					try {
						var node = column.childNodes[ii];
						
						widgetdisplay = "block";
						var nowAt = 0;
						var id = node.style.display;
						var uid = "id" + Math.round(Math.random() * 10000000000);
						for (var y = 0; y < node.childNodes.length; y++) {
							if (node.childNodes[y].style) {
								if (nowAt == 1) {
									if (node.childNodes[y].style.display.toLowerCase() === "none") {
										widgetdisplay = "none";
									}
									uid = node.childNodes[y].id;
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
					catch (err) {
					}
					
				}
				
				serString += "]";
				
			}
			
			serString += '},"layout":"' + myportaljson.layout + '"}';
			
			myportaljson = eval('(' + serString + ')');
			
			var isempty = true;
			for (var i in myportaljson.columns) {
				if (myportaljson.columns[i].length > 0) {
					isempty = false;
				}
			}
			
			var data = {
				"items": {
					"data": serString,
					"fileName": "state",
					"contentType": "text/plain"
				}
			};
			sdata.Ajax.request({
				url: "/sdata/f/" + currentsite.id + "/pages/" + selectedpage,
				httpMethod: "POST",
				onSuccess: function(data){
					checksucceed(data, true);
				},
				onFail: function(status){
					checksucceed(status, false);
				},
				postData: data,
				contentType: "multipart/form-data"
			});
			
		}
		
	}
	
	var checksucceed = function(success){
		if (!success) {
			window.alert("Connection with the server was lost");
		}
	}
	
	sakai.dashboard.showAddWidgets = function(){
	
		sakai.dashboard.showpopup("add_widget_screen");
	
		try {
			
			addingPossible = [];
			addingPossible.items = [];
			document.getElementById("addwidgetlist").innerHTML = "";
			
			for (var i = 0; i < pageconfiguration.items.length; i++){
				var el = pageconfiguration.items[i];
				if (el.id == selectedpage){
					$("#add_widgets_tabtogoin").text(el.title);
				}
			}
			
			for (var l in Widgets.widgets) {
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
				if (Widgets.widgets[l].siteportal) {
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
			$("#widget_img").attr("src", addingPossible.items[0].img);
			if (addingPossible.items[0].alreadyIn) {
				$("#btnAddWidget").hide();
				$("#btnRemoveWidget").show();
			}
			else {
				$("#btnRemoveWidget").hide();
				$("#btnAddWidget").show();
			}
		
		} catch (err){
			setTimeout("sakai.dashboard.showAddWidgets()",200);
		}
	
	}
	
	var currentlyopen = "";
	
	sakai.dashboard.showdetails = function(id){
		for (var l in Widgets.widgets) {
			if (Widgets.widgets[l].siteportal && Widgets.widgets[l].id == id) {
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
				$("#widget_img").attr("src", Widgets.widgets[l].img);
				if (alreadyIn) {
					$("#btnAddWidget").hide();
					$("#btnRemoveWidget").show();
				}
				else {
					$("#btnRemoveWidget").hide();
					$("#btnAddWidget").show();
				}
			}
		}
	}
	
	sakai.dashboard.addWidget = function(){
	
		var selectedlayout = "dev";
		
		var columns = [];
		for (var i = 0; i < Widgets.layouts[selectedlayout].widths.length; i++) {
			columns[i] = [];
		}
		
		var initlength = Widgets.layouts[myportaljson.layout].widths.length;
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
		if (myportaljson.layout != selectedlayout) {
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
		}
		
		var currentWidget = currentlyopen;
		
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
		columns[lowestcolumn][_i].name = currentWidget;
		columns[lowestcolumn][_i].visible = "block";
		columns[lowestcolumn][_i].uid = "id" + Math.round(Math.random() * 1000000000000);
		
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
		
		var data = {
			"items": {
				"data": jsonstring,
				"fileName": "state",
				"contentType": "text/plain"
			}
		};
		sdata.Ajax.request({
			url: "/sdata/f/" + currentsite.id + "/pages/" + selectedpage,
			httpMethod: "POST",
			onSuccess: function(data){
				finishAddWidgets(data, true);
			},
			onFail: function(status){
				finishAddWidgets(status, false);
			},
			postData: data,
			contentType: "multipart/form-data"
		});
		
	}
	
	finishAddWidgets = function(success){
		if (success) {
			$("#" + selectedpage.replace(/ /g, "\\%20") + " #widgetscontainer").html("");
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
	
	displayPage = function(response, exists){
		if (exists) {
			pagecontents[selectedpage] = response;
			$("#webpage_edit").show();
			var el = document.createElement("div");
			el.id = selectedpage.replace(/ /g, "%20");
			el.className = "container_child";
			el.innerHTML = response;
			
			pagecontents[selectedpage] = el.innerHTML;
			
			var els = $("a", el);
			for (var i = 0; i < els.length; i++) {
				var nel = els[i];
				if (nel.className == "contauthlink") {
					nel.href = "#" + nel.href.split("/")[nel.href.split("/").length - 1];
				}
			}
			
			document.getElementById("container").appendChild(el);
			sdata.widgets.WidgetLoader.insertWidgetsAdvanced(selectedpage.replace(/ /g, "%20"));
			
			jQuery("a", $("#container")).tabbable();
			
		}
		else {
			$("#error_404").show();
		}
	}
	
	var newpageid = false;
	var type = false;
	
	sakai.dashboard.addNewPage = function(){
	
		var valid = true;
		var validmessage = "";
		
		var el = $("#BinderAddNewPageForm");
		var json = sdata.FormBinder.serialize(el);
		
		type = json["new_page_type"];
		var pagetitle = json["new_page_title"];
		var pageid = json["new_page_id"];
		if (pagetitle.replace(/ /g, "") == "") {
			valid = false;
			validmessage = "Please specify a page name";
		}
		if (pageid.replace(/ /g, "") == "") {
			valid = false;
			validmessage = "Please specify a page url";
		}
		newpageid = pageid;
		pagetitle = pagetitle.replace(/\//g, "_");
		pagetitle = pagetitle.replace(/"/g, "_");
		pagetitle = pagetitle.replace(/'/g, "_");
		if (valid) {
		
			sdata.Ajax.request({
				url: "/sdata/f/" + currentsite.id + "/pages/" + pageid + "?sid=" + Math.random(),
				httpMethod: "GET",
				onSuccess: function(data){
					alert("This url is already taken");
				},
				onFail: function(status){
					sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/pages/" + newpageid, "metadata", '{"type":"' + type + '"}', checkCreateSuccess);
				}
			});
			
		}
		else {
			alert(validmessage);
		}
		
	}
	
	randomString = function(string_length){
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var randomstring = '';
		for (var i = 0; i < string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum, rnum + 1);
		}
		return randomstring;
	}
	
	checkCreateSuccess = function(success){
		var pagetitle = document.getElementById("new_page_title").value;
		sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/pages/" + newpageid, "content", "<h2>" + pagetitle + "</h2>", checkCreateSuccess2);
	}
	
	checkCreateSuccess2 = function(success){
		sdata.Ajax.request({
			url: "/sdata/f/" + currentsite.id + "/pageconfiguration?sid=" + Math.random(),
			httpMethod: "GET",
			onSuccess: function(data){
				checkCreateSuccess3(data, true);
			},
			onFail: function(status){
				checkCreateSuccess3(status, false);
			}
		});
	}
	
	checkCreateSuccess3 = function(response, exists){
		var pagetitle = document.getElementById("new_page_title").value;
		var json = {};
		json.items = [];
		if (exists) {
			json = eval('(' + response + ')');
		}
		var index = json.items.length;
		json.items[index] = {};
		json.items[index].id = newpageid;
		json.items[index].title = pagetitle;
		json.items[index].type = type;
		var top = false;
		if (document.getElementById('new_page_top_yes').checked) {
			top = true;
		}
		json.items[index].top = top;
		pageconfiguration = json;
		var tostring = sdata.JSON.stringify(json);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "", "pageconfiguration", tostring, checkCreateSuccess4);
	}
	
	checkCreateSuccess4 = function(success){
		if (!success) {
			alert("An error has occured");
		}
		else {
			loadPages(newpageid);
		}
		var pagetitle = document.getElementById("new_page_title").value;
		document.getElementById("new_page_title").value = "";
		sakai.dashboard.hidepopup();
	}
	
	deleteHistory = function(){
		sdata.Ajax.request({
			url: "/sdata/f/" + currentsite.id,
			httpMethod: "DELETE",
			onSuccess: function(data){
			},
			onFail: function(status){
			}
		});
	}
	
	sakai.dashboard.editPage = function(){
	
		if (!tinyMCEInitiated){
			initTinyMCE();
			tinyMCEInitiated = true;
		}
			
			var escaped = selectedpage.replace(/ /g, "%20");
			document.getElementById(escaped).innerHTML = "";
			var el = document.getElementById("container");
			var hasopened = false;
			for (var i = 0; i < el.childNodes.length; i++) {
				try {
					el.childNodes[i].style.display = "none";
				} 
				catch (err) {
				}
			}
			//$("#webpage_edit").hide();

			try {
				tinyMCE.get("txt_editfield").setContent("");
				
				var content = pagecontents[selectedpage];
				var content2 = pagecontents[selectedpage];
				var findLinks = new RegExp("<"+"img"+".*?>","gim");
				var extractAttributes = /\s\S*?="(.*?)"/gim;	
			
				while (findLinks.test(content)) {
					var linkMatch = RegExp.lastMatch;
					
					var todo = 2;
					var originalicon = "";
					var newicon = "";
					var typeofwidget = "";
					
					while (extractAttributes.test(linkMatch)) {
						var attribute = RegExp.lastMatch;
						var value = RegExp.lastParen;
						attribute = attribute.split("=")[0].replace(/ /g,"")				
						if (attribute.toLowerCase() == "id"){
							if (value.split("_")[0] == "widget"){
								todo -= 1;
								typeofwidget = value.split("_")[1];
							}
						} else if (attribute.toLowerCase() == "src"){
							todo -= 1;
							originalicon = value;
							if (Widgets.widgets[typeofwidget]){
								newicon = Widgets.widgets[typeofwidget].img;
							}
						}
						
					}
					
					if (todo == 0 && originalicon && newicon && (originalicon != newicon)){
						content2 = content2.replace(originalicon, newicon);
					}
					
				}
				
				tinyMCE.get("txt_editfield").setContent(content2);
				$("#editfield").show();
				
			} catch (err){
				setTimeout(sakai.dashboard.editPage,500);
			}
		
	}
	
	sakai.dashboard.cancelEditPage = function(){
		var escaped = selectedpage.replace(/ /g, "%20");
		document.getElementById(escaped).innerHTML = pagecontents[selectedpage];
		$("#editfield").hide();
		if (pagetypes[selectedpage] == "webpage") {
			$("#webpage_edit").show();
		}
		document.getElementById(escaped).style.display = "block";
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced(escaped);
	}
	
	sakai.dashboard.saveEditPage = function(){
		$("#editfield").hide();
		if (pagetypes[selectedpage] == "webpage") {
			$("#webpage_edit").show();
		}
		var escaped = selectedpage.replace(/ /g, "%20");
		pagecontents[selectedpage] = tinyMCE.get("txt_editfield").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
		document.getElementById(escaped).innerHTML = pagecontents[selectedpage];
		
		var els = $("a", $("#" + escaped));
		for (var i = 0; i < els.length; i++) {
			var nel = els[i];
			if (nel.className == "contauthlink") {
				nel.href = "#" + nel.href.split("/")[nel.href.split("/").length - 1];
			}
		}
		
		document.getElementById(escaped).style.display = "block";
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced(escaped);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/pages/" + selectedpage, "content", pagecontents[selectedpage], checkCreateSuccess5);
	}
	
	checkCreateSuccess5 = function(success){
		if (!success) {
			alert("An error has occured while saving");
		}
	}
	
	sakai.dashboard.showWidgetList = function(ed){
		if (ed) {
			editor = ed;
		}
		sakai.dashboard.showpopup("insert_new_widget");
		
		try {
			
			var testel = document.getElementById('insert_new_widget_list');
			testel.innerHTML += "";
		
			$("#insert_screen1").show();
			$("#insert_screen2").hide();
			
			var available = {};
			available.items = [];
			for (var i in Widgets.widgets) {
				try {
					if (Widgets.widgets[i].ca) {
						var index = available.items.length;
						available.items[index] = {};
						available.items[index].id = i;
						available.items[index].name = Widgets.widgets[i].name;
					}
				} 
				catch (ex) {
				};
			}
			
		} catch (err){
			
			setTimeout("sakai.dashboard.showWidgetList()",200);
			
		}
		
		$("#insert_new_widget_list").html(sdata.html.Template.render("insert_new_widget_template", available));
		
	}
	
	sakai.dashboard.nextStep = function(){
		var el = document.getElementById("insert_new_widget_list");
		var selected = false;
		for (var i = 0; i < el.childNodes.length; i++) {
			try {
				if (el.childNodes[i].nodeName.toLowerCase() == "input") {
					if (el.childNodes[i].checked) {
						selected = el.childNodes[i].value;
					}
				}
			} 
			catch (err) {
			}
		}
		if (!selected) {
			alert("Please select a widget to add");
		}
		else {
			newwidget_id = selected;
			var rnd = "id" + Math.round(Math.random() * 1000000000);
			var id = "widget_" + selected + "_" + rnd + "_" + currentsite.id + "/pages/" + selectedpage.replace(/ /g, "%20");
			newwidget_uid = id;
			$("#insert_screen2_preview").html('<img src="' + Widgets.widgets[selected].img + '" id="' + id + '" class="widget_inline" border="1"/>');
			$("#insert_screen2").show();
			$("#insert_screen1").hide();
			sdata.widgets.WidgetLoader.insertWidgetsAdvanced("insert_screen2", true);
		}
	}
	
	sakai.dashboard.showWidgetSettings = function(){
		$("#insert_screen2_preview").html('<img src="' + Widgets.widgets[newwidget_id].img + '" id="' + newwidget_uid + '" class="widget_inline" border="1"/>');
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced("insert_screen2", true);
	}
	
	sakai.dashboard.showWidgetPreview = function(){
		$("#insert_screen2_preview").html('<img src="' + Widgets.widgets[newwidget_id].img + '" id="' + newwidget_uid + '" class="widget_inline" border="1"/>');
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced("insert_screen2", false);
	}
	
	sakai.dashboard.finishAddWidget = function(){
		$("#insert_screen2_preview").html('');
		editor.execCommand('mceInsertContent', false, '<img src="' + Widgets.widgets[newwidget_id].img + '" id="' + newwidget_uid + '" class="widget_inline" style="display:block; padding: 10px; margin: 4px" border="1"/>');
		sakai.dashboard.hidepopup();
	}
	
	sakai.dashboard.showWidgetSettingsEdit = function(){
		$("#edit_preview").html('<img src="' + Widgets.widgets[newwidget_id].img + '" id="' + newwidget_uid + '" class="widget_inline" border="1"/>');
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced("edit_screen", true);
	}
	
	sakai.dashboard.showWidgetPreviewEdit = function(){
		$("#edit_preview").html('<img src="' + Widgets.widgets[newwidget_id].img + '" id="' + newwidget_uid + '" class="widget_inline" border="1"/>');
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced("edit_screen", false);
	}
	
	var _content = false;
	
	sakai.dashboard.changeWidgetSettingsAdded = function(content, ed){
		if (ed) {
			editor = ed;
		}
		if (! content){
			content = _content;
		} else {
			_content = content;
		}
		try {
			if (content.substring(0, 4) != "<img") {
				throw "Wrong tag type";
			}
			
			var orig = content;
			content = content.substring(content.indexOf("id=") + 4);
			content = content.substring(0, content.indexOf("\""));
			var split = content.split("_");
			var type = split[1];
			var uid = split[2];
			var placement = split[3];
			
			newwidget_id = type;
			newwidget_uid = content;
			
			sakai.dashboard.showpopup("edit_widget");
			
			try {
			
				var testel = document.getElementById('edit_preview');
				testel.innerHTML += '';
				$("#edit_preview").html(orig);
				sdata.widgets.WidgetLoader.insertWidgetsAdvanced("edit_screen", true);
			
			} catch (err){
				setTimeout("sakai.dashboard.changeWidgetSettingsAdded()",200);
			}
			
		} 
		catch (err) {
			alert("Please select a Sakai widget to edit its settings");
		}
	}
	
	var filesIsLoaded = false;

	sakai.dashboard.showSiteResources = function(){
		sakai.dashboard.showpopup("Resources_div");
		if (!filesIsLoaded){
			filesIsLoaded = false;
			try {
				sdata.widgets.WidgetLoader.insertWidgetsAdvanced("Resources_div");
			} catch (err){
				filesIsLoaded = false;
				setTimeout("sakai.dashboard.showSiteResources()",200);
			}
		}
	}
	
	var linkpages = false;
	
	sakai.dashboard.showLinkWindow = function(selection, ed){
		if (ed) {
			editor = ed;
		}
		sakai.dashboard.showpopup("insert_link");
		
		try {
		
			var testel = document.getElementById('inser_link_render');
			testel.innerHTML += "";
		
			sdata.Ajax.request({
				url: "/sdata/f/" + currentsite.id + "/pageconfiguration?sid=" + Math.random(),
				onSuccess: function(response){
					linkpages = eval('(' + response + ')');
					$("#inser_link_render").html(sdata.html.Template.render("inser_link_template", linkpages));
				},
				onFail: function(httpstatus){
					$("#inser_link_render").html("No links available<br/>");
				}
			});
		
		} catch (err){
			
			setTimeout("sakai.dashboard.showLinkWindow()",200);
			
		}
	}
	
	sakai.dashboard.insertPageLink = function(pageid){
		var selection = editor.selection.getContent();
		if (selection) {
			editor.execCommand('mceInsertContent', false, '<a href="' + pageid + '" style="color:#0287C5; text-decoration: underline" class="contauthlink">' + selection + '</a>');
		}
		else {
			var pagetitle = pageid;
			for (var i = 0; i < linkpages.items.length; i++) {
				if (linkpages.items[i].id == pageid) {
					pagetitle = linkpages.items[i].title;
				}
			}
			editor.execCommand('mceInsertContent', false, '<a href="' + pageid + '" style="color:#0287C5; text-decoration: underline" class="contauthlink">' + pagetitle + '</a>');
		}
		sakai.dashboard.hidepopup();
	}
	
	sakai.dashboard.changeWrapping = function(content, ed){
		if (ed) {
			editor = ed;
		}
		try {
			if (content.substring(0, 4) != "<img") {
				throw "Wrong tag type";
			}
			var orig = content;
			content = content.substring(content.indexOf("id=") + 4);
			content = content.substring(0, content.indexOf("\""));
			var split = content.split("_");
			var type = split[1];
			var uid = split[2];
			var placement = split[3];
			
			sakai.dashboard.showpopup("change_wrapping");
			
		} 
		catch (err) {
			alert(err);
			alert("Please select a Sakai widget to change its wrapping");
		}
	}
	
	sakai.dashboard.doNoWrap = function(){
		var selection = editor.selection.getContent();
		var begin = selection.substring(0, selection.indexOf("style="));
		var tussen = selection.substring(selection.indexOf("style=") + 7);
		var eind = tussen.substring(tussen.indexOf("\"") + 1);
		var toinsert = begin + " " + "style='display:block; padding: 10px; margin: 4px'" + " " + eind;
		editor.execCommand('mceInsertContent', false, toinsert);
		sakai.dashboard.hidepopup();
	}
	
	sakai.dashboard.doLeftWrap = function(){
		var selection = editor.selection.getContent();
		var begin = selection.substring(0, selection.indexOf("style="));
		var tussen = selection.substring(selection.indexOf("style=") + 7);
		var eind = tussen.substring(tussen.indexOf("\"") + 1);
		var toinsert = begin + " " + "style='display:inline; float:left; padding: 10px; margin: 4px'" + " " + eind;
		editor.execCommand('mceInsertContent', false, toinsert);
		sakai.dashboard.hidepopup();
	}
	
	sakai.dashboard.doRightWrap = function(){
		var selection = editor.selection.getContent();
		var begin = selection.substring(0, selection.indexOf("style="));
		var tussen = selection.substring(selection.indexOf("style=") + 7);
		var eind = tussen.substring(tussen.indexOf("\"") + 1);
		var toinsert = begin + " " + "style='display:inline; float:right; padding: 10px; margin: 4px'" + " " + eind;
		editor.execCommand('mceInsertContent', false, toinsert);
		sakai.dashboard.hidepopup();
	}
	
	sakai.dashboard.showPagesList = function(){
		sakai.dashboard.showpopup("show_pages_list");
		sdata.Ajax.request({
			url: "/sdata/f/" + currentsite.id + "/pageconfiguration?sid=" + Math.random(),
			onSuccess: function(response){
				pages = eval('(' + response + ')');
				$("#show_pages_list_render").html(sdata.html.Template.render("show_pages_list_template", pages));
			},
			onFail: function(httpstatus){
				pages = {};
				pages.items = [];
				$("#show_pages_list_render").html(sdata.html.Template.render("show_pages_list_template", pages));
			}
		});
	}
	
	sakai.dashboard.showEditPages = function(){
	
		sakai.dashboard.showpopup("show_edit_pages");
	
		try {
	
			clearListbox(document.getElementById("select_top_pages"));
			clearListbox(document.getElementById("select_nontop_pages"));
			
			$("#edit_pages_noselected").show();
			$("#edit_pages_selected").hide();
		
			sdata.Ajax.request({
				url: "/sdata/f/" + currentsite.id + "/pageconfiguration?sid=" + Math.random(),
				onSuccess: function(response){
					pages = eval('(' + response + ')');
					fillpages();
				},
				onFail: function(httpstatus){
					pages = {};
					pages.items = [];
					fillpages();
				}
			});
		
		} catch (err){
			
			setTimeout("sakai.dashboard.showEditPages()",200);
			
		}
	}
	
	clearListbox = function(el){
		var todo = el.options.length;
		for (var i = 0; i < todo; i++) {
			el.remove(0);
		}
	}
	
	fillpages = function(){
		var toplist = document.getElementById("select_top_pages");
		var nontoplist = document.getElementById("select_nontop_pages");
		for (var i = 0; i < pages.items.length; i++) {
			if (pages.items[i].top) {
				var optionObject = new Option(pages.items[i].title, pages.items[i].id)
				var optionRank = toplist.options.length
				toplist.options[optionRank] = optionObject
			}
			else {
				var optionObject = new Option(pages.items[i].title, pages.items[i].id)
				var optionRank = nontoplist.options.length
				nontoplist.options[optionRank] = optionObject
			}
		}
	}
	
	var selectedpageid = false;
	
	sakai.dashboard.showPageDetails = function(id){
		var currentlist = document.getElementById(id);
		var selected = false;
		try {
			var TheSelectedIndex = currentlist.selectedIndex;
			selected = currentlist[TheSelectedIndex].value;
		} 
		catch (err) {
		}
		selectedpageid = selected;
		if (selected) {
		
			var selectedi = 0;
			for (var i = 0; i < pages.items.length; i++) {
				if (pages.items[i].id == selected) {
					selectedi = i;
				}
			}
			
			var location = window.location.href.split("#")[0];
			$("#selected_page_url").text(location + "#" + pages.items[selectedi].id);
			
			$("#selected_page_title").attr("value", pages.items[selectedi].title);
			
			if (pages.items[selectedi].top) {
				document.getElementById("selected_page_top_yes").checked = true;
			}
			else {
				document.getElementById("selected_page_top_no").checked = true;
			}
			
			if (pages.items[selectedi].type == "dashboard") {
				document.getElementById("selected_page_type_dashboard").checked = true;
			}
			else 
				if (pages.items[selectedi].type == "webpage") {
					document.getElementById("selected_page_type_web").checked = true;
				}
				else 
					if (pages.items[selectedi].type == "tool") {
						document.getElementById("selected_page_type_tool").checked = true;
					}
			
			$("#edit_pages_noselected").hide();
			$("#edit_pages_selected").show();
		}
		else {
			$("#edit_pages_noselected").show();
			$("#edit_pages_selected").hide();
		}
	}
	
	sakai.dashboard.saveEditPage2 = function(){
		sakai.dashboard.needsReload = true;
		var index = false;
		for (var i = 0; i < pages.items.length; i++) {
			if (pages.items[i].id == selectedpageid) {
				index = i;
			}
		}
		
		var valid = true;
		var title = document.getElementById("selected_page_title").value;
		if (title.replace(/ /g, "") == "") {
			valid = false;
		}
		
		if (valid) {
			pages.items[index].title = title;
			var type = "dashboard";
			var top = true;
			
			if (document.getElementById("selected_page_type_web").checked) {
				type = "webpage";
			}
			else 
				if (document.getElementById("selected_page_type_tool").checked) {
					type = "tool";
				}
			pages.items[index].type = type;
			pagetypes[pages.items[index].id] = type;
			
			if (document.getElementById(pages.items[index].id)) {
				document.getElementById(pages.items[index].id).id = "old_" + document.getElementById(pages.items[index].id).id;
			}
			
			if (document.getElementById("selected_page_top_no").checked) {
				top = false;
			}
			pages.items[index].top = top;
			
			var tostring = sdata.JSON.stringify(pages);
			sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "", "pageconfiguration", tostring, finalEditPage);
			
		}
		else {
			alert("Please fill out all of the fields");
		}
	}
	
	finalEditPage = function(success){
		if (success) {
			sakai.dashboard.showEditPages();
		}
		else {
			alert("An erorr has occured");
		}
	}
	
	sakai.dashboard.removePage = function(){
		sakai.dashboard.needsReload = true;
		for (var i = 0; i < pages.items.length; i++) {
			if (pages.items[i].id == selectedpageid) {
				pages.items.splice(i, 1);
				break;
			}
		}
		var tostring = sdata.JSON.stringify(pages);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "", "pageconfiguration", tostring, finalRemovePage);
	}
	
	finalRemovePage = function(success){
		if (success) {
			sdata.Ajax.request({
				url: "/sdata/f/" + currentsite.id + "/pages/" + selectedpageid,
				httpMethod: "DELETE",
				onSuccess: function(data){
					sakai.dashboard.showEditPages();
				},
				onFail: function(status){
					alert("An error has occurred");
				}
			});
		}
		else {
			alert("An error has occurred");
		}
	}
	
	moveDownList = function(lst){
	
		if (lst.selectedIndex == -1) {
		
		}
		else {
		
			if (lst.selectedIndex == lst.options.length - 1) {
			
			}
			else {
				var tempValue = lst.options[lst.selectedIndex].value;
				var tempIndex = lst.selectedIndex + 1;
				lst.options[lst.selectedIndex].value = lst.options[lst.selectedIndex + 1].value;
				lst.options[lst.selectedIndex + 1].value = tempValue;
				var tempText = lst.options[lst.selectedIndex].text;
				lst.options[lst.selectedIndex].text = lst.options[lst.selectedIndex + 1].text;
				lst.options[lst.selectedIndex + 1].text = tempText;
				lst.selectedIndex = tempIndex;
			}
		}
	}
	
	moveUpList = function(lst){
	
		if (lst.selectedIndex == -1) {
		}
		else {
			if (lst.selectedIndex == 0) {
				return false;
			}
			else {
				var tempValue = lst.options[lst.selectedIndex].value;
				var tempIndex = lst.selectedIndex - 1;
				lst.options[lst.selectedIndex].value = lst.options[lst.selectedIndex - 1].value;
				lst.options[lst.selectedIndex - 1].value = tempValue;
				var tempText = lst.options[lst.selectedIndex].text;
				lst.options[lst.selectedIndex].text = lst.options[lst.selectedIndex - 1].text;
				lst.options[lst.selectedIndex - 1].text = tempText;
				lst.selectedIndex = tempIndex;
			}
		}
	}
	
	sakai.dashboard.moveUp = function(){
		var el = document.getElementById("select_top_pages");
		var el2 = document.getElementById("select_nontop_pages");
		moveUpList(el);
		saveMoveOperation(el, el2);
	}
	
	sakai.dashboard.moveDown = function(){
		var el = document.getElementById("select_top_pages");
		var el2 = document.getElementById("select_nontop_pages");
		moveDownList(el);
		saveMoveOperation(el, el2);
	}
	
	saveMoveOperation = function(el, el2){
	
		sakai.dashboard.needsReload = true;
		
		var newpages = {};
		newpages.items = [];
		
		for (var i = 0; i < el.options.length; i++) {
			var value = el.options[i].value;
			for (var ii = 0; ii < pages.items.length; ii++) {
				if (pages.items[ii].id == value) {
					var index = newpages.items.length;
					newpages.items[index] = {};
					newpages.items[index].id = pages.items[ii].id;
					newpages.items[index].title = pages.items[ii].title;
					newpages.items[index].type = pages.items[ii].type;
					newpages.items[index].top = pages.items[ii].top;
				}
			}
		}
		
		for (var i = 0; i < el2.options.length; i++) {
			var value = el2.options[i].value;
			for (var ii = 0; ii < pages.items.length; ii++) {
				if (pages.items[ii].id == value) {
					var index = newpages.items.length;
					newpages.items[index] = {};
					newpages.items[index].id = pages.items[ii].id;
					newpages.items[index].title = pages.items[ii].title;
					newpages.items[index].type = pages.items[ii].type;
					newpages.items[index].top = pages.items[ii].top;
				}
			}
		}
		
		pages = newpages;
		var tostring = sdata.JSON.stringify(newpages);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "", "pageconfiguration", tostring, function(success){
			if (!success) {
				alert("An error has occurred");
			}
			else {
				sakai.dashboard.needsReload = true;
			}
		});
		
	}
	
	sakai.dashboard.showSelectTool = function(){
		sakai.dashboard.showpopup("select-tool-screen");
		
		try {
		
			var testel = document.getElementById("add_tool_tabtogoin");
			testel.innerHTML = "";
			
			for (var i = 0; i < pageconfiguration.items.length; i++){
				var el = pageconfiguration.items[i];
				if (el.id == selectedpage){
					$("#add_tool_tabtogoin").text(el.title);
				}
			}
			
			var sitejson = currentsite;
			for (var i = 0; i < sitejson.pages.length; i++) {
				var page = sitejson.pages[i];
				for (var ii = 0; ii < page.tools.length; ii++) {
					var tool = page.tools[ii];
					if (tool.allowMultipleInstances != "true") {
						for (var iii = 0; iii < sitejson.allTools.length; iii++) {
							if (tool.id == sitejson.allTools[iii].id) {
								sitejson.allTools[iii].isHad = true;
							}
						}
					}
				}
			}
			sdata.html.Template.render('add-tool-2', sitejson, $('#add-tool-output-2'));
			$(".add-tool-help-2").bind("click", function(ev){
				var selectedid = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
				var data1 = {
					tools: selectedid
				};
				sdata.Ajax.request({
					url: '/sdata/site/' + currentsite.id + '?f=at',
					httpMethod: 'POST',
					postData: data1,
					onSuccess: function(data){
						var json = eval('(' + data + ')');
						sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/pages/" + selectedpage, "tool", data, checkCreateSuccess5);
						var toolurl = json.tool;
						var id = toolurl.replace(/~/g, "x").replace(/!/g, "x").replace(/-/g, "x");
						var iframestring = "<iframe id='Main" + id + "' name='Main" + id + "' width='100%' src='/portal/tool/" + toolurl + "' frameborder='0'></iframe>";
						$("#" + selectedpage.replace(/ /g, "\\%20")).html(iframestring);
						sakai.dashboard.hidepopup();
					},
					onFail: function(status){
						alert("An error has occurred");
					},
					contentType: "application/x-www-form-urlencoded"
				});
			})
		
		} catch (err){
			
			setTimeout("sakai.dashboard.showSelectTool()",200);
			
		}
	}
	
	showTool = function(){
		$("#tool_edit").show();
		sdata.Ajax.request({
			url: "/sdata/f/" + currentsite.id + "/pages/" + selectedpage + "/tool",
			httpMethod: "GET",
			onSuccess: function(data){
				try {
					var json = eval('(' + data + ')');
					var toolurl = json.tool;
					var id = toolurl.replace(/~/g, "x").replace(/!/g, "x").replace(/-/g, "x");
					var iframestring = "<iframe id='Main" + id + "' name='Main" + id + "' width='100%' src='/portal/tool/" + toolurl + "' frameborder='0'></iframe>";
					$("#" + selectedpage.replace(/ /g, "\\%20")).html(iframestring);
				} 
				catch (err) {
					$("#" + selectedpage.replace(/ /g, "\\%20")).text("No tool found");
				}
			},
			onFail: function(status){
				$("#" + selectedpage.replace(/ /g, "\\%20")).text("No tool found");
			}
		});
	}
	
	loadCurrentSiteObject();
	$("#sidebar-content-pages").hide();
	sakai.dashboard.needsReload = false;
	
	sakai.dashboard.hidepopup = function(){
		$("object").css("visibility", "visible");
		//$("#txt_editfield_tbl iframe").show();
		$("#addwidgetslightbox").hide();
		$("#addwidgetslightbox2").hide();
		$("#edit_preview").html('');
		var el = document.getElementById("lightbox_size1");
		if (el) {
			for (var i = 0; i < el.childNodes.length; i++) {
				try {
					el.childNodes[i].style.display = "none";
				} 
				catch (err) {
				};
							}
			if (sakai.dashboard.needsReload) {
				sakai.dashboard.needsReload = false;
				sakai.dashboard.openPageH(selectedpage);
			}
		}
	}
	
	var initiallyLoadedPopups = false;
	
	sakai.dashboard.showpopup = function(id){
		if (!initiallyLoadedPopups){
			sdata.Ajax.request({
				url: "/dev/site_management_popups.html",
				httpMethod: "GET",
				onSuccess: function(data){
					$("#popupcontainer").html(data);
					$("#new_page_base_url").html(document.location.protocol + "//" + document.location.host + "/site/" + currentsite.id + "/");
					initiallyLoadedPopups = true;
					doShowPopup(id);
				},
				onFail: function(status){}
			});
		} else {
			doShowPopup(id);
		}
	}
	
	var doShowPopup = function(id){
		$("object").css("visibility", "hidden");
		//$("#txt_editfield_tbl iframe").hide();
		$("#addwidgetslightbox").show();
		$("#addwidgetslightbox2").show();
		var el = document.getElementById("lightbox_size1");
		for (var i = 0; i < el.childNodes.length; i++) {
			try {
				el.childNodes[i].style.display = "none";
			} 
			catch (err) {
			};
					}
		$("#" + id).show();
	}

	var tinyMCEInitiated = false;
	var initTinyMCE = function(){
		tinyMCE.init({
			// General options
			mode: "exact",
			elements: "txt_editfield",
			theme: "advanced",
			plugins: "safari,style,table,advhr,advimage,advlink,emotions,iespell,insertsakaiwidget,media,searchreplace,contextmenu,paste,fullscreen,noneditable,visualchars,xhtmlxtras,inlinepopups,changesakaisettings,insertsakailink,changewrapping",
			
			// Theme options
			theme_advanced_buttons1: "bold,italic,underline,strikethrough,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect,fontselect,fontsizeselect",
			theme_advanced_buttons2: "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,|,undo,redo,|,link,unlink,image,|,charmap,emotions,iespell,media,advhr,|,code,fullscreen",
			//theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
			theme_advanced_buttons3: "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,",
			//theme_advanced_buttons4 : "insertlayer,moveforward,movebackward,absolute,|,styleprops,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak",
			theme_advanced_buttons4: "insertsakaiwidget,|,changesakaisettings,changewrapping,|,insertsakailink",
			theme_advanced_toolbar_location: "top",
			theme_advanced_toolbar_align: "left",
			theme_advanced_statusbar_location: "bottom",
			theme_advanced_resizing: true,
			width: "100%",
			height: "600",
			
			// Example word content CSS (should be your site CSS) this one removes paragraph margins
			content_css: "lib/css/word.css",
			
			// Drop lists for link/image/media/template dialogs
			template_external_list_url: "lib/lists/template_list.js",
			external_link_list_url: "lib/lists/link_list.js",
			external_image_list_url: "lib/lists/image_list.js",
			media_external_list_url: "lib/lists/media_list.js",
			
			// Replace values for the template plugin
			template_replace_values: {
				username: "Some User",
				staffid: "991234"
			}
		});
	}
}

sdata.registerForLoad("sakai.dashboard");