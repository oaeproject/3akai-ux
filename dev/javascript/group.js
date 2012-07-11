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

    sakai_global.group = function() {

        var groupData = false;
        var groupId = false;
        var pubdata = false;
        var defaultPageTitle = '';

        /**
         * Get the group id from the querystring
         */
        var processEntityInfo = function(){
            groupId = sakai.api.Util.extractEntity(window.location.pathname);

            sakai.api.Groups.getGroupInformation({
                    groupId: groupId
                }, function(success, data) {
                    if (success) {
                        groupData = data;
                        sakai_global.group.groupData = groupData.authprofile;
                        sakai_global.group.groupId = groupId;
                        sakai.api.Security.showPage(function() {
                            if (groupData.authprofile['sakai:customStyle']) {
                                sakai.api.Util.include.css(groupData.authprofile['sakai:customStyle']);
                            }
                        });
                        defaultPageTitle = document.title;
                        sakai.api.Util.setPageTitle(defaultPageTitle + ' ' + groupData.authprofile['sakai:group-title'], false, true);
                        loadGroupEntityWidget();
                        loadDocStructure();
                    } else {
                        sakai.api.Security.send404();
                    }
            });
        };

        var loadGroupEntityWidget = function(){
            var canManage = sakai.api.Groups.isCurrentUserAManager(groupId, sakai.data.me, groupData.authprofile);
            var context = "group";
            var type = "group";
            if (canManage){
                type = "group_managed";
                $("#group_create_new_area_container").show();
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

            var checkViewPermission = function(index, value){
                if (value.substring(0, 1) === "-" && sakai.api.Groups.isCurrentUserAMember(groupId + value, sakai.data.me)) {
                    canView = true;
                }
            };
            var checkManagePermission = function(index, value){
                if (value.substring(0, 1) === "-" && sakai.api.Groups.isCurrentUserAMember(groupId + value, sakai.data.me)) {
                    canView = true;
                    canSubedit = true;
                }
            };

            var roles = $.parseJSON(groupData.authprofile["sakai:roles"]);
            for (var i in pubdata.structure0){
                if (pubdata.structure0.hasOwnProperty(i)){
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
                            $.each(view, checkViewPermission);
                            // Check whether I can manage
                            $.each(edit, checkManagePermission);
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
                $(window).trigger("lhnav.init", [pubdata, {}, {"addArea": "world", "forceOpenPage": forceOpenPage}, "/~" + groupId+ "/docstructure"]);
                sakai_global.group.pubdata = pubdata;
            }
        };

        $(window).bind("lhnav.ready", function(){
            generateNav();
        });
        
        $(window).bind("rerender.group.sakai", function(ev, forceOpenPage){
            loadDocStructure(forceOpenPage);
        });

        $(window).on('updatedTitle.worldsettings.sakai', function(e, title) {
            sakai.api.Util.setPageTitle(defaultPageTitle + ' ' + title, false, true);
        });

        /////////////////////
        // Create new area //
        /////////////////////
        
        $("#group_create_new_area").live("click", function(){
            $(window).trigger("addarea.initiate.sakai");
        });

        $(window).bind("toadd.addpeople.sakai", function(e, widgetid, data){
            var members = [];
            $.each(data, function(i, user) {
                var member = {
                    "user": user.userid,
                    "permission": user.permission
                };
                members.push(member);
            });
            if (members.length) {
                sakai.api.Groups.addUsersToGroup(groupId, members, sakai.api.User.data.me, false, function(){
                    $(window).trigger("usersselected.addpeople.sakai", [members]);
                });
            } else {
                $(window).trigger("usersselected.addpeople.sakai", []);
            }
        });

        $(window).bind("usersswitchedpermission.addpeople.sakai", function(e, widgetid, data){
            var rolesToDelete = [],
                rolesToAdd = [];
            $.each(data, function(i, user) {
                var member = {
                    "userid": user.userid,
                    "permission": user.originalPermission
                };
                rolesToDelete.push(member);
                var member2 = {
                    "user": user.userid,
                    "permission": user.permission
                };
                rolesToAdd.push(member2);
            });
            if (rolesToDelete.length) {
                sakai.api.Groups.changeUsersPermission(groupId, rolesToAdd, rolesToDelete, sakai.api.User.data.me);
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

    sakai.api.Widgets.Container.registerForLoad("group");
});
