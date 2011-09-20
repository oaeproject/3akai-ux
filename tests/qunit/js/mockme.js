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
 
/**
 * MockMe - a mock for /system/me
 *
 * Not included by default in sakai_qunit_lib as the integration tests need a real response from /system/me
 */
require(["jquery", "mockjax"], function($){
    if ($ && $.mockjax) {
        $.mockjax({
            url: "/system/me?_charset_=utf-8",
            responseText:{
                "user": {
                    "anon": true,
                    "subjects": [],
                    "superUser": false
                },
                "profile": {
                    "basic": {
                        "access": "everybody",
                        "elements": {
                            "lastName": {
                                "value": "User"
                            },
                            "email": {
                                "value": "anon@sakai.invalid"
                            },
                            "firstName": {
                                "value": "Anonymous"
                            }
                        }
                    },
                    "rep:userId": "anonymous"
                },
                "messages": {
                    "unread": 0
                },
                "contacts": {},
                "groups": []
            }
        });
    }
});