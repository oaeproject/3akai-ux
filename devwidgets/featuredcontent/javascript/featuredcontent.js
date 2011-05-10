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

        var $featuredcontentWidget = $(".featuredcontent_widget");

        var largeEnough = false;

        var featuredContentArr = [];

        var renderFeaturedContent = function(data){
            if (!data[0].hasPreview && sakai_global.category) {
                $featuredcontentWidget.hide();
            } else {
                $featuredcontentContentContainer.html(sakai.api.Util.TemplateRenderer(featuredcontentContentTemplate, {
                    "data": data,
                    "sakai": sakai
                }));
                $featuredcontentWidget.show();
            }
        };

        var parseFeaturedContent = function(success, data){
            if (success) {
                var mode = "medium";
                var numSmall = 0;
                featuredContentArr = [];
                var tempArr = [];

                // First check for a piece of content with preview
                var candidate = false;
                var i = 0;
                $.each(data.results, function(index, item){
                    item.hasPreview = sakai.api.Content.hasPreview(item);
                    if (!candidate) {
                        if (item.hasPreview && !largeEnough) {
                            item.mode = "large";
                            if (item["_mimeType"] && item["_mimeType"].split("/")[0] == "image") {
                                item.image = true;
                            }
                            if (item["sakai:tags"]) {
                                item["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(item["sakai:tags"].toString());
                            }
                            candidate = item;
                            i = index;
                        }
                    }
                    if (item.hasPreview && item["sakai:description"] && !largeEnough) {
                        largeEnough = true;
                        item.mode = "large";
                        if (item["_mimeType"] && item["_mimeType"].split("/")[0] == "image") {
                            item.image = true;
                        }
                        if (item["sakai:tags"]) {
                            item["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(item["sakai:tags"].toString());
                        }
                        featuredContentArr.push(item);
                        data.results.splice(index, 1);
                        return false;
                    }
                });

                if (!largeEnough) {
                    if(!candidate && data.results.length){
                        data.results[0].mode = "large";
                        data.results[0].hasPreview = sakai.api.Content.hasPreview(data.results[0]);
                        if (data.results[0]["_mimeType"] && data.results[0]["_mimeType"].split("/")[0] == "image") {
                            data.results[0].image = true;
                        }
                        if (data.results[0]["sakai:tags"]) {
                            data.results[0]["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(data.results[0]["sakai:tags"].toString());
                        }
                        candidate = data.results[0];
                    }
                    featuredContentArr.push(candidate);
                    data.results.splice(i, 1);
                }

                $.each(data.results, function(index, item){
                    if (featuredContentArr.length != 7) {
                        if (mode == "medium") {
                            item.mode = "medium";
                            mode = "small";
                            if (item["sakai:tags"]) {
                                item["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(item["sakai:tags"].toString());
                            }
                            featuredContentArr.push(item);
                        }
                        else {
                            item.mode = "small";
                            if (item["sakai:tags"]) {
                                item["sakai:tags"] = sakai.api.Util.formatTagsExcludeLocation(item["sakai:tags"].toString());
                            }
                            tempArr.push(item);
                            numSmall++;
                            if (numSmall == 2) {
                                numSmall = 0;
                                mode = "medium";
                                featuredContentArr.push(tempArr);
                                tempArr = [];
                            }
                        }
                    }
                });
                renderFeaturedContent(featuredContentArr);
            } else {
                renderFeaturedContent(false);
            }
        };

        var getFeaturedContent = function(){
            var items = 10;
            if(sakai_global.category){
                items = 1;
            }
            sakai.api.Server.loadJSON("/var/search/pool/all-all.json", parseFeaturedContent, {
                page: 0,
                items: items,
                sortOn: "_lastModified",
                sortOrder: "desc",
            });
        };

        var doInit = function(){
            getFeaturedContent();
        };

        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("featuredcontent");
});