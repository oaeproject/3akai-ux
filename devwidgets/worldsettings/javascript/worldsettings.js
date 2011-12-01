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
        var worldsettingsTitle = "#worldsettings_title";
        var worldsettingsDescription = "#worldsettings_description";
        var worldsettingsTags =  "#worldsettings_tags";
        var worldsettingsCanBeFoundIn = "#worldsettings_can_be_found_in";
        var worldsettingsMembership = "#worldsettings_membership";

        // Page Structure Elements
        var $worldsettingsContainer = $("#worldsettings_container", rootel);
        var $worldsettingsDialog = $(".worldsettings_dialog", rootel);
        var $worldsettingsForm = $("#worldsettings_form", rootel);
        var $worldsettingsApplyButton = $("#worldsettings_apply_button");

        var visibility = "",
            worldId = "";

        var showWarning = function(){
            var newVisibility = $(worldsettingsCanBeFoundIn);
            var newVisibilityVal = $.trim(newVisibility.val());
            var oldVisibilityIndex = parseInt(newVisibility.find("option[value='" + sakai_global.group.groupData["sakai:group-visible"] + "']").attr("index"), 10);
            if (sakai_global.group.groupData["sakai:group-visible"] === newVisibilityVal || parseInt(newVisibility.attr("selectedIndex"), 10) > oldVisibilityIndex || newVisibilityVal === "members-only"){
                $worldsettingsForm.submit();
            } else {
                $("#worldsettings_warning_container_text").html(sakai.api.Util.TemplateRenderer("worldsettings_warning_container_text_template", {
                    "visibility": newVisibilityVal,
                    "group": sakai_global.group.groupData['sakai:group-title']
                }));
                $("#worldsettings_warning_container").jqmShow();
            }
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        var handleSubmit = function(form) {
            $worldsettingsContainer.find("select, input, textarea").attr("disabled","disabled");
            $worldsettingsContainer.find("select, input, textarea").attr("disabled","disabled");
            var worldTitle = $.trim($(worldsettingsTitle).val());
            var worldDescription = $.trim($(worldsettingsDescription).val());
            var worldTags = $.trim($(worldsettingsTags).val());
            var foundIn = $.trim($(worldsettingsCanBeFoundIn).val());
            var membership = $.trim($(worldsettingsMembership).val());
            var originalWorldTitle = $.trim($(worldsettingsTitle).attr("data-original-value"));
            var originalWorldDescription = $.trim($(worldsettingsDescription).attr("data-original-value"));
            var originalWorldTags = $.trim($(worldsettingsTags).attr("data-original-value"));
            var originalFoundIn = $.trim($(worldsettingsCanBeFoundIn).attr("data-original-value"));
            var originalMembership = $.trim($(worldsettingsMembership).attr("data-original-value"));

            // If nothing changed then don't do anything
            if (originalWorldTitle !== worldTitle ||
                originalWorldDescription !== worldDescription ||
                originalWorldTags !== worldTags ||
                originalFoundIn !== foundIn ||
                originalMembership !== membership){
                // Update group object
                sakai_global.group.groupData["sakai:group-title"] = worldTitle;
                sakai_global.group.groupData["sakai:group-description"] = worldDescription;
                sakai_global.group.groupData["sakai:group-visible"] = foundIn;
                sakai_global.group.groupData["sakai:group-joinable"] = membership;

                sakai.api.Groups.updateGroupProfile(worldId, {
                         "sakai:group-title" :  worldTitle,
                         "sakai:group-description": worldDescription,
                         "sakai:group-visible": foundIn,
                         "sakai:group-joinable": membership
                     }, sakai_global.group.groupData,
                     function(success) {
                         $worldsettingsContainer.find("select, input, textarea").removeAttr("disabled");
                         $worldsettingsContainer.find("select, input, textarea").removeAttr("disabled");
                         // only POST if user has changed values
                         if(membership !== originalMembership || foundIn !== originalFoundIn) {
                             // set new group permissions
                             var roles = $.parseJSON(sakai_global.group.groupData["sakai:roles"]);
                             sakai.api.Groups.setPermissions(sakai_global.group.groupId, membership, foundIn, roles);
                         }

                         // Set the group tags
                         // Collect tags
                         var grouptags = $.trim(worldTags).split(",");
                         for (var t = 0; t < grouptags.length; t++){
                             grouptags[t] = $.trim(grouptags[t]);
                         }
                         var groupProfileURL = "/~" + sakai_global.group.groupId + "/public/authprofile";
                         var locations = sakai.api.Util.getDirectoryTags(sakai_global.group.groupData["sakai:tags"], true);
                         grouptags = grouptags.concat(locations);
                         sakai.api.Util.tagEntity(groupProfileURL, grouptags, sakai_global.group.groupData["sakai:tags"], function(success, tags){
                             sakai_global.group.groupData["sakai:tags"] = tags;
                         });
                         $(window).trigger("sakai.entity.updateTitle", worldTitle);
                         sakai.api.Util.notification.show($("#worldsettings_success_title").html(), $("#worldsettings_success_body").html());
                         $worldsettingsDialog.jqmHide();
                         $("#worldsettings_warning_container").jqmHide();
                });
            } else {
                sakai.api.Util.notification.show($("#worldsettings_success_title").html(), $("#worldsettings_success_body").html());
                $worldsettingsDialog.jqmHide();
                $("#worldsettings_warning_container").jqmHide();
            }
        };

        var bindEvents = function(worldId) {
            $worldsettingsApplyButton.die("click").live("click", function() {
                showWarning();
            });
            $("#worldsettings_proceedandapply").die("click");
            $("#worldsettings_proceedandapply").live("click", function(){
                $worldsettingsForm.submit();
            });

            var validateOpts = {
                submitHandler: handleSubmit
            };
            // Initialize the validate plug-in
            sakai.api.Util.Forms.validate($worldsettingsForm, validateOpts, true);
        };

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        var renderWorldSettings = function(){
            var profile = sakai_global.group.groupData;
            var tags = "";
            if (profile['sakai:tags']){
                tags = sakai.api.Util.formatTagsExcludeLocation(profile['sakai:tags']).join(", ");
            }
            $("#worldsettings_form_container").html(sakai.api.Util.TemplateRenderer("worldsettings_form_template",{
                "title": profile['sakai:group-title'],
                "description": profile['sakai:group-description'],
                "tags": tags,
                "foundin": profile['sakai:group-visible'],
                "membership": profile['sakai:group-joinable']
            }));
        };

        /**
         * Initialization function DOCUMENTATION
         */
        var doInit = function (_worldId) {
            worldId = _worldId;
            renderWorldSettings();
            bindEvents();
            $worldsettingsDialog.jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 3000
            });
            $("#worldsettings_warning_container").jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                zIndex: 4000
            });
            $worldsettingsDialog.jqmShow();
        };

        // run the initialization function when the widget object loads
        $(window).bind("init.worldsettings.sakai", function(e, _worldId) {
            doInit(_worldId);
        });
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("worldsettings");
});
