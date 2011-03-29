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
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai.contentpreview
     *
     * @class contentpreview
     *
     * @description
     * Initialize the contentpreview widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contentpreview = function(tuid,showSettings){

        var obj = {};
        obj.type = "showpreview";
        
        var qs = new Querystring();

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

        var determineDataType = function(){
            hidePreview();
            obj.type = "showpreview";
            obj.buttons = "default";
            var callback = null;
            var arg = null;
            var mimeType = sakai_global.content_profile.content_data.data["mimeType"] || sakai_global.content_profile.content_data.data["_mimeType"];
            if (qs.get("nopreview") === "true"){
                callback = renderDefaultPreview;
                obj.type = "default";
            } else if (isJwPlayerSupportedVideo(mimeType)){
                callback = renderVideoPlayer;
            } else if (mimeType === "audio/mp3" || mimeType === "audio/x-aac") {
                callback = renderAudioPlayer;
            } else if (mimeType === "application/x-shockwave-flash") {
                callback = renderFlashPlayer;
            } else if (mimeType === "text/plain") {
                callback = renderTextPreview;
            } else if (mimeType === "text/html") {
                callback = renderHTMLPreview;
            } else if (mimeType === "x-sakai/link"){
                obj.buttons = "links";
                if (sakai_global.content_profile.content_data.data["sakai:preview-url"] && sakai_global.content_profile.content_data.data["sakai:preview-type"] === "iframe") {
                    callback = renderExternalHTMLPreview;
                    arg = sakai_global.content_profile.content_data.data["sakai:preview-url"];
                } else if (sakai_global.content_profile.content_data.data["sakai:preview-url"] && sakai_global.content_profile.content_data.data["sakai:preview-type"] === "video") {
                    callback = renderVideoPlayer;
                    arg = sakai_global.content_profile.content_data.data["sakai:preview-url"];
                } else {
                    callback = renderExternalHTMLPreview;
                }
            } else if (mimeType === "image/vnd.adobe.photoshop") {
                callback = renderStoredPreview;
            } else  if (mimeType.substring(0, 6) === "image/") {
                callback = renderImagePreview;
            } else if (sakai_global.content_profile.content_data.data["sakai:needsprocessing"] === "false") {
                callback = renderStoredPreview;
            } else {
                callback = renderDefaultPreview;
                obj.type = "default";
            }
            obj.sakai = sakai;
            sakai.api.Util.TemplateRenderer("contentpreview_widget_main_template", obj, $("#contentpreview_widget_main_container"));
            callback(arg);
        };

        //TODO: Clean this mess up
        var renderImagePreview = function(contentURL){
            var $contentpreviewImagePreview = $(".contentpreview_image_preview");
            $contentpreviewImagePreview.html("");
            $contentpreviewImagePreview.show();
            var json = {};
            json.contentURL = contentURL || sakai_global.content_profile.content_data.path;
            json.contentURL = json.contentURL + "?_=" + sakai_global.content_profile.content_data.data._bodyLastModified;
            json.sakai = sakai;
            sakai.api.Util.TemplateRenderer("contentpreview_image_template", json, $("#contentpreview_image_calculatesize"));
            $("#contentpreview_image_rendered").bind('load', function(ev){
                var width = $("#contentpreview_image_rendered").width();
                var height = $("#contentpreview_image_rendered").height();
                // Too wide but when scaled to width won't be too tall
                if (width > 920 && height / width * 920 <= 560){
                    $("#contentpreview_image_rendered").addClass("contentpreview_image_preview_width");
                // Too tall but when scaled to height won't be too wide
                } else if (height > 560 && width / height * 560 <= 920){
                    $("#contentpreview_image_rendered").addClass("contentpreview_image_preview_height");
                }
                $("#contentpreview_image_preview").append($("#contentpreview_image_rendered"));
            });
        };

        var renderTextPreview = function(){
            if (sakai_global.content_profile.content_data.data["_length"] > 1500000){
                renderDefaultPreview();
                return;
            }
            $(".contentpreview_text_preview").show();
            $.ajax({
               url: sakai_global.content_profile.content_data.path,
               type: "GET",
               success: function(data){
                   $(".contentpreview_text_preview").html(data.replace(/\n/g, "<br/>"));
               }
            });
        };

        var renderHTMLPreview = function(){
            $(".contentpreview_html_preview").show();
            json.sakai = sakai;
            sakai.api.Util.TemplateRenderer("contentpreview_html_template", json, $("#contentpreview_html_preview"));
            $("#contentpreview_html_iframe").attr("src", sakai_global.content_profile.content_data.path);
            $("#contentpreview_html_iframe").attr("width", "920px");
            $("#contentpreview_html_iframe").attr("height", "560px");
            $("#contentpreview_html_iframe").attr("frameborder", "0");
        };
        
        var renderExternalHTMLPreview = function(url){
            $(".contentpreview_externalhtml_preview").show();
            json.sakai = sakai;
            sakai.api.Util.TemplateRenderer("contentpreview_externalhtml_template", json, $("#contentpreview_externalhtml_preview"));
            url = url || sakai_global.content_profile.content_data.data["sakai:pooled-content-url"];
            $("#contentpreview_externalhtml_iframe").attr("src", url);
            $("#contentpreview_externalhtml_iframe").attr("frameborder", "0");
        };

        var renderVideoPlayer = function(url){
            $(".contentpreview_videoaudio_preview").show();
            var so = createSWFObject(false, {}, {});
            so.addVariable('file', url || sakai_global.content_profile.content_data.path);
            if (sakai_global.content_profile.content_data.data["sakai:preview-avatar"]) {
                so.addVariable('image', sakai_global.content_profile.content_data.data["sakai:preview-avatar"]);
            }
            so.addVariable('stretching','uniform');
            so.write("contentpreview_videoaudio_preview");
        };

        var renderAudioPlayer = function(){
            $(".contentpreview_videoaudio_preview").show();
            var so = createSWFObject(false, {}, {});
            so.addVariable('file', sakai_global.content_profile.content_data.path);
            so.addVariable('image', "/devwidgets/contentpreview/images/content_preview_audio.jpg");
            so.addVariable('stretching','fill');
            so.write("contentpreview_videoaudio_preview");
        };

        var renderFlashPlayer = function(){
            $(".contentpreview_flash_preview").show();
            var so = createSWFObject(sakai_global.content_profile.content_data.path, {'allowscriptaccess':'never'}, {});
            so.addParam('scale','exactfit');
            so.write("contentpreview_flash_preview");
        };

        var createSWFObject = function(url, params, flashvars){
            if (!url){
                url = "/devwidgets/video/jwplayer/player-licensed.swf";
            }
            var so = new SWFObject(url,'ply', '920', '560','9','#ffffff');
            so.addParam('allowfullscreen','true');
            if (params.allowscriptaccess) {
                so.addParam('allowscriptaccess', params.allowscriptaccess);
            } else {
                so.addParam('allowscriptaccess', 'always');
            }
            so.addParam('wmode','opaque');
            return so;
        };

        var renderStoredPreview = function(){
            renderImagePreview("/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".preview.jpg");
        };

        var renderDefaultPreview = function(){
            //Nothing really, it's all part of the template
        };

        var hidePreview = function(){
            $("#contentpreview_widget_main_container").html("");
            $("#contentpreview_image_preview").html("");
        };

        var bindButtons = function(){
            $("#content_preview_delete").unbind("click");
            $("#upload_content").unbind("click");
            // Open the delete content pop-up
            $("#content_preview_delete").bind("click", function(){
                window.scrollTo(0,0);
                $(window).trigger('init.deletecontent.sakai', sakai_global.content_profile.content_data);
            });
            $("#upload_content").die("click");
            $("#upload_content").live("click", function() {
                $(window).trigger("init.fileupload.sakai", {
                    newVersion: true,
                    isLink: sakai_global.content_profile.content_data.data["_mimeType"] === "x-sakai/link",
                    contentPath: sakai_global.content_profile.content_data.data["jcr:name"]
                });
            });
            $("#upload_content").bind("click", function(){
                $(window).trigger("init.fileupload.sakai");
            });
        };

        var determineFileCreator = function(){
            $.ajax({
                url: "/~" + sakai_global.content_profile.content_data.data["sakai:pool-content-created-for"] + "/public/authprofile.infinity.json",
                success: function(profile){
                    sakai_global.content_profile.content_data.creator = sakai.api.User.getDisplayName(profile);
                    determineDataType();
                    bindButtons();
                },
                error: function(xhr, textStatus, thrownError){
                    determineDataType();
                    bindButtons();
                }
            });
        };

        $(window).bind("start.contentpreview.sakai", function(){
            determineFileCreator();
        });

        $(window).bind("updated.version.content.sakai",function() {
            determineDataType();
        });

        // Indicate that the widget has finished loading
        sakai_global.contentpreview.isReady = true;
        $(window).trigger("ready.contentpreview.sakai", {});

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("contentpreview");
});
