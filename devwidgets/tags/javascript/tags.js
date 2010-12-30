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
 * @name sakai.tags
 *
 * @class tags
 *
 * @description
 * Initialize the tags widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.tags = function(tuid, showSettings) {

    var $rootel = $("#"+tuid),
        $tags_main = $("#tags_main", $rootel),
        $tags_main_template = $("#tags_main_template", $rootel);

    var tagData = {};

    var generateTagCloud = function(){
        var newtags = [];
        // Filter out directory tags
        for (var i = 0; i < tagData.results[0].tags.length; i++) {
            if (tagData.results[0].tags[i].name.substring(0, 10) !== "directory/") {
                newtags.push(tagData.results[0].tags[i]);
            }
        }
        tagData.results[0].tags = newtags;
        // Sort the tags in alphabetical order so we can generate a tag cloud
        tagData.results[0].tags.sort(function(a, b){
            var nameA = a.name.toLowerCase();
            var nameB = b.name.toLowerCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        // Only show the first 20 tags
        var totalAdded = 0;
        newtags = [];
        for (var ii = 0; ii < tagData.results[0].tags.length; ii++) {
            if (totalAdded < 20) {
                newtags.push(tagData.results[0].tags[ii]);
                totalAdded++;
            }
        }
        tagData.results[0].tags = newtags;
        $tags_main.html($.TemplateRenderer($tags_main_template, {
            data: tagData
        })).show();
    };

    var loadData = function(directory, callback){
        if (directory) {
            /*$.ajax({
                url: "/var/search/public/tagcloud.json", // New feed in the backend
                cache: false,
                success: function(data){
                    tagData = data;
                    callback();
                }
            });*/
        }
        else {
            $.ajax({
                url: "/var/search/public/tagcloud.json",
                cache: false,
                success: function(data){
                    tagData = data;
                    callback();
                }
            });
        }
    };

    var doInit = function(){
        if (! sakai.api.Widgets.isOnDashboard(tuid)){
            $(".tags-widget-border").show();
            $("#tags_widget").addClass("fl-widget s3d-widget");
        }

        // If the widget is initialized on the directory page then listen to the event to catch specified tag results
        if (sakai.directory2 && sakai.directory2.getIsDirectory()) {
            loadData(true, generateTagCloud);
        }
        else {
            loadData(false, generateTagCloud);
        }
    };

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("tags");