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


        ////////////////////
        // UTIL FUNCTIONS //
        ////////////////////

        var showHideSubnav = function($el){
            if ($el.hasClass("lhnavigation_hassubnav")) {
                    if ($el.next().is(":visible")) {
                        $el.next().hide();
                    }
                    else {
                        $el.next().show();
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
        
        
        var renderData = function(structure, privstructure){
            $("#lhnavigation_container").html(sakai.api.Util.TemplateRenderer("lhnavigation_template", {
                "public": structure,
                "private": privstructure
            }));
        };
        
        var includeChildCount = function(structure){
            var childCount = 0;
            for (var level in structure){
                if (level && level.substring(0,1) !== "_"){
                    childCount++;
                    structure[level] = includeChildCount(structure[level]);
                }
            }
            structure.childCount = childCount;
            return structure;
        }

        var processData = function(data){
            var structure = {};
            structure.items = {};
            if (data["structure0"]){
                structure.items = $.parseJSON(data["structure0"]);
                for (var level in structure.items){
                    structure.items[level] = includeChildCount(structure.items[level]);
                }
            }
            return structure;
        };

        /////////////
        // BINDING //
        /////////////

        /**
         * Add binding to the elements
         */
        var addBinding = function(){
            $(".lhnavigation_menu_list li").bind("click", function(){
                if (!$(this).hasClass(navSelectedItemClass)) {
                    selectNavItem($(this), $(navSelectedItem));
                } else {
                    showHideSubnav($(this));
                }
            });
        };


        ////////////////////
        // INITIALISATION //
        ////////////////////
        
        var renderNavigation = function(pubdata, privdata){
            var pubstructure = processData(pubdata);
            var privstructure = processData(privdata);
            renderData(pubstructure, privstructure);
            addBinding();
        }

        $(window).bind("lhnav.init", function(e, pubdata, privdata){
           renderNavigation(pubdata, privdata);
        });
        
        $(window).trigger("lhnav.ready");
        
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("lhnavigation");
});
