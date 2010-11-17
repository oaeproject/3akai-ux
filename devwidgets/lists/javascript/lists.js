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

/*global $ */

var sakai = sakai || {};

/**
 * @name sakai.lists
 *
 * @class lists
 *
 * @description
 * Initialize the lists widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.lists = function(tuid, showSettings) {

    // Dom identifiers
    var $rootel = $("#" + tuid);
    var $listsSettings = $("#lists_settings", $rootel);
    var $listsMain = $("#lists_main", $rootel);

    var $listsSaveSettingsButton = $("#lists_save", $rootel);
    var $listsCancelSettingsButton = $("#lists_cancel", $rootel);

    var $listsOfLists = $("#lists_list_of_lists", $rootel);
    var $listsTemplate = $("#lists_list_edit_template", $rootel);
    var $listsDisplayTemplate = $("#lists_list_display_template", $rootel);

    var $listSelect = $(".list_select", $rootel);
    var $listTitle = $("#lists_title", $rootel);

    var widgetData = {};

    ////////////////////
    // Main functions //
    ////////////////////

    var loadWidget = function(callback) {
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
            if (success) {
                widgetData = data;
            }
            if ($.isFunction(callback)) {
                callback();
            }
        });
    };

    var showLists = function() {
        $listsMain.show();
        if (widgetData.title) { // change the title of the widget
            if (!sakai.api.Widgets.isOnDashboard(tuid)) {
                $listTitle.show();
                $listTitle.find("h1").text(widgetData.title);
                $rootel.find(".lists_widget").addClass("on_page");
            } else {
                sakai.api.Widgets.changeWidgetTitle(tuid, widgetData.title);
            }
        }
        if (widgetData.selections) {
            $.TemplateRenderer($listsDisplayTemplate, {"data": widgetData.selections}, $listsMain);
        }
    };

    var getSaveData = function() {
        if (($("select.list_final").length > 0 && $("select.list_final option:selected").length > 0) ||
             $(".lists_multi input[type=checkbox]:checked").length > 0) {

            widgetData.selections = [];
            widgetData.parents = [];
            $(".list_final").parents(".list_container").each(function(i,val) {
                if (i === 0) {
                    widgetData.title = unescape($(val).attr("id"));
                }
                widgetData.parents[i] = unescape($(val).attr("id"));
            });
            if ($("select.list_final option:selected").length > 0) {
                $("select.list_final option:selected").each(function(i,val){
                    var obj = {"title": unescape($(this).val())};
                    if ($(this).attr("title")) {
                        obj.link = $(this).attr("title");
                    }
                    widgetData.selections.push(obj);
                });
            } else {
                $(".lists_multi input[type=checkbox]:checked").each(function(i,val){
                    var obj = {"title": unescape($(this).val())};
                    if ($(this).attr("title")) {
                        obj.link = $(this).attr("title");
                    }
                    widgetData.selections.push(obj);
                });
            }
            return true;
        } else {
            alert("Please make a selection before saving");
            return false;
        }
    };

    ////////////////////////
    // Settings functions //
    ////////////////////////

    var renderInitialLists = function() {
        setSelected();
        $listsOfLists.html($.TemplateRenderer($listsTemplate, {"data":sakai.Lists, "hasLists": true, "parentLabel": ""}));
        $(".list_select:not(.triggered):has(option:selected)", $rootel).addClass("triggered").trigger("change");
    };

    var setSelected = function() {
        if (widgetData && widgetData.parents) {
            // select the parents
            for (var i=widgetData.parents.length-1, j=-1; i>j; i--) {
                var thisLabel = widgetData.parents[i];
                doSetSelectedRecursive(sakai.Lists, widgetData.parents, thisLabel);
            }
            // select the selections
            $(widgetData.selections).each(function(i,val) {
                doSetSelectedRecursive(sakai.Lists, widgetData.parents, val.title);
            });
        }
    };

    var doSetSelectedRecursive = function(lists, parents, label) {
        $(lists).each(function(i,val) {
            if (label === val.Label || (val.title && label === val.title) || label === val) {
                val.selected = true;
            }
        });
        $(lists).each(function(i,val) {
            if (val.list && $.inArray(val.Label, parents) !== -1) {
                doSetSelectedRecursive(val.list, parents, label);
            }
        });
    };

    /**
     * getList
     * Given a label, find the list associated with it inside of the current list
     * Performs a breadth-first recursive search for the node
     *
     * @param {Object} lists The lists to start the search from
     * @param {String} label The label to serach the lists for
     */
    var getList = function(lists, label) {
        var ret = false;
        $(lists).each(function(i,val) {
            if (val.Label === label) {
                ret = val;
            }
        });
        if (ret) { return ret; }
        $(lists).each(function(i,val) {
            if (val.list) {
                ret = getList(val.list, label);
            }
        });
        if (ret) { return ret; }
        return false;
    };

    ////////////////////
    // Event Handlers //
    ////////////////////
    $listSelect.die("change");
    $listSelect.live("change", function(e){
        var id = $(this).attr("id").split("list_select_")[1];
        var $parentDiv = $(this).parent("div");
        var list = getList(sakai.Lists, unescape($(this).find("option:selected").val()));
        if (list) {
            if ($(".list_parent_" + id).length) {
                // replace the current list display
                $(".list_parent_" + id).replaceWith($.TemplateRenderer($listsTemplate, {"data":list, "parentLabel": unescape(id), "hasLists": list.list[0].list ? true : false}));
            } else {
                // append to the parent div for easy hiding
                $parentDiv.append($.TemplateRenderer($listsTemplate, {"data":list, "parentLabel": unescape(id), "hasLists": list.list[0].list ? true : false}));
                $(".list_select:not(.triggered):has(option:selected)", $rootel).addClass("triggered").trigger("change"); // trigger change if there are more
                if ($(".list_select.list_final").length) { // if the final list is available, select the selections
                    $(widgetData.selections).each(function(i,val) {
                        $(".list_final").find("option[value='" + escape(val) + "']").attr("selected", "selected");
                    });
                }
            }
        } else {
            // remove the children
            $(".list_parent_" + id).remove();
        }
    });

    /** Binds the lists save button*/
    $listsSaveSettingsButton.bind("click", function(e) {
        if (getSaveData()) {
            sakai.api.Widgets.saveWidgetData(tuid, widgetData, function(success, data){
                sakai.api.Widgets.Container.informFinish(tuid, "lists");
            });
        }
    });

    $listsCancelSettingsButton.bind("click", function(e) {
        sakai.api.Widgets.Container.informFinish(tuid, "lists");
    });


    var doInit = function(){
        loadWidget(function() {
            if (showSettings) {
                renderInitialLists();
                sakai.api.Widgets.changeWidgetTitle(tuid, "Lists");
                $listsSettings.show();
            } else {
                showLists();
            }
        });
    };
    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("lists");