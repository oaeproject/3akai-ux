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
require(["jquery", "sakai/sakai.api.core", "/dev/javascript/search_util.js"], function($, sakai) {
     
    /**
     * @name sakai.searchsakai2
     *
     * @class searchsakai2
     *
     * @description
     * WIDGET DESCRIPTION
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.searchsakai2 = function (tuid, showSettings) {
         
        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var resultsToDisplay = 10;

        var search = "#searchsakai2";

        var searchConfig = {
            search: "#searchsakai2",
            global: {
                button: search + "_button",
                text: search + '_text',
                numberFound: search + '_numberFound',
                pagerClass: ".jq_pager"
            },
            results: {
                container: search + '_results_container',
                template: search + '_results_template'
            },
            facetedConfig: {
                title: "Sakai 2 Search",
                value: "Sakai 2",
                facets: {
                    "all": {
                        "category": "All",
                        "searchurl": "",
                        "searchurlall": ""
                    }
                }
            }
        };

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * This function loop through the site and check if search term is in the description or title
         * @param {String} searchterm The searchterm you want to search trough.
         * @param {string} category The category you want to search in.
         * @param {Object} resultJson The search result json object.
         */
        var filterSearch = function(searchterm, category , resultJson) {
            resultJson.sites = resultJson.sites || [];
            searchtermlower = searchterm.toLowerCase()
            for(var j=0;j<category.sites.length;j++){ 
                var site = category.sites[j];  
                if(searchterm === "*" ) {
                    resultJson.sites.push(site);
                } else if(site.title.toLowerCase().search(searchtermlower) > -1 ) {
                    resultJson.sites.push(site);
                } else if (site.description && site.description.toLowerCase().search(searchtermlower) > -1 ) {
                    resultJson.sites.push(site);
                }
             }

             return resultJson;        
        };

        /** 
         * Update the metadata for the Search Page Facets based on the Sakai 2
         * Site categories that come back.
         */
        var updateFacets = function(jsondata) {
            searchConfig.facetedConfig.facets = {};
            var facets = searchConfig.facetedConfig.facets;
            for (var i = 0; i < jsondata.categories.length; i++) {
                var cat = jsondata.categories[i];
                facets[i] = { category: cat.category, "searchurl": "", "searchurlall": ""};
            }
        }

        /**
         * Get sites list group with categories from back end.
         */
        var getCategories = function(callback){
            var url = "/dev/s23/bundles/sites-categorized.json";
            if (sakai.config.useLiveSakai2Feeds){
                url = "/var/proxy/s23/sitesCategorized.json?categorized=true";
            }
            $.ajax({
                url: url,
                type : "GET",
                dataType: "json",
                success: function(data){
                    callback(data);
                },
                error: function(){
                }
            });
        };

        /////////////////////////
        // Functions           //
        /////////////////////////

        var pager_click_handler = function(pageclickednumber){
            $.bbq.pushState({
                "q": $(searchConfig.global.text).val(),
                "page": pageclickednumber
            }, 0);
        };

        /* 
         * Renders the results using the json as structured in 
         * /var/proxy/s23/sitesCategorized.json?categorized=true
         */
        var renderResults = function(jsondata) {
            var qparams = sakai_global.data.search.getQueryParams();
            console.log(sakai_global.data.search.getQueryParams());
            finaljson = {};
            finaljson.sakai = sakai;
            
            var categoryName = searchConfig.facetedConfig.facets[0].category;
            if (qparams.facet !== undefined) {
                categoryName = searchConfig.facetedConfig.facets[qparams.facet].category;
            }

            var categorydata = {}
            for (var i = 0; i < jsondata.categories.length; i++) {
                if (categoryName === jsondata.categories[i].category) {
                    categorydata = jsondata.categories[i];
                }
            }    

            filterSearch(qparams.q,categorydata,finaljson);
   
            var resultstotal = finaljson.sites.length;
            $(searchConfig.global.numberFound).text("" + resultstotal);
            
            if (resultstotal > resultsToDisplay && qparams.page) {
                var end = qparams.page * resultsToDisplay;
                finaljson.sites = finaljson.sites.slice(end-resultsToDisplay,end);
            }

            $(searchConfig.results.container).html(sakai.api.Util.TemplateRenderer(searchConfig.results.template, finaljson));
            $(searchConfig.results.container).show();


            // Putting Pager Reset down here, otherwise I seem to be having
            // timing issues with different things (facet, pager, etc) getting
            // rendered.
            $(searchConfig.global.pagerClass).pager({
                pagenumber: qparams.page,
                pagecount: Math.ceil(Math.abs(resultstotal) / resultsToDisplay),
                buttonClickCallback: pager_click_handler
            });
            if (resultstotal > resultsToDisplay) {
                $(searchConfig.global.pagerClass).show();
            }
        };

        var doSearch = function(){
            getCategories(function(data) {renderResults(data);});
        };

        /////////////////////////////
        // Settings View functions //
        /////////////////////////////



        ////////////////////
        // Event Handlers //
        ////////////////////


        $(searchConfig.global.text).live("keydown", function(ev){ 
            if (ev.keyCode === 13) {
                $.bbq.pushState({
                    "q": $(searchConfig.global.text).val(),
                    "page": 0
                }, 0);
            }
        });

        $(searchConfig.global.button).live("click", function(ev){
            $.bbq.pushState({
                "q": $(searchConfig.global.text).val(),
                "page": 0
            }, 0);
        });


        /////////////////////////////
        // Initialization function //
        /////////////////////////////
        
        $(window).bind("hashchange", function(ev){
            if ($.bbq.getState("l") === "sakai2sites") {
                doSearch();
            }
        });

        /**
         * Initialization function DOCUMENTATION
         */
        $(window).bind("sakai.search.util.finish", function(ev){
            sakai.api.Widgets.widgetLoader.insertWidgets("searchcontent_widget", false, false, [{
                "845719741363": {
                    "facetedConfig": searchConfig.facetedConfig
                }
            }]);
            doSearch();
        });
        
        // run the initialization function when the widget object loads
        // we're wrapping this up because we need to do an ajax call to Sakai2
        // to determine the categories for the search facet
        getCategories(function(data) {
            updateFacets(data);
            $(window).trigger("sakai.search.util.init");
        });
        
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("searchsakai2");
});
