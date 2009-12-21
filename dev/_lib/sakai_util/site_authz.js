var sakai = sakai || {};
sakai.lib = sakai.lib || {};
sakai.lib.site = sakai.lib.site || {};
sakai.lib.site.authz = {
	roles: [
		"Collaborator",
		"Viewer"
	],
	roleToGroupPattern: {
		"Collaborator" : "g-${siteId}-collaborators",
		"Viewer" : "g-${siteId}-viewers"
	},
	standardAces: [{
		role: "Collaborator",
		aces: {
			"privilege@jcr:addChildNodes":"granted",
			"privilege@jcr:modifyAccessControl":"granted",
			"privilege@jcr:modifyProperties":"granted",
			"privilege@jcr:read":"granted",
			"privilege@jcr:readAccessControl":"granted",
			"privilege@jcr:removeChildNodes":"granted",
			"privilege@jcr:removeNode":"granted",
			"privilege@jcr:write":"granted"
		}
	}],
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
// TODO Since nothing prevents unrelated code from creating JCR user
// groups with conflicting names, and since the JCR user group name isn't
// of direct interest to the UI, a more robust link between site roles
// and groups is desirable. For now, though, this just reorganizes
// already existing logic rather than changing it.
sakai.lib.site.authz.getRoleToPrincipalMap = function (siteId) {
	var roleGroupMap = {};
    var roles = sakai.lib.site.authz.roles;
    for (var i = 0, j = roles.length; i < j; i++) {
        var role = roles[i];
        var groupId = sakai.lib.site.authz.roleToGroupPattern[role].replace("${siteId}", siteId);
        roleGroupMap[role] = groupId;
    }
    return roleGroupMap;
};
sakai.lib.site.authz.getRole = function (siteId, userMemberships) {
    var groupRoleMap = {};
    var roles = sakai.lib.site.authz.roles;
    for (var i = 0, j = roles.length; i < j; i++) {
        var role = roles[i];
        var groupId = sakai.lib.site.authz.roleToGroupPattern[role].replace("${siteId}", siteId);
        groupRoleMap[groupId] = role;
    }
    var role;
    for (i = 0, j = userMemberships.length; i < j; i++) {
        if (role = groupRoleMap[userMemberships[i]]) {
            break;
        }
    }
    return role;
};
sakai.lib.site.authz.isUserMaintainer = function(siteId, userMemberships) {
    return (sakai.lib.site.authz.maintenanceRole === sakai.lib.site.authz.getRole(siteId, userMemberships));
};
sakai.lib.site.authz.getStandardAccessActions = function(siteId) {
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
sakai.lib.site.authz.getAccessActions = function(siteId, statusType, accessType) {
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
        for (i = 0, j = aceModifications.length; i < j; i++) {
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
 * Send a series of HTTP POST requests.
 * For now, this just chains from the return from one request to submission
 * of the next.
 * TODO Replace with server-support for batch posting, as in:
 *   http://code.google.com/apis/gdata/docs/batch.html
 * 
 * @param {Object} actions array of objects each of which has the properties
 *                 url (where to send POST) and data (the parameter-values
 *                 map).
 */
sakai.lib.batchPosts = function(actions, success, error) {
	if (actions.length > 0) {
        var action = actions.shift();
        $.ajax({
            url: action.url,
            type: "POST",
            success: function(data, textStatus){
				if (actions.length > 0) {
					sakai.lib.batchPosts(actions, success, error);
				} else {
					if (success) {
						success(data, textStatus);
					}
				}
            },
            // error: error,
            error: function(request) {
            	if (error) {
            		error(request);
            	} else {
            		// See SAKIII-92.
            		// alert("An error has occurred: " + request.status + " " + request.statusText);
            		alert("An error has occurred: " + request);
            	}
            },
            data: action.data
        });
    }
};
