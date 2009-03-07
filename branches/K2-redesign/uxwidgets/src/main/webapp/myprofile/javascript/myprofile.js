var sakai = sakai || {};

sakai.myprofile = function(tuid,placement,showSettings){
	
	var json = false;
	var rootel = $("#" + tuid);
	var me = false;

	if (showSettings){
		$("#mainProfileContainer", $("#" + tuid)).html("No settings available<br/><br/>");
	} else {
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/me",
			onSuccess: function(data){
			    me = eval('(' + data + ')');
				json = me.profile;
				if (json.firstName && json.lastName){
					$("#" + tuid + " #myprofile_username").text(json.firstName + " " + json.lastName);
				} else {
					$("#" + tuid + " #myprofile_username").text(me.preferences.uuid);
				}
				if (json.basic){
					var basic = eval('(' + json.basic + ')');
					if (basic.status){
						$("#status_current", rootel).html(basic.status);
					}
				}
				if (json.picture){
					var pict = eval('(' + json.picture + ')');
					$("#profile_picture").html("<img src='/sdata/f/_private" + me.userStoragePrefix + pict.name + "' width='78' class='my-profile-img' />");
				} else {
					$("#profile_picture").html("<img src='/dev/img/my-profile-img.jpg' width='78' height='78' class='my-profile-img' />");
				}
			},
			onFail: function(status){
				//alert("An error has occured");
			}
		});	
	}
	
	// friend_requests
	
	sdata.Ajax.request({
		httpMethod: "GET",
		url: "/rest/friend/status?sid=" + Math.random(),
		onSuccess: function(data){
			var json2 = eval('(' + data + ')');
			
			var total = 0;
			if (json2.status.friends){
				for (var i = 0; i < json2.status.friends.length; i++){
					if (json2.status.friends[i].status == "INVITED"){
						total++;
					}
				}
			}
			
			if (total == 0){
				$("#friend_requests", rootel).html("No Connection Requests");
			} else if (total == 1){
				$("#friend_requests", rootel).html("1 Connection Request");
			} else {
				$("#friend_requests", rootel).html(json2.total + " Connection Requests");
			}
		},
		onFail: function(status){
			$("#list_rendered_my").html("<b>An error has occurred.</b> Please try again later");
		}
	});
	
	var doAlert = function(ev){
		var basic = false;
		if (json.basic){
			 basic = eval('(' + json.basic + ')');
			 basic.status = ev.value;
		} else {
			basic = {};
			basic.status = ev.value;
		}
		var data = {"basic":sdata.JSON.stringify(basic)};
		
		var a = ["u"];
		var k = ["basic"];
		var v = [sdata.JSON.stringify(basic)];
		
		var tosend = {"k":k,"v":v,"a":a};
		
		sdata.Ajax.request({
        	url :"/rest/patch/f/_private" + me.userStoragePrefix + "profile.json",
        	httpMethod : "POST",
            postData : tosend,
            contentType : "application/x-www-form-urlencoded",
            onSuccess : function(data) {

			},
			onFail : function(data){
				alert("An error has occured");
			}
		});
	}
                  
    fluid.inlineEdits(".my-profile-txt", {
    	useTooltip: true,
		finishedEditing: doAlert        
    });
	
	$("#status_edit", rootel).show();

};

sdata.widgets.WidgetLoader.informOnLoad("myprofile");