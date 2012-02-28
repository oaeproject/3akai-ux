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
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

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

        var $rootel = $('#' + tuid);
        var docPath = '';
        var tempDocData = {};
        var tempItem = false;
        var docData = {};
        var storePath = '';
        var selectedPage = '';

        // Containers
        var $pageViewerContentContainer = $('#pageviewer_content_container', $rootel);
        var $pageViewerLHNavContainer = $("#pageviewer_lhnav_container", $rootel);

        // Templates
        var pageViewerContentTemplate = 'pageviewer_content_template';
        var pageViewerLHNavTemplate = 'pageviewer_lhnav_template';


        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Renders the page in the widget
         */
        var renderContainer = function() {
            sakai.api.Util.TemplateRenderer(pageViewerContentTemplate, {
                data: docData,
                selectedPage: selectedPage
            }, $pageViewerContentContainer, false);
            sakai.api.Widgets.widgetLoader.insertWidgets('pageviewer_content_container', false, storePath, false);
        };

        /**
         * Renders the left hand navigation in the pageviewer widget
         */
        var renderNavigation = function() {
            sakai.api.Util.TemplateRenderer(pageViewerLHNavTemplate, {
                data: docData,
                selectedPage: selectedPage
            }, $pageViewerLHNavContainer, false);

            $pageViewerLHNavContainer.show();

            $(".pageviewer_lhnav_item button", $rootel).on('click', selectPage);
            $(".pageviewer_lhnav_item:first button", $rootel).click();
        };

        /**
         * Parse cells in a column in a row on a page
         * @param cellIndex {Object} Index of the cell
         * @param cell {Object} data for a cell in a column
         */
        var parseCells = function(cellIndex, cell) {
            if ($.isPlainObject(cell)) {
                if (tempDocData[tempItem._ref][cell.id]) {
                    docData[tempItem._ref][cell.id] = {};
                    if (cell.type !== "htmlblock" && cell.type !== "pagetitle") {
                        docData[tempItem._ref][cell.id][cell.type] = {
                            'embedmethod': tempDocData[tempItem._ref][cell.id][cell.type].embedmethod,
                            'sakai:indexed-fields': tempDocData[tempItem._ref][cell.id][cell.type]['sakai:indexed-fields'],
                            'download': tempDocData[tempItem._ref][cell.id][cell.type].download,
                            'title': tempDocData[tempItem._ref][cell.id][cell.type].title,
                            'details': tempDocData[tempItem._ref][cell.id][cell.type].details,
                            'description': tempDocData[tempItem._ref][cell.id][cell.type].description,
                            'name': tempDocData[tempItem._ref][cell.id][cell.type].name,
                            'layout': tempDocData[tempItem._ref][cell.id][cell.type].layout,
                            'items': {}
                        }
                        if (tempDocData[tempItem._ref][cell.id][cell.type].items) {
                            $.each(tempDocData[tempItem._ref][cell.id][cell.type].items, function(itemsIndex, cellItem) {
                                if (itemsIndex.indexOf('__array__') === 0) {
                                    docData[tempItem._ref][cell.id][cell.type].items[itemsIndex] = cellItem;
                                }
                            });
                        }
                    } else {
                        docData[tempItem._ref][cell.id][cell.type] = {
                            'content': tempDocData[tempItem._ref][cell.id][cell.type].content
                        }
                    }
                }
            }
        };

        /**
         * Parse columns in a row on a page
         * @param columnIndex {Object} Index of the column
         * @param column {Object} data for a column
         */
        var parseColumns = function(columnIndex, column) {
            if ($.isPlainObject(column)) {
                $.each(column.elements, parseCells);
            }
        };

        /**
         * Parse rows on a page
         * @param rowIndex {Object} Index of the row
         * @param row {Object} data for a row
         */
        var parseRows = function(rowIndex, row) {
            if ($.isPlainObject(row)) {
                $.each(row.columns, parseColumns);
            }
        };

        /**
         * Parses the document structure before sending it to the renderer
         */
        var parseStructure = function() {
            var json = $.parseJSON(tempDocData.structure0);
            var pageCount = 0;
            $.each(json, function(index, item) {
                if ($.isPlainObject(item)) {
                    tempItem = item;
                    if (!selectedPage) {
                        selectedPage = tempItem._ref;
                    }
                    docData[tempItem._ref] = {};
                    docData[tempItem._ref].pageTitle = item._title;
                    docData[tempItem._ref]['rows'] = tempDocData[tempItem._ref].rows;
                    storePath = 'p/' + docPath + '/' + tempItem._ref + '/';

                    // Go through rows, columns and cells and extract any content
                    $.each(docData[tempItem._ref]['rows'], parseRows);

                    pageCount++;
                }
            });
            docData.template = 'all';

            // Render the pages and navigation in the widget
            if (pageCount > 1) {
                renderNavigation();
            } else {
                renderContainer();
            }
        };

        /**
         * Selects a page from the left hand navigation
         */
        var selectPage = function() {
            $rootel.find('.tinyMCE').each(function() {
                tinyMCE.execCommand( 'mceRemoveControl', false, $(this).attr('id') );
            });
            var $li = $(this).parent();
            $(".pageviewer_lhnav_item", $rootel).removeClass("selected");
            $li.addClass("selected");
            selectedPage = $li.attr("data-index");
            storePath = 'p/' + docPath + '/' + selectedPage + '/';
            renderContainer();
        };

        /**
         * Fetches the page content
         */
        var fetchPages = function() {
            $.ajax({
                url: "/p/" + docPath + ".infinity.json",
                success: function(data) {
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
        var doInit = function() {
            fetchPages();
        };

        $(window).off('start.pageviewer.sakai');
        $(window).on('start.pageviewer.sakai', function(ev, data) {
            docPath = data.id;
            doInit();
        });

        $(window).trigger('ready.pageviewer.sakai');

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('pageviewer');
});
