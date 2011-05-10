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
     * @name sakai_global.allcategories
     *
     * @class allcategories
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.allcategories = function(tuid, showSettings){

        // Containers
        var $allcategoriesItemsContainer = $("#allcategories_items_container");

        // Templates
        var allcategoriesItemsTemplate = "allcategories_items_template";

        var directory = sakai.config.Directory;
        var allcategoriesToRender = [];


        ////////////////////////////
        // CAROUSEL AND RENDERING //
        ////////////////////////////

        var renderallcategories = function(total){
            $allcategoriesItemsContainer.html(sakai.api.Util.TemplateRenderer(allcategoriesItemsTemplate, {
                "directory": allcategoriesToRender,
                "sakai": sakai,
                "total":total
            }));
        };

        /**
         * Parse the directory structure and extract some information from the featured content
         * @param {Object} success true or false depending on the success of loading the featured content
         * @param {Object} data contains featured content data
         */
        var parseDirectory = function(success, data){
            var count = 0;
            $.each(directory, function(i, toplevel){
                if (data.results[count]){
                    if (data.results[count]["_mimeType"] && data.results[count]["_mimeType"].split("/")[0] == "image") {
                        data.results[count].image = true;
                    }
                    if (data.results[count]["sakai:tags"]) {
                        data.results[count]["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(data.results[count]["sakai:tags"].toString());
                    }
                    data.results[count].haspreview = sakai.api.Content.hasPreview(data.results[count]);
                    toplevel["featuredcontent"] = data.results[count];
                }
                allcategoriesToRender.push(toplevel);
                count++;
            });
            renderallcategories(data.total);
        };

        /**
         * Get a feed of content to display in the carousel
         */
        var getCategoryContent = function(){
            sakai.api.Server.loadJSON("/var/search/pool/all-all.json", parseDirectory, {
                page: 0,
                items: 10,
                sortOn: "_lastModified",
                sortOrder: "desc"
            });
        };


        ////////////////
        // INITIALIZE //
        ////////////////

        var doInit = function(){
            getCategoryContent();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("allcategories");
});