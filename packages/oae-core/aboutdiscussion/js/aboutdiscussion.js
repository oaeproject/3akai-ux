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

define(['jquery', 'oae.core'], function($, oae) {

    return function(uid) {

        // The widget container
        var $rootel = $('#' + uid);

        /**
         * Render the metadata for the current discussion item
         *
         * @param  {Discussion}    discussionProfile    Discussion for which the metadata should be rendered
         */
        var renderMetadata = function(discussionProfile) {
            oae.api.util.template().render($('#aboutdiscussion-template', $rootel), {
                'discussionProfile': discussionProfile,
                'displayOptions': {
                     'linkTarget': '_blank'
                }
            }, $('#aboutdiscussion-container', $rootel));
        };

        /**
         * Initialize the aboutdiscussion modal dialog
         */
        var setUpAboutDiscussion = function() {
            $(document).on('click', '.oae-trigger-aboutdiscussion', function(ev, data) {
                // Request the context profile information
                $(document).trigger('oae.context.get', 'aboutdiscussion');
            });

            // Receive the context's profile information and set up the aboutdiscussion modal
            $(document).on('oae.context.send.aboutdiscussion', function(ev, discussionProfile) {
                // Show the aboutdiscussion modal
                $('#aboutdiscussion-modal', $rootel).modal();
                // Render the metadata for the current discussion item
                renderMetadata(discussionProfile);
            });
        };

        setUpAboutDiscussion();

    };
});
