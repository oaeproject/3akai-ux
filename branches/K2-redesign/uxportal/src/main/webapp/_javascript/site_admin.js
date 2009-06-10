/*global $, Config, History, Querystring, sdata, sakai, tinyMCE, tinymce  */

sakai.site.site_admin = function(){
	
	//---------------------------------------------------------------------------------
	//	tinyMCE functions
	//---------------------------------------------------------------------------------
	
	/**
	 * Initialise tinyMCE
	 * @return void
	 */
	function init_tinyMCE() {
		// Init tinyMCE
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
		init_instance_callback: "sakai._site.startEditPage",
		
		// Example content CSS (should be your site CSS)
		//content_css: "style.css",
		content_css: "/dev/_css/FSS/fluid.reset.css,/dev/_css/FSS/fluid.theme.mist.css,/dev/_css/FSS/fluid.theme.hc.css,/dev/_css/FSS/fluid.theme.rust.css,/dev/_css/FSS/fluid.layout.css,/dev/_css/FSS/fluid.text.css,/dev/_css/Sakai%20CSS/sakai.core.2.css,/dev/_css/Sakai%20CSS/sakai.css,/dev/_css/Sakai%20CSS/sakai.editor.css",
		
		// Drop lists for link/image/media/template dialogs
		template_external_list_url: "lists/template_list.js",
		external_link_list_url: "lists/link_list.js",
		external_image_list_url: "lists/image_list.js",
		media_external_list_url: "lists/media_list.js"
		});
		
		console.log('site2_admin.js: tinyMCE init started');
	}
	
	/**
	 * Show a custom tinyMCE toolbar
	 * @param {String} id
	 * @return void
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
	
	
	/**
	 * tinyMCE custom init instance - create custom toolbar
	 * @return void
	 */
	var myCustomInitInstance = function(){
		try {
			$("#elm1_ifr").css({'overflow':'hidden', 'height':'auto'});
			$("#elm1_ifr").attr({'scrolling':'no','frameborder':'0'});
			
			if (!sakai._site.myCustomInitInstanced) {
				$(".mceToolbarEnd").before($.Template.render("editor_extra_buttons", {}));
				
				$(".insert_more_dropdown_activator").bind("click", function(ev){ toggleInsertMore(); });
			}
			
			$(".mceExternalToolbar").parent().appendTo(".mceToolbarExternal");
			$(".mceExternalToolbar").show().css({"position":"static", 'border':'0px solid black'});
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
	
	
	/**
	 * Set iFrame height
	 * @param {String} ifrm
	 * @return void
	 */
	sakai._site.setIframeHeight = function(ifrm){
		var iframeWin = window.frames[0];
		var iframeEl = document.getElementById ? document.getElementById(ifrm) : document.all ? document.all[ifrm] : null;
		if (iframeEl && iframeWin) {
			if (BrowserDetect.browser != "Firefox") {
				iframeEl.style.height = "auto";
			}
			var docHt = sakai._site.getDocHeight(iframeWin.document);
			if (docHt < sakai._site.minHeight) {
				docHt = sakai._site.minHeight;
			}
			if (docHt && sakai._site.cur != docHt) {
				iframeEl.style.height = docHt + 30 + "px"; // add to height to be sure it will all show
				sakai._site.cur = (docHt + 30);
				$("#placeholderforeditor").css("height", docHt + 60 + "px");
				window.scrollTo(0, sakai._site.curScroll);
				placeToolbar();
			}
		}
	};
	
	
	/**
	 * tinyMCE event handler - initialise page offset and set frame height
	 * @param {Object} e
	 * @return {Boolean} true for continue event
	 */
	sakai._site.myHandleEvent = function(e){
		if (e.type == "click" || e.type == "keyup" || e.type == "mouseup" || !e || !e.type) {
			sakai._site.curScroll = document.body.scrollTop;
			
			if (sakai._site.curScroll === 0) {
				if (window.pageYOffset) {
					sakai._site.curScroll = window.pageYOffset;
				} else {
					sakai._site.curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
				}
			}
			sakai._site.setIframeHeight("elm1_ifr");
		}
		return true; // Continue handling
	};
	
	
	/**
	 * tinyMCE selection event handler
	 * @retun void
	 */
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
	
	
	/**
	 * Place tinyMCE toolbar
	 * @return void
	 */
	var placeToolbar = function(){
		sakai._site.minTop = $("#toolbarplaceholder").position().top;
		sakai._site.curScroll = document.body.scrollTop;
		if (sakai._site.curScroll === 0) {
			if (window.pageYOffset) {
				sakai._site.curScroll = window.pageYOffset;
			} else {
				sakai._site.curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
			}
		}
		var barTop = sakai._site.curScroll;
		$("#toolbarcontainer").css("width", ($("#toolbarplaceholder").width() - 2) + "px");
		if (barTop <= sakai._site.minTop) {
			$("#toolbarcontainer").css({"position":"absolute", "margin-top":"10px", "top": sakai._site.minTop + "px"});
			placeInserMoreDropdown("absolute",10,sakai._site.minTop);
		}
		else {
			if (BrowserDetect.browser == "Explorer" && BrowserDetect.version == 6) {
				$("#toolbarcontainer").css({"position":"absolute", "margin-top":"0px", "top": barTop + "px"});
				placeInserMoreDropdown("absolute",0,barTop);
			}
			else {
				$("#toolbarcontainer").css({"position":"fixed", "margin-top":"0px","top":"0px"});
				placeInserMoreDropdown("fixed",0,0);
			}
		}
		sakai._site.last = new Date().getTime();
	};
	
	
	/**
	 * Place Insert More dropdown
	 * @param {Int} position
	 * @param {String} marginTop
	 * @param {Int} top
	 * @return void
	 */
	var placeInserMoreDropdown = function(position,marginTop,top){
		$("#insert_more_menu").css({"position":position, "margin-top":marginTop + "px", "top":(top + 25) + "px"});
		$("#insert_more_menu").css("left",$("#insert_more_dropdown_main").position().left + $("#toolbarcontainer").position().left + 1 + "px");
	};
	
	
	/**
	 * Toggle Insert more dropdown
	 * @return void
	 */
	var toggleInsertMore = function(){
		if (sakai._site.showingInsertMore){
			$("#insert_more_menu").hide();
			sakai._site.showingInsertMore = false;	
		} else {
			$("#insert_more_menu").show();
			sakai._site.showingInsertMore = true;
		}
	};
	
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Edit page functionality
	//---------------------------------------------------------------------------------
	
	/**
	 * Edit a page defined by its page ID
	 * @param {String} pageid
	 * @return void
	 */
	function editPage(pageid){

		var el = $("#main-content-div");
		var escaped = sakai._site.escapePageId(pageid);
		var hasopened = false;
		
		sakai._site.inEditView = true;
		$("#more_menu").hide();
		
		try {
			$("#" + escaped).html("");
		} catch (error1){}
		
		
		for (var i = 0, j = el.children.length; i<j; i++) {
			try {
				if (el.children[i] && el.children[i].style) {
					el.children[i].style.display = "none";
				}
			} 
			catch (error2) {
			}
		}
		//$("#webpage_edit").hide();0

		var pagetitle = "";
				
		for (i = 0; i < sakai._site.pages.items.length; i++){
			if (sakai._site.pages.items[i].id == sakai._site.selectedpage){
				pagetitle = sakai._site.pages.items[i].title;
				break;
			}
		}
		if (pageid == "_navigation"){
			$("#title-input-container").hide();
			sakai._site.isEditingNavigation = true;
		} else {
			$("#title-input-container").show();
			sakai._site.isEditingNavigation = false;
		}
		
		// Generate the page location
		showPageLocation();
		
		$(".title-input").val(pagetitle);

		try {
			tinyMCE.get("elm1").setContent("");
				
			var content = sakai._site.pagecontents[pageid];
			var content2 = sakai._site.pagecontents[pageid];
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
		sakai._site.myCustomInitInstanced = true;
		$("#show_view_container").hide();
		$("#edit_view_container").show();
		
		var newpath = sakai._site.selectedpage.split("/").join("/_pages/");
		fluid.log("edit:  /sdata/f/" + sakai._site.currentsite.id + "/_pages/" + newpath + "/_content");
		$.ajax({
			url: "/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + newpath + "/_content",
			cache: false,
			success: function(data){
				sakai._site.autosavecontent = data;
				$('#autosave_dialog').jqmShow();
			},
			error: function(data){	
				sakai._site.timeoutid = setInterval(sakai._site.doAutosave, sakai._site.autosaveinterval);
			}
		});	
	}
	
	
	/**
	 * Show page location
	 * @return void
	 */
	var showPageLocation = function(){
		var finaljson = {};
		finaljson.pages = [];
		finaljson.pages[0] = sakai._site.currentsite.name;
		var splitted = sakai._site.selectedpage.split('/');
		var current = "";
		for (var i = 0, j = splitted.length; i<j; i++){
			var id = splitted[i];
			if (i !== 0){
				current += "/";
			}
			current += id;
			var idtofind = current;
			
			for (var ii = 0; ii < sakai._site.pages.items.length; ii++){
				if (sakai._site.pages.items[ii].id == idtofind){
					finaljson.pages[finaljson.pages.length] = sakai._site.pages.items[ii].title;
				}
			}
		}
		finaljson.total = finaljson.pages.length;
		$("#new_page_path").html($.Template.render("new_page_path_template",finaljson));
		
		$("#move_inside_edit").bind("click", function(ev){
			moveInsideEdit();
		});
		
	};
	
	
	//---------------------------------------------------------------------------------
	//	Delete page functionality
	//---------------------------------------------------------------------------------
	
	// Init delete dialogue modal
	$('#delete_dialog').jqm({
		modal: true,
		trigger: $('.delete_dialog'),
		overlay: 20,
		toTop: true
	});
	
	// Bind delete page click event
	$("#more_delete").bind("click", function(){
		$('#delete_dialog').jqmShow();
	});
	
	// Bind delete page confirmation click event
	$("#delete_confirm").bind("click", function(){
		var newpath = sakai._site.selectedpage.split("/").join("/_pages/");
		$.ajax({
			url: "/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + newpath,
			type: 'DELETE',
			success: function(data){
				
				// Save the new page configuration
				
				var index = -1;
				for (var i = 0; i < sakai._site.pages.items.length; i++){
					if (sakai._site.pages.items[i].id == sakai._site.selectedpage){
						index = i;
					}
				}
				
				sakai._site.pages.items.splice(index, 1);
				
				sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/.site", "pageconfiguration", $.toJSON(sakai._site.pages), function(success){
				
					document.location = "/dev/site.html?siteid=" + sakai._site.currentsite.id;
				
				});
				
			},
			error: function(data){	
				
				// Save the new page configuration
				
				var index = -1;
				for (var i = 0; i < sakai._site.pages.items.length; i++){
					if (sakai._site.pages.items[i].id == sakai._site.selectedpage){
						index = i;
					}
				}
				
				sakai._site.pages.items.splice(index, 1);
				
				sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/.site", "pageconfiguration", $.toJSON(sakai._site.pages), function(success){
				
					document.location = "/dev/site.html?siteid=" + sakai._site.currentsite.id;
				
				});
				
			}
		});
	});
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Auto save functionality
	//---------------------------------------------------------------------------------
	
	/**
	 * Hide Autosave
	 * @param {Object} hash
	 * @return void
	 */
	var hideAutosave = function(hash){
		hash.w.hide();
		hash.o.remove();
		sakai._site.timeoutid = setInterval(sakai._site.doAutosave, sakai._site.autosaveinterval);
		removeAutoSaveFile();
	};
	
	
	// Bind autosave click
	$("#autosave_revert").bind("click", function(ev){
		tinyMCE.get("elm1").setContent(sakai._site.autosavecontent);
		$('#autosave_dialog').jqmHide();
	});
	
	
	// Init autosave dialogue modal
	$('#autosave_dialog').jqm({
		modal: true,
		trigger: $('.autosave_dialog'),
		overlay: 20,
		toTop: true,
		//onShow: renderAutosave,
		onHide: hideAutosave
	});
	
	
	/**
	 * Autosave functionality
	 * @return void
	 */
	sakai._site.doAutosave = function(){
		
		// Determine the view we're in
		
		var tosave = "";
		
		if (!sakai._site.currentEditView){
			tosave = tinyMCE.get("elm1").getContent();
		} else if (sakai._site.currentEditView == "html"){
			tosave = $("#html-editor-content").val();
		}
		
		// Save the data
		
		var newurl = sakai._site.selectedpage.split("/").join("/_pages/");
		sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + newurl, "_content", tosave, function(){}, null, "x-sakai-page");

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
	
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Local event handlers
	//---------------------------------------------------------------------------------
	
	// Bind edit sidebar click
	$("#edit_sidebar").bind("click", function(ev){
		editPage("_navigation");
		return false;
	});
	
	
	/**
	 * Remove autosave file from JCR
	 * @return void
	 */
	var removeAutoSaveFile = function(){
		// Remove autosave file
		
		var newpath = sakai._site.selectedpage.split("/").join("/_pages/");
		$.ajax({
			url: "/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + newpath + "/_content",
			type: 'DELETE'
		});
		
	};
	
	// Bind cancel button click
	$(".cancel-button").bind("click", function(ev){
		
		clearInterval(sakai._site.timeoutid);
		
		$("#insert_more_menu").hide();
		$("#context_menu").hide();
		sakai._site.showingInsertMore = false;	
		sakai._site.inEditView = false;

		removeAutoSaveFile();
		
		if (sakai._site.isEditingNewPage) {
		
			// Delete page from configuration file
			
			var index = -1;
			for (var i = 0; i < sakai._site.pages.items.length; i++){
				if (sakai._site.pages.items[i].id == sakai._site.selectedpage){
					index = i;
				}
			}
			
			sakai._site.pages.items.splice(index,1);
			
			// Save configuration file
			
			sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/.site", "pageconfiguration", $.toJSON(sakai._site.pages), function(success){
	
				// Go back to view mode of previous page
				
				var escaped = sakai._site.oldSelectedPage.replace(/ /g, "%20");
				document.getElementById(escaped).innerHTML = sakai._site.pagecontents[sakai._site.oldSelectedPage];
				if (sakai._site.pagetypes[sakai._site.oldSelectedPage] == "webpage") {
					$("#webpage_edit").show();
				}
				document.getElementById(sakai._site.oldSelectedPage).style.display = "block";
				sdata.widgets.WidgetLoader.insertWidgets(sakai._site.oldSelectedPage);
				
				sakai._site.selectedpage = sakai._site.oldSelectedPage;
			
				$("#edit_view_container").hide();
				$("#show_view_container").show();
			
				// Delete the folder that has been created for the new page	
			
				var newpath = sakai._site.selectedpage.split("/").join("/_pages/");
				$.ajax({
					url: "/sdata/f/" + sakai._site.currentsite.id + "/" + newpath,
					type: 'DELETE'
				});
			});
	
		
		} else {
		
			resetView();
			
			var escaped = sakai._site.selectedpage.replace(/ /g, "%20");
			document.getElementById(escaped).innerHTML = sakai._site.pagecontents[sakai._site.selectedpage];
			if (sakai._site.pagetypes[sakai._site.selectedpage] == "webpage") {
				$("#webpage_edit").show();
			}
			document.getElementById(escaped).style.display = "block";
			sdata.widgets.WidgetLoader.insertWidgets(escaped);
			
			$("#edit_view_container").hide();
			$("#show_view_container").show();
			
		}
	});
	
	
	// Bind Save button click
	$(".save_button").bind("click", function(ev){
		
		clearInterval(sakai._site.timeoutid);
		$("#context_menu").hide();
		
		removeAutoSaveFile();
		
		$("#insert_more_menu").hide();
		sakai._site.showingInsertMore = false;	
		
		resetView();
		
		if (sakai._site.isEditingNavigation){
			
			// Navigation
			
			sakai._site.pagecontents._navigation = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
			$("#page_nav_content").html(sakai._site.pagecontents._navigation);
			
			var escaped = sakai._site.selectedpage.replace(/ /g, "%20");
			document.getElementById(escaped).style.display = "block";
			
			$("#edit_view_container").hide();
			$("#show_view_container").show();
			
			sdata.widgets.WidgetLoader.insertWidgets("page_nav_content");
			sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/_navigation", "content", sakai._site.pagecontents._navigation, function(){});
			
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
			for (i = 0; i < sakai._site.pages.items.length; i++){
				if (sakai._site.pages.items[i].id == sakai._site.selectedpage){
					oldpagetitle = sakai._site.pages.items[i].title;
				}
			}
			
			if (oldpagetitle.toLowerCase() != newpagetitle.toLowerCase()  || (sakai._site.inEditView !== false && sakai._site.inEditView !== true)){
				
				// Generate new page id
				
				var newid = "";
				var counter = 0;
				var baseid = newpagetitle.toLowerCase();
				baseid = baseid.replace(/ /g,"-");
				baseid = baseid.replace(/[:]/g,"-");
				baseid = baseid.replace(/[?]/g,"-");
				baseid = baseid.replace(/[=]/g,"-");
				var basefolder = "";
				if (sakai._site.inEditView !== false && sakai._site.inEditView !== true){
					var abasefolder = sakai._site.inEditView.split("/");
					for (i = 0; i < abasefolder.length - 1; i++){
						basefolder += abasefolder[i] + "/";
					}
				} else {
					var abasefolder2 = sakai._site.selectedpage.split("/");
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
					for (i = 0; i < sakai._site.pages.items.length; i++){
						if (sakai._site.pages.items[i].id == testid){
							exists = true;
						}
					}
					if (!exists){
						newid = testid;
					}
				}
				
				for (i = 0; i < sakai._site.pages.items.length; i++){
					if (sakai._site.pages.items[i].id == sakai._site.selectedpage){
						sakai._site.pages.items[i].id = newid;
						sakai._site.pages.items[i].title = newpagetitle;
						break;
					}
				}
				
				// Move page folder to this new id
				
				var oldfolderpath = "/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + sakai._site.selectedpage.split("/").join("/_pages/");
				var newfolderpath = "/" + sakai._site.currentsite.id + "/_pages/" + newid.split("/").join("/_pages/");
				
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
				
						var idtostartwith = sakai._site.selectedpage + "/";
						for (var i = 0; i < sakai._site.pages.items.length; i++){
							if (sakai._site.pages.items[i].id.substring(0,idtostartwith.length) == idtostartwith){
								sakai._site.pages.items[i].id = newid + "/" + sakai._site.pages.items[i].id.substring(idtostartwith.length);
							}
						}
				
						// Adjust configuration file
						
						sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/.site", "pageconfiguration", $.toJSON(sakai._site.pages), function(success){
							
							// Render the new page under the new URL
							
								// Save page content
								
								var content = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
								sdata.widgets.WidgetPreference.save("/sdata/f" + newfolderpath, "content", content, function(){
									
									// Remove old div + potential new one
								
									$("#" + sakai._site.escapePageId(sakai._site.selectedpage)).remove();
									$("#" + sakai._site.escapePageId(newid)).remove();
								
									// Remove old + new from sakai._site.pagecontents array 
									
									sakai._site.pagecontents[sakai._site.selectedpage] = null;
									sakai._site.pagecontents[newid] = null;
									
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
				
						var idtostartwith = sakai._site.selectedpage + "/";
						for (var i = 0, j = sakai._site.pages.items.length; i<j; i++){
							if (sakai._site.pages.items[i].id.substring(0,idtostartwith.length) == idtostartwith){
								sakai._site.pages.items[i].id = newid + "/" + sakai._site.pages.items[i].id.substring(idtostartwith.length);
							}
						}
				
						// Adjust configuration file
						
						sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/.site", "pageconfiguration", $.toJSON(sakai._site.pages), function(success){
							
							// Render the new page under the new URL
							
								// Save page content
								
								var content = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
								sdata.widgets.WidgetPreference.save("/sdata/f" + newfolderpath, "content", content, function(){
									
									// Remove old div + potential new one
								
									$("#" + sakai._site.escapePageId(sakai._site.selectedpage)).remove();
									$("#" + sakai._site.escapePageId(newid)).remove();
								
									// Remove old + new from sakai._site.pagecontents array 
									
									sakai._site.pagecontents[sakai._site.selectedpage] = null;
									sakai._site.pagecontents[newid] = null;
									
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
				
				if (sakai._site.isEditingNewPage) {
					
					// Save page content
								
					var content = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
					var newurl = sakai._site.selectedpage.split("/").join("/_pages/");
					sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + newurl, "content", content, function(){
							
						// Remove old div + potential new one
								
						$("#" + sakai._site.escapePageId(sakai._site.selectedpage)).remove();
								
						// Remove old + new from sakai._site.pagecontents array 
									
						sakai._site.pagecontents[sakai._site.selectedpage] = null;
									
						// Switch the History thing
									
						sakai.site.openPage(sakai._site.selectedpage);
						$("#edit_view_container").hide();
						$("#show_view_container").show();
						
						// Check in the page
						$.ajax({
							url: "/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + newurl + "/content?f=ci",
							type: 'POST'
						});
									
					}, null, "x-sakai-page");					
					
				}
				else {
				
					if (sakai._site.pagetypes[sakai._site.selectedpage] == "webpage") {
						$("#webpage_edit").show();
					}
					
					escaped = sakai._site.selectedpage.replace(/ /g, "%20");
					sakai._site.pagecontents[sakai._site.selectedpage] = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
					
				
					document.getElementById(escaped).innerHTML = sakai._site.pagecontents[sakai._site.selectedpage];
				
					$("#edit_view_container").hide();
					$("#show_view_container").show();
					
					els = $("a", $("#" + escaped));
					for (i = 0, j = els.length; i<j; i++) {
						nel = els[i];
						/*
						if (nel.className == "contauthlink") {
							nel.href = "#" + nel.href.split("/")[nel.href.split("/").length - 1];
						}
						*/
					}
					
					document.getElementById(escaped).style.display = "block";
					sdata.widgets.WidgetLoader.insertWidgets(escaped);
					newurl = sakai._site.selectedpage.split("/").join("/_pages/");
					sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + newurl, "content", sakai._site.pagecontents[sakai._site.selectedpage], function(){
					
						// Check in the page
						$.ajax({
							url: "/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + newurl + "/content?f=ci",
							type: 'POST'
						});
					
					}, null, "x-sakai-page");
					
				}
			
			}
			
		}
		
		sakai._site.inEditView = false;
		
	});
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Context menu functions
	//---------------------------------------------------------------------------------
	
	// Bind Context Remove click event
	$("#context_remove").bind("click", function(ev){
		tinyMCE.get("elm1").execCommand('mceInsertContent', false, '');
	});
	
	
	// Bind Context Settings click event
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

				sakai._site.newwidget_id = type;
				
				$("#dialog_content").hide();
				
				if (Widgets.widgets[type]) {
				
					$('#insert_dialog').jqmShow(); 
					var nuid = "widget_" + type + "_" + uid + "_" + placement;
					sakai._site.newwidget_uid = nuid;
					$("#dialog_content").html('<img src="' + Widgets.widgets[type].img + '" id="' + nuid + '" class="widget_inline" border="1"/>');
					$("#dialog_title").text(Widgets.widgets[type].name);
					sdata.widgets.WidgetLoader.insertWidgets("dialog_content", true);
					$("#dialog_content").show();
					$("#insert_more_menu").hide();
					sakai._site.showingInsertMore = false;	
					
				}
			}
		}

		$("#context_menu").hide();
		
	});
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Tabs
	//---------------------------------------------------------------------------------
	
	// Bind Preview tab click event
	$("#tab_preview").bind("click", function(ev){
		$("#context_menu").hide();
		$("#tab-nav-panel").hide();
		$("#new_page_path").hide();
		$("#html-editor").hide();
		$("#page_preview_content").html("").show();
		if (!sakai._site.currentEditView) {
			switchtab("text_editor","Text Editor","preview","Preview");
		} else if (sakai._site.currentEditView == "html"){
			var value = $("#html-editor-content").val();
			tinyMCE.get("elm1").setContent(value);
			switchtab("html","HTML","preview","Preview");
		}
		$("#page_preview_content").html("<h1 style='padding-bottom:10px'>" + $("#title-input").val() + "</h1>" + tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/'));
		sdata.widgets.WidgetLoader.insertWidgets("page_preview_content");
		sakai._site.currentEditView = "preview";
	});
	
	// Bind Text Editor tab click event
	$("#tab_text_editor").bind("click", function(ev){
		switchToTextEditor();
	});
	
	// Bind HTML tab click event
	$("#tab_html").bind("click", function(ev){
		$("#context_menu").hide();
		$("#fl-tab-content-editor").hide();
		$("#toolbarplaceholder").hide();
		$("#toolbarcontainer").hide();
		if (!sakai._site.currentEditView){
			switchtab("text_editor","Text Editor","html","HTML");
		} else if (sakai._site.currentEditView == "preview"){
			$("#page_preview_content").hide().html("");
			$("#tab-nav-panel").show();
			$("#new_page_path").show();
			switchtab("preview","Preview","html","HTML");
		}
		var value = tinyMCE.get("elm1").getContent();
		$("#html-editor-content").val(value);
		$("#html-editor").show();
		sakai._site.currentEditView = "html";
	});
	
	
	/**
	 * Switch between tabs
	 * @param {String} inactiveid
	 * @param {String} inactivetext
	 * @param {String} activeid
	 * @param {String} activetext
	 * @return void
	 */
	var switchtab = function(inactiveid, inactivetext, activeid, activetext){
		$("#tab_" + inactiveid).removeClass("fl-activeTab").removeClass("tab-nav-selected").html('<a href="javascript:;">' + inactivetext + '</a>');
		$("#tab_" + activeid).addClass("fl-activeTab").addClass("tab-nav-selected").html('<span>' + activetext + '</span>');
	};
	
	/**
	 * Reset tab view
	 * @return void
	 */
	var resetView = function(){
		switchToTextEditor();
	};
	
	/**
	 * Switch to Text Editor tab
	 * @return void
	 */
	var switchToTextEditor = function(){
		$("#fl-tab-content-editor").show();
		$("#toolbarplaceholder").show();
		$("#toolbarcontainer").show();
		if (sakai._site.currentEditView == "preview"){
			$("#page_preview_content").hide().html("");
			$("#tab-nav-panel").show();
			$("#new_page_path").show();
			switchtab("preview","Preview","text_editor","Text Editor");
		} else if (sakai._site.currentEditView == "html"){
			var value = $("#html-editor-content").val();
			tinyMCE.get("elm1").setContent(value);
			$("#html-editor").hide();
			switchtab("html","HTML","text_editor","Text Editor");
		}
		sakai._site.currentEditView = false;
	};
	
	
	/**
	 * Moving inside page editing
	 * @return void
	 */
	var moveInsideEdit = function(){
		window.scrollTo(0,0);
		$('#move_dialog').jqmShow();
	};
	
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Context menu dropdown functionality
	//---------------------------------------------------------------------------------
	
	// Bind Context menu settings hover event
	$("#context_settings").hover(
		function(over){
			$("#context_settings").addClass("selected_option");
		}, 
		function(out){
			$("#context_settings").removeClass("selected_option");
		}
	);
	
	// Bind Context menu remove hover event
	$("#context_remove").hover(
		function(over){
			$("#context_remove").addClass("selected_option");
		}, 
		function(out){
			$("#context_remove").removeClass("selected_option");
		}
	);
	
	
	// Bind Context menu appereance hover event
	$("#context_appearance").hover(
		function(over){
			$("#context_appearance").addClass("selected_option");
		}, 
		function(out){
			$("#context_appearance").removeClass("selected_option");
		}
	);
	
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Insert more dropdown
	//---------------------------------------------------------------------------------
	
	// Bind Insert more hover event
	$(".more_option").hover(
		function(over){
			$(this).addClass("selected_option");
		}, 
		function(out){
			$(this).removeClass("selected_option");
		}
	);
	

	// Bind Insert horizontal line click event
	$("#horizontal_line_insert").bind("click", function(ev){
		tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<hr/>');
		toggleInsertMore();
	});
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Add in a selected widget
	//---------------------------------------------------------------------------------
	
	
	/**
	 * Render selected widget
	 * @param {Object} hash
	 * @return void
	 */
	var renderSelectedWidget = function(hash){
		
		toggleInsertMore();
		
		var widgetid = false;
		if (hash.t){
			widgetid = hash.t.id.split("_")[3];
		}
		$("#dialog_content").hide();
		
		if (Widgets.widgets[widgetid]){
			
			hash.w.show();
			
			sakai._site.newwidget_id = widgetid;
			var rnd = "id" + Math.round(Math.random() * 1000000000);
			var id = "widget_" + widgetid + "_" + rnd + "_" + sakai._site.currentsite.id + "/_widgets";
			sakai._site.newwidget_uid = id;
			$("#dialog_content").html('<img src="' + Widgets.widgets[widgetid].img + '" id="' + id + '" class="widget_inline" border="1"/>');
			$("#dialog_title").text(Widgets.widgets[widgetid].name);
			sdata.widgets.WidgetLoader.insertWidgets("dialog_content", true);
			$("#dialog_content").show();
			window.scrollTo(0,0);
			
		} else if (!widgetid){
			hash.w.show();
			window.scrollTo(0,0);
		}
		
	};
	
	
	/**
	 * Hide selected widget
	 * @param {Object} hash
	 * @return void
	 */
	var hideSelectedWidget = function(hash){
		hash.w.hide();
		hash.o.remove();
		sakai._site.newwidget_id = false;
		sakai._site.newwidget_uid = false;
		$("#dialog_content").html("").hide();
	};
	
	/**
	 * Insert widget modal Cancel button - hide modal
	 * @param {Object} tuid
	 * @retuen void
	 */
	sakai._site.widgetCancel = function(tuid){
		$('#insert_dialog').jqmHide(); 
	};
	
	
	/**
	 * Widget finish - add widget to editor, hide modal
	 * @param {Object} tuid
	 * @return void
	 */
	sakai._site.widgetFinish = function(tuid){
		// Add widget to the editor
		$("#insert_screen2_preview").html('');
		tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<img src="' + Widgets.widgets[sakai._site.newwidget_id].img + '" id="' + sakai._site.newwidget_uid + '" class="widget_inline" style="display:block; padding: 10px; margin: 4px" border="1"/>');

		$('#insert_dialog').jqmHide(); 
	};
	
	
	
	
		
	//---------------------------------------------------------------------------------
	//	Add new... functionality
	//---------------------------------------------------------------------------------
	
	// Bind Add a new... click event
	$("#add_a_new").bind("click", function(ev){
		if (sakai._site.isShowingDropdown){
			$("#add_new_menu").hide();
			sakai._site.isShowingDropdown = false;
		} else {
			$("#add_new_menu").show();
			sakai._site.isShowingDropdown = true;
		}
	});
	
	
	// Bind Add a new blank page hover event
	$("#option_blank_page").hover(
		function(over){
			$("#option_blank_page").addClass("selected_option");
		}, 
		function(out){
			$("#option_blank_page").removeClass("selected_option");
		}
	);
	
	
	// Bind Add a new page from template hover event
	$("#option_page_from_template").hover(
		function(over){
			$("#option_page_from_template").addClass("selected_option");
		}, 
		function(out){
			$("#option_page_from_template").removeClass("selected_option");
		}
	);
	
	
	// Bind Add a new page dashboard hover event
	$("#option_page_dashboard").hover(
		function(over){
			$("#option_page_dashboard").addClass("selected_option");
		}, 
		function(out){
			$("#option_page_dashboard").removeClass("selected_option");
		}
	);
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Add a blank page
	//---------------------------------------------------------------------------------
	
	// Bind Add a blank page click event
	$("#option_blank_page").bind("click", function(ev){
		resetVersionHistory();
		createNewPage("");
	});
	
	/**
	 * Create a new page
	 * @param {Object} content
	 * @return void
	 */
	var createNewPage = function(content){
		
		$("#add_new_menu").hide();
		sakai._site.isShowingDropdown = false;
		
		// Set new page flag
		sakai._site.isEditingNewPage = true;
		
		// Determine where to create the page
		var path = "";
		if (sakai._site.selectedpage){
			if (sakai._site.createChildPageByDefault){
				path = sakai._site.selectedpage + "/";
			} else {
				var splitted = sakai._site.selectedpage.split("/");
				for (var i = 0, j = splitted.length - 2; i<j; i++){
					path += splitted[i] + "/";
				}
			}
		} 
		
		// Determine new page id (untitled-x)
		var newid = false;
		var counter = 0;
		while (!newid){
			var totest = path + "untitled";
			if (counter !== 0){
				totest += "-" + counter;
			}
			counter++;
			var exists = false;
			for (i = 0, j = sakai._site.pages.items.length; i<j; i++){
				if (sakai._site.pages.items[i].id == totest){
					exists = true;
				}
			}
			if (!exists){
				newid = totest;
			}
		}
		
		// Post the page content ?
		
		// Assign the empty content to the sakai._site.pagecontents array
		sakai._site.pagecontents[newid] = content;
		
		// Change the configuration file
		var index = sakai._site.pages.items.length;
		sakai._site.pages.items[index] = {};
		sakai._site.pages.items[index].id = newid;
		sakai._site.pages.items[index].title = "Untitled";
		sakai._site.pages.items[index].type = "webpage";
		
		// Post the new configuration file
		sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/.site", "pageconfiguration", $.toJSON(sakai._site.pages), function(success){});
		
		// Pull up the edit view
		sakai._site.oldSelectedPage = sakai._site.selectedpage;
		sakai._site.selectedpage = newid;
		
		// Init tinyMCE if needed
		if (tinyMCE.activeEditor === null) { // Probably a more robust checking will be necessary
     		init_tinyMCE();
  		} else {
			editPage(newid);
		}
		
		
		// Show and hide appropriate things
		
		
		// Update navigation sidebar ??
		
	};
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Fill up Insert more dropdown
	//---------------------------------------------------------------------------------
	
	/**
	 * Fill insert more dropdown
	 * @return void
	 */
	var fillInsertMoreDropdown = function(){
		
		// Vars for media and goodies
		var media = {};
		media.items = [];
		var goodies = {};
		goodies.items = [];
		
		for (var i in Widgets.widgets){
			var widget = Widgets.widgets[i];
			if (widget.ca && widget.showinmedia){
				media.items[media.items.length] = widget;
			}
			if (widget.ca && widget.showinsakaigoodies){
				goodies.items[goodies.items.length] = widget;
			}
		}
		
		// Render insert more media template
		$("#insert_more_media").html($.Template.render("insert_more_media_template",media));
		
		// Render insertmore goodies template
		$("#insert_more_goodies").html($.Template.render("insert_more_goodies_template",goodies));
		
		// Event handler
		$('#insert_dialog').jqm({
			modal: true,
			trigger: $('.insert_more_widget'),
			overlay: 20,
			toTop: true,
			onShow: renderSelectedWidget,
			onHide: hideSelectedWidget
		});
	};
	
	
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Wrapping functionality
	//---------------------------------------------------------------------------------
	
	/**
	 * Show wrapping dialog
	 * @param {Object} hash
	 * @return void
	 */
	var showWrappingDialog = function(hash){
		$("#context_menu").hide();
		window.scrollTo(0,0);
		hash.w.show();
	};
	
	/**
	 * Create a new style
	 * @param {Object} toaddin
	 * @return void
	 */
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
			for (i = 0, j = selected.attributes.length; i<j; i++){
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
	};
	
	// Bind wrapping_no click event
	$("#wrapping_no").bind("click",function(ev){
		createNewStyle("display:block;");
		$('#wrapping_dialog').jqmHide();
	});
	
	// Bind wrapping left click event
	$("#wrapping_left").bind("click",function(ev){
		createNewStyle("display:block;float:left;");
		$('#wrapping_dialog').jqmHide();
	});
	
	// Bind wrapping right click event
	$("#wrapping_right").bind("click",function(ev){
		createNewStyle("display:block;float:right;");
		$('#wrapping_dialog').jqmHide();
	});
	
	// Init wrapping modal
	$('#wrapping_dialog').jqm({
			modal: true,
			trigger: $('#context_appearance_trigger'),
			overlay: 20,
			toTop: true,
			onShow: showWrappingDialog
		});
	
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Insert link
	//---------------------------------------------------------------------------------
	
	/**
	 * Create page hierarchy
	 * @param {Object} done
	 * @param {Object} object
	 * @param {Object} page
	 * return {Object} page hierarchy object
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
	};
	
	/**
	 * Create hierarchy html
	 * @param {Object} object
	 * @param {Object} key
	 * @param {Object} active
	 * @return {String} html string
	 */
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
		for (i in object){
			if (i != "_content"){
				html += createHTMLHierarchy(object[i],i,active);
			}
		}	
		if (size > 1){
			html += "</ul>";
		}	
		html += "</li>";
		return html;
	};
	
	
	/**
	 * Remove page structure
	 * @param {Object} hash
	 * @return void
	 */
	var removePageStructure = function(hash){
		hash.w.hide();
		hash.o.remove();
		$("#treeview_link_container").html("");
	};
	
	// Bind Insert link confirmation click event
	$("#insert_link_confirm").bind("click", function(ev){
		
		var chosen = false;
		try {
			chosen = simpleTreeCollection.get(0).getSelected().attr("id");
		} catch (err){
			alert("Insert Link: No chosen link.");
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
			for (var i = 0, j = sakai._site.pages.items.length; i<j; i++) {
				if (sakai._site.pages.items[i].id == chosen) {
					pagetitle = sakai._site.pages.items[i].title;
				}
			}
			editor.execCommand('mceInsertContent', false, '<a href="#' + chosen + '" class="contauthlink">' + pagetitle + '</a>');
		}
		
		$('#link_dialog').jqmHide();
	});
	
	/**
	 * Do page hierarchy
	 * @param {Object} active
	 * @return {String} page hierarchy html
	 */
	var doPageHierarchy = function(active){
		// Generate the structure
		var object = {};
		for (var i = 0, j = sakai._site.pages.items.length; i<j; i++){
			var page = sakai._site.pages.items[i];
			object = createHierarchy("", object, page);
		}
		
		// Generate the HTML
		var currentId = 2;
		var html = '<ul class="simpleTree"><li class="root" id="1"><span style="display:none">Tree Root 1</span><ul>';
		
		for (i in object){
			html += createHTMLHierarchy(object[i],i,active);
		}
		
		html += '</ul></li></ul>';
		
		return html;
	};
	
	
	/**
	 * Render page structure
	 * @param {Object} hash
	 * @return void
	 */
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
		sakai._site.showingInsertMore = false;
		hash.w.show();
	};
	
	// Init Insert link modal
	$('#link_dialog').jqm({
		modal: true,
		trigger: $('#link_dialog_trigger'),
		overlay: 20,
		toTop: true,
		onShow: renderPageStructure,
		onHide: removePageStructure
	});
	
	
	// Bind Insert Link click event 
	$("#more_link").bind("click", function(ev){
		var el = $("#more_menu");
		if (el.css("display").toLowerCase() != "none") {
			el.hide();
		} else {
			var x = $("#more_link").position().left;
			var y = $("#more_link").position().top;
			el.css({"top": y + 17 + "px", "left": x - el.width() + $("#more_link").width() + 5 + "px"}).show();
		}		
	});
		
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Move a page functionality
	//---------------------------------------------------------------------------------
	
	/**
	 * Render Move Page structure
	 * @param {Object} hash
	 * @return void
	 */
	var renderMovePageStructure = function(hash){
		var html = doPageHierarchy(sakai._site.selectedpage);
		
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
		$("#" + sakai._site.escapePageId(sakai._site.selectedpage)).find(">span").addClass("active");
		if (sakai._site.inEditView){
			$("#" + sakai._site.escapePageId(sakai._site.selectedpage)).find(">span").text($("#title-input").val());	
		}
	};
	
	
	/**
	 * Remove Move Page structure
	 * @param {Object} hash
	 * @return void
	 */
	var removeMovePageStructure = function(hash){
		hash.w.hide();
		hash.o.remove();
		$("#treeview_move_container").html("");
	};
	
	// Init Move Page modal
	$('#move_dialog').jqm({
		modal: true,
		trigger: $('.move_dialog_trigger'),
		overlay: 20,
		toTop: true,
		onShow: renderMovePageStructure,
		onHide: removeMovePageStructure
	});
	
	
	// Bind Move Page click event
	$("#move_page_confirm").bind("click", function(ev){
		
		// Generate new id
		
		var i,j,ii,jj = 0;
		var pageid = "";
		for (i = 0, j = sakai._site.pages.items.length; i<j; i++){
			if (sakai._site.pages.items[i].id == sakai._site.selectedpage){
				pageid = sakai._site.pages.items[i].id;
			}
		}
		pageid = pageid.split("/")[pageid.split("/").length - 1];
		
		var item = $("#" + sakai._site.escapePageId(sakai._site.selectedpage));
		var parent = item.parent().parent().attr("id");
		
		if (parent == "1"){
			parent = "";
		}
		
		var newid = false;
		var index = 0;
		var b_pages = sakai._site.clone(sakai._site.pages);
		var togoout = -1;
		for (i = 0, j = b_pages.items.length; i<j; i++){
			if (b_pages.items[i].id == sakai._site.selectedpage){
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
			if (index !== 0){
				totest += "-" + index;
			}
			var exists = false;
			for (i = 0, j = b_pages.items.length; i<j; i++){
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
		if (!sakai._site.inEditView) {
		
			var oldfolderpath = "/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + sakai._site.selectedpage.split("/").join("/_pages/");
			var newfolderpath = "/" + sakai._site.currentsite.id + "/_pages/" + newid.split("/").join("/_pages/");
			
			var data = {
				to: newfolderpath,
				f: "mv"
			};
			
			$.ajax({
				url: oldfolderpath,
				type: 'POST',
				data: data,
				success: function(data){
				
					// Rewrite configuration file	
					var parentEl = $(".root");
					var els = $("li", parentEl);
					
					var newpageconfig = {};
					newpageconfig.items = [];
					
					for (i = 0, j = els.length; i<j; i++) {
						if (els[i] && els[i].id) {
							for (ii = 0, jj = sakai._site.pages.items.length; ii<jj; ii++) {
								if (sakai._site.pages.items[ii].id == els[i].id) {
									var newindex = newpageconfig.items.length;
									newpageconfig.items[newindex] = sakai._site.pages.items[ii];
									if (sakai._site.pages.items[ii].id == sakai._site.selectedpage) {
										newpageconfig.items[newindex].id = newid;
									}
								}
							}
						}
					}
					
					sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/.site", "pageconfiguration", $.toJSON(newpageconfig), function(success){
						$(document.body).hide();
						document.location = "#" + newid;
						window.location.reload(true);
						$('#move_dialog').jqmHide();
					});
					
					
				},
				error: function(data){
					// Rewrite configuration file
					var parentEl = $(".root");
					var els = $("li", parentEl);
					
					var newpageconfig = {};
					newpageconfig.items = [];
					
					for (i = 0, j = els.length; i<j; i++) {
						if (els[i] && els[i].id) {
							for (ii = 0, jj = sakai._site.pages.items.length; ii<jj; ii++) {
								if (sakai._site.pages.items[ii].id == els[i].id) {
									var newindex = newpageconfig.items.length;
									newpageconfig.items[newindex] = sakai._site.pages.items[ii];
									if (sakai._site.pages.items[ii].id == sakai._site.selectedpage) {
										newpageconfig.items[newindex].id = newid;
									}
								}
							}
						}
					}
					
					sdata.widgets.WidgetPreference.save("/sdata/f/" + sakai._site.currentsite.id + "/.site", "pageconfiguration", $.toJSON(newpageconfig), function(success){
					
						$(document.body).hide();
						document.location = "#" + newid;
						window.location.reload(true);
						$('#move_dialog').jqmHide();
						
					});
					
				}
			});
			
		} else {
			sakai._site.inEditView = newid;
			$("#move_dialog").jqmHide();
			
			// Update the path shown
			var finaljson = {};
			finaljson.pages = [];
			finaljson.pages[0] = sakai._site.currentsite.name;
			var splitted = sakai._site.inEditView.split('/');
			var current = "";
			for (i = 0, j = splitted.length - 1; i<j; i++){
				var id = splitted[i];
				if (i !== 0){
					current += "/";
				}
				current += id;
				var idtofind = current;
				for (ii = 0, jj = sakai._site.pages.items.length; ii<jj; ii++){
					if (sakai._site.pages.items[ii].id == idtofind){
						finaljson.pages[finaljson.pages.length] = sakai._site.pages.items[ii].title;	
					}
				}
			}
			finaljson.pages[finaljson.pages.length] = $("#title-input").val();
			finaljson.total = finaljson.pages.length;
			$("#new_page_path").html($.Template.render("new_page_path_template",finaljson));
			
			$("#move_inside_edit").bind("click", function(ev){
				moveInsideEdit();
			});	
		}
	});
	
	

	
	
	
	//---------------------------------------------------------------------------------
	//	Page template functionality
	//---------------------------------------------------------------------------------
	
	/**
	 * Start Save As Template
	 * @param {Object} hash
	 * @return void
	 */
	var startSaveAsTemplate = function(hash){
		$("#more_menu").hide();
		$("#add_new_menu").hide();
		sakai._site.isShowingDropdown = false;
		hash.w.show();
	};
	
	// Init Save as Template modal
	$("#save_as_template_container").jqm({
		modal: true,
		trigger: $('#more_save_as_template'),
		overlay: 20,
		toTop: true,
		onShow: startSaveAsTemplate
	});
	
	
	// Bind Sava as Template click event
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
			var v = ["" + $.toJSON(obj)];
			var tosend = {"v":v,"k":k,"a":a};
			
			var fileUrl = "/sdata/p/_templates/pages/configuration";
				
			// Get templates configuration file
			$.ajax({
		      	url :fileUrl,
				cache: false,
				success : function(data) {
					var templates = $.evalJSON(data);
					updateTemplates(obj, newid, templates);
				},
				error : function(data){
					var templates = {};
					updateTemplates(obj, newid, templates);
				}
			});
		}
	});
	
	/**
	 * Update templates in JCR
	 * @param {Object} obj
	 * @param {Object} newid
	 * @param {Object} templates
	 * @return void
	 */
	var updateTemplates = function(obj, newid, templates){
		templates[newid] = obj;
		var tosave = $.toJSON(templates);
		sdata.widgets.WidgetPreference.save("/sdata/p/_templates/pages", "configuration", tosave, function(success){
			sdata.widgets.WidgetPreference.save("/sdata/p/_templates/pages/" + newid, "content", sakai._site.pagecontents[sakai._site.selectedpage], function(success){
				$("#save_as_template_container").jqmHide();
				$("#template_name").val("");
				$("#template_description").val("");
			});
		});
	};
	
	
	/**
	 * Load Templates
	 * @param {Object} hash
	 * @return void
	 */
	var loadTemplates = function(hash){
		resetVersionHistory();
		
		$("#add_new_menu").hide();
		sakai._site.isShowingDropdown = false;
		
		var fileUrl = "/sdata/p/_templates/pages/configuration";
				
		// Get templates configuration file
		$.ajax({
	     	url :fileUrl,
			cache: false,
			success : function(data) {
				var templates = $.evalJSON(data);
				renderTemplates(templates);
			},
			error : function(data){
				var templates = {};
				renderTemplates(templates);
			}
		});
		
		hash.w.show();
	};
	
	
	/**
	 * Render Templates
	 * @param {Object} templates
	 * @return void
	 */
	var renderTemplates = function(templates){
		
		sakai._site.mytemplates = templates;
		
		var finaljson = {};
		finaljson.items = [];
		
		for (var i in templates){
			var obj = {};
			obj.id = i;
			obj.name = templates[i].name;
			obj.description = templates[i].description;
			finaljson.items[finaljson.items.length] = obj;
		}
		
		finaljson.size = finaljson.items.length;
		
		$("#list_container").hide().html($.Template.render("list_container_template",finaljson));
		
		if ($("#list_container").height() > 250){
			$("#list_container").css("height","250px");
		}
		
		$("#list_container").show();
		
		$(".template_delete").bind("click", function(ev){
			var todelete = this.id.split("_")[2];
			
			var newobj = {};
			for (var i in sakai._site.mytemplates){
				if (i != todelete){
					newobj[i] = sakai._site.mytemplates[i];
				}
			}
			
			sdata.widgets.WidgetPreference.save("/sdata/p/_templates/pages", "configuration", $.toJSON(newobj), function(success){});
			
			$.ajax({
		     	url :"/sdata/p/_templates/pages/" + todelete,
		     	type : "DELETE"
			});
			
			renderTemplates(newobj);
		});
		
		$(".page_template_selection").bind("click", function(ev){
			var toload = this.id.split("_")[3];
			$.ajax({
		     	url :"/sdata/p/_templates/pages/" + toload + "/content",
				cache: false,
				success : function(data) {
					$("#select_template_for_page").jqmHide();
					createNewPage(data);
				}
			});
		});
		
	};
	
	
	// Init Template selection modal
	$("#select_template_for_page").jqm({
		modal: true,
		trigger: $('#option_page_from_template'),
		overlay: 20,
		toTop: true,
		onShow: loadTemplates
	});
	
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Revision history
	//---------------------------------------------------------------------------------
	
	// Bind Revision history click event
	$("#more_revision_history").bind("click", function(ev){
		$("#content_page_options").hide();
		$("#revision_history_container").show();
		$("#more_menu").hide();
		$.ajax({
		   	url :"/sdata/f/" + sakai._site.currentsite.id + "/_pages/"+ sakai._site.selectedpage.split("/").join("/_pages/") + "/content?f=vh",
			cache: false,
			success : function(data) {
				var history = $.evalJSON(data);
				
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
				
				$.ajax({
				   	url :"/rest/me/" + searchstring,
				    success : function(data) {
						
						var result = $.evalJSON(data);
						var userDatabase = [];
						if (result.users) {
							for (var i = 0, j = result.users.length; i<j; i++) {
								var userid = (result.users[i].userStoragePrefix.split("/")[result.users[i].userStoragePrefix.split("/").length - 2]);
								userDatabase[userid] = result.users[i].profile.firstName + " " + result.users[i].profile.lastName;
							}
						}
						
						// Populate the select box
						var select = $("#revision_history_list").get(0);
						$(select).unbind("change",changeVersionPreview);
						
						select.options.length = 0;
						for (i = history.versions.length - 1; i >= 1; i--){
							var name = "Version " + (i);
							
							// Transform date
							var date = history.versions[i].properties["jcr:created"];
							var datestring = sakai._site.transformDate(date.date,date.month,date.year,date.hours,date.minutes);
							
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
					error : function(data) {
						alert("Revision History: An error has occured");	
					}
				});
			},
			error : function(data){
				alert("Revision History: An error has occured");
			}
		});
	});
	
	
	// Bind Revision history cancel click event
	$("#revision_history_cancel").bind("click", function(ev){
		resetVersionHistory();
	});
	
	// Bind Revision History - Revert click event
	$("#revision_history_revert").bind("click", function(ev){
		var select = $("#revision_history_list").get(0);
		var version = select.options[select.selectedIndex].value;
		$.ajax({
		   	url :"/sdata/f/" + sakai._site.currentsite.id + "/_pages/"+ sakai._site.selectedpage.split("/").join("/_pages/") + "/content?v=" + version,
		    success : function(data) {
				
				$("#" + sakai._site.escapePageId(sakai._site.selectedpage)).html(data);
				sdata.widgets.WidgetLoader.insertWidgets(sakai._site.selectedpage.replace(/ /g, "%20"));
				
				// Save new version of this page
				var newfolderpath = sakai._site.currentsite.id + "/_pages/"+ sakai._site.selectedpage.split("/").join("/_pages/");

				sdata.widgets.WidgetPreference.save("/sdata/f/" + newfolderpath, "content", data, function(){
									
					// Check in the page
					$.ajax({
						url: "/sdata/f/" + newfolderpath + "/content?f=ci",
						type: 'POST'
					});
							
				}, null, "x-sakai-page");
				
				sakai._site.pagecontents[sakai._site.selectedpage] = data;
				
				resetVersionHistory();
				
			},
			error : function(data){
				alert("Revision History: An error has occured");
			}
		});
	});
	
	
	/**
	 * Change Version Preview
	 * @return void
	 */
	var changeVersionPreview = function(){
		var select = $("#revision_history_list").get(0);
		var version = select.options[select.selectedIndex].value;
		$.ajax({
		   	url :"/sdata/f/" + sakai._site.currentsite.id + "/_pages/"+ sakai._site.selectedpage.split("/").join("/_pages/") + "/content?v=" + version,
		    success : function(data) {
				$("#" + sakai._site.escapePageId(sakai._site.selectedpage)).html(data);
				sdata.widgets.WidgetLoader.insertWidgets(sakai._site.selectedpage.replace(/ /g, "%20"));
			},
			error : function(data){
				alert("An error has occured while trying to cahnge version preview");
			}
		});
	};
	
	
	/**
	 * Reset version history
	 * @retuen void
	 */
	var resetVersionHistory = function(){
		try {
			if (sakai._site.selectedpage) {
				$("#revision_history_container").hide();
				$("#content_page_options").show();
				$("#" + sakai._site.escapePageId(sakai._site.selectedpage)).html(sakai._site.pagecontents[sakai._site.selectedpage]);
				sdata.widgets.WidgetLoader.insertWidgets(sakai._site.selectedpage.replace(/ /g, "%20"));
			}
		} catch (err){
			// Ignore	
		}
	};
	
	

	
	
	//---------------------------------------------------------------------------------
	//	Recent Sites
	//---------------------------------------------------------------------------------
	
	/**
	 * Save to the list of Recent sites on the left nav bar
	 * @param {Object} response
	 * @return void
	 */
	var saveToRecentSites = function(response){
		
		$.ajax({
		   	url :"/sdata/p/recentsites.json",
			cache: false,
			success : function(data) {
				var items = $.evalJSON(data);
				transformRecentSitesList(items, response);
			},
			error : function(data){
				transformRecentSitesList({"items":[]}, response);
			}
		});
		
	};
	
	/**
	 * Transform recent Sites List to filter out current site
	 * @param {Object} items
	 * @param {Object} response
	 * @return void
	 */
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
	
	
	/**
	 * Write Recent Sites list to JCR
	 * @param {Object} items
	 * @return void
	 */
	var writeRecentSiteList = function(items){
		sdata.widgets.WidgetPreference.save("/sdata/p/", "recentsites.json", $.toJSON(items), function(success){});
	};
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Global event listeners
	//---------------------------------------------------------------------------------
	
	// Bind title input change event
	$("#title-input").bind("change", function(){
		$("#new_page_path_current").text($("#title-input").val());
	});
	
	// Bind resize event
	$(window).bind("resize", function(){
		$("#toolbarcontainer").css("width", $("#toolbarplaceholder").width() + "px");
	});
	
	// Bind scroll event
	$(window).bind("scroll", function(e){
		//var time = new Date().getTime();
		//if (time < sakai._site.last + 500) {
		//	return;
		//}
		try {
			placeToolbar();
		} catch (err){
			// Ignore
		}
		//setTimeout(placeToolbar, 100);
	});
	
	// Bind Edit page link click event
	$("#edit_page").bind("click", function(ev){
		sakai._site.isEditingNewPage = false;
		sakai._site.inEditView = true;
		
		//Check if tinyMCE has been loaded before - probably a more robust check will be needed
		if (tinyMCE.activeEditor === null) {
     		init_tinyMCE();
  		} else {
			editPage(sakai._site.selectedpage);
		}
		
		return false;
	});
	
	
	/**
	 * Callback function to trigger editPage() when tinyMCE is initialised
	 * @return void
	 */
	sakai._site.startEditPage = function() {
		console.log('site2_admin.js: tinyMCE init finished');
		editPage(sakai._site.selectedpage);
	};
	
	
	//---------------------------------------------------------------------------------
	//	Init
	//---------------------------------------------------------------------------------
	
	sdata.container.registerFinishFunction(sakai._site.widgetFinish);
	sdata.container.registerCancelFunction(sakai._site.widgetCancel);
	fillInsertMoreDropdown();

};

sakai.site.informAdminLoad();
