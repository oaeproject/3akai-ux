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
 * @name sakai.embedcontent
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
sakai.embedcontent = function(tuid, showSettings) {
    
    var $rootel = $("#" + tuid);

    var $embedcontent_dialog = $("#embedcontent_dialog", $rootel);
    var $embedcontent_page_name = $("#embedcontent_page_name", $rootel);
    var $embedcontent_place_content = $("#embedcontent_place_content", $rootel);
    var $embedcontent_cancel = $("#embedcontent_cancel", $rootel);
    var $embedcontent_content_input = $("#embedcontent_content_input", $rootel);
    var $embedcontent_display_options = $("#embedcontent_display_options", $rootel);
    var $embedcontent_display_options_select = $("#embedcontent_display_options_select", $rootel);
    var $embedcontent_metadata_container = $("#embedcontent_metadata_container", $rootel);
    var $embedcontent_metadata = $("#embedcontent_metadata", $rootel);
    var $embedcontent_search_for_content = $("#embedcontent_search_for_content", $rootel);

    var $embedcontent_alternative_display_name_value = $("#embedcontent_alternative_display_name_value", $rootel);
    var $embedcontent_description_value = $("#embedcontent_description_value", $rootel);

    var $embedcontent_page_name_template = $("#embedcontent_page_name_template", $rootel);
    var $embedcontent_display_options_select_template = $("#embedcontent_display_options_select_template", $rootel);
    var $embedcontent_content_html_template = $("#embedcontent_content_html_template", $rootel);
    var $embedcontent_new_item_template = $("#embedcontent_new_item_template", $rootel);

    var $fileuploadContainer = $("#fileupload_container", $rootel);

    var selectedItems = [];
    var firstTime = true;

    var embedConfig = {
        "mode": "embed", // can be 'embed' or 'picker'
        "name": "Page",
        "limit": false,
        "filter": false
    };

    /**
     * Render the embed screen
     */
    var render = function() {
        selectedItems = [];        
        $.TemplateRenderer($embedcontent_page_name_template, {"name": embedConfig.name}, $embedcontent_page_name);
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
        $("#as-values-" + tuid).val("");
        $(".as-selection-item").remove();
        $embedcontent_display_options.hide();
        $embedcontent_metadata_container.hide();
        $embedcontent_display_options_select.find("option:selected").removeAttr("selected");
        $embedcontent_display_options_select.find("#show_content_only").attr("selected", "selected");
        $embedcontent_alternative_display_name_value.val('');
        $embedcontent_description_value.val('');
    };

    /**
     * Get the mimetype of a provided file
     * @param {Object} file File provided to get mimetype of
     */
    var getMimeType = function(file) {
        var mimetype = "";
        mimetype = file["jcr:content"] ? file["jcr:content"]["jcr:mimeType"] : "";
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
            "value": name || result['jcr:name'],
            "name": result['sakai:pooled-content-file-name'],
            "type": "file",
            "filetype": mimetype.split("/")[0],
            "mimetype": mimetype,
            "description": result["sakai:description"] || "",
            "path": "/p/" + (name || result['jcr:name']),
            "fileSize": sakai.api.Util.convertToHumanReadableFileSize(result["jcr:content"][":jcr:data"]),
            "link": "/p/" + (name || result['jcr:name']) + "/" + result['sakai:pooled-content-file-name'],
            "extension": result['sakai:fileextension']
        };
        return dataObj;
    };

    /**
     * When typing in the suggest box this function is executed to provide the user with a list of possible autocompletions
     */
    var setupAutoSuggest = function() {
        $embedcontent_content_input.autoSuggest("",{
            source: function(query, add) {
                searchUrl = sakai.config.URL.POOLED_CONTENT_MANAGER;
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
                    } else {

                    }
                }, {"q": "*" + query.replace(/\s+/g, "* OR *") + "*", "page": 0, "items": 15});
            },
            retrieveLimit: 10,
            asHtmlID: tuid,
            selectedItemProp: "name",
            searchObjProps: "name",
            selectionLimit: embedConfig.limit,
            resultClick: function(data) {
                selectedItems.push(data.attributes);
                showDisplayOptions();
                $embedcontent_place_content.removeAttr("disabled");
            },
            selectionRemoved: function(elem) {
                removeItemFromSelected(elem.html().split("</a>")[1]); // get filename
                elem.remove();
                if (selectedItems.length === 0) {
                    $embedcontent_place_content.attr("disabled", "disabled");
                    $embedcontent_display_options.hide();
                    $embedcontent_metadata_container.hide();
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
        if (filesPicked > 0) {
            $embedcontent_place_content.removeAttr("disabled");
        }
        $.each(files, function(i,val) {
            var newObj = createDataObject(val, val["jcr:name"]);
            selectedItems.push(newObj);
            $embedcontent_content_input.autoSuggest.add_selected_item(newObj, newObj.value);
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
                 $embedcontent_content_input.autoSuggest.add_selected_item(newObj, newObj.value);
             }
          });
      });
      $("input#" + tuid).val('').focus();
      $embedcontent_place_content.removeAttr("disabled");
    };

    /**
     * Shows the options the user has for displaying the content
     */
    var showDisplayOptions = function() {
        if (embedConfig.mode === "embed") {
            $embedcontent_display_options.show();
        }
    };

    /**
     * Once the content has been placed on the page it has to be associated with the group
     * The group is set as a viewer of the content
     * @param {Object} embeddedItems Array of object containing information about the selected items. Only the path variable is used.
     */
    var associatedEmbeddedItemsWithGroup = function(embeddedItems){
        var data = [];
        for (var embeddedItem in embeddedItems) {
            var item = {
                "url": embeddedItems[embeddedItem].path + ".members.json",
                "method": "POST",
                "parameters": {
                    ":viewer": sakai.currentgroup.id
                }
            };
            data[data.length] = item;
        }

        $.ajax({
            url: sakai.config.URL.BATCH,
            traditional: true,
            type: "POST",
            cache: false,
            data: {
                requests: $.toJSON(data)
            }
        });
    };

        var registerVideo = function(videoBatchData){
            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                cache: false,
                data: {
                    requests: $.toJSON(videoBatchData)
                }
            });
        }

    /**
     * Embed the selected content on the page,
     * Call the function that associates the content with this group
     */
    var doEmbed = function() {
        var embedContentHTML = "";
        var objectData = {
            "embedmethod": $embedcontent_display_options_select.find("option:selected").val(),
            "title": $embedcontent_alternative_display_name_value.val(),
            "description": $embedcontent_description_value.val(),
            "items": selectedItems
        };

        var videoBatchData = [];
        for (var i in objectData.items){
            if(objectData.items.hasOwnProperty(i)){
                if(objectData.items[i].filetype === "video"){
                    // Set random ID to the video
                    objectData.items[i].uId = Math.ceil(Math.random() * 999999999);
                    // Create batch request data for the video
                    var item = {
                        "url": "/~" + sakai.currentgroup.data.authprofile["sakai:group-title"] + "/pages/_widgets/id" + objectData.items[i].uId + "/video",
                        "method": "POST",
                        "parameters": {
                            "uid": sakai.data.me.user.userid,
                            "source": " ",
                            "URL": sakai.config.SakaiDomain + objectData.items[i].link + objectData.items[i].extension,
                            "selectedvalue": "video_noSource",
                            "isYoutube": false,
                            "isSakaiVideoPlayer": false
                        }
                    }
                    videoBatchData.push(item);
                }
            }
        }

        // Associate embedded items with the group
        associatedEmbeddedItemsWithGroup(selectedItems);

        registerVideo(videoBatchData);

        if (embedConfig.mode === "embed") {
            if ($embedcontent_metadata_container.is(":visible")) {
                var isValid = $embedcontent_metadata.valid();
                if (isValid) {
                    embedContentHTML = $.TemplateRenderer($embedcontent_content_html_template, objectData);
                    tinyMCE.get('elm1').execCommand("mceInsertContent", true, embedContentHTML);
                    return true;
                }
            } else {
                embedContentHTML = $.TemplateRenderer($embedcontent_content_html_template, objectData);
                tinyMCE.get('elm1').execCommand("mceInsertContent", true, embedContentHTML);
                return true;
            }
        } else if (embedConfig.mode === "picker") {
            $(window).trigger("sakai-embedcontent-picker-finished", {"items": selectedItems});
            return true;
        }
        return false;
    };

    // Bind Events
    $embedcontent_place_content.bind("click", function() {
        if (doEmbed()) {
            $embedcontent_dialog.jqmHide();
        }
    });

    $embedcontent_cancel.bind("click", function() {
        $embedcontent_dialog.jqmHide();
    });

    $embedcontent_display_options_select.bind("change", function(e) {
        if ($embedcontent_display_options_select.find("option:selected").val() === "show_content_and_description") {
            $embedcontent_metadata_container.show();
        } else {
            $embedcontent_metadata_container.hide();
        }
    });

    $(window).unbind("sakai-fileupload-complete");
    $(window).bind("sakai-fileupload-complete", function(e, data) {
        var files = data.files;
        addChoicesFromFileUpload(files);
        showDisplayOptions();
    });

    $(window).unbind("sakai-pickeradvanced-finished");
    $(window).bind("sakai-pickeradvanced-finished", function(e, data) {
        addChoicesFromPickeradvanced(data.toAdd);
        showDisplayOptions();
    });

    $(window).unbind("sakai-embedcontent-init");
    $(window).bind("sakai-embedcontent-init", function(e, config) {
        embedConfig = $.extend(true, embedConfig, config);
        render();
        $embedcontent_dialog.jqmShow();
    });

    $(window).unbind("sakai-pickeradvanced-ready");
    $(window).bind("sakai-pickeradvanced-ready", function(e) {
        $embedcontent_search_for_content.bind("click", function() {
            var pickerConfig = {
                "type": "content"
            };
            if (embedConfig.limit) {
                pickerConfig.limit = embedConfig.limit;
            }
            $(window).trigger("sakai-pickeradvanced-init", {"config": pickerConfig});
        });
    });

    $embedcontent_dialog.jqm({
        modal: true,
        overlay: 20,
        zIndex: 3000,
        toTop: true
    });

    $embedcontent_metadata.validate();

    var doInit = function() {
        $(window).trigger("sakai-embedcontent-ready");
        sakai.api.Widgets.widgetLoader.insertWidgets("#"+tuid);
    };

    doInit();
};
sakai.api.Widgets.widgetLoader.informOnLoad("embedcontent");