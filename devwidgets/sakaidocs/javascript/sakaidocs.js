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

        /**
         * Edit button
         */
        $("#sakaidocs_editpage").live("click", function(){
            editPage();
        });

        var editPage = function(){
            isEditingNewPage = false;
            $("#sakaidocs_editmode").show();
            $("#s3d-page-main-content").hide();
            var content = sakai_global.lhnavigation.currentPageShown.content || "";
            tinyMCE.get("elm1").setContent(content, {format : 'raw'});
        };

        /**
         * Cancel button
         */
        $("#sakaidocs_edit_cancel_button").live("click", function(){
            cancelEditPage();
        });

        var cancelEditPage = function(){
            $("#sakaidocs_editmode").hide();
            $("#context_menu").hide();
            $("#s3d-page-main-content").show();
        };

        /**
         * Save button
         */
        $("#sakaidocs_edit_save_button").live("click", function(){
            savePage();
        });

        var savePage = function(){
            $("#context_menu").hide();
            sakai_global.lhnavigation.currentPageShown.content = getTinyMCEContent();
            $(window).trigger("savePage.lhnavigation.sakai");
            $("#sakaidocs_editmode").hide();
            $("#s3d-page-main-content").show();

            //Store the edited content
            var toStore = {};
            toStore[sakai_global.lhnavigation.currentPageShown.ref] = {
                "page": sakai_global.lhnavigation.currentPageShown.content
            };
            $.ajax({
                url: sakai_global.lhnavigation.currentPageShown.savePath + ".resource",
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

        /**
         * Add a page to the document
         */
        $("#sakaidocs_addpage").live("click", function(ev){
            $(window).trigger("addPage.lhnavigation.sakai");
        });

        /**
         * Get content out of tinyMCE editor
         */
        var getTinyMCEContent = function(){
            var content = tinyMCE.get("elm1").getContent({format : 'raw'});
            content = content.replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
            return content;
        };

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
            sakai.api.Util.TemplateRenderer($("#sakaidocs_insert_dropdown_template"), jsonData, $("#sakaidocs_insert_dropdown_container"));

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
        $("#sakaidocs_insert_dropdown_button").live("click", function(){
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
            var el = $("#sakaidocs_insert_dropdown");
            if (el) {
                if ((el.css("display") && el.css("display").toLowerCase() !== "none") || hideOnly) {
                    $("#sakaidocs_insert_dropdown_button").removeClass("clicked");
                    el.hide();
                } else if (el.css("display")) {
                    $("#sakaidocs_insert_dropdown_button").addClass("clicked");
                    var x = $("#sakaidocs_insert_dropdown_button").position().left;
                    var y = $("#sakaidocs_insert_dropdown_button").position().top;
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
                };
                $dialog_content.html(sakai.api.Security.saneHTML('<img src="' + sakai.widgets[widgetid].img + '" id="' + id + '" class="widget_inline" border="1"/>'));
                $("#dialog_title").html(sakai.widgets[widgetid].name);
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid,true,sakai_global.lhnavigation.currentPageShown.savePath + "/");
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
        sakai_global.sakaidocs.widgetCancel = function(tuid){
            $('#insert_dialog').jqmHide();
        };

        /**
         * Widget finish - add widget to editor, hide modal
         * @param {Object} tuid
         * @return void
         */
        sakai_global.sakaidocs.widgetFinish = function(tuid){
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
        sakai.api.Widgets.Container.registerFinishFunction(sakai_global.sakaidocs.widgetFinish);
        sakai.api.Widgets.Container.registerCancelFunction(sakai_global.sakaidocs.widgetCancel);

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
                    };
                    $("#dialog_content").html(sakai.api.Security.saneHTML('<img src="' + sakai.widgets[type].img + '" id="' + nuid + '" class="widget_inline" border="1"/>'));
                    $("#dialog_title").html(sakai.widgets[type].name);
                    sakai.api.Widgets.widgetLoader.insertWidgets("dialog_content", true, sakai_global.lhnavigation.currentPageShown.savePath + "/");
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
            // TODO trigger event in lhnav
            $("#sakaidocs-page-action-bar").html($("#sakaidocs_buttonbar").show()).show();
            $("#sakaidocs-page-edit-mode").html($("#sakaidocs_editmode"));
            init_tinyMCE();
            renderInsertDropdown("sakaidocs");
        };

        var hideSakaiDocs = function(){
            $("#sakaidocs-page-action-bar").html($("#sakaidocs_buttonbar").hide()).hide();
            $("#lhnavigation_actions").hide();
        };

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
        };

        var doInit = function () {
            $(window).bind("init.sakaidocs.sakai", function(e, editable) {
                if (editable){
                    initSakaiDocs();
                }
            });
            $(window).trigger("ready.sakaidocs.sakai");

        };
        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("sakaidocs");
});
