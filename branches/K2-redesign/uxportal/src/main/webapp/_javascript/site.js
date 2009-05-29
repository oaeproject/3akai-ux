var sakai = sakai || {};

sakai._site = {};
sakai.site = function(){

	/*
		Configuration Variables
	*/
	var minHeight = 400;
	var autosaveinterval = 17000;
	var createChildPageByDefault = false;
	
	
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
	var timeoutid = 0;
	var selectedpage = false;
	
	/*
		Help functions 
	*/
	
	var escapePageId = function(pageid){
		var escaped = pageid.replace(/ /g, "\\%20");
		escaped = pageid.replace(/[.]/g, "\\\\\\.");
		escaped = pageid.replace(/\//g, "\\\/");
		return escaped;
	};
	
	/*
		Loading site definition
	*/
	
	var startSiteLoad = function(){
		if (meObject.preferences.uuid){
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
			$("#site_management_members_link").attr("href", $("#site_management_members_link").attr("href") + currentsite);
			$("#site_settings_link").attr("href", $("#site_settings_link").attr("href") + "?site=" + currentsite);
			$.ajax({
				url: "/_rest/site/get/" + currentsite,
				cache: false,
				success: function(response){
					continueLoad(response, true);
					saveToRecentSites(response);
				},
				error: function(httpstatus){
					continueLoad(httpstatus, false);
				}
			});
		}
	};
	
	continueLoad = function(response, exists){
		if (exists) {
			currentsite = $.evalJSON(response);
			var qs = new Querystring();
			currentsite.id = qs.get("siteid",false);
			$("#sitetitle").text(currentsite.name);
					
			meObject = sdata.me;
			var isMaintainer = false;
			
			if (meObject.preferences.subjects) {
				for (var i = 0; i < currentsite.owners.length; i++) {
					var owner = currentsite.owners[i];
					if (owner == sdata.me.preferences.uuid){							
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
	};
	
	
	/*
		Page Loading 
	*/
	
	var loadPagesInitial = function(dofalsereload){
	
		$("#initialcontent").show();
		totaltotry = 0;
		
		$.ajax({
			url: "/sdata/f/" + currentsite.id + "/.site/pageconfiguration",
			cache: false,
			success: function(response){
				pages = $.evalJSON(response);
				pageconfiguration = pages;
				loadNavigation(dofalsereload);
			},
			error: function(httpstatus){
				pages = {};
				pages.items = {};
				pageconfiguration = pages;
				loadNavigation(dofalsereload);
			}
		});
		
	};
	
	var loadNavigation = function(dofalsereload){
		$.ajax({
			url: "/sdata/f/" + currentsite.id + "/_navigation/content",
			cache: false,
			success: function(response){
				pagecontents["_navigation"] = response;
				$("#page_nav_content").html(response);
				sdata.widgets.WidgetLoader.insertWidgetsAdvanced("page_nav_content");
				History.history_change();
			},
			error: function(httpstatus){
				History.history_change();
			}
		});
	};
	
	sakai.site.openPage = function(pageid){
		//History.addBEvent(pageid);
		document.location = "#" + pageid;
	};
	
	sakai._site.navigationLoaded = function(){
		sakai._navigation.renderNavigation(selectedpage, pages);
	};
	
	sakai.site.openPageH = function(pageid){
	
		resetVersionHistory();
	
		$("#insert_more_menu").hide();
		$("#more_menu").hide();
		showingInsertMore = false;	
		inEditView = false;
	
		if (!pageid) {
			for (var i = 0; i < pages.items.length; i++) {
				if (pages.items[i].id.indexOf("/") == -1) {
					pageid = pages.items[i].id;
					break;
				}
			}
		}
		
		for (i = 0; i < pages.items.length; i++){
			if (pages.items[i].id == pageid){
				$("#pagetitle").text(pages.items[i].title);
				break;
			}
		}
		
		$("#loginLink").attr("href","/dev/index.html?url=" + $.URLEncode(document.location.pathname + document.location.search + document.location.hash));
		
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
		for (i = 0; i < el.childNodes.length; i++) {
			try {
				if (el.childNodes[i] && el.childNodes[i].style) {
					el.childNodes[i].style.display = "none";
					if (el.childNodes[i].id == pageid.replace(/ /g, "%20")) {
						hasopened = true;
					}
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
			for (i = 0; i < pages.items.length; i++) {
				if (pages.items[i].id == pageid) {
					type = pages.items[i].type;
				}
			}
			
			if (type) {
				pagetypes[selectedpage] = type;
				if (type == "dashboard") {
					el = document.createElement("div");
					el.id = selectedpage.replace(/ /g, "%20");
					el.className = "container_child";
					var cel = document.createElement("div");
					cel.id = "widgetscontainer";
					cel.style.padding = "0px 7px 0px 7px";
					el.appendChild(cel);
					document.getElementById("container").appendChild(el);
					$.ajax({
						url: "/sdata/f/" + currentsite.id + "/pages/" + selectedpage + "/state",
						cache: false,
						success: function(data){
							decideDashboardExists(data, true, el);
						},
						error: function(status){
							decideDashboardExists(status, false, el);
						}
					});
				}
				else 
					if (type == "webpage") {
						var splittedurl = selectedpage.replace(/\//g,"/_pages/");
						$.ajax({
							url: "/sdata/f/" + currentsite.id + "/_pages/" + splittedurl + "/content",
							cache: false,
							success: function(response){
								displayPage(response, true);
							},
							error: function(httpstatus){
								displayPage(httpstatus, false);
							}
						});
					}
			}
			else {
				$("#error_404").show();
			}
			
		}

		
	};
	
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
				/*
if (nel.className == "contauthlink") {
					nel.href = "#" + nel.href.split("/")[nel.href.split("/").length - 1];
				}
*/
			}
			
			document.getElementById("main-content-div").appendChild(el);
			sdata.widgets.WidgetLoader.insertWidgets(selectedpage.replace(/ /g,"%20"));
			
			//jQuery("a", $("#container")).tabbable();
			
		}
		else {
			//$("#error_404").show();
			pagecontents[selectedpage] = "";
			var errorel = document.createElement("div");
			errorel.id = selectedpage.replace(/ /g, "%20");
			errorel.className = "content";
			errorel.innerHTML = "";
			
			document.getElementById("main-content-div").appendChild(errorel);
		}
	};
	
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
	};
	
	var myCustomInitInstance = function(){
		try {
			document.getElementById("elm1_ifr").style.overflow = "hidden";
			document.getElementById("elm1_ifr").scrolling = "no";
			document.getElementById("elm1_ifr").frameborder = "0";
			document.getElementById("elm1_ifr").style.height = "auto"; // helps resize (for some browsers) if new doc is shorter than previous
			if (!myCustomInitInstanced) {
				$(".mceToolbarEnd").before($.Template.render("editor_extra_buttons", {}));
				
				$(".insert_more_dropdown_activator").bind("click", function(ev){
					toggleInsertMore();
				});
			}
			var el = $(".mceExternalToolbar");
			el.parent().appendTo(".mceToolbarExternal");
			el.show();
			el.css("position", "static");
			el.css("border", "0px solid black");
			$(".mceExternalClose").hide();
			showBar(1);
			setTimeout(sakai._site.setIframeHeight, 100, ['elm1_ifr']);
			placeToolbar();
			
		} 
		catch (err) {
			// Firefox throws strange error, doesn't affect anything
			// Ignore
		}
	};
	
	sakai._site.myHandleEvent = function(e){
		if (e.type == "click" || e.type == "keyup" || e.type == "mouseup" || !e || !e.type) {
			curScroll = document.body.scrollTop;
			
			if (curScroll === 0) {
				if (window.pageYOffset) {
					curScroll = window.pageYOffset;
				} else {
					curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
				}
			}
			sakai._site.setIframeHeight("elm1_ifr");
		}
		return true; // Continue handling
	};
	
	function getDocHeight(doc){
		var docHt = 0, sh, oh;
		if (doc.height) {
			docHt = doc.height;
		} else {
			if (doc.body) {
				if (doc.body.scrollHeight) {
					docHt = sh = doc.body.scrollHeight;
				}
				if (doc.body.offsetHeight) {
					docHt = oh = doc.body.offsetHeight;
				}
				if (sh && oh) {
					docHt = Math.max(sh, oh);
				}
			}
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
	};
	
	sakai._site.mySelectionEvent = function(){
		var ed = tinyMCE.get('elm1');
		$("#context_menu").hide();
		var selected = ed.selection.getNode();
		if (selected && selected.nodeName.toLowerCase() == "img") {
			if (selected.getAttribute("class") == "widget_inline"){
				$("#context_settings").show();
			} else {
				$("#context_settings").hide();
			}
			var pos = tinymce.DOM.getPos(selected);
			var el = $("#context_menu");
			el.css("top",pos.y + $("#elm1_ifr").position().top + 15 + "px");
			el.css("left",pos.x + $("#elm1_ifr").position().left + 15 + "px");
			el.show();
		}
	};
	
	
	tinyMCE.init({
		
		// General options
		mode : "exact",
		elements : "elm1",
		theme: "advanced",
		plugins: "safari,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,spellchecker",
		//contextmenu
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
		content_css: "_css/FSS/fluid.reset.css,_css/FSS/fluid.theme.mist.css,_css/FSS/fluid.theme.hc.css,_css/FSS/fluid.theme.rust.css,_css/FSS/fluid.layout.css,_css/FSS/fluid.text.css,_css/Sakai CSS/sakai.core.2.css,_css/Sakai CSS/sakai.css,_css/Sakai CSS/sakai.editor.css",
		
		// Drop lists for link/image/media/template dialogs
		template_external_list_url: "lists/template_list.js",
		external_link_list_url: "lists/link_list.js",
		external_image_list_url: "lists/image_list.js",
		media_external_list_url: "lists/media_list.js"
		
	});
	
	var placeToolbar = function(){
		minTop = $("#toolbarplaceholder").position().top;
		curScroll = document.body.scrollTop;
		if (curScroll === 0) {
			if (window.pageYOffset) {
				curScroll = window.pageYOffset;
			} else {
				curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
			}
		}
		var barTop = curScroll;
		$("#toolbarcontainer").css("width", $("#toolbarplaceholder").width() - 2 + "px");
		if (barTop <= minTop) {
			$("#toolbarcontainer").css("position", "absolute");
			$("#toolbarcontainer").css("margin-top", "10px");
			$("#toolbarcontainer").css("top", minTop + "px");
			placeInserMoreDropdown("absolute",10,minTop);
		}
		else {
			if (BrowserDetect.browser == "Explorer" && BrowserDetect.version == 6) {
				$("#toolbarcontainer").css("position", "absolute");
				$("#toolbarcontainer").css("margin-top", "0px");
				$("#toolbarcontainer").css("top", barTop + "px");
				placeInserMoreDropdown("absolute",0,barTop);
			}
			else {
				$("#toolbarcontainer").css("position", "fixed");
				$("#toolbarcontainer").css("margin-top", "0px");
				$("#toolbarcontainer").css("top", "0px");
				placeInserMoreDropdown("fixed",0,0);
			}
		}
		last = new Date().getTime();
	};
	
	var placeInserMoreDropdown = function(position,marginTop,top){
		$("#insert_more_menu").css("position", position);
		$("#insert_more_menu").css("margin-top", marginTop + "px");
		$("#insert_more_menu").css("top", top + 25 + "px");
		$("#insert_more_menu").css("left",$("#insert_more_dropdown_main").position().left + $("#toolbarcontainer").position().left + 1 + "px");
	};
	
	var showingInsertMore = false;
	
	var toggleInsertMore = function(){
		if (showingInsertMore){
			$("#insert_more_menu").hide();
			showingInsertMore = false;	
		} else {
			$("#insert_more_menu").show();
			showingInsertMore = true;
		}
	};
	
	/*
		Edit page functionality 
	*/
	
	var showPageLocation = function(){
		var finaljson = {};
		finaljson.pages = [];
		finaljson.pages[0] = currentsite.name;
		var splitted = selectedpage.split('/');
		var current = "";
		for (var i = 0; i < splitted.length; i++){
			var id = splitted[i];
			if (i !== 0){
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
		$("#new_page_path").html($.Template.render("new_page_path_template",finaljson));
		
		$("#move_inside_edit").bind("click", function(ev){
			moveInsideEdit();
		});
		
	};
	
	var editPage = function(pageid){

		inEditView = true;
		$("#more_menu").hide();

		var escaped = pageid.replace(/ /g, "%20");
		try {
			$("#" + escaped).html("");
		} catch (err){}
		var el = document.getElementById("main-content-div");
		var hasopened = false;
		for (var i = 0; i < el.childNodes.length; i++) {
			try {
				if (el.childNodes[i] && el.childNodes[i].style) {
					el.childNodes[i].style.display = "none";
				}
			} 
			catch (err) {
			}
		}
		//$("#webpage_edit").hide();0

		var pagetitle = "";
				
		for (i = 0; i < pages.items.length; i++){
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
					attribute = attribute.split("=")[0].replace(/ /g,"");
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
					
				if (todo === 0 && originalicon && newicon && (originalicon != newicon)){
					content2 = content2.replace(originalicon, newicon);
				}	
					
			}
					
					
		} catch (err){
			alert(err);
		}
				
		if (content2) {
			tinyMCE.get("elm1").setContent(content2);
		}
		
		$("#messageInformation").hide();
		
		myCustomInitInstance();
		myCustomInitInstanced = true;
		$("#show_view_container").hide();
		$("#edit_view_container").show();
		
		var newpath = selectedpage.split("/").join("/_pages/");
		$.ajax({
			url: "/sdata/f/" + currentsite.id + "/_pages/" + newpath + "/_content",
			cache: false,
			success: function(data){
				autosavecontent = data;
				$('#autosave_dialog').jqmShow();
			},
			error: function(data){	
				timeoutid = setInterval(sakai._site.doAutosave, autosaveinterval);
			}
		});
		
	};
	
	
	/*
		Delete a page functionality 
	*/
	
	$('#delete_dialog').jqm({
		modal: true,
		trigger: $('.delete_dialog'),
		overlay: 20,
		toTop: true
	});
	
	$("#more_delete").bind("click", function(){
		$('#delete_dialog').jqmShow();
	});
	
	$("#delete_confirm").bind("click", function(){
		var newpath = selectedpage.split("/").join("/_pages/");
		$.ajax({
			url: "/sdata/f/" + currentsite.id + "/_pages/" + newpath,
			type: 'DELETE',
			success: function(data){
				
				// Save the new page configuration
				
				var index = -1;
				for (var i = 0; i < pages.items.length; i++){
					if (pages.items[i].id == selectedpage){
						index = i;
					}
				}
				
				pages.items.splice(index, 1);
				
				sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/.site", "pageconfiguration", $.toJSON(pages), function(success){
				
					document.location = "/dev/site.html?siteid=" + currentsite.id;
				
				});
				
			},
			error: function(data){	
				
				// Save the new page configuration
				
				var index = -1;
				for (var i = 0; i < pages.items.length; i++){
					if (pages.items[i].id == selectedpage){
						index = i;
					}
				}
				
				pages.items.splice(index, 1);
				
				sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/.site", "pageconfiguration", $.toJSON(pages), function(success){
				
					document.location = "/dev/site.html?siteid=" + currentsite.id;
				
				});
				
			}
		});
	});
	
	
	/*
		Auto-save functionality
	*/
	
	var autosavecontent = false;
	
	var hideAutosave = function(hash){
		hash.w.hide();
		hash.o.remove();
		timeoutid = setInterval(sakai._site.doAutosave, autosaveinterval);
		removeAutoSaveFile();
	};
	
	$("#autosave_revert").bind("click", function(ev){
		tinyMCE.get("elm1").setContent(autosavecontent);
		$('#autosave_dialog').jqmHide();
	});
	
	
	$('#autosave_dialog').jqm({
		modal: true,
		trigger: $('.autosave_dialog'),
		overlay: 20,
		toTop: true,
		//onShow: renderAutosave,
		onHide: hideAutosave
	});
	
	
	sakai._site.doAutosave = function(){
		
		// Determine the view we're in
		
		var tosave = "";
		
		if (!currentEditView){
			tosave = tinyMCE.get("elm1").getContent();
		} else if (currentEditView == "html"){
			tosave = $("#html-editor-content").val();
		}
		
		// Save the data
		
		var newurl = selectedpage.split("/").join("/_pages/");
		sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/_pages/" + newurl, "_content", tosave, function(){}, null, "x-sakai-page");

		// Update autosave indicator
		
		var now = new Date();
		var hours = now.getHours();
		if (hours < 10){
			hours = "0" + hours;
		}
		var minutes = now.getMinutes();
		if (minutes < 10){
			minutes = "0" + minutes;
		}
		var seconds = now.getSeconds();
		if (seconds < 10){
			seconds = "0" + seconds;
		}
		$("#realtime").text(hours + ":" + minutes + ":" + seconds);
		$("#messageInformation").show();
		
	};
	
	/*
		Local event handlers 
	*/
	
	$("#edit_page").bind("click", function(ev){
		isEditingNewPage = false;
		inEditView = true;
		editPage(selectedpage);
		return false;
	});
	
	$("#edit_sidebar").bind("click", function(ev){
		editPage("_navigation");
		return false;
	});
	
	var removeAutoSaveFile = function(){
		// Remove autosave file
		
		var newpath = selectedpage.split("/").join("/_pages/");
		$.ajax({
			url: "/sdata/f/" + currentsite.id + "/_pages/" + newpath + "/_content",
			type: 'DELETE'
		});
		
	};
	
	$(".cancel-button").bind("click", function(ev){
		
		clearInterval(timeoutid);
		
		$("#insert_more_menu").hide();
		$("#context_menu").hide();
		showingInsertMore = false;	
		inEditView = false;

		removeAutoSaveFile();
		
		if (isEditingNewPage) {
		
			// Delete page from configuration file
			
			var index = -1;
			for (var i = 0; i < pages.items.length; i++){
				if (pages.items[i].id == selectedpage){
					index = i;
				}
			}
			
			pages.items.splice(index,1);
			
			// Save configuration file
			
			sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/.site", "pageconfiguration", $.toJSON(pages), function(success){
	
				// Go back to view mode of previous page
				
				var escaped = oldSelectedPage.replace(/ /g, "%20");
				document.getElementById(escaped).innerHTML = pagecontents[oldSelectedPage];
				if (pagetypes[oldSelectedPage] == "webpage") {
					$("#webpage_edit").show();
				}
				document.getElementById(oldSelectedPage).style.display = "block";
				sdata.widgets.WidgetLoader.insertWidgets(oldSelectedPage);
				
				selectedpage = oldSelectedPage;
			
				$("#edit_view_container").hide();
				$("#show_view_container").show();
			
				// Delete the folder that has been created for the new page	
			
				var newpath = selectedpage.split("/").join("/_pages/");
				$.ajax({
					url: "/sdata/f/" + currentsite.id + "/" + newpath,
					type: 'DELETE'
				});
			});
	
		
		} else {
		
			resetView();
			
			var escaped = selectedpage.replace(/ /g, "%20");
			document.getElementById(escaped).innerHTML = pagecontents[selectedpage];
			if (pagetypes[selectedpage] == "webpage") {
				$("#webpage_edit").show();
			}
			document.getElementById(escaped).style.display = "block";
			sdata.widgets.WidgetLoader.insertWidgets(escaped);
			
			$("#edit_view_container").hide();
			$("#show_view_container").show();
			
		}
	});
	
	$("#print_page").bind("click", function(ev){
		printPage();
	});
	
	$(".save_button").bind("click", function(ev){
		
		clearInterval(timeoutid);
		$("#context_menu").hide();
		
		removeAutoSaveFile();
		
		$("#insert_more_menu").hide();
		showingInsertMore = false;	
		
		resetView();
		
		if (isEditingNavigation){
			
			// Navigation
			
			pagecontents["_navigation"] = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
			$("#page_nav_content").html(pagecontents["_navigation"]);
			
			var escaped = selectedpage.replace(/ /g, "%20");
			document.getElementById(escaped).style.display = "block";
			
			$("#edit_view_container").hide();
			$("#show_view_container").show();
			
			sdata.widgets.WidgetLoader.insertWidgets("page_nav_content");
			sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/_navigation", "content", pagecontents["_navigation"], function(){});
			
			var els = $("a", $("#" + escaped));
			for (var i = 0; i < els.length; i++) {
				var nel = els[i];
				/*
if (nel.className == "contauthlink") {
					nel.href = "#" + nel.href.split("/")[nel.href.split("/").length - 1];
				}
*/
			}
			
			document.getElementById(escaped).style.display = "block";
			sdata.widgets.WidgetLoader.insertWidgets(escaped);
		
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
			for (i = 0; i < pages.items.length; i++){
				if (pages.items[i].id == selectedpage){
					oldpagetitle = pages.items[i].title;
				}
			}
			
			if (oldpagetitle.toLowerCase() != newpagetitle.toLowerCase() || (inEditView !== false && inEditView !== true)){
				
				// Generate new page id
				
				var newid = "";
				var counter = 0;
				var baseid = newpagetitle.toLowerCase();
				baseid = baseid.replace(/ /g,"-");
				baseid = baseid.replace(/[:]/g,"-");
				baseid = baseid.replace(/[?]/g,"-");
				baseid = baseid.replace(/[=]/g,"-");
				var basefolder = "";
				if (inEditView !== false && inEditView !== true){
					var abasefolder = inEditView.split("/");
					for (i = 0; i < abasefolder.length - 1; i++){
						basefolder += abasefolder[i] + "/";
					}
				} else {
					var abasefolder2 = selectedpage.split("/");
					for (i = 0; i < abasefolder2.length - 1; i++){
						basefolder += abasefolder2[i] + "/";
					}
				}
				
				baseid = basefolder + baseid;
				
				while (!newid){
					var testid = baseid;
					if (counter > 0){
						testid += "-" + counter;
					}
					counter++;
					var exists = false;
					for (i = 0; i < pages.items.length; i++){
						if (pages.items[i].id == testid){
							exists = true;
						}
					}
					if (!exists){
						newid = testid;
					}
				}
				
				for (i = 0; i < pages.items.length; i++){
					if (pages.items[i].id == selectedpage){
						pages.items[i].id = newid;
						pages.items[i].title = newpagetitle;
						break;
					}
				}
				
				// Move page folder to this new id
				
				var oldfolderpath = "/sdata/f/" + currentsite.id + "/_pages/" + selectedpage.split("/").join("/_pages/");
				var newfolderpath = "/" + currentsite.id + "/_pages/" + newid.split("/").join("/_pages/");
				
				var data = {
					to: newfolderpath,
					f: "mv"
				};
				
				$.ajax({
					url: oldfolderpath,
					type: 'POST',
					data: data,
					success: function(data){
						
						// Move all of the subpages of the current page to stay a subpage of the current page
				
						var idtostartwith = selectedpage + "/";
						for (var i = 0; i < pages.items.length; i++){
							if (pages.items[i].id.substring(0,idtostartwith.length) == idtostartwith){
								pages.items[i].id = newid + "/" + pages.items[i].id.substring(idtostartwith.length);
							}
						}
				
						// Adjust configuration file
						
						sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/.site", "pageconfiguration", $.toJSON(pages), function(success){
							
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
									
									// Check in the page
									$.ajax({
										url: "/sdata/f" + newfolderpath + "/content?f=ci",
										type: 'POST'
									});
							
								}, null, "x-sakai-page");
							
						});		
						
					},
					error: function(status){
						
						// Move all of the subpages of the current page to stay a subpage of the current page
				
						var idtostartwith = selectedpage + "/";
						for (var i = 0; i < pages.items.length; i++){
							if (pages.items[i].id.substring(0,idtostartwith.length) == idtostartwith){
								pages.items[i].id = newid + "/" + pages.items[i].id.substring(idtostartwith.length);
							}
						}
				
						// Adjust configuration file
						
						sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/.site", "pageconfiguration", $.toJSON(pages), function(success){
							
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
									
									// Check in the page
									$.ajax({
										url: "/sdata/f" + newfolderpath + "/content?f=ci",
										type: 'POST'
									});
									
								}, null, "x-sakai-page");
							
						});		
						
					}
				});
				
			} else {
				
				if (isEditingNewPage) {
					
					// Save page content
								
					var content = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
					var newurl = selectedpage.split("/").join("/_pages/");
					sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/_pages/" + newurl, "content", content, function(){
							
						// Remove old div + potential new one
								
						$("#" + escapePageId(selectedpage)).remove();
								
						// Remove old + new from pagecontents array 
									
						pagecontents[selectedpage] = null;
									
						// Switch the History thing
									
						sakai.site.openPage(selectedpage);
						$("#edit_view_container").hide();
						$("#show_view_container").show();
						
						// Check in the page
						$.ajax({
							url: "/sdata/f/" + currentsite.id + "/_pages/" + newurl + "/content?f=ci",
							type: 'POST'
						});
									
					}, null, "x-sakai-page");					
					
				}
				else {
				
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
						/*
if (nel.className == "contauthlink") {
							nel.href = "#" + nel.href.split("/")[nel.href.split("/").length - 1];
						}
*/
					}
					
					document.getElementById(escaped).style.display = "block";
					sdata.widgets.WidgetLoader.insertWidgets(escaped);
					var newurl = selectedpage.split("/").join("/_pages/");
					sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/_pages/" + newurl, "content", pagecontents[selectedpage], function(){
					
						// Check in the page
						$.ajax({
							url: "/sdata/f/" + currentsite.id + "/_pages/" + newurl + "/content?f=ci",
							type: 'POST'
						});
					
					}, null, "x-sakai-page");
					
				}
			
			}
			
		}
		
		inEditView = false;
		
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
		
		$.ajax({
			url: "/sdata/p/_print",
			type: "POST",
			success: function(data){
				
				var pagetitle = "";
				
				for (var i = 0; i < pages.items.length; i++){
					if (pages.items[i].id == selectedpage){
						pagetitle = pages.items[i].title;
						break;
					}
				}
				
				popUp("print.html?pagetitle=" + pagetitle);
			},
			data: data,
			contentType: "multipart/form-data"
		});
		
	};
	
	var popUp = function(URL) {
		day = new Date();
		id = day.getTime();
		eval("page" + id + " = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=800,height=600,left = 320,top = 150');");
	};
	
	
	/*
		Context menu functions 
	*/
	
	$("#context_remove").bind("click", function(ev){
		tinyMCE.get("elm1").execCommand('mceInsertContent', false, '');
	});
	
	$("#context_settings").bind("click", function(ev){
		var ed = tinyMCE.get('elm1');
		var selected = ed.selection.getNode();
		$("#dialog_content").hide();
		if (selected && selected.nodeName.toLowerCase() == "img") {
			if (selected.getAttribute("class") == "widget_inline") {
				$("#context_settings").show();
				var id = selected.getAttribute("id");
				var split = id.split("_");
				var type = split[1];
				var uid = split[2];
				var length = split[0].length + 1 + split[1].length + 1 + split[2].length + 1; 
				var placement = id.substring(length);

				newwidget_id = type;
				
				$("#dialog_content").hide();
				
				if (Widgets.widgets[type]) {
				
					$('#insert_dialog').jqmShow(); 
					var nuid = "widget_" + type + "_" + uid + "_" + placement;
					newwidget_uid = nuid;
					$("#dialog_content").html('<img src="' + Widgets.widgets[type].img + '" id="' + nuid + '" class="widget_inline" border="1"/>');
					$("#dialog_title").text(Widgets.widgets[type].name)
					sdata.widgets.WidgetLoader.insertWidgetsAdvanced("dialog_content", true);
					$("#dialog_content").show();
					$("#insert_more_menu").hide();
					showingInsertMore = false;	
					
				}
			}
		}

		$("#context_menu").hide();
		
	});
	
	
	/*
		Preview tab 
	*/
	
	$("#tab_preview").bind("click", function(ev){
		$("#context_menu").hide();
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
		$("#context_menu").hide();
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
		"Add a new"-dropdown functions 
	*/
	
	var isShowingDropdown = false;
	
	$("#add_a_new").bind("click", function(ev){
		if (isShowingDropdown){
			$("#add_new_menu").hide();
			isShowingDropdown = false;
		} else {
			$("#add_new_menu").show();
			isShowingDropdown = true;
		}
	});

	$("#option_blank_page").hover(
		function(over){
			$("#option_blank_page").addClass("selected_option");
		}, 
		function(out){
			$("#option_blank_page").removeClass("selected_option");
		}
	);
	
	$("#option_page_from_template").hover(
		function(over){
			$("#option_page_from_template").addClass("selected_option");
		}, 
		function(out){
			$("#option_page_from_template").removeClass("selected_option");
		}
	);
	
	$("#option_page_dashboard").hover(
		function(over){
			$("#option_page_dashboard").addClass("selected_option");
		}, 
		function(out){
			$("#option_page_dashboard").removeClass("selected_option");
		}
	);
	
	
	/*
		"Context menu"-dropdown functions 
	*/
	
	var isShowingContext = false;

	$("#context_settings").hover(
		function(over){
			$("#context_settings").addClass("selected_option");
		}, 
		function(out){
			$("#context_settings").removeClass("selected_option");
		}
	);
	
	$("#context_remove").hover(
		function(over){
			$("#context_remove").addClass("selected_option");
		}, 
		function(out){
			$("#context_remove").removeClass("selected_option");
		}
	);
	
	$("#context_appearance").hover(
		function(over){
			$("#context_appearance").addClass("selected_option");
		}, 
		function(out){
			$("#context_appearance").removeClass("selected_option");
		}
	);
	
	
	/*
		More dropdown 
	*/
	
	$(".more_option").hover(
		function(over){
			$(this).addClass("selected_option");
		}, 
		function(out){
			$(this).removeClass("selected_option");
		}
	);
	
	$("#more_link").bind("click", function(ev){
		var el = $("#more_menu");
		if (el.css("display").toLowerCase() != "none") {
			el.hide();
		} else {
			var x = $("#more_link").position().left;
			var y = $("#more_link").position().top;
			el.css("top",y + 17 + "px");
			el.css("left",x - el.width() + $("#more_link").width() + 5 + "px");
			el.show();
		}		
	});
	
	/*
		Add in a horizontal line 
	*/
	
	$("#horizontal_line_insert").bind("click", function(ev){
		tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<hr/>');
		toggleInsertMore();
	});
	
	
	/*
		Add in selected widget 
	*/
	
	var newwidget_id = false;
	var newwidget_uid = false;
	
	var renderSelectedWidget = function(hash){
		
		toggleInsertMore();
		
		var widgetid = false;
		if (hash.t){
			widgetid = hash.t.id.split("_")[3];
		}
		$("#dialog_content").hide();
		
		if (Widgets.widgets[widgetid]){
			
			hash.w.show();
			
			newwidget_id = widgetid;
			var rnd = "id" + Math.round(Math.random() * 1000000000);
			var id = "widget_" + widgetid + "_" + rnd + "_" + currentsite.id + "/_widgets";
			newwidget_uid = id;
			$("#dialog_content").html('<img src="' + Widgets.widgets[widgetid].img + '" id="' + id + '" class="widget_inline" border="1"/>');
			$("#dialog_title").text(Widgets.widgets[widgetid].name)
			sdata.widgets.WidgetLoader.insertWidgetsAdvanced("dialog_content", true);
			$("#dialog_content").show();
			window.scrollTo(0,0);
			
		} else if (!widgetid){
			hash.w.show();
			window.scrollTo(0,0);
		}
		
	}
	
	var hideSelectedWidget = function(hash){
		hash.w.hide();
		hash.o.remove();
		newwidget_id = false;
		newwidget_uid = false;
		$("#dialog_content").html("");
		$("#dialog_content").hide();
	}
	
	sakai._site.widgetCancel = function(tuid){
		$('#insert_dialog').jqmHide(); 
	}
	
	sakai._site.widgetFinish = function(tuid){
		
		// Add widget to the editor
		
		$("#insert_screen2_preview").html('');
		tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<img src="' + Widgets.widgets[newwidget_id].img + '" id="' + newwidget_uid + '" class="widget_inline" style="display:block; padding: 10px; margin: 4px" border="1"/>');
		
		$('#insert_dialog').jqmHide(); 
		
	}
	
	sdata.container.registerFinishFunction(sakai._site.widgetFinish);
	sdata.container.registerCancelFunction(sakai._site.widgetCancel);
	
	/*
		 Add a blank page
	*/
	
	var isEditingNewPage = false;
	var oldSelectedPage = false;
	
	$("#option_blank_page").bind("click", function(ev){
		
		resetVersionHistory();
		createNewPage("");
		
	});
	
	var createNewPage = function(content){
		
		$("#add_new_menu").hide();
		isShowingDropdown = false;
		
		// Set new page flag
		
		isEditingNewPage = true;
		
		// Determine where to create the page
		
		var path = "";
		if (selectedpage){
			if (createChildPageByDefault){
				path = selectedpage + "/";
			} else {
				var splitted = selectedpage.split("/");
				for (var i = 0; i < splitted.length - 2; i++){
					path += splitted[i] + "/";
				}
			}
		} 
		
		// Determine new page id (untitled-x)
		
		var newid = false;
		var counter = 0;
		while (!newid){
			var totest = path + "untitled";
			if (counter != 0){
				totest += "-" + counter;
			}
			counter++;
			var exists = false;
			for (var i = 0; i < pages.items.length;i++){
				if (pages.items[i].id == totest){
					exists = true;
				}
			}
			if (!exists){
				newid = totest;
			}
		}
		
		// Post the page content ?
		
		// Assign the empty content to the pagecontents array
		
		pagecontents[newid] = content;
		
		// Change the configuration file
		
		var index = pages.items.length;
		pages.items[index] = {};
		pages.items[index].id = newid;
		pages.items[index].title = "Untitled";
		pages.items[index].type = "webpage";
		
		// Post the new configuration file
		
		sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/.site", "pageconfiguration", sdata.JSON.stringify(pages), function(success){});
		
		// Pull up the edit view
		
		oldSelectedPage = selectedpage;
		selectedpage = newid;
		editPage(newid);
		
		// Show and hide appropriate things
		
	}
	
	
	/*
		fill Insert More Dropdown 
	*/
	
	var fillInsertMoreDropdown = function(){
		
		// Do media widgets
		
		var media = {};
		media.items = [];
		
		for (var i in Widgets.widgets){
			var widget = Widgets.widgets[i];
			if (widget.ca && widget.showinmedia){
				media.items[media.items.length] = widget;
			}
		}
		
		$("#insert_more_media").html(sdata.html.Template.render("insert_more_media_template",media));
		
		// Do Sakai Goodies
		
		var goodies = {};
		goodies.items = [];
		
		for (var i in Widgets.widgets){
			var widget = Widgets.widgets[i];
			if (widget.ca && widget.showinsakaigoodies){
				goodies.items[goodies.items.length] = widget;
			}
		}
		
		$("#insert_more_goodies").html(sdata.html.Template.render("insert_more_goodies_template",goodies));
		
		// Event handler
		
		$('#insert_dialog').jqm({
			modal: true,
			trigger: $('.insert_more_widget'),
			overlay: 20,
			toTop: true,
			onShow: renderSelectedWidget,
			onHide: hideSelectedWidget
		});
		
	}
	
	
	/*
		Wrapping functionality 
	*/
	
	var showWrappingDialog = function(hash){
		$("#context_menu").hide();
		window.scrollTo(0,0);
		hash.w.show();
	}
	
	var createNewStyle = function(toaddin){
		var ed = tinyMCE.get('elm1');
		var selected = ed.selection.getNode();
		if (selected && selected.nodeName.toLowerCase() == "img") {
			var style = selected.getAttribute("style").replace(/ /g, "");
			var splitted = style.split(';');
			var newstyle = '';
			for (var i = 0; i < splitted.length; i++) {
				var newsplit = splitted[i].split(":");
				if (newsplit[0] && newsplit[0] != "display" && newsplit[0] != "float") {
					newstyle += splitted[i] + ";";
				}
			}
			newstyle += toaddin;
			newstyle.replace(/[;][;]/g,";");
			
			var toinsert = '<';
			toinsert += selected.nodeName.toLowerCase();
			for (var i = 0; i < selected.attributes.length; i++){
				if (selected.attributes[i].nodeName.toLowerCase() == "style") {
					toinsert += ' ' + selected.attributes[i].nodeName.toLowerCase() + '="' + newstyle + '"';
				} else if (selected.attributes[i].nodeName.toLowerCase() == "mce_style") {
					toinsert += ' ' + selected.attributes[i].nodeName.toLowerCase() + '="' + newstyle + '"';
				} else {
					toinsert += ' ' + selected.attributes[i].nodeName.toLowerCase() + '="' + selected.attributes[i].nodeValue + '"';
				}
			}
			toinsert += '/>';
			
			//alert(ed.selection.getContent() + "\n" + selected.getAttribute("style"));
			
			tinyMCE.get("elm1").execCommand('mceInsertContent', true, toinsert);
			
		}
	}
	
	$("#wrapping_no").bind("click",function(ev){
		createNewStyle("display:block;");
		$('#wrapping_dialog').jqmHide();
	});
	
	$("#wrapping_left").bind("click",function(ev){
		createNewStyle("display:block;float:left;");
		$('#wrapping_dialog').jqmHide();
	});
	
	$("#wrapping_right").bind("click",function(ev){
		createNewStyle("display:block;float:right;");
		$('#wrapping_dialog').jqmHide();
	});
	
	$('#wrapping_dialog').jqm({
			modal: true,
			trigger: $('#context_appearance_trigger'),
			overlay: 20,
			toTop: true,
			onShow: showWrappingDialog
		});
	
	
	/*
		Insert Link 
	*/	
	
	var createHierarchy = function(done, object, page){
		var toinsert = page.id.substring(done.length);
		var todo = toinsert.split("/")[0];
		object[todo] = object[todo] || {};
		if (toinsert.indexOf("/") != -1){
			object[todo] = createHierarchy(done + "/" + toinsert.split("/")[0], object[todo], page);
			return object;
		} else {
			object[todo]._content = page;
			return object;
		}
	}
	
	var createHTMLHierarchy = function(object,key,active){
		//var html = "<li>";
		var html = "";
		if (active){
			if (object._content.id == active){
				html += "<li id='" + object._content.id + "' class='open'><span>" + object._content.title + "</span>";
			} else {
				html += "<li id='" + object._content.id + "'  class='open' rel='locked'><span>" + object._content.title + "</span>";
			}
		} else {
			html += "<li id='" + object._content.id + "' class='open'><span>" + object._content.title + "</span>";
		}
		var size = 0;
		for (var i in object){
			size++;	
		}
		if (size > 1){
			html += "<ul>";
		}
		for (var i in object){
			if (i != "_content"){
				html += createHTMLHierarchy(object[i],i,active);
			}
		}	
		if (size > 1){
			html += "</ul>";
		}	
		html += "</li>";
		return html;
	}
	
	var removePageStructure = function(hash){
		hash.w.hide();
		hash.o.remove();
		$("#treeview_link_container").html("");
	}
	
	$("#insert_link_confirm").bind("click", function(ev){
		
		var chosen = false;
		try {
			chosen = simpleTreeCollection.get(0).getSelected().attr("id");
		} catch (err){
			
		}
		if (!chosen){
			return false;
		}
		
		var editor = tinyMCE.get("elm1");
		var selection = editor.selection.getContent();
		if (selection) {
			editor.execCommand('mceInsertContent', false, '<a href="#' + chosen + '"  class="contauthlink">' + selection + '</a>');
		}
		else {
			var pagetitle = chosen;
			for (var i = 0; i < pages.items.length; i++) {
				if (pages.items[i].id == chosen) {
					pagetitle = pages.items[i].title;
				}
			}
			editor.execCommand('mceInsertContent', false, '<a href="#' + chosen + '" class="contauthlink">' + pagetitle + '</a>');
		}
		
		$('#link_dialog').jqmHide();
	});
	
	var doPageHierarchy = function(active){
		// Generate the structure
		
		var object = {};
		
		for (var i = 0; i < pages.items.length; i++){
			var page = pages.items[i];
			object = createHierarchy("", object, page);
		}
		
		// Generate the HTML
		
		var currentId = 2;
		var html = '<ul class="simpleTree"><li class="root" id="1"><span style="display:none">Tree Root 1</span><ul>';
		
		for (var i in object){
			html += createHTMLHierarchy(object[i],i,active);
		}
		
		html += '</ul></li></ul>';
		
		return html;
	};
	
	var renderPageStructure = function(hash){
		
		var html = doPageHierarchy();
		
		// Add in HTML
		
		$("#treeview_link_container").html(html);
		
		simpleTreeCollection = $('.simpleTree').simpleTree({
			autoclose: true,
			drag: false,
			afterClick:function(node){
				//alert("text-"+$('span:first',node).text());
			},
			afterDblClick:function(node){
				//alert("text-"+$('span:first',node).text());
			},
			afterMove:function(destination, source, pos){
				//alert("destination-"+$('span:first',destination).text()+" source-"+$('span:first',source).text()+" pos-"+pos);
			},
			afterAjax:function()
			{
				//alert('Loaded');
			},
			animate:true
			//,docToFolderConvert:true
			}
		);
		$("#insert_more_menu").hide();
		showingInsertMore = false;
		hash.w.show();
	};
	
	$('#link_dialog').jqm({
		modal: true,
		trigger: $('#link_dialog_trigger'),
		overlay: 20,
		toTop: true,
		onShow: renderPageStructure,
		onHide: removePageStructure
	});
	
	
	/*
		Move inside edit view 
	*/
	
	var inEditView = false;
	
	var moveInsideEdit = function(){
		window.scrollTo(0,0);
		$('#move_dialog').jqmShow();
	}
	
	
	/*
		Move a page 
	*/

	var renderMovePageStructure = function(hash){
		var html = doPageHierarchy(selectedpage);
		
		// Add in HTML
		
		$("#treeview_move_container").html(html);
		
		simpleTreeCollection = $('.simpleTree').simpleTree({
			autoclose: false,
			afterClick:function(node){
				//alert("text-"+$('span:first',node).text());
			},
			afterDblClick:function(node){
				//alert("text-"+$('span:first',node).text());
			},
			afterMove:function(destination, source, pos){
				//alert("destination-"+$('span:first',destination).text()+" source-"+$('span:first',source).text()+" pos-"+pos);
			},
			afterAjax:function()
			{
				//alert('Loaded');
			},
			animate:true,
			docToFolderConvert:true
			}
		);
		
		hash.w.show();
		
		$("#more_menu").hide();
		$("#" + escapePageId(selectedpage)).find(">span").addClass("active");
		if (inEditView){
			$("#" + escapePageId(selectedpage)).find(">span").text($("#title-input").val());	
		}
	} 
	
	var removeMovePageStructure = function(hash){
		hash.w.hide();
		hash.o.remove();
		$("#treeview_move_container").html("");
	}

	$('#move_dialog').jqm({
		modal: true,
		trigger: $('.move_dialog_trigger'),
		overlay: 20,
		toTop: true,
		onShow: renderMovePageStructure,
		onHide: removeMovePageStructure
	});
	
	$("#move_page_confirm").bind("click", function(ev){
		
		// Generate new id
		
		var pageid = "";
		for (var i = 0; i < pages.items.length; i++){
			if (pages.items[i].id == selectedpage){
				pageid = pages.items[i].id;
			}
		}
		pageid = pageid.split("/")[pageid.split("/").length - 1];
		
		var item = $("#" + escapePageId(selectedpage));
		var parent = item.parent().parent().attr("id");
		
		if (parent == "1"){
			parent = "";
		}
		
		var newid = false;
		var index = 0;
		var b_pages = clone(pages);
		var togoout = -1;
		for (var i = 0; i < b_pages.items.length; i++){
			if (b_pages.items[i].id == selectedpage){
				togoout = i;
			}
		}
		b_pages.items.splice(togoout,1);
		while (!newid){
			var totest = "";
			if (parent){
				totest += parent + "/";
			}
			totest += pageid;
			if (index != 0){
				totest += "-" + index;
			}
			var exists = false;
			for (var i = 0; i < b_pages.items.length; i++){
				if (b_pages.items[i].id == totest){
					exists = true;
				}
			}
			if (!exists){
				newid = totest;
			}
			index++;
		}
		
		// Move current file (generate new page id)
		
		if (!inEditView) {
		
			var oldfolderpath = "/sdata/f/" + currentsite.id + "/_pages/" + selectedpage.split("/").join("/_pages/");
			var newfolderpath = "/" + currentsite.id + "/_pages/" + newid.split("/").join("/_pages/");
			
			var data = {
				to: newfolderpath,
				f: "mv"
			};
			
			sdata.Ajax.request({
				url: oldfolderpath,
				httpMethod: 'POST',
				postData: data,
				onSuccess: function(data){
				
				
					// Rewrite configuration file
					
					var parentEl = $(".root");
					var els = $("li", parentEl);
					
					var newpageconfig = {};
					newpageconfig.items = [];
					
					for (var i = 0; i < els.length; i++) {
						if (els[i] && els[i].id) {
							for (var ii = 0; ii < pages.items.length; ii++) {
								if (pages.items[ii].id == els[i].id) {
									var newindex = newpageconfig.items.length;
									newpageconfig.items[newindex] = pages.items[ii];
									if (pages.items[ii].id == selectedpage) {
										newpageconfig.items[newindex].id = newid;
									}
								}
							}
						}
					}
					
					sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/.site", "pageconfiguration", sdata.JSON.stringify(newpageconfig), function(success){
					
						$(document.body).hide();
						document.location = "#" + newid;
						window.location.reload(true);
						$('#move_dialog').jqmHide();
						
					});
					
					
				},
				onFail: function(data){
				
					// Rewrite configuration file
					
					var parentEl = $(".root");
					var els = $("li", parentEl);
					
					var newpageconfig = {};
					newpageconfig.items = [];
					
					for (var i = 0; i < els.length; i++) {
						if (els[i] && els[i].id) {
							for (var ii = 0; ii < pages.items.length; ii++) {
								if (pages.items[ii].id == els[i].id) {
									var newindex = newpageconfig.items.length;
									newpageconfig.items[newindex] = pages.items[ii];
									if (pages.items[ii].id == selectedpage) {
										newpageconfig.items[newindex].id = newid;
									}
								}
							}
						}
					}
					
					sdata.widgets.WidgetPreference.save("/sdata/f/" + currentsite.id + "/.site", "pageconfiguration", sdata.JSON.stringify(newpageconfig), function(success){
					
						$(document.body).hide();
						document.location = "#" + newid;
						window.location.reload(true);
						$('#move_dialog').jqmHide();
						
					});
					
				},
				contentType: "application/x-www-form-urlencoded"
			});
			
		} else {
			
			inEditView = newid;
			
			$("#move_dialog").jqmHide();
			
			// Update the path shown
			
			var finaljson = {}
			finaljson.pages = [];
			finaljson.pages[0] = currentsite.name;
			var splitted = inEditView.split('/');
			var current = "";
			for (var i = 0; i < splitted.length - 1; i++){
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
			finaljson.pages[finaljson.pages.length] = $("#title-input").val();
			finaljson.total = finaljson.pages.length;
			$("#new_page_path").html(sdata.html.Template.render("new_page_path_template",finaljson));
			
			$("#move_inside_edit").bind("click", function(ev){
				moveInsideEdit();
			});
			
		}

		
	});
	
	var clone = function(obj){

	    if(obj == null || typeof(obj) != 'object')
	
	        return obj;
	
	
	
	    var temp = new obj.constructor(); // changed (twice)
	
	    for(var key in obj)
	
	        temp[key] = clone(obj[key]);
	
	
	
	    return temp;

	}
	
	
	
	/*
		Page template functionality 
	*/

	var startSaveAsTemplate = function(hash){
		$("#more_menu").hide();
		$("#add_new_menu").hide();
		isShowingDropdown = false;
		hash.w.show();
	}

	$("#save_as_template_container").jqm({
		modal: true,
		trigger: $('#more_save_as_template'),
		overlay: 20,
		toTop: true,
		onShow: startSaveAsTemplate
	});
	
	$("#save_as_page_template_button").bind("click", function(ev){
		var name = $("#template_name").val();
		var description = $("#template_description").val() || "";
		if (name){
			
			var newid = Math.round(Math.random() * 100000000);
			
			var obj = {};
			obj.name = name;
			obj.description = description;
			
			var a = ["u"];
			var k = ["" + newid];
			var v = ["" + sdata.JSON.stringify(obj)];
			var tosend = {"v":v,"k":k,"a":a};
			
			var fileUrl = "/sdata/p/_templates/pages/configuration";
				
			// Get templates configuration file
			
			sdata.Ajax.request({
		      	url :fileUrl + "?sid=" + Math.random(),
		      	httpMethod : "GET",
				onSuccess : function(data) {
					
					var templates = eval('(' + data + ')');
					updateTemplates(obj, newid, templates);
					
				},
				onFail : function(data){
					
					var templates = {};
					updateTemplates(obj, newid, templates);

				}
			});

		}
		
	});
	
	var updateTemplates = function(obj, newid, templates){
		templates[newid] = obj;
		var tosave = sdata.JSON.stringify(templates);
		sdata.widgets.WidgetPreference.save("/sdata/p/_templates/pages", "configuration", tosave, function(success){
			sdata.widgets.WidgetPreference.save("/sdata/p/_templates/pages/" + newid, "content", pagecontents[selectedpage], function(success){
				$("#save_as_template_container").jqmHide();
				$("#template_name").val("");
				$("#template_description").val("");
			});
		});
	}
	
	var mytemplates = false;
	
	var loadTemplates = function(hash){
		
		resetVersionHistory();
		
		$("#add_new_menu").hide();
		isShowingDropdown = false;
		
		var fileUrl = "/sdata/p/_templates/pages/configuration";
				
		// Get templates configuration file
			
		sdata.Ajax.request({
	     	url :fileUrl + "?sid=" + Math.random(),
	     	httpMethod : "GET",
			onSuccess : function(data) {
					
				var templates = eval('(' + data + ')');
				renderTemplates(templates);
					
			},
			onFail : function(data){
					
				var templates = {};
				renderTemplates(templates);
			
			}
		});
		
		hash.w.show();
	}
	
	var renderTemplates = function(templates){
		
		mytemplates = templates;
		
		var finaljson = {};
		finaljson.items = [];
		
		for (var i in templates){
			var obj = {};
			obj.id = i;
			obj.name = templates[i].name;
			obj.description = templates[i].description;
			finaljson.items[finaljson.items.length] = obj
		}
		
		finaljson.size = finaljson.items.length;
		
		$("#list_container").hide();
		$("#list_container").html(sdata.html.Template.render("list_container_template",finaljson));
		
		if ($("#list_container").height() > 250){
			$("#list_container").css("height","250px");
		}
		
		$("#list_container").show();
		
		$(".template_delete").bind("click", function(ev){
		
			var todelete = this.id.split("_")[2];
			
			var newobj = {};
			for (var i in mytemplates){
				if (i != todelete){
					newobj[i] = mytemplates[i];
				}
			}
			
			sdata.widgets.WidgetPreference.save("/sdata/p/_templates/pages", "configuration", sdata.JSON.stringify(newobj), function(success){});
			
			sdata.Ajax.request({
		     	url :"/sdata/p/_templates/pages/" + todelete,
		     	httpMethod : "DELETE",
				onSuccess : function(data) {},
				onFail : function(data){}
			});
			
			renderTemplates(newobj);
		});
		
		$(".page_template_selection").bind("click", function(ev){
			var toload = this.id.split("_")[3];
			sdata.Ajax.request({
		     	url :"/sdata/p/_templates/pages/" + toload + "/content?sid=" + Math.random(),
		     	httpMethod : "GET",
				onSuccess : function(data) {
					$("#select_template_for_page").jqmHide();
					createNewPage(data);
				},
				onFail : function(data){}
			});
		});
		
	}

	$("#select_template_for_page").jqm({
		modal: true,
		trigger: $('#option_page_from_template'),
		overlay: 20,
		toTop: true,
		onShow: loadTemplates
	});
	
	
	/*
		Revision history 
	*/

	$("#more_revision_history").bind("click", function(ev){
		$("#content_page_options").hide();
		$("#revision_history_container").show();
		$("#more_menu").hide();
		sdata.Ajax.request({
		   	url :"/sdata/f/" + currentsite.id + "/_pages/"+ selectedpage.split("/").join("/_pages/") + "/content?f=vh&sid=" + Math.random(),
		    httpMethod : "GET",
			onSuccess : function(data) {
				var history = eval('(' + data + ')');
				
				// Get list of user profiles of updaters
				
				var tofind = [];
				for (var i = history.versions.length - 1; i >= 0; i--){
					if (history.versions[i].items["jcr:frozenNode"].properties["jcr:modifiedBy"]){
						 var username = history.versions[i].items["jcr:frozenNode"].properties["jcr:modifiedBy"];
						 var exists = false;
						 for (i in tofind){
						 	if (i == username){
								exists = true;
							}
						 }
						 if (!exists){
						 	tofind[tofind.length] = username;
						 }
					}
				}
				
				var searchstring = tofind.join(",");
				
				sdata.Ajax.request({
				   	url :"/rest/me/" + searchstring,
				    httpMethod : "GET",
					onSuccess : function(data) {
						
						var result = eval('(' + data + ')');
						var userDatabase = [];
						if (result.users) {
							for (var i = 0; i < result.users.length; i++) {
								var userid = (result.users[i].userStoragePrefix.split("/")[result.users[i].userStoragePrefix.split("/").length - 2]);
								userDatabase[userid] = result.users[i].profile.firstName + " " + result.users[i].profile.lastName;
							}
						}
						
						// Populate the select box
				
						var select = $("#revision_history_list").get(0);
						
						$(select).unbind("change",changeVersionPreview);
						
						select.options.length = 0;
						for (var i = history.versions.length - 1; i >= 1; i--){
							var name = "Version " + (i);
							
							// Transform date
							
							var date = history.versions[i].properties["jcr:created"];
							var datestring = transformDate(date["date"],date["month"],date["year"],date["hours"],date["minutes"]);
							
							name += " - " + datestring;
						
							if (history.versions[i].items["jcr:frozenNode"].properties["jcr:modifiedBy"]){
								 name += " - " + userDatabase[history.versions[i].items["jcr:frozenNode"].properties["jcr:modifiedBy"]];
							}
							var id = history.versions[i].name;
							var option = new Option(name,id);
							select.options[select.options.length] = option;
							
							$(select).bind("change",changeVersionPreview);
							
						}

					},
					onFail : function(data) {
						alert("An error has occured");	
					}
				});
			
			},
			onFail : function(data){
				alert("An error has occured");
			}
		});
	});
	
	$("#revision_history_cancel").bind("click", function(ev){
		resetVersionHistory();
	});
	
	$("#revision_history_revert").bind("click", function(ev){
		var select = $("#revision_history_list").get(0);
		var version = select.options[select.selectedIndex].value;
		sdata.Ajax.request({
		   	url :"/sdata/f/" + currentsite.id + "/_pages/"+ selectedpage.split("/").join("/_pages/") + "/content?v=" + version,
		    httpMethod : "GET",
			onSuccess : function(data) {
				
				$("#" + escapePageId(selectedpage)).html(data);
				sdata.widgets.WidgetLoader.insertWidgetsAdvanced(selectedpage.replace(/ /g, "%20"));
				
				// Save new version of this page
				
				var newfolderpath = currentsite.id + "/_pages/"+ selectedpage.split("/").join("/_pages/");
				
				sdata.widgets.WidgetPreference.save("/sdata/f/" + newfolderpath, "content", data, function(){
									
					// Check in the page
					sdata.Ajax.request({
						url: "/sdata/f/" + newfolderpath + "/content?f=ci",
						httpMethod: 'POST',
						onSuccess: function(data){},
						onFail: function(data){}
					});
							
				}, null, "x-sakai-page");
				
				pagecontents[selectedpage] = data;
				
				resetVersionHistory();
				
			},
			onFail : function(data){
				alert("An error has occured");
			}
		});
	});
	
	var changeVersionPreview = function(){
		var select = $("#revision_history_list").get(0);
		var version = select.options[select.selectedIndex].value;
		sdata.Ajax.request({
		   	url :"/sdata/f/" + currentsite.id + "/_pages/"+ selectedpage.split("/").join("/_pages/") + "/content?v=" + version,
		    httpMethod : "GET",
			onSuccess : function(data) {
				$("#" + escapePageId(selectedpage)).html(data);
				sdata.widgets.WidgetLoader.insertWidgetsAdvanced(selectedpage.replace(/ /g, "%20"));
			},
			onFail : function(data){
				alert("An error has occured");
			}
		});
	};
	
	var resetVersionHistory = function(){
		try {
			if (selectedpage) {
				$("#revision_history_container").hide();
				$("#content_page_options").show();
				$("#" + escapePageId(selectedpage)).html(pagecontents[selectedpage]);
				sdata.widgets.WidgetLoader.insertWidgetsAdvanced(selectedpage.replace(/ /g, "%20"));
			}
		} catch (err){
			// Ignore	
		}
	};
	
	var transformDate = function(day, month, year, hour, minute){
		var string = "";
		var smonth = "Jan";
		if (month == 1){
			smonth = "Feb";
		} else if (month == 2){
			smonth = "Mar";
		} else if (month == 3){
			smonth = "Apr";
		} else if (month == 4){
			smonth = "May";
		} else if (month == 5){
			smonth = "Jun";
		} else if (month == 6){
			smonth = "Jul";
		} else if (month == 7){
			smonth = "Aug";
		} else if (month == 8){
			smonth = "Sep";
		} else if (month == 9){
			smonth = "Oct";
		} else if (month == 10){
			smonth = "Nov";
		} else if (month == 11){
			smonth = "Dec";
		}
		string += smonth + " " + day + ", " + (1900 + year);
		string += " ";
		if (hour < 10) {
			hour = "0" + hour;
		} 
		string += hour + ":";
		if (minute < 10){
			minute = "0" + minute;
		}
		string +=  minute;
		return string;
	};
	
	
	/*
		Save to the list of recent sites, displayed in the top navigation header 
	*/
	
	var saveToRecentSites = function(response){
		
		sdata.Ajax.request({
		   	url :"/sdata/p/recentsites.json?sid=" + Math.random(),
		    httpMethod : "GET",
			onSuccess : function(data) {
				var items = $.evalJSON(data);
				transformRecentSitesList(items, response);
			},
			onFail : function(data){
				transformRecentSitesList({"items":[]}, response);
			}
		});
		
	};
	
	var transformRecentSitesList = function(items, response){
		
		var site = $.evalJSON(response).location.substring(1);
		//Filter out this site
		var index = -1;
		for (var i = 0; i < items.items.length; i++){
			if (items.items[i] == site){
				index = i;
			}
		}
		if (index > -1){
			items.items.splice(index,1);
		}
		items.items.unshift(site);
		items.items = items.items.splice(0,5);
		writeRecentSiteList(items);
		
	};

	var writeRecentSiteList = function(items){
		
		sdata.widgets.WidgetPreference.save("/sdata/p/", "recentsites.json", sdata.JSON.stringify(items), function(success){});
		
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
		try {
			placeToolbar();
		} catch (err){
			// Ignore
		}
		//setTimeout(placeToolbar, 100);
	});
	
	/*
		Load functions 
	*/
	
	loadCurrentSiteObject();
	fillInsertMoreDropdown();
	
};

sdata.container.registerForLoad("sakai.site");