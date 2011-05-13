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
                    "_ref": "id9574379429432",
                    "_order": 0,
                    "_title": "All",
                    "main": {
                        "_ref": "id9574379429432",
                        "_order": 0,
                        "_title": "All"
                    }
                },
                "content": {
                    "_ref": "id6573920372",
                    "_order": 1,
                    "_title": "Content",
                    "main": {
                        "_ref": "id6573920372",
                        "_order": 0,
                        "_title": "Content"
                    }
                },
                "people": {
                    "_title": "People",
                    "_ref": "id49294509202",
                    "_order": 2,
                    "main": {
                        "_ref": "id49294509202",
                        "_order": 0,
                        "_title": "People"
                     }
                }
            },
            "id9574379429432": {
                "page": "<div id='widget_searchall' class='widget_inline'></div>"
            },
            "id6573920372": {
                "page": "<div id='widget_searchcontent' class='widget_inline'></div>"
            },
            "id49294509202": {
                "page": "<div id='widget_searchpeople' class='widget_inline'></div>"
            }
        };
        
        for (var c = 0; c < sakai.config.worldTemplates.length; c++) {
            var category = sakai.config.worldTemplates[c];
            var refId = sakai.api.Util.generateWidgetId();
            var title = sakai.api.i18n.General.getValueForKey(category.title);
            pubdata.structure0[category.id] = {
                "_title": title,
                "_ref": refId,
                "_order": (c + 3),
                "main": {
                    "_ref": refId,
                    "_order": 0,
                    "_title": title
                }
            }
            var searchWidgetId = sakai.api.Util.generateWidgetId();
            pubdata[refId] = {
                "page": "<div id='widget_searchgroups_" + searchWidgetId + "' class='widget_inline'></div>"
            }
            pubdata[searchWidgetId] = {
                "category": category.id
            }
        }
        
        var generateNav = function(){
            $(window).trigger("lhnav.init", [pubdata, {}, {}]);
        };

        var renderEntity = function(){
            $(window).trigger("sakai.entity.init", ["search"]);
        };

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
