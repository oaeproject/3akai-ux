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

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

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
    sakai_global.newcreategroup = function(tuid, showSettings, widgetData) {

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var $rootel = $('#' + tuid);

    // Containers
    var $newcreategroupContainer = $('#newcreategroup_container', $rootel);
    var $newcreategroupGroupMembersNoneAddedContainer = $('#newcreategroup_group_members_none_added_container', $rootel);
    var $newcreategroupMembersAddedContainer = $('#newcreategroup_group_members_added_container', $rootel);

    // Elements
    var $newcreategroupCancelCreateButton = $('#newcreategroup_cancel_create', $rootel);
    var $newcreategroupGroupTitle = $('#newcreategroup_title', $rootel);
    var $newcreategroupSuggestedURL = $('#newcreategroup_suggested_url', $rootel);
    var $newcreategroupGroupDescription = $('#newcreategroup_description', $rootel);
    var $newcreategroupGroupTags = $('#newcreategroup_tags', $rootel);
    var $newcreategroupSuggestedURLBase = $('#newcreategroup_suggested_url_base', $rootel);
    var $newcreategroupCanBeFoundIn = $('#newcreategroup_can_be_found_in', $rootel);
    var $newcreategroupGroupMembership = $('#newcreategroup_membership', $rootel);
    var $newcreategroupAddPeople = $('.newcreategroup_add_people', $rootel);
    var newcreategroupMembersMessage = '#newcreategroup_members_message';
    var $newcreategroup_members_message_template_unprocessed = $('#newcreategroup_members_message_template_unprocessed', $rootel);

    // Forms
    var $newcreategroupGroupForm = $('#newcreategroup_group_form', $rootel);

    // Templates
    var newcreategroupMembersSelectedTemplate = 'newcreategroup_group_members_selected_template';
    var newcreategroupMembersMessageTemplate = 'newcreategroup_members_message_template';

    var selectedUsers = {},
        currentTemplate = false,
        templatePath = false,
        translatedRoles = {};

    var renderShareMessage = function() {
        $(newcreategroupMembersMessage, $rootel).html(sakai.api.Util.TemplateRenderer(newcreategroupMembersMessageTemplate, {
            'creatorName' : sakai.api.User.getDisplayName(sakai.data.me.profile),
            'groupName' : sakai.api.Security.safeOutput($newcreategroupGroupTitle.val() || ''),
            'link': sakai.config.SakaiDomain + '/~' + sakai.api.Util.makeSafeURL($newcreategroupSuggestedURL.val() || '')
        }));
    };

    var getTranslatedRoles = function() {
        if (currentTemplate.roles) {
            var roles = [];
            $.each(currentTemplate.roles, function(i,role) {
                translatedRoles[role.id] = role.title;
            });
        }
    };

    var createUsersToAddObject = function() {
        var users = [];
        $.each(selectedUsers, function(index, item) {
            users.push({
                'name': item.name,
                'firstName': item.firstName || item.name,
                'userid': item.userid,
                'role': item.permission,
                'roleString': translatedRoles[item.permission]
            });
        });
        users.push({
            'name': sakai.api.User.getDisplayName(sakai.data.me.profile),
            'userid': sakai.data.me.user.userid,
            'role': currentTemplate.creatorRole,
            'roleString': translatedRoles[currentTemplate.creatorRole],
            'creator': true
        });
        return users;
    };

    var checkDefaultContentAdded = function(contentToAdd, count) {
        return !$.isArray(contentToAdd) || contentToAdd.length - 1 === count;
    };

    var setDefaultContent = function(groupid) {
        var contentToAdd = $.bbq.getState('contentToAdd');
        if (contentToAdd.length > 1 && !$.isArray(contentToAdd)) {
            contentToAdd = contentToAdd.split(',');
        }
        var count = 0;
        $.each(contentToAdd, function(i, contentId) {
            sakai.api.Content.addToLibrary(contentId, groupid, false, function(contentId, entityId) {
                if (checkDefaultContentAdded(contentToAdd, count)) {
                    window.location = '/~' + groupid;
                } else {
                    count++;
                }
            });
        });
    };

    /**
     * Create a simple group and execute the tagging and membership functions
     */
    var doCreateSimpleGroup = function() {
        sakai.api.Util.progressIndicator.showProgressIndicator(
            sakai.api.i18n.getValueForKey('CREATING_YOUR_GROUP', 'newcreategroup').replace(/\$\{type\}/, sakai.api.i18n.getValueForKey(currentTemplate.title)),
            sakai.api.i18n.getValueForKey('PROCESSING_GROUP', 'newcreategroup')
        );
        var grouptitle = $newcreategroupGroupTitle.val() || '';
        var groupdescription = $newcreategroupGroupDescription.val() || '';
        var groupid = sakai.api.Util.makeSafeURL($newcreategroupSuggestedURL.val(), '-');
        var grouptags = sakai.api.Util.AutoSuggest.getTagsAndCategories( $newcreategroupGroupTags, true );
        var users = createUsersToAddObject();
        var subject = sakai.api.i18n.getValueForKey('USER_HAS_ADDED_YOU_AS_A_ROLE_TO_THE_GROUP_GROUPNAME', 'newcreategroup').replace('<\'Role\'>', '${role}');
        var body = $.trim($newcreategroup_members_message_template_unprocessed.text().replace('<\'Role\'>', '${role}').replace('<\'First Name\'>', '${firstName}'));
        var joinable = $newcreategroupGroupMembership.val();
        var visible = $newcreategroupCanBeFoundIn.val();
        sakai.api.Groups.createGroup(groupid, grouptitle, groupdescription, grouptags, users, joinable, visible, templatePath, subject, body, sakai.data.me, function(success, groupData, nameTaken) {
            if (success) {
                if ($.bbq.getState('contentToAdd')) {
                    setDefaultContent(groupid);
                } else {
                    window.location = '/~' + groupid;
                }
            } else {
                var errorMessage = sakai.api.i18n.getValueForKey('GROUP_NOT_SUCCESSFULLY_CREATED', 'newcreategroup').replace(/\$\{title\}/, grouptitle);
                if (groupData.errorMessage) {
                    errorMessage = errorMessage + sakai.api.i18n.getValueForKey(groupData.errorMessage, 'newcreategroup');
                }
                $newcreategroupContainer.find('select, input, textarea:not([class*="as-input"]), button').removeAttr('disabled');
                sakai.api.Util.progressIndicator.hideProgressIndicator();
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('AN_ERROR_OCCURRED', 'newcreategroup'),
                    errorMessage,
                    sakai.api.Util.notification.type.ERROR);
            }
        });
    };

    /**
     * Intialize the add people widget
     * @param {Boolean} openDialog Whether you want to open the dialog
     */
    var initializeAddPeople = function(openDialog) {
        $(document).trigger('init.addpeople.sakai', {
            editingGroup: false,
            openDialog: openDialog
        });
    };

    /**
     * Add binding to the elements and validate the forms on submit
     */
    var addBinding = function() {
        var validateOpts = {
            'methods': {
                'uniquegroupname': {
                    'method': function(value, element) {
                        return !sakai.api.Groups.checkIfGroupExists(value);
                    },
                    'text': sakai.api.i18n.getValueForKey('THIS_GROUP_HAS_BEEN_TAKEN', 'newcreategroup')
                }
            },
            rules: {
                newcreategroup_title: {
                    maxlength: 255
                },
                newcreategroup_suggested_url: {
                    maxlength: 255
                }
            },
            submitHandler: function(form) {
                $newcreategroupContainer.find('select, input, textarea:not([class*="as-input"]), button').attr('disabled', 'disabled');
                doCreateSimpleGroup();
            }
        };
        // Initialize the validate plug-in
        sakai.api.Util.Forms.validate($newcreategroupGroupForm, validateOpts, true);
        sakai.api.Util.AutoSuggest.setupTagAndCategoryAutosuggest($newcreategroupGroupTags, null, $('.list_categories', $rootel));
        $newcreategroupGroupTitle.on('keyup', function() {
            var suggestedURL = sakai.api.Util.makeSafeURL($(this).val().toLowerCase(), '-');
            $newcreategroupSuggestedURL.val(suggestedURL);
            $newcreategroupSuggestedURLBase.attr('title', window.location.protocol + '//' + window.location.host + '/~' + suggestedURL);
            renderShareMessage();
        });

        $newcreategroupSuggestedURL.on('blur', function() {
            var suggestedURL = sakai.api.Util.makeSafeURL($(this).val(), '-');
            $newcreategroupSuggestedURL.val(suggestedURL);
            renderShareMessage();
        });

        $(document).on('click', '.newcreategroup_add_people', initializeAddPeople);

        // We also need to intialize the add people widget but not show the dialog
        // when there is a query parameter called 'members'
        if ($.bbq.getState('members')) {
            initializeAddPeople(false);
        }

    };

    /**
     * Initialize the create group widget
     */
    var doInit = function() {
        sakai.api.Groups.getTemplate(widgetData.category, widgetData.id, function(success, template, templates) {
            if (success) {
                currentTemplate = $.extend(true, {}, template);
                currentTemplate.roles = sakai.api.Groups.getRoles(currentTemplate, true);
                getTranslatedRoles();
                templatePath = '/var/templates/worlds/' + widgetData.category + '/' + widgetData.id;
                $('.newcreategroup_template_name', $rootel).text(sakai.api.i18n.getValueForKey(currentTemplate.title));
                if (widgetData.singleTemplate === true) {
                    $newcreategroupCancelCreateButton.hide();
                }
                $newcreategroupSuggestedURLBase.text(
                    sakai.api.Util.applyThreeDots(window.location.protocol + '//' + window.location.host + '/~', 105, {
                        'middledots': true
                    }, null, true)
                );
                $newcreategroupSuggestedURLBase.attr('title', window.location.protocol + '//' + window.location.host + '/~');

                var category = false;
                for (var i = 0; i < templates.length; i++) {
                    if (templates[i].id === widgetData.category) {
                        category = templates[i];
                        break;
                    }
                }
                var defaultaccess = currentTemplate.defaultaccess || sakai.config.Permissions.Groups.defaultaccess;
                var defaultjoin = currentTemplate.defaultjoin || sakai.config.Permissions.Groups.defaultjoin;

                $('#newcreategroup_can_be_found_in option[value="' + defaultaccess + '"]', $rootel).attr('selected', 'selected');
                $('#newcreategroup_membership option[value="' + defaultjoin + '"]', $rootel).attr('selected', 'selected');

                sakai_global.selecttemplate.currentTemplate = currentTemplate;

                $newcreategroupContainer.show();
                addBinding();
            } else {
                debug.error('Could not get the group template');
            }
        });
    };

    $newcreategroupCancelCreateButton.on('click', function() {
        $.bbq.pushState({'_r': Math.random()});
    });

    $(window).on('toadd.addpeople.sakai', function(ev, initTuid, users) {
        selectedUsers = $.extend(true, {}, users);
        $newcreategroupMembersAddedContainer.html(sakai.api.Util.TemplateRenderer(newcreategroupMembersSelectedTemplate, {
            'users': selectedUsers,
            'roles': currentTemplate.roles,
            'sakai': sakai
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
    });

    doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('newcreategroup');

});
