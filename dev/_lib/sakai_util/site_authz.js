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
sakai.lib.site.authz = {
	// Standard site membership roles
	roles: ["Collaborator", "Viewer"],
	// Supports internal logic for mapping UX roles to JCR groups
	roleToGroupPattern: {
		"Collaborator": "g-${siteId}-collaborators",
		"Viewer": "g-${siteId}-viewers"
	},
	// Standard mapping of roles to JCR permissions for all access schemes.
	standardAces: [{
		role: "Collaborator",
		aces: {
			"privilege@jcr:addChildNodes": "granted",
			"privilege@jcr:modifyAccessControl": "granted",
			"privilege@jcr:modifyProperties": "granted",
			"privilege@jcr:read": "granted",
			"privilege@jcr:readAccessControl": "granted",
			"privilege@jcr:removeChildNodes": "granted",
			"privilege@jcr:removeNode": "granted",
			"privilege@jcr:write": "granted"
		}
	}],
	// Standard site-wide schemes for site availability and access rights.
	accessTypes: {
		"online": {
			description: "Online",
			aceModifications: false // Re-apply availability scheme.
		},
		"offline": {
			description: "Offline",
			aceModifications: [{
				principal: "everyone",
				aces: {
					"privilege@jcr:read": "denied"
				}
			}],
			aceDeletions: [{
				role: "Viewer"
			}, {
				principal: "anonymous"
			}]
		},
		"everyone": {
			description: "Readable by general public",
			aceModifications: [{
				principal: "everyone",
				aces: {
					"privilege@jcr:read": "granted"
				}
			}],
			aceDeletions: [{
				role: "Viewer"
			}, {
				principal: "anonymous"
			}]
		},
		"sakaiUsers": {
			description: "Readable by any registered user",
			aceModifications: [{
				principal: "everyone",
				aces: {
					"privilege@jcr:read": "granted"
				}
			}, {
				principal: "anonymous",
				aces: {
					"privilege@jcr:read": "denied"
				}
			}],
			aceDeletions: [{
				role: "Viewer"
			}]
		},
		"invite": {
			description: "Only people I invite",
			aceModifications: [{
				role: "Viewer",
				aces: {
					"privilege@jcr:read": "granted"
				}
			}, {
				principal: "everyone",
				aces: {
					"privilege@jcr:read": "denied"
				}
			}],
			aceDeletions: [{
				principal: "anonymous"
			}]
		}
	},
	maintenanceRole: "Collaborator",
	defaultProperties: {
		status: "online",
		access: "everyone"
	}
};

/**
 * Get the mapping between a site role and the ID of the JCR group whose members
 * have that role.
 * 
 * TODO Since nothing prevents unrelated code from creating JCR user
 * groups with conflicting names, and since the JCR user group name isn't
 * of direct interest to the UI, a more robust link between site roles
 * and membership lists is desirable. For now, though, this just reorganizes
 * already existing logic rather than changing it.
 * 
 * @param {String} siteId
 */
sakai.lib.site.authz.getRoleToPrincipalMap = function(siteId){
	var roleGroupMap = {};
	var roles = sakai.lib.site.authz.roles;
	for (var i = 0, j = roles.length; i < j; i++) {
		var role = roles[i];
		var groupId = sakai.lib.site.authz.roleToGroupPattern[role].replace("${siteId}", siteId);
		roleGroupMap[role] = groupId;
	}
	return roleGroupMap;
};

/**
 * For a given site and a list of a user's JCR group memberships, return the role
 * (if any) that the user plays in that site. If the user is not a site member,
 * undefined is returned.
 *  
 * @param {String} siteId
 * @param {String[]} userMemberships JCR group IDs for the user
 */
sakai.lib.site.authz.getRole = function(siteId, userMemberships){
	var groupRoleMap = {};
	var role;
	var roles = sakai.lib.site.authz.roles;
	for (var i = 0, j = roles.length; i < j; i++) {
		role = roles[i];
		var groupId = sakai.lib.site.authz.roleToGroupPattern[role].replace("${siteId}", siteId);
		groupRoleMap[groupId] = role;
	}
	for (i = 0, j = userMemberships.length; i < j; i++) {
		if ((role = groupRoleMap[userMemberships[i]])) {
			break;
		}
	}
	return role;
};

/**
 * For a given site and a list of a user's JCR group memberships, return whether
 * the user should have access to the site's administrative and maintenance
 * functionality.
 * 
 * TODO Currently this is decided by the user's membership role in the site.
 * However, in a discussion list thread it was generally agreed that access to
 * the maintenance UX should be determined by JCR privileges rather than by
 * JCR group membership. E.g., this function should also return "true" for
 * non-site-members who have universal administrative rights. 
 * 
 * @param {String} siteId
 * @param {String[]} userMemberships JCR group IDs for the user
 */
sakai.lib.site.authz.isUserMaintainer = function(siteId, userMemberships){
	return (sakai.lib.site.authz.maintenanceRole === sakai.lib.site.authz.getRole(siteId, userMemberships));
};

/**
 * Return the array of POST action objects (each consisting of a URL and
 * a data object) which should be applied to a new site to set up standard
 * access rights.
 * @param {String} siteId
 */
sakai.lib.site.authz.getStandardAccessActions = function(siteId){
	var actions = [];
	var roleToPrincipal = sakai.lib.site.authz.getRoleToPrincipalMap(siteId);
	for (var i = 0, j = sakai.lib.site.authz.standardAces.length; i < j; i++) {
		var aceModification = sakai.lib.site.authz.standardAces[i];
		var principal = aceModification.principal || roleToPrincipal[aceModification.role];
		var data = $.extend({
			"principalId": principal
		}, aceModification.aces);
		actions.push({
			url: "/sites/" + siteId + ".modifyAce.json",
			data: data
		});
	}
	return actions;
};

/**
 * Return the array of POST action objects (each consisting of a URL and
 * a data object) which should be applied to a site to enforce the given
 * site availability status and access scheme.
 * 
 * @param {String} siteId
 * @param {String} statusType The availability status (e.g., "offline")
 * @param {String} accessType The accessability scheme (e.g., "everyone")
 */
sakai.lib.site.authz.getAccessActions = function(siteId, statusType, accessType){
	var aceModifications, aceDeletions;
	var settingDefs = sakai.lib.site.authz.accessTypes;
	// A status type will either override the access type or defer to the access type.
	var settingDef = settingDefs[statusType];
	if (!settingDef.aceModifications) {
		settingDef = settingDefs[accessType];
	}
	aceModifications = settingDef.aceModifications;
	aceDeletions = settingDef.aceDeletions;
	if (aceModifications || aceDeletions) {
		var roleToPrincipal = sakai.lib.site.authz.getRoleToPrincipalMap(siteId);
		var actions = [];
		var principal, data;
		for (var i = 0, j = aceModifications.length; i < j; i++) {
			var aceModification = aceModifications[i];
			principal = aceModification.principal || roleToPrincipal[aceModification.role];
			data = $.extend({
				"principalId": principal
			}, aceModification.aces);
			actions.push({
				url: "/sites/" + siteId + ".modifyAce.json",
				data: data
			});
		}
		if (aceDeletions.length > 0) {
			var applyToArray = [];
			for (i = 0, j = aceDeletions.length; i < j; i++) {
				var aceDeletion = aceDeletions[i];
				applyToArray.push(aceDeletion.principal || roleToPrincipal[aceDeletion.role]);
			}
			actions.push({
				url: "/sites/" + siteId + ".deleteAce.json",
				data: {
					":applyTo": applyToArray
				}
			});
		}
		return actions;
	}
	else {
		return false;
	}
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
