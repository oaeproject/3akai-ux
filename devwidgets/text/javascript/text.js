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

var sakai = sakai || {};

/**
 * @name sakai.helloworld
 *
 * @class helloworld
 *
 * @description
 * Initialize the helloworld widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.text = function(tuid, showSettings) {

    var $rootel = $("#"+tuid),
        $text_main = $("#text_main", $rootel),
        $text_main_template = $("#text_main_template", $rootel),
        $text_settings = $("#text_settings", $rootel),
        $text_settings_template = $("#text_settings_template", $rootel),
        $text_save = $("#text_save", $rootel),
        $text_cancel = $("#text_cancel", $rootel);

    var widgetData = {title:"", text:""};


    $text_cancel.die("click");
    $text_cancel.live("click", function(e) {
        sakai.api.Widgets.Container.informCancel(tuid);
    });

    $text_save.die("click");
    $text_save.live("click", function(e) {
        widgetData.title = $("#text_title", $rootel).val();
        widgetData.text = $("#text_text", $rootel).val();
        sakai.api.Widgets.saveWidgetData(tuid, {data:widgetData}, function(success, data){
            sakai.api.Widgets.Container.informFinish(tuid, "text");
        });
    });

    var loadData = function(callback){
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
            if (success) {
                widgetData = data.data;
            }
            callback();
        });
    };

    var doInit = function(){
        loadData(function() {
            if (showSettings) {
                $text_settings.html(sakai.api.Util.TemplateRenderer($text_settings_template, {data:widgetData})).show();
            } else {
                if (widgetData.title) {
                    sakai.api.Widgets.changeWidgetTitle(tuid, widgetData.title);
                }
                $text_main.html(sakai.api.Util.TemplateRenderer($text_main_template, {data:widgetData})).show();
            }
        });
    };

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("text");