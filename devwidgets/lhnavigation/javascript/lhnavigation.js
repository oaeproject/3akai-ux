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

        ////////////////
        // DATA CACHE //
        ////////////////

        var privstructure = false;
        var pubstructure = false;
        var contextData = false;

        var parametersToCarryOver = {};
        var sakaiDocsInStructure = {};
        var currentPageShown = {};


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

        var updateCounts = function(pageid, value){
            // Adjust the count value by the specified value for the page ID
            if (pubstructure.items[pageid]) {
                pubstructure.items[pageid]._count = (pubstructure.items[pageid]._count || 0) + value;
                var listitem = $("li[data-sakai-path='" + pageid + "']");
                if (listitem.length) {
                    $(".lhnavigation_levelcount", listitem).text(" (" + pubstructure.items[pageid]._count + ")");
                    if (pubstructure.items[pageid]._count <= 0){
                        $(".lhnavigation_levelcount", listitem).hide();
                    } else {
                        $(".lhnavigation_levelcount", listitem).show();
                    }
                }
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
            if (structure.orderedItems) {
                for (var i = 0; i < structure.orderedItems.length; i++) {
                    if (structure.orderedItems[i]._canView !== false) {
                        if (structure.orderedItems[i]._childCount > 1) {
                            for (var ii = 0; ii < structure.orderedItems[i]._elements.length; ii++) {
                                selected = structure.orderedItems[i]._id + "/" + structure.orderedItems[i]._elements[ii]._id;
                                break;
                            }
                        }
                        else {
                            selected = structure.orderedItems[i]._id;
                        }
                        break;
                    }
                }
            }
            return selected;
        };

        var getFirstSubPage = function(structure, selected){
            for (var i = 0; i < structure.orderedItems.length; i++) {
                if (structure.orderedItems[i]._canView !== false && structure.orderedItems[i]._id === selected) {
                    for (var ii = 0; ii < structure.orderedItems[i]._elements.length; ii++) {
                        selected = structure.orderedItems[i]._id + "/" + structure.orderedItems[i]._elements[ii]._id;
                        break;
                    }
                }
            }
            return selected;
        };

        var checkPageExists = function(structure, selected){
            var structureFoundIn = false;
            if (selected.indexOf("/") !== -1){
                var splitted = selected.split("/");
                if (structure.items[splitted[0]] && structure.items[splitted[0]][splitted[1]]){
                    structureFoundIn = structure;
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
                        var par = $("li[data-sakai-path='" + selected.split("/")[0] + "']");
                        showHideSubnav(par, true);
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
                if (additionalOptions){
                    $("#lhnavigation_submenu_profile").attr("href", "/content#p=" + sakai.api.Util.urlSafe($elLI.data("sakai-pagesavepath").substring(3)));
                    $("#lhnavigation_submenu_profile_li").show();
                    $("#lhnavigation_submenu_permissions_li").show();
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
            if(!$(ev.target).is("input")){
                $(window).unbind("click", checkSaveEditPageTitle);
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
            if (changingPageTitle.path.indexOf("/") !== -1){
                var parts = changingPageTitle.path.split("/");
                mainPath = parts[1];
                pubstructure.items[parts[0]][parts[1]]._title = inputArea.val();
            } else {
                pubstructure.items[changingPageTitle.path]._title = inputArea.val();
            }
            // Look up appropriate doc and change that structure
            var structure = sakaiDocsInStructure[changingPageTitle.savePath];
            structure.structure0[mainPath]._title = inputArea.val();
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
            if (pageToDelete.path.indexOf("/") !== -1){
                realPath = pageToDelete.path.split("/")[1];
            }
            updateCountsAfterDelete(structure.structure0, structure, structure.orderedItems, realRef, realPath);
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
                        "l": pageToDelete.path.split("/")[0] + "/" + selected,
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

        var updateCountsAfterDelete = function(structure, pageslist, orderedItems, ref, path){
            var oldOrder = 0;
            if (path.indexOf("/") !== -1){
                var parts = path.split("/");
                oldOrder = structure[parts[0]][parts[1]]._order;
                delete structure[parts[0]][parts[1]];
                for (var i = 0; i < orderedItems.length; i++){
                    if (orderedItems[i]._pid === ref.split("-")[0]){
                        orderedItems[i]._elements.splice(oldOrder, 1);
                        orderedItems[i]._childCount--;
                        for (var o = oldOrder; o < orderedItems[i]._elements.length; o++){
                            orderedItems[i]._elements[o]._order = o;
                            structure[orderedItems[i]._id][orderedItems[i]._elements[o]._id]._order = o;
                        }
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
                    $(".lhnavigation_has_subnav", $el).addClass("lhnavigation_has_subnav_opened");
                    $el.children("ul:first").show();
                } else {
                    $(".lhnavigation_has_subnav", $el).removeClass("lhnavigation_has_subnav_opened");
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
                        var split = struct0path.split("/");
                        structure.structure0[split[0]][split[1]]._order = i;
                    } else {
                        structure.structure0[struct0path]._order = i;
                    }
                } else {
                    if (struct0path.indexOf("/") > -1) {
                        struct0path = struct0path.split("/")[1];
                    }
                    structure.structure0[struct0path]._order = i;
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

        $(".lhnavigation_change_title").live("blur", function(ev){
            savePageTitle();
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

        $(window).bind("hashchange", function(e, data){
            selectPage($.bbq.getState("newPageMode") === "true");
        });

        $(window).bind("lhnav.init", function(e, pubdata, privdata, cData, mainPubUrl, mainPrivUrl){
            prepareRenderNavigation(pubdata, privdata, cData, mainPubUrl, mainPrivUrl);
        });

        $(window).bind("lhnav.updateCount", function(e, pageid, value){
            updateCounts(pageid, value);
        });

        ///////////////////////
        // Widget has loaded //
        ///////////////////////

        $(window).trigger("lhnav.ready");

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("lhnavigation");

});
