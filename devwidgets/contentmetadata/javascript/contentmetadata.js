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
 * @name sakai.contentmetadata
 *
 * @class contentmetadata
 *
 * @description
 * Initialize the contentmetadata widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.contentmetadata = function(tuid,showSettings){

    // Containers
    var $contentmetadataDescriptionContainer = $("#contentmetadata_description_container");
    var $contentmetadataTagsContainer = $("#contentmetadata_tags_container");
    var $contentmetadataDetailsContainer = $("#contentmetadata_details_container");
    var $contentmetadataLocationsContainer = $("#contentmetadata_locations_container");

    // Elements
    var contentmetadataDescriptionDisplay = "#contentmetadata_description_display";
    var $collapsibleContainers = $(".collapsible_container");
    var contentmetadataViewRevisions = "#contentmetadata_view_revisions";

    // See more
    var $contentmetadataShowMore = $("#contentmetadata_show_more");
    var $contentmetadataSeeMore = $("#contentmetadata_see_more");
    var $contentmetadataSeeLess = $("#contentmetadata_see_less");

    // Templates
    var contentmetadataDescriptionTemplate = "contentmetadata_description_template";
    var contentmetadataTagsTemplate = "contentmetadata_tags_template";
    var contentmetadataDetailsTemplate = "contentmetadata_details_template";
    var contentmetadataLocationsTemplate = "contentmetadata_locations_template";

    var renderTags = function(){
        $contentmetadataTagsContainer.html($.TemplateRenderer(contentmetadataTagsTemplate, sakai.content_profile.content_data));
    };

    var renderDescription = function(){
        $contentmetadataDescriptionContainer.html($.TemplateRenderer(contentmetadataDescriptionTemplate, sakai.content_profile.content_data));
    };

    var renderDetails = function(){
        $contentmetadataDetailsContainer.html($.TemplateRenderer(contentmetadataDetailsTemplate, sakai.content_profile.content_data));
    };

    var renderLocation = function(){
        $contentmetadataLocationsContainer.html($.TemplateRenderer(contentmetadataLocationsTemplate, sakai.content_profile.content_data));
    }

    var addBinding = function(){
        $contentmetadataShowMore.bind("click", function(){
            $collapsibleContainers.animate({
                'margin-bottom': 'toggle',
                opacity: 'toggle',
                'padding-top': 'toggle',
                'padding-bottom': 'toggle',
                height: 'toggle'
            }, 400, function(){
                // make sure the newly added content is properly styled with
                // threedots truncation
                $(".threedots_text").ThreeDots({
                    max_rows: 1,
                    text_span_class: "ellipsis_text",
                    e_span_class: "threedots_a",
                    whole_word: false,
                    alt_text_t: true
                });
            });
            $("#contentmetadata_show_more span").toggle(); 
        });

        $(contentmetadataViewRevisions).live("click", function(){
            sakai.filerevisions.initialise(sakai.content_profile.content_data);
        });
    };

    var doInit = function(){
        // Render all information
        renderDescription();
        renderTags();
        renderDetails();
        renderLocation();

        // Add binding
        addBinding();
    }

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("contentmetadata");