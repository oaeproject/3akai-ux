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
 * /dev/lib/jquery/plugins/jquery.threedots.js (ThreeDots)
 */

/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {


    /**
     * @name sakai_global.relatedcontent
     *
     * @class relatedcontent
     *
     * @description
     * Initialize the relatedcontent widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.relatedcontent = function(tuid,showSettings){

        ///////////////////
        // CSS Selectors //
        ///////////////////

        var relatedcontent = "#relatedcontent";
        var relatedcontentContainer = relatedcontent + "_container";
        var relatedcontentDefaultTemplate = relatedcontent + "_default_template";


        //////////////////////
        // Render functions //
        //////////////////////

        /**
         * Render the template
         */
        var renderTemplate = function(relatedcontentData){
            // Render the relatedcontent
            relatedcontentData.sakai = sakai;
            for (var item in relatedcontentData.relatedContent.results) {
                if(relatedcontentData.relatedContent.results.hasOwnProperty(item)){
                    relatedcontentData.relatedContent.results[item]["sakai:pooled-content-file-name"] = sakai.api.Util.applyThreeDots(relatedcontentData.relatedContent.results[item]["sakai:pooled-content-file-name"], $(".relatedcontent").width() - 30, {max_rows: 1,whole_word: false}, "s3d-bold");
                }
            }
            $(relatedcontentContainer).html(sakai.api.Util.TemplateRenderer(relatedcontentDefaultTemplate, relatedcontentData));
            $(relatedcontentContainer).show();
        };


        ////////////////////
        // Util functions //
        ////////////////////

        /**
         * This function will replace all
         * @param {String} term The search term that needs to be converted.
         */
        var prepSearchTermForURL = function(term) {
            // taken this from search_main until a backend service can get related content
            var urlterm = "";
            var splitted = $.trim(term).split(/\s/);
            if (splitted.length > 1) {
                for (var i = 0; i < splitted.length; i++) {
                    if (splitted[i]) {
                        urlterm += "*" + splitted[i] + "* ";
                        if (i < splitted.length - 1) {
                            urlterm += "OR ";
                        }
                    }
                }
            }
            else {
                urlterm = "*" + term + "*";
            }
            return urlterm;
        };

        /**
         * Fetches the related content
         */
        var getRelatedContent = function(contentData){

            var managersList = "";
            var viewersList = "";
            var ajaxSuccess = function(data) {
                var json = {
                    "content": contentData,
                    "relatedContent": data
                };
                renderTemplate(json);
            };
            var ajaxError = function() {
                renderTemplate({});
            };

            for (var i = 0; i < contentData.members.managers.length; i++) {
                if (contentData.members.managers[i]) {
                    managersList += " " + (contentData.members.managers[i]["rep:userId"] || contentData.members.managers[i]["sakai:group-id"]);
                }
            }
            for (var j = 0; j < contentData.members.viewers.length; j++) {
                if (contentData.members.viewers[j]) {
                    viewersList += " " + (contentData.members.viewers[j]["rep:userId"] || contentData.members.viewers[j]["sakai:group-id"]);
                }
            }
            var searchterm = contentData.data["sakai:pooled-content-file-name"] + " " + managersList + " " + viewersList;
            searchquery = prepSearchTermForURL(searchterm);
            if (contentData.data["sakai:tags"]){
                searchquery = searchquery + " OR " + contentData.data["sakai:tags"].join(" OR ");
            } 

            // get related content for contentData
            // return some search results for now
            var params = {
                "items" : "11"
            };
            var url = sakai.config.URL.SEARCH_ALL_FILES.replace(".json", ".infinity.json");
            if (searchquery === '*' || searchquery === '**') {
                url = sakai.config.URL.SEARCH_ALL_FILES_ALL;
            } else {
                params["q"] = searchquery;
            }
            $.ajax({
                url: url,
                data: params,
                success: ajaxSuccess,
                error: ajaxError
            });
            
        };


        //////////////
        // Bindings //
        //////////////

        /**
         * Bind the widget's links
         */
        var addBinding = function(){
            // bind the more link

        };

        ////////////////////
        // Initialization //
        ////////////////////

        /**
         * Render function
         */
       $(window).bind("render.relatedcontent.sakai", function(e, contentData){
            addBinding();
            getRelatedContent(contentData);
        });

        // Indicate that the widget has finished loading
        $(window).trigger("ready.relatedcontent.sakai", {});
        sakai_global.relatedcontent.isReady = true;
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("relatedcontent");
});
