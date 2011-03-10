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

    sakai_global.directory = function(){

        /**
         * Initialize directory page functionality
         */
        var doInit = function(){

            // bind events
            bindEvents();
        };

        sakai_global.directory.getIsDirectory = function(){
            return true;
        };

        var handleHashChange = function(e, node) {
            var id = node || $.bbq.getState("location");
            if (id) {
                // get directory json object called method from browsedirectory widget
                var nodeId = id.split("/").reverse().shift();
                var directoryJson = sakai_global.browsedirectory.getDirectoryNodeJson(nodeId);

                // prepare result json
                var resultJson = {};
                resultJson.title = directoryJson[0].data;
                resultJson.icon = directoryJson[0].attr["data-url"];
                resultJson.id = directoryJson[0].attr["id"];

                // render directory information
                $(".directory_info").html(sakai.api.Util.TemplateRenderer("#directory_template", resultJson));
            }
        };

        /**
         * Add event bindings for the jstree pages navigation tree
         */
        var bindEvents = function() {
            // bind hashchange event.
            // that event is triggered when directory in browsedirectory widget is selected.
            $(window).bind("hashchange nohash.browsedirectory.sakai", handleHashChange);
        };

        doInit();

    };

    sakai.api.Widgets.Container.registerForLoad("directory");
});
