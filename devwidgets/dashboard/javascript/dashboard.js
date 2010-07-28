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

var sakai = sakai || {};

sakai.dashboard = function(tuid, showSettings) {

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////
    var stateFile = "my_sakai_state";

    // Namespace of data cache for thsi page
    sakai.data.my_sakai = sakai.data.my_sakai || {};

    // Add Goodies related fields
    var addGoodiesDialog = "#add_goodies_dialog";
    var addGoodiesTrigger = '#add-goodies';
    var addGoodiesListContainer = "#add_goodies_body";
    var addGoodiesListTemplate = "add_goodies_body_template";
    var btnAdd = "btn_add_";
    var btnRemove = "btn_remove_";
    var goodiesAddButton = ".goodies_add_button";
    var goodiesRemoveButton = ".goodies_remove_button";
    var addRow = "#row_add_";
    var removeRow = "#row_remove_";


    ////////////////////
    // Help variables //
    ////////////////////
    var doShowDashboard = false;
    var startSaving = true;
    var person = false;
    var isEditable = false;
    var widgetPropertyName = false;
    var settings = false;
    var savePath = false;

    var decideExists = function(exists, response) {
        if (exists === false) {
            if (response.status === 401) { // uesr is not logged in
                $(window).trigger("sakai.dashboard.notLoggedIn"); // let the embedding page decide how to handle not logged in
            }
            doInit();
        } else {
            try {
                settings = response;
                var cleanContinue = true;

                for (var c in settings.columns) {
                    if (settings.columns.hasOwnProperty(c)) {
                        for (var pi in settings.columns[c]) {
                            if (settings.columns[c].hasOwnProperty(pi)) {
                                if (pi !== "contains") {
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
                doInit();
            }
        }
    };

    sakai.dashboard.finishEditSettings = function(tuid, widgetname) {
        var generic = "widget_" + widgetname + "_" + tuid + "_" + savePath;
        var id = tuid;
        var old = document.getElementById(id);
        var newel = document.createElement("div");
        newel.id = generic;
        newel.className = "widget_inline";
        old.parentNode.replaceChild(newel, old);
        sakai.api.Widgets.widgetLoader.insertWidgets(newel.parentNode.id, false);
    };

    sakai.api.Widgets.Container.registerFinishFunction(sakai.dashboard.finishEditSettings);
    sakai.api.Widgets.Container.registerCancelFunction(sakai.dashboard.finishEditSettings);

    var showInit = function() {

        var columns = [];
        var layout = "dev";

        columns[0] = [];
        columns[1] = [];

        columns[0][0] = "sites";
        columns[1][0] = "myprofile";
        columns[0][1] = "myfriends";

        // grab the defaults from config if they exist
        if (Widgets.defaults[widgetPropertyName]) {
            if (Widgets.defaults[widgetPropertyName].layout) {
                layout = Widgets.defaults[widgetPropertyName].layout;
            }
            if (Widgets.defaults[widgetPropertyName].columns && Widgets.defaults[widgetPropertyName].columns.length) {
                columns = Widgets.defaults[widgetPropertyName].columns;
            }
        }

        var jsonobj = {};
        jsonobj.columns = {};

        for (var i = 0, j = columns.length; i < j; i++) {
            jsonobj.columns["column" + (i + 1)] = [];
            for (var ii = 0, jj = columns[i].length; ii < jj; ii++) {
                var index = jsonobj.columns["column" + (i + 1)].length;
                jsonobj.columns["column" + (i + 1)][index] = {};
                jsonobj.columns["column" + (i + 1)][index].name = columns[i][ii];
                jsonobj.columns["column" + (i + 1)][index].visible = "block";
                jsonobj.columns["column" + (i + 1)][index].uid = "id" + Math.round(Math.random() * 10000000000000);
            }
        }

        jsonobj.layout = layout;

        settings = jsonobj;

        sakai.api.Widgets.saveWidgetData(tuid, settings, showDashboard);

    };

    sakai.dashboard.minimizeWidget = function(id) {
        var el = $("#" + id + "_container");
        if (el.css("display") == "none") {
            el.show();
        } else {
            el.hide();
        }
        saveState();
    };

    var tobindtolayoutpicker = function() {
        $(".layout-picker").bind("click",
        function(ev) {
            var selected = this.id.split("-")[this.id.split("-").length - 1];
            var newjson = {};
            newjson.layouts = Widgets.layouts;
            newjson.selected = selected;
            currentselectedlayout = selected;
            $("#layouts_list").html($.TemplateRenderer("layouts_template", newjson));
            tobindtolayoutpicker();
        });
    };

    $("#select-layout-finished").bind("click",
    function(ev) {
        if (currentselectedlayout == settings.layout) {
            $("#change_layout_dialog").jqmHide();
        } else {

            var selectedlayout = currentselectedlayout;
            var columns = [];
            for (var i = 0, j = Widgets.layouts[selectedlayout].widths.length; i < j; i++) {
                columns[i] = [];
            }

            var initlength = Widgets.layouts[settings.layout].widths.length;
            var newlength = Widgets.layouts[selectedlayout].widths.length;

            var index = 0;
            for (var l in settings.columns) {
                if (index < newlength) {
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
            if (settings.layout != selectedlayout) {
                if (newlength < initlength) {
                    for (l in settings.columns) {
                        if (index >= newlength) {
                            for (i = 0, j = settings.columns[l].length; i < j; i++) {
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
                                columns[lowestcolumn][_i].name = settings.columns[l][i].name;
                                columns[lowestcolumn][_i].visible = settings.columns[l][i].visible;
                                columns[lowestcolumn][_i].uid = settings.columns[l][i].uid;
                            }
                        }
                        index++;
                    }
                }
            }

            settings = {};
            settings["columns"] = {};
            for (i = 0, j = Widgets.layouts[selectedlayout].widths.length; i < j; i++) {
                settings["columns"]["column" + (i + 1)] = [];
                for (var ii = 0, jj = columns[i].length; ii < jj; ii++) {
                    settings["columns"]["column" + (i + 1)][settings["columns"]["column" + (i + 1)].length] = {"name":columns[i][ii].name,"visible":columns[i][ii].visible,"uid":columns[i][ii].uid};
                }
            }
            settings["layout"] = selectedlayout;

            sakai.api.Widgets.saveWidgetData(tuid, settings, beforeFinishAddWidgets);

        }
    });

    var beforeFinishAddWidgets = function() {
        showDashboard();
        $("#change_layout_dialog").jqmHide();
    };

    var doInit = function() {

        person = sakai.data.me;
        inituser = person.user.userid;
        if (!inituser) {
            $(window).trigger("sakai.dashboard.notUsersDashboard");
        } else if (person.user.anon) {
            $(window).trigger("sakai.dashboard.notLoggedIn");
        } else {

            $(".body-container").show();

            if (doShowDashboard) {
                showDashboard();
            }
            else {
                showInit();
            }
        }

    };

    var buildLayout = function(success) {

        if (success) {
            showDashboard();
        } else {
            fluid.log("my_sakai.js: An error occured while saving your group!");
        }

    };

    var showDashboard = function() {
      
        if (!Widgets.layouts[settings.layout]) {

            var columns = [];
            for (var i = 0, j = Widgets.layouts[settings.layout].widths.length; i < j; i++) {
                columns[i] = [];
            }

            var initlength = 0;
            for (l in settings.columns) {
                initlength++;
            }
            var newlength = Widgets.layouts[settings.layout].widths.length;

            var index = 0;
            for (l in settings.columns) {
                if (index < newlength) {
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
                for (l in settings.columns) {
                    if (index >= newlength) {
                        for (i = 0, j = settings.columns[l].length; i < j; i++) {
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
                            columns[lowestcolumn][_i].name = settings.columns[l][i].name;
                            columns[lowestcolumn][_i].visible = settings.columns[l][i].visible;
                            columns[lowestcolumn][_i].uid = settings.columns[l][i].uid;
                        }
                    }
                    index++;
                }
            }

            var jsonstring = '{"columns":{';
            for (i = 0, j = Widgets.layouts[settings.layout].widths.length; i < j; i++) {
                jsonstring += '"column' + (i + 1) + '":[';
                for (var ii = 0, jj = columns[i].length; ii < jj; ii++) {
                    jsonstring += '{"name":"' + columns[i][ii].name + '","visible":"' + columns[i][ii].visible + '","uid":"' + columns[i][ii].uid + '"}';
                    if (ii !== columns[i].length - 1) {
                        jsonstring += ',';
                    }
                }
                jsonstring += ']';
                if (i !== Widgets.layouts[settings.layout].widths.length - 1) {
                    jsonstring += ',';
                }
            }

            jsonstring += '},"layout":"' + settings.layout + '"}';

            settings = $.parseJSON(jsonstring);

            sakai.api.Widgets.saveWidgetData(tuid, settings);
        }

        var final2 = {};
        final2.columns = [];
        final2.size = Widgets.layouts[settings.layout].widths.length;
        var currentindex = -1;
        var isvalid = true;

        try {
            for (var c in settings.columns) {

                currentindex++;
                index = final2.columns.length;
                final2.columns[index] = {};
                final2.columns[index].portlets = [];
                final2.columns[index].width = Widgets.layouts[settings.layout].widths[currentindex];

                var columndef = settings.columns[c];
                for (var pi in columndef) {
                    var dashboardDef = columndef[pi];
                    if (dashboardDef.name && Widgets.widgets[dashboardDef.name]) {
                        var widget = Widgets.widgets[dashboardDef.name];
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
        catch(err) {
            fluid.log(err);
            isvalid = false;
        }


        if (isvalid) {

            $('#widgetscontainer').html($.TemplateRenderer("widgetscontainer_template", final2));


            // only set up the settings bindings if the dashboard's embedding page allows editing
            if (isEditable) {
              $(".dashboard_options").show();
              // .hover is shorthand for .bind('mouseenter mouseleave')
              // unbinding 'hover' doesn't work, 'mouseenter mouseleave' must be used instead.
              $(".widget1").unbind('mouseenter mouseleave').hover(
              function(over) {
                  var id = this.id + "_settings";
                  $("#" + id).show();
              },
              function(out) {
                  if ($("#widget_settings_menu").css("display") == "none" || this.id != currentSettingsOpen) {
                      var id = this.id + "_settings";
                      $("#" + id).hide();
                  }
              }
              );

              $(".settings").unbind('click').click(function(ev) {

                  if ($("#widget_settings_menu").is(":visible")) {
                      $("#widget_settings_menu").hide();
                  } else {
                      var splitted = this.id.split("_");
                      if (splitted[0] + "_" + splitted[1] == currentSettingsOpen) {
                          $("#widget_" + currentSettingsOpen + "_settings").hide();
                      }
                      currentSettingsOpen = splitted[0] + "_" + splitted[1];
                      var widgetId = splitted[0];

                      if (Widgets.widgets[widgetId] && Widgets.widgets[widgetId].hasSettings) {
                          $("#settings_settings").show();
                      } else {
                          $("#settings_settings").hide();
                      }

                      var el = $("#" + currentSettingsOpen.split("_")[1] + "_container");
                      if (el.is(":visible")) {
                          $("#settings_hide_link").text("Hide");
                      } else {
                          $("#settings_hide_link").text("Show");
                      }

                      var x = $(this).position().left;
                      var y = $(this).position().top;
                      $("#widget_settings_menu").css("left", x - $("#widget_settings_menu").width() + 28 + "px");
                      $("#widget_settings_menu").css("top", y + 24 + "px");
                      $("#widget_settings_menu").show();
                  }
              });
        

              // .hover is shorthand for .bind('mouseenter mouseleave')
              // unbinding 'hover' doesn't work, 'mouseenter mouseleave' must be used instead.
              $(".more_option").unbind('mouseenter mouseleave').hover(
              function(over) {
                  $(this).addClass("selected_option");
              },
              function(out) {
                  $(this).removeClass("selected_option");
              }
              );

              $("#settings_remove").unbind('click').click(function(ev) {
                  var id = currentSettingsOpen;
                  var el = document.getElementById(id);
                  var parent = el.parentNode;
                  parent.removeChild(el);
                  saveState();
                  $("#widget_settings_menu").hide();
                  $("#" + currentSettingsOpen + "_settings").hide();
                  currentSettingsOpen = false;
                  return false;
              });

              $("#settings_hide").unbind('click').click(function(ev) {

                  var el = $("#" + currentSettingsOpen.split("_")[1] + "_container");
                  if (el.css('display') == "none") {
                      el.show();
                  } else {
                      el.hide();
                  }
                  saveState();

                  $("#widget_settings_menu").hide();
                  $("#" + currentSettingsOpen + "_settings").hide();
                  currentSettingsOpen = false;
                  return false;
              });

              $("#settings_settings").unbind('click').click(function(ev) {
                  var generic = "widget_" + currentSettingsOpen + "_" + savePath;
                  var id = currentSettingsOpen.split("_")[1];
                  var old = document.getElementById(id);
                  var newel = document.createElement("div");
                  newel.id = generic;
                  newel.className = "widget_inline";
                  old.parentNode.replaceChild(newel, old);
                  $("#widget_settings_menu").hide();
                  currentSettingsOpen = false;
                  sakai.api.Widgets.widgetLoader.insertWidgets(newel.parentNode.id, true);
                  return false;
              });

              /**
             * Bind the document on click event
             */
              $(document).unbind('click').click(function(e) {
                  var $clicked = $(e.target);

                  // Check if one of the parents is the chatstatuscontainer
                  if (!$clicked.is(".settings")) {
                      $("#widget_settings_menu").hide();
                      $("#" + currentSettingsOpen + "_settings").hide();
                      currentSettingsOpen = false;
                  }

              });
          
              var grabHandleFinder,
              createAvatar,
              options;

              grabHandleFinder = function(item) {
                  // the handle is the toolbar. The toolbar id is the same as the portlet id, with the
                  // "portlet_" prefix replaced by "toolbar_".
                  return jQuery("[id=draghandle_" + item.id + "]");
              };

              options = {
                  styles: {
                      mouseDrag: "orderable-mouse-drag",
                      dropMarker: "orderable-drop-marker-box",
                      avatar: "orderable-avatar-clone"
                  },
                  selectors: {
                      columns: ".groupWrapper",
                      modules: ".widget1",
                      grabHandle: grabHandleFinder
                  },
                  listeners: {
                      onBeginMove: beforeWidgetDrag,
                      afterMove: saveState
                  }
              };

              fluid.reorderLayout("#widgetscontainer", options);
            } else {
              // remove the move cursor from the title bar
              $(".fl-widget-titlebar").css("cursor", "default");
            }
            sakai.api.Widgets.widgetLoader.insertWidgets("widgetscontainer");

        } else {
            showInit();
        }

    };
    
    var beforeWidgetDrag = function() {
        $("#widget_settings_menu").hide();
    };

    var currentSettingsOpen = false;

    var saveState = function() {

        serString = '{"columns":{';
        if (startSaving === true) {

            var columns = $(".groupWrapper");
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

                        if (node && node.style) {

                            widgetdisplay = "block";
                            var nowAt = 0;
                            var id = node.style.display;
                            var uid = Math.round(Math.random() * 100000000000);
                            for (var y = 0, z = node.childNodes.length; y < z; y++) {
                                if (node.childNodes[y].style) {
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
                            serString += '{"name":"' + node.id.split("_")[0] + '","visible":"' + widgetdisplay + '","uid":"' + uid + '"}';

                        }
                    } catch(err) {
                        fluid.log("mysakai.js/saveState(): There was an error saving state: " + err);
                    }

                }

                serString += "]";

            }

            serString += '},"layout":"' + settings.layout + '"}';

            settings = $.parseJSON(serString);

            var isempty = true;
            for (i in settings.columns) {
                if (settings.columns[i].length > 0) {
                    isempty = false;
                }
            }

            sakai.api.Widgets.saveWidgetData(tuid, settings, checksucceed);

        }

    };

    var checksucceed = function(success) {
        if (!success) {
            fluid.log("Connection with the server was lost");
        }
    };

    sakai.dashboard.showAddWidgets = function() {

        addingPossible = [];
        addingPossible.items = [];
        $("#addwidgetlist").html("");

        for (var l in Widgets.widgets) {
            var alreadyIn = false;
            if (!Widgets.widgets[l].multipleinstance) {
                for (var c in settings.columns) {
                    for (var ii = 0, jj = settings.columns[c].length; ii < jj; ii++) {
                        if (settings.columns[c][ii].name === l) {
                            alreadyIn = true;
                        }
                    }
                }
            }
            if (Widgets.widgets[l][widgetPropertyName]) {
                var index = addingPossible.items.length;
                addingPossible.items[index] = Widgets.widgets[l];
                addingPossible.items[index].alreadyIn = alreadyIn;
            }
        }

        $("#addwidgetlist").html($.TemplateRenderer("addwidgetlist_template", addingPossible));
        currentlyopen = addingPossible.items[0].id;

        $("#addWidgets_selected_title").text(sakai.api.Security.saneHTML(addingPossible.items[0].title));
        $("#addWidgets_selected_description").text(sakai.api.Security.saneHTML(addingPossible.items[0].description));
        $("#widget_img").attr("src", addingPossible.items[0].img);
        if (addingPossible.items[0].alreadyIn) {
            $("#btnAddWidget").hide();
            $("#btnRemoveWidget").show();
        } else {
            $("#btnRemoveWidget").hide();
            $("#btnAddWidget").show();
        }

        $("#addwidgetslightbox").show();
        $("#addwidgetslightbox2").show();
    };

    sakai.dashboard.finishAddWidgets = function() {
        document.reload(true);
    };

    var currentlyopen = "";

    sakai.dashboard.showdetails = function(id) {
        for (var l in Widgets.widgets) {
            if (Widgets.widgets[l][widgetPropertyName] && Widgets.widgets[l].id == id) {
                var alreadyIn = false;
                if (!Widgets.widgets[l].multipleinstance) {
                    for (var c in settings.columns) {
                        for (var ii = 0, jj = settings.columns[c].length; ii < jj; ii++) {
                            if (settings.columns[c][ii].name === l) {
                                alreadyIn = true;
                            }
                        }
                    }
                }
                currentlyopen = Widgets.widgets[l].id;
                $("#addWidgets_selected_title").text(sakai.api.Security.saneHTML(Widgets.widgets[l].name));
                $("#addWidgets_selected_description").text(sakai.api.Security.saneHTML(Widgets.widgets[l].description));
                $("#widget_img").attr("src", Widgets.widgets[l].img);
                if (alreadyIn) {
                    $("#btnAddWidget").hide();
                    $("#btnRemoveWidget").show();
                } else {
                    $("#btnRemoveWidget").hide();
                    $("#btnAddWidget").show();
                }
            }
        }
    };

    sakai.dashboard.removeWidget = function() {
        sakai.dashboard.closePortlet(currentlyopen);
        document.getElementById('li_' + currentlyopen).className = "";
        $("#btnRemoveWidget").hide();
        $("#btnAddWidget").show();
    };

    sakai.dashboard.addWidget = function(id) {

        var selectedlayout = settings.layout;

        var columns = [];
        for (var i = 0, j = Widgets.layouts[selectedlayout].widths.length; i < j; i++) {
            columns[i] = [];
        }

        var initlength = Widgets.layouts[settings.layout].widths.length;
        var newlength = Widgets.layouts[selectedlayout].widths.length;

        var index = 0;
        for (var l in settings.columns) {
            if (index < newlength) {
                for (i = 0, j = settings.columns[l].length; i < j; i++) {
                    columns[index][i] = settings.columns[l][i];
                }
                index++;
            }
        }

        index = 0;
        if (settings.layout != selectedlayout) {
            if (newlength < initlength) {
                for (l in settings.columns) {
                    if (index >= newlength) {
                        for (i = 0, j = settings.columns[l].length; i < j; i++) {
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
                            columns[lowestcolumn][_i] = settings.columns[l][i];
                        }
                    }
                    index++;
                }
            }
        }

        var currentWidget = id;

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
        columns[lowestcolumn][_i] = new Object();
        columns[lowestcolumn][_i].name = currentWidget;
        columns[lowestcolumn][_i].visible = "block";
        columns[lowestcolumn][_i].uid = "id" + Math.round(Math.random() * 10000000000);

        var jsonstring = '{"columns":{';
        for (var i = 0, j = Widgets.layouts[selectedlayout].widths.length; i < j; i++) {
            jsonstring += '"column' + (i + 1) + '":[';
            for (var ii = 0, jj = columns[i].length; ii < jj; ii++) {
                jsonstring += '{"name":"' + columns[i][ii].name + '","visible":"' + columns[i][ii].visible + '","uid":"' + columns[i][ii].uid + '"}';
                if (ii !== columns[i].length - 1) {
                    jsonstring += ',';
                }
            }
            jsonstring += ']';
            if (i !== Widgets.layouts[selectedlayout].widths.length - 1) {
                jsonstring += ',';
            }
        }
        jsonstring += '},"layout":"' + selectedlayout + '"}';

        settings = $.parseJSON(jsonstring);

        sakai.api.Widgets.saveWidgetData(tuid, settings, finishAddWidgets);

    };

    var finishAddWidgets = function(success) {
        if (success) {
            $("#widgetscontainer").html("");
            showDashboard();
        }
        else {
            alert("The connection with the server has been lost");
        }
    };

    var currentselectedlayout = false;


    /*
      Change layout functionality
  */

    var renderLayouts = function(hash) {
        var newjson = {};
        newjson.layouts = Widgets.layouts;
        newjson.selected = settings.layout;
        currentselectedlayout = settings.layout;
        $("#layouts_list").html($.TemplateRenderer("layouts_template", newjson));
        tobindtolayoutpicker();
        hash.w.show();
    };

    $("#change_layout_dialog").jqm({
        modal: true,
        trigger: $('#edit-layout'),
        overlay: 20,
        toTop: true,
        onShow: renderLayouts
    });


    ///////////////////////
    // Add Sakai Goodies //
    ///////////////////////
    var renderGoodiesEventHandlers = function() {

        /*
       * When you click the Add button, next to a widget in the Add Goodies screen,
       * this function will figure out what widget we chose and will hide the Add row
       * and show the Remove row for that widget
       */
        $(goodiesAddButton).bind("click",
        function(ev) {
            // The expected is btn_add_WIDGETNAME
            var id = this.id.replace(btnAdd, "");
            $(addRow + id).hide();
            $(removeRow + id).show();
            sakai.dashboard.addWidget(id);
        });

        /*
       * When you click the Remove button, next to a widget in the Add Goodies screen,
       * this function will figure out what widget we chose and will hide the Remove row
       * and show the Add row for that widget
       */
        $(goodiesRemoveButton).bind("click",
        function(ev) {
            // The expected id is btn_remove_WIDGETNAME
            var id = this.id.replace(btnRemove, "");
            $(removeRow + id).hide();
            $(addRow + id).show();
            // We find the widget container itself, and then find its parent,
            // which is the column the widget is in, and then remove the widget
            // from the column
            var el = $("[id^=" + id + "]").get(0);
            var parent = el.parentNode;
            parent.removeChild(el);
            saveState();
        });

    };

    var renderGoodies = function(hash) {

        var addingPossible = {};
        addingPossible.items = [];

        $(addGoodiesListContainer).html("");

        for (var l in Widgets.widgets) {
            var alreadyIn = false;
            // Run through the list of widgets that are already on my dashboard and decide
            // whether the current widget is already on the dashboard (so show the Remove row),
            // or whether the current widget is not on the dashboard (and thus show the Add row)
            for (var c in settings.columns) {
                for (var ii = 0; ii < settings.columns[c].length; ii++) {
                    if (settings.columns[c][ii].name === l) {
                        alreadyIn = true;
                    }
                }
            }
            if (Widgets.widgets[l][widgetPropertyName]) {
                var index = addingPossible.items.length;
                addingPossible.items[index] = Widgets.widgets[l];
                addingPossible.items[index].alreadyIn = alreadyIn;
            }
        }

        // Render the list of widgets. The template will render a remove and add row for each widget, but will
        // only show one based on whether that widget is already on my dashboard
        $(addGoodiesListContainer).html($.TemplateRenderer(addGoodiesListTemplate, addingPossible));
        renderGoodiesEventHandlers();

        // Show the modal dialog
        hash.w.show();

    };

    /*
   * We bring up the modal dialog that contains the list of widgets I can add
   * to my dashboard. Before it shows on the screen, we'll render the list of
   * widgets through a TrimPath template
   */
    $(addGoodiesDialog).jqm({
        modal: true,
        trigger: $(addGoodiesTrigger),
        overlay: 20,
        toTop: true,
        onShow: renderGoodies
    });

    /**
   * Initialize the Dashboard Widget
   *
   * @param {String} path the path of the embedding page, where this widget should be saved to
   * @param {Boolean} editmode true if the dashboard should be editable, false if it should be static
   * @param {String} propertyname property name in the widget config to allow it to be added to this dashboard
   */
    sakai.dashboard.init = function(path, editmode, propertyname) {
        savePath = path;
        isEditable = editmode;
        widgetPropertyName = propertyname;
        sakai.api.Widgets.loadWidgetData(tuid, decideExists);        
    };

    var init = function() {
        $(window).trigger("sakai.dashboard.ready");
    };

    init();


};

sakai.api.Widgets.widgetLoader.informOnLoad("dashboard");