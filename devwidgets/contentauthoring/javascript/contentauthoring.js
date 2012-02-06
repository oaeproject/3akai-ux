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
     * @name sakai.contentauthoring
     *
     * @class contentauthoring
     *
     * @description
     * Content Authoring
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contentauthoring = function (tuid, showSettings, widgetData) {

        var $rootel = $("#" + tuid);
        sakai_global.contentauthoring.isDragging = false;

        var MINIMUM_COLUMN_SIZE = 0.05;
        var USE_ELEMENT_DRAG_HELPER = true;
        var STORE_PATH = false;


        ///////////////////////
        // Utility functions //
        ///////////////////////

        var isInEditMode = function(){
            return $rootel.hasClass("contentauthoring_edit_mode");
        };

        var getWidgetList = function(){
            var widgetIDs = [];
            for (var r = 0; r < currentPageShown.content.rows.length; r++){
                for (var c = 0; c < currentPageShown.content.rows[r].columns.length; c++){
                    for (var e = 0; e < currentPageShown.content.rows[r].columns[c].elements.length; e++){
                        widgetIDs.push(currentPageShown.content.rows[r].columns[c].elements[e]);
                    }
                }
            }
            return widgetIDs;
        };

        //////////////////////
        // Toggle edit mode //
        //////////////////////

        $("#contentauthoring_toggle_edit_mode").bind("click", function(){
            if (isInEditMode()){
                $rootel.removeClass("contentauthoring_edit_mode");
                $(".contentauthoring_cell_content").sortable("destroy");
                $("#contentauthoring_add_row").hide();
                $("#inserterbar_widget").hide();
            } else {
                $rootel.addClass("contentauthoring_edit_mode");
                $("#inserterbar_widget").show();
                $(window).trigger("edit.contentauthoring.sakai");
                sakai_global.htmlblock.updateHeights();
                setActions();
            }
        });

        /**
        * Matches the number of columns to the "columncount" data attribute on list items 
        * that indicates how many are used and puts a black check icon in front of the list item
        * @param {Object} element jQuery object with classname "contentauthoring_row_container"
        *                         that is the parent element of all columns
        */
        var checkColumnsUsed = function(element){
            var numColumns = $(element).find(".contentauthoring_cell.ui-resizable").length;
            var $menuItems = $("#contentauthoring_row_menu ul li");
            $.each($menuItems, function(i, item){
                var $item = $(item);
                $item.find(".s3d-action-icon").removeClass("s3d-black-check-icon");
                if($item.data("columncount") === numColumns){
                    $item.find(".s3d-action-icon").addClass("s3d-black-check-icon");
                }
            });
        };


        //////////////////
        // Reorder rows //
        //////////////////

        var setRowReorderHover = function(){
            $(".contentauthoring_row_container").unbind("hover");
            $(".contentauthoring_row_container").hover(function(){
                if (isInEditMode() && !sakai_global.contentauthoring.isDragging) {
                    $(".contentauthoring_row_handle_container", $(this)).css("visibility", "visible");
                }
            }, function(){
                $(".contentauthoring_row_handle_container", $(this)).css("visibility", "hidden");
            });
        };

        var makeRowsReorderable = function(){
            $("#contentauthoring_widget_container").sortable({
                handle: '.contentauthoring_row_handle',
                placeholder: "contentauthoring_row_reorder_highlight",
                opacity: 0.4,
                helper: !USE_ELEMENT_DRAG_HELPER ? "original" : function(ev, ui){
                    var $el = $("<div/>");
                    $el.css("width", ui.width() + "px");
                    $el.css("height", ui.height() + "px");
                    $el.css("background-color", "#2683BC");
                    return $el;
                },
                start: function(ev, ui){
                    $(ui.item).find('.tinyMCE').each(function(){
                        tinyMCE.execCommand( 'mceRemoveControl', false, $(this).attr('id') );
                    });
                    sakai_global.contentauthoring.isDragging = true;
                    $(".contentauthoring_row_handle_container").css("visibility", "hidden");
                    $(".contentauthoring_cell_element_actions").hide();
                    hideEditRowMenu();
                },
                stop: function(event, ui){
                    $(ui.item).find('.tinyMCE').each(function(){
                        tinyMCE.execCommand( 'mceAddControl', true, $(this).attr('id') );
                    });
                    $(this).sortable("refresh");
                    sakai_global.contentauthoring.isDragging = false;
                }
            });
            setRowReorderHover();
        }

        //////////////////////
        // Reorder portlets //
        //////////////////////

        /**
         * Sets the height of a row to the heighest column
         * @param {Object} $row jQuery object with class ".contentauthoring_table_row.contentauthoring_cell_container_row"
         *                      used to search for child cells that can contain content
         */
        var setHeight = function($row) {
            $(window).trigger("edit.contentauthoring.sakai");
            var cells = $('.contentauthoring_cell_content', $row);
            var setDefaultHeight = true
            $.each(cells, function(index, cell){
                // Default the height of the cell to auto to avoid that cells stay larger than they should
                $('.contentauthoring_cell_content', $row).css("height", "auto");
                // Remove whitespace since jQuery :empty selector doesn't ignore it
                var html = $(cell).html().replace(/\s+/, "");
                if(html.length){
                    // There is some content in the row so no default height but the cell height should be considered
                    setDefaultHeight = false;
                }
            });

            if (setDefaultHeight) {
                // No content in the row, set default height
                $('.contentauthoring_cell_content', $row).css("height", 25);
            } else {
                // Some cells have content
                $('.contentauthoring_cell_content', $row).equalHeights();
            }
        };

        var reorderPortlets = function(){
            $( ".contentauthoring_cell_content" ).sortable({
    			connectWith: ".contentauthoring_cell_content",
                ghost: true,
                handle: ".contentauthoring_row_handle",
                placeholder: "contentauthoring_cell_reorder_highlight",
                opacity: 0.4,
                helper: !USE_ELEMENT_DRAG_HELPER ? "original" : function(ev, ui){
                    var $el = $("<div/>");
                    $el.css("width", ui.width() + "px");
                    $el.css("height", ui.height() + "px");
                    $el.css("background-color", "#2683BC");
                    return $el;
                },
                start: function(event, ui){
                    $(ui.item).find('.tinyMCE').each(function(){
                        tinyMCE.execCommand( 'mceRemoveControl', false, $(this).attr('id') );
                    });
                    sakai_global.contentauthoring.isDragging = true;
                    $(".contentauthoring_row_handle_container").css("visibility", "hidden");
                    $(".contentauthoring_cell_element_actions").hide();
                    hideEditRowMenu();
                },
                stop: function(event, ui){
                    $(ui.item).find('.tinyMCE').each(function(){
                        tinyMCE.execCommand( 'mceAddControl', true, $(this).attr('id') );
                        $(this).sortable("refresh");
                    });
                    sakai_global.contentauthoring.isDragging = false;
                    addNewElement(event, ui);
                }
    		});
        }


        ////////////////////
        // Resize columns //
        ////////////////////

        var currentSizes = [];

        var getColumnWidths = function($row){
            var totalWidth = $("#contentauthoring_widget").width();
            var $cells = $(".contentauthoring_cell", $row);
            var widths = [];
            var lastWidth = 1;
            for (var i = 0; i < $cells.length; i++){
                if (i === $cells.length - 1){
                    widths.push(lastWidth); 
                } else {
                    lastWidth -= $($cells[i]).width() / totalWidth;
                    widths.push($($cells[i]).width() / totalWidth);
                }
            }
            return widths;
        };

        var makeColumnsResizable = function(){
            sakai_global.htmlblock.updateHeights();
            $(".contentauthoring_cell").resizable({
                handles: {
                    'e': '.contentauthoring_cell_handle,.contentauthoring_cell_handle_grab'
                },
                helper: "ui-resizable-helper",
                start: function(event, ui) {
                    // Fix for iFrames
                    $('<div class="ui-resizable-iframeFix" style="background: #fff;"></div>').css({
                        width: "100%", height: "100%",
                        position: "absolute", opacity: "0.001", zIndex: 100000
                    }).css($(this).offset()).appendTo("body");

                    sakai_global.contentauthoring.isDragging = true;
                    var $row = $(this).parent();
                    currentSizes = getColumnWidths($row);
                },
                stop: function(ev, ui){
                    // Fix for iFrames
                    $("div.ui-resizable-iframeFix").each(function() { this.parentNode.removeChild(this); }); 

                    sakai_global.contentauthoring.isDragging = false;
                    var totalRowWidth = $("#contentauthoring_widget").width();
                    var newColumnWidth = (ui.size.width + 12) / totalRowWidth;
                    var oldColumnWidth = ui.originalSize.width / totalRowWidth;
                    
                    var $row = $(this).parent();
                    var rowId = $row.attr("data-row-id");
                    var $cells = $(".contentauthoring_cell", $row);
                    
                    var hasFoundResizedCell = false;
                    
                    var totalWidth = 0;
                    var numberOfColumns = $cells.length;
                    for (var i = 0; i < $cells.length; i++){
                        var currentColumnWidth = 0;
                        if ($($cells[i]).is($(this))){
                            // New percentage based width
                            if (newColumnWidth < MINIMUM_COLUMN_SIZE){
                                currentColumnWidth = MINIMUM_COLUMN_SIZE;
                            } else if (totalWidth + newColumnWidth + ((numberOfColumns - i - 1) * MINIMUM_COLUMN_SIZE) > 1){
                                currentColumnWidth = 1 - totalWidth - ((numberOfColumns - i - 1) * MINIMUM_COLUMN_SIZE);
                            } else {
                                currentColumnWidth = newColumnWidth;
                            }
                            $($cells[i]).css("width", currentColumnWidth * 100 + "%");
                            hasFoundResizedCell = true;
                        } else if (hasFoundResizedCell){
                            // New percentage based width
                            if (numberOfColumns - i === 1){
                                // This is the final cell, fill it up
                                currentColumnWidth = 1 - totalWidth;
                            } else {
                                // There are 2 more cells
                                // Does the 2nd have enough space after pulling in the 1st?
                                if (1 - (totalWidth + currentSizes[i]) > MINIMUM_COLUMN_SIZE){
                                    currentColumnWidth = currentSizes[i];
                                    $($cells[i + 1]).css("width", (1 - totalWidth - currentSizes[i]) * 100 + "%");
                                // Shrink the fist to its maximum size
                                // Make the second its minumum size
                                } else {
                                    currentColumnWidth = 1 - totalWidth - MINIMUM_COLUMN_SIZE;
                                    $($cells[i + 1]).css("width", MINIMUM_COLUMN_SIZE * 100 + "%");
                                }
                            }
                            $($cells[i]).css("width", currentColumnWidth * 100 + "%");
                            hasFoundResizedCell = false;
                        }
                        totalWidth += currentColumnWidth;
                    }
                    sakai_global.htmlblock.updateHeights();
                    setHeight($row);
                }
            });
        };
        
        ////////////////////
        // Column handles //
        ////////////////////

        var updateColumnHandles = function(){
            $(".contentauthoring_cell_handle").show();
            sakai_global.htmlblock.updateHeights();
            var $rows = $(".contentauthoring_row_container");
            for (var r = 0; r < $rows.length; r++){
                var $columns = $(".contentauthoring_cell", $($rows[r]));
                var $lastColumn = $($columns[$columns.length - 1]);
                $(".contentauthoring_cell_handle", $lastColumn).hide();
                setHeight($($rows[r]));
            }
        };

        ///////////////////
        // Add a new row //
        ///////////////////

        $("#contentauthoring_add_row").bind("click", function(){
            $("#contentauthoring_widget_container").append(generateNewRow());
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
            setActions();
            updateColumnHandles();
        });

        var generateNewRow = function(){
            var newRow = {
                "id": sakai.api.Util.generateWidgetId(),
                "columns": [
                    {
                        "width": 1,
                        "elements": [
                            {
                                "id": sakai.api.Util.generateWidgetId(),
                                "type": "htmlblock"
                            }
                        ]
                    }
                ]
            }
            newRow.template = "row";
            return sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", newRow, false, false);
        }


        /////////////////////////////////
        // Add a new element: external //
        /////////////////////////////////

        var addExternal = function(ev, data){
            var template = sakai.api.Util.TemplateRenderer("create_cell_element_template", {data: data, sakai: sakai});
            // We add the item after the element is dropped on if there is one
            // If the column is empty we append
            if($(data.target).hasClass("contentauthoring_cell_element")){
                $(data.target).after(template);
            } else {
                $(data.target).append(template);
            }
            // Reapply the cell hovers
            setCellHover();
        };


        ///////////////////
        // Edit row menu //
        ///////////////////

        var rowToChange = false;

        var hideEditRowMenu = function(){
            rowToChange = false;
            $("#contentauthoring_row_menu").hide();
            $(".contentauthoring_row_handle_container").removeClass("selected");
        };

        $(".contentauthoring_row_edit").live("click", function(){
            var currentRow = $(this).attr("data-row-id");
            if (currentRow === rowToChange){
                hideEditRowMenu();
            } else {
                $($(this).parents(".contentauthoring_row_handle_container")).addClass("selected");
                $("#contentauthoring_row_menu").css("left", ($(this).position().left - ($("#contentauthoring_row_menu").width() / 2)) + "px");
                $("#contentauthoring_row_menu").css("top", ($(this).position().top + 27) + "px");
                $("#contentauthoring_row_menu").show();
                rowToChange = currentRow;
                checkColumnsUsed($(this).parents(".contentauthoring_row_container"));
            }
        });

        var removeColumns = function($row, lastColumn){
            var widths = getColumnWidths($row);
            var remainingWidth = 1;
            var $cells = $(".contentauthoring_cell", $row);
            for (var i = lastColumn + 1; i < $cells.length; i++){
                var $cell = $($cells[i]);
                $cell.find('.tinyMCE').each(function(){
                    tinyMCE.execCommand( 'mceRemoveControl', false, $(this).attr('id') );
                });
                var $cellcontent = $(".contentauthoring_cell_content", $cell).children();
                $(".contentauthoring_cell_content", $($cells[lastColumn])).append($cellcontent).find('.tinyMCE').each(function(){
                    tinyMCE.execCommand( 'mceAddControl', true, $(this).attr('id') );
                });;
                $cell.remove();
                remainingWidth -= widths[i];
            }
            for (var i = 0; i <= lastColumn; i++) {
                $($cells[i]).css("width", (widths[i] / remainingWidth) * 100 + "%");
            }
            updateColumnHandles();
        };

        var addColumns = function($row, totalColumns){
            var widths = getColumnWidths($row);
            var $cells = $(".contentauthoring_cell", $row);
            var newColumnWidth = 1 / totalColumns;
            for (var i = widths.length; i < totalColumns; i++){
                $(".contentauthoring_cell_container_row", $row).append(sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", {
                    "template": "column",
                    "column": {
                        "width": newColumnWidth,
                        "elements": []
                    }
                }, false, false));
            }
            for (var i = 0; i < widths.length; i++){
                $($cells[i]).css("width", widths[i] * (1 - (newColumnWidth * (totalColumns - widths.length))) * 100 + "%");
            }
            setActions();
            updateColumnHandles();
        };

        $("#contentauthoring_row_menu_one").live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']");
            removeColumns($row, 0);
            hideEditRowMenu();
            setActions();
        });

        $("#contentauthoring_row_menu_two").live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']");
            var $cells = $(".contentauthoring_cell", $row);
            if ($cells.length > 2){
                removeColumns($row, 1);
            } else if ($cells.length < 2){
                addColumns($row, 2);
            }
            hideEditRowMenu();
        });

        $("#contentauthoring_row_menu_three").live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']");
            var $cells = $(".contentauthoring_cell", $row);
            if ($cells.length < 3){
                addColumns($row, 3);
            }
            hideEditRowMenu();
        });

        $("#contentauthoring_row_menu_remove").live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']");
            hideEditRowMenu();
            $row.remove();
        });

        $("#contentauthoring_row_menu_add_above").live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']");
            hideEditRowMenu();
            $row.before(generateNewRow());
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
            setActions();
            updateColumnHandles();
        });

        $("#contentauthoring_row_menu_add_below").live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']");
            hideEditRowMenu();
            $row.after(generateNewRow());
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
            setActions();
            updateColumnHandles();
        });


        /////////////////////
        // Cell action bar //
        /////////////////////

        var setCellHover = function(){
            $(".contentauthoring_cell_element").unbind("hover");
            $(".contentauthoring_cell_element").hover(function(){
                if (isInEditMode() && !sakai_global.contentauthoring.isDragging) {
                    $(".contentauthoring_cell_element_actions", $(this)).css("left", $(this).position().left + "px");
                    $(".contentauthoring_cell_element_actions", $(this)).css("top", ($(this).position().top + 1) + "px");
                    $(".contentauthoring_cell_element_actions", $(this)).show();
                    $(this).addClass("contentauthoring_cell_element_hover");
                }
            }, function(ev, ui){
                $(".contentauthoring_cell_element_actions").hide();
                $(this).removeClass("contentauthoring_cell_element_hover");
            });
        };


        ////////////////////////////
        // Change widget settings //
        ////////////////////////////

        var isEditingNewElement = false;
        var currentlyEditing = false;

        var editModeFullScreen = function(id, type){
            currentlyEditing = id;
            $("#contentauthoring_widget_content").html("");
            if (sakai.widgets[type]) {
                var widgetSettingsWidth = 650;
                if (sakai.widgets[type].settingsWidth) {
                    widgetSettingsWidth = sakai.widgets[type].settingsWidth;
                }
                $("#contentauthoring_widget_settings_content").html(sakai.api.Security.saneHTML('<div id="widget_' + type + '_' + id + '" class="widget_inline"/>'));
                $("#contentauthoring_widget_settings_title").html(sakai.api.Widgets.getWidgetTitle(sakai.widgets[type].id));
                sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget_settings_content", true, STORE_PATH);
                $('#contentauthoring_widget_settings').css({
                    'width': widgetSettingsWidth + "px",
                    'margin-left': -(widgetSettingsWidth / 2) + "px",
                    'top': ($(window).scrollTop() + 50) + "px"
                }).jqmShow();
            }
        };

        $(".contentauthoring_cell_element_action_e").live("click", function(){
            var id = $(this).attr("data-element-id");
            var type = $(this).attr("data-element-type");
            isEditingNewElement = false;
            editModeFullScreen(id, type);
        });
        $("#contentauthoring_widget_settings").jqm({
            modal: true,
            overlay: 20,
            toTop: true,
            onHide: sakai_global.contentauthoring.widgetCancel
        });

        sakai_global.contentauthoring.widgetCancel = function(){
            if (isEditingNewElement){
                $(".contentauthoring_cell_element #" + currentlyEditing).parent().remove();
            }
            isEditingNewElement = false;
            $('#contentauthoring_widget_settings').jqmHide();
        };
        sakai_global.contentauthoring.widgetFinish = function(){
            isEditingNewElement = false;
            $("#contentauthoring_widget_content").html("");
            var $parent = $(".contentauthoring_cell_element #" + currentlyEditing).parent();
            $(".contentauthoring_cell_element #" + currentlyEditing).remove();
            $parent.append("<div id='widget_" + $parent.attr("data-element-type") + "_" + currentlyEditing + "' class='widget_inline'></div>");
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
            $('#contentauthoring_widget_settings').jqmHide();
        };

        sakai.api.Widgets.Container.registerFinishFunction(sakai_global.contentauthoring.widgetFinish);
        sakai.api.Widgets.Container.registerCancelFunction(sakai_global.contentauthoring.widgetCancel);


        ////////////////////
        // Remove element //
        ////////////////////

        $(".contentauthoring_cell_element_action_x").live("click", function(){
            var $cell = $(this).parents(".contentauthoring_cell_element");
            $cell.remove();
        });


        /////////////////////
        // Add new element //
        /////////////////////

        var addNewElement = function(event, ui){
            var addedElement = $(ui.item);
            var $row = $(addedElement).parents(".contentauthoring_table_row.contentauthoring_cell_container_row");
            if (addedElement.hasClass("inserterbar_widget_draggable")){
                var type = addedElement.attr("data-element-type");
                // Generate unique id
                var id = sakai.api.Util.generateWidgetId();
                // Replace item
                var element = sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", {
                    "id": id,
                    "type": type,
                    "template": "cell"
                });
                addedElement.replaceWith($(element));
                if (type !== "htmlblock" && type !== "pagetitle"){
                    // Load edit mode
                    isEditingNewElement = true;
                    editModeFullScreen(id, type);
                } else {
                    sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
                }
                setActions();
            };
        };

        var imageLoaded = function(ev, image){
            setHeight($(image).parents(".contentauthoring_table_row.contentauthoring_cell_container_row"));
        };

        ////////////////////
        // Initialization //
        ////////////////////

        var setActions = function(){
            makeRowsReorderable();
            makeColumnsResizable();
            reorderPortlets();
            setCellHover();
            sakai.api.Util.hideOnClickOut("#contentauthoring_row_menu", ".contentauthoring_row_edit", function(){
                rowToChange = false;
                hideEditRowMenu();
            });
        };

        var renderPage = function(currentPageShown){
            if($("#versions_container").is(":visible")){
                $("#inserterbar_action_revision_history").trigger("click");
            }
            sakai.api.Widgets.nofityWidgetShown("#contentauthoring_widget > div:visible", false);
            $("#contentauthoring_widget > div:visible").hide();
            
            if ($("#" + currentPageShown.ref).length === 0) {
                // Create the new element
                var $el = $("<div>").attr("id", currentPageShown.ref);
                // Add element to the DOM
                $("#contentauthoring_widget").append($el);
                var pageStructure = $.extend(true, {}, currentPageShown.content);
                pageStructure.template = "all";
                STORE_PATH = currentPageShown.savePath + "/" + currentPageShown.ref + "/";
                $el.html(sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", pageStructure, false, false));
                sakai.api.Widgets.widgetLoader.insertWidgets(currentPageShown.ref, false, STORE_PATH, currentPageShown.content);
            } else {
                $("#contentauthoring_widget #" + currentPageShown.ref).show();
                sakai.api.Widgets.nofityWidgetShown("#" + currentPageShown.ref, true);
            }

            if (canEdit()){
                $("#contentauthoring_inserterbar_container").show();
            } else {
                $("#contentauthoring_inserterbar_container").hide();
            }

        };

        $(window).bind("sakai.contentauthoring.droppedexternal", addExternal);

        $rootel.contentChange(function(changedHTML){
            $.each($(changedHTML).find("img:visible"), function(i, item){
                imageLoaded({}, $(item));
                $(item).load(function(ev){
                    imageLoaded(ev, $(ev.currentTarget));
                });
            });
        });

        ////////////////////////////
        ////////////////////////////
        // Other management stuff //
        ////////////////////////////
        ////////////////////////////

        $("#inserterbar_action_edit_page").live("click", function(){
            $rootel.addClass("contentauthoring_edit_mode");
            $("#inserterbar_view_container").hide();
            $("#inserterbar_default_widgets_container").show();
            $(window).trigger("edit.contentauthoring.sakai");
            setActions();
            updateColumnHandles();
            // Make temporary copy
            sakai.api.Server.loadJSON(STORE_PATH, function(success, data){
                STORE_PATH = currentPageShown.savePath + "/tmp_" + currentPageShown.ref + "/";
                sakai.api.Server.saveJSON(STORE_PATH, data, null, true);
                // Get the widgets in this page and change their save URL
                var widgets = getWidgetList();
                for (var w in widgets){
                    if (widgets.hasOwnProperty(w)){
                        sakai.api.Widgets.widgetLoader.widgets[widgets[w].id].placement = STORE_PATH + widgets[w].id + "/" + widgets[w].type + "/";
                    }
                }
            });
        });
        
        $("#inserterbar_cancel_edit_page").live("click", function(){
            $rootel.removeClass("contentauthoring_edit_mode");
            $(".contentauthoring_cell_content").sortable("destroy");
            $("#inserterbar_default_widgets_container").hide();
            $("#inserterbar_view_container").show();
            $.ajax({
                "url": STORE_PATH,
                "type": "POST",
                "data": {
                   ":operation": "delete"
                }
            });
            STORE_PATH = currentPageShown.savePath + "/" + currentPageShown.ref + "/";
            renderPage(currentPageShown);
        });

        $("#inserterbar_save_edit_page").live("click", function(){
            $(window).trigger("save.contentauthoring.sakai");
            // Generate the new row / column structure
            var rows = [];
            $.each($(".contentauthoring_row_container"), function(rindex, $row){
                $row = $($row);
                var row = {};
                row.id = $row.attr("data-row-id");
                row.columns = [];
                var columnWidths = getColumnWidths($row);
                for (var i = 0; i < columnWidths.length; i++){
                    var column = {};
                    column.width = columnWidths[i];
                    column.elements = [];
                    $.each($(".contentauthoring_cell_element", $($(".contentauthoring_cell", $row).get(i))), function(eindex, $element){
                        $element = $($element);
                        var element = {};
                        element.type = $element.attr("data-element-type");
                        element.id = $element.attr("data-element-id");
                        column.elements.push(element);
                    });
                    row.columns.push(column);
                }
                rows.push(row);
            });

            $rootel.removeClass("contentauthoring_edit_mode");
            $(".contentauthoring_cell_content").sortable("destroy");
            $("#inserterbar_default_widgets_container").hide();
            $("#inserterbar_view_container").show();
            sakai.api.Server.loadJSON(STORE_PATH, function(success, data){
                $.ajax({
                    "url": STORE_PATH,
                    "type": "POST",
                    "data": {
                       ":operation": "delete"
                    },
                    "success": function(){
                        debug.log("Deleted temporary success");
                    }
                });
                STORE_PATH = currentPageShown.savePath + "/" + currentPageShown.ref + "/";
                data.rows = rows;
                sakai.api.Server.saveJSON(STORE_PATH, data, null, true);
            });
        });

        /////////////////////////////
        /////////////////////////////
        // Moved from sakaidocs.js //
        /////////////////////////////
        /////////////////////////////

        var currentPageShown = {};
        var canEdit = function() {
            return (currentPageShown.canEdit && !currentPageShown.nonEditable);
        };

        $(window).bind("showpage.contentauthoring.sakai", function(ev, _currentPageShown){
            currentPageShown = _currentPageShown;
            renderPage(currentPageShown);
        });

        sakai.api.Widgets.widgetLoader.insertWidgets("s3d-page-main-content");
        $(window).trigger("ready.contentauthoring.sakai");

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("contentauthoring");
});
