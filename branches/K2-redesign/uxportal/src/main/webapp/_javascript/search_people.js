var sakai = sakai ||
{};

sakai._search = {};
sakai.search = function() {

	/*
	 Config variables
	 */
	var peopleToSearch = 5;
	
	var meObj = false;
	var foundPeople = false;
	var hasHadFocus = false;
	var searchterm = "";
	var currentpage = 0;
	var contactclicked = false;
	
	var myfriends = false;
	
	sakai._search.reset = function() {
		$("#search_result_title").hide();
		$(".search_results_part_footer").hide();
		$("#introduction_text").show();
		$("#display_more_people").show();
	}
	
	var doInit = function() {
	
		sdata.Ajax.request({
			url: "/rest/me?sid=" + Math.random(),
			onSuccess: function(response) {
				meObj = eval('(' + response + ')');
				if (meObj.preferences.uuid) {
					inituser = meObj.profile.firstName + " " + meObj.profile.lastName;
					$("#userid").text(inituser);
					placeImage();
					loadFriendList();
				}
				else {
					document.location = "/dev/index.html";
				}
			},
			onFail: function(response) {
					document.location = "/dev/index.html";
			}
		});
		
	}
	
	var loadFriendList = function() {
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/friend/status?p=0&n=100&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
			onSuccess: function(data) {
				myfriends = eval('(' + data + ')');
				History.history_change();
			},
			onFail: function(status) {
			}
		});
	}
	
	var placeImage = function() {
		// Fix small arrow horizontal position
		$('.explore_nav_selected_arrow').css('right', $('.explore_nav_selected').width() / 2 + 10);
		
		// Round cornners for elements with '.rounded_corners' class
		$('.rounded_corners').corners("2px");
		
		// IE Fixes
		if (($.browser.msie) && ($.browser.version < 8)) {
			// Tab fix
			$('.fl-tabs li a').css('bottom', '-1px');
			$('.fl-tabs .fl-activeTab a').css('bottom', '-1px');
			
			//Search button fix
			$('.search_button').css('top', '4px');
			
			// Small Arrow Fix
			$('.explore_nav_selected_arrow').css('bottom', '-10px');
		}
	}
	
	sakai._search.doHSearch = function(page, searchquery) {
		if (!page) {
			page = 1;
		}
		if (!searchquery) {
			searchquery = $("#search_text").val().toLowerCase();
		}
		currentpage = page;
		History.addBEvent("" + page + "|" + searchquery);
	}
	
	sakai._search.doSearch = function(page, searchquery) {
	
		currentpage = parseInt(page);
		
		if (searchquery) {
			$("#search_text").val(searchquery);
			$("#search_text").addClass("search_bar_selected");
		}
		
		searchterm = $("#search_text").val().toLowerCase();
		
		if (searchterm) {
		
			// Set searching messages
			
			$("#mysearchterm").text(searchterm);
			$("#display_more_people_number").text("0");
			$("#display_more_cm_number").text("0");
			$("#numberfound").text("0");
			$("#content_media_search_result").html("<b>To Do ...</b>");
			$("#people_search_result").html("<b>Searching ...</b>");
			$("#courses_sites_search_result").html("<b>To Do ...</b>");
			
			// Set everything visible
			
			$("#introduction_text").hide();
			$("#display_more_people").hide();
			$("#content_media_header").show();
			$("#people_header").show();
			$("#courses_sites_header").show();
			$("#search_result_title").show();
			$(".search_results_part_footer").show();
			
			// Set off the 3 AJAX requests
			
			// People Search
			
			var peoplesearchterm = "";
			var splitted = searchterm.split(" ");
			for (var i = 0; i < splitted.length; i++) {
				peoplesearchterm += splitted[i] + "~" + " " + splitted[i] + "*" + " ";
			}
			
			var searchFilter = $('#search_filter option:selected"').val();
			var searchWhere = '*';
			if (searchFilter === 'entire_community') {
				searchWhere = '*';
			}
			else if (searchFilter === 'my_contacts') {
				searchWhere = 'mycontacts';
			}
			else {
				searchWhere = '*';
			}
			
			sdata.Ajax.request({
				httpMethod: "GET",
				url: "/rest/search?p=" + (currentpage - 1) + "&path=/_private&n=" + peopleToSearch + "&q=" + peoplesearchterm + "&people=" + searchWhere + "&mimetype=text/plain&s=sakai:firstName&s=sakai:lastName&sid=" + Math.random(),
				onSuccess: function(data) {
					foundPeople = eval('(' + data + ')');
					renderPeople();
				},
				onFail: function(status) {
					foundPeople = {};
					renderPeople();
				}
			});
			
		}
		else {
		
			sakai._search.reset();
			
		}
		
	}
	
	
	/*
	 People search
	 */
	// Pager click handler
	var pager_click_handler = function(pageclickednumber) {
		currentpage = pageclickednumber;
		sakai._search.doHSearch(currentpage, searchterm);
	}
	
	var _currentTotal = 0;
	
	var renderPeople = function() {
	
		var finaljson = {};
		finaljson.items = [];
		
		var currentTotal = parseInt($("#numberfound").text());
		currentTotal += foundPeople.size;
		$("#numberfound").text(currentTotal);
		_currentTotal = currentTotal;
		
		// Pager Init
		
		$(".jq_pager").pager({
			pagenumber: currentpage,
			pagecount: Math.ceil(_currentTotal / peopleToSearch),
			buttonClickCallback: pager_click_handler
		});
		
		
		if (foundPeople && foundPeople.results) {
			for (var i = 0; i < foundPeople.results.length; i++) {
				var item = foundPeople.results[i];
				if (item) {
					var index = finaljson.items.length;
					finaljson.items[index] = {};
					finaljson.items[index].userid = item.path.split("/")[4];
					var sha = sha1Hash(finaljson.items[index].userid).toUpperCase();
					var path = sha.substring(0, 2) + "/" + sha.substring(2, 4);
					var person = json_parse(item.content);
					if (person.picture) {
						var picture = person.picture;
						finaljson.items[index].picture = "/sdata/f/_private/" + path + "/" + finaljson.items[index].userid + "/" + picture.name;
					}
					if (person.firstName || person.lastName) {
						var str = person.firstName;
						str += " " + person.lastName;
						finaljson.items[index].name = str;
					}
					else {
						finaljson.items[index].name = finaljson.items[index].userid;
					}
					if (person.basic) {
						var basic = person.basic;
						if (basic.unirole) {
							finaljson.items[index].extra = basic.unirole;
						}
						else if (basic.unicollege) {
							finaljson.items[index].extra = basic.unicollege;
						}
						else if (basic.unidepartment) {
							finaljson.items[index].extra = basic.unidepartment;
						}
					}
					finaljson.items[index].connected = false;
					if (myfriends.status.friends) {
						for (var ii = 0; ii < myfriends.status.friends.length; ii++) {
							var friend = myfriends.status.friends[ii];
							if (friend.friendUuid == finaljson.items[index].userid) {
								finaljson.items[index].connected = true;
							}
						}
					}
					if (finaljson.items[index].userid == sdata.me.preferences.uuid) {
						finaljson.items[index].isMe = true
					}
				}
			}
		}
		
		if (finaljson.items.length == 0) {
			$(".jq_pager").hide();
		}
		else {
			$(".jq_pager").show();
		}
		
		$("#people_search_result").html(sdata.html.Template.render("people_search_result_template", finaljson));	
	}
	
	var contactclicked = false;
	
	var loadContactDialog = function(hash) {
		var tosearchfor = contactclicked;
		var person = false;
		for (var i = 0; i < foundPeople.results.length; i++) {
			var people = eval('(' + foundPeople.results[i].content + ')');
			if (foundPeople.results[i].path.split("/")[4] == tosearchfor) {
				person = people;
			}
		}
		$("#add_friend_displayname").text(person.firstName);
		$("#add_friend_displayname2").text(person.firstName);
		if (person.picture && person.picture.name) {
			$("#add_friend_profilepicture").html("<img src='/sdata/f/_private/" + sha1Hash(tosearchfor).toUpperCase().substring(0, 2) + "/" + sha1Hash(tosearchfor).toUpperCase().substring(2, 4) + "/" + tosearchfor + "/" + person.picture.name + "' width='40px' height='40px'/>");
		}
		else {
			$("#add_friend_profilepicture").html("<img src='images/person_icon.png' width='40px' height='40px'/>");
		}
		
		$("#add_friend_types").html(sdata.html.Template.render("add_friend_types_template", Widgets));
		$("#add_friend_personal_note").text("I would like to invite you to become a member of my network on Sakai \n\n- " + sdata.me.profile.firstName);
		
		hash.w.show();
	}
	
	$('#add_to_contacts_dialog').jqm({
		modal: true,
		overlay: 20,
		toTop: true,
		onShow: loadContactDialog
	});
	
	
	/*
	 Event listeners
	 */
	$("#tab_search_all, #tab_search_content, #tab_search_people, #tab_search_sites").bind("click", function(ev) {
		if (searchterm) {
			$(this).attr("href", $(this).attr("href").split('#')[0] + "#1|" + searchterm);
		}
		return true;
	});
	
	$("#add_friends_do_invite").bind("click", function(ev) {
		var toSend = sdata.FormBinder.serialize($("#add_friends_form"));
		if (toSend["add_friends_list_type"]) {
		
			var type = toSend["add_friends_list_type"];
			var comment = toSend["add_friend_personal_note"];
			
			// send message to other person
			var userstring = sdata.me.profile.firstName + " " + sdata.me.profile.lastName;
			
			var title = Config.Connections.Invitation.title.replace(/[$][{][u][s][e][r][}]/g, userstring);
			var message = Config.Connections.Invitation.body.replace(/[$][{][u][s][e][r][}]/g, userstring).replace(/[$][{][c][o][m][m][e][n][t][}]/g, comment);
			
			// construct openSocial message
			var openSocialMessage = new opensocial.Message(message, {
				"title": title,
				"type": Config.Messages.Categories.invitation
			});
			
			var data = {
				"friendUuid": contactclicked,
				"friendType": type,
				"message": sdata.JSON.stringify({
					"title": title,
					"body": openSocialMessage
				})
			};
			
			sdata.Ajax.request({
				url: "/rest/friend/connect/request",
				httpMethod: "POST",
				onSuccess: function(data) {
					
					//	Do a request to the messaging service as well.
					var toSend = {
						"to": contactclicked,
						"message": sdata.JSON.stringify(openSocialMessage)
					};
					sdata.Ajax.request({
						url: "/_rest/messages/send",
						httpMethod: "POST",
						onSuccess: function(data) {
							var json = json_parse(data);
							if (json.response === "OK") {
								$("#link_add_to_contacts_" + contactclicked).hide();
								$("#link_add_to_contacts_" + contactclicked + "_divider").hide();
								$('#add_to_contacts_dialog').jqmHide();
							}
							else {
								$("#add_to_contacts_response").text("Failed to send the message.")
							}
						},
						onFail: function(status) {
							$("#add_to_contacts_response").text("Failed to send the message.")
						},
						postData: toSend,
						contentType: "application/x-www-form-urlencoded"
					});
					
				},
				onFail: function(status) {
					alert("An error has occured");
				},
				postData: data,
				contentType: "application/x-www-form-urlencoded"
			});
			
		}
	});
	
	
	var searchPerson = function() {
		var tosearchfor = contactclicked;
		var person = false;
		for (var i = 0; i < foundPeople.results.length; i++) {
			var people = json_parse(foundPeople.results[i].content);
			if (foundPeople.results[i].path.split("/")[4] == tosearchfor) {
				person = people;
				break;
			}
		}
		return person;
	}
	
	$(".search_result_person_link_message").live("click", function() {
		contactclicked = $(this).attr("id").replace(/search_result_person_link_message_/gi, "");
		var person = searchPerson();
		$("#sendmessagecontainer").show();
		if (!person.uuid) {person.uuid = contactclicked; }
		sakai.sendmessage.initialise(person);
	});
	$(".link_add_to_contacts").live("click", function(ev) {
		contactclicked = this.id.split("_")[4]
		$('#add_to_contacts_dialog').jqmShow();
	});
	
	$("#search_text").bind("focus", function(ev) {
		if (!hasHadFocus) {
			$("#search_text").val("");
			$("#search_text").addClass("search_bar_selected");
		}
		hasHadFocus = true;
	});
	
	$("#search_text").bind("keypress", function(ev) {
		if (ev.keyCode == 13) {
			sakai._search.doHSearch();
		}
	});
	
	$("#search_button").bind("click", function(ev) {
		sakai._search.doHSearch();
	});
	
	doInit();
	
}

sdata.registerForLoad("sakai.search");
