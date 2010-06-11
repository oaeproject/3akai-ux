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

var sakai = sakai || {};

sakai.config = {

    URL: {
        // Static URLs
        CONTENT_MEDIA_URL: "/dev/content_media.html",
        COURSES_SITES_URL: "/dev/courses_sites.html",
        GATEWAY_URL: "/dev/index.html",
        I18N_BUNDLE_ROOT: "/dev/_bundle/",
        LOGOUT_URL: "/dev/logout.html",
        MY_DASHBOARD_URL: "/dev/my_sakai.html",
        PEOPLE_URL: "/dev/people.html",
        PROFILE_URL: "/dev/profile.html",
        PUBLIC_CONTENT_MEDIA_URL: "/dev/public_content_media.html",
        PUBLIC_COURSES_SITES_URL: "/dev/public_courses_sites.html",
        PUBLIC_INSTITUTIONAL_LOGIN_URL: "/dev/i_index.html",
        PUBLIC_MY_DASHBOARD_URL: "/dev/my_sakai.html",
        PUBLIC_PEOPLE_URL: "/dev/public_people.html",
        PUBLIC_SEARCH_URL: "/dev/public_search.html",
        SEARCH_CONTENT_URL: "/dev/search_content.html",
        SEARCH_GENERAL_URL: "/dev/search.html",
        SEARCH_PEOPLE_URL: "search_people.html",
        SEARCH_SITES_URL: "search_sites.html",
        TINY_MCE_CONTENT_CSS: "/dev/_css/FSS/fss-base.css,/dev/_css/sakai/sakai.core.2.css,/dev/_css/sakai/sakai.css,/dev/_css/sakai/sakai.editor.css",
        USER_DEFAULT_ICON_URL: "/dev/_images/person_icon.jpg",
        USER_DEFAULT_UPLOAD_FOLDER: "/private/uploads",


        // Services
        BATCH: "/system/batch",
        CHAT_GET_SERVICE: "/var/message/chat/__KIND__.json",
        CHAT_UPDATE_SERVICE: "/var/message.chatupdate.json",
        CONTACTS_ACCEPTED: "/var/contacts/accepted.json",
        CONTACTS_INVITED: "/var/contacts/invited.json",
        CREATE_USER_SERVICE: "/system/userManager/user.create.html",
        DISCUSSION_GETPOSTS_THREADED: "/var/search/discussions/threaded.json?path=__PATH__&marker=__MARKER__",
        DISCUSSION_INITIALPOSTS_SERVICE: "/var/search/discussions/initialdiscussionposts.json?path=__PATH__&items=__ITEMS__&page=__PAGE__",
        FRIEND_ACCEPTED_SERVICE: "/var/contacts/accepted.json",
        GOOGLE_CHARTS_API: "http://chart.apis.google.com/chart",
        IMAGE_SERVICE: "/var/image/cropit",
        LOGIN_SERVICE: "/system/sling/formlogin",
        LOGOUT_SERVICE: "/system/sling/formlogin",
        ME_SERVICE: "/system/me",
        MESSAGE_BOX_SERVICE: "/var/message/internal/box.json",
        MESSAGE_BOXCATEGORY_SERVICE: "/var/message/boxcategory.json",
        PRESENCE_CONTACTS_SERVICE: "/var/presence.contacts.json",
        PRESENCE_SERVICE: "/var/presence.json",
        PROXY_RSS_SERVICE: "/var/proxy/rss.json?rss=",
        SAKAI2_TOOLS_SERVICE: "/var/proxy/s23/site.json?siteid=__SITEID__",
        // Replace these in widgets with proper widgetsave functions from magic
        SDATA_FETCH_BASIC_URL: "/sites/__PLACEMENT__/__TUID__",
        SDATA_FETCH_PLACEMENT_URL: "/sites/__PLACEMENT__",
        SDATA_FETCH_URL: "/sites/__PLACEMENT__/__TUID__/__NAME__",
        SDATA_FETCH: "/",
        // --
        SEARCH_ALL_FILES_SERVICE: "/var/search/files/allfiles.json",
        SEARCH_CONTENT_COMPREHENSIVE_SERVICE: "/var/search/sitecontent.json",
        SEARCH_CONTENT_SERVICE: "/var/search/content.json",
        SEARCH_MY_BOOKMARKS: "/var/search/files/mybookmarks.json",
        SEARCH_MY_CONTACTS: "/var/search/files/mycontacts.json",
        SEARCH_MY_FILES: "/var/search/files/myfiles.json",
        SEARCH_MY_SITES: "/var/search/files/mysites.json",
        SEARCH_PAGES: "/var/search/page.json",
        SEARCH_SITES: "/var/search/sites.json",
        SEARCH_USERS_ACCEPTED: "/var/contacts/find.json?s=",
        SEARCH_USERS: "/var/search/users.json",
        SITE_ADD_MEMBERS_SERVICE: "/_rest/site/members/add/__SITE__",
        SITE_CONFIGFOLDER: "/sites/__SITEID__",
        SITE_CREATE_SERVICE: "/sites.createsite.json",
        SITE_FILES_URL: "/sites/__SITEID__/_files",
        SITE_GET_MEMBERS_SERVICE: "/sites/__SITE__.members.json",
        SITE_GROUPDEF_URL: "/sites/__SITEID__/groupdef.json",
        SITE_NAVIGATION_CONTENT: "/sites/__SITEID__/_navigation/content.json",
        SITE_NAVIGATION: "/sites/__SITEID__/_navigation",
        SITE_PAGECONFIGURATION: "/sites/__SITEID__/pageconfiguration",
        SITE_PRINT_URL: "/dev/print.html?pagetitle=__CURRENTSITENAME__",
        SITE_REMOVE_MEMBERS_SERVICE: "/_rest/site/members/remove/__SITE__",
        SITE_ROOT: "/sites",
        SITE_TEMPLATE: "/var/templates/site/__TEMPLATE__",
        SITE_UPDATE_SERVICE: "/_rest/site/update/sites/__SITEID__",
        SITE_URL_SITEID: "/dev/site.html?siteid=__SITEID__",
        SITES_SERVICE: "/system/sling/membership.json",
        TWITTER_GET_URL: "/var/proxy/twitter/status.json",
        TWITTER_POST_URL: "/var/proxy/twitter/update_status.json",
        USER_CHANGELOCALE_SERVICE: "/rest/user/changelocale/__USERID__",
        USER_CHANGEPASS_SERVICE: "/system/userManager/user/__USERID__.changePassword.html",
        USER_EXISTENCE_SERVICE: "/system/userManager/user/__USERID__.json"

    },

    Search: {
        MAX_CORRECT_SEARCH_RESULT_COUNT: 100
    },

    SakaiDomain: window.location.protocol + "//" + window.location.host,

    Profile: {
        // Fields that cannot be edited and so controlled by LDAP, ...
        uneditable: ["txt_firstname", "txt_lastname"]
    },

    Connections: {
        /*
         * Email message that will be sent when inviting someone to become a connection.
         * ${user} will be replaced by the name of the current user and ${comment} will
         * be replaced by the personal message left by the inviter.
         */
        Invitation: {
            title: "${user} has invited you to become a connection",
            body: "Hi, \n\n ${user} has invited you to become a connection. \nHe/She has also left the following message: \n\n ${comment} \n\nTo accept this invitation, please click on the accept button. \n\nKind regards,\n\nThe Sakai Team"
        }
    },

    Site: {
        Styles: {
            original: {
                name: "Original sakai theme",
                image: "_images/sakai_grey.png",
                URL: "/dev/_skins/original/original.html"
            },
            camuniversity: {
                name: "Cambridge University theme",
                image: "/dev/_skins/camuniversity/images/camuniversity.png",
                URL: "/dev/_skins/camuniversity/camuniversity.html"
            }
        },
        DefaultMember:"viewers"
    },

    Messages: {
        Types: {
            inbox: "inbox",
            sent: "sent",
            trash: "trash"
        },
        Categories: {
            message: "Message",
            announcement: "Announcement",
            chat: "Chat",
            invitation: "Invitation"
        },
        Subject: "subject",
        Type: "type",
        Body: "body",
        To: "to",
        read: "read"
    },

    L10N: {
        DateFormat: "dd/MM/yyyy",
        TimeFormat: "HH:mm:ss",
        DateTimeFormat: "EEEEE, d MMMMM yy",
        DecimalPoint: ",",
        NumberSeparator: "."
    },

    MimeTypes: {
        "application/doc": {
            URL: "/dev/_images/mimetypes/doc.png",
            description: "Word document"
        },
        "application/pdf": {
            URL: "/dev/_images/mimetypes/pdf.png",
            description: "PDF document"
        },
        "text/plain": {
            URL: "/dev/_images/mimetypes/txt.png",
            description: "Text document"
        },
        "image/png": {
            URL: "/dev/_images/mimetypes/images.png",
            description: "Png image"
        },
        "image/gif": {
            URL: "/dev/_images/mimetypes/images.png",
            description: "Gif image"
        },
        "image/jpeg": {
            URL: "/dev/_images/mimetypes/images.png",
            description: "Jpg image"
        },
        "text/html": {
            URL: "/dev/_images/mimetypes/html.png",
            description: "HTML document"
        },
        folder: {
            URL: "/dev/_images/mimetypes/kmultiple.png",
            description: "Folder"
        },
        other: {
            URL: "/dev/_images/mimetypes/unknown.png",
            description: "Other document"
        }
    },

    displayDebugInfo: true,

    widgets: {}
};
