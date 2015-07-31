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
 */
var uiUtil = (function() {


    ////////////
    // TENANT //
    ////////////

    /**
     * Open a collaborative document profile
     *
     * @param  {Collabdoc}    collabdocProfile    The content profile object of the collaborative document to open the profile for
     */
    var openCollabdocProfile = function(collabdocProfile) {
        casper.thenOpen(configUtil.tenantUI + collabdocProfile.profilePath, function() {
            casper.waitForSelector('#content-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open a content profile
     *
     * @param  {Content}    contentProfile    The content profile object of the content item to open the profile for
     */
    var openContentProfile = function(contentProfile) {
        casper.thenOpen(configUtil.tenantUI + contentProfile.profilePath, function() {
            casper.waitForSelector('#content-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open a folder profile
     *
     * @param  {Folder}    folderProfile    The folder profile object of the content item to open the profile for
     */
    var openFolderProfile = function(folderProfile) {
        casper.thenOpen(configUtil.tenantUI + folderProfile.profilePath, function() {
            casper.waitForSelector('#folder-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open my discussions
     */
    var openMyDiscussions = function() {
        casper.thenOpen(configUtil.tenantUI + '/discussions', function() {
            casper.waitForSelector('#discussionslibrary-widget .oae-list-header h2');
        });
    };

    /**
     * Open the group members profile
     *
     * @param  {Group}    groupProfile    The group profile object of the group to open the members page for
     */
    var openGroupMembersProfile = function(groupProfile) {
        casper.thenOpen(configUtil.tenantUI + groupProfile.profilePath + 'mbers', function() {
            casper.waitForSelector('#members-widget .oae-list.oae-list-grid li');
        });
    };

    /**
     * Open a group profile
     *
     * @param  {Group}    groupProfile    The group profile object of the group to open the profile for
     */
    var openGroupProfile = function(groupProfile) {
        casper.thenOpen(configUtil.tenantUI + groupProfile.profilePath, function() {
            casper.waitForSelector('#group-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open the index page
     */
    var openIndex = function() {
        casper.thenOpen(configUtil.tenantUI, function() {
            casper.waitForSelector('.oae-institutional-logo');
        });
    };

    /**
     * Open a link profile
     *
     * @param  {Link}    linkProfile    The link profile object of the link to open the profile for
     */
    var openLinkProfile = function(linkProfile) {
        casper.thenOpen(configUtil.tenantUI + linkProfile.profilePath, function() {
            casper.waitForSelector('#content-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open the me page
     */
    var openMe = function() {
        casper.thenOpen(configUtil.tenantUI + '', function() {
            casper.waitForSelector('#me-clip-container h1');
        });
    };

    /**
     * Open my groups
     */
    var openMyGroups = function() {
        casper.thenOpen(configUtil.tenantUI + '/groups', function() {
            casper.waitForSelector('#memberships-widget .oae-list-header h2');
        });
    };

    /**
     * Open my library
     */
    var openMyLibrary = function() {
        casper.thenOpen(configUtil.tenantUI + '/library', function() {
            casper.waitForSelector('#contentlibrary-widget .oae-list-header h2');
        });
    };

    /**
     * Open my network
     */
    var openMyNetwork = function() {
        casper.thenOpen(configUtil.tenantUI + '/network', function() {
            casper.waitForSelector('#network-widget .oae-list-header h2');
        });
    };

    /**
     * Open the discussion profile
     *
     * @param  {Discussion}    discussionProfile    The discussion profile object of the discussion to open the profile for
     */
    var openDiscussionProfile = function(discussionProfile) {
        casper.thenOpen(configUtil.tenantUI + discussionProfile.profilePath, function() {
            casper.waitForSelector('#discussion-clip-container .oae-clip-content > button');
        });
    };

    /**
     * Open another user's profile
     *
     * @param  {User}    userProfile    The user profile object of the user to open the profile for
     */
    var openUserProfile = function(userProfile) {
        casper.thenOpen(configUtil.tenantUI + userProfile.profilePath, function() {
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
        casper.thenOpen(configUtil.adminUI, function() {
            casper.waitForSelector('#adminheader-content h1');
        });
    };

    /**
     * Open the admin UI maintenance
     *
     * @return {[type]} [description]
     */
    var openAdminMaintenance = function() {
        casper.thenOpen(configUtil.adminUI + '/maintenance', function() {
            casper.waitForSelector('#maintenance-widget .oae-list-header h2');
        });
    };

    /**
     * Open the tenant admin UI skinning
     *
     * @param  {String}    alias    The alias of the tenant to open the skinning page for
     */
    var openAdminSkinning = function(alias) {
        casper.thenOpen(configUtil.adminUI + '/tenant/' + alias + '/skinning', function() {
            casper.waitForSelector('#skinning-container .oae-list-header h2');
        });
    };

    /**
     * Open the admin UI user management
     *
     * @param  {String}    [alias]    The alias of the tenant to open the user management page for
     * @param  {String}    [query]    Search query to append to the url of the user management page
     */
    var openAdminUserManagement = function(alias, query) {
        casper.then(function() {
            var url = configUtil.adminUI + '/usermanagement';
            if (alias) {
                url = configUtil.adminUI + '/tenant/' + alias + '/usermanagement';
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
     * @param  {String}    alias    The alias of the tenant to open
     */
    var openTenantAdmin = function(alias) {
        casper.thenOpen(configUtil.adminUI + '/tenant/' + alias, function() {
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
        'openFolderProfile': openFolderProfile,
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
})();
