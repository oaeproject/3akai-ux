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

    sakai_global.search = function() {
        
        var pubdata = {	
        	"structure0": {
                "all": {
                    "_ref": "9574379429432",
                    "_title": "Search All",
                    "main": {
                        "_ref": "9574379429432",
                        "_title": "Search All"
                    }
                },
                "content": {
                    "_ref": "6573920372",
                    "_title": "Search Content",
                    "main": {
                    	"_ref": "6573920372",
                        "_title": "Search Content"
                    }
                },
                "groups": {
                    "_title": "Search Groups",
                    "_ref": "87949372639",
                    "main": {
                        "_ref": "87949372639",
                        "_title": "Search Groups"
                    }
                },
                "people": {
                	"_title": "Search People",
                    "_ref": "49294509202",
                    "main": {
                        "_ref": "49294509202",
                        "_title": "Search People"
                     }
                }
            },
        	"9574379429432": {
        		"page": "Search All"
        	},
        	"6573920372": {
        		"page": "Search Content"
        	},
        	"87949372639": {
        		"page": "Search Groups"
        	},
        	"49294509202": {
        		"page": "Search People"
        	}
        }

        var generateNav = function(){
            $(window).trigger("lhnav.init", [pubdata, {}, {}]);
        }

        var renderEntity = function(){
            $(window).trigger("sakai.entity.init", ["search"]);
        }

        $(window).bind("sakai.entity.ready", function(){
            renderEntity(); 
        });

        $(window).bind("lhnav.ready", function(){
            generateNav();
        });

        renderEntity();
        generateNav();

    };

    sakai.api.Widgets.Container.registerForLoad("search");
});
