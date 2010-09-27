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
/*global $, QueryString */

var sakai = sakai || {};

sakai.currentgroup = sakai.currentgroup || {};
sakai.currentgroup.id = sakai.currentgroup.id || {};
sakai.currentgroup.data = sakai.currentgroup.data || {};
sakai.currentgroup.manager = sakai.currentgroup.manager || false;

sakai.profile = sakai.profile || {};
sakai.profile.main = {
    chatstatus: "",
    config: sakai.config.Profile.configuration,
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

sakai.show = function() {

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
        sakai.api.Server.loadJSON("/~" + entityID + "/public/authprofile", function(success, data) {
            if (success){

                if (data["sakai:group-id"]){
                    var newdata = {};
                    newdata["authprofile"] = data;
                    data = newdata;
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

    sakai.show.canEdit = function() {
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
        if (profile.basic.elements.picture && profile.basic.elements.picture.value && profile["rep:userId"]) {
            return "/~" + profile["rep:userId"] + "/public/profile/" + profile.basic.elements.picture.value.name;
        } else {
            return "";
        }
    };

    /**
     * Fetch group data
     */
    var getGroupData = function() {
        sakai.currentgroup.id = entityID;
        sakai.currentgroup.data = entityData;
        postDataRetrieval();
        sakai.api.Security.showPage();
    };

    /**
     * Set the profile data for the user such as the status and profile picture
     */
    var getUserData = function(callback){

        // Check whether the user is looking/editing it's own profile
        if (canEdit) {

            // Set the profile picture for the user you are looking at
            // The actual location of the picture could be something like this: /~admin/public/profile/256x256_profilepicture
            sakai.profile.main.picture = constructProfilePicture(sakai.data.me.profile);

            // Set the status for the user you want the information from
            if(sakai.data.me.profile.basic && sakai.data.me.profile.basic.elements.status){
                sakai.profile.main.status = sakai.data.me.profile.basic.elements.status.value;
            }

            // Set the profile data object
            sakai.profile.main.data = $.extend(true, {}, sakai.data.me.profile);

            if (sakai.profile.main.data.activity)
                delete sakai.profile.main.data.activity;

            postDataRetrieval();
            sakai.api.Security.showPage();

        } else {

            // Set the correct userprofile data
            userprofile = $.extend(true, {}, entityData);

            // Set the profile picture
            sakai.profile.main.picture = constructProfilePicture(userprofile);

            // Set the status for the user you want the information from
            if(userprofile.basic && userprofile.basic.elements.status){
            	sakai.profile.main.status = userprofile.basic.elements.status.value;
            }

            // Set the profile data object
            sakai.profile.main.data = $.extend(true, {}, userprofile);
            sakai.api.Security.showPage();

            postDataRetrieval();

        }
    };

    var getEntityData = function() {
        switch (entityType) {
            case "user":
                getUserData();
                break;
            case "group":

                getGroupData();
                break;
        }
    };

    var getEditPermissions = function() {
        switch (entityType) {
            case "user":
                if (entityID === sakai.data.me.user.userid) {
                    sakai.profile.main.isme = true;
                    canEdit = true;
                }
                break;
            case "group":
                if (sakai.api.Groups.isCurrentUserAManager(sakai.currentgroup.id)) {
                    sakai.currentgroup.manager = true;
                    canEdit = true;
                }
                break;
        }
    };

    var setEntityPath = function() {
        switch (entityType) {
            case "user":
                entityPath = entityPrefix + sakai.profile.main.data.path;
                break;
            case "group":
                entityPath = entityPrefix + "/" + entityID.substring(0,1) + "/" + entityID.substring(0,2) + "/" + entityID;
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
                var whichprofile = sakai.profile.main.isme ? "myprofile": "profile";

                // Check which data we need to send
                var data = sakai.profile.main.isme ? false : sakai.profile.main.data;

                // Render the entity widget
                sakai.api.UI.entity.render(whichprofile, data);
                break;
            case "group":
                sakai.api.UI.entity.render("group", sakai.currentgroup.data);
                break;
        }
    };

    var loadPagesWidget = function(){
        renderedPagesWidget = true;
        var basepath = "/~" + entityID + "/pages/";
        var fullpath = entityPath + "/pages/";
        var url = "/~" + entityID;
        var editMode = sakai.currentgroup.manager || sakai.profile.main.isme;
        var homePage = "";
        sakai.sitespages.doInit(basepath, fullpath, url, canEdit, homePage, entityType+"pages", entityType+"dashboard");
    }

    $(window).bind("sakai.api.UI.entity.ready", function(e){
        entityWidgetReady = true;
        if (entityDataReady && !renderedEntityWidget) {
            loadEntityWidget();
        }
    });

    $(window).bind("sakai.sitespages.ready", function(e){
        pagesWidgetReady = true;
        if (entityDataReady && !renderedPagesWidget) {
            loadPagesWidget();
        }
    });

    ////////////////////
    // INITIALISATION //
    ////////////////////

    var doInit = function(){
        setEntityInfo();
    };

    doInit();
}

sakai.api.Widgets.Container.registerForLoad("sakai.show");