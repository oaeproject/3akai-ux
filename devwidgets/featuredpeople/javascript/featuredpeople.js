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
     * @name sakai_global.featuredpeople
     *
     * @class featuredpeople
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.featuredpeople = function(tuid, showSettings, pageData){

        var $rootel = $("#"+tuid);

        // Containers
        var $featuredpeopleContainer = $("#featuredpeople_container", $rootel);

        // Templates
        var featuredpeopleTemplate = "featuredpeople_template";

        var renderPeople = function(data){
            $featuredpeopleContainer.html(sakai.api.Util.TemplateRenderer(featuredpeopleTemplate, {
                "data": data,
                "category": pageData.category,
                "title": pageData.title,
                "sakai": sakai
            }));
            if (data.total > data.results.length){
                $("#featuredpeople_showall", $rootel).show();
            }
        };

        var parsePeople = function(success, data){
            if (success) {
                $.each(data.results, function(index, item){
                    if (item.picture) {
                        item.picture = "/~" + sakai.api.Util.safeURL(item.userid) + "/public/profile/" + $.parseJSON(item.picture).name;
                    } else {
                        item.picture = "/dev/images/default_User_icon_50x50.png";
                    }
                    item.baseHref = "/~" + sakai.api.Util.safeURL(item.userid);
                    if (item.userid === sakai.data.me.user.userid) {
                        item.baseHref = "/me";
                    }
                    item.name = sakai.api.User.getDisplayName(item);
                });
                renderPeople(data);
            }
        };

        var fetchPeople = function(){
            var q = "";
            if(pageData){
                q = "directory/" + pageData.category.replace("-", "/");
            }
            sakai.api.Server.loadJSON("/var/search/bytag.json", parsePeople, {
                page: 0,
                items: 3,
                tag: q,
                type: "u"
            });
        };

        var doInit = function(){
            fetchPeople();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("featuredpeople");
});
