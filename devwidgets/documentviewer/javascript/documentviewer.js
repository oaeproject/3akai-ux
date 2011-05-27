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

require(["jquery", "sakai/sakai.api.core", "/devwidgets/documentviewer/lib/document-viewer/assets/viewer.js", "/devwidgets/video/jwplayer/swfobject.js"], function($, sakai) {

    /**
     * @name sakai.documentviewer
     *
     * @class documentviewer
     *
     * @description
     * Initialize the documentviewer widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.documentviewer = function(tuid,showSettings,widgetData){
        
        var documentviewerPreview = "#" + tuid + " #documentviewer_preview";
        var $documentviewerPreview = $(documentviewerPreview);
        var templateObject = {};

        var getPath = function(data) {
            return "/p/" + data["_path"];
        };

        var renderDocumentPreview = function(data){
            var url = window.location.protocol + '//' + window.location.host + getPath(data);
            var pdfDoc = {
                id: data['_path'],
                title: data['sakai:pooled-content-file-name'],
                pages: data['sakai:pagecount'],
                resources: {
                    pdf: url,
                    page: {
                        image: url + ".page{page}-{size}.jpg"
                    }
                }
            };
            var container = documentviewerPreview;
            DV.load(pdfDoc, {
                container: container,
                width: "100%",
                height: 500,
                sidebar: false,
                text: false
            });
        };

        var renderImagePreview = function(url, lastMod){
            $documentviewerPreview.html("");
            templateObject.contentURL = url;
            var date = new Date();
            if (date){
                templateObject.contentURL += "?_=" + date.getTime();
            }
            sakai.api.Util.TemplateRenderer("documentviewer_image_template", templateObject, $("#" + tuid + " #documentviewer_image_calculatesize"));
            var $imageRendered = $("#"+tuid+" #documentviewer_image_rendered");
            $imageRendered.bind('load', function(ev){
                var width = $imageRendered.width();
                var height = $imageRendered.height();
                // TODO we can probably avoid hardcoding the sizes here
                // Too wide but when scaled to width won't be too tall
                if (width > 920 && height / width * 920 <= 560){
                    $imageRendered.addClass("documentviewer_preview_width");
                // Too tall but when scaled to height won't be too wide
                } else if (height > 560 && width / height * 560 <= 920){
                    $imageRendered.addClass("documentviewer_preview_height");
                }
                $documentviewerPreview.append($imageRendered);
            });
        };

        var renderEmbedPreview = function(data){
            $documentviewerPreview.html(data);
        };

        var renderHTMLPreview = function(data){
            sakai.api.Util.TemplateRenderer("documentviewer_html_template", templateObject, $documentviewerPreview);
            $("#documentviewer_html_iframe").attr("src", getPath(data));
            $("#documentviewer_html_iframe").attr("frameborder", "0");
        };

        var renderExternalHTMLPreview = function(url){
            sakai.api.Util.TemplateRenderer("documentviewer_externalhtml_template", templateObject, $documentviewerPreview);
            $("#documentviewer_externalhtml_iframe").attr("src", url);
            $("#documentviewer_externalhtml_iframe").attr("frameborder", "0");
        };

        var renderVideoPlayer = function(url, preview_avatar){
            var so = createSWFObject(false, {}, {});
            so.addVariable('file', url);
            if (url.indexOf("youtube") !== -1){
                so.addVariable('provider', 'youtube');
            } else {
                so.addVariable('provider', 'video');
            }
            if (preview_avatar) {
                so.addVariable('image', preview_avatar);
            }
            so.addVariable('stretching','uniform');
            so.write("documentviewer_video_" + tuid);
        };

        var renderAudioPlayer = function(data){
            var so = createSWFObject(false, {}, {});
            so.addVariable('file', getPath(data));
            so.addVariable('provider', 'sound');
            so.addVariable('image', "/devwidgets/documentviewer/images/content_preview_audio.jpg");
            so.addVariable('stretching','fill');
            so.write("documentviewer_video_" + tuid);
        };

        var renderFlashPlayer = function(data){
            var so = createSWFObject(getPath(data), {'allowscriptaccess':'never'}, {});
            so.addParam('scale','exactfit');
            so.write("documentviewer_video_" + tuid);
        };

        var renderGoogleMap = function(url) {
            var callback = "sakai_global.documentviewer.googlemaps." + tuid;
            sakai_global.documentviewer.googlemaps[tuid].url=url;
            if (window["google"]) {
                debug.log("Already have google maps api calling the callback ourselves");
                sakai_global.documentviewer.googlemaps[tuid]();
            } else {
                debug.log("Getting google maps api");
                require(["http://maps.google.com/maps/api/js?sensor=false&callback="+callback]);
            }
        };

        var codeAddress = function (map){
            var geocoder = new google.maps.Geocoder();
            var address = uri.queryKey.q;
            geocoder.geocode({
                'address': address
            }, function(results, status){
                if (status == google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                } else {
                    error.log("Geocode was not successful for the following reason: " + status);
                }
            });
        };

        // Callback for googlemaps api
        sakai_global.documentviewer.googlemaps = sakai_global.documentviewer.googlemaps || {};
        sakai_global.documentviewer.googlemaps[tuid] = function() {
            var uri = parseUri(sakai_global.documentviewer.googlemaps[tuid].url);
            // maybe we could use browser geolocation here (if ll isn't defined)
            var lat = 0;
            var lng = 0;
            var zoom = uri.queryKey.z || "8";
            zoom = parseInt(zoom, 0);
            var type = google.maps.MapTypeId.ROADMAP;

            if (uri.queryKey.t) {
                switch (uri.queryKey.t) {
                    case "h":
                        type = google.maps.MapTypeId.HYBRID;
                        break;
                    case "p":
                        type = google.maps.MapTypeId.TERRAIN;
                        break;
                    case "k":
                        type = google.maps.MapTypeId.SATTELITE;
                        break;
                }
            }
            if (uri.queryKey.ll){
                var ll = uri.queryKey.ll.split(',');
                lat = ll[0];
                lng = ll[1];
            }
            var latlng = new google.maps.LatLng(lat, lng);
            var myOptions = {
                "zoom": zoom,
                "center": latlng,
                "mapTypeId": type
            };
            $documentviewerPreview.css({width:"100%", height:"500px"});
            var elm = $documentviewerPreview[0];
            var map = new google.maps.Map(elm, myOptions);
            if (uri.queryKey.q) {
                codeAddress(map);
            }
        };

        var createSWFObject = function(url, params, flashvars){
            if (!url){
                url = "/devwidgets/video/jwplayer/player.swf";
            }
            var so = new SWFObject(url,'ply', '100%', '560','9','#000000');
            so.addParam('allowfullscreen','true');
            if (params.allowscriptaccess) {
                so.addParam('allowscriptaccess', params.allowscriptaccess);
            } else {
                so.addParam('allowscriptaccess', 'always');
            }
            so.addParam('wmode','opaque');
            sakai.api.Util.TemplateRenderer("documentviewer_video_template", {"tuid":tuid}, $documentviewerPreview);
            return so;
        };

        if (sakai.api.Content.hasPreview(widgetData.data)){
            var data = widgetData.data;
            var mimeType = sakai.api.Content.getMimeType(widgetData.data);

            if (sakai.api.Content.isJwPlayerSupportedVideo(mimeType)){
                renderVideoPlayer(getPath(data));
            } else if (mimeType === "audio/mp3" || mimeType === "audio/x-aac") {
                renderAudioPlayer(data);
            } else if (mimeType === "application/x-shockwave-flash") {
                renderFlashPlayer(data);
            } else if (mimeType === "text/html") {
                renderHTMLPreview(data);
            } else if (mimeType === "x-sakai/link"){
                var pUrl = data["sakai:preview-url"];
                var pType = data["sakai:preview-type"];

                if (pUrl && pType === "iframe") {
                    renderExternalHTMLPreview(pUrl);
                } else if (pUrl && pType === "video") {
                    var avatar = data["sakai:preview-avatar"];
                    renderVideoPlayer(pUrl, avatar);
                } else if (pUrl && pType === "image") {
                    renderImagePreview(pUrl);
                } else if (pUrl && pType === "embed") {
                    renderEmbedPreview(pUrl);
                } else if (pUrl && pType ==="googlemap") {
                    renderGoogleMap(pUrl);
                } else {
                    pUrl = widgetData["sakai:pooled-content-url"];
                    renderExternalHTMLPreview(pUrl);
                }
            } else if (mimeType === "image/vnd.adobe.photoshop") {
                renderStoredPreview(data);
            } else  if (mimeType.substring(0, 6) === "image/") {
                renderImagePreview(getPath(data), data["_bodyLastModified"]);
            } else if (data["sakai:pagecount"]){
                renderDocumentPreview(data);
            }
        }

        // Indicate that the widget has finished loading
        sakai_global.documentviewer.isReady = true;
        $(window).trigger("ready.documentviewer.sakai", {});

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("documentviewer");
});
