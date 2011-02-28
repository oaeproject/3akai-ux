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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.threedots.js (ThreeDots)
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.mycontent
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
    sakai_global.mycontent = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // DOM identifiers
        var rootel = $("#" + tuid);
        var uploadLink = ".upload_link";
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
            // initialize parsed item with default values
            var item = {
                name: result["sakai:pooled-content-file-name"],
                path: "/p/" + result["jcr:name"],
                type: sakai.api.i18n.General.getValueForKey(sakai.config.MimeTypes.other.description),
                type_img_url: sakai.config.MimeTypes.other.URL,
				css_class: sakai.config.MimeTypes.other.cssClass,
                size: ""
            };

            // set the mimetype and corresponding image
            var type = result["mimeType"];
            if(sakai.config.MimeTypes[type]) {
                // we have a recognized file type - set the description and img URL
                item.type = sakai.api.i18n.General.getValueForKey(sakai.config.MimeTypes[type].description);
                item.type_img_url = sakai.config.MimeTypes[type].URL;
				item.css_class = sakai.config.MimeTypes[type].cssClass;
            }

            // set file name without the extension
            // be aware that links don't have an extension
            var lastDotIndex = result["sakai:pooled-content-file-name"].lastIndexOf(".");
            if(lastDotIndex !== -1) {
                if (type !== "x-sakai/link") {
                    // extension found
                    item.name = result["sakai:pooled-content-file-name"].slice(0, lastDotIndex);
                }
            }

            // set the file size
            if(result.hasOwnProperty("length") && result["length"]) {
                item.size = "(" + sakai.api.Util.convertToHumanReadableFileSize(result["length"]) + ")";
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
                    $(contentList, rootel).html(sakai.api.Util.TemplateRenderer($(listTemplate), contentjson));
                    $(contentList, rootel).show();

                    // make sure the newly added content is properly styled with
                    // threedots truncation
                    $(ellipsisContainer).css("width", $(ellipsisContainer).width() + "px");
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
            $(window).trigger("ready.mycontent.sakai");
        };


        ////////////////////
        // Event Handlers //
        ////////////////////

        // Clicking to upload content
        $(uploadLink, rootel).click(function(ev) {
            $(window).trigger("init.fileupload.sakai");
            return false;
        });

        // Listen for complete.fileupload.sakai event (from the fileupload widget)
        // to refresh this widget's file listing
        $(window).bind("complete.fileupload.sakai", function() {
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
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
            // get list of content items
            sakai.api.Server.loadJSON("/var/search/pool/me/manager-all.1.json",
                handleContentData, {
                    "sortOn": "created",
                    "sortOrder": "desc",
                    "page": "0",
                    "items": "5"
                }
            );
        };

        // run init() function when sakai.content object loads
        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("mycontent");
    
});
