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

var sakai = sakai || {};
sakai.widgets = sakai.widgets || {};
sakai.widgets.widgets = {};
sakai.qunit = sakai.qunit || {};
sakai.qunit.widgets = sakai.qunit.widgets || [];
sakai.qunit.widgetsdone = false;

$(function() {

/**
 * An array of all of the widgets in the system
 * NOTE: This has to be manually updated, so whenever you add a widget
 *       you must add it to this list
 */
var widgetList = [
    "activegroups",
    "addcontent",
    "addtocontacts",
    "basiclti",
    "captcha",
    "changepic",
    "chat",
    "comments",
    "contentcomments",
    "contentmetadata",
    "contentpicker",
    "contentpreview",
    "creategroup",
    "createpage",
    "dashboard",
    "deletecontent",
    "discussion",
    "displayprofilesection",
    "embedcontent",
    "entity",
    "faceted",
    "filerevisions",
    "fileupload",
    "footer",
    "ggadget",
    "googlemaps",
    "groupbasicinfo",
    "grouppermissions",
    "helloworld",
    "help",
    "joinrequests",
    "listgeneral",
    "listpeople",
    "listpeoplewrappergroup",
    "lists",
    "login",
    "mycontacts",
    "mycontent",
    "mygroups",
    "myprofile",
    "mysakai2",
    "navigation",
    "pickeradvanced",
    "pickeruser",
    "poll",
    "popularcontent",
    "profilesection",
    "recentmessages",
    "relatedcontent",
    "remotecontent",
    "rss",
    "sakai2favourites",
    "sakai2tools",
    "sendmessage",
    "sharecontent",
    "sitemembers",
    "siterecentactivity",
    "sites",
    "sitespages",
    "tags",
    "text",
    "topnavigation",
    "uploadcontent",
    "userprofile",
    "video"
];


/**
 * Grab all the widget config files
 *
 * This does the same thing as /var/widgets.json does, but 
 * since we have to be able to do this without a sever, we recreate
 * the effect here
 */
 
var loadWidgets = function() {
    sakai.qunit.allJSFiles = $.merge([], sakai.qunit.devJsFiles);
    sakai.qunit.allHtmlFiles = $.merge([], sakai.qunit.devHtmlFiles);
    for (var i=0, j=widgetList.length; i<j; i++) {
        var widget = widgetList[i];

        (function(widgetName) {
            var widgetJS = "/devwidgets/" + widgetName + "/javascript/" + widgetName + ".js",
                widgetHTML = false;
            $.ajax({
                url: "/devwidgets/" + widgetName + "/config.json",
                async: false,
                type: "json",
                success: function(data) {
                    try {
                        data = $.parseJSON(data);
                    } catch (e) {
                        console.error(widgetName + " has an error in its json");
                    }
                    sakai.widgets.widgets[widgetName] = data;
                    widgetHTML = sakai.widgets.widgets[widgetName].url;
                    sakai.qunit.widgets.push({name:widgetName, html: widgetHTML, js: widgetJS});
                    if (widgetList.length === sakai.qunit.widgets.length) {
                        sakai.qunit.widgetsdone = true;
                        $(window).trigger("sakai-qunit-widgetsdone");
                    }
                }
            });
        })(widget);
    }
};

if (sakai.qunit.devfilesdone) {
    loadWidgets();
} else {
    $(window).bind("sakai-qunit-devfilesdone", function() {
        loadWidgets();
    });
}

});