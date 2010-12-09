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

sakai.api.UI.contentmetadata = sakai.api.UI.contentmetadata || {};
sakai.api.UI.contentmetadata.data = sakai.api.UI.contentmetadata.data || {};
sakai.api.UI.contentmetadata.render = sakai.api.UI.contentmetadata.render || {};

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


    ////////////////////////
    ////// VARIABLES ///////
    ////////////////////////

    // Containers
    var $contentmetadataDescriptionContainer = $("#contentmetadata_description_container");
    var $contentmetadataTagsContainer = $("#contentmetadata_tags_container");
    var $contentmetadataCopyrightContainer = $("#contentmetadata_copyright_container");
    var $contentmetadataDetailsContainer = $("#contentmetadata_details_container");
    var $contentmetadataLocationsContainer = $("#contentmetadata_locations_container");

    // Elements
    var contentmetadataDescriptionDisplay = "#contentmetadata_description_display";
    var $collapsibleContainers = $(".collapsible_container");
    var contentmetadataViewRevisions = "#contentmetadata_view_revisions";
    var $contentmetadataEditable = $(".contentmetadata_editable");
    var contentmetadataCancelSave = ".contentmetadata_cancel_save";
    var contentmetadataSave = ".contentmetadata_save";
    var contentmetadataInputEdit = ".contentmetadata_edit_input";

    // See more
    var $contentmetadataShowMore = $("#contentmetadata_show_more");
    var $contentmetadataSeeMore = $("#contentmetadata_see_more");
    var $contentmetadataSeeLess = $("#contentmetadata_see_less");

    // Templates
    var contentmetadataDescriptionTemplate = "contentmetadata_description_template";
    var contentmetadataTagsTemplate = "contentmetadata_tags_template";
    var contentmetadataCopyrightTemplate = "contentmetadata_copyright_template";
    var contentmetadataDetailsTemplate = "contentmetadata_details_template";
    var contentmetadataLocationsTemplate = "contentmetadata_locations_template";

    // Edit vars
    // Parent DIV that handles the hover and click to edit
    var editTarget = "";
    // ID of Input element that's focused, defines what to update
    var edittingElement = "";


    ////////////////////////
    ////// RENDERING ///////
    ////////////////////////

    /**
     * Add binding to the input elements that allow editting
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var addEditBinding = function(mode){
        if (mode === "edit") {
            if ($(".contentmetadata_edit_input")[0] !== undefined) {
                $(".contentmetadata_edit_input")[0].focus();
            }
            $(contentmetadataInputEdit).focus(editInputFocus);
            $(contentmetadataInputEdit).blur(editInputBlur);
        }
    }

    /**
     * Render the Description template
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var renderDescription = function(mode){
        sakai.content_profile.content_data.mode = mode;
        $contentmetadataDescriptionContainer.html($.TemplateRenderer(contentmetadataDescriptionTemplate, sakai.content_profile.content_data));
        addEditBinding(mode);
    };

    /**
     * Render the Tags template
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var renderTags = function(mode){
        sakai.content_profile.content_data.mode = mode;
        $contentmetadataTagsContainer.html($.TemplateRenderer(contentmetadataTagsTemplate, sakai.content_profile.content_data));
        addEditBinding(mode);
    };

    /**
     * Render the Copyright template
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var renderCopyright = function(mode){
        sakai.content_profile.content_data.mode = mode;
        $contentmetadataCopyrightContainer.html($.TemplateRenderer(contentmetadataCopyrightTemplate, sakai.content_profile.content_data));
        addEditBinding(mode);
    };

    /**
     * Render the Details template
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var renderDetails = function(mode){
        sakai.content_profile.content_data.mode = mode;
        $contentmetadataDetailsContainer.html($.TemplateRenderer(contentmetadataDetailsTemplate, sakai.content_profile.content_data));
        addEditBinding(mode);
    };

    /**
     * Render the Locations template
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var renderLocations = function(mode){
        sakai.content_profile.content_data.mode = mode;
        $contentmetadataLocationsContainer.html($.TemplateRenderer(contentmetadataLocationsTemplate, sakai.content_profile.content_data));
        addEditBinding(mode);
    };


    ////////////////////////
    /////// EDITTING ///////
    ////////////////////////

    var updateTags = function() {
        var tags = sakai.api.Util.formatTags($("#contentmetadata_tags_tags").val());
        sakai.api.Util.tagEntity("/p/" + sakai.content_profile.content_data.data["jcr:name"], tags, sakai.content_profile.content_data.data["sakai:tags"], function(){
            sakai.content_profile.content_data.data["sakai:tags"] = tags;
            renderTags(false);
        });
    };

    /**
     * Update the description of the content
     */
    var updateDescription = function(){
        $.ajax({
            url: "/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".html",
            type : "POST",
            cache: false,
            data: {
                "sakai:description":$("#contentmetadata_description_description").val()
            }, success: function(){
                sakai.content_profile.content_data.data["sakai:description"] = $("#contentmetadata_description_description").val();
                renderDescription(false);
            }
        });
    }

    /**
     * Update the copyright of the content
     */
    var updateCopyright = function(){
        $.ajax({
            url: "/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".html",
            type : "POST",
            cache: false,
            data: {
                "sakai:copyright":$("#contentmetadata_copyright_copyright").val()
            }, success: function(){
                sakai.content_profile.content_data.data["sakai:copyright"] = $("#contentmetadata_copyright_copyright").val();
                renderCopyright(false);
            }
        });
    }

    /**
     * Capitalize first letter of every word in the string
     */
    String.prototype.capitalize = function(){
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    /**
     * Trigger the template to render the edit mode
     * @param {Object} el Clicked element
     */
    var editData = function(el){
        target = $(el.target).closest(".contentmetadata_editable");
        if (target[0] !== undefined) {
            editTarget = target;
            var dataToEdit = editTarget[0].id.split("_")[1];
            editTarget.removeClass("contentmetadata_editable");
            eval("render" + dataToEdit.capitalize() + "(\"edit\")");
        }
    };

    /**
     * Handle losing of focus on an input element
     * @param {Object} el Element that lost the focus
     */
    var editInputBlur = function(el){
        editTarget.addClass("contentmetadata_editable");
        edittingElement = $(el.target)[0].id.split("_")[2];
        switch (edittingElement){
            case "description":
                updateDescription();
                break;
            case "tags":
                updateTags();
                break;
            case "copyright":
                updateCopyright();
                break;
        }
    };

    /**
     * Handle focussing of an input element
     * @param {Object} el Element that has the focus
     */
    var editInputFocus = function(el){

    };


    ////////////////////////
    //////// SET-UP ////////
    ////////////////////////

    /**
     * Animate the hidden or shown data containers
     */
    var animateData = function(){
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
    };

    /**
     * Add binding/events to the elements in the widget
     */
    var addBinding = function(){
        $contentmetadataShowMore.unbind("click", animateData);
        $contentmetadataShowMore.bind("click", animateData);

        $contentmetadataEditable.unbind("click", editData);
        $contentmetadataEditable.bind("click", editData);

        $(contentmetadataViewRevisions).live("click", function(){
            sakai.filerevisions.initialise(sakai.content_profile.content_data)
        });
    };

    /**
     * Initialize the widget
     */
    var doInit = function(){
        // Render all information
        renderDescription(false);
        renderTags(false);
        renderCopyright(false);
        renderLocations(false);
        renderDetails(false);

        // Add binding
        addBinding();
    };

    /**
     * Initialize the widget from outside of the widget
     */
    sakai.api.UI.contentmetadata.render = function(){
        doInit();
    };

    sakai.contentmetadata.isReady = true;
    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("contentmetadata");