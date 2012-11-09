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

require(['jquery','sakai/sakai.api.core'], function($, sakai) {

    sakai_global.profile = sakai_global.profile || {};
    sakai_global.profile.main = sakai_global.profile.main || {};
    $.extend(true, sakai_global.profile.main, {
        config: sakai.config.Profile.configuration.defaultConfig,
        data: {},
        mode: {
            options: ['view', 'edit'],
            value: 'view'
        }
    });

    sakai_global.user = function() {

        var privdata = false;
        var pubdata = false;
        var privurl = false;
        var puburl = false;
        var messageCounts = false;
        var isMe = false;
        var entityID = false;
        var isContact = false;

        var contextType = false;
        var contextData = false;

        var setupProfileSection = function( title, section ) {
            var altTitle = section.altLabel || section.label;
            var ret = {
                _ref: sakai.api.Util.generateWidgetId(),
                _order: section.order,
                _altTitle: altTitle,
                _title: section.label,
                _nonEditable: true,
                _view: section.permission
            };
            // _reorderOnly is only true for the basic profile
            ret._reorderOnly = title === 'basic';
            return ret;
        };

        var setupProfile = function( structure, isMe ) {
            var firstWidgetRef = '';
            var profilestructure = {
                _title: structure.structure0.profile._title,
                _altTitle: structure.structure0.profile._altTitle,
                _order: structure.structure0.profile._order
            };
            if ( isMe ) {
                profilestructure['_canEdit'] = true;
                profilestructure['_nonEditable'] = true;
                profilestructure['_reorderOnly'] = true;
                profilestructure['_canSubedit'] = true;
            }
            var newProfile = true;
            $.each( structure.structure0.profile, function( key, section ) {
                if ( $.isPlainObject( section ) ) {
                    newProfile = false;
                }
            });
            if ( newProfile ) {
                structure.structure0.profile = {};
            }
            var initialProfilePost = [];
            var paths = [];
            var permissions = [];
            var updateStructure = false;
            $.each(sakai.config.Profile.configuration.defaultConfig, function(title, section) {
                var widgetUUID = sakai.api.Util.generateWidgetId();
                if ( !newProfile && structure.structure0.profile.hasOwnProperty( title ) ) {
                    profilestructure[ title ] = structure.structure0.profile[ title ];
                } else if ( newProfile || !structure.structure0.profile.hasOwnProperty( title )) {
                    profilestructure[ title ] = setupProfileSection( title, section );
                    if (title !== 'basic') {
                        paths.push('/~' + sakai.data.me.user.userid + '/public/authprofile/' + title);
                        permissions.push(section.permission);
                    }
                    if (section.order === 0) {
                        firstWidgetRef = profilestructure[ title ]._ref;
                    }
                    initialProfilePost.push({
                        'url': '/~' + sakai.data.me.user.userid + '/public/authprofile/' + title,
                        'method': 'POST',
                        'parameters': {
                            'init': true
                        }
                    });
                }
                // Don't need to use these from the profile, gives us more flexibility on the profile itself
                structure[profilestructure[ title ]._ref] = {
                    rows: [
                        {
                            'id': sakai.api.Util.generateWidgetId(),
                            'columns': [
                                {
                                    'width': 1,
                                    'elements': [
                                        {
                                            'id': widgetUUID,
                                            'type': 'displayprofilesection'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                structure[profilestructure[ title ]._ref][widgetUUID] = {
                    sectionid: title
                };
            });

            // Eliminate extra sections in the profile that are hanging around
            $.each( structure.structure0.profile, function( section_title, section_data ) {
                if ( $.isPlainObject( section_data ) && !profilestructure.hasOwnProperty( section_title ) ) {
                    initialProfilePost.push({
                        'url': '/~' + sakai.data.me.user.userid + '/public/authprofile/' + section_title,
                        'method': 'POST',
                        'parameters': {
                            ':operation': 'delete'
                        }
                    });
                }
            });

            if ( isMe && initialProfilePost.length ) {
                updateStructure = true;
                sakai.api.Server.batch(initialProfilePost, function(success, data) {
                    if (success) {
                        sakai.api.Content.setACLsOnPath(paths, permissions, sakai.data.me.user.userid, function(success) {
                            if (!success) {
                                debug.error('Error setting initial profile ACLs');
                            }
                        });
                    } else {
                        debug.error('Error saving initial profile fields');
                    }
                });
            }

            structure.structure0.profile = profilestructure;
            structure.structure0.profile._ref = firstWidgetRef;
            return updateStructure;
        };

        var continueLoadSpaceData = function(userid) {
            var publicToStore = false;
            var requiresPublicMigration = false;
            var privateToStore = false;
            var requirePrivateMigration = false;

            // Load public data from /~userid/private/pubspace
            sakai.api.Server.loadJSON(puburl, function(success, data) {
                if (!success) {
                    pubdata = $.extend(true, {}, sakai.config.defaultpubstructure);
                    var refid = {'refid': sakai.api.Util.generateWidgetId()};
                    pubdata = sakai.api.Util.replaceTemplateParameters(refid, pubdata);
                } else {
                    pubdata = data;
                    pubdata = sakai.api.Server.cleanUpSakaiDocObject(pubdata);
                }
                if (!isMe) {
                    pubdata.structure0 = setManagerProperty(pubdata.structure0, false);
                    for (var i in pubdata.structure0) {
                        if (pubdata.structure0.hasOwnProperty(i)) {
                            pubdata.structure0[i] = determineUserAreaPermissions(pubdata.structure0[i]);
                        }
                    }
                }
                if ( pubdata.structure0.profile && setupProfile( pubdata, isMe ) ) {
                    publicToStore = $.extend(true, {}, pubdata);
                }
                if (isMe) {
                    sakai.api.Server.loadJSON(privurl, function(success2, data2) {
                        if (!success2) {
                            privdata = $.extend(true, {}, sakai.config.defaultprivstructure);
                            var refid = {'refid': sakai.api.Util.generateWidgetId()};
                            privdata = sakai.api.Util.replaceTemplateParameters(refid, privdata);
                            privateToStore = $.extend(true, {}, privdata);
                        } else {
                            privdata = data2;
                            privdata = sakai.api.Server.cleanUpSakaiDocObject(privdata);
                        }
                        if (publicToStore) {
                            if ($.isPlainObject(publicToStore.structure0)) {
                                publicToStore.structure0 = JSON.stringify(publicToStore.structure0);
                            }
                            publicToStore['sakai:schemaversion'] = sakai.config.schemaVersion;
                            sakai.api.Server.saveJSON(puburl, publicToStore);
                        }
                        if (privateToStore) {
                            if ($.isPlainObject(privateToStore.structure0)) {
                                privateToStore.structure0 = JSON.stringify(privateToStore.structure0);
                            }
                            privateToStore['sakai:schemaversion'] = sakai.config.schemaVersion;
                            sakai.api.Server.saveJSON(privurl, privateToStore);
                        }
                        pubdata.structure0 = setManagerProperty(pubdata.structure0, true);
                        generateNav();
                    });
                } else {
                    generateNav();
                }
            });
        };

        var loadSpaceData = function() {
            var userid;
            if (!entityID || entityID === sakai.data.me.user.userid) {
                isMe = true;
                userid = sakai.data.me.user.userid;
            } else {
                userid = entityID;
            }
            privurl = '/~' + sakai.api.Util.safeURL(userid) + '/private/privspace';
            puburl = '/~' + sakai.api.Util.safeURL(userid) + '/public/pubspace';
            if (isMe) {
                sakai.api.Communication.getUnreadMessagesCountOverview('inbox', function(success, counts) {
                    messageCounts = counts;
                    continueLoadSpaceData(userid);
                });
            } else {
                continueLoadSpaceData(userid);
            }
        };

        var addCounts = function() {
            if (pubdata && pubdata.structure0) {
                if (contextData && contextData.profile && contextData.profile.counts) {
                    addCount(pubdata, 'library', contextData.profile.counts['contentCount']);
                    addCount(pubdata, 'memberships', contextData.profile.counts['membershipsCount']);
                    if (isMe) {
                        var contactCount = 0;
                        // determine the count of contacts to list in lhnav
                        if (sakai.data.me.contacts.accepted && sakai.data.me.contacts.invited) {
                            contactCount = sakai.data.me.contacts.accepted + sakai.data.me.contacts.invited;
                        } else if (sakai.data.me.contacts.accepted) {
                            contactCount = sakai.data.me.contacts.accepted;
                        } else if (sakai.data.me.contacts.invited) {
                            contactCount = sakai.data.me.contacts.invited;
                        }
                        addCount(pubdata, 'contacts', contactCount);
                        addCount(privdata, 'messages', sakai.data.me.messages.unread);
                        if (messageCounts && messageCounts.count && messageCounts.count.length) {
                            for (var i = 0; i < messageCounts.count.length; i++) {
                                if (messageCounts.count[i].group && messageCounts.count[i].group === 'message') {
                                    addCount(privdata, 'messages/inbox', messageCounts.count[i].count);
                                }
                                if (messageCounts.count[i].group && messageCounts.count[i].group === 'invitation') {
                                    addCount(privdata, 'messages/invitations', messageCounts.count[i].count);
                                }
                            }
                        }
                    } else {
                        addCount(pubdata, 'contacts', contextData.profile.counts['contactsCount']);
                    }
                }
            }
        };

        var determineUserAreaPermissions = function(structure) {
            var permission = structure._view || 'anonymous';
            if (permission === 'contacts' && isContact) {
                structure._canView = true;
            } else if (permission === 'everyone' && !sakai.data.me.user.anon) {
                structure._canView = true;
            } else if (permission === 'anonymous') {
                structure._canView = true;
            } else {
                structure._canView = false;
            }
            for (var i in structure) {
                if (structure.hasOwnProperty(i) && i.substring(0, 1) !== '_') {
                    structure[i] = determineUserAreaPermissions(structure[i]);
                }
            }
            return structure;
        };

        var setManagerProperty = function(structure, value) {
            for (var i in structure) {
                if (structure.hasOwnProperty(i) && i.substring(0, 1) !== '_' && $.isPlainObject(structure[i])) {
                    structure[i]._canEdit = value;
                    structure[i]._canSubedit = value;
                    structure[i] = setManagerProperty(structure[i], value);
                }
            }
            return structure;
        };

        var addCount = function(pubdata, pageid, count) {
            if (pageid.indexOf('/') !== -1) {
                var split = pageid.split('/');
                if (pubdata.structure0 && pubdata.structure0[split[0]] && pubdata.structure0[split[0]][split[1]]) {
                    pubdata.structure0[split[0]][split[1]]._count = count;
                }
            } else {
                if (pubdata.structure0 && pubdata.structure0[pageid]) {
                    pubdata.structure0[pageid]._count = count;
                }
            }
        };

        var determineContext = function() {
            entityID = sakai.api.Util.extractEntity(window.location.pathname);
            if (entityID && entityID !== sakai.data.me.user.userid) {
                sakai.api.User.getUser(entityID, getProfileData);
            } else if (!sakai.data.me.user.anon) {
                if (entityID) {
                    document.location = '/me' + window.location.hash;
                    return;
                }
                sakai.api.Security.showPage();
                contextType = 'user_me';
                // Set the profile data object
                sakai_global.profile.main.data = $.extend(true, {}, sakai.data.me.profile);
                sakai_global.profile.main.mode.value = 'edit';
                contextData = {
                    'profile': sakai.data.me.profile,
                    'displayName': sakai.api.User.getDisplayName(sakai.data.me.profile),
                    'userid': sakai.data.me.user.userid,
                    'picture': sakai.api.User.getProfilePicture(sakai.data.me.profile),
                    'addArea': 'user'
                };
                sakai.api.Util.setPageTitle(' ' + sakai.api.Util.Security.unescapeHTML(contextData.displayName), 'pageLevel');
                renderEntity();
                loadSpaceData();
            } else {
                sakai.api.Security.sendToLogin();
            }
        };

        var getProfileData = function(exists, profile) {
            if (!profile) {
                sakai.api.Security.sendToLogin();
            } else {
                sakai.api.Security.showPage();
                // Set the profile data object
                sakai_global.profile.main.data = $.extend(true, {}, profile);
                contextData = {
                    'profile': profile,
                    'displayName': sakai.api.User.getDisplayName(profile),
                    'userid': entityID,
                    'altTitle': true,
                    'picture': sakai.api.User.getProfilePicture(profile)
                };
                sakai.api.Util.setPageTitle(' ' + sakai.api.Util.Security.unescapeHTML(contextData.displayName), 'pageLevel');
                if (sakai.data.me.user.anon) {
                    contextType = 'user_anon';
                    renderEntity();
                    loadSpaceData();
                } else {
                    checkContact();
                }
            }
        };

        var checkContact = function() {
            var isContactInvited = false;
            var isContactPending = false;
            var contactState = contextData.profile['sakai:state'];
            if (contactState === 'ACCEPTED') {
                isContact = true;
            } else if (contactState === 'INVITED') {
                isContactInvited = true;
            } else if (contactState === 'PENDING') {
                isContactPending = true;
            }
            if (isContact) {
                contextType = 'contact';
            } else if (isContactInvited) {
                contextType = 'contact_invited';
            } else if (isContactPending) {
                contextType = 'contact_pending';
            } else {
                contextType = 'user_other';
            }
            renderEntity();
            loadSpaceData();
        };

        var generateNav = function() {
            addCounts();
            sakai_global.user.pubdata = pubdata;
            if (contextType && contextType === 'user_me' && contextData && pubdata && privdata) {
                $(window).trigger('lhnav.init', [pubdata, privdata, contextData, puburl, privurl]);
            } else if (contextType && contextType !== 'user_me' && contextData && pubdata) {
                $(window).trigger('lhnav.init', [pubdata, false, contextData, puburl, privurl]);
            }
        };

        var renderEntity = function() {
            if (contextType && contextData) {
                $(window).trigger('sakai.entity.init', ['user', contextType, contextData]);
            }
        };

        var showWelcomeNotification = function() {
            var welcome = $.deparam.querystring().welcome;
            if (welcome && welcome === 'true' && !sakai.data.me.user.anon) {
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('WELCOME') + ' ' +
                sakai.api.User.getFirstName(sakai.data.me.profile), sakai.api.i18n.getValueForKey('YOU_HAVE_CREATED_AN_ACCOUNT'));
            }
        };

        $(window).on('displayName.profile.updated.sakai', function() {
            sakai.api.Util.setPageTitle(' ' + sakai.api.User.getDisplayName(sakai.data.me.profile), 'pageLevel');
        });

        $(window).on('sakai.addToContacts.requested', function(ev, userToAdd) {
            $('.sakai_addtocontacts_overlay').each(function(index) {
                if (entityID && entityID !== sakai.data.me.user.userid) {
                    contextType = 'contact_pending';
                    renderEntity();
                }
            });
        });

        $(document).on('click', '#entity_user_accept_invitation', function() {
            sakai.api.User.acceptContactInvite(contextData.userid);
            contextType = 'contact';
            renderEntity();
        });

        $(window).on('sakai.entity.ready', function() {
            renderEntity();
        });

        $(window).on('lhnav.ready', function() {
            generateNav();
        });

        $(window).on('updated.counts.lhnav.sakai', function() {
            sakai.api.User.getUpdatedCounts(sakai.data.me, function(success) {
                renderEntity();
                generateNav();
            });
        });

        $(document).on('done.newaddcontent.sakai', function(e, data, library) {
            if (isMe && data && data.length && library === sakai.data.me.user.userid) {
                $(window).trigger('lhnav.updateCount', ['library', data.length]);
            }
        });

        $(window).on('updated.messageCount.sakai', function() {
            if (isMe) {
                sakai.api.Communication.getUnreadMessagesCountOverview('inbox', function(success, counts) {
                    messageCounts = counts;
                    var totalCount = 0;
                    // The structure of these objects make for O(n^2) comparison :(
                    $.each(messageCounts.count, function(index, countObj) {
                        var pageid = 'messages/';
                        if (countObj.group === 'message') {
                            pageid += 'inbox';
                        } else if (countObj.group === 'invitation') {
                            pageid += 'invitations';
                        }
                        totalCount += countObj.count;
                        $(window).trigger('lhnav.updateCount', [pageid, countObj.count, false]);
                    });
                    $(window).trigger('lhnav.updateCount', ['messages', totalCount, false]);
                }, false);
            }
        });

        determineContext();
        renderEntity();
        generateNav();
        showWelcomeNotification();

    };

    sakai.api.Widgets.Container.registerForLoad('user');
});
