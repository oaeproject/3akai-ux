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
        var $pageRootEl = false;
        sakai_global.contentauthoring.isDragging = false;

        var MINIMUM_COLUMN_SIZE = 0.10;
        var USE_ELEMENT_DRAG_HELPER = true;
        var STORE_PATH = false;

        // Upload external content variables
        var externalFilesUploaded = 0;
        var externalFilesToUpload = 0;
        var filesUploaded = [];
        var uploadError = false;

        var pagesCache = {};

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

        /**
        * Matches the number of columns to the "columncount" data attribute on list items 
        * that indicates how many are used and puts a black check icon in front of the list item
        * @param {Object} element jQuery object with classname "contentauthoring_row_container"
        *                         that is the parent element of all columns
        */
        var checkColumnsUsed = function(element){
            var numColumns = $(element).find(".contentauthoring_cell.ui-resizable").length;
            var $menuItems = $("#contentauthoring_row_menu ul li", $rootel);
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
            $(".contentauthoring_row_container", $rootel).unbind("hover");
            $(".contentauthoring_row_container", $rootel).hover(function(){
                if (isInEditMode() && !sakai_global.contentauthoring.isDragging) {
                    $(".contentauthoring_row_handle_container", $(this)).css("visibility", "visible");
                }
            }, function(){
                $(".contentauthoring_row_handle_container", $(this)).css("visibility", "hidden");
            });
        };

        /**
        * Fix for https://jira.sakaiproject.org/browse/SAKIII-4878
        */
        var tinyMCEInstanceFix = function(){
            $(".htmlblock_widget", $rootel).find(".mceExternalToolbar").hide();
            $.each($("#inserterbar_widget .mceAction", $rootel).children(".mceColorPreview"), function(i, color){
                if(i > 0){
                    $(color).hide();
                }
            });
        };

        var makeRowsReorderable = function(){
            $("#contentauthoring_widget_container", $pageRootEl).sortable({
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
                        tinyMCE.execCommand('mceRemoveControl', false, $(this).attr('id'));
                    });
                    sakai_global.contentauthoring.isDragging = true;
                    $(".contentauthoring_row_handle_container", $rootel).css("visibility", "hidden");
                    $(".contentauthoring_cell_element_actions", $rootel).hide();
                    hideEditRowMenu();
                },
                stop: function(event, ui){
                    $(ui.item).find('.tinyMCE').each(function(){
                        tinyMCE.execCommand( 'mceAddControl', true, $(this).attr('id'));
                        tinyMCEInstanceFix();
                    });
                    $(this).sortable("refresh");
                    sakai_global.contentauthoring.isDragging = false;
                    storeCurrentPageLayout();
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
                // if row is part of the pageviewer than equalheights doesn't need to be set
                if (!$('.contentauthoring_cell_content', $row).parents(".pageviewer_widget").length){
                    $('.contentauthoring_cell_content', $row).equalHeights();
                }
            }
        };

        var reorderPortlets = function(){
            $(".contentauthoring_cell_content", $rootel).sortable({
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
                    $(".contentauthoring_row_handle_container", $rootel).css("visibility", "hidden");
                    $(".contentauthoring_cell_element_actions", $rootel).hide();
                    hideEditRowMenu();
                },
                stop: function(event, ui){
                    $(ui.item).find('.tinyMCE').each(function(){
                        tinyMCE.execCommand( 'mceAddControl', true, $(this).attr('id') );
                        tinyMCEInstanceFix();
                        $(this).sortable("refresh");
                    });
                    sakai_global.contentauthoring.isDragging = false;
                    $(".contentauthoring_dummy_element", $(this)).remove();
                    if($(ui.item).data("collectionId")){
                        addExistingElement(event, ui);
                    } else if(!$(ui.item).data("contentId")){
                        addNewElement(event, $(ui.item));
                    } else {
                        addExistingElement(event, ui);
                    }
                    checkColumnsEmpty();
                    storeCurrentPageLayout();
                }
    		});
        }


        ////////////////////
        // Resize columns //
        ////////////////////

        var currentSizes = [];

        var getColumnWidths = function($row){
            var totalWidth = $("#contentauthoring_widget_container", $pageRootEl).width();
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
            $(window).trigger("resize.contentauthoring.sakai");
            $(".contentauthoring_cell", $rootel).resizable({
                handles: {
                    'e': '.contentauthoring_cell_handle,.contentauthoring_cell_handle_grab'
                },
                helper: "ui-resizable-helper",
                start: function(event, ui) {
                    // Fix for iFrames
                    $('<div class="ui-resizable-iframeFix" style="background: #fff;"></div>').css({
                        width: $(document).width() + "px", height: $(document).height() + "px",
                        top: "0px", left: "0px",
                        position: "absolute", opacity: "0.001", zIndex: 100000
                    }).appendTo("body");

                    sakai_global.contentauthoring.isDragging = true;
                    var $row = $(this).parent();
                    currentSizes = getColumnWidths($row);
                },
                stop: function(ev, ui){
                    // Fix for iFrames
                    $("div.ui-resizable-iframeFix").remove();

                    sakai_global.contentauthoring.isDragging = false;
                    var totalRowWidth = $("#contentauthoring_widget_container", $pageRootEl).width();
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
                    $(window).trigger("resize.contentauthoring.sakai");
                    setHeight($row);
                    storeCurrentPageLayout();
                }
            });
        };
        
        ////////////////////
        // Column handles //
        ////////////////////

        /**
         * Updates all handles on in the content authoring widget
         */
        var updateAllHandles = function() {
            var $rows = $(".contentauthoring_row_container");
            for (var r = 0; r < $rows.length; r++) {
                var $columns = $(".contentauthoring_cell", $($rows[r]));
                var $lastColumn = $($columns[$columns.length - 1]);
                $(".contentauthoring_cell_handle", $lastColumn).hide();
                setHeight($($rows[r]));
            }
        };

        /**
         * Updates column handles and sends out a resize event
         */
        var updateColumnHandles = function() {
            $(".contentauthoring_cell_handle", $rootel).show();
            $(window).trigger("resize.contentauthoring.sakai");
            updateAllHandles();
        };

        $(window).bind("updateheight.contentauthoring.sakai", updateAllHandles);

        ///////////////////
        // Add a new row //
        ///////////////////

        var generateNewRow = function(){
            var newRow = {
                "id": sakai.api.Util.generateWidgetId(),
                "columns": [
                    {
                        "width": 1,
                        "elements": [
                            {
                                "dummytext": true
                            }
                        ]
                    }
                ]
            }
            newRow.template = "row";
            newRow.sakai = sakai;
            return sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", newRow, false, false);
        };


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
                                "settingsoverridden": true,
                                "sakai": sakai
                            });
                            if($el.hasClass("contentauthoring_cell_element")){
                                $el.after($(element));
                            } else {
                                $el.append($(element));
                            }
                            checkColumnsEmpty();
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
                                "settingsoverridden": true,
                                "sakai": sakai
                            });
                            if($el.hasClass("contentauthoring_cell_element")){
                                $el.after($(element));
                            } else {
                                $el.append($(element));
                            }
                            checkColumnsEmpty();
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
            $("#contentauthoring_row_menu", $rootel).hide();
            $(".contentauthoring_row_handle_container", $rootel).removeClass("selected");
        };

        $(".contentauthoring_row_edit", $rootel).live("click", function(){
            var currentRow = $(this).attr("data-row-id");
            if (currentRow === rowToChange){
                hideEditRowMenu();
            } else {
                if($(".contentauthoring_row", $("#" + currentPageShown.ref)).length > 1){
                    $("#contentauthoring_row_menu_remove", $rootel).parent("li").show();
                } else {
                    $("#contentauthoring_row_menu_remove", $rootel).parent("li").hide();
                }
                $($(this).parents(".contentauthoring_row_handle_container")).addClass("selected");
                $("#contentauthoring_row_menu", $rootel).css("left", $(this).parent().position().left + "px");
                $("#contentauthoring_row_menu", $rootel).css("top", ($(this).parent().position().top + 7) + "px");
                $("#contentauthoring_row_menu", $rootel).show();
                rowToChange = currentRow;
                checkColumnsUsed($(this).parents(".contentauthoring_row_container"));
            }
        });

        var checkColumnsEmpty = function(){
            $.each($(".contentauthoring_cell_content", $("#contentauthoring_widget", $rootel)), function(i, cellcontainer){
                if(!$(cellcontainer).find(".contentauthoring_cell_element").length){
                    if(!$(cellcontainer).find(".contentauthoring_dummy_element").length){
                        var dummy = $(sakai.api.Util.TemplateRenderer("contentauthoring_dummy_element_template", {}));
                        $(cellcontainer).append(dummy);
                    }
                } else {
                    $(cellcontainer).find(".contentauthoring_dummy_element").remove();
                }
            });
        };

        var removeColumns = function($row, lastColumn){
            var widths = getColumnWidths($row);
            var remainingWidth = 1;
            var $cells = $(".contentauthoring_cell", $row);
            $row.find(".contentauthoring_dummy_element").remove();
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
            checkColumnsEmpty();
            updateColumnHandles();
            storeCurrentPageLayout();
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
                    },
                    "sakai": sakai
                }, false, false));
            }
            for (var i = 0; i < widths.length; i++){
                $($cells[i]).css("width", widths[i] * (1 - (newColumnWidth * (totalColumns - widths.length))) * 100 + "%");
            }
            setActions();
            updateColumnHandles();
            storeCurrentPageLayout();
        };

        $("#contentauthoring_row_menu_one", $rootel).live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']", $rootel);
            removeColumns($row, 0);
            hideEditRowMenu();
            setActions();
            tinyMCEInstanceFix();
            setHeight($row);
        });

        $("#contentauthoring_row_menu_two", $rootel).live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']", $rootel);
            var $cells = $(".contentauthoring_cell", $row);
            if ($cells.length > 2){
                removeColumns($row, 1);
            } else if ($cells.length < 2){
                addColumns($row, 2);
            }
            hideEditRowMenu();
            tinyMCEInstanceFix();
            setHeight($row);
        });

        $("#contentauthoring_row_menu_three", $rootel).live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']", $rootel);
            var $cells = $(".contentauthoring_cell", $row);
            if ($cells.length < 3){
                addColumns($row, 3);
            }
            hideEditRowMenu();
            tinyMCEInstanceFix();
            setHeight($row);
        });

        $("#contentauthoring_row_menu_remove", $rootel).live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']", $rootel);
            hideEditRowMenu();
            $row.find('.tinyMCE').each(function(){
                tinyMCE.execCommand( 'mceRemoveControl', false, $(this).attr('id') );
            });
            $row.remove();
            storeCurrentPageLayout();
        });

        $("#contentauthoring_row_menu_add_above", $rootel).live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']", $rootel);
            hideEditRowMenu();
            $row.before(generateNewRow());
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
            setActions();
            updateColumnHandles();
            storeCurrentPageLayout();
        });

        $("#contentauthoring_row_menu_add_below", $rootel).live("click", function(){
            var $row = $(".contentauthoring_row_container[data-row-id='" + rowToChange + "']", $rootel);
            hideEditRowMenu();
            $row.after(generateNewRow());
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
            setActions();
            updateColumnHandles();
            storeCurrentPageLayout();
        });


        /////////////////////
        // Cell action bar //
        /////////////////////

        var setCellHover = function(){
            $(".contentauthoring_cell_element", $rootel).unbind("hover");
            $(".contentauthoring_cell_element", $rootel).hover(function(){
                if (isInEditMode() && !sakai_global.contentauthoring.isDragging) {
                    $(".contentauthoring_cell_element_actions", $(this)).css("left", $(this).position().left + "px");
                    $(".contentauthoring_cell_element_actions", $(this)).css("top", ($(this).position().top + 1) + "px");
                    $(".contentauthoring_cell_element_actions", $(this)).show();
                    $(this).addClass("contentauthoring_cell_element_hover");
                }
            }, function(ev, ui){
                $(".contentauthoring_cell_element_actions", $rootel).hide();
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
            $("#contentauthoring_widget_content", $rootel).html("");
            if (sakai.widgets[type]) {
                var widgetSettingsWidth = 650;
                if (sakai.widgets[type].settingsWidth) {
                    widgetSettingsWidth = sakai.widgets[type].settingsWidth;
                }
                $("#contentauthoring_widget_settings_content", $rootel).html(sakai.api.Security.saneHTML('<div id="widget_' + type + '_' + id + '" class="widget_inline"/>'));
                $("#contentauthoring_widget_settings_title", $rootel).html(sakai.api.Widgets.getWidgetTitle(sakai.widgets[type].id));
                sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget_settings_content", true, STORE_PATH);
                $('#contentauthoring_widget_settings', $rootel).css({
                    'width': widgetSettingsWidth + "px",
                    'margin-left': -(widgetSettingsWidth / 2) + "px",
                    'top': ($(window).scrollTop() + 50) + "px"
                }).jqmShow();
            }
        };

        $(".contentauthoring_cell_element_action_e", $rootel).live("click", function(){
            var id = $(this).attr("data-element-id");
            var type = $(this).attr("data-element-type");
            isEditingNewElement = false;
            editModeFullScreen(id, type);
        });
        $("#contentauthoring_widget_settings", $rootel).jqm({
            modal: true,
            overlay: 20,
            toTop: true,
            onHide: sakai_global.contentauthoring.widgetCancel
        });

        sakai_global.contentauthoring.widgetCancel = function(){
            if (isEditingNewElement){
                $(".contentauthoring_cell_element #" + currentlyEditing, $rootel).parent().remove();
                checkColumnsEmpty();
            }
            isEditingNewElement = false;
            $('#contentauthoring_widget_settings').jqmHide();
        };
        sakai_global.contentauthoring.widgetFinish = function(){
            isEditingNewElement = false;
            $("#contentauthoring_widget_content").html("");
            var $parent = $(".contentauthoring_cell_element #" + currentlyEditing, $rootel).parent();
            $(".contentauthoring_cell_element #" + currentlyEditing, $rootel).remove();
            $parent.append("<div id='widget_" + $parent.attr("data-element-type") + "_" + currentlyEditing + "' class='widget_inline'></div>");
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
            $('#contentauthoring_widget_settings').jqmHide();
            updateAllColumnHandles();
        };

        sakai.api.Widgets.Container.registerFinishFunction(sakai_global.contentauthoring.widgetFinish);
        sakai.api.Widgets.Container.registerCancelFunction(sakai_global.contentauthoring.widgetCancel);


        ////////////////////
        // Remove element //
        ////////////////////

        $(".contentauthoring_cell_element_action_x", $rootel).live("click", function(){
            var $cell = $(this).parents(".contentauthoring_cell_element");
            var $row = $cell.parents(".contentauthoring_table_row.contentauthoring_cell_container_row");
            $cell.find('.tinyMCE').each(function(){
                tinyMCE.execCommand( 'mceRemoveControl', false, $(this).attr('id') );
            });
            if($(this).parents(".contentauthoring_cell_content").children(".contentauthoring_cell_element").length > 1){
                $cell.remove();
            } else {
                var dummy = $(sakai.api.Util.TemplateRenderer("contentauthoring_dummy_element_template", {}));
                $cell.replaceWith(dummy);
            }
            setHeight($row);
            storeCurrentPageLayout();
        });


        /////////////////////
        // Add new element //
        /////////////////////

        var addNewElement = function(event, addedElement, clickedElement){
            if(!clickedElement){
                var $row = $(addedElement).parents(".contentauthoring_table_row.contentauthoring_cell_container_row");
                if (addedElement.hasClass("inserterbar_widget_draggable")){
                    var type = addedElement.attr("data-element-type");
                    // Generate unique id
                    var id = sakai.api.Util.generateWidgetId();
                    // Replace item
                    var element = sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", {
                        "id": id,
                        "type": type,
                        "template": "cell",
                        "settingsoverridden": false,
                        "sakai": sakai
                    });
                    addedElement.replaceWith($(element));
                    if (sakai.widgets[type].hasSettings){
                        // Load edit mode
                        isEditingNewElement = true;
                        editModeFullScreen(id, type);
                    } else {
                        sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
                    }
                    setActions();
                };
            } else {
                var $row = $(addedElement);
                if (clickedElement.hasClass("inserterbar_widget_draggable")){
                    var type = clickedElement.attr("data-element-type");
                    // Generate unique id
                    var id = sakai.api.Util.generateWidgetId();
                    // Replace item
                    var element = sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", {
                        "id": id,
                        "type": type,
                        "template": "cell",
                        "settingsoverridden": false,
                        "sakai": sakai
                    });
                    $row.find(".contentauthoring_cell_content:last").append($(element));
                    if (sakai.widgets[type].hasSettings){
                        // Load edit mode
                        isEditingNewElement = true;
                        editModeFullScreen(id, type);
                    } else {
                        sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
                    }
                    checkColumnsEmpty();
                    setActions();
                };
            }
            storeCurrentPageLayout();
        };


        //////////////////////////
        // Add existing element //
        //////////////////////////

        var addExistingElement = function(ev, ui){
            // Generate unique id
            var id = sakai.api.Util.generateWidgetId();

            // Construct post for new embed content
            var contentData = {
                "layout":"single",
                "embedmethod":"original",
                "items": {
                    "__array__0__":"/p/" + ($(ui.item).data("contentId") || $(ui.item).data("collectionId"))
                },
                "title": "",
                "description": "",
                "details": false,
                "download": false,
                "name": false,
                "sakai:indexed-fields":"title,description",
                "sling:resourceType":"sakai/widget-data"
            }

            sakai.api.Server.saveJSON(STORE_PATH + id + "/" + "embedcontent", contentData, function(){
                var element = sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", {
                    "id": id,
                    "type": "embedcontent",
                    "template": "cell",
                    "settingsoverridden": true,
                    "sakai": sakai
                });
                $(ui.item).replaceWith($(element));
                checkColumnsEmpty();
                sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, STORE_PATH);
                setActions();
                sakai.api.Util.progressIndicator.hideProgressIndicator();
            });
        };

        var imageLoaded = function(ev, image){
            setHeight($(image).parents(".contentauthoring_table_row.contentauthoring_cell_container_row"));
        };

        ////////////////////////////////////////////////
        // Checking whether the current page is empty //
        ////////////////////////////////////////////////

        /**
         * Checks for empty htmlblock widgets and returns a Boolean
         *
         * @return {Boolean} false if the htmlblock widget is not empty
         *                   true if the htmlblock widget is empty
         */
        var checkHTMLBlockEmpty = function(currentPageShown, element){
            if (currentPageShown.content[element.id] &&
                currentPageShown.content[element.id].htmlblock &&
                $.trim($(currentPageShown.content[element.id].htmlblock.content).text())){
                return false;
            }
            return true;
        };

        /**
         * Determines if a page is empty by checking its content
         * Shows a default image when no content is present in the page
         * Empty content = empty rows and rows with empty html blocks
         *
         * @param currentPageShown {Object} Object containing data for the current page
         */
        var determineEmptyPage = function(currentPageShown){
            // emptyPageElements checks for empty rows
            var emptyPageElements = true;
            // emptyPageElementContents checks for empty tinyMCe instances
            var emptyPageElementContents = true;

            // Check for empty rows, if a row with content or (empty) tinyMCE is detected emptyPageElements will be set to false
            // emptyPageElements will later be overridden if the tinymce instances don't have any content after all
            $.each(currentPageShown.content.rows, function(rowIndex, row){
                $.each(row.columns, function(columnIndex, column){
                    if(column.elements.length){
                        $.each(column.elements, function(elIndex, element){
                            // Check designed to look at specific storage types
                            if(element.type === "htmlblock"){
                                // Returns false if not empty, true if empty
                                emptyPageElements = checkHTMLBlockEmpty(currentPageShown, element);
                            } else {
                                emptyPageElements = false;
                            }
                            // If false returned there must be content and the page should be rendered
                            return emptyPageElements;
                        });
                        return emptyPageElements;
                    }
                    return emptyPageElements;
                });
                return emptyPageElements;
            });

            // If the page is empty show the illustration
            if (emptyPageElements){
                $("#contentauthoring_widget_container", $pageRootEl).hide();
                sakai.api.Util.TemplateRenderer("contentauthoring_no_content_template", {
                    "canEdit": currentPageShown.canEdit
                }, $("#contentauthoring_no_content_container", $rootel));
                $("#contentauthoring_no_content_container", $rootel).show();
            } else {
                $("#contentauthoring_no_content_container", $rootel).hide();
                $("#contentauthoring_widget_container", $pageRootEl).show();
            }
        };

        var determineEmptyAfterSave = function(){
            var cellElements = $("#" + currentPageShown.ref + " .contentauthoring_cell_element", $rootel);
            var containsText = false;
            $.each(cellElements, function(index, el){
                if (sakai.api.Util.determineEmptyContent($(el).html())){
                    containsText = true;
                }
            });
            if (!containsText){
                $("#contentauthoring_widget_container", $pageRootEl).hide();
                sakai.api.Util.TemplateRenderer("contentauthoring_no_content_template", {
                    "canEdit": currentPageShown.canEdit
                }, $("#contentauthoring_no_content_container", $rootel));
                $("#contentauthoring_no_content_container", $rootel).show();
            } else {
                $("#contentauthoring_no_content_container", $rootel).hide();
                $("#contentauthoring_widget_container", $pageRootEl).show();
            }
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

        var renderPage = function(currentPageShown, requiresRefresh){
            $rootel.removeClass("contentauthoring_edit_mode");
            $(window).trigger("render.contentauthoring.sakai");
            $pageRootEl = $("#" + currentPageShown.ref, $rootel);
            showPageEditControls(currentPageShown.addArea);
            if($("#versions_container").is(":visible")){
                $("#inserterbar_action_revision_history").trigger("click");
            }
            sakai.api.Widgets.nofityWidgetShown("#contentauthoring_widget > div:visible", false);
            $("#contentauthoring_widget > div:visible", $rootel).hide();
            STORE_PATH = currentPageShown.pageSavePath + "/" + currentPageShown.saveRef + "/";
            if ($pageRootEl.length === 0 || requiresRefresh) {
                if (requiresRefresh){
                    $pageRootEl.find('.tinyMCE').each(function(){
                        tinyMCE.execCommand( 'mceRemoveControl', false, $(this).attr('id') );
                    });
                    // Remove the old one in case this is caused by a cancel changes option
                    $pageRootEl.remove();
                }
                // Create the new element
                $pageRootEl = $("<div>").attr("id", currentPageShown.ref);
                // Add element to the DOM
                $("#contentauthoring_widget", $rootel).append($pageRootEl);
                var pageStructure = $.extend(true, {}, currentPageShown.content);
                pageStructure.template = "all";
                pageStructure.sakai = sakai;
                $pageRootEl.html(sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", pageStructure, false, false));
                sakai.api.Widgets.widgetLoader.insertWidgets(currentPageShown.ref, false, STORE_PATH, currentPageShown.content);
            } else {
                $pageRootEl.show();
                sakai.api.Widgets.nofityWidgetShown("#" + currentPageShown.ref, true);
            }

            determineEmptyPage(currentPageShown);

            if (canEdit()){
                $("#contentauthoring_inserterbar_container", $rootel).show();
            } else {
                $("#contentauthoring_inserterbar_container", $rootel).hide();
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
        
        //////////////
        // Autosave //
        //////////////

        $('#autosave_dialog').jqm({
            modal: true,
            overlay: 20,
            toTop: true
        });

        ////////////////////////////
        ////////////////////////////
        // Other management stuff //
        ////////////////////////////
        ////////////////////////////


        // Un-highlight on drag leaving drop zone.
        $(".contentauthoring_cell_element", $rootel).live('dragleave', function(ev) {
            $(".contentauthoring_row_reorder_highlight.external_content", $rootel).remove();
            return false;
        });

        // Decide whether the thing dragged in is welcome.
        $(".contentauthoring_cell_element, .contentauthoring_cell_content, .contentauthoring_row_reorder_highlight", $rootel).live('dragover', function(ev) {
            $(".contentauthoring_row_reorder_highlight.external_content", $rootel).remove();
            if($(this).hasClass("contentauthoring_cell_element")){
                $(this).after($("<div class='contentauthoring_row_reorder_highlight external_content'></div>"));
            } else {
                $(this).append($("<div class='contentauthoring_row_reorder_highlight external_content'></div>"));
            }
            return false;
        });

        // Handle the final drop
        $(".contentauthoring_cell_element, .contentauthoring_cell_content", $rootel).live('drop', function(ev) {
            ev.preventDefault();
            $(".contentauthoring_row_reorder_highlight.external_content", $rootel).remove();
                var dt = ev.originalEvent.dataTransfer;
                addExternal(ev, $(this));
            return false;
        });

        var makeTempCopy = function(data){
            // Make temporary copy 
            sakai.api.Server.saveJSON(STORE_PATH, data, null, true);
            // Get the widgets in this page and change their save URL
            var widgets = getWidgetList();
            for (var w in widgets){
                if (widgets.hasOwnProperty(w) && sakai.api.Widgets.widgetLoader.widgets[widgets[w].id]){
                    sakai.api.Widgets.widgetLoader.widgets[widgets[w].id].placement = STORE_PATH + widgets[w].id + "/" + widgets[w].type + "/";
                }
            }
        };

        var editPage = function(){
            $(window).trigger("edit.contentauthoring.sakai");
            $(".contentauthoring_empty_content", $rootel).remove();
            $("#contentauthoring_widget_container", $pageRootEl).show();
            $rootel.addClass("contentauthoring_edit_mode");
            setActions();
            updateColumnHandles();
            // Check whether there is an autosaved version
            sakai.api.Server.loadJSON(STORE_PATH, function(success, pageData){
                STORE_PATH = currentPageShown.pageSavePath + "/tmp_" + currentPageShown.saveRef + "/";
                sakai.api.Server.loadJSON(STORE_PATH, function(success2, autoSaveData){
                    pageData = sakai.api.Server.removeServerCreatedObjects(pageData, ["_"]);
                    autoSaveData = sakai.api.Server.removeServerCreatedObjects(autoSaveData, ["_"]);
                    if (!success2 || $.toJSON(pageData) === $.toJSON(autoSaveData)){
                        makeTempCopy(pageData);
                    } else {
                        sakai.api.Util.bindDialogFocus($("#autosave_dialog"));
                        $('#autosave_dialog').jqmShow();
                        $("#autosave_keep").unbind("click");
                        $("#autosave_keep").bind("click", function(){
                            makeTempCopy(pageData);
                            $('#autosave_dialog').jqmHide();
                        });
                        $("#autosave_revert").unbind("click");
                        $("#autosave_revert").bind("click", function(){
                            $("#" + currentPageShown.ref).find('.tinyMCE').each(function(){
                                tinyMCE.execCommand('mceRemoveControl', false, $(this).attr('id'));
                            });
                            var $el = $("#" + currentPageShown.ref);
                            var pageStructure = $.extend(true, {}, autoSaveData);
                            pageStructure.template = "all";
                            pageStructure.sakai = sakai;
                            $el.html(sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", pageStructure, false, false));
                            sakai.api.Widgets.widgetLoader.insertWidgets(currentPageShown.ref, false, STORE_PATH, autoSaveData);
                            setActions();
                            updateColumnHandles();
                            $('#autosave_dialog').jqmHide();
                        });
                    }
                });
            });
        };
        $("#inserterbar_action_edit_page", $rootel).live("click", editPage);

        var cancelEditPage = function(){
            $(window).trigger("render.contentauthoring.sakai");
            $rootel.removeClass("contentauthoring_edit_mode");
            $(".contentauthoring_cell_content", $rootel).sortable("destroy");
            $.ajax({
                "url": STORE_PATH,
                "type": "POST",
                "data": {
                   ":operation": "delete"
                }
            });
            STORE_PATH = currentPageShown.pageSavePath + "/" + currentPageShown.saveRef;

            // Reset the widget data in the widgetloader
            $.each(currentPageShown.content, function(key, item){
                if (key.substring(0,1) !== "_" && key !== "rows" && sakai.api.Widgets.widgetLoader.widgets[key]){
                    sakai.api.Widgets.widgetLoader.widgets[key].widgetData = item;
                }
            });
            // Get the widgets in this page and change their save URL
            var widgets = getWidgetList();
            for (var w in widgets){
                if (widgets.hasOwnProperty(w) && sakai.api.Widgets.widgetLoader.widgets[widgets[w].id]){
                    sakai.api.Widgets.widgetLoader.widgets[widgets[w].id].placement = STORE_PATH + widgets[w].id + "/" + widgets[w].type + "/";
                }
            }
            renderPage(currentPageShown, true);
        }
        $("#inserterbar_cancel_edit_page", $rootel).live("click", cancelEditPage);

        var storeCurrentPageLayout = function(){
            var pageLayout = getCurrentPageLayout().rows;
            sakai.api.Server.saveJSON(STORE_PATH + "rows/", pageLayout, null, true);
        };

        var getCurrentPageLayout = function(){
            var rows = [];
            var widgetIds = [];
            $(".contentauthoring_row_container", $("#" + currentPageShown.ref)).each(function(rindex, $row){
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
                        widgetIds.push(element.id);
                    });
                    row.columns.push(column);
                }
                rows.push(row);
            });
            return {
                "rows": rows,
                "widgetIds": widgetIds
            }
        };

        $("#inserterbar_save_edit_page", $rootel).live("click", function(){
            $(window).trigger("save.contentauthoring.sakai");
            $(window).trigger("render.contentauthoring.sakai");
            // Generate the new row / column structure
            var pageLayout = getCurrentPageLayout();

            $rootel.removeClass("contentauthoring_edit_mode");
            $(".contentauthoring_cell_content", $rootel).sortable("destroy");
            determineEmptyAfterSave();

            finishSavePage(pageLayout.rows, pageLayout.widgetIds);

            // Update the currentPage variable
            currentPageShown.content = {};
            currentPageShown.content.rows = pageLayout.rows;
            $.each(pageLayout.widgetIds, function(key, item){
                var widgetInfo = sakai.api.Widgets.widgetLoader.widgets[item];
                currentPageShown.content[item] = (widgetInfo && widgetInfo.widgetData) ? $.extend({}, true, widgetInfo.widgetData) : false;
            });

        });

        var finishSavePage = function(rows, widgetIds){
            var isStillStoringWidgetData = false;
            $.each(widgetIds, function(index, widgetId){
                if (sakai.api.Widgets.widgetLoader.widgets[widgetId] && sakai.api.Widgets.widgetLoader.widgets[widgetId].isStoringWidgetData){
                    debug.log("Is still storing widget data for " + widgetId);
                    isStillStoringWidgetData = true;
                }
            });
            if (isStillStoringWidgetData){
                setTimeout(finishSavePage, 100, rows, widgetIds);
            } else {
                debug.log("Stopped storing widget data");
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
                    STORE_PATH = currentPageShown.pageSavePath + "/" + currentPageShown.saveRef;
                    // Get the widgets in this page and change their save URL
                    var widgets = getWidgetList();
                    for (var w in widgets){
                        if (widgets.hasOwnProperty(w) && sakai.api.Widgets.widgetLoader.widgets[widgets[w].id]){
                            sakai.api.Widgets.widgetLoader.widgets[widgets[w].id].placement = STORE_PATH + widgets[w].id + "/" + widgets[w].type + "/";
                        }
                    }
                    data.rows = rows;
                    sakai.api.Server.saveJSON(STORE_PATH, data, function(){
                        var versionToStore = sakai.api.Server.removeServerCreatedObjects(data, ["_"]);
                        debug.log(versionToStore);
                        $.ajax({
                            url: STORE_PATH + ".save.json",
                            type: "POST",
                            data: {
                                "sling:resourceType": "sakai/pagecontent",
                                "sakai:pagecontent": $.toJSON(versionToStore),
                                "_charset_": "utf-8"
                            }
                        });
                    }, true);
                });
            }
        };

        $(".contentauthoring_dummy_element", $rootel).live("dblclick", function(ev){
            var $el = $(this);
            $el.attr("data-element-type", "htmlblock");
            $el.addClass("inserterbar_widget_draggable");
            addNewElement(ev, $el);
        });

        $(".inserterbar_widget_draggable", $rootel).live("keyup", function(ev){
            if(ev.which === $.ui.keyCode.ENTER){
                var lastRow = $(".contentauthoring_row", $rootel).last().find(".contentauthoring_table_row.contentauthoring_cell_container_row");
                addNewElement(ev, lastRow, $(this));
            }
        });

        $(".inserterbar_widget_draggable", $rootel).live("dblclick", function(ev){
            var lastRow = $(".contentauthoring_row", $rootel).last().find(".contentauthoring_table_row.contentauthoring_cell_container_row");
            addNewElement(ev, lastRow, $(this));
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

        var checkCorrectData = function(_currentPageShown) {
            $.each(_currentPageShown.content.rows, function(index, row){
                if(!$.isPlainObject(row)){
                    _currentPageShown.content.rows[index] = $.parseJSON(row);
                }
            });
            return _currentPageShown;
        };

        $(window).bind("showpage.contentauthoring.sakai", function(ev, _currentPageShown){
            if (isInEditMode() && currentPageShown){
                cancelEditPage();
            }
            if (currentPageShown){
                pagesCache[currentPageShown.ref] = $.extend(true, {}, currentPageShown);
            }
            currentPageShown = pagesCache[_currentPageShown.ref] || _currentPageShown;
            renderPage(currentPageShown);
        });

        $(window).bind("editpage.contentauthoring.sakai", function(ev, _currentPageShown){
            if (isInEditMode() && currentPageShown){
                cancelEditPage();
            }
            if (currentPageShown){
                pagesCache[currentPageShown.ref] = $.extend(true, {}, currentPageShown);
            }
            currentPageShown = pagesCache[_currentPageShown.ref] || _currentPageShown;
            renderPage(currentPageShown);
            editPage();
        });

        var showPageEditControls = function(addArea){
            if (addArea){
                $("#inserterbar_action_add_page_container", $rootel).hide();
                $("#inserterbar_action_add_area_page_container", $rootel).show();
            } else {
                $("#inserterbar_action_add_area_page_container", $rootel).hide();
                $("#inserterbar_action_add_page_container", $rootel).show();
            }
        };

        sakai.api.Widgets.widgetLoader.insertWidgets("s3d-page-main-content");
        $(window).trigger("ready.contentauthoring.sakai");

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("contentauthoring");
});
