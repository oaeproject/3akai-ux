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
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.sakai2favourites
     *
     * @class sakai2favourites
     *
     * @description
     * Creategroup widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.sakai2favourites = function(tuid, showSettings){

        var sakai2CategoryList = "#sakai2_category_list";
        var sakai2CategoryListTemplate = "#sakai2_category_list_template";
        var siteListsjson = false;
        var selectedSiteJson = false;

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Public function that can be called from elsewhere
         * (e.g. chat and sites widget)
         * It initializes the creategroup widget and shows the jqmodal (ligthbox)
         */
        $(window).bind("sakai.sakai2favourites.init", function(){
            // render Category List
            loadSakai2SiteList();
            // render all sites list
            renderSiteList();
            // render selected site List
            renderSelectedList();
            // show dialog
            $("#sakai2favourites_container").jqmShow();
            // bind events
            bindEvents();
        });

        /**
         * This method render Category List.
         */
        var loadSakai2SiteList = function(){
            $(sakai2CategoryList).html(sakai.api.Util.TemplateRenderer(sakai2CategoryListTemplate.replace(/#/, ''), siteListsjson));
        };

       /**
         * This method render all sites or sites related to the categoryname.
         * @param {string} categoryname The category(all:render all sites, categoryname:render sites related to the category)
         */
        var renderSiteList = function(categoryname){
            var siteListJson = {};
            siteListJson.sites = [];

            //loop through each category and get the related sites
            for(var i in siteListsjson.categories){
                if (siteListsjson.categories.hasOwnProperty(i)) {
                    var category = siteListsjson.categories[i];
                    // if category name is all
                    if (!categoryname) {
                        // get all the unique site lists
                        siteListJson = getAllSites(category, siteListJson);
                    // if category name is equal to the category.categoryname
                    // for example categoryname = i18n_moresite_01_all_sites
                    }
                    else
                        if (category.category.replace(/ /g, "_") === categoryname) {
                            // get the site lists in certain category
                            // for example get site list in i18n_moresite_01_all_sites
                            siteListJson.sites = siteListsjson.categories[i].sites;
                            break;
                        }
                }
            }
            // render the sites
            $("#sakai2_site_list").html(sakai.api.Util.TemplateRenderer("#sakai2_site_list_template".replace(/#/, ''),siteListJson));
            // select related checkboxes based on the selectedlistjson
            setSite();
        };

       /**
         * This method render all sites selected to display in my sakai2 favourites
         */
        var renderSelectedList = function(){
            $("#sakai2favourites_selected_site_list").html(sakai.api.Util.TemplateRenderer("#sakai2_selected_site_list_template".replace(/#/, ''),sakai.data.me.sakai2List));
        };


        var myClose = function(hash) {
            hash.o.remove();
            hash.w.hide();
        };

        ////////////////////
        // Event Handlers //
        ////////////////////


        /*
         * Add jqModal functionality to the container.
         * This makes use of the jqModal (jQuery Modal) plugin that provides support
         * for lightboxes
         */
        $("#sakai2favourites_container").jqm({
            modal: true,
            overlay: 20,
            toTop: true,
            onHide: myClose
        });

        /**
         * Add event handling
         */
        var bindEvents = function(){
            $(".sakai2_category_title").unbind("click");
            $(".sakai2_category_title").click(function(ev){
                if($(".selected_category")){
                    $(".selected_category").removeClass("selected_category");
                    $(".selected").removeClass("selected");
                }

                $(ev.currentTarget).parent().addClass("selected");
                $(ev.currentTarget).addClass("selected_category");
                var category = ev.currentTarget.id;
                renderSiteList(category);
                bindEvents();
            });
            $(".sakai2_site_title").unbind("click");
            $(".sakai2_site_title").click(function(ev){
                var siteId = ev.currentTarget.id;
                if($(ev.currentTarget).attr("checked")){
                    var site = getObject(siteId);
                    sakai.data.me.sakai2List.sites.push(site);
                }else {
                    var ind = getToRemoveIndex(siteId);
                    sakai.data.me.sakai2List.sites.splice(ind,1);
                }
                renderSiteList($(".selected_category").attr("id"));
                renderSelectedList();
                // bind events
                bindEvents();
            });
            $(".sakai2_selected_site_title").unbind("click");
            $(".sakai2_selected_site_title").click(function(ev){
                var siteId = ev.currentTarget.id;
                var ind = getToRemoveIndex(siteId);
                sakai.data.me.sakai2List.sites.splice(ind,1);
                renderSiteList($(".selected_category").attr("id"));
                renderSelectedList();
                // bind events
                bindEvents();
            });
        };

        /**
         *  This function return the list of unique sites.
         * @param {Object} category The category lists json object
         * @param {siteJson} siteJson The site list object.
         */
        var getAllSites = function(category,siteJson){
            // loop through each sites in the category and add to the siteJson
            // if it is not already in the siteJson
            for(var i in category.sites){
                // check if the site already exists in the the siteJson
                if(!isItemExists(siteJson.sites, category.sites[i])){
                    // add to the siteJson object
                    siteJson.sites.push(category.sites[i]);
                }
            }
            return siteJson;
        };

        /**
         *  This function check if item is already exists in the site list.
         *  It check whether site is already in the sites.
         * @param {String} sites The site lists json object
         * @param {string} site The site object.
         */
        var isItemExists = function(sites, site){
            var checking = false;
            // loop through all sites and check if site already exists in the sites.
            for(var i in sites) {
                // if site id is same
                if(sites[i].id == site.id) {
                    checking = true;
                }
            }
            return checking;
        };

        /**
         *  This function checked the checkboxes for the selected sites.
         */
        var setSite = function(){
            // loop through the list of sites to be displayed in mysakai2 favourites list
            for(var i in sakai.data.me.sakai2List.sites){
                if (sakai.data.me.sakai2List.sites.hasOwnProperty(i)) {
                    // checked the related checkbox
                    $("input[id='" + sakai.data.me.sakai2List.sites[i].id + "']").attr('checked', true);
                }
            }
        };

        /**
         * This function get the site object based on the id passed.
         * @param {String} id The site id
         */
        var getObject = function(id){
            // loop through category list first
            for(var i in siteListsjson.categories){
                if (siteListsjson.categories.hasOwnProperty(i)) {
                    // loop through site list inside each category
                    for (var j in siteListsjson.categories[i].sites) {
                        // if site id is ame return the site object.
                        if (siteListsjson.categories[i].sites[j].id === id) {
                            return siteListsjson.categories[i].sites[j];
                        }
                    }
                }
            }
        };

        /**
         * This function return the index of site in the sakai.data.me.sakai2List(myskai2 favourites site list)based on the id
         * @param {String} id The site id
         */
        var getToRemoveIndex = function(id){
            // loop through mysakai2 favourites selected sites
            for(var i in sakai.data.me.sakai2List.sites){
                // if id is same return the index.
                if(sakai.data.me.sakai2List.sites[i].id === id){
                    return i;
                }
            }
        };

        /**
         *  This function get the list of sites list group by category.
         */
        var getSiteList = function(){
            var url = "/dev/s23/bundles/sites-categorized.json";
            if (sakai.config.useLiveSakai2Feeds){
                url = "/var/proxy/s23/sitesCategorized.json?categorized=true";
            }
            $.ajax({
                url: url,
                type : "GET",
                dataType: "json",
                success: function(data){
                    siteListsjson = data;
                },
                error: function(){
                }
            });
        };

        /**
         * Execute this function when the widget get launched
         */
        var doInit = function(){
            // get list of all sites
            getSiteList();
            // get lists of site selected to display in my sakai2 favourites
            //getSelectedSiteList();

            $("#sakai2favourites_add_save").click(function(ev){
                var toSave = {};
                toSave.id = [];
                for (var i = 0; i < sakai.data.me.sakai2List.sites.length; i++){
                    toSave.id.push(sakai.data.me.sakai2List.sites[i].id);
                }
                // TODO: Fix this. This is a temporary solution necessary for making the back-end
                // store an empty list and have it overwrite the previous one.
                if (toSave.id.length === 0){
                    toSave.id[0] = "invalidSite";
                }
                sakai.api.Server.saveJSON("/~" + sakai.data.me.user.userid + "/private/sakai2favouriteList",toSave, function(success,data){
                    $("#sakai2favourites_container").jqmHide();
                    $(window).trigger("sakai2-favourites-selected");
                });
            });
        };
        doInit();

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("sakai2favourites");
});
