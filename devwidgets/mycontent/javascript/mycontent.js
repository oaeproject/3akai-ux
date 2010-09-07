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
/*global $, Config, jQuery, sakai */

/**
 * @name sakai.mycontent
 *
 * @class mycontent
 *
 * @description
 * The 'My Content' widget shows the five most recently updated
 * content items the user manages.
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.mycontent = function(tuid, showSettings) {


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    // DOM identifiers
    var rootel = $("#" + tuid);
    var uploadLink = "#upload_link";
    var fileuploadContainer = "#fileupload_container";
    var noContentMsg = "#mycontent_nocontent";
    var dataErrorMsg = "#mycontent_data_error";
    var contentList = "#mycontent_list";
    var listTemplate = "#mycontent_list_template";
    var ellipsisContainer = ".mycontent_ellipsis_container";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Parses an individual JSON search result (returned from the
     * /var/search/pool/me/manager.json data feed) to be displayed in
     * mycontent.html.
     * @param {Object} result - individual result object from JSON data feed
     * @return {Object} object containing item.name, item.path, item.type (mimetype)
     *   and item.type_img_url (URL for mimetype icon) for the given result
     */
    var parseDataResult = function(result) {
        // initialize parsed item
        var item = {
            name: result["sakai:pooled-content-file-name"],
            path: "/p/" + result["jcr:name"],
            type: sakai.config.MimeTypes.other.description,
            type_img_url: sakai.config.MimeTypes.other.URL
        };

        // determine mimetype if extension present
        var file_parts = result["sakai:pooled-content-file-name"].split(".");
        if (file_parts.length > 1) {
            // inspect the extension
            var ext = file_parts[file_parts.length - 1];
            var type = "";
            switch (ext.toLowerCase()) {
                case "doc":
                case "pdf":
                    type = "application/" + ext;
                    break;
                case "png":
                case "gif":
                    type = "image/" + ext;
                    break;
                case "jpg":
                case "jpeg":
                    type = "image/jpeg";
                    break;
                case "txt":
                    type = "text/plain";
                    break;
                case "html":
                    type = "text/html";
                    break;
                default:
                    type = "other";
            }
            item.type = sakai.config.MimeTypes[type].description;
            item.type_img_url = sakai.config.MimeTypes[type].URL;

            // set file name without the extension
            var tmp_name = "";
            for (var i = 0; i < file_parts.length - 1; i++) {
                tmp_name = tmp_name + file_parts[i] + ".";
            }
            item.name = tmp_name.substr(0, tmp_name.length - 1);
        }

        return item;
    };

    /**
     * This AJAX callback function handles the search result data returned from
     * /var/search/pool/me/manager.json.  If the call was successful, up to 5 of
     * the most recently created files are presented to the user.
     * @param {Object} success - indicates the status of the AJAX call
     * @param {Object} data - JSON data from /var/search/pool/me/manager.json
     * @return None
     */
    var handleContentData = function(success, data) {
        //alert("json returned: " + JSON.stringify(data));
        if(success) {
            // parse & render data
            if(data.total < 1) {
                // user manages no content
                $(noContentMsg, rootel).show();
            } else {
                // user manages content
                $(noContentMsg, rootel).hide();
                // build array of up to five items; reverse chronological order
                var contentjson = {
                    items: []
                };
                for(var i = 0; i < data.total && i < 5; i++) {
                    contentjson.items.push(parseDataResult(data.results[i]));
                }
                // pass the array to HTML view
                $(contentList, rootel).html($.TemplateRenderer($(listTemplate), contentjson));
                $(contentList, rootel).show();

                // make sure the newly added content is properly styled with
                // threedots truncation
                $(ellipsisContainer, rootel).ThreeDots({
                    max_rows: 1,
                    text_span_class: "mycontent_ellipsis_text",
                    e_span_class: "mycontent_e_span_class",
                    whole_word: false,
                    alt_text_t: true
                });
            }
        } else {
            // display something useful to the user
            $(dataErrorMsg, rootel).show();
        }
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    // Clicking to upload content
    $(uploadLink, rootel).click(function(ev) {
        $(fileuploadContainer, rootel).show();
        sakai.fileupload.initialise();
        return false;
    });

    // Listen for sakai-fileupload-complete event (from the fileupload widget)
    // to refresh this widget's file listing
    $(window).bind("sakai-fileupload-complete", function() {
        init();
    });


    /////////////////////////////
    // Initialization function //
    /////////////////////////////

    /**
     * Initiates fetching content data to be displayed in the My Content widget
     * @return None
     */
    var init = function() {
        // get list of content items
        sakai.api.Server.loadJSON("/var/search/pool/me/manager.json",
            handleContentData, {
                "q": "*",
                "sortOn": "jcr:created",
                "sortOrder": "descending",
                "page": "0",
                "items": "5"
            }
        );
    };

    // run init() function when sakai.content object loads
    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("mycontent");
