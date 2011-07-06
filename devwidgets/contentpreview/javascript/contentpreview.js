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
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai.contentpreview
     *
     * @class contentpreview
     *
     * @description
     * Initialize the contentpreview widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contentpreview = function(tuid,showSettings){

        var obj = {};
        obj.type = "showpreview";

        var qs = new Querystring();

        var determineDataType = function(){
            hidePreview();
            obj.type = "showpreview";
            obj.buttons = "default";
            var callback = null;
            var mimeType = sakai.api.Content.getMimeType(sakai_global.content_profile.content_data.data);
            if (qs.get("nopreview") === "true"){
                callback = renderDefaultPreview;
                obj.type = "default";
            } else if (mimeType === "x-sakai/link"){
                obj.buttons = "links";
            }
            if (sakai.api.Content.hasPreview(sakai_global.content_profile.content_data.data)) {
                callback = renderFullSizePreview;
            } else {
                obj.type = "default";
                callback = renderDefaultPreview;
            }
            obj.sakai = sakai;
            sakai.api.Util.TemplateRenderer("contentpreview_widget_main_template", obj, $("#contentpreview_widget_main_container"));
            callback();
        };

        var renderFullSizePreview = function(){
            var sakData = sakai_global.content_profile.content_data;
            var fullSizeContainer = $("#contentpreview_fullsize_preview");
            sakai.api.Util.TemplateRenderer($("#contentpreview_fullsize_template"), {}, fullSizeContainer);
            sakai.api.Widgets.widgetLoader.insertWidgets(fullSizeContainer, false, false, [{cpFullSizePreview:sakData}]);
        };

        var renderDefaultPreview = function(){
            //Nothing really, it's all part of the template
        };

        var hidePreview = function(){
            $("#contentpreview_widget_main_container").html("");
            $("#contentpreview_image_preview").html("");
        };

        $(window).bind("start.contentpreview.sakai", function(){
            determineDataType();
        });

        $(window).bind("updated.version.content.sakai",function() {
            determineDataType();
        });

        // Indicate that the widget has finished loading
        sakai_global.contentpreview.isReady = true;
        $(window).trigger("ready.contentpreview.sakai", {});

    };
    
    sakai.api.Widgets.widgetLoader.informOnLoad("contentpreview");
});
