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
		BUNDLE_ROOT : "/dev/_bundle/",
		MY_DASHBOARD: "/dev/my_sakai.html",
		SDATA_FETCH: "/sdata/f",
		API_GOOGLE_CHARTS: "http://chart.apis.google.com/chart",
		GATEWAY_URL : "/dev/index.html",
		LOGOUT_URL : "/dev/logout.html",
		PATCH_PROFILE_URL: "/rest/patch/f/_private__USERSTORAGEPREFIX__profile.json",
		PEOPLE_URL: "/dev/people.html",
		PROFILE_URL: "/dev/profile.html",
		SEARCH_GENERAL_URL: "search_b.html",
		SEARCH_SITES_URL: "search_b_sites.html",
		SEARCH_CONTENT_URL: "search_b_content.html",
		SEARCH_PEOPLE_URL: "search_b_people.html",
		PERSON_ICON_URL: "/dev/_images/person_icon.png",
		POLL_DROPDOWN_ICON_URL : "/devwidgets/poll/images/poll_drop_down.gif",
		RECENT_SITES_URL: "/sdata/p/recentsites.json",
		SDATA_FETCH_BASIC_URL: "/sdata/f/__PLACEMENT__/__TUID__",
		SDATA_FETCH_PLACEMENT_URL: "/sdata/f/__PLACEMENT__",
		SDATA_FETCH_PRIVATE_URL: "/sdata/f/_private",
		SDATA_FETCH_URL: "/sdata/f/__PLACEMENT__/__TUID__/__NAME__",
		SDATA_FUNCTION_PROPERTIES: "/sdata/f/__URL__?f=pr",
		SDATA_FUNCTION_PERMISSIONS: "/sdata/f/__URL__?f=pe",
		SITE_URL: "/dev/site.html",
		SITE_URL_SITEID: "/dev/site.html?siteid=__SITEID__",
		WEBDAV_PRIVATE_URL: "/webdav/_private",
		CHAT_GET_SERVICE: "/_rest/chat/get",
		CHAT_SEND_SERVICE: "/_rest/chat/send",
		CREATE_USER_SERVICE: "/rest/user/new",
		FRIEND_STATUS_SERVICE: "/rest/friend/status",
		FRIEND_CONNECT_SERVICE: "/rest/friend/connect/request",
		IMAGE_SERVICE: "/_rest/image/cropit",
		LOGIN_SERVICE: "/rest/login",
		LOGOUT_SERVICE : "/rest/logout",
		ME_SERVICE: "/rest/me",
		ME_SERVICE_USERS: "/rest/me/__USERS__",
		MESSAGES_COUNT_SERVICE: "/_rest/messages/count",
		MESSAGES_SEND_SERVICE: "/_rest/messages/send",
		MESSAGES_MESSAGES_SERVICE: "/_rest/messages/messages",
        MESSAGES_DELETE_SERVICE : "/_rest/messages/delete",
		PATCH_SERVICE: "/rest/patch",
		PRESENCE_FRIENDS_SERVICE: "/_rest/presencewow/friends",
		PROXY_SERVICE: "/proxy/proxy",
		SEARCH_SERVICE: "/rest/search",
		SITE_GET_SERVICE: "/_rest/site/get",
		SITE_CREATE_SERVICE: "/_rest/site/create",
		SITE_UPDATE_SERVICE: "/_rest/site/update/__SITEID__",
		SITE_GET_MEMBERS_SERVICE: "/_rest/site/members/list/__SITE__",
		SITE_ADD_MEMBERS_SERVICE: "/_rest/site/members/add/__SITE__",
		SITE_REMOVE_MEMBERS_SERVICE: "/_rest/site/members/remove/__SITE__",
		SITES_SERVICE: "/rest/sites",
		USER_EXISTENCE_SERVICE: "/rest/user/__USERID__/exists",
		USER_CHANGEPASS_SERVICE: "/rest/user/changepassword/__USERID__",
		USER_CHANGELOCALE_SERVICE: "/rest/user/changelocale/__USERID__"
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