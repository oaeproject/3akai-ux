/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'sakai/sakai.api.core', 'underscore'], function($, sakai, _) {

    /**
     * @name sakai.userpermissions
     *
     * @class userpermissions
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.userpermissions = function(tuid, showSettings) {

        var contextData = false;

        ///////////////////////////////////////
        // Retrieving the current permission //
        ///////////////////////////////////////

        var getCurrentPermission = function() {
            var currentPath = contextData.path;
            var page = false;
            if (currentPath.indexOf('/') !== -1) {
                var split = currentPath.split('/');
                page = sakai_global.user.pubdata.structure0[split[0]][split[1]];
            } else {
                page = sakai_global.user.pubdata.structure0[currentPath];
            }
            var permission = page._view;
            $('#userpermissions_area_title').text(sakai.api.i18n.General.process(page._title));
            $('#userpermissions_content_container').html(sakai.api.Util.TemplateRenderer('userpermissions_content_template', {
                'permission': permission
            }));
        };

        /////////////////////////////
        // Storing new permissions //
        /////////////////////////////

        /**
         * Notify the user that the permissions have been changed or an error has occurred
         * @param {Boolean} success Indicates the success or failure of setting the permissions
         */
        var permissionsSet = function(success) {
            if (success) {
                // Hide the dialog
                sakai.api.Util.Modal.close('#userpermissions_container');
                // Show gritter notification
                sakai.api.Util.notification.show($('#userpermissions_notification_title').text(), $('#userpermissions_notification_body').text());
            }else{
                // Show an error notification
                sakai.api.Util.notification.show($('#userpermissions_notification_title').text(), $('#userpermissions_notification_error_body').text(), sakai.api.Util.notification.type.ERROR);
            }
        };

        /**
         * Apply the selected permissions to the page
         */
        var applyPermissions = function() {
            // Get the item we're talking about.
            var currentPath = contextData.path;

            // Get the visibility.
            var visibility = $('#userpermissions_area_general_visibility').val();

            // We're assuming the currentPath is always of the form:
            // profile/aboutme or profile/basic
            var split = currentPath.split('/');
            var resource = split[0];
            var section = split[1];

            if (resource === 'profile') {
                sakai.api.User.setUserProfileSectionVisibility(sakai.data.me.userId, section, visibility, permissionsSet);
            } else {
                permissionsSet(false);
            }
        };

        /////////////////////////////////
        // Modal dialog initialization //
        /////////////////////////////////

        var initializeOverlay = function() {
            sakai.api.Util.Modal.open('#userpermissions_container');
        };

        sakai.api.Util.Modal.setup('#userpermissions_container', {
            modal: true,
            overlay: 20,
            toTop: true,
            zIndex: 3000
        });

        /////////////////////
        // Internal events //
        /////////////////////

        $('#userpermissions_apply_permissions').on('click', function() {
            applyPermissions();
        });

        /////////////////////
        // External events //
        /////////////////////

        $(document).on('init.userpermissions.sakai', function(ev, _contextData) {
            console.log(_contextData);
            contextData = _contextData
            getCurrentPermission();
            initializeOverlay();
        });

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('userpermissions');
});