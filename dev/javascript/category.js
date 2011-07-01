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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.category = sakai_global.category || {};

    sakai_global.category = function() {

        var pubdata = {};
        var privdata = {};

        // Containers
        var $exploreNavigation = $("#explore_navigation");
        var toplevelId = "";

        // Templates
        var exploreNavigationTemplate = "explore_navigation_template";

        /**
         * Create the breadcrumb data and render on screen
         * @param {Object} dirData Object that contains children for the category
         * @param {Array} bbqData Array of IDs fetched with bbq to help identify correct children
         */
        var createBreadcrumb = function(dirData, bbqData){
            // Create top level breadcrumb
            var breadcrumb = [];
            breadcrumb.push({
                "title": sakai.api.i18n.General.getValueForKey("ALL_CATEGORIES"),
                "id": bbqData[0],
                "link": true,
                "url": "/categories"
            });
            breadcrumb.push({
                "title": dirData.title,
                "id": dirData.id,
                "link": bbqData.length - 1
            });
            bbqData.splice(0,1);

            // Create children level breadcrumb
            var children = dirData.children[bbqData[0]];
            $.each(bbqData, function(index, item){
                breadcrumb.push({
                    "title": children.title,
                    "id": item,
                    "link": bbqData.length - 1 - index
                });
                if (children.children) {
                    children = children.children[bbqData[index]];
                }
            })

            $exploreNavigation.html(sakai.api.Util.TemplateRenderer(exploreNavigationTemplate,{"breadcrumb": breadcrumb}));
        };

        /**
         * Generate the navigation object and pass it to the left hand navigation widget
         * @param {Object} navData Contains all data from the category the user is currently viewing
         */
        var generateNav = function(navData){

            toplevelId = navData.id;

            pubdata = {
                "structure0": {}
            };
            privdata = {
                "structure0": {}
            };

            var rnd =  sakai.api.Util.generateWidgetId();
            privdata["structure0"][navData.id] = {
                "_order": 0,
                "_ref": rnd,
                "_title": navData.title
            };

            // featuredcontent, featured people and featuredworld random numbers
            var fcRnd = sakai.api.Util.generateWidgetId();
            var fpRnd = sakai.api.Util.generateWidgetId();
            var fwRnd = sakai.api.Util.generateWidgetId();
            privdata[rnd] = {
                page: "<div class=\"s3d-contentpage-title\"><!----></div><div id=\"widget_featuredcontent_" + fcRnd + "\" class=\"widget_inline\"></div><div id=\"widget_featuredpeople_" + fpRnd + "\" class=\"widget_inline\"></div><div id=\"widget_featuredworlds_" + fwRnd + "\" class=\"widget_inline\"></div>"
            }
            privdata[fcRnd] = {
                navData: navData,
                category: navData.id
            };
            privdata[fpRnd] = {
                navData: navData,
                category: navData.id
            };
            privdata[fwRnd] = {
                navData: navData,
                category: navData.id
            };

            var count = 0;
            $.each(navData.children, function(index, item){
                var rnd = sakai.api.Util.generateWidgetId();
                pubdata["structure0"][navData.id + "-" + index] = {
                    "_ref": rnd,
                    "_order": count,
                    "_title": item.title,
                    "main": {
                        "_ref": rnd,
                        "_order": 0,
                        "_title": item.title
                    }
                };

                // featuredcontent, featured people and featuredworld random numbers
                var fcRnd = sakai.api.Util.generateWidgetId();
                var fpRnd = sakai.api.Util.generateWidgetId();
                var fwRnd = sakai.api.Util.generateWidgetId();
                pubdata[rnd] = {
                    page: "<div class=\"s3d-contentpage-title\"><!----></div><div id=\"widget_featuredcontent_" + fcRnd + "\" class=\"widget_inline\"></div><div id=\"widget_featuredpeople_" + fpRnd + "\" class=\"widget_inline\"></div><div id=\"widget_featuredworlds_" + fwRnd + "\" class=\"widget_inline\"></div>"
                }
                pubdata[fcRnd] = {
                    navData: navData,
                    category: navData.id + "-" + index
                };
                pubdata[fpRnd] = {
                    navData: navData,
                    category: navData.id + "-" + index
                };
                pubdata[fwRnd] = {
                    navData: navData,
                    category: navData.id
                };

                count++;
            });
            $(window).trigger("lhnav.init", [pubdata, privdata, {}]);
        };

        /**
         * Get the category out of the URL and give it back
         * @return {Array} Array of strings representing the selected hierarchy
         */
        var getCategory = function(){
            var category = $.bbq.getState("l").split("-");
            return category;
        };

        var doInit = function(){
            var category = getCategory();
            sakai.config.Directory[category[0]].id = category[0];
            generateNav(sakai.config.Directory[category[0]]);
            createBreadcrumb(sakai.config.Directory[category[0]], category);
        };

        $(window).bind("lhnav.ready", function(){
            doInit();
        });

        $(window).bind("hashchange", function(e, data){
            var category = getCategory();
            createBreadcrumb(sakai.config.Directory[category[0]], category);
        });

    };

    sakai.api.Widgets.Container.registerForLoad("category");
});