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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.content_profile = function(){

        var content_path = ""; // The current path of the content
        var ready_event_fired = 0;
        var list_event_fired = false;


        ///////////////////////////////
        // PRIVATE UTILITY FUNCTIONS //
        ///////////////////////////////

        /**
         * Load the content profile for the current content path
         */
        var loadContentProfile = function(callback){

           sakai.api.Content.loadContentProfile(content_path, function(success, data) {
                if (success) {
                    sakai_global.content_profile.content_data = data;
                    $(window).trigger("ready.contentprofile.sakai");
                    if ($.isFunction(callback)) {
                        callback(true);
                    }
                } else {
                    switch (data.error) {
                        case (404):
                            sakai.api.Security.send404();
                            break;
                        case (403):
                            sakai.api.Security.send403();
                            break;
                    }
                }
            });
        };

        $(window).bind("load.content_profile.sakai", function(e, callback) {
            loadContentProfile(callback);
        });

        var handleHashChange = function() {
            content_path = $.bbq.getState("content_path") || "";
            loadContentProfile(function() {
                // The request was successful so initialise the entity widget
                if (sakai_global.entity && sakai_global.entity.isReady) {
                    $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                } else {
                    $(window).bind("ready.entity.sakai", function(e){
                        $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                        ready_event_fired++;
                    });
                }
                // The request was successful so initialise the relatedcontent widget
                if (sakai_global.relatedcontent && sakai_global.relatedcontent.isReady) {
                    $(window).trigger("render.relatedcontent.sakai", sakai_global.content_profile.content_data);
                } else {
                    $(window).bind("ready.relatedcontent.sakai", function(e){
                        $(window).trigger("render.relatedcontent.sakai", sakai_global.content_profile.content_data);
                        ready_event_fired++;
                    });
                }
                // The request was successful so initialise the relatedcontent widget
                if (sakai_global.contentpreview && sakai_global.contentpreview.isReady) {
                    $(window).trigger("start.contentpreview.sakai");
                } else {
                    $(window).bind("ready.contentpreview.sakai", function(e){
                        $(window).trigger("start.contentpreview.sakai");
                        ready_event_fired++;
                    });
                }
                // The request was successful so initialise the metadata widget
                if (sakai_global.contentmetadata && sakai_global.contentmetadata.isReady) {
                    $(window).trigger("render.contentmetadata.sakai");
                } else {
                    $(window).bind("ready.contentmetadata.sakai", function(e){
                        $(window).trigger("render.contentmetadata.sakai");
                        ready_event_fired++;
                    });
                }

                sakai.api.Security.showPage();

                // rerender comments widget
                $(window).trigger("content_profile_hash_change");
            });
        };

        /**
         * addRemoveUsers users
         * Function that adds or removes selected users to/from the content
         * @param {String} tuid Identifier for the widget/type of user we're adding (viewer or manager)
         * @param {Object} users List of users we're adding/removing
         * @param {String} task Operation of either adding or removing
         * @param {Array} Array containg user ID's and names that can be displayed on the UI
         */
        var addRemoveUsers = function(tuid, users, task){
            var notificationType = sakai.api.Security.saneHTML($("#content_profile_viewers_text").text());
            var reqData = [];
            $.each(users.toAdd, function(index, user){
                // set the default data value to tuid=='viewer' and task=='add'
                var data = {
                    ":viewer": user
                };
                if (sakai.api.Content.isUserAManager(sakai_global.content_profile.content_data, user)) {
                    data = {
                        ":viewer": user,
                        ":manager@Delete": user
                    };
                }
                if (tuid === 'managers' && task === 'add') {
                    notificationType = sakai.api.Security.saneHTML($("#content_profile_managers_text").text());
                    if (sakai.api.Content.isUserAViewer(sakai_global.content_profile.content_data, user)) {
                        data = {
                            ":manager": user,
                            ":viewer@Delete": user
                        };
                    } else {
                        data = {
                            ":manager": user
                        };
                    }
                }
                else {
                    if (task === 'remove') {
                        if (user['userid']) {
                            user = user['userid'];
                        }
                        else {
                            if (user['sakai:group-id']) {
                                user = user['sakai:group-id'];
                            }
                            else {
                                if (user['rep:userId']) {
                                    user = user['rep:userId'];
                                }
                            }
                        }
                        data = {
                            ":viewer@Delete": user
                        };
                        if (tuid === 'managers') {
                            notificationType = sakai.api.Security.saneHTML($("#content_profile_managers_text").text());
                            data = {
                                ":manager@Delete": user
                            };
                        }
                    }
                }
                if (user) {
                    reqData.push({
                        "url": content_path + ".members.json",
                        "method": "POST",
                        "parameters": data
                    });
                }
            });

            if (reqData.length > 0) {
                // batch request to update user access for the content
                $.ajax({
                    url: sakai.config.URL.BATCH,
                    traditional: true,
                    type: "POST",
                    data: {
                        requests: $.toJSON(reqData)
                    },
                    success: function(data){
                        if (task === 'add') {
                            sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#content_profile_text").text()), sakai.api.Security.saneHTML($("#content_profile_users_added_text").text()) + " " + users.toAddNames.toString().replace(/,/g, ", "));
                            loadContentProfile(function(){
                                $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                            });
                            // record that user shared content
                            sakai.api.User.addUserProgress("sharedContent");
                        }
                        else {
                            sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#content_profile_text").text()), sakai.api.Security.saneHTML($("#content_profile_users_removed_text").text()) + " " + users.toAddNames.toString().replace(/,/g, ", "));
                        }
                    }
                });
            }
        };

        /**
         * Checks if user is in the share content tour and displays tooltips
         */
        var checkShareContentTour = function(){
            var querystring = new Querystring();
            if (querystring.contains("sharecontenttour") && querystring.get("sharecontenttour") === "true") {
                // display tooltip
                var tooltipData = {
                    "tooltipSelector":"#entity_content_share_button",
                    "tooltipTitle":"TOOLTIP_SHARE_CONTENT",
                    "tooltipDescription":"TOOLTIP_SHARE_CONTENT_P3",
                    "tooltipArrow":"top",
                    "tooltipLeft":30
                };
                if (!sakai.tooltip || !sakai.tooltip.isReady) {
                    $(window).bind("ready.tooltip.sakai", function() {
                        $(window).trigger("init.tooltip.sakai", tooltipData);
                    });
                } else {
                    $(window).trigger("init.tooltip.sakai", tooltipData);
                }
            }
        };

        $(window).bind("finished.sharecontent.sakai", function(e, peopleList){
            if(!peopleList.mode || peopleList.mode === undefined){
                peopleList.mode = "viewers";
            }
            addRemoveUsers(peopleList.mode, peopleList, 'add');
        });


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

            // check for share content tour in progress
            checkShareContentTour();
        };

        // Initialise the content profile page
        init();

    };

    sakai.api.Widgets.Container.registerForLoad("content_profile");
});
