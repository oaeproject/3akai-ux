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

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    sakai_global.sakaidocs = function (tuid, showSettings) {

        var currentPageShown = false;
        var bookmark = false;

        var AUTOSAVE_INTERVAL = 15000, // 15 seconds
            CONCURRENT_EDITING_TIMEOUT = 10000, // 10 seconds
            CONCURRENT_EDITING_INTERVAL = 5000; // 5 seconds

        var isEditingPage = false,
            autosaveInterval = false,
            editInterval = false,
            lastAutosave = "",
            autosaveDialogShown = false;

        var $rootel = $("#"+tuid);

        var setAutosaveInterval = function() {
            autosaveInterval = setInterval(autosave, AUTOSAVE_INTERVAL);
        };

        var setEditInterval = function() {
            editInterval = setInterval(editing, CONCURRENT_EDITING_INTERVAL);
        };

        $("#autosave_revert").die("click").live("click", function() {
            autosaveDialogShown = false;
            if ($rootel.is(":visible")) {
                setAutosaveInterval();
                tinyMCE.get("elm1").setContent(currentPageShown.autosave.page, {format : 'raw'});
                $('#autosave_dialog').jqmHide();
            }
        });

        $("#autosave_keep").die("click").live("click", function() {
            autosaveDialogShown = false;
            setAutosaveInterval();
        });

        var checkAutosave = function(callback) {
            sakai.api.Server.loadJSON(currentPageShown.savePath + "/" + currentPageShown.ref + ".2.json", function(success, data) {
                if (success) {
                    // update the cached copy of autosave
                    currentPageShown.autosave = data.autosave;
                    // if there is an editing flag and it is less than CONCURRENT_EDITING_TIMEOUT ago, and you aren't the most recent editor, then
                    // someone else is editing the page right now.
                    if (data.editing && sakai.api.Util.Datetime.getCurrentGMTTime() - data.editing < CONCURRENT_EDITING_TIMEOUT && data._lastModifiedBy !== sakai.api.User.data.me.user.userid) {
                        if ($.isFunction(callback)) {
                            callback(false);
                            return;
                        }
                    } else if (data.autosave && data.autosave._lastModified > data._lastModified) {
                        $('#autosave_dialog').jqmShow();
                        autosaveDialogShown = true;
                        if ($.isFunction(callback)) {
                            callback(true);
                            return;
                        }
                    }
                }
                if ($.isFunction(callback)) {
                    callback(true);
                    return;
                }
            });
        };

        var editing = function() {
            if (isEditingPage) {
                var editingContent = {};
                editingContent[currentPageShown.ref] = {
                    "editing": sakai.api.Util.Datetime.getCurrentGMTTime()
                };
                sakai.api.Server.saveJSON(currentPageShown.savePath + ".resource", editingContent);
            } else {
                clearInterval(editInterval);
            }
        };

        var autosave = function() {
            if (isEditingPage) {
                // autosave
                var autosaveContent = getTinyMCEContent(),
                    autosavePostContent = {};

                autosavePostContent[currentPageShown.ref] = {};
                if (autosaveContent !== currentPageShown.content && autosaveContent !== lastAutosave) {
                    lastAutosave = autosaveContent;
                    // cache it locally so we don't have to re-retrieve it in order to use it
                    currentPageShown.autosave = {
                        page: autosaveContent,
                        _lastModified: sakai.api.Util.Datetime.getCurrentGMTTime(),
                        _lastModifiedBy: sakai.api.User.data.me.user.userid
                    };
                    autosavePostContent[currentPageShown.ref].autosave = {
                        page: autosaveContent
                    };
                    sakai.api.Server.saveJSON(currentPageShown.savePath + ".resource", autosavePostContent);
                }
            } else {
                clearInterval(autosaveInterval);
                lastAutosave = "";
            }
        };

        /////////////////////
        // Widget Wrapping //
        /////////////////////

        var setWrappingStyle = function(classToAdd) {
            var ed = tinyMCE.get('elm1');
            var $selected = $(ed.selection.getNode());
            $selected.removeClass("block_image").removeClass("block_image_right").removeClass("block_image_left");
            $selected.addClass(classToAdd);
            $('#wrapping_dialog').jqmHide();
        };

        var showWrappingDialog = function(hash){
            $("#context_menu").hide();
            window.scrollTo(0,0);
            hash.w.show();
        };

        $('#wrapping_dialog').jqm({
            modal: true,
            trigger: $('#context_appearance_trigger'),
            overlay: 20,
            toTop: true,
            onShow: showWrappingDialog
        });

        /////////////////////
        // Remove a widget //
        /////////////////////

        var removeWidget = function(){
            tinyMCE.get("elm1").execCommand('mceInsertContent', false, '');
        };

        //////////////////////////
        // Show widget settings //
        //////////////////////////

        var renderWidgetSettings = function(){
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
                    };
                    $("#dialog_content").html(sakai.api.Security.saneHTML('<img src="' + sakai.widgets[type].img + '" id="' + nuid + '" class="widget_inline" border="1"/>'));
                    $("#dialog_title").html(sakai.widgets[type].name);
                    sakai.api.Widgets.widgetLoader.insertWidgets("dialog_content", true, currentPageShown.pageSavePath + "/");
                    $("#dialog_content").show();
                    $('#insert_dialog').css({'width':widgetSettingsWidth + "px", 'margin-left':-(widgetSettingsWidth/2) + "px"}).jqmShow();
                }
            }
            $("#context_menu").hide();
        };

        ////////////////////////////
        // Insert widget dropdown //
        ////////////////////////////

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
            sakai.api.Util.TemplateRenderer($("#sakaidocs_insert_dropdown_template"), jsonData, $("#sakaidocs_insert_dropdown_container"));

            // Event handler
            $('#insert_dialog').jqm({
                modal: true,
                overlay: 20,
                toTop: true,
                onHide: hideSelectedWidget
            });

        };

        var selectWidgetFromDropdown = function($el){
            // hide dropdown
            showHideInsertDropdown(true);

            // restore the cursor position in the editor
            if (bookmark) {
                tinyMCE.get("elm1").focus();
                tinyMCE.get("elm1").selection.moveToBookmark(bookmark);
            }
            bookmark = false;

            var id = $el.attr("id");
            if (id==="link") {
                $('#link_dialog').jqmShow();
            } else if (id==="hr") {
                tinyMCE.get("elm1").execCommand('InsertHorizontalRule');
            } else {
                renderSelectedWidget(id);
            }
        };

        var showHideInsertDropdown = function(hideOnly){
            var el = $("#sakaidocs_insert_dropdown", $rootel);
            if (el) {
                if ((el.css("display") && el.css("display").toLowerCase() !== "none") || hideOnly) {
                    $("#sakaidocs_insert_dropdown_button", $rootel).removeClass("clicked");
                    el.hide();
                } else if (el.css("display")) {
                    $("#sakaidocs_insert_dropdown_button", $rootel).addClass("clicked");
                    var x = $("#sakaidocs_insert_dropdown_button", $rootel).position().left;
                    var y = $("#sakaidocs_insert_dropdown_button", $rootel).position().top;
                    el.css({
                        "top": y + 28 + "px",
                        "left": x + "px"
                    }).show();
                }
            }
        };

        ////////////////////////////////////////////
        // Deal with inserting widgets into pages //
        ////////////////////////////////////////////

        var currentlySelectedWidget = false;
        var updatingExistingWidget = false;

        var hideSelectedWidget = function(hash){
            hash.w.hide();
            hash.o.remove();
            currentlySelectedWidget = false;
            $("#dialog_content").html("").hide();
        };

        var renderSelectedWidget = function(widgetid) {
            var $overlayContainer = $("#insert_dialog");
            var $dialog_content = $("#dialog_content", $overlayContainer);

            var widgetSettingsWidth = 650;
            $dialog_content.hide();
            if (sakai.widgets[widgetid]){
                var tuid = sakai.api.Util.generateWidgetId();
                var id = "widget_" + widgetid + "_" + tuid;
                currentlySelectedWidget = {
                    "widgetname": widgetid,
                    "uid": id
                };
                $dialog_content.html('<img src="' + sakai.widgets[widgetid].img + '" id="' + id + '" class="widget_inline" border="1"/>');
                $("#dialog_title", $overlayContainer).html(sakai.widgets[widgetid].name);
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid, true, currentPageShown.pageSavePath + "/");

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

        ////////////////////////////////////////////////////////////////////
        // Functions that deal with saving and cancelling widget settings //
        ////////////////////////////////////////////////////////////////////

        sakai_global.sakaidocs.widgetCancel = function(tuid){
            $('#insert_dialog').jqmHide();
        };

        sakai_global.sakaidocs.widgetFinish = function(tuid){
            // Add widget to the editor
            if (!updatingExistingWidget) {
                tinyMCE.get("elm1").execCommand('mceInsertContent', false, '<img src="' + sakai.widgets[currentlySelectedWidget.widgetname].img + '" id="' + currentlySelectedWidget.uid + '" class="widget_inline" style="display:block; padding: 10px; margin: 4px" border="1"/>');
            }
            updatingExistingWidget = false;
            $('#insert_dialog').jqmHide();
        };

        sakai.api.Widgets.Container.registerFinishFunction(sakai_global.sakaidocs.widgetFinish);
        sakai.api.Widgets.Container.registerCancelFunction(sakai_global.sakaidocs.widgetCancel);

        ////////////////////////
        // Page Edit Controls //
        ////////////////////////

        var pageEditControlsInitialized = false;

        var initializePageEditControls = function(){
            if (!pageEditControlsInitialized){
                init_tinyMCE();
                renderInsertDropdown("sakaidocs");
                pageEditControlsInitialized = true;
            }
        };

        var showPageEditControls = function(addArea){
            if (addArea){
                $("#sakaidocs_addpage_top").hide();
                $("#sakaidocs_addpage_area").show();
            } else {
                $("#sakaidocs_addpage_area").hide();
                $("#sakaidocs_addpage_top").show();
            }
            $("#sakaidocs-page-action-bar").show();
            initializePageEditControls();
        };

        var hidePageEditControls = function(){
            $("#sakaidocs-page-action-bar").hide();
        };

        ///////////////////////////////////////////////
        // Context menu for changing widget settings //
        ///////////////////////////////////////////////

        $(document.body).append($("#context_menu"));

        var selectWidgetInEditor = function(){
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

        ///////////////////////
        // TinyMCE Functions //
        ///////////////////////

        var getTinyMCEContent = function(){
            var content = tinyMCE.get("elm1").getContent({format : 'raw'});
            content = content.replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
            return content;
        };

        var init_tinyMCE = function(){
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
                    handle_node_change_callback: selectWidgetInEditor,

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
        };

        ///////////////////////////////////
        // Rendering a page in view mode //
        ///////////////////////////////////

        var renderPage = function(reloadPage){
            stopEditPage();
            sakai.api.Widgets.nofityWidgetShown("#s3d-page-container > div:visible", false);
            $("#s3d-page-container > div:visible").hide();
            var $contentEl = null,
                sanitizedContent = null;
            if ($("#" + currentPageShown.ref).length === 0) {
                // Create the new element
                var $el = $("<div>").attr("id", currentPageShown.ref);
                // Add element to the DOM
                $("#s3d-page-container").append($el);
                $contentEl = $("#" + currentPageShown.ref);
                // Add sanitized content
                sanitizedContent = sakai.api.Security.saneHTML(currentPageShown.content);
                $contentEl.html(sanitizedContent);
                // Insert widgets
                sakai.api.Widgets.widgetLoader.insertWidgets(currentPageShown.ref, false, currentPageShown.pageSavePath + "/", currentPageShown.widgetData);
            } else {
                if (reloadPage) {
                    $contentEl = $("#" + currentPageShown.ref);
                    sanitizedContent = sakai.api.Security.saneHTML(currentPageShown.content);
                    $contentEl.html(sanitizedContent);
                    // Insert widgets
                    sakai.api.Widgets.widgetLoader.insertWidgets(currentPageShown.ref, false, currentPageShown.pageSavePath + "/", currentPageShown.widgetData);
                    $contentEl.show();
                } else {
                    $("#s3d-page-container #" + currentPageShown.ref).show();
                    sakai.api.Widgets.nofityWidgetShown("#" + currentPageShown.ref, true);
                }
            }
            if (currentPageShown.canEdit && !currentPageShown.nonEditable){
                showPageEditControls(currentPageShown.addArea);
            } else {
                hidePageEditControls();
            }
        };

        ///////////////////////////////////
        // Rendering a page in edit mode //
        ///////////////////////////////////

        var editPage = function(){
            checkAutosave(function(safeToEdit) {
                if (safeToEdit) {
                    editing();
                    setEditInterval();
                    isEditingPage = true;
                    if (!autosaveDialogShown) {
                        setAutosaveInterval();
                    }
                    $("#sakaidocs-page-edit-mode").show();
                    $("#s3d-page-container").hide();
                    var content = currentPageShown.content || "";
                    tinyMCE.get("elm1").setContent(content, {format : 'raw'});
                    lastAutosave = content;
                } else {
                    sakai.api.Util.notification.show("", $("#sakaidocs_concurrent_editing_message").text());
                }
            });
        };

        /////////////////////////
        // Save an edited page //
        /////////////////////////

        var savePage = function(){
            currentPageShown.content = getTinyMCEContent();

            stopEditPage();
            renderPage(true);

            //Store the edited content
            var resourceRef = currentPageShown.ref;
            if (resourceRef.indexOf("-") !== -1){
                resourceRef = resourceRef.substring(resourceRef.indexOf("-") + 1);
            }
            var toStore = {};
            toStore[resourceRef] = {
                "page": currentPageShown.content
            };
            $.ajax({
                url: currentPageShown.pageSavePath + ".resource",
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
        };

        /////////////////////////
        // Go out of edit mode //
        /////////////////////////

        var stopEditPage = function(){
            isEditingPage = false;
            $("#sakaidocs-page-edit-mode").hide();
            $("#context_menu").hide();
            $("#s3d-page-container").show();
        };

        ////////////////////////////
        // Internal event binding //
        ////////////////////////////

        $("#sakaidocs_editpage").live("click", function(){
            editPage();
        });

        $("#sakaidocs_edit_cancel_button").live("click", function(){
            stopEditPage();
        });

        $("#sakaidocs_edit_save_button").live("click", function(){
            savePage();
        });

        $("#context_settings").mousedown(function(ev){
            renderWidgetSettings();
        });

        $("#context_remove").bind("mousedown", function(ev){
            removeWidget();
        });

        $("#sakaidocs_insert_dropdown_button").live("click", function(){
            showHideInsertDropdown();
        });

        $(".insert_dropdown_widget_link").live("click", function(){
            selectWidgetFromDropdown($(this));
        });

        $("#wrapping_no").bind("click",function(ev){
            setNewStyleClass("block_image");
        });

        $("#wrapping_left").bind("click",function(ev){
            setWrappingStyle("block_image_left");
        });

        $("#wrapping_right").bind("click",function(ev){
            setWrappingStyle("block_image_right");
        });

        ////////////////////////////
        // External event binding //
        ////////////////////////////

        $(window).bind("showpage.sakaidocs.sakai", function(ev, _currentPageShown){
            currentPageShown = _currentPageShown;
            renderPage();
        });

        $(window).bind("editpage.sakaidocs.sakai", function(ev, _currentPageShown){
            currentPageShown = _currentPageShown;
            renderPage();
            editPage();
        });

        ///////////////////////
        // Widget has loaded //
        ///////////////////////

        $(window).trigger("ready.sakaidocs.sakai");

        $('#autosave_dialog').jqm({
            modal: true,
            overlay: 20,
            toTop: true
        });

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("sakaidocs");
});
