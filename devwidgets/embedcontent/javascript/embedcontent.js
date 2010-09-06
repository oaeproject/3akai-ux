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

    var $embedcontent_alternative_display_name_value = $("#embedcontent_alternative_display_name_value", $rootel);
    var $embedcontent_description_value = $("#embedcontent_description_value", $rootel);

    var $embedcontent_page_name_template = $("#embedcontent_page_name_template", $rootel);
    var $embedcontent_display_options_select_template = $("#embedcontent_display_options_select_template", $rootel);
    var $embedcontent_content_html_template = $("#embedcontent_content_html_template", $rootel);

    var selectedItems = [];
    var firstTime = true;

    var render = function(pageName) {
        selectedItems = [];        
        $.TemplateRenderer($embedcontent_page_name_template, {"name": sakai.api.Security.saneHTML(pageName)}, $embedcontent_page_name);
        if (firstTime) {
            setupAutoSuggest();
            firstTime = false;
        } else {
            doReset();
        }
    };

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

    var getMimeType = function(file) {
        var mimetype = "";
        mimetype = file["jcr:content"] ? file["jcr:content"]["jcr:mimeType"] : "";
        return mimetype;
    };

    var setupAutoSuggest = function() {
        $embedcontent_content_input.autoSuggest("",{
            source: function(query, add) {
                searchUrl = sakai.config.URL.POOLED_CONTENT_MANAGER;
                sakai.api.Server.loadJSON(searchUrl.replace(".json", ""), function(success, data){
                    if (success) {
                        var suggestions = [];
                        $.each(data.results, function(i) {
                            var mimetype = getMimeType(data.results[i]);
                            var dataObj = {
                                "value": data.results[i]['jcr:name'], 
                                "name": data.results[i]['sakai:pooled-content-file-name'], 
                                "type": "file", 
                                "filetype": mimetype.split("/")[0], 
                                "mimetype": mimetype, 
                                "description": data.results[i]["sakai:description"],
                                "path": "/p/" + data.results[i]['jcr:name'],
                                "fileSize": sakai.api.Util.convertToHumanReadableFileSize(data.results[i]["jcr:content"][":jcr:data"]),
                                "link": "/p/" + data.results[i]['jcr:name'] + "/" + data.results[i]['sakai:pooled-content-file-name']
                            };
                            suggestions.push(dataObj);
                        });
                        add(suggestions);
                    } else {

                    }
                }, {"q": "*" + query + "*"});
            },
            asHtmlID: tuid,
            selectedItemProp: "name",
            searchObjProps: "name",
            resultClick: function(data) {
                selectedItems.push(data.attributes);
                $embedcontent_display_options.show();
            },
            selectionRemoved: function(elem) {
                removeItemFromSelected(elem.html().split("</a>")[1]); // get filename
                elem.remove();
                if (selectedItems.length === 0) {
                    $embedcontent_display_options.hide();
                    $embedcontent_metadata_container.hide();
                }
            }
        });
    };

    var removeItemFromSelected = function(fileName) {
        var newItems = [];
        $(selectedItems).each(function(i, val) {
           if (val.name !== fileName) {
               newItems.push(val);
           }
        });
        selectedItems = newItems;
    };

    var doEmbed = function() {
        var embedContentHTML = "";
        var objectData = {
            "embedmethod": $embedcontent_display_options_select.find("option:selected").val(),
            "title": $embedcontent_alternative_display_name_value.val(),
            "description": $embedcontent_description_value.val(),
            "items": selectedItems
        };
        embedContentHTML = $.TemplateRenderer($embedcontent_content_html_template, objectData);
        console.log(embedContentHTML);
        tinyMCE.get('elm1').execCommand("mceInsertContent", true, embedContentHTML);
    };

    // Bind Events
    $embedcontent_place_content.bind("click", function() {
        doEmbed();
        $embedcontent_dialog.jqmHide();
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

    $(window).bind("sakai-embedcontent-init", function(e, name) {
        render(name);
        $embedcontent_dialog.jqmShow();
    });

    $embedcontent_dialog.jqm({
        modal: true,
        overlay: 20,
        toTop: true
    });


    var doInit = function() {
        $(window).trigger("sakai-embedcontent-ready");
    };

    doInit();
}
sakai.api.Widgets.widgetLoader.informOnLoad("embedcontent");