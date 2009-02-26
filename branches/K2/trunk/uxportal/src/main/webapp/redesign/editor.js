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
					
					startSiteLoad();
					
				}
			});
			
		}
	}
	
	
	/*
		Page Loading 
	*/
	
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
	
	sakai.site.openPage = function(pageid){
		History.addBEvent(pageid);
	}
	
	sakai.site.openPageH = function(pageid){
	
		if (!pageid) {
			for (var i = 0; i < pages.items.length; i++) {
				if (pages.items[i].top) {
					pageid = pages.items[i].id;
					break;
				}
			}
		}
		
		$("#loginLink").attr("href","/dev/index.html?url=" + sdata.util.URL.encode(document.location.pathname + document.location.search + document.location.hash));
		
		//sakai.dashboard.hidepopup();
		$("#webpage_edit").hide();
		$("#dashboard_edit").hide();
		$("#tool_edit").hide();
		selectedpage = pageid;
		
		pages.selected = pageid;
		//document.getElementById("sidebar-content-pages").innerHTML = sdata.html.Template.render("menu_template", pages);
		
		
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
		
		var el = document.getElementById("main-content-div");
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
			sdata.widgets.WidgetLoader.insertWidgetsAdvanced(selectedpage.replace(/ /g, "%20"));
			
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
		if (!myCustomInitInstanced) {
			$($(".mceExternalToolbar").get(0)).remove();	
		}
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
			var el = $(".mceExternalToolbar");
			el.parent().appendTo(".mceToolbarExternal");
			el.show();
			el.css("position", "static");
			el.css("border", "0px solid black");
			$(".mceExternalClose").hide();
			showBar(1);
			setTimeout("sakai._site.setIframeHeight('elm1_ifr')", 100);
			placeToolbar();
			if (!myCustomInitInstanced) {
				$(".mceToolbarEnd").before(sdata.html.Template.render("editor_extra_buttons", {}));
			}
			
		} 
		catch (err) {
		
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
		var iframeWin = window.frames[1];
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
		mode: "textareas",
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
		content_css: "css/fluid.reset.css,css/fluid.theme.mist.css,css/fluid.theme.hc.css,css/fluid.theme.rust.css,css/fluid.layout.css,css/fluid.text.css,sakai_css/sakai.core.2.css,sakai_css/sakai.css",
		
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
		Local event handlers 
	*/
	
	$("#edit_page").bind("click", function(ev){
		$("#show_view_container").hide();
		$("#edit_view_container").show();
		myCustomInitInstance();
		myCustomInitInstanced = true;
		
		return false;
	});
	
	$(".cancel-button").bind("click", function(ev){
		$("#edit_view_container").hide();
		$("#show_view_container").show();
	});
	
	
	/*
		Global event listeners
	*/
	
	$(window).bind("resize", function(){
		$("#toolbarcontainer").css("width", $("#toolbarplaceholder").width() + "px");
	});
	
	$(window).bind("scroll", function(e){
		var time = new Date().getTime();
		if (time < last + 500) {
			return;
		}
		setTimeout(placeToolbar, 100);
	});
	
	
	/*
		Load functions 
	*/
	
	loadCurrentSiteObject();
	
}

sdata.registerForLoad("sakai.site");