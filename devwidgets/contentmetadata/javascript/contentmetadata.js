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
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.threedots.js (ThreeDots)
 */
/*global $ */
require(["jquery", "sakai/sakai.api.core", "/dev/javascript/content_profile.js"], function($, sakai){

    /**
     * @name sakai_global.contentmetadata
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
    sakai_global.contentmetadata = function(tuid, showSettings){

        ////////////////////////
        ////// VARIABLES ///////
        ////////////////////////

        // Containers
        var $contentmetadataDescriptionContainer = $("#contentmetadata_description_container");
        var $contentmetadataTagsContainer = $("#contentmetadata_tags_container");
        var $contentmetadataCopyrightContainer = $("#contentmetadata_copyright_container");
        var $contentmetadataDetailsContainer = $("#contentmetadata_details_container");
        var $contentmetadataLocationsContainer = $("#contentmetadata_locations_container");
        var $contentmetadataLocationsDialogContainer = $("#contentmetadata_locations_dialog_container");
        var contentmetadataLocationsNewLocationsContainer = "#contentmetadata_locations_newlocations_container";
        var contentmetadataLocationsSecondLevelTemplateContainer = "#contentmetadata_location_secondlevel_template_container";
        var contentmetadataLocationsThirdLevelTemplateContainer = "#contentmetadata_location_thirdlevel_template_container";

        // Dialogs
        //var $contentmetadataLocationsDialog = $("#contentmetadata_locations_dialog");

        // Elements
        var contentmetadataDescriptionDisplay = "#contentmetadata_description_display";
        var $collapsibleContainers = $(".collapsible_container");
        var contentmetadataViewRevisions = "#contentmetadata_view_revisions";
        var $contentmetadataEditable = $(".contentmetadata_editable");
        var contentmetadataCancelSave = ".contentmetadata_cancel_save";
        var contentmetadataSave = ".contentmetadata_save";
        var contentmetadataInputEdit = ".contentmetadata_edit_input";
        var $contentmetadataLocationsAddAnother = $("#contentmetadata_locations_add_another");
        var contentmetadataLocationLvlOne = ".contentmetadata_location_directory_lvlone";
        var contentmetadataLocationLvlTwo = ".contentmetadata_location_directory_lvltwo";
        var contentmetadataLocationLvlThree = ".contentmetadata_location_directory_lvlthree";
        var $contentmetadataLocationsDialogUpdate = $("#contentmetadata_locations_dialog_update");
        var contentmetadataRemoveLocation = ".contentmetadata_remove_location";
        var contentmetadataRemoveNewLocation = ".contentmetadata_remove_new_location";

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
        var contentmetadataLocationsDialogTemplate = "contentmetadata_locations_dialog_template";
        var contentmetadataLocationFirstLevelTemplate = "contentmetadata_location_firstlevel_template";
        var contentmetadataLocationSecondLevelTemplate = "contentmetadata_location_secondlevel_template";
        var contentmetadataLocationThirdLevelTemplate = "contentmetadata_location_thirdlevel_template";

        // i18n
        var $contentmetadataUpdatedCopyright = $("#contentmetadata_updated_copyright");

        // Edit vars
        // Parent DIV that handles the hover and click to edit
        var editTarget = "";
        // ID of Input element that's focused, defines what to update
        var edittingElement = "";
        var directoryJSON = {};

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

                $(contentmetadataInputEdit).blur(editInputBlur);
            }
        };

        /**
         * Render the Description template
         * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
         */
        var renderDescription = function(mode){
            sakai_global.content_profile.content_data.mode = mode;
            var json = {
                data: sakai_global.content_profile.content_data,
                sakai: sakai
            };
            $contentmetadataDescriptionContainer.html(sakai.api.Util.TemplateRenderer(contentmetadataDescriptionTemplate, json));
            addEditBinding(mode);
        };

        var renderName = function(mode){
            if (mode === "edit") {
                $("#contentmetadata_name_name").hide();
                $("#contentmetadata_name_text").val($.trim($("#contentmetadata_name_name").text()));
                $("#contentmetadata_name_edit").show();
                $("#contentmetadata_name_text").focus();
            }
            $("#contentmetadata_name_text").unbind("blur");
            $("#contentmetadata_name_text").bind("blur", function(){
                $("#contentmetadata_name_edit").hide();
                if ($.trim($("#contentmetadata_name_text").val())) {
                    $("#contentmetadata_name_name").text($("#contentmetadata_name_text").val());
                    $("#contentmetadata_name_name").show();
                    $.ajax({
                        url: "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".html",
                        type: "POST",
                        cache: false,
                        data: {
                            "sakai:pooled-content-file-name": sakai.api.Security.escapeHTML($("#contentmetadata_name_text").val())
                        },
                        success: function(){
                            sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] = sakai.api.Security.escapeHTML($("#contentmetadata_name_text").val());
                        }
                    });
                }
                else {
                    $("#contentmetadata_name_name").show();
                    $(".contentmetadata_editable").live("click", editData);
                }
            });
        };

        /**
         * Render the Tags template
         * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
         */
        var renderTags = function(mode){
            sakai_global.content_profile.content_data.mode = mode;
            var json = {
                data: sakai_global.content_profile.content_data,
                sakai: sakai
            };
            $contentmetadataTagsContainer.html(sakai.api.Util.TemplateRenderer(contentmetadataTagsTemplate, json));
            addEditBinding(mode);
        };

        /**
         * Render the Copyright template
         * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
         */
        var renderCopyright = function(mode){
            sakai_global.content_profile.content_data.mode = mode;
            var json = {
                data: sakai_global.content_profile.content_data,
                sakai: sakai
            };
            $contentmetadataCopyrightContainer.html(sakai.api.Util.TemplateRenderer(contentmetadataCopyrightTemplate, json));
            addEditBinding(mode);
        };

        /**
         * Render the Details template
         * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
         */
        var renderDetails = function(mode){
            sakai_global.content_profile.content_data.mode = mode;
            var json = {
                data: sakai_global.content_profile.content_data,
                sakai: sakai
            };
            $contentmetadataDetailsContainer.html(sakai.api.Util.TemplateRenderer(contentmetadataDetailsTemplate, json));
            addEditBinding(mode);
        };

        var createActivity = function(activityMessage){
            var activityData = {
                "sakai:activityMessage": activityMessage
            };
            sakai.api.Activity.createActivity("/p/" + sakai_global.content_profile.content_data.data["jcr:name"], "content", "default", activityData);
        };

        //////////////////////////////////
        /////// DIRECTORY EDITTING ///////

        var renderLocationsEdit = function(){
            $("#assignlocation_container").jqmShow();
        };

        /**
         * Render the Locations template
         * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
         */
        var renderLocations = function(mode){
            if (mode === "edit") {
                renderLocationsEdit();
            }
            else {
                $contentmetadataLocationsContainer.html("");
                sakai_global.content_profile.content_data.mode = mode;
                var json = {
                    data: sakai_global.content_profile.content_data,
                    sakai: sakai
                };
                $contentmetadataLocationsContainer.html(sakai.api.Util.TemplateRenderer(contentmetadataLocationsTemplate, json));
                applyThreeDots();
            }
        };

        ////////////////////////
        /////// EDITTING ///////
        ////////////////////////

        var updateTags = function(){
            var tags = sakai.api.Util.formatTags($("#contentmetadata_tags_tags").val());
            // Since directory tags are filtered out of the textarea we should put them back to save them
            $(sakai_global.content_profile.content_data.data["sakai:tags"]).each(function(index, tag){
                if (tag.split("/")[0] === "directory") {
                    tags.push(tag);
                }
            });

            sakai.api.Util.tagEntity("/p/" + sakai_global.content_profile.content_data.data["jcr:name"], tags, sakai_global.content_profile.content_data.data["sakai:tags"], function(){
                sakai_global.content_profile.content_data.data["sakai:tags"] = tags;
                renderTags(false);
                // Create an activity
                createActivity("__MSG__UPDATED_TAGS__");
            });
        };

        /**
         * Update the description of the content
         */
        var updateDescription = function(){
            var description = $("#contentmetadata_description_description").val();
            sakai_global.content_profile.content_data.data["sakai:description"] = description;
            renderDescription(false);
            $.ajax({
                url: "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".html",
                type: "POST",
                cache: false,
                data: {
                    "sakai:description": description
                },
                success: function(){
                    createActivity("__MSG__UPDATED_DESCRIPTION__");
                }
            });
        };

        /**
         * Update the copyright of the content
         */
        var updateCopyright = function(){
            var copyright = $("#contentmetadata_copyright_copyright").val();
            sakai_global.content_profile.content_data.data["sakai:copyright"] = copyright;
            renderCopyright(false);
            $.ajax({
                url: "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".html",
                type: "POST",
                cache: false,
                data: {
                    "sakai:copyright": $("#contentmetadata_copyright_copyright").val()
                },
                success: function(){
                    createActivity("__MSG__UPDATED_COPYRIGHT__");
                }
            });
        };

        /**
         * Trigger the template to render the edit mode
         * @param {Object} ev Trigger event
         */
        var editData = function(ev){
            var dataToEdit = "";
            if (ev.target.nodeName.toLowerCase() !== "a" && ev.target.nodeName.toLowerCase() !== "select" && ev.target.nodeName.toLowerCase() !== "option" && ev.target.nodeName.toLowerCase() !== "textarea") {
                target = $(ev.target).closest(".contentmetadata_editable");
                if (target[0] !== undefined) {
                    editTarget = target;
                    dataToEdit = editTarget[0].id.split("_")[1];

                    switch (dataToEdit) {
                        case "description":
                            renderDescription("edit");
                            break;
                        case "tags":
                            renderTags("edit");
                            break;
                        case "locations":
                            renderLocations("edit");
                            break;
                        case "copyright":
                            renderCopyright("edit");
                            break;
                        case "name":
                            renderName("edit");
                            break;
                    }
                }
            }
        };

        /**
         * Handle losing of focus on an input element
         * @param {Object} el Element that lost the focus
         */
        var editInputBlur = function(el){
            edittingElement = $(el.target)[0].id.split("_")[2];
            switch (edittingElement) {
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

        ////////////////////////
        //////// SET-UP ////////
        ////////////////////////

        var applyThreeDots = function(){
            // make sure the newly added content is properly styled with
            // threedots truncation
            $(".threedots_text").ThreeDots({
                max_rows: 1,
                text_span_class: "ellipsis_text",
                e_span_class: "threedots_a",
                whole_word: false,
                alt_text_e: false
            });
        };

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
                applyThreeDots();
            });
            $("#contentmetadata_show_more > div").toggle();
        };

        /**
         * Add binding/events to the elements in the widget
         */
        var addBinding = function(){
            $(".contentmetadata_editable_for_maintainers").removeClass("contentmetadata_editable");
            if (sakai_global.content_profile.content_data.isManager) {
                $(".contentmetadata_editable_for_maintainers").addClass("contentmetadata_editable");
            }

            $contentmetadataShowMore.unbind("click", animateData);
            $contentmetadataShowMore.bind("click", animateData);

            $(".contentmetadata_editable").die("click", editData);
            $(".contentmetadata_editable").live("click", editData);

            $(contentmetadataViewRevisions).die("click");
            $(contentmetadataViewRevisions).live("click", function(){
                $(window).trigger("initialize.filerevisions.sakai", sakai_global.content_profile.content_data);
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

        $(window).bind("sakai-fileupload-complete", function(){
            $(window).trigger("load.content_profile.sakai", renderDetails);
        });

        $(window).bind("sakai-contentmetadata-renderlocations", function(ev, val){
            sakai_global.content_profile.content_data.saveddirectory = val.saveddirectory;
            sakai_global.content_profile.content_data.data["sakai:tags"] = val.tags;
            renderLocations(false);
        });

        // Bind Enter key to input fields to save on keyup
        $("input").bind("keyup", function(ev){
            if (ev.keyCode == 13) {
                $(this).blur();
            }
        });

        /**
         * Initialize the widget from outside of the widget
         */
        $(window).bind("render.contentmetadata.sakai", function(){
            doInit();
        });
        sakai_global.contentmetadata.isReady = true;
        $(window).trigger("sakai.contentmetadata.ready");
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("contentmetadata");
});
