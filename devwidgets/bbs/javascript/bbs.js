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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.validate.sakai-edited.js (validate)
 */
/*global Config, $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.bbs
     *
     * @class bbs
     *
     * @description
     * Initialize the bbs widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.bbs = function(tuid, showSettings){


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $("#" + tuid); // Get the main div used by the widget
        var widgeturl = sakai.api.Widgets.widgetLoader.widgets[tuid] ? sakai.api.Widgets.widgetLoader.widgets[tuid].placement : false;
        var widgetSettings = {};
        // Each post gets a marker which is basicly the widget ID.
        // If we are using another discussion this marker will be the ID of that widget.
        var marker = tuid;

        // Containers
        var $bbsContainer = $("#bbs_container", $rootel);
        var $bbsMainContainer = $("#bbs_main_container", $rootel);
        var $bbsSettingsReplyOptionsContainer = $("#bbs_settings_reply_options_container", $rootel);
        var $bbsSettingsPermissionsContainer = $("#bbs_settings_permissions_container", $rootel);


        // Settings
        var $bbsSettings = $("#bbs_settings", $rootel);

        var $bbsSettingsSubmit = $("#bbs_settings_submit", $rootel);
        var $bbsSettingsCancel = $("#bbs_settings_cancel", $rootel);
        var $bbsSettingsReplyOptionsTab = $("#bbs_settings_reply_options_tab", $rootel);
        var $bbsSettingsPermissionsTab = $("#bbs_settings_permissions_tab", $rootel);

        /**
         * Check if the message store already exists
         * If it does not exists we need to create one
         */
        var checkMessageStore = function(){
            if (widgeturl) {
                store = widgeturl + "/message";
                $.ajax({
                    url: widgeturl + ".0.json",
                    type: "GET",
                    dataType: "json",
                    success: function(data){
                        // no op
                    },
                    error: function(xhr, textStatus, thrownError){
                        if (xhr.status == 404) {
                            // we need to create the initial message store
                            $.post(store, {
                                "sling:resourceType": "sakai/messagestore"
                            });
                        }
                    }
                });
            }
        };

        /**
         * Check if the widget has been inited in a group or not
         * @return{Boolean} True if the widget has been inited in a group
         */
        var checkIsGroup = function(){
            if (sakai_global.currentgroup && typeof sakai_global.currentgroup.id === "string") {
                currentSite = sakai_global.currentgroup.id;
                return true;
            } else {
                currentSite = sakai_global.profile.main.data["rep:userId"];
                return false;
            }
        };

        /**
         * Show all the posts in the main view
         * @param {String} response Json response with all the posts
         * @param {Boolean} exists Check if the discussion exists
         */
        var showPosts = function(response, exists){
            if (exists) {
                try {
                    getPostInfo(response.results);
                } catch (err) {
                    debug.error(err);
                }
            } else {
                debug.warn('Failed to show the posts.');
            }
        };

        /**
         * Shows a setting tab. 
         * Workflow is: Hide previous tab, remove classes, add new classes, show new tab.
         * @param {String} tab Available options: reply_options, permissions
         */
        var showTab = function(tab){
            $(".fl-tabs-active").removeClass("fl-tabs-active");
            switch (tab) {
                case "reply_options":
                    $bbsSettingsReplyOptionsTab.parent("li").addClass("fl-tabs-active");
                    $bbsSettingsPermissionsContainer.hide();
                    $bbsSettingsReplyOptionsContainer.show();
                    break;
                case "permissions":
                    $bbsSettingsPermissionsTab.parent("li").addClass("fl-tabs-active");
                    $bbsSettingsReplyOptionsContainer.hide();
                    $bbsSettingsPermissionsContainer.show();
                    break;
            }
        };

        /**
         * Displays the settings, and depending on the settings the main or existing view of it.
         */
        var displaySettings = function(){
            $bbsMainContainer.hide();
            $bbsSettings.show();
            showTab("reply_options");
        };

        /**
         * Get the id of the dicussion widget and show the post including replies
         */
        var getPostsFromJCR = function(){
            var s = store;
            var url = sakai.config.URL.DISCUSSION_GETPOSTS_THREADED.replace(/__PATH__/, s).replace(/__MARKER__/, marker);
            $.ajax({
                url: url,
                cache: false,
                success: function(data){
                    showPosts(data, true);
                },
                error: function(xhr, textStatus, thrownError){
                    showPosts(xhr.status, false);
                }
            });
        };

        /**
         * Fetches the widget settings and places it in the widgetSettings var.
         */
        var getWidgetSettings = function(){
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
                if (success) {
                    widgetSettings = $.extend(data, {}, true);
                    if (widgetSettings.marker !== undefined) {
                        marker = widgetSettings.marker;
                    }
                    if (showSettings) {
                        displaySettings();
                    } else {
                        //getPostsFromJCR();
                    }
                }
                else {
                    // We don't have settings for this widget yet.
                    if (showSettings) {
                        displaySettings();
                    }
                }
                
            });
        };

        /**
         * Closes the settings container.
         */
        var finishSettingsContainer = function(){
            sakai.api.Widgets.Container.informFinish(tuid, "discussion");
        };

        var saveSettings = function(callback){
            var data = widgetSettings;

            widgetSettings['sling:replytype'] = $("#bbs_settings_reply_options input[type='radio']:checked").val();
            widgetSettings['sakai:whocanaddtopic'] = $("#bbs_settings_permissions_add_new input[type='radio']:checked").val();
            widgetSettings['sakai:whocanreply'] = $("#bbs_settings_permissions_who_can_reply input[type='radio']:checked").val();

            // JCR properties are not necessary.
            delete data["jcr:primaryType"];

            // don't save messages this way
            delete data["message"];

            sakai.api.Widgets.saveWidgetData(tuid, data, callback);
        };


        ////////////////////
        // Event Handlers //
        ////////////////////
        var addBinding = function() {

            // SETTINGS //
            // Submit button.
            $bbsSettingsSubmit.bind("click", function(e, ui){
                saveSettings(finishSettingsContainer);
            });

            // Cancel button
            $bbsSettingsCancel.bind("click", function(e, ui){
                sakai.api.Widgets.Container.informCancel(tuid, "bbs");
            });

            // Reply options tab
            $bbsSettingsReplyOptionsTab.bind("click", function(e, ui){
                showTab("reply_options");
            });

            // Permissions tab
            $bbsSettingsPermissionsTab.bind("click", function(e, ui){
                showTab("permissions");
            });

        };


        //////////////////////
        // Initial function //
        //////////////////////

        var init = function(){
            addBinding();
            checkMessageStore();
            getWidgetSettings();

            if (showSettings) {
                $bbsMainContainer.hide();
                $bbsSettings.show();
            }else{
                $bbsMainContainer.show();
                $bbsSettings.hide();
            }

        };

        init();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("bbs");
});
