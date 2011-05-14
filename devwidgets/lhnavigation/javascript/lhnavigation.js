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
        var sakaiDocsInStructure = {};
        var currentPageShown = {};

        /////////////////////
        // MENU NAVIGATION //
        /////////////////////

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
                } else if (level && level === "_pid" && structure["_canView"] !== false) {
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
                        sakaiDocsInStructure["/p/" + pids[i]] = docInfo;
                        addDocUrlIntoStructure(docInfo.structure0, "/p/" + pids[i]);
                        structure.items = insertDocStructure(structure.items, docInfo, pids[i]);
                        structure = insertDocPages(structure, docInfo, pids[i]);
                    }
                }
                finishProcessDave(structure, data, callback);
            });
        };

        var finishProcessDave = function(structure, data, callback){
            // Include the childcounts for the pages
            structure.items = includeChildCount(structure.items);
            for (var page in data){
                if (page.substring(0,9) !== "structure" && page.substring(0,1) !== "_"){
                    structure.pages[page] = data[page];
                }
            }
            callback(structure);
        };

        var addDocUrlIntoStructure = function(structure, url){
            structure._poolpath = url;
            for (var i in structure){
                if (i.substring(0,1) !== "_" && typeof structure[i] !== "string"){
                    structure[i] = addDocUrlIntoStructure(structure[i], url);
                }
            }
            return structure;
        };

        var processData = function(data, docURL, callback){
            var structure = {};
            structure.items = {};
            structure.pages = {};
            if (data["structure0"]){
                if (typeof data["structure0"] === "string") {
                    structure.items = $.parseJSON(data["structure0"]);
                } else {
                    structure.items = data["structure0"];
                }
                for (var i in structure.items) {
                    structure.items[i] = addDocUrlIntoStructure(structure.items[i], docURL);
                }
                // Get a list of all Sakai Docs that have to be "added"
                var pids = collectPoolIds(structure.items, []);
                if (pids.length === 0){
                    finishProcessDave(structure, data, callback);
                } else {
                    continueProcessData(structure, data, pids, callback);
                }
            } else {
                finishProcessDave(structure, data, callback);
            }
            debug.log(structure);
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
            addParametersToNavigation();
            editPageTitle();
        };

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
        
        
        
        
        
        
        
        
        
        
        
        
        //////////////////
        // Data storage //
        //////////////////
        
        var storeStructure = function(structure, savepath){
            sakai.api.Server.saveJSON(savepath, {
                "structure0": $.toJSON(structure.items)
            });
        };
        
        //////////////////////////////
        // Rendering a content page //
        //////////////////////////////
        
        var getFirstSelectablePage = function(structure){
            var selected = false;
            for (var i = 0; i < structure.orderedItems.length; i++) {
                if (structure.orderedItems[i]._canView !== false) {
                    if (structure.orderedItems[i]._childCount > 1) {
                        for (var ii = 0; ii < structure.orderedItems[i]._elements.length; ii++) {
                            selected = structure.orderedItems[i]._id + "/" + structure.orderedItems[i]._elements[ii]._id;
                            break;
                        }
                    } else {
                        selected = structure.orderedItems[i]._id;
                    }
                    break;
                }
            }
            return selected;
        }
        
        var selectPage = function(){
            var state = $.bbq.getState("l");
            var selected = state || false;
            // If no page is selected, select the first one from the nav
            if (!selected){
                selected = getFirstSelectablePage(privstructure) || getFirstSelectablePage(pubstructure);
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
                var canEdit = menuitem.attr("data-sakai-submanage") || false;
                if (!menuitem.hasClass(navSelectedItemClass)) {
                    selectNavItem(menuitem, $(navSelectedItem));
                }
                // Render page
                preparePageRender(ref, selected, savePath, canEdit);
            }
        };
        
        var preparePageRender = function(ref, path, savePath, canEdit){
            var content = getPageContent(ref);
            currentPageShown = {
                "ref": ref,
                "path": path,
                "content": content,
                "savePath": savePath,
                "canEdit": canEdit,
                "widgetData": [privstructure.pages, pubstructure.pages]
            };
            $(window).trigger("showpage.sakaidocs.sakai", [currentPageShown]);
        };
        
        /////////////////////////
        // Contextual dropdown //
        /////////////////////////
        
        var contextMenuHover = false;
        
        var onContextMenuHover = function($el){
            $(".lhnavigation_selected_submenu").hide();
            $("#lhnavigation_submenu").hide();
            if ($el.data("sakai-manage")){
                contextMenuHover = {
                    path: $el.data("sakai-path"),
                    ref: $el.data("sakai-ref"),
                    savepath: $el.data("sakai-savepath")
                }
                $(".lhnavigation_selected_submenu", $el).show();
            }
        };
        
        var onContextMenuLeave = function(){
            if (!$("#lhnavigation_submenu").is(":visible")) {
                $(".lhnavigation_selected_submenu").hide();
            }
        };
        
        var showContextMenu = function($clickedItem){
            var contextMenu = $("#lhnavigation_submenu");
            contextMenu.css("left", $clickedItem.position().left + contextMenu.width() - ($clickedItem.width() / 2) + "px");
            contextMenu.css("top", $clickedItem.position().top + "px");
            toggleContextMenu();
        };

        var toggleContextMenu = function(forceHide){
            var contextMenu = $("#lhnavigation_submenu");
            if (forceHide) {
                contextMenu.hide();
            } else {
                contextMenu.toggle();
            }
        };
        
        /////////////////////
        // Renaming a page //
        /////////////////////
        
        var changingPageTitle = false;
        
        var editPageTitle = function(){
            // Select correct item
            var menuitem = $("li[data-sakai-path='" + contextMenuHover.path + "']");
            changingPageTitle = jQuery.extend(true, {}, contextMenuHover);
            
            var pageTitle = $(".lhnavigation_toplevel", menuitem);
            pageTitle.hide();
            
            var inputArea = $(".lhnavigation_change_title", menuitem);
            inputArea.show();
            inputArea.val($.trim(pageTitle.text()));
            inputArea.focus();

            // Hide the dropdown menu
            toggleContextMenu(true);
        };
        
        var savePageTitle = function(){
            var menuitem = $("li[data-sakai-path='" + changingPageTitle.path + "']");
            
            var inputArea = $(".lhnavigation_change_title", menuitem);
            inputArea.hide();
            
            var pageTitle = $(".lhnavigation_toplevel", menuitem);
            pageTitle.text(inputArea.val());
            pageTitle.show();

            pubstructure.items[changingPageTitle.path]._title = inputArea.val();
            storeStructure(pubstructure, changingPageTitle.savepath);
            changingPageTitle = false;
        };
        
        /////////////////////
        // Deleting a page //
        /////////////////////
        
        var deletePage = function(){
            var structure = false;
            if (pubstructure.pages[contextMenuHover.ref]){
                updateCountsAfterDelete(pubstructure, contextMenuHover.ref, contextMenuHover.path);
                if (getPageCount(pubstructure.items) < 3){
                    $(window).trigger("sakai.contentauthoring.needsOneColumn");
                }
                structure = pubstructure;
            } else if (privstructure.pages[contextMenuHover.ref]){
                updateCountsAfterDelete(privstructure, contextMenuHover.ref, contextMenuHover.path);
                if (getPageCount(privstructure.pages) < 3){
                    $(window).trigger("sakai.contentauthoring.needsOneColumn");
                }
                structure = privstructure;
            }
            renderData();
            addParametersToNavigation();
            $.bbq.pushState({"l": "", "_": Math.random()}, 0);
            storeStructure(structure, contextMenuHover.savepath);
            toggleContextMenu(true);
        };
        
        /////////////////////////////////////////////
        // Add additional parameters to navigation //
        /////////////////////////////////////////////
        
        var storeNavigationParameters = function(params){
            for (var p in params){
                parametersToCarryOver[p] = params[p];
            }
            addParametersToNavigation();
        }

        var addParametersToNavigation = function(){
            $("#lhnavigation_container a").each(function(index){
                var oldHref =  $(this).attr("href");
                var newHref = sakai.api.Widgets.createHashURL(parametersToCarryOver, oldHref);
                $(this).attr("href", newHref);
            });
        };
        
        //////////////////////////////
        // Handle navigation clicks //
        //////////////////////////////
        
        var selectNavItem = function($clickedItem, $prevItem){
            // Remove selected class from previous selected page
            $prevItem.removeClass(navSelectedItemClass);
            $prevItem.addClass(navHoverableItemClass);
            // Add selected class to currently selected page
            $clickedItem.removeClass(navHoverableItemClass);
            $clickedItem.addClass(navSelectedItemClass);
            // Open or close subnavigation if necessary
            showHideSubnav($clickedItem);
        };
        
        var processNavigationClick = function($el, ev){
            if ($el.hasClass("lhnavigation_hassubnav") && !$(ev.target).hasClass("lhnavigation_selected_submenu_image")) {
                showHideSubnav($el);
            }
        }

        var showHideSubnav = function($el, forceOpen){
            $el.children(".lhnavigation_selected_item_subnav").show();
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

        //////////////////////////////////////
        // Prepare the navigation to render //
        //////////////////////////////////////
        
        var renderNavigation = function(pubdata, privdata, cData, mainPubUrl, mainPrivUrl){
            cData.puburl = mainPubUrl;
            cData.privurl = mainPrivUrl;
            sakaiDocsInStructure[mainPubUrl] = pubdata;
            sakaiDocsInStructure[mainPrivUrl] = privdata;
            contextData = cData;
            processData(privdata, cData.privurl, function(processedPriv){
                privstructure = processedPriv;
                processData(pubdata, cData.puburl, function(processedPub){
                    pubstructure = processedPub;
                    renderData();
                    selectPage();
                    if (cData.parametersToCarryOver) {
                        parametersToCarryOver = cData.parametersToCarryOver;
                        addParametersToNavigation();
                    }
                });
            });      
        }
        
        ///////////////////////////////////////
        // Initializing the Sakaidocs widget //
        ///////////////////////////////////////
        
        var sakaiDocsInitialized = false;
        
        var prepareRenderNavigation = function(pubdata, privdata, cData, mainPubUrl, mainPrivUrl){
            if (!sakaiDocsInitialized){
                sakaiDocsInitialized = true;
                $("#s3d-page-main-content").append($("#lhnavigation_sakaidocs_declaration"));
                $(window).bind("ready.sakaidocs.sakai", function(){
                    renderNavigation(pubdata, privdata, cData, mainPubUrl, mainPrivUrl);
                });
                sakai.api.Widgets.widgetLoader.insertWidgets("s3d-page-main-content", false);
            } else {
                renderNavigation(pubdata, privdata, cData, mainPubUrl, mainPrivUrl);
            }          
        };
        
        ////////////////////////////
        // Internal event binding //
        ////////////////////////////
        
        $(".lhnavigation_selected_submenu").live("click", function(ev){
            showContextMenu($(this));
        });
        
        $(".lhnavigation_menuitem").live("mouseenter", function(){
            onContextMenuHover($(this));
        });
        
        $("#lhavigation_submenu_edittitle").live("click", function(ev){
            editPageTitle();
        });

        $(".lhnavigation_change_title").live("blur", function(ev){
            savePageTitle();
        });
        
        $("#lhavigation_submenu_deletepage").live("click", function(ev){
            deletePage();
        });
        
        $(".lhnavigation_menuitem").live("mouseleave", function(){
            onContextMenuLeave();
        });
        
        $(".lhnavigation_menu_list li").live("click", function(ev){
            processNavigationClick($(this), ev);
        });
        
        ////////////////////////////
        // External event binding //
        ////////////////////////////
        
        $(window).bind("lhnav.addHashParam", function(ev, params){
            storeNavigationParameters(params);
        });

        $(window).bind("hashchange", function(e, data){
            selectPage();
        });

        $(window).bind("lhnav.init", function(e, pubdata, privdata, cData, mainPubUrl, mainPrivUrl){
            prepareRenderNavigation(pubdata, privdata, cData, mainPubUrl, mainPrivUrl);
        });
        
        ///////////////////////
        // Widget has loaded //
        ///////////////////////
        
        $(window).trigger("lhnav.ready");

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("lhnavigation");

});
