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
 * @name sakai.sakai2favourites
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
sakai.sakai2favourites = function(tuid, showSettings){

    var sakai2CategoryList = "#sakai2_category_list";
    var sakai2CategoryListTemplate = "#sakai2_category_list_template";
    var newjson = false;

    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Public function that can be called from elsewhere
     * (e.g. chat and sites widget)
     * It initializes the creategroup widget and shows the jqmodal (ligthbox)
     */
    sakai.sakai2favourites.initialise = function(){
        loadSakai2SiteList();
        $("#sakai2favourites_container").jqmShow();
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
     * This function loop through all category if all is slected and loop through related category
     * if other category is slected.
     * @param {string} category The category you want to search in.
     */
    var renderSiteList = function(categoryname){
        var siteJson = {};
        for(var i in newjson.categories){
            var category = newjson.categories[i];
            if(category.category === categoryname) {
                siteJson.sites = newjson.categories[i].sites;
                $("#sakai2_site_list").html($.TemplateRenderer("#sakai2_site_list_template".replace(/#/, ''),siteJson));
            }
        }
    }


    /**
     * 
     * 
     */
    var loadSakai2SiteList = function(){
       $.ajax({
            // TODO static links need to change once backend is completed
            url: "/dev/s23/bundles/sites-categorized.json",
            type : "GET",
            dataType: "json",
            success: function(data){
                newjson = data;
                $(sakai2CategoryList).html($.TemplateRenderer(sakai2CategoryListTemplate.replace(/#/, ''), data));
                $(".sakai2_category_title").click(function(ev){
                    var category = ev.currentTarget.id;
                    renderSiteList(category);
                });

            },
            error: function(){
            }
        });
    };
    var doInit = function(){

    }
    doInit();

};
sakai.api.Widgets.widgetLoader.informOnLoad("sakai2favourites");