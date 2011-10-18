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

        /**
         * Add binding to the various element in the delete content widget
         */
       /* var addBinding = function(callback){

            // Reinitialise the jQuery selector
            $deletecontent_action_delete = $($deletecontent_action_delete.selector);

            // Add binding to the delete button
            $deletecontent_action_delete.unbind("click").bind("click", function () {
                var batchRequests = [];
                if (deletedata.path && typeof(deletedata.path) === "string") {
                    batchRequests.push({
                        url: deletedata.path,
                        method: "POST",
                        parameters: {":operation" : "delete"}
                    });
                } else if (deletedata.path && typeof(deletedata.path) === "object" && deletedata.path.length) {
                    $.each(deletedata.path, function (i, url) {
                        batchRequests.push({
                            url: url,
                            method: "POST",
                            parameters: {":operation" : "delete"}
                        });
                    });
                }
                sakai.api.Server.batch(batchRequests, function (success, data) {
                    if (success) {
                        if (typeof(deletedata.path) === "string" || deletedata.path.length === 1) {
                            sakai.api.Util.notification.show($deletecontent_deleted.html(),
                                $deletecontent_successfully_deleted.html());
                        } else {
                            sakai.api.Util.notification.show($deletecontent_deleted.html(),
                                sakai.api.i18n.getValueForKey("ITEMS_SUCCESSFULLY_DELETED", "deletecontent"));
                        }
                        if (callback && typeof(callback) === "function") {
                            callback(true);
                        }
                    } else {
                        if (typeof(deletedata.path) === "string" || deletedata.path.length === 1) {
                            sakai.api.Util.notification.show($deletecontent_not_deleted.html(),
                                $deletecontent_not_successfully_deleted.html());
                        } else {
                            sakai.api.Util.notification.show($deletecontent_not_deleted.html(),
                                sakai.api.i18n.getValueForKey("ITEMS_NOT_SUCCESSFULLY_DELETED", "deletecontent"));
                        }
                        if (callback && typeof(callback) === "function") {
                            callback(false);
                        }
                    }
                });
                $(window).trigger("done.deletecontent.sakai", [deletedata]);
                $deletecontent_dialog.jqmHide();
                return false;
            });
            
                if (manager) {
                    userToDelete = {
                        "url": "/p/" + sakai_global.content_profile.content_data.data["_path"] + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":manager@Delete": userid
                        }
                    };
                    numberOfManagersToDelete++;
                }else{
                    userToDelete = {
                        "url": "/p/" + sakai_global.content_profile.content_data.data["_path"] + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":viewer@Delete": userid
                        }
                    };
                }
            
        }; */

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
            var template = "";
            if (contentIManage.length > 0 && contentIView.lenght > 0){
                // Set up overlay for mixed permissions
            } else if (contentIManage.length > 0){
                // Set up overlay for full management permissions
            } else if (contentIView.length > 0){
                // Set up overlay for full viewer permissions
                template = "deletecontent_template_view_all";
            }
            $("#deletecontent_container").html(sakai.api.Util.TemplateRenderer(template, {
                "contentIManage": contentIManage,
                "contentIView": contentIView
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
            $("#deletecontent_form", $rootel).html("");
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

        $("#deletecontent_action_removefromlibrary").live("click", removeFromLibrary);

        ////////////////////////////
        // External event binding //
        ////////////////////////////

        $(window).bind("init.deletecontent.sakai", load);

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("deletecontent");
});
