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
            GROUP_DEFAULT_ICON_URL_SMALL: "/dev/images/group_avatar_icon_35x35_nob.png",
            GROUP_DEFAULT_ICON_URL: "/dev/images/group_avatar_icon_64x64_nob.png",
            GROUP_EDIT_URL: "/group/edit",
            I10N_BUNDLE_URL: "/dev/lib/misc/l10n/globinfo/Globalization.__CODE__.min.js",
            I18N_BUNDLE_ROOT: "/dev/bundle/",
            INBOX_URL: "/inbox",
            LOGOUT_URL: "/logout",
            MY_DASHBOARD_URL: "/home",
            PROFILE_EDIT_URL: "/profile/edit",
            PUBLIC_CONTENT_MEDIA_URL: "/dev/public_content_media.html",
            PUBLIC_COURSES_SITES_URL: "/dev/public_courses_sites.html",
            PUBLIC_INSTITUTIONAL_LOGIN_URL: "/dev/i_index.html",
            PUBLIC_MY_DASHBOARD_URL: "/home",
            SEARCH_ACTIVITY_ALL_URL: "/var/search/activity/all.json",
            SEARCH_GENERAL_URL: "/search",
            SEARCH_CONTENT_URL: "/search#l=content",
            SEARCH_PEOPLE_URL: "/search#l=people",
            TINY_MCE_CONTENT_CSS: "/dev/css/sakai/sakai.main.css,/dev/css/sakai/sakai.corev1.css,/dev/css/sakai/sakai.editor.css,/dev/css/sakai/sakai.content_profile.css",
            TINY_MCE_EDITOR_CSS: "/dev/css/sakai/tinymce_editor_styling.css",
            USER_DEFAULT_ICON_URL_SMALL: "/dev/images/default_User_icon_35x35.png",
            USER_DEFAULT_ICON_URL: "/dev/images/default_User_icon_50x50.png",
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
            CONTACTS_FIND_BY_USER: "/var/contacts/findbyuser.json",
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
            MESSAGE_BOXCATEGORY_ALL_SERVICE: "/var/message/boxcategory-all.json",
            POOLED_CONTENT_MANAGER: "/var/search/pool/me/manager.json",
            POOLED_CONTENT_MANAGER_ALL: "/var/search/pool/me/manager-all.json",
            POOLED_CONTENT_VIEWER: "/var/search/pool/me/viewer.json",
            POOLED_CONTENT_VIEWER_ALL: "/var/search/pool/me/viewer-all.json",
            POOLED_CONTENT_SPECIFIC_USER: "/var/search/pool/manager-viewer.json",
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
            SEARCH_ALL_ENTITIES: "/var/search/general.json",
            SEARCH_ALL_ENTITIES_ALL: "/var/search/general-all.json",
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
                "/dev/search.html": "SEARCH",
                "/search": "SEARCH"
                /**  show.html  **/
            }
        },

        ErrorPage: {
            /*
             * These links are displayed in the 403 and 404 error pages.
             */
            Links: {
                whatToDo: [{
                    "title": "EXPLORE_THE_INSTITUTION",
                    "url": "/dev/explore.html"
                }, {
                    "title": "BROWSE_INSTITUTION_CATEGORIES",
                    "url": "/dev/allcategories.html"
                }, {
                    "title": "VIEW_THE_INSTITUTION_WEBSITE",
                    "url": "http://sakaiproject.org/"
                }, {
                    "title": "VISIT_THE_SUPPORT_FORUM",
                    "url": "http://sakaiproject.org/"
                }],
                getInTouch: [{
                    "title": "SEND_US_YOUR_FEEDBACK",
                    "url": "http://sakaiproject.org/"
                }, {
                    "title": "CONTACT_SUPPORT",
                    "url": "http://sakaiproject.org/"
                }]
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
                },
                "defaultaccess": "public" // public, logged-in-only or members-only (see above for role description)
            },
            Content: {
                /*
                 * public - anyone
                 * everyone - logged in users
                 * private - private
                 */
                "defaultaccess": "public" // public, everyone or private (see above for role description)
            },
            Documents: {
                /*
                 * public - anyone
                 * everyone - logged in users
                 * private - private
                 */
                "defaultaccess": "public" // public, everyone or private (see above for role description)
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
                        "order": 0,
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
                        "order": 1,
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
                        "order": 2,
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
                        "order": 3,
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
             * set what name to display where only the first name is used
             */
            userFirstNameDisplay: "firstName",

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
                body: "${user} has requested to join your group: ${group}. Use the links below to respond to this request."
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
            "url": "/dev/me.html",
            "id": "navigation_you_link",
            "anonymous": false,
            "label": "YOU",
            "subnav": [{
                "url": "/dev/me.html",
                "id": "subnavigation_home_link",
                "label": "MY_HOME"
            }, {
                "url": "/dev/me.html#l=messages/inbox",
                "id": "subnavigation_messages_link",
                "label": "MY_MESSAGES"
            }, {
                "id": "subnavigation_hr"
            }, {
                "url": "/dev/me.html#l=profile/basic",
                "id": "subnavigation_profile_link",
                "label": "MY_PROFILE"
            }, {
                "url": "/dev/me.html#l=library",
                "id": "subnavigation_content_link",
                "label": "MY_LIBRARY"
            }, {
                "url": "/dev/me.html#l=memberships",
                "id": "subnavigation_memberships_link",
                "label": "MY_MEMBERSHIPS"
            }, {
                "url": "/dev/me.html#l=contacts",
                "id": "subnavigation_contacts_link",
                "label": "MY_CONTACTS_CAP"
            }]
        }, {
            "url": "/dev/createnew.html",
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
                "url": "/search#l=people"
            }, {
                "id": "subnavigation_hr"
            }]
        }, {
            "url": "/dev/explore.html",
            "id": "navigation_explore_link",
            "anonymous": false,
            "label": "EXPLORE",
            "subnav": [{
                "id": "subnavigation_explore_categories_link",
                "label": "BROWSE_ALL_CATEGORIES",
                "url": "/dev/allcategories.html"
            },{
                "id": "subnavigation_hr"
            },{
                "id": "subnavigation_explore_content_link",
                "label": "CONTENT",
                "url": "/search#l=content"
            }, {
                "id": "subnavigation_explore_people_link",
                "label": "PEOPLE",
                "url": "/search#l=people"
            }]
        }, {
            "url": "/dev/explore.html",
            "id": "navigation_anon_explore_link",
            "anonymous": true,
            "label": "EXPLORE",
            "subnav": [{
                "id": "subnavigation_explore_categories_link",
                "label": "BROWSE_ALL_CATEGORIES",
                "url": "/dev/allcategories.html"
            },{
                "id": "subnavigation_hr"
            },{
                "id": "subnavigation_explore_content_link",
                "label": "CONTENT",
                "url": "/search#l=content"
            }, {
                "id": "subnavigation_explore_people_link",
                "label": "PEOPLE",
                "url": "/search#l=people"
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
        requireUser: ["/home", "/preferences", "/group/edit", "/inbox", "/profile/edit", "/dev/my_sakai.html", "/dev/account_preferences.html", "/dev/group_edit.html", "/dev/inbox.html", "/dev/profile_edit.html", "/dev/createnew.html"],

        /*
         * List of pages that require an anonymous user
         */
        requireAnonymous: ["/index", "/register", "/", "/index", "/dev/index.html", "/dev/create_new_account.html", "/dev/", "/dev", "/index.html"],
        /*
         * List of pages that will be added to requireUser if
         * anonAllowed is false
         */
        requireUserAnonNotAllowed: ["/dev/me.html", "/dev/search_sakai2.html"],
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
        requireProcessing: ["/dev/user.html", "/dev/me.html", "/dev/content_profile.html", "/dev/content_profile.html", "/dev/group_edit.html", "/dev/show.html", "/content"],

        showSakai2: false,
        useLiveSakai2Feeds: false,

        displayDebugInfo: true,

        Directory: {
            medicineanddentistry: {
                title: "Medicine and Dentistry",
                children: {
                    preclinicalmedicine: {
                        title: "Pre-clinical Medicine"
                    },
                    preclinicaldentistry: {
                        title: "Pre-clinical Dentistry"
                    },
                    clinicalmedicine: {
                        title: "Clinical Medicine"
                    },
                    clinicaldentistry: {
                        title: "Clinical Dentistry"
                    },
                    othersinmedicineanddentistry: {
                        title: "Others in Medicine and Dentistry"
                    }
                }
            },
            biologicalsciences: {
                title: "Biological Sciences",
                children: {
                    biology: {
                        title: "Biology"
                    },
                    botany: {
                        title: "Botany"
                    },
                    zoology: {
                        title: "Zoology"
                    },
                    genetics: {
                        title: "Genetics"
                    },
                    microbiology: {
                        title: "Microbiology"
                    },
                    sportsscience: {
                        title: "Sports Science"
                    },
                    molecularbiologybiophysicsandbiochemistry: {
                        title: "Molecular Biology, Biophysics and Biochemistry"
                    },
                    psychology: {
                        title: "Psychology"
                    },
                    othersinbiologicalsciences: {
                        title: "Others in Biological Sciences"
                    }
                }
            },
            veterinarysciencesagriculture: {
                title: "Veterinary Sciences and Agriculture",
                children: {
                    preclinicalveterinarymedicine: {
                        title: "Pre-clinical Veterinary Medicine"
                    },
                    clinicalveterinarymedicineanddentistry: {
                        title: "Clinical Veterinary Medicine and Dentistry"
                    },
                    animalscience: {
                        title: "Animal Science"
                    },
                    agriculture: {
                        title: "Agriculture"
                    },
                    forestry: {
                        title: "Forestry"
                    },
                    foodandbeveragestudies: {
                        title: "Food and Beverage studies"
                    },
                    agriculturalsciences: {
                        title: "Agricultural Sciences"
                    },
                    others: {
                        title: "Others in Veterinary Sciences and Agriculture"
                    }
                }
            },
            physicalsciences: {
                title: "Physical Sciences",
                children: {
                    chemistry: {
                        title: "Chemistry"
                    },
                    materialsscience: {
                        title: "Materials Science"
                    },
                    physics: {
                        title: "Physics"
                    },
                    forensicandarchaeologicalscience: {
                        title: "Forensic and Archaeological Science"
                    },
                    astronomy: {
                        title: "Astronomy"
                    },
                    geology: {
                        title: "Geology"
                    },
                    oceansciences: {
                        title: "Ocean Sciences"
                    },
                    others: {
                        title: "Others in Physical Sciences"
                    }
                }
            },
            mathematicalandcomputersciences: {
                title: "Mathematical and Computer Sciences",
                children: {
                    mathematics: {
                        title: "Mathematics"
                    },
                    operationalresearch: {
                        title: "Operational Research"
                    },
                    statistics: {
                        title: "Statistics"
                    },
                    computerscience: {
                        title: "Computer Science"
                    },
                    informationsystems: {
                        title: "Information Systems"
                    },
                    softwareengineering: {
                        title: "Software Engineering"
                    },
                    artificialintelligence: {
                        title: "Artificial Intelligence"
                    },
                    others: {
                        title: "Others in Mathematical and Computing Sciences"
                    }
                }
            },
            engineering: {
                title: "Engineering",
                children: {
                    generalengineering: {
                        title: "General Engineering"
                    },
                    civilengineering: {
                        title: "Civil Engineering"
                    },
                    mechanicalengineering: {
                        title: "Mechanical Engineering"
                    },
                    aerospaceengineering: {
                        title: "Aerospace Engineering"
                    },
                    navalarchitecture: {
                        title: "Naval Architecture"
                    },
                    electronicandelectricalengineering: {
                        title: "Electronic and Electrical Engineering"
                    },
                    productionandmanufacturingengineering: {
                        title: "Production and Manufacturing Engineering"
                    },
                    chemicalprocessandenergyengineering: {
                        title: "Chemical, Process and Energy Engineering"
                    },
                    others: {
                        title: "Others in Engineering"
                    }
                }
            },
            technologies: {
                title: "Technologies",
                children: {
                    mineralstechnology: {
                        title: "Minerals Technology"
                    },
                    metallurgy: {
                        title: "Metallurgy"
                    },
                    ceramicsandglasses: {
                        title: "Ceramics and Glasses"
                    },
                    polymersandtextiles: {
                        title: "Polymers and Textiles"
                    },
                    materialstechnologynototherwisespecified: {
                        title: "Materials Technology not otherwise specified"
                    },
                    maritimetechnology: {
                        title: "Maritime Technology"
                    },
                    industrialbiotechnology: {
                        title: "Industrial Biotechnology"
                    },
                    others: {
                        title: "Others in Technology"
                    }
                }
            },
            architecturebuildingandplanning: {
                title: "Architecture, Building and Planning",
                children: {
                    architecture: {
                        title: "Architecture"
                    },
                    building: {
                        title: "Building"
                    },
                    landscapedesign: {
                        title: "Landscape Design"
                    },
                    planning: {
                        title: "Planning (Urban, Rural and Regional)"
                    },
                    others: {
                        title: "Others in Architecture, Building and Planning"
                    }
                }
            },
            socialstudies: {
                title: "Social studies",
                children: {
                    economics: {
                        title: "Economics"
                    },
                    politics: {
                        title: "Politics"
                    },
                    sociology: {
                        title: "Sociology"
                    },
                    socialpolicy: {
                        title: "Social Policy"
                    },
                    socialwork: {
                        title: "Social Work"
                    },
                    anthropology: {
                        title: "Anthropology"
                    },
                    humanandsocialgeography: {
                        title: "Human and Social Geography"
                    },
                    others: {
                        title: "Others in Social studies"
                    }
                }
            },
            law: {
                title: "Law",
                children: {
                    publiclaw: {
                        title: "Public Law"
                    },
                    privatelaw: {
                        title: "Private Law"
                    },
                    jurisprudence: {
                        title: "Jurisprudence"
                    },
                    legalpractice: {
                        title: "Legal Practice"
                    },
                    medicallaw: {
                        title: "Medical Law"
                    },
                    othersinlaw: {
                        title: "Others in law"
                    }
                }
            },
            businessandadministrativestudies: {
                title: "Business and Administrative studies",
                children: {
                    businessstudies: {
                        title: "Business studies"
                    },
                    managementstudies: {
                        title: "Management studies"
                    },
                    finance: {
                        title: "Finance"
                    },
                    accounting: {
                        title: "Accounting"
                    },
                    marketing: {
                        title: "Marketing"
                    },
                    humanresourcemanagement: {
                        title: "Human Resource Management"
                    },
                    officeskills: {
                        title: "Office skills"
                    },
                    tourismtransportandtravel: {
                        title: "Tourism, Transport and Travel"
                    },
                    others: {
                        title: "Others in Business and Administrative studies"
                    }
                }
            },
            masscommunicationsanddocumentation: {
                title: "Mass Communications and Documentation",
                children: {
                    informationservices: {
                        title: "Information Services"
                    },
                    publicitystudies: {
                        title: "Publicity studies"
                    },
                    mediastudies: {
                        title: "Media studies"
                    },
                    publishing: {
                        title: "Publishing"
                    },
                    journalism: {
                        title: "Journalism"
                    },
                    others: {
                        title: "Others in Mass Communications and Documentation"
                    }
                }
            },
            linguisticsclassicsandrelatedsubjects: {
                title: "Linguistics, Classics and related subjects",
                children: {
                    linguistics: {
                        title: "Linguistics"
                    },
                    comparativeliterarystudies: {
                        title: "Comparative Literary studies"
                    },
                    englishstudies: {
                        title: "English studies"
                    },
                    ancientlanguagestudies: {
                        title: "Ancient Language studies"
                    },
                    celticstudies: {
                        title: "Celtic studies"
                    },
                    latinstudies: {
                        title: "Latin studies"
                    },
                    classicalgreekstudies: {
                        title: "Classical Greek studies"
                    },
                    classicalstudies: {
                        title: "Classical studies"
                    },
                    others: {
                        title: "Others in Linguistics, Classics and related subjects"
                    }
                }
            },
            europeanlanguagesliteratureandrelatedsubjects: {
                title: "European Languages, Literature and related subjects",
                children: {
                    frenchstudies: {
                        title: "French studies"
                    },
                    germanstudies: {
                        title: "German studies"
                    },
                    italianstudies: {
                        title: "Italian studies"
                    },
                    spanishstudies: {
                        title: "Spanish studies"
                    },
                    portuguesestudies: {
                        title: "Portuguese studies"
                    },
                    scandinavianstudies: {
                        title: "Scandinavian studies"
                    },
                    russianandeasteuropeanstudies: {
                        title: "Russian and East European studies"
                    },
                    others: {
                        title: "Others in European Languages, Literature and related subjects"
                    }
                }
            },
            easiaticlanguagesliterature: {
                title: "Exotic Languages, Literature and related subjects",
                children: {
                    chinesestudies: {
                        title: "Chinese studies"
                    },
                    japanesestudies: {
                        title: "Japanese studies"
                    },
                    southasianstudies: {
                        title: "South Asian studies"
                    },
                    otherasianstudies: {
                        title: "Other Asian studies"
                    },
                    africanstudies: {
                        title: "African studies"
                    },
                    modernmiddleeasternstudies: {
                        title: "Modern Middle Eastern studies"
                    },
                    americanstudies: {
                        title: "American studies"
                    },
                    australasianstudies: {
                        title: "Australasian studies"
                    },
                    others: {
                        title: "Others in Eastern, Asiatic, African, American and Australasian Languages, Literature and related subjects"
                    }
                }
            },
            historicalandphilosophicalstudies: {
                title: "Historical and Philosophical studies",
                children: {
                    historybyperiod: {
                        title: "History by period"
                    },
                    historybyarea: {
                        title: "History by area"
                    },
                    historybytopic: {
                        title: "History by topic"
                    },
                    archaeology: {
                        title: "Archaeology"
                    },
                    philosophy: {
                        title: "Philosophy"
                    },
                    theologyandreligiousstudies: {
                        title: "Theology and Religious studies"
                    },
                    others: {
                        title: "Others in Historical and Philosophical studies"
                    }
                }
            },
            creativeartsanddesign: {
                title: "Creative Arts and Design",
                children: {
                    fineart: {
                        title: "Fine Art"
                    },
                    designstudies: {
                        title: "Design studies"
                    },
                    music: {
                        title: "Music"
                    },
                    drama: {
                        title: "Drama"
                    },
                    dance: {
                        title: "Dance"
                    },
                    cinematicsandphotography: {
                        title: "Cinematics and Photography"
                    },
                    crafts: {
                        title: "Crafts"
                    },
                    imaginativewriting: {
                        title: "Imaginative Writing"
                    },
                    others: {
                        title: "Others in Creative Arts and Design"
                    }
                }
            },
            education: {
                title: "Education",
                children: {
                    trainingteachers: {
                        title: "Training Teachers"
                    },
                    researchandstudyskillsineducation: {
                        title: "Research and Study Skills in Education"
                    },
                    academicstudiesineducation: {
                        title: "Academic studies in Education"
                    },
                    othersineducation: {
                        title: "Others in Education"
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

        defaultprivstructure: {
            "structure0": {
                "dashboard": {
                    "_ref": "id267187828",
                    "_title": "My Dashboard",
                    "_order": 0,
                    "_canEdit": true,
                    "_nonEditable": true,
                    "main": {
                        "_ref": "id267187828",
                        "_order": 0,
                        "_title": "Dashboard"
                    }
                },
                "messages": {
                    "_title": "My Messages",
                    "_ref": "id1165301022",
                    "_order": 1,
                    "_canEdit": true,
                    "_canSubedit": true,
                    "_nonEditable": true,
                    "inbox": {
                        "_ref": "id1165301022",
                        "_order": 0,
                        "_title": "Inbox",
                        "_canEdit": true,
                        "_canSubedit": true,
                        "_nonEditable": true
                    },
                    "invitations": {
                        "_ref": "id9867733100",
                        "_order": 1,
                        "_title": "Invitations",
                        "_canEdit": true,
                        "_canSubedit": true,
                        "_nonEditable": true
                    },
                    "sent": {
                        "_ref": "id4253485084",
                        "_order": 2,
                        "_title": "Sent",
                        "_canEdit": true,
                        "_canSubedit": true,
                        "_nonEditable": true
                    },
                    "trash": {
                        "_ref": "id3915412565",
                        "_order": 3,
                        "_title": "Trash",
                        "_canEdit": true,
                        "_canSubedit": true,
                        "_nonEditable": true
                    }
                }
            },
            "id267187828": {
                "page": "<div class='fl-force-right'><button type='button' class='s3d-button s3d-margin-top-5 s3d-header-button s3d-header-smaller-button dashboard_change_layout' data-tuid='id546341435'>Edit Layout</button><button type='button' class='s3d-button s3d-margin-top-5 s3d-header-button s3d-header-smaller-button dashboard_global_add_widget' data-tuid='id546341435'>Add Widget</button></div><div class='s3d-contentpage-title'>My Dashboard</div><div id='widget_carousel' class='widget_inline'></div><br/><div id='widget_dashboard_id546341435' class='widget_inline'></div>"
            },
            "id1165301022": {
                "page": "<div id='widget_inbox_id2024634737' class='widget_inline'/>"
            },
            "id9867733100": {
                "page": "<div id='widget_inbox_id3679202964' class='widget_inline'/>"
            },
            "id4253485084": {
                "page": "<div id='widget_inbox_id66582410046' class='widget_inline'/>"
            },
            "id3915412565": {
                "page": "<div id='widget_inbox_id3519294282' class='widget_inline'/>"
            },
            "id2024634737": {
                "box": "inbox",
                "category": "message",
                "title": "INBOX"
            },
            "id3679202964": {
                "box": "inbox",
                "category": "invitation",
                "title": "INVITATIONS"
            },
            "id66582410046": {
                "box": "outbox",
                "category": "*",
                "title": "SENT"
            },
            "id3519294282": {
                "box": "trash",
                "category": "*",
                "title": "TRASH"
            },
            "id546341435": {
                "dashboard": {
                    "layout": "threecolumn",
                    "columns": {
                        "column1": [{
                            "uid": "id6902437615810",
                            "visible": "block",
                            "name": "recentchangedcontent"
                        }],
                        "column2": [{
                            "uid": "id9495917029618",
                            "visible": "block",
                            "name": "recentmemberships"
                        }],
                        "column3": [{
                            "uid": "id7360391172040",
                            "visible": "block",
                            "name": "recentcontactsnew"
                        }]
                    }
                }
            }
        },

        defaultpubstructure: {
            "structure0": {
                "profile": {
                    "_title": "My Profile",
                    "_altTitle": "${user}'s Profile",
                    "_order": 0,
                    "_nonEditable": true
                },
                "library": {
                    "_ref": "id9834611274",
                    "_order": 1,
                    "_title": "My Library",
                    "_altTitle": "${user}'s Library",
                    "_nonEditable": true,
                    "main": {
                        "_ref": "id9834611274",
                        "_order": 0,
                        "_title": "Content"
                    }
                },
                "memberships": {
                    "_title": "My Memberships",
                    "_order": 2,
                    "_ref": "id213623673",
                    "_altTitle": "${user}'s Memberships",
                    "_nonEditable": true,
                    "main": {
                        "_ref": "id213623673",
                        "_order": 0,
                        "_title": "Memberships"
                    }
                },
                "contacts": {
                    "_title": "My Contacts",
                    "_order": 3,
                    "_ref": "id1193715035",
                    "_altTitle": "${user}'s Contacts",
                    "_nonEditable": true,
                    "main": {
                        "_ref": "id1193715035",
                        "_order": 0,
                        "_title": "Contacts"
                    }
                }
            },
            "id9834611274": {
                "page": "<div id='widget_mylibrary' class='widget_inline'></div> <div id='widget_deletecontent' class='widget_inline'></div>"
            },
            "id213623673": {
                "page": "<div id='widget_joinrequestbuttons' class='widget_inline'></div> " +
                    "<div id='widget_tooltip' class='widget_inline'></div> " +
                    "<div id='widget_mymemberships' class='widget_inline'></div>"
            },
            "id1193715035": {
                "page": "<div id='widget_contacts' class='widget_inline'></div>"
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
        },

        worldTemplates : [
            {
                id: "group",
                title: "GROUPS",
                titleSing: "GROUP",
                templates: [
                    {
                        id: "simplegroup",
                        title: "Simple group",
                        img: "/dev/images/worldtemplates/simplegroup.png",
                        fullImg: "/dev/images/worldtemplates/simplegroup-full.png",
                        perfectFor: "Sharing content and sending messages",
                        roles: [
                            {
                                id: "member",
                                roleTitle: "Members",
                                title: "Member",
                                allowManage: false
                            },
                            {
                                id: "manager",
                                roleTitle: "Managers",
                                title: "Manager",
                                allowManage: true
                            }
                        ],
                        docs: {
                            "${pid}0": {
                                structure0: {
                                    "library":{
                                        "_ref":"id9867543247",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"id9867543247",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "id9867543247": {
                                    page: "<img id='widget_mylibrary_id1367865652332' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id1367865652332": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "participants":{
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_title":"Participants",
                                        "_nonEditable": true,
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<img id='widget_participants_id439704665' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/participants.png' data-mce-src='/devwidgets/participants/images/participants.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id439704665": {
                                    participants: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            }
                        },
                        structure: {
                            "library": {
                                "_title": "Library",
                                "_order": 0,
                                "_docref": "${pid}0",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-member"],
                                "_edit": ["-manager"]
                            },
                            "participants": {
                                "_title": "Participants",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-member"],
                                "_edit": ["-manager"]
                            }
                        },
                        joinRole: "member",
                        creatorRole: "manager"
                    }
                ]
            },
            {
                id: "courses",
                title : "COURSES",
                titleSing: "COURSE",
                templates: [
                    {
                        id: "mathcourse",
                        title: "Mathematics course",
                        img: "/dev/images/worldtemplates/mathcourse.png",
                        fullImg: "/dev/images/worldtemplates/mathcourse-full.png",
                        perfectFor: "Algebra, Analysis, Probability and statistics, Mechanics, Mathematical Methods and Applications",
                        roles: [
                            {
                                id: "student",
                                roleTitle: "Students",
                                title: "Student",
                                allowManage: false
                            },
                            {
                                id: "ta",
                                roleTitle: "Teaching Assistants",
                                title: "Teaching Assistant",
                                allowManage: true
                            },
                            {
                                id: "lecturer",
                                roleTitle: "Lecturers",
                                title: "Lecturer",
                                allowManage: true
                            }
                        ],
                        docs: {
                            "${pid}0": {
                                structure0: {
                                    "week1": {
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_title":"Week 1",
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_title":"Week 1"
                                        }
                                    },
                                    "week2":{
                                        "_ref":"id569856425",
                                        "_title":"Week 2",
                                        "_order":1,
                                        "main":{
                                            "_ref":"id569856425",
                                            "_order":0,
                                            "_title":"Week 2"
                                        }
                                    },
                                    "week3":{
                                        "_ref":"id647321988",
                                        "_title":"Week 3",
                                        "_order":2,
                                        "main":{
                                            "_ref":"id647321988",
                                            "_order":0,
                                            "_title":"Week 3"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tempus enim nec ipsum faucibus tincidunt ut tristique ipsum. In nec fringilla erat. Ut sagittis, justo ac gravida feugiat, sem massa cursus magna, in euismod nunc risus vitae tellus. Donec vel nunc ligula. Ut sem ipsum, molestie a hendrerit quis, semper at enim. Donec aliquam dolor ac odio vulputate pretium. Nullam congue ornare magna, in semper elit ultrices a. Morbi sed ante sem, et semper quam. Vivamus non adipiscing eros. Vestibulum risus felis, laoreet eget aliquet in, viverra ut magna. Curabitur consectetur, justo non faucibus ornare, nulla leo condimentum purus, vitae tempus justo erat a lorem. Praesent eu augue et enim viverra lobortis et pellentesque urna. Proin consectetur interdum sodales. Curabitur metus tortor, laoreet eu pulvinar nec, rhoncus a elit. Proin tristique, massa eu elementum vehicula, elit nibh gravida ante, sed mollis lacus tortor quis risus. Quisque vel accumsan elit. Aliquam viverra porttitor tellus, sit amet ornare purus imperdiet nec. Proin ornare, enim sed interdum vestibulum, lacus est elementum nibh, a scelerisque urna neque ut ligula. Etiam tristique scelerisque nunc, nec rhoncus nulla tempor vel. Vivamus sed eros erat, ac gravida nisi.</p><p>Test<br></p><p>Sed metus elit, malesuada gravida viverra sit amet, tristique pretium mauris. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur fringilla tortor eu tortor fringilla ac egestas metus facilisis. Maecenas quis magna ligula, a vehicula dolor. Ut lobortis, magna et tincidunt mollis, mi massa dignissim ante, vel consectetur sapien nunc non velit. Phasellus feugiat tortor eget massa fermentum non scelerisque erat iaculis. Duis ut nulla quis tortor dapibus malesuada. Sed molestie sapien non mi consequat ultrices. Nam vel pretium enim. Curabitur vestibulum metus semper arcu lobortis convallis. Donec quis tellus dui, ut porttitor ipsum. Duis porta, odio sed consectetur malesuada, ipsum libero eleifend diam, ut sagittis eros tellus a velit. Etiam feugiat porta adipiscing. Sed luctus, odio sed tristique suscipit, massa ante ullamcorper nulla, a pellentesque lorem ante eget arcu. Nam venenatis, dui at ullamcorper faucibus, orci sapien convallis purus, ut vulputate justo nibh et orci.</p>"
                                },
                                "id569856425": {
                                    page: "<p>Week 2<br></p>"
                                },
                                "id647321988": {
                                    page: "<p>Week 3<br></p>"
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "contact":{
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_title": "Contact",
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_title":"Contact"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<p><strong>Contact Us</strong></p><p>16 Mill Lane<br>1st Floor<br>CB2 1SB Cambridge</p><p><img id='widget_googlemaps_id439704665' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/googlemaps/images/googlemaps.png' data-mce-src='/devwidgets/googlemaps/images/googlemaps.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id439704665": {
                                    googlemaps: {
                                        "mapinput": "16 Mill Lane, Cambridge, UK",
                                        "mapzoom": "14",
                                        "mapsize": "LARGE",
                                        "lng": "0.11648790000003828",
                                        "sling:resourceType": "sakai/widget-data",
                                        "maphtml": "16 Mill Ln, Cambridge CB2 1, UK",
                                        "lat": "52.201596"
                                    }
                                }
                            },
                            "${pid}2": {
                                structure0: {
                                    "about":{
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_title":"About",
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_title":"About"
                                        }
                                    },
                                    "prospective":{
                                        "_ref":"id373710599",
                                        "_title":"Prospective Students",
                                        "_order":1,
                                        "main":{
                                            "_ref":"id373710599",
                                            "_order":0,
                                            "_title":"Prospective Students"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<p>This is some information about the course<br></p>"
                                },
                                "id373710599": {
                                    page: "<p>This is some information for prospective students<br></p>"
                                }
                            },
                            "${pid}3": {
                                structure0: {
                                    "organizationnotes":{
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_title":"Organization Notes",
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_title":"Organization Notes"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<p>Editable by lecturers only, visible to TAs only<br></p>"
                                }
                            },
                            "${pid}4": {
                                structure0: {
                                    "studentwiki":{
                                        "_ref":"id849031890418",
                                        "_order":0,
                                        "_title":"Student Wiki",
                                        "main":{
                                            "_ref":"id849031890418",
                                            "_order":0,
                                            "_title":"Organization Notes"
                                        }
                                    }
                                },
                                "id849031890418": {
                                    page: "<p>Student wiki editable by all members of this course<br></p>"
                                }
                            }
                        },
                        structure: {
                            "syllabus": {
                                "_title": "Syllabus",
                                "_order": 0,
                                "_docref": "${pid}0",
                                "_view": ["everyone", "-student", "-ta"],
                                "_edit": ["-lecturer"]
                            },
                            "contactus": {
                                "_title": "Contact us",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_view": ["-student"],
                                "_edit": ["-lecturer", "-ta"]
                            },
                            "coursewebsite": {
                                "_title": "Course website",
                                "_order": 2,
                                "_docref": "${pid}2",
                                "_view": ["everyone", "anonymous"],
                                "_edit": ["-lecturer", "-ta"]
                            },
                            "organizationnotes": {
                                "_title": "Organization Notes",
                                "_order": 3,
                                "_docref": "${pid}3",
                                "_view": ["-ta"],
                                "_edit": ["-lecturer"]
                            },
                            "studentwiki": {
                                "_title": "Student Wiki",
                                "_order": 4,
                                "_docref": "${pid}4",
                                "_view": [],
                                "_edit": ["-lecturer", "-ta", "-student"]
                            }
                        },
                        joinRole: "student",
                        creatorRole: "lecturer"
                    },
                    {
                        id: "medicalscience",
                        title: "Medical science course",
                        img: "/dev/images/worldtemplates/mathcourse.png",
                        fullImg: "/dev/images/worldtemplates/mathcourse-full.png",
                        perfectFor: "Science courses, Chemistry, Mathematics, Equations, Theoretical Science, Experiment based learning courses",
                        roles: [
                            {
                                id: "student",
                                roleTitle: "Students",
                                title: "Student",
                                allowManage: false
                            },
                            {
                                id: "ta",
                                roleTitle: "Teaching Assistants",
                                title: "Teaching Assistant",
                                allowManage: true
                            },
                            {
                                id: "lecturer",
                                roleTitle: "Lecturers",
                                title: "Lecturer",
                                allowManage: true
                            }
                        ],
                        docs: {
                            "${pid}0": {
                                structure0: {
                                    "library":{
                                        "_ref":"id9867543247",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"id9867543247",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "id9867543247": {
                                    page: "<img id='widget_mylibrary_id1367865652332' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id1367865652332": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "participants":{
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title":"Participants",
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<img id='widget_participants_id439704665' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/participants.png' data-mce-src='/devwidgets/participants/images/participants.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id439704665": {
                                    participants: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            }
                        },
                        structure: {
                            "library": {
                                "_title": "Library",
                                "_order": 0,
                                "_docref": "${pid}0",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            },
                            "participants": {
                                "_title": "Participants",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            }
                        },
                        joinRole: "student",
                        creatorRole: "lecturer"
                    },
                    {
                        id: "physicscourse",
                        title: "Physics course",
                        img: "/dev/images/worldtemplates/mathcourse.png",
                        fullImg: "/dev/images/worldtemplates/mathcourse-full.png",
                        perfectFor: "Science courses, Chemistry, Mathematics, Equations, Theoretical Science, Experiment based learning courses",
                        roles: [
                            {
                                id: "student",
                                roleTitle: "Students",
                                title: "Student",
                                allowManage: false
                            },
                            {
                                id: "ta",
                                roleTitle: "Teaching Assistants",
                                title: "Teaching Assistant",
                                allowManage: true
                            },
                            {
                                id: "lecturer",
                                roleTitle: "Lecturers",
                                title: "Lecturer",
                                allowManage: true
                            }
                        ],
                        docs: {
                            "${pid}0": {
                                structure0: {
                                    "library":{
                                        "_ref":"id9867543247",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"id9867543247",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "id9867543247": {
                                    page: "<img id='widget_mylibrary_id1367865652332' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id1367865652332": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "participants":{
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title":"Participants",
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<img id='widget_participants_id439704665' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/participants.png' data-mce-src='/devwidgets/participants/images/participants.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id439704665": {
                                    participants: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            }
                        },
                        structure: {
                            "library": {
                                "_title": "Library",
                                "_order": 0,
                                "_docref": "${pid}0",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            },
                            "participants": {
                                "_title": "Participants",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            }
                        },
                        joinRole: "student",
                        creatorRole: "lecturer"
                    },
                    {
                        id: "engineeringcourse",
                        title: "Engineering course",
                        img: "/dev/images/worldtemplates/mathcourse.png",
                        fullImg: "/dev/images/worldtemplates/mathcourse-full.png",
                        perfectFor: "Science courses, Chemistry, Mathematics, Equations, Theoretical Science, Experiment based learning courses",
                        roles: [
                            {
                                id: "student",
                                roleTitle: "Students",
                                title: "Student",
                                allowManage: false
                            },
                            {
                                id: "ta",
                                roleTitle: "Teaching Assistants",
                                title: "Teaching Assistant",
                                allowManage: true
                            },
                            {
                                id: "lecturer",
                                roleTitle: "Lecturers",
                                title: "Lecturer",
                                allowManage: true
                            }
                        ],
                        docs: {
                            "${pid}0": {
                                structure0: {
                                    "library":{
                                        "_ref":"id9867543247",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"id9867543247",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "id9867543247": {
                                    page: "<img id='widget_mylibrary_id1367865652332' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id1367865652332": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "participants":{
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title":"Participants",
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<img id='widget_participants_id439704665' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/participants.png' data-mce-src='/devwidgets/participants/images/participants.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id439704665": {
                                    participants: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            }
                        },
                        structure: {
                            "library": {
                                "_title": "Library",
                                "_order": 0,
                                "_docref": "${pid}0",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            },
                            "participants": {
                                "_title": "Participants",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            }
                        },
                        joinRole: "student",
                        creatorRole: "lecturer"
                    },
                    {
                        id: "humanitiescourse",
                        title: "Humanities course",
                        img: "/dev/images/worldtemplates/mathcourse.png",
                        fullImg: "/dev/images/worldtemplates/mathcourse-full.png",
                        perfectFor: "Science courses, Chemistry, Mathematics, Equations, Theoretical Science, Experiment based learning courses",
                        roles: [
                            {
                                id: "student",
                                roleTitle: "Students",
                                title: "Student",
                                allowManage: false
                            },
                            {
                                id: "ta",
                                roleTitle: "Teaching Assistants",
                                title: "Teaching Assistant",
                                allowManage: true
                            },
                            {
                                id: "lecturer",
                                roleTitle: "Lecturers",
                                title: "Lecturer",
                                allowManage: true
                            }
                        ],
                        docs: {
                            "${pid}0": {
                                structure0: {
                                    "library":{
                                        "_ref":"id9867543247",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"id9867543247",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "id9867543247": {
                                    page: "<img id='widget_mylibrary_id1367865652332' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id1367865652332": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "participants":{
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title":"Participants",
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<img id='widget_participants_id439704665' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/participants.png' data-mce-src='/devwidgets/participants/images/participants.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id439704665": {
                                    participants: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            }
                        },
                        structure: {
                            "library": {
                                "_title": "Library",
                                "_order": 0,
                                "_docref": "${pid}0",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            },
                            "participants": {
                                "_title": "Participants",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            }
                        },
                        joinRole: "student",
                        creatorRole: "lecturer"
                    }
                ]
            },
            {
                id: "research",
                title : "RESEARCH",
                titleSing: "RESEARCH",
                templates: [
                    {
                        id: "researchproject",
                        title: "Group project",
                        img: "/dev/images/worldtemplates/mathcourse.png",
                        fullImg: "/dev/images/worldtemplates/mathcourse-full.png",
                        perfectFor: "Collaborative student projects, Class projects, Reading clubs",
                        roles: [
                            {
                                id: "participant",
                                roleTitle: "Participants",
                                title: "Participant",
                                allowManage: true
                            },
                            {
                                id: "lurker",
                                roleTitle: "Lurkers",
                                title: "Lurker",
                                allowManage: false
                            }
                        ],
                        docs: {
                            "${pid}0": {
                                structure0: {
                                    "library":{
                                        "_ref":"id9867543247",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"id9867543247",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "id9867543247": {
                                    page: "<img id='widget_mylibrary_id1367865652332' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id1367865652332": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "participants":{
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title":"Participants",
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<img id='widget_participants_id439704665' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/participants.png' data-mce-src='/devwidgets/participants/images/participants.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id439704665": {
                                    participants: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            }
                        },
                        structure: {
                            "library": {
                                "_title": "Library",
                                "_order": 0,
                                "_docref": "${pid}0",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            },
                            "participants": {
                                "_title": "Participants",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            }
                        },
                        joinRole: "lurker",
                        creatorRole: "participant"
                    },
                    {
                        id: "bidwriting",
                        title: "Bid writing",
                        img: "/dev/images/worldtemplates/mathcourse.png",
                        fullImg: "/dev/images/worldtemplates/mathcourse-full.png",
                        perfectFor: "Writing a collaborative research bid",
                        roles: [
                            {
                                id: "participant",
                                roleTitle: "Participants",
                                title: "Participant",
                                allowManage: true
                            },
                            {
                                id: "lurker",
                                roleTitle: "Lurkers",
                                title: "Lurker",
                                allowManage: false
                            }
                        ],
                        docs: {
                            "${pid}0": {
                                structure0: {
                                    "library":{
                                        "_ref":"id9867543247",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"id9867543247",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "id9867543247": {
                                    page: "<img id='widget_mylibrary_id1367865652332' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id1367865652332": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "participants":{
                                        "_ref":"id6573920372",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title":"Participants",
                                        "main":{
                                            "_ref":"id6573920372",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "id6573920372": {
                                    page: "<img id='widget_participants_id439704665' class='widget_inline' style='display: block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/participants.png' data-mce-src='/devwidgets/participants/images/participants.png' data-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "id439704665": {
                                    participants: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            }
                        },
                        structure: {
                            "library": {
                                "_title": "Library",
                                "_order": 0,
                                "_docref": "${pid}0",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            },
                            "participants": {
                                "_title": "Participants",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-lurker"],
                                "_edit": ["-participant"]
                            }
                        },
                        joinRole: "lurker",
                        creatorRole: "participant"
                    }
                ]
            }
        ]
    };

    return config;
});
