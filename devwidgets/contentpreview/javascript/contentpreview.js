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
 * @name sakai.helloworld
 *
 * @class helloworld
 *
 * @description
 * Initialize the helloworld widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
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
        } else {
            renderDefaultPreview();
        }
    }
    
    var renderVideoPlayer = function(){
        $(".contentpreview_videoaudio_preview").show();
        var so = createSWFObject(false, {}, {});
        so.addVariable('file', sakai.content_profile.content_data.path + "/" + sakai.content_profile.content_data.data["sakai:pooled-content-file-name"]);
        if (sakai.content_profile.content_data.data.previewImage) {
            so.addVariable('image', sakai.content_profile.content_data.data.previewImage);
        }
        so.addVariable('stretching','fill');
        so.write("contentpreview_videoaudio_preview");
    }
    
    var renderAudioPlayer = function(){
        $(".contentpreview_videoaudio_preview").show();
        var so = createSWFObject(false, {}, {});
        so.addVariable('file', sakai.content_profile.content_data.path + "/" + sakai.content_profile.content_data.data["sakai:pooled-content-file-name"]);
        so.addVariable('image', "/devwidgets/contentpreview/images/content_preview_audio.jpg");
        so.addVariable('stretching','fill');
        so.write("contentpreview_videoaudio_preview");
    }
    
    var renderFlashPlayer = function(){
        $(".contentpreview_flash_preview").show();
        var so = createSWFObject(sakai.content_profile.content_data.path + "/" + sakai.content_profile.content_data.data["sakai:pooled-content-file-name"], {'allowscriptaccess':'never'}, {});
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
        
    }
    
    var hidePreview = function(){
        $(".contentpreview_videoaudio_preview").hide();
        $(".contentpreview_flash_preview").hide();
    }

    $(window).bind("sakai.contentpreview.start", function(){
        determineDataType();
    });
    
    // Indicate that the widget has finished loading
    $(window).trigger("sakai.contentpreview.ready", {});
    sakai.contentpreview.isReady = true;

};

sakai.api.Widgets.widgetLoader.informOnLoad("contentpreview");