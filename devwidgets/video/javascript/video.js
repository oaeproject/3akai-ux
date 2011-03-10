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

/*
 * Dependencies
 *
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.validate.sakai-edited.js (validate)
 * /dev/lib/misc/querystring.js (Querystring)
 */

/*global $, Config, Querystring, SWFID, swfobject */


require(["jquery", "sakai/sakai.api.core", "/devwidgets/video/jwplayer/swfobject.js"], function($, sakai) {

    /**
     * @name sakai_global.video
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
    sakai_global.video = function(tuid, showSettings) {

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
        var showVideoSakaiPlayer = function(video, container) {
            try {

                  video.videoContainer = tuid + "_video_container";
                  $(container, rootel).html(sakai.api.Util.TemplateRenderer(videoTemplate, video));

                  var videoWidth = rootel.width() - 6;
                  var videoHeight = videoWidth * 3 / 4; 
                  var so = new SWFObject('/devwidgets/video/jwplayer/player-licensed.swf','ply', videoWidth + "px", videoHeight + "px",'9','#ffffff');
                  so.addParam('allowfullscreen','true');
                  so.addParam('allowscriptaccess','always');
                  so.addParam('wmode','opaque');
                  so.addVariable('file', video.URL);
                  so.write(video.videoContainer);

            } catch(err) {
                sakai.api.Util.notification.show(err,"",sakai.api.Util.notification.type.ERROR);
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
            showVideoSakaiPlayer(video, container);
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
                    sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("FAILED_RETRIEVE_VIDEO"),"",sakai.api.Util.notification.type.ERROR);
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
            return false;
        });

        /** Bind the 'Don't Add' button */
        $(videoBack, rootel).bind("click",
        function(e, ui) {
            sakai.api.Widgets.Container.informCancel(tuid, "video");
        });

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
                showVideoSakaiPlayer(data, videoShowMain);
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
});
