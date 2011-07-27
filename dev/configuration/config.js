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
            I10N_BUNDLE_URL: "/dev/lib/misc/l10n/globinfo/Globalization.__CODE__.min.js",
            I18N_BUNDLE_ROOT: "/dev/bundle/",
            INBOX_URL: "/inbox",
            LOGOUT_URL: "/logout",
            MY_DASHBOARD_URL: "/me",
            PROFILE_EDIT_URL: "/profile/edit",
            PUBLIC_CONTENT_MEDIA_URL: "/dev/public_content_media.html",
            PUBLIC_COURSES_SITES_URL: "/dev/public_courses_sites.html",
            PUBLIC_INSTITUTIONAL_LOGIN_URL: "/dev/i_index.html",
            PUBLIC_MY_DASHBOARD_URL: "/index",
            SEARCH_ACTIVITY_ALL_URL: "/var/search/activity/all.json",
            SEARCH_GENERAL_URL: "/search",
            SEARCH_CONTENT_URL: "/search#l=content",
            SEARCH_PEOPLE_URL: "/search#l=people",
            TINY_MCE_CONTENT_CSS: "/dev/css/FSS/fss-base.css,/dev/css/sakai/main.css,/dev/css/sakai/sakai.corev1.css,/dev/css/sakai/sakai.base.css,/dev/css/sakai/sakai.editor.css,/dev/css/sakai/sakai.content_profile.css",
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
            USER_EXISTENCE_SERVICE: "/system/userManager/user.exists.html?userid=__USERID__"
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
                /**  allcategories.html  **/
                "/categories": "BROWSE_ALL_CATEGORIES",
                "/dev/allcategories.html": "BROWSE_ALL_CATEGORIES",
                /**  category.html  **/
                /**  content_profile.html  **/
                "/dev/content_profile.html": "CONTENT_PROFILE",
                "/content": "CONTENT_PROFILE",
                /**  create_new_account.html  **/
                "/dev/create_new_account.html": "CREATE_A_NEW_ACCOUNT",
                "/register": "CREATE_A_NEW_ACCOUNT",
                /**  explore.html  **/
                "/": "EXPLORE",
                "/dev": "EXPLORE",
                "/dev/": "EXPLORE",
                "/index.html": "EXPLORE",
                "/dev/explore.html": "EXPLORE",
                "/index": "EXPLORE",
                /**  logout.html  **/
                "/dev/logout.html": "LOGGING_OUT",
                "/logout": "LOGGING_OUT",
                /**  search.html  **/
                "/dev/search.html": "SEARCH",
                "/search": "SEARCH",
                /**  createnew.html  **/
                "/create": "CREATE"
            }
        },

        ErrorPage: {
            /*
             * These links are displayed in the 403 and 404 error pages.
             */
            Links: {
                whatToDo: [{
                    "title": "EXPLORE_THE_INSTITUTION",
                    "url": "/index"
                }, {
                    "title": "BROWSE_INSTITUTION_CATEGORIES",
                    "url": "/categories"
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
                    "public": "public" // Anyone on the Internet
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
                                "required": true,
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
            "application/x-zip-compressed": {
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
            "url": "/me",
            "id": "navigation_you_link",
            "anonymous": false,
            "label": "YOU",
            "subnav": [{
                "url": "/me",
                "id": "subnavigation_home_link",
                "label": "MY_HOME"
            }, {
                "url": "/me#l=messages/inbox",
                "id": "subnavigation_messages_link",
                "label": "MY_MESSAGES"
            }, {
                "id": "subnavigation_hr"
            }, {
                "url": "/me#l=profile/basic",
                "id": "subnavigation_profile_link",
                "label": "MY_PROFILE"
            }, {
                "url": "/me#l=library",
                "id": "subnavigation_content_link",
                "label": "MY_LIBRARY"
            }, {
                "url": "/me#l=memberships",
                "id": "subnavigation_memberships_link",
                "label": "MY_MEMBERSHIPS"
            }, {
                "url": "/me#l=contacts",
                "id": "subnavigation_contacts_link",
                "label": "MY_CONTACTS_CAP"
            }]
        }, {
            "url": "#",
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
            "url": "/index",
            "id": "navigation_explore_link",
            "anonymous": false,
            "label": "EXPLORE",
            "subnav": [{
                "id": "subnavigation_explore_categories_link",
                "label": "BROWSE_ALL_CATEGORIES",
                "url": "/categories"
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
            "url": "/index",
            "id": "navigation_anon_explore_link",
            "anonymous": true,
            "label": "EXPLORE",
            "subnav": [{
                "id": "subnavigation_explore_categories_link",
                "label": "BROWSE_ALL_CATEGORIES",
                "url": "/categories"
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
            "url": "/register",
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
        requireUser: ["/me", "/dev/me.html", "/dev/search_sakai2.html", "/create", "/dev/createnew.html"],

        /*
         * List of pages that require an anonymous user
         */
        requireAnonymous: ["/register", "/dev/create_new_account.html"],
        /*
         * List of pages that will be added to requireUser if
         * anonAllowed is false
         */
        requireUserAnonNotAllowed: ["/me", "/dev/me.html", "/dev/search_sakai2.html"],
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
        requireProcessing: ["/dev/user.html", "/me" ,"/dev/me.html", "/dev/content_profile.html", "/dev/content_profile.html", "/dev/group_edit.html", "/dev/show.html", "/content"],

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
                    othersinveterinarysciencesandagriculture: {
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
                    othersinphysicalsciences: {
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
                    othersinmathematicalandcomputingsciences: {
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
                    othersinengineering: {
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
                    othersintechnology: {
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
                    othersinarchitecturebuildingandplanning: {
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
                    othersinsocialstudies: {
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
                    othersinbusandadminstudies: {
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
                    othersinmasscommanddoc: {
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
                    othersinlinguisticsclassicsandrelsubject: {
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
                    othersineurolangliteratureandrelsubjects: {
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
                    othersineasternasiaafriamericaaustralianlang: {
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
                    othersinhistoricalandphilosophicalstudies: {
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
                    othersincreativeartsanddesign: {
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

        /*
         * _canEdit: can change the area permissions on this page
         * _reorderOnly: can reorder this item in the navigation, but cannot edit the name of the page
         * _nonEditable: cannot edit the contents of this page
         * _canSubedit:
         */

        defaultprivstructure: {
            "structure0": {
                "dashboard": {
                    "_ref": "${refid}0",
                    "_title": "My Dashboard",
                    "_order": 0,
                    "_canEdit": true,
                    "_reorderOnly": true,
                    "_nonEditable": true,
                    "main": {
                        "_ref": "${refid}0",
                        "_order": 0,
                        "_title": "Dashboard"
                    }
                },
                "messages": {
                    "_title": "My Messages",
                    "_ref": "${refid}1",
                    "_order": 1,
                    "_canEdit": true,
                    "_reorderOnly": true,
                    "_canSubedit": true,
                    "_nonEditable": true,
                    "inbox": {
                        "_ref": "${refid}1",
                        "_order": 0,
                        "_title": "Inbox",
                        "_nonEditable": true
                    },
                    "invitations": {
                        "_ref": "${refid}2",
                        "_order": 1,
                        "_title": "Invitations",
                        "_nonEditable": true
                    },
                    "sent": {
                        "_ref": "${refid}3",
                        "_order": 2,
                        "_title": "Sent",
                        "_nonEditable": true
                    },
                    "trash": {
                        "_ref": "${refid}4",
                        "_order": 3,
                        "_title": "Trash",
                        "_nonEditable": true
                    }
                }
            },
            "${refid}0": {
                "page": "<div class='fl-force-right'><button type='button' class='s3d-button s3d-margin"+
                "-top-5 s3d-header-button s3d-header-smaller-button dashboard_change_layout' dat"+
                "a-tuid='${refid}5'>Edit Layout</button><button type='button' class='s3d-button "+
                "s3d-margin-top-5 s3d-header-button s3d-header-smaller-button dashboard_global_a"+
                "dd_widget' data-tuid='${refid}5'>Add Widget</button></div><div class='s3d-conte"+
                "ntpage-title'>My Dashboard</div><div id='widget_carousel' class='widget_inline'"+
                "></div><br/><div id='widget_dashboard_${refid}5' class='widget_inline'></div>"
            },
            "${refid}1": {
                "page": "<div id='widget_inbox_${refid}6' class='widget_inline'/>"
            },
            "${refid}2": {
                "page": "<div id='widget_inbox_${refid}7' class='widget_inline'/>"
            },
            "${refid}3": {
                "page": "<div id='widget_inbox_${refid}8' class='widget_inline'/>"
            },
            "${refid}4": {
                "page": "<div id='widget_inbox_${refid}9' class='widget_inline'/>"
            },
            "${refid}5": {
                "dashboard": {
                    "layout": "threecolumn",
                    "columns": {
                        "column1": [{
                            "uid": "${refid}10",
                            "visible": "block",
                            "name": "recentchangedcontent"
                        }],
                        "column2": [{
                            "uid": "${refid}11",
                            "visible": "block",
                            "name": "recentmemberships"
                        }],
                        "column3": [{
                            "uid": "${refid}12",
                            "visible": "block",
                            "name": "recentcontactsnew"
                        }]
                    }
                }
            },
            "${refid}6": {
                "box": "inbox",
                "category": "message",
                "title": "INBOX"
            },
            "${refid}7": {
                "box": "inbox",
                "category": "invitation",
                "title": "INVITATIONS"
            },
            "${refid}8": {
                "box": "outbox",
                "category": "*",
                "title": "SENT"
            },
            "${refid}9": {
                "box": "trash",
                "category": "*",
                "title": "TRASH"
            }
        },

        defaultpubstructure: {
            "structure0": {
                "profile": {
                    "_title": "My Profile",
                    "_altTitle": "${user}'s Profile",
                    "_order": 0,
                    "_reorderOnly": true,
                    "_nonEditable": true
                },
                "library": {
                    "_ref": "${refid}0",
                    "_order": 1,
                    "_title": "My Library",
                    "_altTitle": "${user}'s Library",
                    "_reorderOnly": true,
                    "_nonEditable": true,
                    "main": {
                        "_ref": "${refid}0",
                        "_order": 0,
                        "_title": "Content"
                    }
                },
                "memberships": {
                    "_title": "My Memberships",
                    "_order": 2,
                    "_ref": "${refid}1",
                    "_altTitle": "${user}'s Memberships",
                    "_reorderOnly": true,
                    "_nonEditable": true,
                    "main": {
                        "_ref": "${refid}1",
                        "_order": 0,
                        "_title": "Memberships"
                    }
                },
                "contacts": {
                    "_title": "My Contacts",
                    "_order": 3,
                    "_ref": "${refid}2",
                    "_altTitle": "${user}'s Contacts",
                    "_reorderOnly": true,
                    "_nonEditable": true,
                    "main": {
                        "_ref": "${refid}2",
                        "_order": 0,
                        "_title": "Contacts"
                    }
                }
            },
            "${refid}0": {
                "page": "<div id='widget_mylibrary' class='widget_inline'></div>"
            },
            "${refid}1": {
                "page": "<div id='widget_joinrequestbuttons' class='widget_inline'></div> " +
                    "<div id='widget_tooltip' class='widget_inline'></div> " +
                    "<div id='widget_mymemberships' class='widget_inline'></div>"
            },
            "${refid}2": {
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
                                        "_ref":"${refid}0",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"${refid}0",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "${refid}0": {
                                    page: "<img id='widget_mylibrary_${refid}1' class='widget_inline' style='display: blo"+
                                    "ck; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.pn"+
                                    "g' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='di"+
                                    "splay: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "${refid}1": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "participants":{
                                        "_ref":"${refid}2",
                                        "_order":0,
                                        "_title":"Participants",
                                        "_nonEditable": true,
                                        "main":{
                                            "_ref":"${refid}2",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "${refid}2": {
                                    page: "<img id='widget_participants_${refid}3' class='widget_inline' style='display: "+
                                    "block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/partic"+
                                    "ipants.png' data-mce-src='/devwidgets/participants/images/participants.png' dat"+
                                    "a-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "${refid}3": {
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
                                        "_ref":"${refid}0",
                                        "_order":0,
                                        "_title":"Week 1",
                                        "main":{
                                            "_ref":"${refid}0",
                                            "_order":0,
                                            "_title":"Week 1"
                                        }
                                    },
                                    "week2":{
                                        "_ref":"${refid}1",
                                        "_title":"Week 2",
                                        "_order":1,
                                        "main":{
                                            "_ref":"${refid}1",
                                            "_order":0,
                                            "_title":"Week 2"
                                        }
                                    }
                                },
                                "${refid}0": {
                                    page: '<div class="leftCol" style="float: left; margin: 0pt; width: 25%; display: bloc'+
                                    'k;"> <span style="color: rgb(153, 153, 153); font-size: 0.95em;"><strong>Week 0'+
                                    '1</strong></span> <p style="margin: 0pt;"><a target="_blank" style="color: rgb('+
                                    '38, 131, 188); font-size: 1.85em; font-weight: normal; text-decoration: none; l'+
                                    'ine-height: 1em;">Real and Hyperreal Numbers</a><br data-mce-bogus="1"></p> </d'+
                                    'iv> <div class="rightCol" style="float: right; margin: 0pt; width: 75%; display'+
                                    ': block;"> <div class="dateCol" style="float: left; width: 25%; color: rgb(51, '+
                                    '51, 51); font-size: 0.85em; display: block;">Monday January 10</div> <div class'+
                                    '="entryCol" style="float: left; width: 75%; display: block;"> <span style="colo'+
                                    'r: rgb(38, 131, 188);"><a><span style="color: rgb(38, 131, 188); font-size: 0.9'+
                                    '5em;"><strong>Anaytic Geometry</strong></span></a></span> <div class="beforeCla'+
                                    'ssContainer" style="margin: 5px 0pt 10px; padding: 8px 8px 0pt; background-colo'+
                                    'r: rgb(229, 229, 229); font-size: 0.85em;"> <span style="float: left; margin: 0'+
                                    'pt 0pt 2px; padding: 2px 0pt 2px 8px; width: 99%; background-color: rgb(255, 25'+
                                    '5, 255); color: rgb(153, 153, 153);">Before class</span> <div style="float: lef'+
                                    't; color: rgb(102, 102, 102); font-weight: bold;"> <p style="margin: 2px; paddi'+
                                    'ng: 0pt;">Read</p> <p style="margin: 2px; padding: 0pt;">Complete</p> </div> <d'+
                                    'iv style="float: left; margin: 0pt 0pt 0pt 20px; padding: 0pt; color: rgb(51, 5'+
                                    '1, 51); font-weight: bold;"> <p style="margin: 2px; padding: 0pt;"><a target="_'+
                                    'blank" style="color: rgb(38, 131, 188); text-decoration: none;">1.1-1.3</a><br '+
                                    'data-mce-bogus="1"></p> <p style="margin: 2px; padding: 0pt;"><a target="_blank'+
                                    '" style="color: rgb(38, 131, 188); text-decoration: none;">1.1: 1, 5, 7, 1.2: 3'+
                                    ', 7, 9, 1.3: 3, 5, 11</a><br data-mce-bogus="1"></p> </div> <hr style="visibili'+
                                    'ty: hidden; clear: both;"> </div> </div> <hr style="clear: both; margin: 10px 0'+
                                    'pt 5px; padding: 0pt; width: 100%; height: 5px; background-color: rgb(229, 229,'+
                                    ' 229); border: medium none; color: rgb(229, 229, 229);"> <div class="rightCol" '+
                                    'style="display: block;"> <div class="dateCol" style="margin-top: 6px; float: le'+
                                    'ft; width: 25%; color: rgb(51, 51, 51); font-size: 0.85em; display: block;">Tue'+
                                    'sday January 11</div> <div class="entryCol" style="float: left; width: 75%; dis'+
                                    'play: block;"> <div class="dueContainer" style="margin: 5px 0pt 10px; backgroun'+
                                    'd-color: rgb(51, 51, 51); padding: 2px 0pt 1px 2px; font-size: 0.85em; clear: b'+
                                    'oth;"> <div style="float: left; color: rgb(255, 255, 255); padding: 0pt; font-w'+
                                    'eight: bold; height: 10px;"> <p style="margin: 3px 0pt 0pt; padding: 4px 0pt 4p'+
                                    'x 4px; background-image: url(&quot;/dev/images/due_icon.png&quot;); background-'+
                                    'repeat: no-repeat; background-position: 2px 0pt;"><span style="padding: 0pt 0pt'+
                                    ' 0pt 27px;">Due</span></p> </div> <div style="float: left; margin: 0pt 0pt 0pt '+
                                    '40px; padding: 0pt; color: rgb(51, 51, 51); font-weight: bold; height: 20px;"> '+
                                    '<p style="width: 100%; margin: 3px 0pt 0pt; padding: 4px 0pt 4px 4px;"><a targe'+
                                    't="_self"><span style="color: rgb(107, 199, 255); text-decoration: none;">Probl'+
                                    'em Set 1</span></a><a target="_self"><br data-mce-bogus="1"><br data-mce-bogus='+
                                    '"1"></a></p> </div> <hr style="visibility: hidden; clear: both;"> </div> </div>'+
                                    ' <hr style="clear: both; margin: 10px 0pt 5px; padding: 0pt; width: 100%; heigh'+
                                    't: 5px; background-color: rgb(229, 229, 229); border: medium none; color: rgb(2'+
                                    '29, 229, 229);"> </div> <div class="rightCol" style="display: block;"> <div cla'+
                                    'ss="dateCol" style="float: left; width: 25%; color: rgb(51, 51, 51); font-size:'+
                                    ' 0.85em; display: block;">Wednesday January 12</div> <div class="entryCol" styl'+
                                    'e="float: left; width: 75%; display: block;"> <span style="color: rgb(38, 131, '+
                                    '188);"><a><span style="color: rgb(38, 131, 188); font-size: 0.95em;"><strong>Fu'+
                                    'nctions</strong></span></a></span> <div class="beforeClassContainer" style="mar'+
                                    'gin: 5px 0pt 10px; padding: 8px 8px 0pt; background-color: rgb(229, 229, 229); '+
                                    'font-size: 0.85em;"> <span style="float: left; margin: 0pt 0pt 2px; padding: 2p'+
                                    'x 0pt 2px 8px; width: 99%; background-color: rgb(255, 255, 255); color: rgb(153'+
                                    ', 153, 153);">Before class</span> <div style="float: left; color: rgb(102, 102,'+
                                    ' 102); font-weight: bold;"> <p style="margin: 2px; padding: 0pt;">Read</p> <p s'+
                                    'tyle="margin: 2px; padding: 0pt;">Complete</p> </div> <div style="float: left; '+
                                    'margin: 0pt 0pt 0pt 20px; padding: 0pt; color: rgb(51, 51, 51); font-weight: bo'+
                                    'ld;"> <p style="margin: 2px; padding: 0pt;"><a target="_blank" style="color: rg'+
                                    'b(38, 131, 188); text-decoration: none;">1.4</a><br data-mce-bogus="1"></p> <p '+
                                    'style="margin: 2px; padding: 0pt;"><a target="_blank" style="color: rgb(38, 131'+
                                    ', 188); text-decoration: none;">1.4: 1, 5, 7</a><br data-mce-bogus="1"></p> </d'+
                                    'iv> <hr style="visibility: hidden; clear: both;"> </div> </div> <hr style="clea'+
                                    'r: both; margin: 10px 0pt 5px; padding: 0pt; width: 100%; height: 5px; backgrou'+
                                    'nd-color: rgb(229, 229, 229); border: medium none; color: rgb(229, 229, 229);">'+
                                    ' </div> <div class="rightCol" style="display: block;"> <div class="dateCol" sty'+
                                    'le="float: left; width: 25%; color: rgb(51, 51, 51); font-size: 0.85em; display'+
                                    ': block;">Friday January 14</div> <div class="entryCol" style="float: left; wid'+
                                    'th: 75%; display: block;"><span style="color: rgb(38, 131, 188);"> <a><span sty'+
                                    'le="color: rgb(38, 131, 188); font-size: 0.95em;"><strong>Approximations and In'+
                                    'finitesimals</strong></span></a></span> <div class="beforeClassContainer" style'+
                                    '="margin: 5px 0pt 10px; padding: 8px 8px 0pt; background-color: rgb(229, 229, 2'+
                                    '29); font-size: 0.85em;"> <span style="float: left; margin: 0pt 0pt 2px; paddin'+
                                    'g: 2px 0pt 2px 8px; width: 99%; background-color: rgb(255, 255, 255); color: rg'+
                                    'b(153, 153, 153);">Before class</span> <div style="float: left; color: rgb(102,'+
                                    ' 102, 102); font-weight: bold;"> <p style="margin: 2px; padding: 0pt;">Read</p>'+
                                    ' <p style="margin: 2px; padding: 0pt;">Complete</p> </div> <div style="float: l'+
                                    'eft; margin: 0pt 0pt 0pt 20px; padding: 0pt; color: rgb(51, 51, 51); font-weigh'+
                                    't: bold;"> <p style="margin: 2px; padding: 0pt;"><a target="_blank" style="colo'+
                                    'r: rgb(38, 131, 188); text-decoration: none;">1.5-1.6</a><br data-mce-bogus="1"'+
                                    '></p> <p style="margin: 2px; padding: 0pt;"><a target="_blank" style="color: rg'+
                                    'b(38, 131, 188); text-decoration: none;">1.5: 1, 9, 13, 1.6: 3, 5, 21</a><br da'+
                                    'ta-mce-bogus="1"></p> </div> <hr style="visibility: hidden; clear: both;"> </di'+
                                    'v> </div> </div> <hr style="visibility: hidden; clear: both;"> </div> <hr style'+
                                    '="clear: both; margin: 10px 0pt 5px; padding: 0pt; width: 100%; height: 5px; ba'+
                                    'ckground-color: rgb(229, 229, 229); border: medium none; color: rgb(229, 229, 2'+
                                    '29);"> <div class="mainContainer" style="margin: 0pt; padding: 0pt; width: 100%'+
                                    '; font-family: Arial,Helvetica,sans-serif;"> <div class="leftCol" style="float:'+
                                    ' left; margin: 0pt; width: 25%; display: block;"> <span style="color: rgb(153, '+
                                    '153, 153); font-size: 0.95em;"><strong>Week 02</strong></span> <p style="margin'+
                                    ': 0pt;"><a style="color: rgb(38, 131, 188); font-size: 1.85em; font-weight: nor'+
                                    'mal; text-decoration: none; line-height: 1em;">Differentiation</a><br data-mce-'+
                                    'bogus="1"></p> </div> <div class="rightCol" style="float: right; margin: 0pt; w'+
                                    'idth: 75%; display: block;"> <div class="dateCol" style="float: left; width: 25'+
                                    '%; color: rgb(51, 51, 51); font-size: 0.85em; display: block;">Monday January 1'+
                                    '7</div> <div class="entryCol" style="float: left; width: 75%; display: block;">'+
                                    ' <span style="color: rgb(51, 51, 51); font-size: 0.95em;"><strong>Derivatives</'+
                                    'strong></span> <div class="beforeClassContainer" style="margin: 5px 0pt 10px; p'+
                                    'adding: 8px 8px 0pt; background-color: rgb(229, 229, 229); font-size: 0.85em;">'+
                                    ' <span style="float: left; margin: 0pt 0pt 2px; padding: 2px 0pt 2px 8px; width'+
                                    ': 99%; background-color: rgb(255, 255, 255); color: rgb(153, 153, 153);">Before'+
                                    ' class</span> <div style="float: left; color: rgb(102, 102, 102); font-weight: '+
                                    'bold;"> <p style="margin: 2px; padding: 0pt;">Read</p> <p style="margin: 2px; p'+
                                    'adding: 0pt;">Complete</p> </div> <div style="float: left; margin: 0pt 0pt 0pt '+
                                    '20px; padding: 0pt; color: rgb(51, 51, 51); font-weight: bold;"> <p style="marg'+
                                    'in: 2px; padding: 0pt;"><a style="color: rgb(38, 131, 188); text-decoration: no'+
                                    'ne;">2.1-2.3</a><br data-mce-bogus="1"></p> <p style="margin: 2px; padding: 0pt'+
                                    ';"><a style="color: rgb(38, 131, 188); text-decoration: none;">2.1: 1, 5, 7, 2.'+
                                    '2: 3, 7, 9, 2.3: 3, 5, 11</a><br data-mce-bogus="1"></p> </div> <hr style="visi'+
                                    'bility: hidden; clear: both;"> </div> </div> <hr style="clear: both; margin: 10'+
                                    'px 0pt 5px; padding: 0pt; width: 100%; height: 5px; background-color: rgb(229, '+
                                    '229, 229); border: medium none; color: rgb(229, 229, 229);"> <div class="rightC'+
                                    'ol" style="display: block;"> <div class="dateCol" style="margin-top: 6px; float'+
                                    ': left; width: 25%; color: rgb(51, 51, 51); font-size: 0.85em; display: block;"'+
                                    '>Tuesday January 18</div> <div class="entryCol" style="float: left; width: 75%;'+
                                    ' display: block;"> <div class="dueContainer" style="margin: 5px 0pt 10px; backg'+
                                    'round-color: rgb(51, 51, 51); padding: 2px 0pt 1px 2px; font-size: 0.85em; clea'+
                                    'r: both;"> <div style="float: left; color: rgb(255, 255, 255); padding: 0pt; fo'+
                                    'nt-weight: bold; height: 10px;"> <p style="margin: 3px 0pt 0pt; padding: 4px 0p'+
                                    't 4px 4px; background-image: url(&quot;/dev/images/due_icon.png&quot;); backgro'+
                                    'und-repeat: no-repeat; background-position: 2px 0pt;"><span style="padding: 0pt'+
                                    ' 0pt 0pt 27px;">Due</span></p> </div> <div style="float: left; margin: 0pt 0pt '+
                                    '0pt 40px; padding: 0pt; color: rgb(51, 51, 51); font-weight: bold; height: 20px'+
                                    ';"> <p style="margin: 3px 0pt 0pt; padding: 4px 0pt 4px 4px;"><a style="color: '+
                                    'rgb(107, 199, 255); text-decoration: none;">Problem Set 2</a><br data-mce-bogus'+
                                    '="1"></p> </div> <hr style="visibility: hidden; clear: both;"> </div> </div> <h'+
                                    'r style="clear: both; margin: 10px 0pt 5px; padding: 0pt; width: 100%; height: '+
                                    '5px; background-color: rgb(229, 229, 229); border: medium none; color: rgb(229,'+
                                    ' 229, 229);"> </div> <div class="rightCol" style="display: block;"> <div class='+
                                    '"dateCol" style="float: left; width: 25%; color: rgb(51, 51, 51); font-size: 0.'+
                                    '85em; display: block;">Wednesday January 19</div> <div class="entryCol" style="'+
                                    'float: left; width: 75%; display: block;"> <div class="beforeClassContainer" st'+
                                    'yle="margin: 5px 0pt 10px; padding: 8px 8px 0pt; background-color: rgb(229, 229'+
                                    ', 229); font-size: 0.85em;"> <span style="float: left; margin: 0pt 0pt 2px; pad'+
                                    'ding: 2px 0pt 2px 8px; width: 99%; background-color: rgb(255, 255, 255); color:'+
                                    ' rgb(153, 153, 153);">Before class</span> <div style="float: left; color: rgb(1'+
                                    '02, 102, 102); font-weight: bold;"> <p style="margin: 2px; padding: 0pt;">Read<'+
                                    '/p> <p style="margin: 2px; padding: 0pt;">Complete</p> </div> <div style="float'+
                                    ': left; margin: 0pt 0pt 0pt 20px; padding: 0pt; color: rgb(51, 51, 51); font-we'+
                                    'ight: bold;"> <p style="margin: 2px; padding: 0pt;"><a style="color: rgb(38, 13'+
                                    '1, 188); text-decoration: none;">2.4-2.6</a><br data-mce-bogus="1"></p> <p styl'+
                                    'e="margin: 2px; padding: 0pt;"><a style="color: rgb(38, 131, 188); text-decorat'+
                                    'ion: none;">2.4: 1, 5, 7 2.5: 3, 7, 9, 2.6: 1, 5, 7</a><br data-mce-bogus="1"><'+
                                    '/p> </div> <hr style="visibility: hidden; clear: both;"> </div> </div> <hr styl'+
                                    'e="clear: both; margin: 10px 0pt 5px; padding: 0pt; width: 100%; height: 5px; b'+
                                    'ackground-color: rgb(229, 229, 229); border: medium none; color: rgb(229, 229, '+
                                    '229);"> </div> <div class="rightCol" style="display: block;"> <div class="dateC'+
                                    'ol" style="float: left; width: 25%; color: rgb(51, 51, 51); font-size: 0.85em; '+
                                    'display: block;">Friday January 21</div> <div class="entryCol" style="float: le'+
                                    'ft; width: 75%; display: block;"> <span style="color: rgb(51, 51, 51); font-siz'+
                                    'e: 0.95em;"><strong>Differentiation</strong></span> <div class="beforeClassCont'+
                                    'ainer" style="margin: 5px 0pt 10px; padding: 8px 8px 0pt; background-color: rgb'+
                                    '(229, 229, 229); font-size: 0.85em;"> <span style="float: left; margin: 0pt 0pt'+
                                    ' 2px; padding: 2px 0pt 2px 8px; width: 99%; background-color: rgb(255, 255, 255'+
                                    '); color: rgb(153, 153, 153);">Before class</span> <div style="float: left; col'+
                                    'or: rgb(102, 102, 102); font-weight: bold;"> <p style="margin: 2px; padding: 0p'+
                                    't;">Read</p> <p style="margin: 2px; padding: 0pt;">Complete</p> </div> <div sty'+
                                    'le="float: left; margin: 0pt 0pt 0pt 20px; padding: 0pt; color: rgb(51, 51, 51)'+
                                    '; font-weight: bold;"> <p style="margin: 2px; padding: 0pt;"><a style="color: r'+
                                    'gb(38, 131, 188); text-decoration: none;">2.7-2.8</a><br data-mce-bogus="1"></p'+
                                    '> <p style="margin: 2px; padding: 0pt;"><a style="color: rgb(38, 131, 188); tex'+
                                    't-decoration: none;">2.7: 1, 5, 7, 2.8: 3, 7, 9</a><br data-mce-bogus="1"></p> '+
                                    '</div> <hr style="visibility: hidden; clear: both;"> </div> </div> </div> <hr s'+
                                    'tyle="visibility: hidden; clear: both;"> </div> </div>'
                                },
                                "${refid}1": {
                                    page: '<p> </p><div class="mainContainer" style="margin: 0pt; padding: 0pt; width: 10'+
                                    '0%; font-family: Arial,Helvetica,sans-serif;"> <div class="leftCol" style="floa'+
                                    't: left; margin: 0pt 5% 0pt 0pt; width: 25%; display: block;"> <p style="margin'+
                                    ': 0pt 0pt 20px; color: rgb(102, 102, 102); font-size: 1.25em; font-weight: bold'+
                                    '; line-height: 1em;">Elementary Calculus</p> <span style="color: rgb(153, 153, '+
                                    '153); font-size: 0.95em;">Autumn, M, W, F, 9:00-10:50 AM. Building 300<br>James'+
                                    ' Gleason, PhD</span><br> <p><a href="/dev/images/worldtemplates/math/calculus.p'+
                                    'ng" target="_blank"><img style="padding: 20px 0pt 0pt;" src="/dev/images/worldt'+
                                    'emplates/math/calculus.png" alt="Calculus" width="100%"></a><br data-mce-bogus='+
                                    '"1"></p> </div> <div class="rightCol" style="float: right; margin: 0pt; width: '+
                                    '60%; display: block;"> <div class="entryCol" style="float: left; width: 100%; d'+
                                    'isplay: block; color: rgb(51, 51, 51); font-size: 1em;"> <p style="margin: 0pt;'+
                                    '">Calculus was originally developed in the 1670s by Leibnitz and Newton based o'+
                                    'n the intuitive notion of infinitesimals, or an infinitely small number. Weiers'+
                                    'trass formalized the concept of limit and eliminated infinitesimals, which was '+
                                    'more rigourous, but harder to grasp. Abraham Robinson developed non-standard ca'+
                                    'lculus, the modern application of infinitessimals, which is both precise as wel'+
                                    'l as intuitive, as it is closer to the intuitions that lead to the development '+
                                    'of calculus. It is this non-standard approach that we will teach.</p> <ul style'+
                                    '="padding: 0pt 0pt 0pt 15px;"><li><a target="_blank"><span style="color: rgb(38'+
                                    ', 131, 188);"><strong>Isabel Ringloud </strong>Senior Instructor</span></a><br '+
                                    'data-mce-bogus="1"></li><li><a target="_blank" style="color: rgb(38, 131, 188);'+
                                    '"><strong>Stacey Florence</strong> TA</a><br data-mce-bogus="1"></li></ul> <a s'+
                                    'tyle="color: rgb(38, 131, 188); text-decoration: none;"><strong style="color: r'+
                                    'gb(38, 131, 188); text-decoration: none;">View the full syllabus outline</stron'+
                                    'g></a> </div> <hr style="visibility: hidden; clear: both;"> </div> </div> <hr s'+
                                    'tyle="clear: both; margin: 20px 0pt; padding: 0pt; width: 100%; height: 5px; ba'+
                                    'ckground-color: rgb(229, 229, 229); border: medium none; color: rgb(229, 229, 2'+
                                    '29);"> <div class="mainContainer" style="margin: 0pt; padding: 0pt; width: 100%'+
                                    '; font-family: Arial,Helvetica,sans-serif;"> <div class="leftCol" style="float:'+
                                    ' left; margin: 0pt 5% 0pt 0pt; width: 25%; display: block;"> <span style="color'+
                                    ': rgb(153, 153, 153); font-size: 0.95em;"><strong>Required textbooks and materi'+
                                    'als</strong></span> </div> <div class="rightCol" style="float: right; margin: 0'+
                                    'pt; width: 60%; display: block;"> <div class="entryCol" style="float: left; mar'+
                                    'gin: 0pt; width: 100%; display: block; color: rgb(51, 51, 51); font-size: 1em;"'+
                                    '> <p style="margin: 0pt; color: rgb(38, 131, 188); text-decoration: none;"><a h'+
                                    'ref="http://www.math.wisc.edu/%7Ekeisler/calc.html" target="_blank" style="colo'+
                                    'r: rgb(38, 131, 188); text-decoration: none;"><strong>Elementary Calculus: An I'+
                                    'nfinitesimal Approach</strong></a> <a href="/dev/images/worldtemplates/math/boo'+
                                    'k.png" target="_blank"><img style="float: left; padding: 0pt 10px 5px 0pt; marg'+
                                    'in: 0pt; width: 10%;" src="/dev/images/worldtemplates/math/book.png" alt="Eleme'+
                                    'ntary Calculus: An Infinitesimal Approach"></a><br data-mce-bogus="1"></p> <p>Y'+
                                    'ou will need only a basic scientific calculator; graphic calculators are not re'+
                                    'quired and will not be allowed in tests.</p> </div> <hr style="visibility: hidd'+
                                    'en; clear: both;"> </div> </div> <hr style="clear: both; margin: 20px 0pt; padd'+
                                    'ing: 0pt; width: 100%; height: 5px; background-color: rgb(229, 229, 229); borde'+
                                    'r: medium none; color: rgb(229, 229, 229);"> <div class="mainContainer" style="'+
                                    'padding: 0pt; width: 100%; font-family: Arial,Helvetica,sans-serif;"> <div clas'+
                                    's="leftCol" style="float: left; margin: 0pt 5% 0pt 0pt; width: 25%; display: bl'+
                                    'ock;"> <span style="color: rgb(153, 153, 153); font-size: 0.95em;"><strong>Poli'+
                                    'cies and Expectations</strong></span> </div> <div class="rightCol" style="float'+
                                    ': right; margin: 0pt; width: 60%; display: block;"> <div class="entryCol" style'+
                                    '="float: left; margin: 0pt; width: 100%; display: block; color: rgb(51, 51, 51)'+
                                    '; font-size: 1em;"> <p style="margin: 0pt;">The course meets for three lectures'+
                                    ' a week, with one sectional, led by a TA. We expect you to attend every lecture'+
                                    ', as it will be difficult to keep up without doing so, then complete the assign'+
                                    'ed reading and homework once you have gotten an overview of the concept. The an'+
                                    'swers to this daily homework are in the back of your text and therefore are ung'+
                                    'raded; you are encouraged to discuss solutions with your peers. You will also h'+
                                    'ave the opportunity to review your daily homework during Tuesday sectionals, wh'+
                                    'ich you are also expected to attend.</p> <p>Weekly problem sets are graded and '+
                                    'you must turn these in by 3:15 or preferably during your Tuesday section, both '+
                                    'as a courtesy to your TA who must grade these (They will be returned in class o'+
                                    'n Friday) as well as to insure that you are keeping up. Consider these a take h'+
                                    'ome quiz; collaboration on these problem sets would therefore be a violoation o'+
                                    'f the <a target="_blank" style="color: rgb(38, 131, 188); text-decoration: none'+
                                    ';">Honor Code</a>.</p> </div> <hr style="visibility: hidden; clear: both;"> </d'+
                                    'iv> </div> <hr style="clear: both; margin: 20px 0pt; padding: 0pt; width: 100%;'+
                                    ' height: 5px; background-color: rgb(229, 229, 229); border: medium none; color:'+
                                    ' rgb(229, 229, 229);"> <div class="mainContainer" style="margin: 0pt; padding: '+
                                    '0pt; width: 100%; font-family: Arial,Helvetica,sans-serif;"> <div class="leftCo'+
                                    'l" style="float: left; margin: 0pt 5% 0pt 0pt; width: 25%; display: block;"> <s'+
                                    'pan style="color: rgb(153, 153, 153); font-size: 0.95em;"><strong>Grading</stro'+
                                    'ng></span> </div> <div class="rightCol" style="float: right; margin: 0pt; width'+
                                    ': 60%; display: block;"> <div class="entryCol" style="float: left; margin: 0pt;'+
                                    ' width: 100%; display: block; color: rgb(51, 51, 51); font-size: 1em;"> <p styl'+
                                    'e="margin: 0pt;">Grading is based on the following. Regarding weekly problem se'+
                                    'ts, late problem sets will count as a zero, but we will throw out your lowest t'+
                                    'wo problem set scores</p> <ul style="padding: 0pt 0pt 0pt 15px;"><li><a target='+
                                    '"_blank" style="color: rgb(38, 131, 188);"><strong>Midterm Exam 1: 25%</strong>'+
                                    '</a><br data-mce-bogus="1"></li><li><a target="_blank" style="color: rgb(38, 13'+
                                    '1, 188);"><strong>Midterm Exam 2: 25%</strong></a><br data-mce-bogus="1"></li><'+
                                    'li><a target="_blank" style="color: rgb(38, 131, 188);"><strong>Weekly Problem '+
                                    'Sets: 10%</strong></a><br data-mce-bogus="1"></li><li><a target="_blank" style='+
                                    '"color: rgb(38, 131, 188);"><strong>Final Exam: 40%</strong></a><br data-mce-bo'+
                                    'gus="1"></li></ul> </div> <hr style="visibility: hidden; clear: both;"> </div> '+
                                    '</div> <hr style="clear: both; margin: 20px 0pt; padding: 0pt; width: 100%; hei'+
                                    'ght: 5px; background-color: rgb(229, 229, 229); border: medium none; color: rgb'+
                                    '(229, 229, 229);"> <div class="mainContainer" style="margin: 0pt; padding: 0pt;'+
                                    ' width: 100%; font-family: Arial,Helvetica,sans-serif;"> <div class="leftCol" s'+
                                    'tyle="float: left; margin: 0pt 5% 0pt 0pt; width: 25%; display: block;"> <span '+
                                    'style="color: rgb(153, 153, 153); font-size: 0.95em;"><strong>Additional inform'+
                                    'ation</strong></span> </div> <div class="rightCol" style="float: right; margin:'+
                                    ' 0pt; width: 60%; display: block;"> <div class="entryCol" style="float: left; m'+
                                    'argin: 0pt; width: 100%; display: block; color: rgb(51, 51, 51); font-size: 1em'+
                                    ';"> <p style="margin: 0pt;">A Note from the Office of Accessible Education: Stu'+
                                    'dents who may need an academic accommodation based on the impact of a disabilit'+
                                    'y must initiate the request with the Office of Accessible Education (OAE).</p> '+
                                    '</div> <hr style="visibility: hidden; clear: both;"> </div> </div>'
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "lecture01": {
                                        "_ref":"${refid}2",
                                        "_order":0,
                                        "_title":"Lecture 01",
                                        "main":{
                                            "_ref":"${refid}2",
                                            "_order":0,
                                            "_title":"Lecture 01"
                                        }
                                    },
                                    "lecture02":{
                                        "_ref":"${refid}3",
                                        "_title":"Lecture 02",
                                        "_order":1,
                                        "main":{
                                            "_ref":"${refid}3",
                                            "_order":0,
                                            "_title":"Lecture 02"
                                        }
                                    },
                                    "lecture03":{
                                        "_ref":"${refid}4",
                                        "_title":"Lecture 03",
                                        "_order":2,
                                        "main":{
                                            "_ref":"${refid}4",
                                            "_order":0,
                                            "_title":"Lecture 03"
                                        }
                                    }
                                },
                                "${refid}2": {
                                    page: '<p style="padding-left: 30px;"> </p><p style="margin: 20px 0pt; font-size: 1.75'+
                                    'em; color: rgb(51, 51, 51); line-height: 1.25em;" data-mce-style="margin: 20px '+
                                    '0pt; font-size: 1.75em; color: #333333; line-height: 1.25em;">Week 01: Real and'+
                                    ' Hyperreal Numbers</p><p style="margin: 0pt; font-size: 1.45em; line-height: 1.'+
                                    '25em; color: rgb(102, 102, 102);" data-mce-style="margin: 0pt; font-size: 1.45e'+
                                    'm; line-height: 1.25em; color: #666666;">Lecture 01: Analytic Geometry</p><p st'+
                                    'yle="margin: 5px 0pt 20px; color: rgb(102, 102, 102);" data-mce-style="margin: '+
                                    '5px 0pt 20px; color: #666666;">Date: Monday 10th January<br>Location: <a style='+
                                    '"color: rgb(38, 131, 188); text-decoration: none;" data-mce-style="color: #2683'+
                                    'bc; text-decoration: none;">Building 600, Lecture Hall 209</a><br data-mce-bogu'+
                                    's="1"></p><p style="color: rgb(102, 102, 102); font-size: 1em;" data-mce-style='+
                                    '"color: #666666; font-size: 1em;"><img id="widget_remotecontent_${refid}5" clas'+
                                    's="widget_inline" style="display: block; padding: 10px; margin: 4px;" src="/dev'+
                                    'widgets/remotecontent/images/remotecontent.png" data-mce-src="/devwidgets/remot'+
                                    'econtent/images/remotecontent.png" data-mce-style="display: block; padding: 10p'+
                                    'x; margin: 4px;" border="1">The following was covered in this lecture:</p><ol s'+
                                    'tyle="margin: 10px 0pt 0pt; padding: 0pt 0pt 0pt 20px; color: rgb(51, 51, 51); '+
                                    'font-size: 0.85em; font-weight: bold;" data-mce-style="margin: 10px 0pt 0pt; pa'+
                                    'dding: 0pt 0pt 0pt 20px; color: #333333; font-size: 0.85em; font-weight: bold;"'+
                                    '><li>The development of Cartesian geometry</li><li>Euclidean geometry</li><li>C'+
                                    'onics, cubics, Bezout&quot;s theorem, and the beginnings of a projective view t'+
                                    'o curves</li><li>Irrational numbers and decimal expansions</li><li>Pi and its c'+
                                    'ontinued fraction approximations</li></ol><p style="color: rgb(51, 51, 51); fon'+
                                    't-size: 0.85em;" data-mce-style="color: #333333; font-size: 0.85em;">Please rea'+
                                    'd and complete the following before the lecture, bring text books, along with, '+
                                    'your workings with you and printouts of the Analytic Geometry lecture slides.</'+
                                    'p><hr style="visibility: hidden; clear: both;" data-mce-style="visibility: hidd'+
                                    'en; clear: both;"><p style="color: rgb(102, 102, 102); font-size: 1em;" data-mc'+
                                    'e-style="color: #666666; font-size: 1em;">Reading material</p><p style="margin:'+
                                    ' 0pt; color: rgb(38, 131, 188); text-decoration: none;" data-mce-style="margin:'+
                                    ' 0pt; color: #2683bc; text-decoration: none;"><a style="color: rgb(38, 131, 188'+
                                    '); text-decoration: none;" href="http://www.math.wisc.edu/%7Ekeisler/calc.html"'+
                                    ' target="_blank" data-mce-href="http://www.math.wisc.edu/%7Ekeisler/calc.html" '+
                                    'data-mce-style="color: #2683bc; text-decoration: none;">Elementary Calculus: An'+
                                    ' Infinitesimal Approach</a> <a href="/dev/images/worldtemplates/math/book.png" '+
                                    'target="_blank" data-mce-href="/dev/images/worldtemplates/math/book.png"><img s'+
                                    'tyle="float: left; padding: 0pt 10px 5px 0pt; margin: 0pt; width: 5%;" alt="Ele'+
                                    'mentary Calculus: An Infinitesimal Approach" src="/dev/images/worldtemplates/ma'+
                                    'th/book.png" data-mce-src="/dev/images/worldtemplates/math/book.png" data-mce-s'+
                                    'tyle="float: left; padding: 0pt 10px 5px 0pt; margin: 0pt; width: 5%;" border="'+
                                    '0 0"></a><br data-mce-bogus="1"></p><p style="margin: 2px 0pt 0pt 5px; padding:'+
                                    ' 0pt; color: rgb(51, 51, 51);" data-mce-style="margin: 2px 0pt 0pt 5px; padding'+
                                    ': 0pt; color: #333333;">H. Jerome Kliesler</p><hr style="visibility: hidden; cl'+
                                    'ear: both;" data-mce-style="visibility: hidden; clear: both;"><p><span style="f'+
                                    'loat: left; margin: 0pt 0pt 10px; padding: 2px 0pt 2px 8px; width: 99%; backgro'+
                                    'und-color: rgb(255, 255, 255); color: rgb(153, 153, 153);" data-mce-style="floa'+
                                    't: left; margin: 0pt 0pt 10px; padding: 2px 0pt 2px 8px; width: 99%; background'+
                                    '-color: #ffffff; color: #999999;">Before class</span></p><p style="margin: 20px'+
                                    ' 0pt 0pt 5px; padding: 0pt; color: rgb(102, 102, 102); font-weight: bold;" data'+
                                    '-mce-style="margin: 20px 0pt 0pt 5px; padding: 0pt; color: #666666; font-weight'+
                                    ': bold;">Read</p><p style="margin: 2px 0pt 0pt 5px; padding: 0pt; color: rgb(51'+
                                    ', 51, 51);" data-mce-style="margin: 2px 0pt 0pt 5px; padding: 0pt; color: #3333'+
                                    '33;">Chapters: 1.1 - 1.3</p><p style="padding-left: 30px;"><a style="color: rgb'+
                                    '(38, 131, 188); text-decoration: none; font-weight: bold;" data-mce-style="colo'+
                                    'r: #2683bc; text-decoration: none; font-weight: bold;">1.1 - The real line</a><'+
                                    'br data-mce-bogus="1"><a style="color: rgb(38, 131, 188); text-decoration: none'+
                                    '; font-weight: bold;" data-mce-style="color: #2683bc; text-decoration: none; fo'+
                                    'nt-weight: bold;">1.2 - Functions of Real Numbers</a><br data-mce-bogus="1"><a '+
                                    'style="color: rgb(38, 131, 188); text-decoration: none; font-weight: bold;" dat'+
                                    'a-mce-style="color: #2683bc; text-decoration: none; font-weight: bold;">1.3 - S'+
                                    'traight Lines</a><br data-mce-bogus="1"></p><p style="margin: 10px 0pt 0pt 5px;'+
                                    ' padding: 0pt; color: rgb(102, 102, 102); font-weight: bold;" data-mce-style="m'+
                                    'argin: 10px 0pt 0pt 5px; padding: 0pt; color: #666666; font-weight: bold;">Comp'+
                                    'lete the following problems:</p><p style="margin: 2px 0pt 0pt 5px; padding: 0pt'+
                                    '; color: rgb(51, 51, 51);" data-mce-style="margin: 2px 0pt 0pt 5px; padding: 0p'+
                                    't; color: #333333;">1.1: 1, 5, 7 <br>1.2: 3, 7, 9 <br>1.3: 3, 5, 11</p><hr styl'+
                                    'e="visibility: hidden; clear: both;" data-mce-style="visibility: hidden; clear:'+
                                    ' both;">'
                                },
                                "${refid}3": {
                                    page: '<p style="margin: 20px 0pt; font-size: 1.75em; color: rgb(51, 51, 51); line-hei'+
                                    'ght: 1.25em;" data-mce-style="margin: 20px 0pt; font-size: 1.75em; color: #3333'+
                                    '33; line-height: 1.25em;">Week 01: Real and Hyperreal Numbers</p><p style="marg'+
                                    'in: 0pt; font-size: 1.45em; line-height: 1.25em; color: rgb(102, 102, 102);" da'+
                                    'ta-mce-style="margin: 0pt; font-size: 1.45em; line-height: 1.25em; color: #6666'+
                                    '66;">Lecture 02: Functions</p><p style="margin: 5px 0pt 20px; color: rgb(102, 1'+
                                    '02, 102);" data-mce-style="margin: 5px 0pt 20px; color: #666666;">Date: Wednesd'+
                                    'ay 12th January<br>Location: <a style="color: rgb(38, 131, 188); text-decoratio'+
                                    'n: none;" data-mce-style="color: #2683bc; text-decoration: none;">Building 600,'+
                                    ' Lecture Hall 209</a><br data-mce-bogus="1"></p><p style="color: rgb(102, 102, '+
                                    '102); font-size: 1em;" data-mce-style="color: #666666; font-size: 1em;"><img id'+
                                    '="widget_remotecontent_${refid}6" class="widget_inline" style="display: block; '+
                                    'padding: 10px; margin: 4px;" src="/devwidgets/remotecontent/images/remoteconten'+
                                    't.png" data-mce-src="/devwidgets/remotecontent/images/remotecontent.png" data-m'+
                                    'ce-style="display: block; padding: 10px; margin: 4px;" border="1">The following'+
                                    ' was covered in this lecture:</p><ol style="margin: 10px 0pt 0pt; padding: 0pt '+
                                    '0pt 0pt 20px; color: rgb(51, 51, 51); font-size: 0.85em; font-weight: bold;" da'+
                                    'ta-mce-style="margin: 10px 0pt 0pt; padding: 0pt 0pt 0pt 20px; color: #333333; '+
                                    'font-size: 0.85em; font-weight: bold;"><li>Real Function of One Variable</li><l'+
                                    'i>Drawing Graphs of Functions</li><li>Domain of a Real Function</li><li>Constan'+
                                    't Function</li><li>Absolute Value Function</li><li>Theorem and Proof: Absolute '+
                                    'Value Function</li><li>Applications Of Functions</li><li>Real Function of Two V'+
                                    'ariables</li><li>Applications Of Functions With Two Or More Variables</li></ol>'+
                                    '<p style="color: rgb(51, 51, 51); font-size: 0.85em;" data-mce-style="color: #3'+
                                    '33333; font-size: 0.85em;">Please read and complete the following before the le'+
                                    'cture, bring text books, along with, your workings with you and printouts of th'+
                                    'e Analytic Geometry lecture slides.</p><hr style="visibility: hidden; clear: bo'+
                                    'th;" data-mce-style="visibility: hidden; clear: both;"><p style="color: rgb(102'+
                                    ', 102, 102); font-size: 1em;" data-mce-style="color: #666666; font-size: 1em;">'+
                                    'Reading material</p><p style="margin: 0pt; color: rgb(38, 131, 188); text-decor'+
                                    'ation: none;" data-mce-style="margin: 0pt; color: #2683bc; text-decoration: non'+
                                    'e;"><a style="color: rgb(38, 131, 188); text-decoration: none;" href="http://ww'+
                                    'w.math.wisc.edu/%7Ekeisler/calc.html" target="_blank" data-mce-href="http://www'+
                                    '.math.wisc.edu/%7Ekeisler/calc.html" data-mce-style="color: #2683bc; text-decor'+
                                    'ation: none;">Elementary Calculus: An Infinitesimal Approach</a> <a href="/dev/'+
                                    'images/worldtemplates/math/book.png" target="_blank" data-mce-href="/dev/images'+
                                    '/worldtemplates/math/book.png"><img style="float: left; padding: 0pt 10px 5px 0'+
                                    'pt; margin: 0pt; width: 5%;" alt="Elementary Calculus: An Infinitesimal Approac'+
                                    'h" src="/dev/images/worldtemplates/math/book.png" data-mce-src="/dev/images/wor'+
                                    'ldtemplates/math/book.png" data-mce-style="float: left; padding: 0pt 10px 5px 0'+
                                    'pt; margin: 0pt; width: 5%;" border="0 0"></a><br data-mce-bogus="1"></p><p sty'+
                                    'le="margin: 2px 0pt 0pt 5px; padding: 0pt; color: rgb(51, 51, 51);" data-mce-st'+
                                    'yle="margin: 2px 0pt 0pt 5px; padding: 0pt; color: #333333;">H. Jerome Kliesler'+
                                    '</p><hr style="visibility: hidden; clear: both;" data-mce-style="visibility: hi'+
                                    'dden; clear: both;"><p style="margin: 20px 0pt 0pt 5px; padding: 0pt; color: rg'+
                                    'b(102, 102, 102); font-weight: bold;" data-mce-style="margin: 20px 0pt 0pt 5px;'+
                                    ' padding: 0pt; color: #666666; font-weight: bold;">Before class<br></p><p style'+
                                    '="margin: 20px 0pt 0pt 5px; padding: 0pt; color: rgb(102, 102, 102); font-weigh'+
                                    't: bold;" data-mce-style="margin: 20px 0pt 0pt 5px; padding: 0pt; color: #66666'+
                                    '6; font-weight: bold;">Read</p><p style="margin: 2px 0pt 0pt 5px; padding: 0pt;'+
                                    ' color: rgb(51, 51, 51);" data-mce-style="margin: 2px 0pt 0pt 5px; padding: 0pt'+
                                    '; color: #333333;">Chapter: 1.4</p><p style="padding-left: 30px;"><a style="col'+
                                    'or: rgb(38, 131, 188); text-decoration: none; font-weight: bold;" data-mce-styl'+
                                    'e="color: #2683bc; text-decoration: none; font-weight: bold;">1.4 - The real li'+
                                    'ne</a><br data-mce-bogus="1"></p><p style="margin: 10px 0pt 0pt 5px; padding: 0'+
                                    'pt; color: rgb(102, 102, 102); font-weight: bold;" data-mce-style="margin: 10px'+
                                    ' 0pt 0pt 5px; padding: 0pt; color: #666666; font-weight: bold;">Complete the fo'+
                                    'llowing problems:</p><p style="margin: 2px 0pt 0pt 5px; padding: 0pt 0pt 0pt 30'+
                                    'px; color: rgb(51, 51, 51);">1.4: 1, 5, 7</p><hr style="visibility: hidden; cle'+
                                    'ar: both;" data-mce-style="visibility: hidden; clear: both;">'
                                },
                                "${refid}4": {
                                    page: '<p style="padding-left: 30px;"> </p><p style="margin: 20px 0pt; font-size: 1.7'+
                                    '5em; color: rgb(51, 51, 51); line-height: 1.25em;" data-mce-style="margin: 20px'+
                                    ' 0pt; font-size: 1.75em; color: #333333; line-height: 1.25em;">Week 01: Real an'+
                                    'd Hyperreal Numbers</p><p style="margin: 0pt; font-size: 1.45em; line-height: 1'+
                                    '.25em; color: rgb(102, 102, 102);" data-mce-style="margin: 0pt; font-size: 1.45'+
                                    'em; line-height: 1.25em; color: #666666;">Lecture 03: Approximations and Infini'+
                                    'tesimals</p><p style="margin: 5px 0pt 20px; color: rgb(102, 102, 102);" data-mc'+
                                    'e-style="margin: 5px 0pt 20px; color: #666666;">Date: Friday 14th January<br>Lo'+
                                    'cation: <a style="color: rgb(38, 131, 188); text-decoration: none;" data-mce-st'+
                                    'yle="color: #2683bc; text-decoration: none;">Building 600, Lecture Hall 209</a>'+
                                    '<br data-mce-bogus="1"></p><p style="color: rgb(102, 102, 102); font-size: 1em;'+
                                    '" data-mce-style="color: #666666; font-size: 1em;"><img id="widget_remoteconten'+
                                    't_${refid}7" class="widget_inline" style="display: block; padding: 10px; margin'+
                                    ': 4px;" src="/devwidgets/remotecontent/images/remotecontent.png" data-mce-src="'+
                                    '/devwidgets/remotecontent/images/remotecontent.png" data-mce-style="display: bl'+
                                    'ock; padding: 10px; margin: 4px;" border="1">The following was covered in this '+
                                    'lecture:</p><ol style="margin: 10px 0pt 0pt; padding: 0pt 0pt 0pt 20px; color: '+
                                    'rgb(51, 51, 51); font-size: 0.85em; font-weight: bold;" data-mce-style="margin:'+
                                    ' 10px 0pt 0pt; padding: 0pt 0pt 0pt 20px; color: #333333; font-size: 0.85em; fo'+
                                    'nt-weight: bold;"><li>I. The Extension Principle</li><li>II. Transfer Principle'+
                                    '</li><li>Application of the Principles</li><li>Hyperreal Numbers</li><li>Rules '+
                                    'For Infinitesimal, Finite and Infinite Numbers</li><li>Hyperreals</li><li>Theor'+
                                    'em 1</li><li>Theorem 2</li><li>III. Standard Part Principle</li><li>Theorem 3</'+
                                    'li></ol><p style="color: rgb(51, 51, 51); font-size: 0.85em;" data-mce-style="c'+
                                    'olor: #333333; font-size: 0.85em;">Please read and complete the following befor'+
                                    'e the lecture, bring text books, along with, your workings with you and printou'+
                                    'ts of the Analytic Geometry lecture slides.</p><hr style="visibility: hidden; c'+
                                    'lear: both;" data-mce-style="visibility: hidden; clear: both;"><p style="color:'+
                                    ' rgb(102, 102, 102); font-size: 1em;" data-mce-style="color: #666666; font-size'+
                                    ': 1em;">Reading material</p><p style="margin: 0pt; color: rgb(38, 131, 188); te'+
                                    'xt-decoration: none;" data-mce-style="margin: 0pt; color: #2683bc; text-decorat'+
                                    'ion: none;"><a style="color: rgb(38, 131, 188); text-decoration: none;" href="h'+
                                    'ttp://www.math.wisc.edu/%7Ekeisler/calc.html" target="_blank" data-mce-href="ht'+
                                    'tp://www.math.wisc.edu/%7Ekeisler/calc.html" data-mce-style="color: #2683bc; te'+
                                    'xt-decoration: none;">Elementary Calculus: An Infinitesimal Approach</a> <a hre'+
                                    'f="/dev/images/worldtemplates/math/book.png" target="_blank" data-mce-href="/de'+
                                    'v/images/worldtemplates/math/book.png"><img style="float: left; padding: 0pt 10'+
                                    'px 5px 0pt; margin: 0pt; width: 5%;" alt="Elementary Calculus: An Infinitesimal'+
                                    ' Approach" src="/dev/images/worldtemplates/math/book.png" data-mce-src="/dev/im'+
                                    'ages/worldtemplates/math/book.png" data-mce-style="float: left; padding: 0pt 10'+
                                    'px 5px 0pt; margin: 0pt; width: 5%;" border="0 0"></a><br data-mce-bogus="1"></'+
                                    'p><p style="margin: 2px 0pt 0pt 5px; padding: 0pt; color: rgb(51, 51, 51);" dat'+
                                    'a-mce-style="margin: 2px 0pt 0pt 5px; padding: 0pt; color: #333333;">H. Jerome '+
                                    'Kliesler</p><hr style="visibility: hidden; clear: both;" data-mce-style="visibi'+
                                    'lity: hidden; clear: both;"><p style="margin: 20px 0pt 0pt 5px; padding: 0pt; c'+
                                    'olor: rgb(102, 102, 102); font-weight: bold;" data-mce-style="margin: 20px 0pt '+
                                    '0pt 5px; padding: 0pt; color: #666666; font-weight: bold;"><span style="float: '+
                                    'left; margin: 0pt 0pt 10px; padding: 2px 0pt 2px 8px; width: 99%; background-co'+
                                    'lor: rgb(255, 255, 255); color: rgb(153, 153, 153);" data-mce-style="float: lef'+
                                    't; margin: 0pt 0pt 10px; padding: 2px 0pt 2px 8px; width: 99%; background-color'+
                                    ': #ffffff; color: #999999;"></span>Before class<br></p><p style="margin: 20px 0'+
                                    'pt 0pt 5px; padding: 0pt; color: rgb(102, 102, 102); font-weight: bold;" data-m'+
                                    'ce-style="margin: 20px 0pt 0pt 5px; padding: 0pt; color: #666666; font-weight: '+
                                    'bold;">Read</p><p style="margin: 2px 0pt 0pt 5px; padding: 0pt; color: rgb(51, '+
                                    '51, 51);" data-mce-style="margin: 2px 0pt 0pt 5px; padding: 0pt; color: #333333'+
                                    ';">Chapters: 1.5-1.6</p><p style="padding-left: 30px;"><a style="color: rgb(38,'+
                                    ' 131, 188); text-decoration: none; font-weight: bold;" data-mce-style="color: #'+
                                    '2683bc; text-decoration: none; font-weight: bold;">1.5 - Infinitesimal, Finite,'+
                                    ' and Infinite Numbers</a><br data-mce-bogus="1"><a style="color: rgb(38, 131, 1'+
                                    '88); text-decoration: none; font-weight: bold;" data-mce-style="color: #2683bc;'+
                                    ' text-decoration: none; font-weight: bold;">1.6 - Standard Parts</a><br data-mc'+
                                    'e-bogus="1"></p><p style="margin: 10px 0pt 0pt 5px; padding: 0pt; color: rgb(10'+
                                    '2, 102, 102); font-weight: bold;" data-mce-style="margin: 10px 0pt 0pt 5px; pad'+
                                    'ding: 0pt; color: #666666; font-weight: bold;">Complete the following problems:'+
                                    '</p><p style="margin: 2px 0pt 0pt 5px; padding: 0pt 0pt 0pt 30px; color: rgb(51'+
                                    ', 51, 51);">1.5: 1, 9, 13 <br>1.6: 3, 5, 21</p><hr style="visibility: hidden; c'+
                                    'lear: both;" data-mce-style="visibility: hidden; clear: both;">'
                                },
                                "${refid}5": {
                                    remotecontent: {
                                        width_unit: "%",
                                        height: "350",
                                        width: "80",
                                        border_color: "cccccc",
                                        url: "http://www.youtube.com/embed/rXOGLlKuvzU",
                                        border_size: 0
                                    }
                                },
                                "${refid}6": {
                                    remotecontent: {
                                        width_unit: "%",
                                        height: "350",
                                        width: "80",
                                        border_color: "cccccc",
                                        url: "http://www.youtube.com/embed/dNyLGmiYQY0",
                                        border_size: 0
                                    }
                                },
                                "${refid}7": {
                                    remotecontent: {
                                        width_unit: "%",
                                        height: "350",
                                        width: "80",
                                        border_color: "cccccc",
                                        url: "http://www.youtube.com/v/Fe9DPXvt2ps",
                                        border_size: 0
                                    }
                                }
                            },
                            "${pid}2": {
                                structure0: {
                                    "problemset01":{
                                        "_ref":"${refid}8",
                                        "_order":0,
                                        "_title":"Problem set 01",
                                        "main":{
                                            "_ref":"${refid}8",
                                            "_order":0,
                                            "_title":"Problem set 01"
                                        }
                                    },
                                    "problemset02":{
                                        "_ref":"${refid}9",
                                        "_title":"Problem set 02",
                                        "_order":1,
                                        "main":{
                                            "_ref":"${refid}9",
                                            "_order":0,
                                            "_title":"Problem set 02"
                                        }
                                    }
                                },
                                "${refid}8": {
                                    page: '<div class="mainContainer" style="margin: 0pt; padding: 0pt; width: 100%; font'+
                                    '-family: Arial,Helvetica,sans-serif;"> <div class="leftCol" style="margin: 0pt;'+
                                    ' padding: 0pt; font-size: 0.85em; line-height: 1.25em;"> <p style="margin: 20px'+
                                    ' 0pt; font-size: 1.75em; color: rgb(51, 51, 51); line-height: 1.25em;">Problem '+
                                    'set 01</p> <p style="margin: 0pt; font-size: 1.45em; line-height: 1.25em; color'+
                                    ': rgb(102, 102, 102);">Due: Tuesday January 11</p> </div> <div class="rightCol"'+
                                    ' style="margin: 0pt 20px 0pt 0pt; display: block; width: 100%; color: rgb(102, '+
                                    '102, 102); font-size: 1em;"> <p>Problem Set 1</p> <p>For the following 2 functi'+
                                    'ons, make a table showing the value of f(x) when X = -1, - ½, 0, ½, 1 Put a * w'+
                                    'here f(x) is undefined.</p> <p>For each of the following functions, find fx+∆x-'+
                                    ' f(x)</p> <p><strong>Function 1.</strong> $$fx=5x+1$$</p> <p>$$fx+∆x- f(x) = 5('+
                                    'x+∆x)+1-5x+1$$</p> <p>$$ = 5x+5∆x+1-5x+1$$</p> <p>$$ = 5∆x $$</p> <p><strong>Fu'+
                                    'nction 2.</strong> $$fx=5$$</p> <p>$$fx+∆x- fx = 5-5$$</p> <p>$$= 0 $$</p> </di'+
                                    'v> <hr style="visibility: hidden; clear: both;"> </div>'
                                },
                                "${refid}9": {
                                    page: '<div class="mainContainer" style="margin: 0pt; padding: 0pt; width: 100%; font'+
                                    '-family: Arial,Helvetica,sans-serif;"> <div class="leftCol" style="margin: 0pt;'+
                                    ' padding: 0pt; font-size: 0.85em; line-height: 1.25em;"> <p style="margin: 20px'+
                                    ' 0pt; font-size: 1.75em; color: rgb(51, 51, 51); line-height: 1.25em;">Problem '+
                                    'set 01</p> <p style="margin: 0pt; font-size: 1.45em; line-height: 1.25em; color'+
                                    ': rgb(102, 102, 102);">Due: Tuesday January 11</p> </div> <div class="rightCol"'+
                                    ' style="margin: 0pt 20px 0pt 0pt; display: block; width: 100%; color: rgb(102, '+
                                    '102, 102); font-size: 1em;"> <p>Problem Set 2</p> <p>Two bugs are walking along'+
                                    ' lines in 3-space. At time t bug 1 is at the point $$(x, y, z)$$ on the line $$'+
                                    'x=4−t, y=1−t, z=2+t$$ and at the same time t bug 2 is at the point $$(x,y,z)$$ '+
                                    'on the line $$x=t, y=1+t, z=1+2t$$</p> <p>Assume that the distance is in centim'+
                                    'eters and that the time is in minutes.</p> <p>(a) Find the distance between the'+
                                    ' bugs at time $$t = 0$$</p> <p>(b) Use a graphing utility to graph the distance'+
                                    ' between the bugs as a function of time from $$t = 0 to t = 5$$ <br>Please prin'+
                                    't out a copy of your graph.</p> <p>(c) What does the graph tell you about the d'+
                                    'istance between the bugs?</p> <p>(d) How close do the bugs get? (Please be exac'+
                                    't.)</p> </div> <hr style="visibility: hidden; clear: both;"> </div>'
                                }
                            },
                            "${pid}3": {
                                structure0: {
                                    "about":{
                                        "_ref":"${refid}10",
                                        "_order":0,
                                        "_title":"About",
                                        "main":{
                                            "_ref":"${refid}10",
                                            "_order":0,
                                            "_title":"About"
                                        }
                                    },
                                    "prospectivestudents":{
                                        "_ref":"${refid}11",
                                        "_title":"Prospective students",
                                        "_order":1,
                                        "main":{
                                            "_ref":"${refid}11",
                                            "_order":0,
                                            "_title":"Prospective students"
                                        }
                                    },
                                    "contactus":{
                                        "_ref":"${refid}12",
                                        "_title":"Contact us",
                                        "_order":2,
                                        "main":{
                                            "_ref":"${refid}12",
                                            "_order":0,
                                            "_title":"Contact us"
                                        }
                                    }
                                },
                                "${refid}10": {
                                    page: '<p> </p><div id="wrap" style="font-family: Arial,Helvetica,sans-serif; width: '+
                                    '750px; margin: 0pt auto;"> <div id="header" style=""> <h1 style="color: rgb(102'+
                                    ', 102, 102); font-size: 22px; margin: 20px 0pt 15px; font-weight: normal;">Abou'+
                                    't the course</h1> <hr style="color: rgb(255, 0, 0); background-color: rgb(232, '+
                                    '232, 232); height: 5px; border: 0pt none;"> </div> <div id="main" style="float:'+
                                    ' left; width: 500px; background: none repeat scroll 0% 0% rgb(255, 255, 255); m'+
                                    'argin-top: 20px;"> <img src="http://ultimedia.biz/images/image1.png" alt="" sty'+
                                    'le="float: left; padding: 0pt 15px 30px 0pt;"> <p style="color: rgb(99, 99, 99)'+
                                    '; font-size: 16px; line-height: 18px; padding: 0pt 0pt 10px; margin: 0pt;"> Ele'+
                                    'mentary Calculus is extremely diverse and our course enables you to specialise '+
                                    'in the areas that are of particular interest to you. Whether your interest is m'+
                                    'ore in the area of pure maths, applied maths, or operational research and stati'+
                                    'stics, this course will give you a good grounding in the subject </p> <hr style'+
                                    '="clear: both; color: rgb(255, 0, 0); background-color: rgb(232, 232, 232); bor'+
                                    'der: 1px dashed rgb(210, 211, 210); height: 0pt;"> <h2 style="margin: 20px 0pt '+
                                    '10px; padding: 0pt; color: rgb(102, 102, 102); font-size: 17px; font-weight: no'+
                                    'rmal;">Overview</h2> <p style="color: rgb(99, 99, 99); font-size: 14px;"> To in'+
                                    'troduce students to the concepts and methods of calculus of one real variable t'+
                                    'o rational, exponential and logarithmic functions. To introduce basic concepts '+
                                    'of differentiation and integration and their application to problem solving. </'+
                                    'p> <p style="color: rgb(99, 99, 99); font-size: 14px;"> The student will demons'+
                                    'trate proficiency in analytic and graphical techniques of both differential and'+
                                    ' integral calculus. Students will be required to demonstrate the ability to mod'+
                                    'el and solve real-world application problems using calculus techniques. In the '+
                                    'first year (only), there are two options: Pure and Applied Mathematics; and Mat'+
                                    'hematics with Mathematics with Physics. In the second year and, especially, the'+
                                    ' third year there is a wide choice of lecture courses, but no opportunity to su'+
                                    'bstitute courses from other Faculties. There is no coursework or continuous ass'+
                                    'essment, except for the Computational Projects courses (see below). </p> <p sty'+
                                    'le="color: rgb(99, 99, 99); font-size: 14px;"> You can read more about the cour'+
                                    'se in the documentation section below and in the sections on lectures, examinat'+
                                    'ions, and supervisions. </p> <hr style="clear: both; color: rgb(255, 0, 0); bac'+
                                    'kground-color: rgb(232, 232, 232); border: 1px dashed rgb(210, 211, 210); heigh'+
                                    't: 0pt; margin: 0pt 0pt 20px;"> <h2 style="margin: 20px 0pt 10px; padding: 0pt;'+
                                    ' color: rgb(102, 102, 102); font-size: 17px; display: inline; font-weight: norm'+
                                    'al;">Prerequisite</h2> <h4 style="color: rgb(48, 132, 186); padding: 0pt; font-'+
                                    'size: 14px; margin: 0pt 0pt 0pt 100px; display: inline;">Math 1710.</h4> <hr st'+
                                    'yle="clear: both; color: rgb(255, 0, 0); background-color: rgb(232, 232, 232); '+
                                    'border: 1px dashed rgb(210, 211, 210); height: 0pt; margin: 18px 0pt 0pt;"> <h2'+
                                    ' style="margin: 20px 0pt 10px; padding: 0pt; color: rgb(102, 102, 102); font-si'+
                                    'ze: 17px; font-weight: normal;">Course objectives</h2> <p style="color: rgb(99,'+
                                    ' 99, 99); font-size: 14px;"> To introduce students to the concepts and methods '+
                                    'of calculus of one real variable to rational, exponential and logarithmic funct'+
                                    'ions. To introduce basic concepts of differentiation and integration and their '+
                                    'application to problem solving. </p> <hr style="clear: both; color: rgb(255, 0,'+
                                    ' 0); background-color: rgb(232, 232, 232); border: 1px dashed rgb(210, 211, 210'+
                                    '); height: 0pt;"> <h2 style="margin: 20px 0pt 10px; padding: 0pt; color: rgb(10'+
                                    '2, 102, 102); font-size: 17px; font-weight: normal;">Lectures</h2> <p style="co'+
                                    'lor: rgb(99, 99, 99); font-size: 14px;"> For each course, the Faculty Board agr'+
                                    'ees a syllabus and a number of lectures. The purpose of lectures is to cover al'+
                                    'l the material in the syllabus in a concise and consistent way. Unlike many uni'+
                                    'versities courses (in the U.S. particularly), there is generally no `book of th'+
                                    'e course&quot; that covers the right material at the right level. </p> <p style'+
                                    '="color: rgb(99, 99, 99); font-size: 14px;"> Lectures are provided by the Facul'+
                                    'ty (not the colleges) and take place in central lecture theatres for Parts IA a'+
                                    'nd IB, and in the CMS for Part II (the third year). Each lecture lasts about 50'+
                                    ' minutes. All lectures take place in week day and Saturday (but not Sunday) mor'+
                                    'nings. </p> <p style="color: rgb(99, 99, 99); font-size: 14px;"> In the first y'+
                                    'ear, there are two lectures a day (i.e. 12 a week), for 20 weeks, and students '+
                                    'should attend all lectures. In the second and third years, the lecturing load i'+
                                    's roughly the same, but because there is a choice of lectures the timetables of'+
                                    ' individual students may differ. </p> <p style="color: rgb(99, 99, 99); font-si'+
                                    'ze: 14px;"> There is no standard way of lecturing: some lecturers write exclusi'+
                                    'vely on blackboards; some use overhead projectors or powerpoint displays; some '+
                                    'give out printed notes. The method used by individual lecturers depends on thei'+
                                    'r style and also on the sort of material that they are covering. </p> <hr style'+
                                    '="clear: both; color: rgb(255, 0, 0); background-color: rgb(232, 232, 232); bor'+
                                    'der: 1px dashed rgb(210, 211, 210); height: 0pt;"> <h2 style="margin: 20px 0pt '+
                                    '10px; padding: 0pt; color: rgb(102, 102, 102); font-size: 17px; font-weight: no'+
                                    'rmal;">Examinations</h2> <p style="color: rgb(99, 99, 99); font-size: 14px;"> E'+
                                    'ach year&quot;s work is examined by means of four three-hour papers taken at th'+
                                    'e end of May. For part IB and II, each paper of the four papers is cross-sectio'+
                                    'nal, meaning that there are questions relating to each course on each of the pa'+
                                    'pers. Students can decide for themselves the number of courses they wish to rev'+
                                    'ise for examinations; some students revise a wide range of courses and others p'+
                                    'refer to revise a small number very thoroughly. </p> <p style="color: rgb(99, 9'+
                                    '9, 99); font-size: 14px;"> Students are classed (first class, upper second clas'+
                                    's, lower second class, third class) in each part of the Tripos, but no attempt '+
                                    'is made to give an overall class. For Part II, the traditional name of Wrangler'+
                                    ' is given to anyone in the first class. This derives from the ancient form of t'+
                                    'he examination, which was not written but took the form of a dispute or &quot;w'+
                                    'rangle&quot;. The practice of ranking all the candidates, the top candidate bei'+
                                    'ng the Senior Wrangler, was abandoned in 1909. </p> </div> <div id="footer" sty'+
                                    'le="clear: both; padding: 0px; margin: 0px;"><div id="footerBox" style="backgro'+
                                    'und: -moz-linear-gradient(center top , rgb(249, 249, 249), rgb(240, 240, 238)) '+
                                    'repeat scroll 0% 0% transparent;"><p style="color: rgb(110, 110, 110); padding:'+
                                    ' 30px 0pt 0pt 20px;">Apply to one or more of <span style="text-decoration: unde'+
                                    'rline;">11 entry programs</span> in the Faculty of Mathematics.</p> <div style='+
                                    '"float: left; width: 190px; height: 250px; padding: 0pt 0px 0pt 20px;"> <img sr'+
                                    'c="http://ultimedia.biz/images/image2.png" alt=""> </div> <div style="padding: '+
                                    '0pt 30px 40px 0pt;"> <h1 style="color: rgb(56, 56, 62); font-size: 1.4em; font-'+
                                    'weight: normal;">Apply to Join Elementary Calculus</h1> <p style="color: rgb(11'+
                                    '0, 110, 110); font-size: 14px;"> You&quot;ll apply to Admissions Office Main Si'+
                                    'te, A portal leading to sites for undergraduate, transfer, and graduate admissi'+
                                    'ons, and professional (non-degree) programs. The Centre sends your information '+
                                    'to the University of Waterloo. The Faculty of Mathematics will send you an emai'+
                                    'l acknowledging receipt of your application, usually within 3 weeks of receivin'+
                                    'g your application. </p> <p style="color: rgb(110, 110, 110); font-size: 14px;"'+
                                    '> AFTER YOU HAVE APPLIED </p> <div style="padding-left: 0px;"> <ul style="color'+
                                    ': rgb(110, 110, 110); font-size: 14px; margin: 5px 5px 20px 0pt; padding: 0pt 0'+
                                    'pt 0pt 220px;"><li> You&quot;ll be asked to complete an Admission Information F'+
                                    'orm (AIF). Please note that a completed AIF is now required for admission. </li'+
                                    '><li style="padding: 10px 0pt 0pt;"> Arrange to have your grades and, in some c'+
                                    'ases, course descriptions sent to us. </li><li style="padding: 10px 0pt;"> Afte'+
                                    'r you&quot;ve applied, stay informed about important dates and deadlines and wh'+
                                    'at comes next in the admissions process at the next step website. </li></ul> </'+
                                    'div> </div> </div> <h2 style="margin: 30px 0pt 10px; color: rgb(102, 102, 102);'+
                                    ' font-size: 17px; font-weight: bold;">Alumni</h2> <div style="margin: 0pt 0pt 2'+
                                    '0px;"> <div style="width: 177px; float: left; margin-right: 8px; display: block'+
                                    ';"> <div style="background-color: rgb(213, 238, 241); -moz-border-radius: 15px '+
                                    '15px 15px 15px;"> <p style="color: rgb(110, 110, 110); font-size: 14px; line-he'+
                                    'ight: 1.2em; padding: 20px;"> "Calculus had always been an issue with me but af'+
                                    'ter a weeks intensive tutoring I&quot;d fully grasped the basics and was able t'+
                                    'o progress onto the more advanced Problem Sets" </p> </div> <div style="float: '+
                                    'left;"> <h4 style="color: rgb(48, 132, 186); font-weight: bold; margin: 0pt; pa'+
                                    'dding: 5px 20px 0pt 0pt; font-size: 14px;">Peter Anderson,</h4> <h4 style="colo'+
                                    'r: rgb(110, 110, 110); font-weight: normal; margin: 0pt; padding: 0pt 20px 20px'+
                                    ' 0pt; font-size: 14px;">Caclulus student</h4> </div> </div> <div style="width: '+
                                    '177px; float: left; margin-right: 8px; display: block;"> <div style="background'+
                                    '-color: rgb(213, 238, 241); -moz-border-radius: 15px 15px 15px 15px;"> <p style'+
                                    '="color: rgb(110, 110, 110); font-size: 14px; line-height: 1.2em; padding: 20px'+
                                    ';"> "Calculus had always been an issue with me but after a weeks intensive tuto'+
                                    'ring I&quot;d fully grasped the basics and was able to progress onto the more a'+
                                    'dvanced Problem Sets" </p> </div> <div style="float: left;"> <h4 style="color: '+
                                    'rgb(48, 132, 186); font-weight: bold; margin: 0pt; padding: 5px 20px 0pt 0pt; f'+
                                    'ont-size: 14px;">Peter Anderson,</h4> <h4 style="color: rgb(110, 110, 110); fon'+
                                    't-weight: normal; margin: 0pt; padding: 0pt 20px 20px 0pt; font-size: 14px;">Ca'+
                                    'clulus student</h4> </div> </div> <div style="width: 177px; float: left; margin'+
                                    '-right: 8px; display: block;"> <div style="background-color: rgb(213, 238, 241)'+
                                    '; -moz-border-radius: 15px 15px 15px 15px;"> <p style="color: rgb(110, 110, 110'+
                                    '); font-size: 14px; line-height: 1.2em; padding: 20px;"> "Calculus had always b'+
                                    'een an issue with me but after a weeks intensive tutoring I&quot;d fully graspe'+
                                    'd the basics and was able to progress onto the more advanced Problem Sets" </p>'+
                                    ' </div> <div style="float: left;"> <h4 style="color: rgb(48, 132, 186); font-we'+
                                    'ight: bold; margin: 0pt; padding: 5px 20px 0pt 0pt; font-size: 14px;">Peter And'+
                                    'erson,</h4> <h4 style="color: rgb(110, 110, 110); font-weight: normal; margin: '+
                                    '0pt; padding: 0pt 20px 20px 0pt; font-size: 14px;">Caclulus student</h4> </div>'+
                                    ' </div> <div style="width: 177px; float: left; margin-right: 0px; display: bloc'+
                                    'k;"> <div style="background-color: rgb(213, 238, 241); -moz-border-radius: 15px'+
                                    ' 15px 15px 15px;"> <p style="color: rgb(110, 110, 110); font-size: 14px; line-h'+
                                    'eight: 1.2em; padding: 20px;"> "Calculus had always been an issue with me but a'+
                                    'fter a weeks intensive tutoring I&quot;d fully grasped the basics and was able '+
                                    'to progress onto the more advanced Problem Sets" </p> </div> <div style="float:'+
                                    ' left;"> <h4 style="color: rgb(48, 132, 186); font-weight: bold; margin: 0pt; p'+
                                    'adding: 5px 20px 0pt 0pt; font-size: 14px;">Peter Anderson,</h4> <h4 style="col'+
                                    'or: rgb(110, 110, 110); font-weight: normal; margin: 0pt; padding: 0pt 20px 20p'+
                                    'x 0pt; font-size: 14px;">Caclulus student</h4> </div> </div> </div> </div> </di'+
                                    'v>'
                                },
                                "${refid}11": {
                                    page: '<div style="font-family: Arial,Helvetica,sans-serif;"> <div id="header"> <h1 s'+
                                    'tyle="color: rgb(102, 102, 102); font-size: 22px; margin: 20px 0pt 15px; font-w'+
                                    'eight: normal;">Prospective students</h1> <hr style="color: rgb(255, 0, 0); bac'+
                                    'kground-color: rgb(232, 232, 232); border: 0pt none; height: 5px;"> <h2 style="'+
                                    'color: rgb(102, 102, 102); font-size: 22px; margin: 20px 0pt 10px; padding: 0pt'+
                                    '; font-weight: normal;">Campus life</h2> <div id="widgetHolder" style="margin: '+
                                    '0pt; padding: 0pt; min-height: 20px; display: block; border-left: 5px solid rgb'+
                                    '(235, 235, 235);"> </div> </div> <div id="main" style="width: 50%; float: left;'+
                                    ' background: none repeat scroll 0% 0% rgb(255, 255, 255); margin-top: 20px;"> <'+
                                    'p style="color: rgb(66, 66, 66); font-size: 18px; line-height: 20px; padding: 0'+
                                    'pt 0pt 15px; margin: 0pt;"> With thousands of lectures, conferences, and cultur'+
                                    'al events being created by and open to the community each year. Intellectual st'+
                                    'imulation is inescapable. </p> <p style="color: rgb(99, 99, 99); font-size: 14p'+
                                    'x;"> Recent lectures include Modern Optics and Spectroscopy; The Perilous Earth'+
                                    ': Understanding Natural Hazards; What&quot;s the Matter with Antimatter?; Infor'+
                                    'mation and Decision Systems colloquium; and an architecture lecture on Transgre'+
                                    'ssions. </p> <h2 style="color: rgb(102, 102, 102); font-size: 22px; margin: 20p'+
                                    'x 0pt 15px; font-weight: normal;">Activities</h2> <p style="color: rgb(99, 99, '+
                                    '99); font-size: 14px;"> There is much more to an education than study and resea'+
                                    'rch in classrooms and laboratories. Numerous activities and services are availa'+
                                    'ble that complement academic pursuits and provide opportunities for students to'+
                                    ' grow and develop new interests. This section describes just a few of the activ'+
                                    'ities that define campus life. </p> <p style="color: rgb(99, 99, 99); font-size'+
                                    ': 14px;"> There are more than 400 co-curricular student organizations at MIT (m'+
                                    'any open to both faculty and students), including the Outing Club, the Solar El'+
                                    'ectric Vehicle Team, the Debate Team, the FM local broadcasting station (WMBR),'+
                                    ' the MIT Society for Women Engineers, the Student Art Association, Model UN, Ci'+
                                    'rcle K, the Black Students&quot; Union, the Latino Cultural Center, the Asian A'+
                                    'merican Association, and the South Asian American Students Association. </p> <p'+
                                    ' style="color: rgb(99, 99, 99); font-size: 14px;"> Many students are actively e'+
                                    'ngaged in service work either through the Public Service Center or on their own'+
                                    '. Groups such as the Intrafraternity Council and Alpha Phi Omega, the national '+
                                    'service fraternity, Share a Vital Earth, and Educational Studies Program sponso'+
                                    'r active social service programs. For example, the Educational Studies Program '+
                                    'provides opportunities for MIT students to work with area high school students.'+
                                    ' </p> <p style="color: rgb(99, 99, 99); font-size: 14px;"> MIT also has a numbe'+
                                    'r of groups oriented toward different backgrounds and lifestyles. Over 30 inter'+
                                    'national student groups sponsor a rich array of programs, including discussion '+
                                    'groups and social events. The International Students&quot; Association sponsors'+
                                    ' a newsletter, assemblies, and other events. MIT has an active organization of '+
                                    'Gays, Lesbians, Bisexuals and Friends at MIT (GAMIT), which organizes weekly aw'+
                                    'areness programs and discussion groups, and sponsors social events throughout t'+
                                    'he year. The Technology Community Women (TCW) is composed of spouses of MIT stu'+
                                    'dents, undergraduate as well as graduate, and sponsors monthly programs as a so'+
                                    'cial and service organization. Other interest groups focus on bridge, chess, ha'+
                                    'm radio, and strategic games. </p> <p style="color: rgb(99, 99, 99); font-size:'+
                                    ' 14px; margin-top: 40px;"> For more information, contact the Association of Stu'+
                                    'dent Activities, Room W20-401, see the ASA website at http://web.mit.edu/asa/ww'+
                                    'w/, or contact the Student Activities Office, Room W20-549, 617-253-6777. </p> '+
                                    '</div> <div id="sidebar" style="float: left; margin-left: 10px; width: 20%; mar'+
                                    'gin-top: 20px; background: none repeat scroll 0% 0% rgb(210, 235, 239); -moz-bo'+
                                    'rder-radius: 6px 6px 6px 6px;"> <div style="padding: 0pt 0pt 20px;"> <div style'+
                                    '="padding: 0pt 15px;"> <h2 style="color: rgb(102, 102, 102); font-size: 22px; m'+
                                    'argin: 20px 0pt 10px; font-weight: normal;">Student Profile</h2> <h4 style="col'+
                                    'or: rgb(48, 132, 186); padding: 0pt; margin: 0pt; font-size: 14px;">Mike Learne'+
                                    'r</h4> <h5 style="color: rgb(110, 110, 110); margin: 0pt; padding: 0pt; font-we'+
                                    'ight: normal; font-size: 14px; line-height: 1.2em;">2nd year Calculus Student</'+
                                    'h5> <p style="font-style: italic; color: rgb(102, 102, 102); font-size: 13px; l'+
                                    'ine-height: 17px;"> "I chose to study maths at university because, whilst I enj'+
                                    'oyed each of my A-level subjects, it was the only one that I could see myself s'+
                                    'tudying for three or four years. One of the major benefits of Oxford&quot;s mat'+
                                    'hs course is that you don&quot;t have to decide how long you want to stay for u'+
                                    'ntil your third year. This enables you to make an informed decision, as I found'+
                                    ' maths at university different to anything I&quot;d done before. </p> <p style='+
                                    '"font-style: italic; color: rgb(102, 102, 102); font-size: 13px; line-height: 1'+
                                    '7px;"> "The thing I&quot;ve enjoyed most about my experience of Oxford is meeti'+
                                    'ng a wide variety of new people. University gives you an opportunity to sociali'+
                                    'se and work with people from a huge spectrum of backgrounds. I&quot;m not too s'+
                                    'ure what I&quot;d like the future to hold, but I&quot;m sure that the training '+
                                    'I&quot;ve had here will stand me in good stead." </p> <img src="http://ultimedi'+
                                    'a.biz/images/mike.jpg" alt=""> </div> </div> </div> <div id="footer" style="cle'+
                                    'ar: both; padding: 20px 0pt 0pt; margin: 0pt;"> <div id="footerBox" style="back'+
                                    'ground: -moz-linear-gradient(center top , rgb(249, 249, 249), rgb(240, 240, 238'+
                                    ')) repeat scroll 0% 0% transparent;"> <p style="color: rgb(110, 110, 110); padd'+
                                    'ing: 30px 0pt 0pt 20px;">Apply to one or more of <span style="text-decoration: '+
                                    'underline;">11 entry programs</span> in the Faculty of Mathematics.</p> <div st'+
                                    'yle="float: left; height: 250px; margin: 0pt 0px 0pt 20px;"> <img style="margin'+
                                    ': 0pt 20px 0pt 0pt;" src="http://ultimedia.biz/images/image2.png" alt=""> </div'+
                                    '> <div style="padding: 0pt 30px 40px 0pt;"> <h1 style="color: rgb(56, 56, 62); '+
                                    'font-size: 1.4em; font-weight: normal;">Apply to Join Elementary Calculus</h1> '+
                                    '<p style="color: rgb(110, 110, 110); font-size: 14px;"> You&quot;ll apply to Ad'+
                                    'missions Office Main Site, A portal leading to sites for undergraduate, transfe'+
                                    'r, and graduate admissions, and professional (non-degree) programs. The Centre '+
                                    'sends your information to the University of Waterloo. The Faculty of Mathematic'+
                                    's will send you an email acknowledging receipt of your application, usually wit'+
                                    'hin 3 weeks of receiving your application. </p> <p style="color: rgb(110, 110, '+
                                    '110); font-size: 14px;"> AFTER YOU HAVE APPLIED </p> <div style="padding-left: '+
                                    '0px;"> <ul style="color: rgb(110, 110, 110); font-size: 14px; margin: 5px 5px 2'+
                                    '0px 0pt; padding: 0pt 0pt 0pt 20px;"><li> You&quot;ll be asked to complete an A'+
                                    'dmission Information Form (AIF). Please note that a completed AIF is now requir'+
                                    'ed for admission. </li><li style="padding: 10px 0pt;"> Arrange to have your gra'+
                                    'des and, in some cases, course descriptions sent to us. </li><li style="padding'+
                                    ': 10px 0pt;"> After you&quot;ve applied, stay informed about important dates an'+
                                    'd deadlines and what comes next in the admissions process at the next step webs'+
                                    'ite. </li></ul> </div> </div> </div> </div> </div>'
                                },
                                "${refid}12": {
                                    page: '<p> </p><p style="margin: 20px 0pt; font-size: 1.75em; color: rgb(51, 51, 51);'+
                                    ' line-height: 1.25em;" data-mce-style="margin: 20px 0pt; font-size: 1.75em; col'+
                                    'or: #333333; line-height: 1.25em;">Department of mathematics</p><p style="margi'+
                                    'n: 0pt; font-size: 1.45em; line-height: 1.25em; color: rgb(102, 102, 102);" dat'+
                                    'a-mce-style="margin: 0pt; font-size: 1.45em; line-height: 1.25em; color: #66666'+
                                    '6;">EC enquiries number: 617.253.4381</p><p style="margin: 5px 0pt 20px; color:'+
                                    ' rgb(102, 102, 102);" data-mce-style="margin: 5px 0pt 20px; color: #666666;">Po'+
                                    'stal address: Building 2, Room 236, 77 Massachusetts Avenue, Cambridge, MA 0213'+
                                    '9-4307 Date: Day ##th Month<br>Location: <a style="color: rgb(38, 131, 188); te'+
                                    'xt-decoration: none;" data-mce-style="color: #2683bc; text-decoration: none;">B'+
                                    'uilding, Lecture Hall</a><br data-mce-bogus="1"></p><hr style="visibility: hidd'+
                                    'en; clear: both;" data-mce-style="visibility: hidden; clear: both;"><p style="c'+
                                    'olor: rgb(102, 102, 102); font-size: 1em;" data-mce-style="color: #666666; font'+
                                    '-size: 1em;"><img id="widget_googlemaps_${refid}13" class="widget_inline" style'+
                                    '="display: block; padding: 10px; margin: 4px;" src="/devwidgets/googlemaps/imag'+
                                    'es/googlemaps.png" data-mce-src="/devwidgets/googlemaps/images/googlemaps.png" '+
                                    'data-mce-style="display: block; padding: 10px; margin: 4px;" border="1"><br></p'+
                                    '><p><br style="color: rgb(38, 131, 188); text-decoration: none; font-weight: bo'+
                                    'ld;" target="_blank" data-mce-style="color: #2683bc; text-decoration: none; fon'+
                                    't-weight: bold;"></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p>'+
                                    '<br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><b'+
                                    'r></p><p><br></p><p><br></p>'
                                },
                                "${refid}13": {
                                    googlemaps: {
                                        "mapinput": "Building 2, Room 236, 77 Massachusetts Avenue, Cambridge, MA",
                                        "mapzoom": 14,
                                        "mapsize": "LARGE",
                                        "sakai:indexed-fields": "mapinput,maphtml",
                                        "lng": -71.09096829999999,
                                        "sling:resourceType": "sakai/widget-data",
                                        "maphtml": "77 Massachusetts Ave #236, Cambridge, MA 02139, USA",
                                        "lat": 42.35804050000001
                                    }
                                }
                            },
                            "${pid}4": {
                                structure0: {
                                    "organizationnotes":{
                                        "_ref":"${refid}14",
                                        "_order":0,
                                        "_title":"Organization Notes",
                                        "main":{
                                            "_ref":"${refid}14",
                                            "_order":0,
                                            "_title":"Organization Notes"
                                        }
                                    }
                                },
                                "${refid}14": {
                                    page: '<div class="mainContainer" style="margin: 0pt; padding: 0pt; width: 100%; font'+
                                    '-family: Arial,Helvetica,sans-serif; color: rgb(51, 51, 51); font-size: 1em;"> '+
                                    '<div class="leftCol" style="float: left; margin: 0pt; padding: 0pt; display: bl'+
                                    'ock; width: 30%; font-size: 0.85em; line-height: 1.25em;"> <p style="margin: 10'+
                                    'px 0pt 0pt; font-size: 1.75em; color: rgb(51, 51, 51); line-height: 1.25em;">Or'+
                                    'ganizational Notes</p> <p style="margin: 5px 0pt 20px; color: rgb(102, 102, 102'+
                                    ');">Date: 15th January 2012</p> </div> <div class="rightCol" style="float: left'+
                                    '; margin: 0pt 20px 0pt 0pt; display: block; width: 60%;"> <hr style="visibility'+
                                    ': hidden; clear: both;"> <div class="entryCol" style="padding: 0pt; margin: 10p'+
                                    'x 0pt 0pt;"> <p style="margin: 0pt; color: rgb(102, 102, 102);">Course lectures'+
                                    '</p> <p style="margin: 10px 0pt 5px;">Ensure that we keep all lecture content g'+
                                    'oing through at least 3 weeks ahead of our current week.</p> <p style="margin: '+
                                    '0pt 0pt 5px;">Videos for each lecture need to go into the Lecture page 24hours '+
                                    'after each (so I have time to ensure they are ok).</p> </div> <hr style="visibi'+
                                    'lity: hidden; clear: both;"> <hr style="clear: both; margin: 10px 0pt 5px; padd'+
                                    'ing: 0pt; width: 100%; height: 5px; background-color: rgb(229, 229, 229); borde'+
                                    'r: 2px solid rgb(229, 229, 229);"> <div class="entryCol" style="padding: 0pt; m'+
                                    'argin: 10px 0pt 0pt;"> <p style="margin: 0pt; color: rgb(102, 102, 102);">Cours'+
                                    'e problem sets</p> <p style="margin: 10px 0pt 5px;">Ensure that we have problem'+
                                    ' sets ready for each week at least 3 weeks ahead of our current week.</p> <p st'+
                                    'yle="margin: 0pt 0pt 5px;">Please keep track of the due dates and run them past'+
                                    ' me before adding them to the lecture pages and the outline.</p> </div> <hr sty'+
                                    'le="visibility: hidden; clear: both;"> <hr style="clear: both; margin: 10px 0pt'+
                                    ' 5px; padding: 0pt; width: 100%; height: 5px; background-color: rgb(229, 229, 2'+
                                    '29); border: 2px solid rgb(229, 229, 229);"> <div class="entryCol" style="paddi'+
                                    'ng: 0pt; margin: 10px 0pt 0pt;"> <p style="margin: 0pt; color: rgb(102, 102, 10'+
                                    '2);">Course midterms</p> <p style="margin: 10px 0pt 5px;"><a style="color: rgb('+
                                    '38, 131, 188); font-weight: bold; text-decoration: none;">I&quot;ve started the'+
                                    ' first midterm</a>, please have a look and comment if you see any discrepancies'+
                                    '</p> <p style="margin: 0pt 0pt 5px;">Please keep track of the due dates and run'+
                                    ' them past me before adding them to the <a style="color: rgb(38, 131, 188); fon'+
                                    't-weight: bold; text-decoration: none;">lecture pages</a> and <a style="color: '+
                                    'rgb(38, 131, 188); font-weight: bold; text-decoration: none;">the outline</a>.<'+
                                    '/p> </div> <hr style="visibility: hidden; clear: both;"> </div> <hr style="visi'+
                                    'bility: hidden; clear: both;"> </div>'
                                }
                            },
                            "${pid}5": {
                                structure0: {
                                    "lecturetemplate":{
                                        "_ref": "${refid}15",
                                        "_order":0,
                                        "_title":"Lecture Template",
                                        "main":{
                                            "_ref":"${refid}15",
                                            "_order":0,
                                            "_title":"Lecture Template"
                                        }
                                    }
                                },
                                "${refid}15": {
                                    "page": '<p> </p><div class="mainContainer" style="margin: 0pt; padding: 0pt; width: 10'+
                                    '0%; font-family: Arial,Helvetica,sans-serif;"> <div class="leftCol" style="floa'+
                                    't: left; margin: 0pt; padding: 0pt 20px 0pt 0pt; display: block; width: 30%; fo'+
                                    'nt-size: 0.85em; line-height: 1.25em;"> <p style="margin: 20px 0pt; font-size: '+
                                    '1.75em; color: rgb(51, 51, 51); line-height: 1.25em;">Week ##: Title</p> <p sty'+
                                    'le="margin: 0pt; font-size: 1.45em; line-height: 1.25em; color: rgb(102, 102, 1'+
                                    '02);">Lecture 0#</p> <p style="margin: 5px 0pt 20px; color: rgb(102, 102, 102);'+
                                    '">Date: Day ##th Month<br>Location: <a style="color: rgb(38, 131, 188); text-de'+
                                    'coration: none;">Building, Lecture Hall</a></p> </div> <div class="rightCol" st'+
                                    'yle="float: left; margin: 0pt; display: block; width: 60%;"> <div class="rightC'+
                                    'ol" style="margin: 20px 0pt 0pt; padding: 10px 20px; color: rgb(102, 102, 102);'+
                                    ' font-size: 1em; background: -moz-linear-gradient(center top , rgb(244, 243, 24'+
                                    '2), rgb(230, 230, 227)) repeat scroll 0% 0% transparent;"> <p>Post-lecture mate'+
                                    'rials/video will be displayed here 48 hrs after each lecture</p> </div> <hr sty'+
                                    'le="visibility: hidden; clear: both;"> <div class="entryCol" style="padding: 0p'+
                                    't; margin: 10px 0pt 0pt;"> <p style="color: rgb(102, 102, 102); font-size: 1em;'+
                                    '">The following is to be covered in this lecture:</p> <ol style="margin: 10px 0'+
                                    'pt 0pt; padding: 0pt 0pt 0pt 20px; color: rgb(51, 51, 51); font-size: 0.85em; f'+
                                    'ont-weight: bold;"><li>Topic one</li><li>Topic two...</li></ol> <p style="color'+
                                    ': rgb(51, 51, 51); font-size: 0.85em;">Lecture notes</p> </div> <hr style="visi'+
                                    'bility: hidden; clear: both;"> <div class="entryCol" style="padding: 10px 0pt 0'+
                                    'pt; margin: 10px 0pt 0pt; border-top: 3px solid rgb(229, 229, 229);"> <p style='+
                                    '"color: rgb(102, 102, 102); font-size: 1em;">Reading material</p> <p style="mar'+
                                    'gin: 0pt; padding: 0pt;"><a target="_blank" style="color: rgb(38, 131, 188); te'+
                                    'xt-decoration: none; font-weight: bold;">Text book/reference material</a></p> <'+
                                    'p style="margin: 0pt; padding: 0pt; color: rgb(51, 51, 51);">Author/creator</p>'+
                                    ' <hr style="visibility: hidden; clear: both;"> <div class="beforeClassContainer'+
                                    '" style="margin: 5px 0pt 10px; padding: 10px 10px 0pt; background-color: rgb(22'+
                                    '9, 229, 229); font-size: 0.85em;"> <span style="float: left; margin: 0pt 0pt 10'+
                                    'px; padding: 2px 0pt 2px 8px; width: 99%; background-color: rgb(255, 255, 255);'+
                                    ' color: rgb(153, 153, 153);">Before class</span> <p style="margin: 20px 0pt 0pt'+
                                    ' 5px; padding: 0pt; color: rgb(102, 102, 102); font-weight: bold;">Read</p> <p '+
                                    'style="margin: 2px 0pt 0pt 5px; padding: 0pt; color: rgb(51, 51, 51);">Chapters'+
                                    ': ##</p> <p style="margin: 2px 0pt 0pt 5px; padding: 0pt; list-style: none outs'+
                                    'ide none;"><a style="color: rgb(38, 131, 188); text-decoration: none; font-weig'+
                                    'ht: bold;">Chapter one</a></p> <p style="margin: 2px 0pt 0pt 5px; padding: 0pt;'+
                                    ' list-style: none outside none;"><a style="color: rgb(38, 131, 188); text-decor'+
                                    'ation: none; font-weight: bold;">Chapter two...</a></p> <p style="margin: 10px '+
                                    '0pt 0pt 5px; padding: 0pt; color: rgb(102, 102, 102); font-weight: bold;">Compl'+
                                    'ete the following excerises:</p> <p style="margin: 2px 0pt 0pt 5px; padding: 0p'+
                                    't; color: rgb(51, 51, 51);">Excersise one</p> <p style="margin: 2px 0pt 0pt 5px'+
                                    '; padding: 0pt; color: rgb(51, 51, 51);">Excersise two...</p> <hr style="visibi'+
                                    'lity: hidden; clear: both;"> </div> </div> </div> </div>'
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
                            "lectures": {
                                "_title": "Lectures",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_view": ["-student"],
                                "_edit": ["-lecturer", "-ta"]
                            },
                            "problemsets": {
                                "_title": "Problem sets",
                                "_order": 2,
                                "_docref": "${pid}2",
                                "_view": ["-student"],
                                "_edit": ["-lecturer", "-ta"]
                            },
                            "coursewebsite": {
                                "_title": "Course website",
                                "_order": 3,
                                "_docref": "${pid}3",
                                "_view": ["-student", "everyone", "anonmyous"],
                                "_edit": ["-lecturer", "-ta"]
                            },
                            "organizationnotes": {
                                "_title": "Organization Notes",
                                "_order": 4,
                                "_docref": "${pid}4",
                                "_view": ["-ta"],
                                "_edit": ["-lecturer"]
                            },
                            "lecturetemplate": {
                                "_title": "Lecture Template",
                                "_order": 5,
                                "_docref": "${pid}5",
                                "_view": ["-ta"],
                                "_edit": ["-lecturer"]
                            }
                        },
                        joinRole: "student",
                        creatorRole: "lecturer"
                    },
                    {
                        id: "basiccourse",
                        title: "Basic course",
                        img: "/dev/images/worldtemplates/basiccourse.png",
                        fullImg: "/dev/images/worldtemplates/basiccourse-full.png",
                        perfectFor: "Basic course using content sharing and messaging",
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
                                        "_ref":"${refid}0",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"${refid}0",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "${refid}0": {
                                    page: "<img id='widget_mylibrary_${refid}1' class='widget_inline' style='display: blo"+
                                    "ck; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.pn"+
                                    "g' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='di"+
                                    "splay: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "${refid}1": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "participants":{
                                        "_ref":"${refid}2",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title":"Participants",
                                        "main":{
                                            "_ref":"${refid}2",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "${refid}2": {
                                    page: "<img id='widget_participants_${refid}3' class='widget_inline' style='display: "+
                                    "block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/partic"+
                                    "ipants.png' data-mce-src='/devwidgets/participants/images/participants.png' dat"+
                                    "a-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "${refid}3": {
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
                                "_view": ["everyone", "anonymous", "-student"],
                                "_edit": ["-ta", "-lecturer"]
                            },
                            "participants": {
                                "_title": "Participants",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-student"],
                                "_edit": ["-ta", "-lecturer"]
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
                        title: "Research project",
                        img: "/dev/images/worldtemplates/researchgroup-full.png",
                        fullImg: "/dev/images/worldtemplates/research_tempate.png",
                        perfectFor: "Research Projects, Collaborative student projects, Class projects, Reading clubs",
                        roles: [
                            {
                                id: "leadresearcher",
                                roleTitle: "Lead researchers",
                                title: "Lead researcher",
                                allowManage: true
                            },
                            {
                                id: "researcher",
                                roleTitle: "Researchers",
                                title: "Researcher",
                                allowManage: true
                            },
                            {
                                id: "researchassistant",
                                roleTitle: "Research assistants",
                                title: "Research assistant",
                                allowManage: false
                            },
                            {
                                id: "contributor",
                                roleTitle: "Contributors",
                                title: "Contributor",
                                allowManage: false
                            },
                            {
                                id: "evaluator",
                                roleTitle: "Evaluators",
                                title: "Evaluator",
                                allowManage: false
                            }
                        ],
                        docs: {
                            "${pid}0": {
                                structure0: {
                                    "introduction":{
                                        "_ref": "${refid}0",
                                        "_order": 0,
                                        "_title": "Introduction",
                                        "main":{
                                            "_ref":"${refid}0",
                                            "_order": 0,
                                            "_title": "Introduction"
                                        }
                                    }
                                },
                                "${refid}0": {
                                    page: "<div style='margin: 0; padding: 0; width: 100%; font-family:Arial, Helvetica, "+
                                    "sans-serif; line-height: 1.25em; color: #333; font-size: 1em;'><div style='floa"+
                                    "t: left; margin: 0; padding: 20px 0 0 0; width: 30%; display: block;'><p style="+
                                    "'margin: 0 0 10px 0; font-size: 1.75em; line-height: 1em; color: #333;'>Researc"+
                                    "h Introduction</p><p style='margin: 0 0 20px 0; padding: 0; font-size: 1.25em; "+
                                    "color: #666;'>Sub-title</p><p style='margin: 0 0 20px 0; padding: 0;'>Informati"+
                                    "ve detail</p></div><div style='float: right; margin: 0; padding: 20px 0 0 0; wi"+
                                    "dth:60%; display: block;'><p style='margin: 0 0 10px 0;'>Introduction text...</"+
                                    "p><ul style='margin: 0 0 20px -15px; padding: 0 0 0 15px; list-style: none;'><p"+
                                    " style=''><strong>Investigators:</strong></p><li><a href='#' target='_blank' st"+
                                    "yle='color: #2683bc;'><strong>Name</strong></a> - Title</li><li><a href='#' tar"+
                                    "get='_blank' style='color: #2683bc;'><strong>Name</strong></a> - Title</li></ul"+
                                    "></div><hr style='clear: both; margin: 20px 0 20px 0; padding: 0; width: 100%; "+
                                    "height: 5px; background-color: #e5e5e5; border:none; color: #e5e5e5;' /><div st"+
                                    "yle='margin: 0; padding: 0; width: 100%;'><div style='float: left; margin: 0; w"+
                                    "idth: 30%; display: block;'><p style='margin: 0; color: #666;'><strong>Benefit<"+
                                    "/strong></p></div><div style='float: right; margin: 0 0 20px 0; width: 60%; dis"+
                                    "play: block;'><p style='margin: 0;'>The benefit of this research...</p></div></"+
                                    "div><hr style='clear: both; margin: 20px 0 20px 0; padding: 0; width: 100%; hei"+
                                    "ght: 5px; background-color: #e5e5e5; border:none; color: #e5e5e5;' /><div style"+
                                    "='margin: 0; padding: 0; width: 100%;'><div style='float: left; margin: 0; widt"+
                                    "h: 30%; display: block;'><p style='margin: 0; color: #666;'><strong>Scope</stro"+
                                    "ng></p></div><div style='float: right; margin: 0 0 20px 0; width: 60%; display:"+
                                    " block;'><p style='margin: 0;'>We intend to study...</p></div></div><hr style='"+
                                    "clear: both; margin: 20px 0 20px 0; padding: 0; width: 100%; height: 5px; backg"+
                                    "round-color: #e5e5e5; border:none; color: #e5e5e5;' /></div>"
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "library":{
                                        "_ref":"${refid}1",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"${refid}1",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "${refid}1": {
                                    page: "<img id='widget_mylibrary_${refid}2' class='widget_inline' style='display: blo"+
                                    "ck; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.pn"+
                                    "g' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='di"+
                                    "splay: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "${refid}2": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}2": {
                                structure0: {
                                    "participants":{
                                        "_ref":"${refid}3",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title":"Participants",
                                        "main":{
                                            "_ref":"${refid}3",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "${refid}3": {
                                    page: "<img id='widget_participants_${refid}4' class='widget_inline' style='display: "+
                                    "block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/partic"+
                                    "ipants.png' data-mce-src='/devwidgets/participants/images/participants.png' dat"+
                                    "a-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "${refid}4": {
                                    participants: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}3": {
                                structure0: {
                                    "references": {
                                        "_ref":"${refid}5",
                                        "_order":0,
                                        "_title":"References",
                                        "main": {
                                            "_ref":"${refid}5",
                                            "_order":0,
                                            "_title":"References"
                                        }
                                    }
                                },
                                "${refid}5": {
                                    page: "<div style='margin: 0; padding: 0; width: 100%; font-family:Arial, Helvetica, s"+
                                    "ans-serif; line-height: 1.25em; color: #333; font-size: 1em;'><div style='float"+
                                    ": left; margin: 0; padding: 20px 0 0 0;'><p style='margin: 0 0 10px 0; font-siz"+
                                    "e: 1.75em; line-height: 1em; color: #333;'>References</p><p style='margin: 0 0 "+
                                    "20px 0; padding: 0; font-size: 1.25em; color: #666;'>Sub-title</p><p style='mar"+
                                    "gin: 0 0 20px 0; padding: 0;'>Informative detail</p></div><hr style='clear: bot"+
                                    "h; margin: 20px 0 20px 0; padding: 0; width: 100%; height: 5px; background-colo"+
                                    "r: #e5e5e5; border:none; color: #e5e5e5;' /><div style='margin: 0; padding: 0; "+
                                    "width: 100%;'><div style='float: left; margin: 0; padding: 0 0 20px 0; width: 3"+
                                    "0%; display: block;'><p style='margin: 0; padding: 0; color: #666; font-size: 1"+
                                    "em;'>Author:</p><p style='margin: 0; padding: 0;'><a href='http://en.wikipedia."+
                                    "org/wiki/Olin_Levi_Warner' target='_blank' style='color: #2683bc;'>Olin Levi Wa"+
                                    "rner</a></p></div><div style='float: right; margin: 0 0 20px 0; width: 60%; dis"+
                                    "play: block;'><p style='margin: 0;'><a href='http://en.wikipedia.org/wiki/Resea"+
                                    "rch' target='_blank' style='color: #2683bc;'><strong>Example publication or ref"+
                                    "erence title or name</strong></a></p><p style='margin: 0; color: #666;'>Researc"+
                                    "h holding the torch of knowledge (1896). Library of Congress Thomas Jefferson B"+
                                    "uilding, Washington, D.C.</p></div></div><hr style='clear: both; margin: 20px 0"+
                                    " 20px 0; padding: 0; width: 100%; height: 5px; background-color: #e5e5e5; borde"+
                                    "r:none; color: #e5e5e5;' /><div style='margin: 0; padding: 0; width: 100%;'><di"+
                                    "v style='float: left; margin: 0; padding: 0 0 20px 0; width: 30%; display: bloc"+
                                    "k;'><p style='margin: 0; padding: 0; color: #666; font-size: 1em;'>Author:</p><"+
                                    "p style='margin: 0; padding: 0;'><a href='http://en.wikipedia.org/wiki/Olin_Lev"+
                                    "i_Warner' target='_blank' style='color: #2683bc;'>Olin Levi Warner</a></p></div"+
                                    "><div style='float: right; margin: 0 0 20px 0; width: 60%; display: block;'><p "+
                                    "style='margin: 0;'><a href='http://en.wikipedia.org/wiki/Research' target='_bla"+
                                    "nk' style='color: #2683bc;'><strong>Example publication or reference title or n"+
                                    "ame</strong></a></p><p style='margin: 0; color: #666;'>Research holding the tor"+
                                    "ch of knowledge (1896). Library of Congress Thomas Jefferson Building, Washingt"+
                                    "on, D.C.</p></div></div><hr style='clear: both; margin: 20px 0 20px 0; padding:"+
                                    " 0; width: 100%; height: 5px; background-color: #e5e5e5; border:none; color: #e"+
                                    "5e5e5;' /><div style='margin: 0; padding: 0; width: 100%;'><div style='float: l"+
                                    "eft; margin: 0; padding: 0 0 20px 0; width: 30%; display: block;'><p style='mar"+
                                    "gin: 0; padding: 0; color: #666; font-size: 1em;'>Author:</p><p style='margin: "+
                                    "0; padding: 0;'><a href='http://en.wikipedia.org/wiki/Olin_Levi_Warner' target="+
                                    "'_blank' style='color: #2683bc;'>Olin Levi Warner</a></p></div><div style='floa"+
                                    "t: right; margin: 0 0 20px 0; width: 60%; display: block;'><p style='margin: 0;"+
                                    "'><a href='http://en.wikipedia.org/wiki/Research' target='_blank' style='color:"+
                                    " #2683bc;'><strong>Example publication or reference title or name</strong></a><"+
                                    "/p><p style='margin: 0; color: #666;'>Research holding the torch of knowledge ("+
                                    "1896). Library of Congress Thomas Jefferson Building, Washington, D.C.</p></div"+
                                    "></div><hr style='clear: both; margin: 20px 0 20px 0; padding: 0; width: 100%; "+
                                    "height: 5px; background-color: #e5e5e5; border:none; color: #e5e5e5;' /><div st"+
                                    "yle='margin: 0; padding: 0; width: 100%;'><div style='float: left; margin: 0; p"+
                                    "adding: 0 0 20px 0; width: 30%; display: block;'><p style='margin: 0; padding: "+
                                    "0; color: #666; font-size: 1em;'>Author:</p><p style='margin: 0; padding: 0;'><"+
                                    "a href='http://en.wikipedia.org/wiki/Olin_Levi_Warner' target='_blank' style='c"+
                                    "olor: #2683bc;'>Olin Levi Warner</a></p></div><div style='float: right; margin:"+
                                    " 0 0 20px 0; width: 60%; display: block;'><p style='margin: 0;'><a href='http:/"+
                                    "/en.wikipedia.org/wiki/Research' target='_blank' style='color: #2683bc;'><stron"+
                                    "g>Example publication or reference title or name</strong></a></p><p style='marg"+
                                    "in: 0; color: #666;'>Research holding the torch of knowledge (1896). Library of"+
                                    " Congress Thomas Jefferson Building, Washington, D.C.</p></div></div><hr style="+
                                    "'clear: both; margin: 20px 0 20px 0; padding: 0; width: 100%; height: 5px; back"+
                                    "ground-color: #e5e5e5; border:none; color: #e5e5e5;' /><div style='margin: 0; p"+
                                    "adding: 0; width: 100%;'><div style='float: left; margin: 0; padding: 0 0 20px "+
                                    "0; width: 30%; display: block;'><p style='margin: 0; padding: 0; color: #666; f"+
                                    "ont-size: 1em;'>Author:</p><p style='margin: 0; padding: 0;'><a href='http://en"+
                                    ".wikipedia.org/wiki/Olin_Levi_Warner' target='_blank' style='color: #2683bc;'>O"+
                                    "lin Levi Warner</a></p></div><div style='float: right; margin: 0 0 20px 0; widt"+
                                    "h: 60%; display: block;'><p style='margin: 0;'><a href='http://en.wikipedia.org"+
                                    "/wiki/Research' target='_blank' style='color: #2683bc;'><strong>Example publica"+
                                    "tion or reference title or name</strong></a></p><p style='margin: 0; color: #66"+
                                    "6;'>Research holding the torch of knowledge (1896). Library of Congress Thomas "+
                                    "Jefferson Building, Washington, D.C.</p></div></div></div>"
                                }
                            }
                        },
                        structure: {
                            "introduction": {
                                "_title": "Introduction",
                                "_order": 0,
                                "_docref": "${pid}0",
                                "_view": ["everyone", "anonymous", "-contributor", "-evaluator"],
                                "_edit": ["-leadresearcher", "-researcher", "-researchassistant"]
                            },
                            "library": {
                                "_title": "Library",
                                "_order": 1,
                                "_docref": "${pid}1",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-contributor", "-evaluator"],
                                "_edit": ["-leadresearcher", "-researcher", "-researchassistant"]
                            },
                            "participants": {
                                "_title": "Participants",
                                "_order": 2,
                                "_docref": "${pid}2",
                                "_nonEditable": true,
                                "_view": ["everyone", "anonymous", "-contributor", "-evaluator"],
                                "_edit": ["-leadresearcher", "-researcher", "-researchassistant"]
                            },
                            "references": {
                                "_title": "References",
                                "_order": 3,
                                "_docref": "${pid}3",
                                "_view": ["everyone", "anonymous", "-contributor", "-evaluator"],
                                "_edit": ["-leadresearcher", "-researcher", "-researchassistant"]
                            }
                        },
                        joinRole: "contributor",
                        creatorRole: "leadresearcher"
                    },
                    {
                        id: "researchsupport",
                        title: "Research support group",
                        img: "/dev/images/worldtemplates/researchsupport.png",
                        fullImg: "/dev/images/worldtemplates/researchsupport-full.png",
                        perfectFor: "Support a research project using content sharing and messaging",
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
                                        "_ref":"${refid}0",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title": "Library",
                                        "main":{
                                            "_ref":"${refid}0",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Library"
                                        }
                                    }
                                },
                                "${refid}0": {
                                    page: "<img id='widget_mylibrary_${refid}1' class='widget_inline' style='display: blo"+
                                    "ck; padding: 10px; margin: 4px;' src='/devwidgets/mylibrary/images/mylibrary.pn"+
                                    "g' data-mce-src='/devwidgets/mylibrary/images/mylibrary.png' data-mce-style='di"+
                                    "splay: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "${refid}1": {
                                    mylibrary: {
                                        "groupid": "${groupid}"
                                    }
                                }
                            },
                            "${pid}1": {
                                structure0: {
                                    "participants":{
                                        "_ref":"${refid}2",
                                        "_order":0,
                                        "_nonEditable": true,
                                        "_title":"Participants",
                                        "main":{
                                            "_ref":"${refid}2",
                                            "_order":0,
                                            "_nonEditable": true,
                                            "_title":"Participants"
                                        }
                                    }
                                },
                                "${refid}2": {
                                    page: "<img id='widget_participants_${refid}3' class='widget_inline' style='display: "+
                                    "block; padding: 10px; margin: 4px;' src='/devwidgets/participants/images/partic"+
                                    "ipants.png' data-mce-src='/devwidgets/participants/images/participants.png' dat"+
                                    "a-mce-style='display: block; padding: 10px; margin: 4px;' border='1'><br></p>"
                                },
                                "${refid}3": {
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
