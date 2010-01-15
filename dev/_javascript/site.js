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
	
	var currentSettingsOpen = false;
	var startSaving = true;
	
	// Config variables
	sakai.site.minHeight = 400;
	sakai.site.autosaveinterval = 17000;
	sakai.site.createChildPageByDefault = false;
	sakai.site.siteAdminJS = "/dev/_javascript/site_admin.js";
	
	// Help variables - public as some of these needs to be shared with admin section
	sakai.site.cur = 0;
	sakai.site.curScroll = false;
	sakai.site.minTop = false;
	sakai.site.last = 0;
	sakai.site.currentsite = false;
	sakai.site.meObject = false;
	sakai.site.isCollaborator = false;
	sakai.site.site_info = {};
	sakai.site.site_info._pages = {};
	/*sakai.site.pages = false;
	sakai.site.pageconfiguration = false;*/
	sakai.site.pagetypes = {};
	sakai.site.pagecontents = {};
	sakai.site.portaljson = false;
	sakai.site.portaljsons = {};
	sakai.site.isEditingNavigation = false;
	sakai.site.currentEditView = false;
	sakai.site.timeoutid = 0;
	sakai.site.selectedpage = false;
	sakai.site.showingInsertMore = false;
	sakai.site.inEditView = false;
	sakai.site.versionHistoryNeedsReset = false;
	
	// Add Goodies related fields
	var addGoodiesDialog = "#add_goodies_dialog";
	var addGoodiesTrigger = '#add-goodies';
	var addGoodiesListContainer = "#add_goodies_body";
	var addGoodiesListTemplate = "add_goodies_body_template";
	var goodiesAddButton = ".goodies_add_button";
	var goodiesRemoveButton = ".goodies_remove_button";
	var addRow = "#row_add_";
	var removeRow = "#row_remove_";
	
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
		PAGE_CONFIGURATION_PREFERENCE: function() { return Config.URL.SITE_CONFIGFOLDER.replace(/__SITEID__/, sakai.site.currentsite.id); }
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
	var $site_management_files_link = $("#site_management_files_link");
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
	var $dashboard_options = $(".dashboard_options");
	
	
	/////////////////////////////
	// HELP FUNCTIONS
	/////////////////////////////
	
	/**
	 * Escape page ID
	 * @param {String} pageid
	 * @return {String} escaped page ID
	 */
	sakai.site.escapePageId = function(pageid){
		var regexp = new RegExp("[^a-z0-9_-]", "gi");
		var escaped = pageid.replace(regexp,"_-_-_-_-_");
		//var escaped = pageid.replace(/ /g, "\\%20");
		//escaped = pageid.replace(/[.]/g, "\\\\\\.");
		//escaped = pageid.replace(/\//g, "\\\/");
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
		if (obj === null || typeof(obj) !== 'object') {
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
		string += months_lookup[month] + " " + day + ", " + year + " " + ("00" + hour).slice(-2) + ":" + ("00" + minute).slice(-2);
		return string;
	};


	/////////////
	// LOADING //
	/////////////

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
			error: function(xhr, textStatus, thrownError) {
				var httpstatus = xhr.status;
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
			$site_management_files_link.attr("href", $site_management_files_link.attr("href") + sitepath);
		}

		// Determine whether the user is maintainer, if yes show and load admin elements
		sakai.site.isCollaborator = sakai.lib.site.authz.isUserMaintainer(sakai.site.currentsite.id, sdata.me.user.subjects);
		if (sakai.site.isCollaborator) {
			// Show admin elements
			$li_edit_page_divider.show();
			$li_edit_page.show();
			$add_a_new.show();
			$site_management.show();

			// Load admin part from a separate file
			$.Load.requireJS(sakai.site.siteAdminJS);
		}

		// Check user's login status
		if (sdata.me.user.userid){
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
	
	/**
	 * Checks the content html string for any widget's who still have an id0 in their id.
	 * If they do, then they get a new proper ID and the original data in the repository is adjusted.
	 * @param {String} content The HTML to check.
	 * @param {String} url The url into JCR where the content originates from.
	 */
	sakai.site.ensureProperWidgetIDs = function(content, url) {
		var adjusted = false;
		var moveWidgets = [];
		// Wrap the content in a dummy div so we don't lose anything.
		var $el = $("<div>" + content + "</div>");
		$(".widget_inline", $el).each(function(){
			var splittedId = this.id.split("_");
			if (splittedId.length > 1 && splittedId[2] === "id0") {
				this.id = splittedId[0] + "_" + splittedId[1] + "_id" + Math.floor((Math.random() * 10000000));
				adjusted = true;
			}
			if (splittedId.length > 2 && splittedId[3] === "hasData") {
				// There is some existing data for this widget.
				var widgetID = "id" + Math.floor((Math.random() * 10000000));
				this.id = splittedId[0] + "_" + splittedId[1] + "_" + widgetID;
				adjusted = true;
				moveWidgets.push({
					'from': splittedId[2],
					'to': widgetID
				});
			}
		});
		// If we are not a collaborator we can't change files (duh)
		if (sakai.site.isCollaborator) {
			if (adjusted) {
				// We had to do some manipulation, save the content.
				sdata.widgets.WidgetPreference.save(url.replace("/content", ""), "content", $el.html(), null);
				for (var i = 0, j = moveWidgets.length; i < j; i++) {
					// Move all the widgets.
					var url = sakai.site.urls.CURRENT_SITE_ROOT() + "_widgets/" + moveWidgets[i].from;
					var dest = sakai.site.urls.CURRENT_SITE_ROOT() + "_widgets/" + moveWidgets[i].to;
					console.log("From: " + url + " - TO: " + dest);
					$.ajax({
						url: url,
						data: {
							":operation" : "move",
							":dest" : dest,
							"_charset_":"utf-8"
						},
						cache: false,
						type: "POST",
						success: function(response) {
							console.log(response);
						},
						error: function(xhr, textStatus, thrownError) {
							alert("Failed to move a widget: " + xhr.status);
						}
					});
				}
			}
		}
		return $el.html();
	};

	// Load Navigation
	sakai.site.loadSiteNavigation = function() {

		// Load site navigation
		$.ajax({
			url: sakai.site.urls.SITE_NAVIGATION_CONTENT(),
			cache: false,
			async: false,
			success: function(response){
				response = sakai.site.ensureProperWidgetIDs(response, sakai.site.urls.SITE_NAVIGATION_CONTENT());
				sakai.site.pagecontents._navigation = response;
				$page_nav_content.html(response);
				sdata.widgets.WidgetLoader.insertWidgets("page_nav_content",null,sakai.site.currentsite.id + "/_widgets");
				History.history_change();
			},
			error: function(xhr, textStatus, thrownError) {
				var httpstatus = xhr.status;
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
				};
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
				};
				
				if (pageToOpen){
					// Open page
					sakai.site.openPage(pageToOpen);		
				}
				
			},
			error: function(xhr, textStatus, thrownError) {
				var httpstatus = xhr.status;
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


	//////////////////
	// RECENT SITES //
	//////////////////

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
				if (sdata.me.user.userStoragePrefix) {
					sdata.widgets.WidgetPreference.save("/_user/private/" + sdata.me.user.userStoragePrefix.substring(0, sdata.me.user.userStoragePrefix.length - 1), "recentsites.json", $.toJSON(items), function(success){});
				}
			},
			error: function(xhr, textStatus, thrownError) {
				items.items = [];
				items.items.unshift(site);
				
				// Write
				if (sdata.me.user.userStoragePrefix) {
					sdata.widgets.WidgetPreference.save("/_user/private/" + sdata.me.user.userStoragePrefix.substring(0, sdata.me.user.userStoragePrefix.length - 1), "recentsites.json", $.toJSON(items), function(success){});
				}
			}
		});
	};

	/////////////////////
	// VERSION HISTORY //
	/////////////////////

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

	
	/////////////////////////////////////
	// PAGE OPEN AND DISPLAY FUNCTIONS //
	/////////////////////////////////////
	
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
				if (lowest === false || parseInt(sakai.site.site_info._pages[i].position, 10) < lowest){
					pageid = i;
					lowest = parseInt(sakai.site.site_info._pages[i].position, 10);
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
		$(".dashboard_options").hide();
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
					$.ajax({
						url: sakai.site.urls.WEBPAGE_CONTENT(),
						cache: false,
						success: function(data){
							displayDashboard(data, true);
						},
						error: function(xhr, textStatus, thrownError) {
							displayDashboard(xhr.status, false);
						}
					});
					break;
				
				// is a Webpage 
				case "webpage":
					
					$.ajax({
						url: sakai.site.urls.WEBPAGE_CONTENT(),
						cache: false,
						success: function(response){
							response = sakai.site.ensureProperWidgetIDs(response, sakai.site.urls.WEBPAGE_CONTENT());
							displayPage(response, true);
						},
						error: function(xhr, textStatus, thrownError) {
							displayPage(xhr.status, false);
						}
					});
					break;
			}
		}
	
		if (sakai.site.isCollaborator) {
			if (pageType === "dashboard") {
				$dashboard_options.show();
				$li_edit_page_divider.hide();
				$li_edit_page.hide();
			} else {
				$li_edit_page_divider.show();
				$li_edit_page.show();
			}
		}
		
		// Re-render Site Navigation to reflect changes if navigation widget is already loaded
		try {
		sakai._navigation.renderNavigation(sakai.site.selectedpage, sakai.site.site_info._pages);

		} 
		catch (error) {
		
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
	
	
	/////////////////////////////
	// DASHBOARD FUNCTIONALITY //
	/////////////////////////////
		
		
		///////////////////////
		// Add Sakai Goodies //
		///////////////////////
		
		sakai.site.dashboard = {};
		sakai.site.dashboard.addWidget = function(id){
			var w = {
				'name': id,
				'visible': 'block',
				'uid': "id" + Math.random() * 99999999999999999
			};
			$("#" + sakai.site.selectedpage).remove();
			sakai.site.portaljsons[sakai.site.selectedpage].columns.column1.push(w);
			showportal(sakai.site.portaljsons[sakai.site.selectedpage]);
			saveState();
		};

		var renderGoodiesEventHandlers = function(){
	
			/*
			 * When you click the Add button, next to a widget in the Add Goodies screen,
			 * this function will figure out what widget we chose and will hide the Add row
			 * and show the Remove row for that widget
			 */
			$(goodiesAddButton).bind("click", function(ev){
				// The expected is goodies_add_button_WIDGETNAME
				var id = this.id.split("_")[this.id.split("_").length - 1];
				$(addRow + id).hide();
				$(removeRow + id).show();
				sakai.site.dashboard.addWidget(id);
			});
			
			/*
			 * When you click the Remove button, next to a widget in the Add Goodies screen,
			 * this function will figure out what widget we chose and will hide the Remove row
			 * and show the Add row for that widget
			 */
			$(goodiesRemoveButton).bind("click", function(ev){
				// The expected id is goodies_add_button_WIDGETNAME
				var id = this.id.split("_")[this.id.split("_").length - 1];
				$(removeRow + id).hide();
				$(addRow + id).show();
				// We find the widget container itself, and then find its parent,
				// which is the column the widget is in, and then remove the widget
				// from the column
				var el = $("[id^=" + id + "]").get(0);
				var parent = el.parentNode;
				parent.removeChild(el);
				saveState();
			});
		
		};

		var renderGoodies = function(hash){

			var addingPossible = {};
			addingPossible.items = [];
			
			$(addGoodiesListContainer).html("");
			
			for (var l in Widgets.widgets) {
				var alreadyIn = false;
				// Run through the list of widgets that are already on my dashboard and decide
				// whether the current widget is already on the dashboard (so show the Remove row),
				// or whether the current widget is not on the dashboard (and thus show the Add row)
				var json = sakai.site.portaljsons[sakai.site.selectedpage];
				for (var c in json.columns) {
					for (var ii = 0; ii < json.columns[c].length; ii++) {
						if (json.columns[c][ii].name === l) {
							alreadyIn = true;
						}
					}
				}
				if (Widgets.widgets[l].siteportal) {
					var index = addingPossible.items.length;
					addingPossible.items[index] = Widgets.widgets[l];
					addingPossible.items[index].alreadyIn = alreadyIn;
				}
			}
			
			// Render the list of widgets. The template will render a remove and add row for each widget, but will
			// only show one based on whether that widget is already on my dashboard
			$(addGoodiesListContainer).html($.Template.render(addGoodiesListTemplate, addingPossible));
			renderGoodiesEventHandlers();
			
			// Show the modal dialog
			hash.w.show();
		
		};

		/*
		 * We bring up the modal dialog that contains the list of widgets I can add
		 * to my dashboard. Before it shows on the screen, we'll render the list of
		 * widgets through a TrimPath template
		 */
		$(addGoodiesDialog).jqm({
			modal: true,
			trigger: $(addGoodiesTrigger),
			overlay: 20,
			toTop: true,
			onShow: renderGoodies
		});

		/**
		 * Saves the state of the current dashboard.
		 */
		var saveState = function(){

			var o = {
				'columns': {},
				"layout": sakai.site.portaljsons[sakai.site.selectedpage].layout
			};
			if (startSaving === true) {
	
				var columns = $("#" + sakai.site.selectedpage + " .groupWrapper");
				for (var i = 0, j = columns.length; i < j; i++) {
					var col = [];
					var column = columns[i];
					for (var ii = 0, jj = column.childNodes.length; ii < jj; ii++) {
	
						try {
							var node = column.childNodes[ii];
							
							if (node && node.style && $(node).hasClass("fl-widget") && $(node).is(":visible")) {
							
								var widgetdisplay = "block";
								var nowAt = 0;
								var id = node.style.display;
								var uid = node.id.split("_")[1];
								for (var y = 0, z = node.childNodes.length; y < z; y++) {
									if (node.childNodes[y].style) {
										if (nowAt === 1) {
											if (node.childNodes[y].style.display.toLowerCase() === "none") {
												widgetdisplay = "none";
											}
											uid = node.childNodes[y].id.split("_")[0];
										}
										nowAt++;
									}
								}
	
								var c = {
									'name': node.id.split("_")[0],
									'visible': widgetdisplay,
									'uid': uid
								};
								col.push(c);
							}
						} 
						catch (err) {
							alert(err);
						}
					}
					o.columns["column" + (i + 1)] = col;
				}
	
				var isempty = true;
				for (i in o.columns) {
					if (o.columns[i].length > 0) {
						isempty = false;
					}
				}
				sakai.site.portaljsons[sakai.site.selectedpage] = o;
	
				//Save the prefs.
				sdata.widgets.WidgetPreference.save(sakai.site.urls.CURRENT_SITE_PAGES(), "content", $.toJSON(o), checkSaveStateSuccess);

			}

		};

		/**
		 * Checks if we succesfully saved the state.
		 * @param {Object} success
		 */
		var checkSaveStateSuccess = function(success){
			if (!success) {
				window.alert("Connection with the server was lost");
			} else {
				$.ajax({
					url: "/sites/" + sakai.site.currentsite.id + "/_pages/" + sakai.site.selectedpage + "/content.save.html",
					type: 'POST',
					error: function(xhr, textStatus, thrownError) {
						alert("Connection with the server was lost.");
					}
				});
			}
		};

		/**
		 * Displays a dashboard page.
		 * @param {Object} response Content retrieved from server.
		 * @param {Object} exists Wether the request was succesful or not.
		 */
		var displayDashboard = function(response, exists){
			if (exists) {
				var json = $.evalJSON(response);
				try {
					sakai.site.portaljsons[sakai.site.selectedpage] = json;
					showportal(json);
				} 
				catch (err) {
					showportal(json);
				}
			}
			else {
				// The dashboard has no content yet, create some dummy content.
				showInit();
			}
		};

		sakai.site._displayDashboard = function(response, exists) {
			displayDashboard(response, exists);
		};

		/**
		 * Functionality to show the actual columns and widgets.
		 * @param {Object} json
		 */
		var showportal = function(json){
		
			var layout = json;
			
			if (!Widgets.layouts[json.layout]) {
			
				var selectedlayout = "";
				var layoutindex = 0;
				
				for (var l in Widgets.layouts) {
					if (layoutindex === 0) {
						selectedlayout = l;
						layoutindex++;
					}
				}
				
				var columns = [];
				for (var i = 0, j = Widgets.layouts[selectedlayout].widths.length; i < j; i++) {
					columns[i] = [];
				}
				
				var initlength = 0;
				for (l in json.columns) {
					initlength++;
				}
				var newlength = Widgets.layouts[selectedlayout].widths.length;
				
				var index = 0;
				for (l in json.columns) {
					if (index < newlength) {
						for (i = 0; i < json.columns[l].length; i++) {
							columns[index][i] = {};
							columns[index][i].name = json.columns[l][i].name;
							columns[index][i].visible = json.columns[l][i].visible;
							columns[index][i].uid = json.columns[l][i].uid;
						}
						index++;
					}
				}
				
				index = 0;
				if (newlength < initlength) {
					for (l in json.columns) {
						if (index >= newlength) {
							for (i = 0; i < json.columns[l].length; i++) {
								var lowestnumber = -1;
								var lowestcolumn = -1;
								for (var iii = 0; iii < columns.length; iii++) {
									var number = columns[iii].length;
									if (number < lowestnumber || lowestnumber === -1) {
										lowestnumber = number;
										lowestcolumn = iii;
									}
								}
								var _i = columns[lowestcolumn].length;
								columns[lowestcolumn][_i] = {};
								columns[lowestcolumn][_i].name = json.columns[l][i].name;
								columns[lowestcolumn][_i].visible = json.columns[l][i].visible;
								columns[lowestcolumn][_i].uid = json.columns[l][i].uid;
							}
						}
						index++;
					}
				}
			}
			
			var final2 = {};
			final2.columns = [];
			final2.size = Widgets.layouts[layout.layout].widths.length;
			var currentindex = -1;
			var isvalid = true;
			
			try {
				for (var c in layout.columns) {
				
					currentindex++;
					index = final2.columns.length;
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
							final2.columns[index].portlets[iindex].placement = sakai.site.currentsite.id + "/_widgets";
							final2.columns[index].portlets[iindex].height = widget.height;
						}
					}
				}
				
			} 
			catch (err) {
				isvalid = false;
			}
			
			if (isvalid) {
			
				final2.me = sdata.me;
				
				var el = document.createElement("div");
				el.id = sakai.site.escapePageId(sakai.site.selectedpage);
				el.className = "content";
				el.innerHTML = $.Template.render("dashboard_container_template", final2);
				
				$main_content_div.append(el);
				
				if (sakai.site.isCollaborator) {
				
					var dashPageID = "#" + el.id;
					
					$(dashPageID + " .widget1").hover(function(over){
						var id = this.id + "_settings";
						$("#" + id).show();
					}, function(out){
						if ($("#widget_settings_menu").css("display") === "none" || this.id != currentSettingsOpen) {
							var id = this.id + "_settings";
							$("#" + id).hide();
						}
					});
					
					$(dashPageID + " .settings").live("click", function(ev){
					
						$("#settings_settings").hide();
						
						var splitted = this.id.split("_");
						if (splitted[0] + "_" + splitted[1] == currentSettingsOpen) {
							$("#widget_" + currentSettingsOpen + "_settings").hide();
						}
						currentSettingsOpen = splitted[0] + "_" + splitted[1];
						var widgetId = splitted[0];
						
						if (Widgets.widgets[widgetId] && Widgets.widgets[widgetId].hasSettings) {
							$("#settings_settings").show();
						}
						
						var el = $("#" + currentSettingsOpen.split("_")[1] + "_container");
						if (el.css('display') == "none") {
							$("#settings_hide_link").text("Show");
						}
						else {
							$("#settings_hide_link").text("Hide");
						}
						
						var x = $(this).position().left;
						var y = $(this).position().top;
						$("#widget_settings_menu").css("left", x - $(dashPageID + " #widget_settings_menu").width() + 23 + "px");
						$("#widget_settings_menu").css("top", y + 18 + "px");
						$("#widget_settings_menu").show();
					});
					
					$(".more_option").hover(function(over){
						$(this).addClass("selected_option");
					}, function(out){
						$(this).removeClass("selected_option");
					});
					
					$("#settings_remove").bind("mousedown", function(ev){
						var id = currentSettingsOpen;
						var el = document.getElementById(id);
						var parent = el.parentNode;
						parent.removeChild(el);
						saveState();
						$("#widget_settings_menu").hide();
						$(" #" + currentSettingsOpen + "_settings").hide();
						currentSettingsOpen = false;
						return false;
					});
					
					$("#settings_hide").bind("mousedown", function(ev){
					
						var el = $(dashPageID + " #" + currentSettingsOpen.split("_")[1] + "_container");
						if (el.css('display') == "none") {
							el.show();
						}
						else {
							el.hide();
						}
						saveState();
						
						$("#widget_settings_menu").hide();
						$("#" + currentSettingsOpen + "_settings").hide();
						currentSettingsOpen = false;
						return false;
					});
					
					$("#settings_settings").bind("mousedown", function(ev){
						var generic = "widget_" + currentSettingsOpen + "_" + sakai.site.currentsite.id + "/_widgets";
						var id = currentSettingsOpen.split("_")[1];
						var old = document.getElementById(id);
						var newel = document.createElement("div");
						newel.id = generic;
						newel.className = "widget_inline";
						old.parentNode.replaceChild(newel, old);
						$("#widget_settings_menu").hide();
						currentSettingsOpen = false;
						sdata.widgets.WidgetLoader.insertWidgets(newel.parentNode.id, true);
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
						styles: {
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
					fluid.reorderLayout("#" + el.id, options);
				}
				
				
				sdata.widgets.WidgetLoader.insertWidgets(el.id);
				
			}
			else {
				showInit();
			}
			
		};
		
		/**
		 * If there is no prefered state for this site then we show a default one.
		 */
		var showInit = function(){
		
			var toAdd = [];
			var added = [];
			var grouptype = "General";
			
			var columns = [];
			var layout = "dev";
			var olayout = null;
			
			// The default widgets.
			columns[0] = [];
			columns[1] = [];
			columns[0][0] = "sitemembers";
			
			var jsonobj = {};
			jsonobj.columns = {};
			
			for (var i = 0, j = columns.length; i < j; i++) {
				jsonobj.columns["column" + (i + 1)] = [];
				for (var ii = 0, jj = columns[i].length; ii < jj; ii++) {
					var index = jsonobj.columns["column" + (i + 1)].length;
					jsonobj.columns["column" + (i + 1)][index] = {};
					jsonobj.columns["column" + (i + 1)][index].name = columns[i][ii];
					jsonobj.columns["column" + (i + 1)][index].visible = "block";
					jsonobj.columns["column" + (i + 1)][index].uid = 'id' + Math.round(Math.random() * 10000000000000);
				}
			}
			
			// Save the state.
			jsonobj.layout = layout;
			portaljson = jsonobj;
			sakai.site.portaljsons[sakai.site.selectedpage] = jsonobj;
			showportal(sakai.site.portaljsons[sakai.site.selectedpage]);
			saveState();
		};
		
		
		/////////////////////////////
		// Change dashboard layout //
		/////////////////////////////
		
		var tobindtolayoutpicker = function(){
			$(".layout-picker").bind("click", function(ev){
				var selected = this.id.split("-")[this.id.split("-").length - 1];
				var newjson = {};
				newjson.layouts = Widgets.layouts;
				newjson.selected = selected;
				currentselectedlayout = selected;
				$("#layouts_list").html($.Template.render("layouts_template", newjson));
				tobindtolayoutpicker();
			});
		};
		
		$("#select-layout-finished").live("click", function(ev){
			if (currentselectedlayout === sakai.site.portaljsons[sakai.site.selectedpage].layout) {
				$("#overlay-lightbox-layout").hide();
				$("#overlay-content-layout").hide();
			}
			else {
				sakai.site.portaljsons[sakai.site.selectedpage].layout = currentselectedlayout;
				saveState();
				$main_content_div.children().remove();
				showportal(sakai.site.portaljsons[sakai.site.selectedpage]);
				$("#change_layout_dialog").jqmHide();
			}
		});
		
		
		var renderLayouts = function(hash){
			var newjson = {};
			var layout = sakai.site.portaljsons[sakai.site.selectedpage].layout;
			newjson.layouts = Widgets.layouts;
			newjson.selected = layout;
			currentselectedlayout = layout;
			$("#layouts_list").html($.Template.render("layouts_template", newjson));
			tobindtolayoutpicker();
			hash.w.show();
		};
		
		$("#change_layout_dialog").jqm({
			modal: true,
			trigger: $('#edit-layout'),
			overlay: 20,
			toTop: true,
			onShow: renderLayouts
		});
		
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
					el.id = sakai.site.selectedpage; // sakai.site.escapePageId(sakai.site.selectedpage);
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
			$main_content_div.append(errorel);
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
		for (var i = 0, j = links.length; i < j; i++){
			if (links[i].type === "text/css"){
				arrLinks.push(links[i].href);
			}
		}
		
		$.ajax({
			url: "/_user/private/print",
			type: "POST",
			data: {
				"css": arrLinks,
				"content": content,
				"_charset_":"utf-8"
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

	
	//////////////////
	// SEARCH FIELD //
	//////////////////
	
	var selected = false;
	$("#search_filed").bind("focus", function(ev){
		if (!selected){
			$("#search_filed").val("");
			$("#search_filed").css("color","#000");
			selected = true;
		}
	});
	
	$("#search_filed_button").bind("click", function(ev){
		doSearch();
	});
	
	$("#search_filed").bind("keypress", function(ev){
		if (ev.keyCode == 13){
			doSearch();
		}
	});
	
	var doSearch = function(){
		var search = $("#search_filed").val();
		document.location = "/dev/search_content.html##1|" + search + "|/sites/" + sakai.site.currentsite.id;
	};
	
	
	//////////
	// INIT //
	//////////
	sakai.site.doInit = function() {
		
		// Start loading page
		loadControl();
		
	};
	
	// Start
	sakai.site.doInit();

};

sdata.container.registerForLoad("sakai.site");