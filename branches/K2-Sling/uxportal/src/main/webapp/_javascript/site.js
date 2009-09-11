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

/*global $, Config, History, Querystring, sdata, sakai, jQuery */

var sakai = sakai || {};

sakai.site = function(){		
	
	/////////////////////////////
	// CONFIG and HELP VARS
	/////////////////////////////
	
	// Config variables
	sakai.site.minHeight = 400;
	sakai.site.autosaveinterval = 17000;
	sakai.site.createChildPageByDefault = false;
	sakai.site.siteAdminJS = "/dev/_javascript/site_admin.js";
	
	// Help variables - public as some of these needs to be shared with admin section
	sakai.site.siteAdminLoaded = false;
	sakai.site.cur = 0;
	sakai.site.curScroll = false;
	sakai.site.minTop = false;
	sakai.site.last = 0;
	sakai.site.currentsite = false;
	sakai.site.meObject = false;
	sakai.site.site_info = {};
	sakai.site.site_info._pages = {};
	/*sakai.site.pages = false;
	sakai.site.pageconfiguration = false;*/
	sakai.site.pagetypes = {};
	sakai.site.pagecontents = {};
	sakai.site.myportaljson = false;
	sakai.site.myportaljsons = {};
	sakai.site.isEditingNavigation = false;
	sakai.site.currentEditView = false;
	sakai.site.timeoutid = 0;
	sakai.site.selectedpage = false;
	sakai.site.showingInsertMore = false;
	sakai.site.inEditView = false;
	sakai.site.versionHistoryNeedsReset = false;
	
	// URLs
	sakai.site.urls = {
		CURRENT_SITE_ROOT: function() { return Config.URL.SDATA_FETCH + "/sites/" + sakai.site.currentsite.id + "/"; },
		CURRENT_SITE_PAGES: function() { return Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_pages/" + sakai.site.selectedpage.split("/").join("/_pages/")); },
		WEBPAGE_CONTENT: function() { return Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_pages/" + sakai.site.selectedpage.split("/").join("/_pages/")) + "/content"; },
		WEBPAGE_CONTENT_AUTOSAVE_FULL: function() { return Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_pages/" + sakai.site.selectedpage.split("/").join("/_pages/")) + "/_content"; },
		CURRENT_SITE_OBJECT : function() { return Config.URL.SITE_GET_SERVICE + "/sites/" + sakai.site.currentsite; },
		PAGE_CONFIGURATION: function() { return Config.URL.SITE_PAGECONFIGURATION.replace(/__SITEID__/, sakai.site.currentsite.id); },
		SITE_NAVIGATION: function() { return Config.URL.SITE_NAVIGATION.replace(/__SITEID__/, sakai.site.currentsite.id); },
		SITE_NAVIGATION_CONTENT : function() { return Config.URL.SITE_NAVIGATION_CONTENT.replace(/__SITEID__/, sakai.site.currentsite.id); },
		LOGIN : function() { return Config.URL.GATEWAY_URL + "?url=" + $.URLEncode(document.location.pathname + document.location.search + document.location.hash); },
		PRINT_PAGE: function() { Config.URL.SITE_PRINT_URL.replace(/__CURRENTSITENAME__/, sakai.site.currentsite.name); },
		SITE_URL: function() { return Config.URL.SITE_URL_SITEID.replace(/__SITEID__/,sakai.site.currentsite.id); },
		PAGE_CONFIGURATION_PREFERENCE: function() { return Config.URL.SITE_CONFIGFOLDER.replace(/__SITEID__/, sakai.site.currentsite.id); },
		SELECTED_PAGE_STATE : function() { return Config.URL.SDATA_FETCH + "/sites/" + sakai.site.currentsite.id + "/pages/" + sakai.site.selectedpage + "/state"; }
	};
	
	
	// Cache all HTML elements which are ID lookups in jQuery
	// This has several advantages:
	//	-it allows remapping of html IDs easily
	//	-ensures that only one DOM access is made for each element
	//	-$ in the beginning reminds us that it is a jQuery wrapped set
	
	var $site_management = $("#site_management");
	var $site_management_members_link = $("#site_management_members_link");
	var $site_management_basic_link = $("#site_management_basic_link");
	var $site_management_appearance_link = $("#site_management_appearance_link");
	var $site_settings_link = $("#site_settings_link");
	var $li_edit_page_divider = $("#li_edit_page_divider");
	var $li_edit_page = $("#li_edit_page");
	var $add_a_new = $("#add_a_new");
	var $initialcontent = $("#initialcontent");
	var $page_nav_content = $("#page_nav_content");
	var $sitetitle = $("#sitetitle");
	var $widget_chat = $("#widget_chat");
	var $loginLink = $("#loginLink");
	var $insert_more_menu = $("#insert_more_menu");
	var $more_menu = $("#more_menu");
	var $pagetitle = $("#pagetitle");
	var $webpage_edit = $("#webpage_edit");
	var $dashboard_edit = $("#dashboard_edit");
	var $tool_edit = $("#tool_edit");
	var $sidebar_content_pages = $("#sidebar-content-pages");
	var $main_content_div = $("#main-content-div");
	
	
	
	/////////////////////////////
	// HELP FUNCTIONS
	/////////////////////////////
	
	/**
	 * Escape page ID
	 * @param {String} pageid
	 * @return {String} escaped page ID
	 */
	sakai.site.escapePageId = function(pageid){
		var escaped = pageid.replace(/ /g, "\\%20");
		escaped = pageid.replace(/[.]/g, "\\\\\\.");
		escaped = pageid.replace(/\//g, "\\\/");
		return escaped;
	};
	
	
	/**
	 * Get document height
	 * @param {Object} doc
	 * @return {Int} height of supplied document
	 */
	sakai.site.getDocHeight = function(doc){
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
	};
	
	
	/**
	 * Clone an object
	 * @param {Object} obj
	 * @return {Object} cloned object
	 */
	sakai.site.clone =  function(obj){
		if (obj === null || typeof(obj) != 'object') {
			return obj;
		}
		else {
			return jQuery.extend(true, {}, obj);
		}
	};
	
	
	/**
	 * Transform a date into more readable date string
	 * @param {Object} day
	 * @param {Object} month
	 * @param {Object} year
	 * @param {Object} hour
	 * @param {Object} minute
	 * @return {String} formatted date string
	 */
	sakai.site.transformDate = function(day, month, year, hour, minute){
		var string = "";
		var months_lookup = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"};
		string += months_lookup[month] + " " + day + ", " + (1900 + year) + " " + ("00" + hour).slice(-2) + ":" + ("00" + minute).slice(-2);
		return string;
	};

	
	
	
	
	/////////////////////////////
	// LOADING
	/////////////////////////////
	
	/**
	 * Main load flow - loads up all the data needed for sites and sets the visibility of html elements
	 * @return void
	 */
	var loadControl = function() {
		
		var siteid = document.location.pathname.split("/")[document.location.pathname.split("/").length - 1];
		sakai.site.currentsite = siteid.split(".")[0];
		$.ajax({
			//url: sakai.site.urls.CURRENT_SITE_OBJECT(),
			url: "/sites/" + sakai.site.currentsite + ".json",
			cache: false,
			async: false,
			success: function(response){
				sakai.site.currentsite = $.evalJSON(response);
				
				// Save current site to Recent Sites
				saveToRecentSites(response);
				
			},
			error: function(httpstatus){
				if (httpstatus === 401) {
					document.location = Config.URL.GATEWAY_URL;
				}
				else {
					alert("site.js: Could not load site object. \n HTTP status code: " + httpstatus);
				}
			}
		});
		
		
		// Adjust links if not on dev
		if (!sakai.site.currentsite) {
			document.location = "/dev/";
		} else {
			var sitepath = sakai.site.currentsite.id;
			$site_management_members_link.attr("href", $site_management_members_link.attr("href") + sitepath);
			$site_management_basic_link.attr("href", $site_management_basic_link.attr("href") + sitepath);
			$site_management_appearance_link.attr("href", $site_management_appearance_link.attr("href") + sitepath);
			$site_settings_link.attr("href", $site_settings_link.attr("href") + "?site=" + sitepath);
		}
	
		// Fill up ME object which contains user info
		sakai.site.meObject = sdata.me;
		
		// Determine whether the user is mantainer, if yes show and load admin elements
		var collaboratorgroup = "g-" + sakai.site.currentsite.id + "-collaborators";
		for (var i = 0; i < sdata.me.user.subjects.length; i++) {
			if (sdata.me.user.subjects[i] === collaboratorgroup) {
			
				// Show admin elements
				$li_edit_page_divider.show();
				$li_edit_page.show();
				$add_a_new.show();
				$site_management.show();
				//$(".page_nav h3").css("padding-top", "10px");
				
				// Load admin part from a separate file
				$.Load.requireJS(sakai.site.siteAdminJS);
				
				break;
			
			}
		}
		// Check user's login status
		if (sakai.site.meObject.user.userid){
			$("#loginLink").hide();
			} else {
				$(".explore_nav").hide();
				$widget_chat.hide();
				sakai._isAnonymous = true;
				$loginLink.show();
			}
		
		// Show initial content and display site title
		$initialcontent.show();
		$sitetitle.text(sakai.site.currentsite.name);
		
		// Refresh site_info object
		sakai.site.refreshSiteInfo();
		
		// Load site navigation
		sakai.site.loadSiteNavigation();
		
	};
	
	// Load Navigation
	sakai.site.loadSiteNavigation = function() {
		// Load site navigation
		$.ajax({
			url: sakai.site.urls.SITE_NAVIGATION_CONTENT(),
			cache: false,
			async: false,
			success: function(response){
				sakai.site.pagecontents._navigation = response;
				$page_nav_content.html(response);
				sdata.widgets.WidgetLoader.insertWidgets("page_nav_content",null,sakai.site.currentsite.id + "/_widgets");
				History.history_change();
			},
			error: function(httpstatus){
				History.history_change();
				if (httpstatus === 401) {
					document.location = Config.URL.GATEWAY_URL;
				}
				else {
					alert("site.js: Could not load site navigation content. \n HTTP status code: " + httpstatus);
				}
			}
		});
	};
	
	
	/**
	 * Callback function to be executed when navigation widget is loaded
	 * @return void
	 */
	sakai.site.onNavigationLoaded = function(){
		// Render navigation
		try {
			sakai._navigation.renderNavigation(sakai.site.selectedpage, sakai.site.site_info._pages);
		} catch (error1){
				alert("site.js: An error occured while trying to render the navigation widget: " + error1);
			}
		
	};
		
	
	/**
	 * Callback function to inform when admin part is loaded
	 * @return void
	 */
	sakai.site.onAdminLoaded = function(){
		sakai.site.siteAdminLoaded = true;
		
		// Init site admin
		sakai.site.site_admin();
		
	};
	
	
	
	/**
	 * Function which (re)-loads the information available on a site
	 * @return void
	 */
	sakai.site.refreshSiteInfo = function(pageToOpen) {
		
		// NEW !!
		// Load site information
		$.ajax({			
			url: Config.URL.GENERAL_SEARCH_SERVICE,
			cache: false,
			async: false,
			data: {
				"path": "/sites/" + sakai.site.currentsite.id,
				"items": 255
			},
			success: function(response) {
				
				// Init, convert response to JS object
				var temp = $.evalJSON(response);
				temp = temp.results;
				
				// Sort site objects by their path
				var compareURL = function(a,b) {
					return a.path>b.path ? 1 : a.path<b.path ? -1 : 0;
				}
				temp.sort(compareURL);
								
				// Create site_info object, the unique key being the partial path of the page from the root of the site 
				// This will also keep the alphabetical order
				sakai.site.site_info["_pages"] = {};
				for (var i=0, j=temp.length; i<j; i++) {
					
					// Create key
					var site_info_key = temp[i].path.replace("/sites/"+sakai.site.currentsite.id+"/_pages/", "").replace(/\/_pages\//g,"/");
					sakai.site.site_info["_pages"][site_info_key] = temp[i];
				}
				
				// Create a helper function which returns the number of pages
				sakai.site.site_info.number_of_pages = function() {
					var counter = 0;
					for (var i in sakai.site.site_info._pages) {
						counter++;
					}
					return counter;
				}
				
				if (pageToOpen){
					// Open page
					sakai.site.openPage(pageToOpen);		
				}
				
			},
			error: function(httpstatus) {
				sakai.site.site_info = {};
				if (httpstatus === 401) {
					document.location = Config.URL.GATEWAY_URL;
				}
				else {
					alert("site.js: Could not load site info. \n HTTP status code: " + httpstatus);
				}
				
			}
			
		});
	};
	
	var doCorrectSort = function(a,b){
		if (parseInt(a.position) > parseInt(b.position)){
			return 1;
		} else if (parseInt(a.position) < parseInt(b.position)){
			return -1; 
		} else {
			return 0;
		}
	}
	
	
	
	
	/////////////////////////////
	// RECENT SITES
	/////////////////////////////
	
	/**
	 * Save to Recent Sites - This function also filter out the current site and writes the data out in JSON format
	 * @param {Object} response
	 * @return void
	 */
	var saveToRecentSites = function(response){
		
		var items = {};
		var site = $.evalJSON(response).id;
		
		$.ajax({
		   	url : "/_user/private/" + sdata.me.user.userStoragePrefix + "recentsites.json",
			cache: false,
			success : function(data) {
				
				items = $.evalJSON(data);
				
				//Filter out this site
				var index = -1;
				for (var i = 0, j = items.items.length; i<j; i++){
					if (items.items[i] == site){
						index = i;
					}
				}
				if (index > -1){
					items.items.splice(index,1);
				}
				items.items.unshift(site);
				items.items = items.items.splice(0,5);
				
				// Write
				sdata.widgets.WidgetPreference.save("/_user/private/" + sdata.me.user.userStoragePrefix.substring(0, sdata.me.user.userStoragePrefix.length - 1), "recentsites.json", $.toJSON(items), function(success){});
			},
			error : function(httpstatus){
				items.items = [];
				items.items.unshift(site);
				
				// Write
				sdata.widgets.WidgetPreference.save("/_user/private/" + sdata.me.user.userStoragePrefix.substring(0, sdata.me.user.userStoragePrefix.length - 1), "recentsites.json", $.toJSON(items), function(success){});
			}
		});
		
	};
	
	
	/////////////////////////////
	// VERSION HISTORY
	/////////////////////////////
	
	/**
	 * Reset version history
	 * @return void
	 */
	sakai.site.resetVersionHistory = function(){
		
		try {
			if (sakai.site.selectedpage) {
				$("#revision_history_container").hide();
				$("#content_page_options").show();
				$("#" + sakai.site.escapePageId(sakai.site.selectedpage)).html(sakai.site.pagecontents[sakai.site.selectedpage]);
				sdata.widgets.WidgetLoader.insertWidgets(sakai.site.selectedpage.replace(/ /g, "%20"),null,sakai.site.currentsite.id + "/_widgets");
			}
		} catch (err){
			// Ignore	
		}
		
	};

	
	/////////////////////////////
	// PAGE OPEN AND DISPLAY FUNCTIONS
	/////////////////////////////
	
	/**
	 * Open page H
	 * @param {String} pageid
	 * @return void
	 */
	sakai.site.openPageH = function(pageid){
		
		// Vars
		var pageType = false;
		
		// Reset version history, but only if version version history has been opened
		if (sakai.site.versionHistoryNeedsReset) {
			sakai.site.resetVersionHistory();
			sakai.site.versionHistoryNeedsReset = false; 
		}
		
		
		// Reset flags
		sakai.site.showingInsertMore = false;
		sakai.site.inEditView = false;
		
				
		// If no pageid is supplied, default to the first available page
		if (!pageid) {
			var lowest = false;
			for (var i in sakai.site.site_info._pages) {
				if (lowest === false || parseInt(sakai.site.site_info._pages[i].position) < lowest){
					pageid = i;
					lowest = parseInt(sakai.site.site_info._pages[i].position);
				}
			}
		}
		
		//Store currently selected page
		sakai.site.selectedpage = pageid;
		
		// Get page type
		pageType = sakai.site.site_info._pages[pageid].type;
		
		// Set page title
		$pagetitle.text(sakai.site.site_info._pages[pageid].title);
		
		
		
		// Set login link
		$loginLink.attr("href", sakai.site.urls.LOGIN());
		
		// UI setup
		$webpage_edit.hide();
		$dashboard_edit.hide();
		$tool_edit.hide();
		$insert_more_menu.hide();
		$more_menu.hide();
		$sidebar_content_pages.show();
		$main_content_div.children().css("display","none");
		//sakai.dashboard.hidepopup();
		
		if ($("#main-content-div #" + sakai.site.escapePageId(sakai.site.selectedpage)).length > 0) {
			
			// If page has been opened
			
			// Show page
			$("#" + sakai.site.escapePageId(pageid)).show();
			
			// Re-render Site Navigation to reflect changes if navigation widget is already loaded
			try {
				sakai._navigation.renderNavigation(sakai.site.selectedpage, sakai.site.site_info._pages);
			} catch (error){
				
			}
		
		}
		else {
			// If page has not been opened
			
			// Show 404 error if page type can not be determined, else store page type
			if (pageType === false) { 
				$("#error_404").show();
			} else { 
				sakai.site.pagetypes[sakai.site.selectedpage] = pageType; 
				}
			
			switch (pageType) {
				
				// is a Dashboard
				case "dashboard":
					// Create container elements
					var el = document.createElement("div");
					el.id = sakai.site.selectedpage.replace(/ /g, "%20");
					el.className = "container_child";
					var cel = document.createElement("div");
					cel.id = "widgetscontainer";
					cel.style.padding = "0px 7px 0px 7px";
					el.appendChild(cel);
					$("#container").appendChild(el);
					$.ajax({
						url: sakai.site.urls.SELECTED_PAGE_STATE(),
						cache: false,
						success: function(data){
							decideDashboardExists(data, true, el);
						},
						error: function(status){
							decideDashboardExists(status, false, el);
						}
					});
					break;
				
				// is a Webpage 
				case "webpage":
					
					$.ajax({
						url: sakai.site.urls.WEBPAGE_CONTENT(),
						cache: false,
						success: function(response){
							displayPage(response, true);
						},
						error: function(httpstatus){
							displayPage(httpstatus, false);
						}
					});
					break;
			}
		}
	};
	
	
	
	/**
	 * Opens a page
	 * @param {String} pageid
	 * @return void
	 */
	sakai.site.openPage = function(pageid){
		
		document.location = "#" + pageid;
		
	};
	
	
	/**
	 * Displays a page
	 * @param {Object} response
	 * @param {Boolean} exists
	 * @return void
	 */
	var displayPage = function(response, exists){
		
		if (exists) {
			// Page exists
			
			// Store page content
			sakai.site.pagecontents[sakai.site.selectedpage] = response;
			
			// If page already exists in DOM just show it, else create it
			var element_to_test = $("#" + sakai.site.escapePageId(sakai.site.selectedpage));
			if (element_to_test.length > 0){
				element_to_test.show();
			} else
				{
					// Create element
					var el = document.createElement("div");
					el.id = sakai.site.selectedpage// sakai.site.escapePageId(sakai.site.selectedpage);
					el.className = "content";
					el.innerHTML = response;
					
					// Add element to the DOM 
					$main_content_div.append(el);
				}
			
			// Insert widgets
			sdata.widgets.WidgetLoader.insertWidgets(sakai.site.selectedpage,null,sakai.site.currentsite.id + "/_widgets");
			
			// Re-render Site Navigation to reflect changes if navigation widget is already loaded
			try {
				sakai._navigation.renderNavigation(sakai.site.selectedpage, sakai.site.site_info._pages);
				// alert(sakai.site.selectedpage);
				// alert($.toJSON(sakai.site.site_info._pages));
			} catch (error){
				
			}
			
			
		}
		else {
			// Page does not exist
			
			// Create error element
			sakai.site.pagecontents[sakai.site.selectedpage] = "";
			var errorel = document.createElement("div");
			errorel.id = sakai.site.escapePageId(sakai.site.selectedpage);
			errorel.className = "content";
			errorel.innerHTML = "";
			
			// Add error element to the DOM
			$main_content_div.appendChild(errorel);
		}
		
	};
	
	
	
	
	/////////////////////////////
	// PRINT PAGE
	/////////////////////////////
	
	/**
	 * Bring up a print page popup window for printing
	 * @retun void
	 */
	var printPage = function(){
		
		// Save page to be printed into my personal space
		var escaped = sakai.site.escapePageId(sakai.site.selectedpage);
		var content = $("#" + escaped).html();
		content = "<div class='content'>" + content + "</div>";
		
		var arrLinks = [];
		var links = $("link");
		for (var i = 0; i < links.length; i++){
			if (links[i].type === "text/css"){
				arrLinks.push(links[i].href);
			}
		}
		
		$.ajax({
			url: "/_user/private/print",
			type: "POST",
			data: {
				"css": arrLinks,
				"content": content
			},
			success: function(data){
				// Open a popup window with printable content
				var day = new Date();
				var id = day.getTime();
				window.open("/dev/print.html", id, "toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=800,height=600,left = 320,top = 150");
			}
		});
		
	};
	
	
	
	
	/////////////////////////////
	// GLOBAL EVENT LISTENERS
	/////////////////////////////
	
	// Bind print page click
	$("#print_page").bind("click", function(ev){
		printPage();
	});
	
	// Bind "Back to top" link click
	$("#back_to_top").bind("click", function(){
		window.scrollTo(0,0);
	});
	

	
	
	/////////////////////////////
	// INIT
	/////////////////////////////
	sakai.site.doInit = function() {
		
		// Start loading page
		loadControl();
		
	};
	
	// Start
	sakai.site.doInit();

};

sdata.container.registerForLoad("sakai.site");