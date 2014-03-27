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
            initialScale,
            maxScale = ',maximum-scale=',
            maxScaleRegex = /,*maximum\-scale\=\d*\.*\d*/;

        // `this` should be a focusable DOM Element
        if(!this.addEventListener || !document.querySelector) {
            return;
        }

        viewport = document.querySelector('meta[name="viewport"]');
        content = viewport.content;

        // TODO: Figure out how to deal cleanly with Android, since Android
        // might set `screen.width` to physical pixels rather than device
        // independent pixels.
        // TODO: Handle orientation change events,
        // e.g. `window.matchMedia("(orientation: portrait)").addListener`
        initialScale = screen.width / $('body').outerWidth();

        var changeViewport = function(event) {
            viewport.content = content + (event.type == 'blur' ?
                (content.match(maxScaleRegex, '') ? '' : maxScale + 10) :
                maxScale + initialScale);
        }

        this.addEventListener('focus', changeViewport, true);
        this.addEventListener('blur', changeViewport, false);
    };

    (function($) {
        $.fn.cancelZoom = function() {
            return this.each(cancelZoom);
        };
    })(jQuery);

});
