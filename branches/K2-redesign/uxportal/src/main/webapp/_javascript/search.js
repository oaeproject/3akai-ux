var sakai = sakai ||
{};

sakai._search = {};
sakai.search = function() {

	/*
	 Config variables
	 */
	var peopleToSearch = 5;
	var cmToSearch = 5;
	var sitesToSearch = 5;
	
	var meObj = false;
	var foundPeople = false;
	var foundCM = false;
	var foundSites = false;
	var hasHadFocus = false;
	var searchterm = "";
	
	var myfriends = false;
	
	sakai._search.reset = function() {
		$("#content_media_header").hide();
		$("#people_header").hide();
		$("#courses_sites_header").hide();
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
		//	set the links for the tabs
		
		History.addBEvent("1|" + $("#search_text").val().toLowerCase());
	}
	
	sakai._search.doSearch = function(page, searchquery) {
	
		if (searchquery) {
			$("#search_text").val(searchquery);
			$("#search_text").addClass("search_bar_selected");
		}
		
		searchterm = $("#search_text").val().toLowerCase();
		
		if (searchterm) {
		
			// Set searching messages
			
			$("#mysearchterm").text(searchterm);
			$("#numberfound").text("0");
			
			$("#display_more_people_number").text("0");
			$("#display_more_cm_number").text("0");
			$("#display_more_sites_number").text("0");
			$("#content_media_search_result").html("<b>Searching ...</b>");
			$("#people_search_result").html("<b>Searching ...</b>");
			$("#courses_sites_search_result").html("<b>Searching ...</b>");
			
			// Set everything visible
			
			$("#introduction_text").hide();
			$("#display_more_people").hide();
			$("#content_media_header").show();
			$("#people_header").show();
			$("#courses_sites_header").show();
			$("#search_result_title").show();
			$(".search_results_part_footer").show();
			
			// Set off the 3 AJAX requests
			
			// Content & Media Search
			
			var cmsearchterm = "";
			var splitted = searchterm.split(" ");
			for (var i = 0; i < splitted.length; i++) {
				cmsearchterm += splitted[i] + "~" + " " + splitted[i] + "*" + " ";
			}
			
			sdata.Ajax.request({
				httpMethod: "GET",
				url: "dummyjson/searchContent.json?p=0&path=/_sites&n=" + cmToSearch + "&q=" + cmsearchterm + "&mimetype=text/plain&sid=" + Math.random(),
				onSuccess: function(data) {
					foundCM = json_parse(data);
					renderCM();
				},
				onFail: function(status) {
					foundCM = {};
					renderCM();
				}
			});
			
			// People Search
			
			var peoplesearchterm = "";
			var splitted = searchterm.split(" ");
			for (var i = 0; i < splitted.length; i++) {
				peoplesearchterm += splitted[i] + "~" + " " + splitted[i] + "*" + " ";
			}
			
			sdata.Ajax.request({
				httpMethod: "GET",
				url: "/rest/search?p=0&path=/_private&n=" + peopleToSearch + "&q=" + peoplesearchterm + "&mimetype=text/plain&s=sakai:firstName&s=sakai:lastName&sid=" + Math.random(),
				onSuccess: function(data) {
					foundPeople = eval('(' + data + ')');
					renderPeople();
				},
				onFail: function(status) {
					foundPeople = {};
					renderPeople();
				}
			});
			
			//	Sites search
			var cmsearchterm = "";
			var splitted = searchterm.split(" ");
			for (var i = 0; i < splitted.length; i++) {
				cmsearchterm += splitted[i] + "~" + " " + splitted[i] + "*" + " ";
			}
			
			sdata.Ajax.request({
				httpMethod: "GET",
				url: "/dev/dummyjson/searchSites.json?p=0&path=/_sites&n=" + cmToSearch + "&q=" + cmsearchterm + "&mimetype=text/plain&sid=" + Math.random(),
				onSuccess: function(data) {
					foundSites = json_parse(data);
					renderSites();
				},
				onFail: function(status) {
					foundSites = {};
					renderSites();
				}
			});
			
			
		}
		else {
		
			sakai._search.reset();
			
		}
		
	}
	
	
	/*
	 Content & Media Search
	 */
	var renderCM = function() {
	
		var finaljson = {};
		finaljson.items = [];
		
		var currentTotal = parseInt($("#numberfound").text());
		currentTotal += foundCM.size;
		$("#numberfound").text(currentTotal);
		
		if (foundCM.size > cmToSearch) {
			$("#display_more_cm").show();
			$("#display_more_cm_number").text(foundCM.size);
		}
		
		if (foundCM && foundCM.results) {
			for (var i = 0; i < foundCM.results.length; i++) {
				var item = foundCM.results[i];
				if (item) {
					var index = finaljson.items.length;
					finaljson.items[index] = item;
					//	Highlight the search term and show 300 characters in front and after it
					var content = item.description.replace(/<\/?[^>]+(>|$)/g, " ");
					var place = content.toLowerCase().indexOf(searchterm);
					if (place) {
						var toreplace = content.substring(place, place + searchterm.length);
						content = content.replace(toreplace, "<strong>" + toreplace + "</strong>");
						var start = place - (600 / 2);
						if (start < 0) {
							start = 0;
						}
						var end = place + (600 / 2);
						content = content.substring(start, end) + "...";
					}
					else {
						content = content.substring(0, 600);
					}
					finaljson.items[index].content = content;
				}
			}
		}
		
		$("#content_media_search_result").html(sdata.html.Template.render("content_media_search_result_template", finaljson));
		
	}
	
	/*
	 Course & Sites Search
	 */
	var renderSites = function() {
	
		var finaljson = {};
		finaljson.items = [];
		
		var currentTotal = parseInt($("#numberfound").text());
		currentTotal += foundSites.size;
		$("#numberfound").text(currentTotal);
		
		if (foundSites.size > sitesToSearch) {
			$("#display_more_sites").show();
			$("#display_more_sites_number").text(foundSites.size);
			$("#display_more_sites").attr("href", "search_b_sites.html#1|" + searchterm);
		}
		
		if (foundSites && foundSites.results) {
			finaljson.items = foundSites.results;
		}
		
		$("#courses_sites_search_result").html(sdata.html.Template.render("courses_sites_search_result_template", finaljson));
		
	}
	
	
	/*
	 People search
	 */
	var renderPeople = function() {
	
		var finaljson = {};
		finaljson.items = [];
		
		var currentTotal = parseInt($("#numberfound").text());
		currentTotal += foundPeople.size;
		$("#numberfound").text(currentTotal);
		
		if (foundPeople.size > peopleToSearch) {
			$("#display_more_people").show();
			$("#display_more_people_number").text(foundPeople.size);
			$("#display_more_people").attr("href", "search_b_people.html#1|" + searchterm);
		}
		
		if (foundPeople && foundPeople.results) {
			for (var i = 0; i < foundPeople.results.length; i++) {
				var item = foundPeople.results[i];
				var person = json_parse(item.content);
				if (person) {
					var index = finaljson.items.length;
					finaljson.items[index] = {};
					finaljson.items[index].userid = item.path.split("/")[4];
					var sha = sha1Hash(finaljson.items[index].userid).toUpperCase();
					var path = sha.substring(0, 2) + "/" + sha.substring(2, 4);
					if (person.picture) {
						finaljson.items[index].picture = "/sdata/f/_private/" + path + "/" + finaljson.items[index].userid + "/" + person.picture.name;
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
		
		$("#people_search_result").html(sdata.html.Template.render("people_search_result_template", finaljson));
		
		$(".link_add_to_contacts").bind("click", function(ev) {
			contactclicked = this.id.split("_")[4];
			$('#add_to_contacts_dialog').jqmShow();
		});
		
	}
	
	
	var contactclicked = false;
	
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
	
	var loadContactDialog = function(hash) {
		var person = searchPerson();
		
		$("#add_friend_displayname").text(person.firstName);
		$("#add_friend_displayname2").text(person.firstName);
		if (person.picture && person.picture.name) {
			$("#add_friend_profilepicture").html("<img src='/sdata/f/_private/" + sha1Hash(tosearchfor).toUpperCase().substring(0, 2) + "/" + sha1Hash(tosearchfor).toUpperCase().substring(2, 4) + "/" + tosearchfor + "/" + person.picture.name + "' width='40px' height='40px'/>");
		}
		else {
			$("#add_friend_profilepicture").html("<img src='/dev/_images/person_icon.png' width='40px' height='40px'/>");
		}
		
		$("#add_friend_types").html(sdata.html.Template.render("add_friend_types_template", Widgets));
		$("#add_friend_personal_note").text("I would like to invite you to become a member of my network on Sakai \n\n- " + sdata.me.profile.firstName);
		
		hash.w.show();
	}
	var loadMessageDialog = function(hash) {
		var person = searchPerson(contactclicked);
		
		$("#message_from").text(meObj.profile.firstName + " " + meObj.profile.lastName);
		$("#message_to").text(person.firstName + " " + person.lastName);
		
		$("#comp-subject").val('');
		$("#comp-body").val('');
		
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
	
	
	$(".search_result_person_link_message").live("click", function() {
		contactclicked = $(this).attr("id").replace(/search_result_person_link_message_/gi, "");
		var person = searchPerson();
		$("#sendmessagecontainer").show();
		if (!person.uuid) {person.uuid = contactclicked; }
		sakai.sendmessage.initialise(person);
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
	
	$("#search_text_button").bind("click", function(ev) {
		sakai._search.doHSearch();
	});
	
	doInit();
	
}

sdata.registerForLoad("sakai.search");