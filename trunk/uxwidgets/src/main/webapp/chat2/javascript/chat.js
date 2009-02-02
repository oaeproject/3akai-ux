var sakai = sakai || {};

sakai._chat2 = {
	
	flashing : [],
	
	// Just flash
	
	doFlash : function(toFlash){
		var busy = false;
		for (var i = 0; i < sakai._chat2.flashing.length; i++){
			if (sakai._chat2.flashing[i] == toFlash){
				busy = true;
			}
		}
		if (!busy){
			sakai._chat2.startFlashing(toFlash, 0);
		}
	},
	
	// Open window and flash
	
	doOpenFlash : function(toFlash){
		var busy = false;
		for (var i = 0; i < sakai._chat2.flashing.length; i++){
			if (sakai._chat2.flashing[i] == toFlash){
				busy = true;
			}
		}
		if (!busy){
			sakai._chat2.startOpenFlashing(toFlash, 0);
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
			setTimeout("sakai._chat2.startOpenFlashing('" + toFlash + "'," + i + ")",500);
		} else {
			var index = -1;
			for (var i = 0; i < sakai._chat2.flashing.length; i++){
				if (sakai._chat2.flashing[i] == toFlash){
					index = i;
				}
			}
			sakai._chat2.flashing.splice(index, 1);
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
			setTimeout("sakai._chat2.startFlashing('" + toFlash + "'," + i + ")",500);
		} else {
			var index = -1;
			for (var i = 0; i < sakai._chat2.flashing.length; i++){
				if (sakai._chat2.flashing[i] == toFlash){
					index = i;
				}
			}
			sakai._chat2.flashing.splice(index, 1);
		}
	}
	
}

sakai.chat2 = function(tuid, placement, showSettings){

	var rootel = $("#" + tuid);
	var activewindows = {};
	activewindows.items = [];
	var online = false;
	var goBackToLogin = false;
	
	var informPresent = function(){
	
		if (sakai._isAnonymous && goBackToLogin == false) {
			return;
		}
		
		var sendToLoginOnFail = "false";
		if (goBackToLogin){
			sendToLoginOnFail = "true";
		}
		
		sdata.Ajax.request({
			url: "/sdata/presence/",
			httpMethod: "POST",
			onSuccess: function(data){
				setTimeout(informPresent, 20000);
				goBackToLogin = true;
			},
			onFail: function(status){
				setTimeout(informPresent, 20000);
			},
			postData: {},
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
			url: "/sdata/presence?sid=" + Math.random(),
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
		if (!json.total || json.total == 0) {
			$("#conn_online").html("Online connections");
		}
		else {
			$("#conn_online").html("<b>Online connections (" + json.total + ")</b>");
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
		
		//$("#chat_available").html(sdata.html.Template.render("chat_available_template", json));
		
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
	
	$("#conn_online").bind("click", function(ev){
	
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
		sdata.widgets.WidgetLoader.insertWidgets("chat_bar");
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
										setTimeout("sakai._chat2.doFlash('" + json.items[i].items[ii].sender + "')", 500);
									} else {
										//Flash and open window
										setTimeout("sakai._chat2.doOpenFlash('" + json.items[i].items[ii].sender + "')", 500);
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
								setTimeout("sakai._chat2.doFlash('" + i + "')", 500);
							} else {
								//Flash and open window
								setTimeout("sakai._chat2.doOpenFlash('" + i + "')", 500);
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
	}

};

sdata.widgets.WidgetLoader.informOnLoad("chat2");