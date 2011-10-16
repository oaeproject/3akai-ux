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


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var deletedata = {};


        ///////////////////
        // CSS Selectors //
        ///////////////////

        var $rootel = $("#" + tuid);

        var $deletecontent_action_delete = $("#deletecontent_action_delete", $rootel);
        var $deletecontent_dialog = $("#deletecontent_dialog", $rootel);
        var $deletecontent_error_couldnotdelete = $("#deletecontent_error_couldnotdelete", $rootel);
        var $deletecontent_form = $("#deletecontent_form", $rootel);
        var $deletecontent_form_heading = $("h4:eq(0)", $deletecontent_form);
        var $deletecontent_form_note = $("span:eq(0)", $deletecontent_form);

        // Messages
        var $deletecontent_not_successfully_deleted = $("#deletecontent_not_successfully_deleted", $rootel);
        var $deletecontent_successfully_deleted = $("#deletecontent_successfully_deleted", $rootel);
        var $deletecontent_deleted = $("#deletecontent_deleted", $rootel);
        var $deletecontent_not_deleted = $("#deletecontent_not_deleted", $rootel);


        /////////////
        // Binding //
        /////////////

        /**
         * Add binding to the various element in the delete content widget
         */
        var addBinding = function(callback){

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
        };

        /**
         * Run over the list of content items to delete and determine whether there
         * any that I manage and can thus remove from the system
         * @param {Object} contentList    Response from batch request that retrieved
         *                                metadata for all content that need to be deleted
         */
        var findContentIManage = function(contentList){
            var contentIManage = [], 
                contentIView = [];
            $.each(contentList, function (i, contentItem) {
                var content = $.parseJSON(contentItem.body);
                var manage = false;
                if (content["sakai:pooled-content-manager"]){
                    for (var m = 0; m < content["sakai:pooled-content-manager"].length; m++){
                        if (item["sakai:pooled-content-manager"][m] === mylibrary.contextId){
                            canDelete = true;
                        }
                    }
                }
                if (manage){
                    contentIManage.push(content);
                } else {
                    contentIView.push(content);
                }
            });
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
                    url: url + ".json",
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
         *         "path": "/test.jpg"
         *     }, callbackFn]);  // callbackFn is sent one param: success (true if delete succeeded, false otherwise)
         *
         * @example To delete multiple items:
         *     $(window).trigger('init.deletecontent.sakai', [{
         *         "path": [ "/file1.ext", "/file2.ext", "/file3.ext", "/file4.ext" ]
         *     }, callbackFn]);  // callbackFn is sent one param: success (true if delete succeeded, false otherwise)
         */
        var load = function(data, callback){
            deletedata = $.extend(true, {}, data);
            addBinding(callback);

            // STEP2: Is there an item I own/the group owns
            // STEP3: If not, just remove from the library
            // STEP3A: Single item
            // STEP3B: Mutliple items
            // STEP4: If so, remove from system or remove fron library
            // STEP4A: Used by others
            // STEP4B: Not used by others
            
            var paths = deletedata.path;
            if (deletedata.path && typeof(deletedata.path) !== "object") {
                paths = [];
                paths.push(deletedata.path);
            }
            getContentInfo(paths);
            $("#deletecontent_form", $rootel).html("");
            $deletecontent_dialog.jqmShow();
            
        };
        $(window).bind("init.deletecontent.sakai", function (e, data, callback) {
            load(data, callback);
        });

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

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("deletecontent");
});
