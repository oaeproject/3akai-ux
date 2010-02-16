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
        API_GOOGLE_CHARTS: "http://chart.apis.google.com/chart",
        BUNDLE_ROOT: "/dev/_bundle/",
        CONTENT_MEDIA_URL: "/dev/content_media.html",
        COURSES_SITES_PAGE: "/dev/courses_sites.html",
        GENERAL_SEARCH_SERVICE: "/var/search/page.json",
        GATEWAY_URL: "/dev/index.html",
        LOGOUT_URL : "/dev/logout.html",
        MY_DASHBOARD: "/dev/my_sakai.html",
        PATCH_PROFILE_URL: "/_user/public/__USERID__/authprofile",
        PEOPLE_URL: "/dev/people.html",
        PROFILE_URL: "/dev/profile.html",
        PUBLIC_INSTITUTIONAL_LOGIN_PAGE: "/dev/i_index.html",
        PUBLIC_MY_SAKAI_PAGE: "/dev/public_my_sakai.html",
        PUBLIC_PEOPLE_PAGE: "/dev/public_people.html",
        PUBLIC_COURSES_SITES_PAGE: "/dev/public_courses_sites.html",
        PUBLIC_CONTENT_MEDIA: "/dev/public_content_media.html",
        PUBLIC_SEARCH: "/dev/public_search.html",
        SEARCH_ALL_FILES: "/var/search/files/allfiles.json",
        SEARCH_CONTENT_URL: "/dev/search_content.html",
        SEARCH_GENERAL_URL: "/dev/search.html",
        SEARCH_MY_BOOKMARKS: "/var/search/files/mybookmarks.json",
        SEARCH_MY_CONTACTS: "/var/search/files/mycontacts.json",
        SEARCH_MY_FILES: "/var/search/files/myfiles.json",
        SEARCH_MY_SITES: "/var/search/files/mysites.json",
        SEARCH_PEOPLE_URL: "search_people.html",
        SEARCH_SITES_URL: "search_sites.html",
        PERSON_ICON_URL: "/dev/_images/person_icon.jpg",
        POLL_DROPDOWN_ICON_URL : "/devwidgets/poll/images/poll_drop_down.gif",
        RECENT_SITES_URL: "/_user/private/__USERSTORAGEPREFIX__recentsites.json",
        SAKAI2_TOOLS_SERVICE: "/var/proxy/s23/site.json?siteid=__SITEID__",
        SDATA_FETCH: "/",
        SDATA_FETCH_BASIC_URL: "/sites/__PLACEMENT__/__TUID__",
        SDATA_FETCH_PLACEMENT_URL: "/sites/__PLACEMENT__",
        SDATA_FETCH_PRIVATE_URL: "/_user/private",
        SDATA_FETCH_PUBLIC_URL: "/_user/public/__USERID__",
        SDATA_FETCH_URL: "/sites/__PLACEMENT__/__TUID__/__NAME__",
        SDATA_FUNCTION_PROPERTIES: "/sdata/f/__URL__?f=pr",
        SDATA_FUNCTION_PERMISSIONS: "/sdata/f/__URL__?f=pe",
        SITE_GROUPDEF_URL: "/sites/__SITEID__/groupdef.json",
        SITE_CONFIGFOLDER: "/sites/__SITEID__",
        SITE_FILES_URL: "/sites/__SITEID__/_files",
        SITE_PAGECONFIGURATION: "/sites/__SITEID__/pageconfiguration",
        SITE_NAVIGATION: "/sites/__SITEID__/_navigation",
        SITE_NAVIGATION_CONTENT: "/sites/__SITEID__/_navigation/content",
        SITE_PRINT_URL: "/dev/print.html?pagetitle=__CURRENTSITENAME__",
        SITE_URL: "/dev/site.html",
        SITE_URL_SITEID: "/dev/site.html?siteid=__SITEID__",
        TINY_MCE_CONTENT_CSS: "/dev/_css/FSS/fss-base.css,/dev/_css/sakai/sakai.core.2.css,/dev/_css/sakai/sakai.css,/dev/_css/sakai/sakai.editor.css",
        UPLOAD_URL: "/_user/files.upload.json",
        WEBDAV_PRIVATE_URL: "/webdav/_private",

        CHAT_GET_SERVICE: "/_user/message/chat/__KIND__.json",
        CHAT_UPDATE_SERVICE: "/_user/message.chatupdate.json",
        CREATE_USER_SERVICE: "/system/userManager/user.create.html",
        DISCUSSION_INITIALPOSTS_SERVICE: "/var/search/discussions/initialdiscussionposts.json?path=__PATH__&items=__ITEMS__&page=__PAGE__",
        DISCUSSION_GETPOSTS_THREADED: "/var/search/discussions/threaded.json?path=__PATH__&marker=__MARKER__",
        FRIEND_STATUS_SERVICE: "/rest/friend/status",
        FRIEND_CONNECT_SERVICE: "/rest/friend/connect/request",
        FRIEND_ACCEPTED_SERVICE: "/_user/contacts/accepted.json",
        IMAGE_SERVICE: "/var/image/cropit",
        LOGIN_SERVICE: "/system/sling/formlogin",
        LOGOUT_SERVICE : "/system/sling/formlogin",
        ME_SERVICE: "/system/me",
        ME_SERVICE_USERS: "/rest/me/__USERS__",
        MESSAGES_CREATE_SERVICE: "/_user/message.create.html",
        MESSAGES_COUNT_SERVICE: "/_user/message.count.json?filters=sakai:messagebox,sakai:read&values=inbox,false",
        MESSAGES_GET_SERVICE: "/_user/message/__ID__",
        MESSAGES_SEND_SERVICE: "/_rest/messages/send",
        MESSAGES_MESSAGES_SERVICE: "/_rest/messages/messages",
        MESSAGES_DELETE_SERVICE : "/_rest/messages/delete",
        PATCH_SERVICE: "/rest/patch",
        PRESENCE_CONTACTS_SERVICE: "/_user/presence.contacts.json",
        PROXY_SERVICE: "/var/proxy/rss.json?rss=",
        SEARCH_SERVICE: "/var/search/users",
        SEARCH_CONTENT_COMPREHENSIVE: "/var/search/sitecontent.json",
        SITE_GET_SERVICE: "/_rest/site/get",
        SITE_CREATE_SERVICE: "/_rest/site/create",
        SITE_UPDATE_SERVICE: "/_rest/site/update/sites/__SITEID__",
        SITE_GET_MEMBERS_SERVICE: "/sites/__SITE__.members.json",
        SITE_ADD_MEMBERS_SERVICE: "/_rest/site/members/add/__SITE__",
        SITE_REMOVE_MEMBERS_SERVICE: "/_rest/site/members/remove/__SITE__",
        SITES_SERVICE: "/system/sling/membership",
        USER_EXISTENCE_SERVICE: "/system/userManager/user/__USERID__.json",
        USER_CHANGEPASS_SERVICE: "/system/userManager/user/__USERID__.changePassword.html",
        USER_CHANGELOCALE_SERVICE: "/rest/user/changelocale/__USERID__",
        TEMPLATES: "/_user/private/_templates/pages/",
        TEMPLATES_CONFIG: "/_user/private/_templates/pages/configuration",
        TWITTER_GET_URL: "/var/proxy/twitter/status.json",
        TWITTER_POST_URL: "/var/proxy/twitter/update_status.json"
    },

    SakaiDomain : window.location.protocol + "//" + window.location.host,
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
        Styles : {
            original : {
                name : "Original sakai theme",
                image : "_images/sakai_grey.png",
                URL : "/dev/_skins/original/original.html"
            },
            camuniversity : {
                name : "Cambridge University theme",
                image : "/dev/_skins/camuniversity/images/camuniversity.png",
                URL : "/dev/_skins/camuniversity/camuniversity.html"
            }
        }
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
    },

    L10N: {
        DateFormat: "dd/MM/yyyy",
        TimeFormat: "HH:mm:ss",
        DateTimeFormat: "EEEEE, d MMMMM yy",
        DecimalPoint: ",",
        NumberSeparator: "."
    },

    MimeTypes : {
        "application/doc" : {
            URL : "/dev/_images/mimetypes/doc.png",
            description : "Word document"
        },
        "application/pdf" : {
            URL : "/dev/_images/mimetypes/pdf.png",
            description : "PDF document"
        },
        "text/plain" : {
            URL : "/dev/_images/mimetypes/txt.png",
            description : "Text document"
        },
        "image/png" : {
            URL : "/dev/_images/mimetypes/images.png",
            description : "Png image"
        },
        "image/gif" : {
            URL : "/dev/_images/mimetypes/images.png",
            description : "Gif image"
        },
        "image/jpeg" : {
            URL : "/dev/_images/mimetypes/images.png",
            description : "Jpg image"
        },
        folder : {
            URL : "http://www.ocf.berkeley.edu/~wwu/images/leopard-folder-big.png",
            description : "Folder"
        },
        other : {
            URL : "/dev/_images/mimetypes/unknown.png",
            description : "Other document"
        }
    },

    displayDebugInfo: true
};
