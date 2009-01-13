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
		url: "/sdata/connection?show=accepted&page=1&count=100&sid=" + Math.random(),
		onSuccess: function(data){
			friends = eval('(' + data + ')');
			getOnline();
		},
		onFail: function(status){
			$("#list_rendered").html("<b>An error has occurred.</b> Please try again later");
		}
	});
	
	var getOnline = function(){
		
		sdata.Ajax.request({
			url: "/sdata/presence/?sid=" + Math.random(),
			httpMethod: "GET",
			onSuccess: function(data){
				online = eval('(' + data + ')');
				doProcessing();
			},
			onFail: function(status){
			}
		});
		
	}
	
	var doProcessing = function(){
		
		var pOnline = {};
		pOnline.items = [];
		var total = 0;
		pOnline.showMore = false;
		
		for (var i = 0; i < online.items.length; i++){
			if (total < 3) {
				var item = online.items[i];
				if (item.firstName && item.lastName) {
					item.name = item.firstName + " " + item.lastName;
				}
				else {
					item.name = item.userid;
				}
				if (item.picture) {
					var pict = eval('(' + item.picture + ')');
					item.photo = "/sdata/f/public/" + item.userid + "/" + pict.name;
				}
				item.online = true;
				if (item.basic){
					var basic = eval('(' + item.basic + ')');
					if (basic.status){
						item.status = basic.status;
					}
				}
				pOnline.items[pOnline.items.length] = item;
				total++;
			} else {
				pOnline.showMore = true;
			}
		}
		
		for (var i = 0; i < friends.items.length; i++) {
			var isOnline = false;
			
			for (var ii = 0; ii < online.items.length; ii++){
				if (online.items[ii].userid == friends.items[i].userid){
					isOnline = true;
				}
			}
			
			if (!isOnline && total < 3) {
				var item = friends.items[i];
				if (item.firstName && item.lastName) {
					item.name = item.firstName + " " + item.lastName;
				}
				else {
					item.name = item.userid;
				}
				if (item.picture) {
					var pict = eval('(' + item.picture + ')');
					item.photo = "/sdata/f/public/" + item.userid + "/" + pict.name;
				}
				item.online = false;
				if (item.basic){
					var basic = eval('(' + item.basic + ')');
					if (basic.status){
						item.status = basic.status;
					}
				}
				pOnline.items[pOnline.items.length] = item;
				total++;
			}
			else 
				if (total >= 3 && !isOnline) {
					pOnline.showMore = true;
				}
		}
		
		$("#friends_list").html(sdata.html.Template.render("friends_list_template", pOnline));
		
	}

};

sdata.widgets.WidgetLoader.informOnLoad("myfriends");