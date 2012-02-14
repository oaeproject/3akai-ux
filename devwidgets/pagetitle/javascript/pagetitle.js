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

// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {
     
    /**
     * @name sakai.pagetitle
     *
     * @class pagetitle
     *
     * @description
     * WIDGET DESCRIPTION
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.pagetitle = function (tuid, showSettings, widgetData) {

        var $rootel = $("#" + tuid);
        var $textarea = $("textarea", $rootel).attr("name", tuid);

        var autoSavePoll = false;
        var lastData = "";
        if (widgetData && widgetData.pagetitle){
            lastData = widgetData.pagetitle.content;
        }

        var startAutosave = function(){
            // Start the autosave
            if (autoSavePoll){
                clearInterval(autoSavePoll);
                autoSavePoll = false;
            }
            autoSavePoll = setInterval(function(){
                autoSave();
            }, 5000);
        };

        $(window).bind("save.contentauthoring.sakai", function(){
            if ($rootel.is(":visible")) {
                autoSave();
                var currentText = $textarea.val();
                $("#pagetitle_view_container", $rootel).text(currentText);
            }
        });

        var autoSave = function(){
            var currentText = $textarea.val();
            if (currentText !== lastData){
                lastData = currentText;
                sakai.api.Widgets.saveWidgetData(tuid, {"content": currentText});
            }
        };

        $textarea.bind("focus", function(){
            $(".contentauthoring_cell_element_actions").hide();
            $("#inserterbar_tinymce_container").hide();
        });

        var updateHeight = function(){
            $textarea.height("28px");
            $textarea.height($textarea[0].scrollHeight);
        };
        $textarea.bind("keyup", updateHeight);
        $(window).bind("resize.contentauthoring.sakai", function(){
            updateHeight();
        });

        /**
         * Initialization function
         */
        var doInit = function () {
            if (widgetData && widgetData.pagetitle) {
                var processedContent = sakai.api.i18n.General.process(widgetData.pagetitle.content);
                $("#pagetitle_view_container", $rootel).text(processedContent);
                // Fill up the textarea
                $textarea.val(widgetData.pagetitle.content);
            }
            $textarea.css("height", $("#pagetitle_view_container", $rootel).height());
            if ($textarea.is(":visible")){
                $textarea.focus()
            };
            startAutosave();
        };
        
        // run the initialization function when the widget object loads
        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("pagetitle");
});
