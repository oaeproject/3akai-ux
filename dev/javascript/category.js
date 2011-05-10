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

    sakai_global.category = sakai_global.category || {};

    sakai_global.category = function() {

        var pubdata = {};

        var generateNav = function(navData){
            pubdata = {
                "structure0": {}
            }
            
            pubdata["structure0"][navData.id] = {
                "_id": navData.id,
                "_order": 0,
                "_ref": Math.floor(Math.random() * 999999999),
                "_title": navData.title
            }

            var count = 0;
            $.each(navData.children, function(index, item){
                var rnd = Math.floor(Math.random() * 999999999);
                pubdata["structure0"][navData.id][index] = {
                    "_ref": rnd,
                    "_order": count,
                    "_title": item.title,
                    "main": {
                        "_ref": rnd,
                        "_order": 0,
                        "_title": item.title
                    }
                };
                count++;
            });

            $(window).trigger("lhnav.init", [pubdata, {}, {}]);
        };

        $(window).bind("lhnav.ready", function(){
            var category = $.bbq.getState("tag");
            if(!category){
                category = $.bbq.getState("l").split("/")[0];
            }
            sakai.config.Directory[category].id = category;
            generateNav(sakai.config.Directory[category]);
        });

    };

    sakai.api.Widgets.Container.registerForLoad("category");
});
