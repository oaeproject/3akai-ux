var sakai = sakai || {};

sakai._search = {};
sakai.search = function(){
	
	/*
		Config variables
 	*/
	
	var peopleToSearch = 5;
	
	var meObj = false;
	var foundContacts = false;
	var foundInvitations = false;
	var foundPending = false;
	var currentpage = 0;
	var profiles = {};
	var myfriends = false;

	var doInit = function(){
		
		meObj = sdata.me;
		if (! meObj.preferences.uuid){
			document.location = "/dev/index.html?url=/dev/people.html";
		}
		
		loadContacts(1);
		loadInvitations();
		loadPending();
		
	}
	
	loadContacts = function(page){
		
		currentpage = parseInt(page);
		
		// Set searching messages
			
		$("#contacts_search_result").html("<b>Loading ...</b>");
			
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/friend/status?p=" + (page - 1) + "&n=" + peopleToSearch + "&friendStatus=ACCEPTED&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
			onSuccess: function(data){
				foundContacts = eval('(' + data + ')');
				renderContacts();
			},
			onFail: function(status){
				$("#contacts_search_result").html("<b>An error has occurred.</b> Please try again later");
			}
		});
	
	}
	
	
	/*
		People search 
	*/
	
	// Pager click handler
	var pager_click_handler = function(pageclickednumber){
		currentpage = pageclickednumber;
		loadContacts(currentpage);
	}
	
	var _currentTotal = 0;
	
	var renderContacts = function(){
		
		var finaljson = {};
		finaljson.items = [];
		
		_currentTotal = foundContacts.status.sizes["ACCEPTED"];
		
		// Pager Init
		
		$(".jq_pager").pager({ pagenumber: currentpage, pagecount: Math.ceil(_currentTotal/peopleToSearch), buttonClickCallback: pager_click_handler });
		
		if (foundContacts.status && foundContacts.status.friends) {
			for (var i = 0; i < foundContacts.status.friends.length; i++) {
				var item = foundContacts.status.friends[i];
				var person = item.profile;
				profiles[item.friendUuid] = item;
				profiles[item.friendUuid].profile.uuid = item.friendUuid;
				if (person) {
					var index = finaljson.items.length;
					finaljson.items[index] = {};
					finaljson.items[index].userid = item.friendUuid;
					var sha = sha1Hash(finaljson.items[index].userid).toUpperCase();
					var path = sha.substring(0, 2) + "/" + sha.substring(2, 4);
					if (person.picture) {
						var picture = eval('(' + person.picture + ')');
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
						var basic = eval('(' + person.basic + ')');
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
					finaljson.items[index].connected = true;
					if (finaljson.items[index].userid == sdata.me.preferences.uuid){
						finaljson.items[index].isMe = true
					}
				}
			}
		}
		
		if (finaljson.items.length == 0){
			$(".jq_pager").hide();
		} else {
			$(".jq_pager").show();
		}
		
		$("#contacts_search_result").html(sdata.html.Template.render("contacts_search_result_template", finaljson));
	
	}
	
	/*
		Invitation search 
	*/
	
	loadInvitations = function(){
		
		// Set searching messages
			
		$("#invited_search_result").html("<b>Loading ...</b>");
			
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/friend/status?p=0&n=100&friendStatus=INVITED&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
			onSuccess: function(data){
				foundInvitations = eval('(' + data + ')');
				renderInvitations();
			},
			onFail: function(status){
				$("#invited_search_result").html("<b>An error has occurred.</b> Please try again later");
			}
		});
	
	}
	
	var renderInvitations = function(){
		
		var finaljson = {};
		finaljson.items = [];
		
		if (foundInvitations.status && foundInvitations.status.friends) {
			for (var i = 0; i < foundInvitations.status.friends.length; i++) {
				var item = foundInvitations.status.friends[i];
				var person = item.profile;
				if (person) {
					var index = finaljson.items.length;
					profiles[item.friendUuid] = item;
					profiles[item.friendUuid].profile.uuid = item.friendUuid;
					finaljson.items[index] = {};
					finaljson.items[index].userid = item.friendUuid;
					var sha = sha1Hash(finaljson.items[index].userid).toUpperCase();
					var path = sha.substring(0, 2) + "/" + sha.substring(2, 4);
					if (person.picture) {
						var picture = eval('(' + person.picture + ')');
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
						var basic = eval('(' + person.basic + ')');
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
					if (finaljson.items[index].userid == sdata.me.preferences.uuid){
						finaljson.items[index].isMe = true
					}
				}
			}
		}
		
		$("#invited_search_result").html(sdata.html.Template.render("invited_search_result_template", finaljson));
	
		$(".link_accept_contact").bind("click", function(ev){
			var user = this.id.split("_")[this.id.split("_").length - 1];
			
			var inviter = user;
			var data = {"friendUuid" : inviter};
	
			sdata.Ajax.request({
				url: "/rest/friend/connect/accept",
				httpMethod: "POST",
				onSuccess: function(data){
					setTimeout('loadContacts(1)',500);
					
					// remove from json file
					
					var index = -1;
					for (var i = 0; i < foundInvitations.status.friends.length; i++){
						if (foundInvitations.status.friends[i].friendUuid == user){
							index = i;
						}
					}
					foundInvitations.status.friends.splice(index,1);
					
					// rerender
					
					renderInvitations();
					
				},
				onFail : function(data){
					alert("An error has occured");
				},
				postData: data,
				contentType: "application/x-www-form-urlencoded"
			});
			
		});
	
	}
	
	
	/*
		Pending search 
	*/
	
	loadPending = function(){
		
		// Set searching messages
			
		$("#invited_search_result").html("<b>Loading ...</b>");
			
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/friend/status?p=0&n=100&friendStatus=PENDING&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
			onSuccess: function(data){
				foundPending = eval('(' + data + ')');
				renderPending();
			},
			onFail: function(status){
				$("#pending_search_result").html("<b>An error has occurred.</b> Please try again later");
			}
		});
	
	}
	
	var renderPending = function(){
		
		var finaljson = {};
		finaljson.items = [];
		
		if (foundPending.status && foundPending.status.friends) {
			for (var i = 0; i < foundPending.status.friends.length; i++) {
				var item = foundPending.status.friends[i];
				var person = item.profile;
				if (person) {
					var index = finaljson.items.length;
					profiles[item.friendUuid] = item;
					profiles[item.friendUuid].profile.uuid = item.friendUuid;
					finaljson.items[index] = {};
					finaljson.items[index].userid = item.friendUuid;
					var sha = sha1Hash(finaljson.items[index].userid).toUpperCase();
					var path = sha.substring(0, 2) + "/" + sha.substring(2, 4);
					if (person.picture) {
						var picture = eval('(' + person.picture + ')');
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
						var basic = eval('(' + person.basic + ')');
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
					if (finaljson.items[index].userid == sdata.me.preferences.uuid){
						finaljson.items[index].isMe = true
					}
				}
			}
		}
		
		$("#pending_search_result").html(sdata.html.Template.render("pending_search_result_template", finaljson));
	
	}
	
	$(".person_message_link").live("click", function(ev){
		
		var userid = this.id.split("_")[this.id.split("_").length - 1];
		if (profiles[userid]){
			sakai.sendmessage.initialise(profiles[userid].profile);
		}
		
	});
	
	doInit();
	
}

sdata.registerForLoad("sakai.search");