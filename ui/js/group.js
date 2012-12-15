/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['jquery', 'oae/api/oae.core'], function($, oae) {

    //  Get the group id from the URL. The expected URL is /group/<groupId>
    var groupId = document.location.pathname.split('/').pop();
    if (!groupId) {
        oae.api.util.redirect().redirectToLogin();
    }
    
    // Variable used to cache the requested user's profile
    var groupProfile = null;
    
    // TODO: Replace this with more effective page configuration
    var pubdata = {
        'structure0': {
            'activity': {
                '_order': 0,
                '_ref': 'id52052932',
                '_title': oae.api.i18n.translate('__MSG__RECENT_ACTIVITY__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id52052932',
                    '_title': oae.api.i18n.translate('__MSG__RECENT_ACTIVITY__')
                }
            },
            'library': {
                '_order': 1,
                '_ref': 'id88785643',
                '_title': oae.api.i18n.translate('__MSG__LIBRARY__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id88785643',
                    '_title': oae.api.i18n.translate('__MSG__LIBRARY__')
                }
            },
            'memberships': {
                '_order': 2,
                '_ref': 'id1234354657',
                '_title': oae.api.i18n.translate('__MSG__MEMBERS__'),
                'main': {
                    '_order': 0,
                    '_ref': 'id1234354657',
                    '_title': oae.api.i18n.translate('__MSG__MEMBERS__')
                }
            }
        },
        'id52052932': {
            'rows': [
                {
                    'id': 'id6535423',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id5244321',
                                    'type': 'activity'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        'id88785643': {
            'rows': [
                {
                    'id': 'id54243241',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id032184831',
                                    'type': 'library'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        'id1234354657': {
            'rows': [
                {
                    'id': 'id49343902',
                    'columns': [
                        {
                            'width': 1,
                            'elements': [
                                {
                                    'id': 'id7184318',
                                    'type': 'participants'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    /**
     * Get the group's basic profile and set up the screen. If the groups
     * can't be found or is private to the current user, the appropriate
     * error page will be shown
     */
    var getGroupProfile = function() {
        oae.api.group.getGroup(groupId, function(err, profile) {
            if (err && err.code === 404) {
                oae.api.util.redirect().redirectTo404();
            } else if (err && err.code === 401) {
                oae.api.util.redirect().redirectTo403();
            }

            groupProfile = profile;
            renderEntity();
            setUpNavigation();
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };
    
    /**
     * Render the group's profile picture and name
     */
    var renderEntity = function() {
        oae.api.util.renderTemplate($('#oae_entity_template'), groupProfile, $('#oae_entity_container'));
    };
    
    /**
     * Set up the left hand navigation with the provided structure
     */
    var setUpNavigation = function() {
        // Only render the left hand navigation if the group's profile
        // has already been retrieved
        if (groupProfile) {
            $(window).trigger('lhnav.init', [pubdata, {}, {}]);
        }
    };

    // List to the left hand navigation ready event for navigation rendering
    $(window).on('lhnav.ready', setUpNavigation);  

    getGroupProfile();

});
    
    
    /*
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    return;
    var groupData = false;
        var groupId = false;
        var pubdata = false;

        /**
         * Get the group id from the querystring
         *
        var processEntityInfo = function() {
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
                        sakai.api.Util.setPageTitle(' ' + groupData.authprofile['sakai:group-title'], 'pageLevel');
                        loadGroupEntityWidget();
                        loadDocStructure();
                    } else {
                        sakai.api.Security.send404();
                    }
            });
        };

        var loadGroupEntityWidget = function() {
            var canManage = sakai.api.Groups.isCurrentUserAManager(groupId, sakai.data.me, groupData.authprofile);
            var context = 'group';
            var type = 'group';
            if (canManage) {
                type = 'group_managed';
                $('#group_create_new_area_container').show();
            }
            $(window).trigger('sakai.entity.init', [context, type, groupData]);
            $(window).on('sakai.entity.ready', function() {
                $(window).trigger('sakai.entity.init', [context, type, groupData]);
            });
        };

        /////////////////////////
        // LOAD LEFT HAND SIDE //
        /////////////////////////

        var filterOutUnwanted = function() {

            var checkViewPermission = function(index, value) {
                if (value.substring(0, 1) === '-' && sakai.api.Groups.isCurrentUserAMember(groupId + value, sakai.data.me)) {
                    canView = true;
                }
            };
            var checkManagePermission = function(index, value) {
                if (value.substring(0, 1) === '-' && sakai.api.Groups.isCurrentUserAMember(groupId + value, sakai.data.me)) {
                    canView = true;
                    canSubedit = true;
                }
            };

            var roles = $.parseJSON(groupData.authprofile['sakai:roles']);
            for (var i in pubdata.structure0) {
                if (pubdata.structure0.hasOwnProperty(i)) {
                    var edit = $.parseJSON(pubdata.structure0[i]._edit);
                    var view = $.parseJSON(pubdata.structure0[i]._view);
                    var canEdit = sakai.api.Groups.isCurrentUserAManager(groupId, sakai.data.me, groupData.authprofile);
                    var canSubedit = false;
                    var canView = false;
                    if (sakai.data.me.anon) {
                        // Check whether anonymous is in
                        if ($.inArray('anonymous', view) !== -1) {
                            canView = true;
                        }
                    } else {
                        // Check whether I'm a member
                        var isMember = false;
                        for (var r = 0; r < roles.length; r++) {
                            if (sakai.api.Groups.isCurrentUserAMember(groupId + '-' + roles[r].id, sakai.data.me)) {
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
                            if ($.inArray('everyone', view) !== -1) {
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

        var loadDocStructure = function(forceOpenPage) {
            $.ajax({
                url: '/~' + groupId+ '/docstructure.infinity.json',
                cache: false,
                success: function(data) {
                    pubdata = sakai.api.Server.cleanUpSakaiDocObject(data);
                    filterOutUnwanted();
                    generateNav(forceOpenPage);
                }
            });
        };

        var generateNav = function(forceOpenPage) {
            if (pubdata) {
                $(window).trigger('lhnav.init', [pubdata, {}, {'addArea': 'world', 'forceOpenPage': forceOpenPage}, '/~' + groupId+ '/docstructure']);
                sakai_global.group.pubdata = pubdata;
            }
        };

        $(window).on('lhnav.ready', function() {
            generateNav();
        });

        $(window).on('rerender.group.sakai', function(ev, forceOpenPage) {
            loadDocStructure(forceOpenPage);
        });

        $(window).on('updatedTitle.worldsettings.sakai', function(e, title) {
            sakai.api.Util.setPageTitle(' ' + title, 'pageLevel');
        });

        /////////////////////
        // Create new area //
        /////////////////////

        $('#group_create_new_area').on('click', function() {
            $(document).trigger('init.addarea.sakai');
        });

        $(window).on('toadd.addpeople.sakai', function(e, widgetid, data) {
            var members = [];
            $.each(data, function(i, user) {
                var member = {
                    'user': user.userid,
                    'permission': user.permission
                };
                members.push(member);
            });
            if (members.length) {
                sakai.api.Groups.addUsersToGroup(groupId, members, sakai.api.User.data.me, false, function() {
                    $(window).trigger('usersselected.addpeople.sakai', [members]);
                });
            } else {
                $(window).trigger('usersselected.addpeople.sakai', []);
            }
        });

        $(window).on('usersswitchedpermission.addpeople.sakai', function(e, widgetid, data) {
            var rolesToDelete = [],
                rolesToAdd = [];
            $.each(data, function(i, user) {
                var member = {
                    'userid': user.userid,
                    'permission': user.originalPermission
                };
                rolesToDelete.push(member);
                var member2 = {
                    'user': user.userid,
                    'permission': user.permission
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

        processEntityInfo();

    };

    sakai.api.Widgets.Container.registerForLoad('group');
});
*/
