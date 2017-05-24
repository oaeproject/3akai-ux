/*!
 * Copyright 2017 Apereo Foundation (AF) Licensed under the
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

        var renderMetadata = function(tool) {
            oae.api.util.template().render($('#aboutlti-template', $rootel), {
                'tool': tool,
                'displayOptions': {
                     'linkTarget': '_blank'
                }
            }, $('#aboutlti-container', $rootel));
        };

        /**
         * Initialize the aboutlti modal dialog
         */
        var setUpAboutLtiTool = function() {
            $(document).on('click', '.oae-trigger-aboutlti', function(ev, data) {
                // Request the context profile information
                $(document).trigger('oae.context.get', 'aboutlti');
            });

            // Receive the context's profile information and set up the aboutlti modal
            $(document).on('oae.context.send.aboutlti', function(ev, toolProfile) {
                // Show the aboutlti modal
                $('#aboutlti-modal', $rootel).modal();
                // Render the metadata for the current content item
                renderMetadata(toolProfile.tool);
            });
        };

        setUpAboutLtiTool();
    };
});
