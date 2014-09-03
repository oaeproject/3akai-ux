/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/**
 * Utility functions for users
 *
 * @return  {Object}    Returns an object with referenced user utility functions
 */
var uiUtil = function() {


    ////////////
    // TENANT //
    ////////////

    /**
     * Open a collaborative document profile
     *
     * @param  {[type]} collabdocProfile [description]
     */
    var openCollabdocProfile = function(collabdocProfile) {
        casper.thenOpen(configUtil().tenantUI + collabdocProfile.profilePath, function() {
            casper.waitForSelector('#content-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open a content profile
     *
     * @param  {[type]} contentProfile [description]
     */
    var openContentProfile = function(contentProfile) {
        casper.thenOpen(configUtil().tenantUI + contentProfile.profilePath, function() {
            casper.waitForSelector('#content-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open my discussions
     */
    var openMyDiscussions = function() {
        casper.thenOpen(configUtil().tenantUI + '/me/discussions', function() {

        });
    };

    /**
     * Open the group members profile
     */
    var openGroupMembersProfile = function(groupProfile) {
        casper.thenOpen(configUtil().tenantUI + groupProfile.profilePath + '/members', function() {
            casper.waitForSelector('#members-widget .oae-list.oae-list-grid li');
        });
    };

    /**
     * Open a group profile
     *
     * @param  {[type]} groupProfile [description]
     */
    var openGroupProfile = function(groupProfile) {
        casper.thenOpen(configUtil().tenantUI + groupProfile.profilePath, function() {
            casper.waitForSelector('#group-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open the index page
     */
    var openIndex = function() {
        casper.thenOpen(configUtil().tenantUI, function() {
            casper.waitForSelector('.oae-institutional-logo');
        });
    };

    /**
     * Open a link profile
     *
     * @param  {[type]} linkProfile [description]
     */
    var openLinkProfile = function(linkProfile) {
        casper.thenOpen(configUtil().tenantUI + linkProfile.profilePath, function() {
            casper.waitForSelector('#content-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open the me page
     */
    var openMe = function() {
        casper.thenOpen(configUtil().tenantUI + '/me', function() {
            casper.waitForSelector('#me-clip-container h1');
        });
    };

    /**
     * Open my groups
     */
    var openMyGroups = function() {
        casper.thenOpen(configUtil().tenantUI + '/me/groups', function() {
            casper.waitForSelector('#memberships-widget .oae-list-header h2');
        });
    };

    /**
     * Open my library
     */
    var openMyLibrary = function() {
        casper.thenOpen(configUtil().tenantUI + '/me/library', function() {
            casper.waitForSelector('#contentlibrary-widget .oae-list-header h2');
        });
    };

    /**
     * Open my network
     */
    var openMyNetwork = function() {
        casper.thenOpen(configUtil().tenantUI + '/me/network', function() {
            casper.waitForSelector('#network-widget .oae-list-header h2');
        });
    };

    /**
     * Open the discussion profile
     *
     * @param  {[type]} discussionProfile [description]
     */
    var openDiscussionProfile = function(discussionProfile) {
        casper.thenOpen(configUtil().tenantUI + discussionProfile.profilePath, function() {
            casper.waitForSelector('#discussion-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open another user's profile
     *
     * @param  {[type]} userProfile [description]
     */
    var openUserProfile = function(userProfile) {
        casper.thenOpen(configUtil().tenantUI + userProfile.profilePath, function() {
            casper.waitForSelector('#user-clip-left-container h1');
        });
    };


    ///////////
    // ADMIN //
    ///////////

    /**
     * Open the admin UI
     */
    var openAdmin = function() {
        casper.thenOpen(configUtil().adminUI, function() {
            casper.waitForSelector('#adminheader-content h1');
        });
    };

    /**
     * Open the admin UI maintenance
     *
     * @return {[type]} [description]
     */
    var openAdminMaintenance = function() {
        casper.thenOpen(configUtil().adminUI + '/maintenance', function() {
            casper.waitForSelector('#maintenance-widget .oae-list-header h2');
        });
    };

    /**
     * Open the tenant admin UI skinning
     *
     * @param  {[type]} alias [description]
     *
     * @return {[type]}       [description]
     */
    var openAdminSkinning = function(alias) {
        casper.thenOpen(configUtil().adminUI + '/tenant/' + alias + '/skinning', function() {
            casper.waitForSelector('#skinning-container .oae-list-header h2');
        });
    };

    /**
     * Open the admin UI user management
     *
     * @param  {[type]} [alias] [description]
     * @param  {[type]} [query] [description]
     */
    var openAdminUserManagement = function(alias, query) {
        casper.then(function() {
            var url = configUtil().adminUI + '/usermanagement';
            if (alias) {
                url = configUtil().adminUI + '/tenant/' + alias + '/usermanagement';
            }

            if (query) {
                url += '?q=' + query;
            }

            casper.thenOpen(url, function() {
                casper.waitForSelector('#usermanagement-widget .oae-list-header h2');
            });
        });
    };

    /**
     * Open the tenant admin UI
     *
     * @param  {[type]} alias [description]
     *
     * @return {[type]}       [description]
     */
    var openTenantAdmin = function(alias) {
        casper.thenOpen(configUtil().adminUI + '/tenant/' + alias, function() {
            casper.waitForSelector('#adminheader-content h1');
        });
    };

    return {
        'openAdmin': openAdmin,
        'openAdminMaintenance': openAdminMaintenance,
        'openAdminSkinning': openAdminSkinning,
        'openAdminUserManagement': openAdminUserManagement,
        'openCollabdocProfile': openCollabdocProfile,
        'openContentProfile': openContentProfile,
        'openDiscussionProfile': openDiscussionProfile,
        'openGroupMembersProfile': openGroupMembersProfile,
        'openGroupProfile': openGroupProfile,
        'openIndex': openIndex,
        'openLinkProfile': openLinkProfile,
        'openMe': openMe,
        'openMyDiscussions': openMyDiscussions,
        'openMyGroups': openMyGroups,
        'openMyLibrary': openMyLibrary,
        'openMyNetwork': openMyNetwork,
        'openTenantAdmin': openTenantAdmin,
        'openUserProfile': openUserProfile
    };
};
