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
 * /dev/lib/jquery/plugins/jquery.json.js (toJSON)
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.autoSuggest.sakai-edited.js (autoSuggest)
 */
/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.embedcontent
     *
     * @class embedcontent
     *
     * @description
     * Initialize the embedcontent widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.embedcontent = function(tuid, showSettings, widgetData) {

        var $rootel = $("#" + tuid);

        var $embedcontent_main_container = $("#embedcontent_main_container", $rootel);
        var $embedcontent_page_name = $("#embedcontent_page_name", $rootel);


        // Settings Mode
        var $embedcontent_settings = $("#embedcontent_settings", $rootel);
        var $embedcontent_dont_add = $(".embedcontent_dont_add", $rootel);

        // Choose Content tab selectors
        var $embedcontent_tabs = $("#embedcontent_tabs", $rootel);
        var $embedcontent_search_for_content = $("#embedcontent_search_for_content", $rootel);
        var $embedcontent_just_add = $("#embedcontent_just_add", $rootel);
        var $embedcontent_button_goto_display_settings = $("#embedcontent_button_goto_display_settings", $rootel);
        var $embedcontent_content_input = $("#embedcontent_content_input", $rootel);
        var $fileuploadContainer = $("#fileupload_container", $rootel);
        var $uploadContentLink = $("#upload_content", $rootel);

        // Display Settings tab selectors
        var $embedcontent_alternative_display_name_value = $("#embedcontent_alternative_display_name_value", $rootel);
        var $embedcontent_description_value = $("#embedcontent_description_value", $rootel);
        var $embedcontent_page_name_template = $("#embedcontent_page_name_template", $rootel);
        var $embedcontent_button_add_selected_content = $("#embedcontent_button_add_selected_content", $rootel);
        var $embedcontent_display_previews = $("#embedcontent_display_style div.s3d-highlight_area_background", $rootel);
        var $embedcontent_include_inputs = $("#embedcontent_include input", $rootel);
        var $embedcontent_layout_options = $("#embedcontent_choose_layout div", $rootel);
        var $embedcontent_add_title_description_button = $("#embedcontent_add_title_description_button", $rootel);
        var $embedcontent_add_title_description_fields = $("#embedcontent_add_title_description_fields", $rootel);
        var $embedcontent_display_form = $("#embedcontent_display_form", $rootel);
        var $embedcontent_choose_layout_container = $("#embedcontent_choose_layout_container", $rootel);
        var $embedcontent_title = $("#embedcontent_title", $rootel);
        var $embedcontent_description = $("#embedcontent_description", $rootel);

        // Display mode
        var $embedcontent_content = $("#embedcontent_content", $rootel);
        var $embedcontent_content_html_template = $("#embedcontent_content_html_template", $rootel);
        var $embedcontent_primary_display = $(".embedcontent_primary_display", $rootel);
        var $embedcontent_alt_display = $(".embedcontent_alt_display", $rootel);
        var $embedcontent_item_unavailable_text = $("#embedcontent_item_unavailable_text", $rootel);


        var selectedItems = [];
        var firstTime = true;
        var firstLoad = true;
        var wData = false;
        var isPreviewExist = true;
        var active_content_class = "tab_content_active";
        var tab_id_prefix = "embedcontent_tab_";
        var active_tab_class = "fl-tabs-active";

        var embedConfig = {
            "name": "Page",
            "limit": false,
            "filter": false,
            "type": "choose"
        };

        /**
         * Render the embed screen
         */
        var renderSettings = function() {
            selectedItems = [];
            sakai.api.Util.TemplateRenderer($embedcontent_page_name_template, {"name": embedConfig.name}, $embedcontent_page_name);
            if (firstTime) {
                setupAutoSuggest();
                sakai.api.Widgets.widgetLoader.insertWidgets("embedcontent_settings", false, "#"+tuid);
                firstTime = false;
            } else {
                doReset();
            }
            if (firstLoad) {
                $embedcontent_primary_display.show();
                $embedcontent_alt_display.hide();
            } else {
                $embedcontent_primary_display.hide();
                $embedcontent_alt_display.show();
            }
            $("#as-values-" + tuid).val("");
            $(".as-selection-item").remove();
            if (wData && wData.items && wData.items.length) {
                setCurrentFiles();
            }
        };

        var renderWidget = function() {
            wData.sakai = sakai;
            wData.showDefaultContent = false;
            var docData = {};
            $.each(wData.items, function(index, value) {
                var placement = "ecDocViewer" + tuid + value["jcr:name"] + index;
                wData.items[index].placement = placement;
                docData[placement] = {
                    data : value.fullresult,
                    url : window.location.protocol + '//' + window.location.host + "/p/" + value.fullresult['jrc:name']
                };
            });
            // boolean are return as string from ajax call so change back to boolean value
            wData.download = wData.download === "true";
            wData.name = wData.name === "true";
            wData.details = wData.details === "true";
            sakai.api.Util.TemplateRenderer($embedcontent_content_html_template, wData, $embedcontent_content);
            sakai.api.Widgets.widgetLoader.insertWidgets("embedcontent_main_container", false, "#"+tuid, [docData]);
        };

        /**
         * Do a reset of the embed screen
         */
        var doReset = function() {
            $("#as-values-" + tuid).val("");
            $(".as-selection-item").remove();
            // $embedcontent_alternative_display_name_value.val('');
            //         $embedcontent_description_value.val('');
        };

        var toggleButtons = function(doDisable) {
            var elts = [
                $embedcontent_just_add,
                $embedcontent_button_goto_display_settings,
                $embedcontent_button_add_selected_content
            ];
            $.each(elts, function(i,$elt) {
                if (doDisable) {
                    $elt.attr("disabled", "disabled");
                } else {
                    $elt.removeAttr("disabled");
                }
            });
        };

        /**
         * Creates an object out of results provided
         * This object contains valuable information about the file like path, name, type,...
         * @param {Object} result results provided (eg through a search)
         * @param {Object} name optional name provided
         */
        var createDataObject = function(result, name) {
            var mimetype = sakai.api.Content.getMimeType(result);
            var dataObj = {
                "value": name || result['jcr:name'],
                "name": result['sakai:pooled-content-file-name'],
                "type": "file",
                "filetype": mimetype.split("/")[0],
                "_mimeType": mimetype,
                "description": result["sakai:description"] || "",
                "path": "/p/" + (name || result['jcr:name']),
                "fileSize": sakai.api.Util.convertToHumanReadableFileSize(result["_length"]),
                "link": (name || result['jcr:name']) + "/" + result['sakai:pooled-content-file-name'],
                "extension": result['sakai:fileextension'],
                "jcr:name": result['jcr:name'],
                "_mimeType/page1-small": result["_mimeType/page1-small"],
                "fullresult" : result
            };

            // if the type is application need to auto check the display name so set ispreviewexist false
            if(dataObj.filetype === "application") {
                isPreviewExist = false;
            }

            return dataObj;
        };

        var autosuggestSelectionAdded = function(item) {
            selectedItems.push(item);
            toggleButtons();
            if (selectedItems.length > 1) {
                $embedcontent_choose_layout_container.show();
            }
        };

        var autosuggestSelectionRemoved = function(elem) {
            removeItemFromSelected(elem.html().split("</a>")[1]); // get filename
            elem.remove();
            if (selectedItems.length === 0) {
                toggleButtons(true);
            } else if (selectedItems.length === 1) {
                $embedcontent_choose_layout_container.hide();
            }
        };

        /**
         * When typing in the suggest box this function is executed to provide the user with a list of possible autocompletions
         */
        var setupAutoSuggest = function() {
            $embedcontent_content_input.autoSuggest("",{
                source: function(query, add) {
                    var q = sakai.api.Server.createSearchString(query);
                    var options = {"page": 0, "items": 15};
                    searchUrl = sakai.config.URL.POOLED_CONTENT_MANAGER;
                    if (q === '*' || q === '**') {
                        searchUrl = sakai.config.URL.POOLED_CONTENT_MANAGER_ALL;
                    } else {
                        options['q'] = q;
                    }
                    sakai.api.Server.loadJSON(searchUrl.replace(".json", ""), function(success, data){
                        if (success) {
                            var suggestions = [];
                            $.each(data.results, function(i) {
                                var dataObj = createDataObject(data.results[i]);
                                var doAdd = true;
                                if (embedConfig.filter) {
                                    if (dataObj.filetype !== embedConfig.filter) {
                                        doAdd = false;
                                    }
                                }
                                if (doAdd) {
                                    suggestions.push(dataObj);
                                }
                            });
                            add(suggestions);
                        }
                    }, options);
                },
                retrieveLimit: 10,
                asHtmlID: tuid,
                selectedItemProp: "name",
                searchObjProps: "name",
                selectionLimit: embedConfig.limit,
                resultClick: function(data) {
                    autosuggestSelectionAdded(data.attributes);
                },
                selectionRemoved: function(elem) {
                    autosuggestSelectionRemoved(elem);
                },
                selectionAdded: function(elem) {
                    if (elem.attr("id").indexOf("as-selection-notfound") > -1) {
                        elem.addClass("embedcontent_selection_notfound");
                    }
                }
            });
        };

        /**
         * Removes a previously selected item from the list of selected items
         * @param {Object} fileName name of the selected item to be removed from the list
         */
        var removeItemFromSelected = function(fileName) {
            var newItems = [];
            $(selectedItems).each(function(i, val) {
               if (val.name !== fileName) {
                   newItems.push(val);
               }
            });
            selectedItems = newItems;
        };

        var setCurrentFiles = function() {
            $.each(wData.items, function(i,val) {
                autosuggestSelectionAdded(val);
                if (val.value) {
                    $embedcontent_content_input.autoSuggest.add_selected_item(val, val.value);
                } else {
                    $embedcontent_content_input.autoSuggest.add_selected_item({name:$embedcontent_item_unavailable_text.text(), value:"notfound"+Math.ceil(Math.random() * 9999)}, "notfound");
                }
            });
            $(".as-original input.as-input").val('').focus();
            if (wData.title || wData.description) {
                toggleAddTitleAndDescription(true);
                $embedcontent_title.val(wData.title);
                $embedcontent_description.val(wData.description);
            }
            if (wData.layout !== "single") {
                $embedcontent_display_form.find("img.selected").removeClass('selected');
                $embedcontent_display_form
                    .find("input[name='layout'][value='" + wData.layout + "']")
                    .siblings("img")
                    .addClass('selected');
                $embedcontent_display_form
                    .find("input[name='layout'][value='" + wData.layout + "']")
                    .attr("checked", true);
            }
            $embedcontent_display_form
                .find("input[name='style'][value='" + wData.embedmethod + "']")
                .parent("div")
                .siblings("div")
                .children("img")
                .addClass('selected');
            $embedcontent_display_form.find("input[name='style'][value='" + wData.embedmethod + "']").attr("checked", true);
            var checkboxes = ["name", "download", "details"];
            $.each(checkboxes, function(i,val) {
                if (wData[val] === "true") {
                    $embedcontent_display_form.find("input[name='" + val + "']").attr("checked", "checked");
                    $(".embedcontent_include_" + val, $rootel).show();
                }
            });
        };

        /**
         * Called when file(s) are selected in the picker advanced widget and need to be added to the list of files that will be embedded.
         * @param {Object} files Array of files selected in the picker advanced widget
         */
        var addChoicesFromPickeradvanced = function(files) {
            var filesPicked = 0;
            $.each(files, function(i,val) {
                filesPicked++;
            });
            // revisit this next conditional -- right now it'll clear out all selections, not just add up to the limit
            if (embedConfig.limit && filesPicked && ($(".as-selection-item").length + filesPicked) > embedConfig.limit) {
                $("#as-values-" + tuid).val('');
                $(".as-selection-item").remove();
            }
            $.each(files, function(i,val) {
                var newObj = createDataObject(val, val["jcr:name"]);
                autosuggestSelectionAdded(newObj);
                $embedcontent_content_input.autoSuggest.add_selected_item(newObj, newObj.value);
            });
            $("input[id='" + tuid + "']").val('').focus();
        };

        /**
         * Called when newly uploaded files need to be added to the list of files that will be embedded
         * @param {Object} files Array containing a list of files
         */
        var addChoicesFromFileUpload = function(files) {
          $.each(files, function(i,val) {
              $.ajax({
                 url: val.url + ".infinity.json",
                 success: function(data) {
                     var newObj = createDataObject(data, val.url.split("/p/")[1]);
                     autosuggestSelectionAdded(newObj);
                     $embedcontent_content_input.autoSuggest.add_selected_item(newObj, newObj.value);
                 }
              });
          });
          $("input[id='" + tuid + "']").val('').focus();
          toggleButtons();
        };

        /**
         * Once the content has been placed on the page it has to be associated with the group
         * The group is set as a viewer of the content
         * @param {Object} embeddedItems Array of object containing information about the selected items. Only the path variable is used.
         */
        var associatedEmbeddedItemsWithGroup = function(embeddedItems){
            var data = [];
            for (var embeddedItem in embeddedItems) {
                if (embeddedItems.hasOwnProperty(embeddedItem)) {
                    var item = {
                        "url": embeddedItems[embeddedItem].path + ".members.json",
                        "method": "POST",
                        "parameters": {
                            ":viewer": sakai_global.currentgroup.id
                        }
                    };
                    data[data.length] = item;
                }
            }
            sakai.api.Server.batch(data, null, false, null, false);
        };

        var registerVideo = function(videoBatchData){
            sakai.api.Server.batch(videoBatchData, null, false, null, false);
        };

        /**
         * Embed the selected content on the page,
         * Call the function that associates the content with this group
         */
        var doEmbed = function() {
            var embedContentHTML = "";
            var formVals = $embedcontent_display_form.serializeObject();
            var itemsToSave = [];
            $.each(selectedItems, function(i,item) {
                if (item.path) {
                    itemsToSave.push(item.path);
                } else {
                    itemsToSave.push({notfound:true});
                }
            });
            var objectData = {
                "layout": selectedItems.length > 1 ? formVals.layout : "single",
                "embedmethod": formVals.style,
                "title": formVals.title || '',
                "description": formVals.description || '',
                "items": itemsToSave,
                "details": formVals.details ? true : false,
                "download": formVals.download ? true : false,
                "name": formVals.name ? true : false
            };
            var videoBatchData = [];
            for (var i in selectedItems){
                if(selectedItems.hasOwnProperty(i)){
                    if(selectedItems[i].filetype === "video"){
                        // Set random ID to the video
                        selectedItems[i].uId = Math.ceil(Math.random() * 999999999);

                        var itemUrl;
                        if (sakai_global.currentgroup.data.authprofile) {
                            itemUrl = "/~" + sakai_global.currentgroup.data.authprofile["sakai:group-title"] + "/pages/_widgets/id" + selectedItems[i].uId + "/video";
                        } else {
                            itemUrl = "/~" + sakai.data.me.user.userid + "/pages/_widgets/id" + selectedItems[i].uId + "/video";
                        }

                        // Create batch request data for the video
                        var item = {
                            "url": itemUrl,
                            "method": "POST",
                            "parameters": {
                                "uid": sakai.data.me.user.userid,
                                "source": " ",
                                "URL": sakai.config.SakaiDomain + selectedItems[i].link + selectedItems[i].extension,
                                "selectedvalue": "video_noSource",
                                "isYoutube": false,
                                "isSakaiVideoPlayer": false
                            }
                        };
                        videoBatchData.push(item);
                    }
                }
            }

            registerVideo(videoBatchData);

            if (sakai_global.currentgroup) {
                // Associate embedded items with the group
                associatedEmbeddedItemsWithGroup(selectedItems);
            }

            saveWidgetData(objectData);
        };

        var saveWidgetData = function(data) {
            sakai.api.Widgets.saveWidgetData(tuid, data, function() {
                sakai.api.Widgets.Container.informFinish(tuid, "embedcontent");
            });
        };

        var newItems = [];
        var processWidget = function(item, items) {
            var ret = false;
            if (item.notfound) {
                newItems.push({type:"notfound"});
                if (newItems.length === items.length) {
                    wData.items = newItems;
                    ret = true;
                }
            } else {
               $.ajax({
                    url: sakai.config.SakaiDomain + item + ".2.json",
                    // we have to wait for them all to return anyway, so
                    // no need to make them async calls
                    async:false,
                    success: function(data) {
                        var newItem = createDataObject(data);
                        newItems.push(newItem);
                    },
                    error: function(data) {
                        newItems.push({type:"notfound"});
                    },
                    complete: function() {
                        if (newItems.length === items.length) {
                            wData.items = newItems;
                            ret = true;
                        }
                    }
                });
            }
            return ret;
        };

        var getWidgetData = function(callback) {
            if (widgetData && widgetData.embedcontent) {
                processWidgetData(true, widgetData.embedcontent, callback);
            } else {
                sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
                    processWidgetData(success, data, callback);
                });
            }
        };
        
        var processWidgetData = function(success, data, callback){
            if (success) {
                wData = data;
                firstLoad = false;
                newItems = [];
                // get the item profile data
                for (var i = 0, j = data.items.length; i < j; i++) {
                    if (processWidget(data.items[i], data.items)) {
                        if ($.isFunction(callback)) {
                            callback(true);
                        }
                    }
                }
            } else {
                if ($.isFunction(callback)) {
                    callback(false);
                }
            }
        };

        // Bind Events
        $embedcontent_button_add_selected_content.bind("click", function() {
            doEmbed();
            return false;
        });

        $embedcontent_just_add.bind("click", function() {
            doEmbed();
        });

        $embedcontent_dont_add.bind("click", function() {
            sakai.api.Widgets.Container.informCancel(tuid, "embedcontent");
            return false;
        });

        $uploadContentLink.bind("click", function() {
            $(window).trigger("init.newaddcontent.sakai");
            return false;
        });

        var toggleTabs = function(target) {
            if (!isPreviewExist) {
                $("#embedcontent_name_checkbox").selected(true);
            }
            $("." + active_tab_class).removeClass(active_tab_class);
            $(target).parent("li").addClass(active_tab_class);
            $("." + active_content_class).hide();
            $("#" + $(target).attr("id") + "_content").addClass(active_content_class).show();
        };

        $embedcontent_tabs.find("li a").bind("click", function(e) {
            var tab = $(e.target).attr("id").split(tab_id_prefix)[1];
            if ($(e.target).parent("li").hasClass(active_tab_class)) {
                return false;
            } else {
                toggleTabs(e.target);
            }
            return false;
        });

        /**
         * Bind to a click on the display preview blocks
         * This should place an outline on the img and check the checkbox
         */
        $embedcontent_display_previews.bind("click", function(e) {
            if ($(this).find("input").attr("checked") === "checked") {
                return true;
            } else {
               $("#embedcontent_display_style img.selected", $rootel).removeClass('selected');
               $(this).find("input").attr("checked", "checked");
               $(this).find("img").addClass('selected');
               return true;
            }
        });

        $embedcontent_display_previews.find("a").bind("click", function(e) {
            // trigger the above event handler
            $(e.target).parent("span").parent("div").parent("div").trigger("click");
            return false;
        });

        $embedcontent_button_goto_display_settings.bind("click", function(e) {
            toggleTabs($("#embedcontent_tab_display"));
            return false;
        });

        /**
         * Bind to a change in the include checkboxes
         * This toggles the preview elements
         */
        $embedcontent_include_inputs.bind("change", function(e) {
            var which = $(this).attr("id").split("_")[1];
            if ($(this).attr("checked")) {
                $(".embedcontent_include_" + which).show();
            } else {
                $(".embedcontent_include_" + which).hide();
            }
        });

        $embedcontent_layout_options.bind("click", function(e) {
            if ($(this).find("input").attr("checked") === "checked") {
                return true;
            } else {
               $("#embedcontent_choose_layout img.selected", $rootel).removeClass('selected');
               $(this).find("input").attr("checked", "checked");
               $(this).find("img").addClass('selected');
               return true;
            }
        });

        var toggleAddTitleAndDescription = function(show) {
            if (show) {
                $embedcontent_add_title_description_button.find("span.s3d-button-arrow-down").removeClass("s3d-button-arrow-down").addClass("s3d-button-arrow-up");
                $embedcontent_add_title_description_fields.show();
            } else {
                $embedcontent_add_title_description_button.find("span.s3d-button-arrow-up").removeClass("s3d-button-arrow-up").addClass("s3d-button-arrow-down");
                $embedcontent_add_title_description_fields.hide();
            }
        };

        $embedcontent_add_title_description_button.bind("click", function(e) {
            toggleAddTitleAndDescription($(this).find("span.s3d-button-arrow-down").length > 0);
            return false;
        });

        $(window).unbind("complete.fileupload.sakai");
        $(window).bind("complete.fileupload.sakai", function(e, data) {
            var files = data.files;
            addChoicesFromFileUpload(files);
        });

        $(window).unbind("finished.pickeradvanced.sakai");
        $(window).bind("finished.pickeradvanced.sakai", function(e, data) {
            addChoicesFromPickeradvanced(data.toAdd);
        });

        $(window).unbind("ready.pickeradvanced.sakai");
        $(window).bind("ready.pickeradvanced.sakai", function(e) {
            $embedcontent_search_for_content.bind("click", function() {
                var pickerConfig = {
                    "type": "content"
                };
                if (embedConfig.limit) {
                    pickerConfig.limit = embedConfig.limit;
                }
                $(window).trigger("init.pickeradvanced.sakai", {"config": pickerConfig});
                return false;
            });
        });
        
        var renderDefaultContent = function(){
            $("#embedcontent_content", $rootel).html(sakai.api.Util.TemplateRenderer("embedcontent_content_html_template", {
                "showDefaultContent": true
            }));
        };

        var doInit = function() {
            getWidgetData(function(success) {
                if (showSettings) {
                    if (sakai_global.sitespages &&
                        sakai_global.sitespages.site_info &&
                        sakai_global.sitespages.site_info._pages &&
                        sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage] &&
                        sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageTitle"]) {

                        embedConfig.name = sakai_global.sitespages.site_info._pages[sakai_global.sitespages.selectedpage]["pageTitle"];
                    } else {
                        embedConfig.name = "";
                    }

                    renderSettings();
                    $embedcontent_settings.show();
                } else if (!success) {
                    renderDefaultContent();
                    $embedcontent_main_container.show();
                } else {
                    $embedcontent_main_container.show();
                    renderWidget();
                }
            });
        };

        doInit();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("embedcontent");
});
