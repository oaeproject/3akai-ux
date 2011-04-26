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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.createnew = function() {

        var pubdata = {
            "structure0": {
                "group": {
                    "_ref": "9574379429432",
                    "_title": "Group",
                    "main": {
                        "_ref": "9574379429432",
                        "_title": "Group"
                    }
                },
                "categories": {
                    "_ref": "6573920372",
                    "_title": "Categories",
                    "courses": {
                        "_ref": "1234567890",
                        "_title": "Courses"
                    },
                    "reseach": {
                        "_title": "Research",
                        "_ref": "87949372639"
                    },
                    "other": {
                        "_title": "Other",
                        "_ref": "49294509202"
                    }
                }
            },
            "9574379429432": {
                "page": "<div id='widget_newcreategroup_2024634737' class='widget_inline'></div><div id='widget_addpeople' class='widget_inline'></div>"
            },
            "1234567890": {
                "page": "Categories Overview"
            },
            "6573920372": {
                "page": "Courses"
            },
            "87949372639": {
                "page": "Research"
            },
            "49294509202": {
                "page": "Other"
            }
        };

        var generateNav = function(){
            $(window).trigger("lhnav.init", [pubdata, {}, {}]);
        };

        var renderCreateGroup = function(){
            $(window).trigger("sakai.newcreategroup.init");
        };

        $(window).bind("lhnav.ready", function(){
            generateNav();
        });

        $(window).bind("newcreategroup.ready", function(){
            renderCreateGroup();
        });

        generateNav();
        
    };

    sakai.api.Widgets.Container.registerForLoad("createnew");
});
