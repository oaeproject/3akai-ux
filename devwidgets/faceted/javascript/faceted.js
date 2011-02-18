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
 */
/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.faceted
     *
     * @class faceted
     *
     * @description
     * Initialize the faceted widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     */
    sakai_global.faceted = function(tuid){


        ///////////////////
        // CSS Selectors //
        ///////////////////

        var faceted = "#faceted";
        var facetedContainer = faceted + "_container";
        var facetedListall = faceted + "_listall";
        var facetedDefaultTemplate = faceted + "_default_template";


        //////////////////////
        // Render functions //
        //////////////////////

        /**
         * Render the template
         */
        var renderTemplateFaceted = function(facetedConfig){
            if (sakai.data.me.user.anon) {
              $(facetedContainer).hide();
            } else {
              // Render the faceted.
              $(facetedContainer).html(sakai.api.Util.TemplateRenderer(facetedDefaultTemplate, facetedConfig));

              addBinding();
            }
        };


        //////////////
        // Bindings //
        //////////////

        /**
         * Bind the widget's links
         */
        var addBinding = function(){
            // bind faceted list all
            $(facetedListall).bind("click", function() {
                $(".faceted_list_expanded").show();
                $(".faceted_back").show();
                $(facetedListall).hide();
            });
            // bind faceted back link
            $(".faceted_back_link").bind("click", function() {
                $(facetedListall).show();
                $(".faceted_list_expanded").hide();
                $(".faceted_back").hide();
            });
            // bind category links
            $(".faceted_category").bind("click", function() {
                $(".faceted_category").removeClass("faceted_category_selected");
                $(this).addClass("faceted_category_selected");
            });
        };


        ////////////////////
        // Initialization //
        ////////////////////

        /**
         * Render function
         */
        var render = function(facetedConfig){
            renderTemplateFaceted(facetedConfig);
        };

        $(window).bind("render.faceted.sakai", function(e, config) {
            render(config);
        });

        // Indicate that the widget has finished loading
        $(window).trigger("ready.faceted.sakai", {});
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("faceted");
});
