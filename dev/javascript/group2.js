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

    sakai_global.group2 = function() {

        var groupData = false;
        var groupId = false;
        var pubdata = false;

        /**
         * Get the group id from the querystring
         */
        var processEntityInfo = function(){
            var querystring = new Querystring();
            if (querystring.contains("id")) {
                groupId = querystring.get("id");
            }
            sakai.api.Server.loadJSON("/system/userManager/group/" + groupId + ".json", function(success, data) {
                if (success){
                    groupData = {};
                    groupData.authprofile = data.properties;
                    groupData.authprofile.picture = sakai.api.Groups.getProfilePicture(groupData.authprofile);
                    sakai_global.group2.groupData = groupData.authprofile;
                    var directory = [];
                    // When only one tag is put in this will not be an array but a string
                    // We need an array to parse and display the results
                    if (sakai_global.group2.groupData && sakai_global.group2.groupData['sakai:tags']) {
                        sakai_global.group2.groupData.saveddirectory = sakai.api.Util.getDirectoryTags(sakai_global.group2.groupData["sakai:tags"].toString());
                    }
                    sakai_global.group2.groupId = groupId;
                    sakai.api.Security.showPage(function() {
                        if (groupData.authprofile["sakai:customStyle"]) {
                            sakai.api.Util.include.css(groupData.authprofile["sakai:customStyle"]);
                        }
                    });
                    var pageTitle = sakai.api.i18n.General.getValueForKey(sakai.config.PageTitles.prefix);
                    document.title = pageTitle + groupData.authprofile["sakai:group-title"];
                    loadGroupEntityWidget();
                    loadDocStructure();

                } else {
                    if (data.status === 401 || data.status === 403){
                        sakai.api.Security.send403();
                    } else {
                        sakai.api.Security.send404();
                    }
                }
            });
        };

        var loadGroupEntityWidget = function(){
            var canManage = sakai.api.Groups.isCurrentUserAManager(groupId, sakai.data.me, groupData.authprofile);
            var context = "group";
            var type = "group";
            if (canManage){
                type = "group_managed";
                $("#group_create_new_area").show();
            }
            $(window).trigger("sakai.entity.init", [context, type, groupData]);
        };

        $(window).bind("sakai.entity.ready", function(){
            loadGroupEntityWidget();
        });

        $(window).bind("ready.entity.sakai", function(e){
            loadEntityWidget();
        });

        /////////////////////////
        // LOAD LEFT HAND SIDE //
        /////////////////////////

        var filterOutUnwanted = function(){
            var roles = $.parseJSON(groupData.authprofile["sakai:roles"]);
            for (var i in pubdata.structure0){
                var edit = $.parseJSON(pubdata.structure0[i]._edit);
                var view = $.parseJSON(pubdata.structure0[i]._view);
                var canEdit = sakai.api.Groups.isCurrentUserAManager(groupId, sakai.data.me, groupData.authprofile);
                var canSubedit = false;
                var canView = false;
                if (sakai.data.me.user.anon){
                    // Check whether anonymous is in
                    if ($.inArray("anonymous", view) !== -1){
                        canView = true;
                    }
                } else {
                    // Check whether I'm a member
                    var isMember = false;
                    for (var r = 0; r < roles.length; r++) {
                        if (sakai.api.Groups.isCurrentUserAMember(groupId + "-" + roles[r].id, sakai.data.me)) {
                            isMember = true;
                        }
                    }
                    if (isMember) {
                        // Check whether I can view
                        $.each(view, function(index, value){
                            if (value.substring(0, 1) === "-" && sakai.api.Groups.isCurrentUserAMember(groupId + value, sakai.data.me)) {
                                canView = true;
                            }
                        });
                        // Check whether I can manage
                        $.each(edit, function(index, value){
                            if (value.substring(0, 1) === "-" && sakai.api.Groups.isCurrentUserAMember(groupId + value, sakai.data.me)) {
                                canView = true;
                                canSubedit = true;
                            }
                        });
                    } else {
                        // Check whether everyone can view
                        if ($.inArray("everyone", view) !== -1) {
                            canView = true;
                        }
                    }
                    
                }
                pubdata.structure0[i]._canView = canView;
                pubdata.structure0[i]._canSubedit = canSubedit;
                pubdata.structure0[i]._canEdit = canEdit;
            }
        };

        var loadDocStructure = function(forceOpenPage){
            $.ajax({
                url: "/~" + groupId+ "/docstructure.infinity.json",
                cache: false,
                success: function(data){
                    pubdata = sakai.api.Server.cleanUpSakaiDocObject(data);
                    filterOutUnwanted();
                    generateNav(forceOpenPage);
                }
            });
        };

        var generateNav = function(forceOpenPage){
            if (pubdata) {
                $(window).trigger("lhnav.init", [pubdata, {}, {"addArea": true, "forceOpenPage": forceOpenPage}, "/~" + groupId+ "/docstructure"]);
                sakai_global.group2.pubdata = pubdata;
            }
        };

        $(window).bind("lhnav.ready", function(){
            generateNav();
        });
        
        $(window).bind("rerender.group.sakai", function(ev, forceOpenPage){
            loadDocStructure(forceOpenPage);
        });

        /////////////////////
        // Create new area //
        /////////////////////
        
        $("#group_create_new_area").live("click", function(){
            $(window).trigger("addarea.initiate.sakai");
        });

        $(window).bind("sakai.addpeople.usersselected", function(e, widgetid, data){
            var members = [];
            for(var user in data){
                var member = {
                    "user": data[user].userid,
                    "permission": data[user].permission
                };
                members.push(member);
            }
            if(members){
                sakai.api.Groups.addUsersToGroup(groupId, false, members, sakai.api.User.data.me, false, function(){
                    $(window).trigger("usersselected.addpeople.sakai");
                });
            }
        });

        $(window).bind("sakai.addpeople.usersswitchedpermission", function(e, widgetid, data){
            var members = [];
            for(var user in data){
                var member = {
                    "userid": data[user].userid,
                    "permission": data[user].originalPermission
                };
                members.push(member);
            }
            if(members){
                sakai.api.Groups.removeUsersFromGroup(groupId, false, members, sakai.api.User.data.me, false);
            }
        });

        ////////////////////
        // INITIALISATION //
        ////////////////////

        var doInit = function(){
            processEntityInfo();
        };

        doInit();
    };

    sakai.api.Widgets.Container.registerForLoad("group2");
});