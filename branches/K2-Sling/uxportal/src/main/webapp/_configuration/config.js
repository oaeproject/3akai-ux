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

var Config = {
	URL : {
		LOGOUT_URL : "/dev/logout.html",
		GATEWAY_URL : "/dev/index.html",
		LOGOUT_SERVICE : "/rest/logout",
		BUNDLE_ROOT : "/dev/_bundle/",
		MY_DASHBOARD: "/dev/my_sakai.html",
		ME_SERVICE: "/rest/me",
		LOGIN_SERVICE: "/rest/login",
		CREATE_USER_SERVICE: "/system/userManager/user.create.html",
		USER_EXISTENCE_SERVICE: "/rest/user/__USERID__/exists",
		SEARCH_GENERAL_URL: "search_b.html"
	},
	SakaiDomain : "http://localhost:8080/",
	Profile : {
		// Fields that cannot be edited and so controlled by LDAP, ...
   		uneditable : ["txt_firstname","txt_lastname"]
	},
	Connections : {
		/*
		 * Email message that will be sent when inviting someone to become a connection. 
		 * ${user} will be replaced by the name of the current user and ${comment} will
		 * be replaced by the personal message left by the inviter.
		 */
		Invitation : {
			title : "${user} has invited you to become a connection",
			body : "Hi, \n\n ${user} has invited you to become a connection. \nHe/She has also left the following message: \n\n ${comment} \n\nTo accept this invitation, please click on the accept button. \n\nKind regards,\n\nThe Sakai Team"
		}
	},	
	Site : {
		// Default roles that will be available within a site, next to Owner
		Roles : ["Collaborator", "Viewer"]
	},
	Messages : {
		Types : {
			inbox : "inbox",
			sent : "sent",
			trash : "trash"
		},
		Categories : {
	        message: 'Message',
	        announcement: 'Announcement',
	        chat: 'Chat',
	        invitation: 'Invitation'
		},
		Subject : "subject",
		Type : "type",
		Body : "body",
		To : "to",
		read : "read"
	}
};