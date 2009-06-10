/*global $, Config, History, Querystring, sdata, sakai, jQuery */

var sakai = sakai || {};

// Common ground: This object holds help and config variables accessible by both the view and admin part
sakai._site = {

	// Configuration Variables
	minHeight: 400,
	autosaveinterval: 17000,
	createChildPageByDefault: false,
	
	// Help Variables
	cur: 0,
	curScroll: false,
	minTop: false,
	last: 0,
	myCustomInitInstanced: false,
	currentsite: false,
	meObject: false,
	pages: false,
	pageconfiguration: false,
	pagetypes: {},
	pagecontents: {},
	myportaljson: false,
	myportaljsons: {},
	isEditingNavigation: false,
	currentEditView: false,
	timeoutid: 0,
	selectedpage: false,
	
	showingInsertMore: false,
	inEditView: false,
	autosavecontent: false,
	isShowingDropdown: false,
	isShowingContext: false,
	newwidget_id: false,
	newwidget_uid: false,
	isEditingNewPage: false,
	oldSelectedPage: false,
	mytemplates: false,
	
	siteAdminJS: "_javascript/site_admin.js",
	siteAdminLoaded: false,
	
	
	
	//---------------------------------------------------------------------------------
	//	Help functions
	//---------------------------------------------------------------------------------
	
	/**
	 * Escape page ID
	 * @param {String} pageid
	 * @return {String} escaped page ID
	 */
	escapePageId: function(pageid){
		var escaped = pageid.replace(/ /g, "\\%20");
		escaped = pageid.replace(/[.]/g, "\\\\\\.");
		escaped = pageid.replace(/\//g, "\\\/");
		return escaped;
	},
	
	
	/**
	 * Get document height
	 * @param {Object} doc
	 * @return {Int} height of supplied document
	 */
	getDocHeight: function(doc){
		var docHt = 0, sh, oh;
		if (doc.height) {
			docHt = doc.height;
		}
		else {
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
	},
	
	
	/**
	 * Clone an object
	 * @param {Object} obj
	 * @return {Object} cloned object
	 */
	clone: function(obj){
		if (obj === null || typeof(obj) != 'object') {
			return obj;
		}
		else {
			return jQuery.extend(true, {}, obj);
		}
	},
	
	
	/**
	 * Transform a date into more readable date string
	 * @param {Object} day
	 * @param {Object} month
	 * @param {Object} year
	 * @param {Object} hour
	 * @param {Object} minute
	 * @return {String} formatted date string
	 */
	transformDate: function(day, month, year, hour, minute){
		var string = "";
		var months_lookup = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"};
		string += months_lookup[month] + " " + day + ", " + (1900 + year) + " " + ("00" + hour).slice(-2) + ":" + ("00" + minute).slice(-2);
		return string;
	}
};


sakai.site = function(){		
	
	//---------------------------------------------------------------------------------
	//	Load page - functions in order of loading roughly
	//---------------------------------------------------------------------------------
	
	/**
	 * 1 - Load current site object
	 * @return void
	 */
	var loadCurrentSiteObject = function(){
		var qs = new Querystring();
		sakai._site.currentsite = qs.get("siteid",false);
		if (!sakai._site.currentsite) {
			document.location = "/dev/";
		} 
		else {
			$("#site_management_members_link").attr("href", $("#site_management_members_link").attr("href") + sakai._site.currentsite);
			$("#site_management_basic_link").attr("href", $("#site_management_basic_link").attr("href") + sakai._site.currentsite);
			$("#site_management_appearance_link").attr("href", $("#site_management_appearance_link").attr("href") + sakai._site.currentsite);
			$("#site_settings_link").attr("href", $("#site_settings_link").attr("href") + "?site=" + sakai._site.currentsite);
			
			$.ajax({
				url: "/_rest/site/get/" + sakai._site.currentsite,
				cache: false,
				success: function(response){
					continueLoad(response, true);
					saveToRecentSites(response);
				},
				error: function(httpstatus){
					if (httpstatus === 401) {
						document.location = Config.URL.GATEWAY_URL;
					}
					else {
						continueLoad(httpstatus, false);
					}
				}
			});
		}
	};
	
	
	
	/**
	 * 2 - Continue site loading, load admin part if user is admin/mantainer
	 * @param {Object} response
	 * @param {Boolean} exists
	 * @return void
	 */
	var continueLoad = function(response, exists){
		if (exists) {
			sakai._site.currentsite = $.evalJSON(response);
			var qs = new Querystring();
			sakai._site.currentsite.id = qs.get("siteid",false);
			$("#sitetitle").text(sakai._site.currentsite.name);
					
			sakai._site.meObject = sdata.me;
			var isMaintainer = false;
			
			if (sakai._site.meObject.preferences.subjects) {
				for (var i = 0, j = sakai._site.currentsite.owners.length; i<j; i++) {
					var owner = sakai._site.currentsite.owners[i];
					if (owner == sdata.me.preferences.uuid){							
						isMaintainer = true;
					}
				}
			}
			
			// If admin or mantainer
			if (isMaintainer) {
				$("#li_edit_page_divider").show();
				$("#li_edit_page").show();
				$("#add_a_new").show();
				$("#site_management").show();
				$(".page_nav h3").css("padding-top","10px");
				
				//if (typeof sakai.site.site_admin == "undefined") {
				/*
if (jQuery.isFunction(sakai.site.site_admin) === false) {
					$.ajax({
						url: sakai._site.siteAdminJS,
						async: false,
						dataType: "script",
						complete: function(response){
							sakai._site.siteAdminLoaded = true;
							// Init site admin
							sakai.site.site_admin();
							console.log('site2.js: site admin loaded succesfuly');
						},
						error: function(err){
							alert("site2.js: Site admin loading was unsuccesful: \n" + err);
						}
					});
				}
*/
				
				$.Load.requireJS(sakai._site.siteAdminJS);
				
				
			}
			
			// Start site load
			if (sakai._site.meObject.preferences.uuid){
				$("#loginLink").hide();
			} else {
				$(".explore_nav").hide();
				$("#widget_chat").hide();
				sakai._isAnonymous = true;
				$("#loginLink").show();
			}
			
			// Continue loading
			loadPagesInitial();
		}
	};
	
	
	sakai.site.informAdminLoad = function(){
		sakai._site.siteAdminLoaded = true;
		// Init site admin
		sakai.site.site_admin();
		console.log('site2.js: site admin loaded succesfuly');
	};
	
	/**
	 * 3 - Load initial page data
	 * @param {Object} dofalsereload
	 * @return void
	 */
	var loadPagesInitial = function(dofalsereload){
	
		$("#initialcontent").show();
		totaltotry = 0;
		
		$.ajax({
			url: "/sdata/f/" + sakai._site.currentsite.id + "/.site/pageconfiguration",
			cache: false,
			success: function(response){
				sakai._site.pages = $.evalJSON(response);
				pageconfiguration = sakai._site.pages;
				loadNavigation(dofalsereload);
			},
			error: function(httpstatus){
				sakai._site.pages = {};
				sakai._site.pages.items = {};
				pageconfiguration = sakai._site.pages;
				loadNavigation(dofalsereload);
			}
		});
	};
	
	
	
	
	/**
	 * 4 - Load navigation elements
	 * @param {Object} dofalsereload
	 * @return void
	 */
	var loadNavigation = function(dofalsereload){
		$.ajax({
			url: "/sdata/f/" + sakai._site.currentsite.id + "/_navigation/content",
			cache: false,
			success: function(response){
				sakai._site.pagecontents._navigation = response;
				$("#page_nav_content").html(response);
				sdata.widgets.WidgetLoader.insertWidgets("page_nav_content");
				History.history_change();
			},
			error: function(httpstatus){
				History.history_change();
			}
		});
	};




	
	//---------------------------------------------------------------------------------
	//	Recent Sites
	//---------------------------------------------------------------------------------	
	
	/**
	 * Save to Recent Sites 
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
	 * Transforms Recent Sites list so that it does not include the current site 
	 * @param {Object} items
	 * @param {Object} response
	 * @return void
	 */
	var transformRecentSitesList = function(items, response){
		
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
		writeRecentSiteList(items);
		
	};
	
	
	/**
	 * Writes Recent Sites list to JCR
	 * @param {Object} items
	 * @return void
	 */
	var writeRecentSiteList = function(items){
		sdata.widgets.WidgetPreference.save("/sdata/p/", "recentsites.json", $.toJSON(items), function(success){});
	};
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Open and display functions
	//---------------------------------------------------------------------------------	
	
	/**
	 * Open page H ????
	 * @param {String} pageid
	 * @return void
	 */
	sakai.site.openPageH = function(pageid){
	
		resetVersionHistory();
	
		$("#insert_more_menu").hide();
		$("#more_menu").hide();
		showingInsertMore = false;	
		inEditView = false;
	
		if (!pageid) {
			for (var i = 0, j = sakai._site.pages.items.length; i<j; i++) {
				if (sakai._site.pages.items[i].id.indexOf("/") == -1) {
					pageid = sakai._site.pages.items[i].id;
					break;
				}
			}
		}
		
		for (i = 0, j = sakai._site.pages.items.length; i<j; i++){
			if (sakai._site.pages.items[i].id == pageid){
				$("#pagetitle").text(sakai._site.pages.items[i].title);
				break;
			}
		}
		
		$("#loginLink").attr("href","/dev/index.html?url=" + $.URLEncode(document.location.pathname + document.location.search + document.location.hash));
		
		//sakai.dashboard.hidepopup();
		$("#webpage_edit").hide();
		$("#dashboard_edit").hide();
		$("#tool_edit").hide();
		sakai._site.selectedpage = pageid;
		
		sakai._site.pages.selected = pageid;
		try {
			sakai._navigation.renderNavigation(sakai._site.selectedpage, pages);
		} catch (error1){}
		//document.getElementById("sidebar-content-pages").innerHTML = sdata.html.Template.render("menu_template", pages);
		
		$("#sidebar-content-pages").show();
		if (sakai._site.currentsite.isMaintainer) {
			//$(".tool-menu1-del").show();
		}
		
		var el = document.getElementById("main-content-div");
		var hasopened = false;
		for (i = 0, j = el.childNodes.length; i<j; i++) {
			try {
				if (el.childNodes[i] && el.childNodes[i].style) {
					el.childNodes[i].style.display = "none";
					if (el.childNodes[i].id == pageid.replace(/ /g, "%20")) {
						hasopened = true;
					}
				}
			} 
			catch (error2) {
			}
		}
		
		if (hasopened) {
			sakai._site.myportaljson = sakai._site.myportaljsons[pageid];
			if (sakai._site.pagetypes[pageid] == "webpage") {
				$("#webpage_edit").show();
			}
			else 
				if (sakai._site.pagetypes[pageid] == "dashboard") {
					$("#dashboard_edit").show();
				}
			$("#" + sakai._site.escapePageId(pageid)).show();
		}
		else {
			var type = false;
			for (i = 0, j = sakai._site.pages.items.length; i<j; i++) {
				if (sakai._site.pages.items[i].id == pageid) {
					type = sakai._site.pages.items[i].type;
				}
			}
			
			if (type) {
				sakai._site.pagetypes[sakai._site.selectedpage] = type;
				if (type == "dashboard") {
					el = document.createElement("div");
					el.id = sakai._site.selectedpage.replace(/ /g, "%20");
					el.className = "container_child";
					var cel = document.createElement("div");
					cel.id = "widgetscontainer";
					cel.style.padding = "0px 7px 0px 7px";
					el.appendChild(cel);
					document.getElementById("container").appendChild(el);
					$.ajax({
						url: "/sdata/f/" + sakai._site.currentsite.id + "/pages/" + sakai._site.selectedpage + "/state",
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
						var splittedurl = sakai._site.selectedpage.replace(/\//g, "/_pages/");
						$.ajax({
							url: "/sdata/f/" + sakai._site.currentsite.id + "/_pages/" + splittedurl + "/content",
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
	
	
	
	/**
	 * Opens a page
	 * @param {String} pageid
	 * @return void
	 */
	sakai.site.openPage = function(pageid){
		//History.addBEvent(pageid);
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
			sakai._site.pagecontents[sakai._site.selectedpage] = response;
			$("#webpage_edit").show();
			var el = document.createElement("div");
			el.id = sakai._site.escapePageId(sakai._site.selectedpage);
			//el.className = "container_child";
			el.className = "content";
			el.innerHTML = response;
			
			sakai._site.pagecontents[sakai._site.selectedpage] = el.innerHTML;
			
			//var els = $("a", el);
			//for (var i = 0, j = els.length; i<j; i++) {
			//	var nel = els[i];
				/*
					if (nel.className == "contauthlink") {
					nel.href = "#" + nel.href.split("/")[nel.href.split("/").length - 1];
				}
				*/
			//}
			
			document.getElementById("main-content-div").appendChild(el);
			sdata.widgets.WidgetLoader.insertWidgets(sakai._site.escapePageId(sakai._site.selectedpage));
			
			//jQuery("a", $("#container")).tabbable();
			
		}
		else {
			//$("#error_404").show();
			sakai._site.pagecontents[sakai._site.selectedpage] = "";
			var errorel = document.createElement("div");
			errorel.id = sakai._site.escapePageId(sakai._site.selectedpage);
			errorel.className = "content";
			errorel.innerHTML = "";
			
			document.getElementById("main-content-div").appendChild(errorel);
		}
		
	};
	
	
	/**
	 * Navigation loaded callback?
	 * @return void
	 */
	sakai._site.navigationLoaded = function(){
		sakai._navigation.renderNavigation(sakai._site.selectedpage, sakai._site.pages);
	};
	
	
	/**
	 * Reset version history
	 * @return void
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
	//	Print page 
	//---------------------------------------------------------------------------------
	
	/**
	 * Bring up a print page popup window for printing
	 * @retun void
	 */
	var printPage = function(){
		
		//save page to be printed into my personal space
		
		var escaped = sakai._site.escapePageId(sakai._site.selectedpage);
		var content = $("#" + escaped).html();
		
		sdata.widgets.WidgetPreference.save("/sdata/p/","_print",content,function(data){
			var pagetitle = "";
			for (var i = 0, j = sakai._site.pages.items.length; i<j; i++){
				if (sakai._site.pages.items[i].id == sakai._site.selectedpage){
					pagetitle = sakai._site.pages.items[i].title;
					break;
				}
			}
			popUp("print.html?pagetitle=" + pagetitle);
		});
		
	};
	
	/**
	 * Create a pop-up window and open it
	 * @param {String} URL
	 */
	var popUp = function(URL) {
		var day = new Date();
		var id = day.getTime();
		//eval("page" + id + " = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=800,height=600,left = 320,top = 150');");
		window.open(URL, id, "toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=800,height=600,left = 320,top = 150");
	};
	
	// Bind print page click
	$("#print_page").bind("click", function(ev){
		printPage();
	});
	
	
	
	
	
	//---------------------------------------------------------------------------------
	//	Global event listeners
	//---------------------------------------------------------------------------------
	
	// Bind "Back to top" link click
	$("#back_to_top").bind("click", function(){
		window.scrollTo(0,0);
	});
	
	

	
	//---------------------------------------------------------------------------------
	//	Start loading page
	//---------------------------------------------------------------------------------
	
	loadCurrentSiteObject();
	
};