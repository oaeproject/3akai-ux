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

/**
 * jQuery plugin to allow selective disabling of mobile browser
 * zooming on input, select, textarea, etc. elements.
 *
 * Usage: $('input:text,select,textarea').cancelZoom();
 *
 * Adapted from https://gist.github.com/zachleat/2008932
 */

define(['jquery'], function (jQuery) {

    var cancelZoom = function() {
        var viewport,
            content,
            maxScale = ',maximum-scale=',
            maxScaleRegex = /,*maximum\-scale\=\d*\.*\d*/;

        // Make sure `this` is a focusable DOM Element and
        // essential objects are present
        if(!this.addEventListener || !document.querySelector || (window.orientation === undefined)) {
            return;
        }

        // Initialize variables
        viewport = document.querySelector('meta[name="viewport"]');
        content = viewport.content;

        /**
         * Change the viewport in response to focus or blur
         */
        var changeViewport = function() {
            // Get the width of the screen in device-independent pixels
            var w = screen.width;

            // On iOS only, screen.width doesn't account for orientation
            // TODO: Switch to using oae.api.util.isIos() when that's merged
            if (/safari/i.test(navigator.userAgent) &&
                /(iphone|ipad|ipod)/i.test(navigator.userAgent) &&
                Math.abs(window.orientation) === 90) {
                w = screen.height;
            }
            var initialScale = w / $('body').outerWidth();
            viewport.content = content + (event.type == 'blur' ?
                (content.match(maxScaleRegex, '') ? '' : maxScale + 10) :
                maxScale + initialScale);
        }

        // Listen for focus and blur events
        this.addEventListener('focus', changeViewport, true);
        this.addEventListener('blur', changeViewport, false);
    };

    (function($) {
        $.fn.cancelZoom = function() {
            return this.each(cancelZoom);
        };
    })(jQuery);

});
