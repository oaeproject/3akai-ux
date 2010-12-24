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

/*global $ */

var sakai = sakai || {};

/**
 * @name sakai.listpeopleinnode
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
sakai.listpeopleinnode = function(tuid, showSettings){

    // Containers
    var $listpeopleinnodeTitle = $("#listpeopleinnode_title");
    var $listpeopleinnodePeopleContainer = $("#listpeopleinnode_people_container");

    // Templates
    var listpeopleinnodeTitleTemplate = "listpeopleinnode_title_template";
    var listpeopleinnodePeopleTemplate = "listpeopleinnode_people_template";

    // Elements
    var $listpeopleinnodeSeeAllLink = $("#listpeopleinnode_see_all_link a");
    var $listpeopleinnodeAjaxLoader = $("#listpeopleinnode_ajax_loader");

    var searchQuery = "/dev/search_people.html#tag=${query}";

    /**
     * 
     * @param {Object} results
     * @param {Object} success
     */
    var renderResults = function(results, success){
        $listpeopleinnodeAjaxLoader.hide();
        if(success){
            $listpeopleinnodePeopleContainer.html($.TemplateRenderer(listpeopleinnodePeopleTemplate, results));
        }else{
            
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
            q: selected,
            sortOn: "public/authprofile/basic/elements/firstName/@value",
            sortOrder: "descending"
        };

        $.ajax({
            url: sakai.config.URL.SEARCH_USERS,
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

    $(window).bind("sakai-directory-selected", function(ev, selected){
        $listpeopleinnodePeopleContainer.text("");
        $listpeopleinnodeAjaxLoader.show();
        // Set title
        var obj = {
            "location" : selected.split("/")[selected.split("/").length - 1]
        };
        $listpeopleinnodeTitle.text($.TemplateRenderer(listpeopleinnodeTitleTemplate, obj));
        $listpeopleinnodeSeeAllLink[0].href = searchQuery.replace("${query}", "directory/" + selected);
        searchUsersInNode(selected);
    });
};

sakai.api.Widgets.widgetLoader.informOnLoad("listpeopleinnode");
