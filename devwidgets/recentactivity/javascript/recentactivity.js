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
// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai){

    /**
     * @name sakai_global.recentactivity
     *
     * @class recentactivity
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.recentactivity = function(tuid, showSettings){

        // Templates
        var recentactivityActivityItemTemplate = "recentactivity_activity_item_template";

        // Container
        var $recentactivityActivityContainer = $("#recentactivity_activity_container");

        var data = {
            "items": 10,
            "results": [{
                "jcr:path": "gUXDu7yaa",
                "jcr:name": "gUXDu7yaa",
                "_lastModifiedBy": "admin",
                "sakai:fileextension": ".png",
                "sakai:pooled-content-viewer": ["anonymous", "user1", "everyone"],
                "_id": "UESiMHZjEeCzb0KFwKgABA",
                "_bodyCreatedBy": "admin",
                "sakai:pool-content-created-for": "Bert",
                "sakai:pooled-content-file-name": "Screen shot 2011-05-04 at 13.43.46.png",
                "_bodyCreated": 1304522974282,
                "sakai:copyright": "creativecommons",
                "sakai:permissions": "public",
                "_mimeType": "image/png",
                "_createdBy": "admin",
                "_bodyLastModifiedBy": "admin",
                "sling:resourceType": "sakai/pooled-content",
                "sakai:pooled-content-manager": ["Bert"],
                "_created": 1304522974163,
                "_bodyLastModified": 1304522974282,
                "_lastModified": 1304582144111,
                "sakai:activity-templateid": "default",
                "sakai:activity-actor": "Bert",
                "sakai:activity-type": "comment",
                "sakai:activity-comment": "I think this version is great! Not only does it perfectly describe the work our research group has been doing but it gives a good basic explanation about physics as well!",
                "sakai:activityMessage": "CONTENT_ADDED_COMMENT",
                "sakai:activity-appid": "content",
                "who": {
                    "jcr:path": "/~Bert/public/authprofile",
                    "picture": "{\"name\":\"256x256_tmp1304594049901.jpg\",\"_name\":\"tmp1304594049901.jpg\",\"_charset_\":\"utf-8\",\"selectedx1\":0,\"selectedy1\":0,\"selectedx2\":64,\"selectedy2\":64}",
                    "sling:resourceType": "sakai/user-profile",
                    "basic": {
                        "jcr:path": "/~Bert/public/authprofile/basic",
                        "jcr:name": "basic",
                        "elements": {
                            "jcr:path": "/~Bert/public/authprofile/basic/elements",
                            "lastName": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/lastName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "lastName",
                                "value": "Pareyn"
                            },
                            "sling:resourceType": "nt:unstructured",
                            "email": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/email",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "email",
                                "value": "bp323@caret.cam.ac.uk"
                            },
                            "jcr:name": "elements",
                            "firstName": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/firstName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "firstName",
                                "value": "Bert"
                            }
                        }
                    },
                    "userid": "Bert",
                    "jcr:name": "authprofile",
                    "homePath": "/~Bert"
                }
            }, {
                "jcr:path": "gRwicqouaa",
                "jcr:name": "gRwicqouaa",
                "_lastModifiedBy": "admin",
                "sakai:pooled-content-viewer": ["anonymous", "user1", "everyone"],
                "_id": "UESiMHZjEeCzb0KFwKgABA",
                "_bodyCreatedBy": "admin",
                "sakai:pool-content-created-for": "Bert",
                "sakai:pooled-content-file-name": "Google UK",
                "_bodyCreated": 1304522974282,
                "sakai:copyright": "creativecommons",
                "sakai:permissions": "public",
                "sakai:custom-mimetype": "x-sakai/link",
                "_createdBy": "admin",
                "_bodyLastModifiedBy": "admin",
                "sling:resourceType": "sakai/pooled-content",
                "sakai:pooled-content-manager": ["Bert"],
                "_created": 1304522974163,
                "_bodyLastModified": 1304522974282,
                "_lastModified": 1304582144111,
                "sakai:activity-templateid": "default",
                "sakai:activity-actor": "Bert",
                "sakai:activity-type": "newupload",
                "sakai:activityMessage": "CONTENT_NEW_UPLOAD",
                "sakai:activity-appid": "content",
                "who": {
                    "jcr:path": "/~user1/public/authprofile",
                    "sling:resourceType": "sakai/user-profile",
                    "basic": {
                        "jcr:path": "/~user1/public/authprofile/basic",
                        "jcr:name": "basic",
                        "elements": {
                            "jcr:path": "/~user1/public/authprofile/basic/elements",
                            "lastName": {
                                "jcr:path": "/~user1/public/authprofile/basic/elements/lastName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "lastName",
                                "value": "Testuser"
                            },
                            "sling:resourceType": "nt:unstructured",
                            "email": {
                                "jcr:path": "/~user1/public/authprofile/basic/elements/email",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "email",
                                "value": "bp323@caret.cam.ac.uk"
                            },
                            "jcr:name": "elements",
                            "firstName": {
                                "jcr:path": "/~user1/public/authprofile/basic/elements/firstName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "firstName",
                                "value": "User1"
                            }
                        }
                    },
                    "userid": "user1",
                    "jcr:name": "authprofile",
                    "homePath": "/~user1"
                }
            }, {
                "jcr:path": "gUXDu7yaa",
                "jcr:name": "gUXDu7yaa",
                "_lastModifiedBy": "admin",
                "sakai:fileextension": ".png",
                "sakai:pooled-content-viewer": ["anonymous", "user1", "everyone"],
                "_id": "UESiMHZjEeCzb0KFwKgABA",
                "_bodyCreatedBy": "admin",
                "sakai:pool-content-created-for": "Bert",
                "sakai:pooled-content-file-name": "Screen shot 2011-05-04 at 13.43.46.png",
                "_bodyCreated": 1304522974282,
                "sakai:copyright": "creativecommons",
                "sakai:permissions": "public",
                "_mimeType": "image/png",
                "_createdBy": "admin",
                "_bodyLastModifiedBy": "admin",
                "sling:resourceType": "sakai/pooled-content",
                "sakai:pooled-content-manager": ["Bert"],
                "_created": 1304522974163,
                "_bodyLastModified": 1304522974282,
                "_lastModified": 1304582144111,
                "sakai:activity-templateid": "default",
                "sakai:activity-actor": "Bert",
                "sakai:activity-type": "newversion",
                "sakai:activityMessage": "CONTENT_NEW_VERSION",
                "sakai:activity-appid": "content",
                "who": {
                    "jcr:path": "/~Bert/public/authprofile",
                    "picture": "{\"name\":\"256x256_tmp1304594049901.jpg\",\"_name\":\"tmp1304594049901.jpg\",\"_charset_\":\"utf-8\",\"selectedx1\":0,\"selectedy1\":0,\"selectedx2\":64,\"selectedy2\":64}",
                    "sling:resourceType": "sakai/user-profile",
                    "basic": {
                        "jcr:path": "/~Bert/public/authprofile/basic",
                        "jcr:name": "basic",
                        "elements": {
                            "jcr:path": "/~Bert/public/authprofile/basic/elements",
                            "lastName": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/lastName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "lastName",
                                "value": "Pareyn"
                            },
                            "sling:resourceType": "nt:unstructured",
                            "email": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/email",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "email",
                                "value": "bp323@caret.cam.ac.uk"
                            },
                            "jcr:name": "elements",
                            "firstName": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/firstName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "firstName",
                                "value": "Bert"
                            }
                        }
                    },
                    "userid": "Bert",
                    "jcr:name": "authprofile",
                    "homePath": "/~Bert"
                }
            }, {
                "jcr:path": "gUXDu7yaa",
                "jcr:name": "gUXDu7yaa",
                "_lastModifiedBy": "admin",
                "sakai:fileextension": ".png",
                "sakai:pooled-content-viewer": ["anonymous", "user1", "everyone"],
                "_id": "UESiMHZjEeCzb0KFwKgABA",
                "_bodyCreatedBy": "admin",
                "sakai:pool-content-created-for": "Bert",
                "sakai:pooled-content-file-name": "Screen shot 2011-05-04 at 13.43.46.png",
                "_bodyCreated": 1304522974282,
                "sakai:copyright": "creativecommons",
                "sakai:permissions": "public",
                "_mimeType": "image/png",
                "_createdBy": "admin",
                "_bodyLastModifiedBy": "admin",
                "sling:resourceType": "sakai/pooled-content",
                "sakai:pooled-content-manager": ["Bert"],
                "_created": 1304522974163,
                "_bodyLastModified": 1304522974282,
                "_lastModified": 1304582144111,
                "sakai:activity-templateid": "default",
                "sakai:activity-actor": "Bert",
                "sakai:activity-type": "comment",
                "sakai:activity-comment": "I think this version is great! Not only does it perfectly describe the work our research group has been doing but it gives a good basic explanation about physics as well!",
                "sakai:activityMessage": "CONTENT_ADDED_COMMENT",
                "sakai:activity-appid": "content",
                "who": {
                    "jcr:path": "/~Bert/public/authprofile",
                    "picture": "{\"name\":\"256x256_tmp1304594049901.jpg\",\"_name\":\"tmp1304594049901.jpg\",\"_charset_\":\"utf-8\",\"selectedx1\":0,\"selectedy1\":0,\"selectedx2\":64,\"selectedy2\":64}",
                    "sling:resourceType": "sakai/user-profile",
                    "basic": {
                        "jcr:path": "/~Bert/public/authprofile/basic",
                        "jcr:name": "basic",
                        "elements": {
                            "jcr:path": "/~Bert/public/authprofile/basic/elements",
                            "lastName": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/lastName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "lastName",
                                "value": "Pareyn"
                            },
                            "sling:resourceType": "nt:unstructured",
                            "email": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/email",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "email",
                                "value": "bp323@caret.cam.ac.uk"
                            },
                            "jcr:name": "elements",
                            "firstName": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/firstName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "firstName",
                                "value": "Bert"
                            }
                        }
                    },
                    "userid": "Bert",
                    "jcr:name": "authprofile",
                    "homePath": "/~Bert"
                }
            }, {
                "jcr:path": "gRwicqouaa",
                "jcr:name": "gRwicqouaa",
                "_lastModifiedBy": "admin",
                "sakai:pooled-content-viewer": ["anonymous", "user1", "everyone"],
                "_id": "UESiMHZjEeCzb0KFwKgABA",
                "_bodyCreatedBy": "admin",
                "sakai:pool-content-created-for": "Bert",
                "sakai:pooled-content-file-name": "Google UK",
                "_bodyCreated": 1304522974282,
                "sakai:copyright": "creativecommons",
                "sakai:permissions": "public",
                "sakai:custom-mimetype": "x-sakai/link",
                "_createdBy": "admin",
                "_bodyLastModifiedBy": "admin",
                "sling:resourceType": "sakai/pooled-content",
                "sakai:pooled-content-manager": ["Bert"],
                "_created": 1304522974163,
                "_bodyLastModified": 1304522974282,
                "_lastModified": 1304582144111,
                "sakai:activity-templateid": "default",
                "sakai:activity-actor": "Bert",
                "sakai:activity-type": "newupload",
                "sakai:activityMessage": "CONTENT_NEW_UPLOAD",
                "sakai:activity-appid": "content",
                "who": {
                    "jcr:path": "/~user1/public/authprofile",
                    "sling:resourceType": "sakai/user-profile",
                    "basic": {
                        "jcr:path": "/~user1/public/authprofile/basic",
                        "jcr:name": "basic",
                        "elements": {
                            "jcr:path": "/~user1/public/authprofile/basic/elements",
                            "lastName": {
                                "jcr:path": "/~user1/public/authprofile/basic/elements/lastName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "lastName",
                                "value": "Testuser"
                            },
                            "sling:resourceType": "nt:unstructured",
                            "email": {
                                "jcr:path": "/~user1/public/authprofile/basic/elements/email",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "email",
                                "value": "bp323@caret.cam.ac.uk"
                            },
                            "jcr:name": "elements",
                            "firstName": {
                                "jcr:path": "/~user1/public/authprofile/basic/elements/firstName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "firstName",
                                "value": "User1"
                            }
                        }
                    },
                    "userid": "user1",
                    "jcr:name": "authprofile",
                    "homePath": "/~user1"
                }
            }, {
                "jcr:path": "gUXDu7yaa",
                "jcr:name": "gUXDu7yaa",
                "_lastModifiedBy": "admin",
                "sakai:fileextension": ".png",
                "sakai:pooled-content-viewer": ["anonymous", "user1", "everyone"],
                "_id": "UESiMHZjEeCzb0KFwKgABA",
                "_bodyCreatedBy": "admin",
                "sakai:pool-content-created-for": "Bert",
                "sakai:pooled-content-file-name": "Screen shot 2011-05-04 at 13.43.46.png",
                "_bodyCreated": 1304522974282,
                "sakai:copyright": "creativecommons",
                "sakai:permissions": "public",
                "_mimeType": "image/png",
                "_createdBy": "admin",
                "_bodyLastModifiedBy": "admin",
                "sling:resourceType": "sakai/pooled-content",
                "sakai:pooled-content-manager": ["Bert"],
                "_created": 1304522974163,
                "_bodyLastModified": 1304522974282,
                "_lastModified": 1304582144111,
                "sakai:activity-templateid": "default",
                "sakai:activity-actor": "Bert",
                "sakai:activity-type": "newversion",
                "sakai:activityMessage": "CONTENT_NEW_VERSION",
                "sakai:activity-appid": "content",
                "who": {
                    "jcr:path": "/~Bert/public/authprofile",
                    "picture": "{\"name\":\"256x256_tmp1304594049901.jpg\",\"_name\":\"tmp1304594049901.jpg\",\"_charset_\":\"utf-8\",\"selectedx1\":0,\"selectedy1\":0,\"selectedx2\":64,\"selectedy2\":64}",
                    "sling:resourceType": "sakai/user-profile",
                    "basic": {
                        "jcr:path": "/~Bert/public/authprofile/basic",
                        "jcr:name": "basic",
                        "elements": {
                            "jcr:path": "/~Bert/public/authprofile/basic/elements",
                            "lastName": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/lastName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "lastName",
                                "value": "Pareyn"
                            },
                            "sling:resourceType": "nt:unstructured",
                            "email": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/email",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "email",
                                "value": "bp323@caret.cam.ac.uk"
                            },
                            "jcr:name": "elements",
                            "firstName": {
                                "jcr:path": "/~Bert/public/authprofile/basic/elements/firstName",
                                "sling:resourceType": "nt:unstructured",
                                "jcr:name": "firstName",
                                "value": "Bert"
                            }
                        }
                    },
                    "userid": "Bert",
                    "jcr:name": "authprofile",
                    "homePath": "/~Bert"
                }
            }],
            "total": 1
        }

        var parseActivity = function(data){
            $.each(data.results, function(index, item){
                item.who.name = sakai.api.User.getDisplayName(item.who);
                item["sakai:activityMessage"] = sakai.api.i18n.Widgets.getValueForKey("recentactivity", "", item["sakai:activityMessage"]);
                if (item.who.picture) {
                    item.who.picture = "/~" + item.who.userid + "/public/profile/" + $.parseJSON(item.who.picture).name;
                }
                else {
                    item.who.picture = "/dev/images/user_avatar_icon_48x48.png";
                }
            });
            $recentactivityActivityContainer.html(sakai.api.Util.TemplateRenderer(recentactivityActivityItemTemplate, {
                "data": data,
                "sakai": sakai
            }));
        };

        var fetchActivity = function(){
            parseActivity(data);
        };

        var doInit = function(){
            fetchActivity();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("recentactivity");
});