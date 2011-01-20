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
/*global $, fluid, window */

var sakai = sakai || {};

sakai.directory = function(){

    /**
     * Initialize directory page functionality
     */
    var doInit = function(){
        
        // bind events
        bindEvents();
    };

    sakai.directory.getIsDirectory = function(){
        return true;
    };

    /**
     * Add event bindings for the jstree pages navigation tree
     */
    var bindEvents = function() {
        // bind sakai-directory-selected event.
        // that event is triggered when directory in browsedirectory widget is selected.
        $(window).bind("sakai-directory-selected", function(e, id){
            
            // get directory json object called method from browsedirectory widget
            var nodeId = id.split("/").reverse().shift();
            var directoryJson = sakai.browsedirectory.getDirectoryNodeJson(nodeId);

            // prepare result json
            var resultJson = {};
            resultJson.title = directoryJson[0].data;
            resultJson.icon = directoryJson[0].attr["data-url"];
            resultJson.id = directoryJson[0].attr["id"];

            // render directory information 
            $(".directory_info").html($.TemplateRenderer("#directory_template", resultJson));
        });
    };

    doInit();

};

sakai.api.Widgets.Container.registerForLoad("sakai.directory");
