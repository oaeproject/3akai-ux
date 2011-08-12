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
            "structure0": {}
        };

        for (var i = 0; i < sakai.config.worldTemplates.length; i++){
            var category = sakai.config.worldTemplates[i];
            pubdata.structure0[category.id] = {
                "_order": i,
                "_title": sakai.api.i18n.General.getValueForKey(category.title),
                "_ref": category.id
            };
            pubdata[category.id] = {
                "page": "<div id='widget_selecttemplate_" + category.id + "' class='widget_inline'></div>"
            };
        }

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
