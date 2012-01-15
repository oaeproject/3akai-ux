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
                            "width": 0.33,
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

        var newRow = {
            "columns": [
                {
                    "width": 1,
                    "elements": [
                        {
                            "id": "id00100",
                            "type": "htmlblock"
                        }
                    ]
                }
            ]
        }

        ///////////////////////
        // Utility functions //
        ///////////////////////

        var isInEditMode = function(){
            return $("#contentauthoring_widget_container").hasClass("contentauthoring_edit_mode");
        };

        var getRowObject = function(rowId){
            for (var i = 0; i < pageStructure.rows.length; i++){
                if (pageStructure.rows[i].id === rowId){
                    return pageStructure.rows[i];
                }
            }
            return false;
        };

        //////////////////////
        // Toggle edit mode //
        //////////////////////

        $("#contentauthoring_toggle_edit_mode").bind("click", function(){
            if (isInEditMode()){
                $("#contentauthoring_widget_container").removeClass("contentauthoring_edit_mode");
                $(".contentauthoring_cell_content").sortable("destroy");
            } else {
                $("#contentauthoring_widget_container").addClass("contentauthoring_edit_mode");
                setActions();
            }
        });

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
                handle: '.contentauthoring_row_handle'
            });
            setRowReorderHover();
        }

        //////////////////////
        // Reorder portlets //
        //////////////////////

        var reorderPortlets = function(){
            $( ".contentauthoring_cell_content" ).sortable({
    			connectWith: ".contentauthoring_cell_content",
                ghost: true,
                placeholder: "ui-state-highlight"
    		});
        }

        ////////////////////
        // Resize columns //
        ////////////////////

        var makeColumnsResizable = function(){
            $(".contentauthoring_cell").resizable({
                handles: {
                    'e': '.contentauthoring_cell_handle,.contentauthoring_cell_handle_grab'
                },
                helper: "ui-resizable-helper",
                stop: function(ev, ui){
                    var totalWidth = $("#contentauthoring_widget").width();
                    var newColumnWidth = ui.size.width / totalWidth;
                    var oldColumnWidth = ui.originalSize.width / totalWidth;
                    
                    var $row = $(this).parent();
                    var rowId = $row.attr("data-row-id");
                    var $cells = $(".contentauthoring_cell", $row);
                    var hasFoundThis = false;
                    var hasFoundNext = false;
                    var currentRow = getRowObject(rowId);
                    for (var i = 0; i < $cells.length; i++){
                        if ($($cells[i]).is($(this))){
                            $($cells[i]).css("width", (totalWidth * newColumnWidth) + "px");
                            currentRow.columns[i].width = newColumnWidth;
                            hasFoundThis = true;
                        } else if (hasFoundThis){
                            var newWidth = (currentRow.columns[i].width + (oldColumnWidth - newColumnWidth));
                            $($cells[i]).css("width", (totalWidth * newWidth) + "px");
                            currentRow.columns[i].width = newWidth;
                            hasFoundThis = false;
                            hasFoundNext = true;
                        } else if (hasFoundNext){
                            
                        }
                    }
                    
                }
            });
        };

        ///////////////////
        // Add a new row //
        ///////////////////

        $("#contentauthoring_add_row").bind("click", function(){
            newRow.id = sakai.api.Util.generateWidgetId();
            pageStructure.rows.push(newRow);
            newRow.totalWidth = $("#contentauthoring_widget").width();
            newRow.rowOnly = true;
            $("#contentauthoring_widget_container").append(sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", newRow, false, false));
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, "/~nicolaas/test/");
            setActions();
        });

        ///////////////////
        // Edit row menu //
        ///////////////////

        var rowToChange = false;
        $(".contentauthoring_row_edit").live("click", function(){
            var currentRow = $(this).attr("data-row-id");
            if (currentRow === rowToChange){
                $("#contentauthoring_row_menu").hide();
                rowToChange = false;
            } else {
                //$("#contentauthoring_row_menu").css("left", $(this).position.left + "px");
                //$("#contentauthoring_row_menu").css("top", ($(this).position.top + 15) + "px");
                $("#contentauthoring_row_menu").show();
                rowToChange = currentRow;
            }
        });

        $("#contentauthoring_row_menu_one").live("click", function(){
            var rowObject = getRowObject(rowToChange);
            if (rowObject.columns.length > 1){
                var $cells = $(".contentauthoring_cell", $(".contentauthoring_table_row[data-row-id='" + rowToChange + "']"));
                for (var i = 1; i < $cells.length; i++){
                    var $cell = $($cells[i]);
                    var $cellcontent = $(".contentauthoring_cell_content", $cell).children();
                    $(".contentauthoring_cell_content", $($cells[0])).append($cellcontent);
                    $cell.remove();

                    rowObject.columns.slice(1, 1);

                }
                rowObject.columns[0].width = 1;
                setActions();
            }
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
        }

        ////////////////////////////
        // Change widget settings //
        ////////////////////////////

        $(".contentauthoring_cell_element_action_e").live("click", function(){
            var id = $(this).parent().attr("data-element-id");
            var type = $(this).parent().attr("data-element-type");
            $("#contentauthoring_widget_content").html("");
            if (sakai.widgets[type]) {
                var widgetSettingsWidth = 650;
                if (sakai.widgets[type].settingsWidth) {
                    widgetSettingsWidth = sakai.widgets[type].settingsWidth;
                }
                $("#contentauthoring_widget_settings_content").html(sakai.api.Security.saneHTML('<div id="widget_' + type + '_' + id + '" class="widget_inline"/>'));
                $("#contentauthoring_widget_settings_title").html(sakai.api.Widgets.getWidgetTitle(sakai.widgets[type].id));
                sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget_settings_content", true, "/~nicolaas/test/");
                $('#contentauthoring_widget_settings').css({
                    'width': widgetSettingsWidth + "px",
                    'margin-left': -(widgetSettingsWidth / 2) + "px",
                    'top': ($(window).scrollTop() + 100) + "px"
                }).jqmShow();
            }
        });
        $("#contentauthoring_widget_settings").jqm({
            modal: true,
            overlay: 20,
            toTop: true
        });

        sakai_global.contentauthoring.widgetCancel = function(tuid){
            $('#contentauthoring_widget_settings').jqmHide();
        };
        sakai_global.contentauthoring.widgetFinish = function(tuid){
            $("#contentauthoring_widget_content").html("");
            var $parent = $(".contentauthoring_cell_element #" + tuid).parent();
            debug.log($parent);
            $(".contentauthoring_cell_element #" + tuid).remove();
            $parent.append("<div id='widget_" + $parent.attr("data-element-type") + "_" + tuid + "' class='widget_inline'></div>");
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, "/~nicolaas/test/");
            $('#contentauthoring_widget_settings').jqmHide();
        };

        sakai.api.Widgets.Container.registerFinishFunction(sakai_global.contentauthoring.widgetFinish);
        sakai.api.Widgets.Container.registerCancelFunction(sakai_global.contentauthoring.widgetCancel);

        ////////////////////
        // Remove element //
        ////////////////////

        $(".contentauthoring_cell_element_action_x").live("click", function(){
            $(this).parent().parent().remove();
        });

        ////////////////////
        // Initialization //
        ////////////////////

        var setActions = function(){
            makeRowsReorderable();
            makeColumnsResizable();
            reorderPortlets();
            setCellHover();
        };

        var renderPage = function(){
            pageStructure.totalWidth = $("#contentauthoring_widget").width();
            pageStructure.rowOnly = false;
            $("#contentauthoring_widget").html(sakai.api.Util.TemplateRenderer("contentauthoring_widget_template", pageStructure, false, false));
            sakai.api.Widgets.widgetLoader.insertWidgets("contentauthoring_widget", false, "/~nicolaas/test/");
            setActions();
        };

        renderPage();
         
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("contentauthoring");
});
