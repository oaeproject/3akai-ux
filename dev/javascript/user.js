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

    sakai_global.profile = sakai_global.profile || {};
    sakai_global.profile.main = sakai_global.profile.main || {};
    $.extend(true, sakai_global.profile.main, {
        config: sakai.config.Profile.configuration.defaultConfig,
        data: {},
        mode: {
            options: ["view", "edit"],
            value: "view"
        }
    });

    sakai_global.user = function() {

        var privdata = false;
        var pubdata = false;
        var privurl = false;
        var puburl = false;

        var contextType = false;
        var contextData = false;
        var qs = new Querystring();

        var loadSpaceData = function(){
                var isMe = false;
                var userid = false;
                if (!qs.get("id") || qs.get("id") == sakai.data.me.user.userid) {
                    isMe = true;
                    userid = sakai.data.me.user.userid;
                } else {
                    userid = qs.get("id");
                }
                privurl = "/~" + userid + "/private/privspace/";
                puburl = "/~" + userid + "/public/pubspace/";
                
                var publicToStore = false;
                var privateToStore = false;
                
                // Load public data from /~userid/private/pubspace
                sakai.api.Server.loadJSON(puburl, function(success, data){
                    if (!success){
                        publicToStore = sakai.config.defaultpubstructure;
                        pubdata = publicToStore;
                    } else {
                        pubdata = data;
                        pubdata = sakai.api.Server.cleanUpSakaiDocObject(pubdata);
                    }
                    if (isMe){
                        sakai.api.Server.loadJSON(privurl, function(success2, data2){
                            if (!success2){
                                privateToStore = sakai.config.defaultprivstructure;
                                privdata = privateToStore;
                            } else {
                                privdata = data2;
                                privdata = sakai.api.Server.cleanUpSakaiDocObject(privdata);   
                            }
                            generateNav();
                            if (publicToStore) {
                                sakai.api.Server.saveJSON(puburl, publicToStore);
                            }
                            if (privateToStore) {
                                sakai.api.Server.saveJSON(privurl, privateToStore);
                            }
                        });
                    } else {
                        generateNav();
                    }
                });
        };
        
        var getUserPicture = function(profile, userid){
            var picture = "";
            if (profile.picture) {
                var picture_name = $.parseJSON(profile.picture).name;
                picture = "/~" + userid + "/public/profile/" + picture_name;
            }
            return picture;
        };

        var determineContext = function(){
            if (qs.get("id") && qs.get("id") !== sakai.data.me.user.userid){
                sakai.api.User.getUser(qs.get("id"), getProfileData);
            } else if (!sakai.data.me.user.anon){
                if (document.location.pathname === "/dev/user.html"){
                    document.location = "/dev/me.html";
                    return false;
                }
                sakai.api.Security.showPage();
                contextType = "user_me";
                // Set the profile data object
                sakai_global.profile.main.data = $.extend(true, {}, sakai.data.me.profile);
                sakai_global.profile.main.mode.value = "edit";
                contextData = {
                    "profile": sakai.data.me.profile,
                    "displayName": sakai.api.User.getDisplayName(sakai.data.me.profile),
                    "userid": sakai.data.me.user.userid,
                    "picture": getUserPicture(sakai.data.me.profile, sakai.data.me.user.userid)
                };
                determineContentContactsMemberships();
            } else {
                sakai.api.Security.sendToLogin();
            }
        };

        var getProfileData = function(exists, profile){
            if (!profile) {
                sakai.api.Security.sendToLogin();
            } else {
                sakai.api.Security.showPage();
                // Set the profile data object
                sakai_global.profile.main.data = $.extend(true, {}, profile);
                contextData = {
                    "profile": profile,
                    "displayName": sakai.api.User.getDisplayName(profile),
                    "userid": qs.get("id"),
                    "altTitle": true,
                    "picture": getUserPicture(profile, qs.get("id"))
                };
                if (sakai.data.me.user.anon) {
                    contextType = "user_anon";
                    determineContentContactsMemberships
                } else {
                    sakai.api.User.getContacts(checkContact);
                }
            }
        };

        var checkContact = function(){
            var contacts = sakai.data.me.mycontacts;
            var isContact = false;
            var isContactInvited = false;
            var isContactPending = false;
            for (var i = 0; i < contacts.length; i++){
                if (contacts[i].profile.userid === qs.get("id")){
                    if (contacts[i].details["sakai:state"] === "ACCEPTED") {
                        isContact = true;
                    } else if (contacts[i].details["sakai:state"] === "INVITED"){
                        isContactInvited = true
                    } else if (contacts[i].details["sakai:state"] === "PENDING"){
                        isContactPending = true
                    }
                }
            }
            if (isContact){
                contextType = "contact";
            } else if (isContactInvited){
                contextType = "contact_invited";
            } else if (isContactPending){
                contextType = "contact_pending";
            } else {
                contextType = "user_other";
            }
            determineContentContactsMemberships();
        };

        var determineContentContactsMemberships = function(){
            if (!contextData){
                contextData = {};
            }
            contextData.counts = {};url = "";
                data = {
                    "userid": sakai_global.profile.main.data.homePath.split("~")[1]
                };
            var contentURL = "/var/search/pool/manager-viewer.json?userid=" + contextData.userid + "&page=0&items=1";
            var contactsURL = "/var/contacts/findbyuser.json?userid=" + contextData.userid + "&page=0&items=1";

            $.ajax({
                url: contentURL,
                type: "GET",
                cache: false,
                success: function(data){
                    contextData.counts["content"] = data.total;
                     $.ajax({
                        url: contactsURL,
                        type: "GET",
                        cache: false,
                        success: function(data){
                            contextData.counts["contacts"] = data.total;
                            contextData.counts["memberships"] = sakai.api.Groups.getMemberships(sakai.data.me.groups).entry.length;
                            renderEntity();
                            loadSpaceData();
                        }
                    });

                }
            });
        };

        var generateNav = function(){
            if (contextType && contextData && pubdata) {
                if (contextType === "user_me") {
                    $(window).trigger("lhnav.init", [pubdata, privdata, contextData, puburl, privurl]);
                } else {
                    $(window).trigger("lhnav.init", [pubdata, false, contextData, puburl, privurl]);
                }
            }
        };

        var renderEntity = function(){
            if (contextType && contextData) {
                $(window).trigger("sakai.entity.init", ["user", contextType, contextData]);
            }
        };
        
        $(window).bind("sakai.addToContacts.requested", function(ev, userToAdd){
            $('.sakai_addtocontacts_overlay').each(function(index) {
                contextType = "contact_pending";
                renderEntity();
            });
        });
        
        $("#entity_user_accept_invitation").live("click", function(){
            sakai.api.User.acceptContactInvite(contextData.userid);
            contextType = "contact";
            renderEntity();
        });

        $(window).bind("sakai.entity.ready", function(){
            renderEntity();
        });

        $(window).bind("lhnav.ready", function(){
            generateNav();
        });

        $(window).bind("complete.fileupload.sakai", determineContext);

        determineContext();
        renderEntity();
        generateNav();

    };

    sakai.api.Widgets.Container.registerForLoad("user");
});
