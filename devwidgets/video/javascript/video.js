/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global $, Config, Querystring, SWFID, swfobject */


var sakai = sakai || {};

/**
 * @name sakai.video
 *
 * @class video
 *
 * @description
 * Initialize the video widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.video = function(tuid, showSettings) {

    var FlashPlayerParams = {
        menu: "false",
        allowScriptAccess: "always",
        scale: "noscale",
        allowFullScreen: "true"
    };

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);  // Get the main div used by the widget
    var youtubeUrl = "www.youtube.com";

    // Main-ids
    var videoID = "#video";
    var videoName = "video";

    // Containers
    var videoSettings = videoID + "_settings";
    var videoOutput = videoID + "_maincontainer";
    var videoShowMain = videoID + "_ShowMain";
    var videoTempShowMain = videoID + "_tempYoutubeVideoMain";
    var choosePlayerContainer = videoID + "_choosePlayerContainer";
    var videoPreviewContainer = videoID + "_previewContainer";
    var videoShowPreview = videoID + "_ShowPreview";
    var videoForm = videoID + "_form";

    // Textboxes
    var videoUrl = videoID + "_txtURL";
    var videoTitle = videoID + "_txtTitle";
    var videoSource = videoID + "_txtSource";

    // Radiobuttons
    var videoSourceRbt = videoName + "_source";
    var videoSourceRbtTxt = videoName + "_txt";
    var videoSourceRbtGuess = videoName + "_guess";

    var videoChoosePlayer = videoName + "_choosePlayer";
    var videoChoosePlayerYoutube = videoName + "_YoutubePlayer";
    var videoChoosePlayerSakai = videoName + "_SakaiPlayer";

    // Checkboxes
    var videoTrackViews = videoID + "_chktrackViews";

    // Template
    var videoTemplate = videoName + "_MainTemplate";

    // Files
    var videoPlayer = "/devwidgets/video/videoplayer.swf";
    var expressInstall = "/devwidgets/video/swf/expressInstall.swf";

    // Buttons
    var videoPlaceholder = videoID + "_insertPlaceHolder";
    var videoSubmit = videoID + "_btnInsertWidget";
    var videoPreview = videoID + "_btnPreview";
    var videoBack = videoID + "_btnBack";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Shows the video in the sakaiplayer
     * @param {String} video: the url to the video
     * @param {String} container: the container where the video should be placed (settings or output)
     */
    var ShowVideoSakaiPlayer = function(video, container) {
        try {
            // Checks if the video is a youtube-video
            // This is needed as a parameter for the sakai-player
            //var isTouTube = (video.URL.search(youtubeUrl) !== -1);
            // Renders the video-template (title, source and conatiner to place flash-player in)
            //$(container, rootel).html($.TemplateRenderer(videoTemplate, video));
            // some more parameters needed for the sakai-videoplayer
            //var flashvars = {
            //    videoURL: video.URL,
            //    isYoutubeUrl: isTouTube
            //};

            // videoPlayer: url to the swf file
            // id: id of the container where the videoplayer should be placed
            // width
            // height
            // version
            // expressInstall: url to the expressInstall swf
            // flashvars: JSON-object containing the url and boolean stating if video is YouTube or not
            // flashPlayerVars: Some variables specieing some extra features for the video
                 // menu: show a menu or not (when right click should the user have the possibility to zoom in and such)
                     // allowScriptAccess: does the player allow sript access
                 // scale: should the player be scaled down
                 // allowFullScreen: can the player go full screen
            //swfobject.embedSWF(videoPlayer, videoTempShowMain.replace("#", ""), 320, 305, "9.0.0", expressInstall, flashvars, FlashPlayerParams);

            //init the youTubeLoader javascript methods
            //if (isTouTube) {
                // By putting this variable to the container of the videoPlayer, the streamingprocess for the youtube-video is started
                // This uses the youtubeloader.js file and is the main problem for showing multiple youtubevideos in the sakaiplayer on 1 page
                // this will give a global violation in jsLint, however this is how the youtubeloader works so this can be ignored
            //    SWFID = videoTempShowMain.replace("#", "");
            //}

              video.videoContainer = tuid + "_video_container";
              $(container, rootel).html($.TemplateRenderer(videoTemplate, video));

              var videoWidth = rootel.width() - 6 + "px";
              var so = new SWFObject('/devwidgets/video/jwplayer/player-licensed.swf','ply', videoWidth, '100%','9','#ffffff');
              so.addParam('allowfullscreen','true');
              so.addParam('allowscriptaccess','always');
              so.addParam('wmode','opaque');
              so.addVariable('file', video.URL);
              so.write(video.videoContainer);

        } catch(err) {
            alert(err);
            $(videoTempShowMain, rootel).text(sakai.api.i18n.General.getValueForKey("__MSG__NO_VALID_VIDEO_FOUND__"));
        }
    };

    /**
     * Shows a video
     * @param {String} video: url to the video
     * @param {String} container: the container where the video should be placed (settings or output)
     * @param {Boolean} isSakaiPlayer: should the video be displayed in a sakai-player or not
     */
    var showVideo = function(video, container, isSakaiPlayer) {
        //if (isSakaiPlayer) {
            ShowVideoSakaiPlayer(video, container);
        //}
        //else {
        //  ShowVideoYoutubePlayer(video, container);
        //}
    };


    ////////////////////////
    // Settings functions //
    ////////////////////////

    /**
     * Shows the settings screen
     * @param {String} response
     * @param {Boolean} exists
     */
    var showSettingsScreen = function(response, exists) {
        if (exists) {
            // Fill in video info
            $(videoUrl, rootel).val(response.URL);
            $(videoSource, rootel).val(response.source);
        } else {
            // Fill in video defaults
            $(videoUrl, rootel).val("http://");
            $(videoSource, rootel).val("");
        }
        $(videoOutput, rootel).hide();
        $(videoSettings, rootel).show();
    };

    /**
     * returns a Json-object of the video-settings
     */
    var getVideoJson = function () {
        var URL = $.trim($(videoUrl, rootel).val());
        var source = $.trim($(videoSource, rootel).val());

        var video = {
            "userid": sakai.data.me.user.userid,
            "source": source,
            "URL": URL
        };

        return video;
    };

    /**
     * add a video
     * @param {Object} video
     */
    var addVideo = function(video) {
        sakai.api.Widgets.saveWidgetData(tuid, video, sakai.api.Widgets.Container.informFinish(tuid, "video"));
    };


    ////////////////////
    // Main functions //
    ////////////////////

    /**
     * Shows the video
     * @param {string} response
     * @param {Boolean} exists
     */
    var showVideos = function(response, exists) {
        if (exists) {
            try {
                var video = response;
                // Show the video in the right player
                showVideo(video, videoShowMain, video.isSakaiVideoPlayer);
            }
            catch(err) {
                alert("failed to retrieve video.");
            }
        }

    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /** Add validation to the form */
    $(videoForm, rootel).validate();
    $(videoUrl, rootel).rules( "add", {
        required: true,
        url: true,
        messages: {
            url: (sakai.api.i18n.General.getValueForKey("PLEASE_ENTER_VALID_URL"))
        }
    });

    /** Auto-suggest source display */
    $(videoUrl, rootel).blur(function () {
        if ($(videoUrl, rootel).valid()) {
            var source = $.trim($(videoUrl, rootel).val()).split("/")[2];
            if (sakai.config.Domain.Labels[source]) {
                $(videoSource, rootel).val(sakai.config.Domain.Labels[source]);
            } else {
                $(videoSource, rootel).val(source);
            }
        }
    });

    /** Bind the 'Add Video' button */
    $(videoForm, rootel).bind("submit",
    function(e, ui) {
        if ($(videoForm, rootel).valid()) {
            addVideo(getVideoJson());
        }
    });

    /** Bind the 'Don't Add' button */
    $(videoBack, rootel).bind("click",
    function(e, ui) {
        sakai.api.Widgets.Container.informCancel(tuid, "video");
    });

    /** Bind the insert placeholder button -- NOT FOR Q1
    $(videoPlaceholder, rootel).bind("click",
    function(e, ui) {
        // When adding a placeholder we just add an empty video-object
        var video = {
            "uid": me.user.userid,
            "title": "",
            "source": "",
            "URL": "",
            "sourceChose": "",
            "checkviews": "",
            "isSakaiVideoPlayer": true
        }; // Fill in the JSON post object
        addVideo(video);
    }); */

    /** Bind the Preview button -- NOT FOR Q1
    $(videoPreview, rootel).bind("click",
    function(e, ui) {
        if ($(videoUrl, rootel).val() !== "") {
            // Show and hide screens and buttons
            $(videoPreview, rootel).hide();
            $(videoSubmit, rootel).show();
            $(videoBack, rootel).show();
            $(videoShowPreview, rootel).show();
            $(videoFillInfo, rootel).hide();
            $("input[name=" + videoChoosePlayer + "][value=" + videoChoosePlayerSakai + "]", rootel).attr("checked", true);
            var isYouTube = ($(videoUrl, rootel).val().search(youtubeUrl) !== -1);
            // If the url is a YouTube-video the player should be the YouTubePlayer by default
            if (isYouTube) {
                $("input[name=" + videoChoosePlayer + "][value=" + videoChoosePlayerYoutube + "]", rootel).attr("checked", true);
            }
            showVideo(getVideoJson(), videoPreviewContainer, !isYouTube);
        }
        else {
            alert(sakai.api.i18n.General.getValueForKey("PLEASE_FILL_IN_A_URL"));
        }

    }); */


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Switch between main and settings page
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai.api.Widgets.loadWidgetData(tuid, function (success, data) {

        if (success) {
            // we have a video set
            ShowVideoSakaiPlayer(data, videoShowMain);
            if (showSettings) {
                showSettingsScreen(data, true);
            } else {
                $(videoSettings, rootel).hide();
                $(videoOutput, rootel).show();
            }
        } else {
            // no video set
            if (showSettings) {
                showSettingsScreen(data.status, false);
            } else {
                $(videoSettings, rootel).hide();
                $(videoOutput, rootel).show();
            }
        }

    });

};
sakai.api.Widgets.widgetLoader.informOnLoad("video");