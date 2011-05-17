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
require(["jquery", "sakai/sakai.api.core"], function($, sakai){

    /**
     * @name sakai_global.recentactivity
     *
     * @class recentactivity
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.recentactivity = function(tuid, showSettings){

        // Templates
        var recentactivityActivityItemTemplate = "recentactivity_activity_item_template";

        // Container
        var $recentactivityActivityContainer = $("#recentactivity_activity_container");

        var parseActivity = function(success, data){
            if (success) {
                $.each(data.results, function(index, item){
                    item.who.name = sakai.api.User.getDisplayName(item.who);
                    item["sakai:activityMessage"] = sakai.api.i18n.Widgets.getValueForKey("recentactivity", "", item["sakai:activityMessage"]);
                    if (item.who.picture) {
                        item.who.picture = "/~" + item.who.userid + "/public/profile/" + $.parseJSON(item.who.picture).name;
                    }
                    else {
                        item.who.picture = "/dev/images/user_avatar_icon_48x48.png";
                    }
                });
                $recentactivityActivityContainer.html(sakai.api.Util.TemplateRenderer(recentactivityActivityItemTemplate, {
                    "data": data,
                    "sakai": sakai
                }));
            }
        };

        var fetchActivity = function(){
            sakai.api.Server.loadJSON("/devwidgets/recentactivity/activity.json", parseActivity);
        };

        var doInit = function(){
            fetchActivity();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("recentactivity");
});