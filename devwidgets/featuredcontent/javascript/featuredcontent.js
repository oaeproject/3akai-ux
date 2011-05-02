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
     * @name sakai_global.featuredcontent
     *
     * @class featuredcontent
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.featuredcontent = function(tuid, showSettings){

        // Containers
        var $featuredcontentContentContainer = $("#featuredcontent_content_container");

        // Templates
        var featuredcontentContentTemplate = "featuredcontent_content_template";

        // Limit number of items
        var maxLarge = 4;
        var maxMedium = 8;
        var maxSmall = 16;

        var featuredContentArr = [];
        var mediumArr = [];
        var smallArr = [];

        var renderFeaturedContent = function(data){
            debug.log(data);
            $featuredcontentContentContainer.html(sakai.api.Util.TemplateRenderer(featuredcontentContentTemplate, {"data":data, "sakai":sakai}))
        }

        var parseFeaturedContent = function(data){
            debug.log(data);
            for (var i = 0; i < data.results.length; i++) {
                data.results[i].hasPreview = sakai.api.Content.hasPreview(data.results[i]);
                if(data.results[i].hasPreview){
                    if (maxLarge) {
                        featuredContentArr.push(data.results[i]);
                        maxLarge--;
                    }
                } else if(data.results[i]["sakai:description"]){
                    if (maxMedium) {
                        mediumArr.push(data.results[i]);
                        maxMedium--;
                    }
                } else {
                    if (maxSmall) {
                        smallArr.push(data.results[i]);
                        maxSmall--;
                    }
                }
            }

            $.each(mediumArr, function(index, item){
                featuredContentArr.push(item);
            });

            featuredContentArr.push(smallArr);

            renderFeaturedContent(featuredContentArr);
        };

        var getFeaturedContent = function(){
            $.ajax({
                url: "/var/search/pool/all-all.json?page=0&items=10&q=*&_charset_=utf-8",
                cache: false,
                success: function(data){
                    parseFeaturedContent(data);
                },
                error: function(xhr, textStatus, thrownError){
                    debug.log(xhr, textStatus, thrownError);
                }
            });
        };

        var doInit = function(){
            getFeaturedContent();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("featuredcontent");
});