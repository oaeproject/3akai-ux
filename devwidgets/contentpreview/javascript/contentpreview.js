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

/*global $ */

var sakai = sakai || {};

/**
 * @name sakai.contenpreview
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

//TODO: Clean this mess up

sakai.contentpreview = function(tuid,showSettings){

    var determineDataType = function(){
        hidePreview();
        var mimeType = sakai.content_profile.content_data.data["jcr:content"]["jcr:mimeType"];
        if (mimeType.substring(0, 6) === "video/"){
            renderVideoPlayer();
        } else if (mimeType.substring(0, 6) === "audio/"){
            renderAudioPlayer();
        } else if (mimeType === "application/x-shockwave-flash"){
            renderFlashPlayer();    
        } else if (mimeType === "text/plain") {
            renderTextPreview();
        } else if (mimeType === "text/html") {
            renderHTMLPreview();
        } else if (mimeType === "image/vnd.adobe.photoshop") {
            renderDefaultPreview();
        } else if (mimeType.substring(0, 6) === "image/") {
            renderImagePreview();
        } else {
            renderDefaultPreview();
        }
    }
    
    var setDownloadButton = function(){
        $("#contentpreview_download_button").attr("href", sakai.content_profile.content_data.path);
    }
    
    var showManagerButtons = function(){
        if (sakai.content_profile.content_data.isManager){
            $("#contentpreview_actions_container").show();
        }
    }

    //TODO: Clean this mess up
    var renderImagePreview = function(contentURL){
        $(".contentpreview_image_preview").show();
        $("#contentpreview_image_rendered").css("width", "");
        $("#contentpreview_image_rendered").css("height", "");
        $("#contentpreview_image_rendered").css("border", "");
        $("#contentpreview_image_preview").css("width", "");
        $("#contentpreview_image_preview").css("height", "");
        $("#contentpreview_image_preview").css("border", "");
        $("#contentpreview_image_preview").css("overflow", "");
        $("#contentpreview_image_rendered").css("margin-top", "");
        var json = {};
        json.contentURL = contentURL || sakai.content_profile.content_data.path;
        $.TemplateRenderer("contentpreview_image_template", json, $("#contentpreview_image_calculatesize"));
        $("#contentpreview_image_rendered").bind('load', function(ev){
            var width = $("#contentpreview_image_rendered").width();
            var height = $("#contentpreview_image_rendered").height();
            if (width >= 640 && height / width * 640 > 390){
                $("#contentpreview_image_rendered").css("width", "640px");
                $("#contentpreview_image_rendered").css("border", "none");
                $("#contentpreview_image_preview").css("height", "390px");
                $("#contentpreview_image_preview").css("width", "640px");
                $("#contentpreview_image_preview").css("border", "1px solid #D4DADE");
                $("#contentpreview_image_preview").css("overflow", "hidden");
                $("#contentpreview_image_rendered").css("margin-top", - ((height / width * 640) - 390) / 2 + "px");
            } else if (width > 640 && height / width * 640 <= 390){
                $("#contentpreview_image_rendered").css("width", "640px");
            } else if (height > 390 && width / height * 390 <= 640){
                $("#contentpreview_image_rendered").css("height", "390px");
            } else if (width <= 640 && height <= 390){
                // Do nothing, just show the image as is
            }
            $("#contentpreview_image_preview").append($("#contentpreview_image_rendered"));
        });
    }
    
    var renderTextPreview = function(){
        if (sakai.content_profile.content_data.data["jcr:content"][":jcr:data"] > 1500000){
            renderDefaultPreview();
            return;
        };
        $(".contentpreview_text_preview").show();
        $.ajax({
           url: sakai.content_profile.content_data.path,
           type: "GET",
           success: function(data){
               $(".contentpreview_text_preview").html(data.replace(/\n/g, "<br/>"));
           }
        });
    }
    
    var renderHTMLPreview = function(){
        $(".contentpreview_html_preview").show();
        $.TemplateRenderer("contentpreview_html_template", json, $("#contentpreview_html_preview"));
        $("#contentpreview_html_iframe").attr("src", sakai.content_profile.content_data.path);
        $("#contentpreview_html_iframe").attr("width", "640px");
        $("#contentpreview_html_iframe").attr("height", "390px");
        $("#contentpreview_html_iframe").attr("frameborder", "0");
    }
    
    var renderVideoPlayer = function(){
        $(".contentpreview_videoaudio_preview").show();
        var so = createSWFObject(false, {}, {});
        so.addVariable('file', sakai.content_profile.content_data.path);
        if (sakai.content_profile.content_data.data.previewImage) {
            so.addVariable('image', sakai.content_profile.content_data.data.previewImage);
        }
        so.addVariable('stretching','fill');
        so.write("contentpreview_videoaudio_preview");
    }
    
    var renderAudioPlayer = function(){
        $(".contentpreview_videoaudio_preview").show();
        var so = createSWFObject(false, {}, {});
        so.addVariable('file', sakai.content_profile.content_data.path);
        so.addVariable('image', "/devwidgets/contentpreview/images/content_preview_audio.jpg");
        so.addVariable('stretching','fill');
        so.write("contentpreview_videoaudio_preview");
    }
    
    var renderFlashPlayer = function(){
        $(".contentpreview_flash_preview").show();
        var so = createSWFObject(sakai.content_profile.content_data.path, {'allowscriptaccess':'never'}, {});
        so.addParam('scale','exactfit');
        so.write("contentpreview_flash_preview");
    }
    
    var createSWFObject = function(url, params, flashvars){
        if (!url){
            url = "/devwidgets/video/jwplayer/player-licensed.swf";
        }
        var so = new SWFObject(url,'ply', '100%', '100%','9','#ffffff');
        so.addParam('allowfullscreen','true');
        if (params.allowscriptaccess) {
            so.addParam('allowscriptaccess', params.allowscriptaccess);
        } else {
            so.addParam('allowscriptaccess', 'always');
        }
        so.addParam('wmode','opaque');
        return so;
    }
    
    var renderDefaultPreview = function(){
        if (sakai.content_profile.content_data.data["sakai:needsprocessing"] === "false") {
            renderImagePreview("/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".preview.jpg");
        }
        else {
            $(".contentpreview_default_preview").show();
        }
    }
    
    var hidePreview = function(){
        $(".contentpreview_html_preview").hide();
        $(".contentpreview_videoaudio_preview").hide();
        $(".contentpreview_flash_preview").hide();
        $(".contentpreview_default_preview").hide();
        $(".contentpreview_text_preview").hide();
        $(".contentpreview_image_preview").hide();
        
        $("#contentpreview_image_preview").html("");
    }

    var bindButtons = function(){
        $("#content_preview_delete").unbind("click");
        $("#upload_content").unbind("click");
        // Open the delete content pop-up
        $("#content_preview_delete").bind("click", function(){
            window.scrollTo(0,0);
            sakai.deletecontent.init(sakai.content_profile.content_data);
        });
        $("#upload_content").die("click");
        $("#upload_content").live("click", function() {
            $(window).trigger("sakai-fileupload-init", {
                newVersion: true,
                isLink: false,
                contentPath: sakai.content_profile.content_data.data["jcr:name"]
            });
        });
        $("#upload_content").bind("click", function(){
            $(window).trigger("sakai-fileupload-init");
        });
    }

    $(window).bind("sakai.contentpreview.start", function(){
        determineDataType();
        showManagerButtons();
        setDownloadButton();
        bindButtons();
    });
    
    // Indicate that the widget has finished loading
    sakai.contentpreview.isReady = true;
    $(window).trigger("sakai.contentpreview.ready", {});

};

sakai.api.Widgets.widgetLoader.informOnLoad("contentpreview");