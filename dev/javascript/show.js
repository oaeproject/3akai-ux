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

    sakai_global.currentgroup = sakai_global.currentgroup || {};
    sakai_global.currentgroup.id = sakai_global.currentgroup.id || {};
    sakai_global.currentgroup.data = sakai_global.currentgroup.data || {};
    sakai_global.currentgroup.manager = sakai_global.currentgroup.manager || false;
    sakai_global.currentgroup.member = sakai_global.currentgroup.member || false;

    sakai_global.profile = sakai_global.profile || {};
    sakai_global.profile.main = {
        chatstatus: "",
        config: sakai.config.Profile.configuration.defaultConfig,
        data: {},
        isme: false,
        currentuser: "",
        mode: {
            options: ["view", "view", "edit"],
            value: "view"
        },
        acls: {},
        picture: "",
        status: "",
        validation: {}
    };

    sakai_global.show = function() {

        var entityType = false;
        var entityID = false;
        var entityPrefix = false;
        var entityPath = false;

        var canEdit = false;
        var entityData = false;
        var entityDataReady = false;
        var pagesWidgetReady = false;
        var entityWidgetReady = false;
        var renderedPagesWidget = false;
        var renderedEntityWidget = false;
        var $launch_help = $("#launch_help");


        /**
         * Get the group id from the querystring
         */
        var setEntityInfo = function(){
            if (window.location.pathname.substring(0, 2) === "/~") {
                entityID = window.location.pathname.substring(2);
                if (entityID.indexOf("/") != -1){
                    entityID = entity.substring(0, entity.indexOf("/"));
                }
            } else {
                var querystring = new Querystring();
                if (querystring.contains("id")) {
                    entityID = querystring.get("id");
                } else if (entityType === "user") { // if there's no ID, assume its meant for you
                    entityID = sakai.data.me.user.userid;
                }
            }
            sakai.api.Server.loadJSON("/~" + entityID + "/public.infinity.json", function(success, data) {
                if (success){

                    if (data.authprofile && data.authprofile["sakai:group-id"]){
                        entityType = "group";
                    } else {
                        entityType = "user";
                    }
                    entityData = data;
                    switch (entityType) {
                        case "user":
                            entityPrefix = sakai.config.URL.USER_PREFIX;
                            break;
                        case "group":
                            entityPrefix = sakai.config.URL.GROUP_PREFIX;
                            break;
                    }
                    getEntityData();

                } else {

                    if (data.status === 401 || data.status === 403){
                        sakai.api.Security.send403();
                    } else {
                        sakai.api.Security.send404();
                    }

                }

            });
        };

        sakai_global.show.canEdit = function() {
            return canEdit;
        };

        /**
         * Check whether there is a valid picture for the user
         * @param {Object} profile The profile object that could contain the profile picture
         * @return {String}
         * The complete URL of the profile picture
         * Will be an empty string if there is no picture
         */
        var constructProfilePicture = function(profile){
            if (profile.basic && profile.basic.elements.picture && profile.basic.elements.picture.value && profile["rep:userId"]) {
                return "/~" + profile["rep:userId"] + "/public/profile/" + profile.basic.elements.picture.value.name;
            } else {
                return "";
            }
        };

        /**
         * Fetch group data
         */
        var getGroupData = function() {
            sakai_global.currentgroup.id = entityID;
            sakai_global.currentgroup.data = entityData;
            postDataRetrieval();
            sakai.api.Security.showPage(function() {
                if (sakai_global.currentgroup.data.authprofile["sakai:customStyle"]) {
                    sakai.api.Util.include.css(sakai_global.currentgroup.data.authprofile["sakai:customStyle"]);
                }
            });
            var pageTitle = sakai.api.i18n.General.getValueForKey(sakai.config.PageTitles.prefix);
            document.title = pageTitle + entityData.authprofile["sakai:group-title"];
        };

        /**
         * Set the profile data for the user such as the status and profile picture
         */
        var getUserData = function(callback){

            // Check whether the user is looking/editing it's own profile
            if (canEdit) {

                // Set the profile picture for the user you are looking at
                // The actual location of the picture could be something like this: /~admin/public/profile/256x256_profilepicture
                sakai_global.profile.main.picture = constructProfilePicture(sakai.data.me.profile);

                // Set the status for the user you want the information from
                if(sakai.data.me.profile.basic && sakai.data.me.profile.basic.elements.status){
                    sakai_global.profile.main.status = sakai.data.me.profile.basic.elements.status.value;
                }

                // Set the profile data object
                sakai_global.profile.main.data = $.extend(true, {}, sakai.data.me.profile);

                if (sakai_global.profile.main.data.activity) {
                    delete sakai_global.profile.main.data.activity;
                }

                postDataRetrieval();
                sakai.api.Security.showPage(function() {
                    if (sakai_global.profile.main.data.authprofile["sakai:customStyle"]) {
                        sakai.api.Util.include.css(sakai_global.profile.main.data.authprofile["sakai:customStyle"]);
                    }
                });
            } else {

                // Set the correct userprofile data
                userprofile = $.extend(true, {}, entityData);

                // Set the profile picture
                sakai_global.profile.main.picture = constructProfilePicture(userprofile);

                // Set the status for the user you want the information from
                if(userprofile.basic && userprofile.basic.elements.status){
                    sakai_global.profile.main.status = userprofile.basic.elements.status.value;
                }

                // Set the profile data object
                sakai_global.profile.main.data = $.extend(true, {}, userprofile);

                if (sakai_global.profile.main.data["sakai:customStyle"]) {
                    sakai.api.Util.include.css(sakai_global.profile.main.data["sakai:customStyle"]);
                }

                postDataRetrieval();
                sakai.api.Security.showPage();
            }

            var pageTitle = sakai.api.i18n.General.getValueForKey(sakai.config.PageTitles.prefix);
            document.title = pageTitle + sakai.api.User.getDisplayName(sakai_global.profile.main.data);

        };

        var getEntityData = function() {
            switch (entityType) {
                case "user":
                    getUserData();
                    break;
                case "group":
                    getGroupData();
                    loadHelp('groupHelp', 'group');
                    break;
            }
        };

        var getEditPermissions = function() {
            switch (entityType) {
                case "user":
                    if (entityID === sakai.data.me.user.userid) {
                        sakai_global.profile.main.isme = true;
                        canEdit = true;
                    }
                    break;
                case "group":
                    if (sakai.api.Groups.isCurrentUserAManager(sakai_global.currentgroup.id, sakai.data.me)) {
                        sakai_global.currentgroup.manager = true;
                        canEdit = true;
                    }
                    if(sakai.api.Groups.isCurrentUserAMember(sakai_global.currentgroup.id, sakai.data.me)) {
                        sakai_global.currentgroup.member = true;
                        canEdit = true;
                    }
                    break;
            }
        };

        var setEntityPath = function() {
            switch (entityType) {
                case "user":
                    entityPath = entityPrefix + sakai_global.profile.main.data.path;
                    break;
                case "group":
                    entityPath = entityPrefix + sakai_global.currentgroup.data.authprofile.path;
                    break;
            }
        };

        var postDataRetrieval = function() {
            entityDataReady = true;
            getEditPermissions();
            setEntityPath();
            if (pagesWidgetReady && !renderedPagesWidget) {
                loadPagesWidget();
            }
            if (entityWidgetReady && !renderedEntityWidget) {
                loadEntityWidget();
            }
        };

        var loadEntityWidget = function() {
            renderedEntityWidget = true;
            switch (entityType) {
                case "user":
                    // Check whether we need to load the myprofile or the profile mode
                    var whichprofile = sakai_global.profile.main.isme ? "myprofile": "profile";

                    // Check which data we need to send
                    var data = sakai_global.profile.main.isme ? false : sakai_global.profile.main.data;

                    // Render the entity widget
                    $(window).trigger("render.entity.sakai", [whichprofile, data]);
                    break;
                case "group":
                    $(window).trigger("render.entity.sakai", ["group", sakai_global.currentgroup.data]);
                    break;
            }
        };

        var loadPagesWidget = function(){
            renderedPagesWidget = true;
            var basepath = "/~" + entityID + "/pages/";
            var fullpath = entityPath + "/pages/";
            var url = "/~" + entityID;
            var editMode = sakai_global.currentgroup.manager || sakai_global.profile.main.isme;
            var homePage = "";
            $(window).trigger("init.sitespages.sakai", [basepath, fullpath, url, canEdit, homePage, entityType+"pages", entityType+"dashboard"]);
        };

        $(window).bind("sakai.api.UI.entity.ready", function(e){
            entityWidgetReady = true;
            if (entityDataReady && !renderedEntityWidget) {
                loadEntityWidget();
            }
        });

        $(window).bind("sakai_global.sitespages.ready", function(e){
            pagesWidgetReady = true;
            if (entityDataReady && !renderedPagesWidget) {
                loadPagesWidget();
            }
        });

        var triggerHelp = function(profileFlag, whichHelp) {
            // only show to the manager who created the group
            if (canEdit) {
                $launch_help.show();
                $launch_help.bind("click", function() {
                    $(window).trigger("sakai-help-init", {
                        profileFlag: profileFlag,
                        whichHelp: whichHelp,
                        force: true
                    });
                    return false;
                });
                if (sakai_global.currentgroup &&
                sakai_global.currentgroup.data &&
                sakai_global.currentgroup.data.authprofile &&
                !sakai_global.currentgroup.data.authprofile.beenVisited) {
                    $(window).trigger("sakai-help-init", {
                        profileFlag: profileFlag,
                        whichHelp: whichHelp
                    });
                    sakai_global.currentgroup.data.authprofile.beenVisited = true;
                    sakai.api.Groups.updateGroupProfile(sakai_global.currentgroup.id, sakai_global.currentgroup.data.authprofile);
                }
            }
        };

        var loadHelp = function(profileFlag, whichHelp) {
            if (!sakai.help || !sakai.help.isReady) {
                $(window).bind("sakai-help-ready", function() {
                    triggerHelp(profileFlag, whichHelp);
                });
            } else {
                triggerHelp(profileFlag, whichHelp);
            }
        };


        ////////////////////
        // INITIALISATION //
        ////////////////////

        var doInit = function(){
            setEntityInfo();
        };

        doInit();
    };

    sakai.api.Widgets.Container.registerForLoad("show");
});
