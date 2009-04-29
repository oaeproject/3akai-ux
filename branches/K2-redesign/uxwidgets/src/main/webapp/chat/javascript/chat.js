var sakai = sakai || {};

sakai._chat = {
	
    flashing: [],
    
    // Just flash
    
    doFlash: function(toFlash){
        var busy = false;
        for (var i = 0; i < sakai._chat.flashing.length; i++) {
            if (sakai._chat.flashing[i] == toFlash) {
                busy = true;
            }
        }
        if (!busy) {
            sakai._chat.startFlashing(toFlash, 0);
        }
    },
    
    // Open window and flash
    
    doOpenFlash: function(toFlash){
        var busy = false;
        for (var i = 0; i < sakai._chat.flashing.length; i++) {
            if (sakai._chat.flashing[i] == toFlash) {
                busy = true;
            }
        }
        if (!busy) {
            sakai._chat.startOpenFlashing(toFlash, 0);
        }
    },
    
    startOpenFlashing: function(toFlash, i){
        var el = $("#online_button_" + toFlash);
        $("#chat_with_" + toFlash).show();
        if (i % 2 == 0) {
            el.css("background-color", "#00A5E3");
        }
        else {
            el.css("background-color", "#EEEEEE");
        }
        if (i < 9) {
            i = i + 1;
            setTimeout("sakai._chat.startOpenFlashing('" + toFlash + "'," + i + ")", 500);
        }
        else {
            var index = -1;
            for (var i = 0; i < sakai._chat.flashing.length; i++) {
                if (sakai._chat.flashing[i] == toFlash) {
                    index = i;
                }
            }
            sakai._chat.flashing.splice(index, 1);
        }
    },
    
    startFlashing: function(toFlash, i){
        var el = $("#online_button_" + toFlash);
        if (i % 2 == 0) {
            el.css("background-color", "#00A5E3");
        }
        else {
            el.css("background-color", "#EEEEEE");
        }
        if (i < 10) {
            i = i + 1;
            setTimeout("sakai._chat.startFlashing('" + toFlash + "'," + i + ")", 500);
        }
        else {
            var index = -1;
            for (var i = 0; i < sakai._chat.flashing.length; i++) {
                if (sakai._chat.flashing[i] == toFlash) {
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
	var allFriends = false;
	var currentChatStatus = "";
    
    /*
     Courses & Sites dropdown handler
     */
    var sitesShown = false;
    var sitesFocus = false;
    
    var doSort = function(a, b){
        if (a.name > b.name) {
            return 1;
        }
        else 
            if (a.name == b.name) {
                return 0;
            }
            else {
                return -1;
            }
    }
    
    var loadSites = function(){
        var el = $("#widget_createsite");
        if (!el.get(0)) {
            $("#top_navigation_widgets").append("<div id='createsitecontainer' style='display:none'><div id='widget_createsite' class='widget_inline'></div></div>");
            sdata.widgets.WidgetLoader.insertWidgets("createsitecontainer");
        }
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/rest/sites?sid=" + Math.random(),
            onSuccess: function(data){
            
                var newjson = eval('(' + data + ')');
				newjson.entry = newjson.entry || [];
                for (var i = 0; i < newjson.entry.length; i++) {
                    newjson.entry[i].location = newjson.entry[i].location.substring(1);
                }
                newjson.entry = newjson.entry.sort(doSort);
                if (newjson.entry.length > 5) {
                    newjson.entry = newjson.entry.splice(0, 5);
                }
                if (newjson.entry.length == 0) {
                    $("#top_navigation_my_sites_list").html("<span style='font-size:0.95em'>You aren't a member of any sites yet<br/><br/></span>");
                }
                else {
                    $("#top_navigation_my_sites_list").html(sdata.html.Template.render('top_navigation_my_sites_list_template', newjson));
                }
                
            },
            onFail: function(status){
                alert("An error has occured");
            }
        });
    }
    
    $("#top_navigation_create_site").bind("click", function(ev){
        createNewSite();
    });
    
    var createNewSite = function(){
        $("#createsitecontainer").show();
        sakai.createsite.initialise();
    }
    
    $("#courses_sites_search").bind("focus", function(ev){
        if (!sitesFocus) {
            sitesFocus = true;
            var el = $("#courses_sites_search");
            el.val("");
            el.css("color", "#000000");
        }
    });
    
    $("#courses_sites_search").bind("keypress", function(ev){
        if (ev.which == 13) {
            doSitesSearch();
        }
    })
    
    $("#courses_sites_search_button").bind("click", function(ev){
        doSitesSearch();
    })
    
    var doSitesSearch = function(){
        var tosearch = $("#courses_sites_search").val();
        if (tosearch) {
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
            $("#nav_courses_sites_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>Courses &amp; Sites</span></a><img src="/dev/_images/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
            setRoundedCorners();
            if (!sitesShown) {
                loadSites();
				loadRecentSites();
                sitesShown = true;
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
                
                if (pOnline.items.length == 0) {
                    $("#people_dropdown_main").css("height", "80px");
                    $("#people_dropdown_my_contacts_list").css("margin-bottom", "10px");
                }
                
            },
            onFail: function(status){
                $("#list_rendered").html("<b>An error has occurred.</b> Please try again later");
            }
        });
    }
    
    $("#dropdown_people_search").bind("focus", function(ev){
        if (!peopleFocus) {
            peopleFocus = true;
            var el = $("#dropdown_people_search");
            el.val("");
            el.css("color", "#000000");
        }
    });
    
    $("#dropdown_people_search").bind("keypress", function(ev){
        if (ev.which == 13) {
            doPeopleSearch();
        }
    })
    
    $("#dropdown_people_search_button").bind("click", function(ev){
        doPeopleSearch();
    })
    
    var doPeopleSearch = function(){
        var tosearch = $("#dropdown_people_search").val();
        if (tosearch) {
            document.location = "search_b_people.html#1|" + tosearch;
        }
    }
    
    /*
     People dropdown hide/show
     */
    defaultNav = $(".explore").html();
    
    var setPeopleDropdown = function(){
        $("#nav_people_link").bind("click", function(ev){
            $("#people_dropdown_main").show();
            $("#people_dropdown_close").show();
            $(".explore").html(defaultNav);
            $("#nav_people_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>People</span></a><img src="/dev/_images/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
            setRoundedCorners();
            if (!peopleShown) {
                loadPeople();
                peopleShown = true;
            }
        });
    }
    
    $("#people_dropdown_close_link").bind("click", function(ev){
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
            $('.explore_nav_selected_arrow').css('bottom', '-10px');
            
            
        }
    }
    
    var selectPage = function(){
    
        // Select the page we're on
        
        if (window.location.pathname.toLowerCase().indexOf("/my_sakai.html") != -1) {
            $("#nav_my_sakai_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>My Sakai</span></a><img src="/dev/_images/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
        }
        else 
            if (window.location.pathname.toLowerCase().indexOf("/search_b.html") != -1 || window.location.pathname.toLowerCase().indexOf("/search_b_people.html") != -1) {
                $("#nav_search_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>Search</span></a><img src="/dev/_images/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
            }
            else 
                if (window.location.pathname.toLowerCase().indexOf("/people.html") != -1) {
                    $("#nav_people_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>People</span></a><img src="/dev/_images/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
                }
        
        setRoundedCorners();
    }
	
	/**
	 * Show or hide the user link menu
	 */
	var showHideUserLinkMenu = function(){
		if($("#user_link_menu").is(":visible")){
			$("#user_link_menu").hide();
		}else{
			$("#user_link_menu").show();
		}
	};
	
	/**
	 * Update a certain element
	 * @param {Object} element Element that needs to be updated
	 */
	var updateChatStatusElement = function(element){
		element.removeClass("chat_available_status_online");
		element.removeClass("chat_available_status_busy");
		element.removeClass("chat_available_status_offline");
		element.addClass("chat_available_status_"+currentChatStatus);
	}
	
	/**
	 * Update the status on the page
	 */
	var updateChatStatus = function(){
		updateChatStatusElement($("#userid"));
		if ($("#profile_name")) {
			updateChatStatusElement($("#profile_name"));
		}
		showOnlineFriends();
	};
	
	/**
	 * Set the chatstatus to of the user
	 * @param {String} chatstatus The chatstatus which should be 
	 * online/offline or busy
	 */
	var sendChatStatus = function(chatstatus){
		currentChatStatus = chatstatus;
		var basic = {};
		basic.status = json.status;
	
		var a = ["u"];
		var k = ["chatstatus"];
		var v = [chatstatus];
		
		var tosend = {"k":k,"v":v,"a":a};
		
		sdata.Ajax.request({
	      	url :"/rest/patch/f/_private" + me.userStoragePrefix + "profile.json",
        	httpMethod : "POST",
            postData : tosend,
            contentType : "application/x-www-form-urlencoded",
            onSuccess : function(data) {
				updateChatStatus();
			},
			onFail : function(data){
				alert("An error occurend when sending the status to the server.");
			}
		});
	};
	
	/*
	sdata.Ajax.request({
         url: "/_rest/chatstatus/set",
            httpMethod: "POST",
            onSuccess: function(data){
				updateChatStatus();
          },
            onFail: function(status){
                alert("It was not possible to set your status;");
            },
            postData: {
                "chatstatus": chatstatus
            },
            contentType: "application/x-www-form-urlencoded"
        });
	*/

	
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
								//var pict = eval('(' + item.profile.picture + ')');
								var pict = item.profile.picture;
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
			$("#nav_people_link").html('<a href="javascript:;" class="explore_nav_selected rounded_corners"><span>People</span></a><img src="/dev/_images/arrow_down_sm2.png" class="explore_nav_selected_arrow" />');
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
	
	var getUnreadMessages = function() {
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/_rest/messages/count?types=inbox&categories=*&read=false",
			onSuccess: function(data){
				var json = eval('(' + data + ')');
				if (json.response == "OK" && json.count)
				$("#chat_unreadMessages").text(json.count[0]);
			}
		});
	};
	
	/**
	 * Get the chat status for the current user
	 */
 	
	var getChatStatus = function(){	
 		sdata.Ajax.request({
            url: "/_rest/chatstatus/get",
            httpMethod: "GET",
            onSuccess: function(data){
				if(typeof data === "string"){
				currentChatStatus = data;
			}
			updateChatStatus();
				
            },
            onFail: function(status){
				currentChatStatus = "online";
				updateChatStatus();
            }
        });
	}
	
	/**
	 * Add binding to some elements
	 */
	var addBinding = function(){
		$("#user_link").bind("click", function(){
            showHideUserLinkMenu();
        });
		
		$(".user_link_chat_status").bind("click", function(ev){
			showHideUserLinkMenu();
            var clicked = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
            sendChatStatus(clicked);
        });
	};
    
    var doInit = function(){
    
        var person = sdata.me;
        
        if (!person.preferences.uuid) {
            return;
        }
        else {
            $("#explore_nav_container").show();
            $("#chat_main_container").show();
        }
        
        if (person.profile.firstName || person.profile.lastName) {
            $("#userid").text(person.profile.firstName + " " + person.profile.lastName);
        }
        
        $("#hispan").text(person.profile.firstName);
        
        if (person.profile.picture) {
            var picture = eval('(' + person.profile.picture + ')');
            if (picture.name) {
                $("#picture_holder").html("<img src='/sdata/f/_private" + person.userStoragePrefix + picture.name + "'/>");
            }
        }
        
       	selectPage();
       	setPeopleDropdown();
        setSitesDropdown();
		getChatStatus();
		addBinding();
	};

	
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
			sendToLoginOnFail: goBackToLogin
		});
		
	}
	
	var checkOnline = function(){
		if (sakai._isAnonymous && goBackToLogin == false) {
			return;
		}
		
		var sendToLoginOnFail = "false";
		if (goBackToLogin) {
			sendToLoginOnFail = "true";
		}
	
		sdata.Ajax.request({
			url: "/_rest/presencewow/friends?sid=" + Math.random(),
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
		
	};
	
	/**
	 * Shorten a string and add 3 dots if the string is too long
	 * @param {String} input The string you want to shorten
	 * @param {Int} maxlength Maximum length of the string
	 */
	var shortenString = function(input, maxlength){
		if(typeof input === "string" && input.lastIndexOf("") >= maxlength){
			input = input.substr(0, maxlength) + "...";
		}
		return input;
	};
	
	/**
	 * Parse the chatstatus for a user
	 * @param {String} chatStatus The chatstatus which should be 
	 * online, busy or offline
	 */
	var parseChatStatus = function(chatStatus){
		// Check if the status is defined
		if (!chatStatus) {
			chatStatus = "online";
		}
		return chatStatus;
 	}
 	
	/**
	 * Parse the name for a user
	 * @param {String} uuid Uuid of the user
	 * @param {String} firstName Firstname of the user
	 * @param {String} lastName Lastname of the user
	 */
	var parseName = function(uuid, firstName, lastName){
		if (firstName && lastName) {
			return shortenString(firstName + " " + lastName, 11);
		}
		else {
			return shortenString(json.items[i].userid, 14);
		}
	};
	
	var parsePicture = function(picture, userStoragePrefix){
		if (picture) {
			var pict = eval('(' + picture + ')');
			return "/webdav/_private" + userStoragePrefix + pict.name;
		}
	};
	
	var parseStatusMessage = function(basic){
		if (basic) {
			var base = eval('(' + basic + ')');
			if(base.status){
				return shortenString(base.status, 20);
			}
		}
		return shortenString("No status message")
	};
	
	var addChatBinding = function(){
		$("#chat_available_minimize").bind("click", function(){
			hideOnline();
		});
		
		$(".initiate_chat_window").bind("click", function(ev){
			var clicked = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 1];
			openChat(clicked);
		});
	};
	
	/**
	 * Get a user from the all friends object
	 * @param {Object} uuid Uid of the user you want to get
	 */
	var getUserFromAllFriends = function(uuid){
		for(var i = 0; i < allFriends.users.length; i++){
			if(allFriends.users[i].userid === uuid){
				return allFriends.users[i];
			}
		}
		return null;
	};
	
	/**
	 * Save the json object containing all friends 
	 * to an easier to read friends object
	 * @param {Object} jsonitem
	 */
	var saveToAllFriends = function(jsonitem){
		var user ={};
		user.userid = jsonitem.userid;
		user.name = jsonitem.name;
		user.photo = jsonitem.photo;
		user.status = jsonitem.status;
		user.statusmessage = jsonitem.statusmessage;
		allFriends.users.push(user);
	};

	
	var showOnlineFriends = function(){
	
		var json = online;
		var total = 0; //Total online friends
		allFriends = {};
		allFriends.users = [];
		if (json.items !== undefined) {
			for (var i = 0; i < json.items.length; i++) {
				/** Check if a friend is online or not */
				if (json.items[i].status === "online") {
					total++;
					if (typeof json.items[i].profile === "string") {
						json.items[i].profile = eval('(' + json.items[i].profile + ')');
					}
					json.items[i].name = parseName(json.items[i].userid, json.items[i].profile.firstName, json.items[i].profile.lastName)
					json.items[i].photo = parsePicture(json.items[i].profile.picture, json.items[i].userStoragePrefix);
					json.items[i].statusmessage = parseStatusMessage(json.items[i].profile.basic);
				}
				else {
				//json.items.splice(i,1);
				}
				saveToAllFriends(json.items[i]);
			}
		}
		if (!total || total == 0) {
			json.items = [];
			json.totalitems = total;
			$("#chat_online").html("(0)");
		}
		else {
			json.totalitems = total;
			$("#chat_online").html("<b>(" + total + ")</b>");
		}
		
		var currentMe = sdata.me;
		json.me = {};
		json.me.name = parseName(sdata.me.preferences.userInfo.user.uuid, sdata.me.profile.firstName, sdata.me.profile.lastName);
		json.me.photo = parsePicture(sdata.me.profile.picture, sdata.me.userStoragePrefix);
		json.me.statusmessage = parseStatusMessage(sdata.me.profile.basic);
		json.me.chatstatus = currentChatStatus;
		
		$("#chat_available").html(sdata.html.Template.render("chat_available_template", json));
		addChatBinding();
		
		enableDisableOnline();
		
	}
	
	var hasOpenChatWindow = false;
	
	var openChat = function(clicked){
	
		$("#online_button_" + clicked).css("background-color","#ffffff");
	
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
				
		var user = getUserFromAllFriends(clicked);
		
		if(user !== null){
			activewindows.items[index].name = user.name;
			specialjson.items[0].name = user.name;
			activewindows.items[index].photo = user.photo;
			specialjson.items[0].photo = user.photo;
			activewindows.items[index].status = user.status;
			specialjson.items[0].status = user.status;
			activewindows.items[index].statusmessage = user.statusmessage;
			specialjson.items[0].statusmessage = user.statusmessage;
		}else{
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
						activewindows.items[index].photo = "/dev/_images/my-profile-img.jpg";
						specialjson.items[0].photo = "/dev/_images/my-profile-img.jpg";
					}
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
			hideOnline();
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
	
	/**
	 * Return the render of a certain chat message
	 * @param {Object} message Message that needs to be rendered
	 */
	var render_chat_message = function(message){
		return sdata.html.Template.render("chat_content_template", message);
	}
	
	/**
	 * Check the height of an element and add overflow or not
	 * @param {Object} el Element that needs to be checked
	 * @param {String} nooverflow Class that will be added if the height is not too big
	 * @param {String} overflow Class that will be added it the height is too big
	 */
	var checkHeight = function(el, nooverflow, overflow){
		if(el.hasClass(nooverflow)){
			/*for(var i = 0; i < el.children(); i++){
				
			}*/
			var totalHeight = 0;
			el.children().each(function() {
				totalHeight += $(this).attr('scrollHeight');
				console.log(totalHeight + "|" + el.height());
				if(totalHeight >= el.height()){
					el.removeClass(nooverflow);
					el.addClass(overflow);
				}
			});
		}
	};
	
	/**
	 * Add a chat message
	 * @param {Object} el Elment where the element needs to be attached to
	 * @param {Object} message Message that needs to be appended
	 */
	var add_chat_message = function(el, message){
		if(el.length > 0){
			el.append(render_chat_message(message));
			checkHeight(el, "chat_with_content_nooverflow", "chat_with_content_overflow");
			el.attr("scrollTop", el.attr("scrollHeight"));
		};		
	};
	
	/**
	 * Create a chat message
	 * @param {Object} isMessageFromOtherUser Is the message from another user
	 * @param {Object} otherUserName The name of the other user
	 * @param {Object} inputmessage The message that needs to be added to the message
	 * @param {Object} inputdate The date of the message
	 */
	var createChatMessage = function(isMessageFromOtherUser, otherUserName, inputmessage, inputdate){
		var message = {};
		/** Check if the message is from the other user */
		if(isMessageFromOtherUser){
			message.name = otherUserName;
		}else{
			message.name = "Me";
		}

		message.message = inputmessage;
		
		/** Parse the date to get the hours and minutes */
		var messageDate = new Date(inputdate);
		message.time = parseToAMPM(messageDate);
		
		return message;
	};

	
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
			hideOnline();
			$("#chat_with_" + clicked).show();
			hasOpenChatWindow = true;
		}
		
		$(".chat_minimize").unbind("click");
		$(".chat_minimize").bind("click", function(ev){
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
				hideOnline();
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
		
		$(".chat_close").unbind("click");
+		$(".chat_close").bind("click", function(ev){
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
				$("#chat_with_" + activewindows.items[i].userid).css("left", "" + (20 + (i * 145)) + "px");
			}
			
		});
		
		$(".chat_with_txt").unbind("keydown");
		$(".chat_with_txt").bind("keydown", function(ev){
			if (ev.keyCode == 13) {
				var currentuser = ev.currentTarget.id.split("_")[ev.currentTarget.id.split("_").length - 2];
				var text = $("#chat_with_" + currentuser + "_txt").val();
				if (text != "") {
					/** Create a chat message */
					var message = {};
					message = createChatMessage(false, "", text, new Date());
					add_chat_message($("#chat_with_" + currentuser + "_content"), message);
					$("#chat_with_" + currentuser + "_txt").val("");
					
					var data = {
						message: text,
						to: currentuser
					};
					
					sdata.Ajax.request({
						url: "/_rest/chat/send",
						httpMethod: "POST",
						onSuccess: function(data){
						},
						onFail: function(status){
							alert("An error has occured when sending the message.");
						},
						postData: data,
						contentType: "application/x-www-form-urlencoded"
					});
					
				}
			}
		});
		
	}
	
	var hideOnline = function(){
		$("#show_online").hide();
		$("#online_button").removeClass("show_online_visible");
		$("#online_button").addClass("show_online_unvisible");
	};
 	
	var showOnline = function(){
		$("#show_online").show();
		$("#online_button").removeClass("show_online_unvisible");
		$("#online_button").addClass("show_online_visible");
	};
	
	var showHideOnline = function(){
		if ($("#show_online").is(":visible")) {
			hideOnline();
		}
		else {
			showOnline();
		}
	};
	
	$("#chat_online_connections_link").bind("click", function(ev){
	
		for (var i = 0; i < activewindows.items.length; i++) {
			$("#chat_with_" + activewindows.items[i].userid).hide();
		}
		showHideOnline();
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
	
	/**
	 * Format the input date to a AM/PM Date
	 * @param {Date} d Date that needs to be formatted
	 */
	var parseToAMPM = function(d){
		var current_hour = d.getHours();
		if (current_hour < 12) {am_or_pm = "AM";} else{am_or_pm = "PM";}
		if (current_hour == 0){current_hour = 12;}
		if (current_hour > 12){current_hour = current_hour - 12;}
		
		var current_minutes = d.getMinutes() + "";
		if (current_minutes.length == 1){current_minutes = "0" + current_minutes;}
		
		return current_hour + ":" + current_minutes + am_or_pm;
	};
	
	
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
		
		var tosend = onlineUsers.join(",");
		
		sdata.Ajax.request({
			//url: "/sdata/chat/?users=" + tosend + "&initial=" + initial + "&sid=" + Math.random(),
			url: "/_rest/chat/get?users=" + tosend + "&initial=" + initial + "&sid=" + Math.random(),
			httpMethod: "GET",
			sendToLoginOnFail: "false",
			onSuccess: function(data){
				var json = json_parse(data);
				if(json.messages){
					console.log("in lus");
					for(var i in json.messages) {
						var isMessageFromOtherUser = false;
						var chatwithuserUid = i;
						
						if ($("#chat_with_" + i).length > 0) {
							var el = $("#chat_with_" + chatwithuserUid + "_content");
							var chatwithusername = parseName(chatwithuserUid, json.messages[i].profile.firstName, json.messages[i].profile.lastName);
							/** Create a message */
							var message = {};
							for(var j = 0; j < json.messages[i].messages.length; j++){
								if (sdata.me.preferences.userInfo.user.uuid === json.messages[i].messages[j].from) {
									isMessageFromOtherUser = false;
								}
								else {
									isMessageFromOtherUser = true;
								}
								
								message = createChatMessage(isMessageFromOtherUser, chatwithusername, json.messages[i].messages[j].bodyText, json.messages[i].messages[j].date);
								add_chat_message(el, message);
							}							
							
							/*
							for (var ii = 0; ii < json.messages.length; ii++) {
								
								
								
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
										if (hasOpenChatWindow) {
											//Just flash and change color
											setTimeout("sakai._chat.doFlash('" + json.items[i].items[ii].sender + "')", 500);
										}
										else {
											//Flash and open window
											setTimeout("sakai._chat.doOpenFlash('" + json.items[i].items[ii].sender + "')", 500);
										}
									}
								}
							}*/
						
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
								activewindows.items[index].photo = "/dev/_images/my-profile-img.jpg";
								special.items[0].photo = "/dev/_images/my-profile-img.jpg";
							}
							for (var ii = 0; ii < activewindows.items.length; ii++) {
								if (activewindows.items[ii].userid == i) {
									if (activewindows.items[ii].active) {
										togo = false;
									}
								}
							}
						
							if (togo) {
								if (hasOpenChatWindow) {
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
		//informPresent();
		checkOnline();
		doInit();
	}

};

sdata.widgets.WidgetLoader.informOnLoad("chat");