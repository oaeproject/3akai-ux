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
 */

/*global $ */

// Namespaces
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.listgeneral
     *
     * @class listgeneral
     *
     * @description
     * General Lister widget<br />
     * This is a general widget which aims to display an arbitriary number of
     * spaces, sites or content, loading dynamically if the list is very long.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.listgeneral = sakai_global.listgeneral || {};
    sakai_global.data = sakai_global.data || {};
    sakai_global.data.listgeneral = sakai_global.data.listgeneral || {};
    sakai_global.config = sakai_global.config || {};
    sakai_global.config.listgeneral = sakai_global.config.listgeneral || {};
    sakai_global.listgeneral = function(tuid, showSettings){

        // Config defaults
        var default_config = {
            "items": 25,
            "selectable": false
        };

        // Create a config object for this instance
        sakai_global.config.listgeneral[tuid] = default_config;

        // Create a data object for this instance
        sakai_global.data.listgeneral[tuid] = {};
        sakai_global.data.listgeneral[tuid].selected = 0;

        // Reset to defaults
        reset(tuid);

        // Send out an event that says the widget is ready to
        // accept a search query to process and display. This event can be picked up
        // in a page JS code
        $(window).trigger("ready.listgeneral.sakai", [tuid]);
    };


    /**
     * Reset
     * Resets the general lister to a default state
     * @param tuid {String} Unique id of the widget
     * @returns void
     */
    var reset = function(tuid) {

        //Clear results from DOM
        $("#"+tuid+" .listgeneral_search_results").html("");

        // Reset selected items
        sakai_global.data.listgeneral[tuid].selected = {};

    };

    /**
     * Render
     * Renders the general lister with a specified set of data. The function uses
     * a search query initially, then does the paginating and subsequent requests
     * for data automatically
     * @param tuid {String} Unique id of the widget
     * @param iSearchQuery {Array} A Sakai search queries
     * @param iConfig {Object} Optional config overrides
     * @returns void
     */
    $(window).bind("ready.listgeneral.sakai", function(e, tuid, iSearchQuery, iConfig) {

        // Merge user defined config with defaults
        for (var element in iConfig) {
            if (iConfig.hasOwnProperty(element)) {
                sakai_global.config.listgeneral[tuid][element] = iConfig[element];
            }
        }

        // Parse search query
        var searchQuery = [];
        for (var i = 0, il = iSearchQuery.length; i < il; i++) {

            var searchQueryObject = {};
            var main_parts = iSearchQuery[i].split("?");
            searchQueryObject.url = main_parts[0];
            var args = main_parts[1].split("&");
            for (var j = 0, jl = args.length; j < jl; j++) {
                var kv_pair = args[j].split("=");
                searchQueryObject[kv_pair[0]] = kv_pair[1];
            }

            // Alter search query according to config
            searchQueryObject.items = sakai_global.config.listgeneral[tuid].items[i];

            // Add hash to search query in case it's not there to prevent caching
            if (!searchQueryObject["_"]) {
                searchQueryObject["_"] = (Math.random() * 1000000000000000000);
            }

            // Push search query into the array of queries
            searchQuery.push(searchQueryObject);

        }
        // Set up sorting drop-down according to the type of list
        $(".listgeneral_sortview").prepend($(".listgeneral_sorttemplate_" + sakai_global.config.listgeneral[tuid].type).html());


        // Sorting
        if (!sakai_global.config.listgeneral[tuid].sortOn) {
            sakai_global.config.listgeneral[tuid].sortOn = $("#" + tuid + " .listgeneral_sorttemplate_" + sakai_global.config.listgeneral[tuid].type+" option[default='true']").attr("value");
        }
        if (!sakai_global.config.listgeneral[tuid].sortOrder) {
            sakai_global.config.listgeneral[tuid].sortOrder = $("#" + tuid + " .listgeneral_sorttemplate_" + sakai_global.config.listgeneral[tuid].type+" option[default='true']").attr("data-sortorder");
        }

        // View mode
        sakai_global.config.listgeneral[tuid].viewMode = $("#" + tuid + " .listgeneral_sortview_view option[default='true']").attr("value");


        // Wire up sort button
        $("#" + tuid + " .listgeneral_sort_button").bind("click", function(e) {

            // Get sorting flag from the dropdown
            sakai.sakai_global.config.widgets.listgeneral[tuid].sortOn = $("#" + tuid + " .listgeneral_sortview_sort option:selected").attr("value");
            sakai_global.config.listgeneral[tuid].sortOrder = $("#" + tuid + " .listgeneral_sortview_sort option:selected").attr("data-sortorder");

            // Get view mode from the dropdown
            sakai_global.config.listgeneral[tuid].viewMode =  $("#" + tuid + " .listgeneral_sortview_view option:selected").attr("value");

            // Reset everything
            reset(tuid);

            // Get new results with new sorting
            addPage(tuid, 0, searchQuery);
        });


        // Deal with non logged in users - remove favourite select options


        // Render the first page of results
        addPage(tuid, 0, searchQuery);

    });

    /**
     * addPage
     * Adds another page of search result to the People lister's result list
     * @param tuid {String} The instance ID of a widget
     * @pageNumber {Int} The page we want to load
     * @searchQuery {Array} An array containing objects of the search query elements
     * @returns void
     */
    addPage = function(tuid, pageNumber, searchQuery) {

        // Store number of requests we need to process to make sure we process all at the end of the ajax requests
        sakai_global.data.listgeneral[tuid].numOfQueriesToProcess = searchQuery.length;

        // Create storage for aggregate results
        sakai_global.data.listgeneral[tuid].aggregateResults = {};
        sakai_global.data.listgeneral[tuid].aggregateResults.results = [];


        var handleSuccess = function(rawData) {
            // Keep track of queries which needs to be processed
            sakai_global.data.listgeneral[tuid].numOfQueriesToProcess--;

            for (var j = 0, jl = rawData.results.length; j < jl; j++) {

                // Make code more legible, namespace additional info
                var result = rawData.results[j];
                result.listgeneral = {};

                // Decorating / sanitising the result objects with convenience info for rendering

                // Sites, pages, spaces
                if (result.type === "sakai/page" ||
                    result.type === "sakai/pagecontent" ||
                    result["sling:resourceType"] === "sakai/site" ||
                    (result.site && result.site["sling:resourceType"] === "sakai/site") ||
                    result["sling:resourceType"] === "sakai/space" ||
                    (result.space && result.space["sling:resourceType"] === "sakai/space")
                    ) {

                    // Add type property
                    if (result.type === "sakai/space") {
                        result.listgeneral.resultType = "spaces";
                    } else {
                        result.listgeneral.resultType = "sites";
                    }

                    // Try to get name
                    if (result.site && result.site.name) {
                        result.listgeneral.name = result.site.name;
                    } else if (result.name) {
                        result.listgeneral.name = result.name;
                    } else {
                        result.listgeneral.name = result["_path"];
                    }

                    // Get description
                    if (result.description) {
                        result.listgeneral.description = result.description;
                    } else if (result.site && result.site.description) {
                        result.listgeneral.description = result.site.description;
                    } else if (result.excerpt) {
                        result.listgeneral.description = $("" + result.excerpt + "").text().replace(/<[^>]*>/g, "");
                    } else {
                        result.listgeneral.description = "";
                    }


                    // Create page path if the hit is a page content
                    if (result.data && result.data["sling:resourceType"] === "sakai/pagecontent") {
                        var pagePath = "";
                        pagePath = result.data["sling:resourceType"].replace(/\/_pages/g, "");
                        pagePath = pagePath.replace(/\/pageContent/g, "");
                        pagePath = pagePath.replace(/\//g,"");
                        pagePath = result.site["_path"] + "#" + pagePath;
                        result.listgeneral.pagePath = pagePath;
                    } else {
                        // Or just use site path if it's site root
                        result.listgeneral.pagePath = result["_path"];
                    }

                    // Eval picture object if exists either in site or in main result. If not use a default one.
                    if (result.picture) {
                        result.picture = $.parseJSON(result.picture);
                        result.listgeneral.avatar = result["_path"] + "/" + result.picture.name;
                    } else if (result.site && result.site.picture) {
                        result.site.picture = $.parseJSON(result.site.picture);
                        result.listgeneral.avatar = result.site["_path"] + "/" + result.site.picture.name;
                    } else if (result.space && result.space.picture) {
                        result.space.picture = $.parseJSON(result.space.picture);
                        result.listgeneral.avatar = result.space["_path"] + "/" + result.space.picture.name;
                    } else {
                        result.listgeneral.avatar = "/dev/images/mimetypes/html.png";
                    }

                }

                // Content
                if (result["_mimeType"] && result["jcr:primaryType"] === "nt:file") {

                    // Add type property
                    result.listgeneral.resultType = "content";

                    // Get mimetype icon and human readable mimetype description
                    if (sakai.config.MimeTypes[result["_mimeType"]]) {
                        result.listgeneral.avatar = sakai.config.MimeTypes[result["_mimeType"]].URL;
                        result.listgeneral.mimeTypeDescripton = sakai.api.i18n.General.getValueForKey(sakai.config.MimeTypes[result["_mimeType"]].description);
                    } else {
                        result.listgeneral.avatar = "/dev/images/mimetypes/empty.png";
                        result.listgeneral.mimeTypeDescripton = sakai.api.i18n.General.getValueForKey(sakai.config.MimeTypes.other.description);
                    }

                    // Description
                    if (result.description) {
                        result.listgeneral.description = result.description;
                    } else {
                        result.listgeneral.description = "";
                    }

                }


                // People
                if (result["sling:resourceType"] === "sakai/user-profile") {

                    // Add type property
                    result.listgeneral.resultType = "people";

                    // Avatar
                    if (result.picture) {
                        result.picture = $.parseJSON(result.picture);
                        result.listgeneral.avatar = "/~" + sakai.api.Util.urlSafe(result["rep:userId"]) + "/public/profile/" + result.picture.name;
                    } else {
                        result.listgeneral.avatar = sakai.config.URL.USER_DEFAULT_ICON_URL;
                    }

                    // University role
                    if (result.basic) {
                        result.basic = $.parseJSON(result.basic);
                        //result.listgeneral.role = result.basic.unirole;
                    } else {
                        result.listgeneral.role = "";
                    }

                    // Description
                    if (result.aboutme) {
                        result.aboutme = $.parseJSON(result.aboutme);
                        result.listgeneral.description = result.aboutme.aboutme;
                    } else {
                        result.listgeneral.description = "";
                    }


                }


                // Add result to the collection of aggregate results
                sakai_global.data.listgeneral[tuid].aggregateResults.results.push(rawData.results[j]);
            }

            // If this is the last search query to process
            if (sakai_global.data.listgeneral[tuid].numOfQueriesToProcess === 0) {
                sortAndDisplay(tuid, pageNumber);
            }


        };

        var handleError = function(xhr, status, thrown) {
            // Keep track of queries which needs to be processed
            sakai_global.data.listgeneral[tuid].numOfQueriesToProcess--;

            if (sakai_global.data.listgeneral[tuid].numOfQueriesToProcess === 0) {
                sortAndDisplay(tuid, pageNumber);
            }

            // Log error in console
            debug.error("listgeneral.js: Error in processing a search request!");
        };

        var handleMoreButtonClick = function(e) {
            $(this).remove();
            addPage(tuid, pageNumber + 1, searchQuery);
        };
        // Create new container for the bit we load. This is then appended to the
        // main container
        for (var i=0, il = searchQuery.length; i < il; i++) {

            // Add relevant config elements to the search query
            searchQuery[i].page = pageNumber;
            searchQuery[i].sortOn = sakai_global.config.listgeneral[tuid].sortOn;
            searchQuery[i].sortOrder = sakai_global.config.listgeneral[tuid].sortOrder;

            // Construct search query
            var sq = searchQuery[i].url + "?";
            for (var e in searchQuery[i]) {
                if (searchQuery[i].hasOwnProperty(e) && e !== "url") {
                    sq += e + "=" + searchQuery[i][e] + "&";
                }
            }
            sq = sq.substring(0, sq.length-1);


            // Fire search requests
            $.ajax({
                url: sq,
                type: "GET",
                success: handleSuccess,
                error: handleError
            });

            // Display empty new container with loading anim
            $("#" + tuid + " .listgeneral_search_results").append($("<div class=\"listgeneral_resultpage loadinganim\" data-pagenumber=\"" + pageNumber + "\"></div>"+$("#" + tuid + " .listgeneral_more_results_template").html()));

            // Wire up more results button
            $("#" + tuid + " .listgeneral_more_button").bind("click", handleMoreButtonClick);

        }

    };


    /**
     * sortAndDsiplay
     * Displays the search results by rendering the appropriate template
     * @param tuid {String} The instance ID of the widget
     * @param pageNumber {Int} The page number we wuld like to render
     */
    sortAndDisplay = function(tuid, pageNumber) {

        var $resultPage = $("#" + tuid + " .listgeneral_resultpage[data-pagenumber='"+pageNumber+"']");

        // No sorting of aggregate results for now...

        // If there are no search results, display message template
        if (sakai_global.data.listgeneral[tuid].aggregateResults.results.length === 0) {

            $("#" + tuid + " .listgeneral_more_button").hide();
            $resultPage.removeClass("loadinganim").html($("#"+tuid+" .listgeneral_noresults_template").html());

        } else {

            // Render the results data template
            var newPageHTML = sakai.api.Util.TemplateRenderer("#" + tuid + " .listgeneral_content_template", sakai_global.data.listgeneral[tuid].aggregateResults);

            // Add rendered result HTML to DOM and set viewmode class
            $resultPage.removeClass("loadinganim").addClass("listgeneral_result_viewmode_" + sakai_global.config.listgeneral[tuid].viewMode).append(newPageHTML);
        }
    };




    sakai.api.Widgets.widgetLoader.informOnLoad("listgeneral");
});
