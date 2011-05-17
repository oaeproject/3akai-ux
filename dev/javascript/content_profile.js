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

        var previous_content_path = false;
        var content_path = ""; // The current path of the content
        var ready_event_fired = 0;
        var list_event_fired = false;
        var tooltip_opened = false;
        var intervalId;

        var showPreview = true;

        ///////////////////////////////
        // PRIVATE UTILITY FUNCTIONS //
        ///////////////////////////////

        /**
         * Load the content profile for the current content path
         * @param {Boolean} ignoreActivity Flag to also update activity data or not
         */
        var loadContentProfile = function(callback, ignoreActivity){
            // Check whether there is actually a content path in the URL

            // http://localhost:8080/p/YjsKgQ8wNtTga1qadZwjQCe.2.json
            // http://localhost:8080/p/YjsKgQ8wNtTga1qadZwjQCe.members.json
            // http://localhost:8080/var/search/pool/activityfeed.json?p=/p/YjsKgQ8wNtTga1qadZwjQCe&items=1000

            if (content_path && document.location.pathname === "/content"){
                document.location = "/dev/content_profile2.html#p=" + content_path.replace("/p/","");
                return;            
            }  
            
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
                        "url": content_path + ".members.json",
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
                        "url": sakai.config.URL.POOLED_CONTENT_ACTIVITY_FEED,
                        "method":"GET",
                        "cache":false,
                        "dataType":"json",
                        "parameters":{"p":content_path, "items":"1000"}
                    }
                ];

                var contentInfo = false;
                var contentMembers = false;
                var contentActivity = false;
                var versionInfo = false;

                // temporary request that returns data KERN-1768
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

                sakai.api.Server.batch(batchRequests, function(success, data) {
                    if (success) {
                        if (data.results.hasOwnProperty(0)) {
                            if (data.results[0]["status"] === 404){
                                sakai.api.Security.send404();
                                return;
                            } else if (data.results[0]["status"] === 403){
                                sakai.api.Security.send403();
                                return;
                            } else {
                                contentInfo = $.parseJSON(data.results[0].body);
                                if (contentInfo["sakai:custom-mimetype"] && contentInfo["sakai:custom-mimetype"] === "x-sakai/document"){
                                    showPreview = false;
                                } else {
                                    switchToOneColumnLayout(false);
                                }
                            }
                        }

                        if (data.results.hasOwnProperty(1)) {
                            contentMembers = $.parseJSON(data.results[1].body);
                            contentMembers.viewers = contentMembers.viewers || {};
                            $.each(contentMembers.viewers, function(index, resultObject) {
                                if (contentMembers.viewers[index].hasOwnProperty("basic") &&
                                    contentMembers.viewers[index].basic.hasOwnProperty("elements") &&
                                    contentMembers.viewers[index].basic.elements.hasOwnProperty("picture") &&
                                    contentMembers.viewers[index].basic.elements.picture.hasOwnProperty("value")) {
                                        contentMembers.viewers[index].picture = $.parseJSON(contentMembers.viewers[index].basic.elements.picture.value);
                                }
                            });
                            contentMembers.managers = contentMembers.managers || {};
                            $.each(contentMembers.managers, function(index, resultObject) {
                                if (contentMembers.managers[index].hasOwnProperty("basic") &&
                                    contentMembers.managers[index].basic.hasOwnProperty("elements") &&
                                    contentMembers.managers[index].basic.elements.hasOwnProperty("picture") &&
                                    contentMembers.managers[index].basic.elements.picture.hasOwnProperty("value")) {
                                        contentMembers.managers[index].picture = $.parseJSON(contentMembers.managers[index].basic.elements.picture.value);
                                }
                            });
                        }

                        if (data.results.hasOwnProperty(2)) {
                            versionInfo =$.parseJSON(data.results[2].body);
                            var versions = [];
                            for (var i in versionInfo.versions) {
                                if(versionInfo.versions.hasOwnProperty(i)){
                                    var splitDate = versionInfo.versions[i]["_created"];
                                    versionInfo.versions[i]["_created"] = sakai.api.l10n.transformDate(new Date(splitDate));
                                    versions.push(versionInfo.versions[i]);
                                }
                            }
                            versionInfo.versions = versions.reverse();
                        }

                        var manager = false;
                        var viewer = false;
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
                            for (var jj in contentMembers.viewers) {
                                if (contentMembers.viewers.hasOwnProperty(jj)) {
                                    if (contentMembers.viewers[jj].hasOwnProperty("rep:userId")) {
                                        if (contentMembers.viewers[jj]["rep:userId"] === sakai.data.me.user.userid) {
                                            viewer = true;
                                        }
                                    } else if (contentMembers.viewers[jj].hasOwnProperty("sakai:group-id")) {
                                        if (sakai.api.Groups.isCurrentUserAMember(
                                            contentMembers.viewers[jj]["sakai:group-id"],
                                            sakai.data.me)) {
                                            viewer = true;
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

                        var fullPath = content_path + "/" + encodeURIComponent(contentInfo["sakai:pooled-content-file-name"]);

                        // filter out the the everyone group and the anonymous user
                        contentMembers.viewers = $.grep(contentMembers.viewers, function(resultObject, index){
                            if (resultObject['sakai:group-id'] !== 'everyone' &&
                                resultObject['rep:userId'] !== 'anonymous') {
                                return true;
                            }
                            return false;
                        });

                        contentMembers.counts = { people: 0, groups: 0};
                        $.each(contentMembers.viewers.concat(contentMembers.managers), function(i, member) {
                            if (member.hasOwnProperty("userid")) {
                                contentMembers.counts.people++;
                            } else {
                                contentMembers.counts.groups++;
                            }
                        });

                        var mimeType = sakai.api.Content.getMimeType(contentInfo);
                        contentInfo.mimeType = mimeType;
                        if (sakai.config.MimeTypes[mimeType]) {
                            contentInfo.iconURL = sakai.config.MimeTypes[mimeType].URL;
                        } else {
                            contentInfo.iconURL = sakai.config.MimeTypes["other"].URL;
                        }

                        if (ignoreActivity && sakai_global.content_profile && sakai_global.content_profile.content_data){
                            contentActivity = sakai_global.content_profile.content_data.activity;
                        }

                        json = {
                            data: contentInfo,
                            members: contentMembers,
                            activity: contentActivity,
                            mode: "content",
                            url: sakai.config.SakaiDomain + fullPath,
                            path: fullPath,
                            smallPath: content_path,
                            saveddirectory : directory,
                            versions : versionInfo,
                            anon: anon,
                            content_path: content_path.replace("/p/",""),
                            isManager: manager,
                            isViewer: viewer
                        };

                        sakai_global.content_profile.content_data = json;
                        $(window).trigger("ready.contentprofile.sakai");
                        if ($.isFunction(callback)) {
                            callback(true);
                        }
                        initEntityWidget();

                        if (!showPreview){
                            renderSakaiDoc(contentInfo);
                        }

                    }
                });

            } else {
                sakai.api.Security.send404();
            }
        };

        var initEntityWidget = function(){
            var context = "content";
            if (sakai.data.me.user.anon){
                type = "content_anon";
            } else if (sakai_global.content_profile.content_data.isManager){
                type = "content_managed";
            } else if (sakai_global.content_profile.content_data.isViewer){
                type = "content_shared";
            } else {
                type = "content_not_shared";
            }
            $(window).trigger("sakai.entity.init", [context,type,sakai_global.content_profile.content_data]);
        };

        $(window).bind("sakai.entity.ready", function(){
            initEntityWidget();
        });

        $(window).bind("load.content_profile.sakai", function(e, callback) {
            loadContentProfile(callback);
        });

        var handleHashChange = function() {
            content_path = $.bbq.getState("p") || "";
            content_path = "/p/" + content_path.split("/")[0];
            if (content_path != previous_content_path) {
                previous_content_path = content_path;
                globalPageStructure = false;
                loadContentProfile(function(){
                    // The request was successful so initialise the entity widget
                    if (sakai_global.entity && sakai_global.entity.isReady) {
                        $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                    }
                    else {
                        $(window).bind("ready.entity.sakai", function(e){
                            $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                            ready_event_fired++;
                        });
                    }
                    // The request was successful so initialise the relatedcontent widget
                    if (sakai_global.relatedcontent && sakai_global.relatedcontent.isReady) {
                        $(window).trigger("render.relatedcontent.sakai", sakai_global.content_profile.content_data);
                    }
                    else {
                        $(window).bind("ready.relatedcontent.sakai", function(e){
                            $(window).trigger("render.relatedcontent.sakai", sakai_global.content_profile.content_data);
                            ready_event_fired++;
                        });
                    }
                    // The request was successful so initialise the relatedcontent widget
                    if (sakai_global.contentpreview && sakai_global.contentpreview.isReady) {
                        if (showPreview) {
                            $(window).trigger("start.contentpreview.sakai");
                        }
                    }
                    else {
                        $(window).bind("ready.contentpreview.sakai", function(e){
                            if (showPreview) {
                                $(window).trigger("start.contentpreview.sakai");
                                ready_event_fired++;
                            }
                        });
                    }
                    // The request was successful so initialise the metadata widget
                    if (sakai_global.contentmetadata && sakai_global.contentmetadata.isReady) {
                        $(window).trigger("render.contentmetadata.sakai");
                    }
                    else {
                        $(window).bind("ready.contentmetadata.sakai", function(e){
                            $(window).trigger("render.contentmetadata.sakai");
                            ready_event_fired++;
                        });
                    }                   
                    sakai.api.Security.showPage();

                    // rerender comments widget
                    $(window).trigger("content_profile_hash_change");
                });
            }
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
                user = user.split("/")[1] || user;
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
                sakai.api.Server.batch(reqData, function(success, data) {
                    if (success) {
                        if (task === 'add') {
                            sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#content_profile_text").text()), sakai.api.Security.saneHTML($("#content_profile_users_added_text").text()) + " " + users.toAddNames.toString().replace(/,/g, ", "));
                            loadContentProfile(function(){
                                $(window).trigger("membersadded.content.sakai");
                                $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                            }, true);
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
                if ($("#entity_content_share_link").length) {
                    tooltip_opened = true;
                    // display tooltip
                    var tooltipLeft = 410;
                    if ($.browser.msie && $.browser.version === "7.0"){
                        tooltipLeft = 310;
                    }
                    var tooltipData = {
                        "tooltipSelector": "#entity_content_share_link",
                        "tooltipTitle": "TOOLTIP_SHARE_CONTENT",
                        "tooltipDescription": "TOOLTIP_SHARE_CONTENT_P3",
                        "tooltipArrow": "top",
                        "tooltipLeft": tooltipLeft,
                        "tooltipTop": -10
                    };
                    if (!sakai_global.tooltip || !sakai_global.tooltip.isReady) {
                        $(window).bind("ready.tooltip.sakai", function(){
                            $(window).trigger("init.tooltip.sakai", tooltipData);
                        });
                    } else {
                        $(window).trigger("init.tooltip.sakai", tooltipData);
                    }
                    if (intervalId){
                        clearInterval(intervalId);
                    }
                } else {
                    intervalId = setInterval(checkShareContentTour, 2000);
                }
            }
        };

        $(window).bind("finished.sharecontent.sakai finished.savecontent.sakai", function(e, peopleList){
            if(!peopleList.mode || peopleList.mode === undefined){
                peopleList.mode = "viewers";
            }
            addRemoveUsers(peopleList.mode, peopleList, 'add');
        });

        $("#entity_content_permissions").live("click", function(){
            var pl_config = {
                "title": sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"],
                "URL": sakai_global.content_profile.content_data.url + "/" + sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"]
            };

            $(window).trigger("init.contentpermissions.sakai", pl_config, function(people){});

            return false;
        });

        $("#entity_content_share").live("click", function(){

            $(window).trigger("init.sharecontent.sakai");

            // display help tooltip
            var tooltipData = {
                "tooltipSelector":"#sharecontent_add_people",
                "tooltipTitle":"TOOLTIP_SHARE_CONTENT",
                "tooltipDescription":"TOOLTIP_SHARE_CONTENT_P4",
                "tooltipArrow":"bottom",
                "tooltipTop":3,
                "tooltipLeft":120
            };
            $(window).trigger("update.tooltip.sakai", tooltipData);

            return false;
        });

        $("#entity_content_add_to_library").live("click", function(){
            sakai.api.Content.addToLibrary(sakai_global.content_profile.content_data.data["jcr:path"], sakai.data.me.user.userid, function(){
                $("#entity_content_add_to_library").hide();
                sakai.api.Util.notification.show($("#content_profile_add_library_title").html(), $("#content_profile_add_library_body").html());
            });
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

            checkShareContentTour();
        };

        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        // Temporarily deal with pages as documents here //
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////

        var globalPageStructure = false;

        var generateNav = function(pagestructure){
            if (pagestructure) {
                $(window).trigger("lhnav.init", [pagestructure, {}, {
                    isEditMode: sakai_global.content_profile.content_data.isManager,
                    parametersToCarryOver: {
                        "content_path": sakai_global.content_profile.content_data.content_path
                    }
                }, sakai_global.content_profile.content_data.content_path]);
                $(window).trigger("lhnav.addHashParam", [{
                    "content_path": sakai_global.content_profile.content_data.content_path
                }]);
            }
        };

        $(window).bind("lhnav.ready", function(){
            generateNav(globalPageStructure);
        });

        var getPageCount = function(pagestructure){
            var pageCount = 0;
            for (var tl in pagestructure["structure0"]){
                if (pagestructure["structure0"].hasOwnProperty(tl)){
                    pageCount++;
                    if (pageCount >= 3){
                        return 3;
                    }
                    for (var ll in pagestructure["structure0"][tl]){
                        if (ll.substring(0,1) !== "_"){
                            pageCount++;
                            if (pageCount >= 3){
                                return 3;
                            }
                        }
                    }
                }
            }
            return pageCount;
        };

        $(window).bind("sakai.contentauthoring.needsTwoColumns", function(){
            switchToTwoColumnLayout(true);
        });
        
        $(window).bind("sakai.contentauthoring.needsOneColumn", function(){
            switchToOneColumnLayout(true);
        });

        var renderSakaiDoc = function(pagestructure){
            pagestructure = sakai.api.Server.cleanUpSakaiDocObject(pagestructure);
            if (getPageCount(pagestructure) >= 3){
                switchToTwoColumnLayout(true);
            } else {
                switchToOneColumnLayout(true);
            }
            globalPageStructure = pagestructure;
            generateNav(pagestructure);
        };

        var switchToTwoColumnLayout = function(isSakaiDoc){
            $("#content_profile_left_column").show();
            $("#content_profile_main_container").addClass("s3d-twocolumn");
            $("#content_profile_right_container").addClass("s3d-page-column-right");
            $("#content_profile_right_container").removeClass("s3d-page-fullcolumn-padding");
            $("#content_profile_right_metacomments").removeClass("fl-container-650");
            $("#content_profile_right_metacomments").addClass("fl-container-500");
            if (isSakaiDoc){
                $("#content_profile_preview_container").hide();
                $("#content_profile_sakaidoc_container").show();
            } else {
                $("#content_profile_preview_container").show();
                $("#content_profile_sakaidoc_container").hide();
            }
        };

        var switchToOneColumnLayout = function(isSakaiDoc){
            $("#content_profile_left_column").hide();
            $("#content_profile_main_container").removeClass("s3d-twocolumn");
            $("#content_profile_right_container").removeClass("s3d-page-column-right");
            $("#content_profile_right_container").addClass("s3d-page-fullcolumn-padding");
            $("#content_profile_right_metacomments").addClass("fl-container-650");
            $("#content_profile_right_metacomments").removeClass("fl-container-500");
            if (isSakaiDoc){
                $("#content_profile_preview_container").hide();
                $("#content_profile_sakaidoc_container").show();
            } else {
                $("#content_profile_preview_container").show();
                $("#content_profile_sakaidoc_container").hide();
            }
        };

        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        // Temporarily deal with pages as documents here //
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////

        // Initialise the content profile page
        init();

    };

    sakai.api.Widgets.Container.registerForLoad("content_profile");
});