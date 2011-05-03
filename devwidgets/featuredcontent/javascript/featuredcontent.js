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

        var featuredContentArr = [];

        var renderFeaturedContent = function(data){
            $featuredcontentContentContainer.html(sakai.api.Util.TemplateRenderer(featuredcontentContentTemplate, {
                "data": data,
                "sakai": sakai
            }))
        };

        var addSmall = function(data){
            if (data.results.length) {
                var added = 0;
                var tempArr = [];
                for (var i = 0; i < data.results.length; i++) {
                    if (added !== 2) {
                        data.results[i].hasPreview = sakai.api.Content.hasPreview(data.results[i]);
                        data.results[i].mode = "small";
                        tempArr.push(data.results[i]);
                        added++;
                        if (i) {
                            data.results.splice(i - added, 1);
                        }
                        else {
                            data.results.splice(i, 1);
                        }
                        if(data.results.length == 1){
                            featuredContentArr.push(tempArr);
                        }
                    }
                    else {
                        featuredContentArr.push(tempArr);
                        addMedium(data);
                        break;
                    }
                }
                renderFeaturedContent(featuredContentArr);
            }
        };

        var addMedium = function(data){
            if (data.results.length) {
                var removed = 0;
                for (var i = 0; i < data.results.length; i++) {
                    data.results[i].hasPreview = sakai.api.Content.hasPreview(data.results[i]);
                    if (data.results[i]["sakai:description"]) {
                        data.results[i].mode = "medium";
                        featuredContentArr.push(data.results[i]);
                        if (i) {
                            data.results.splice(i - removed, 1);
                        }
                        else {
                            data.results.splice(i, 1);
                        }
                        removed++;
                        if (removed) {
                            addSmall(data);
                        }
                    }
                    else 
                        if (i == data.results.length) {
                            addSmall(data);
                            break;
                        }
                }
            } else {
                renderFeaturedContent(featuredContentArr);
            }
        };

        var addLarge = function(data){
            for (var i = 0; i < data.results.length; i++) {
                data.results[i].hasPreview = sakai.api.Content.hasPreview(data.results[i]);
                if(data.results[i].hasPreview && data.results[i]["sakai:description"] && data.results[i]["sakai:tags"]){
                    data.results[i].mode = "large";
                    featuredContentArr.push(data.results[i]);
                    data.results.splice(i, 1);
                    addMedium(data);
                    break;
                }else if(i == data.results.length){
                    addMedium(data);
                }
            }
        };

        var parseFeaturedContent = function(data){
            addLarge(data);
        };

        var getFeaturedContent = function(){
            $.ajax({
                url: "/var/search/pool/all-all.json?page=0&items=11&q=*&_charset_=utf-8",
                cache: false,
                success: function(data){
                    if(data.total){
                        parseFeaturedContent(data);
                    }else{
                        renderFeaturedContent(false);
                    }
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