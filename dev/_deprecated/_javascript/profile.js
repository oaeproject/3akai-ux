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

sakai.profile = function() {

    /////////////////////////////
    // CONFIGURATION VARIABLES //
    /////////////////////////////
    sakai.profile.main = {
        chatstatus: "",
        config: sakai.config.Profile.configuration,
        data: {},
        isme: false,
        currentuser: "",
        mode: {
            options: ["viewmy", "view", "edit"],
            value: "viewmy"
        },
        acls: {},
        picture: "",
        status: "",
        validation: {}
    };

    var userprofile;
    var querystring; // Variable that will contain the querystring object of the page
    var authprofileURL;

    ///////////////////
    // CSS SELECTORS //
    ///////////////////


    /**
     * Load Pages Widget into the profile page
     */
    var loadPagesWidget = function() {
        var basepath = "/~" + sakai.profile.main.data["rep:userId"] + "/pages/";
        var fullpath = "/_user" + sakai.profile.main.data.path + "/pages/";
        var url = "/~" + sakai.profile.main.data["rep:userId"];
        var editMode = sakai.profile.main.isme;
        var homePage = "";
        sakai.sitespages.doInit(basepath, fullpath, url, editMode, homePage, "userpages", "userdashboard");
    }

    /**
     * Check whether the user is editing/looking at it's own profile or not
     * We do this because if it is the current user, we don't need to perform an extra search
     */
    var setIsMe = function(){

        // Check whether there is a user parameter in the querystring,
        // if so, check whether the userid is not the same as the user parameter
        if (querystring.contains("user") && querystring.get("user") !== sakai.data.me.user.userid) {
            sakai.profile.main.isme = false;
            sakai.profile.main.currentuser = querystring.get("user");
        }
        else {
            sakai.profile.main.isme = true;
            sakai.profile.main.currentuser = sakai.data.me.user.userid;
        }

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
        }
        else {
            return "";
        }
    };

    /**
     * Set the profile data for the user such as the status and profile picture
     */
    var setProfileData = function(callback){

        // Check whether the user is looking/editing it's own profile
        if (sakai.profile.main.isme) {

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

            // Execute the callback function
            if (callback && typeof callback === "function") {
                callback();
            }

        }
        else {

            // We need to fire an Ajax GET request to get the profile data for the user
            $.ajax({
                url: authprofileURL + ".3.json",
                success: function(data){

                    // Check whether there are any results
                    if(data){

                        // Set the correct userprofile data
                        userprofile = $.extend(true, {}, data);

                        // Set the profile picture
                        sakai.profile.main.picture = constructProfilePicture(userprofile);

                        // Set the status for the user you want the information from
                        if(userprofile.basic && userprofile.basic.elements.status){
                            sakai.profile.main.status = userprofile.basic.elements.status.value;
                        }

                        // Set the profile data object
                        sakai.profile.main.data = $.extend(true, {}, userprofile);
                    }

                },
                error: function(){
                    fluid.log("setProfileData: Could not find the user");
                },
                complete: function(data){

                    // Execute the callback function
                    if (callback && typeof callback === "function") {
                        callback();
                    }

                }
            });

        }

    };


    ////////////////////
    // INITIALISATION //
    ////////////////////
    var doInit = function() {

        // Set the querystring object variable
        // We use the following parameters:
        //    mode -> mode of the profile
        //    user -> the id of the user for which you want to see the profile
        querystring = new Querystring();

        // Check if you are looking at the logged-in user
        setIsMe();

        // Construct the authprofile URL
        authprofileURL = "/~" + sakai.profile.main.currentuser + "/public/authprofile";

        // Set the profile data
        setProfileData(function() {

            // Initialise the entity widget
            $(window).bind("sakai.api.UI.entity.ready", function(e) {

                // Check whether we need to load the myprofile or the profile mode
                var whichprofile = sakai.profile.main.isme ? "myprofile": "profile";

                // Check which data we need to send
                var data = sakai.profile.main.isme ? false: userprofile;

                // Render the entity widget
                sakai.api.UI.entity.render(whichprofile, data);

            });

        });

    };

    $(window).bind("sakai.sitespages.ready", function(e) {
       loadPagesWidget();
    });

    doInit();
};

sakai.api.Widgets.Container.registerForLoad("sakai.profile");