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
        var contentData = {};
        var lhnavData = {};
        var pages = [];

        var renderContainer = function(){
            $("#pageviewer_lhnav_container", $rootel).html(sakai.api.Util.TemplateRenderer("pageviewer_lhnav_template", {pages: pages}));
            $("#pageviewer_content_container", $rootel).html(sakai.api.Util.TemplateRenderer("pageviewer_content_template", {pages: pages}));
            sakai.api.Widgets.widgetLoader.insertWidgets(pages[0].ref, false, pages[0].poolpath + "/");
        };

        var fetchPageContent = function(){
            var batchRequests = [];
            $.each(pages, function(i, page){
                batchRequests.push({
                    "url": page.poolpath + "/" + page.ref + ".json",
                    "method": "GET"
                });
            });
            sakai.api.Server.batch(batchRequests, function(success, data) {
                if(success){
                    $.each(data.results, function(i, pageData){
                        if(sakai.api.Util.determineEmptyContent($.parseJSON(pageData.body).page)){
                            pages[i].pageContent = $.parseJSON(pageData.body);
                        } else {
                            pages[i].pageContent = false;
                        }
                    });
                    renderContainer();
                } else {
                    debug.log("Page contents could not be fetched.")
                }
            });
        };

        var processPages = function(data){
            $.each(data, function(i, page){
                if(page.hasOwnProperty("_title")){
                    pages.push({
                        title: page._title,
                        poolpath: page._poolpath || "/p/" + contentData.data._path,
                        ref: page._ref
                    });
                }
            });
            fetchPageContent();
        };

        var addBinding = function(){
            $(".pageviewer_lhnav_item", $rootel).live("click", function(){
                $(".pageviewer_lhnav_item", $rootel).removeClass("selected");
                $(this).addClass("selected");
                $(".pageviewer_content_for_page", $rootel).hide();
                $("#pageviewer_content_for_page_" + $(this).data("index"), $rootel).show();
            })
        }

        var doInit = function(){
            addBinding();
            processPages($.parseJSON(contentData.data.structure0));
        };

        $(window).unbind("start.pageviewer.sakai");
        $(window).bind("start.pageviewer.sakai", function(ev, data){
            pages = [];
            contentData = data;
            doInit();
        });

        $(window).trigger("ready.pageviewer.sakai");

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("pageviewer");
});
