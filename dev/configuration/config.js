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
            GATEWAY_URL: "/",
            GROUP_DEFAULT_ICON_URL: "/dev/images/group_avatar_icon_64x64_nob.png",
            GROUP_DEFAULT_ICON_URL_LARGE: "/dev/images/group_avatar_icon_100x100_nob.png",
            I10N_BUNDLE_URL: "/dev/lib/misc/l10n/cultures/globalize.culture.__CODE__.js",
            I18N_BUNDLE_ROOT: "/dev/bundle/",
            I18N_DEFAULT_BUNDLE: '/dev/bundle/default.properties',
            INBOX_URL: "/me#l=messages/inbox",
            INVITATIONS_URL: "/me#l=messages/invitations",
            MY_DASHBOARD_URL: "/me#l=dashboard",
            SEARCH_ACTIVITY_ALL_URL: "/var/search/activity/all.json",
            SEARCH_URL: "/search",
            USER_DEFAULT_ICON_URL: "/dev/images/default_User_icon_50x50.png",
            USER_DEFAULT_ICON_URL_LARGE: "/dev/images/default_User_icon_100x100.png",
            INFINITE_LOADING_ICON: "/dev/images/Infinite_Scrolling_Loader_v01.gif",
            I18N_CUSTOM_BUNDLE: '/dev/configuration/custom.properties',

            // Services
            BATCH: "/system/batch",
            CAPTCHA_SERVICE: "/system/captcha",
            CONTACTS_FIND: "/var/contacts/find.json",
            CONTACTS_FIND_STATE: "/var/contacts/findstate.json",
            CONTACTS_FIND_ALL: "/var/contacts/find-all.json",
            CREATE_USER_SERVICE: "/system/userManager/user.create.html",
            DISCUSSION_GETPOSTS_THREADED: "/var/search/discussions/threaded.json?path=__PATH__&marker=__MARKER__",
            GOOGLE_CHARTS_API: "http://chart.apis.google.com/chart",
            GROUP_CREATE_SERVICE: "/system/userManager/group.create.json",
            GROUPS_MANAGER: "/system/me/managedgroups.json",
            GROUPS_MEMBER: "/system/me/groups.json",
            IMAGE_SERVICE: "/var/image/cropit",
            LOGIN_SERVICE: "/system/sling/formlogin",
            LOGOUT_SERVICE: "/system/sling/logout?resource=/index",
            ME_SERVICE: "/system/me",
            MESSAGE_BOXCATEGORY_SERVICE: "/var/message/boxcategory.json",
            MESSAGE_BOXCATEGORY_ALL_SERVICE: "/var/message/boxcategory-all.json",
            POOLED_CONTENT_MANAGER: "/var/search/pool/me/manager.json",
            POOLED_CONTENT_MANAGER_ALL: "/var/search/pool/me/manager-all.json",
            POOLED_CONTENT_VIEWER: "/var/search/pool/me/viewer.json",
            POOLED_CONTENT_VIEWER_ALL: "/var/search/pool/me/viewer-all.json",
            POOLED_CONTENT_SPECIFIC_USER: "/var/search/pool/auth-all.json",
            PRESENCE_SERVICE: "/var/presence.json",
            SAKAI2_TOOLS_SERVICE: "/var/proxy/s23/site.json?siteid=__SITEID__",
            STATIC_BATCH: "/system/staticfiles",
            WORLD_CREATION_SERVICE: "/system/world/create",
            WORLD_INFO_URL: "/var/templates/worlds.2.json",

            // Replace these in widgets with proper widgetsave functions from magic
            SEARCH_ALL_ENTITIES: "/var/search/general.json",
            SEARCH_ALL_ENTITIES_ALL: "/var/search/general-all.json",
            SEARCH_ALL_FILES: "/var/search/pool/all.json",
            SEARCH_ALL_FILES_ALL: "/var/search/pool/all-all.json",
            SEARCH_GROUP_MEMBERS: "/var/search/groupmembers.json",
            SEARCH_GROUP_MEMBERS_ALL: "/var/search/groupmembers-all.json",
            SEARCH_GROUPS: "/var/search/groups.infinity.json",
            SEARCH_GROUPS_ALL: "/var/search/groups-all.json",
            SEARCH_USERS_ACCEPTED: "/var/contacts/findstate.infinity.json",
            SEARCH_USERS: "/var/search/users.infinity.json",
            SEARCH_USERS_ALL: "/var/search/users-all.json",
            SEARCH_USERS_GROUPS: "/var/search/usersgroups.json",
            SEARCH_USERS_GROUPS_ALL: "/var/search/usersgroups-all.json",
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
                "defaultaccess": "public", // public, logged-in-only or members-only (see above for role description)
                "defaultjoin": "yes", // no, yes, or withauth (see above for descriptions)
                "addcontentmanagers": true // true, false. If set to yes, group managers will be added as manager for a file 
                                           // added to a group library in context of that group
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
            Links: {
                "defaultaccess": "public" // public, everyone or private (see above for role description)
            },
            Collections: {
                'defaultaccess': 'public' // public, everyone or private (see above for role description)
            },
            Copyright: {
                types: {
                    "creativecommons": {
                        "title": "CREATIVE_COMMONS_LICENSE"
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
                },
                defaults: {
                    "content": "creativecommons",
                    "sakaidocs": "creativecommons",
                    "links": "creativecommons",
                    "collections": "creativecommons"
                }
            }
        },

        /*
         * Restrict the ability for a non manager user to share a content item, depending on their role specified, and the content permission.
         * public - content available to anyone
         * everyone - content available to logged in users
         * private - content available to private users
         */
        roleCanShareContent: {
            'public': ['editor', 'viewer', 'everyone', 'anon'],
            'everyone': ['editor', 'viewer', 'everyone'],
            'private': ['editor', 'viewer']
        },

        allowPasswordChange: true,
        /**
         * Where the email field should live
         * Default is 'profile' but it can also be 'accountpreferences'
         *
         * If you set this to 'accountpreferences', make sure to set the
         * display property of the email field in the defaultConfig
         * below to false
        */
        emailLocation: 'profile',

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
                        "permission": "anonymous",
                        "order": 0,
                        "elements": {
                            "firstName": {
                                "label": "__MSG__PROFILE_BASIC_FIRSTNAME_LABEL__",
                                "errorMessage": "__MSG__PROFILE_BASIC_FIRSTNAME_ERROR__",
                                "required": true,
                                "display": true,
                                "limitDisplayWidth": 300
                            },
                            "lastName": {
                                "label": "__MSG__PROFILE_BASIC_LASTNAME_LABEL__",
                                "errorMessage": "__MSG__PROFILE_BASIC_LASTNAME_ERROR__",
                                "required": true,
                                "display": true,
                                "limitDisplayWidth": 300
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
                                "errorMessage": "__MSG__PROFILE_BASIC_EMAIL_ERROR__",
                                "required": true,
                                "display": true,
                                "validation": "email"
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
                                "label": "__MSG__TAGS_AND_CATEGORIES__",
                                "required": false,
                                "display": true,
                                "type": "tags",
                                "tagField": true
                            }
                        }
                    },
                    "aboutme": {
                        "label": "__MSG__PROFILE_ABOUTME_LABEL__",
                        "altLabel": "__MSG__PROFILE_ABOUTME_LABEL_OTHER__",
                        "required": true,
                        "display": true,
                        "access": "everybody",
                        "modifyacl": true,
                        "permission": "anonymous",
                        "order": 1,
                        "elements": {
                            "aboutme": {
                                "label": "__MSG__PROFILE_ABOUTME_LABEL__",
                                "altLabel": "__MSG__PROFILE_ABOUTME_LABEL_OTHER__",
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
                    "publications": {
                        "label": "__MSG__PROFILE_PUBLICATIONS_LABEL__",
                        "required": false,
                        "display": true,
                        "access": "everybody",
                        "modifyacl": true,
                        "permission": "anonymous",
                        "multiple": true,
                        "multipleLabel": "__MSG__PROFILE_PUBLICATION_LABEL__",
                        "order": 2,
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
                                "type": "url",
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
             * Set the default user settings in account preferences for automatic tagging
             * and auto-tagged notifications
             */
            defaultAutoTagging: true,
            defaultSendTagMsg: true
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
                "name": "__MSG__CLASSMATE__",
                "definition": "__MSG__IS_MY_CLASSMATE__",
                "selected": true
            }, {
                "name": "__MSG__SUPERVISOR__",
                "inverse": "__MSG__SUPERVISED__",
                "definition": "__MSG__IS_MY_SUPERVISOR__",
                "selected": false
            }, {
                "name": "__MSG__SUPERVISED__",
                "inverse": "__MSG__SUPERVISOR__",
                "definition": "__MSG__IS_SUPERVISED_BY_ME__",
                "selected": false
            }, {
                "name": "__MSG__LECTURER__",
                "inverse": "__MSG__STUDENT__",
                "definition": "__MSG__IS_MY_LECTURER__",
                "selected": false
            }, {
                "name": "__MSG__STUDENT__",
                "inverse": "__MSG__LECTURER__",
                "definition": "__MSG__IS_MY_STUDENT__",
                "selected": false
            }, {
                "name": "__MSG__COLLEAGUE__",
                "definition": "__MSG__IS_MY_COLLEAGUE__",
                "selected": false
            }, {
                "name": "__MSG__COLLEGE_MATE__",
                "definition": "__MSG__IS_MY_COLLEGE_MATE__",
                "selected": false
            }, {
                "name": "__MSG__SHARES_INTERESTS__",
                "definition": "__MSG__SHARES_INTEREST_WITH_ME__",
                "selected": false
            }]
        },

        /*
         * Object to override default widget configuration
         * Here you can add an object with the widget ID for the object key, with the configuration you would like to override
         * An example to override options for the embedcontent widget:
         *     embedcontent: {
         *         defaultOptions: {
         *             'embedmethod': 'original',
         *             'layout': 'vertical',
         *             'showName': false,
         *             'showDetails': false,
         *             'showDownload': false
         *         }
         *     }
         */
        WidgetSettings: {},

        enableBranding: true,

        // Set this to true if you have an authentication system such as CAS
        // that needs to redirect the user's browser on logout
        followLogoutRedirects: false,

        // Set this to the hostname of your CLE instance if you're using CAS
        // proxy tickets
        hybridCasHost: false,

        Messages: {
            Types: {
                inbox: "inbox",
                sent: "sent",
                trash: "trash"
            },
            Categories: {
                message: "Message",
                announcement: "Announcement",
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
            "jp2":"images/jp2",
            "jpg":"image/jpeg",
            "jpeg":"image/jpeg",
            "bmp":"image/bmp",
            "gif":"image/gif",
            "tif":"image/tiff",
            "tiff":"images/tiff",
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
            "wav": "audio/x-wav",
            "mp3": "audio/mpeg",
            "tar": "application/zip",
            "zip": "application/zip",
            "other":"other"
        },
        MimeTypes: {
            "application/doc": {
                cssClass: "s3d-icon-doc",
                URL: "/dev/images/mimetypes/doc.png",
                description: "WORD_DOCUMENT"
            },
            "application/msword": {
                cssClass: "s3d-icon-doc",
                URL: "/dev/images/mimetypes/doc.png",
                description: "WORD_DOCUMENT"
            },
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
                cssClass: "s3d-icon-doc",
                URL: "/dev/images/mimetypes/doc.png",
                description: "WORD_DOCUMENT"
            },
            "application/pdf": {
                cssClass: "s3d-icon-pdf",
                URL: "/dev/images/mimetypes/pdf.png",
                description: "PDF_DOCUMENT"
            },
            "application/x-download": {
                cssClass: "s3d-icon-pdf",
                URL: "/dev/images/mimetypes/pdf.png",
                description: "PDF_DOCUMENT"
            },
            "application/x-pdf": {
                cssClass: "s3d-icon-pdf",
                URL: "/dev/images/mimetypes/pdf.png",
                description: "PDF_DOCUMENT"
            },
            "application/vnd.ms-powerpoint": {
                cssClass: "s3d-icon-pps",
                URL: "/dev/images/mimetypes/pps.png",
                description: "POWERPOINT_DOCUMENT"
            },
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
                cssClass: "s3d-icon-pps",
                URL: "/dev/images/mimetypes/pps.png",
                description: "POWERPOINT_DOCUMENT"
            },
            "application/vnd.oasis.opendocument.text": {
                cssClass: "s3d-icon-doc",
                URL: "/dev/images/mimetypes/doc.png",
                description: "OPEN_OFFICE_DOCUMENT"
            },
            "application/vnd.oasis.opendocument.presentation": {
                cssClass: "s3d-icon-pps",
                URL: "/dev/images/mimetypes/pps.png",
                description: "OPEN_OFFICE_PRESENTATION"
            },
            "application/vnd.oasis.opendocument.spreadsheet": {
                cssClass: "s3d-icon-pps",
                URL: "/dev/images/mimetypes/spreadsheet.png",
                description: "OPEN_OFFICE_SPREADSHEET"
            },

            "application/x-shockwave-flash": {
                cssClass: "s3d-icon-swf",
                URL: "/dev/images/mimetypes/swf.png",
                description: "FLASH_PLAYER_FILE"
            },
            "application/zip": {
                cssClass: "s3d-icon-zip",
                URL: "/dev/images/mimetypes/zip.png",
                description: "ARCHIVE_FILE"
            },
            "application/x-zip-compressed": {
                cssClass: "s3d-icon-zip",
                URL: "/dev/images/mimetypes/zip.png",
                description: "ARCHIVE_FILE"
            },
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                cssClass: "s3d-icon-spreadsheet",
                URL: "/dev/images/mimetypes/spreadsheet.png",
                description: "SPREADSHEET_DOCUMENT"
            },
            "application/vnd.ms-excel": {
                cssClass: "s3d-icon-spreadsheet",
                URL: "/dev/images/mimetypes/spreadsheet.png",
                description: "SPREADSHEET_DOCUMENT"
            },
            "audio/x-wav": {
                cssClass: "s3d-icon-audio",
                URL: "/dev/images/mimetypes/sound.png",
                description: "SOUND_FILE"
            },
            "audio/mpeg": {
                cssClass: "s3d-icon-audio",
                URL: "/dev/images/mimetypes/sound.png",
                description: "SOUND_FILE"
            },
            "text/plain": {
                cssClass: "s3d-icon-txt",
                URL: "/dev/images/mimetypes/txt.png",
                description: "TEXT_DOCUMENT"
            },
            "text/rtf": {
                cssClass: "s3d-icon-txt",
                URL: "/dev/images/mimetypes/txt.png",
                description: "TEXT_DOCUMENT"
            },
            "image/png": {
                cssClass: "s3d-icon-image",
                URL: "/dev/images/mimetypes/images.png",
                description: "PNG_IMAGE"
            },
            "image/bmp": {
                cssClass: "s3d-icon-image",
                URL: "/dev/images/mimetypes/images.png",
                description: "BMP_IMAGE"
            },
            "image/gif": {
                cssClass: "s3d-icon-image",
                URL: "/dev/images/mimetypes/images.png",
                description: "GIF_IMAGE"
            },
            "image/jp2": {
                cssClass: "s3d-icon-image",
                URL: "/dev/images/mimetypes/images.png",
                description: "JPG2000_IMAGE"
            },
            "image/jpeg": {
                cssClass: "s3d-icon-image",
                URL: "/dev/images/mimetypes/images.png",
                description: "JPG_IMAGE"
            },
            "image/pjpeg": {
                cssClass: "s3d-icon-image",
                URL: "/dev/images/mimetypes/images.png",
                description: "JPG_IMAGE"
            },
            "image/tiff": {
                cssClass: "s3d-icon-image",
                URL: "/dev/images/mimetypes/images.png",
                description: "TIFF_IMAGE"
            },
            "text/html": {
                cssClass: "s3d-icon-html",
                URL: "/dev/images/mimetypes/html.png",
                description: "HTML_DOCUMENT"
            },
            "video/x-msvideo": {
                cssClass: "s3d-icon-video",
                URL: "/dev/images/mimetypes/video.png",
                description: "VIDEO_FILE"
            },
            "video/mp4": {
                cssClass: "s3d-icon-video",
                URL: "/dev/images/mimetypes/video.png",
                description: "VIDEO_FILE"
            },
            "video/quicktime": {
                cssClass: "s3d-icon-video",
                URL: "/dev/images/mimetypes/video.png",
                description: "VIDEO_FILE"
            },
            "video/x-ms-wmv": {
                cssClass: "s3d-icon-video",
                URL: "/dev/images/mimetypes/video.png",
                description: "VIDEO_FILE"
            },
            "folder": {
                cssClass: "s3d-icon-kmultiple",
                URL: "/dev/images/mimetypes/kmultiple.png",
                description: "FOLDER"
            },
            "x-sakai/link": {
                cssClass: "s3d-icon-url",
                URL: "/dev/images/mimetypes/html.png",
                description: "URL_LINK"
            },
            "x-sakai/document": {
                cssClass: "s3d-icon-sakaidoc",
                URL: "/dev/images/mimetypes/sakaidoc.png",
                description: "DOCUMENT"
            },
            "x-sakai/collection": {
                cssClass: "s3d-icon-collection",
                URL: "/dev/images/mimetypes/collection.png",
                description: "COLLECTION"
            },
            "kaltura/video": {
                cssClass: "s3d-icon-video",
                URL: "/dev/images/mimetypes/video.png",
                description: "VIDEO_FILE"
            },
            "kaltura/audio": {
                cssClass: "s3d-icon-audio",
                URL: "/dev/images/mimetypes/sound.png",
                description: "SOUND_FILE"
            },
            "other": {
                cssClass: "s3d-icon-unknown",
                URL: "/dev/images/mimetypes/unknown.png",
                description: "OTHER_DOCUMENT"
            }
        },

        Authentication: {
            "allowInternalAccountCreation": true,
            "internal": true,
            "internalAndExternal": false,
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

        /**
         * Top navigation configuration
         *
         * To indicate that a link should be placed on the right of the signup
         * link, the object should indicate it as:
         *   'rightLink': true
         */
        Navigation: [{
            "url": "/me#l=dashboard",
            "id": "navigation_you_link",
            "anonymous": false,
            "label": "YOU",
            "append": "messages",
            "subnav": [{
                "url": "/me#l=dashboard",
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
            "label": "CREATE_AND_COLLECT",
            "append": "collections",
            "subnav": [{
                "id": "subnavigation_add_content_link",
                "label": "ADD_CONTENT",
                "url": "#",
                "cssClass": "sakai_add_content_overlay"
            }, {
                "id": "subnavigation_add_collection_link",
                "label": "ADD_COLLECTION",
                "url": "#"
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

        Footer: {
            leftLinks: [{
                "title": "__MSG__COPYRIGHT__",
                "href": "http://sakaiproject.org/foundation-licenses",
                "newWindow": true
            }, {
                "title": "__MSG__HELP__",
                "href": "http://sakaiproject.org/node/2307",
                "newWindow": true
            }, {
                "title": "__MSG__ACKNOWLEDGEMENTS__",
                "href": "/acknowledgements"
            }, {
                "title": "__MSG__SUGGEST_AN_IMPROVEMENT__",
                "href": "http://sakaioae.idea.informer.com/",
                "newWindow": true
            }],
            rightLinks: [{
                "title": "__MSG__BROWSE__",
                "href": "/categories"
            }, {
                "title": "__MSG__EXPLORE__",
                "href": "/"
            }]
        },

        /*
         * Are anonymous users allowed to browse/search
         */
        anonAllowed: true,
        /*
         * List of pages that require a logged in user
         */
        requireUser: ["/me", "/dev/me.html", "/create", "/dev/createnew.html"],

        /*
         * List of pages that require an anonymous user
         */
        requireAnonymous: ["/register", "/dev/create_new_account.html"],
        /*
         * List of pages that will be added to requireUser if
         * anonAllowed is false
         */
        requireUserAnonNotAllowed: ["/me", "/dev/me.html"],
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
        requireProcessing: ["/dev/user.html", "/me" ,"/dev/me.html", "/dev/content_profile.html", "/dev/content_profile.html", "/content"],

        useLiveSakai2Feeds: false,
        /*
         * List of custom CLE Tool names. This can be used to override the translated
         * tool name in the Sakai 2 Tools Widget drop down, or name a custom CLE tool
         * that has been added to your CLE installation. You can see the list of
         * enabled CLE tools at /var/basiclti/cletools.json, and configure them in
         * Nakamura under the org.sakaiproject.nakamura.basiclti.CLEVirtualToolDataProvider
         * configuration.
         */
        sakai2ToolNames: {
            /* "sakai.mytoolId" : "My Custom Tool Title" */
        },

        displayDebugInfo: true,
        displayTimezone: true,
        displayLanguage: true,

        /**
         * Section dividers can be added to the directory structure by adding in the following
         * element at the appropriate place:
         *  divider1: {
         *      "divider": true,
         *      "title": "Divider title" [optional],
         *      "cssClass": "CSS class to add to items inside of elements beneath the divider [optional]
         *  }
         */
        Directory: {
            medicineanddentistry: {
                title: "__MSG__MEDICINE_AND_DENTISTRY__",
                children: {
                    preclinicalmedicine: {
                        title: "__MSG__PRECLINICAL_MEDICINE__"
                    },
                    preclinicaldentistry: {
                        title: "__MSG__PRECLINICAL_DENTISTRY__"
                    },
                    clinicalmedicine: {
                        title: "__MSG__CLININCAL_MEDICINE__"
                    },
                    clinicaldentistry: {
                        title: "__MSG__CLININCAL_DENTISTRY__"
                    },
                    othersinmedicineanddentistry: {
                        title: "__MSG__MEDICINE_AND_DENTISTRY_OTHERS__"
                    }
                }
            },
            biologicalsciences: {
                title: "__MSG__BIOLOGICAL_SCIENCES__",
                children: {
                    biology: {
                        title: "__MSG__BIOLOGY__"
                    },
                    botany: {
                        title: "__MSG__BOTANY__"
                    },
                    zoology: {
                        title: "__MSG__ZOOLOGY__"
                    },
                    genetics: {
                        title: "__MSG__GENETICS__"
                    },
                    microbiology: {
                        title: "__MSG__MICROBIOLOGY__"
                    },
                    sportsscience: {
                        title: "__MSG__SPORTS_SCIENCE__"
                    },
                    molecularbiologybiophysicsandbiochemistry: {
                        title: "__MSG__MOLECULAR_BIOLOGY__"
                    },
                    psychology: {
                        title: "__MSG__PSYCHOLOGY__"
                    },
                    othersinbiologicalsciences: {
                        title: "__MSG__BIOLOGICAL_SCIENCES_OTHER__"
                    }
                }
            },
            veterinarysciencesagriculture: {
                title: "__MSG__VETERINARY_SCIENCES__",
                children: {
                    preclinicalveterinarymedicine: {
                        title: "__MSG__PRE_CLINICAL_VETERINARY__"
                    },
                    clinicalveterinarymedicineanddentistry: {
                        title: "__MSG__CLINICAL_VETERINARY__"
                    },
                    animalscience: {
                        title: "__MSG__ANIMAL_SCIENCE__"
                    },
                    agriculture: {
                        title: "__MSG__AGRICULTURE__"
                    },
                    forestry: {
                        title: "__MSG__FORESTRY__"
                    },
                    foodandbeveragestudies: {
                        title: "__MSG__FOOD_BEVERAGE__"
                    },
                    agriculturalsciences: {
                        title: "__MSG__AGRICULTURAL_SCIENCE__"
                    },
                    othersinveterinarysciencesandagriculture: {
                        title: "__MSG__VETERINARY_SCIENCES_OTHER__"
                    }
                }
            },
            physicalsciences: {
                title: "__MSG__PHYSICAL_SCIENCE__",
                children: {
                    chemistry: {
                        title: "__MSG__CHEMISTRY__"
                    },
                    materialsscience: {
                        title: "__MSG__MATERIALS_SCIENCE__"
                    },
                    physics: {
                        title: "__MSG__PHYSICS__"
                    },
                    forensicandarchaeologicalscience: {
                        title: "__MSG__FORENSIC_ARCHEALOGICAL__"
                    },
                    astronomy: {
                        title: "__MSG__ASTRONOMY__"
                    },
                    geology: {
                        title: "__MSG__GEOLOGY__"
                    },
                    oceansciences: {
                        title: "__MSG__OCEAN_SCIENCE__"
                    },
                    othersinphysicalsciences: {
                        title: "__MSG__PHYSICAL_SCIENCE_OTHER__"
                    }
                }
            },
            mathematicalandcomputersciences: {
                title: "__MSG__MATHEMATICAL_COMPUTER_SCIENCES__",
                children: {
                    mathematics: {
                        title: "__MSG__MATHEMATICS__"
                    },
                    operationalresearch: {
                        title: "__MSG__OPERATIONAL_RESEARCH__"
                    },
                    statistics: {
                        title: "__MSG__STATISTICS__"
                    },
                    computerscience: {
                        title: "__MSG__COMPUTER_SCIENCE__"
                    },
                    informationsystems: {
                        title: "__MSG__INFORMATION_SYSTEMS__"
                    },
                    softwareengineering: {
                        title: "__MSG__SOFTWARE_ENGINEERING__"
                    },
                    artificialintelligence: {
                        title: "__MSG__ARTIFICIAL_INTELLIGENCE__"
                    },
                    othersinmathematicalandcomputingsciences: {
                        title: "__MSG__MATHEMATICAL_COMPUTER_SCIENCES_OTHER__"
                    }
                }
            },
            engineering: {
                title: "__MSG__ENGINEERING__",
                children: {
                    generalengineering: {
                        title: "__MSG__GENERAL_ENGINEERING__"
                    },
                    civilengineering: {
                        title: "__MSG__CIVIL_ENGINEERING__"
                    },
                    mechanicalengineering: {
                        title: "__MSG__MECHANICAL_ENGINEERING__"
                    },
                    aerospaceengineering: {
                        title: "__MSG__AEROSPACE_ENGINEERING__"
                    },
                    navalarchitecture: {
                        title: "__MSG__NAVAL_ARCHITECTURE__"
                    },
                    electronicandelectricalengineering: {
                        title: "__MSG__ELECTRONIC_ELECTRICAL_ENGINEERING__"
                    },
                    productionandmanufacturingengineering: {
                        title: "__MSG__PRODUCTION_MANUFACTURING_ENGINEERING__"
                    },
                    chemicalprocessandenergyengineering: {
                        title: "__MSG__CHEMICAL_PROCESS_ENERGY_ENGINEERING__"
                    },
                    othersinengineering: {
                        title: "__MSG__ENGINEERING_OTHER__"
                    }
                }
            },
            technologies: {
                title: "__MSG__TECHNOLOGIES__",
                children: {
                    mineralstechnology: {
                        title: "__MSG__MINERALS_TECHNOLOGY__"
                    },
                    metallurgy: {
                        title: "__MSG__METALLURGY__"
                    },
                    ceramicsandglasses: {
                        title: "__MSG__CERAMICS_GLASSES__"
                    },
                    polymersandtextiles: {
                        title: "__MSG__POLYMERS_TEXTILES__"
                    },
                    materialstechnologynototherwisespecified: {
                        title: "__MSG__MATERIALS_TECHNOLOGY_OTHER__"
                    },
                    maritimetechnology: {
                        title: "__MSG__MARITIME_TECHNOLOGY__"
                    },
                    industrialbiotechnology: {
                        title: "__MSG__INDUSTRIAL_BIOTECHNOLOGY__"
                    },
                    othersintechnology: {
                        title: "__MSG__TECHNOLOGIES_OTHER__"
                    }
                }
            },
            architecturebuildingandplanning: {
                title: "__MSG__ARCHITECTURE_BUILDING_PLANNING__",
                children: {
                    architecture: {
                        title: "__MSG__ARCHITECTURE__"
                    },
                    building: {
                        title: "__MSG__BUILDING__"
                    },
                    landscapedesign: {
                        title: "__MSG__LANDSCAPE_DESIGN__"
                    },
                    planning: {
                        title: "__MSG__PLANNING__"
                    },
                    othersinarchitecturebuildingandplanning: {
                        title: "__MSG__ARCHITECTURE_BUILDING_PLANNING_OTHER__"
                    }
                }
            },
            socialstudies: {
                title: "__MSG__SOCIAL_STUDIES__",
                children: {
                    economics: {
                        title: "__MSG__ECONOMICS__"
                    },
                    politics: {
                        title: "__MSG__POLITICS__"
                    },
                    sociology: {
                        title: "__MSG__SOCIOLOGY__"
                    },
                    socialpolicy: {
                        title: "__MSG__SOCIAL_POLICY__"
                    },
                    socialwork: {
                        title: "__MSG__SOCIAL_WORK__"
                    },
                    anthropology: {
                        title: "__MSG__ANTHROPOLOGY__"
                    },
                    humanandsocialgeography: {
                        title: "__MSG__HUMAN_SOCIAL_GEOGRAPHY__"
                    },
                    othersinsocialstudies: {
                        title: "__MSG__SOCIAL_STUDIES_OTHER__"
                    }
                }
            },
            law: {
                title: "__MSG__LAW__",
                children: {
                    publiclaw: {
                        title: "__MSG__LAW_PUBLIC__"
                    },
                    privatelaw: {
                        title: "__MSG__LAW_PRIVATE__"
                    },
                    jurisprudence: {
                        title: "__MSG__JURISPRUDENCE__"
                    },
                    legalpractice: {
                        title: "__MSG__LEGAL_PRACTICE__"
                    },
                    medicallaw: {
                        title: "__MSG__LAW_MEDICAL__"
                    },
                    othersinlaw: {
                        title: "__MSG__LAW_OTHER__"
                    }
                }
            },
            businessandadministrativestudies: {
                title: "__MSG__BUSINESS_ADMINISTRATIVE_STUDIES__",
                children: {
                    businessstudies: {
                        title: "__MSG__BUSINESS_STUDIES__"
                    },
                    managementstudies: {
                        title: "__MSG__MANAGEMENTS_STUDIES__"
                    },
                    finance: {
                        title: "__MSG__FINANCE__"
                    },
                    accounting: {
                        title: "__MSG__ACCOUNTING__"
                    },
                    marketing: {
                        title: "__MSG__MARKETING__"
                    },
                    humanresourcemanagement: {
                        title: "__MSG__HUMAN_RESOURCE_MANAGEMENT__"
                    },
                    officeskills: {
                        title: "__MSG__OFFICE_SKILLS__"
                    },
                    tourismtransportandtravel: {
                        title: "__MSG__TOURISM__"
                    },
                    othersinbusandadminstudies: {
                        title: "__MSG__BUSINESS_ADMINISTRATIVE_STUDIES_OTHER__"
                    }
                }
            },
            masscommunicationsanddocumentation: {
                title: "__MSG__MASS_COMMUNICATIONS_DOCUMENTATION__",
                children: {
                    informationservices: {
                        title: "__MSG__INFORMATION_SERVICES__"
                    },
                    publicitystudies: {
                        title: "__MSG__PUBLICITY_STUDIES__"
                    },
                    mediastudies: {
                        title: "__MSG__MEDIA_STUDIES__"
                    },
                    publishing: {
                        title: "__MSG__PUBLISHING__"
                    },
                    journalism: {
                        title: "__MSG__JOURNALISM__"
                    },
                    othersinmasscommanddoc: {
                        title: "__MSG__MASS_COMMUNICATIONS_DOCUMENTATION_OTHER__"
                    }
                }
            },
            linguisticsclassicsandrelatedsubjects: {
                title: "__MSG__LINGUISTICS_CLASSICS__",
                children: {
                    linguistics: {
                        title: "__MSG__LINGUISTICS__"
                    },
                    comparativeliterarystudies: {
                        title: "__MSG__LINGUISTICS_LITERARY__"
                    },
                    englishstudies: {
                        title: "__MSG__LINGUISTICS_ENGLISH__"
                    },
                    ancientlanguagestudies: {
                        title: "__MSG__LINGUISTICS_ANCIENT__"
                    },
                    celticstudies: {
                        title: "__MSG__LINGUISTICS_CELTIC__"
                    },
                    latinstudies: {
                        title: "__MSG__LINGUISTICS_LATIN__"
                    },
                    classicalgreekstudies: {
                        title: "__MSG__LINGUISTICS_CLASSICAL_GREEK__"
                    },
                    classicalstudies: {
                        title: "__MSG__LINGUISTICS_CLASSICAL__"
                    },
                    othersinlinguisticsclassicsandrelsubject: {
                        title: "__MSG__LINGUISTICS_CLASSICS_OTHER__"
                    }
                }
            },
            europeanlanguagesliteratureandrelatedsubjects: {
                title: "__MSG__EUROPEAN_LANGUAGES__",
                children: {
                    frenchstudies: {
                        title: "__MSG__EUROPEAN_LANGUAGES_FRENCH__"
                    },
                    germanstudies: {
                        title: "__MSG__EUROPEAN_LANGUAGES_GERMAN__"
                    },
                    italianstudies: {
                        title: "__MSG__EUROPEAN_LANGUAGES_ITALIAN__"
                    },
                    spanishstudies: {
                        title: "__MSG__EUROPEAN_LANGUAGES_SPANISH__"
                    },
                    portuguesestudies: {
                        title: "__MSG__EUROPEAN_LANGUAGES_PORTUGUESE__"
                    },
                    scandinavianstudies: {
                        title: "__MSG__EUROPEAN_LANGUAGES_SCANDINAVIAN__"
                    },
                    russianandeasteuropeanstudies: {
                        title: "__MSG__EUROPEAN_LANGUAGES_RUSSIAN__"
                    },
                    othersineurolangliteratureandrelsubjects: {
                        title: "__MSG__EUROPEAN_LANGUAGES_OTHER__"
                    }
                }
            },
            easiaticlanguagesliterature: {
                title: "__MSG__EXOTIC_LANGUAGES__",
                children: {
                    chinesestudies: {
                        title: "__MSG__EXOTIC_LANGUAGES_CHINESE__"
                    },
                    japanesestudies: {
                        title: "__MSG__EXOTIC_LANGUAGES_JAPANESE__"
                    },
                    southasianstudies: {
                        title: "__MSG__EXOTIC_LANGUAGES_SOUTH_ASIAN__"
                    },
                    otherasianstudies: {
                        title: "__MSG__EXOTIC_LANGUAGES_ASIAN_OTHER__"
                    },
                    africanstudies: {
                        title: "__MSG__EXOTIC_LANGUAGES_AFRICAN__"
                    },
                    modernmiddleeasternstudies: {
                        title: "__MSG__EXOTIC_LANGUAGES_MIDDLE_EAST__"
                    },
                    americanstudies: {
                        title: "__MSG__EXOTIC_LANGUAGES_AMERICAN__"
                    },
                    australasianstudies: {
                        title: "__MSG__EXOTIC_LANGUAGES_AUSTRALIAN__"
                    },
                    othersineasternasiaafriamericaaustralianlang: {
                        title: "__MSG__EXOTIC_LANGUAGES_OTHER__"
                    }
                }
            },
            historicalandphilosophicalstudies: {
                title: "__MSG__HISTORICAL_PHILOSOPHICAL_STUDIES__",
                children: {
                    historybyperiod: {
                        title: "__MSG__HISTORY_PERIOD__"
                    },
                    historybyarea: {
                        title: "__MSG__HISTORY_AREA__"
                    },
                    historybytopic: {
                        title: "__MSG__HISTORY_TOPIC__"
                    },
                    archaeology: {
                        title: "__MSG__ARCHEOLOGY__"
                    },
                    philosophy: {
                        title: "__MSG__PHILOSOPHY__"
                    },
                    theologyandreligiousstudies: {
                        title: "__MSG__THEOLOGY_STUDIES__"
                    },
                    othersinhistoricalandphilosophicalstudies: {
                        title: "__MSG__HISTORICAL_PHILOSOPHICAL_STUDIES_OTHER__"
                    }
                }
            },
            creativeartsanddesign: {
                title: "__MSG__CREATIVE_ARTS__",
                children: {
                    fineart: {
                        title: "__MSG__FINE_ART__"
                    },
                    designstudies: {
                        title: "__MSG__DESIGN_STUDIES__"
                    },
                    music: {
                        title: "__MSG__MUSIC__"
                    },
                    drama: {
                        title: "__MSG__DRAMA__"
                    },
                    dance: {
                        title: "__MSG__DANCE__"
                    },
                    cinematicsandphotography: {
                        title: "__MSG__CINEMATICS_PHOTOGRAPHY__"
                    },
                    crafts: {
                        title: "__MSG__CRAFTS__"
                    },
                    imaginativewriting: {
                        title: "__MSG__IMAGINITIVE_WRITING__"
                    },
                    othersincreativeartsanddesign: {
                        title: "__MSG__CREATIVE_ARTS_OTHER__"
                    }
                }
            },
            education: {
                title: "__MSG__EDUCATION__",
                children: {
                    trainingteachers: {
                        title: "__MSG__TRAINING_TEACHERS__"
                    },
                    researchandstudyskillsineducation: {
                        title: "__MSG__EDUCATION_RESEARCH_STUDY_SKILLS__"
                    },
                    academicstudiesineducation: {
                        title: "__MSG__EDUCATION_ACADEMIC_STUDIES__"
                    },
                    othersineducation: {
                        title: "__MSG__EDUCATION_OTHER__"
                    }
                }
            }
        },

        // Array of css files to load in each page
        skinCSS: [],

        Languages: [{ 
            "country": "ES", 
            "language": "es", 
            "bundle": "/dev/bundle/es_ES.properties",
            "displayName": "Español"
        }, {
            "country": "CN",
            "language": "zh",
            "bundle": "/dev/bundle/zh_CN.properties",
            "displayName": "中文"
        }, {
            "country": "NL",
            "language": "nl",
            "bundle": "/dev/bundle/nl_NL.properties",
            "displayName": "Nederlands"
        }, {
            "country": "GB",
            "language": "en",
            "bundle": "/dev/bundle/en_GB.properties",
            "displayName": "English (United Kingdom)"
        }, {
            "country": "US",
            "language": "en",
            "bundle": "/dev/bundle/en_US.properties",
            "displayName": "English (United States)"
        }, {
            "country": "FR",
            "language": "fr",
            "displayName": "Français"
        }, {
            "country": "JP",
            "language": "ja",
            "bundle": "/dev/bundle/ja_JP.properties",
            "displayName": "日本語"
        }, {
            "country": "HU",
            "language": "hu",
            "bundle": "/dev/bundle/hu_HU.properties",
            "displayName": "Magyar"
        }, {
            "country": "KR",
            "language": "ko",
            "bundle": "/dev/bundle/ko_KR.properties",
            "displayName": "한국어"
        }],

        // Default Language for the deployment, must be one of the language_COUNTRY pairs that exists above
        defaultLanguage: "en_US",
        defaultLanguageBundle: "/dev/bundle/en_US.properties",

        enableCategories: true,

        // The data schema version. Version 2 as of the 1.2 release in March 2012
        schemaVersion: '2',

        Editor: {
            languagePacks: ['ar', 'az', 'be', 'bg', 'bn', 'br', 'bs', 'ca', 'ch',
                'cn', 'cs', 'cy', 'da', 'de', 'dv', 'el', 'en', 'eo', 'es', 'et',
                'eu', 'fa', 'fi', 'fr', 'gl', 'gu', 'he', 'hi', 'hr', 'hu', 'hy',
                'ia', 'id', 'is', 'it', 'ja', 'ka', 'kl', 'km', 'ko', 'lb', 'lt',
                'lv', 'mk', 'ml', 'mn', 'ms', 'my', 'nb', 'nl', 'nn', 'no', 'pl',
                'ps', 'pt', 'ro', 'ru', 'sc', 'se', 'si', 'sk', 'sl', 'sq', 'sr',
                'sv', 'ta', 'te', 'th', 'tn', 'tr', 'tt', 'tw', 'uk', 'ur', 'vi',
                'zh-cn', 'zh-tw', 'zh', 'zu']
        },

        /**
         * The list of widgets (other than the fixed set) that should be shown inside
         * of the inserterbar for content authoring.
         */
        exposedSakaiDocWidgets: ["discussion", "comments", "googlemaps"],
        /*
         * Default structure and content that should be given to a newly created
         * Sakai Documented. If no default content is specified, an empty page placeholder
         * will be shown to the user
         */
        defaultSakaiDocContent: {
            'rows': [
                {
                    'id': 'id' + Math.round(Math.random() * 100000000),
                    'columns': [
                        {
                            'width': 1,
                            'elements': []
                        }
                    ]
                }
            ]
        },

        /*
         * Content to display if there are no pages available to the user in a group/world
         */
        pageUnavailableContent: '<p>__MSG__PAGE_UNAVAILABLE__</p>',

        /*
         * _canEdit: can change the area permissions on this page
         * _reorderOnly: can reorder this item in the navigation, but cannot edit the name of the page
         * _nonEditable: cannot edit the contents of this page
         * _canSubedit:
         */
        defaultprivstructure: {
            'structure0': {
                'dashboard': {
                    '_ref': '${refid}0',
                    '_title': '__MSG__MY_DASHBOARD__',
                    '_order': 0,
                    '_canEdit': true,
                    '_reorderOnly': true,
                    '_nonEditable': true,
                    'main': {
                        '_ref': '${refid}0',
                        '_order': 0,
                        '_title': '__MSG__MY_DASHBOARD__'
                    }
                },
                'messages': {
                    '_title': '__MSG__MY_MESSAGES__',
                    '_ref': '${refid}1',
                    '_order': 1,
                    '_canEdit': true,
                    '_reorderOnly': true,
                    '_canSubedit': true,
                    '_nonEditable': true,
                    'inbox': {
                        '_ref': '${refid}1',
                        '_order': 0,
                        '_title': '__MSG__INBOX__',
                        '_nonEditable': true
                    },
                    'invitations': {
                        '_ref': '${refid}2',
                        '_order': 1,
                        '_title': '__MSG__INVITATIONS__',
                        '_nonEditable': true
                    },
                    'sent': {
                        '_ref': '${refid}3',
                        '_order': 2,
                        '_title': '__MSG__SENT__',
                        '_nonEditable': true
                    },
                    'trash': {
                        '_ref': '${refid}4',
                        '_order': 3,
                        '_title': '__MSG__TRASH__',
                        '_nonEditable': true
                    }
                }
            },
            '${refid}0': {
                'id2506067': {
                    'htmlblock': {
                        'content': '<div class="fl-force-right"><button type="button" class="s3d-button s3d-margin-top-5 s3d-header-button s3d-header-smaller-button dashboard_change_layout" data-tuid="${refid}5">__MSG__EDIT_LAYOUT__</button><button type="button" class="s3d-button s3d-margin-top-5 s3d-header-button s3d-header-smaller-button dashboard_global_add_widget" data-tuid="${refid}5">__MSG__ADD_WIDGET__</button></div><h1 class="s3d-contentpage-title">__MSG__MY_DASHBOARD__</h1>'
                    }
                },
                '${refid}5': {
                    'dashboard': {
                        'layout': 'threecolumn',
                        'columns': {
                            'column1': [
                                {
                                    'uid': '${refid}10',
                                    'visible': 'block',
                                    'name': 'recentchangedcontent'
                                }
                            ],
                            'column2': [
                                {
                                    'uid': '${refid}11',
                                    'visible': 'block',
                                    'name': 'recentmemberships'
                                }
                            ],
                            'column3': [
                                {
                                    'uid': '${refid}12',
                                    'visible': 'block',
                                    'name': 'recentcontactsnew'
                                }
                            ]
                        }
                    }
                },
                'rows': [
                    {
                        'id': 'id8965114',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': 'id2506067',
                                        'type': 'htmlblock'
                                    },
                                    {
                                        'id': 'id8321271',
                                        'type': 'carousel'
                                    },
                                    {
                                        'id': '${refid}5',
                                        'type': 'dashboard'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            '${refid}1': {
                '${refid}6': {
                    'box': 'inbox',
                    'category': 'message',
                    'title': '__MSG__INBOX__'
                },
                'rows': [
                    {
                        'id': 'id7088118',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': '${refid}6',
                                        'type': 'inbox'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            '${refid}2': {
                '${refid}7': {
                    'box': 'inbox',
                    'category': 'invitation',
                    'title': '__MSG__INVITATIONS__'
                },
                'rows': [
                    {
                        'id': 'id6156677',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': '${refid}7',
                                        'type': 'inbox'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            '${refid}3': {
                '${refid}8': {
                    'box': 'outbox',
                    'category': '*',
                    'title': '__MSG__SENT__'
                },
                'rows': [
                    {
                        'id': 'id5268914',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': '${refid}8',
                                        'type': 'inbox'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            '${refid}4': {
                '${refid}9': {
                    'box': 'trash',
                    'category': '*',
                    'title': '__MSG__TRASH__'
                },
                'rows': [
                    {
                        'id': 'id1281420',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': '${refid}9',
                                        'type': 'inbox'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },

        /**
         * In order to set permissions on specific private areas, the following parameter should be added:
         *   _view: "anonymous" // Area is visible to all users by default
         *   _view: "everyone" // Area is visible to all logged in users by default
         *   _view: "contacts" // Area is visible to all contacts by default
         *   _view: "private" // Area is not visible to other users by default
         */
        defaultpubstructure: {
            'structure0': {
                'profile': {
                    '_title': '__MSG__MY_PROFILE__',
                    '_altTitle': '__MSG__MY_PROFILE_OTHER__',
                    '_order': 0,
                    '_view': 'anonymous',
                    '_reorderOnly': true,
                    '_nonEditable': true
                },
                'library': {
                    '_ref': '${refid}0',
                    '_order': 1,
                    '_title': '__MSG__MY_LIBRARY__',
                    '_altTitle': '__MSG__MY_LIBRARY_OTHER__',
                    '_reorderOnly': true,
                    '_nonEditable': true,
                    '_view': 'anonymous',
                    'main': {
                        '_ref': '${refid}0',
                        '_order': 0,
                        '_title': '__MSG__MY_LIBRARY__'
                    }
                },
                'memberships': {
                    '_title': '__MSG__MY_MEMBERSHIPS__',
                    '_order': 2,
                    '_ref': '${refid}1',
                    '_altTitle': '__MSG__MY_MEMBERSHIPS_OTHER__',
                    '_reorderOnly': true,
                    '_nonEditable': true,
                    '_view': 'anonymous',
                    'main': {
                        '_ref': '${refid}1',
                        '_order': 0,
                        '_title': '__MSG__MY_MEMBERSHIPS__'
                    }
                },
                'contacts': {
                    '_title': '__MSG__MY_CONTACTS__',
                    '_order': 3,
                    '_ref': '${refid}2',
                    '_altTitle': '__MSG__MY_CONTACTS_OTHER__',
                    '_reorderOnly': true,
                    '_nonEditable': true,
                    '_view': 'anonymous',
                    'main': {
                        '_ref': '${refid}2',
                        '_order': 0,
                        '_title': '__MSG__MY_CONTACTS__'
                    }
                }
            },
            '${refid}0': {
                'rows': [
                    {
                        'id': 'id89874',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': 'id5739346',
                                        'type': 'mylibrary'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            '${refid}1': {
                'rows': [
                    {
                        'id': 'id7664610',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': 'id4347509',
                                        'type': 'mymemberships'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            '${refid}2': {
                'rows': [
                    {
                        'id': 'id293415',
                        'columns': [
                            {
                                'width': 1,
                                'elements': [
                                    {
                                        'id': 'id6775571',
                                        'type': 'contacts'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },

        widgets: {
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
                }
            }
        },

        /**
         * Explore (landing page/index.html) configuration
         *
         * oneRow: indicates if there should just be one row and one widget in
         *         that row. Requires widges.oneRowWidget to be set
         * widgets: object that contains the widgets that should be in the
         *          landing page configuration
         *   rightColumn: The widget in the right column
         *   main: The widget on the top left
         *   bottom: The widget under the main widget
         *   oneRowWidget: When oneRow is set to true, this widget will be the
         *                 only widget displayed on the page
         */
        explore : {
            oneRow: false,
            widgets: {
                rightColumn: "recentactivity",
                main: "welcome",
                bottom: "featuredcontent"
            }
        }
    };

    return config;
});
