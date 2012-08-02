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

require(['jquery', 'sakai/sakai.api.core', '/devwidgets/documentviewer/lib/document-viewer/assets/viewer.js', '/dev/lib/misc/jwplayer/swfobject.js'], function($, sakai) {

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
    sakai_global.documentviewer = function(tuid,showSettings,widgetData) {

        var $rootel = $('#' + tuid);
        var $documentviewerPreview = $('#documentviewer_preview', $rootel);
        var documentviewerPreviewSelector = '#' + tuid + ' .documentviewer_preview';
        var templateObject = {};
        var docType = false;
        var data = false;

        var getPath = function(data) {
            return '/p/' + data['_path'];
        };

        var renderDocumentPreview = function(data) {
            var url = window.location.protocol + '//' + window.location.host + getPath(data);
            var pdfDoc = {
                id: data['_path'],
                title: data['sakai:pooled-content-file-name'],
                pages: data['sakai:pagecount'],
                resources: {
                    pdf: url,
                    page: {
                        image: url + '/page{page}.{size}.jpg'
                    }
                }
            };
            var container = documentviewerPreviewSelector;
            DV.load(pdfDoc, {
                container: container,
                width: '100%',
                height: 500,
                sidebar: false,
                text: false
            });
        };

        /**
         * Get the extension for the image preview according to the mimeType
         * @param {String} mimeType The mimeType of the image preview
         */
        var getImagePreviewExtension = function(mimeType) {
            if (mimeType === 'image/png' || mimeType === 'image/gif') {
                return '.' + mimeType.split('/')[1];
            } else {
                return '.jpg';
            }
        };

        /**
         * Render the preview of an image
         * @param {String} url The URL for the image
         * @param {Object} data The data for the image (will be undefined for flickr / 3th party images)
         */
        var renderImagePreview = function(url, data) {
            $documentviewerPreview.html('');

            if (data && data['sakai:hasPreview'] === 'true' && data['sakai:needsprocessing'] === 'false' && data.page1) {
                templateObject.contentURL = getPath(data.page1) + '.normal' + getImagePreviewExtension(data.page1._mimeType);
            } else {
                templateObject.contentURL = url;
            }
            var date = new Date();
            if (date) {
                templateObject.contentURL += '?_=' + date.getTime();
            }

            $documentviewerPreview.html(
                sakai.api.Util.TemplateRenderer('documentviewer_image_template', templateObject)
            );
        };

        var renderEmbedPreview = function(data) {
            $documentviewerPreview.html(data);
        };

        var renderHTMLPreview = function(data) {
            sakai.api.Util.TemplateRenderer('documentviewer_html_template', templateObject, $documentviewerPreview);
            $('#documentviewer_html_iframe', $rootel).attr('src', getPath(data));
            $('#documentviewer_html_iframe', $rootel).attr('frameborder', '0');
        };

        var renderExternalHTMLPreview = function(url) {
            sakai.api.Util.TemplateRenderer('documentviewer_externalhtml_template', templateObject, $documentviewerPreview);
            $('#documentviewer_externalhtml_iframe', $rootel).attr('src', url);
            $('#documentviewer_externalhtml_iframe', $rootel).attr('frameborder', '0');
        };

         var renderKalturaPlayer = function(data) {
            var html5FlashCompatibilityURL = sakai.config.kaltura.serverURL +'/p/'+sakai.config.kaltura.partnerId+'/sp/'+sakai.config.kaltura.partnerId+'00/embedIframeJs/uiconf_id/'+sakai.config.kaltura.playerId+'/partner_id/'+sakai.config.kaltura.partnerId;
            $.getScript(html5FlashCompatibilityURL, function() {
                var kaltura_id = data['kaltura-id'];
                var url = sakai.config.kaltura.serverURL + '/kwidget/wid/_'+sakai.config.kaltura.partnerId+'?ui_conf_id='+sakai.config.kaltura.playerId;
                var so = createSWFObject(url, {}, {});
                so.addVariable('stretching','uniform');
                so.addVariable('image', data['kaltura-thumbnail']);
                so.addVariable('entryId',kaltura_id);
                so.write('documentviewer_video_' + tuid);
            });
        };

        var renderVideoPlayer = function(url, preview_avatar) {
            var so = createSWFObject(false, {}, {});
            so.addVariable('file', url);
            if (url.indexOf('youtube') !== -1) {
                so.addVariable('provider', 'youtube');
            } else {
                so.addVariable('provider', 'video');
            }
            if (preview_avatar) {
                so.addVariable('image', preview_avatar);
            }
            so.addVariable('stretching','uniform');
            so.write('documentviewer_video_' + tuid);
        };

        var renderAudioPlayer = function(data) {
            var so = createSWFObject(false, {'height':'25px'}, {});
            so.addVariable('file', getPath(data));
            so.addVariable('provider', 'sound');
            so.addVariable('stretching','fill');
            so.write('documentviewer_video_' + tuid);
        };

        var renderFlashPlayer = function(data) {
            var so = createSWFObject(getPath(data), {'allowscriptaccess':'never'}, {});
            so.addParam('scale','exactfit');
            so.write('documentviewer_video_' + tuid);
        };

        var renderGoogleMap = function(url) {
            var callback = 'sakai_global.documentviewer.googlemaps.' + tuid;
            sakai_global.documentviewer.googlemaps[tuid].url=url;
            if (window['google']) {
                debug.info('Already have google maps api calling the callback ourselves');
                sakai_global.documentviewer.googlemaps[tuid]();
            } else {
                debug.info('Getting google maps api');
                require(['//maps.google.com/maps/api/js?sensor=false&callback='+callback]);
            }
        };

        var codeAddress = function(map) {
            var geocoder = new google.maps.Geocoder();
            var address = uri.queryKey.q;
            geocoder.geocode({
                'address': address
            }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                } else {
                    error.log('Geocode was not successful for the following reason: ' + status);
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
            var zoom = uri.queryKey.z || '8';
            zoom = parseInt(zoom, 0);
            var type = google.maps.MapTypeId.ROADMAP;

            if (uri.queryKey.t) {
                switch (uri.queryKey.t) {
                    case 'h':
                        type = google.maps.MapTypeId.HYBRID;
                        break;
                    case 'p':
                        type = google.maps.MapTypeId.TERRAIN;
                        break;
                    case 'k':
                        type = google.maps.MapTypeId.SATTELITE;
                        break;
                }
            }
            if (uri.queryKey.ll) {
                var ll = uri.queryKey.ll.split(',');
                lat = ll[0];
                lng = ll[1];
            }
            var latlng = new google.maps.LatLng(lat, lng);
            var myOptions = {
                'zoom': zoom,
                'center': latlng,
                'mapTypeId': type
            };
            $documentviewerPreview.css({width:'100%', height:'500px'});
            var elm = $documentviewerPreview[0];
            var map = new google.maps.Map(elm, myOptions);
            if (uri.queryKey.q) {
                codeAddress(map);
            }
        };

        var createSWFObject = function(url, params, flashvars) {
            if (!url) {
                url = '/dev/lib/misc/jwplayer/player.swf';
            }
            var so = new SWFObject(url,'ply', '100%', params.height || '100%','9','#000000');
            so.addParam('allowfullscreen','true');
            if (params.allowscriptaccess) {
                so.addParam('allowscriptaccess', params.allowscriptaccess);
            } else {
                so.addParam('allowscriptaccess', 'always');
            }
            so.addParam('wmode','opaque');
            sakai.api.Util.TemplateRenderer('documentviewer_video_template', {'tuid':tuid}, $documentviewerPreview);
            return so;
        };

        var handleShown = function(e, showing) {
            if (showing && docType === 'document') {
                // For some reason, the document view doesn't handle hide/show very well
                renderDocumentPreview(data);
            }
        };

        if (sakai.api.Content.hasPreview(widgetData.data)) {
            data = widgetData.data;
            var mimeType = sakai.api.Content.getMimeType(widgetData.data);

            if (sakai.api.Content.isKalturaPlayerSupported(mimeType)) {
                renderKalturaPlayer(data);
            } else if (sakai.api.Content.isJwPlayerSupportedVideo(mimeType)) {
                renderVideoPlayer(getPath(data));
            } else if (sakai.api.Content.isJwPlayerSupportedAudio(mimeType)) {
                renderAudioPlayer(data);
            } else if (mimeType === 'application/x-shockwave-flash') {
                renderFlashPlayer(data);
            } else if (mimeType === 'text/html' || mimeType === 'text/plain' || mimeType ==='text/tab-separated-values' ) {
                renderHTMLPreview(data);
            } else if (mimeType === 'x-sakai/link') {
                var pUrl = data['sakai:preview-url'];
                var pType = data['sakai:preview-type'];

                if (pUrl && pType === 'iframe') {
                    renderExternalHTMLPreview(pUrl);
                } else if (pUrl && pType === 'video') {
                    var avatar = data['sakai:preview-avatar'];
                    renderVideoPlayer(pUrl, avatar);
                } else if (pUrl && pType === 'image') {
                    renderImagePreview(pUrl);
                } else if (pUrl && pType === 'embed') {
                    renderEmbedPreview(pUrl);
                } else if (pUrl && pType ==='googlemap') {
                    renderGoogleMap(pUrl);
                } else {
                    pUrl = widgetData['sakai:pooled-content-url'];
                    renderExternalHTMLPreview(pUrl);
                }
            } else  if (mimeType.substring(0, 6) === 'image/') {
                renderImagePreview(getPath(data), data);
            } else if (data['sakai:pagecount']) {
                docType = 'document';
                renderDocumentPreview(data);
            }
        }

        // Indicate that the widget has finished loading
        sakai_global.documentviewer.isReady = true;
        $(window).trigger('ready.documentviewer.sakai', {});
        $(window).on(tuid + '.shown.sakai', handleShown);

    };
    sakai.api.Widgets.widgetLoader.informOnLoad('documentviewer');
});
