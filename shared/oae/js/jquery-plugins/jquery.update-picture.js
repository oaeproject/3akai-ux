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

define(['jquery', 'oae.api.util'], function (jQuery, oaeUtil) {
    (function($) {

        /**
         * Catches the `oae.changepic.update` event and updates the associated thumbnail images
         */
        $(document).on('oae.changepic.update', function(ev, data) {
            // Define the template
            var $template = $('<div id="thumbnail-template"><!--${renderThumbnail(entityData)}--></div>');
            // Render a thumbnail and extract the image from it. Not all thumbnails on the page should be
            // encapsulated in a link so we render a thumbnail and extract the image from it to insert into
            // already existing thumbnail elements in the DOM.
            var thumbnailImage = $($.trim(oaeUtil.template().render($template, {
                'entityData': data
            }))).find('[role="img"]')[0].outerHTML;

            // For each thumbnail in the DOM, render the updated thumbnail image
            $('.oae-thumbnail[data-id="' + data.id + '"]').each(function(i, picture) {
                // If the thumbnail to update links to the user's profile, render the image inside of the anchor tag inside of `oae-thumbnail`
                if ($(picture).has('a').length) {
                    $($(picture).has('a')).html(thumbnailImage);
                // If the thumbnail to update doesn't link to the user's profile, render the image directly into `oae-thumbnail`
                } else {
                    $(picture).html(thumbnailImage);
                }
            });
        });

    })(jQuery);
});
