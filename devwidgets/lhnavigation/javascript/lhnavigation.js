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
require(["jquery", "sakai/sakai.api.core", "jquery-ui"], function($, sakai) {

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

        var $lhnavigation_sakaidocs_declaration = $("#lhnavigation_sakaidocs_declaration"),
            $lhnavigation_sakaidocs_declaration_template = $("#lhnavigation_sakaidocs_declaration_template");

        ////////////////
        // DATA CACHE //
        ////////////////

        var privstructure = false;
        var pubstructure = false;
        var contextData = false;

        var parametersToCarryOver = {};
        var sakaiDocsInStructure = {};
        var currentPageShown = {};

        var doNotRenderSakaiDocsOnPaths = ["/content"];


        //////////////////////////////
        // Rendering the navigation //
        //////////////////////////////

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

        ////////////////////////
        // Update page counts //
        ////////////////////////

        var updateCounts = function(pageid, value, add){
            // Adjust the count value by the specified value for the page ID
            var oldid = pageid;
            if (add !== false) {
                add = true;
            }
            if (pageid.indexOf("/") !== -1){
                var parts = pageid.split("/");
                pageid = parts[0];
            }

            var adjustCount = function(pageStructure, pageid, value){
                var listitem = "li[data-sakai-path='";
                var count;
                var element;
                count = getPage(pageid, pageStructure.items);
                listitem = $(listitem + pageid + "']");
                element = ".lhnavigation_levelcount";
                if (add) {
                    count._count = (count._count || 0) + value;
                } else {
                    count._count = value;
                }
                if (count._childCount <= 1) {
                    element = ".lhnavigation_sublevelcount";
                }
                if (listitem.length) {
                    $(element, listitem).text(" (" + count._count + ")");
                    if (count._count <= 0){
                        $(element, listitem).hide();
                    } else {
                        $(element, listitem).show();
                    }
                }
                return pageStructure;
            };

            if (pubstructure.items[pageid]) {
                pubstructure = adjustCount(pubstructure, oldid, value);
            } else if (privstructure.items[pageid]) {
                privstructure = adjustCount(privstructure, oldid, value);
            }
        };

        //////////////////
        // Data storage //
        //////////////////

        var storeStructure = function(structure, savepath){
            sakai.api.Server.saveJSON(savepath, {
                "structure0": $.toJSON(structure)
            });
        };

        ////////////////////////////////////
        // Structure processing functions //
        ////////////////////////////////////

        /**
         * Given a path to a page in a structure, return the page
         *
         * @param {String} path The path to the page, ie. "syllabus/week1"
         * @param {Object} structure The structure to find the path in, ie. pubstructure.items
         * @return {Object} the page
         */
        var getPage = function(path, structure) {
            if (!structure)
                return null;
            if (path.indexOf("/") > -1) {                  
                structure = structure[path.split("/")[0]];
                path = path.substring(path.indexOf("/")+1);
                return getPage(path, structure);
            } else if (structure[path]){
                return structure[path];
            } else {
                return null;
            }
        };

        var getPageCount = function(pagestructure, pageCount){
            if (!pageCount){
                pageCount = 0;
            }
            for (var tl in pagestructure){
                if (pagestructure.hasOwnProperty(tl) && tl.substring(0, 1) !== "_"){
                    pageCount++;
                    if (pageCount >= 3) {
                        return 3;
                    }
                    pageCount = getPageCount(pagestructure[tl], pageCount);
                }
            }
            return pageCount;
        };

        var getPageContent = function(ref){
            if (privstructure.pages[ref]) {
                return privstructure.pages[ref];
            } else if (pubstructure.pages[ref]) {
                return pubstructure.pages[ref];
            } else {
                return false;
            }
        };

        var includeChildCount = function(structure){
            var childCount = 0;
            for (var level in structure){
                if (level && level.substring(0,1) !== "_"){
                    childCount++;
                    structure[level] = includeChildCount(structure[level]);
                } else if (level && level === "_altTitle"){
                    structure[level] = structure[level].replace("${user}", unescape(contextData.profile.basic.elements.firstName.value));
                }
            }
            structure._childCount = childCount;
            return structure;
        };

        var finishProcessData = function(structure, data, callback){
            // Include the childcounts for the pages
            structure.items = includeChildCount(structure.items);
            for (var page in data){
                if (page.substring(0,9) !== "structure" && page.substring(0,1) !== "_"){
                    structure.pages[page] = data[page];
                }
            }
            callback(structure);
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
                    finishProcessData(structure, data, callback);
                } else {
                    continueProcessData(structure, data, pids, callback);
                }
            } else {
                finishProcessData(structure, data, callback);
            }
        };

        ////////////////////////////////////////////
        // Insert referenced pooled content items //
        ////////////////////////////////////////////

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

        var modifyRef = function(level, pid) {
            for (var sublevel in level) {
                if (level[sublevel]._ref) {
                    level[sublevel]._ref = pid + "-" + level[sublevel]._ref;
                    modifyRef(level[sublevel], pid);
                }
                else if (sublevel.substring(0, 1) !== "_") {
                    modifyRef(level[sublevel], pid);
                }
            }
        };

        var insertDocStructure = function(structure0, docInfo, pid){
            for (var level in structure0){
                if (structure0[level]._pid && structure0[level]._pid === pid){
                    var docStructure = docInfo.structure0;
                    if (typeof docStructure === "string"){
                        docStructure = $.parseJSON(docStructure);
                    }
                    structure0[level] = $.extend(true, structure0[level], docStructure);
                    modifyRef(structure0[level], pid);
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

        var addDocUrlIntoStructure = function(structure, url){
            structure._poolpath = url;
            for (var i in structure){
                if (i.substring(0,1) !== "_" && typeof structure[i] !== "string"){
                    structure[i] = addDocUrlIntoStructure(structure[i], url);
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
                        if (data.results[i].status === 404 || data.results[i].status === 403) {
                            for (var level in structure.items) {
                                if (structure.items[level]._pid && structure.items[level]._pid === pids[i]) {
                                    structure.items[level]._canView = false;
                                    structure.items[level]._canEdit = false;
                                    structure.items[level]._canSubedit = false;
                                }
                            }
                        } else {
                            var docInfo = sakai.api.Server.cleanUpSakaiDocObject($.parseJSON(data.results[i].body));
                            docInfo.orderedItems = orderItems(docInfo.structure0);
                            sakaiDocsInStructure["/p/" + pids[i]] = docInfo;
                            addDocUrlIntoStructure(docInfo.structure0, "/p/" + pids[i]);
                            structure.items = insertDocStructure(structure.items, docInfo, pids[i]);
                            structure = insertDocPages(structure, docInfo, pids[i]);
                        }
                    }
                }
                finishProcessData(structure, data, callback);
            });
        };

        ///////////////////
        // Page ordering //
        ///////////////////

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

        //////////////////////////////
        // Rendering a content page //
        //////////////////////////////

        var getFirstSelectablePage = function(structure){
            var selected = false;
            var items = structure.orderedItems;
            var path = "";
            while (items.length > 0) {
                var i = 0;
                for (; i < items.length; i++) {
                    if (items[i]._canView !== false) {
                        if (items[i]._childCount > 1) { 
                            if (path.length != 0)
                                path = path + "/";
                            path = path + items[i]._id;
                            items = items[i]._elements;
                            break;
                        } 
                        else {
                            if (path.length != 0)
                                path = path + "/";
                            path = path + items[i]._id;
                            items = [];
                            break;
                        }
                    }
                }
                if (i == items.length)
                    break;
            }
            if (path.length != 0)
                selected = path;
            return selected;

        };

        var getFirstSubPage = function(structure, selected){
            var path = selected;
            var i = 0;
            for (; i < structure.orderedItems.length; i++) {
                if (structure.orderedItems[i]._canView !== false && structure.orderedItems[i]._id === selected) {
                    var items = structure.orderedItems[i]._elements;
                    while (items.length > 0) {
                        var ii = 0;
                        for (; ii < items.length; ii++) {
                            if (items[ii]._canView !== false) {
                                if (items[ii]._childCount > 1) {
                                    if (path.length != 0)
                                        path = path + "/";
                                    path = path + items[ii]._id;
                                    items = items[ii]._elements;
                                    break;
                                }
                                else {
                                  if (path.length != 0)
                                      path = path + "/";
                                  path = path + items[ii]._id;
                                  items = [];
                                  break;
                                }
                            }
                        }
                        if (items.length > 0 && ii == items.length)
                            return false;
                    }
                }
            }
            return path;
        };

        var checkPageExists = function(structure, selected){
            var structureFoundIn = false;
            if (selected.indexOf("/") !== -1){
                var splitted = selected.split("/");
                var item = structure.items[splitted[0]];
                if (item) {
                    var i = 1;
                    for (; i < splitted.length; i++) {
                        if (!item[splitted[i]]) {
                            break;
                        } else {
                            item = item[splitted[i]];
                        }
                    }
                    if ( i == splitted.length ) {
                        structureFoundIn = item;
                    }
                }
            } else {
                if (structure.items[selected]){
                    structureFoundIn = structure;
                }
            }
            return structureFoundIn;
        };        

        var selectPage = function(newPageMode){
            if (contextData.forceOpenPage) {
                $.bbq.pushState({
                    "l": contextData.forceOpenPage
                }, 0);
                contextData.forceOpenPage = false;
            } else {
                var state = $.bbq.getState("l");
                var selected = state || false;
                var structureFoundIn = false;
                // Check whether this page exist
                if (selected) {
                    structureFoundIn = checkPageExists(privstructure, selected) || checkPageExists(pubstructure, selected);
                    if (!structureFoundIn) {
                        selected = false;
                    }
                }
                // If it exists, check whether it has more than 1 subpage
                if (selected && selected.indexOf("/") === -1) {
                    if (structureFoundIn.items[selected]._childCount > 1) {
                        selected = getFirstSubPage(structureFoundIn, selected);
                    } else if (structureFoundIn.items[selected]._childCount == 1) {
                        if (structureFoundIn.items[selected]._elements.length > 0 && 
                            structureFoundIn.items[selected]._elements[0]._childCount &&
                            structureFoundIn.items[selected]._elements[0]._childCount > 1)
                          selected = getFirstSubPage(structureFoundIn, selected);
                    }
                }
                // If no page is selected, select the first one from the nav
                if (!selected) {
                    selected = getFirstSelectablePage(privstructure) || getFirstSelectablePage(pubstructure);
                }
                // Select correct item
                var menuitem = $("li[data-sakai-path='" + selected + "']");
                if (menuitem.length) {
                    if (selected.split("/").length > 1) {
                        for (var i = 0; i < selected.split("/").length; i++) {
                            var p = "";
                            for (var j = 0; j <= i; j++) {
                                if (j > 0)
                                    p = p + "/";
                                p = p + selected.split("/")[j];
                            }
                            var par = $("li[data-sakai-path='" + p + "']");
                            showHideSubnav(par, true);
                        }
                    }
                    var ref = menuitem.data("sakai-ref");
                    var savePath = menuitem.data("sakai-savepath") || false;
                    var pageSavePath = menuitem.data("sakai-pagesavepath") || false;
                    var canEdit = menuitem.data("sakai-submanage") || false;
                    var nonEditable = menuitem.data("sakai-noneditable") || false;
                    if (!menuitem.hasClass(navSelectedItemClass)) {
                        selectNavItem(menuitem, $(navSelectedItem));
                    }
                    // Render page
                    preparePageRender(ref, selected, savePath, pageSavePath, nonEditable, canEdit, newPageMode);
                }
            }
        };

        var preparePageRender = function(ref, path, savePath, pageSavePath, nonEditable, canEdit, newPageMode){
            var content = getPageContent(ref);
            var pageContent = content && content.page ? content.page : "";
            var lastModified = content && content._lastModified ? content._lastModified : null;
            var autosave = content && content.autosave ? content.autosave : null;
            var saveRef = ref;
            if (saveRef.indexOf("-") !== -1){
                saveRef = saveRef.substring(saveRef.indexOf("-") + 1);
            }
            currentPageShown = {
                "ref": ref,
                "path": path,
                "content": pageContent,
                "savePath": savePath,
                "pageSavePath": pageSavePath,
                "saveRef": saveRef,
                "canEdit": canEdit,
                "widgetData": [privstructure.pages, pubstructure.pages],
                "addArea": contextData.addArea,
                "nonEditable": nonEditable,
                "_lastModified": lastModified,
                "autosave": autosave
            };
            if (newPageMode) {
                $(window).trigger("editpage.sakaidocs.sakai", [currentPageShown]);
                contextMenuHover = {
                    path: currentPageShown.path,
                    ref: currentPageShown.ref,
                    pageSavePath: currentPageShown.pageSavePath,
                    savePath: currentPageShown.savePath
                };
                editPageTitle();
            } else {
                $(window).trigger("showpage.sakaidocs.sakai", [currentPageShown]);
            }
        };

        /////////////////////////
        // Contextual dropdown //
        /////////////////////////

        var contextMenuHover = false;

        var onContextMenuHover = function($el, $elLI){
            $(".lhnavigation_selected_submenu").hide();
            $("#lhnavigation_submenu").hide();
            if ($elLI.data("sakai-manage") && !$elLI.data("sakai-reorder-only")) {
                var additionalOptions = $elLI.data("sakai-addcontextoption");
                if (additionalOptions === "world"){
                    $("#lhnavigation_submenu_profile").attr("href", "/content#p=" + sakai.api.Util.urlSafe($elLI.data("sakai-pagesavepath").substring(3)));
                    $("#lhnavigation_submenu_profile_li").show();
                    $("#lhnavigation_submenu_permissions_li").show();
                } else if (additionalOptions === "user") {
                    $("#lhnavigation_submenu li").hide();
                    $("#lhnavigation_submenu_user_permissions_li").show();
                } else {
                    $("#lhnavigation_submenu_profile_li").hide();
                    $("#lhnavigation_submenu_permissions_li").hide();
                }
                contextMenuHover = {
                    path: $elLI.data("sakai-path"),
                    ref: $elLI.data("sakai-ref"),
                    pageSavePath: $elLI.data("sakai-pagesavepath"),
                    savePath: $elLI.data("sakai-savepath")
                };
                $(".lhnavigation_selected_submenu", $el).show();
            }
        };

        var onContextMenuLeave = function(){
            if (!$("#lhnavigation_submenu").is(":visible")) {
                $(".lhnavigation_selected_submenu").hide();
                $(".lhnavigation_selected_submenu_image").removeClass("clicked");
            }
        };

        var showContextMenu = function($clickedItem){
            var contextMenu = $("#lhnavigation_submenu");
            $clickedItem.children(".lhnavigation_selected_submenu_image").addClass("clicked");
            contextMenu.css("left", $clickedItem.position().left + 130 - 50 + "px");
            contextMenu.css("top", $clickedItem.position().top + 6 + "px");
            toggleContextMenu();
        };

        var toggleContextMenu = function(forceHide){
            var contextMenu = $("#lhnavigation_submenu");
            if (forceHide) {
                $(".lhnavigation_selected_submenu_image").removeClass("clicked");
                contextMenu.hide();
            } else {
                contextMenu.toggle();
            }
        };

        //////////////////////
        // Area permissions //
        //////////////////////

        var showAreaPermissions = function(){
            toggleContextMenu(true);
            $(window).trigger("permissions.area.trigger", [contextMenuHover]);
        };

        //////////////////////
        // User permissions //
        //////////////////////

        var showUserPermissions = function(){
            toggleContextMenu(true);
            $(window).trigger("permissions.area.trigger", [contextMenuHover]);
        };

        //////////////////////////////////
        // Adding a new page or subpage //
        //////////////////////////////////

        var addTopPage = function(){
            var newpageid = sakai.api.Util.generateWidgetId();
            var neworder = pubstructure.orderedItems.length;

            var pageContent = "Default content";
            var pageToCreate = {
                "_ref": newpageid,
                "_title": "Untitled Page",
                "_order": neworder,
                "_canSubedit": true,
                "_canEdit": true,
                "_poolpath": currentPageShown.savePath,
                "main":{
                    "_ref": newpageid,
                    "_order": 0,
                    "_title": "Untitled Page",
                    "_childCount": 0,
                    "_canSubedit": true,
                    "_canEdit": true,
                    "_poolpath": currentPageShown.savePath
                },
                "_childCount":1
            };

            pubstructure.pages[newpageid] = {};
            sakaiDocsInStructure[contextData.puburl][newpageid] = {};

            pubstructure.pages[newpageid].page = pageContent;
            sakaiDocsInStructure[contextData.puburl][newpageid].page = pageContent;

            pubstructure.items[newpageid] = pageToCreate;
            pubstructure.items._childCount++;
            sakaiDocsInStructure[currentPageShown.savePath].structure0[newpageid] = pageToCreate;
            sakaiDocsInStructure[currentPageShown.savePath].orderedItems = orderItems(sakaiDocsInStructure[currentPageShown.savePath].structure0);

            renderData();
            addParametersToNavigation();
            $(window).trigger("sakai.contentauthoring.needsTwoColumns");
            $.bbq.pushState({
                "l": newpageid,
                "newPageMode": "true"
            }, 0);
            enableSorting();
        };

        var addSubPage = function(){
            var newpageid = sakai.api.Util.generateWidgetId();
            var neworder = sakaiDocsInStructure[currentPageShown.pageSavePath].orderedItems.length;

            var fullRef = currentPageShown.pageSavePath.split("/p/")[1] + "-" + newpageid;
            var basePath = currentPageShown.path.split("/")[0];

            var pageContent = "Default content";
            var pageToCreate = {
                "_ref": fullRef,
                "_title": "Untitled Page",
                "_order": neworder,
                "_canSubedit": true,
                "_canEdit": true,
                "_poolpath": currentPageShown.pageSavePath,
                "main":{
                    "_ref": fullRef,
                    "_order": 0,
                    "_title": "Untitled Page",
                    "_childCount": 0,
                    "_canSubedit": true,
                    "_canEdit": true,
                    "_poolpath": currentPageShown.pageSavePath
                },
                "_childCount":1
            };
            var pageToCreate1 = {
                "_ref": newpageid,
                "_title": "Untitled Page",
                "_order": neworder,
                "_canSubedit": true,
                "_canEdit": true,
                "_poolpath": currentPageShown.pageSavePath,
                "main":{
                    "_ref": newpageid,
                    "_order": 0,
                    "_title": "Untitled Page",
                    "_childCount": 0,
                    "_canSubedit": true,
                    "_canEdit": true,
                    "_poolpath": currentPageShown.pageSavePath
                },
                "_childCount":1
            };

            pubstructure.pages[fullRef] = {};
            sakaiDocsInStructure[currentPageShown.pageSavePath][newpageid] = {};

            pubstructure.pages[fullRef].page = pageContent;
            sakaiDocsInStructure[currentPageShown.pageSavePath][newpageid].page = pageContent;

            pubstructure.items[basePath][newpageid] = pageToCreate;
            pubstructure.items[basePath]._childCount++;

            sakaiDocsInStructure[currentPageShown.pageSavePath].structure0[newpageid] = pageToCreate1;
            sakaiDocsInStructure[currentPageShown.pageSavePath].orderedItems = orderItems(sakaiDocsInStructure[currentPageShown.pageSavePath].structure0);

            renderData();
            addParametersToNavigation();
            $(window).trigger("sakai.contentauthoring.needsTwoColumns");
            $.bbq.pushState({
                "l": currentPageShown.path.split("/")[0] + "/" + newpageid,
                "newPageMode": "true"
            }, 0);
            enableSorting();
        };

        /////////////////////
        // Renaming a page //
        /////////////////////

        var changingPageTitle = false;

        var checkSaveEditPageTitle = function(ev){
            $(window).unbind("click", checkSaveEditPageTitle);
            if (!$(ev.target).is("input") && changingPageTitle) {
                savePageTitle();
            }
        };

        var editPageTitle = function(){
            // Select correct item
            var menuitem = $("li[data-sakai-path='" + contextMenuHover.path + "'] > div");
            changingPageTitle = jQuery.extend(true, {}, contextMenuHover);

            var pageTitle = $(".lhnavigation_page_title_value", menuitem);
            var inputArea = $(".lhnavigation_change_title", menuitem);
            inputArea.show();
            inputArea.val($.trim(pageTitle.text()));
            
            pageTitle.hide();

            // Hide the dropdown menu
            toggleContextMenu(true);
            inputArea.focus();
            inputArea.select();
        };

        var savePageTitle = function(){
            var menuitem = $("li[data-sakai-path='" + changingPageTitle.path + "'] > div");

            var inputArea = $(".lhnavigation_change_title", menuitem);
            inputArea.hide();

            var pageTitle = $(".lhnavigation_page_title_value", menuitem);
            pageTitle.text(inputArea.val());
            pageTitle.show();

            // Change main structure
            var mainPath = changingPageTitle.path;
            var page = getPage(mainPath, pubstructure.items);
            page._title = inputArea.val();
            // Look up appropriate doc and change that structure
            var structure = sakaiDocsInStructure[changingPageTitle.savePath];
            if (mainPath.indexOf("/") != -1)
              if (!structure.structure0[mainPath.substring(0, mainPath.indexOf("/"))])
                  mainPath = mainPath.substring(mainPath.indexOf("/") + 1);
            var substructure = getPage(mainPath, structure.structure0);
            substructure._title = inputArea.val();
            storeStructure(structure.structure0, changingPageTitle.savePath);

            changingPageTitle = false;
        };

        /////////////////////
        // Deleting a page //
        /////////////////////

        var pageToDelete = false;

        var deletePage = function(){
            // Look up appropriate doc and change that structure
            var structure = sakaiDocsInStructure[pageToDelete.savePath];
            var realRef = pageToDelete.ref;
            if (pageToDelete.ref.indexOf("-") !== -1){
                realRef = pageToDelete.ref.split("-")[1];
            }
            var realPath = pageToDelete.path;
            var areaid = "";
            if (pageToDelete.path.indexOf("/") !== -1){
                var splited = pageToDelete.path.split("/");
                if (!structure.structure0[splited[0]]) {
                    areaid = splited[0];
                    realPath = pageToDelete.path.substring(pageToDelete.path.indexOf("/") + 1);
                }
            }
            updateCountsAfterDelete(structure.structure0, structure, structure.orderedItems, realRef, realPath);
            structure.structure0 = includeChildCount(structure.structure0);
            structure.orderedItems = orderItems(structure.structure0);
            storeStructure(structure.structure0, pageToDelete.savePath);

            // Change the main structure
            updateCountsAfterDelete(pubstructure.items, pubstructure.pages, pubstructure.orderedItems, pageToDelete.ref, pageToDelete.path);
            if (getPageCount(pubstructure.items) < 3){
                $(window).trigger("sakai.contentauthoring.needsOneColumn");
            }

            // Re-render the navigation
            renderData();
            addParametersToNavigation();
            enableSorting();

            // Move away from the current page
            if (pageToDelete.path.indexOf("/") !== -1){
                if (getPageCount(structure.structure0) < 3) {
                    $.bbq.pushState({
                        "l": pageToDelete.path.split("/")[0],
                        "_": Math.random(),
                        "newPageMode": ""
                    }, 0);
                } else {
                    var selected = getFirstSelectablePage(structure);
                    $.bbq.pushState({
                        "l": areaid + "/" + selected,
                        "_": Math.random(),
                        "newPageMode": ""
                    }, 0);
                }
            } else {
                $.bbq.pushState({
                    "l": "",
                    "_": Math.random(),
                    "newPageMode": ""
                }, 0);
            }
            $('#lhnavigation_delete_dialog').jqmHide();
        };

        var checkPageDelete = function (item, ref) {
            if (item._ref === ref)
              return false;
            for (var i = 0; i < item._elements.length; i ++) {
                if (!checkPageDelete(item._elements[i], ref)) {
                    return false;
                }
            }
            return true;
        };

        var updateCountsAfterDelete = function(structure, pageslist, orderedItems, ref, path){
            var oldOrder = 0;
            if (path.indexOf("/") !== -1){
                var parts = path.split("/");
                var father = structure;
                var loc = parts.length - 1;
                for (var i = 0; i < loc; i ++) {
                    father = father[parts[i]];
                }
                oldOrder = father[parts[loc]]._order;
                delete father[parts[loc]];
                var orderedfather;
                for (var i = 0; i < orderedItems.length; i++) {
                    if (parts[0] === orderedItems[i]._id) {
                        orderedfather = orderedItems[i];
                    }
                }
                for (var i = 1; i < loc; i ++) {
                    for (var j = 0; j < orderedfather._elements.length; j++) {
                        if (orderedfather._elements[j]._id === parts[i]) {
                            orderedfather = orderedfather._elements[j];
                            break;
                        }
                    }
                }
                orderedfather._elements.splice(oldOrder, 1);
                orderedfather._childCount = orderedfather._childCount - 1;
                for (var i = 0; i < orderedfather._elements.length; i++) {
                    if ( orderedfather._elements[i]._order > oldOrder) {
                        orderedfather._elements[i]._order --;
                    }
                    if (father[orderedfather._elements[i]._id]._order > oldOrder) {
                        father[orderedfather._elements[i]._id]._order --;
                    }
                }
            } else {
                oldOrder = structure[path]._order;
                delete structure[path];
                orderedItems.splice(oldOrder, 1);
                for (var z = oldOrder; z < orderedItems.length; z++){
                    orderedItems[z]._order = z;
                    structure[orderedItems[z]._id]._order = z;
                }
            }
            var page = true;
            for (var i = 0; i < orderedItems.length; i++) {
                if (!checkPageDelete(orderedItems[i], ref)) {
                    page = false;
                    break;
                }
            }
            if (page)
                delete pageslist[ref];
        };

        var confirmPageDelete = function(){
            pageToDelete = jQuery.extend(true, {}, contextMenuHover);
            $('#lhnavigation_delete_dialog').jqmShow();
            toggleContextMenu(true);
        };

        // Init delete dialog
        $('#lhnavigation_delete_dialog').jqm({
            modal: true,
            overlay: 20,
            toTop: true
        });

        /////////////////////////////////////////////
        // Add additional parameters to navigation //
        /////////////////////////////////////////////

        var storeNavigationParameters = function(params){
            for (var p in params){
                parametersToCarryOver[p] = params[p];
            }
            addParametersToNavigation();
        };

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
            // don't open if the click is a result of a sort operation
            var $elLI = $el.parent("li");
            if ($elLI.hasClass("lhnavigation_hassubnav") && !$(ev.target).hasClass("lhnavigation_selected_submenu_image")) {
                showHideSubnav($elLI);
            }
        };

        sakai.api.Util.hideOnClickOut("#lhnavigation_submenu", ".lhnavigation_selected_submenu_image");

        var showHideSubnav = function($el, forceOpen){
            $el.children(".lhnavigation_selected_item_subnav").show();
            if ($el.hasClass("lhnavigation_hassubnav")) {
                if (!$el.children("ul:first").is(":visible") || forceOpen) {
                    $(".lhnavigation_has_subnav:first", $el).addClass("lhnavigation_has_subnav_opened");
                    $el.children("ul:first").show();
                } else {
                    $(".lhnavigation_has_subnav:first", $el).removeClass("lhnavigation_has_subnav_opened");
                    $el.children("ul:first").hide();
                }
            }
            $(".s3d-page-column-right").css("min-height", $(".s3d-page-column-left").height());
        };

        ////////////////////////////
        // Navigation re-ordering //
        ////////////////////////////

        var handleReorder = function(e, ui) {
            var $target = $(e.target);
            var savePath = $target.children("li:first").data("sakai-savepath");
            var structure = sakaiDocsInStructure[savePath];
            var area = privstructure;
            if ($target.data("sakai-space") === "public") {
                area = pubstructure;
            }
            $target.children("li").each(function(i, elt) {
                var path = $(elt).data("sakai-path");
                var struct0path = path;
                if ($(elt).data("sakai-ref").indexOf("-") === -1) {
                    if (struct0path.indexOf("/") > -1) {
                        var page = getPage(struct0path, structure.structure0);
                        page._order = i;
                    } else {
                        structure.structure0[struct0path]._order = i;
                    }
                } else {
                    if (struct0path.indexOf("/") > -1) {
                        struct0path = struct0path.substring(struct0path.indexOf("/") + 1);
                        var page = getPage(struct0path, structure.structure0);
                        page._order = i;
                    } else {
                        structure.structure0[struct0path]._order = i;
                    }
                }
                var item = getPage(path, area.items);
                item._order = i;
            });
            storeStructure(structure.structure0, savePath);
            e.stopImmediatePropagation();
        };

        var enableSorting = function() {
            $("#lhnavigation_container .lhnavigation_menu_list").sortable({
                items: "li.lhnavigation_outer[data-sakai-manage=true]",
                update: handleReorder
            });
            $("#lhnavigation_container .lhnavigation_subnav").sortable({
                items: "li.lhnavigation_subnav_item[data-sakai-manage=true]",
                update: handleReorder
            });
            $(".lhnavigation_menuitem[data-sakai-manage=true]").addClass("lhnavigation_move_cursor");
        };

        //////////////////////////////////////
        // Prepare the navigation to render //
        //////////////////////////////////////

        var renderNavigation = function(pubdata, privdata, cData, mainPubUrl, mainPrivUrl){
            cData.puburl = mainPubUrl;
            cData.privurl = mainPrivUrl;
            if (mainPubUrl) {
                sakaiDocsInStructure[mainPubUrl] = $.extend(true, {}, pubdata);
                sakaiDocsInStructure[mainPubUrl].orderedItems = orderItems(sakaiDocsInStructure[mainPubUrl].structure0);
            }
            if (mainPrivUrl) {
                sakaiDocsInStructure[mainPrivUrl] = $.extend(true, {}, privdata);
                sakaiDocsInStructure[mainPrivUrl].orderedItems = orderItems(sakaiDocsInStructure[mainPrivUrl].structure0);
            }
            contextData = cData;
            processData(privdata, cData.privurl, function(processedPriv){
                privstructure = processedPriv;
                processData(pubdata, cData.puburl, function(processedPub){
                    pubstructure = processedPub;
                    renderData();
                    selectPage();
                    enableSorting();
                    if (cData.parametersToCarryOver) {
                        parametersToCarryOver = cData.parametersToCarryOver;
                        addParametersToNavigation();
                    }
                });
            });
        };

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
                // Don't render sakaidocs on paths in the doNotRenderSakaiDocsOnPaths array
                // so we don't double-render it on those that already include it
                if ($.inArray(window.location.path, doNotRenderSakaiDocsOnPaths) === -1) {
                    sakai.api.Util.TemplateRenderer($lhnavigation_sakaidocs_declaration_template, {}, $lhnavigation_sakaidocs_declaration);
                }
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

        $(".lhnavigation_item_content, .lhnavigation_subnav_item_content").live("mouseenter", function(){
            onContextMenuHover($(this), $(this).parent("li"));
        });

        $("#sakaidocs_addpage_top").live("click", function(){
            addTopPage();
        });

        $("#sakaidocs_addpage_area").live("click", function(){
            addSubPage();
        });

        $("#lhavigation_submenu_edittitle").live("click", function(ev){
            editPageTitle();
            ev.stopPropagation();
            $(window).bind("click", checkSaveEditPageTitle);
        });

        $("#lhnavigation_submenu_permissions").live("click", function(ev){
            showAreaPermissions();
        });

        $("#lhnavigation_submenu_user_permissions").live("click", function(ev){
            showUserPermissions();
        });

        $(".lhnavigation_change_title").live("keyup", function(ev){
            if (ev.keyCode === 13 && changingPageTitle) {
                savePageTitle();
            }
        });

        $(".lhnavigation_change_title").live("blur", function(ev){
            if (changingPageTitle) {
                savePageTitle();
            }
        });

        $("#lhavigation_submenu_deletepage").live("click", function(ev){
            confirmPageDelete();
        });

        $("#lhnavigation_delete_confirm").live("click", function(ev){
            deletePage();
        });

        $(".lhnavigation_item_content, .lhnavigation_subnav_item_content").live("mouseleave", function(){
            onContextMenuLeave();
        });

        $(".lhnavigation_item_content").live("click", function(ev){
            processNavigationClick($(this), ev);
        });

        ////////////////////////////
        // External event binding //
        ////////////////////////////

        $(window).bind("lhnav.addHashParam", function(ev, params){
            storeNavigationParameters(params);
        });
        var handleHashChange = function(e, changed, deleted, all, currentState, first) {
            if (!($.isEmptyObject(changed) && $.isEmptyObject(deleted))) {
                selectPage(all && all.newPageMode && all.newPageMode === "true");
            }
        };
        $(window).bind("hashchanged.lhnavigation.sakai", handleHashChange);

        $(window).bind("lhnav.init", function(e, pubdata, privdata, cData, mainPubUrl, mainPrivUrl){
            prepareRenderNavigation(pubdata, privdata, cData, mainPubUrl, mainPrivUrl);
        });

        $(window).bind("lhnav.updateCount", function(e, pageid, value, add){
            updateCounts(pageid, value, add);
        });

        ///////////////////////
        // Widget has loaded //
        ///////////////////////

        $(window).trigger("lhnav.ready");

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("lhnavigation");

});
