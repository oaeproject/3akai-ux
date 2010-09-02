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

    // Data
    var directoryJSON = [];

    // Containers
    var directoryTemplateContainer = "#directory_template_container";

    // Templates
    var directoryTemplate = "#directory_template";

    /**
     * Render the directory structure on the page
     */
    var renderDirectoryStructure = function(){
        var obj = {}
        obj.directory = directoryJSON
        $(directoryTemplateContainer).html($.TemplateRenderer(directoryTemplate, obj));
    }

    /**
     * Get a list of nodes representing the directory structure to be rendered
     */
    var getDirectoryStructure = function(){
        // Get directory structure from config file
        for(var i in sakai.config.Directory){
            // Create first level of content
            var temp = new Object();
            temp.name = i;

            // Create second level of content
            temp.secondlevels = [];
            for(var j in sakai.config.Directory[i]){
                var secondlevel = new Object();
                secondlevel.name = j;

                // Create third level of content
                secondlevel.thirdlevels = []
                for (var k in sakai.config.Directory[i][j]){
                    var thirdlevel = new Object();
                    thirdlevel.name = sakai.config.Directory[i][j][k];
                    secondlevel.thirdlevels.push(thirdlevel);
                }

                temp.secondlevels.push(secondlevel);
            }
            directoryJSON.push(temp);
        }
        // Render template with retrieved structure
        renderDirectoryStructure();
    };

    /**
     * Initialize directory page functionality
     */
    var doInit = function(){
        // Get directory structure
        getDirectoryStructure();
    };

    doInit();

};

sakai.api.Widgets.Container.registerForLoad("sakai.directory");