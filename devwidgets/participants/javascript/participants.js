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
     * @name sakai_global.participants
     *
     * @class participants
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.participants = function(tuid, showSettings, widgetData) {

        var rootel = $('#' + tuid);

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////
        var infinityScroll = false;

        // Containers
        var $participantsListContainer = $('#participants_list_container_list', rootel);

        // Templates
        var participantsListTemplate = 'participants_list_template';
        var participantsListTemplateEmpty = 'participants_list_empty_template';

        // Elements
        var $participantsSearchField = $('#participants_search_field', rootel);
        var participantsListParticipantRequestConnection = '.participants_list_participant_request_connection';
        var $participantsSelectAll = $('#participants_select_all', rootel);
        var participantsListParticipantCheckbox = '.participants_list_participant_checkbox input:checkbox';
        var $participantsSendSelectedMessage = $('#participants_send_selected_message', rootel);
        var $participantsAddPeopleButton = $('#participants_addpeople_button', rootel);
        var participantsListParticipantName = '.participants_list_participant_name';
        var $participants_sort_by = $('#participants_sort_by', rootel);
        var participantsShowGrid = $('.s3d-listview-grid', rootel);
        var participantsShowList = $('.s3d-listview-list', rootel);
        widgetData.listStyle = 'list';
        widgetData.query = '';
        widgetData.sortby = 'asc';

        var newlyAdded = [],
            roles = false;

        ///////////////////////
        // Utility functions //
        ///////////////////////

        var enableDisableButtons = function() {
            if ($(participantsListParticipantCheckbox + ':checked', rootel).length) {
                $participantsSendSelectedMessage.removeAttr('disabled');
                $participantsAddPeopleButton.removeAttr('disabled');
            } else {
                $participantsSendSelectedMessage.attr('disabled', 'disabled');
                $participantsSelectAll.removeAttr('checked');
                $participantsAddPeopleButton.attr('disabled', 'disabled');
            }
        };

        /**
         * Set the attributes needed by the sendmessage widget to send a message to all selected users
         */
        var setSendSelectedMessageAttributes = function() {
            var userArr = [];
            var userIDArr = [];
            $.each($(participantsListParticipantCheckbox + ':checked', rootel), function(index, item) {
                userIDArr.push($(item).attr('data-entityid'));
                userArr.push($(item).attr('data-entityname'));
            });
            $participantsSendSelectedMessage.attr('sakai-entitytype', 'user');
            $participantsSendSelectedMessage.attr('sakai-entityname', userArr);
            $participantsSendSelectedMessage.attr('sakai-entityid', userIDArr);
            $participantsAddPeopleButton.attr('data-entityname', userArr);
            $participantsAddPeopleButton.attr('data-entityid', userIDArr);
            enableDisableButtons();
        };

        /**
         * Check/Uncheck all items in the members list and enable/disable buttons
         */
        var checkAll = function() {
            if ($(this).is(':checked')) {
                $(participantsListParticipantCheckbox, rootel).attr('checked','checked');
                setSendSelectedMessageAttributes();
            }else{
                $(participantsListParticipantCheckbox, rootel).removeAttr('checked');
                enableDisableButtons();
            }
        };


        var getRoleTitle = function(result) {
            var ret = '';
            if (result.role && result.role.title) {
                ret = result.role.title;
            } else if (result.role === undefined && newlyAdded && newlyAdded.length && roles && roles.length) {
                $.each(newlyAdded, function(i, member) {
                    if (member.user === result['rep:userId'] || member.user === result['sakai:group-id']) {
                        $.each(roles, function(i, role) {
                            if (role.id === member.permission) {
                                ret = role.title;
                            }
                        });
                    }
                });
            }
            return ret;
        };

        //////////////////////
        // Render functions //
        //////////////////////

        var processParticipants = function(results, callback) {
            var participantsArr = [];
            if (results && results.length) {
                $.each(results, function(i, result) {
                    if (result['sakai:group-id'] || result['rep:userId']) {
                        var contentCount = 0;
                        var contactsCount = 0;
                        var membershipsCount = 0;
                        if (result.counts) {
                            contentCount = result.counts.contentCount;
                            contactsCount = result.counts.contactsCount;
                            membershipsCount = result.counts.membershipsCount;
                        }
                        var picture = false;
                        var roleTitle = getRoleTitle(result);
                        if (result['sakai:group-id']) {
                            if (result.basic.elements.picture && result.basic.elements.picture.value) {
                                picture = sakai.api.Groups.getProfilePicture(result);
                            }
                            participantsArr.push({
                                'name': result['sakai:group-title'],
                                'id': result['sakai:group-id'],
                                'title': roleTitle,
                                'type': 'group',
                                'connected': false,
                                'content': contentCount,
                                'contacts': contactsCount,
                                'memberships': membershipsCount,
                                'profilePicture': picture,
                                'membersCount': result.counts.membersCount
                            });
                        } else {
                            // Check if this user is a friend of us already.
                            var connected = false;
                            var invited = false;
                            var pending = false;
                            var none = false;
                            if (result['sakai:state'] === 'ACCEPTED') {
                                connected = true;
                            } else if (result['sakai:state'] === 'INVITED') {
                                connected = true;
                                invited = true;
                            } else if (result['sakai:state'] === 'PENDING') {
                                connected = true;
                                pending = true;
                            } else if (result['sakai:state'] === 'NONE') {
                                none = true;
                            }

                            if (result.basic.elements.picture && result.basic.elements.picture.value) {
                                picture = sakai.api.User.getProfilePicture(result);
                            }
                            participantsArr.push({
                                'name': sakai.api.User.getDisplayName(result),
                                'id': result['rep:userId'],
                                'title': roleTitle,
                                'type': 'user',
                                'content': contentCount,
                                'contacts': contactsCount,
                                'memberships': membershipsCount,
                                'connected': connected,
                                'invited': invited,
                                'pending': pending,
                                'none': none,
                                'profilePicture': picture
                            });
                        }
                    }
                });
            }
            callback(participantsArr);
        };

        ////////////////////
        // Init functions //
        ////////////////////

        var loadParticipants = function(cache) {
            // Disable the previous infinite scroll
            if (infinityScroll) {
                infinityScroll.kill();
            }
            // Set up the infinite scroll for the list of items in the library
            infinityScroll = $participantsListContainer.infinitescroll(function(parameters, callback) {
                sakai.api.Groups.searchMembers(widgetData.participants.groupid, widgetData.query, parameters.items, parameters.page, parameters.sortBy, parameters.sortOrder, function(success, data) {
                    callback(true, data);
                }, cache);
            }, {
                'query': widgetData.query,
                'sortBy': 'lastName',
                'sortOrder': widgetData.sortby
            }, function(items, total) {
                if (sakai.data.me.user.anon) {
                    $('.s3d-page-header-top-row', rootel).show();
                } else {
                    $('.s3d-page-header-top-row', rootel).show();
                    $('.s3d-page-header-bottom-row', rootel).show();
                }
                $participantsSelectAll.removeAttr('checked');
                setSendSelectedMessageAttributes();
                return sakai.api.Util.TemplateRenderer(participantsListTemplate, {
                    'participants': items,
                    'sakai': sakai
                });
            }, function() {
                $participantsListContainer.html(sakai.api.Util.TemplateRenderer(participantsListTemplateEmpty, {}));
            }, sakai.config.URL.INFINITE_LOADING_ICON, processParticipants);
        };

        var handleHashChange = function() {
            $('.s3d-listview-options', rootel).find('div').removeClass('selected');
            var ls = $.bbq.getState('ls') || widgetData.listStyle;
            if (ls === 'list') {
                $('#participants_list_container_list', rootel).removeClass('s3d-search-results-grid');
                $(participantsShowList, rootel).addClass('selected');
                $(participantsShowList, rootel).children().addClass('selected');
            } else if (ls === 'grid') {
                $(participantsShowGrid, rootel).addClass('selected');
                $(participantsShowGrid, rootel).children().addClass('selected');
                $('#participants_list_container_list', rootel).addClass('s3d-search-results-grid');
            }
            widgetData.query = $.bbq.getState('pq') || '';
            $participantsSearchField.val(widgetData.query);
            widgetData.sortby = $.bbq.getState('psb') || 'asc';
            $participants_sort_by.val(widgetData.sortby);
            loadParticipants();
        };

        var addBinding = function() {
            $(window).on('hashchanged.participants.sakai', handleHashChange);

            $('.participants_widget .s3d-search-button').off('click').on('click', function() {
                currentPage = 1;
                $.bbq.pushState({'pq': $.trim($participantsSearchField.val())});
            });
            $participantsSearchField.off('keyup').on('keyup', function(ev) {
                if (ev.keyCode === 13) {
                    $.bbq.pushState({'pq': $.trim($participantsSearchField.val())});
                }
            });
            $participants_sort_by.off('change').on('change', function() {
                $.bbq.pushState({'psb': $participants_sort_by.val()});
            });
            $participantsSelectAll.off('click').on('click', checkAll);
            rootel.on('click', participantsListParticipantCheckbox, setSendSelectedMessageAttributes);

            $('.participants_accept_invitation').on('click', function(ev) {
                var userid = $(this).attr('sakai-entityid');
                sakai.api.User.acceptContactInvite(userid, function() {
                    $('.participants_accept_invitation').each(function(index) {
                        if ($(this).attr('sakai-entityid') === userid) {
                            $(this).hide();
                        }
                    });
                });
            });

            $(window).on('sakai.addToContacts.requested', function(ev, userToAdd) {
                $('.sakai_addtocontacts_overlay').each(function(index) {
                    if ($(this).attr('sakai-entityid') === userToAdd.uuid) {
                        $(this).hide();
                    }
                });
            });

            $(participantsShowList, rootel).click(function() {
                $.bbq.pushState({'ls': 'list'});
            });

            $(participantsShowGrid, rootel).click(function() {
                $.bbq.pushState({'ls': 'grid'});
            });

            $('.addpeople_init', rootel).on('click', function() {
                $(document).trigger('init.addpeople.sakai', {
                    editingGroup: true
                });
            });
        };

        var init = function() {
            var groupData = $.extend(true, {}, sakai_global.group.groupData);
            groupData.roles = groupData['sakai:roles'];
            roles = sakai.api.Groups.getRoles(groupData);
            if (sakai.api.Groups.isCurrentUserAManager(sakai_global.group.groupId, sakai.data.me, groupData)) {
                $('#participants_manage_participants').show();
            }
            addBinding();
            handleHashChange();
        };

        $(window).on('usersselected.addpeople.sakai', function(e, _newlyAdded) {
            newlyAdded = _newlyAdded;
            setTimeout(function() {
                loadParticipants(false);
            }, 1000);
        });

        init();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('participants');
});