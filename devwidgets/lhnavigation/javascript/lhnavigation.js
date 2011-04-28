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
        }

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
        }

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
        }
        
        var calculateOrder = function(){
            if (privstructure && privstructure.items){
                privstructure.orderedItems = orderItems(privstructure.items);
            }
            if (pubstructure && pubstructure.items){
                pubstructure.orderedItems = orderItems(pubstructure.items);
            }
        }

        var renderData = function(){
            calculateOrder();
            $("#lhnavigation_container").html(sakai.api.Util.TemplateRenderer("lhnavigation_template", {
                "private": privstructure,
                "public": pubstructure,
                "contextData": contextData,
                "parametersToCarryOver": parametersToCarryOver
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
                    if (level.substring(0, 1) !== "_") {
                        structure.items[level] = includeChildCount(structure.items[level]);
                    }
                }
            }
            for (var page in data){
                if (page.substring(0,9) !== "structure" && page.substring(0,1) !== "_"){
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
                for (var first = 0; first < pubstructure.orderedItems.length; first++){
                    if (pubstructure.orderedItems[first]._childCount > 1) {
                        for (var second = 0; second < pubstructure.orderedItems[first]._elements.length; second++){
                            selected = pubstructure.orderedItems[first]._id + "/" + pubstructure.orderedItems[first]._elements[second]._id;
                            break;
                        }
                    } else {
                        selected = pubstructure.orderedItems[first]._id;
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

        }

        var renderPage = function(ref, path, savePath, reload){
            sakai.api.Widgets.nofityWidgetShown("#s3d-page-main-content > div:visible", false);
            $("#s3d-page-main-content > div:visible").hide();
            var content = getPageContent(ref);
            currentPageShown = {
                "ref": ref,
                "path": path,
                "content": content,
                "savePath": savePath
            };
            if ($("#s3d-page-main-content #" + ref).length > 0){
                if (reload){
                    createPageToShow(ref, path, content, savePath);
                }
                $("#s3d-page-main-content #" + ref).show();
                sakai.api.Widgets.nofityWidgetShown("#"+ref, true);
            } else {
                createPageToShow(ref, path, content, savePath);
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

        var currentPageShown = {};
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
        }
        
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        // Temporarily deal with pages as documents here //
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        
        /**
         * Edit button
         */
        $("#lhnav_editpage").live("click", function(){
            editPage();
        });
        
        var editPage = function(){
            isEditingNewPage = false;
            $("#lhnav_editmode").show();
            $("#s3d-page-main-content").hide();
            var content = currentPageShown.content || "";
            tinyMCE.get("elm1").setContent(content, {format : 'raw'});
        }
        
        /**
         * Cancel button
         */
        $("#lhnav_edit_cancel_button").live("click", function(){
            cancelEditPage();
        });
        
        var cancelEditPage = function(){
            $("#lhnav_editmode").hide();
            $("#context_menu").hide();
            $("#s3d-page-main-content").show();
        }
        
        /**
         * Save button
         */
        $("#lhnav_edit_save_button").live("click", function(){
            savePage();
        });
        
        var savePage = function(){
            $("#context_menu").hide();
            currentPageShown.content = getTinyMCEContent();
            if (pubstructure.pages[currentPageShown.ref]){
                pubstructure.pages[currentPageShown.ref].page = currentPageShown.content;
            } else if (privstructure.pages[currentPageShown.ref]){
                privstructure.pages[currentPageShown.ref].page = currentPageShown.content;
            }
            renderPage(currentPageShown.ref, currentPageShown.path, currentPageShown.savePath, true);
            $("#lhnav_editmode").hide();
            $("#s3d-page-main-content").show();
            
            //Store the edited content
            var toStore = {};
            toStore[currentPageShown.ref] = {
                "page": currentPageShown.content
            }
            $.ajax({
                url: currentPageShown.savePath + ".resource",
                type: "POST",
                dataType: "json",
                data: {
                    ":operation": "import",
                    ":contentType": "json",
                    ":replace": true,
                    ":replaceProperties": true,
                    "_charset_":"utf-8",
                    ":content": $.toJSON(toStore)
                }           
            });
            if (isEditingNewPage){
                $.ajax({
                    url: currentPageShown.savePath,
                    type: "POST",
                    dataType: "json",
                    data: {
                        "structure0": $.toJSON(pubstructure.items)
                    }           
                });
            }
        }
        
        /**
         * Add a page to the document
         */
        $("#lhnav_addpage").live("click", function(ev){
            addPage();
        });
        
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
            editPage();
            rerenderNavigation();
            editPageTitle();
            isEditingNewPage = true;
        }
        
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
            var menuitem = $("li[data-sakai-path='" + currentPageShown.path + "']");
            var inputArea = $(".lhnavigation_change_title", menuitem);
            var pageTitle = $(".lhnavigation_toplevel", menuitem);

            pageTitle.hide();
            inputArea.show();
            inputArea.val($.trim(pageTitle.text()));
            inputArea.focus();
            
            // Hide the dropdown menu
            toggleSubmenu(true);
        }
        
        var savePageTitle = function(){
            var menuitem = $("li[data-sakai-path='" + currentPageShown.path + "']");
            var inputArea = $(".lhnavigation_change_title", menuitem);
            var pageTitle = $(".lhnavigation_toplevel", menuitem);
            inputArea.hide();
            pageTitle.text(inputArea.val());
            pageTitle.show();

            pubstructure.items[currentPageShown.path]._title = inputArea.val();
            $.ajax({
                url: currentPageShown.savePath,
                type: "POST",
                dataType: "json",
                data: {
                    "structure0": $.toJSON(pubstructure.items)
                }           
            });

        }
        
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
        }
        
        var deletePage = function(){
            if (pubstructure.pages[currentPageShown.ref]){
                updateCountsAfterDelete(pubstructure, currentPageShown.ref, currentPageShown.path);
                if (getPageCount(pubstructure.items) < 3){
                    $(window).trigger("sakai.contentauthoring.needsOneColumn");
                }
            } else if (privstructure.pages[currentPageShown.ref]){
                updateCountsAfterDelete(privstructure, currentPageShown.ref, currentPageShown.path);
                if (getPageCount(privstructure.pages) < 3){
                    $(window).trigger("sakai.contentauthoring.needsOneColumn");
                }
            }
            renderData();
            rerenderNavigation();
            $.bbq.pushState({"l": "", "_": Math.random()}, 0);
            isEditingNewPage = false;
            $.ajax({
                url: currentPageShown.savePath,
                type: "POST",
                dataType: "json",
                data: {
                    "structure0": $.toJSON(pubstructure.items)
                }
            });
        }
        
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
        
        /**
         * Get content out of tinyMCE editor
         */
        var getTinyMCEContent = function(){
            var content = tinyMCE.get("elm1").getContent({format : 'raw'});
            content = content.replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
            return content;
        }
        
        /**
         * Renders the insert dropdown menu
         */
        var renderInsertDropdown = function(pageEmbedProperty){
            // Vars for media and goodies
            var media = {}; media.items = [];
            var goodies = {}; goodies.items = [];
            
            // Fill in media and goodies
            for (var i in sakai.widgets){
                if (i) {
                    var widget = sakai.widgets[i];
                    if (widget[pageEmbedProperty] && widget.showinmedia) {
                        media.items.push(widget);
                    }
                    if (widget[pageEmbedProperty] && widget.showinsakaigoodies) {
                        goodies.items.push(widget);
                    }
                }
            }

            var jsonData = {
                "media": media,
                "goodies": goodies
            };

            // Renderer dropdown list
            sakai.api.Util.TemplateRenderer($("#sitepages_insert_dropdown_template"), jsonData, $("#sitepages_insert_dropdown_container"));

            // Event handler
            $('#insert_dialog').jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                onHide: hideSelectedWidget
            });

        };
        
        /**
         * Hide selected widget
         * @param {Object} hash
         * @return void
         */
        var hideSelectedWidget = function(hash){
            hash.w.hide();
            hash.o.remove();
            currentlySelectedWidget = false;
            $("#dialog_content").html("").hide();
        };

        // add bindings
        $("#sitepages_insert_dropdown_button").live("click", function(){
            // hide dropdown
            showHideInsertDropdown();
        });

        $(".insert_dropdown_widget_link").live("click", function(){
            // hide dropdown
            showHideInsertDropdown(true);

            // restore the cursor position in the editor
            if (bookmark) {
                tinyMCE.get("elm1").focus();
                tinyMCE.get("elm1").selection.moveToBookmark(bookmark);
            }
            bookmark = false;

            var id = $(this).attr("id");
            if (id==="link") {
                $('#link_dialog').jqmShow();
            } else if (id==="hr") {
                tinyMCE.get("elm1").execCommand('InsertHorizontalRule');
            } else {
                renderSelectedWidget(id);
            }
        });
        
        /**
         * Shows or hides the insert dropdown menu
         */
        var showHideInsertDropdown = function(hideOnly){
            var el = $("#sitepages_insert_dropdown");
            if (el) {
                if ((el.css("display") && el.css("display").toLowerCase() !== "none") || hideOnly) {
                    $("#sitepages_insert_dropdown_button").removeClass("clicked");
                    el.hide();
                } else if (el.css("display")) {
                    $("#sitepages_insert_dropdown_button").addClass("clicked");
                    var x = $("#sitepages_insert_dropdown_button").position().left;
                    var y = $("#sitepages_insert_dropdown_button").position().top;
                    el.css({
                        "top": y + 28 + "px",
                        "left": x + "px"
                    }).show();
                }
            }
        };
        
        var currentlySelectedWidget = false;
        
        /**
         * Render selected widget
         * @param {Object} hash
         * @return void
         */
        var renderSelectedWidget = function(widgetid) {
            var $dialog_content = $("#dialog_content");
            var widgetSettingsWidth = 650;
            $dialog_content.hide();
            if (sakai.widgets[widgetid]){
                var tuid = Math.round(Math.random() * 1000000000);
                var id = "widget_" + widgetid + "_" + tuid;
                currentlySelectedWidget = {
                    "widgetname": widgetid,
                    "uid": id
                }
                $dialog_content.html(sakai.api.Security.saneHTML('<img src="' + sakai.widgets[widgetid].img + '" id="' + id + '" class="widget_inline" border="1"/>'));
                $("#dialog_title").html(sakai.widgets[widgetid].name);
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid,true,currentPageShown.savePath + "/");
                if (sakai.widgets[widgetid].settingsWidth) {
                    widgetSettingsWidth = sakai.widgets[widgetid].settingsWidth;
                }
                $dialog_content.show();
                window.scrollTo(0,0);
            } else if (!widgetid){
                window.scrollTo(0,0);
            }
            $('#insert_dialog').css({'width':widgetSettingsWidth + "px", 'margin-left':-(widgetSettingsWidth/2) + "px"}).jqmShow();
        };
        
        var updatingExistingWidget = false;
        
        /**
         * Insert widget modal Cancel button - hide modal
         * @param {Object} tuid
         * @retuen void
         */
        sakai_global.lhnavigation.widgetCancel = function(tuid){
            $('#insert_dialog').jqmHide();
        };

        /**
         * Widget finish - add widget to editor, hide modal
         * @param {Object} tuid
         * @return void
         */
        sakai_global.lhnavigation.widgetFinish = function(tuid){
            // Add widget to the editor
            if (!updatingExistingWidget) {
                tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<img src="' + sakai.widgets[currentlySelectedWidget.widgetname].img + '" id="' + currentlySelectedWidget.uid + '" class="widget_inline" style="display:block; padding: 10px; margin: 4px" border="1"/>');
            }
            updatingExistingWidget = false;
            $('#insert_dialog').jqmHide();
        };
        
        /**
         * Register the appropriate widget cancel and save functions
         */
        sakai.api.Widgets.Container.registerFinishFunction(sakai_global.lhnavigation.widgetFinish);
        sakai.api.Widgets.Container.registerCancelFunction(sakai_global.lhnavigation.widgetCancel);
        
        $(document.body).append($("#context_menu"));
        
        /**
         * tinyMCE selection event handler
         * @retun void
         */
        var mySelectionEvent = function(){
            var $context_menu = $("#context_menu");
            var $context_settings = $("#context_settings");
            var ed = tinyMCE.get('elm1');
            $context_menu.hide();
            var selected = ed.selection.getNode();
            if (selected && selected.nodeName.toLowerCase() === "img") {
                if ($(selected).hasClass("widget_inline")){
                    $context_settings.show();
                } else {
                    $context_settings.hide();
                }
                var pos = tinymce.DOM.getPos(selected);
                $context_menu.css({"top": pos.y + $("#elm1_ifr").position().top + 15 + "px", "left": pos.x + $("#elm1_ifr").position().left + 15 + "px", "position": "absolute"}).show();
            }

            // save the cursor position in the editor
            bookmark = tinyMCE.get("elm1").selection.getBookmark(1);
        };
        
        // Bind Widget Context Remove click event
        $("#context_remove").bind("mousedown", function(ev){
            tinyMCE.get("elm1").execCommand('mceInsertContent', false, '');
        });
        
        // Bind Widget Context Settings click event
        // change to mousedown based on following link
        // http://tinymce.moxiecode.com/forum/viewtopic.php?pid=74422
        $("#context_settings").mousedown(function(ev){
            var ed = tinyMCE.get('elm1');
            var selected = ed.selection.getNode();
            $("#dialog_content").hide();
            if (selected && selected.nodeName.toLowerCase() === "img" && $(selected).hasClass("widget_inline")) {
                updatingExistingWidget = true;
                $("#context_settings").show();
                var id = selected.getAttribute("id");
                var split = id.split("_");
                var type = split[1];
                var uid = split[2];
                var length = split[0].length + 1 + split[1].length + 1 + split[2].length + 1;
                var placement = id.substring(length);
                var widgetSettingsWidth = 650;
                currentlySelectedWidget = false;
                $("#dialog_content").hide();
                if (sakai.widgets[type]) {
                    if (sakai.widgets[type].settingsWidth) {
                        widgetSettingsWidth = sakai.widgets[type].settingsWidth;
                    }
                    var nuid = "widget_" + type + "_" + uid;
                    if (placement){
                        nuid += "_" + placement;
                    }
                    currentlySelectedWidget = {
                        "widgetname": type,
                        "uid": nuid
                    }
                    $("#dialog_content").html(sakai.api.Security.saneHTML('<img src="' + sakai.widgets[type].img + '" id="' + nuid + '" class="widget_inline" border="1"/>'));
                    $("#dialog_title").html(sakai.widgets[type].name);
                    sakai.api.Widgets.widgetLoader.insertWidgets("dialog_content", true, currentPageShown.savePath + "/");
                    $("#dialog_content").show();
                    $('#insert_dialog').css({'width':widgetSettingsWidth + "px", 'margin-left':-(widgetSettingsWidth/2) + "px"}).jqmShow();
                }
            }

            $("#context_menu").hide();

        });
        
        /**
         * Show wrapping dialog
         * @param {Object} hash
         * @return void
         */
        var showWrappingDialog = function(hash){
            $("#context_menu").hide();
            window.scrollTo(0,0);
            hash.w.show();
        };
        
        // Init wrapping modal
        $('#wrapping_dialog').jqm({
            modal: true,
            trigger: $('#context_appearance_trigger'),
            overlay: 20,
            toTop: true,
            onShow: showWrappingDialog
        });
        
        var setNewStyleClass = function(classToAdd) {
            var ed = tinyMCE.get('elm1');
            var $selected = $(ed.selection.getNode());
            $selected.removeClass("block_image").removeClass("block_image_right").removeClass("block_image_left");
            $selected.addClass(classToAdd);
        };

        // Bind wrapping_no click event
        $("#wrapping_no").bind("click",function(ev){
            setNewStyleClass("block_image");
            $('#wrapping_dialog').jqmHide();
        });

        // Bind wrapping left click event
        $("#wrapping_left").bind("click",function(ev){
            setNewStyleClass("block_image_left");
            $('#wrapping_dialog').jqmHide();
        });

        // Bind wrapping right click event
        $("#wrapping_right").bind("click",function(ev){
            setNewStyleClass("block_image_right");
            $('#wrapping_dialog').jqmHide();
        });
        
        var initSakaiDocs = function(){
            $("#lhnav-page-action-bar").html($("#lhav_buttonbar").show()).show();
            $("#lhnav-page-edit-mode").html($("#lhnav_editmode"));
            init_tinyMCE();
            renderInsertDropdown("sakaidocs");
        }
        
        var hideSakaiDocs = function(){
            $("#lhnav-page-action-bar").html($("#lhav_buttonbar").hide()).hide();
            $("#lhnavigation_actions").hide();
        }
        
        //////////////////
        //////////////////
        //////////////////
        // TinyMCE Init //
        //////////////////
        //////////////////
        //////////////////
        
        var init_tinyMCE = function(){
        
            // Init tinyMCE
            if (window["tinyMCE"]) {
                tinyMCE.init({
                
                    // General options
                    mode: "exact",
                    elements: "elm1",
                    theme: "advanced",
                    
                    // For a built-in list of plugins with doc: http://wiki.moxiecode.com/index.php/TinyMCE:Plugins
                    //plugins: "safari,advhr,inlinepopups,preview,noneditable,nonbreaking,xhtmlxtras,template,table,insertmore,autoresize",
                    plugins: "safari,advhr,inlinepopups,preview,noneditable,nonbreaking,xhtmlxtras,template,table,autoresize",
                    
                    // Context Menu
                    theme_advanced_buttons1: "formatselect,fontselect,fontsizeselect,bold,italic,underline,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,outdent,indent,|,table,link",
                    theme_advanced_buttons2: "",
                    theme_advanced_buttons3: "",
                    // set this to external|top|bottom
                    theme_advanced_toolbar_location: "top",
                    theme_advanced_toolbar_align: "left",
                    theme_advanced_statusbar_location: "none",
                    handle_node_change_callback: mySelectionEvent,
                    //init_instance_callback: "sakai_global.sitespages.startEditPage",
                    
                    // Example content CSS (should be your site CSS)
                    content_css: sakai.config.URL.TINY_MCE_CONTENT_CSS,
                    
                    // Editor CSS - custom Sakai Styling
                    editor_css: sakai.config.URL.TINY_MCE_EDITOR_CSS,
                    
                    // Drop lists for link/image/media/template dialogs
                    template_external_list_url: "lists/template_list.js",
                    external_link_list_url: "lists/link_list.js",
                    external_image_list_url: "lists/image_list.js",
                    media_external_list_url: "lists/media_list.js",
                    
                    // Use the native selects
                    use_native_selects: true,
                    
                    // Replace tabs by spaces.
                    nonbreaking_force_tab: true,
                    
                    // Determine classes to show to users (e.g. to mock up links). Format: "Header 1=header1;Header 2=header2;..."
                    theme_advanced_styles: "Regular link=s3d-regular-links",
                    
                    // Security
                    verify_html: true,
                    cleanup: true,
                    entity_encoding: "named",
                    invalid_elements: "script",
                    valid_elements: "" +
                    "@[id|class|style|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup]," +
                    "a[href|rel|rev|target|title|type]," +
                    "address[]," +
                    "b[]," +
                    "blink[]," +
                    "blockquote[align|cite|clear|height|type|width]," +
                    "br[clear]," +
                    "caption[align|height|valign|width]," +
                    "center[align|height|width]," +
                    "col[align|bgcolor|char|charoff|span|valign|width]," +
                    "colgroup[align|bgcolor|char|charoff|span|valign|width]," +
                    "comment[]," +
                    "em[]," +
                    "embed[src|class|id|autostart]" +
                    "font[color|face|font-weight|point-size|size]," +
                    "h1[align|clear|height|width]," +
                    "h2[align|clear|height|width]," +
                    "h3[align|clear|height|width]," +
                    "h4[align|clear|height|width]," +
                    "h5[align|clear|height|width]," +
                    "h6[align|clear|height|width]," +
                    "hr[align|clear|color|noshade|size|width]," +
                    "i[]," +
                    "img[align|alt|border|height|hspace|src|vspace|width]," +
                    "li[align|clear|height|type|value|width]," +
                    "marquee[behavior|bgcolor|direction|height|hspace|loop|scrollamount|scrolldelay|vspace|width]," +
                    "maction[]," +
                    "maligngroup[]," +
                    "malignmark[]," +
                    "math[]," +
                    "menclose[]," +
                    "merror[]," +
                    "mfenced[]," +
                    "mfrac[]," +
                    "mglyph[]," +
                    "mi[]," +
                    "mlabeledtr[]," +
                    "mlongdiv[]," +
                    "mmultiscripts[]," +
                    "mn[]," +
                    "mo[]," +
                    "mover[]," +
                    "mpadded[]," +
                    "mphantom[]," +
                    "mroot[]," +
                    "mrow[]," +
                    "ms[]," +
                    "mscarries[]," +
                    "mscarry[]," +
                    "msgroup[]," +
                    "msline[]," +
                    "mspace[]," +
                    "msqrt[]," +
                    "msrow[]," +
                    "mstack[]," +
                    "mstyle[]," +
                    "msub[]," +
                    "msup[]," +
                    "msubsup[]," +
                    "mtable[]," +
                    "mtd[]," +
                    "mtext[]," +
                    "mtr[]," +
                    "munder[]," +
                    "munderover[]," +
                    "ol[align|clear|height|start|type|width]," +
                    "p[align|clear|height|width]," +
                    "pre[clear|width|wrap]," +
                    "s[]," +
                    "semantics[]," +
                    "small[]," +
                    "span[align]," +
                    "strike[]," +
                    "strong[]," +
                    "sub[]," +
                    "sup[]," +
                    "table[align|background|bgcolor|border|bordercolor|bordercolordark|bordercolorlight|" +
                    "bottompadding|cellpadding|cellspacing|clear|cols|height|hspace|leftpadding|" +
                    "rightpadding|rules|summary|toppadding|vspace|width]," +
                    "tbody[align|bgcolor|char|charoff|valign]," +
                    "td[abbr|align|axis|background|bgcolor|bordercolor|" +
                    "bordercolordark|bordercolorlight|char|charoff|headers|" +
                    "height|nowrap|rowspan|scope|valign|width]," +
                    "tfoot[align|bgcolor|char|charoff|valign]," +
                    "th[abbr|align|axis|background|bgcolor|bordercolor|" +
                    "bordercolordark|bordercolorlight|char|charoff|headers|" +
                    "height|nowrap|rowspan|scope|valign|width]," +
                    "thead[align|bgcolor|char|charoff|valign]," +
                    "tr[align|background|bgcolor|bordercolor|" +
                    "bordercolordark|bordercolorlight|char|charoff|" +
                    "height|nowrap|valign]," +
                    "tt[]," +
                    "u[]," +
                    "ul[align|clear|height|start|type|width]" +
                    "video[src|class|autoplay|controls|height|width|preload|loop]"
                });
            }
        }

        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        // Temporarily deal with pages as documents here //
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////

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
            privstructure = processData(privdata);
            pubstructure = processData(pubdata);
            renderData();
            addBinding();
            selectPage();
            if (cData.isEditMode){
                initSakaiDocs();
            } else {
                hideSakaiDocs();
            }
            if (cData.parametersToCarryOver) {
                parametersToCarryOver = cData.parametersToCarryOver;
                rerenderNavigation();
            }
        }

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
