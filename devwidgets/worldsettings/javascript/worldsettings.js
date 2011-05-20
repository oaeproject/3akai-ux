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
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai.worldsettings
     *
     * @class worldsettings
     *
     * @description
     * WIDGET DESCRIPTION
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.worldsettings = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////
        var rootel = $("#" + tuid);

        // Data Items in the Form
        var $worldsettingsTitle = $('#worldsettings_title', rootel);
        var $worldsettingsDescription = $('#worldsettings_description', rootel);
        var $worldsettingsTags =  $('#worldsettings_tags', rootel);
        var $worldsettingsCanBeFoundIn = $('#worldsettings_can_be_found_in', rootel);
        var $worldsettingsMembership = $('#worldsettings_membership', rootel);

        // Page Structure Elements
        var $worldsettingsContainer = $('#worldsettings_container', rootel);
        var $worldsettingsDialog = $('.worldsettings_dialog', rootel);
        var $worldsettingsForm = $("#worldsettings_form", rootel);
        var $worldsettingsApplyButton = $("#worldsettings_apply_button");
        var $worldsettingsCancelButton = $("#worldsettings_cancel_button");

        ///////////////////////
        // Utility functions //
        ///////////////////////
        var closeDialog = function() {
            if ($worldsettingsDialog.hasClass('dialog')) {
                $worldsettingsDialog.jqmHide();
            }
        }

        ////////////////////
        // Event Handlers //
        ////////////////////

        var bindEvents = function(worldId) {
            $worldsettingsCancelButton.die("click");
            $worldsettingsCancelButton.live("click", function() {
                closeDialog();
            });
            $worldsettingsApplyButton.die("click");
            $worldsettingsApplyButton.live("click", function() {
                $worldsettingsForm.validate({submitHandler: function(form) {
                    $worldsettingsContainer.find("select, input, textarea").attr("disabled","disabled");
                        $worldsettingsContainer.find("select, input, textarea").attr("disabled","disabled");
                        var worldTitle = $worldsettingsTitle.val();
                        sakai.api.Groups.updateGroupProfile(worldId,
                             {
                                 "sakai:group-title" :  worldTitle,
                                 "sakai:group-description": $worldsettingsDescription.val(),
                                 "sakai:tags":  $worldsettingsTags.val(),
                                 "sakai:group-visible": $worldsettingsCanBeFoundIn.val(),
                                 "sakai:group-joinable": $worldsettingsMembership.val()
                             }, function(success) {
                                 $(window).trigger("sakai.entity.updateTitle", worldTitle);
                                 closeDialog();
                                 // TODO What to do in case of failure?   
                        });
                }});
                $worldsettingsForm.submit();
            });
        };

        /////////////////////////////
        // Initialization function //
        /////////////////////////////
        
        /**
         * Initialization function DOCUMENTATION
         */
        var doInit = function (worldId) {
            bindEvents(worldId);
            var profile = sakai.api.Groups.getGroupData(worldId, function(success, data) {
                $worldsettingsTitle.val(data.authprofile['sakai:group-title']);
                $worldsettingsDescription.val(data.authprofile['sakai:group-description']);
                $worldsettingsTags.val(data.authprofile['sakai:tags']);
                $worldsettingsCanBeFoundIn.val(data.authprofile['sakai:group-visible']);
                $worldsettingsMembership.val(data.authprofile['sakai:group-joinable']);
            });
            $worldsettingsDialog.jqm({
                modal: true,
                overlay: 20,
                toTop: true
            });
            $worldsettingsDialog.jqmShow();

        };
        
        // run the initialization function when the widget object loads
        $(window).bind("init.worldsettings.sakai", function(e, worldId) {
            doInit(worldId);
        });
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("worldsettings");
});
