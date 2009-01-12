var sakai = sakai || {};
sakai.MyInbox = {

	doInit : function(){

		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/message?unreadCount=true&sid=" + Math.random(),
			onSuccess: function(data){
				var json = eval('(' + data + ')');
				if (json.count == 0){
					$("#myinbox_text").html("My Inbox");
				} else {
					$("#myinbox_text").html("<b>My Inbox (" + json.count + ")</b>");
				}
			},
			onFail: function(status){
				$("#myinbox_text").html("My Inbox");
			},
			sendToLoginOnFail: "false"
		});	

	}

}

sakai.MyInbox.doInit();