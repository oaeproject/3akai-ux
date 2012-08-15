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

// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.mymemberships
     *
     * @class mymemberships
     *
     * @description
     * My Memberships lists the groups and worlds that a member is affiliated with
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.mymemberships = function(tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var mymemberships = {  // global widget data
            isOwnerViewing: false,
            sortOrder: 'modified',
            listStyle: 'list'
        };

        // DOM jQuery Objects
        var $rootel = $('#' + tuid);  // unique container for each widget instance
        var $mymemberships_items = $('#mymemberships_items', $rootel);
        var $mymemberships_nodata = $('#mymemberships_nodata', $rootel);
        var $mymemberships_nogroups = $('#mymemberships_nogroups', $rootel);
        var $mymemberships_actionbar = $('#mymemberships_actionbar', $rootel);
        var $mymemberships_sortby = $('#mymemberships_sortby', $rootel);
        var $mymemberships_item = $('.mymemberships_item', $rootel);
        var $mymemberships_show_grid = $('.s3d-listview-grid', $rootel);
        var $mymemberships_show_list = $('.s3d-listview-list', $rootel);
        var $mymemberships_nosearchresults = $('#mymemberships_nosearchresults');
        var $mymemberships_result_count = $('.s3d-search-result-count', $rootel);

        var currentQuery = '';

        ///////////////////////
        // Utility Functions //
        ///////////////////////

        /**
         * Compare the titles of 2 group objects
         *
         * @param {Object} a
         * @param {Object} b
         * @return 1, 0 or -1
         */
        var groupSortName = function(a, b) {
            if (a['sakai:group-title'].toLowerCase() > b['sakai:group-title'].toLowerCase()) {
                return 1;
            } else {
                if (a['sakai:group-title'].toLowerCase() === b['sakai:group-title'].toLowerCase()) {
                    return 0;
                } else {
                    return -1;
                }
            }
        };

        /**
         * Compare the modification date of 2 group objects
         *
         * @param {Object} a
         * @param {Object} b
         * @return 1, 0 or -1
         */
        var groupSortModified = function(a, b) {
            if (a['lastModified'] > b['lastModified']) {
                return 1;
            } else {
                if (a['lastModified'] === b['lastModified']) {
                    return 0;
                } else {
                    return -1;
                }
            }
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        $mymemberships_sortby.change(function() {
            var sortSelection = this.options[this.selectedIndex].value;
            if (sortSelection === 'desc') {
                mymemberships.sortOrder = 'desc';
                $.bbq.pushState({'mso': 'desc'});
            } else if (sortSelection === 'asc') {
                mymemberships.sortOrder = 'asc';
                $.bbq.pushState({'mso': 'asc'});
            } else {
                mymemberships.sortOrder = 'modified';
                $.bbq.pushState({'mso': 'modified'});
            }
            doInit();
        });

        ////////////////////////////////////////////
        // Data retrieval and rendering functions //
        ////////////////////////////////////////////

        /**
         * Renders the given groups
         *
         * @param {Object} groups  JSON containing group data
         */
        var render = function(groups) {
            if (!groups.entry.length) {
                $mymemberships_items.hide();
                sakai.api.Util.TemplateRenderer('mymemberships_nogroups_template', {isMe: mymemberships.isOwnerViewing}, $mymemberships_nogroups);
                $mymemberships_nogroups.show();
                $('.s3d-page-header-top-row', $rootel).hide();
                $('.s3d-page-header-bottom-row', $rootel).hide();
                return;
            } else {
                if (sakai.data.me.user.anon) {
                    $('.s3d-page-header-bottom-row', $rootel).hide();
                } else {
                    $('.s3d-page-header-top-row', $rootel).show();
                    $('.s3d-page-header-bottom-row', $rootel).show();
                }
                if (mymemberships.sortOrder === 'modified') {
                    groups.entry = groups.entry.sort(groupSortModified);
                    groups.entry.reverse();
                } else {
                    groups.entry = groups.entry.sort(groupSortName);
                    if (mymemberships.sortOrder === 'desc') {
                        groups.entry.reverse();
                    }
                }
                var groupData = [];
                var tempGroupData = sakai.api.Groups.prepareGroupsForRender(groups.entry, sakai.data.me);
                $.each(tempGroupData, function(i, group) {
                    var titleMatch = group['sakai:group-title'] && group['sakai:group-title'].toLowerCase().indexOf(currentQuery.toLowerCase()) >= 0;
                    var descriptionMatch = group['sakai:group-description'] && group['sakai:group-description'].toLowerCase().indexOf(currentQuery.toLowerCase()) >= 0;
                    var idMatch = group.groupid.toLowerCase().indexOf(currentQuery.toLowerCase()) >= 0;
                    if (titleMatch || descriptionMatch || idMatch) {
                        var groupType = sakai.api.i18n.getValueForKey('OTHER');
                        if (group['sakai:category']) {
                            sakai.api.Util.getTemplates(function(success, templates) {
                                if (success) {
                                    for (var c = 0; c < templates.length; c++) {
                                        if (templates[c].id === group['sakai:category']) {
                                            groupType = sakai.api.i18n.getValueForKey(templates[c].title);
                                        }
                                    }
                                } else {
                                    debug.error('Could not get the group templates');
                                }
                            });
                        }

                        groupData.push({
                            id: group.groupid,
                            url: '/~' + sakai.api.Util.makeSafeURL(group.groupid),
                            picPath: group.picPath,
                            picPathLarge: group.picPathLarge,
                            edit_url: '/dev/group_edit2.html?id=' + group.groupid,
                            title: group['sakai:group-title'],
                            titleShort: group['sakai:group-title-short'],
                            titleShorter: group['sakai:group-title-shorter'],
                            descShort: group['sakai:group-description-short'],
                            descShorter: group['sakai:group-description-shorter'],
                            type: groupType,
                            lastModified: group.lastModified,
                            contentCount: group.counts.contentCount,
                            membersCount: group.counts.membersCount,
                            tags: group.tagsProcessed,
                            userMember: sakai.api.Groups.isCurrentUserAMember(group.groupid,sakai.data.me),
                            joinable: group['sakai:group-joinable']
                        });
                    }
                });
                var json = {
                    groups: groupData,
                    isOwnerViewing: mymemberships.isOwnerViewing,
                    user_manages: function(group) {
                        if (!group) { return false; }
                        return sakai.api.Groups.isCurrentUserAManager(group.id, sakai.data.me);
                    },
                    sakai: sakai
                };
                $mymemberships_nodata.hide();
                $mymemberships_nogroups.hide();
                // Show message that no search results where returned.
                if (!json.groups.length) {
                    $mymemberships_nosearchresults.show();
                    $mymemberships_items.hide();
                } else {
                    $mymemberships_nosearchresults.hide();
                    $mymemberships_items.show();
                    $('#mymemberships_sortarea', $rootel).show();
                    $('#mymemberships_items', $rootel).html(sakai.api.Util.TemplateRenderer(
                        $('#mymemberships_items_template', $rootel), json));
                }

                // display search results count
                if (currentQuery && groupData.length) {
                    $mymemberships_result_count.show();
                    var resultLabel = sakai.api.i18n.getValueForKey('RESULTS');
                    if (groupData.length === 1) {
                        resultLabel = sakai.api.i18n.getValueForKey('RESULT');
                    }
                    $mymemberships_result_count.children('.s3d-search-result-count-label').text(resultLabel);
                    $mymemberships_result_count.children('.s3d-search-result-count-count').text(groupData.length);
                } else {
                    $mymemberships_result_count.hide();
                }

                // display functions available to logged in users
                if (!sakai.data.me.user.anon) {
                    $('.mymemberships_item_anonuser').hide();
                    $('.mymemberships_item_user_functions').show();
                }

                if (mymemberships.isOwnerViewing) {
                    // disable remove membership button if not allowed to leave
                    var groupsToCheck = [];
                    $.each(groups.entry, function(i, group) {
                        groupsToCheck.push(group.groupid);
                    });
                    sakai.api.Groups.isAllowedToLeave(groupsToCheck, sakai.data.me, function(leaveAllowed) {
                        $.each(leaveAllowed, function(groupid, canLeave) {
                            if (!canLeave) {
                                $('.mymemberships_leave[data-sakai-entityid="' + groupid + '"]').addClass('mymemberhips_disabled_leave');
                            }
                        });
                    });
                }
            }
        };

        var checkAddingEnabled = function() {
            if ($('.mymemberships_select_group_checkbox:checked')[0]) {
                $('#mymemberships_addpeople_button').removeAttr('disabled');
                $('#mymemberships_message_button').removeAttr('disabled');
            } else {
                $('#mymemberships_addpeople_button').attr('disabled', true);
                $('#mymemberships_message_button').attr('disabled', true);
                $('#mymemberships_select_checkbox').removeAttr('checked');
            }
        };

        var updateMessageAndAddToData = function() {
            var idArr = [];
            var titleArr = [];
            $.each($('.mymemberships_select_group_checkbox:checked'), function(i, group) {
                idArr.push($(group).attr('data-groupid'));
                titleArr.push($(group).attr('data-grouptitle'));
            });
            $('#mymemberships_message_button').attr('sakai-entityid', idArr);
            $('#mymemberships_message_button').attr('sakai-entityname', titleArr);
            $('#mymemberships_addpeople_button').attr('data-entityid', idArr);
            $('#mymemberships_addpeople_button').attr('data-entityname', titleArr);
        };

        var removeMembership = function(groupid,groupname) {
            sakai.api.Groups.getRole(sakai.data.me.user.userid,groupid,function(success,role) {
                sakai.api.Groups.leave(groupid,role,sakai.data.me,function(success) {
                    if (success) {
                        $(window).trigger('lhnav.updateCount', ['memberships', -1]);
                        sakai.api.Util.Modal.close('#mymemberships_delete_membership_dialog');
                        $('#mymemberships_item_'+groupid).fadeOut(false, function() {
                            // Show the default message if I have no remaining memberships
                            if ($('#mymemberships_items li:visible').length === 0) {
                                render({
                                    entry: []
                                });
                            }
                        });
                        sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('MY_MEMBERSHIPS','mymemberships'),
                            sakai.api.i18n.getValueForKey('YOU_HAVE_LEFT_GROUP','mymemberships').replace('${groupname}',groupname),
                            sakai.api.Util.notification.type.INFORMATION);
                    } else {
                        sakai.api.Util.Modal.close('#mymemberships_delete_membership_dialog');
                        sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('MY_MEMBERSHIPS','mymemberships'),
                            sakai.api.i18n.getValueForKey('ERROR_LEAVING_GROUP','mymemberships').replace('${groupname}',groupname),
                            sakai.api.Util.notification.type.ERROR);
                    }
                });
            });
        };

        var uncheckAll = function() {
            $('#mymemberships_select_checkbox').removeAttr('checked');
        };


        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        var handleHashChange = function() {
            if (sakai_global.profile.main.data.userid === sakai.data.me.user.userid) {
                mymemberships.isOwnerViewing = true;
                render(sakai.api.Groups.getMemberships(sakai.data.me.groups));
            } else {
                sakai.api.Server.loadJSON('/system/me', function(success, data) {
                    mymemberships.isOwnerViewing = false;
                    render(sakai.api.Groups.getMemberships(data.groups));
                }, { uid: sakai_global.profile.main.data.userid });
            }
            sakai.api.Util.TemplateRenderer('mymemberships_title_template', {
                isMe: mymemberships.isOwnerViewing,
                user: sakai.api.User.getFirstName(sakai_global.profile.main.data)
            }, $('#mymemberships_title_container', $rootel));

            uncheckAll();

            $('.s3d-listview-options', $rootel).find('div').removeClass('selected');
            mymemberships.listStyle = $.bbq.getState('ls') || 'list';
            if (mymemberships.listStyle === 'list') {
                $('#mymemberships_items', $rootel).removeClass('s3d-search-results-grid');
                $mymemberships_show_list.addClass('selected');
                $mymemberships_show_list.children().addClass('selected');
            } else {
                $('#mymemberships_items', $rootel).addClass('s3d-search-results-grid');
                $mymemberships_show_grid.addClass('selected');
                $mymemberships_show_grid.children().addClass('selected');
            }
        };

        var addBinding = function() {
            $(window).on('hashchanged.mymemberships.sakai', handleHashChange);

            $('#mymemberships_search_button').click(function() {
                var q = $.trim($('#mymemberships_livefilter').val());
                if (q !== currentQuery) {
                    $.bbq.pushState({'mq': q, 'mp': 1});
                    currentQuery = q;
                }
            });

            $mymemberships_show_list.click(function() {
                $.bbq.pushState({'ls': 'list'});
            });

            $mymemberships_show_grid.click(function() {
                $.bbq.pushState({'ls': 'grid'});
            });

            $('#mymemberships_livefilter').keyup(function(ev) {
                var q = $.trim($('#mymemberships_livefilter').val());
                if (q !== currentQuery && ev.keyCode === 13) {
                    $.bbq.pushState({'mq': q, 'mp': 1});
                    currentQuery = q;
                }
                return false;
            });

            $rootel.on('change', '#mymemberships_select_checkbox', function() {
                if ($(this).is(':checked')) {
                    $('#mymemberships_addpeople_button').removeAttr('disabled');
                    $('.mymemberships_select_group_checkbox').attr('checked', true);
                } else {
                    $('#mymemberships_addpeople_button').attr('disabled', true);
                    $('.mymemberships_select_group_checkbox').removeAttr('checked');
                }
                checkAddingEnabled();
                updateMessageAndAddToData();
            });

            $rootel.on('change', '.mymemberships_select_group_checkbox', function() {
                checkAddingEnabled();
                updateMessageAndAddToData();
            });

            sakai.api.Util.Modal.setup('#mymemberships_delete_membership_dialog', {
                modal: true,
                overlay: 20,
                toTop: true
            });

            $rootel.on('click', '.s3d-actions-delete', function() {
                if ($(this).hasClass('mymemberhips_disabled_leave')) {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('GROUP_MEMBERSHIP'),
                        sakai.api.i18n.getValueForKey('UNABLE_TO_LEAVE', 'mymemberships').replace('${groupname}', $(this).attr('data-sakai-entityname')),
                        sakai.api.Util.notification.type.ERROR);
                } else {
                    var msg = sakai.api.i18n.getValueForKey('ARE_YOU_SURE_YOU_WANT_TO_LEAVE', 'mymemberships').replace('${groupname}', '<span class="s3d-bold">' + $(this).data('sakai-entityname') + '</span>');
                    $('#mymemberships_are_you_sure').html(msg);
                    $('#mymemberships_delete_membership_confirm').attr('data-sakai-entityid', $(this).attr('data-sakai-entityid'));
                    $('#mymemberships_delete_membership_confirm').attr('data-sakai-entityname', $(this).attr('data-sakai-entityname'));
                    sakai.api.Util.Modal.open('#mymemberships_delete_membership_dialog');
                }
            });

            $('#mymemberships_delete_membership_confirm').on('click', function() {
                removeMembership($(this).attr('data-sakai-entityid'), $(this).attr('data-sakai-entityname'));
                updateMessageAndAddToData();
            });

            if (sakai_global.profile.main.data.userid !== sakai.data.me.user.userid) {
                    $('.searchgroups_result_plus',$rootel).on('click', function(ev) {
                    var joinable = $(this).data('group-joinable');
                    var groupid = $(this).attr('data-groupid');
                    var itemdiv = $(this);
                    sakai.api.Groups.addJoinRequest(groupid, function(success) {
                        if (success) {
                            var notimsg = '';
                            if (joinable === 'withauth') {
                                // Don't add green tick yet because they need to be approved.
                                notimsg = sakai.api.i18n.getValueForKey('YOUR_REQUEST_HAS_BEEN_SENT');
                            }
                            else  { // Everything else should be regular success
                                $('#searchgroups_memberimage_'+groupid).show();
                                notimsg = sakai.api.i18n.getValueForKey('SUCCESSFULLY_ADDED_TO_GROUP');
                            }
                            sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('GROUP_MEMBERSHIP'),
                                notimsg, sakai.api.Util.notification.type.INFORMATION);
                            itemdiv.removeClass('s3d-action-icon s3d-actions-addtolibrary searchgroups_result_plus');
                            $('#searchgroups_memberimage_' + groupid).show();
                        } else {
                            sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('GROUP_MEMBERSHIP'),
                                sakai.api.i18n.getValueForKey('PROBLEM_ADDING_TO_GROUP'),
                                sakai.api.Util.notification.type.ERROR);
                        }
                    });
                });
            }
        };

        /**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
        var doInit = function() {
            addBinding();
            currentQuery = $.bbq.getState('mq') || '';
            $('#mymemberships_livefilter').val(currentQuery);
            mymemberships.sortOrder = $.bbq.getState('mso') || 'modified';
            $('#mymemberships_sortby').val(mymemberships.sortOrder);
            mymemberships.listStyle = $.bbq.getState('ls') || 'list';

            handleHashChange();
        };

        // run the initialization function when the widget object loads
        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('mymemberships');
});
