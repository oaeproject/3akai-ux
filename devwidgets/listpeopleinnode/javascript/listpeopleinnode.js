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

/*
 * Dependencies
 *
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.threedots.js (ThreeDots)
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.listpeopleinnode
     *
     * @class listpeopleinnode
     *
     * @description
     * Initialize the listpeopleinnode widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.listpeopleinnode = function(tuid, showSettings){

        // Containers
        var $listpeopleinnodeTitle = $("#listpeopleinnode_title");
        var $listpeopleinnodePeopleContainer = $("#listpeopleinnode_people_container");

        // Templates
        var listpeopleinnodeTitleTemplate = "listpeopleinnode_title_template";
        var listpeopleinnodePeopleTemplate = "listpeopleinnode_people_template";

        // Elements
        //var $listpeopleinnodeAjaxLoader = $("#listpeopleinnode_ajax_loader");

        var searchQuery = "/search/people#tag=${query}";

        var listpeopleinnodeEllipsisContainer = ".listinpeopleinnode_ellipsis_container";
        /**
         * 
         * @param {Object} results
         * @param {Object} success
         */
        var renderResults = function(results, success){
            //$listpeopleinnodeAjaxLoader.hide();
            if(success){
                results.sakai = sakai;
                $listpeopleinnodePeopleContainer.html(sakai.api.Util.TemplateRenderer(listpeopleinnodePeopleTemplate, results));
            }
        };

        /**
         * 
         * @param {Object} selected
         */
        var searchUsersInNode = function(selected){
            var params = {
                page: 0,
                items: 10,
                sortOrder: "desc"
            };

            searchURL = sakai.config.URL.SEARCH_USERS;
            if (selected === "*" || selected === "**") {
                searchURL = sakai.config.URL.SEARCH_USERS_ALL;
            } else {
                params['q'] = selected;
            }
            $.ajax({
                url: searchUrl,
                cache: false,
                data: params,
                success: function(data){
                    if (typeof(data) === 'string') {
                        data = $.parseJSON(data);
                    }

                for(var p in data.results){
                    if(data.results[p].hasOwnProperty("picture")){
                        data.results[p].picture = $.parseJSON(data.results[p].picture);
                    }
                }
                
                data.selected = selected;

                    renderResults(data, true);
                },
                error: function(xhr, textStatus, thrownError){
                    var data = {};
                    renderResults(data, false);
                }
            });
        };

        //////////////////////////////
        // Initialization functions //
        //////////////////////////////

        $(window).bind("selected.directory.sakai", function(ev, selected){
            $listpeopleinnodePeopleContainer.text("");

            // Set title
            var obj = {
                "location" : sakai.api.Util.getValueForDirectoryKey(selected.split("/")[selected.split("/").length - 1])
            };

            // Apply threedots to title
            var body = $.trim(sakai.api.Util.TemplateRenderer(listpeopleinnodeTitleTemplate, obj));
            var ellipsis = sakai.api.Util.applyThreeDots(body, $("#listpeopleinnode_title").width() - 30, {max_rows: 1,whole_word: false});
            $listpeopleinnodeTitle.html(ellipsis);

            searchUsersInNode(selected);
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("listpeopleinnode");
});
