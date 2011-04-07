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
require(["jquery", "sakai/sakai.api.core"], function($, sakai){

    /**
     * @name sakai_global.carousel
     *
     * @class carousel
     *
     * @description
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.carousel = function(tuid, showSettings){

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // Containers
        var carouselContainer = "#carousel_container";

        // Templates
        var carouselSingleColumnTemplate = "carousel_single_column_template";


        /////////////////////
        // RENDER PREVIEWS //
        /////////////////////

        var renderImagePreview = function(contentURL, lastModified){
            var json = {
                "contentURL": "/p/" + contentURL + "?_=" + lastModified,
                "sakai": sakai,
                "maxwidth": "350",
                "height": "200px"
            }
            return "<img src=\"" + json.contentURL + "\" style=\"max-width:" + json.maxwidth + ";\"/>";
        };

        var isJwPlayerSupportedVideo = function(mimeType){
            supported = false;
            if (mimeType.substring(0, 6) === "video/") {
                var mimeSuffix = mimeType.substring(6);
                if (mimeSuffix === "x-flv" || mimeSuffix === "mp4" || mimeSuffix === "3gpp" || mimeSuffix === "quicktime") {
                    supported = true;
                }
            }
            return supported;
        };

        var createSWFObject = function(url, params, flashvars){
            if (!url) {
                url = "/devwidgets/video/jwplayer/player-licensed.swf";
            }
            var so = new SWFObject(url, 'ply', '350', '197', '9', '#ffffff');
            so.addParam('allowfullscreen', 'true');
            if (params.allowscriptaccess) {
                so.addParam('allowscriptaccess', params.allowscriptaccess);
            }
            else {
                so.addParam('allowscriptaccess', 'always');
            }
            so.addParam('wmode', 'opaque');
            return so;
        };

        var renderVideoPlayer = function(url){
            var so = createSWFObject(false, {}, {});
            so.addVariable('file', "/p/" + url);
            so.addVariable('stretching', 'uniform');
            so.write("carousel_video");
            return $("#carousel_video_holder").html();
        };


        /////////////////////
        // RENDER CAROUSEL //
        /////////////////////

        var updateViewAfterAnimation = function(carousel, li, index, state){
            if (index > carousel.options.size || index < 1) {
                index = index % carousel.options.size;
                if (!index) {
                    index = carousel.options.size;
                }
                if (index < 1) {
                    index = carousel.options.size + index;
                }
            }
            $("#carousel_container .carousel_view_toggle li").removeClass("carousel_view_toggle_selected");
            $("#carousel_view_toggle_" + carousel.last).removeClass("carousel_view_toggle_selected");
            $("#carousel_view_toggle_" + index).addClass("carousel_view_toggle_selected");
        };

        var stopAutoScrolling = function(carousel){
            carousel.startAuto(0);
        };

        var carouselBinding = function(carousel){
            // Pause autoscrolling if the user moves with the cursor over the clip.
            carousel.clip.hover(function(){
                carousel.stopAuto();
            }, function(){
                carousel.startAuto();
            });

            // Disable autoscrolling if the user clicks the prev or next button.
            carousel.buttonNext.bind('click', function(){
                stopAutoScrolling(carousel);
            });

            carousel.buttonPrev.bind('click', function(){
                stopAutoScrolling(carousel);
            });

            $('.carousel_view_toggle li').bind('click', function(){
                stopAutoScrolling(carousel);
                carousel.scroll($.jcarousel.intval($(this)[0].id.split("carousel_view_toggle_")[1]));
                $("#carousel_container .carousel_view_toggle li").removeClass("carousel_view_toggle_selected");
                $(this).addClass("carousel_view_toggle_selected");
                return false;
            });
        };

        var renderCarousel = function(dataArr){
            $(carouselContainer).html(sakai.api.Util.TemplateRenderer(carouselSingleColumnTemplate, {
                "data": dataArr
            }, false, false));
            $(carouselContainer).jcarousel({
                auto: 5,
                animation: "slow",
                scroll: 1,
                easing: "swing",
                size: dataArr.length,
                initCallback: carouselBinding,
                buttonNextHTML: "<div id=\"carousel_next_button\"></div>",
                buttonPrevHTML: "<div id=\"carousel_prev_button\"></div>",
                wrap: "circular",
                itemFirstInCallback: {
                    onAfterAnimation: updateViewAfterAnimation
                }
            });
        };

        var parseMessages = function(data, dataArr){
            var messageArr = [];

            for(var item in data.messages){
                if(data.messages[item].hasOwnProperty("sakai:body")){
                    var obj = {};

                    obj.subject = sakai.api.Util.applyThreeDots(data.messages[item]["sakai:subject"], 200,{},"s3d-bold");
                    obj.from = data.messages[item]["sakai:from"];
                    obj.date = sakai.api.l10n.transformDate(sakai.api.Util.parseSakaiDate(data.messages[item]["sakai:created"]));

                    obj.contentType = "message";
                    messageArr.push(obj);
                    if (messageArr.length >= 4) {
                        break;
                    }
                }
            }

            if (messageArr.length) {
                dataArr.push(messageArr);
            }
        }

        var parseContent = function(data, dataArr){
            var noPreviewArr = [];

            for (var item in data.content.results) {
                var obj = {}

                if (data.content.results[item]["_mimeType"] && data.content.results[item]["_mimeType"].substring(0, 6) === "image/") {
                    obj.preview = renderImagePreview(data.content.results[item]["jcr:name"], data.content.results[item]["_lastModified"]);
                }else if (isJwPlayerSupportedVideo(data.content.results[item]["_mimeType"] || "")) {
                    obj.preview = renderVideoPlayer(data.content.results[item]["jcr:name"]);
                } else {
                    obj.preview = false;
                }
                if (data.content.results[item]["sakai:description"]) {
                    obj.description = sakai.api.Util.applyThreeDots(data.content.results[item]["sakai:description"], 700);
                }
                if (data.content.results[item]["sakai:tags"]) {
                    obj.tags = sakai.api.Util.formatTagsExcludeLocation(data.content.results[item]["sakai:tags"]);
                }
                if (data.content.results[item][data.content.results[item]["jcr:name"] + "/comments"]) {
                    obj.comments = [];
                    for (var prop in data.content.results[item][data.content.results[item]["jcr:name"] + "/comments"]) {
                        if (data.content.results[item][data.content.results[item]["jcr:name"] + "/comments"][prop].hasOwnProperty("_id")) {
                            obj.comments.push(data.content.results[item][data.content.results[item]["jcr:name"] + "/comments"][prop]);
                        }
                    }
                }
                if(sakai.config.MimeTypes[data.content.results[item]["_mimeType"]]) {
                    obj.icon = sakai.config.MimeTypes[data.content.results[item]["_mimeType"]].URL;
                }else{
                    obj.icon = sakai.config.MimeTypes.other.URL;
                }

                obj.title = data.content.results[item]["sakai:pooled-content-file-name"];
                obj.mimeType = data.content.results[item]["_mimeType"] || "";
                obj.created = sakai.api.l10n.transformDate(sakai.api.l10n.fromEpoch(data.content.results[item]["_created"]), sakai.data.me)
                obj.createdBy = data.content.results[item]["sakai:pool-content-created-for"];
                obj.lastModified = sakai.api.l10n.transformDate(sakai.api.l10n.fromEpoch(data.content.results[item]["_lastModified"]), sakai.data.me);
                obj.lastModifiedBy = data.content.results[item]["_lastModifiedBy"];
                obj.url = "/content#content_path=/p/" + data.content.results[item]["jcr:name"];
                obj.contentType = "content";

                if (obj.preview) {
                    dataArr.push(obj);
                } else {
                    noPreviewArr.push(obj);
                }
            }

            // Add items with no preview to final array.
            // Objective is to fill one rendered list item with two items (without preview), drop item that's left over if necessary.
            if (noPreviewArr.length) {
                if (noPreviewArr.length % 2) {
                    noPreviewArr.splice(noPreviewArr.length - 1, 1);
                }

                var tempArr = [];
                for (var item in noPreviewArr) {
                    if (tempArr.length != 2) {
                        tempArr.push(noPreviewArr[item]);
                        if (tempArr.length == 2) {
                            dataArr.push(tempArr);
                            tempArr = [];
                        }
                    }
                }
            }
        };

        var parseGroups = function(data, dataArr){
            for(var group in data.groups.results){
                var obj = {};

                if(data.groups.results[group].members || data.groups.results[group].members.length){
                    obj.members = data.groups.results[group].members;
                }
                if(data.groups.results[group]["sakai:group-description"] && data.groups.results[group]["sakai:group-description"].length){
                    obj.description = data.groups.results[group]["sakai:group-description"];
                }
                if(data.groups.results[group]["sakai:tags"] && data.groups.results[group]["sakai:tags"].length){
                    obj.tags = sakai.api.Util.formatTagsExcludeLocation(data.groups.results[group]["sakai:tags"]);
                }

                obj.contentType = "group";
                obj.groupid = data.groups.results[group]["sakai:group-id"];
                obj.title = data.groups.results[group]["sakai:group-title"];

                dataArr.push(obj);
            }
        };

        var parseData = function(data){
            var dataArr = [];

            parseContent(data, dataArr);
            parseGroups(data, dataArr);
            parseMessages(data, dataArr);

            renderCarousel(dataArr);
        };

        var checkDataParsable = function(data){
            if (data.content && data.groups && data.messages) {
                parseData(data);
            }
        };

        var loadFeatured = function(){
            var dataArr = {
                "content": false,
                "groups": false,
                "messages":false
            };
            $.ajax({
                url: "/var/search/pool/me/manager-all.1.json?sortOn=_created&sortOrder=desc&page=0&items=50",
                cache: false,
                success: function(data){
                    dataArr.content = data;
                    checkDataParsable(dataArr);
                }
            });

            $.ajax({
                url: "/var/search/groups-all.json?page=0&items=50&q=*",
                cache: false,
                success: function(data){
                    for (var group in data.results) {
                        $.ajax({
                            url: "/system/userManager/group/" + data.results[group].groupid + ".members.json?items=1000",
                            cache: false,
                            async: false,
                            success: function(memberData){
                                data.results[group].members = memberData;
                            }
                        });
                    }
                    dataArr.groups = data;
                    checkDataParsable(dataArr);
                }
            });

            sakai.api.Communication.getAllMessages("inbox", "*", 4, 1, "sakai:created", "desc", function(success, data){
                dataArr.messages = data;
                checkDataParsable(dataArr);
            });
        };

        var doInit = function(){
            loadFeatured();
        };

        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("carousel");
});