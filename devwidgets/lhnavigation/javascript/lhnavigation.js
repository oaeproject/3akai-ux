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

        var parametersToCarryOver = {};

        var bookmark = false;

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
            $(".s3d-page-column-right").css("min-height", $(".s3d-page-column-left").height());
        };

        ////////////
        // Events //
        ////////////

        /**
         * Adjust the left hand navigation to include a set of given hash
         * parameters and re-render the navigation
         */
        $(window).bind("lhnav.addHashParam", function(ev, params){
            for (var p in params){
                parametersToCarryOver[p] = params[p];
            }
        });

        var rerenderNavigation = function(){
            $("#lhnavigation_container a").each(function(index){
                var oldHref =  $(this).attr("href");
                var newHref = sakai.api.Widgets.createHashURL(parametersToCarryOver, oldHref);
                $(this).attr("href", newHref);
            });
        };

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
            hideSubMenu();
            if (contextData.isEditMode) {
                $clickedItem.children(".lhnavigation_selected_submenu").show();
            }

            $prevItem.removeClass(navSelectedItemClass);
            $prevItem.addClass(navHoverableItemClass);
            //$prevItem.children(navSelectedItemArrow).css("visibility","hidden");

            $clickedItem.removeClass(navHoverableItemClass);
            $clickedItem.addClass(navSelectedItemClass);
            //$clickedItem.children(navSelectedItemArrow).css("visibility","visible");

            showHideSubnav($clickedItem);

            $(".s3d-page-column-right").css("min-height", $(".s3d-page-column-left").height());
        };

        var hideSubMenu = function(){
            $(".lhnavigation_selected_submenu").hide();
            $("#lhnavigation_submenu").hide();
        };

        var orderItems = function(items){
            var orderedItems = [];
            var noLeft = false;
            for (var i = 0; noLeft === false; i++){
                var toAdd = false;
                for (var el in items){
                    if (el.substring(0,1) !== "_" && items[el]._order == i){
                        toAdd = items[el];
                        toAdd._id = el;
                        break;
                    }
                }
                if (!toAdd){
                    noLeft = true;
                } else {
                    toAdd._elements = orderItems(toAdd);
                    orderedItems.push(toAdd);
                }
            }
            return orderedItems;
        };

        var calculateOrder = function(){
            if (privstructure && privstructure.items){
                privstructure.orderedItems = orderItems(privstructure.items);
            }
            if (pubstructure && pubstructure.items){
                pubstructure.orderedItems = orderItems(pubstructure.items);
            }
        };

        var renderData = function(){
            calculateOrder();
            var lhnavHTML = sakai.api.Util.TemplateRenderer("lhnavigation_template", {
                "private": privstructure,
                "public": pubstructure,
                "contextData": contextData,
                "parametersToCarryOver": parametersToCarryOver
            });
            lhnavHTML = sakai.api.i18n.General.process(lhnavHTML, sakai.api.User.data.me);
            $("#lhnavigation_container").html(lhnavHTML);
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
        };
        
        var collectPoolIds = function(structure, refs){
            for (var level in structure) {
                if (level && level.substring(0, 1) !== "_") {
                    refs = collectPoolIds(structure[level], refs);
                } else if (level && level === "_pid") {
                    if ($.inArray(structure[level], refs) == -1) {
                        refs.push(structure[level]);
                    }
                }
            }
            return refs;
        };
        
        var insertDocStructure = function(structure0, docInfo, pid){
            for (var level in structure0){
                if (structure0[level]._pid && structure0[level]._pid === pid){
                    var docStructure = docInfo.structure0;
                    if (typeof docStructure === "string"){
                        docStructure = $.parseJSON(docStructure);
                    }
                    structure0[level] = $.extend(true, structure0[level], docStructure);
                    for (var sublevel in structure0[level]){
                        if (structure0[level][sublevel]._ref){
                            structure0[level][sublevel]._ref = pid + "-" + structure0[level][sublevel]._ref;
                        }
                    }
                    for (var subpage in docStructure){
                        structure0[level]._ref = pid + "-" + docStructure[subpage]._ref;
                        break;
                    }
                }
            }
            return structure0;
        };
        
        var insertDocPages = function(structure, docInfo, pid){
            for (var page in docInfo){
                if (page.substring(0, 9) !== "structure"){
                    structure.pages[pid + "-" + page] = docInfo[page];
                }
            }
            return structure;
        };
        
        var continueProcessData = function(structure, data, pids, callback){
            // Prepare a batch request
            var batchRequests = [];
            for (var i = 0; i < pids.length; i++) {
                batchRequests.push({
                    "url": "/p/" + pids[i] + ".infinity.json",
                    "method": "GET"
                });
            }
            sakai.api.Server.batch(batchRequests, function(success, data) {
                if (success) {
                    for (var i = 0; i < pids.length; i++){
                        var docInfo = sakai.api.Server.cleanUpSakaiDocObject($.parseJSON(data.results[i].body));
                        structure.items = insertDocStructure(structure.items, docInfo, pids[i]);
                        structure = insertDocPages(structure, docInfo, pids[i]);
                    }
                }
                finishProcessDave(structure, data, callback);
            });
        }
        
        var finishProcessDave = function(structure, data, callback){
            // Include the childcounts for the pages
            structure.items = includeChildCount(structure.items);
            for (var page in data){
                if (page.substring(0,9) !== "structure" && page.substring(0,1) !== "_"){
                    structure.pages[page] = data[page];
                }
            }
            callback(structure);
        }

        var processData = function(data, callback){
            var structure = {};
            structure.items = {};
            structure.pages = {};
            if (data["structure0"]){
                if (typeof data["structure0"] === "string") {
                    structure.items = $.parseJSON(data["structure0"]);
                } else {
                    structure.items = data["structure0"];
                }
                // Get a list of all Sakai Docs that have to be "added"
                var pids = collectPoolIds(structure.items, []);
                if (pids.length == 0){
                    finishProcessDave(structure, data, callback);
                } else {
                    continueProcessData(structure, data, pids, callback);
                }
            } else {
                finishProcessDave(structure, data, callback);
            }
        };

        var selectPage = function(){
            var state = $.bbq.getState("l");
            var selected = state || false;
            // If no page is selected, select the first one from the nav
            if (!selected){
                for (var first = 0; first < privstructure.orderedItems.length; first++){
                    if (privstructure.orderedItems[first]._childCount > 1) {
                        for (var second = 0; second < privstructure.orderedItems[first]._elements.length; second++){
                            selected = privstructure.orderedItems[first]._id + "/" + privstructure.orderedItems[first]._elements[second]._id;
                            break;
                        }
                    } else {
                        selected = privstructure.orderedItems[first]._id;
                    }
                    break;
                }
            }
            if (!selected){
                for (var first1 = 0; first1 < pubstructure.orderedItems.length; first1++){
                    if (pubstructure.orderedItems[first1]._childCount > 1) {
                        for (var second1 = 0; second1 < pubstructure.orderedItems[first1]._elements.length; second1++){
                            selected = pubstructure.orderedItems[first1]._id + "/" + pubstructure.orderedItems[first1]._elements[second1]._id;
                            break;
                        }
                    } else {
                        selected = pubstructure.orderedItems[first1]._id;
                    }
                    break;
                }
            }
            // Select correct item
            var menuitem = $("li[data-sakai-path='" + selected + "']");
            if (menuitem){
                if (selected.split("/").length > 1){
                    var par = $("li[data-sakai-path='" + selected.split("/")[0] + "']");
                    showHideSubnav(par, true);
                }
                var ref = menuitem.attr("data-sakai-ref");
                var savePath = menuitem.attr("data-sakai-savepath") || false;
                if (!menuitem.hasClass(navSelectedItemClass)) {
                    selectNavItem(menuitem, $(navSelectedItem));
                }
                // Render page
                renderPage(ref, selected, savePath);
            }

        };

        var renderPage = function(ref, path, savePath, reload){
            sakai.api.Widgets.nofityWidgetShown("#s3d-page-main-content > div:visible", false);
            $("#s3d-page-main-content > div:visible").hide();
            var content = getPageContent(ref);
            sakai_global.lhnavigation.currentPageShown = {
                "ref": ref,
                "path": path,
                "content": content,
                "savePath": savePath
            };
            $(window).trigger("changePage.lhnavigation.sakai", sakai_global.lhnavigation.currentPageShown);
            if ($("#s3d-page-main-content #" + ref).length > 0){
                if (reload){
                    createPageToShow(ref, path, content, savePath);
                }
                $("#s3d-page-main-content #" + ref).show();
                sakai.api.Widgets.nofityWidgetShown("#"+ref, true);
            } else {
                createPageToShow(ref, path, content, savePath);
            }
        };

        var getPageContent = function(ref){
            if (privstructure.pages[ref]) {
                return privstructure.pages[ref].page;
            } else if (pubstructure.pages[ref]){
                return pubstructure.pages[ref].page;
            } else {
                return false;
            }
        };

        sakai_global.lhnavigation.currentPageShown = {};
        var isEditingNewPage = false;

        var createPageToShow = function(ref, path, content, savePath){
            if ($("#" + ref).length === 0) {
                // Create the new element
                var $el = $("<div>").attr("id", ref);
                // Add element to the DOM
                $("#s3d-page-main-content").append($el);
            }
            var $contentEl = $("#" + ref);
            // Add sanitized content
            var sanitizedContent = sakai.api.Security.saneHTML(content);
            $contentEl.html(sanitizedContent);
            // Insert widgets
            sakai.api.Widgets.widgetLoader.insertWidgets(ref,false,savePath + "/",[privstructure.pages, pubstructure.pages]);
        };

        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        // Temporarily deal with pages as documents here //
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////

        var addPage = function(){
            var newpageid = Math.round(Math.random() * 1000000000);
            var neworder = pubstructure.orderedItems.length;
            pubstructure.pages[newpageid] = {};
            pubstructure.pages[newpageid].page = "Default content";
            pubstructure.items[newpageid] = {
                "_ref": newpageid,
                "_title": "Untitled Page",
                "_order": neworder,
                "main":{
                    "_ref": newpageid,
                    "_order": 0,
                    "_title": "Untitled Page",
                    "_childCount": 0
                },
                "_childCount":1
            };
            renderData();
            $(window).trigger("sakai.contentauthoring.needsTwoColumns");
            $.bbq.pushState({
                "l": newpageid
            }, 0);
            selectPage();
            $(window).trigger("editPage.sakaidocs.sakai");
            rerenderNavigation();
            editPageTitle();
            isEditingNewPage = true;
        };

        $(window).bind("addPage.lhnavigation.sakai", function(){
            addPage();
        });

        /**
         * Submenu for nav items
         */
        $(".lhnavigation_selected_submenu").live("click", function(ev){
            var clickedItem = $(this);
            var submenu = $("#lhnavigation_submenu");
            submenu.css("left", clickedItem.position().left + submenu.width() - (clickedItem.width() / 2) + "px");
            submenu.css("top", clickedItem.position().top + "px");
            toggleSubmenu();
        });

        var toggleSubmenu = function(forceHide){
            var submenu = $("#lhnavigation_submenu");
            if (forceHide) {
                submenu.hide();
            } else {
                submenu.toggle();
            }
        };

        /**
         * Rename a page
         * @param {Object} ev
         */
        $("#lhavigation_submenu_edittitle").live("click", function(ev){
            editPageTitle();
        });

        $(".lhnavigation_change_title").live("blur", function(ev){
            savePageTitle();
        });

        var editPageTitle = function(){
            // Select correct item
            var menuitem = $("li[data-sakai-path='" + sakai_global.lhnavigation.currentPageShown.path + "']");
            var inputArea = $(".lhnavigation_change_title", menuitem);
            var pageTitle = $(".lhnavigation_toplevel", menuitem);

            pageTitle.hide();
            inputArea.show();
            inputArea.val($.trim(pageTitle.text()));
            inputArea.focus();

            // Hide the dropdown menu
            toggleSubmenu(true);
        };

        var storeStructure = function(structure){
            sakai.api.Server.saveJSON(sakai_global.lhnavigation.currentPageShown.savePath, {
                "structure0": $.toJSON(structure.items)
            });
        };

        var savePageTitle = function(){
            var menuitem = $("li[data-sakai-path='" + sakai_global.lhnavigation.currentPageShown.path + "']");
            var inputArea = $(".lhnavigation_change_title", menuitem);
            var pageTitle = $(".lhnavigation_toplevel", menuitem);
            inputArea.hide();
            pageTitle.text(inputArea.val());
            pageTitle.show();

            pubstructure.items[sakai_global.lhnavigation.currentPageShown.path]._title = inputArea.val();
            storeStructure(pubstructure);
        };

        /**
         * Delete a page
         */
        $("#lhavigation_submenu_deletepage").live("click", function(ev){
            deletePage();
        });

        var updateCountsAfterDelete = function(structure, ref, path){
            var oldOrder = structure.items[path]._order;
            delete structure.pages[ref];
            delete structure.items[path];
            structure.orderedItems.splice(oldOrder, 1);
            for (var i = oldOrder; i < structure.orderedItems.length; i++){
                structure.orderedItems[i]._order = i;
                structure.items[structure.orderedItems[i]._id]._order = i;
            }
        };

        var deletePage = function(){
            if (pubstructure.pages[sakai_global.lhnavigation.currentPageShown.ref]){
                updateCountsAfterDelete(pubstructure, sakai_global.lhnavigation.currentPageShown.ref, sakai_global.lhnavigation.currentPageShown.path);
                if (getPageCount(pubstructure.items) < 3){
                    $(window).trigger("sakai.contentauthoring.needsOneColumn");
                }
            } else if (privstructure.pages[sakai_global.lhnavigation.currentPageShown.ref]){
                updateCountsAfterDelete(privstructure, sakai_global.lhnavigation.currentPageShown.ref, sakai_global.lhnavigation.currentPageShown.path);
                if (getPageCount(privstructure.pages) < 3){
                    $(window).trigger("sakai.contentauthoring.needsOneColumn");
                }
            }
            renderData();
            rerenderNavigation();
            $.bbq.pushState({"l": "", "_": Math.random()}, 0);
            isEditingNewPage = false;
            $.ajax({
                url: sakai_global.lhnavigation.currentPageShown.savePath,
                type: "POST",
                dataType: "json",
                data: {
                    "structure0": $.toJSON(pubstructure.items)
                }
            });
        };

        var getPageCount = function(pagestructure){
            var pageCount = 0;
            for (var tl in pagestructure){
                if (pagestructure.hasOwnProperty(tl)){
                    pageCount++;
                    if (pageCount >= 3){
                        return 3;
                    }
                    for (var ll in pagestructure[tl]){
                        if (ll.substring(0,1) !== "_"){
                            pageCount++;
                            if (pageCount >= 3){
                                return 3;
                            }
                        }
                    }
                }
            }
            return pageCount;
        };

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
                }
            });
        };

        ////////////////////
        // INITIALISATION //
        ////////////////////

        var renderNavigation = function(pubdata, privdata, cData, puburl, privurl){
            cData.puburl = puburl;
            cData.privurl = privurl;
            contextData = cData;
            processData(privdata, function(processedPriv){
                privstructure = processedPriv;
                processData(pubdata, function(processedPub){
                    pubstructure = processedPub;
                    renderData();
                    addBinding();
                    selectPage();
                    if (cData.parametersToCarryOver) {
                        parametersToCarryOver = cData.parametersToCarryOver;
                        rerenderNavigation();
                    }
                });
            });            
        };

        $(window).bind("hashchange", function(e, data){
            selectPage();
        });

        $(window).bind("lhnav.init", function(e, pubdata, privdata, cData, puburl, privurl){
            renderNavigation(pubdata, privdata, cData, puburl, privurl);
        });
        $(window).trigger("lhnav.ready");

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("lhnavigation");

});
