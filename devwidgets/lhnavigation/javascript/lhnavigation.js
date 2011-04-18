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
            $(".s3d-page-column-right").attr("min-height", $(".s3d-page-column-left").height());
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
            $prevItem.children(navSelectedItemArrow).css("visibility","hidden");

            $clickedItem.removeClass(navHoverableItemClass);
            $clickedItem.addClass(navSelectedItemClass);
            $clickedItem.children(navSelectedItemArrow).css("visibility","visible");

            showHideSubnav($clickedItem);

            $(".s3d-page-column-right").attr("min-height", $(".s3d-page-column-left").height());
        };
        
        var hideSubMenu = function(){
            $(".lhnavigation_selected_submenu").hide();
            $("#lhnavigation_submenu").hide();
        }

        var renderData = function(){
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
            //alert("DATA IS " + $.toJSON(data));
            if (data["structure0"]){
                //alert(data["structure0"]);
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
            $("#s3d-page-main-content > div").hide();
            var content = getPageContent(ref);
            if ($("#s3d-page-main-content #" + ref).length > 0){
                if (reload){
                    createPageToShow(ref, path, content, savePath);
                }
                $("#s3d-page-main-content #" + ref).show();
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
            currentPageShown = {
                "ref": ref,
                "path": path,
                "content": content,
                "savePath": savePath
            };
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
            sakai.api.Widgets.widgetLoader.insertWidgets(ref,false,savePath,[privstructure.pages, pubstructure.pages]);
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
            $("#s3d-page-main-content").show();
        }
        
        /**
         * Save button
         */
        $("#lhnav_edit_save_button").live("click", function(){
            savePage();
        });
        
        var savePage = function(){
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
            pubstructure.pages[newpageid] = {};
            pubstructure.pages[newpageid].page = "Default content";
            pubstructure.items[newpageid] = {
                "_ref": newpageid,
                "_title": "Untitled Page",
                "main":{
                    "_ref": newpageid,
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
            submenu.toggle();
        });
        
        /**
         * Delete a page
         */
        $("#lhavigation_submenu_deletepage").live("click", function(ev){
            deletePage();
        });
        
        var deletePage = function(){
            if (pubstructure.pages[currentPageShown.ref]){
                delete pubstructure.pages[currentPageShown.ref];
                delete pubstructure.items[currentPageShown.path];
                if (getPageCount(pubstructure.items) < 3){
                    $(window).trigger("sakai.contentauthoring.needsOneColumn");
                }
            } else if (privstructure.pages[currentPageShown.ref]){
                delete privstructure.pages[currentPageShown.ref];
                delete privstructure.items[currentPageShown.path];
                if (getPageCount(privstructure.pages) < 3){
                    $(window).trigger("sakai.contentauthoring.needsOneColumn");
                }
            }
            renderData();
            rerenderNavigation();
            $.bbq.pushState({"l": ""}, 0);
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
                    //handle_node_change_callback: "sakai_global.sitespages.mySelectionEvent",
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
                    insertDropdownPositionSet = true;
                }
                el.show();
            }
        };
        
        var initSakaiDocs = function(){
            $("#lhnav-page-action-bar").html($("#lhav_buttonbar").show()).show();
            $("#lhnav-page-edit-mode").html($("#lhnav_editmode"));
            init_tinyMCE();
            renderInsertDropdown("sakaidocs");
        }
        
        var hideSakaiDocs = function(){
            $("#lhnav-page-action-bar").html($("#lhav_buttonbar").hide()).hide();
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
