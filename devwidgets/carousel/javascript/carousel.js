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

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

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
    sakai_global.carousel = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // Containers
        var carouselContainer = "#carousel_container";

        // Templates
        var carouselSingleColumnTemplate = "carousel_single_column_template";

        var stopAutoScrolling = function(carousel){
            carousel.startAuto(0);
        }


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
            return "<img src=\"" + json.contentURL + "\" style=\"max-width:" + json.maxwidth + "; height:" + json.height + ";\"/>";
        };

        var isJwPlayerSupportedVideo = function(mimeType) {
            supported = false;
            if (mimeType.substring(0, 6) === "video/" ){
                var mimeSuffix = mimeType.substring(6);
                if (mimeSuffix === "x-flv" || mimeSuffix === "mp4" || mimeSuffix === "3gpp" || mimeSuffix === "quicktime") {
                    supported = true;
                }
            }
            return supported;
        };

        var createSWFObject = function(url, params, flashvars){
            if (!url){
                url = "/devwidgets/video/jwplayer/player-licensed.swf";
            }
            var so = new SWFObject(url,'ply', '350', '197','9','#ffffff');
            so.addParam('allowfullscreen','true');
            if (params.allowscriptaccess) {
                so.addParam('allowscriptaccess', params.allowscriptaccess);
            } else {
                so.addParam('allowscriptaccess', 'always');
            }
            so.addParam('wmode','opaque');
            return so;
        };

        var renderVideoPlayer = function(url){
            var so = createSWFObject(false, {}, {});
            so.addVariable('file', "/p/" + url);
            so.addVariable('stretching','uniform');
            so.write("carousel_video");
            return $("#carousel_video_holder").html();
        };


        /////////////////////
        // RENDER CAROUSEL //
        /////////////////////

        var updateViewAfterAnimation = function(carousel, li, index, state){
            if (index > carousel.options.size || index < 1){
                index = index % carousel.options.size;
                if(!index){
                    index = carousel.options.size;
                }
                if(index < 1){
                    index = carousel.options.size + index;
                }
            }
            $("#carousel_container .carousel_view_toggle li").removeClass("carousel_view_toggle_selected");
            $("#carousel_view_toggle_" + carousel.last).removeClass("carousel_view_toggle_selected");
            $("#carousel_view_toggle_" + index).addClass("carousel_view_toggle_selected");
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
        }

        var renderCarousel = function(dataArr){
            $(carouselContainer).html(sakai.api.Util.TemplateRenderer(carouselSingleColumnTemplate, {"data":dataArr},false,false));
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

        var parseData = function(data){
            var dataArr = [];

            for (var item in data.results) {
                var obj = {}

                if (data.results[item]["_mimeType"] && data.results[item]["_mimeType"].substring(0, 6) === "image/") {
                    obj.preview = renderImagePreview(data.results[item]["jcr:name"], data.results[item]["_lastModified"]);
                } else if (isJwPlayerSupportedVideo(data.results[item]["_mimeType"] || "")) {
                    obj.preview = renderVideoPlayer(data.results[item]["jcr:name"]);
                } else {
                    obj.preview = "<img src=\"background:url(\"/devwidgets/carousel/images/carousel_video_image.png\") no-repeat top left transparent;\"/>";
                }

                obj.title = data.results[item]["sakai:pooled-content-file-name"];
                if (data.results[item]["sakai:description"]) {
                    obj.description = sakai.api.Util.applyThreeDots(data.results[item]["sakai:description"], 700);
                }
                if(data.results[item]["sakai:tags"]){
                    obj.tags = sakai.api.Util.formatTagsExcludeLocation(data.results[item]["sakai:tags"]);
                }
                if(data.results[item][data.results[item]["jcr:name"] + "/comments"]){
                    obj.comments = [];
                    for(var prop in data.results[item][data.results[item]["jcr:name"] + "/comments"]){
                        if(data.results[item][data.results[item]["jcr:name"] + "/comments"][prop].hasOwnProperty("_id")){
                            obj.comments.push(data.results[item][data.results[item]["jcr:name"] + "/comments"][prop]);
                        }
                    }
                }
                obj.mimeType = data.results[item]["_mimeType"] || "";
                obj.created = sakai.api.l10n.transformDate(sakai.api.l10n.fromEpoch(data.results[item]["_created"]), sakai.data.me)
                obj.createdBy = data.results[item]["sakai:pool-content-created-for"];
                obj.lastModified = sakai.api.l10n.transformDate(sakai.api.l10n.fromEpoch(data.results[item]["_lastModified"]), sakai.data.me);
                obj.lastModifiedBy = data.results[item]["_lastModifiedBy"];
                obj.url = "/content#content_path=/p/" + data.results[item]["jcr:name"];

                dataArr.push(obj);
            }

            renderCarousel(dataArr);
        };

        var loadFeatured = function(){
            $.ajax({
                url: "/var/search/pool/me/manager-all.1.json?sortOn=_created&sortOrder=desc&page=0&items=4",
                cache: false,
                success: function(data){
                    parseData(data);
                }
            });
        };

        var doInit = function(){
            loadFeatured();
        };

        doInit();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("carousel");
});
