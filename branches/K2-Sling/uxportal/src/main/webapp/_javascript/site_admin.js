/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global $, Config, History, Querystring, sdata, sakai, tinyMCE, tinymce  */

sakai.site.site_admin = function(){
	
	/////////////////////////////
	// CONFIG and HELP VARS
	/////////////////////////////
	
	sakai.site.toolbarSetupReady = false;
	sakai.site.autosavecontent = false;
	sakai.site.isShowingDropdown = false;
	sakai.site.isShowingContext = false;
	sakai.site.newwidget_id = false;
	sakai.site.newwidget_uid = false;
	sakai.site.isEditingNewPage = false;
	sakai.site.oldSelectedPage = false;
	sakai.site.mytemplates = false;
	sakai.site.showingInsertMore = false;
	
	
	
	// Cache all the jQuery selectors we can
	var $main_content_div = $("#main-content-div");
	var $elm1_ifr = $("#elm1_ifr");
	var $elm1_toolbar1 = $("#elm1_toolbar1");
	var $elm1_toolbar2 = $("#elm1_toolbar2");
	var $elm1_toolbar3 = $("#elm1_toolbar3");
	var $elm1_toolbar4 = $("#elm1_toolbar4");
	var $elm1_external = $("#elm1_external");
	var $toolbarplaceholder = $("#toolbarplaceholder");
	var $toolbarcontainer = $("#toolbarcontainer");
	var $insert_more_menu = $("#insert_more_menu");
	var $placeholderforeditor = $("#placeholderforeditor");
	var $context_menu = $("#context_menu");
	var $context_settings = $("#context_settings");
	var $more_menu = $("#more_menu");
	var $title_input_container = $("#title-input-container");
	var $fl_tab_content_editor = $("#fl-tab-content-editor");
	

	
	
	
	/////////////////////////////
	// tinyMCE FUNCTIONS
	/////////////////////////////
	
	/**
	 * Initialise tinyMCE and run sakai.site.startEditPage() when init is complete
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
		
		//Context Menu
		theme_advanced_buttons1: "formatselect,fontselect,fontsizeselect,bold,italic,underline,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,outdent,indent,|,spellchecker,|,image,link",
		theme_advanced_toolbar_location: "external",
		theme_advanced_toolbar_align: "left",
		theme_advanced_statusbar_location: "none",
		theme_advanced_resizing: false,
		handle_event_callback: "sakai.site.myHandleEvent",
		onchange_callback: "sakai.site.myHandleEvent",
		handle_node_change_callback: "sakai.site.mySelectionEvent",
		init_instance_callback: "sakai.site.startEditPage",
		
		// Example content CSS (should be your site CSS)
		content_css: Config.URL.TINY_MCE_CONTENT_CSS,
		
		// Drop lists for link/image/media/template dialogs
		template_external_list_url: "lists/template_list.js",
		external_link_list_url: "lists/link_list.js",
		external_image_list_url: "lists/image_list.js",
		media_external_list_url: "lists/media_list.js"
		});
	}
	
	
	
	/**
	 * Sets up the tinyMCE toolbar
	 * @return void
	 */
	var setupToolbar = function(){
		try {
			
			// Adjust iFrame
			$elm1_ifr.css({'overflow':'hidden', 'height':'auto'});
			$elm1_ifr.attr({'scrolling':'no','frameborder':'0'});
			
			if (!sakai.site.toolbarSetupReady) {
				$(".mceToolbarEnd").before($.Template.render("editor_extra_buttons", {}));
				$(".insert_more_dropdown_activator").bind("click", function(ev){ toggleInsertMore(); });
			}
			
			$(".mceExternalToolbar").parent().appendTo(".mceToolbarExternal");
			$(".mceExternalToolbar").show().css({"position":"static", 'border':'0px solid black'});
			$(".mceExternalClose").hide();
			
			// Toolbar visibility setup
			$elm1_toolbar1.hide();
			$elm1_toolbar2.hide();
			$elm1_toolbar3.hide();
			$elm1_toolbar4.hide();
			$(".mceToolbarRow2").hide();
			$(".mceToolbarRow3").hide();
			$elm1_toolbar1.show();
			$elm1_external.show();
			$(".mceExternalToolbar").show();
			
			// Set the iFrame height, but make sure it is there
			setTimeout(sakai.site.setIframeHeight, 100, ['elm1_ifr']);
			
			// Position toolbar
			placeToolbar();
		} 
		catch (err) {
			// Firefox throws strange error, doesn't affect anything
			// Ignore
		}
	};
	
	
		
	/**
	 * Position tinyMCE toolbar
	 * @return void
	 */
	var placeToolbar = function(){
		
		sakai.site.minTop = $("#toolbarplaceholder").position().top;
		sakai.site.curScroll = document.body.scrollTop;
		
		if (sakai.site.curScroll === 0) {
			if (window.pageYOffset) {
				sakai.site.curScroll = window.pageYOffset;
			} else {
				sakai.site.curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
			}
		}
		var barTop = sakai.site.curScroll;
		$toolbarcontainer.css("width", ($("#toolbarplaceholder").width() - 2) + "px");
		if (barTop <= sakai.site.minTop) {
			$toolbarcontainer.css({"position":"absolute", "margin-top":"10px", "top": sakai.site.minTop + "px"});
			$insert_more_menu.css({"position": "absolute", "margin-top": "10px", "top":(sakai.site.minTop + 25) + "px"});
		}
		else {
				$toolbarcontainer.css({"position":"fixed", "margin-top":"10px","top":"0px"});
				$insert_more_menu.css({"position": "fixed", "margin-top": "10px", "top":"0px"});
		}
		
		$insert_more_menu.css("left",$("#insert_more_dropdown_main").position().left + $("#toolbarcontainer").position().left + 1 + "px");
		
		sakai.site.last = new Date().getTime();
	};
	
	
	
	/**
	 * Set the correct iFrame height
	 * @param {String} ifrm
	 * @return void
	 */
	sakai.site.setIframeHeight = function(ifrm){
		var iframeWin = window.frames[0];
		var iframeEl = document.getElementById ? document.getElementById(ifrm) : document.all ? document.all[ifrm] : null;
		if (iframeEl && iframeWin) {
			if (BrowserDetect.browser != "Firefox") {
				iframeEl.style.height = "auto";
			}
			var docHt = sakai.site.getDocHeight(iframeWin.document);
			if (docHt < sakai.site.minHeight) {
				docHt = sakai.site.minHeight;
			}
			if (docHt && sakai.site.cur != docHt) {
				iframeEl.style.height = docHt + 30 + "px"; // add to height to be sure it will all show
				sakai.site.cur = (docHt + 30);
				$("#placeholderforeditor").css("height", docHt + 60 + "px");
				window.scrollTo(0, sakai.site.curScroll);
				placeToolbar();
			}
		}
	};
	
	
	/**
	 * tinyMCE event handler - This adjusts the editor iframe height according to content, whenever content changes 
	 * @param {Object} e
	 * @return {Boolean} true to continue event
	 */
	sakai.site.myHandleEvent = function(e){
		if (e.type == "click" || e.type == "keyup" || e.type == "mouseup" || !e || !e.type) {
			sakai.site.curScroll = document.body.scrollTop;
			
			if (sakai.site.curScroll === 0) {
				if (window.pageYOffset) {
					sakai.site.curScroll = window.pageYOffset;
				} else {
					sakai.site.curScroll = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
				}
			}
			sakai.site.setIframeHeight("elm1_ifr");
		}
		return true; // Continue handling
	};
	
	
	/**
	 * tinyMCE selection event handler
	 * @retun void
	 */
	sakai.site.mySelectionEvent = function(){
		var ed = tinyMCE.get('elm1');
		$context_menu.hide();
		var selected = ed.selection.getNode();
		if (selected && selected.nodeName.toLowerCase() == "img") {
			if (selected.getAttribute("class") == "widget_inline"){
				$context_settings.show();
			} else {
				$context_settings.hide();
			}
			var pos = tinymce.DOM.getPos(selected);
			$context_menu.css({"top": pos.y + $("#elm1_ifr").position().top + 15 + "px", "left": pos.x + $("#elm1_ifr").position().left + 15 + "px"}).show();
		}
	};
	
	
	/**
	 * Toggle Insert more dropdown
	 * @return void
	 */
	var toggleInsertMore = function(){
		if (sakai.site.showingInsertMore){
			$insert_more_menu.hide();
			sakai.site.showingInsertMore = false;	
		} else {
			$insert_more_menu.show();
			sakai.site.showingInsertMore = true;
		}
	};
	
	
	
	//--------------------------------------------------------------------------------------------------------------
	//
	// EDIT PAGE
	//
	//--------------------------------------------------------------------------------------------------------------
	
	
	/////////////////////////////
	// EDIT PAGE: FUNCTIONALITY
	/////////////////////////////
	
	/**
	 * Edit a page defined by its page ID
	 * @param {String} pageid
	 * @return void
	 */
	function editPage(pageid){
		
		// Init
		var escapedPageID = sakai.site.escapePageId(pageid);
		var hasopened = false;
		var pagetitle = "";
		sakai.site.inEditView = true;
		
		// UI init
		$more_menu.hide();
		$("#" + escapedPageID).html("");
		$main_content_div.children().css("display","none");
		
		// See if we are editing Navigation, if yes hide title bar
		if (pageid == "_navigation"){
			$title_input_container.hide();
			sakai.site.isEditingNavigation = true;
		} else {
			$title_input_container.show();
			sakai.site.isEditingNavigation = false;
		}
		
		
		// Get title 
		for (i = 0; i < sakai.site.pages.items.length; i++){
			if (sakai.site.pages.items[i].id == sakai.site.selectedpage){
				pagetitle = sakai.site.pages.items[i].title;
				break;
			}
		}
		
		// Prefill page title
		$(".title-input").val(pagetitle);
		
		// Generate the page location
		showPageLocation();

		// Put content in editor
		var content = sakai.site.pagecontents[pageid];
		tinyMCE.get("elm1").setContent(content);
		
		$("#messageInformation").hide();
		
		// Setup tinyMCE Toolbar
		setupToolbar();
		sakai.site.toolbarSetupReady = true;
		
		// Switch to edit view
		$("#show_view_container").hide();
		$("#edit_view_container").show();
		
		// Show the autosave dialog if a previous autosave version is available
		$.ajax({
			url: sakai.site.urls.WEBPAGE_CONTENT_AUTOSAVE_FULL(),
			cache: false,
			success: function(data){
				
				if (sakai.site.pagecontents[pageid] != data){	
					sakai.site.autosavecontent = data;
					$('#autosave_dialog').jqmShow();
				} else {
					sakai.site.timeoutid = setInterval(sakai.site.doAutosave, sakai.site.autosaveinterval);
				}
				
			},
			error: function(data){	
				sakai.site.timeoutid = setInterval(sakai.site.doAutosave, sakai.site.autosaveinterval);
			}
		});	
	}
	
	
		
	/////////////////////////////
	// EDIT PAGE: CANCEL
	/////////////////////////////
	
	var cancelEdit = function() {

		clearInterval(sakai.site.timeoutid);
		
		$insert_more_menu.hide();
		$context_menu.hide();
		sakai.site.showingInsertMore = false;	
		sakai.site.inEditView = false;
		
		// Remove autosvae file
		removeAutoSaveFile();
		
		if (sakai.site.isEditingNewPage) {
		
			// Delete page from configuration file
			var index = -1;
			for (var i = 0; i < sakai.site.pages.items.length; i++){
				if (sakai.site.pages.items[i].id == sakai.site.selectedpage){
					index = i;
				}
			}
			sakai.site.pages.items.splice(index,1);
			
			// Save configuration file
			sdata.widgets.WidgetPreference.save(sakai.site.urls.PAGE_CONFIGURATION_PREFERENCE(), "pageconfiguration", $.toJSON(sakai.site.pages), function(success){
	
				// Display previous page content
				document.getElementById(sakai.site.escapePageId(sakai.site.oldSelectedPage)).style.display = "block";
				
				// Adjust selected page back to the old page
				sakai.site.selectedpage = sakai.site.oldSelectedPage;
				
				// Switch back view
				$("#edit_view_container").hide();
				$("#show_view_container").show();
			
				// Delete the folder that has been created for the new page	
				$.ajax({
					url: sakai.site.urls.CURRENT_SITE_ROOT() + "_pages/untitled",
					type: 'DELETE'
				});
			});
		
		} else {
		
			switchToTextEditor();
			
			var escaped = sakai.site.escapePageId(sakai.site.selectedpage);
			document.getElementById(escaped).innerHTML = sakai.site.pagecontents[sakai.site.selectedpage];
			if (sakai.site.pagetypes[sakai.site.selectedpage] == "webpage") {
				$("#webpage_edit").show();
			}
			document.getElementById(escaped).style.display = "block";
			sdata.widgets.WidgetLoader.insertWidgets(escaped);
			
			$("#edit_view_container").hide();
			$("#show_view_container").show();
			
		}
	};
	

	
	
	/////////////////////////////
	// EDIT PAGE: SAVE
	/////////////////////////////
	
	var saveEdit = function() {
		
		// Clear timeout
		clearInterval(sakai.site.timeoutid);
		$("#context_menu").hide();
		
		// Remove autosave
		removeAutoSaveFile();
		
		$insert_more_menu.hide();
		sakai.site.showingInsertMore = false;	
		
		switchToTextEditor();
		
		if (sakai.site.isEditingNavigation){
			
			// Save Navigation Edit
			saveEdit_Navigation();
		
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
			for (i = 0; i < sakai.site.pages.items.length; i++){
				if (sakai.site.pages.items[i].id == sakai.site.selectedpage){
					oldpagetitle = sakai.site.pages.items[i].title;
				}
			}
		
			// If there is a title change
			if (oldpagetitle.toLowerCase() != newpagetitle.toLowerCase()) { // || sakai.site.inEditView !== false) {
				
				// Take care of title change
				saveEdit_RegisterTitleChange(newpagetitle);
				
			} else {
				
				// See if we are editing a completely new page
				if (sakai.site.isEditingNewPage) {
					// Save page content
					var content = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
					var newurl = sakai.site.selectedpage.split("/").join("/_pages/");
					sdata.widgets.WidgetPreference.save("/sites/" + sakai.site.currentsite.id + "/_pages/" + newurl, "content", content, function(){
							
						// Remove old div + potential new one
						$("#" + sakai.site.escapePageId(sakai.site.selectedpage)).remove();
								
						// Remove old + new from sakai.site.pagecontents array 
						sakai.site.pagecontents[sakai.site.selectedpage] = null;
									
						// Open page
						sakai.site.openPage(sakai.site.selectedpage);
						
						// Switch back to view mode
						$("#edit_view_container").hide();
						$("#show_view_container").show();
						
						// Check in the page
						
						$.ajax({
							url: sakai.site.urls.CURRENT_SITE_PAGES() + "/content.save.html",
							type: 'POST'
						});
									
					}, null, "x-sakai-page");					
					
				}
				else {
				
					// We are editing an existing page
					if (sakai.site.pagetypes[sakai.site.selectedpage] == "webpage") {
						$("#webpage_edit").show();
					}
					
					// Store page contents
					escaped = sakai.site.escapePageId(sakai.site.selectedpage);
					sakai.site.pagecontents[sakai.site.selectedpage] = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
					
					// Put page contents into html
					document.getElementById(escaped).innerHTML = sakai.site.pagecontents[sakai.site.selectedpage];
					
					// Switch back to view mode
					$("#edit_view_container").hide();
					$("#show_view_container").show();
					
					document.getElementById(escaped).style.display = "block";
					sdata.widgets.WidgetLoader.insertWidgets(sakai.site.escapePageId(sakai.site.selectedpage));
					sdata.widgets.WidgetPreference.save(sakai.site.urls.CURRENT_SITE_PAGES(), "content", sakai.site.pagecontents[sakai.site.selectedpage], function(){
					
						// Check in the page
						$.ajax({
							url: sakai.site.urls.CURRENT_SITE_PAGES() + "/content.save.html",
							type: 'POST'
						});
					
					}, null, "x-sakai-page");
					
				}
			
			}
			
		}
		
		// Re-render Site Navigation to reflect changes
		sakai._navigation.renderNavigation(sakai.site.selectedpage, sakai.site.pages);
		
		sakai.site.inEditView = false;
	};
	
	
	var saveEdit_Navigation = function() {
		
		// Navigation
		sakai.site.pagecontents._navigation = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
		$("#page_nav_content").html(sakai.site.pagecontents._navigation);
		
		var escaped = sakai.site.escapePageId(sakai.site.selectedpage);
		document.getElementById(escaped).style.display = "block";
		
		$("#edit_view_container").hide();
		$("#show_view_container").show();
		
		sdata.widgets.WidgetLoader.insertWidgets("page_nav_content");
		sdata.widgets.WidgetPreference.save(sakai.site.urls.SITE_NAVIGATION(), "content", sakai.site.pagecontents._navigation, function(){});
		
		document.getElementById(escaped).style.display = "block";
		sdata.widgets.WidgetLoader.insertWidgets(escaped);
		
	};
	
	
	var saveEdit_RegisterTitleChange = function(newpagetitle) {
		
	// Generate new page id
		var newid = "";
		var counter = 0;
		var baseid = newpagetitle.toLowerCase();
		baseid = baseid.replace(/ /g,"-");
		baseid = baseid.replace(/[:]/g,"-");
		baseid = baseid.replace(/[?]/g,"-");
		baseid = baseid.replace(/[=]/g,"-");
		var basefolder = "";
		if (sakai.site.inEditView !== false && sakai.site.inEditView !== true){
			var abasefolder = sakai.site.inEditView.split("/");
			for (i = 0; i < abasefolder.length - 1; i++){
				basefolder += abasefolder[i] + "/";
			}
		} else {
			var abasefolder2 = sakai.site.selectedpage.split("/");
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
			for (i = 0; i < sakai.site.pages.items.length; i++){
				if (sakai.site.pages.items[i].id == testid){
					exists = true;
				}
			}
			if (!exists){
				newid = testid;
			}
		}
		
		for (i = 0; i < sakai.site.pages.items.length; i++){
			if (sakai.site.pages.items[i].id == sakai.site.selectedpage){
				sakai.site.pages.items[i].id = newid;
				sakai.site.pages.items[i].title = newpagetitle;
				break;
			}
		}
		
		// Move page folder to this new id
		var newfolderpath = "/sites/" + sakai.site.currentsite.id + "/_pages/" + newid.split("/").join("/_pages/");
		var data = {
			":operation": "move",
			":dest": newfolderpath
		};
		
		$.ajax({
			url: sakai.site.urls.CURRENT_SITE_PAGES(),
			type: 'POST',
			data: data,
			success: function(data){
				
				// Move all of the subpages of the current page to stay a subpage of the current page
				var idtostartwith = sakai.site.selectedpage + "/";
				for (var i = 0; i < sakai.site.pages.items.length; i++){
					if (sakai.site.pages.items[i].id.substring(0,idtostartwith.length) == idtostartwith){
						sakai.site.pages.items[i].id = newid + "/" + sakai.site.pages.items[i].id.substring(idtostartwith.length);
					}
				}
		
				// Adjust configuration file
				sdata.widgets.WidgetPreference.save(sakai.site.urls.PAGE_CONFIGURATION_PREFERENCE(), "pageconfiguration", $.toJSON(sakai.site.pages), function(success){
					
					// Render the new page under the new URL
					
						// Save page content
						var content = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
						sdata.widgets.WidgetPreference.save(newfolderpath, "content", content, function(){
							
							// Remove old div + potential new one
							$("#" + sakai.site.escapePageId(sakai.site.selectedpage)).remove();
							$("#" + sakai.site.escapePageId(newid)).remove();
						
							// Remove old + new from sakai.site.pagecontents array 
							sakai.site.pagecontents[sakai.site.selectedpage] = null;
							sakai.site.pagecontents[newid] = null;
							
							// Open page
							sakai.site.openPage(newid);
							
							// Switch to view mode
							$("#edit_view_container").hide();
							$("#show_view_container").show();
							
							// Check in the page
							$.ajax({
								url: newfolderpath + "/content.save.html",
								type: 'POST'
							});
					
						}, null, "x-sakai-page");
					
				});		
				
			},
			error: function(status){
				
				// Move all of the subpages of the current page to stay a subpage of the current page
				var idtostartwith = sakai.site.selectedpage + "/";
				for (var i = 0, j = sakai.site.pages.items.length; i<j; i++){
					if (sakai.site.pages.items[i].id.substring(0,idtostartwith.length) == idtostartwith){
						sakai.site.pages.items[i].id = newid + "/" + sakai.site.pages.items[i].id.substring(idtostartwith.length);
					}
				}
		
				// Adjust configuration file
				sdata.widgets.WidgetPreference.save("/sites/" + sakai.site.currentsite.id + "/.site", "pageconfiguration", $.toJSON(sakai.site.pages), function(success){
					
					// Render the new page under the new URL
					
						// Save page content
						var content = tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
						sdata.widgets.WidgetPreference.save(newfolderpath, "content", content, function(){
							
							// Remove old div + potential new one
							$("#" + sakai.site.escapePageId(sakai.site.selectedpage)).remove();
							$("#" + sakai.site.escapePageId(newid)).remove();
						
							// Remove old + new from sakai.site.pagecontents array
							sakai.site.pagecontents[sakai.site.selectedpage] = null;
							sakai.site.pagecontents[newid] = null;
							
							// Open page
							sakai.site.openPage(newid);
							
							// Switch back to view mode
							$("#edit_view_container").hide();
							$("#show_view_container").show();
							
							// Check in the page
							$.ajax({
								url: newfolderpath + "/content.save.html",
								type: 'POST'
							});
							
						}, null, "x-sakai-page");
					
				});		
				
			}
		});
		
	};
	
	/////////////////////////////
	// EDIT PAGE: GENERAL
	/////////////////////////////
	
	// Bind Edit page link click event
	$("#edit_page").bind("click", function(ev){
		sakai.site.isEditingNewPage = false;
		sakai.site.inEditView = true;
		
		//Check if tinyMCE has been loaded before - probably a more robust check will be needed
		if (tinyMCE.activeEditor === null) {
     		init_tinyMCE();
  		} else {
			editPage(sakai.site.selectedpage);
		}
		
		return false;
	});
	
	
	// Bind cancel button click
	$(".cancel-button").bind("click", function(ev){
		cancelEdit();
	});
	
	// Bind Save button click
	$(".save_button").bind("click", function(ev){
		saveEdit();
	});
	
	
	/**
	 * Callback function to trigger editPage() when tinyMCE is initialised
	 * @return void
	 */
	sakai.site.startEditPage = function() {
		
		// Check wether we will edit navigation bar or normal page 
		if (sakai.site.isEditingNavigation)
			{
				editPage("_navigation");
			} else {
				editPage(sakai.site.selectedpage);
			}
		
	};
	
	
	
	
	//--------------------------------------------------------------------------------------------------------------
	//
	// PAGE LOCATION
	//
	//--------------------------------------------------------------------------------------------------------------
	
	/**
	 * Displays current page's location within a site, also adds a 'Move...' button
	 * @return void
	 */
	var showPageLocation = function(){
		var finaljson = {};
		finaljson.pages = [];
		finaljson.pages[0] = sakai.site.currentsite.name;
		var splitted = sakai.site.selectedpage.split('/');
		var current = "";
		for (var i = 0, j = splitted.length; i<j; i++){
			var id = splitted[i];
			if (i !== 0){
				current += "/";
			}
			current += id;
			var idtofind = current;
			
			for (var ii = 0; ii < sakai.site.pages.items.length; ii++){
				if (sakai.site.pages.items[ii].id == idtofind){
					finaljson.pages[finaljson.pages.length] = sakai.site.pages.items[ii].title;
				}
			}
		}
		finaljson.total = finaljson.pages.length;
		$("#new_page_path").html($.Template.render("new_page_path_template",finaljson));
		
		// Bind Move... button's click event to its functionality
		$("#move_inside_edit").bind("click", function(ev){
			window.scrollTo(0,0);
			$('#move_dialog').jqmShow();
		});
		
	};
	
	
	
	

	
	
	
	
	
	
	//--------------------------------------------------------------------------------------------------------------
	//
	// AUTOSAVE
	//
	//--------------------------------------------------------------------------------------------------------------
	
	/**
	 * Autosave functionality
	 * @return void
	 */
	sakai.site.doAutosave = function(){
		
		var tosave = "";
		
		//Get content to save according to which view (tab) is the editor in
		if (!sakai.site.currentEditView){
			tosave = tinyMCE.get("elm1").getContent();
		} else if (sakai.site.currentEditView == "html"){
			tosave = $("#html-editor-content").val();
		}
		
		// Save the data
		sdata.widgets.WidgetPreference.save(sakai.site.urls.CURRENT_SITE_PAGES(), "_content", tosave, function(){}, null, "x-sakai-page");

		// Update autosave indicator
		var now = new Date();
		var hours = now.getHours();
		var minutes = now.getMinutes();
		var seconds = now.getSeconds();
		$("#realtime").text(("00" + hours).slice(-2) + ":" + ("00" + minutes).slice(-2) + ":" + ("00" + seconds).slice(-2));
		$("#messageInformation").show();
		
	};
	
	
	/**
	 * Hide Autosave
	 * @param {Object} hash
	 * @return void
	 */
	var hideAutosave = function(hash){

		hash.w.hide();
		hash.o.remove();
		sakai.site.timeoutid = setInterval(sakai.site.doAutosave, sakai.site.autosaveinterval);
		removeAutoSaveFile();

	};
	
	
	/**
	 * Remove autosave file from JCR
	 * @return void
	 */
	var removeAutoSaveFile = function(){

		// Remove autosave file
		$.ajax({
			url: sakai.site.urls.WEBPAGE_CONTENT_AUTOSAVE_FULL(),
			type: 'DELETE'
		});

	};
	
	
	// Bind autosave click
	$("#autosave_revert").bind("click", function(ev){
		tinyMCE.get("elm1").setContent(sakai.site.autosavecontent);
		$('#autosave_dialog').jqmHide();
	});
	
	
	// Init autosave dialogue modal
	$('#autosave_dialog').jqm({
		modal: true,
		trigger: $('.autosave_dialog'),
		overlay: 20,
		toTop: true,
		onHide: hideAutosave
	});
	
	
	
	
	
	
	
	//--------------------------------------------------------------------------------------------------------------
	//
	// WIDGET CONTEXT MENU
	//
	//--------------------------------------------------------------------------------------------------------------
	
	
	//////////////////////////////////////
	// WIDGET CONTEXT MENU: SETTINGS
	//////////////////////////////////////
	
	
	// Bind Widget Context Settings click event
	$("#context_settings").bind("click", function(ev){
		var ed = tinyMCE.get('elm1');
		var selected = ed.selection.getNode();
		$("#dialog_content").hide();
		if (selected && selected.nodeName.toLowerCase() == "img" && selected.getAttribute("class") == "widget_inline") {
			$("#context_settings").show();
			var id = selected.getAttribute("id");
			var split = id.split("_");
			var type = split[1];
			var uid = split[2];
			var length = split[0].length + 1 + split[1].length + 1 + split[2].length + 1; 
			var placement = id.substring(length);

			sakai.site.newwidget_id = type;
			
			$("#dialog_content").hide();
			
			if (Widgets.widgets[type]) {
				$('#insert_dialog').jqmShow(); 
				var nuid = "widget_" + type + "_" + uid + "_" + placement;
				sakai.site.newwidget_uid = nuid;
				$("#dialog_content").html('<img src="' + Widgets.widgets[type].img + '" id="' + nuid + '" class="widget_inline" border="1"/>');
				$("#dialog_title").text(Widgets.widgets[type].name);
				sdata.widgets.WidgetLoader.insertWidgets("dialog_content", true);
				$("#dialog_content").show();
				$insert_more_menu.hide();
				sakai.site.showingInsertMore = false;	
			}
		}

		$("#context_menu").hide();
		
	});
	
	// Bind Context menu settings hover event
	$("#context_settings").hover(
		function(over){
			$("#context_settings").addClass("selected_option");
		}, 
		function(out){
			$("#context_settings").removeClass("selected_option");
		}
	);
	
	
	
	//////////////////////////////////////
	// WIDGET CONTEXT MENU: REMOVE
	//////////////////////////////////////
	
	// Bind Widget Context Remove click event
	$("#context_remove").bind("click", function(ev){
		tinyMCE.get("elm1").execCommand('mceInsertContent', false, '');
	});
	
	
	// Bind Context menu remove hover event
	$("#context_remove").hover(
		function(over){
			$("#context_remove").addClass("selected_option");
		}, 
		function(out){
			$("#context_remove").removeClass("selected_option");
		}
	);
	
	
	
	//////////////////////////////////////
	// WIDGET CONTEXT MENU: WRAPPING
	//////////////////////////////////////
	
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
	
	
	//////////////////////////////////////
	// WIDGET CONTEXT MENU: GENERAL
	//////////////////////////////////////
	
	
	// Bind Context menu appereance hover event
	$("#context_appearance").hover(
		function(over){
			$("#context_appearance").addClass("selected_option");
		}, 
		function(out){
			$("#context_appearance").removeClass("selected_option");
		}
	);
	
	
	
	
	
	
	
	

	
	
	//--------------------------------------------------------------------------------------------------------------
	//
	// TABS
	//
	//--------------------------------------------------------------------------------------------------------------
	
	/////////////////////////////
	// TABS: TEXT EDITOR
	/////////////////////////////
	
	/**
	 * Switch to Text Editor tab
	 * @return void
	 */
	var switchToTextEditor = function(){
		$fl_tab_content_editor.show();
		$toolbarplaceholder.show();
		$toolbarcontainer.show();
		if (sakai.site.currentEditView == "preview"){
			$("#page_preview_content").hide().html("");
			$("#tab-nav-panel").show();
			$("#new_page_path").show();
			switchtab("preview","Preview","text_editor","Text Editor");
		} else if (sakai.site.currentEditView == "html"){
			var value = $("#html-editor-content").val();
			tinyMCE.get("elm1").setContent(value);
			$("#html-editor").hide();
			switchtab("html","HTML","text_editor","Text Editor");
		}
		sakai.site.currentEditView = false;
	};
	
	// Bind Text Editor tab click event
	$("#tab_text_editor").bind("click", function(ev){
		switchToTextEditor();
	});
	
	
	/////////////////////////////
	// TABS: HTML
	/////////////////////////////
	
	// Bind HTML tab click event
	$("#tab_html").bind("click", function(ev){
		$("#context_menu").hide();
		$("#fl-tab-content-editor").hide();
		$("#toolbarplaceholder").hide();
		$("#toolbarcontainer").hide();
		if (!sakai.site.currentEditView){
			switchtab("text_editor","Text Editor","html","HTML");
		} else if (sakai.site.currentEditView == "preview"){
			$("#page_preview_content").hide().html("");
			$("#tab-nav-panel").show();
			$("#new_page_path").show();
			switchtab("preview","Preview","html","HTML");
		}
		var value = tinyMCE.get("elm1").getContent();
		$("#html-editor-content").val(value);
		$("#html-editor").show();
		sakai.site.currentEditView = "html";
	});
	
	
	
	/////////////////////////////
	// TABS: PREVIEW
	/////////////////////////////
	
	// Bind Preview tab click event
	$("#tab_preview").bind("click", function(ev){
		$("#context_menu").hide();
		$("#tab-nav-panel").hide();
		$("#new_page_path").hide();
		$("#html-editor").hide();
		$("#page_preview_content").html("").show();
		if (!sakai.site.currentEditView) {
			switchtab("text_editor","Text Editor","preview","Preview");
		} else if (sakai.site.currentEditView == "html"){
			var value = $("#html-editor-content").val();
			tinyMCE.get("elm1").setContent(value);
			switchtab("html","HTML","preview","Preview");
		}
		$("#page_preview_content").html("<h1 style='padding-bottom:10px'>" + $("#title-input").val() + "</h1>" + tinyMCE.get("elm1").getContent().replace(/src="..\/devwidgets\//g, 'src="/devwidgets/'));
		sdata.widgets.WidgetLoader.insertWidgets("page_preview_content");
		sakai.site.currentEditView = "preview";
	});
	

	
	/////////////////////////////
	// TABS: GENERAL
	/////////////////////////////
	
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
	
	
	





	//--------------------------------------------------------------------------------------------------------------
	//
	// INSERT MORE
	//
	//--------------------------------------------------------------------------------------------------------------
	
	
	/////////////////////////////
	// INSERT MORE: INSERT LINK
	/////////////////////////////
	
	/**
	 * Insert Link functionality - inserts a link into a page
	 * @return void
	 */
	var insertLink = function() {
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
			for (var i = 0, j = sakai.site.pages.items.length; i<j; i++) {
				if (sakai.site.pages.items[i].id == chosen) {
					pagetitle = sakai.site.pages.items[i].title;
				}
			}
			editor.execCommand('mceInsertContent', false, '<a href="#' + chosen + '" class="contauthlink">' + pagetitle + '</a>');
		}
		
		$('#link_dialog').jqmHide();
	};
	
	// Bind Insert link confirmation click event
	$("#insert_link_confirm").bind("click", function(ev){
		insertLink();
	});
	
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
			if (i) {
				size++;
			}	
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
	
	
	
	/**
	 * Do page hierarchy
	 * @param {Object} active
	 * @return {String} page hierarchy html
	 */
	var doPageHierarchy = function(active){
		// Generate the structure
		var object = {};
		for (var i = 0, j = sakai.site.pages.items.length; i<j; i++){
			var page = sakai.site.pages.items[i];
			object = createHierarchy("", object, page);
		}
		
		// Generate the HTML
		var currentId = 2;
		var html = '<ul class="simpleTree"><li class="root" id="1"><span style="display:none">Tree Root 1</span><ul>';
			for (i in object){
				if (i) {
					html += createHTMLHierarchy(object[i], i, active);
				}
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

			},
			afterDblClick:function(node){

			},
			afterMove:function(destination, source, pos){

			},
			afterAjax:function()
			{

			},
			animate:true
			//,docToFolderConvert:true
			}
		);
		$insert_more_menu.hide();
		sakai.site.showingInsertMore = false;
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
			el.css({"top": y + 22+ "px", "left": x - el.width() + $("#more_link").width() + 56 + "px"}).show();
		}		
	});
		

	
	
	
	/////////////////////////////
	// INSERT MORE: ADD HORIZONTAL LINE
	/////////////////////////////

	// Bind Insert horizontal line click event
	$("#horizontal_line_insert").bind("click", function(ev){
		tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<hr/>');
		toggleInsertMore();
	});
	
	
	
	
	
	/////////////////////////////
	// INSERT MORE: ADD SELECTED WIDGET
	/////////////////////////////
	
	
	/**
	 * Render selected widget
	 * @param {Object} hash
	 * @return void
	 */
	var renderSelectedWidget = function(hash){
		
		var $dialog_content = $("#dialog_content");
		toggleInsertMore();
		
		var widgetid = false;
		if (hash.t){
			widgetid = hash.t.id.split("_")[3];
		}
		$dialog_content.hide();
		
		if (Widgets.widgets[widgetid]){
			hash.w.show();
			
			sakai.site.newwidget_id = widgetid;
			var id = "widget_" + widgetid + "_id" + Math.round(Math.random() * 1000000000) + "_" + sakai.site.currentsite.id + "/_widgets";
			sakai.site.newwidget_uid = id;
			$dialog_content.html('<img src="' + Widgets.widgets[widgetid].img + '" id="' + id + '" class="widget_inline" border="1"/>');
			$("#dialog_title").text(Widgets.widgets[widgetid].name);
			sdata.widgets.WidgetLoader.insertWidgets("dialog_content", true);
			$dialog_content.show();
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
		sakai.site.newwidget_id = false;
		sakai.site.newwidget_uid = false;
		$("#dialog_content").html("").hide();
	};
	
	/**
	 * Insert widget modal Cancel button - hide modal
	 * @param {Object} tuid
	 * @retuen void
	 */
	sakai.site.widgetCancel = function(tuid){
		$('#insert_dialog').jqmHide(); 
	};
	
	
	/**
	 * Widget finish - add widget to editor, hide modal
	 * @param {Object} tuid
	 * @return void
	 */
	sakai.site.widgetFinish = function(tuid){
		// Add widget to the editor
		$("#insert_screen2_preview").html("");
		tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<img src="' + Widgets.widgets[sakai.site.newwidget_id].img + '" id="' + sakai.site.newwidget_uid + '" class="widget_inline" style="display:block; padding: 10px; margin: 4px" border="1"/>');
		$('#insert_dialog').jqmHide(); 
	};
	
	
	
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
		
		// Fill in media and goodies
		for (var i in Widgets.widgets){
			if (i) {
				var widget = Widgets.widgets[i];
				if (widget.ca && widget.showinmedia) {
					media.items[media.items.length] = widget;
				}
				if (widget.ca && widget.showinsakaigoodies) {
					goodies.items[goodies.items.length] = widget;
				}
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



	

	
	
	//--------------------------------------------------------------------------------------------------------------
	//
	// ADD NEW...
	//
	//--------------------------------------------------------------------------------------------------------------
		


	/////////////////////////////
	// ADD NEW: BLANK PAGE
	/////////////////////////////
	
	
	/**
	 * Create a new page
	 * @param {Object} content
	 * @return void
	 */
	var createNewPage = function(content){
		
		$("#add_new_menu").hide();
		sakai.site.isShowingDropdown = false;
		
		// Set new page flag
		sakai.site.isEditingNewPage = true;
		
		// Determine where to create the page
		var path = "";
		if (sakai.site.selectedpage){
			if (sakai.site.createChildPageByDefault){
				path = sakai.site.selectedpage + "/";
			} else {
				var splitted = sakai.site.selectedpage.split("/");
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
			for (i = 0, j = sakai.site.pages.items.length; i<j; i++){
				if (sakai.site.pages.items[i].id == totest){
					exists = true;
				}
			}
			if (!exists){
				newid = totest;
			}
		}
		
		// Assign the empty content to the sakai.site.pagecontents array
		sakai.site.pagecontents[newid] = content;
		
		// Change the configuration file
		var index = sakai.site.pages.items.length;
		sakai.site.pages.items[index] = {};
		sakai.site.pages.items[index].id = newid;
		sakai.site.pages.items[index].title = "Untitled";
		sakai.site.pages.items[index].type = "webpage";
		
		// Post the new configuration file
		sdata.widgets.WidgetPreference.save(sakai.site.urls.PAGE_CONFIGURATION_PREFERENCE(), "pageconfiguration", $.toJSON(sakai.site.pages), function(success){});
		
		// Store page selected and old IDs
		sakai.site.oldSelectedPage = sakai.site.selectedpage;
		sakai.site.selectedpage = newid;
		
		// Init tinyMCE if needed
		if (tinyMCE.activeEditor === null) { // Probably a more robust checking will be necessary
     		init_tinyMCE();
  		} else {
			editPage(newid);
		}
		
	};
	
	
	// Bind Add a blank page click event
	$("#option_blank_page").bind("click", function(ev){
		if (sakai.site.versionHistoryNeedsReset) {
			sakai.site.resetVersionHistory();
			sakai.site.versionHistoryNeedsReset = false;
		}
		createNewPage("");
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
	
	
	
	/////////////////////////////
	// ADD NEW: DASHBOARD
	/////////////////////////////
	
	var addDashboard = function() {
		// To be done
		
	};
	
	$("#option_page_dashboard").bind("click", function(ev){
		addDashboard();
	});
	
	// Bind Add a new page dashboard hover event
	$("#option_page_dashboard").hover(
		function(over){
			$("#option_page_dashboard").addClass("selected_option");
		}, 
		function(out){
			$("#option_page_dashboard").removeClass("selected_option");
		}
	);
	
	
	
	
	//////////////////////////////////
	// ADD NEW: PAGE FROM TEMPLATE
	//////////////////////////////////
	

	// ?

	
	// Bind Add a new page from template hover event
	$("#option_page_from_template").hover(
		function(over){
			$("#option_page_from_template").addClass("selected_option");
		}, 
		function(out){
			$("#option_page_from_template").removeClass("selected_option");
		}
	);
	
	
	
	
	
	
	
	/////////////////////////////
	// ADD NEW: GENERAL
	/////////////////////////////
	
	// Bind Add a new... click event
	$("#add_a_new").bind("click", function(ev){
		if (sakai.site.isShowingDropdown){
			$("#add_new_menu").hide();
			sakai.site.isShowingDropdown = false;
		} else {
			$("#add_new_menu").show();
			sakai.site.isShowingDropdown = true;
			var dropdown_pos = $("#add_a_new").offset();
			$("#add_new_menu").css({"left": (dropdown_pos.left + 7)+"px", "top": (dropdown_pos.top + 22) + "px"});
			console.dir(dropdown_pos);
		}
	});
	
	
	

	
	
	
	//--------------------------------------------------------------------------------------------------------------
	//
	// MORE MENU
	//
	//--------------------------------------------------------------------------------------------------------------
	
	////////////////////////////////////////
	// MORE: SETTINGS
	////////////////////////////////////////
	
	
	
	
	////////////////////////////////////////
	// MORE: REVISION HISTORY
	////////////////////////////////////////
	
	// Bind Revision history click event
	$("#more_revision_history").bind("click", function(ev){
		// UI Setup
		$("#content_page_options").hide();
		$("#revision_history_container").show();
		$("#more_menu").hide();
		
		$.ajax({
		   	url :"/sites/" + sakai.site.currentsite.id + "/_pages/"+ sakai.site.selectedpage.split("/").join("/_pages/") + "/content?f=vh",
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
							var datestring = sakai.site.transformDate(date.date,date.month,date.year,date.hours,date.minutes);
							
							name += " - " + datestring;
						
							if (history.versions[i].items["jcr:frozenNode"].properties["jcr:modifiedBy"]){
								 name += " - " + userDatabase[history.versions[i].items["jcr:frozenNode"].properties["jcr:modifiedBy"]];
							}
							var id = history.versions[i].name;
							var option = new Option(name,id);
							select.options[select.options.length] = option;
							
							$(select).bind("change",changeVersionPreview);
							
							// Signal that a page reload will be needed when we go back 
							sakai.site.versionHistoryNeedsReset = true;
						}
					},
					error : function(data) {
						alert("Revision History: An error has occured");
						sakai.site.versionHistoryNeedsReset = true;
					}
				});
			},
			error : function(data){
				alert("Revision History: An error has occured");
				sakai.site.versionHistoryNeedsReset = true;
			}
		});
	});
	
	
	// Bind Revision history cancel click event
	$("#revision_history_cancel").bind("click", function(ev){
		sakai.site.resetVersionHistory();
	});
	
	// Bind Revision History - Revert click event
	$("#revision_history_revert").bind("click", function(ev){
		var select = $("#revision_history_list").get(0);
		var version = select.options[select.selectedIndex].value;
		$.ajax({
		   	url :"/sites/" + sakai.site.currentsite.id + "/_pages/"+ sakai.site.selectedpage.split("/").join("/_pages/") + "/content?v=" + version,
		    success : function(data) {
				
				$("#" + sakai.site.escapePageId(sakai.site.selectedpage)).html(data);
				sdata.widgets.WidgetLoader.insertWidgets(sakai.site.selectedpage.replace(/ /g, "%20"));
				
				// Save new version of this page
				var newfolderpath = sakai.site.currentsite.id + "/_pages/"+ sakai.site.selectedpage.split("/").join("/_pages/");

				sdata.widgets.WidgetPreference.save("/sites/" + newfolderpath, "content", data, function(){
									
					// Check in the page
					$.ajax({
						url: newfolderpath + "/content.save.html",
						type: 'POST'
					});
							
				}, null, "x-sakai-page");
				
				sakai.site.pagecontents[sakai.site.selectedpage] = data;
				
				sakai.site.resetVersionHistory();
				
				
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
		   	url : sakai.site.urls.CURRENT_SITE_PAGES() + "/content?v=" + version,
		    success : function(data) {
				$("#" + sakai.site.escapePageId(sakai.site.selectedpage)).html(data);
				sdata.widgets.WidgetLoader.insertWidgets(sakai.site.selectedpage.replace(/ /g, "%20"));
			},
			error : function(data){
				alert("An error has occured while trying to cahnge version preview");
			}
		});
	};
	
	
	
	/////////////////////////////
	// MORE: MOVE
	/////////////////////////////
	
	/**
	 * Render Move Page structure
	 * @param {Object} hash
	 * @return void
	 */
	var renderMovePageStructure = function(hash){
		var html = doPageHierarchy(sakai.site.selectedpage);

		
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
		$("#" + sakai.site.escapePageId(sakai.site.selectedpage)).find(">span").addClass("active");
		if (sakai.site.inEditView){
			$("#" + sakai.site.escapePageId(sakai.site.selectedpage)).find(">span").text($("#title-input").val());	
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
		
		var i = 0;
		var j = 0;
		var ii = 0;
		var jj = 0;
		
		// Generate new id
		var pageid = "";
		for (i = 0, j = sakai.site.pages.items.length; i<j; i++){
			if (sakai.site.pages.items[i].id == sakai.site.selectedpage){
				pageid = sakai.site.pages.items[i].id;
				break;
			}
		}
		pageid = pageid.split("/")[pageid.split("/").length - 1];
		
		var item = $("#" + sakai.site.escapePageId(sakai.site.selectedpage));
		var parent = item.parent().parent().attr("id");
		
		if (parent == "1"){
			parent = "";
		}
		
		var newid = false;
		var index = 0;
		var b_pages = sakai.site.clone(sakai.site.pages);
		var togoout = -1;
		for (i = 0, j = b_pages.items.length; i<j; i++){
			if (b_pages.items[i].id == sakai.site.selectedpage){
				togoout = i;
				break;
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
		if (!sakai.site.inEditView) {
			var newfolderpath = "/" + sakai.site.escapePageId(sakai.site.currentsite.id) + "/_pages/" + newid.split("/").join("/_pages/");
			
			var createFolderPath = "";
			for (var i = 0; i < newfolderpath.split("/").length - 1; i++){
				createFolderPath += "/" + newfolderpath.split("/")[i];
			}
			createFolderPath = createFolderPath.substring(1);
			
			// Create parent
			$.ajax({
				url: createFolderPath,
				type: 'POST',
				data: {
					created : "created"
				},
				success: function(data){
					$.ajax({
						url: sakai.site.urls.CURRENT_SITE_PAGES(),
						type: 'POST',
						data: {
							":operation":"move",
							":dest":newfolderpath
						},
						success: function(data){
						
							// Rewrite configuration file	
							var parentEl = $(".root");
							var els = $("li", parentEl);
							
							var newpageconfig = {};
							newpageconfig.items = [];
							
							for (i = 0, j = els.length; i < j; i++) {
								if (els[i] && els[i].id) {
									for (ii = 0, jj = sakai.site.pages.items.length; ii < jj; ii++) {
										if (sakai.site.pages.items[ii].id == els[i].id) {
											var newindex = newpageconfig.items.length;
											newpageconfig.items[newindex] = sakai.site.pages.items[ii];
											if (sakai.site.pages.items[ii].id == sakai.site.selectedpage) {
												newpageconfig.items[newindex].id = newid;
											}
										}
									}
								}
							}
							
							sdata.widgets.WidgetPreference.save(sakai.site.urls.PAGE_CONFIGURATION_PREFERENCE(), "pageconfiguration", $.toJSON(newpageconfig), function(success){
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
							
							for (i = 0, j = els.length; i < j; i++) {
								if (els[i] && els[i].id) {
									for (ii = 0, jj = sakai.site.pages.items.length; ii < jj; ii++) {
										if (sakai.site.pages.items[ii].id == els[i].id) {
											var newindex = newpageconfig.items.length;
											newpageconfig.items[newindex] = sakai.site.pages.items[ii];
											if (sakai.site.pages.items[ii].id == sakai.site.selectedpage) {
												newpageconfig.items[newindex].id = newid;
											}
										}
									}
								}
							}
							
							sdata.widgets.WidgetPreference.save(sakai.site.urls.PAGE_CONFIGURATION_PREFERENCE(), "pageconfiguration", $.toJSON(newpageconfig), function(success){
							
								 /* 
								 $(document.body).hide();
								 document.location = "#" + newid;
								 window.location.reload(true);
								 $('#move_dialog').jqmHide();
								 */
								
							});
							
						}
					});
				}
			});
			
		} else {
			sakai.site.inEditView = newid;
			$("#move_dialog").jqmHide();
			
			// Update the path shown
			var finaljson = {};
			finaljson.pages = [];
			finaljson.pages[0] = sakai.site.currentsite.name;
			var splitted = sakai.site.inEditView.split('/');
			var current = "";
			for (i = 0, j = splitted.length - 1; i<j; i++){
				var id = splitted[i];
				if (i !== 0){
					current += "/";
				}
				current += id;
				var idtofind = current;
				for (ii = 0, jj = sakai.site.pages.items.length; ii<jj; ii++){
					if (sakai.site.pages.items[ii].id == idtofind){
						finaljson.pages[finaljson.pages.length] = sakai.site.pages.items[ii].title;	
					}
				}
			}
			finaljson.pages[finaljson.pages.length] = $("#title-input").val();
			finaljson.total = finaljson.pages.length;
			$("#new_page_path").html($.Template.render("new_page_path_template",finaljson));
			
			
			
			$("#move_inside_edit").bind("click", function(ev){
				window.scrollTo(0,0);
				$('#move_dialog').jqmShow();
			});	
		}
	});
	
	
	
	
	////////////////////////////////////////
	// MORE: SAVE PAGE AS TEMPLATE
	////////////////////////////////////////
	
	/**
	 * Start Save As Template
	 * @param {Object} hash
	 * @return void
	 */
	var startSaveAsTemplate = function(hash){
		$("#more_menu").hide();
		$("#add_new_menu").hide();
		sakai.site.isShowingDropdown = false;
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
	
	
	// Bind Save as Template click event
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
				
			// Get templates configuration file
			$.ajax({
		      	url : Config.URL.TEMPLATES_CONFIG,
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
		sdata.widgets.WidgetPreference.save(Config.URL.TEMPLATES, "configuration", tosave, function(success){
			sdata.widgets.WidgetPreference.save(Config.URL.TEMPLATES + newid, "content", sakai.site.pagecontents[sakai.site.selectedpage], function(success){
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
		if (sakai.site.versionHistoryNeedsReset) {
			sakai.site.resetVersionHistory();
			sakai.site.versionHistoryNeedsReset = false;
		}
		
		$("#add_new_menu").hide();
		sakai.site.isShowingDropdown = false;
		
				
		// Get templates configuration file
		$.ajax({
	     	url: Config.URL.TEMPLATES_CONFIG,
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
		
		sakai.site.mytemplates = templates;
		
		var finaljson = {};
		finaljson.items = [];
		
		for (var i in templates){
			if (i) {
				var obj = {};
				obj.id = i;
				obj.name = templates[i].name;
				obj.description = templates[i].description;
				finaljson.items[finaljson.items.length] = obj;
			}
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
			for (var i in sakai.site.mytemplates){
				if (i != todelete){
					newobj[i] = sakai.site.mytemplates[i];
				}
			}
			
			sdata.widgets.WidgetPreference.save("/sdata/p/_templates/pages", "configuration", $.toJSON(newobj), function(success){});
			
			$.ajax({
		     	url : Config.URL.TEMPLATES + todelete,
		     	type : "DELETE"
			});
			
			renderTemplates(newobj);
		});
		
		$(".page_template_selection").bind("click", function(ev){
			var toload = this.id.split("_")[3];
			$.ajax({
		     	url: Config.URL.TEMPLATES + toload + "/content",
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
	
	
			
	/////////////////////////////
	// MORE: DELETE PAGE
	/////////////////////////////
	
	/**
	 * Deletes a page
	 * @return void
	 */
	var deletePage = function() {
		
		// Delete autosave
		$.ajax({
			url: sakai.site.urls.CURRENT_SITE_PAGES(),
			type: 'DELETE',
			success: function(data){
				
				// Save the new page configuration
				var index = -1;
				for (var i = 0; i < sakai.site.pages.items.length; i++){
					if (sakai.site.pages.items[i].id == sakai.site.selectedpage){
						index = i;
					}
				}
				
				sakai.site.pages.items.splice(index, 1);
				sdata.widgets.WidgetPreference.save(sakai.site.urls.PAGE_CONFIGURATION_PREFERENCE(), "pageconfiguration", $.toJSON(sakai.site.pages), function(success){
					document.location = "/sites/" + sakai.site.currentsite.id;
				});
				
			},
			error: function(data){	
				
				// Save the new page configuration
				var index = -1;
				for (var i = 0; i < sakai.site.pages.items.length; i++){
					if (sakai.site.pages.items[i].id == sakai.site.selectedpage){
						index = i;
					}
				}
				
				sakai.site.pages.items.splice(index, 1);
				sdata.widgets.WidgetPreference.save(sakai.site.urls.PAGE_CONFIGURATION_PREFERENCE(), "pageconfiguration", $.toJSON(sakai.site.pages), function(success){
					document.location = "/sites/" + sakai.site.currentsite.id;
				});
			}
		});
	};
	
	// Init delete dialog
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
		deletePage();
	});
	
	
	
	/////////////////////////////
	// MORE: GENERAL
	/////////////////////////////

	// Bind Insert more hover event
	$(".more_option").hover(
		function(over){
			$(this).addClass("selected_option");
		}, 
		function(out){
			$(this).removeClass("selected_option");
		}
	);
	

	

	
	
	
	
	//--------------------------------------------------------------------------------------------------------------
	//
	// GLOBAL EVENT LISTENERS
	//
	//--------------------------------------------------------------------------------------------------------------
	
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
		try {
			placeToolbar();
		} catch (err){
			// Ignore
		}
	});
	
	
	/////////////////////////////
	// EDIT SIDEBAR
	/////////////////////////////
	
	// Bind edit sidebar click
	$("#edit_sidebar").bind("click", function(ev){
		// Init tinyMCE if needed
		if (tinyMCE.activeEditor === null) { // Probably a more robust checking will be necessary
     		sakai.site.isEditingNavigation = true;
			init_tinyMCE();
  		} else {
			editPage("_navigation");
		}
		
		return false;
	});
	
	
	
	//--------------------------------------------------------------------------------------------------------------
	//
	// INIT
	//
	//--------------------------------------------------------------------------------------------------------------
	
	/**
	 * Initialise Admin part
	 * @return void
	 */
	var admin_init = function() {
		sdata.container.registerFinishFunction(sakai.site.widgetFinish);
		sdata.container.registerCancelFunction(sakai.site.widgetCancel);
		fillInsertMoreDropdown();
	};
	
	admin_init();

};

sakai.site.onAdminLoaded();
