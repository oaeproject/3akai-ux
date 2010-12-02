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
 * @name sakai.mysakai2
 *
 * @class mysakai2
 *
 * @description
 * Initialize the mysakai2 widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 */
sakai.mysakai2 = function(tuid){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);

    var mysakai2List = "#mysakai2_list";
    var mysakai2ListTemplate = "#mysakai2_list_template";


    /**
     * Takes a set of json and renders the sakai2 sites.
     * @param {Object} newjson sakai 2 list object
     */
    var doRender = function(newjson){
        // If the user is not registered for any sites, show the no sites error.
        if (newjson.sites.length === 0) {
            $(mysakai2List, rootel).html(sakai.api.Security.saneHTML("No sites")).addClass("sites_error");
        }
        else {
            for (var site in newjson.sites) {
                if (newjson.sites.hasOwnProperty(site)) {
                    site.title = sakai.api.Security.escapeHTML(site.title);
                }
            }
            $(mysakai2List, rootel).html($.TemplateRenderer(mysakai2ListTemplate.replace(/#/, ''), newjson));
        }
    };

    /**
     *
     *
     */
    var loadSakai2SiteList = function(){
        var newjson = {
            "principal": "admin",
            "sites": [{
                "title": "Administration Workspace",
                "id": "!admin",
                "url": "http://localhost/portal/site/!admin",
                "description": "Administration Workspace",
                "forums": 3,
                "messages":5
            }]
        };

        // Render all the sites.
        doRender(newjson);
    };

    /**
     * Will initiate a request to the my groups service.
     */
    var doInit = function(){
        //get sakai2 list information and then render in my sakai2 widget
        loadSakai2SiteList();
    };


    // Start the request
    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("mysakai2");
