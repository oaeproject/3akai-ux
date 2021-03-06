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

    /*!
     * This widget will be initiated with a widgetData object that contains the following properties:
     *
     * @param  {Number}     count               The number of items that have been prepared to add into the system
     * @param  {Object[]}   ghosts              Ghost items that should be added to the autosuggest share field upon initialization
     * @param  {Bookean}    ghosts[i].selected  Whether or not the ghost item should be selected by default
     * @param  {Object[]}   preFill             Items that should be pre-filled into the autosuggest share field upon initialization
     * @param  {Bookean}    preFill[i].fixed    Whether or not the pre-filled item should be undeleteable from the share list
     * @param  {String}     type                The type of item that will be added to the system (one of `file`, `link`, `collabdoc`, `collabsheet` or `folder`)
     * @param  {String}     visibility          The default visibility for the items that are being added to the system (one of `public`, `loggedin` or `private`)
     */
    return function(uid, showSettings, widgetData) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that keeps track of the current page context, as this will be used as a default
        // user/group that the item will be shared with
        var pageContext = null;

        /**
         * Translate and returns the i18n key associated to personal library that will be the target of the item being added
         *
         * @param  {String}   type    The type of the items handled by the widget ('file', 'link', 'collabdoc', 'collabsheet' or 'discussion')
         * @return {String}           Returns the translated string associated to personal library the item will be added to (e.g. `My Library`, `My Discussions`)
         */
        var getLibraryi18n = function(type) {
            if (type === 'discussion') {
                return oae.api.i18n.translate('__MSG__MY_DISCUSSIONS__');
            } else {
                return oae.api.i18n.translate('__MSG__MY_LIBRARY__');
            }
        };

        /**
         * Fire an event to let the widget caller know that the permission change has been aborted
         */
        var cancelPermissionsChange = function() {
            $(document).trigger('oae.setpermissions.cancel.' + uid);
        };

        /**
         * Trigger an event when changes have been made to the visibility settings
         */
        var savePermissionsChange = function() {
            // Get the items in the share with list
            var selection = oae.api.util.autoSuggest().getSelection($rootel);

            var selectedFolderAndPrincipalItems = _.partition(selection, function(selectedItem) {
                return (selectedItem.resourceType === 'folder');
            });
            var selectedFolderItems = selectedFolderAndPrincipalItems[0];
            var selectedPrincipalItems = selectedFolderAndPrincipalItems[1];

            // Determine which selected display names to show on the UI for the user performing the
            // share operation. These will be i18nized names that can be displayed directly to the
            // user
            var selectedContextNames = [];

            // Check if the item has been shared with the current user. If so, that should
            // always show first in the generated summary
            var selectedCurrentUser = _.findWhere(selectedPrincipalItems, {'id': oae.data.me.id});
            if (selectedCurrentUser) {
                selectedContextNames.push(getLibraryi18n(widgetData.type));
            }

            // The item is always shared with the current context, so ensure it is high priority in
            // the list of context names to display
            if (pageContext.id !== oae.data.me.id) {
                selectedContextNames.push(pageContext.displayName);
            }

            // Compile the list of users and groups the item is being shared with excluding
            // the current user and the current page context, as those are being presented
            // separately in the summary
            var selectedOutsideContext = _.filter(selectedPrincipalItems, function(selectedPrincipalItem) {
                return (selectedPrincipalItem.id !== oae.data.me.id && selectedPrincipalItem.id !== pageContext.id);
            });

            // Get the selected visibility setting
            var visibility = $('#setpermissions-container input[type="radio"]:checked', $rootel).val();

            // Generate a user-friendly summary
            var summary = oae.api.util.template().render($('#setpermissions-summary-template', $rootel), {
                'count': widgetData.count,
                'resourceType': widgetData.type,
                'selectedContextNames': selectedContextNames,
                'selectedOutsideContext': selectedOutsideContext,
                'visibility': visibility
            });

            // Inform the widget caller that the permissions have changed
            $(document).trigger('oae.setpermissions.changed.' + uid, {
                'selectedFolderItems': selectedFolderItems,
                'selectedPrincipalItems': selectedPrincipalItems,
                'summary': summary,
                'visibility': visibility
            });
        };

        /**
         * Initialize the autosuggest used for sharing with other users or groups
         *
         * @param  {Function}       callback            Standard callback function
         */
        var setUpAutoSuggest = function(callback) {
            oae.api.util.autoSuggest().setup($('#setpermissions-share', $rootel), {
                'allowEmail': true,
                'ghosts': widgetData.ghosts,
                'preFill': widgetData.preFill
            }, null, callback);
        };

        /**
         * Initialize the setpermissions widget
         */
        var setUpSetPermissionsModal = function() {
            // Render the setpermissions template
            oae.api.util.template().render($('#setpermissions-template', $rootel), widgetData, $('#setpermissions-container', $rootel));

            $('#setpermissions-savepermissions', $rootel).on('click', savePermissionsChange);
            $('#setpermissions-cancelpermissions', $rootel).on('click', cancelPermissionsChange);

            // Trigger and bind an event that will ask for the page context
            $(document).on('oae.context.send.setpermissions.' + uid, function(ev, data) {
                pageContext = data;
                // Immediately pass the default permissions summary back to the widget caller
                setUpAutoSuggest(savePermissionsChange);
            });
            $(document).trigger('oae.context.get', 'setpermissions.' + uid);
        };

        setUpSetPermissionsModal();

    };
});
