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

    /**
     * Render the template
     */
    var renderTemplate = function(relatedcontentData){
        // Render the relatedcontent.
        $(relatedcontentContainer).html($.TemplateRenderer(relatedcontentDefaultTemplate, relatedcontentData));
        $(relatedcontentContainer).show();
    };


    ////////////////////
    // Util functions //
    ////////////////////

    /**
     * Fetches the related content
     */
    var getRelatedContent = function(contentData){
        
        // get related content for contentData
        // return some search results for now
            $.ajax({
                url: sakai.config.URL.SEARCH_ALL_FILES.replace(".json", ".infinity.json"),
                data: {
                    "q" : "*",
                    "items" : "10"
                },
                success: function(data) {
                    renderTemplate(data);
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