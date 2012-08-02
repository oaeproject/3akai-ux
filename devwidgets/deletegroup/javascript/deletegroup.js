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

/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */

/*global, window, $ */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.deletegroup
     *
     * @class deletegroup
     *
     * @description
     * Deletegroup widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.deletegroup = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var deletedata = {};


        ///////////////////
        // CSS Selectors //
        ///////////////////

        var $rootel = $('#' + tuid);

        var $deletegroup_action_delete = $('#deletegroup_action_delete', $rootel);
        var $deletegroup_dialog = $('#deletegroup_dialog', $rootel);
        var $deletegroup_title = $('.deletegroup_title', $rootel);
        var $deletegroup_category = $('.deletegroup_category', $rootel);

        // Messages
        var $deletegroup_not_successfully_deleted = $('#deletegroup_not_successfully_deleted', $rootel);
        var $deletegroup_successfully_deleted = $('#deletegroup_successfully_deleted', $rootel);
        var $deletegroup_deleted = $('#deletegroup_deleted', $rootel);
        var $deletegroup_not_deleted = $('#deletegroup_not_deleted', $rootel);


        /////////////
        // Binding //
        /////////////

        /**
         * Add binding to the various element in the delete content widget
         */
        var addBinding = function(callback) {
            // Reinitialise the jQuery selector
            $deletegroup_action_delete = $($deletegroup_action_delete.selector);

            // Add binding to the delete button
            $deletegroup_action_delete.off('click').on('click', function() {
                sakai.api.Groups.deleteGroup(deletedata['sakai:group-id'], sakai.data.me, function(success) {
                    if (success) {
                        sakai.api.Util.notification.show($deletegroup_deleted.html(),
                            $deletegroup_successfully_deleted.html());
                    } else {
                        sakai.api.Util.notification.show($deletegroup_not_deleted.html(),
                            $deletegroup_not_successfully_deleted.html(),
                            sakai.api.Util.notification.type.ERROR);
                    }
                    if ($.isFunction(callback)) {
                        callback(success);
                    }
                    $(window).trigger('done.deletegroup.sakai', [deletedata]);
                    sakai.api.Util.Modal.close($deletegroup_dialog);
                });

                return false;
            });
        };


        ////////////////////
        // Initialisation //
        ////////////////////

        /**
         * Load the delete content widget with the appropriate data
         * This function can be called from anywhere within Sakai by triggering the
         * 'init.deletegroup.sakai' event
         *
         * @param {Object} data A JSON object containing the necessary information.
         */
        var load = function(data, callback) {
            deletedata = $.extend(true, {}, data);
            addBinding(callback);
            sakai.api.Groups.getTemplate(deletedata['sakai:category'], deletedata['sakai:templateid'], function(success, template) {
                if (success) {
                    currentTemplate = template;
                    $deletegroup_category.html(sakai.api.i18n.getValueForKey(currentTemplate.title));
                    $deletegroup_title.html(sakai.api.Util.Security.safeOutput(data['sakai:group-title']));
                    sakai.api.Util.Modal.open($deletegroup_dialog);
                } else {
                    debug.error('Could not get the group template');
                }
            });
        };
        $(document).on('init.deletegroup.sakai', function(e, data, callback) {
            sakai.api.Util.Modal.setup($deletegroup_dialog, {
                modal: true,
                toTop: true
            });

            load(data, callback);
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('deletegroup');
});
