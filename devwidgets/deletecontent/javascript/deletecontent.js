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

/*global, fluid, window, $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.deletecontent
     *
     * @class deletecontent
     *
     * @description
     * Deletecontent widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.deletecontent = function(tuid, showSettings){

        //////////////////////
        // Global variables //
        //////////////////////

        var $rootel = $("#" + tuid);

        var contentIManage = false;
        var contentIView = false;
        var context = false;
        var callback = false;

        ///////////////////
        // CSS Selectors //
        ///////////////////

        var $deletecontent_dialog = $("#deletecontent_dialog", $rootel);

        ////////////////////////////////////////
        // Removing content from library only //
        ////////////////////////////////////////

        var removeHybrid = function(){
            var batchRequests = [];
            // Remove for content I'm viewer of
            for (var v = 0; v < contentIView.length; v++){
                batchRequests.push({
                    "url": "/p/" + contentIView[v]["_path"] + ".members.json",
                    "method": "POST",
                    "parameters": {
                        ":viewer@Delete": context
                    }
                });
            }
            var manageOption = $("input[name='deletecontent_hybrid_options']:checked").val();
            if (manageOption === "libraryonly"){
                // Remove for content I'm a manager of
                for (var m = 0; m < contentIManage.length; m++){
                    batchRequests.push({
                        "url": "/p/" + contentIManage[m]["_path"] + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":manager@Delete": context
                        }
                    });
                }
            } else if (manageOption === "system"){
                // Remove for content I'm manager of
                for (var m = 0; m < contentIManage.length; m++){
                    batchRequests.push({
                        "url": "/p/" + contentIManage[m]["_path"],
                        "method": "POST",
                        "parameters": {
                            ":operation": "delete"
                        }
                    });
                }
            }
            sakai.api.Server.batch(batchRequests, function (success, data) {
                if (success) {
                    sakai.api.Util.notification.show($("#deletecontent_message_title").html(), $("#deletecontent_message_from_library").html());
                } else {
                    sakai.api.Util.error.show($("#deletecontent_message_title").html(), $("#deletecontent_message_error").html()); 
                }
                $(window).trigger("done.deletecontent.sakai");
                if (callback && typeof(callback) === "function") {
                    callback(success);
                }
                $deletecontent_dialog.jqmHide();
            });
        };

        /**
         * Remove the selected items from the system and thus from all libraries where this is being
         * used
         */
        var removeFromSystem = function(){
            var batchRequests = [];
            // Remove for content I'm manager of
            for (var m = 0; m < contentIManage.length; m++){
                batchRequests.push({
                    "url": "/p/" + contentIManage[m]["_path"],
                    "method": "POST",
                    "parameters": {
                        ":operation": "delete"
                    }
                });
            }
            sakai.api.Server.batch(batchRequests, function (success, data) {
                if (success) {
                    sakai.api.Util.notification.show($("#deletecontent_message_title").html(), $("#deletecontent_message_from_system").html());
                } else {
                    sakai.api.Util.error.show($("#deletecontent_message_title").html(), $("#deletecontent_message_error").html()); 
                }
                $(window).trigger("done.deletecontent.sakai");
                if (callback && typeof(callback) === "function") {
                    callback(success);
                }
                $deletecontent_dialog.jqmHide();
            });
        };

        /**
         * Remove the selected items from the current library only and keep them onto the
         * system.
         */
        var removeFromLibrary = function(){
            var batchRequests = [];
            // Remove for content I'm viewer of
            for (var v = 0; v < contentIView.length; v++){
                batchRequests.push({
                    "url": "/p/" + contentIView[v]["_path"] + ".members.json",
                    "method": "POST",
                    "parameters": {
                        ":viewer@Delete": context
                    }
                });
            }
            // Remove for content I'm a manager of
            for (var m = 0; m < contentIManage.length; m++){
                batchRequests.push({
                    "url": "/p/" + contentIManage[m]["_path"] + ".members.json",
                    "method": "POST",
                    "parameters": {
                        ":manager@Delete": context
                    }
                });
            }
            sakai.api.Server.batch(batchRequests, function (success, data) {
                if (success) {
                    sakai.api.Util.notification.show($("#deletecontent_message_title").html(), $("#deletecontent_message_from_library").html());
                } else {
                    sakai.api.Util.error.show($("#deletecontent_message_title").html(), $("#deletecontent_message_error").html()); 
                }
                $(window).trigger("done.deletecontent.sakai");
                if (callback && typeof(callback) === "function") {
                    callback(success);
                }
                $deletecontent_dialog.jqmHide();
            });
        };

        ///////////////////
        // Overlay setup //
        ///////////////////

        var hideButtons = function(){
            $("#deletecontent_action_removefromsystem").hide();
            $("#deletecontent_action_removefromlibrary").hide();
            $("#deletecontent_action_apply").hide();
        };

        /**
         * Set up the delete overlay depending on the permissions I have on the content
         * about to be deleted from the overlay
         * There are 3 scenarios:
         * 1. I am a manager of some items and a viewer of others
         * 2. I am a manager of all items
         * 3. I am a viewer of all items
         * @param {Object} contentIManage    Array that contains all files about to be
         *                                   removed from the library that I manage
         * @param {Object} contentIView      Array that contains all files about to be
         *                                   removed from the library that I'm a viewer of
         */
        var setupOverlay = function(contentIManage, contentIView){
            hideButtons();
            var template = "";
            if (contentIManage.length > 0 && contentIView.length > 0){
                // Set up overlay for mixed permissions
                template = "deletecontent_template_hybrid";
                $("#deletecontent_action_apply").show();
            } else if (contentIManage.length > 0){
                // Set up overlay for full management permissions
                template = "deletecontent_template_list";
                $("#deletecontent_action_removefromsystem").show();
                $("#deletecontent_action_removefromlibrary").show();
            } else if (contentIView.length > 0){
                // Set up overlay for full viewer permissions
                template = "deletecontent_template_list";
                $("#deletecontent_action_removefromlibrary").show();
            }
            $("#deletecontent_container").html(sakai.api.Util.TemplateRenderer(template, {
                "contentIManage": contentIManage,
                "contentIView": contentIView,
                "sakai": sakai
            }));
        };

        /**
         * Run over the list of content items to delete and determine whether there
         * any that I manage and can thus remove from the system
         * @param {Object} contentList    Response from batch request that retrieved
         *                                metadata for all content that need to be deleted
         */
        var findContentIManage = function(contentList){
            contentIManage = []; 
            contentIView = [];
            $.each(contentList.results, function (i, contentItem) {
                var content = $.parseJSON(contentItem.body);
                var manage = sakai.api.Content.isUserAManager(content, sakai.data.me);
                if (manage){
                    contentIManage.push(content);
                } else {
                    contentIView.push(content);
                }
            });
            setupOverlay(contentIManage, contentIView);
        };

        /**
         * Retrieve the metadata of all selected files
         * @param {Object} paths    Array that contains the paths to all
         *                          content that needs to be deleted
         */
        var getContentInfo = function(paths){
            var batchRequest = [];
            $.each(paths, function (i, url) {
                batchRequest.push({
                    url: "/p/" + url + ".json",
                    method: "GET"
                });
            });
            sakai.api.Server.batch(batchRequest, function (success, data) {
                if (success) {
                    findContentIManage(data);
                }
            });
        };

        ////////////////////
        // Initialisation //
        ////////////////////

        /**
         * Load the delete content widget with the appropriate data
         * This function can be called from anywhere within Sakai by triggering the
         * 'init.deletecontent.sakai' event
         *
         * @param {Object} data A JSON object containing the necessary information.
         *
         * @example To delete one item:
         *     $(window).trigger('init.deletecontent.sakai', [{
         *         "path": [ "/test.jpg" ]
         *     }, callbackFn]);  // callbackFn is sent one param: success (true if delete succeeded, false otherwise)
         *
         * @example To delete multiple items:
         *     $(window).trigger('init.deletecontent.sakai', [{
         *         "path": [ "/file1.ext", "/file2.ext", "/file3.ext", "/file4.ext" ]
         *     }, callbackFn]);  // callbackFn is sent one param: success (true if delete succeeded, false otherwise)
         */
        var load = function(ev, data, _callback){
            context = data.context || sakai.data.me.user.userid;
            callback = _callback;
            getContentInfo(data.path);
            $("#deletecontent_form").html("");
            $deletecontent_dialog.css("top", (50 + $(window).scrollTop()) + "px");
            $deletecontent_dialog.jqmShow();
        };

        /**
         * Initialize the delete content widget
         * All the functionality in here is loaded before the widget is actually rendered
         */
        var init = function(){
            // This will make the widget popup as a layover.
            $deletecontent_dialog.jqm({
                modal: true,
                toTop: true
            });
        };

        ////////////////////////////
        // Internal event binding //
        ////////////////////////////

        $("#deletecontent_action_removefromlibrary").bind("click", removeFromLibrary);
        $("#deletecontent_action_removefromsystem").bind("click", removeFromSystem);
        $("#deletecontent_action_apply").bind("click", removeHybrid);

        ////////////////////////////
        // External event binding //
        ////////////////////////////

        $(window).bind("init.deletecontent.sakai", load);

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("deletecontent");
});
