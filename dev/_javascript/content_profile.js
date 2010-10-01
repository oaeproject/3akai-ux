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
/*global $, fluid, window */

var sakai = sakai || {};

sakai.content_profile = sakai.content_profile || {};
sakai.content_profile.content_data = sakai.content_profile.content_data || {};

sakai.content_profile = function(){


    //////////////////////
    // Config variables //
    //////////////////////

    var content_path = ""; // The current path of the content
    var globalJSON;
    var ready_event_fired = 0;
    var list_event_fired = false;


    ///////////////////
    // CSS Selectors //
    ///////////////////

    var $content_profile_error_container = $("#content_profile_error_container");
    var $content_profile_error_container_template = $("#content_profile_error_container_template");


    //////////////////////////
    // Global functionality //
    //////////////////////////

    /**
     * Show a general error message to the user
     * @param {String} error
     * A key for an error message - we use the key and not the text for i18n
     */
    var showError = function(error){
        $.TemplateRenderer($content_profile_error_container_template, {"error": error}, $content_profile_error_container);
    };

    /**
     * Load the content profile for the current content path
     */
    sakai.content_profile.loadContentProfile = function(callback){
        // Check whether there is actually a content path in the URL
        if (content_path) {
            $.ajax({
                url: sakai.config.SakaiDomain + content_path + ".2.json",
                success: function(data){

                    var directory = [];
                    currentTags = data["sakai:tags"];
                    $(data["sakai:tags"]).each(function(i){
                        var splitDir = data["sakai:tags"][i].split("/");
                        if(splitDir[0] === "directory"){
                            var item = [];
                            for(var j in splitDir){
                                if (splitDir[j] !== "directory") {
                                    item.push(splitDir[j]);
                                }
                            }
                            directory.push(item);
                        }
                    });

                    json = {
                        data: data,
                        mode: "content",
                        url: sakai.config.SakaiDomain + content_path,
                        contentpath: content_path,
                        path: content_path,
                        saveddirectory : directory
                    };

                    sakai.content_profile.content_data = json;
                    $(window).trigger("sakai-contentprofile-ready");
                    if ($.isFunction(callback)) {
                        callback(true);
                    }
                },
                error: function(xhr, textStatus, thrownError){

                    if (xhr.status === 401 || xhr.status === 403){
                        sakai.api.Security.send403();
                    } else {
                        sakai.api.Security.send404();
                    }
                    if ($.isFunction(callback)) {
                        callback(false);
                    }

                }
            });

        } else {

            sakai.api.Security.send404();

        }

    };

    /**
     * Load the content authorizables who have access to the content
     */
    var loadContentUsers = function(tuid){
        // Check whether there is actually a content path in the URL
        if (content_path) {
            var pl_config = {"selectable":true, "subNameInfoUser": "", "subNameInfoGroup": "sakai:group-description", "sortOn": "lastName", "sortOrder": "ascending", "items": 50 };
            var url = sakai.config.SakaiDomain + content_path + ".members.detailed.json";
            $("#content_profile_listpeople_container").show();
            $(window).trigger("sakai-listpeople-render", {"tuid": tuid, "pl_config": pl_config, "url": url, "id": content_path});
        }
    };

    /**
     * addRemoveUsers users
     * Function that adds or removes selected users to/from the content
     * @param {String} tuid Identifier for the widget/type of user we're adding (viewer or manager)
     * @param {Object} users List of users we're adding/removing
     * @param {String} task Operation of either adding or removing
     */
    var addRemoveUsers = function(tuid, users, task) {
        var userCount = 0;
        var notificationType = sakai.api.Security.saneHTML($("#content_profile_viewers_text").text())

        $.each(users, function(index, user) {
            var data = {
                "_charset_":"utf-8",
                ":viewer": user
            };
            if (tuid === 'managers' && task === 'add') {
                notificationType = sakai.api.Security.saneHTML($("#content_profile_managers_text").text())
                data = {
                    "_charset_":"utf-8",
                    ":manager": user
                };
            } else if (task === 'remove') {
                if (user['userid']) {
                    user = user['userid'];
                } else if (user['groupid']) {
                    user = user['groupid'];
                } else if (user['rep:userId']) {
                    user = user['rep:userId'];
                }
                data = {
                    "_charset_":"utf-8",
                    ":viewer@Delete": user
                };
                if (tuid === 'managers') {
                    notificationType = sakai.api.Security.saneHTML($("#content_profile_managers_text").text())
                    data = {
                        "_charset_":"utf-8",
                        ":manager@Delete": user
                    };
                }
            }
            if (user) {
                // update user access for the content
                $.ajax({
                    url: content_path + ".members.json",
                    async: false,
                    data: data,
                    type: "POST",
                    success: function(data){
                        userCount++;
                    }
                });
            }
        });

        if (userCount > 0) {
            loadContentUsers(tuid);
            if (task === 'add') {
                sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#content_profile_text").text()), sakai.api.Security.saneHTML($("#content_profile_users_added_text").text() + " " + notificationType));
            } else {
                sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#content_profile_text").text()), sakai.api.Security.saneHTML($("#content_profile_users_removed_text").text() + " " + notificationType));
            }
        }
        $("#content_profile_add_" + tuid).focus();
    };


    ///////////////////////
    // BINDING FUNCTIONS //
    ///////////////////////

    /**
     * Add binding to list elements on the page
     */
    var addListBinding = function(){
        if (sakai.listpeople && sakai.listpeople.isReady) {
            loadContentUsers("viewers");
            loadContentUsers("managers");
        } else {
            $(window).bind("sakai-listpeople-ready", function(e, tuid){
                loadContentUsers(tuid);
            });
        }


        // Bind the remove viewers button
        $("#content_profile_remove_viewers").bind("click", function(){
            addRemoveUsers('viewers', sakai.listpeople.data["viewers"]["selected"], 'remove');
        });

        // Bind the remove managers button
        $("#content_profile_remove_managers").bind("click", function(){
            addRemoveUsers('managers', sakai.listpeople.data["managers"]["selected"], 'remove');
        });

        if (sakai.pickeruser && sakai.pickeruser.isReady) {
            doPickerUserBindings();
        } else {
            // Add binding to the pickeruser widget buttons for adding users
            $(window).bind("sakai-pickeruser-ready", function(e){
                doPickerUserBindings();
            });
        }
    };

    var doPickerUserBindings = function() {
        var pl_config = {
            "mode": "search",
            "selectable":true,
            "subNameInfo": "email",
            "sortOn": "lastName",
            "items": 50,
            "type": "people",
            "what": "Viewers",
            "where": 'Content'
        };

        // Bind the add viewers button
        $("#content_profile_add_viewers").bind("click", function(){
            $(window).scrollTop(0);
            pl_config.what = "Viewers";
            $(window).trigger("sakai-pickeruser-init", pl_config, function(people) {
            });
            $(window).unbind("sakai-pickeruser-finished");
            $(window).bind("sakai-pickeruser-finished", function(e, peopleList) {
                addRemoveUsers('viewers', peopleList.toAdd, 'add');
            });
        });

        // Bind the add managers button
        $("#content_profile_add_managers").bind("click", function(){
            $(window).scrollTop(0);
            pl_config.what = "Managers";
            $(window).trigger("sakai-pickeruser-init", pl_config, function(people) {
            });
            $(window).unbind("sakai-pickeruser-finished");
            $(window).bind("sakai-pickeruser-finished", function(e, peopleList) {
                addRemoveUsers('managers', peopleList.toAdd, 'add');
            });
        });
    };

    var handleHashChange = function() {
        content_path = $.bbq.getState("content_path") || "";
        sakai.content_profile.loadContentProfile(function() {
            // The request was successful so initialise the entity widget
            if (sakai.entity && sakai.entity.isReady) {
                sakai.api.UI.entity.render("content", sakai.content_profile.content_data);
            }
            else {
                $(window).bind("sakai.api.UI.entity.ready", function(e){
                    sakai.api.UI.entity.render("content", sakai.content_profile.content_data);
                    ready_event_fired++;
                });
            }

            if (!list_event_fired) {
                // add binding to listpeople widget and buttons
                addListBinding();
                list_event_fired = true;
            } else {
                loadContentUsers("viewers");
                loadContentUsers("managers");
            }
            sakai.api.Security.showPage();

        });
    };

    ////////////////////
    // Initialisation //
    ////////////////////

    /**
     * Initialise the content profile page
     */
    var init = function(){
        // Bind an event to window.onhashchange that, when the history state changes,
        // loads all the information for the current resource
        $(window).bind('hashchange', function(){
            handleHashChange();
        });
        handleHashChange();
    };

    // Initialise the content profile page
    init();

};

sakai.api.Widgets.Container.registerForLoad("sakai.content_profile");