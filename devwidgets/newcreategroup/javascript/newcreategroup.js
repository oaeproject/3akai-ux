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

/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/jquery/plugins/jquery.validate.sakai-edited.js (validate)
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.newcreategroup
     *
     * @class newcreategroup
     *
     * @description
     * newcreategroup widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.newcreategroup = function(tuid, showSettings, widgetData){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////
    
    var $rootel = $("#" + tuid);

    // Containers
    var $newcreategroupContainer = $("#newcreategroup_container", $rootel);
    var $newcreategroupGroupMembersNoneAddedContainer = $("#newcreategroup_group_members_none_added_container", $rootel);
    var $newcreategroupMembersAddedContainer = $("#newcreategroup_group_members_added_container", $rootel);

    // Elements
    var $newcreategroupCreateSimpleGroupButton = $(".newcreategroup_create_simple_group", $rootel);
    var $newcreategroupCancelCreateButton = $("#newcreategroup_cancel_create", $rootel);
    var $newcreategroupGroupTitle = $("#newcreategroup_title", $rootel);
    var $newcreategroupSuggestedURL = $("#newcreategroup_suggested_url", $rootel);
    var $newcreategroupGroupDescription = $("#newcreategroup_description", $rootel);
    var $newcreategroupGroupTags = $("#newcreategroup_tags", $rootel);
    var $newcreategroupSuggestedURLBase = $("#newcreategroup_suggested_url_base", $rootel);
    var $newcreategroupCanBeFoundIn = $("#newcreategroup_can_be_found_in", $rootel);
    var $newcreategroupGroupMembership = $("#newcreategroup_membership", $rootel);
    var $newcreategroupAddPeople = $(".newcreategroup_add_people", $rootel);
    var newcreategroupMembersMessage = "#newcreategroup_members_message";

    // Forms
    var $newcreategroupGroupForm = $("#newcreategroup_group_form", $rootel);

    // Templates
    var newcreategroupMembersSelectedTemplate = "newcreategroup_group_members_selected_template";
    var newcreategroupMembersMessageTemplate = "newcreategroup_members_message_template";

    var selectedUsers = {};
    var currentTemplate = false;
    var creationComplete = {
        "tags": false,
        "permissions": false,
        "members": false,
        "message": false,
        "groupid": false
    };

    var renderShareMessage = function(){
        $(newcreategroupMembersMessage, $rootel).html(sakai.api.Util.TemplateRenderer(newcreategroupMembersMessageTemplate, {
            "user" : sakai.api.User.getDisplayName(sakai.data.me.profile),
            "groupName" : $newcreategroupGroupTitle.val() || "",
            "groupURL": window.location.protocol + "//" + window.location.host + "/~" + sakai.api.Util.makeSafeURL($newcreategroupSuggestedURL.val(), "-") || ""
        }));
    };

    /**
     * If the group has been fully created the user is redirected to the group.
     * Checking for tags, permissions and members before redirecting.
     */
    var checkCreationComplete = function(){
        if(creationComplete.tags && creationComplete.permissions && creationComplete.members && creationComplete.message && creationComplete.docs){
            window.location = "/~" + creationComplete.groupid;
        }
    };

    /**
     * Create a simple group and execute the tagging and membership functions
     */
    var doCreateSimpleGroup = function(){
        var grouptitle = $newcreategroupGroupTitle.val() || "";
        var groupdescription = $newcreategroupGroupDescription.val() || "";
        var groupid = sakai.api.Util.makeSafeURL($newcreategroupSuggestedURL.val(), "-");
        var grouptags = $newcreategroupGroupTags.val().split(",");
        sakai.api.Groups.createGroup(groupid, grouptitle, groupdescription, sakai.data.me, currentTemplate, widgetData.category, function(success, groupData, nameTaken){
            if (success) {
                creationComplete.groupid = groupid;

                // Tag group
                var groupProfileURL = "/~" + groupid + "/public/authprofile";
                sakai.api.Util.tagEntity(groupProfileURL, grouptags, [], function(){
                    creationComplete.tags = true;
                    checkCreationComplete();
                });

                // Set permissions on group
                var joinable = $newcreategroupGroupMembership.val();
                var visible = $newcreategroupCanBeFoundIn.val();
                var roles = $.parseJSON(groupData["sakai:roles"]);
                sakai.api.Groups.setPermissions(groupid, joinable, visible, roles, function(){
                    creationComplete.permissions = true;
                    checkCreationComplete();
                });

                // Set members and managers on group
                var users = [];
                $.each(selectedUsers, function(index, item){
                    users.push({
                        "name": item.name,
                        "user": item.userid,
                        "permission": item.permission
                    });
                });
                if (users.length > 0) {
                    sakai.api.Groups.addUsersToGroup(groupid, false, users, sakai.data.me, false, function(){
                        creationComplete.members = true;
                        checkCreationComplete();
                    });
                    $.each(users, function(index, item){
                        sakai.api.Communication.sendMessage(item.user, sakai.data.me, sakai.api.i18n.Widgets.getValueForKey("newcreategroup","","USER_HAS_ADDED_YOU_AS_A_ROLE_TO_THE_GROUP_GROUPNAME").replace("${user}", sakai.api.User.getDisplayName(sakai.data.me.profile)).replace("<\"Role\">", item.permission).replace("${groupName}", grouptitle), $(newcreategroupMembersMessage, $rootel).text().replace("<\"Role\">", item.permission).replace("<\"First Name\">", item.name), "message", false, false, true, "group_invitation",{"groupTitle":grouptitle,"groupId":groupid});
                        if(users.length - 1 == index){
                            creationComplete.message = true;
                            checkCreationComplete();
                        }
                    });
                } else {
                    creationComplete.members = true;
                    creationComplete.message = true;
                    checkCreationComplete();
                }
                createGroupDocs(groupid, currentTemplate);

            } else {
                if(nameTaken){
                    sakai.api.Util.notification.show(sakai.api.i18n.Widgets.getValueForKey("newcreategroup","","GROUP_TAKEN"), sakai.api.i18n.Widgets.getValueForKey("newcreategroup","","THIS_GROUP_HAS_BEEN_TAKEN"));
                }
                $newcreategroupContainer.find("select, input, textarea, button").removeAttr("disabled");
            }
        });
    };

    var createGroupDocs = function(groupid, currentTemplate){
        replaceTemplateParameters({"groupid": groupid}, groupid, currentTemplate, function(groupid, currentTemplate){
            createSakaiDocs(groupid, currentTemplate, function(groupid, currentTemplate){
                fillSakaiDocs(groupid, currentTemplate, function(groupid, currentTemplate){
                    setSakaiDocPermissions(groupid, currentTemplate, function(groupid, currentTemplate){
                        addStructureToGroup(groupid, currentTemplate, function(){
                            creationComplete.docs = true;
                            checkCreationComplete();
                        });
                    });
                });
            });
        });
    };

    var replaceTemplateParameters = function(variables, groupid, currentTemplate, callback){
        for (var variable in variables){
            for (var doc in currentTemplate.docs){
                currentTemplate.docs[doc] = loopAndReplace(currentTemplate.docs[doc], variable, variables[variable]);
            }
        }
        callback(groupid, currentTemplate);
    };

    var loopAndReplace = function(structure, variable, replace){
        for (var i in structure){
            if (structure.hasOwnProperty(i)){
                if (typeof structure[i] === "string"){
                    structure[i] = structure[i].replace("${" + variable + "}", replace);
                } else if (typeof structure[i] === "object"){
                    structure[i] = loopAndReplace(structure[i], variable, replace);
                }
            }
        }
        return structure;
    };

    var addStructureToGroup = function(groupid, currentTemplate, callback){
        for (var doc in currentTemplate.structure) {
            var definition = currentTemplate.structure[doc];
            delete definition._docref;
            definition._view = $.toJSON(definition._view);
            definition._edit = $.toJSON(definition._edit);
        }
        $.ajax({
            url: "/~" + groupid + "/docstructure",
            type: "POST",
            data: {
                ":operation": "import",
                ":contentType": "json",
                ":replace": true,
                ":replaceProperties": true,
                "_charset_": "utf-8",
                ":content": $.toJSON({
                    "structure0": $.toJSON(currentTemplate.structure)
                })
            },
            success: function(){
                callback();
            }
        });
    }

    var setSakaiDocPermissions = function(groupid, currentTemplate, callback){
        var filesArray = {};
        for (var doc in currentTemplate.structure){
            var definition = currentTemplate.structure[doc];
            var permission = "private";
            if ($.inArray("anonymous", definition._view) !== -1 && $newcreategroupCanBeFoundIn.val() === "public"){
                permission = "public";
            } else if ($.inArray("everyone", definition._view) !== -1 && ($newcreategroupCanBeFoundIn.val() === "public" || $newcreategroupCanBeFoundIn.val() === "logged-in-only")){
                permission = "everyone";
            }
            filesArray[definition._pid] = {
                "hashpath": definition._pid,
                "permissions": permission
            }
        }
        sakai.api.Content.setFilePermissions(filesArray, function(){
            var batchRequests = [];
            for (var doc in currentTemplate.structure) {
                var definition = currentTemplate.structure[doc];
                for (var i = 0; i < definition._view.length; i++){
                    if (definition._view[i].substring(0, 1) === "-") {
                        batchRequests.push({
                            "url": "/p/" + definition._pid + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":viewer": groupid + definition._view[i]
                            }
                        });
                    }
                }
                for (var i = 0; i < definition._edit.length; i++){
                    if (definition._edit[i].substring(0, 1) === "-") {
                        batchRequests.push({
                            "url": "/p/" + definition._pid + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":manager": groupid + definition._edit[i]
                            }
                        });
                    }
                }
            }
            sakai.api.Server.batch(batchRequests, function(success, data) {
                if (success) {
                    callback(groupid, currentTemplate);
                }
            });
        });
    };

    var fillSakaiDocs = function(groupid, currentTemplate, callback){
        var batchRequests = [];
        for (var doc in currentTemplate.structure){
            var definition = currentTemplate.structure[doc];
            var toCreate = currentTemplate.docs[definition._docref];
            delete toCreate.structure0;
            batchRequests.push({
                url: "/p/" + definition._pid + ".resource",
                method: "POST",
                parameters: {
                    ":operation": "import",
                    ":contentType": "json",
                    ":replace": true,
                    ":replaceProperties": true,
                    "_charset_": "utf-8",
                    ":content": $.toJSON(toCreate)
                }
            });
        }
        sakai.api.Server.batch(batchRequests, function(success, data) {
            if (success) {
                callback(groupid, currentTemplate);
            }
        });
    };

    var createSakaiDocs = function(groupid, currentTemplate, callback){
        var batchRequests = [];
        for (var doc in currentTemplate.structure){
            var definition = currentTemplate.structure[doc];
            var permission = "private";
            if ($.inArray("anonymous", definition._view) !== -1 && $newcreategroupCanBeFoundIn.val() === "public"){
                permission = "public";
            } else if ($.inArray("everyone", definition._view) !== -1 && ($newcreategroupCanBeFoundIn.val() === "public" || $newcreategroupCanBeFoundIn.val() === "logged-in-only")){
                permission = "everyone";
            }
            var toCreate = currentTemplate.docs[definition._docref];
            batchRequests.push({
                url: "/system/pool/createfile",
                method:"POST",
                parameters: {
                    "sakai:pooled-content-file-name": definition._title,
                    "sakai:description": "",
                    "sakai:permissions": permission,
                    "sakai:copyright": "creativecommons",
                    "structure0": $.toJSON(toCreate.structure0),
                    "sakai:custom-mimetype": "x-sakai/document"
                }
            });
        }
        sakai.api.Server.batch(batchRequests, function(success, data) {
            if (success) {
                var count = 0;
                for (var doc in currentTemplate.structure){
                    var response = $.parseJSON(data.results[count].body);
                    currentTemplate.structure[doc]._pid = response._contentItem.poolId;
                    count++;
                }
                callback(groupid, currentTemplate);
            }
        });
    }

    /**
     * Add binding to the elements and validate the forms on submit
     */
    var addBinding = function(){
        $newcreategroupCreateSimpleGroupButton.bind("click", function(){
            $newcreategroupGroupForm.validate({
                submitHandler: function(form){
                    $newcreategroupContainer.find("select, input, textarea, button").attr("disabled","disabled");
                    doCreateSimpleGroup();
                }
            });
            $newcreategroupGroupForm.submit();
        });

        $newcreategroupGroupTitle.bind("keyup", function(){
            var suggestedURL = sakai.api.Util.makeSafeURL($(this).val(), "-");
            $newcreategroupSuggestedURL.val(suggestedURL);
            renderShareMessage();
        });

        $newcreategroupSuggestedURL.bind("blur", function(){
            var suggestedURL = sakai.api.Util.makeSafeURL($(this).val(), "-");
            $newcreategroupSuggestedURL.val(suggestedURL);
            renderShareMessage();
        });

        $newcreategroupAddPeople.live("click", function(){
            $(window).trigger("init.addpeople.sakai", [tuid]);
        });
    };

    /**
     * Initialize the create group widget
     */
    var doInit = function(){
        currentTemplate = sakai.api.Groups.getTemplate(widgetData.category, widgetData.id);
        $(".newcreategroup_template_name", $rootel).text(currentTemplate.title);
        $newcreategroupSuggestedURLBase.text(window.location.protocol + "//" + window.location.host + "/~");
        if (sakai.config.Permissions.Groups.defaultaccess){
            $("#newcreategroup_can_be_found_in [value=" + sakai.config.Permissions.Groups.defaultaccess + "]", $rootel).attr("selected", "selected");
        }
        $newcreategroupContainer.show();
        addBinding();
    };

    $newcreategroupCancelCreateButton.bind("click", function(){
        $.bbq.pushState({"_r": Math.random()});
    });

    $(window).bind("sakai.addpeople.usersselected", function(ev, initTuid, users){
        if (initTuid === tuid) {
            selectedUsers = $.extend(true, {}, users);
            $newcreategroupMembersAddedContainer.html(sakai.api.Util.TemplateRenderer(newcreategroupMembersSelectedTemplate, {
                "users": selectedUsers,
                "roles": currentTemplate.roles
            }));
            var count = 0;
            for (var item in selectedUsers) {
                count++;
            }
            if (count) {
                renderShareMessage();
                $newcreategroupGroupMembersNoneAddedContainer.hide();
                $newcreategroupMembersAddedContainer.show();
            } else {
                $newcreategroupGroupMembersNoneAddedContainer.show();
                $newcreategroupMembersAddedContainer.hide();
            }
        }
    });

    doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("newcreategroup");

});
