var sakai = sakai || {};

sakai._site = {};
sakai.site = function(){

	/*
		Configuration Variables
	*/
	var minHeight = 400;
	
	
	/*
		Help Variables
	*/
	var cur = 0;
	var curScroll = false;
	var minTop = false;
	var last = 0;
	var myCustomInitInstanced = false;
	var currentsite = false;
	var meObject = false;
	var pages = false;
	var pageconfiguration = false;
	var pagetypes = {};
	var pagecontents = {};
	var myportaljson = false;
	var myportaljsons = {};
	var isEditingNavigation = false;
	var currentEditView = false;
	
	/*
		Help functions 
	*/
	
	var escapePageId = function(pageid){
		var escaped = pageid.replace(/ /g, "\\%20");
		escaped = pageid.replace(/[.]/g, "\\\\\\.");
		escaped = pageid.replace(/\//g, "\\\/");
		return escaped;
	}
	
	/*
		Loading site definition
	*/
	
	var startSiteLoad = function(){
		if (meObject.preferences.uuid){
			inituser = meObject.profile.firstName + " " + meObject.profile.lastName;
			$("#userid").text(inituser);
			$("#loginLink").hide();
		} else {
			$(".explore_nav").hide();
			$("#widget_chat").hide();
			sakai._isAnonymous = true;
			$("#loginLink").show();
		}
		loadPagesInitial();		
	};
	
	loadCurrentSiteObject = function(){
		var qs = new Querystring();
		currentsite = qs.get("siteid",false);
		if (!currentsite) {
			document.location = "/dev/";
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
			$("#sitetitle").text(currentsite.name);
			
			sdata.Ajax.request({
				url: "/rest/me?sid=" + Math.random(),
				onSuccess: function(response){
					
					meObject = eval('(' + response + ')');
					var isMaintainer = false;
			
					if (meObject.preferences.subjects) {
						for (var i = 0; i < meObject.preferences.subjects.length; i++) {
							var subject = meObject.preferences.subjects[i];
							var siteid = subject.split(":")[0];
							var role = subject.split(":")[1];
							if (siteid == currentsite.id && role == "owner"){							
								isMaintainer = true;
							}
						}
					}
					
					if (isMaintainer) {
						$("#li_edit_page_divider").show();
						$("#li_edit_page").show();
						$("#add_a_new").show();
						$("#site_management").show();
						$(".page_nav h3").css("padding-top","10px");
					}
					
					startSiteLoad();
					
				}
			});
			
		}
	}
	
	
	/*
		Page Loading 
	*/
	
	var loadPagesInitial = function(){
	
		$("#initialcontent").show();
		totaltotry = 0;
		
		sdata.Ajax.request({
			url: "/sdata/f/_sites/" + currentsite.id + "/pageconfiguration?sid=" + Math.random(),
			onSuccess: function(response){
				pages = eval('(' + response + ')');
				pageconfiguration = pages;
				loadNavigation();
			},
			onFail: function(httpstatus){
				pages = {};
				pages.items = {};
				pageconfiguration = pages;
				loadNavigation();
			}
		});
		
	};
	
	var loadNavigation = function(){
		sdata.Ajax.request({
			url: "/sdata/f/_sites/" + currentsite.id + "/_navigation/content?sid=" + Math.random(),
			onSuccess: function(response){
				pagecontents["_navigation"] = response;
				$("#page_nav_content").append(response);
				sdata.widgets.WidgetLoader.insertWidgetsAdvanced("page_nav_content");
				History.history_change();
			},
			onFail: function(httpstatus){
				History.history_change();
			}
		});
	}
	
	sakai.site.openPage = function(pageid){
		History.addBEvent(pageid);
	}
	
	sakai._site.navigationLoaded = function(){
		sakai._navigation.renderNavigation(selectedpage, pages);
	}
	
	sakai.site.openPageH = function(pageid){
	
		if (!pageid) {
			for (var i = 0; i < pages.items.length; i++) {
				if (pages.items[i].id.indexOf("/") == -1) {
					pageid = pages.items[i].id;
					break;
				}
			}
		}
		
		for (var i = 0; i < pages.items.length; i++){
			if (pages.items[i].id == pageid){
				$("#pagetitle").text(pages.items[i].title);
				break;
			}
		}
		
		$("#loginLink").attr("href","/dev/index.html?url=" + sdata.util.URL.encode(document.location.pathname + document.location.search + document.location.hash));
		
		//sakai.dashboard.hidepopup();
		$("#webpage_edit").hide();
		$("#dashboard_edit").hide();
		$("#tool_edit").hide();
		selectedpage = pageid;
		
		pages.selected = pageid;
		try {
			sakai._navigation.renderNavigation(selectedpage, pages);
		} catch (err){}
		//document.getElementById("sidebar-content-pages").innerHTML = sdata.html.Template.render("menu_template", pages);
		
		$("#sidebar-content-pages").show();
		if (currentsite.isMaintainer) {
			//$(".tool-menu1-del").show();
		}
		
		var el = document.getElementById("main-content-div");
		var hasopened = false;
		for (var i = 0; i < el.childNodes.length; i++) {
			try {
				el.childNodes[i].style.display = "none";
				if (el.childNodes[i].id == pageid.replace(/ /g,"%20")) {
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
			$("#" + escapePageId(pageid)).show();
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
						var splittedurl = selectedpage.replace(/\//g,"/_pages/");
						sdata.Ajax.request({
							url: "/sdata/f/_sites/" + currentsite.id + "/_pages/" + splittedurl + "/content" + "?sid=" + Math.random(),
							onSuccess: function(response){
								displayPage(response, true);
							},
							onFail: function(httpstatus){
								displayPage(httpstatus, false);
							}
						});
					}
			}
			else {
				$("#error_404").show();
			}
			
		}

		
	}
	
	displayPage = function(response, exists){
		if (exists) {
			pagecontents[selectedpage] = response;
			$("#webpage_edit").show();
			var el = document.createElement("div");
			el.id = selectedpage.replace(/ /g, "%20");
			//el.className = "container_child";
			el.className = "content";
			el.innerHTML = response;
			
			pagecontents[selectedpage] = el.innerHTML;
			
			var els = $("a", el);
			for (var i = 0; i < els.length; i++) {
				var nel = els[i];
				if (nel.className == "contauthlink") {
					nel.href = "#" + nel.href.split("/")[nel.href.split("/").length - 1];
				}
			}
			
			document.getElementById("main-content-div").appendChild(el);
			sdata.widgets.WidgetLoader.insertWidgetsAdvanced(selectedpage.replace(/ /g,"%20"));
			
			jQuery("a", $("#container")).tabbable();
			
		}
		else {
			$("#error_404").show();
		}
	}
	
	/*
		TinyMCE Functions
	*/
	var showBar = function(id){
		$("#elm1_toolbar1").hide();
		$("#elm1_toolbar2").hide();
		$("#elm1_toolbar3").hide();
		$("#elm1_toolbar4").hide();
		$(".mceToolbarRow2").hide();
		$(".mceToolbarRow3").hide();
		$("#elm1_toolbar" + id).show();
		$("#elm1_external").show();
		$(".mceExternalToolbar").show();
	}
	
	var myCustomInitInstance = function(){
		try {
			document.getElementById("elm1_ifr").style.overflow = "hidden";
			document.getElementById("elm1_ifr").scrolling = "no";
			document.getElementById("elm1_ifr").frameborder = "0";
			document.getElementById("elm1_ifr").style.height = "auto"; // helps resize (for some browsers) if new doc is shorter than previous
			if (!myCustomInitInstanced) {
				$(".mceToolbarEnd").before(sdata.html.Template.render("editor_extra_buttons", {}));
			}
			var el = $(".mceExternalToolbar");
			el.parent().appendTo(".mceToolbarExternal");
			el.show();
			el.css("position", "static");
			el.css("border", "0px solid black");
			$(".mceExternalClose").hide();
			showBar(1);
			setTimeout("sakai._site.setIframeHeight('elm1_ifr')", 100);
			placeToolbar();
			
		} 
		catch (err) {
			// Firefox throws strange error, doesn't affect anything
			// Ignore
		}
	}
	
	sakai._site.myHandleEvent = function(e){
		if (e.type == "click" || e.type == "keyup" || e.type == "mouseup" || !e || !e.type) {
			curScroll = document.body.scrollTop;
			
			if (curScroll == 0) {
				if (window.pageYOffset) 
					curScroll = window.pageYOffset;
				else 
					curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
			}
			sakai._site.setIframeHeight("elm1_ifr");
		}
		return true; // Continue handling
	}
	
	function getDocHeight(doc){
		var docHt = 0, sh, oh;
		if (doc.height) 
			docHt = doc.height;
		else 
			if (doc.body) {
				if (doc.body.scrollHeight) 
					docHt = sh = doc.body.scrollHeight;
				if (doc.body.offsetHeight) 
					docHt = oh = doc.body.offsetHeight;
				if (sh && oh) 
					docHt = Math.max(sh, oh);
			}
		return docHt;
	}
	
	sakai._site.setIframeHeight = function(ifrm){
		var iframeWin = window.frames[0];
		var iframeEl = document.getElementById ? document.getElementById(ifrm) : document.all ? document.all[ifrm] : null;
		if (iframeEl && iframeWin) {
			if (BrowserDetect.browser != "Firefox") {
				iframeEl.style.height = "auto";
			}
			var docHt = getDocHeight(iframeWin.document);
			if (docHt < minHeight) {
				docHt = minHeight;
			}
			if (docHt && cur != docHt) {
				iframeEl.style.height = docHt + 30 + "px"; // add to height to be sure it will all show
				cur = (docHt + 30);
				$("#placeholderforeditor").css("height", docHt + 60 + "px");
				window.scrollTo(0, curScroll);
				placeToolbar();
			}
		}
	}
	
	sakai._site.mySelectionEvent = function(){
		var ed = tinyMCE.get('elm1');
		$("#aidbar").remove();
		var selected = ed.selection.getNode();
		if (selected && selected.nodeName.toLowerCase() == "img") {
			var pos = tinymce.DOM.getPos(selected);
			var div = document.createElement("div");
			div.style.position = "absolute";
			div.id = "aidbar";
			div.style.width = "100px";
			div.style.height = "20px";
			div.style.backgroundColor = "green";
			div.innerHTML = "Test";
			div.style.top = pos["y"] + $("#elm1_ifr").position().top + "px";
			div.style.left = pos["x"] + $("#elm1_ifr").position().left + "px";
			document.body.appendChild(div);
		}
	}
	
	tinyMCE.init({
		
		// General options
		mode : "exact",
		elements : "elm1",
		theme: "advanced",
		plugins: "safari,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,spellchecker",
		theme_advanced_buttons1: "formatselect,fontselect,fontsizeselect,bold,italic,underline,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,outdent,indent,|,spellchecker,|,image,link",
		theme_advanced_toolbar_location: "external",
		theme_advanced_toolbar_align: "left",
		theme_advanced_statusbar_location: "none",
		theme_advanced_resizing: false,
		handle_event_callback: "sakai._site.myHandleEvent",
		onchange_callback: "sakai._site.myHandleEvent",
		handle_node_change_callback: "sakai._site.mySelectionEvent",
		
		// Example content CSS (should be your site CSS)
		//content_css: "style.css",
		content_css: "css/fluid.reset.css,css/fluid.theme.mist.css,css/fluid.theme.hc.css,css/fluid.theme.rust.css,css/fluid.layout.css,css/fluid.text.css,sakai_css/sakai.core.2.css,sakai_css/sakai.css,sakai_css/sakai.editor.css",
		
		// Drop lists for link/image/media/template dialogs
		template_external_list_url: "lists/template_list.js",
		external_link_list_url: "lists/link_list.js",
		external_image_list_url: "lists/image_list.js",
		media_external_list_url: "lists/media_list.js"
		
	});
	
	var placeToolbar = function(){
		if (!minTop) {
			minTop = $("#toolbarplaceholder").position().top;
		}
		curScroll = document.body.scrollTop;
		if (curScroll == 0) {
			if (window.pageYOffset) 
				curScroll = window.pageYOffset;
			else 
				curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
		}
		var barTop = curScroll;
		$("#toolbarcontainer").css("width", $("#toolbarplaceholder").width() - 2 + "px");
		if (barTop <= minTop) {
			$("#toolbarcontainer").css("position", "absolute");
			$("#toolbarcontainer").css("margin-top", "10px");
			$("#toolbarcontainer").css("top", minTop + "px");
		}
		else {
			if (BrowserDetect.browser == "Explorer" && BrowserDetect.version == 6) {
				$("#toolbarcontainer").css("position", "absolute");
				$("#toolbarcontainer").css("margin-top", "0px");
				$("#toolbarcontainer").css("top", barTop + "px");
			}
			else {
				$("#toolbarcontainer").css("position", "fixed");
				$("#toolbarcontainer").css("margin-top", "0px");
				$("#toolbarcontainer").css("top", "0px");
			}
		}
		last = new Date().getTime();
	}
	
	/*
		Edit page functionality 
	*/
	
	var showPageLocation = function(){
		var finaljson = {}
		finaljson.pages = [];
		finaljson.pages[0] = currentsite.name;
		var splitted = selectedpage.split('/');
		var current = "";
		for (var i = 0; i < splitted.length; i++){
			var id = splitted[i];
			if (i != 0){
				current += "/";
			}
			current += id;
			var idtofind = current;
			for (var ii = 0; ii < pages.items.length; ii++){
				if (pages.items[ii].id == idtofind){
					finaljson.pages[finaljson.pages.length] = pages.items[ii].title;	
				}
			}
		}
		finaljson.total = finaljson.pages.length;
		$("#new_page_path").html(sdata.html.Template.render("new_page_path_template",finaljson));
	}
	
	var editPage = function(pageid){

		var escaped = pageid.replace(/ /g, "%20");
		$("#" + escaped).html("");
		var el = document.getElementById("main-content-div");
		var hasopened = false;
		for (var i = 0; i < el.childNodes.length; i++) {
			try {
				el.childNodes[i].style.display = "none";
			} 
			catch (err) {
			}
		}
		//$("#webpage_edit").hide();0
		
		var pagetitle = "";
				
		for (var i = 0; i < pages.items.length; i++){
			if (pages.items[i].id == selectedpage){
				pagetitle = pages.items[i].title;
				break;
			}
		}
		if (pageid == "_navigation"){
			$("#title-input-container").hide();
			isEditingNavigation = true;
		} else {
			$("#title-input-container").show();
			isEditingNavigation = false;
		}
		
		// Generate the page location
		showPageLocation();
		
		$(".title-input").val(pagetitle);

		try {
			tinyMCE.get("elm1").setContent("");
				
			var content = pagecontents[pageid];
			var content2 = pagecontents[pageid];
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
					if (attribute.toLowerCase() == "id") {
						if (value.split("_")[0] == "widget") {
							todo -= 1;
							typeofwidget = value.split("_")[1];
						}
					}
					else 
						if (attribute.toLowerCase() == "src") {
							todo -= 1;
							originalicon = value;
						}
					if (Widgets.widgets[typeofwidget]){
						newicon = Widgets.widgets[typeofwidget].img;
					}
				}
					
				if (todo == 0 && originalicon && newicon && (originalicon != newicon)){
					content2 = content2.replace(originalicon, newicon);
				}	
					
			}
					
					
		} catch (err){

		}
				
		tinyMCE.get("elm1").setContent(content2);
	}
	
	
	/*
		Local event handlers 
	*/
	
	$("#edit_page").bind("click", function(ev){
		editPage(selectedpage);
		myCustomInitInstance();
		myCustomInitInstanced = true;
		$("#show_view_container").hide();
		$("#edit_view_container").show();
		return false;
	});
	
	$("#edit_sidebar").bind("click", function(ev){
		editPage("_navigation");
		myCustomInitInstance();
		myCustomInitInstanced = true;
		$("#show_view_container").hide();
		$("#edit_view_container").show();
		return false;
	});
	
	$(".cancel-button").bind("click", function(ev){
		
		resetView();
		
		var escaped = selectedpage.replace(/ /g, "%20");
		document.getElementById(escaped).innerHTML = pagecontents[selectedpage];
		if (pagetypes[selectedpage] == "webpage") {
			$("#webpage_edit").show();
		}
		document.getElementById(escaped).style.display = "block";
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced(escaped);
		
		$("#edit_view_container").hide();
		$("#show_view_container").show();
	});
	
	$("#print_page").bind("click", function(ev){
		printPage();
	});
	
	$(".save_button").bind("click", function(ev){
		
		resetView();
		
		if (isEditingNavigation){
			
			// Navigation
			
			pagecontents["_navigation"] = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
			$("#page_nav_content").html(pagecontents["_navigation"]);
			
			var escaped = selectedpage.replace(/ /g, "%20");
			document.getElementById(escaped).style.display = "block";
			
			$("#edit_view_container").hide();
			$("#show_view_container").show();
			
			sdata.widgets.WidgetLoader.insertWidgetsAdvanced("page_nav_content");
			sdata.widgets.WidgetPreference.save("/sdata/f/_sites/" + currentsite.id + "/_navigation", "content", pagecontents["_navigation"], function(){});
			
			var els = $("a", $("#" + escaped));
			for (var i = 0; i < els.length; i++) {
				var nel = els[i];
				if (nel.className == "contauthlink") {
					nel.href = "#" + nel.href.split("/")[nel.href.split("/").length - 1];
				}
			}
			
			document.getElementById(escaped).style.display = "block";
			sdata.widgets.WidgetLoader.insertWidgetsAdvanced(escaped);
		
		} else {
		
			// Other page
		
			// Check whether there is a pagetitle
			
			var newpagetitle = $("#title-input").val();
			if (!newpagetitle.replace(/ /g,"%20")){
				alert('Please specify a page title');
				return;
			}
			
			// Check whether the pagetitle has changed
			
			var oldpagetitle = "";
			for (var i = 0; i < pages.items.length; i++){
				if (pages.items[i].id == selectedpage){
					oldpagetitle = pages.items[i].title;
				}
			}
			
			if (oldpagetitle.toLowerCase() != newpagetitle.toLowerCase()){
				
				// Generate new page id
				
				var newid = "";
				var counter = 0;
				var baseid = newpagetitle.toLowerCase();
				baseid = baseid.replace(/ /g,"-");
				baseid = baseid.replace(/[:]/g,"-");
				baseid = baseid.replace(/[?]/g,"-");
				baseid = baseid.replace(/[=]/g,"-");
				var abasefolder = selectedpage.split("/");
				var basefolder = "";
				for (var i = 0; i < abasefolder.length - 1; i++){
					basefolder += abasefolder[i] + "/";
				}
				baseid = basefolder + baseid;
				
				while (!newid){
					var testid = baseid;
					if (counter > 0){
						testid += "-" + counter;
					}
					counter++;
					var exists = false;
					for (var i = 0; i < pages.items.length; i++){
						if (pages.items[i].id == testid){
							exists = true;
						}
					}
					if (!exists){
						newid = testid;
					}
				}
				
				for (var i = 0; i < pages.items.length; i++){
					if (pages.items[i].id == selectedpage){
						pages.items[i].id = newid;
						pages.items[i].title = newpagetitle;
						break;
					}
				}
				
				// Move page folder to this new id
				
				var oldfolderpath = "/sdata/f/_sites/" + currentsite.id + "/_pages/" + selectedpage.split("/").join("/_pages/");
				var newfolderpath = "/_sites/" + currentsite.id + "/_pages/" + newid.split("/").join("/_pages/");
				
				var data = {
					to: newfolderpath,
					f: "mv"
				};
				
				sdata.Ajax.request({
					url: oldfolderpath,
					httpMethod: 'POST',
					postData: data,
					onSuccess: function(data){
						
						// Move all of the subpages of the current page to stay a subpage of the current page
				
						var idtostartwith = selectedpage + "/";
						for (var i = 0; i < pages.items.length; i++){
							if (pages.items[i].id.substring(0,idtostartwith.length) == idtostartwith){
								pages.items[i].id = newid + "/" + pages.items[i].id.substring(idtostartwith.length);
							}
						}
				
						// Adjust configuration file
						
						sdata.widgets.WidgetPreference.save("/sdata/f/_sites/" + currentsite.id, "pageconfiguration", sdata.JSON.stringify(pages), function(success){
							
							// Render the new page under the new URL
							
								// Save page content
								
								var content = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
								sdata.widgets.WidgetPreference.save("/sdata/f" + newfolderpath, "content", content, function(){
									
									// Remove old div + potential new one
								
									$("#" + escapePageId(selectedpage)).remove();
									$("#" + escapePageId(newid)).remove();
								
									// Remove old + new from pagecontents array 
									
									pagecontents[selectedpage] = null;
									pagecontents[newid] = null;
									
									// Switch the History thing
									
									sakai.site.openPage(newid);
									$("#edit_view_container").hide();
									$("#show_view_container").show();
									
								});
							
						});		
						
					},
					onFail: function(status){
						alert("An error has occurred");
					},
					contentType: "application/x-www-form-urlencoded"
				});
				
			} else {
				
				if (pagetypes[selectedpage] == "webpage") {
					$("#webpage_edit").show();
				}
				var escaped = selectedpage.replace(/ /g, "%20");
				pagecontents[selectedpage] = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
				document.getElementById(escaped).innerHTML = pagecontents[selectedpage];
				
				$("#edit_view_container").hide();
				$("#show_view_container").show();
				
				var els = $("a", $("#" + escaped));
				for (var i = 0; i < els.length; i++) {
					var nel = els[i];
					if (nel.className == "contauthlink") {
						nel.href = "#" + nel.href.split("/")[nel.href.split("/").length - 1];
					}
				}
					
				document.getElementById(escaped).style.display = "block";
				sdata.widgets.WidgetLoader.insertWidgetsAdvanced(escaped);
				var newurl = selectedpage.split("/").join("/_pages/");
				sdata.widgets.WidgetPreference.save("/sdata/f/_sites/" + currentsite.id + "/_pages/" + newurl, "content", pagecontents[selectedpage], function(){});
				
			}
			
		}
		
	});
	
	/*
		Print page 
	*/
	
	var printPage = function(){
		
		//save page to be printed into my personal space
		
		var escaped = escapePageId(selectedpage);
		var content = $("#" + escaped).html();
		
		var data = {"items": {
			"data": content,
			"fileName": "content",
			"contentType": "text/plain"
			}
		};
		
		sdata.Ajax.request({
			url: "/sdata/p/_print",
			httpMethod: "POST",
			onSuccess: function(data){
				
				var pagetitle = "";
				
				for (var i = 0; i < pages.items.length; i++){
					if (pages.items[i].id == selectedpage){
						pagetitle = pages.items[i].title;
						break;
					}
				}
				
				popUp("print.html?pagetitle=" + pagetitle);
			},
			onFail: function(status){
			},
			postData: data,
			contentType: "multipart/form-data"
		});
		
	}
	
	var popUp = function(URL) {
		day = new Date();
		id = day.getTime();
		eval("page" + id + " = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=800,height=600,left = 320,top = 150');");
	}
	
	/*
		Preview tab 
	*/
	
	$("#tab_preview").bind("click", function(ev){
		$("#tab-nav-panel").hide();
		$("#new_page_path").hide();
		$("#html-editor").hide();
		$("#page_preview_content").html("");
		$("#page_preview_content").show();
		if (!currentEditView) {
			switchtab("text_editor","Text Editor","preview","Preview");
		} else if (currentEditView == "html"){
			var value = $("#html-editor-content").val();
			tinyMCE.get("elm1").setContent(value);
			switchtab("html","HTML","preview","Preview");
		}
		$("#page_preview_content").html("<h1 style='padding-bottom:10px'>" + $("#title-input").val() + "</h1>" + tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/'));
		sdata.widgets.WidgetLoader.insertWidgetsAdvanced("page_preview_content");
		currentEditView = "preview";
	});
	
	$("#tab_text_editor").bind("click", function(ev){
		switchToTextEditor();
	});
	
	$("#tab_html").bind("click", function(ev){
		$("#fl-tab-content-editor").hide();
		$("#toolbarplaceholder").hide();
		$("#toolbarcontainer").hide();
		if (!currentEditView){
			switchtab("text_editor","Text Editor","html","HTML");
		} else if (currentEditView == "preview"){
			$("#page_preview_content").hide();
			$("#page_preview_content").html("");
			$("#tab-nav-panel").show();
			$("#new_page_path").show();
			switchtab("preview","Preview","html","HTML");
		}
		var value = tinyMCE.get("elm1").getContent();
		$("#html-editor-content").val(value);
		$("#html-editor").show();
		currentEditView = "html";
	});
	
	var switchtab = function(inactiveid, inactivetext, activeid, activetext){
		var inact = $("#tab_" + inactiveid);
		inact.removeClass("fl-activeTab");
		inact.removeClass("tab-nav-selected");
		inact.html('<a href="javascript:;">' + inactivetext + '</a>');
		var act = $("#tab_" + activeid);
		act.addClass("fl-activeTab");
		act.addClass("tab-nav-selected");
		act.html('<span>' + activetext + '</span>');
	}
	
	var resetView = function(){
		switchToTextEditor();
	}
	
	var switchToTextEditor = function(){
		$("#fl-tab-content-editor").show();
		$("#toolbarplaceholder").show();
		$("#toolbarcontainer").show();
		if (currentEditView == "preview"){
			$("#page_preview_content").hide();
			$("#page_preview_content").html("");
			$("#tab-nav-panel").show();
			$("#new_page_path").show();
			switchtab("preview","Preview","text_editor","Text Editor");
		} else if (currentEditView == "html"){
			var value = $("#html-editor-content").val();
			tinyMCE.get("elm1").setContent(value);
			$("#html-editor").hide();
			switchtab("html","HTML","text_editor","Text Editor");
		}
		currentEditView = false;
	}

	
	/*
		Global event listeners
	*/
	
	$("#back_to_top").bind("click", function(){
		window.scrollTo(0,0);
	});
	
	$("#title-input").bind("change", function(){
		$("#new_page_path_current").text($("#title-input").val());
	});
	
	$(window).bind("resize", function(){
		$("#toolbarcontainer").css("width", $("#toolbarplaceholder").width() + "px");
	});
	
	$(window).bind("scroll", function(e){
		//var time = new Date().getTime();
		//if (time < last + 500) {
		//	return;
		//}
		placeToolbar();
		//setTimeout(placeToolbar, 100);
	});
	
	
	/*
		Load functions 
	*/
	
	loadCurrentSiteObject();
	
}

sdata.registerForLoad("sakai.site");