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
            // Render the template, passing in the updated data
            var result = oaeUtil.template().render($template, {
                'entityData': data
            });
            // Replace the thumbnails with the updated html
            $('.oae-thumbnail[data-id="' + data.id + '"]').replaceWith(result);
        });

    })(jQuery);
});
