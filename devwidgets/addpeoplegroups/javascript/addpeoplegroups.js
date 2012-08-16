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

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

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

        var $rootel = $('#' + tuid);
        var $addpeoplegroupsWidget = $('#addpeoplegroups_widget', $rootel);
        var addpeoplegroupsClose = '.addpeoplegroups_close';
        var addpeoplegroupsTrigger = '.addpeoplegroups_trigger';
        var addpeoplegroupsSave = '#addpeoplegroups_save';
        var targetSelectGroup = 'addpeoplegroups_checkbox';
        var renderObj = {};
        var membershipFetched = 0;
        var selectedTitles = [];
        var selectedIDs = [];

        var getSelected = function() {
            var selected = [];
            if (selectedTitles.length > 1 && !$.isArray(selectedTitles)) {
                selectedTitles = selectedTitles.split(',');
                selectedIDs = selectedIDs.split(',');
            }
            $.each(selectedTitles, function(i, title) {
                selected.push({
                    id: selectedIDs[i],
                    title: title
                });
            });
            return selected;
        };

        var getSelectedIDs = function() {
            var selected = [];
            $.each(selectedIDs, function(i, id) {
                if (id !== sakai.data.me.user.userid) {
                    selected.push(id);
                }
            });
            return selected;
        };

        var renderTemplate = function() {
            $('#addpeoplegroups_container').html(sakai.api.Util.TemplateRenderer('addpeoplegroups_template', renderObj));
            $addpeoplegroupsWidget.toggle();
        };

        /**
         * Determines if the selected groups are a part of any groups
         */
        var selectAlreadyGroupMember = function() {
            $.each(renderObj.memberOfGroups.entry, function(j, memberOfGroup) {
                var alreadyMember = true;
                $.each(getSelected(), function(i, selectedAuthorizable) {
                    if ($.inArray(selectedAuthorizable.id, memberOfGroup.members) === -1 && selectedAuthorizable.id !== memberOfGroup['sakai:group-id']) {
                        alreadyMember = false;
                    }
                });
                memberOfGroup.alreadyMember = alreadyMember;
            });
            renderTemplate();
        };

        /**
         * Gets memberships for all groups you're a member of to be able to match them to the selected groups
         */
        var getMemberships = function() {
            var groupsToFetch = [];
            var membershipsManage = [];
            $.each(renderObj.memberOfGroups.entry, function(index, item) {
                groupsToFetch.push(item['sakai:group-id']);
            });
            if (renderObj.memberOfGroups.entry.length) {
                // First fetch the group info so we can tell whether the current user can manage any of the groups
                sakai.api.Groups.getGroupAuthorizableData(groupsToFetch, function(success, groupData) {
                    $.each(groupData, function(index, group) {
                        $.each(renderObj.memberOfGroups.entry, function(m, membership) {
                            if (membership['sakai:group-id'] === group.properties['sakai:group-id']) {
                                membership.canManage = false;
                                var roles = sakai.api.Groups.getRoles({'roles': $.parseJSON(group.properties['sakai:roles'])}, true);
                                $.each(roles, function(r, role) {
                                    if (role.isManagerRole) {
                                        var isMember = sakai.api.Groups.isCurrentUserAMember(membership['sakai:group-id'] + '-' + role.id, sakai.data.me);
                                        if (isMember) {
                                            membership.canManage = true;
                                        }
                                    }
                                });
                                if (membership.canManage) {
                                    membershipsManage.push(membership);
                                }
                            }
                        });
                    });
                    // Now fetch all members of all groups
                    renderObj.memberOfGroups.entry = membershipsManage;
                    sakai.api.Groups.getMembers(groupsToFetch, function(success, data) {
                        $.each(renderObj.memberOfGroups.entry, function(g, membership) {
                            membership.members = [];
                            var groupRoles = data[membership['sakai:group-id']] || {};
                            $.each(groupRoles, function(r, role) {
                                $.each(role.results, function(u, user) {
                                    membership.members.push(user['rep:userId'] || user.groupid);
                                });
                            });
                        });
                        selectAlreadyGroupMember();
                    });
                });
            } else {
                renderTemplate();
            }
        };

        var toggleVisibility = function() {
            sakai.api.Util.getTemplates(function(success, templates) {
                if (success) {
                    // Fill up initial values in object to send to renderer
                    renderObj = {
                        api: sakai.api,
                        groups: getSelected(),
                        memberOfGroups: sakai.api.Groups.getMemberships(sakai.data.me.groups),
                        worlds: templates
                    };
                    // Check if groups are part of my library
                    if (!$addpeoplegroupsWidget.is(':visible')) {
                        getMemberships();
                    } else {
                        $addpeoplegroupsWidget.toggle();
                    }
                } else {
                    debug.error('Could not get the group templates');
                }
            });
        };

        var saveMemberships = function() {
            $(addpeoplegroupsSave, $rootel).attr('disabled', true);
            var $addPeopleGroupsSelect = $('#addpeoplegroups_select');
            if (!$addPeopleGroupsSelect.children('option:selected').data('redirect') === true) {
                var groupsToAdd = [];
                $.each(getSelected(), function(i, selectedGroup) {
                    sakai.api.Groups.getGroupAuthorizableData($addPeopleGroupsSelect.val(), function(success, data) {
                        data = data[$addPeopleGroupsSelect.val()];
                        groupsToAdd.push({
                            user: selectedGroup.id,
                            permission: data.properties['sakai:joinRole']
                        });
                    });
                });
                sakai.api.Groups.addUsersToGroup($addPeopleGroupsSelect.val(), groupsToAdd, sakai.data.me);
                $(addpeoplegroupsSave, $rootel).removeAttr('disabled');
                toggleVisibility();
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('SUCCESSFULLY_ADDED', 'addpeoplegroups'), sakai.api.Util.TemplateRenderer('addpeoplegroups_added_template', {
                    groupsToAdd: getSelected(),
                    groupToAddTo: $('#addpeoplegroups_select option[value="' + $addPeopleGroupsSelect.val() + '"]').text()
                }));
            } else {
                document.location = '/create#l=' + $addPeopleGroupsSelect.val() + '&members=' + getSelectedIDs().toString();
            }
        };

        var addBinding = function() {
            sakai.api.Util.hideOnClickOut($addpeoplegroupsWidget, addpeoplegroupsTrigger + ',' + addpeoplegroupsClose);
            $(addpeoplegroupsClose, $rootel).off('click', toggleVisibility);
            $(addpeoplegroupsClose, $rootel).on('click', toggleVisibility);
            $(addpeoplegroupsSave, $rootel).off('click', saveMemberships);
            $(addpeoplegroupsSave, $rootel).on('click', saveMemberships);
        };

        var doInit = function(el) {
            $el = $(el);
            toggleVisibility();
            $addpeoplegroupsWidget.css('top', $el.position().top + 24);
            $addpeoplegroupsWidget.css('left', $el.position().left - ($addpeoplegroupsWidget.width() / 2) + ($el.width() / 2 + 10) );
        };

        $(document).on('click', '.addpeoplegroups_trigger', function() {
            selectedTitles = $('.addpeoplegroups_trigger:visible').attr('data-entityname');
            selectedIDs = $('.addpeoplegroups_trigger:visible').attr('data-entityid');
            if (!$addpeoplegroupsWidget.is(':visible')) {
                addBinding();
                doInit(this);
            } else {
                toggleVisibility();
            }
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('addpeoplegroups');
});
