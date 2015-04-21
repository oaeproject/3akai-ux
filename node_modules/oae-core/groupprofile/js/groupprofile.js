/*!
 * Copyright 2015 Apereo Foundation (AF) Licensed under the
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

define(['jquery', 'underscore', 'oae.core'], function($, _, oae) {

    // When this widget is loaded, the profile representing the context for which the about widget
    // needs to be rendered should be passed in as `widgetData.context`. Further updates to the
    // profile in context should be made by issuing the document event `oae.about.update-profile`
    // with the updated profile as the first parameter
    return function(uid, showSettings, widgetData) {

        // The widget container
        var $rootel = $('#' + uid);

        // The context profile (e.g., group) to use for rendering
        var contextProfile = widgetData.context;

        /**
         * Render the header of the about widget
         */
        var setUpHeader = function() {
            var action = null;

            if (contextProfile.isManager) {
                action = {
                    'icon': 'fa-pencil',
                    'label': oae.api.i18n.translate('__MSG__EDIT_DETAILS__'),
                    'trigger': 'group-trigger-editgroup',
                    'data': {
                        'editgroup-focus': '#editgroup-description'
                    }
                };
            }

            oae.api.util.template().render($('#groupprofile-header-template', $rootel), {'action': action}, $('#groupprofile-header-container', $rootel));
        };

        /**
         * Render the profile description of the about widget
         */
        var setUpDescription = function() {
            oae.api.util.template().render($('#groupprofile-description-template', $rootel), {'contextProfile': contextProfile}, $('#groupprofile-description-container', $rootel));
        };

        /**
         * Render the members of the about widget
         */
        var setUpMembers = function() {
            var data = {
                'contextProfile': contextProfile,
                'displayOptions': {
                    'addVisibilityIcon': false,
                    'size': 'medium'
                },
                'members': contextProfile.members
            };

            oae.api.util.template().render($('#groupprofile-members-template', $rootel), data, $('#groupprofile-members-container', $rootel));
        };

        /**
         * Re-render the about description content when the group profile updates
         */
        $(document).on('oae.context.update', function(ev, updatedContextProfile) {
            contextProfile = updatedContextProfile;

            // Update the description content and members
            setUpDescription();
            setUpMembers();
        });

        setUpHeader();
        setUpDescription();
        setUpMembers();

    };
});
