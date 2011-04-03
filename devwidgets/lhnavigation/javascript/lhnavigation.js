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
     * @name sakai_global.lhnavigation
     *
     * @class lhnavigation
     *
     * @description
     * Navigation widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.lhnavigation = function (tuid, showSettings) {


        ///////////////////
        // CONFIGURATION //
        ///////////////////

        // Classes
        var navSelectedItemClass = "lhnavigation_selected_item";
        var navHoverableItemClass = "lhnavigation_hoverable_item";

        // Elements
        var navSelectedItemArrow = ".lhnavigation_selected_item_arrow";
        var navSelectedItem = ".lhnavigation_selected_item";


        ////////////////
        // DATA CACHE //
        ////////////////

        var privstructure = false;
        var pubstructure = false;
        var contextData = false;

        ////////////////////
        // UTIL FUNCTIONS //
        ////////////////////

        var showHideSubnav = function($el, forceOpen){
            if ($el.hasClass("lhnavigation_hassubnav")) {
                if (!$el.next().is(":visible") || forceOpen) {
                	$(".lhnavigation_has_subnav", $el).addClass("lhnavigation_has_subnav_opened");
                    $el.next().show();
                } else {
                    $(".lhnavigation_has_subnav", $el).removeClass("lhnavigation_has_subnav_opened");
                    $el.next().hide();
                }
            }
        }


        /////////////////////
        // MENU NAVIGATION //
        /////////////////////

        /**
         * Apply and remove classes when a new item is clicked in the navigation
         * @param {Object} $clickedItem The navigation item that has been clicked
         * @param {Object} $prevItem The previously active navigation item
         */
        var selectNavItem = function($clickedItem, $prevItem){
            $clickedItem.children(".lhnavigation_selected_item_subnav").show();

            $prevItem.removeClass(navSelectedItemClass);
            $prevItem.addClass(navHoverableItemClass);
            $prevItem.children(navSelectedItemArrow).css("visibility","hidden");

            $clickedItem.removeClass(navHoverableItemClass);
            $clickedItem.addClass(navSelectedItemClass);
            $clickedItem.children(navSelectedItemArrow).css("visibility","visible");

            showHideSubnav($clickedItem);
        };

        var renderData = function(){
            $("#lhnavigation_container").html(sakai.api.Util.TemplateRenderer("lhnavigation_template", {
                "private": privstructure,
                "public": pubstructure,
                "contextData": contextData
            }));
        };

        var includeChildCount = function(structure){
            var childCount = 0;
            for (var level in structure){
                if (level && level.substring(0,1) !== "_"){
                    childCount++;
                    structure[level] = includeChildCount(structure[level]);
                } else if (level && level === "_altTitle"){
                    structure[level] = structure[level].replace("${user}", contextData.profile.basic.elements.firstName.value);
                }
            }
            structure._childCount = childCount;
            return structure;
        }

        var processData = function(data){
            var structure = {};
            structure.items = {};
            structure.pages = {};
            if (data["structure0"]){
                if (typeof data["structure0"] === "string") {
                    structure.items = $.parseJSON(data["structure0"]);
                } else {
                    structure.items = data["structure0"];
                }
                for (var level in structure.items){
                    structure.items[level] = includeChildCount(structure.items[level]);
                }
            }
            for (var page in data){
                if (page.substring(0,9) !== "structure"){
                    structure.pages[page] = data[page];
                }
            }
            return structure;
        };

        var selectPage = function(){
            var state = $.bbq.getState("l");
            var selected = state || false;
            // If no page is selected, select the first one from the nav
            if (!selected){
                for (var first in privstructure.items){
                    if (privstructure.items[first]._childCount > 1) {
                        for (var second in privstructure.items[first]){
                            if (second.substring(0,1) !== "_"){
                                selected = first + "/" + second;
                                break;
                            }
                        }
                    } else {
                        selected = first;
                    }
                    break;
                }
            }
            if (!selected){
                for (var first in pubstructure.items){
                    if (pubstructure.items[first]._childCount > 1) {
                        for (var second in pubstructure.items[first]){
                            if (second.substring(0,1) !== "_"){
                                selected = first + "/" + second;
                                break;
                            }
                        }
                    } else {
                        selected = first;
                    }
                    break;
                }
            }
            // Select correct item
            var menuitem = $("li[sakai-path=" + selected + "]");
            if (menuitem){
                if (selected.split("/").length > 1){
                    var par = $("li[sakai-path=" + selected.split("/")[0] + "]");
                    showHideSubnav(par, true);
                }
                var ref = menuitem.attr("sakai-ref");
                if (!menuitem.hasClass(navSelectedItemClass)) {
                    selectNavItem(menuitem, $(navSelectedItem));
                }
                // Render page
                renderPage(ref);
            }

        }

        var renderPage = function(ref){
            $("#s3d-page-main-content > div").hide();
            if ($("#s3d-page-main-content #" + ref).length > 0){
                $("#s3d-page-main-content #" + ref).show();
            } else {
                var content = getPageContent(ref);
                createPageToShow(ref, content);
            }
        }

        var getPageContent = function(ref){
            if (privstructure.pages[ref]) {
                return privstructure.pages[ref].page;
            } else if (pubstructure.pages[ref]){
                return pubstructure.pages[ref].page;
            } else {
                return false;
            }
        }

        var createPageToShow = function(ref, content){
            // Create the new element
            var $el = $("<div>").attr("id", ref);
            // Add sanitized content
            var sanitizedContent = sakai.api.Security.saneHTML(content);
            $el.html(sanitizedContent);
            // Add element to the DOM
            $("#s3d-page-main-content").append($el);
            // Insert widgets
            sakai.api.Widgets.widgetLoader.insertWidgets(ref,false,"",[privstructure.pages, pubstructure.pages]);
        }

        /////////////
        // BINDING //
        /////////////

        /**
         * Add binding to the elements
         */
        var addBinding = function(){
            $(".lhnavigation_menu_list li").bind("click", function(){
                var el = $(this);
                if (el.hasClass("lhnavigation_hassubnav")) {
                    showHideSubnav(el);
                } else {
                    var path = {
                        "l": el.attr("sakai-path")
                    }
                    if (path.l) {
                        $.bbq.pushState(path, 2);
                    }
                }
            });
        };


        ////////////////////
        // INITIALISATION //
        ////////////////////

        var renderNavigation = function(pubdata, privdata, cData){
            contextData = cData;
            privstructure = processData(privdata);
            pubstructure = processData(pubdata);
            renderData();
            addBinding();
            selectPage();
        }

        $(window).bind("hashchange", function(e, data){
            selectPage();
        });

        $(window).bind("lhnav.init", function(e, pubdata, privdata, cData){
           renderNavigation(pubdata, privdata, cData);
        });

        $(window).trigger("lhnav.ready");

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("lhnavigation");
});

//} else {
//    showHideSubnav(el);
//}