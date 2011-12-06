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

    /**
     * @name sakai_global.contentpicker
     *
     * @class contentpicker
     *
     * @description
     * Initialize the contentpicker widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contentpicker = function(tuid, showSettings) {

        var $rootel = $("#" + tuid);

        var $contentpicker_dialog = $("#contentpicker_dialog", $rootel);
        var $contentpicker_page_name = $("#contentpicker_page_name", $rootel);
        var $contentpicker_placing_content_label = $("#contentpicker_placing_content_label", $rootel);
        var $contentpicker_share_files_with_label = $("#contentpicker_share_files_with_label", $rootel);
        var $contentpicker_place_content = $("#contentpicker_place_content", $rootel);
        var $contentpicker_cancel = $("#contentpicker_cancel", $rootel);
        var $contentpicker_content_input = $("#contentpicker_content_input", $rootel);
        var $contentpicker_search_for_content = $("#contentpicker_search_for_content", $rootel);

        var $contentpicker_page_name_template = $("#contentpicker_page_name_template", $rootel);
        var $contentpicker_new_item_template = $("#contentpicker_new_item_template", $rootel);

        var $fileuploadContainer = $("#fileupload_container", $rootel);
        var $uploadContentLink = $("#upload_content", $rootel);

        var selectedItems = [];
        var firstTime = true;
        var widgetData = false;

        var pickerConfig = {
            "mode": "picker",
            "name": "Page",
            "limit": false,
            "filter": false,
            "type": "choose"
        };

        /**
         * Render the embed screen
         */
        var render = function() {
            selectedItems = [];
            $contentpicker_share_files_with_label.hide();
            $contentpicker_placing_content_label.hide();
            if (pickerConfig.type && pickerConfig.type === "share") {
                $contentpicker_share_files_with_label.show();
            } else {
                $contentpicker_placing_content_label.show();
            }
            sakai.api.Util.TemplateRenderer($contentpicker_page_name_template, {"name": pickerConfig.name}, $contentpicker_page_name);

            if (firstTime) {
                setupAutoSuggest();
                firstTime = false;
            } else {
                doReset();
            }
            $("#as-values-" + tuid).val("");
            $(".as-selection-item").remove();
        };

        /**
         * Do a reset of the embed screen
         */
        var doReset = function() {
            sakai.api.Util.AutoSuggest.reset($contentpicker_content_input);
        };

        /**
         * Get the mimetype of a provided file
         * @param {Object} file File provided to get mimetype of
         */
        var getMimeType = function(file) {
            var mimetype = "";
            mimetype = file["_mimeType"] || "";
            return mimetype;
        };

        /**
         * Creates an object out of results provided
         * This object contains valuable information about the file like path, name, type,...
         * @param {Object} result results provided (eg through a search)
         * @param {Object} name optional name provided
         */
        var createDataObject = function(result, name) {
            var mimetype = getMimeType(result);
            var dataObj = {
                "value": name || result['_path'],
                "name": result['sakai:pooled-content-file-name'],
                "type": "file",
                "filetype": mimetype.split("/")[0],
                "mimetype": mimetype,
                "description": result["sakai:description"] || "",
                "path": "/p/" + (name || result['_path']),
                "fileSize": sakai.api.Util.convertToHumanReadableFileSize(result["_length"]),
                "link": "/p/" + (name || result['_path']) + "/" + result['sakai:pooled-content-file-name'],
                "extension": result['sakai:fileextension']
            };
            return dataObj;
        };

        /**
         * When typing in the suggest box this function is executed to provide the user with a list of possible autocompletions
         */
        var setupAutoSuggest = function() {
            var dataFn = function( query, add ) {
                var q = sakai.api.Server.createSearchString(query);
                var options = {"page": 0, "items": 15};
                var searchUrl = sakai.config.URL.POOLED_CONTENT_MANAGER;
                if (q === "*") {
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
                            if (pickerConfig.filter) {
                                if (dataObj.filetype !== pickerConfig.filter) {
                                    doAdd = false;
                                }
                            }
                            if (doAdd) {
                                suggestions.push(dataObj);
                            }
                        });
                        add( suggestions, query );
                    }
                }, options);
            };
            sakai.api.Util.AutoSuggest.setup($contentpicker_content_input,{
                asHtmlID: tuid,
                retrieveLimit: 10,
                selectionLimit: pickerConfig.limit,
                resultClick: function(data) {
                    selectedItems.push(data.attributes);
                    $contentpicker_place_content.removeAttr("disabled");
                },
                selectionRemoved: function(elem) {
                    removeItemFromSelected(elem.html().split("</a>")[1]); // get filename
                    elem.remove();
                    if (selectedItems.length === 0) {
                        $contentpicker_place_content.attr("disabled", "disabled");
                    }
                }
            }, false, dataFn);
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
            if (pickerConfig.limit && filesPicked && ($(".as-selection-item").length + filesPicked) > pickerConfig.limit) {
                $("#as-values-" + tuid).val('');
                $(".as-selection-item").remove();
            }
            if (filesPicked > 0) {
                $contentpicker_place_content.removeAttr("disabled");
            }
            $.each(files, function(i,val) {
                var newObj = createDataObject(val, val["_path"]);
                selectedItems.push(newObj);
                $contentpicker_content_input.autoSuggest.add_selected_item(newObj, newObj.value);
            });
            $("input#" + tuid).val('').focus();
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
                     selectedItems.push(newObj);
                     $contentpicker_content_input.autoSuggest.add_selected_item(newObj, newObj.value);
                 }
              });
          });
          $("input#" + tuid).val('').focus();
          $contentpicker_place_content.removeAttr("disabled");
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
            sakai.api.Server.batch(data, null, false);
        };

        /**
         * Fire the event to indicate the picker is done picking and
         * call the function that associates the content with this group
         */
        var finish = function() {
            // Associate embedded items with the group
            associatedEmbeddedItemsWithGroup(selectedItems);

            $(window).trigger("finished.contentpicker.sakai", {"items": selectedItems});
            $contentpicker_dialog.jqmHide();
        };

        // Bind Events
        $contentpicker_place_content.bind("click", function() {
            finish();
        });

        $contentpicker_cancel.bind("click", function() {
            $contentpicker_dialog.jqmHide();
        });

        $uploadContentLink.bind("click", function() {
            $(window).trigger("init.fileupload.sakai");
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

        $(window).unbind("init.contentpicker.sakai");
        $(window).bind("init.contentpicker.sakai", function(e, config) {

            // position dialog box at users scroll position
            var htmlScrollPos = $("html").scrollTop();
            var docScrollPos = $(document).scrollTop();
            if (htmlScrollPos > 0) {
                $contentpicker_dialog.css({"top": htmlScrollPos + 50 + "px"});
            } else if (docScrollPos > 0) {
                $contentpicker_dialog.css({"top": docScrollPos + 50 + "px"});
            }

            pickerConfig = $.extend(true, pickerConfig, config);
            render();
            $contentpicker_dialog.jqmShow();
        });

        $(window).unbind("ready.pickeradvanced.sakai");
        $(window).bind("ready.pickeradvanced.sakai", function(e) {
            $contentpicker_search_for_content.bind("click", function() {
                var pickerConfig = {
                    "type": "content"
                };
                if (pickerConfig.limit) {
                    pickerConfig.limit = pickerConfig.limit;
                }
                $(window).trigger("init.pickeradvanced.sakai", {"config": pickerConfig});
            });
        });

        $contentpicker_dialog.jqm({
            modal: true,
            overlay: 20,
            zIndex: 3000,
            toTop: true
        });

        var doInit = function() {
            $(window).trigger("ready.contentpicker.sakai");
            sakai.api.Widgets.widgetLoader.insertWidgets("#"+tuid);
        };

        doInit();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("contentpicker");
});
