/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery', 'underscore', 'oae.core', 'jquery.oembed'], function($, _, oae) {

    return function(uid, showSettings, widgetData) {

        // Cache the widget container
        var $rootel = $('#' + uid);

        /**
         * Whitelist the supported oEmbed providers
         *
         * @see http://oembed.com
         */
        var oEmbedProviders = {
            'blip': RegExp('blip\\.tv/.+'),
            'dailymotion': RegExp('dailymotion\\.com/.+'),
            'deviantart': RegExp('deviantart\\.com/.+'),
            'dribble': RegExp('dribbble\\.com/shots/.+'),
            'flickr': RegExp('flickr\\.com/photos/.+'),
            'flickrshort': RegExp('flic\\.kr/p/.+'),
            'hulu': RegExp('hulu\\.com/watch/.*'),
            'ifixit': RegExp('ifixit\\.com/.+'),
            'imgly': RegExp('img\\.ly/.+'),
            'instagram': RegExp('instagr\\.?am(\\.com)?/.+'),
            'pastebin': RegExp('pastebin\\.com/[\\S]{8}'),
            'pinterest': RegExp('pinterest.com/pin/.+'),
            'prezi': RegExp('prezi\\.com/.*'),
            'scribd': RegExp('scribd\\.com/.+'),
            'slideshare': RegExp('slideshare\\.net'),
            'soundcloud': RegExp('soundcloud\\.com/.+'),
            'speakerdeck': RegExp('speakerdeck\\.com/.+'),
            'ted': RegExp('ted\\.com/talks/.+'),
            'twitgoocom': RegExp('twitgoo\\.com/.+'),
            'twitpic': RegExp('twitpic\\.com/.+'),
            'vimeo': RegExp('vimeo\\.com/.+'),
            'youtube': RegExp('youtube\\.com/watch.+v=[\\w-]+&?'),
            'youtubeshort': RegExp('youtu\\.be\/.+')
        };

        /**
         * Override the default embed behavior for some of the supported oEmbed providers
         */
        var setUpCustomOEmbedProviders = function() {
            // Dribble
            $.fn.updateOEmbedProvider('dribbble', null, null, null, {
                'templateData' : function(data) {
                    return oae.api.util.template().render($('#linkpreview-image-template', $rootel), {
                        'img': data.image_url,
                        'linkProfile': widgetData
                    });
                }
            });

            // Img.ly
            $.fn.updateOEmbedProvider('img.ly', 'photo', ['img\\.ly/.+'],'//img.ly/show/large/$1', {
                'embedtag': {tag: 'img'}
            });

            // Twitgoo
            $.fn.updateOEmbedProvider('twitgoo.com', 'photo', ['twitgoo\\.com/.+'],'http://twitgoo.com/show/img/$1', {
                embedtag: {tag:'img'}
            });

            // TED, Twitpic
            $.fn.updateOEmbedProvider('opengraph', null, null, null, {
                yql: {
                    xpath: '//meta|//title|//link',
                    from: 'html',
                    datareturn: function(results) {
                        var embed = $('<p/>');
                        if (results['og:url'].match(oEmbedProviders.ted)) {
                            var url = results['og:url'].replace('www.', 'embed.');
                            embed.append(oae.api.util.template().render($('#linkpreview-iframe-template', $rootel), {'link': url}));
                        } else if (results['og:image']) {
                            // If we're looking at TwitPic, get the large picture instead of the thumbnail
                            if (results['og:site_name'] === 'TwitPic') {
                                results['og:image'] = results['og:image'].replace('thumb', 'large');
                            }
                            embed.append(oae.api.util.template().render($('#linkpreview-image-template', $rootel), {
                                'img': results['og:image'],
                                'linkProfile': widgetData
                            }));
                        }
                        return embed;
                    }
                }
            });
        };

        /**
         * Render the default link preview. This will use a screenshot of the link when available.
         */
        var renderDefaultPreview = function() {
            oae.api.util.template().render($('#linkpreview-default-template', $rootel), {
                'linkProfile': widgetData,
                'displayOptions': {
                    'addLink': false,
                    'addVisibilityIcon': false,
                    'size': 'large'
                }
            }, $('#linkpreview-container'), $rootel);
        };

        /**
         * Embed the link using an iframe. If the preview processor has marked the link
         * as non-embeddable because of cross-domain embedding policies, we resort to
         * default rendering. If the link's protocol is `http` but the user is accessing
         * OAE over `https`, the link is converted to `https` if it is accessible over
         * `https` to avoid browser security issues/warnings. We also check the mime type
         * of the link and only embed types that the browser can display.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/NavigatorPlugins.mimeTypes
         */
        var renderIframePreview = function() {
            var link = widgetData.link;
            var embeddable = widgetData.previews.embeddable;
            // If there is a protocol mismatch, the link is converted to `https` if it is
            // accessible over `https`
            if (window.location.protocol === 'https:' && link.indexOf('http:' === 0)) {
                if (widgetData.previews.httpsAccessible) {
                    link = link.replace('http:', 'https:');
                // If the link is not accessible over `https`, it can't be embedded
                } else {
                    embeddable = false;
                }
            }
            // Only embed text, html, images, and types that the browser has plugins to support
            var type = widgetData.previews.targetType ? widgetData.previews.targetType.split(';')[0] : false;
            var universalSupport = _.contains(['text/html', 'text/plain', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'], type);
            var havePlugin = navigator.mimeTypes && navigator.mimeTypes[type] && navigator.mimeTypes[type].enabledPlugin;
            var supported = widgetData.previews.targetType && (universalSupport || havePlugin);

            // The link can be embedded as an iFrame
            if (embeddable && supported) {
                if (type.substring(0, 6) === 'image/') {
                    oae.api.util.template().render($('#linkpreview-image-template', $rootel), {'img': link, 'linkProfile': widgetData}, $('#linkpreview-container'), $rootel);
                } else {
                    oae.api.util.template().render($('#linkpreview-iframe-template', $rootel), {'link': link}, $('#linkpreview-container'), $rootel);
                }
            // The link can not be embedded
            } else {
                renderDefaultPreview();
            }
        };

        /**
         * Render the link preview using the oEmbed library.
         */
        var renderOEmbedPreview = function() {
            $('#linkpreview-container', $rootel).oembed(widgetData.link, {
                // Delete the arrow that collapses the container
                'includeHandle': false,
                // Place the content into the container instead of creating a new div
                'embedMethod': 'fill',
                // If oEmbed fails, revert to the default preview
                'onError': renderDefaultPreview,
                // Use our own API to expand long URLs, as the default does not work over https
                'longUrlAjaxOptions': {
                    'url': '/api/longurl/expand',
                    'dataType': 'json'
                }
            });
        };

        /**
         * Decide whether or not to render the link preview using oEmbed or using the standard
         * iFrame embedding method.
         */
        var initPreview = function() {
            // Check the current link against the supported oEmbed providers
            var useOEmbed = false;
            $.each(oEmbedProviders, function(provider, regex) {
                if (regex.test(widgetData.link)) {
                    useOEmbed = true;
                    return false;
                }
            });

            if (useOEmbed) {
                renderOEmbedPreview();
            } else {
                renderIframePreview();
            }
        };

        setUpCustomOEmbedProviders();
        initPreview();

    };
});
