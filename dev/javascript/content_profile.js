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
        var tooltip_opened = false;


        ///////////////////////////////
        // PRIVATE UTILITY FUNCTIONS //
        ///////////////////////////////

        /**
         * Load the content profile for the current content path
         */
        var loadContentProfile = function(callback){
            // Check whether there is actually a content path in the URL

            // http://localhost:8080/p/YjsKgQ8wNtTga1qadZwjQCe.2.json
            // http://localhost:8080/p/YjsKgQ8wNtTga1qadZwjQCe.members.json
            // http://localhost:8080/var/search/pool/activityfeed.json?p=/p/YjsKgQ8wNtTga1qadZwjQCe&items=1000

            if (content_path) {

                // Get the content information, the members and managers and version information
                var batchRequests = [
                    {
                        "url": content_path + ".2.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": content_path + ".members.detailed.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": content_path + ".versions.json",
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    },
                    {
                        "url": sakai.config.URL.POOLED_CONTENT_ACTIVITY_FEED + "?p=" + content_path,
                        "method":"GET",
                        "cache":false,
                        "dataType":"json"
                    }
                ];

                var contentInfo = false;
                var contentMembers = false;
                var contentActivity = false;
                var versionInfo = false;

                // temporary request that returns data
                $.ajax({
                    url: sakai.config.URL.POOLED_CONTENT_ACTIVITY_FEED + "?p=" + content_path  + "&items=1000",
                    type: "GET",
                    "async":false,
                    "cache":false,
                    "dataType":"json",
                    success: function(data){
                        if (data.results.hasOwnProperty(0)) {
                            contentActivity = data;
                        }
                    }
                });

                $.ajax({
                    url: sakai.config.URL.BATCH,
                    type: "POST",
                    data: {
                        requests: $.toJSON(batchRequests)
                    },
                    success: function(data){

                        if (data.results.hasOwnProperty(0)) {
                            if (data.results[0].status === 404){
                                sakai.api.Security.send404();
                                return;
                            } else if (data.results[0].stats === 403){
                                sakai.api.Security.send403();
                                return;
                            } else {
                                contentInfo = $.parseJSON(data.results[0].body);
                            }
                        }

                        if (data.results.hasOwnProperty(1)) {
                            contentMembers = $.parseJSON(data.results[1].body);
                            contentMembers.viewers = contentMembers.viewers || {};
                            $.each(contentMembers.viewers, function(index, resultObject) {
                                contentMembers.viewers[index].picture = $.parseJSON(contentMembers.viewers[index].picture);
                            });
                            contentMembers.managers = contentMembers.managers || {};
                            $.each(contentMembers.managers, function(index, resultObject) {
                                contentMembers.managers[index].picture = $.parseJSON(contentMembers.managers[index].picture);
                            });
                        }

                        if (data.results.hasOwnProperty(2)) {
                            versionInfo =$.parseJSON(data.results[2].body);
                            var versions = [];
                            for (var i in versionInfo.versions) {
                                if(versionInfo.versions.hasOwnProperty(i)){
                                    var splitDate = versionInfo.versions[i]["created"];
                                    versionInfo.versions[i]["created"] = sakai.api.l10n.transformDate(new Date(splitDate));
                                    versions.push(versionInfo.versions[i]);
                                }
                            }
                            versionInfo.versions = versions.reverse();
                        }

                        var manager = false;
                        var anon = true;
                        var groups = [];
                        if (!sakai.data.me.user.anon){
                            for (var ii in contentMembers.managers) {
                                if (contentMembers.managers.hasOwnProperty(ii)) {
                                    if (contentMembers.managers[ii].hasOwnProperty("rep:userId")) {
                                        if (contentMembers.managers[ii]["rep:userId"] === sakai.data.me.user.userid) {
                                            manager = true;
                                        }
                                    } else if (contentMembers.managers[ii].hasOwnProperty("sakai:group-id")) {
                                        if (sakai.api.Groups.isCurrentUserAMember(
                                            contentMembers.managers[ii]["sakai:group-id"],
                                            sakai.data.me)) {
                                            manager = true;
                                        }
                                    }
                                }
                            }
                        }

                        var directory = [];
                        // When only one tag is put in this will not be an array but a string
                        // We need an array to parse and display the results
                        if (contentInfo && contentInfo['sakai:tags']) {
                            directory = sakai.api.Util.getDirectoryTags(contentInfo["sakai:tags"].toString());
                        }

                        var fullPath = content_path + "/" + contentInfo["sakai:pooled-content-file-name"];
                        if (contentInfo["sakai:pooled-content-file-name"].substring(contentInfo["sakai:pooled-content-file-name"].lastIndexOf("."), contentInfo["sakai:pooled-content-file-name"].length) !== contentInfo["sakai:fileextension"]) {
                            fullPath += contentInfo["sakai:fileextension"];
                        }

                        // filter out the the everyone group and the anonymous user
                        contentMembers.viewers = $.grep(contentMembers.viewers, function(resultObject, index){
                            if (resultObject['sakai:group-id'] !== 'everyone' &&
                                resultObject['rep:userId'] !== 'anonymous') {
                                return true;
                            }
                            return false;
                        });

                        json = {
                            data: contentInfo,
                            members: contentMembers,
                            activity: contentActivity,
                            mode: "content",
                            url: sakai.config.SakaiDomain + fullPath,
                            path: fullPath,
                            saveddirectory : directory,
                            versions : versionInfo,
                            anon: anon,
                            isManager: manager
                        };

                        sakai_global.content_profile.content_data = json;
                        $(window).trigger("ready.contentprofile.sakai");
                        if ($.isFunction(callback)) {
                            callback(true);
                        }
                    }
                });

            } else {
                sakai.api.Security.send404();
            }
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
            if (querystring.contains("sharecontenttour") && querystring.get("sharecontenttour") === "true" && !tooltip_opened) {
                tooltip_opened = true;
                // display tooltip
                var tooltipData = {
                    "tooltipSelector":"#navigation_my_sakai_link",
                    "tooltipTitle":"TOOLTIP_SHARE_CONTENT",
                    "tooltipDescription":"TOOLTIP_SHARE_CONTENT_P3",
                    "tooltipArrow":"top",
                    "tooltipLeft":810,
                    "tooltipTop":100
                };
                if (!sakai_global.tooltip || !sakai_global.tooltip.isReady) {
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

            if (sakai_global.entity && sakai_global.entity.isRendered) {
                // check for share content tour in progress
                setTimeout(function() {checkShareContentTour();}, 1000);
            } else {
                $(window).bind("rendered.entity.sakai", function(){
                    // check for share content tour in progress
                    setTimeout(function() {checkShareContentTour();}, 1000);
                });
            }
        };

        // Initialise the content profile page
        init();

    };

    sakai.api.Widgets.Container.registerForLoad("content_profile");
});
