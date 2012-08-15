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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */
/*global $ */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.contacts
     *
     * @class contacts
     *
     * @description
     * Initialize the contacts widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contacts = function(tuid, showSettings) {

        var $rootel = $('#' + tuid);
        var contactsContainer = '#contacts_container';
        var contactsContainerList = '#contacts_container_list';
        var contactsContainerListEmpty = '#contacts_container_list_empty';
        var contactsAcceptedTemplate = 'contacts_accepted_template';
        var contactsAcceptedEmptyTemplate = 'contacts_accepted_empty_template';
        var contactsInvited = '#contacts_invited';
        var contactsInvitedTemplate = 'contacts_invited_template';
        var contactsInvitedContainer = '#contacts_invited_container';
        var contactsShowGrid = '.s3d-listview-grid';
        var contactsShowList = '.s3d-listview-list';
        var $contactsResultCount = $('.s3d-search-result-count', $rootel);
        var contacts = {  // global data for contacts widget
            initialized: false,
            isOwnerViewing: false,
            totalItems: 0,
            sortBy: 'lastName',
            sortOrder: 'asc',
            accepted: false,
            invited: false,
            listStyle: 'list',
            query: ''
        };
        var infinityScroll = false;
        var pendingInfinityScroll = false;

        /**
         * Compare the names of 2 contact objects
         *
         * @param {Object} a
         * @param {Object} b
         * @return 1, 0 or -1
         */
        var contactSort = function(a, b) {
            if (a.details.lastName.toLowerCase() > b.details.lastName.toLowerCase()) {
                return 1;
            } else {
                if (a.details.lastName.toLowerCase() === b.details.lastName.toLowerCase()) {
                    return 0;
                } else {
                    return -1;
                }
            }
        };

        var acceptRequest = function(user) {
            sakai.api.User.acceptContactInvite(user);
        };

        var removeRequest = function(user) {
            $.ajax({
                url: '/~' + sakai.api.Util.safeURL(sakai.data.me.user.userid) + '/contacts.remove.html',
                type: 'POST',
                data: {
                    'targetUserId': user
                },
                success: function(data) {
                    $(window).trigger('lhnav.updateCount', ['contacts', -1]);
                    sakai.data.me.contacts.accepted--;
                    sakai.api.Util.Modal.close('#contacts_delete_contacts_dialog');
                    if (infinityScroll) {
                        infinityScroll.removeItems([user]);
                    }
                }
            });
        };

        var checkAddingEnabled = function() {
            if ($('.contacts_select_contact_checkbox:checked')[0]) {
                $('#contacts_addpeople_button').removeAttr('disabled');
                $('#contacts_message_button').removeAttr('disabled');
            } else {
                $('#contacts_addpeople_button').attr('disabled', true);
                $('#contacts_message_button').attr('disabled', true);
                $('#contacts_select_checkbox').removeAttr('checked');
            }
        };

        var renderPendingContacts = function() {
            $(contactsInvitedContainer).html(sakai.api.Util.TemplateRenderer(contactsInvitedTemplate, {
                'invited': contacts.invited,
                'sakai': sakai
            }));
        };

        var resultsPostProcessor = function(results, callback) {
            results = sakai.api.User.preparePeopleForRender(results, sakai.data.me);
            callback(results);
        };

        var getAccepted = function() {
            $(contactsContainerList).show();
            $(contactsContainerListEmpty).hide();
            $contactsResultCount.hide();
            var url = sakai.config.URL.CONTACTS_FIND;
            if (!contacts.query) {
                if (sakai_global.profile.main.mode.value !== 'view') {
                    url = sakai.config.URL.SEARCH_USERS_ACCEPTED;
                }
                contacts.query = '*';
            }
            var data = {
                'q': contacts.query,
                'sortOn': contacts.sortBy,
                'sortOrder': contacts.sortOrder,
                'state': 'ACCEPTED',
                'userid': sakai_global.profile.main.data.userid
            };

            // Disable the previous infinite scroll
            if (infinityScroll) {
                infinityScroll.kill();
            }
            // Set up the infinite scroll for the list of accepted contacts
            infinityScroll = $(contactsContainerList).infinitescroll(url, data, function(items, total) {
                // Anonymous users only get to see the search and sort options
                // Header is hidden for everybody when no connections are made with contacts for a user
                if (sakai.data.me.user.anon) {
                    $('.s3d-page-header-bottom-row', $rootel).hide();
                    if (!total && !contacts.query) {
                        $('.s3d-page-header-top-row', $rootel).hide();
                    } else {
                        $('.s3d-page-header-top-row', $rootel).show();
                    }
                // If there are no results the bottom header bar should not be shown
                } else if (!total) {
                    if (!contacts.query) {
                        $('.s3d-page-header-top-row', $rootel).hide();
                    } else {
                        $('.s3d-page-header-top-row', $rootel).show();
                    }
                    $('.s3d-page-header-bottom-row', $rootel).hide();
                // The user is not anonymous and there are results.
                } else {
                    $('.s3d-page-header-top-row', $rootel).show();
                    $('.s3d-page-header-bottom-row', $rootel).show();
                }

                // display search results count
                if (total && contacts.query && contacts.query !== '*') {
                    $contactsResultCount.show();
                    var resultLabel = sakai.api.i18n.getValueForKey('RESULTS');
                    if (total === 1) {
                        resultLabel = sakai.api.i18n.getValueForKey('RESULT');
                    }
                    $contactsResultCount.children('.s3d-search-result-count-label').text(resultLabel);
                    $contactsResultCount.children('.s3d-search-result-count-count').text(total);
                }

                // check if any of the users contacts are also contacts with the viewer
                if (sakai_global.profile.main.mode.value === 'view') {
                    for (var i in items) {
                        if (items.hasOwnProperty(i)) {
                            var profile = {
                                basic: items[i].basic
                            };
                            items[i].linkTitle = sakai.api.i18n.getValueForKey('VIEW_USERS_PROFILE').replace('{user}', sakai.api.User.getDisplayName(profile));
                            items[i].accepted = false;
                            items[i].connected = false;
                            for (var m in sakai.data.me.mycontacts) {
                                if (sakai.data.me.mycontacts.hasOwnProperty(m) && items[i].userid === sakai.data.me.mycontacts[m].profile.userid) {
                                    var connectionState = sakai.data.me.mycontacts[m].details['sakai:state'];
                                    items[i].connected = true;
                                    if (connectionState === 'INVITED') {
                                        items[i].invited = true;
                                    } else if (connectionState === 'PENDING') {
                                        items[i].pending = true;
                                    } else if (connectionState === 'ACCEPTED') {
                                        items[i].accepted = true;
                                    } else if (connectionState === 'NONE') {
                                        items[i].connected = false;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    $.each(items, function(i, item) {
                        var profile = {
                            basic: item.basic
                        };
                        item.linkTitle = sakai.api.i18n.getValueForKey('VIEW_USERS_PROFILE').replace('{user}', sakai.api.User.getDisplayName(profile));
                    });
                }

                return sakai.api.Util.TemplateRenderer(contactsAcceptedTemplate, {
                    'results': items,
                    'sakai': sakai
                });
            }, function() {
                $(contactsContainerList).hide();
                $(contactsContainerListEmpty).show();
                var searching = false;
                if (contacts.query && contacts.query !== '*') {
                    searching = true;
                }
                $(contactsContainerListEmpty).html(sakai.api.Util.TemplateRenderer(contactsAcceptedEmptyTemplate, {'sakai': sakai, 'searching': searching}));
            }, sakai.config.URL.INFINITE_LOADING_ICON, resultsPostProcessor);
        };

        $(window).on('sakai.addToContacts.requested', function(ev, userToAdd) {
            $('.sakai_addtocontacts_overlay').each(function(index) {
                if ($(this).attr('sakai-entityid') === userToAdd.uuid) {
                    $(this).addClass('fl-hidden');
                }
            });
        });

        $rootel.on('click', '.link_accept_invitation', function(ev) {
            var userid = $(this).attr('sakai-entityid');
            var displayName = $(this).attr('sakai-entityname');
            sakai.api.User.acceptContactInvite(userid, function(success, data) {
                if (success) {
                    $('.link_accept_invitation').each(function(index) {
                        if ($(this).attr('sakai-entityid') === userid) {
                            $(this).hide();
                            $('#contacts_left_accept_' + userid).show();
                        }
                    });
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('MY_CONTACTS'),
                        sakai.api.i18n.getValueForKey('YOU_HAVE_ACCEPTED_CONTACT_INVITATION').replace('${displayName}', displayName),
                        sakai.api.Util.notification.type.ERROR);
                } else {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('AN_ERROR_HAS_OCCURRED'),'',sakai.api.Util.notification.type.ERROR);
                }
            });
        });

        var getPendingFromOther= function() {
            var url = sakai.config.URL.CONTACTS_FIND_STATE;
            var data = {
                'state': 'INVITED'
            };

            // Disable the previous infinite scroll
            if (pendingInfinityScroll) {
                pendingInfinityScroll.kill();
            }

            // Set up the infinite scroll for the list of pending contacts
            pendingInfinityScroll = $(contactsInvitedContainer).infinitescroll(url, data, function(items, total) {
                if (total > 0 && !$(contactsInvited, $rootel).is(':visible')) {
                    $(contactsInvited, $rootel).show();
                }

                $.each(items, function(i, item) {
                    item.linkTitle = sakai.api.i18n.getValueForKey('VIEW_USERS_PROFILE').replace('{user}', sakai.api.User.getDisplayName(item.profile));
                });

                return sakai.api.Util.TemplateRenderer(contactsInvitedTemplate, {
                    'invited': items,
                    'sakai': sakai
                });
            }, false, sakai.config.URL.INFINITE_LOADING_ICON);
        };

        var getContacts = function() {
            if (sakai_global.profile.main.mode.value !== 'view') {
                if (!contacts.initialized) {
                    // we only want to render the pending contacts list once
                    getPendingFromOther();
                }
                getAccepted();
            } else {
                contacts.invited = false;
                sakai.api.User.getContacts(function() {
                    getAccepted();
                });
            }
        };

        var updateMessageAndAddToData = function() {
            var idArr = [];
            var nameArr = [];
            $.each($('.contacts_select_contact_checkbox:checked'), function(i, user) {
                idArr.push($(user).data('userid'));
                nameArr.push($(user).data('username'));
            });
            $('#contacts_message_button').attr('sakai-entityid', idArr);
            $('#contacts_message_button').attr('sakai-entityname', nameArr);
            $('#contacts_addpeople_button').data('entityid', idArr);
            $('#contacts_addpeople_button').data('entityname', nameArr);
        };

        var uncheckAll = function() {
            $('#contacts_select_checkbox').removeAttr('checked');
        };

        var handleHashChange = function() {
            uncheckAll();

            if (sakai_global.profile.main.data.userid === sakai.data.me.user.userid) {
                contacts.isOwnerViewing = true;
            } else {
                contacts.isOwnerViewing = false;
            }

            sakai.api.Util.TemplateRenderer('contacts_title_template', {
                isMe: contacts.isOwnerViewing,
                user: sakai.api.User.getFirstName(sakai_global.profile.main.data)
            }, $('#contacts_title_container', $rootel));

            $('.s3d-listview-options', $rootel).find('div').removeClass('selected');
            contacts.listStyle = $.bbq.getState('ls') || 'list';
            if (contacts.listStyle === 'list') {
                $('#contacts_container div .contacts_list_items', $rootel).removeClass('s3d-search-results-grid');
                $(contactsShowList, $rootel).addClass('selected');
                $(contactsShowList, $rootel).children().addClass('selected');
            } else {
                $('#contacts_container div .contacts_list_items', $rootel).addClass('s3d-search-results-grid');
                $(contactsShowGrid, $rootel).addClass('selected');
                $(contactsShowGrid, $rootel).children().addClass('selected');
            }

            if ($rootel.is(':visible')) {
                // Set the sort states
                var parameters = $.bbq.getState();
                if (contacts.query === '*') {
                    contacts.query = '';
                }
                if (!contacts.initialized || ((contacts.query && !parameters['cq']) || (parameters['cq'] && contacts.query !== parameters['cq'])) || (parameters['cso'] && contacts.sortOrder !== parameters['cso'])) {
                    contacts.query = parameters['cq'] || '';
                    contacts.sortOrder = parameters['cso'] || 'asc';
                    $('#contacts_search_input').val(contacts.query);
                    $('#contacts_sortby').val(contacts.sortOrder);
                    getContacts();
                }
            }
        };

        var bindEvents = function() {
            $rootel.on('click', '.contacts_add_to_contacts', function() {
                var $pendingList = $(this).parents('.contacts_item').parent();
                acceptRequest($(this)[0].id.split('contacts_add_to_contacts_')[1]);
                $(this).parents('.contacts_item').remove();
                uncheckAll();
                if (!$pendingList.children().length) {
                    $(contactsInvited, $rootel).hide();
                }
            });

            sakai.api.Util.Modal.setup('#contacts_delete_contacts_dialog', {
                modal: true,
                overlay: 20,
                toTop: true
            });

            $rootel.on('click', '.s3d-actions-delete', function() {
                $('#contacts_contact_to_delete').text($(this).data('sakai-entityname'));
                $('#contacts_delete_contact_confirm').attr('data-sakai-entityid', $(this).attr('data-sakai-entityid'));
                sakai.api.Util.Modal.open('#contacts_delete_contacts_dialog');
            });

            $(document).on('click', '#contacts_delete_contact_confirm', function() {
                removeRequest($(this).attr('data-sakai-entityid'));
                updateMessageAndAddToData();
            });

            $(window).on('contacts.accepted.sakai', function() {
                uncheckAll();
                var t = setTimeout(getContacts,500);
            });

            $rootel.on('change', '#contacts_select_checkbox', function() {
                if ($(this).is(':checked')) {
                    $('#contacts_addpeople_button').removeAttr('disabled');
                    $('#contacts_message_button').removeAttr('disabled');
                    $('.contacts_select_contact_checkbox').attr('checked', true);
                } else{
                    $('#contacts_addpeople_button').attr('disabled', true);
                    $('#contacts_message_button').attr('disabled', true);
                    $('.contacts_select_contact_checkbox').removeAttr('checked');
                }
                updateMessageAndAddToData();
            });

            $rootel.on('change', '.contacts_select_contact_checkbox', function() {
                checkAddingEnabled();
                updateMessageAndAddToData();
            });

            $rootel.on('change', '#contacts_sortby', function() {
                var sortSelection = this.options[this.selectedIndex].value;
                if (sortSelection === 'desc') {
                    $.bbq.pushState({'cso': 'desc'});
                } else {
                    $.bbq.pushState({'cso': 'asc'});
                }
            });

            $rootel.on('click', contactsShowList, function() {
                $.bbq.pushState({'ls': 'list'});
            });

            $rootel.on('click', contactsShowGrid, function() {
                $.bbq.pushState({'ls': 'grid'});
            });

            $(window).on('hashchanged.contacts.sakai', handleHashChange);

            $rootel.on('keyup', '#contacts_search_input', function(ev) {
                var q = $.trim($(this).val());
                if (q !== contacts.query && ev.keyCode === 13) {
                    $.bbq.pushState({'cq': q});
                }
            });

            $rootel.on('click', '#contacts_search_button', function(ev) {
                var q = $.trim($('#contacts_search_input').val());
                if (q !== contacts.query) {
                    $.bbq.pushState({'cq': q});
                }
            });
        };

        var doInit = function() {
            handleHashChange();
            bindEvents();
            contacts.initialized = true;
        };

        doInit();

    };
    sakai.api.Widgets.widgetLoader.informOnLoad('contacts');

});
