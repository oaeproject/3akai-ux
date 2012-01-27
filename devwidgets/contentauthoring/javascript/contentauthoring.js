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

        var MINIMUM_COLUMN_SIZE = 0.05;
        var STORE_PATH = "/~" + sakai.data.me.user.userid + "/test/";

        var pageStructure = {
            "rows": [
                {
                    "id": "id00015",
                    "columns": [
                        {
                            "width": 1,
                            "elements": [
                                {
                                    "id": "id00001",
                                    "type": "pagetitle"
                                },
                                {
                                    "id": "id00002",
                                    "type": "htmlblock"
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "id00016",
                    "columns": [
                        {
                            "width": 0.5,
                            "elements": [
                                {
                                    "id": "id00003",
                                    "type": "embedcontent"
                                }
                            ]
                        },
                        {
                            "width": 0.5,
                            "elements": [
                                {
                                    "id": "id00004",
                                    "type": "embedcontent"
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "id00017",
                    "columns": [
                        {
                            "width": 1,
                            "elements": [
                                {
                                    "id": "id00025",
                                    "type": "pagetitle"
                                },
                                {
                                    "id": "id00005",
                                    "type": "htmlblock"
                                },
                                {
                                    "id": "id00105",
                                    "type": "googlemaps"
                                }
                            ]
                        }
                    ]
                },
                {
                    "id": "id00018",
                    "columns": [
                        {
                            "width": 0.33,
                            "elements": [
                                {
                                    "id": "id00006",
                                    "type": "embedcontent"
                                },
                                {
                                    "id": "id00007",
                                    "type": "pagetitle"
                                },
                                {
                                    "id": "id00008",
                                    "type": "htmlblock"
                                }
                            ]
                        },
                        {
                            "width": 0.33,
                            "elements": [
                                {
                                    "id": "id00009",
                                    "type": "embedcontent"
                                },
                                {
                                    "id": "id00010",
                                    "type": "pagetitle"
                                },
                                {
                                    "id": "id00011",
                                    "type": "htmlblock"
                                }
                            ]
                        },
                        {
                            "width": 0.34,
                            "elements": [
                                {
                                    "id": "id00012",
                                    "type": "embedcontent"
                                },
                                {
                                    "id": "id00013",
                                    "type": "pagetitle"
                                },
                                {
                                    "id": "id00014",
                                    "type": "htmlblock"
                                }
                            ]
                        }
                    ]
                }
            ]
        }


        ///////////////////////
        // Utility functions //
        ///////////////////////

        var isInEditMode = function(){
            return $rootel.hasClass("contentauthoring_edit_mode");
        };


        //////////////////////
        // Toggle edit mode //
        //////////////////////

        $("#contentauthoring_toggle_edit_mode").bind("click", function(){
            if (isInEditMode()){
                $rootel.removeClass("contentauthoring_edit_mode");
                $(".contentauthoring_cell_content").sortable("destroy");
                $("#contentauthoring_buttons_elements").hide();
                $("#contentauthoring_add_row").hide();
            } else {
                $rootel.addClass("contentauthoring_edit_mode");
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
                if (isInEditMode()) {
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
                start: hideEditRowMenu
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
                placeholder: "contentauthoring_cell_reorder_highlight",
                stop: addNewElement,
                opacity: 0.4,
                start: hideEditRowMenu
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
            $(".contentauthoring_cell").resizable({
                handles: {
                    'e': '.contentauthoring_cell_handle,.contentauthoring_cell_handle_grab'
                },
                helper: "ui-resizable-helper",
                start: function(event, ui) {
                    var $row = $(this).parent();
                    currentSizes = getColumnWidths($row);
                },
                stop: function(ev, ui){
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
                    setHeight($row);
                }
            });
        };
        
        ////////////////////
        // Column handles //
        ////////////////////

        var updateColumnHandles = function(){
            $(".contentauthoring_cell_handle").show();
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
            updateColumnHandles();
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

        var hideEditRowMenu = function(show){
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
            debug.log(widths);
            var remainingWidth = 1;
            var $cells = $(".contentauthoring_cell", $row);
            debug.log($cells.length);
            for (var i = lastColumn + 1; i < $cells.length; i++){
                var $cell = $($cells[i]);
                var $cellcontent = $(".contentauthoring_cell_content", $cell).children();
                $(".contentauthoring_cell_content", $($cells[lastColumn])).append($cellcontent);
                $cell.remove();
                remainingWidth -= widths[i];
            }
            for (var i = 0; i <= lastColumn; i++) {
                debug.log(widths[i]);
                debug.log(remainingWidth);
                debug.log(widths[i] / remainingWidth);
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
        });

        $("#contentauthoring_row_menu_add_below").live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']");
            hideEditRowMenu();
            $row.after(generateNewRow());
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
            setActions();
        });


        /////////////////////
        // Cell action bar //
        /////////////////////

        var setCellHover = function(){
            $(".contentauthoring_cell_element").unbind("hover");
            $(".contentauthoring_cell_element").hover(function(){
                if (isInEditMode()) {
                    $(".contentauthoring_cell_element_actions", $(this)).css("left", ($(this).position().left + $(this).width() - $(".contentauthoring_cell_element_actions", $(this)).width() - 5) + "px");
                    $(".contentauthoring_cell_element_actions", $(this)).css("top", ($(this).position().top + 5) + "px");
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
            var id = $(this).parent().attr("data-element-id");
            var type = $(this).parent().attr("data-element-type");
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
            var $row = $(this).parents(".contentauthoring_table_row.contentauthoring_cell_container_row");
            $(this).parent().parent().remove();
        });


        /////////////////////
        // Add new element //
        /////////////////////

        $("#contentauthoring_buttons_elements").append(sakai.api.Util.TemplateRenderer("contentautoring_elements_toadd_template", {"sakai": sakai}));
        var makeElementsDraggable = function(){
            $( "#contentauthoring_buttons_elements div" ).draggable({
    			connectToSortable: ".contentauthoring_cell_content",
    			helper: "clone",
    			revert: "invalid",
    			start: hideEditRowMenu
    		});
        };

        var addNewElement = function(event, ui){
            var addedElement = $(ui.item);
            var $row = $(addedElement).parents(".contentauthoring_table_row.contentauthoring_cell_container_row");
            if (addedElement.hasClass("contentauthoring_buttons_element_new")){
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


        ////////////////////////
        // Movable button bar //
        ////////////////////////

        $("#contentauthoring_buttons").draggable();


        ////////////////////
        // Initialization //
        ////////////////////

        var setActions = function(){
            makeRowsReorderable();
            makeColumnsResizable();
            reorderPortlets();
            setCellHover();
            $("#contentauthoring_add_row").show();
            $("#contentauthoring_buttons_elements").show();
            makeElementsDraggable();
            sakai.api.Util.hideOnClickOut("#contentauthoring_row_menu", ".contentauthoring_row_edit", function(){
                rowToChange = false;
                hideEditRowMenu();
            });
        };

        var renderPage = function(){
            $rootel.addClass("contentauthoring_edit_mode");
            pageStructure.template = "all";
            $("#contentauthoring_widget").html(sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", pageStructure, false, false));
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
            setActions();
            updateColumnHandles();
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

        renderPage();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("contentauthoring");
});
