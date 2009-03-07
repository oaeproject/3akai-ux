var sakai = sakai || {};

sakai.myfriends = function(tuid,placement,showSettings){

	var rootel = $("#" + tuid);
	var friends = false;
	var online = false;

	if (showSettings){
		$("#mainFriendsontainer", rootel).html("No settings available<br/><br/>");
	}
	
	sdata.Ajax.request({
		httpMethod: "GET",
		url: "/rest/friend/status?p=0&n=4&friendStatus=ACCEPTED&s=firstName&s=lastName&o=asc&o=asc&sid=" + Math.random(),
		onSuccess: function(data){
			friends = eval('(' + data + ')');
			getOnline();
		},
		onFail: function(status){
			$("#list_rendered").html("<b>An error has occurred.</b> Please try again later");
		}
	});
	
	var getOnline = function(){
		
		//sdata.Ajax.request({
		//	url: "/sdata/presence/?sid=" + Math.random(),
		//	httpMethod: "GET",
		//	onSuccess: function(data){
		//		online = eval('(' + data + ')');
				doProcessing();
		//	},
		//	onFail: function(status){
		//	}
		//});
		
	}
	
	var doProcessing = function(){
		
		var pOnline = {};
		pOnline.items = [];
		var total = 0;
		pOnline.showMore = false;
		
		//for (var i = 0; i < online.items.length; i++){
		//	if (total < 3) {
		//		var item = online.items[i];
		//		if (item.firstName && item.lastName) {
		//			item.name = item.firstName + " " + item.lastName;
		//		}
		//		else {
		//			item.name = item.userid;
		//		}
		//		if (item.picture) {
		//			var pict = eval('(' + item.picture + ')');
		//			item.photo = "/sdata/f/public/" + item.userid + "/" + pict.name;
		//		}
		//		item.online = true;
		//		if (item.basic){
		//			var basic = eval('(' + item.basic + ')');
		//			if (basic.status){
		//				item.status = basic.status;
		//			}
		//		}
		//		pOnline.items[pOnline.items.length] = item;
		//		total++;
		//	} else {
		//		pOnline.showMore = true;
		//	}
		//}
		
		if (friends.status.friends) {
			for (var i = 0; i < friends.status.friends.length; i++) {
				var isOnline = false;
				
				//for (var ii = 0; ii < online.items.length; ii++) {
				//	if (online.items[ii].userid == friends.items[i].userid) {
				//		isOnline = true;
				//	}
				//}
				
				if (!isOnline && total < 3) {
					var item = friends.status.friends[i];
					if (item.profile.firstName && item.profile.lastName) {
						item.name = item.profile.firstName + " " + item.profile.lastName;
					}
					else {
						item.name = item.friendUuid;
					}
					if (item.profile.picture) {
						var pict = eval('(' + item.profile.picture + ')');
						item.photo = "/sdata/f/_private" + item.properties.userStoragePrefix + pict.name;
					}
					item.online = false;
					if (item.profile.basic) {
						var basic = eval('(' + item.profile.basic + ')');
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
		
		$("#friends_list").html(sdata.html.Template.render("friends_list_template", pOnline));
		
	}

};

sdata.widgets.WidgetLoader.informOnLoad("myfriends");