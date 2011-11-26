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
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.addpeoplegroups
     *
     * @class addpeoplegroups
     *
     * @description
     * addpeoplegroups dialog box
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.addpeoplegroups = function(tuid, showSettings) {

        var $rootel = $("#" + tuid);
        var $addpeoplegroupsWidget = $("#addpeoplegroups_widget", $rootel);
        var addpeoplegroupsClose = ".addpeoplegroups_close";
        var addpeoplegroupsTrigger = ".addpeoplegroups_trigger";
        var addpeoplegroupsSave = "#addpeoplegroups_save";
        var targetSelectGroup = "addpeoplegroups_checkbox";
        var renderObj = {};
        var membershipFetched = 0;
        var selectedTitles = [];
        var selectedIDs = [];

        var getSelected = function(){
            var selected = [];
            if(selectedTitles.length > 1 && !$.isArray(selectedTitles)){
                selectedTitles = selectedTitles.split(",");
                selectedIDs = selectedIDs.split(",");
            }
            $.each(selectedTitles, function(i, title){
                selected.push({
                    id: selectedIDs[i],
                    title: title
                });
            });
            return selected;
        };

        var getSelectedIDs = function(){
            var selected = [];
            $.each(selectedTitles, function(i, select){
                selected.push(selectedIDs[i]);
            });
            return selected;
        };

        var renderTemplate = function(){
            $("#addpeoplegroups_container").html(sakai.api.Util.TemplateRenderer("addpeoplegroups_template", renderObj));
            $addpeoplegroupsWidget.toggle();
        };

        var selectedAlreadyLibraryMember = function(){
            $.each(getSelected(), function(i, group){
                if(sakai.api.Groups.isCurrentUserAMember(group.id, sakai.data.me)){
                    renderObj.libraryHasIt = true;
                }
            });
            renderTemplate();
        };

        /**
         * Determines if the selected groups are a part of any groups
         */
        var selectAlreadyGroupMember = function(){
            $.each(getSelected(), function(i, selectedGroup){
                $.each(renderObj.memberOfGroups.entry, function(j, memberOfGroup){
                    if($.inArray(selectedGroup.id, memberOfGroup.members) > -1 || $.inArray(selectedGroup.id, memberOfGroup.managers) > -1 || selectedGroup.id === memberOfGroup["sakai:group-id"]){
                       renderObj.memberOfGroups.entry[j].allSelectedAMember = true;
                    } else {
                        renderObj.memberOfGroups.entry[j].overrideAllSelectedAMember = true;
                    }
                });
            });
            selectedAlreadyLibraryMember();
        };

        /**
         * Gets memberships for all groups you're a member of to be able to match them to the selected groups
         */
        var getMemberships = function(){
            if(renderObj.memberOfGroups.entry.length){
                sakai.api.Groups.getMembers(renderObj.memberOfGroups.entry[membershipFetched].groupid, "query", function(success, data){
                    if(success){
                        renderObj.memberOfGroups.entry[membershipFetched].managers = [];
                        renderObj.memberOfGroups.entry[membershipFetched].members = [];
                        $.each(data["manager"].results, function(i, manager){
                            renderObj.memberOfGroups.entry[membershipFetched].managers.push(manager["rep:userId"] || manager.groupid);
                        });
                        $.each(data["member"].results, function(i, member){
                            renderObj.memberOfGroups.entry[membershipFetched].members.push(member["rep:userId"] || member.groupid);
                        });
                        membershipFetched++;
                        if(!(membershipFetched >= renderObj.memberOfGroups.entry.length)){
                            getMemberships();
                        } else {
                            selectAlreadyGroupMember();
                            membershipFetched = 0;
                        }
                    }
                });
            } else {
                renderTemplate();
            }
        };

        var toggleVisibility = function(){
            // Fill up initial values in object to send to renderer
            renderObj = {
                api: sakai.api,
                groups: getSelected(),
                libraryHasIt: false,
                memberOfGroups: sakai.api.Groups.getMemberships(filterManagedGroups()),
                worlds: sakai.config.worldTemplates
            };
            // Check if groups are part of my library
            if(!$addpeoplegroupsWidget.is(":visible")){
                getMemberships();
            } else {
                $addpeoplegroupsWidget.toggle();
            }
        };

        var saveMemberships = function(){
            $(addpeoplegroupsSave, $rootel).attr("disabled", true);
            var $addPeopleGroupsSelect = $("#addpeoplegroups_select");
            if(!$addPeopleGroupsSelect.children("option:selected").data("redirect") === true){
                var groupsToAdd = [];
                $.each(getSelected(), function(i, selectedGroup){
                    sakai.api.Groups.getGroupAuthorizableData($addPeopleGroupsSelect.val(), function(success, data){
                        groupsToAdd.push({
                            user: selectedGroup.id,
                            permission: data.properties["sakai:joinRole"]
                        });
                    });
                });
                sakai.api.Groups.addUsersToGroup($addPeopleGroupsSelect.val(), groupsToAdd, sakai.data.me);
                $(addpeoplegroupsSave, $rootel).removeAttr("disabled");
                toggleVisibility();
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("SUCCESSFULLY_ADDED", "addpeoplegroups"), sakai.api.Util.TemplateRenderer("addpeoplegroups_added_template", {
                    groupsToAdd: getSelected(),
                    groupToAddTo: $("#addpeoplegroups_select option[value='" + $addPeopleGroupsSelect.val() + "']").text()
                }));
            } else {
                document.location = "/create#l=" + $addPeopleGroupsSelect.val() + "&members=" + getSelectedIDs().toString();
            }
        };

        var addBinding = function(){
            sakai.api.Util.hideOnClickOut($addpeoplegroupsWidget, addpeoplegroupsTrigger + "," + addpeoplegroupsClose);
            $(addpeoplegroupsClose, $rootel).die("click", toggleVisibility);
            $(addpeoplegroupsClose, $rootel).live("click", toggleVisibility);
            $(addpeoplegroupsSave, $rootel).die("click", saveMemberships);
            $(addpeoplegroupsSave, $rootel).live("click", saveMemberships);
        };

        var filterManagedGroups = function(){
            var tempGroups = $.extend(true, [], sakai.data.me.groups);
            var filteredGroups = [];
            $.each(tempGroups, function(i, group){
                if(sakai.api.Groups.isCurrentUserAManager(group.groupid, sakai.data.me)){
                    filteredGroups.push(group);
                }
            });
            return filteredGroups;
        };

        var doInit = function(el){
            toggleVisibility();
            $addpeoplegroupsWidget.css("top", $(el).position().top + 30);
            $addpeoplegroupsWidget.css("left", $(el).position().left - ($addpeoplegroupsWidget.width() / 2) + ($(el).width() / 2 + 10) );
        };

        $(".addpeoplegroups_trigger").live("click", function(){
            selectedTitles = $(".addpeoplegroups_trigger:visible").data("entityname");
            selectedIDs = $(".addpeoplegroups_trigger:visible").data("entityid");
            if(!$addpeoplegroupsWidget.is(":visible")){
                addBinding();
                doInit(this);
            } else {
                toggleVisibility();
            }
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("addpeoplegroups");
});
