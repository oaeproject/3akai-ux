var sakai = sakai || {};

sakai.helloworld = function(tuid,placement,showSettings){

	if (showSettings) {
		$("#mainHelloContainer", $("#" + tuid)).html("No settings available<br/><br/>");
	}
	else {
	
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/me?sid=" + Math.random(),
			onSuccess: function(data){
			
				fillInUsername(data, true);
				
			},
			onFail: function(status){
			
				fillInUsername("", false);
				
			}
		});
		
		var fillInUsername = function(response, exists){
			if (exists) {
				var feed = eval('(' + response + ')');
				$("#" + tuid + " #helloworld_username").text(feed.items.displayId);
			}
			else {
				//alert("An error occured");
			}
		}
		
	}

};

sdata.widgets.WidgetLoader.informOnLoad("helloworld");