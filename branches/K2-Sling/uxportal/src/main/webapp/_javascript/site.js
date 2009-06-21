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
	sakai.site.siteAdminJS = "_javascript/site_admin.js";
	
	// Help variables - public as some of these needs to be shared with admin section
	sakai.site.siteAdminLoaded = false;
	sakai.site.cur = 0;
	sakai.site.curScroll = false;
	sakai.site.minTop = false;
	sakai.site.last = 0;
	sakai.site.currentsite = false;
	sakai.site.meObject = false;
	sakai.site.pages = false;
	sakai.site.pageconfiguration = false;
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
		CURRENT_SITE_ROOT: function() { return Config.URL.SDATA_FETCH + "/" + sakai.site.currentsite.id + "/"; },
		CURRENT_SITE_PAGES: function() { return Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_pages/" + sakai.site.selectedpage.split("/").join("/_pages/")); },
		WEBPAGE_CONTENT: function() { return Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_pages/" + sakai.site.selectedpage.split("/").join("/_pages/")) + "/content"; },
		WEBPAGE_CONTENT_AUTOSAVE_FULL: function() { return Config.URL.SDATA_FETCH_PLACEMENT_URL.replace(/__PLACEMENT__/, sakai.site.currentsite.id + "/_pages/" + sakai.site.selectedpage.split("/").join("/_pages/")) + "/_content"; },
		CURRENT_SITE_OBJECT : function() { return Config.URL.SITE_GET_SERVICE + "/" + sakai.site.currentsite; },
		PAGE_CONFIGURATION: function() { return Config.URL.SITE_PAGECONFIGURATION.replace(/__SITEID__/, sakai.site.currentsite.id); },
		SITE_NAVIGATION: function() { return Config.URL.SITE_NAVIGATION.replace(/__SITEID__/, sakai.site.currentsite.id); },
		SITE_NAVIGATION_CONTENT : function() { return Config.URL.SITE_NAVIGATION_CONTENT.replace(/__SITEID__/, sakai.site.currentsite.id); },
		LOGIN : function() { return Config.URL.GATEWAY_URL + "?url=" + $.URLEncode(document.location.pathname + document.location.search + document.location.hash); },
		PRINT_PAGE: function() { Config.URL.SITE_PRINT_URL.replace(/__CURRENTSITENAME__/, sakai.site.currentsite.name); },
		SITE_URL: function() { return Config.URL.SITE_URL_SITEID.replace(/__SITEID__/,sakai.site.currentsite.id); },
		PAGE_CONFIGURATION_PREFERENCE: function() { return Config.URL.SITE_CONFIGFOLDER.replace(/__SITEID__/, sakai.site.currentsite.id); },
		SELECTED_PAGE_STATE : function() { return Config.URL.SDATA_FETCH + "/" + sakai.site.currentsite.id + "/pages/" + sakai.site.selectedpage + "/state"; }
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
			url: "/" + sakai.site.currentsite + ".json",
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
		if (sakai.site.meObject.preferences && sakai.site.meObject.preferences.subjects) {
			for (var i = 0, j = sakai.site.currentsite.owners.length; i<j; i++) {
				if (sakai.site.currentsite.owners[i] == sdata.me.preferences.uuid){							
						
						// Show admin elements
						$li_edit_page_divider.show();
						$li_edit_page.show();
						$add_a_new.show();
						$site_management.show();
						$(".page_nav h3").css("padding-top","10px");
						
						// Load admin part from a separate file
						$.Load.requireJS(sakai.site.siteAdminJS);	
						
						break;
				}
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
		
		// Load page configuration
		$.ajax({
			url: sakai.site.urls.PAGE_CONFIGURATION(),
			cache: false,
			async: false,
			success: function(response){
				sakai.site.pages = $.evalJSON(response);
				sakai.site.pageconfiguration = sakai.site.pages;
			},
			error: function(httpstatus){
				sakai.site.pages = {};
				sakai.site.pages.items = {};
				sakai.site.pageconfiguration = sakai.site.pages;
				if (httpstatus === 401) {
					document.location = Config.URL.GATEWAY_URL;
				}
				else {
					alert("site.js: Could not load page configuration. \n HTTP status code: " + httpstatus);
				}
			}
		});
		
		// Load site navigation
		sakai.site.loadSiteNavigation();
		
	};
	
	sakai.site.loadSiteNavigation = function() {
		// Load site navigation
		$.ajax({
			url: sakai.site.urls.SITE_NAVIGATION_CONTENT(),
			cache: false,
			async: false,
			success: function(response){
				sakai.site.pagecontents._navigation = response;
				$page_nav_content.html(response);
				sdata.widgets.WidgetLoader.insertWidgets("page_nav_content");
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
			sakai._navigation.renderNavigation(sakai.site.selectedpage, sakai.site.pages);
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
		//'site2.js: site admin finished loading succesfuly');
		
		// Init site admin
		sakai.site.site_admin();
		
	};
	
	
	
	/////////////////////////////
	// RECENT SITES
	/////////////////////////////
	
	/**
	 * Save to Recent Sites - This function also filter out the current site and writes the data out in JSON format
	 * @param {Object} response
	 * @return void
	 */
	var saveToRecentSites = function(response){
		
		$.ajax({
		   	url : Config.URL.RECENT_SITES_URL,
			cache: false,
			success : function(data) {
				
				var items = $.evalJSON(data);
				var site = $.evalJSON(response).location.substring(1);
				
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
				sdata.widgets.WidgetPreference.save("/sdata/p/", "recentsites.json", $.toJSON(items), function(success){});
			},
			error : function(httpstatus){
				//console.log("site.js: Could not load Recent Sites data. HTTP Status: " + httpstatus);
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
				sdata.widgets.WidgetLoader.insertWidgets(sakai.site.selectedpage.replace(/ /g, "%20"));
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
		
		// Set pageid if not supplied, set page title and get page type
		for (var i = 0, j = sakai.site.pages.items.length; i<j; i++){
			
			if ((!pageid) && (sakai.site.pages.items[i].id.indexOf("/") == -1)) {
					pageid = sakai.site.pages.items[i].id;
				}
			
			if (sakai.site.pages.items[i].id == pageid){
				$pagetitle.text(sakai.site.pages.items[i].title);
				pageType = sakai.site.pages.items[i].type;
				break;
			}
		}
		
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
		
		//Store currently selected page
		sakai.site.selectedpage = pageid;
		sakai.site.pages.selected = pageid;
		
		if (pageid) {
			var page_id_to_test = pageid.replace(/ /g, "%20");
		} else {
			pageid = "";
		}
		if ($("#main-content-div[id='" + page_id_to_test + "']").length > 0) {
			
			// If page has been opened
			
			// Get myportal data 
			sakai.site.myportaljson = sakai.site.myportaljsons[pageid];
			
			// If there is an edit part associated with the page type, show it
			if ($("#" + sakai.site.pagetypes[pageid] + "_edit").length > 0) {
				$("#" + sakai.site.pagetypes[pageid] + "_edit").show();
			}
			
			// Show page
			$("#" + sakai.site.escapePageId(pageid)).show();
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
			var element_to_test = document.getElementById(sakai.site.escapePageId(sakai.site.selectedpage));
			if (element_to_test){
				element_to_test.style.display = "block";
			} else
				{
					// Create element
					var el = document.createElement("div");
					el.id = sakai.site.escapePageId(sakai.site.selectedpage);
					el.className = "content";
					el.innerHTML = response;
					
					// Add element to the DOM 
					$main_content_div.append(el);
				}
			
			// Insert widgets
			sdata.widgets.WidgetLoader.insertWidgets(sakai.site.selectedpage);
			
			// Re-render Site Navigation to reflect changes if navigation widget is already loaded
			try {
				sakai._navigation.renderNavigation(sakai.site.selectedpage, sakai.site.pages);
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
		sdata.widgets.WidgetPreference.save("/sdata/p/","_print",content,function(data){
		
			// Open a popup window with printable content
			var day = new Date();
			var id = day.getTime();
			window.open(sakai.site.urls.PRINT_PAGE(), id, "toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=800,height=600,left = 320,top = 150");
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