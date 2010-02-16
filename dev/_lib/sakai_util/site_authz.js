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
/*global $, alert */

/*
 * sakai.lib.site.authz consolidates configuration and cross-page functional logic
 * for 3akai site membership roles and access schemes.
 */
var sakai = sakai || {};
sakai.lib = sakai.lib || {};
sakai.lib.site = sakai.lib.site || {};
sakai.lib.site.authz = {};

/**
 * Get the mapping between a site role and the ID of the JCR group whose members
 * have that role.
 *
 * @param {Object} siteJson
 */
sakai.lib.site.authz.getRoleToPrincipalMap = function(siteJson){
    var roleGroupMap = {};
    var roles = siteJson["sakai:roles"];
    var groupIds = siteJson["sakai:rolemembers"];
    for (var i = 0, j = roles.length; i < j; i++) {
        roleGroupMap[roles[i]] = groupIds[i];
    }
    return roleGroupMap;
};

/**
 * For a given site and a list of a user's JCR group memberships, return the role
 * (if any) that the user plays in that site. If the user is not a site member,
 * null is returned.
 *
 * @param {Object} siteJson
 * @param {String[]} userMemberships JCR group IDs for the user
 */
sakai.lib.site.authz.getRole = function(siteJson, userMemberships){
    var roles = siteJson["sakai:roles"];
    var roleGroups = siteJson["sakai:rolemembers"];
    for (i = 0, j = userMemberships.length; i < j; i++) {
        var group = userMemberships[i]
        for (var rolesPos = 0, rolesLen = roleGroups.length; rolesPos < rolesLen; rolesPos++) {
            if (group === roleGroups[rolesPos]) {
                return roles[rolesPos];
            }
        }
    }
    return null;
};

/**
 * For the given site, return whether the current user should have access to
 * the site's administrative and maintenance functionality.
 *
 * @param {Object} siteJson
 */
sakai.lib.site.authz.isUserMaintainer = function(siteJson){
    return (siteJson[":isMaintainer"]);
};

/**
 * Send a sequential series of HTTP POST requests.
 * For now, this just chains from the return from one request to submission
 * of the next.
 * TODO Replace with server-support for batch posting, as in:
 *   http://code.google.com/apis/gdata/docs/batch.html
 *
 * @param {Object[]} actions array of objects each of which has the properties
 *                 url (where to send POST) and data (the parameter-values
 *                 map).
 * @param {Function} success Optional callback when the final POST returns
 *                 successfully.
 * @param {Function} error Optional callback on any error response. The default
 *                 error handler simply displays a browser alert with the error
 *                 status code and text.
 */
sakai.lib.batchPosts = function(actions, success, error){
    if (actions.length > 0) {
        var action = actions.shift();
        // Make sure we send POST data utf-8 encoded as per Sling requirement
        action.data["_charset_"] = "utf-8";
        $.ajax({
            url: action.url,
            type: "POST",
            success: function(data, textStatus){
                if (actions.length > 0) {
                    sakai.lib.batchPosts(actions, success, error);
                }
                else {
                    if (success) {
                        success(data, textStatus);
                    }
                }
            },
            // error: error,
            error: function(xhr, textStatus, thrownError){
                if (error) {
                    error(xhr, textStatus, thrownError);
                }
                else {
                    alert("An error has occurred: " + xhr.status + " " + xhr.statusText);
                }
            },
            data: action.data
        });
    }
};
