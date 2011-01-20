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

var sakai = sakai || {};

/**
 * @name sakai.api.UI.relatedcontent
 *
 * @class relatedcontent
 *
 */
sakai.api.UI.relatedcontent = sakai.api.UI.relatedcontent || {};
sakai.api.UI.relatedcontent.render = sakai.api.UI.relatedcontent.render || {};

/**
 * @name sakai.relatedcontent
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
sakai.relatedcontent = function(tuid,showSettings){

    ///////////////////
    // CSS Selectors //
    ///////////////////

    var relatedcontent = "#relatedcontent";
    var relatedcontentContainer = relatedcontent + "_container";
    var relatedcontentDefaultTemplate = relatedcontent + "_default_template";


    //////////////////////
    // Render functions //
    //////////////////////

    var applyThreeDots = function(){
        // make sure the newly added content is properly styled with
        // threedots truncation
        $(".relatedcontent .threedots_text").ThreeDots({
            max_rows: 1,
            text_span_class: "ellipsis_text",
            e_span_class: "threedots_a",
            whole_word: false,
            alt_text_t: true
        });
    };

    /**
     * Render the template
     */
    var renderTemplate = function(relatedcontentData){
        // Render the relatedcontent
        $(relatedcontentContainer).html($.TemplateRenderer(relatedcontentDefaultTemplate, relatedcontentData));
        $(relatedcontentContainer).show();
        applyThreeDots();
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

        for (var i = 0; i < contentData.members.managers.length; i++) {
            if (contentData.members.managers[i]) {
                managersList += " " + contentData.members.managers[i].userid;
            }
        }
        for (var j = 0; j < contentData.members.viewers.length; j++) {
            if (contentData.members.viewers[j]) {
                viewersList += " " + contentData.members.viewers[j].userid;
            }
        }

        var searchterm = contentData.data["sakai:pooled-content-file-name"] + " " + managersList + " " + viewersList;
        if (contentData.data["sakai:tags"]){
            searchterm = searchterm + " " + contentData.data["sakai:tags"].join(" ");
        }
        searchquery = prepSearchTermForURL(searchterm);

        // get related content for contentData
        // return some search results for now
        $.ajax({
            url: sakai.config.URL.SEARCH_ALL_FILES.replace(".json", ".infinity.json"),
            data: {
                "q" : searchquery,
                "items" : "11"
            },
            success: function(data) {
                var json = {
                    "content": contentData,
                    "relatedContent": data
                };
                renderTemplate(json);
            },
            error: function(xhr, textStatus, thrownError) {
                var json = {};
                renderTemplate(json);
            }
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
    sakai.api.UI.relatedcontent.render = function(contentData){
        addBinding();
        getRelatedContent(contentData);
    };

    // Indicate that the widget has finished loading
    $(window).trigger("sakai.api.UI.relatedcontent.ready", {});
    sakai.relatedcontent.isReady = true;
};

sakai.api.Widgets.widgetLoader.informOnLoad("relatedcontent");