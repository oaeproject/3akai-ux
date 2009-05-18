var sakai = sakai || {};

sakai.myfriends = function(tuid,placement,showSettings){

	var rootel = $("#" + tuid);
	var friends = false;
	
	$.ajax({
		url: "/rest/friend/status?p=0&n=6&friendStatus=ACCEPTED&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
		success: function(data){
			friends = eval('(' + data + ')');
			doProcessing();
		},
		error: function(status){
			$("#list_rendered").html("<b>An error has occurred.</b> Please try again later");
		}
	});
	
	$.ajax({
		url: "/rest/friend/status?sid=" + Math.random(),
		success: function(data){
			var json2 = eval('(' + data + ')');
			
			var total = 0;
			if (json2.status.friends){
				total += json2.status.sizes["INVITED"];
			}
			
			if (total == 1){
				$("#contact_requests", rootel).html("1 Contact Request");
			} else if (total > 1) {
				$("#contact_requests", rootel).html(total + " Connection Requests");
			}
		}
	});
	
	var doProcessing = function(){
		var pOnline = {};
		pOnline.items = [];
		var total = 0;
		pOnline.showMore = false;
		
		if (friends.status.friends) {
			for (var i = 0; i < friends.status.friends.length; i++) {
				var isOnline = false;
				if (!isOnline && total < 6) {
					var item = friends.status.friends[i];
					item.id = item.friendUuid;
					if (item.profile.firstName && item.profile.lastName) {
						item.name = item.profile.firstName + " " + item.profile.lastName;
					}
					else {
						item.name = item.friendUuid;
					}
					if (item.profile.picture) {
						var pict = item.profile.picture;
						if (pict.name) {
							item.photo = "/sdata/f/_private" + item.properties.userStoragePrefix + pict.name;
						}
					}
					item.online = false;
					if (item.profile.basic) {
						var basic = item.profile.basic;
						if (basic.status) {
							item.status = basic.status;
						} else {
							item.status = "";
						}
					} else {
						item.status = "";
					}
					pOnline.items[pOnline.items.length] = item;
					total++;
				}
				else 
					if (total >= 3 && !isOnline) {
						pOnline.showMore = true;
					}
			}
		}
		
		$("#my_contacts_list").html($.Template.render("my_contacts_list_template", pOnline));
	}

};

sdata.widgets.WidgetLoader.informOnLoad("myfriends");