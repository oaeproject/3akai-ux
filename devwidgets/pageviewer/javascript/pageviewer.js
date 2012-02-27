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
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.pageviewer
     *
     * @class pageviewer
     *
     * @description
     * The page viewer widget shows a Sakai Doc in a simplified way with 
     * a custom left hand navigation and no sublevel items
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.pageviewer = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var $rootel = $("#" + tuid);
        var docPath = "";
        var tempDocData = {};
        var docData = {};
        var STORE_PATH = "";

        // Containers
        var $pageViewerContentContainer = $("#pageviewer_content_container");

        // Templates
        var pageViewerContentTemplate = "pageviewer_content_template";


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Renders the page in the widget
         */
        var renderContainer = function(){
            sakai.api.Util.TemplateRenderer(pageViewerContentTemplate, docData, $pageViewerContentContainer, false);
            sakai.api.Widgets.widgetLoader.insertWidgets("pageviewer_content_container", false, STORE_PATH, false);
        };

        /**
         * Parses the document structure before sending it to the renderer
         */
        var parseStructure = function(){
            // Parse rows
            var json = $.parseJSON(tempDocData.structure0);
            $.each(json, function(index, item){
                docData["rows"] = tempDocData[item._ref].rows;
                STORE_PATH = "p/" + docPath + "/" + item._ref + "/";

                // Go through rows, columns and cells and extract any content
                // rows on the page
                $.each(docData["rows"], function(rowIndex, row){
                    if($.isPlainObject(row)){
                        // Columns in the rows
                        $.each(row.columns, function(columnIndex, column){
                            if($.isPlainObject(column)){
                                // Cells in the column
                                $.each(column.elements, function(cellIndex, cell){
                                    if($.isPlainObject(cell)){
                                        if(tempDocData[item._ref][cell.id]){
                                            docData[cell.id] = {};
                                            docData[cell.id][cell.type] = {
                                                "embedmethod": tempDocData[item._ref][cell.id][cell.type].embedmethod,
                                                "sakai:indexed-fields": tempDocData[item._ref][cell.id][cell.type]["sakai:indexed-fields"],
                                                "download": tempDocData[item._ref][cell.id][cell.type].download,
                                                "title": tempDocData[item._ref][cell.id][cell.type].title,
                                                "details": tempDocData[item._ref][cell.id][cell.type].details,
                                                "description": tempDocData[item._ref][cell.id][cell.type].description,
                                                "name": tempDocData[item._ref][cell.id][cell.type].name,
                                                "layout": tempDocData[item._ref][cell.id][cell.type].layout,
                                                "items": {}
                                            };
                                            $.each(tempDocData[item._ref][cell.id][cell.type].items, function(itemsIndex, cellItem){
                                                if(itemsIndex.indexOf("__array__") === 0){
                                                    docData[cell.id][cell.type].items[itemsIndex] = cellItem;
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            });
            docData.template = "all";

            // Render the pages in the widget
            renderContainer();
        };

        /**
         * Fetches the page content
         */
        var fetchPages = function(){
            $.ajax({
                url: "/p/" + docPath + ".infinity.json",
                type: "GET",
                dataType: "JSON",
                success: function(data){
                    tempDocData = data;
                    parseStructure();
                }
            });
        };


        //////////////////////////////
        // Initialization functions //
        //////////////////////////////

        /**
         * Initializes the pageviewer widget
         */
        var doInit = function(){
            fetchPages();
        };

        $(window).unbind("start.pageviewer.sakai");
        $(window).bind("start.pageviewer.sakai", function(ev, data){
            docPath = data.id;
            doInit();
        });

        $(window).trigger("ready.pageviewer.sakai");

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("pageviewer");
});
