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

/*global $, Config, History, mainSearch, sakai */


sakai.search = function() {


    //////////////////////////
    //    Config variables    //
    //////////////////////////

    var resultsToDisplay = 10;
    var searchterm = "";
    var tagterm = "";
    var currentpage = 0;
    var currentfacet = "";

    // Add Group Button links
    var createGroupContainer = "#creategroupcontainer";
    var searchAddGroupButton = ".search_add_group_button";

    var searchAjaxCall = false;

    // Search URL mapping
    var searchURLmap = {
        allgroups : sakai.config.URL.SEARCH_GROUPS,
        visiblegroups : sakai.config.URL.SEARCH_GROUPS,
        managergroups : sakai.config.URL.GROUPS_MANAGER,
        membergroups : sakai.config.URL.GROUPS_MEMBER
    };

    // CSS IDs
    var search = "#search";

    var searchConfig = {
        search : "#search",
        global : {
            resultTemp : search + "_result_temp",
            button : search + "_button",
            text  :search + '_text',
            numberFound : search + '_numberFound',
            searchTerm : search + "_mysearchterm",
            tagTerm : search + "_mytagterm",
            searchBarSelectedClass : "search_bar_selected"
        },
        filters : {
            filter : search + "_filter",
            sites : {
                filterSites : search + "_filter_my_sites",
                filterSitesTemplate : "search_filter_my_sites_template",
                ids : {
                    entireCommunity : '#search_filter_community',
                    allMySites : '#search_filter_all_my_sites',
                    specificSite : '#search_filter_my_sites_'
                },
                values : {
                    entireCommunity :'entire_community',
                    allMySites : "all_my_sites"
                }
            }
        },
        tabs : {
            all : "#tab_search_all",
            content : "#tab_search_content",
            people : "#tab_search_people",
            sites : "#tab_search_sites"
        },
        results : {
            container : search + '_results_container',
            header : search + '_results_header',
            tagHeader : search +  '_results_tag_header',
            template : 'search_results_template'
        },
        facetedConfig : {
            title : "Refine your search",
            value : "Groups",
            facets:{
                    "all": {
                        "category": "All sites",
                        "searchurl": searchURLmap.allgroups
                    }
                }
        }
    };


    var getCategories = function(){
        var newjson = {
                        "principal":"admin",
                        "categories":
                        [
                            {
                                "category":"i18n_moresite_01_all_sites",
                                "sites":
                                [
                                    {
                                        "title":"Administration Workspace",
                                        "id":"!admin",
                                        "url":"http://localhost/portal/site/!admin",
                                        "description":"Administration Workspace"
                                    },
                                    {
                                        "title":"Citations Admin",
                                        "id":"citationsAdmin",
                                        "url":"http://localhost/portal/site/citationsAdmin"
                                    },
                                    {
                                        "title":"Portfolio Admin",
                                        "id":"PortfolioAdmin",
                                        "url":"http://localhost/portal/site/PortfolioAdmin",
                                        "description":"Site for portfolio administration"
                                    },
                                    {
                                        "title":"mercury site",
                                        "id":"mercury",
                                        "url":"http://localhost/portal/site/mercury"
                                    },
                                    {
                                        "title":"projecto",
                                        "id":"c1cffc2c-4da1-4e1e-8ea6-49f767d47527",
                                        "url":"http://localhost/portal/site/c1cffc2c-4da1-4e1e-8ea6-49f767d47527",
                                        "description":"ggg"
                                    }
                                ]
                            },
                            {
                                "category":"i18n_moresite_05_projects",
                                "sites":
                                [
                                    {
                                        "title":"Citations Admin",
                                        "id":"citationsAdmin",
                                        "url":"http://localhost/portal/site/citationsAdmin"
                                    },
                                    {
                                        "title":"projecto",
                                        "id":"c1cffc2c-4da1-4e1e-8ea6-49f767d47527",
                                        "url":"http://localhost/portal/site/c1cffc2c-4da1-4e1e-8ea6-49f767d47527",
                                        "description":"ggg"
                                    }
                                ]
                            },
                            {
                                "category":"i18n_moresite_04_other",
                                "sites":
                                [
                                    {
                                        "title":"Administration Workspace",
                                        "id":"!admin",
                                        "url":"http://localhost/portal/site/!admin",
                                        "description":"Administration Workspace"
                                    },
                                    {
                                        "title":"Portfolio Admin",
                                        "id":"PortfolioAdmin",
                                        "url":"http://localhost/portal/site/PortfolioAdmin",
                                        "description":"Site for portfolio administration"
                                    },
                                    {
                                        "title":"mercury site",
                                        "id":"mercury",
                                        "url":"http://localhost/portal/site/mercury"
                                    }
                                ]
                            }
                        ]};
        var newCategoryJson = {};
        for(var i=0;i<newjson.categories.length;i++) {
            var newCategoryJson = {
                    "category" : newjson.categories[i].category + " (" +newjson.categories[i].sites.length +")"
            };
            var obj = "category"+i;
            searchConfig.facetedConfig.facets[obj]=newCategoryJson;
        }
    }
 

    /**
     * Will reset the view to standard.
     */
    sakai._search.reset = function() {
        $(searchConfig.results.header).hide();
    };


    ///////////////////
    // Init Function //
    ///////////////////

    /**
     * Will fetch the sites and add a new item to the history list.
     */
    var doInit = function() {

        // Get my sites
        mainSearch.getMySites();
        // Add the bindings
        mainSearch.addEventListeners();

        // display faceted panel
        mainSearch.addFacetedPanel();
        
        getCategories();

    };


    var thisFunctionality = {
        "doHSearch" : sakai._search.doHSearch
    };

    var mainSearch = sakai._search(searchConfig, thisFunctionality);

    doInit();

};

sakai.api.Widgets.Container.registerForLoad("sakai.search");