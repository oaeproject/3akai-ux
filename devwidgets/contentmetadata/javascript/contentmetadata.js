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

    // Templates
    var contentmetadataDescriptionTemplate = "contentmetadata_description_template";
    var contentmetadataTagsTemplate = "contentmetadata_tags_template";
    var contentmetadataDetailsTemplate = "contentmetadata_details_template";
    var contentmetadataLocationsTemplate = "contentmetadata_locations_template";

    var renderTags = function(){
        $contentmetadataTagsContainer.html($.TemplateRenderer(contentmetadataTagsTemplate, sakai.content_profile.content_data));
    }

    var renderDescription = function(){
        $contentmetadataDescriptionContainer.html($.TemplateRenderer(contentmetadataDescriptionTemplate, sakai.content_profile.content_data));
    };

    var doInit = function(){
        renderDescription();
        renderTags();
    }

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("contentmetadata");