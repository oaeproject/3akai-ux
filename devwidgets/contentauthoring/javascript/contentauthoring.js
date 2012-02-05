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

        // Upload external content variables
        var externalFilesUploaded = 0;
        var externalFilesToUpload = 0;
        var filesUploaded = [];
        var uploadError = false;

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
                $("#contentauthoring_add_row").hide();
                $("#inserterbar_widget").hide();
            } else {
                $rootel.addClass("contentauthoring_edit_mode");
                $("#inserterbar_widget").show();
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
                    debug.log("Showing row hover because sakai_global.contentauthoring.isDragging is " + sakai_global.contentauthoring.isDragging);
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
                start: function(){
                    sakai_global.contentauthoring.isDragging = true;
                    $(".contentauthoring_row_handle_container").css("visibility", "hidden");
                    $(".contentauthoring_cell_element_actions").hide();
                    hideEditRowMenu();
                },
                stop: function(event, ui){
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
                start: function(){
                    sakai_global.contentauthoring.isDragging = true;
                    $(".contentauthoring_row_handle_container").css("visibility", "hidden");
                    $(".contentauthoring_cell_element_actions").hide();
                    hideEditRowMenu();
                },
                stop: function(event, ui){
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

        /**
         * Checks if all dropped files have been uploaded
         * @param fileArray {Array}  Array of files that were uploaded
         * @param $el       {Object} jQuery object on which the link was dropped
         */
        var checkAllExternalFilesUploaded = function(filesUploaded, $el){
            externalFilesUploaded++;
            if(externalFilesUploaded === externalFilesToUpload){
                externalFilesUploaded = 0;
                externalFilesToUpload = 0;
                var files = [];
                // Add paths to the array used to set permissions
                $.each(filesUploaded, function(index, item){
                    files.push(item._path);
                });
                if(files.length){
                    sakai.api.Content.setFilePermissionsAsParent(files, currentPageShown.savePath, function(success){
                        // Embed the link in the page
                        var id = sakai.api.Util.generateWidgetId();

                        // Construct post for new embed content
                        var contentData = {
                            "layout":"single",
                            "embedmethod":"original",
                            "items": {},
                            "title": "",
                            "description": "",
                            "details": false,
                            "download": false,
                            "name": false,
                            "sakai:indexed-fields":"title,description",
                            "sling:resourceType":"sakai/widget-data"
                        }
                        if(files.length > 1){
                            contentData.layout = "vertical";
                            contentData.embedmethod = "thumbnail";
                            contentData.name = true;
                        }
                        $.each(filesUploaded, function(index, item){
                            contentData["items"]["__array__" + index + "__"] = "/p/" + item._path;
                        });
                        sakai.api.Server.saveJSON(STORE_PATH + id + "/" + "embedcontent", contentData, function(){
                            filesUploaded = [];
                            var element = sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", {
                                "id": id,
                                "type": "embedcontent",
                                "template": "cell",
                                "settingsoverridden": true
                            });
                            if($el.hasClass("contentauthoring_cell_element")){
                                $el.after($(element));
                            } else {
                                $el.append($(element));
                            }
                            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
                            setActions();
                            sakai.api.Util.progressIndicator.hideProgressIndicator();
                            if (uploadError){
                                sakai.api.Util.notification.show(
                                    sakai.api.i18n.getValueForKey("DRAG_AND_DROP_ERROR", "contentauthoring"),
                                    sakai.api.i18n.getValueForKey("ONE_OR_MORE_DROPPED_FILES_HAS_AN_ERROR", "contentauthoring"));
                            }
                        }, true);
                    });
                } else {
                    if (uploadError){
                        sakai.api.Util.notification.show(
                            sakai.api.i18n.getValueForKey("DRAG_AND_DROP_ERROR", "contentauthoring"),
                            sakai.api.i18n.getValueForKey("ONE_OR_MORE_DROPPED_FILES_HAS_AN_ERROR", "contentauthoring"));
                    }
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                }
            }
        };

        /**
         * Handles drag and drop from the desktop
         * @param files {Object} Contains the drag and drop file data
         * @param $el   {Object} Element on which the files where dropped
         */
        var uploadExternalFiles = function(files, $el){
            uploadError = false;
            filesUploaded = [];
            externalFilesToUpload = files.length;
            $.each(files, function(index, file){
                if (file.size > 0){
                    var xhReq = new XMLHttpRequest();
                    xhReq.open("POST", "/system/pool/createfile", false);
                    var formData = new FormData();
                    formData.append("enctype", "multipart/form-data");
                    formData.append("filename", file.name);
                    formData.append("file", file);
                    xhReq.send(formData);
                    if (xhReq.status == 201){
                        filesUploaded.push($.parseJSON(xhReq.responseText)[file.name].item);
                        checkAllExternalFilesUploaded(filesUploaded, $el);
                    } else {
                        checkAllExternalFilesUploaded(filesUploaded, $el);
                    }
                } else {
                    uploadError = true;
                    checkAllExternalFilesUploaded(filesUploaded, $el);
                }
            });
        };

        /**
        * Uploads the dropped link to the system
        * @param link {String} Link that was dropped
        * @param $el  {Object} jQuery object on which the link was dropped
        */
        var uploadExternalLink = function(link, $el){
            var preview = sakai.api.Content.getPreviewUrl(link);
            var link = {
                "sakai:pooled-content-url": link,
                "mimeType": "x-sakai/link",
                "sakai:preview-url": preview.url,
                "sakai:preview-type": preview.type,
                "sakai:preview-avatar": preview.avatar,
                "sakai:pooled-content-file-name": link
            };

            $.ajax({
                url: "/system/pool/createfile",
                data: link,
                type: "POST",
                dataType: "JSON",
                success: function(data){
                    var files = [];
                    $.each(data, function(index, item){
                        files.push(item.poolId);
                    });
                    sakai.api.Content.setFilePermissionsAsParent(files, currentPageShown.savePath, function(success){
                        // Embed the link in the page
                        var id = sakai.api.Util.generateWidgetId();

                        // Construct post for new embed content
                        var linkData = {
                            "layout":"single",
                            "embedmethod":"original",
                            "title": "",
                            "description": "",
                            "items": {
                                "__array__0__":"/p/" + data._contentItem.poolId
                            },
                            "details":false,
                            "download":false,
                            "name": link,
                            "sakai:indexed-fields":"title,description",
                            "sling:resourceType":"sakai/widget-data"
                        }
                        sakai.api.Server.saveJSON(STORE_PATH + id + "/" + "embedcontent", linkData, function(){
                            var element = sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", {
                                "id": id,
                                "type": "embedcontent",
                                "template": "cell",
                                "settingsoverridden": true
                            });
                            if($el.hasClass("contentauthoring_cell_element")){
                                $el.after($(element));
                            } else {
                                $el.append($(element));
                            }
                            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
                            setActions();
                            sakai.api.Util.progressIndicator.hideProgressIndicator();
                        }, true);
                    });
                },
                error: function() {
                    debug.log("error!");
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                }
            });
        };

        /**
        * @param ev  {object} Drop event
        * @param $el {Object} jQuery object containing the element on which the external content was dropped
        */
        var addExternal = function(ev, $el){
            sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey("INSERTING_YOUR_EXTERNAL_CONTENT", "contentauthoring"), sakai.api.i18n.getValueForKey("PROCESSING"));
            var content = false;
            var contentType = "link";
            var dt = ev.originalEvent.dataTransfer;
            if(dt.files.length){
                contentType = "file";
                content = dt.files;
                uploadExternalFiles(content, $el);
            } else {
                content = dt.getData("Text");
                uploadExternalLink(content, $el);
            }
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
                    debug.log("Showing cell hover because sakai_global.contentauthoring.isDragging is " + sakai_global.contentauthoring.isDragging);
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
            var pageStructure = $.extend(true, {}, currentPageShown.content);
            //$rootel.addClass("contentauthoring_edit_mode");
            pageStructure.template = "all";
            STORE_PATH = currentPageShown.savePath + "/" + currentPageShown.ref + "/";
            $("#contentauthoring_widget").html(sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", pageStructure, false, false));
            debug.log(currentPageShown);
            debug.log(currentPageShown.content);
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH, currentPageShown.content);
            if (canEdit()){
                //setActions();
                //updateColumnHandles();
                $("#contentauthoring_inserterbar_container").show();
            } else {
                $("#contentauthoring_inserterbar_container").hide();
            }
        };

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

        // Highlight on drag entering drop zone.
        $(".contentauthoring_cell_element, .contentauthoring_cell_content").live('dragenter', function(ev) {
            $(".ui-state-highlight.external_content").remove();
            if($(this).hasClass("contentauthoring_cell_element")){
                $(this).after($("<div class='ui-state-highlight external_content'></div>"));
            } else {
                $(this).append($("<div class='ui-state-highlight external_content'></div>"));
            }
            return false;
        });

        // Un-highlight on drag leaving drop zone.
        $(".contentauthoring_cell_element, .contentauthoring_cell_content").live('dragleave', function(ev) {
            return false;
        });

        // Decide whether the thing dragged in is welcome.
        $(".contentauthoring_cell_element, .contentauthoring_cell_content").live('dragover', function(ev) {
            return false;
        });

        // Handle the final drop
        $(".contentauthoring_cell_element,.contentauthoring_cell_content").live('drop', function(ev) {
            ev.preventDefault();
            $(".ui-state-highlight.external_content").remove();
            var dt = ev.originalEvent.dataTransfer;
            addExternal(ev, $(this));
            return false;
        });

        $("#inserterbar_action_edit_page").live("click", function(){
            $rootel.addClass("contentauthoring_edit_mode");
            $("#inserterbar_view_container").hide();
            $("#inserterbar_default_widgets_container").show();
            setActions();
            updateColumnHandles();
            // Make temporary copy
            sakai.api.Server.loadJSON(STORE_PATH, function(success, data){
                STORE_PATH = currentPageShown.savePath + "/tmp_" + currentPageShown.ref + "/";
                sakai.api.Server.saveJSON(STORE_PATH, data, null, true);
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
            debug.log(rows);
            
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
