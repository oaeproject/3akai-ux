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
 * @name sakai.siterecentactivity
 *
 * @class siterecentactivity
 *
 * @description
 * Initialize the siterecentactivity widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.siterecentactivity = function(tuid, showSettings){

    var count = 5;
    var rootel = $("#" + tuid);

    var siterecentactivityContainer = "#siterecentactivity_container";
    var siterecentactivityContainerTemplate = "siterecentactivity_container_template";


    /////////////////////
    // RECENT ACTIVITY //
    /////////////////////

    /**
     * Render the sakai recentactivity
     */
    sakai.siterecentactivity.render = function(){
        if(sakai.siterecentactivity.recentactivity){
            for (i = 0, j = sakai.siterecentactivity.recentactivity.items.length; i < j; i++) {

                sakai.siterecentactivity.recentactivity.items[i].page_url = "/sites/" + sakai.siterecentactivity.recentactivity.items[i].site_id + "#page=" + sakai.siterecentactivity.recentactivity.items[i].page_id;

                sakai.siterecentactivity.recentactivity.items[i].date_parsed = humane_date(sakai.siterecentactivity.recentactivity.items[i].date+ "Z");

                //if (sakai.site.site_info._pages[sakai.siterecentactivity.recentactivity.items[i].page_id]) {
                //    sakai.siterecentactivity.recentactivity.items[i].page_title = sakai.site.site_info._pages[sakai.siterecentactivity.recentactivity.items[i].page_id]["pageTitle"];
                //} else {
                //     sakai.siterecentactivity.recentactivity.items[i].page_title = sakai.siterecentactivity.recentactivity.items[i].page_id;
                //}

            }

            // We reverse the array to see the most recent item on top of the list
            var reversedItems = {
                "items" : sakai.siterecentactivity.recentactivity.items.reverse()
            };

            // Render the recent sites
            $(siterecentactivityContainer).html($.TemplateRenderer(siterecentactivityContainerTemplate, reversedItems));
        }else{
            sakai.siterecentactivity.getRecentActivity(sakai.siterecentactivity.render);
        }
    };

    /**
     * Get the recent activity from a file
     * @param {Object} callback Callback function that will be executed
     */
    sakai.siterecentactivity.getRecentActivity = function(callback){

        sakai.api.Server.loadJSON("/~" + sakai.data.me.user.userid + "/private/recentactivity", function(success, data) {
            if (success) {
                sakai.siterecentactivity.recentactivity = data;
            }
            else {
                sakai.siterecentactivity.recentactivity = {
                    items: []
                };
            }
            callback(success, data);
        });
    };

    /**
     * Save the recentactivity of a site to a file in JCR
     * and render the feed when is was successful
     */
    var saveRecentActivity = function(){

        // Save the recentactivity json file
        sakai.api.Server.saveJSON("/~" + sakai.data.me.user.userid + "/private/recentactivity", sakai.siterecentactivity.recentactivity, sakai.siterecentactivity.render());
    };


    /**
     * Save a item to the recent activities file
     * @param {Object} activityitem A JSON object in the following format:
     * {
     *     "user_id" : "admin",
     *     "date" : "2009-10-12T10:25:19Z",
     *     "page_id" : "test",
     *     "type" : "page_create"
     * }
     */
    sakai.siterecentactivity.addRecentActivity = function(activityitem){

        // Check whether the activity item is actually an object
        if($.isPlainObject(activityitem)){

            // Set the date of the activity
            activityitem.date = sakai.api.Util.createSakaiDate();

            // Construct the callback function
            var callback = function(){

                // Add the current activity item to the array of activity items
                sakai.siterecentactivity.recentactivity.items.push(activityitem);

                // If the number of recent activity items exceeds a specific number, remove the other ones
                if(sakai.siterecentactivity.recentactivity.items.length > count){
                    var count_remove = sakai.siterecentactivity.recentactivity.items.length - count;

                    sakai.siterecentactivity.recentactivity.items.splice(0, count_remove);
                }

                // Save the recent activity to a file in JCR
                saveRecentActivity();
            };

            // Get the recent activity
            sakai.siterecentactivity.getRecentActivity(callback);

        }

    };

    ///////////////////////
    // Initial functions //
    ///////////////////////

    $("#siterecentactivity_settings_submit",rootel).click(function(){
        sakai.api.Widgets.Container.informFinish(tuid, "siterecentactivity");
    });
    $("#siterecentactivity_settings_cancel",rootel).click(function(){
        sakai.api.Widgets.Container.informCancel(tuid, "siterecentactivity");
    });

    // Hide or show the settings
    if (showSettings){
        $("#siterecentactivity_output",rootel).hide();
        $("#siterecentactivity_settings",rootel).show();
    } else {
        $("#siterecentactivity_settings",rootel).hide();
        $("#siterecentactivity_output",rootel).show();
    }

    sakai.siterecentactivity.render();



    /*
     * Javascript Humane Dates
     * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
     * Re-write by Zach Leatherman (zachleat.com)
     *
     * Adopted from the John Resig's pretty.js
     * at http://ejohn.org/blog/javascript-pretty-date
     * and henrah's proposed modification
     * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
     *
     * Licensed under the MIT license.
     */

    var humane_date = function(date_str){
        var time_formats = [
            [60, 'Just Now'],
            [90, '1 Minute'], // 60*1.5
            [3600, 'Minutes', 60], // 60*60, 60
            [5400, '1 Hour'], // 60*60*1.5
            [86400, 'Hours', 3600], // 60*60*24, 60*60
            [129600, '1 Day'], // 60*60*24*1.5
            [604800, 'Days', 86400], // 60*60*24*7, 60*60*24
            [907200, '1 Week'], // 60*60*24*7*1.5
            [2628000, 'Weeks', 604800], // 60*60*24*(365/12), 60*60*24*7
            [3942000, '1 Month'], // 60*60*24*(365/12)*1.5
            [31536000, 'Months', 2628000], // 60*60*24*365, 60*60*24*(365/12)
            [47304000, '1 Year'], // 60*60*24*365*1.5
            [3153600000, 'Years', 31536000], // 60*60*24*365*100, 60*60*24*365
            [4730400000, '1 Century'] // 60*60*24*365*100*1.5
        ];

        var time = ('' + date_str).replace(/-/g,"/").replace(/[TZ]/g," "),
            dt = new Date(),
            seconds = ((dt - new Date(time) + (dt.getTimezoneOffset() * 60000)) / 1000),
            token = ' Ago',
            i = 0,
            format;

        if (seconds < 0) {
            seconds = Math.abs(seconds);
            token = '';
        }
        format = time_formats[0];
        while (format) {
            if (seconds < format[0]) {
                if (format.length == 2) {
                    return format[1] + (i > 1 ? token : ''); // Conditional so we don't return Just Now Ago
                } else {
                    return Math.round(seconds / format[2]) + ' ' + format[1] + (i > 1 ? token : '');
                }
            }
            format = time_formats[i++];
        }

        // overflow for centuries
        if(seconds > 4730400000) {
            return Math.round(seconds / 4730400000) + ' Centuries' + token;
        }

        return date_str;
    };

    if(typeof $ != "undefined") {
        $.fn.humane_dates = function(){
            return this.each(function(){
                var date = humane_date(this.title);
                if(date && $(this).text() != date) {// don't modify the dom if we don't have to
                    $(this).text(sakai.api.Security.saneHTML(date));
                }
            });
        };
    }

};

sakai.api.Widgets.widgetLoader.informOnLoad("siterecentactivity");