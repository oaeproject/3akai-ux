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
/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */

require(["jquery", "sakai/sakai.api.core", "jquery-ui"], function($, sakai) {

    /**
     * @name sakai_global.dashboard
     *
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.dashboard = function(tuid, showSettings, widgetData) {

        // Add Goodies related fields
        var addGoodiesDialog = "#add_goodies_dialog";
        var addGoodiesTrigger = '#add-goodies';
        var addGoodiesListContainer = "#add_goodies_body";
        var addGoodiesListTemplate = "add_goodies_body_template";
        var btnAdd = "btn_add_";
        var btnRemove = "btn_remove_";
        var changeLayoutDialog = "#change_layout_dialog";
        var goodiesAddButton = ".goodies_add_button";
        var goodiesRemoveButton = ".goodies_remove_button";
        var addRow = "#row_add_";
        var removeRow = "#row_remove_";

        ////////////////////
        // Help variables //
        ////////////////////
        var currentlySelectedLayout = false;
        var currentSettingsOpen = false;
        var doShowDashboard = false;
        var isEditable = false;
        var savePath = false;
        var settings = false;
        var widgetPropertyName = false;
        var tempSettings;

        var rootel = "#" + tuid;
        var $rootel = $(rootel);
        var rootelClass = "." + tuid;
        var $rootelClass = $(rootelClass);

        var minimizeWidget = function(id) {
           var el = $("#" + id + "_container");
           if (el.css("display") == "none") {
               el.show();
           } else {
               el.hide();
           }
           saveState();
        };

        $(window).bind("minimizeWidget.dashboard.sakai", function(e, id) {
            minimizeWidget(id);
        });

        var decideExists = function(exists, response) {
            if (exists === false) {
                if (response.status === 401) { // user is not logged in
                    $(window).trigger("sakai_global.dashboard.notLoggedIn"); // let the embedding page decide how to handle not logged in
                }
                doInit();
            } else {
                try {
                    settings = response;
                    var cleanContinue = true;

                    for (var c in settings.columns) {
                        if (settings.columns.hasOwnProperty(c) && c.indexOf("column") > -1) {
                            for (var pi in settings.columns[c]) {
                                if (settings.columns[c].hasOwnProperty(pi)) {
                                    if (pi !== "contains" && pi !== "indexOf") {
                                        if (!settings.columns[c][pi].uid) {
                                            cleanContinue = false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (cleanContinue) {
                        doShowDashboard = true;
                    }
                    doInit();
                } catch(err) {
                    debug.error(err);
                    doInit();
                }
            }
        };

        var finishEditSettings = function(tuid, widgetname) {
            var generic = "widget_" + widgetname + "_" + tuid + "_" + savePath;
            var id = tuid;
            var old = document.getElementById(id);
            var newel = document.createElement("div");
            newel.id = generic;
            newel.className = "widget_inline";
            old.parentNode.replaceChild(newel, old);
            sakai.api.Widgets.widgetLoader.insertWidgets(newel.parentNode.id, false);
        };

        var registerWidgetFunctions = function(){
            sakai.api.Widgets.Container.registerFinishFunction(function(tuid, widgetname) {
                finishEditSettings(tuid, widgetname);
            });
            sakai.api.Widgets.Container.registerCancelFunction(function(tuid, widgetname) {
                finishEditSettings(tuid, widgetname);
            });
        };

        $(window).bind("exitedit.sitespages.sakai", function(ev){
            registerWidgetFunctions();
        });

        registerWidgetFunctions();

        var showInit = function() {

            var columns = [];
            var layout = "dev";

            columns[0] = [];
            columns[1] = [];
            // grab the defaults from config if they exist
            if (sakai.config.widgets.defaults[widgetPropertyName]) {
                if (sakai.config.widgets.defaults[widgetPropertyName].layout) {
                    layout = sakai.config.widgets.defaults[widgetPropertyName].layout;
                }
                if (sakai.config.widgets.defaults[widgetPropertyName].columns && sakai.config.widgets.defaults[widgetPropertyName].columns.length) {
                    columns = sakai.config.widgets.defaults[widgetPropertyName].columns;
                }
            }

            var jsonobj = {};
            jsonobj.columns = {};

            for (var i = 0, j = columns.length; i < j; i++) {
                jsonobj.columns["column" + (i + 1)] = [];
                for (var ii = 0, jj = columns[i].length; ii < jj; ii++) {
                    var index = jsonobj.columns["column" + (i + 1)].length;
                    jsonobj.columns["column" + (i + 1)][index] = {};
                    jsonobj.columns["column" + (i + 1)][index].uid = "id" + Math.round(Math.random() * 10000000000000);
                    jsonobj.columns["column" + (i + 1)][index].visible = "block";
                    jsonobj.columns["column" + (i + 1)][index].name = columns[i][ii];
                }
            }

            jsonobj.layout = layout;

            settings = jsonobj;

            sakai.api.Widgets.saveWidgetData(tuid, settings, showDashboard, true);

        };

        var doInit = function() {
            var person = sakai.data.me;

            if (!person.user.userid) {
                $(window).trigger("notUsersDashboard.dashboard.sakai");
            } else if (person.user.anon) {
                $(window).trigger("notLoggedIn.dashboard.sakai");
            }

            $(".body-container", $rootel).show();

            if (doShowDashboard) {
                showDashboard();
            }
            else {
                showInit();
            }

        };

    /**
     * Enable add goodies buttons after the request has finished
     */
        var enableAddGoodies = function(){
            $(".add-button", $rootelClass).attr("disabled", false);
        };

    /**
     * Disable the add goodies buttons to avoid double requests
     */
        var disableAddGoodies = function(){
            $(".add-button", $rootelClass).attr("disabled", true);
        };

        var showDashboard = function() {
            tempSettings = settings;
            var index = 0;

            if (!sakai.config.widgets.layouts[settings.layout]) {

                var columns = [];
                for (var i = 0, j = sakai.config.widgets.layouts[settings.layout].widths.length; i < j; i++) {
                    columns[i] = [];
                }

                var initlength = 0;
                for (var l in settings.columns) {
                    if (settings.columns.hasOwnProperty(l) && l.indexOf("column") > -1) {
                        initlength++;
                    }
                }
                var newlength = sakai.config.widgets.layouts[settings.layout].widths.length;


                for (var z in settings.columns) {
                    if (settings.columns.hasOwnProperty(z) && z.indexOf("column") > -1) {
                        if (index < newlength) {
                            for (i = 0, j = settings.columns[z].length; i < j; i++) {
                                columns[index][i] = {};
                                columns[index][i].uid = settings.columns[z][i].uid;
                                columns[index][i].visible = settings.columns[z][i].visible;
                                columns[index][i].name = settings.columns[z][i].name;
                            }
                            index++;
                        }
                    }
                }

                index = 0;
                if (newlength < initlength) {
                    for (var q in settings.columns) {
                        if (settings.columns.hasOwnProperty(q) && q.indexOf("column") > -1) {
                            if (index >= newlength) {
                                for (var ii = 0, jj = settings.columns[q].length; ii < jj; ii++) {
                                    var lowestnumber = -1;
                                    var lowestcolumn = -1;
                                    for (var iii = 0, jjj = columns.length; iii < jjj; iii++) {
                                        var number = columns[iii].length;
                                        if (number < lowestnumber || lowestnumber == -1) {
                                            lowestnumber = number;
                                            lowestcolumn = iii;
                                        }
                                    }
                                    var _i = columns[lowestcolumn].length;
                                    columns[lowestcolumn][_i] = {};
                                    columns[lowestcolumn][_i].uid = settings.columns[q][ii].uid;
                                    columns[lowestcolumn][_i].visible = settings.columns[q][ii].visible;
                                    columns[lowestcolumn][_i].name = settings.columns[q][ii].name;
                                }
                            }
                            index++;
                        }

                    }
                }

                var jsonstring = '{"layout":"' + settings.layout + '","columns":{';
                for (var y = 0, v = sakai.config.widgets.layouts[settings.layout].widths.length; y < v; y++) {
                    jsonstring += '"column' + (y + 1) + '":[';
                    for (var r = 0, h = columns[y].length; r < h; r++) {
                        jsonstring += '{"uid":"' + columns[y][r].uid + '","visible":"' + columns[y][r].visible + '","name":"' + columns[y][r].name + '"}';
                        if (r !== columns[y].length - 1) {
                            jsonstring += ',';
                        }
                    }
                    jsonstring += ']';
                    if (i !== sakai.config.widgets.layouts[settings.layout].widths.length - 1) {
                        jsonstring += ',';
                    }
                }

                jsonstring += '}}';

                settings = $.parseJSON(jsonstring);

                sakai.api.Widgets.saveWidgetData(tuid, settings, null, true);
            }

            var final2 = {};
            final2.columns = [];
            final2.size = sakai.config.widgets.layouts[settings.layout].widths.length;
            var currentindex = -1;
            var isValid = true;

            try {
                for (var c in settings.columns) {
                    if (settings.columns.hasOwnProperty(c) && c.indexOf("column") > -1) {
                        currentindex++;
                        index = final2.columns.length;
                        final2.columns[index] = {};
                        final2.columns[index].portlets = [];
                        final2.columns[index].width = sakai.config.widgets.layouts[settings.layout].widths[currentindex];
                        var columndef = settings.columns["column" + (currentindex+1)];
                        for (var pi in columndef) {
                            if (columndef.hasOwnProperty(pi)) {
                                var dashboardDef = columndef[pi];
                                if (dashboardDef.name && sakai.widgets[dashboardDef.name]) {
                                    var widget = sakai.widgets[dashboardDef.name];
                                    var iindex = final2.columns[index].portlets.length;
                                    final2.columns[index].portlets[iindex] = [];
                                    final2.columns[index].portlets[iindex].id = widget.id;
                                    final2.columns[index].portlets[iindex].iframe = widget.iframe;
                                    final2.columns[index].portlets[iindex].url = widget.url;
                                    final2.columns[index].portlets[iindex].title = widget.name;
                                    final2.columns[index].portlets[iindex].display = dashboardDef.visible;
                                    final2.columns[index].portlets[iindex].uid = dashboardDef.uid;
                                    final2.columns[index].portlets[iindex].placement = savePath;
                                    final2.columns[index].portlets[iindex].height = widget.height;
                                }
                            }
                        }
                    }
                }

            }
            catch(err) {
                debug.error(err);
                isValid = false;
            }


            if (isValid) {
                final2.sakai = sakai;
                $('#widgetscontainer', $rootel).html(sakai.api.Util.TemplateRenderer("widgetscontainer_template", final2));


                // only set up the settings bindings if the dashboard's embedding page allows editing
                if (isEditable) {
                  $(".dashboard_options", $rootel).show();
                  // .hover is shorthand for .bind('mouseenter mouseleave')
                  // unbinding 'hover' doesn't work, 'mouseenter mouseleave' must be used instead.
                  $(".widget1", $rootel).unbind('mouseenter mouseleave').hover(
                  function(over) {
                      var id = this.id + "_settings";
                      $("#" + id).show();
                  },
                  function(out) {
                      if ($("#widget_settings_menu", $rootel).css("display") == "none" || this.id != currentSettingsOpen) {
                          var id = this.id + "_settings";
                          $("#" + id).hide();
                      }
                  }
                  );

                  $(".settings", $rootel).unbind('click').click(function(ev) {

                      if ($("#widget_settings_menu", $rootel).is(":visible")) {
                          $("#widget_settings_menu", $rootel).hide();
                      } else {
                          var splitted = this.id.split("_");
                          if (splitted[0] + "_" + splitted[1] == currentSettingsOpen) {
                              $("#widget_" + currentSettingsOpen + "_settings", $rootel).hide();
                          }
                          currentSettingsOpen = splitted[0] + "_" + splitted[1];
                          var widgetId = splitted[0];

                          if (sakai.widgets[widgetId] && sakai.widgets[widgetId].hasSettings) {
                              $("#settings_settings", $rootel).show();
                          } else {
                              $("#settings_settings", $rootel).hide();
                          }
                          if (sakai.widgets[widgetId] &&
                              (sakai.widgets[widgetId].deletable === true || sakai.widgets[widgetId].deletable === undefined)) {
                              $("#settings_remove", $rootel).show();
                          } else {
                              $("#settings_remove", $rootel).hide();
                          }

                          var el = $("#" + currentSettingsOpen.split("_")[1] + "_container", $rootel);
                          if (el.is(":visible")) {
                              $("#settings_hide_link", $rootel).text(sakai.api.i18n.getValueForKey("HIDE"));
                          } else {
                              $("#settings_hide_link", $rootel).text(sakai.api.i18n.getValueForKey("SHOW"));
                          }

                          var x = $(this).position().left;
                          var y = $(this).position().top;
                          $("#widget_settings_menu", $rootel).css("left", x - $("#widget_settings_menu", $rootel).width() + 28 + "px");
                          if ($.browser.msie && parseInt($.browser.version, 10) < 9) {
                             $("#widget_settings_menu", $rootel).css("top", document.documentElement.scrollTop + y + 24 + "px");
                          } else {
                              $("#widget_settings_menu", $rootel).css("top", y + 24 + "px");
                          }
                          $("#widget_settings_menu", $rootel).show();
                      }
                  });


                  // .hover is shorthand for .bind('mouseenter mouseleave')
                  // unbinding 'hover' doesn't work, 'mouseenter mouseleave' must be used instead.
                  $(".more_option", $rootel).unbind('mouseenter mouseleave').hover(
                  function(over) {
                      $(this).addClass("selected_option");
                  },
                  function(out) {
                      $(this).removeClass("selected_option");
                  }
                  );

                  $("#settings_remove", $rootel).unbind('click').click(function(ev) {
                      var id = currentSettingsOpen;
                      var el = document.getElementById(id);
                      var parent = el.parentNode;
                      parent.removeChild(el);
                      saveState();
                      $("#widget_settings_menu", $rootel).hide();
                      $("#" + currentSettingsOpen + "_settings", $rootel).hide();
                      currentSettingsOpen = false;
                      return false;
                  });

                  $("#settings_hide", $rootel).unbind('click').click(function(ev) {

                      var el = $("#" + currentSettingsOpen.split("_")[1] + "_container", $rootel);
                      if (el.css('display') == "none") {
                          el.parent().find(".fl-widget-titlebar").removeClass("hiddenwidget");
                          el.show();
                      } else {
                          el.parent().find(".fl-widget-titlebar").addClass("hiddenwidget");
                          el.hide();
                      }
                      saveState();

                      $("#widget_settings_menu", $rootel).hide();
                      $("#" + currentSettingsOpen + "_settings", $rootel).hide();
                      currentSettingsOpen = false;
                      return false;
                  });

                  $("#settings_settings", $rootel).unbind('click').click(function(ev) {
                      var generic = "widget_" + currentSettingsOpen + "_" + savePath;
                      var id = currentSettingsOpen.split("_")[1];
                      var old = document.getElementById(id);
                      var newel = document.createElement("div");
                      newel.id = generic;
                      newel.className = "widget_inline";
                      if (old) {
                          old.parentNode.replaceChild(newel, old);
                      }
                      $("#widget_settings_menu", $rootel).hide();
                      currentSettingsOpen = false;
                      sakai.api.Widgets.widgetLoader.insertWidgets(newel.parentNode.id, true);
                      return false;
                  });

                  /**
                 * Bind the document on click event
                 */
                  $(document).click(function(e) {
                      var $clicked = $(e.target);

                      // Check if the clicked target is not the settings menu
                      if (!$clicked.is(".settings", $rootel)) {
                          $("#widget_settings_menu", $rootel).hide();
                          $("#" + currentSettingsOpen + "_settings", $rootel).hide();
                          currentSettingsOpen = false;
                      }

                  });

                  $('#widgetscontainer .groupWrapper', $rootel).sortable({
                        connectWith: ".groupWrapper", // Columns where we can drag modules into
                        cursor: "move",
                        handle: ".widget1-head",
                        helper: "clone",
                        opacity: 0.5,
                        placeholder: 'orderable-drop-marker-box',
                        tolerance: "intersect",
                        start: beforeWidgetDrag,
                        stop: saveState
                    });

                } else {
                  // remove the move cursor from the title bar
                  $(".fl-widget-titlebar", $rootel).css("cursor", "default");
                }
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid);

            } else {
                showInit();
            }

            // Enable add goodies buttons
            enableAddGoodies();
        };

        var beforeWidgetDrag = function() {
            $("#widget_settings_menu", $rootel).hide();
        };

        var saveState = function() {

            var serString = '{"layout":"' + settings.layout + '","columns":{';

            var columns = $(".groupWrapper", $rootel);
            for (var i = 0, j = columns.length; i < j; i++) {
                if (i !== 0) {
                    serString += ",";
                }
                serString += '"column' + (i + 1) + '":[';
                var column = columns[i];
                var iii = -1;
                for (var ii = 0, jj = column.childNodes.length; ii < jj; ii++) {

                    try {
                        var node = column.childNodes[ii];

                        if (node && node.style && !($(node).hasClass("widget_spacer"))) {

                            widgetdisplay = "block";
                            var nowAt = 0;
                            var id = node.style.display;
                            var uid = Math.round(Math.random() * 100000000000);
                            for (var y = 0, z = node.childNodes.length; y < z; y++) {
                                if (node.childNodes[y].style && node.childNodes[y].id.indexOf("_") > -1) {
                                    if (nowAt == 1) {
                                        if (node.childNodes[y].style.display.toLowerCase() === "none") {
                                            widgetdisplay = "none";
                                        }
                                        uid = node.childNodes[y].id.split("_")[0];
                                    }
                                    nowAt++;
                                }
                            }

                            iii++;
                            if (iii !== 0) {
                                serString += ",";
                            }
                            serString += '{"uid":"' + uid + '","visible":"' + widgetdisplay + '","name":"' + node.id.split("_")[0] + '"}';

                        }
                    } catch(err) {
                        debug.error("mysakai.js/saveState(): There was an error saving state: " + err);
                    }

                }

                serString += "]";

            }

            serString += '}}';

            settings = $.parseJSON(serString);

            var isEmpty = true;
            for (i in settings.columns) {
                if (settings.columns.hasOwnProperty(i) && i.indexOf("column") > -1) {
                    if (settings.columns[i].length > 0) {
                        isEmpty = false;
                    }
                }
            }

            if (JSON.stringify(tempSettings) !== JSON.stringify(settings)) {
                sakai.api.Widgets.saveWidgetData(tuid, settings, checkSuccess, true);
            }

            tempSettings = settings;
        };

        var checkSuccess = function(success) {
            // Enable the add goodies buttons
            enableAddGoodies();
            if (!success) {
                debug.error("Connection with the server was lost");
            }
        };

        var addWidget = function(id) {
            var selectedlayout = settings.layout;

            var columns = [];
            for (var i = 0, j = sakai.config.widgets.layouts[selectedlayout].widths.length; i < j; i++) {
                columns[i] = [];
            }

            var initlength = sakai.config.widgets.layouts[settings.layout].widths.length;
            var newlength = sakai.config.widgets.layouts[selectedlayout].widths.length;

            var index = 0;
            for (var l in settings.columns) {
                if (index < newlength && l.indexOf("column") > -1) {
                    for (i = 0, j = settings.columns[l].length; i < j; i++) {
                        columns[index][i] = settings.columns[l][i];
                    }
                    index++;
                }
            }

            index = 0;
            var lowestnumber, lowestcolumn, number, _i;
            if (settings.layout !== selectedlayout && newlength < initlength) {
                for (l in settings.columns) {
                    if (settings.columns.hasOwnProperty(l) && l.indexOf("column") > -1) {
                        if (index >= newlength) {
                            for (i = 0, j = settings.columns[l].length; i < j; i++) {
                                lowestnumber = -1;
                                lowestcolumn = -1;
                                for (var iii = 0, jjj = columns.length; iii < jjj; iii++) {
                                    number = columns[iii].length;
                                    if (number < lowestnumber || lowestnumber == -1) {
                                        lowestnumber = number;
                                        lowestcolumn = iii;
                                    }
                                }
                                _i = columns[lowestcolumn].length;
                                columns[lowestcolumn][_i] = settings.columns[l][i];
                            }
                        }
                        index++;
                    }
                }
            }

            var currentWidget = id;

            lowestnumber = -1;
            lowestcolumn = -1;
            for (var iiii = 0, jjjj = columns.length; iiii < jjjj; iiii++) {
                number = columns[iiii].length;
                if (number < lowestnumber || lowestnumber == -1) {
                    lowestnumber = number;
                    lowestcolumn = iiii;
                }
            }
            _i = columns[lowestcolumn].length;
            columns[lowestcolumn][_i] = {};
            columns[lowestcolumn][_i].name = currentWidget;
            columns[lowestcolumn][_i].visible = "block";
            columns[lowestcolumn][_i].uid = "id" + Math.round(Math.random() * 10000000000);

            var jsonstring = '{"layout":"' + selectedlayout + '","columns":{';
            for (var z = 0, x = sakai.config.widgets.layouts[selectedlayout].widths.length; z < x; z++) {
                jsonstring += '"column' + (z + 1) + '":[';
                for (var ii = 0, jj = columns[z].length; ii < jj; ii++) {
                    jsonstring += '{"uid":"' + columns[z][ii].uid + '","visible":"' + columns[z][ii].visible + '","name":"' + columns[z][ii].name + '"}';
                    if (ii !== columns[z].length - 1) {
                        jsonstring += ',';
                    }
                }
                jsonstring += ']';
                if (z !== sakai.config.widgets.layouts[selectedlayout].widths.length - 1) {
                    jsonstring += ',';
                }
            }
            jsonstring += '}}';

            settings = $.parseJSON(jsonstring);

            sakai.api.Widgets.saveWidgetData(tuid, settings, finishAddWidgets, true);


        };

        var finishAddWidgets = function(success) {
            if (success) {
                // need to reinitialize it here otherwise things can go wrong when switching
                // between states
                $rootel = $($rootel.selector);
                $("#widgetscontainer", $rootel).html("");
                showDashboard();
            }
            else {
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("CONNECTION_LOST"),"",sakai.api.Util.notification.type.ERROR);
            }
        };

        ////////////////////
        // Change Layout //
        ///////////////////

        var bindLayoutPickerEventHandlers = function() {
            $(".layout-picker", $rootelClass).bind("click",
            function(ev) {
                var layoutid = this.id.split("-")[this.id.split("-").length - 1];
                updateLayout(layoutid);
            });
            $("table.layout_picker_item,table.layout_picker_item_unselected", $rootelClass).bind("click",
            function(ev) {
                var layoutid = this.id.split("-")[this.id.split("-").length - 1];
                var radio = $("#layout-picker-" + layoutid);
                radio.checked = true;
                updateLayout(layoutid);
            });
        };

        var updateLayout = function(selected) {
            var newjson = {};
            newjson.layouts = sakai.config.widgets.layouts;
            newjson.selected = selected;
            currentlySelectedLayout = selected;
            newjson.sakai = sakai;
            $("#layouts_list", $rootelClass).html(sakai.api.Util.TemplateRenderer("layouts_template", newjson));
            // once template is render, it loses the event handling
            // so need to call again
            bindLayoutPickerEventHandlers();
        };

        var beforeFinishAddWidgets = function() {
            showDashboard();
            sakai.api.Util.Modal.close(changeLayoutDialog + rootelClass);
        };

        $("#select-layout-finished", $rootel).bind("click",
        function(ev) {
            if (currentlySelectedLayout === settings.layout) {
                sakai.api.Util.Modal.close(changeLayoutDialog + rootelClass);
            } else {

                var selectedlayout = currentlySelectedLayout;
                var columns = [];
                for (var i = 0, j = sakai.config.widgets.layouts[selectedlayout].widths.length; i < j; i++) {
                    columns[i] = [];
                }

                var initlength = sakai.config.widgets.layouts[settings.layout].widths.length;
                var newlength = sakai.config.widgets.layouts[selectedlayout].widths.length;

                var index = 0;
                for (var l in settings.columns) {
                    if (settings.columns.hasOwnProperty(l) && index < newlength && l.indexOf("column") > -1) {
                        for (i = 0, j = settings.columns[l].length; i < j; i++) {
                            columns[index][i] = {};
                            columns[index][i].name = settings.columns[l][i].name;
                            columns[index][i].visible = settings.columns[l][i].visible;
                            columns[index][i].uid = settings.columns[l][i].uid;
                        }
                        index++;
                    }
                }

                index = 0;
                if (newlength < initlength) {
                    for (var z in settings.columns) {
                        if (settings.columns.hasOwnProperty(z) && z.indexOf("column") > -1) {
                            if (index >= newlength) {
                                for (i = 0, j = settings.columns[z].length; i < j; i++) {
                                    var lowestnumber = -1;
                                    var lowestcolumn = -1;
                                    for (var iii = 0, jjj = columns.length; iii < jjj; iii++) {
                                        var number = columns[iii].length;
                                        if (number < lowestnumber || lowestnumber == -1) {
                                            lowestnumber = number;
                                            lowestcolumn = iii;
                                        }
                                    }
                                    var _i = columns[lowestcolumn].length;
                                    columns[lowestcolumn][_i] = {};
                                    columns[lowestcolumn][_i].name = settings.columns[z][i].name;
                                    columns[lowestcolumn][_i].visible = settings.columns[z][i].visible;
                                    columns[lowestcolumn][_i].uid = settings.columns[z][i].uid;
                                }
                            }
                            index++;
                        }
                    }
                }

                settings = {};
                settings["layout"] = selectedlayout;
                settings["columns"] = {};
                for (i = 0, j = sakai.config.widgets.layouts[selectedlayout].widths.length; i < j; i++) {
                    settings["columns"]["column" + (i + 1)] = [];
                    for (var ii = 0, jj = columns[i].length; ii < jj; ii++) {
                        settings["columns"]["column" + (i + 1)][settings["columns"]["column" + (i + 1)].length] = {"uid":columns[i][ii].uid,"visible":columns[i][ii].visible,"name":columns[i][ii].name};
                    }
                }

                sakai.api.Widgets.saveWidgetData(tuid, settings, beforeFinishAddWidgets, true);

            }
        });

        var renderLayouts = function(hash) {
            var newjson = {};
            newjson.layouts = sakai.config.widgets.layouts;
            newjson.selected = settings.layout;
            currentlySelectedLayout = settings.layout;
            newjson.sakai = sakai;
            $("#layouts_list", $rootelClass).html(sakai.api.Util.TemplateRenderer("layouts_template", newjson));
            bindLayoutPickerEventHandlers();
            hash.w.show();
        };

        sakai.api.Util.Modal.setup($(changeLayoutDialog, $rootel), {
            modal: true,
            overlay: 20,
            toTop: true,
            onShow: renderLayouts
        });

        var changeLayout = function(title) {
            if (title) {
                $("#paget_title_only", $rootel).html(" " + title);
            }
            sakai.api.Util.Modal.open($(changeLayoutDialog, $rootel));
        };

        /**
         * Bind the changeLayout.dashboard.sakai event to change the layout of
         * this dashboard.
         *
         * @param e      standard jQuery Event object
         * @param title  title of the dashboard page
         * @param dashboard_tuid  (optional) tuid of the dashboard to change.
         *     This is especially useful when there are multiple dashboard
         *     widgets on one page.
         */
        $(window).bind("changeLayout.dashboard.sakai", function(e, title, iTuid) {
            showChangeLayoutDialog(title, iTuid);
            e.stopPropagation();
        });
        
        $(".dashboard_change_layout").live("click", function(){
            var iTuid = "" + $(this).data("tuid");
            showChangeLayoutDialog(false, iTuid);
        });
        
        var showChangeLayoutDialog = function(title, iTuid){
            if (iTuid === tuid) {
                changeLayout(title);
            }
        };

        ///////////////////////
        // Add Sakai Goodies //
        ///////////////////////
        var bindGoodiesEventHandlers = function() {
            $rootelClass = $($rootelClass.selector);
            /*
           * When you click the Add button, next to a widget in the Add Goodies screen,
           * this function will figure out what widget we chose and will hide the Add row
           * and show the Remove row for that widget
           */
            $(goodiesAddButton, $rootelClass).unbind("click");
            $(goodiesAddButton, $rootelClass).bind("click", function(ev) {
                // Disable the add goodies buttons
                disableAddGoodies();
                // The expected is btn_add_WIDGETNAME
                var id = this.id.replace(btnAdd, "");
                $(addRow + id, $rootelClass).hide();
                $(removeRow + id, $rootelClass).show();
                addWidget(id);
            });

            /*
           * When you click the Remove button, next to a widget in the Add Goodies screen,
           * this function will figure out what widget we chose and will hide the Remove row
           * and show the Add row for that widget
           */
            $(goodiesRemoveButton, $rootelClass).unbind("click");
            $(goodiesRemoveButton, $rootelClass).bind("click", function(ev) {
                // Disable the add goodies buttons
                disableAddGoodies();
                // The expected id is btn_remove_WIDGETNAME
                var id = this.id.replace(btnRemove, "");
                $(removeRow + id, $rootelClass).hide();
                $(addRow + id, $rootelClass).show();
                // We find the widget container itself, and then find its parent,
                // which is the column the widget is in, and then remove the widget
                // from the column
                var el = $("[id^=" + id + "]", $rootel).get(0);
                var parent = el.parentNode;
                parent.removeChild(el);
                saveState();
            });

            $(".close_goodies_dialog", $rootelClass).unbind("click");
            $(".close_goodies_dialog", $rootelClass).bind("click", function(e) {
                sakai.api.Util.Modal.close(addGoodiesDialog + rootelClass);
            });

        };

        var renderGoodies = function(hash) {

            var addingPossible = {};
            addingPossible.items = [];

            $(addGoodiesListContainer, $rootelClass).html("");

            for (var l in sakai.widgets) {
                if (sakai.widgets.hasOwnProperty(l)) {
                    var alreadyIn = false;
                    // Run through the list of widgets that are already on my dashboard and decide
                    // whether the current widget is already on the dashboard (so show the Remove row),
                    // or whether the current widget is not on the dashboard (and thus show the Add row)
                    for (var c in settings.columns) {
                        if (settings.columns.hasOwnProperty(c) && c.indexOf("column") > -1) {
                            for (var ii = 0; ii < settings.columns[c].length; ii++) {
                                if (settings.columns[c][ii].name === l) {
                                    alreadyIn = true;
                                }
                            }
                        }
                    }
                    if (sakai.widgets[l][widgetPropertyName]) {
                        var index = addingPossible.items.length;
                        addingPossible.items[index] = sakai.widgets[l];
                        addingPossible.items[index].alreadyIn = alreadyIn;
                    }
                }
            }

            // Render the list of widgets. The template will render a remove and add row for each widget, but will
            // only show one based on whether that widget is already on my dashboard

            addingPossible.sakai = sakai;
            $(addGoodiesListContainer, $rootelClass).html(sakai.api.Util.TemplateRenderer(addGoodiesListTemplate, addingPossible));
            bindGoodiesEventHandlers();

            // Show the modal dialog
            hash.w.show();

        };

        /*
        * We bring up the modal dialog that contains the list of widgets I can add
        * to my dashboard. Before it shows on the screen, we'll render the list of
        * widgets through a TrimPath template
        */
        sakai.api.Util.Modal.setup($(addGoodiesDialog, $rootel), {
            modal: true,
            overlay: 20,
            toTop: true,
            onShow: renderGoodies
        });

        $(window).bind("showAddWidgetDialog.dashboard.sakai", function(e, iTuid) {
            showAddWidgetDialog(iTuid);
            e.stopPropagation();
        });
        
        $(".dashboard_global_add_widget").live("click", function(){
            var iTuid = "" + $(this).data("tuid");
            showAddWidgetDialog(iTuid);
        });
        
        var showAddWidgetDialog = function(iTuid){
            if (iTuid === tuid) {
                sakai.api.Util.Modal.open($(addGoodiesDialog, $rootel));
            }
        };

        /**
        * Initialize the Dashboard Widget
        *
        * @param {String} path the path of the embedding page, where this widget should be saved to.
        *                 NOTE: path should not be the same base path as the dashboard widget itself, or
        *                 the dashboard settings will overwrite the widget settings upon save
        * @param {Boolean} editmode true if the dashboard should be editable, false if it should be static
        * @param {String} propertyname property name in the widget config to allow it to be added to this dashboard
        * @param {Boolean} fixedContainer is the dashboard should be a fixed container, ie. 920px wide
        */
        var init = function(path, editmode, propertyname, fixedContainer) {
            savePath = path;
            isEditable = editmode;
            widgetPropertyName = propertyname;
            // add the tuid to the dialogs so they can be bound to by each instance of this widget
            $(addGoodiesDialog, $rootel).addClass(tuid);
            $(changeLayoutDialog, $rootel).addClass(tuid);
            // reinitialize the selector after adding the class to the elements
            $rootelClass = $($rootelClass.selector);

            if (fixedContainer) {
                $(".widget-content .dashboard_options", $rootel).addClass("fixed-container");
                $(".widget-content #widgetscontainer", $rootel).addClass("fixed-container");
            }

            // prevent the container from flashing at 100% width if it needs to be a fixed-container
            // by showing it here instead of by default
            $(".widget-content #widgetscontainer", $rootel).show();

            if (widgetData && widgetData.dashboard) {
                decideExists(true, widgetData.dashboard);
            } else {
                sakai.api.Widgets.loadWidgetData(tuid, decideExists);
            }
        };

        // Dashboards are only used in the private space these days
        init("/~" + sakai.data.me.user.userid + "/private/privspace/", true, "personalportal", false);

        /**
         * Send out an event to indicate that the dashboard widget has been
         * loaded successfully
         */

        $(window).trigger("ready.dashboard.sakai", tuid);
        sakai_global.dashboard.isReady = true;
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("dashboard");

});
