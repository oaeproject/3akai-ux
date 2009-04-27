var sakai = sakai || {};

sakai._chat = {
	
	flashing : [],
	
	// Just flash
	
	doFlash : function(toFlash){
		var busy = false;
		for (var i = 0; i < sakai._chat.flashing.length; i++){
			if (sakai._chat.flashing[i] == toFlash){
				busy = true;
			}
		}
		if (!busy){
			sakai._chat.startFlashing(toFlash, 0);
		}
	},
	
	// Open window and flash
	
	doOpenFlash : function(toFlash){
		var busy = false;
		for (var i = 0; i < sakai._chat.flashing.length; i++){
			if (sakai._chat.flashing[i] == toFlash){
				busy = true;
			}
		}
		if (!busy){
			sakai._chat.startOpenFlashing(toFlash, 0);
		}
	},
	
	startOpenFlashing : function(toFlash, i){
		var el = $("#online_button_" + toFlash);
		$("#chat_with_" + toFlash).show();
		if (i % 2 == 0){
			el.css("background-color","#00A5E3");
		} else {
			el.css("background-color","#EEEEEE");
		}
		if (i < 9){
			i = i + 1;
			setTimeout("sakai._chat.startOpenFlashing('" + toFlash + "'," + i + ")",500);
		} else {
			var index = -1;
			for (var i = 0; i < sakai._chat.flashing.length; i++){
				if (sakai._chat.flashing[i] == toFlash){
					index = i;
				}
			}
			sakai._chat.flashing.splice(index, 1);
		}
	},
	
	startFlashing : function(toFlash, i){
		var el = $("#online_button_" + toFlash);
		if (i % 2 == 0){
			el.css("background-color","#00A5E3");
		} else {
			el.css("background-color","#EEEEEE");
		}
		if (i < 10){
			i = i + 1;
			setTimeout("sakai._chat.startFlashing('" + toFlash + "'," + i + ")",500);
		} else {
			var index = -1;
			for (var i = 0; i < sakai._chat.flashing.length; i++){
				if (sakai._chat.flashing[i] == toFlash){
					index = i;
				}
			}
			sakai._chat.flashing.splice(index, 1);
		}
	}
	
}

sakai.chat = function(tuid, placement, showSettings){

	var rootel = $("#" + tuid);
	var activewindows = {};
	activewindows.items = [];
	var online = false;
	var goBackToLogin = false;
	var defaultNav = false;
	
	/*
		Courses & Sites dropdown handler 
	*/
	
	var sitesShown = false;
	var sitesFocus = false;
	
	var doSort = function(a,b){
		if (a.name > b.name) {
			return 1;
		} else if (a.name == b.name) {
			return 0;
		} else {
			return -1;
		}
	}
	
	var loadSites = function(){
		var el = $("#widget_createsite");
		if (!el.get(0)){
			$("#top_navigation_widgets").append("<div id='createsitecontainer' style='display:none'><div id='widget_createsite' class='widget_inline'></div></div>");
			sdata.widgets.WidgetLoader.insertWidgets("createsitecontainer");
		}
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/sites?sid=" + Math.random(),
			onSuccess: function(data){
				
			var newjson = eval('(' + data + ')');
			for (var i = 0; i < newjson.entry.length; i++){
				newjson.entry[i].location = newjson.entry[i].location.substring(1);
			}
			newjson.entry = newjson.entry.sort(doSort);
			if (newjson.entry.length > 5){
				newjson.entry = newjson.entry.splice(0,5);
			}
			if (newjson.entry.length == 0){
				$("#top_navigation_my_sites_list").html("<span style='font-size:0.95em'>You aren't a member of any sites yet</span>");
			} else {
				$("#top_navigation_my_sites_list").html(sdata.html.Template.render('top_navigation_my_sites_list_template', newjson));
			}
		
			},
			onFail: function(status){
				alert("An error has occured");
			}
		});
	}
	
	$("#top_navigation_create_site").live("click", function(ev){
		createNewSite();
	});
	
	var createNewSite = function(){
		$("#createsitecontainer").show();
		sakai.createsite.initialise();
	}
	
	$("#courses_sites_search").live("focus", function(ev){
		if (!sitesFocus){
			sitesFocus = true;
			var el = $("#courses_sites_search");
			el.val("");
			el.css("color","#000000");
		}
	});
	
	$("#courses_sites_search").live("keypress", function(ev){
		if (ev.which == 13){
			doSitesSearch();
		}
	})
	
	$("#courses_sites_search_button").live("click", function(ev){
		doSitesSearch();
	})
	
	var doSitesSearch = function(){
		var tosearch = $("#courses_sites_search").val();
		if (tosearch){
			document.location = "search_b_sites.html#1|" + tosearch;
		}
	}
	
	/*
		Course & Sites dropdown hide/show 
	*/
	
	defaultNav = $(".explore").html();
	
	var setSitesDropdown = function(){
		$("#nav_courses_sites_link").live("click", function(ev){
			$("#people_dropdown_main").hide();
			$("#people_dropdown_close").hide();
			$("#mysites_dropdown_main").show();
			$("#mysites_dropdown_close").show();
			$(".explore").html(defaultNav);
			$("#nav_courses_sites_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>Courses &amp; Sites</span></a><img src="/dev/img/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
			setRoundedCorners();
			if (!sitesShown){
				loadSites();
				loadRecentSites();
				sitesShown = true;
			}
		});
	}
	
	var loadRecentSites = function(){
		
		sdata.Ajax.request({
		   	url :"/sdata/p/recentsites.json?sid=" + Math.random(),
		    httpMethod : "GET",
			onSuccess : function(data) {
				
				var items = eval('(' + data + ')');
				
				var url = "/_rest/site/get/";
				var count = 0;
				
				for (var i = 0; i < items.items.length; i++){
					url += items.items[i] + ",";
					count++;
				}
				
				sdata.Ajax.request({
				   	url : url + "?sid=" + Math.random(),
				    httpMethod : "GET",
					onSuccess : function(data) {
						
						var response = eval('(' + data + ')');
						var json = {};
						json.items = [];
						var newcount = 0;
						
						if (count == 1){
							newcount++;
							var el = {};
							el.location = response.location.substring(1);
							el.name = response.name;
							json.items[json.items.length] = el;
						} else {
							for (var i = 0; i < response.length; i++){
								if (response[i] != "404"){
									newcount++;
									var el = {};
									el.location = response[i].location.substring(1);
									el.name = response[i].name;
									json.items[json.items.length] = el;
								}
							}
						}
						
						json.count = newcount;
						$("#chat_dropdown_recent_sites").append(sdata.html.Template.render("chat_dropdown_recent_sites_template",json));
					
					},
					onFail : function(data){
						
						$("#chat_dropdown_recent_sites").append("<span>No recent sites found</span>");
						
					}
				});

			},
			onFail : function(data){
				$("#chat_dropdown_recent_sites").append("<span>No recent sites found</span>");
			}
		});
		
	}
	
	$("#mysites_dropdown_close_link").live("click", function(ev){
		$("#mysites_dropdown_main").hide();
		$("#mysites_dropdown_close").hide();
		$(".explore").html(defaultNav);
		selectPage();
		setSitesDropdown();
	});
	
	
	/*
		People dropdown handler 
	*/
	
	var peopleShown = false;
	var peopleFocus = false;
	
	var loadPeople = function(){
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/friend/status?p=0&n=4&friendStatus=ACCEPTED&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
			onSuccess: function(data){
				var friends = eval('(' + data + ')');
				
				var pOnline = {};
				pOnline.items = [];
				var total = 0;
				pOnline.showMore = false;
				
				if (friends.status.friends) {
					for (var i = 0; i < friends.status.friends.length; i++) {
						var isOnline = false;
						if (!isOnline && total < 4) {
							var item = friends.status.friends[i];
							item.id = item.friendUuid;
							if (item.profile.firstName && item.profile.lastName) {
								item.name = item.profile.firstName + " " + item.profile.lastName;
							}
							else {
								item.name = item.friendUuid;
							}
							if (item.profile.picture) {
								var pict = eval('(' + item.profile.picture + ')');
								if (pict.name) {
									item.photo = "/sdata/f/_private" + item.properties.userStoragePrefix + pict.name;
								}
							}
							item.online = false;
							pOnline.items[pOnline.items.length] = item;
							total++;
						}
					}
				}
				
				$("#people_dropdown_my_contacts_list").html(sdata.html.Template.render("people_dropdown_my_contacts_list_template", pOnline));
				
				if (pOnline.items.length == 0){
					$("#people_dropdown_main").css("height","80px");
					$("#people_dropdown_my_contacts_list").css("margin-bottom","10px");
				}
				
			},
			onFail: function(status){
				$("#list_rendered").html("<b>An error has occurred.</b> Please try again later");
			}
		});
	}
	
	$("#dropdown_people_search").live("focus", function(ev){
		if (!peopleFocus){
			peopleFocus = true;
			var el = $("#dropdown_people_search");
			el.val("");
			el.css("color","#000000");
		}
	});
	
	$("#dropdown_people_search").live("keypress", function(ev){
		if (ev.which == 13){
			doPeopleSearch();
		}
	})
	
	$("#dropdown_people_search_button").live("click", function(ev){
		doPeopleSearch();
	})
	
	var doPeopleSearch = function(){
		var tosearch = $("#dropdown_people_search").val();
		if (tosearch){
			document.location = "search_b_people.html#1|" + tosearch;
		}
	}
	
	/*
		People dropdown hide/show 
	*/
	
	defaultNav = $(".explore").html();
	
	var setPeopleDropdown = function(){
		$("#nav_people_link").live("click", function(ev){
			$("#mysites_dropdown_main").hide();
			$("#mysites_dropdown_close").hide();
			$("#people_dropdown_main").show();
			$("#people_dropdown_close").show();
			$(".explore").html(defaultNav);
			$("#nav_people_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>People</span></a><img src="/dev/img/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
			setRoundedCorners();
			if (!peopleShown){
				loadPeople();
				peopleShown = true;
			}
		});
	}
	
	$("#people_dropdown_close_link").live("click", function(ev){
		$("#people_dropdown_main").hide();
		$("#people_dropdown_close").hide();
		$(".explore").html(defaultNav);
		selectPage();
		setPeopleDropdown();
	});
	
	var setRoundedCorners = function(){
		// Fix small arrow horizontal position
		$('.explore_nav_selected_arrow').css('right', $('.explore_nav_selected').width() / 2 + 10);
		
		// Round cornners for elements with '.rounded_corners' class
		$('.rounded_corners').corners("2px");
		
		// IE Fixes
		if (($.browser.msie) && ($.browser.version < 8)) {
			
			// Small Arrow Fix
			$('.explore_nav_selected_arrow').css('bottom','-10px');
			
			
		}
	}
	
	var selectPage = function(){
		
		// Select the page we're on
		
		if (window.location.pathname.toLowerCase().indexOf("/my_sakai.html") != -1){
			$("#nav_my_sakai_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>My Sakai</span></a><img src="/dev/_images/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
		} else if (window.location.pathname.toLowerCase().indexOf("/search_b.html") != -1 || window.location.pathname.toLowerCase().indexOf("/search_b_people.html") != -1){
			$("#nav_search_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>Search</span></a><img src="/dev/_images/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
		} else if (window.location.pathname.toLowerCase().indexOf("/people.html") != -1){
			$("#nav_people_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>People</span></a><img src="/dev/_images/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
		} else if (window.location.pathname.toLowerCase().indexOf("/profile.html") != -1){
			$("#nav_profile_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>Profile</span></a><img src="/dev/_images/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
		}
		
		setRoundedCorners();
	}
	
	var doInit = function(){
		
		var person = sdata.me;
		
		if (!person.preferences.uuid){
			return;
		} else {
			$("#explore_nav_container").show();
			$("#chat_main_container").show();
		}
		
		if (person.profile.firstName || person.profile.lastName) {
			$("#userid").text(person.profile.firstName + " " + person.profile.lastName);
		}
		
		$("#hispan").text(person.profile.firstName);
		
		selectPage();
		setPeopleDropdown();
		setSitesDropdown();
		
	}
	
	var informPresent = function(){
	
		if (sakai._isAnonymous && goBackToLogin == false) {
			return;
		}
		
		var sendToLoginOnFail = "false";
		if (goBackToLogin){
			sendToLoginOnFail = "true";
		}
		
		sdata.Ajax.request({
			url: "/_rest/presence/status",
			httpMethod: "POST",
			onSuccess: function(data){
				setTimeout(informPresent, 20000);
				goBackToLogin = true;
			},
			onFail: function(status){
				setTimeout(informPresent, 20000);
			},
			postData: {
				status: "online"
			},
			contentType: "application/x-www-form-urlencoded",
			sendToLoginOnFail: sendToLoginOnFail
		});
		
	}
	
	var checkOnline = function(){
	
		if (sakai._isAnonymous && goBackToLogin == false) {
			return;
		}
		
		var sendToLoginOnFail = "false";
		if (goBackToLogin){
			sendToLoginOnFail = "true";
		}
	
		sdata.Ajax.request({
			url: "/_rest/presence/friends?sid=" + Math.random(),
			httpMethod: "GET",
			onSuccess: function(data){
				online = eval('(' + data + ')');
				showOnlineFriends();
				setTimeout(checkOnline, 20000);
				goBackToLogin = true;
			},
			onFail: function(status){
			},
			sendToLoginOnFail: sendToLoginOnFail
		});
		
	}
	
	var showOnlineFriends = function(){
	
		var json = online;
		var total = 0;
		for (var i in json){
			if (json[i] != "offline"){
				total++;
			}
		}
		if (!total || total == 0) {
			$("#chat_online").html("");
		}
		else {
			$("#chat_online").html("<b>(" + total + ")</b>");
		}
		
		for (var i = 0; i < json.items.length; i++) {
			if (json.items[i].firstName && json.items[i].lastName) {
				json.items[i].name = json.items[i].firstName + " " + json.items[i].lastName;
			}
			else {
				json.items[i].name = json.items[i].userid;
			}
			if (json.items[i].picture) {
				var pict = eval('(' + json.items[i].picture + ')');
				json.items[i].photo = "/sdata/f/public/" + json.items[i].userid + "/" + pict.name;
			}
		}
		
		$("#chat_available").html(sdata.html.Template.render("chat_available_template", json));
		
		$(".initiate_chat_window").bind("click", function(ev){
			var clicked = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			
			openChat(clicked);
			
		});
		
		enableDisableOnline();
		
	}
	
	var hasOpenChatWindow = false;
	
	var openChat = function(clicked){
	
		$("#online_button_" + clicked).css("background-color","#EEEEEE");
	
		for (var i = 0; i < activewindows.items.length; i++) {
			if (activewindows.items[i].userid == clicked) {
				toggleChatWindow(clicked);
				return;
			}
		}
	
		hasOpenChatWindow = true;
		
		var index = activewindows.items.length;
		var specialjson = {};
		specialjson.items = [];
		activewindows.items[index] = {};
		specialjson.items[0] = {};
		activewindows.items[index].userid = clicked;
		specialjson.items[0].userid = clicked;
		activewindows.items[index].active = true;
		specialjson.items[0].active = true;
		for (var i = 0; i < online.items.length; i++) {
			if (online.items[i].userid == clicked) {
				var item = online.items[i];
				if (item.firstName && item.lastName) {
					activewindows.items[index].name = item.firstName + " " + item.lastName;
					specialjson.items[0].name = item.firstName + " " + item.lastName;
				}
				else {
					activewindows.items[index].name = clicked;
					specialjson.items[0].name = clicked;
				}
				if (item.picture) {
					var pict = eval('(' + item.picture + ')');
					activewindows.items[index].photo = "/sdata/f/public/" + clicked + "/" + pict.name;
					specialjson.items[0].photo = "/sdata/f/public/" + clicked + "/" + pict.name;
				}
				else {
					activewindows.items[index].photo = "/dev/img/my-profile-img.jpg";
					specialjson.items[0].photo = "/dev/img/my-profile-img.jpg";
				}
			}
		}
		
		doWindowRender(clicked, specialjson);
		
		loadChatTextInitial(true, specialjson);
		
	}
	
	var enableDisableOnline = function(){
		// Disable / Enable for Online / Offline users
		
		if (activewindows.items) {
			for (var i = 0; i < activewindows.items.length; i++) {
				var user = activewindows.items[i].userid;
				var displayUser = activewindows.items[i].name;
				if (activewindows.items[i].onlineNow == null) {
					var isOnline = false;
					if (online.items) {
						for (var ii = 0; ii < online.items.length; ii++) {
							if (online.items[ii].userid == user) {
								isOnline = true;
							}
						}
					}
					if (isOnline) {
						activewindows.items[i].onlineNow = true;
						$("#chat_with_" + user + "_txt").removeAttr("disabled");
					}
					else {
						activewindows.items[i].onlineNow = false;
						$("#chat_with_" + user + "_txt").attr("disabled", true);
						$("#chat_with_" + user + "_txt").attr("value", displayUser + " is offline");
					}
				}
				if (activewindows.items[i].onlineNow === true) {
					var isOnline = false;
					if (online.items) {
						for (var ii = 0; ii < online.items.length; ii++) {
							if (online.items[ii].userid == user) {
								isOnline = true;
							}
						}
					}
					if (!isOnline) {
						activewindows.items[i].onlineNow = false;
						$("#chat_with_" + user + "_txt").attr("disabled", true);
						$("#chat_with_" + user + "_txt").attr("value", displayUser + " is offline");
					}
				}
				else 
					if (activewindows.items[i].onlineNow === false) {
						var isOnline = false;
						if (online.items) {
							for (var ii = 0; ii < online.items.length; ii++) {
								if (online.items[ii].userid == user) {
									isOnline = true;
								}
							}
						}
						if (isOnline) {
							activewindows.items[i].onlineNow = true;
							$("#chat_with_" + user + "_txt").attr("value", "");
							$("#chat_with_" + user + "_txt").removeAttr("disabled");
						}
					}
			}
		}
	}
	
	var toggleChatWindow = function(selected){
		var el = $("#chat_with_" + selected);
		if (el.css("display") === "none") {
			for (var i = 0; i < activewindows.items.length; i++) {
				$("#chat_with_" + activewindows.items[i].userid).hide();
				activewindows.items[i].active = false;
				if (activewindows.items[i].userid === selected) {
					activewindows.items[i].active = true;
				}
			}
			$("#show_online").hide();
			el.show();
			hasOpenChatWindow = true;
			$("#online_button_" + selected).css("background-color","#EEEEEE");
		}
		else {
			for (var i = 0; i < activewindows.items.length; i++) {
				if (activewindows.items[i].userid === selected) {
					activewindows.items[i].active = false;
				}
			}
			el.hide();
			hasOpenChatWindow = false;
		}
		try {
			var el2 = document.getElementById("chat_with_" + selected + "_content");
			el2.scrollTop = el2.scrollHeight;
		} 
		catch (err) {
		}
	}
	
	var doWindowRender = function(clicked, special){
	
		if (sakai._isAnonymous) {
			return;
		}
	
		if (special) {
			special.special = activewindows.items.length - 1;
			$("#chat_windows").append(sdata.html.Template.render("chat_windows_template", special));
		}
		else {
			activewindows.special = false;
			$("#chat_windows").html(sdata.html.Template.render("chat_windows_template", activewindows));
		}
		
		enableDisableOnline();
		
		if (clicked) {
			$("#show_online").hide();
			$("#chat_with_" + clicked).show();
			hasOpenChatWindow = true;
		}
		
		$(".user_chat").unbind("click");
		$(".user_chat").bind("click", function(ev){
			var selected = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			toggleChatWindow(selected);
		});
		
		$(".chat_min").unbind("click");
		$(".chat_min").bind("click", function(ev){
			var selected = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			var el = $("#chat_with_" + selected);
			if (el.css("display") === "none") {
				for (var i = 0; i < activewindows.items.length; i++) {
					$("#chat_with_" + activewindows.items[i].userid).hide();
					activewindows.items[i].active = false;
					if (activewindows.items[i].userid === selected) {
						activewindows.items[i].active = true;
					}
				}
				$("#show_online").hide();
				el.show();
				hasOpenChatWindow = true;
			}
			else {
				for (var i = 0; i < activewindows.items.length; i++) {
					if (activewindows.items[i].userid === selected) {
						activewindows.items[i].active = false;
					}
				}
				el.hide();
				hasOpenChatWindow = false;
			}
		});
		
		$(".chat_remove").unbind("click");
		$(".chat_remove").bind("click", function(ev){
			var selected = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			var toremove = -1;
			for (var i = 0; i < activewindows.items.length; i++) {
				if (activewindows.items[i].userid == selected) {
					toremove = i;
				}
			}
			activewindows.items.splice(toremove, 1);
			
			$("#online_button_" + selected).remove();
			$("#chat_with_" + selected).remove();
			
			hasOpenChatWindow = false;
			
			for (var i = 0; i < activewindows.items.length; i++) {
				$("#chat_with_" + activewindows.items[i].userid).css("right", "" + (190 + (i * 150)) + "px");
			}
			
		});
		
		$(".chat_with_txt").unbind("keydown");
		$(".chat_with_txt").bind("keydown", function(ev){
			if (ev.keyCode == 13) {
				var currentuser = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 2];
				var text = $("#chat_with_" + currentuser + "_txt").attr("value");
				if (text != "") {
					var totaltext = "<span style='color:#CCCCCC'>me &gt; </span>" + text;
					$("#chat_with_" + currentuser + "_content").html($("#chat_with_" + currentuser + "_content").html() + totaltext + "<br/>");
					$("#chat_with_" + currentuser + "_txt").attr("value", "");
					try {
						var el = document.getElementById("chat_with_" + currentuser + "_content");
						el.scrollTop = el.scrollHeight;
					} 
					catch (err) {
					}
					
					var data = {
						"text": text,
						"receiver": currentuser
					};
					
					sdata.Ajax.request({
						url: "/sdata/chat/",
						httpMethod: "POST",
						onSuccess: function(data){
						},
						onFail: function(status){
							alert("An error has occured");
						},
						postData: data,
						contentType: "application/x-www-form-urlencoded",
						sendToLoginOnFail: "false"
					});
					
				}
			}
		});
		
	}
	
	$(".chat_online_trigger").bind("click", function(ev){
	
		for (var i = 0; i < activewindows.items.length; i++) {
			$("#chat_with_" + activewindows.items[i].userid).hide();
		}
		
		if ($("#show_online").css("display") === "none") {
			$("#show_online").show();
		}
		else {
			$("#show_online").hide();
		}
	});
	
	$(window).bind("unload", function(ev){
		if (sakai._isAnonymous) {
			return;
		}
		else {
			set_cookie('sakai_chat', sdata.JSON.stringify(activewindows), null, null, null, "/", null, null);
		}
	});
	
	if (sakai._isAnonymous) {
		return;
	}
	else {
		sdata.widgets.WidgetLoader.insertWidgets("chat_container");
	}
	
	var loadPersistence = function(){
		
		if (sakai._isAnonymous) {
			return;
		}
		
		if (get_cookie('sakai_chat')) {
			activewindows = eval('(' + get_cookie('sakai_chat') + ')');
			delete_cookie('sakai_chat');
			var toshow = false;
			for (var i = 0; i < activewindows.items.length; i++) {
				if (activewindows.items[i].active == true) {
					toshow = activewindows.items[i].userid;
				}
			}
			doWindowRender(toshow);
		}
		loadChatTextInitial(true);
	}
	
	loadChatTextInitial = function(initial, specialjson){
	
		if (sakai._isAnonymous) {
			return;
		}
	
		var doreload = false;
		if (!specialjson) {
			specialjson = activewindows;
			doreload = true;
		}
		
		var onlineUsers = [];
		if (specialjson.items) {
			for (var i = 0; i < specialjson.items.length; i++) {
				onlineUsers[onlineUsers.length] = specialjson.items[i].userid;
			}
		}
		
		var tosend = onlineUsers.join("|");
		
		sdata.Ajax.request({
			url: "/sdata/chat/?users=" + tosend + "&initial=" + initial + "&sid=" + Math.random(),
			httpMethod: "GET",
			sendToLoginOnFail: "false",
			onSuccess: function(data){
				var json = eval('(' + data + ')');
				for (var i in json.items) {
					if (document.getElementById("chat_with_" + i)) {
						var el = $("#chat_with_" + i + "_content");
						var person = json.items[i].profile;
						var otheruser = "Unknown";
						if (person.firstName && person.lastName) {
							otheruser = person.firstName + " " + person.lastName;
						}
						else {
							otheruser = person.userid;
						}
						var string = "";
						for (var ii = 0; ii < json.items[i].items.length; ii++) {
							string += "<span style='color:#CCCCCC'>";
							if (json.items[i].items[ii].sender == person.userid) {
								string += otheruser + " &gt; </span>";
							}
							else {
								string += "me &gt; </span>";
							}
							string += json.items[i].items[ii].text + "<br/>";
							var togo = true;
							if (json.items[i].items[ii].isread == false) {
								for (var iii = 0; iii < activewindows.items.length; iii++) {
									if (activewindows.items[iii].userid == i) {
										if (activewindows.items[iii].active) {
											togo = false;
										}
									}
								}
								if (togo) {
									if (hasOpenChatWindow){
										//Just flash and change color
										setTimeout("sakai._chat.doFlash('" + json.items[i].items[ii].sender + "')", 500);
									} else {
										//Flash and open window
										setTimeout("sakai._chat.doOpenFlash('" + json.items[i].items[ii].sender + "')", 500);
									}
								}
							}
						}
						el.html(el.html() + string);
						var el = document.getElementById("chat_with_" + i + "_content");
						el.scrollTop = el.scrollHeight;
					}
					else {
					
						var index = activewindows.items.length;
						var special = {};
						special.items = [];
						activewindows.items[index] = {};
						special.items[0] = {};
						activewindows.items[index].userid = i;
						special.items[0].userid = i;
						activewindows.items[index].active = false;
						special.items[0].active = false;
						var item = json.items[i].profile;
						if (item.firstName && item.lastName) {
							activewindows.items[index].name = item.firstName + " " + item.lastName;
							special.items[0].name = item.firstName + " " + item.lastName;
						}
						else {
							activewindows.items[index].name = i;
							special.items[0].name = i;
						}
						if (item.picture) {
							var pict = eval('(' + item.picture + ')');
							activewindows.items[index].photo = "/sdata/f/public/" + i + "/" + pict.name;
							special.items[0].photo = "/sdata/f/public/" + i + "/" + pict.name;
						}
						else {
							activewindows.items[index].photo = "/dev/img/my-profile-img.jpg";
							special.items[0].photo = "/dev/img/my-profile-img.jpg";
						}
						
						var togo = true;
						for (var ii = 0; ii < activewindows.items.length; ii++) {
							if (activewindows.items[ii].userid == i) {
								if (activewindows.items[ii].active) {
									togo = false;
								}
							}
						}
						if (togo) {
							if (hasOpenChatWindow){
								//Just flash and change color
								setTimeout("sakai._chat.doFlash('" + i + "')", 500);
							} else {
								//Flash and open window
								setTimeout("sakai._chat.doOpenFlash('" + i + "')", 500);
							}
						}
						
						doWindowRender(null, special);
						loadChatTextInitial(true, special);
						
					}
				}
				if (doreload) {
					setTimeout("loadChatTextInitial(false)", 5000);
				}
			},
			onFail: function(status){
				if (doreload) {
					setTimeout("loadChatTextInitial(false)", 5000);
				}
			}
		});
		
	}
	
	if (sakai._isAnonymous) {
		return;
	}
	else {
		loadPersistence();
		informPresent();
		checkOnline();
		doInit();
	}

};

sdata.widgets.WidgetLoader.informOnLoad("chat");