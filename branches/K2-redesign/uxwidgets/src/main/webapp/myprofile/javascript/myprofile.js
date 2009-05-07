var sakai = sakai || {};

sakai.myprofile = function(tuid,placement,showSettings){

	var rootel = $("#" + tuid);

	me = sdata.me;
	json = me.profile;
	if (json.firstName && json.lastName){
		$("#profile_name",rootel).text(json.firstName + " " + json.lastName);
	} else {
		$("#profile_name",rootel).text(me.preferences.uuid);
	}
	if (json.picture){
		var pict = json.picture;
		if (pict.name) {
			$("#profile_picture", rootel).css("text-indent", "0px");
			$("#profile_picture", rootel).html("<img src='/sdata/f/_private" + me.userStoragePrefix + pict.name + "' width='60px' height='60px' />");
		}
	}
	var extra = "&nbsp;";
	if (json.basic) {
		var basic = json.basic;
		if (json.unirole) {
			extra = json.unirole;
		}
		else if (json.unicollege) {
			extra = json.unicollege;
		}
		else if (json.unidepartment) {
			extra = json.unidepartment;
		}
	}
	if (extra){
		$("#profile_dept",rootel).html(extra);
	}
	
	var chatstatus = "online";
	if (me.profile.chatstatus){
		chatstatus = me.profile.chatstatus;
	}
	$("#profile_name").addClass("chat_available_status_"+chatstatus);
	$("#profile_chat_status_" + chatstatus).show();
	
	/*
	 * Status dropdown handler
	 */
	
	$(".profile_chat_status_dropdown_link").bind("click", function(ev){
		$("#myprofile_status").toggle();
	});
	
	var changeStatus = function(status){
		$("#myprofile_status").toggle();
		sdata.me.profile.chatstatus = status;
		
		var a = ["u"];
		var k = ["chatstatus"];
		var v = [status];
		
		var tosend = {"k":k,"v":v,"a":a};
		
		sdata.Ajax.request({
	      	url :"/rest/patch/f/_private" + sdata.me.userStoragePrefix + "profile.json",
        	httpMethod : "POST",
            postData : tosend,
            contentType : "application/x-www-form-urlencoded",
            onSuccess : function(data) {
				updateChatStatus(status);
			},
			onFail : function(data){}
		});
	};
	
	var updateChatStatusElement = function(element, status){
		if (element){
			element.removeClass("chat_available_status_online");
			element.removeClass("chat_available_status_busy");
			element.removeClass("chat_available_status_offline");
			element.addClass("chat_available_status_"+status);	
		}
	}
	
	var updateChatStatus = function(status){
		$(".myprofile_chat_status").hide();
		$("#profile_chat_status_" + status).show();
		
		updateChatStatusElement($("#userid"),status);
		updateChatStatusElement($("#profile_name"),status);
		
	}
	
	$(".myprofile_chat_status_picker").live("click", function(ev){
		var statusChosen = this.id.split("_")[this.id.split("_").length - 1];
		changeStatus(statusChosen);
	});

};

sdata.widgets.WidgetLoader.informOnLoad("myprofile");