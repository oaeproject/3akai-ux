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
    var nocontentMsg = "#mycontent_nocontent";
    var contentList = "#mycontent_list";
    var listTemplate = "#mycontent_list_template";


    ///////////////////////
    // Utility functions //
    ///////////////////////

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
    }

    var handleContentData = function(success, data) {
        if(success) {
            // parse & render data
            if(data.total < 1) {
                // user manages no content
                $(nocontentMsg, rootel).show();
            } else {
                // build array of up to five items; reverse chronological order
                var contentjson = {
                    items: []
                };
                for(var i = data.total - 1; i >= data.total - 5 && i >= 0; i--) {
                    contentjson.items.push(parseDataResult(data.results[i]));
                }
                // pass the array to HTML view
                $(contentList, rootel).html($.TemplateRenderer($(listTemplate), contentjson));
                $(contentList, rootel).show();
            }
        } else {
            // data load failed - log error
            alert('data load failed.');

            // display something useful to the user
        }
    }


    ////////////////////
    // Event Handlers //
    ////////////////////

    // Clicking to upload content
    $(uploadLink, rootel).click(function(ev){
        $(fileuploadContainer, rootel).show();
        sakai.fileupload.initialise();
        return false;
    });


    /////////////////////////////
    // Initialization function //
    /////////////////////////////

    var init = function() {
        // get list of content items
        sakai.api.Server.loadJSON("/var/search/pool/me/manager.json",
            handleContentData, {"q": "*"});
    };

    // run init() function when sakai.content object loads
    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("mycontent");
