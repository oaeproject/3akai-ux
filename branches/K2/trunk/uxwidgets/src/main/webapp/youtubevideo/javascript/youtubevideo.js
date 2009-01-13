var sakai = sakai || {};

sakai.youtubevideo = function(tuid, placement, showSettings){

	var functiontodoaftersettings = false;

	var fillInUniqueId = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/youtubeurl?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				showVideo(data,true);
			},
			onFail : function(status) {
				showVideo(status,false);
			}
		});
	}

	var alertId = function(){
		alert(tuid);
	}

	var showVideo = function(response, exists){
		if (exists){
			try {
				var querystring = response.substring(response.indexOf("?") + 1);
				var split = querystring.split("&");
				var id = false;
				for (var i = 0; i < split.length; i++){
					if (split[i].substring(0,2) == "v="){
						id = split[i].substring(2);
					}
				}
				$("#" + tuid + " #youtubevideo_youtubeurl").attr("value", response);
				if (id == false){
					$("#" + tuid + " #youtubevideo_video").text("No valid video found");
				} else {
					$("#" + tuid + " #youtubevideo_video").html('<object width="425" height="344"><param name="movie" value="http://www.youtube.com/v/' + id + '&hl=en&fs=1"></param><param name="allowFullScreen" value="true"></param><embed src="http://www.youtube.com/v/' + id + '&hl=en&fs=1" type="application/x-shockwave-flash" allowfullscreen="true" width="425" height="344"></embed></object>');
				}
			} catch (err){
				$("#" + tuid + " #youtubevideo_video").text("No valid video found");
			}
		} else {
			$("#" + tuid + " #youtubevideo_video").text("No video found");
		}
	}

	var saveNewSettings = function(){
		var parent = document.getElementById(tuid);
		var val = $("#" + tuid + " #youtubevideo_youtubeurl").attr("value");
		if (!val || val.replace(/ /g,"%20") == ""){
			sdata.Ajax.request({
				url :"/sdata/f/" + placement + "/" + tuid + "/youtubeurl?sid=" + Math.random(),
				httpMethod : "DELETE",
				onSuccess : function(data) {
					finishNewSettings(true);
				},
				onFail : function(status) {
					finishNewSettings(false);
				}
			});
		}
		else {
			sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "youtubeurl", val, finishNewSettings);
		}
	}

	var finishNewSettings = function(success){
		$("#" + tuid + " #youtubevideo_content").show();
		$("#" + tuid + " #youtubevideo_settings").hide();
		if (functiontodoaftersettings){
			if (!success){
				alert("An error occured");
			}
			functiontodoaftersettings(tuid, placement);
		} else {
			//sakai.dashboard.showWidgetPreview();
			fillInUniqueId();
		}
	}

	if (showSettings){
		$("#" + tuid + " #youtubevideo_content").hide();
		$("#" + tuid + " #youtubevideo_settings").show();
		fillInUniqueId();
	} else {
		$("#" + tuid + " #youtubevideo_content").show();
		$("#" + tuid + " #youtubevideo_settings").hide();
		fillInUniqueId();
	}

	$("#" + tuid + " #youtubevideo_username").text(tuid);
	$("#" + tuid + " #youtubevideo_button").unbind("click",function(e,ui){
		alert(tuid);
	});
	$("#" + tuid + " #youtubevideo_button").bind("click",function(e,ui){
		alert(tuid);
	});
	$("#" + tuid + " #youtubevideo_button2").bind("click",function(e,ui){
		alertId();
	});
	$("#" + tuid + " #youtubevideo_savepreferences").bind("click",function(e,ui){
		saveNewSettings();
	});
	$("#" + tuid + " #youtubevideo_settings_link").bind("click", function(e, ui){
		functiontodoaftersettings = fillInUniqueId;
		showSettingsScreen();
	});

};

sdata.widgets.WidgetLoader.informOnLoad("youtubevideo");