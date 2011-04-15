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
define(function(){
    var config = {
        URL: {
            // Static URLs
            CONTENT_MEDIA_URL: "/dev/content_media.html",
            COURSES_SITES_URL: "/dev/courses_sites.html",
            GATEWAY_URL: "/",
            GROUP_EDIT_URL: "/group/edit",
            I10N_BUNDLE_URL: "/dev/lib/misc/l10n/globinfo/Globalization.__CODE__.min.js",
            I18N_BUNDLE_ROOT: "/dev/bundle/",
            INBOX_URL: "/inbox",
            LOGOUT_URL: "/logout",
            MY_DASHBOARD_URL: "/home",
            PEOPLE_URL: "/people",
            PROFILE_EDIT_URL: "/profile/edit",
            PUBLIC_CONTENT_MEDIA_URL: "/dev/public_content_media.html",
            PUBLIC_COURSES_SITES_URL: "/dev/public_courses_sites.html",
            PUBLIC_INSTITUTIONAL_LOGIN_URL: "/dev/i_index.html",
            PUBLIC_MY_DASHBOARD_URL: "/home",
            PUBLIC_PEOPLE_URL: "/dev/public_people.html",
            PUBLIC_SEARCH_URL: "/dev/public_search.html",
            SEARCH_CONTENT_URL: "/search/content",
            SEARCH_GENERAL_URL: "/search",
            SEARCH_PEOPLE_URL: "/search/people",
            SEARCH_GROUP_URL: "/search/groups",
            SEARCH_SITES_URL: "/search/sites",
            TINY_MCE_CONTENT_CSS: "/dev/css/FSS/fss-base.css,/dev/css/sakai/sakai.base.css,/dev/css/sakai/sakai.editor.css,/dev/css/sakai/sakai.show.css",
            TINY_MCE_EDITOR_CSS: "/dev/css/sakai/tinymce_editor_styling.css",
            USER_DEFAULT_ICON_URL_SMALL: "/dev/images/user_avatar_icon_32x32.png",
            USER_DEFAULT_ICON_URL: "/dev/images/user_avatar_icon_48x48.png",
            USER_DEFAULT_UPLOAD_FOLDER: "/private/uploads",

            // Services
            ACTIVITY_PERSONAL: "/var/search/activity/myfeed.json",
            ACTIVITY_SITE: "/var/search/activity/sitefeed.json",
            BATCH: "/system/batch",
            CAPTCHA_SERVICE: "/system/captcha",
            CHAT_GET_SERVICE: "/var/message/chat/__KIND__.json",
            CHAT_UPDATE_SERVICE: "/var/message.chatupdate.json",
            CONTACTS_FIND: "/var/contacts/find.json",
            CONTACTS_FIND_STATE: "/var/contacts/findstate.json",
            CONTACTS_FIND_ALL: "/var/contacts/find-all.json",
            CREATE_USER_SERVICE: "/system/userManager/user.create.html",
            DISCUSSION_GETPOSTS_THREADED: "/var/search/discussions/threaded.json?path=__PATH__&marker=__MARKER__",
            DISCUSSION_INITIALPOSTS_SERVICE: "/var/search/discussions/initialdiscussionposts.json?path=__PATH__&items=__ITEMS__&page=__PAGE__",
            GOOGLE_CHARTS_API: "http://chart.apis.google.com/chart",
            GROUP_CREATE_SERVICE: "/system/userManager/group.create.json",
            GROUPS_MANAGER: "/system/me/managedgroups.json",
            GROUPS_MEMBER: "/system/me/groups.json",
            HEADER_SERVICE: "/var/proxy/header.json",
            IMAGE_SERVICE: "/var/image/cropit",
            LOGIN_SERVICE: "/system/sling/formlogin",
            LOGOUT_SERVICE: "/system/sling/logout?resource=/dev/index.html",
            ME_SERVICE: "/system/me",
            MESSAGE_BOX_SERVICE: "/var/message/box.json",
            MESSAGE_BOXCATEGORY_SERVICE: "/var/message/boxcategory.json",
            POOLED_CONTENT_MANAGER: "/var/search/pool/me/manager.json",
            POOLED_CONTENT_MANAGER_ALL: "/var/search/pool/me/manager-all.json",
            POOLED_CONTENT_VIEWER: "/var/search/pool/me/viewer.json",
            POOLED_CONTENT_VIEWER_ALL: "/var/search/pool/me/viewer-all.json",
            POOLED_CONTENT_ACTIVITY_FEED: "/var/search/pool/activityfeed.json",
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
            SEARCH_ALL_FILES: "/var/search/pool/all.json",
            SEARCH_ALL_FILES_ALL: "/var/search/pool/all-all.json",
            SEARCH_ALL_FILES_SERVICE: "/var/search/files/allfiles.json",
            SEARCH_ALL_FILES_SERVICE_ALL: "/var/search/files/allfiles-all.json",
            SEARCH_CONTENT_COMPREHENSIVE_SERVICE: "/var/search/sitecontent.json",
            SEARCH_CONTENT_SERVICE: "/var/search/content.json",
            SEARCH_MY_BOOKMARKS: "/var/search/files/mybookmarks.json",
            SEARCH_MY_BOOKMARKS_ALL: "/var/search/files/mybookmarks-all.json",
            SEARCH_MY_CONTACTS: "/var/search/files/mycontacts.json",
            SEARCH_MY_FILES: "/var/search/files/myfiles.json",
            SEARCH_MY_FILES_ALL: "/var/search/files/myfiles-all.json",
            SEARCH_MY_SITES: "/var/search/files/mysites.json",
            SEARCH_GROUP_MEMBERS: "/var/search/groupmembers.json",
            SEARCH_GROUP_MEMBERS_ALL: "/var/search/groupmembers-all.json",
            SEARCH_GROUPS: "/var/search/groups.infinity.json",
            SEARCH_GROUPS_ALL: "/var/search/groups-all.json",
            SEARCH_PAGES: "/var/search/page.json",
            SEARCH_SITES: "/var/search/sites.json",
            SEARCH_USERS_ACCEPTED: "/var/contacts/findstate.infinity.json",
            SEARCH_USERS: "/var/search/users.infinity.json",
            SEARCH_USERS_ALL: "/var/search/users-all.json",
            SEARCH_USERS_GROUPS: "/var/search/usersgroups.json",
            SEARCH_USERS_GROUPS_ALL: "/var/search/usersgroups-all.json",
            SITE_ADD_MEMBERS_SERVICE: "/_rest/site/members/add/__SITE__",
            SITE_CONFIGFOLDER: "/sites/__SITEID__",
            SITE_CREATE_SERVICE: "/sites.createsite.json",
            SITE_FILES_URL: "/sites/__SITEID__/_files",
            SITE_GET_MEMBERS_SERVICE: "/sites/__SITE__.members.json",
            SITE_GROUPDEF_URL: "/sites/__SITEID__/groupdef.json",
            SITE_JOIN_REQUESTS: "/var/sites/joinrequests/pending.json",
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
            USER_EXISTENCE_SERVICE: "/system/userManager/user.exists.html?userid=__USERID__",

            // PREFIXES
            GROUP_PREFIX: "/_group",
            USER_PREFIX: "/_user"

        },

        PageTitles: {
            "prefix": "TITLE_PREFIX",
            "pages": {
                /**  403.html  **/
                /**  404.html  **/
                /**  500.html  **/
                /**  account_preferences.html  **/
                "/dev/account_preferences.html": "ACCOUNT_PREFERENCES",
                "/preferences": "ACCOUNT_PREFERENCES",
                /**  acknowledgements.html  **/
                "/dev/acknowledgements.html": "ACKNOWLEDGEMENTS",
                "/acknowledgements": "ACKNOWLEDGEMENTS",
                /**  content_profile.html  **/
                "/dev/content_profile.html": "CONTENT_PROFILE",
                "/content": "CONTENT_PROFILE",
                /**  create_new_account.html  **/
                "/dev/create_new_account.html": "CREATE_A_NEW_ACCOUNT",
                "/register": "CREATE_A_NEW_ACCOUNT",
                /**  directory.html  **/
                "/dev/directory.html": "DIRECTORY",
                "/directory": "DIRECTORY",
                /**  group_edit.html  **/
                "/dev/group_edit.html": "MANAGE_GROUP",
                "/group/edit": "MANAGE_GROUP",
                /**  inbox.html  **/
                "/dev/inbox.html": "MY_MESSAGES",
                "/inbox": "MY_MESSAGES",
                /**  index.html  **/
                "/": "SIGN_IN",
                "/dev": "SIGN_IN",
                "/dev/": "SIGN_IN",
                "/index.html": "SIGN_IN",
                "/dev/index.html": "SIGN_IN",
                "/index": "SIGN_IN",
                /**  logout.html  **/
                "/dev/logout.html": "LOGGING_OUT",
                "/logout": "LOGGING_OUT",
                /**  my_sakai.html  **/
                "/dev/my_sakai.html": "MY_SAKAI",
                "/home": "MY_SAKAI",
                /**  people.html  **/
                "/dev/people.html": "PEOPLE",
                "/people": "PEOPLE",
                /**  profile_edit.html  **/
                "/dev/profile_edit.html": "EDIT_MY_PROFILE",
                "/profile/edit": "EDIT_MY_PROFILE",
                /**  search.html  **/
                "/dev/search.html": "SEARCH_ALL",
                "/search": "SEARCH_ALL",
                /**  search_groups.html  **/
                "/dev/search_groups.html": "SEARCH_GROUPS",
                "/search/groups": "SEARCH_GROUPS",
                /**  search_people.html  **/
                "/dev/search_people.html": "SEARCH_PEOPLE",
                "/search/people": "SEARCH_PEOPLE",
                /**  search_content.html  **/
                "/dev/search_content.html": "SEARCH_CONTENT_AND_MEDIA",
                "/search/content": "SEARCH_CONTENT_AND_MEDIA"
                /**  show.html  **/
            }
        },

        Domain: {
            /*
             * These domain labels can be used anywhere on the site (i.e in the video
             * widget) to convert common domains into shorter, more readable labels
             * for display purposes.
             */
            Labels: {
                "youtube.com": "YouTube",
                "www.youtube.com": "YouTube",
                "youtube.co.uk": "YouTube",
                "www.youtube.co.uk": "YouTube",
                "vimeo.com": "Vimeo",
                "www.vimeo.com": "Vimeo",
                "vimeo.co.uk": "Vimeo",
                "www.vimeo.co.uk": "Vimeo",
                "video.google.com": "Google Video"
            }
        },

        Search: {
            MAX_CORRECT_SEARCH_RESULT_COUNT: 100
        },

        SakaiDomain: window.location.protocol + "//" + window.location.host,

        Permissions: {
            /*
             * A collection of permission keys and range of values to be referenced
             * for making permissions decisions. The values of properties are only
             * for reference, may not match designs and are not to be placed in the
             * UI (message bundles should be used to match up-to-date designs).
             */
            Groups: {
                joinable: {
                    "manager_add": "no", // Managers add people
                    "user_direct": "yes", // People can automatically join
                    "user_request": "withauth" // People request to join
                },
                visible: {
                    "members": "members-only", // Group members only (includes managers)
                    "allusers": "logged-in-only", // All logged in users
                    "public": "public", // Anyone on the Internet
                    "managers": "managers-only" // Group managers only
                }
            },
            Copyright: {
                "creativecommons": {
                    "title": "CREATIVE_COMMONS_LICENSE",
                    "default": true
                },
                "copyrighted": {
                    "title": "COPYRIGHTED"
                },
                "nocopyright": {
                    "title": "NO_COPYRIGHT"
                },
                "licensed": {
                    "title": "LICENSED"
                },
                "waivecopyright": {
                    "title": "WAIVE_COPYRIGHT"
                }
            }
        },

        allowPasswordChange: true,

        Profile: {
            /*
             * This is a collection of profile configuration functions and settings
             * The structure of the config object is identical to the storage object
             * When system/me returns profile data for the logged in user the profile_config and profile_data objects could be merged
             * "label": the internationalizable message for the entry label in HTML
             * "required": {Boolean} Whether the entry is compulsory or not
             * "display": {Boolean} Show the entry in the profile or not
             * "editable": {Boolean} Whether or not the entry is editable
             * For a date entry field use "date" as the type for MM/dd/yyyy and "dateITA" as the type for dd/MM/yyyy
             *
             */
            configuration: {
            
                defaultConfig: {
                
                    "basic": {
                        "label": "__MSG__PROFILE_BASIC_LABEL__",
                        "required": true,
                        "display": true,
                        "access": "everybody",
                        "modifyacl": false,
                        "elements": {
                            "firstName": {
                                "label": "__MSG__PROFILE_BASIC_FIRSTNAME_LABEL__",
                                "required": true,
                                "display": true,
                                "limitDisplayLength": 50
                            },
                            "lastName": {
                                "label": "__MSG__PROFILE_BASIC_LASTNAME_LABEL__",
                                "required": true,
                                "display": true,
                                "limitDisplayLength": 50
                            },
                            "picture": {
                                "label": "__MSG__PROFILE_BASIC_PICTURE_LABEL__",
                                "required": false,
                                "display": false
                            },
                            "preferredName": {
                                "label": "__MSG__PROFILE_BASIC_PREFERREDNAME_LABEL__",
                                "required": false,
                                "display": true
                            },
                            "email": {
                                "label": "__MSG__PROFILE_BASIC_EMAIL_LABEL__",
                                "required": false,
                                "display": true,
                                "type": "email"
                            },
                            "status": {
                                "label": "__MSG__PROFILE_BASIC_STATUS_LABEL__",
                                "required": false,
                                "display": false
                            },
                            "role": {
                                "label": "__MSG__PROFILE_BASIC_ROLE_LABEL__",
                                "required": false,
                                "display": true,
                                "type": "select",
                                "select_elements": {
                                    "academic_related_staff": "__MSG__PROFILE_BASIC_ROLE_ACADEMIC_RELATED_STAFF_LABEL__",
                                    "academic_staff": "__MSG__PROFILE_BASIC_ROLE_ACADEMIC_STAFF_LABEL__",
                                    "assistent_staff": "__MSG__PROFILE_BASIC_ROLE_ASSISTENT_STAFF_LABEL__",
                                    "graduate_student": "__MSG__PROFILE_BASIC_ROLE_GRADUATE_STUDENT_LABEL__",
                                    "undergraduate_student": "__MSG__PROFILE_BASIC_ROLE_UNDERGRADUATE_STUDENT_LABEL__",
                                    "non_academic_staff": "__MSG__PROFILE_BASIC_ROLE_NON_ACADEMIC_STAFF_LABEL__",
                                    "postgraduate_student": "__MSG__PROFILE_BASIC_ROLE_POSTGRADUATE_STUDENT_LABEL__",
                                    "research_staff": "__MSG__PROFILE_BASIC_ROLE_RESEARCH_STAFF_LABEL__",
                                    "other": "__MSG__PROFILE_BASIC_ROLE_OTHER_LABEL__"
                                }
                            },
                            "department": {
                                "label": "__MSG__PROFILE_BASIC_DEPARTMENT_LABEL__",
                                "required": false,
                                "display": true
                            },
                            "college": {
                                "label": "__MSG__PROFILE_BASIC_COLLEGE_LABEL__",
                                "required": false,
                                "display": true
                            },
                            "tags": {
                                "label": "__MSG__TAGS__",
                                "required": false,
                                "display": true,
                                "type": "textarea",
                                "tagField": true
                            }
                        }
                    },
                    "aboutme": {
                        "label": "__MSG__PROFILE_ABOUTME_LABEL__",
                        "required": true,
                        "display": true,
                        "access": "everybody",
                        "modifyacl": true,
                        "elements": {
                            "aboutme": {
                                "label": "__MSG__PROFILE_ABOUTME_LABEL__",
                                "required": false,
                                "display": true,
                                "type": "textarea"
                            },
                            "academicinterests": {
                                "label": "__MSG__PROFILE_ABOUTME_ACADEMICINTERESTS_LABEL__",
                                "required": false,
                                "display": true,
                                "type": "textarea"
                            },
                            "personalinterests": {
                                "label": "__MSG__PROFILE_ABOUTME_PERSONALINTERESTS_LABEL__",
                                "required": false,
                                "display": true,
                                "type": "textarea"
                            },
                            "hobbies": {
                                "label": "__MSG__PROFILE_ABOUTME_HOBBIES_LABEL__",
                                "required": false,
                                "display": true
                            }
                        }
                    },
                    "locations": {
                        "label": "__MSG__PROFILE_LOCATIONS_LABEL__",
                        "required": false,
                        "display": true,
                        "access": "everybody",
                        "modifyacl": true,
                        "multiple": true,
                        "directory": true,
                        "multipleLabel": "__MSG__PROFILE_LOCATION_LABEL__",
                        "elements": {
                            "locationtitle": {
                                "label": "__MSG__PROFILE_LOCATION_LABEL__",
                                "required": true,
                                "display": true,
                                "type": "location"
                            }
                        }
                    },
                    "publications": {
                        "label": "__MSG__PROFILE_PUBLICATIONS_LABEL__",
                        "required": false,
                        "display": true,
                        "access": "everybody",
                        "modifyacl": true,
                        "multiple": true,
                        "multipleLabel": "__MSG__PROFILE_PUBLICATION_LABEL__",
                        //"template": "profile_section_publications_template",
                        "elements": {
                            "maintitle": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_MAIN_TITLE__",
                                "required": true,
                                "display": true,
                                "example": "__MSG__PROFILE_PUBLICATIONS_MAIN_TITLE_EXAMPLE__"
                            },
                            "mainauthor": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_MAIN_AUTHOR__",
                                "required": true,
                                "display": true
                            },
                            "coauthor": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_CO_AUTHOR__",
                                "required": false,
                                "display": true,
                                "example": "__MSG__PROFILE_PUBLICATIONS_CO_AUTHOR_EXAMPLE__"
                            },
                            "publisher": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_PUBLISHER__",
                                "required": true,
                                "display": true
                            },
                            "placeofpublication": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_PLACE_OF_PUBLICATION__",
                                "required": true,
                                "display": true
                            },
                            "volumetitle": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_VOLUME_TITLE__",
                                "required": false,
                                "display": true
                            },
                            "volumeinformation": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_VOLUME_INFORMATION__",
                                "required": false,
                                "display": true,
                                "example": "__MSG__PROFILE_PUBLICATIONS_VOLUME_INFORMATION_EXAMPLE__"
                            },
                            "year": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_YEAR__",
                                "required": true,
                                "display": true
                            },
                            "number": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_NUMBER__",
                                "required": false,
                                "display": true
                            },
                            "series title": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_SERIES_TITLE__",
                                "required": false,
                                "display": true
                            },
                            "url": {
                                "label": "__MSG__PROFILE_PUBLICATIONS_URL__",
                                "required": false,
                                "display": true,
                                "validation": "appendhttp url"
                            }
                        }
                    }
                }
            },
            /*
             * set how the user's name is displayed across the entire system
             * - values can be compound, like "firstName lastName" or singular like "displayName"
             */
            userNameDisplay: "firstName lastName",

            /*
             * the default, if the user doesn't have the userNameDisplay property set in their
             * profile, use this one.
             * Note: the value for userNameDisplay and this value can be the same.
             *       If neither exists, nothing will show
             */
            userNameDefaultDisplay: "firstName lastName",

            /*
             * Set the user's short description to appear underneath their name
             * in search results
             */
            userShortDescription: "${role} in ${department} at ${college}",
            groupShortDescription: "asdf"
        },

        Groups: {
            /*
             * Email message that will be sent to group managers when a user requests
             * to join their group.
             * ${user} will be replaced by the name of the requesting user and ${group}
             * will be replaced with the group name.
             */
            JoinRequest: {
                title: "${user} has requested to join your group: ${group}",
                body: "Hi, \n\n ${user} has requested to join your group: ${group}. Use the links below to respond to this request. \n\n Kind regards,\n\nThe Sakai Team"
            }
        },

        Relationships: {
            /*
             * Relationships used by the add contacts widget to define what relationship the contacts can have
             */
            "contacts": [{
                "name": "Classmate",
                "definition": "is my classmate",
                "selected": true
            }, {
                "name": "Supervisor",
                "inverse": "Supervised",
                "definition": "is my supervisor",
                "selected": false
            }, {
                "name": "Supervised",
                "inverse": "Supervisor",
                "definition": "is being supervised by me",
                "selected": false
            }, {
                "name": "Lecturer",
                "inverse": "Student",
                "definition": "is my lecturer",
                "selected": false
            }, {
                "name": "Student",
                "inverse": "Lecturer",
                "definition": "is my student",
                "selected": false
            }, {
                "name": "Colleague",
                "definition": "is my colleague",
                "selected": false
            }, {
                "name": "College Mate",
                "definition": "is my college mate",
                "selected": false
            }, {
                "name": "Shares Interests",
                "definition": "shares an interest with me",
                "selected": false
            }]
        },

        Site: {
            Styles: {
                original: {
                    name: "Original sakai theme",
                    image: "/dev/images/sakai_grey.png",
                    URL: "/dev/skins/original/original.html"
                },
                camuniversity: {
                    name: "Cambridge University theme",
                    image: "/dev/skins/camuniversity/images/camuniversity.png",
                    URL: "/dev/skins/camuniversity/camuniversity.html"
                }
            },
            DefaultMember: "viewers"
        },

        SystemTour: {
            "enableReminders": true,
            "reminderIntervalHours": "168"
        },

        Institution: {
            /*
             * Institution contact details are displayed in the footer
             */
            helpLinkText: "Contact Us",
            helpLinkUrl: "http://www.sakaiproject.org/contact",
            helpPhone: "212-555-1212"
        },

        // Set this to true if you have an authentication system such as CAS
        // that needs to redirect the user's browser on logout
        followLogoutRedirects: false,

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
        Extensions:{
            "docx":"application/doc",
            "doc":"application/doc",
            "odt":"application/doc",
            "ods":"application/vnd.ms-excel",
            "xls":"application/vnd.ms-excel",
            "xlsx":"application/vnd.ms-excel",
            "odp":"application/vnd.ms-powerpoint",
            "ppt":"application/vnd.ms-powerpoint",
            "pptx":"application/vnd.ms-powerpoint",
            "odg":"image/jpeg",
            "png":"image/png",
            "jpg":"image/jpeg",
            "jpeg":"image/jpeg",
            "bmp":"image/bmp",
            "gif":"image/gif",
            "pdf":"application/x-pdf",
            "swf":"application/x-shockwave-flash",
            "flv":"video/x-msvideo",
            "mpg":"video/x-msvideo",
            "mpeg":"video/x-msvideo",
            "mp4":"video/x-msvideo",
            "avi":"video/x-msvideo",
            "mov":"video/x-msvideo",
            "txt":"text/rtf",
            "rtf":"text/rtf",
            "htm":"text/html",
            "html":"text/html",
            "other":"other"
        },
        MimeTypes: {
            "application/doc": {
                cssClass: "icon-doc-sprite",
                URL: "/dev/images/mimetypes/doc.png",
                description: "WORD_DOCUMENT"
            },
            "application/msword": {
                cssClass: "icon-doc-sprite",
                URL: "/dev/images/mimetypes/doc.png",
                description: "WORD_DOCUMENT"
            },
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
                cssClass: "icon-doc-sprite",
                URL: "/dev/images/mimetypes/doc.png",
                description: "WORD_DOCUMENT"
            },
            "application/pdf": {
                cssClass: "icon-pdf-sprite",
                URL: "/dev/images/mimetypes/pdf.png",
                description: "PDF_DOCUMENT"
            },
            "application/x-download": {
                cssClass: "icon-pdf-sprite",
                URL: "/dev/images/mimetypes/pdf.png",
                description: "PDF_DOCUMENT"
            },
            "application/x-pdf": {
                cssClass: "icon-pdf-sprite",
                URL: "/dev/images/mimetypes/pdf.png",
                description: "PDF_DOCUMENT"
            },
            "application/vnd.ms-powerpoint": {
                cssClass: "icon-pps-sprite",
                URL: "/dev/images/mimetypes/pps.png",
                description: "POWERPOINT_DOCUMENT"
            },
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
                cssClass: "icon-pps-sprite",
                URL: "/dev/images/mimetypes/pps.png",
                description: "POWERPOINT_DOCUMENT"
            },
            "application/vnd.oasis.opendocument.text": {
                cssClass: "icon-doc-sprite",
                URL: "/dev/images/mimetypes/doc.png",
                description: "OPEN_OFFICE_DOCUMENT"
            },
            "application/x-shockwave-flash": {
                cssClass: "icon-swf-sprite",
                URL: "/dev/images/mimetypes/swf.png",
                description: "FLASH_PLAYER_FILE"
            },
            "application/zip": {
                cssClass: "icon-zip-sprite",
                URL: "/dev/images/mimetypes/zip.png",
                description: "ARCHIVE_FILE"
            },
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                cssClass: "icon-spreadsheet-sprite",
                URL: "/dev/images/mimetypes/spreadsheet.png",
                description: "SPREADSHEET_DOCUMENT"
            },
            "application/vnd.ms-excel": {
                cssClass: "icon-spreadsheet-sprite",
                URL: "/dev/images/mimetypes/spreadsheet.png",
                description: "SPREADSHEET_DOCUMENT"
            },
            "text/plain": {
                cssClass: "icon-txt-sprite",
                URL: "/dev/images/mimetypes/txt.png",
                description: "TEXT_DOCUMENT"
            },
            "text/rtf": {
                cssClass: "icon-txt-sprite",
                URL: "/dev/images/mimetypes/txt.png",
                description: "TEXT_DOCUMENT"
            },
            "image/png": {
                cssClass: "icon-image-sprite",
                URL: "/dev/images/mimetypes/images.png",
                description: "PNG_IMAGE"
            },
            "image/bmp": {
                cssClass: "icon-image-sprite",
                URL: "/dev/images/mimetypes/images.png",
                description: "BMP_IMAGE"
            },
            "image/gif": {
                cssClass: "icon-image-sprite",
                URL: "/dev/images/mimetypes/images.png",
                description: "GIF_IMAGE"
            },
            "image/jpeg": {
                cssClass: "icon-image-sprite",
                URL: "/dev/images/mimetypes/images.png",
                description: "JPG_IMAGE"
            },
            "image/pjpeg": {
                cssClass: "icon-image-sprite",
                URL: "/dev/images/mimetypes/images.png",
                description: "JPG_IMAGE"
            },
            "text/html": {
                cssClass: "icon-html-sprite",
                URL: "/dev/images/mimetypes/html.png",
                description: "HTML_DOCUMENT"
            },
            "video/x-msvideo": {
                cssClass: "icon-video-sprite",
                URL: "/dev/images/mimetypes/video.png",
                description: "VIDEO_FILE"
            },
            "video/mp4": {
                cssClass: "icon-video-sprite",
                URL: "/dev/images/mimetypes/video.png",
                description: "VIDEO_FILE"
            },
            "video/quicktime": {
                cssClass: "icon-video-sprite",
                URL: "/dev/images/mimetypes/video.png",
                description: "VIDEO_FILE"
            },
            "folder": {
                cssClass: "icon-kmultiple-sprite",
                URL: "/dev/images/mimetypes/kmultiple.png",
                description: "FOLDER"
            },
            "x-sakai/link": {
                cssClass: "icon-url-sprite",
                URL: "/dev/images/mimetypes/html.png",
                description: "URL_LINK"
            },
            "x-sakai/document": {
                cssClass: "icon-sakaidoc-sprite",
                URL: "/dev/images/mimetypes/sakaidoc.png",
                description: "DOCUMENT"
            },
            "other": {
                cssClass: "icon-unknown-sprite",
                URL: "/dev/images/mimetypes/unknown.png",
                description: "OTHER_DOCUMENT"
            }
        },

        Authentication: {
            "allowInternalAccountCreation": true,
            "internal": true,
            "external": [{
                label: "External Login System 1",
                url: "http://external.login1.com/"
            }, {
                label: "External Login System 2",
                url: "http://external.login2.com/"
            }],
            "hideLoginOn": ["/dev", "/dev/index.html", "/dev/create_new_account.html"]
        },
        
        notification: {
            type: {
                ERROR: {
                    image: "/dev/images/notifications_exclamation_icon.png",
                    time: 10000
                },
                INFORMATION: {
                    image: "/dev/images/notifications_info_icon.png",
                    time: 5000
                }
            }
        },

        Navigation: [{
            "url": "/dev/user.html#",
            "id": "navigation_you_link",
            "anonymous": false,
            "label": "YOU",
            "subnav": [{
                "url": "/dev/user.html#",
                "id": "subnavigation_home_link",
                "label": "MY_HOME"
            }, {
                "url": "/dev/user.html#l=messages/inbox",
                "id": "subnavigation_messages_link",
                "label": "MY_MESSAGES"
            }, {
                "id": "subnavigation_hr"
            }, {
                "url": "/dev/user.html#l=profile/basicinfo",
                "id": "subnavigation_profile_link",
                "label": "MY_PROFILE"
            }, {
                "url": "/dev/user.html#l=library",
                "id": "subnavigation_content_link",
                "label": "MY_LIBRARY"
            }, {
                "url": "/dev/user.html#l=memberships",
                "id": "subnavigation_memberships_link",
                "label": "MY_MEMBERSHIPS"
            }, {
                "url": "/dev/user.html#l=contacts",
                "id": "subnavigation_contacts_link",
                "label": "MY_CONTACTS_CAP"
            }]
        }, {
            "url": "/dev/user.html",
            "id": "navigation_create_and_add_link",
            "anonymous": false,
            "label": "CREATE_AND_ADD",
            "subnav": [{
                "id": "subnavigation_add_content_link",
                "label": "ADD_CONTENT",
                "url": "#"
            }, {
                "id": "subnavigation_add_contacts_link",
                "label": "ADD_CONTACTS",
                "url": "/search/people#q=*&filter=&facet=&page=1"
            }, {
                "id": "subnavigation_hr"
            }, {
                "id": "subnavigation_simple_group_link",
                "label": "CREATE_GROUP",
                "url": "#"
            }]
        }, {
            "url": "/dev/directory2.html",
            "id": "navigation_explore_link",
            "anonymous": false,
            "label": "EXPLORE",
            "subnav": [{
                "id": "subnavigation_explore_content_link",
                "label": "CONTENT"
            }, {
                "id": "subnavigation_explore_groups_link",
                "label": "GROUPS"
            }, {
                "id": "subnavigation_explore_people_link",
                "label": "PEOPLE"
            }]
        }, {
            "url": "/dev/directory2.html",
            "id": "navigation_anon_explore_link",
            "anonymous": true,
            "label": "EXPLORE",
            "subnav": [{
                "id": "subnavigation_explore_content_link",
                "label": "CONTENT"
            }, {
                "id": "subnavigation_explore_groups_link",
                "label": "GROUPS"
            }, {
                "id": "subnavigation_explore_people_link",
                "label": "PEOPLE"
            }]
        }, {
            "url": "/dev/create_new_account2.html",
            "id": "navigation_anon_signup_link",
            "anonymous": true,
            "label": "SIGN_UP"
        }],

        /*
         * Are anonymous users allowed to browse/search
         */
        anonAllowed: true,
        /*
         * List of pages that require a logged in user
         */
        requireUser: ["/home", "/preferences", "/group/edit", "/inbox", "/profile/edit", "/dev/my_sakai.html", "/dev/account_preferences.html", "/dev/group_edit.html", "/dev/inbox.html", "/dev/profile_edit.html"],

        /*
         * List of pages that require an anonymous user
         */
        requireAnonymous: ["/index", "/register", "/", "/index", "/dev/index.html", "/dev/create_new_account.html", "/dev/", "/dev", "/index.html"],
        /*
         * List of pages that will be added to requireUser if
         * anonAllowed is false
         */
        requireUserAnonNotAllowed: ["/dev/people.html", "/dev/profile_edit.html", "/dev/search.html", "/dev/search_content.html", "/dev/search_groups.html", "/dev/search_people.html", "/dev/search_sakai2.html"],
        /*
         * List of pages that will be added to requireAnonymous if
         * anonAllowed is false
         */
        requireAnonymousAnonNotAllowed: [],
        /*
         * List op pages that require additional processing to determine
         * whether the page can be shown to the current user. These pages
         * are then required to call the sakai.api.Security.showPage
         * themselves
         */
        requireProcessing: ["/dev/user.html", "/dev/content_profile.html", "/dev/content_profile.html", "/dev/group_edit.html", "/dev/show.html", "/content", "/search", "/search/people", "/search/groups", "/search/content", "/dev/search.html", "/dev/search_content.html", "/dev/search_groups.html", "/dev/search_people.html"],

        showSakai2: false,
        useLiveSakai2Feeds: false,

        displayDebugInfo: true,

        Directory: {
            "indianauniversity": {
                title: "Indiana University",
                description: '<h3><img width="100" height="90" _mce_style="float: right;" style="float: right;" _mce_src="http://upload.wikimedia.org/wikipedia/commons/d/d6/StudentBuilding_IUBloomington.jpg" src="http://upload.wikimedia.org/wikipedia/commons/d/d6/StudentBuilding_IUBloomington.jpg"/>Indiana University is the flagship campus of the Indiana University system. It is also referred to as Indiana, or simply IU, and is located in Bloomington, Indiana, United States. The name Indiana University Bloomington is not an official campus name, and is only used for clarity.<br/></h3><p>Indiana University is among the top 100 universities in the world. In 2010, the Academic Ranking of World Universities gave Indiana University a world rank of 90 and a national rank of 50. Time named Indiana University its "2001 College of the Year" among major research universities. Indiana is one of 60 members of the Association of American Universities, the leading American research universities. Additionally, IU has over 110 academic programs ranked in the top twenty nationwide.</p><p>The tenth annual Newsweek-Kaplan College Guide, which appeared in the August 22, 2005 issue of Newsweek magazine, chose IU as its "Hottest Big State School" and extolled the campus&quot;s blend of tradition with emerging technologies.</p><p>In January 2010 Kiplinger&quot;s Personal Finance ranked Bloomington the 28th out of the "100 Best Values in Public Colleges 2009-10".</p><p><a href="http://www.iub.edu/%7Eiubmap/IUBcampusmap.pdf" _mce_href="http://www.iub.edu/~iubmap/IUBcampusmap.pdf">Official Website</a><br/><a href="http://www.iub.edu/%7Eiubmap/IUBcampusmap.pdf" _mce_href="http://www.iub.edu/~iubmap/IUBcampusmap.pdf">Campus Map<br/></a></p>',
                icon: "http://upload.wikimedia.org/wikipedia/en/2/26/Indiana_U_seal.png",
                children: {
                    "universityadministration": {
                        title: "University Administration",
                        description: "A description of University Administration",
                        icon: "/dev/images/hierarchy.png",
                        children: {
                            "planningandpolicy": {
                                title: "Planning and Policy",
                                description: "A description of Planning and Policy",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "internationalaffairs": {
                                title: "International Affairs",
                                description: "A description of International Affairs",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "publicaffairsandgovernmentrelations": {
                                title: "Public Affairs and Government Relations",
                                description: "A description of Public Affairs and Government Relations",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "economicdevelopmentandengagement": {
                                title: "Economic Development and Engagement",
                                description: "A description of Economic Development and Engagement",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "intercollegiateathletics": {
                                title: "Intercollegiate Athletics",
                                description: "A description of Intercollegiate Athletics",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "research": {
                                title: "Research",
                                description: "A description of Research",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "diversityequityandmulticulturalaffairs": {
                                title: "Diversity, Equity and Multicultural Affairs",
                                description: "A description of Diversity, Equity and Multicultural Affairs",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            }
                        }
                    },
                    "ipfwfortwayne": {
                        title: "IPFW Fort Wayne",
                        description: "A description of IPFW Fort Wayne",
                        icon: "/dev/images/hierarchy.png",
                        children: {}
                    },
                    "iubloomington": {
                        title: "IU Bloomington",
                        description: "A description of IU Bloomington",
                        icon: "/dev/images/hierarchy.png",
                        children: {}
                    },
                    "iueast": {
                        title: "IU East",
                        description: "A description of IU East",
                        icon: "/dev/images/hierarchy.png",
                        children: {}
                    },
                    "iukokomo": {
                        title: "IU Kokomo",
                        description: "A description of IU Kokomo",
                        icon: "/dev/images/hierarchy.png",
                        children: {}
                    },
                    "iunorthwest": {
                        title: "IU Northwest",
                        description: "A description of IU Northwest",
                        icon: "/dev/images/hierarchy.png",
                        children: {}
                    },
                    "iusouthbend": {
                        title: "IU South Bend",
                        description: "A description of IU South Bend",
                        icon: "/dev/images/hierarchy.png",
                        children: {}
                    },
                    "iupusoutheast": {
                        title: "IU Southeast",
                        description: "A description of IU Southeast",
                        icon: "/dev/images/hierarchy.png",
                        children: {}
                    },
                    "iupucolumbus": {
                        title: "IUPU Columbus",
                        description: "A description of IUPU Columbus",
                        icon: "/dev/images/hierarchy.png",
                        children: {}
                    },
                    "iupuiindianapolis": {
                        title: "IUPUI Indianapolis",
                        description: "A description of IUPUI Indianapolis",
                        icon: "/dev/images/hierarchy.png",
                        children: {
                            "administration": {
                                title: "Administration",
                                description: "A description of Administration",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "academicaffairs": {
                                        title: "Academic Affairs",
                                        description: "A description of Academic Affairs",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "diversityequityandinclusion": {
                                        title: "Diversity, Equity and Inclusion",
                                        description: "A description of Diversity, Equity and Inclusion",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "externalaffairs": {
                                        title: "External Affairs",
                                        description: "A description of External Affairs",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "financeandadministration": {
                                        title: "Finance and Administration",
                                        description: "A description of Finance and Administration",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "planningandinstitutionalimprovement": {
                                        title: "Planning and Institutional Improvement",
                                        description: "A description of Planning and Institutional Improvement",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "studentlife": {
                                        title: "Student Life",
                                        description: "A description of Student Life",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "herronschoolofartanddesign": {
                                title: "Herron School of Art and Design",
                                description: "A description of Herron School of Art and Design",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "arteducation": {
                                        title: "Art Education",
                                        description: "A description of Art Education",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "arthistory": {
                                        title: "Art History",
                                        description: "A description of Art History",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "ceramics": {
                                        title: "Ceramics",
                                        description: "A description of Ceramics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "furnituredesign": {
                                        title: "Furniture Design",
                                        description: "A description of Furniture Design",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "generalfinearts": {
                                        title: "General Fine Arts",
                                        description: "A description of General Fine Arts",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "painting": {
                                        title: "Painting",
                                        description: "A description of Painting",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "photography": {
                                        title: "Photography",
                                        description: "A description of Photography",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "printmaking": {
                                        title: "Printmaking",
                                        description: "A description of Printmaking",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "sculpture": {
                                        title: "Sculpture",
                                        description: "A description of Sculpture",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "visualcommunication": {
                                        title: "Visual Communication",
                                        description: "A description of Visual Communication",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "kelleyschoolofbusiness": {
                                title: "Kelley School of Business",
                                description: "A description of Kelly School of Business",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "accounting": {
                                        title: "Accounting",
                                        description: "A description of Accounting",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "businessadministration": {
                                        title: "Business Administration",
                                        description: "A description of Business Administration",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "computerinformationsystems": {
                                        title: "Computer Information Systems",
                                        description: "A description of Computer Information Systems",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "finance": {
                                        title: "Finance",
                                        description: "A description of Finance",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "humanresourcemanagement": {
                                        title: "Human Resource Management",
                                        description: "A description of Human Resource Management",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "internationalstudies": {
                                        title: "International Studies",
                                        description: "A description of Human Resource Management",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "management": {
                                        title: "Management",
                                        description: "A description of Management",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "marketing": {
                                        title: "Marketing",
                                        description: "A description of Marketing",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "supplychainmanagement": {
                                        title: "Supply Chain Management",
                                        description: "A description of Supply Chain Management",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "shoolofcontinuingstudies": {
                                title: "School of Continuing Studies",
                                description: "A description of School of Continuing Studies",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "communitylearningnetwork": {
                                        title: "Community Learning Network",
                                        description: "A description of Community Learning Network",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "adulteducation": {
                                        title: "Adult Education",
                                        description: "A description of Adult Education",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "generalstudies": {
                                        title: "General Studies",
                                        description: "A description of General Studies",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "graduateschool": {
                                title: "Graduate School",
                                description: "A description of Graduate School",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "schoolofdentistry": {
                                title: "School of Dentistry",
                                description: "A description of School of Dentistry",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "oralbiology": {
                                        title: "Community Learning Network",
                                        description: "A description of Community Learning Network",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "oralpathologymedicineandradiology": {
                                        title: "Oral Pathology, Medicine & Radiology",
                                        description: "A description of Oral Pathology, Medicine & Radiology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "oralsurgeryandhospitaldentistry": {
                                        title: "Oral Surgery & Hospital Dentistry",
                                        description: "A description of Oral Surgery & Hospital Dentistry",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "orthodonticsandoralfacialgenetics": {
                                        title: "Orthodontics & Oral Facial Genetics",
                                        description: "A description of Orthodontics & Oral Facial Genetics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "pediatricdentistry": {
                                        title: "Pediatric Dentistry",
                                        description: "A description of Pediatric Dentistry",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "periodonticsandallieddentalprograms": {
                                        title: "Periodontics & Allied Dental Programs",
                                        description: "A description of Periodontics & Allied Dental Programs",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "preventiveandcommunitydentistry": {
                                        title: "Preventive & Community Dentistry",
                                        description: "A description of Preventive & Community Dentistry",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "restorativedentistry": {
                                        title: "Restorative Dentistry",
                                        description: "A description of Restorative Dentistry",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "schoolofeducation": {
                                title: "School of Education",
                                description: "A description of School of Education",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "purdueschoolofengineeringandtechnology": {
                                title: "Purdue School of Engineering and Technology",
                                description: "A description of Purdue School of Engineering and Technology",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "architecturaltechnology": {
                                        title: "Architectural Technology",
                                        description: "A description of Architectural Technology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "biomedicalengineering": {
                                        title: "Biomedical Engineering",
                                        description: "A description of Biomedical Engineering",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "biomedicalengineeringtechnology": {
                                        title: "Biomedical Engineering Technology",
                                        description: "A description of Biomedical Engineering",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "computerengineering": {
                                        title: "Computer Engineering",
                                        description: "A description of Computer Engineering",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "computerandinformationtechnology": {
                                        title: "Computer and Information Technology",
                                        description: "A description of Computer and Information Technology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "computergraphicstechnology": {
                                        title: "Computer Graphics Technology",
                                        description: "A description of Computer Graphics Technology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "constructionengineeringmanagementtechnology": {
                                        title: "Construction Engineering Management Technology",
                                        description: "A description of Construction Engineering Management Technology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "electricalandcomputerengineering": {
                                        title: "Electrical and Computer Engineering",
                                        description: "A description of Electrical and Computer Engineering",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "electricalandcomputerengineeringtechnology": {
                                        title: "Electrical and Computer Engineering Technology",
                                        description: "A description of Electrical and Computer Engineering Technology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "interiordesigntechnology": {
                                        title: "Interior Design Technology",
                                        description: "A description of Interior Design Technology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "mechanicalengineering": {
                                        title: "Mechanical Engineering",
                                        description: "A description of Mechanical Engineering",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "mechanicalengineeringtechnology": {
                                        title: "Mechanical Engineering Technology",
                                        description: "A description of Mechanical Engineering Technology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "motorsportsengineering": {
                                        title: "Motorsports Engineering",
                                        description: "A description of Motorsports Engineering",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "musicandartstechnology": {
                                        title: "Music and Arts Technology",
                                        description: "A description of Music and Arts Technology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "organizationalleadershipandsupervision": {
                                        title: "Organizational Leadership and Supervision",
                                        description: "A description of Organizational Leadership and Supervision",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "technicalcommunications": {
                                        title: "Technical Communications",
                                        description: "A description of Technical Communications",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "schoolofhealthandrehabilitationsciences": {
                                title: "School of Health and Rehabilitation Sciences",
                                description: "A description of School of Health and Rehabilitation Sciences",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "healthsciences": {
                                        title: "Health Sciences",
                                        description: "A description of Health Sciences",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "nutritionanddietics": {
                                        title: "Nutrition & Dietics",
                                        description: "A description of Nutrition & Dietics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "occupationaltherapy": {
                                        title: "Occupational Therapy",
                                        description: "A description of Occupational Therapy",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "physicaltherapy": {
                                        title: "Physical Therapy",
                                        description: "A description of Physical Therapy",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "iupuihonorscollege": {
                                title: "IUPUI Honors College",
                                description: "A description of IUPUI Honors College",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "schoolofinformatics": {
                                title: "School of Informatics",
                                description: "A description of School of Informatics",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "bioinformatics": {
                                        title: "Bioinformatics",
                                        description: "A description of Bioinformatics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "healthinformatics": {
                                        title: "Health Informatics",
                                        description: "A description of Health Informatics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "healthinformationadministration": {
                                        title: "Health Information Administration",
                                        description: "A description of Health Informatics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "humancomputerinteraction": {
                                        title: "Human Computer Interaction",
                                        description: "A description of Human Computer Interaction",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "informatics": {
                                        title: "Informatics",
                                        description: "A description of Informatics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "mediaartsandsciencenewmedia": {
                                        title: "Media, Arts and Science (New Media)",
                                        description: "A description of Media, Arts and Science (New Media)",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "schoolofjournalism": {
                                title: "School of Journalism",
                                description: "A description of School of Journalism",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "schooloflaw": {
                                title: "School of Law",
                                description: "A description of School of Law",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "schoolofliberalarts": {
                                title: "School of Liberal Arts",
                                description: "A description of School of Liberal Arts",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "africanstudies": {
                                        title: "African Studies",
                                        description: "A description of African Studies",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "americansignlanguage": {
                                        title: "American Sign Language",
                                        description: "A description of American Sign Language",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "anthropology": {
                                        title: "Anthropology",
                                        description: "A description of Anthropology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "chinese": {
                                        title: "Chinese",
                                        description: "A description of Chinese",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "classicalstudies": {
                                        title: "Classical Studies",
                                        description: "A description of Classical Studies",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "communicationstudies": {
                                        title: "Communication Studies",
                                        description: "A description of Communication Studies",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "economics": {
                                        title: "Economics",
                                        description: "A description of Economics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "english": {
                                        title: "English",
                                        description: "A description of English",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "french": {
                                        title: "French",
                                        description: "A description of French",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "geography": {
                                        title: "Geography",
                                        description: "A description of Geography",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "german": {
                                        title: "German",
                                        description: "A description of German",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "history": {
                                        title: "History",
                                        description: "A description of History",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "japanese": {
                                        title: "Japanese",
                                        description: "A description of Japanese",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "medicalhumanities": {
                                        title: "Medical Humanities",
                                        description: "A description of Medical Humanities",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "museumstudies": {
                                        title: "Museum Studies",
                                        description: "A description of Museum Studies",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "philanthropicstudies": {
                                        title: "Philanthropic Studies",
                                        description: "A description of Philanthropic Studies",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "philosophy": {
                                        title: "Philosophy",
                                        description: "A description of Philosophy",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "politicalscience": {
                                        title: "Political Science",
                                        description: "A description of Political Science",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "religiousstudies": {
                                        title: "Religious Studies",
                                        description: "A description of Religious Studies",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "sociology": {
                                        title: "Sociology",
                                        description: "A description of Sociology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "spanish": {
                                        title: "Spanish",
                                        description: "A description of Spanish",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "womensstudies": {
                                        title: "Women's Studies",
                                        description: "A description of Women's Studies",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "worldlanguagesandcultures": {
                                        title: "World Languages and Cultures",
                                        description: "A description of World Languages and Cultures",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "schoolofmedicine": {
                                title: "School of Medicine",
                                description: "A description of School of Medicine",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "anatomy": {
                                        title: "Anatomy",
                                        description: "A description of Anatomy",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "anesthesia": {
                                        title: "Anesthesia",
                                        description: "A description of Anesthesia",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "biochemistryandmolecularbiology": {
                                        title: "Biochemistry and Molecular Biology",
                                        description: "A description of Biochemistry and Molecular Biology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "cellularandintegrativephysiology": {
                                        title: "Cellular and Integrative Physiology",
                                        description: "A description of Cellular and Integrative Physiology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "dermatology": {
                                        title: "Dermatology",
                                        description: "A description of Dermatology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "emergencymedicine": {
                                        title: "Emergency Medicine",
                                        description: "A description of Emergency Medicine",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "familymedicine": {
                                        title: "Family Medicine",
                                        description: "A description of Family Medicine",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "healthprofessionsprograms": {
                                        title: "Health Professions Programs",
                                        description: "A description of Health Professions Programs",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "medicalandmoleculargenetics": {
                                        title: "Medical and Molecular Genetics",
                                        description: "A description of Medical and Molecular Genetics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "medicalneuroscience": {
                                        title: "Medical Neuroscience",
                                        description: "A description of Medical Neuroscience",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "departmentofmedicine": {
                                        title: "Department of Medicine",
                                        description: "A description of Department of Medicine",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "microbiologyandimmunology": {
                                        title: "Microbiology and Immunology",
                                        description: "A description of Microbiology and Immunology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "neurology": {
                                        title: "Neurology",
                                        description: "A description of Neurology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "obstetricsandgynecology": {
                                        title: "Obstetrics & Gynecology",
                                        description: "A description of Obstetrics & Gynecology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "ophthalmology": {
                                        title: "Ophthalmology",
                                        description: "A description of Ophthalmology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "orthopaedicsurgery": {
                                        title: "Orthopaedic Surgery",
                                        description: "A description of Orthopaedic Surgery",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "otolaryngologyheadandnecksurgery": {
                                        title: "Otolaryngology - Head and Neck Surgery",
                                        description: "A description of Otolaryngology - Head and Neck Surgery",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "pathology": {
                                        title: "Pathology",
                                        description: "A description of Pathology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "pediatrics": {
                                        title: "Pediatrics",
                                        description: "A description of Pediatrics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "pharmacologyandtoxicology": {
                                        title: "Pharmacology and Toxicology",
                                        description: "A description of Pharmacology and Toxicology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "physicalmedicineandrehabilitation": {
                                        title: "Physical Medicine & Rehabilitation",
                                        description: "A description of Physical Medicine & Rehabilitation",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "psychiatry": {
                                        title: "Psychiatry",
                                        description: "A description of Psychiatry",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "publichealth": {
                                        title: "Public Health",
                                        description: "A description of Public Health",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "radiationoncology": {
                                        title: "Radiation Oncology",
                                        description: "A description of Radiation Oncology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "radiology": {
                                        title: "Radiology",
                                        description: "A description of Radiology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "surgery": {
                                        title: "Surgery",
                                        description: "A description of Surgery",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "urology": {
                                        title: "Urology",
                                        description: "A description of Urology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "schoolofpublicandenvironmentalaffairs": {
                                title: "School of Public and Environmental Affairs",
                                description: "A description of School of Public and Environmental Affairs",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "civicleadership": {
                                        title: "Civic Leadership",
                                        description: "A description of Civic Leadership",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "criminaljustice": {
                                        title: "Criminal Justice",
                                        description: "A description of Criminal Justice",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "management": {
                                        title: "Management",
                                        description: "A description of Management",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "nonprofitmanagement": {
                                        title: "Nonprofit Management",
                                        description: "A description of Nonprofit Management",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "policystudies": {
                                        title: "Policy Studies",
                                        description: "A description of Policy Studies",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "publicaffairs": {
                                        title: "Public Affairs",
                                        description: "A description of Public Affairs",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "publicsafetymanagement": {
                                        title: "Public Safety Management",
                                        description: "A description of Public Safety Management",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "purdueschoolofscience": {
                                title: "Purdue School of Science",
                                description: "A description of School of Purdue School of Science",
                                icon: "/dev/images/hierarchy.png",
                                children: {
                                    "biology": {
                                        title: "Biology",
                                        description: "A description of Biology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "chemistryandchemicalbiology": {
                                        title: "Chemistry and Chemical Biology",
                                        description: "A description of Chemistry and Chemical Biology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "computerandinformationscience": {
                                        title: "Computer and Information Science",
                                        description: "A description of Computer and Information Science",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "earthsciencesformerlygeology": {
                                        title: "Earth Sciences (formerly Geology)",
                                        description: "A description of Earth Sciences (formerly Geology)",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "forensicandinvestigativescience": {
                                        title: "Forensic & Investigative Science",
                                        description: "A description of Forensic & Investigative Science",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "mathematicalsciences": {
                                        title: "Mathematical Sciences",
                                        description: "A description of Mathematical Sciences",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "physics": {
                                        title: "Physics",
                                        description: "A description of Physics",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    },
                                    "psychology": {
                                        title: "Psychology",
                                        description: "A description of Psychology",
                                        icon: "/dev/images/hierarchy.png",
                                        children: {}
                                    }
                                }
                            },
                            "schoolofsocialwork": {
                                title: "School of Social Work",
                                description: "A description of School of Social Work",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            },
                            "iupuiuniversitycollege": {
                                title: "IUPUI University College",
                                description: "A description of IUPUI University College",
                                icon: "/dev/images/hierarchy.png",
                                children: {}
                            }
                        }
                    }
                }
            }
        },
        // Array of css files to load in each page
        skinCSS: [],

        Languages: [{
            "country": "CN",
            "language": "zh",
            "displayName": "中文"
        }, {
            "country": "NL",
            "language": "nl",
            "displayName": "Nederlands"
        }, {
            "country": "GB",
            "language": "en",
            "displayName": "English (United Kingdom)"
        }, {
            "country": "US",
            "language": "en",
            "displayName": "English (United States)"
        }, {
            "country": "JP",
            "language": "ja",
            "displayName": "日本語"
        }, {
            "country": "HU",
            "language": "hu",
            "displayName": "Magyar"
        }, {
            "country": "KR",
            "language": "ko",
            "displayName": "한국어"
        }],

        // Default Language for the deployment, must be one of the language_COUNTRY pairs that exists above
        defaultLanguage: "en_US",

        defaultUserTemplate: "defaultuser",
        defaultGroupTemplate: "defaultgroup",

        enableChat: false,

        "defaultprivstructure": {
            "structure0": {
                "dashboard": {
                    "_ref": "267187828",
                    "_title": "My Dashboard",
                    "_order": 0,
                    "main": {
                        "_ref": "267187828",
                        "_order": 0,
                        "_title": "Dashboard"
                    }
                },
                "messages": {
                    "_title": "My Messages",
                    "_ref": "1165301022",
                    "_order": 1,
                    "inbox": {
                        "_ref": "1165301022",
                        "_order": 0,
                        "_title": "Inbox"
                    },
                    "invitations": {
                        "_ref": "9867733100",
                        "_order": 1,
                        "_title": "Invitations"
                    },
                    "sent": {
                        "_ref": "4253485084",
                        "_order": 2,
                        "_title": "Sent"
                    },
                    "trash": {
                        "_ref": "3915412565",
                        "_order": 3,
                        "_title": "Trash"
                    }
                }
            },
            "267187828": {
                "page": "<div class='fl-force-right'><button type='button' class='s3d-button s3d-button-link-2-state dashboard_change_layout' data-tuid='546341435'><span class='s3d-button-inner s3d-button-link-2-state-inner s3d-button-link-2-state-inner-secondary'>Edit Layout</span></button><button type='button' class='s3d-button s3d-button-link-2-state dashboard_global_add_widget' data-tuid='546341435'><span class='s3d-button-inner s3d-button-link-2-state-inner s3d-button-link-2-state-inner-secondary'>Add Widget</span></button></div><div class='s3d-contentpage-title'>My Dashboard</div><div id='widget_carousel' class='widget_inline'></div><br/><div id='widget_dashboard_546341435' class='widget_inline'></div>"
            },
            "1165301022": {
                "page": "<div id='widget_newinbox_2024634737' class='widget_inline'/>"
            },
            "9867733100": {
                "page": "<div id='widget_newinbox_3679202964' class='widget_inline'/>"
            },
            "4253485084": {
                "page": "<div id='widget_newinbox_66582410046' class='widget_inline'/>"
            },
            "3915412565": {
                "page": "<div id='widget_newinbox_3519294282' class='widget_inline'/>"
            },
            "2024634737": {
                "box": "inbox",
                "category": "message"
            },
            "3679202964": {
                "box": "inbox",
                "category": "invitation"
            },
            "66582410046": {
                "box": "outbox",
                "category": "*"
            },
            "3519294282": {
                "box": "trash",
                "category": "*"
            },
            "546341435": {
                "dashboard": {
                    "layout": "threecolumn",
                    "columns": {
                        "column1": [{
                            "uid": "id6902437615810",
                            "visible": "block",
                            "name": "mycontent"
                        }],
                        "column2": [{
                            "uid": "id9495917029618",
                            "visible": "block",
                            "name": "mygroups"
                        }],
                        "column3": [{
                            "uid": "id7360391172040",
                            "visible": "block",
                            "name": "mycontacts"
                        }]
                    }
                }
            }
        },

        "defaultpubstructure": {
            "structure0": {
                "profile": {
                    "_ref": "533118849",
                    "_title": "My Profile",
                    "_altTitle": "${user}'s Profile",
                    "_order": 0,
                    "basicinfo": {
                        "_ref": "533118849",
                        "_altTitle": "Basic Information",
                        "_title": "Basic Information",
                        "_order": 0
                    },
                    "aboutme": {
                        "_ref": "657672090",
                        "_altTitle": "About",
                        "_title": "About Me",
                        "_order": 1
                    },
                    "locations": {
                        "_ref": "2967778497",
                        "_title": "Locations",
                        "_altTitle": "Locations",
                        "_order": 2
                    },
                    "publications": {
                        "_ref": "86312659",
                        "_altTitle": "Publications",
                        "_title": "Publications",
                        "_order": 3
                    }
                },
                "library": {
                    "_ref": "9834611274",
                    "_title": "My Library",
                    "_altTitle": "${user}'s Library",
                    "_order": 1,
                    "main": {
                        "_ref": "9834611274",
                        "_order": 0,
                        "_title": "Content"
                    }
                },
                "memberships": {
                    "_title": "My Memberships",
                    "_ref": "213623673",
                    "_altTitle": "${user}'s Memberships",
                    "_order": 2,
                    "main": {
                        "_ref": "213623673",
                        "_title": "Memberships",
                        "_order": 0
                    }
                },
                "contacts": {
                    "_title": "My Contacts",
                    "_ref": "1193715035",
                    "_altTitle": "${user}'s Contacts",
                    "_order": 3,
                    "main": {
                        "_ref": "1193715035",
                        "_title": "Contacts",
                        "_order": 0
                    }
                }
            },
            "533118849": {
                "page": "<div id='widget_displayprofilesection_94551980' class='widget_inline'/>"
            },
            "657672090": {
                "page": "<div id='widget_displayprofilesection_1924492668' class='widget_inline'/>"
            },
            "2967778497": {
                "page": "<div id='widget_displayprofilesection_73466539' class='widget_inline'/>"
            },
            "86312659": {
                "page": "<div id='widget_displayprofilesection_5756708555' class='widget_inline'/>"
            },
            "9834611274": {
                "page": "<div id='widget_mylibrary' class='widget_inline'></div> <div id='widget_deletecontent' class='widget_inline'></div>"
            },
            "213623673": {
                "page": "<div id='widget_joinrequestbuttons' class='widget_inline'></div> " +
                    "<div id='widget_tooltip' class='widget_inline'></div> " +
                    "<div id='widget_mymemberships' class='widget_inline'></div>"
            },
            "1193715035": {
                "page": "<div id='widget_contacts' class='widget_inline'></div>"
            },
            "94551980": {
                "sectionid": "basic"
            },
            "1924492668": {
                "sectionid": "aboutme"
            },
            "73466539": {
                "sectionid": "locations"
            },
            "5756708555": {
                "sectionid": "publications"
            }
        },

        widgets: {
            "groups": ["Administrators", "Lecturers & Supervisors", "Researchers", "Students"],
            "layouts": {
                "onecolumn": {
                    "name": "One column",
                    "widths": [100],
                    "siteportal": true
                },
                "dev": {
                    "name": "Dev Layout",
                    "widths": [50, 50],
                    "siteportal": true
                },
                "threecolumn": {
                    "name": "Three equal columns",
                    "widths": [33, 33, 33],
                    "siteportal": false
                },
                "fourcolumn": {
                    "name": "Four equal columns",
                    "widths": [25, 25, 25, 25],
                    "siteportal": false
                },
                "fivecolumn": {
                    "name": "Five equal columns",
                    "widths": [20, 20, 20, 20, 20],
                    "siteportal": false
                }
            },
            "defaults": {
                "personalportal": {
                    "layout": "dev",
                    "columns": [["mygroups", "mycontacts"], ["mycontent", "recentmessages"]]
                },
                "siteportal": {
                    "layout": "dev",
                    "columns": [["sitemembers"], []]
                }
            }
        }
    };
    
    return config;
});
