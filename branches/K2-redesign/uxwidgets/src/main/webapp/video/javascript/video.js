var sakai = sakai || {};

/**
 * Initialize the video widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement Widget place
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.video = function(tuid, placement, showSettings){
	var json = false; // Variable used to recieve information by json
	var me = false; // Contains information about the current user
	var rootel = $("#" + tuid); // Get the main div used by the widget
	
	document.getElementsByTagName('head')[0].innerHTML += '<script src="/devwidgets/video/lib/swfobject.js" type="text/javascript"></script>';
	document.getElementsByTagName('head')[0].innerHTML += '<script src="/devwidgets/video/lib/youTubeLoader.js" type="text/javascript"></script>';
	/**
	 * Get the current user
	 */
	var getCurrentUser = function() {
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/rest/me",
			onSuccess: function(data){
				me = eval('(' + data + ')');
				if (!me) {
					alert('An error occured when getting the current user.');
				}
			},
			onFail: function(status){
				alert("Couldn't connect to the server.");
			}
		});
	}
	getCurrentUser();
	
	/**
	 * Shows the settings screen
	 * @param {Object} response
	 * @param {Boolean} exists
	 */
	var showSettingsScreen = function(response, exists){
		if(exists){
			json = eval('(' + response + ')'); 
			$("#video_txtTitle", rootel).val(json.title);
			$("#video_txtURL", rootel).val(json.URL);
			//$('input[name=video_source]:checked',rootel).val(json.selectedvalue).checked = true;
			$("input[name=video_source][value=" + json.selectedvalue + "]",rootel).attr("checked", true);
			$("#video_chktrackViews",rootel).attr("checked", json.checkviews);
			if(json.selectedvalue == "video_txt"){
				$("#video_txtSource", rootel).val(json.source);
			}
		}
		$("#video_maincontainer", rootel).hide();
		$("#video_settings", rootel).show();
	}
	
	/**
	 * Switch between main and settings page
	 * @param {Boolean} showSettings Show the settings of the widget or not
	 */
	if (showSettings){
		/** Check if it is an edit or a new video */
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/video?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				showSettingsScreen(data,true);
			},
			onFail : function(status) {
				showSettingsScreen(status,false);
			}
		});
		
	} else {
		$("#video_settings", rootel).hide();
		$("#video_maincontainer", rootel).show();
		
		sdata.Ajax.request({
			url: "/sdata/f/" + placement + "/" + tuid + "/video?sid=" + Math.random(),
			httpMethod: "GET",
			onSuccess: function(data){
				showVideos(data,true);
			},
			onFail: function(status){
				showVideos(status,false);
			}
		});
	}
	
	/**
	 * Shows the video
	 * @param {string} response
	 * @param {Boolean} exists
	 */
	var showVideos = function(response, exists){
		if(exists){
			try{
				var video = eval('(' + response + ')'); // Evaluate all the videos
				showVideo(video,"video_MainTemplate","#video_ShowMain","#video_tempYoutubeVideoMain",video.isSakaiVideoPlayer);
								
			}
			catch(err){
				alert("failed to retrieve video.");
			}
		}
		
	}
	
	/**
	 * add a video
	 * @param {Object} video
	 */
	var addVideo = function(video){
		var tostring = sdata.JSON.stringify(video);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "video", tostring, finishNewSettings);
	}
	
	
	var finishNewSettings = function() {
		sdata.container.informFinish(tuid);
	}
	
	/**
	 * Shows a video
	 * @param {Object} video
	 * @param {Object} template
	 * @param {Object} container
	 * @param {Object} videoContainer
	 */
	var showVideo = function(video, template, container,videoContainer, isSakaiPlayer){
		if(isSakaiPlayer)
			ShowVideoSakaiPlayer(video, template, container,videoContainer);
		else
			ShowVideoYoutubePlayer(video, template, container,videoContainer);
	}
	/**
	 * Shows the video in the sakaiplayer
	 */
	var ShowVideoSakaiPlayer = function(video, template, container,videoContainer){
		try {
		
		$(container, rootel).html(sdata.html.Template.render(template,video));
			var flashvars = {
			//not youtube
			//http://www.mediacollege.com/video-gallery/testclips/20051210-w50s.flv
			//youtube
			//http://www.youtube.com/watch?v=lenkR5XzSJc&feature=recommended
				videoURL: video.URL,
				isYoutubeUrl:(video.URL.search("www.youtube.com") != -1)
			
			
				};
			var params = {
				menu: "false",
				allowScriptAccess: "always",
				scale: "noscale",
				allowFullScreen:"true"
			
			};
			var attributes = {};
			
			swfobject.embedSWF("../../devwidgets/video/videoplayer.swf", videoContainer.replace("#",""), 320, 305, "9.0.0", "../../devwidgets/video/swf/expressInstall.swf", flashvars, params, attributes);
		
			//init the youTubeLoader javascript methods
			SWFID = videoContainer.replace("#","");
			} catch (err){
				$(videoContainer,rootel).text("No valid video found.");
			}
	}
	var ShowVideoYoutubePlayer = function(video, template, container,videoContainer){
		try {
			$(container, rootel).html(sdata.html.Template.render(template,video));
			
				var querystring = video.URL.substring(video.URL.indexOf("?") + 1);
				var split = querystring.split("&");
				var id = false;
				for (var i = 0; i < split.length; i++){
					if (split[i].substring(0,2) == "v="){
						id = split[i].substring(2);
					}
				}
				$(videoContainer,rootel).attr("value", video.URL);
				if (id == false){
					$(videoContainer,rootel).text("No valid video found");
				} else {
					$(videoContainer,rootel).html('<object width="320" height="305"><param name="movie" value="http://www.youtube.com/v/' + id + '&hl=en&fs=1"></param><param name="allowFullScreen" value="true"></param><embed src="http://www.youtube.com/v/' + id + '&hl=en&fs=1" type="application/x-shockwave-flash" allowfullscreen="true" width="320" height="305"></embed></object>');
				}
			} catch (err){
				$(videoContainer,rootel).text("No valid video found.");
			}
	}
	
	/**
	 * returns a Json-object of the video-settings
	 */
	var getVideoJson = function(){
		title = $("#video_txtTitle",rootel).val();
		selectedValue = $('input[name=video_source]:checked',rootel).val();
		URL = $("#video_txtURL",rootel).val();
		source = "" 
		
		if(selectedValue == "video_guess"){
			source  = URL.replace("http://www.", "");
			source = source.substring(0,source.indexOf("/"));
		}
		else if(selectedValue == "video_txt"){
			source = $("#video_txtSource",rootel).val();
		}

		video = {"uid": me.preferences.uuid, "title": title, "source": source, "URL" : URL, "selectedvalue" : selectedValue, "checkviews" : $('#video_chktrackViews', rootel).attr('checked')}; // Fill in the JSON post object	
		video.isYoutube = (video.URL.search("www.youtube.com") != -1);
		video.isSakaiVideoPlayer = ($('input[name=video_choosePlayer]:checked',rootel).val() == "video_SakaiPlayer");
		
		if(video.isYoutube){
			$("#video_choosePlayerContainer",rootel).show();
			video.isSakaiVideoPlayer = ($('input[name=video_choosePlayer]:checked',rootel).val() == "video_SakaiPlayer");
		}
		else{
			$("#video_choosePlayerContainer",rootel).hide();
		}
		return video;
	}
	
	/** Bind the insert widget button */
	$("#video_insertPlaceHolder", rootel).bind("click",function(e,ui){
		video = {"uid": me.preferences.uuid, "title": "", "source": "", "URL" : "", "sourceChose" : "", "checkviews" : "", "isSakaiVideoPlayer" : true}; // Fill in the JSON post object	
		addVideo(video);	
	});
	/** Bind the inset widget button */
	$("#video_btnInsertWidget", rootel).bind("click",function(e,ui){
		addVideo(getVideoJson());	
	});
	/** Bind the Preview button */
	$("#video_btnPreview", rootel).bind("click",function(e,ui){
		if($("#video_txtURL",rootel).val() != ""){
			$("#video_btnPreview",rootel).hide();	
			$("#video_btnInsertWidget",rootel).show();	
			$("#video_btnBack",rootel).show();	
			$("#video_ShowPreview",rootel).show();	
			$("#video_fillInfo",rootel).hide();	
			$("input[name=video_choosePlayer][value=video_SakaiPlayer]",rootel).attr("checked", true);
			if(($("#video_txtURL",rootel).val().search("www.youtube.com") != -1)){
				$("input[name=video_choosePlayer][value=video_YoutubePlayer]",rootel).attr("checked", true);
			}
			showVideo(getVideoJson(),"video_previewTemplate","#video_previewContainer","#video_tempYoutubeVideo",true);
		}
		else{
			alert("Please fill in a URL.");
		}
		
	});
	/** Bind the back button */
	$("#video_btnBack", rootel).bind("click",function(e,ui){
		$("#video_btnPreview",rootel).show();	
		$("#video_btnInsertWidget",rootel).hide();	
		$("#video_btnBack",rootel).hide();	
		$("#video_ShowPreview",rootel).hide();	
		$("#video_fillInfo",rootel).show();		
	});
	/** Bind the radiobuttons button */
	$("input[name=video_source]", rootel).bind("click",function(e,ui){
		selectedValue = $('input[name=video_source]:checked',rootel).val();
		if(selectedValue == "video_txt"){
			$("#video_txtSource",rootel).focus();
		}
	});
	/** Bind the choose videoplayer radiobuttons button */
	$("input[name=video_choosePlayer]", rootel).bind("change",function(e,ui){
		selectedValue = $('input[name=video_choosePlayer]:checked',rootel).val();
		if(selectedValue == "video_SakaiPlayer")
			showVideo(getVideoJson(),"video_previewTemplate","#video_previewContainer","#video_tempYoutubeVideo",true);
		else
			showVideo(getVideoJson(),"video_previewTemplate","#video_previewContainer","#video_tempYoutubeVideo",false);
	});
	

	
};
sdata.widgets.WidgetLoader.informOnLoad("video");
