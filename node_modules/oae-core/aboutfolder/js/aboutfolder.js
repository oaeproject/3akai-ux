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
         * Render the metadata for the current folder
         *
         * @param  {Folder}    folderProfile    Folder for which the metadata should be rendered
         */
        var renderMetadata = function(folderProfile) {
            oae.api.util.template().render($('#aboutfolder-template', $rootel), {
                'folderProfile': folderProfile,
                'displayOptions': {
                     'linkTarget': '_blank'
                }
            }, $('#aboutfolder-container', $rootel));
        };

        /**
         * Initialize the aboutfolder modal dialog
         */
        var setUpAboutFolder = function() {
            $(document).on('click', '.oae-trigger-aboutfolder', function(ev, data) {
                // Request the context profile information
                $(document).trigger('oae.context.get', 'aboutfolder');
            });

            // Receive the context's profile information and set up the aboutfolder modal
            $(document).on('oae.context.send.aboutfolder', function(ev, folderProfile) {
                // Show the aboutfolder modal
                $('#aboutfolder-modal', $rootel).modal();
                // Render the metadata for the current folder
                renderMetadata(folderProfile);
            });
        };

        setUpAboutFolder();

    };
});
