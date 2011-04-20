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
        var $contentmetadataUrlContainer = $("#contentmetadata_url_container");
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
        var contentmetadataUrlTemplate = "contentmetadata_url_template";
        var contentmetadataCopyrightTemplate = "contentmetadata_copyright_template";
        var contentmetadataDetailsTemplate = "contentmetadata_details_template";
        var contentmetadataLocationsTemplate = "contentmetadata_locations_template";

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

        /**
         * Render the URL template
         * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
         */
        var renderUrl = function(mode){
            sakai_global.content_profile.content_data.mode = mode;
            var mimeType = sakai.api.Content.getMimeType(sakai_global.content_profile.content_data.data);
            if(mimeType === "x-sakai/link") {
                var json = {
                    data: sakai_global.content_profile.content_data,
                    sakai: sakai
                };
                sakai.api.Util.TemplateRenderer(contentmetadataUrlTemplate, json, $contentmetadataUrlContainer);
                $contentmetadataUrlContainer.show();
            } else {
                $contentmetadataUrlContainer.hide();
            }
            addEditBinding(mode);
        };

        var renderName = function(mode){
            if (mode === "edit") {
                $("#entity_name").hide();
                $("#entity_name_text").val($.trim($("#entity_name").text()));
                $("#entity_name_edit").show();
                $("#entity_name_text").focus();
            }
            $("#entity_name_text").unbind("blur");
            $("#entity_name_text").bind("blur", function(){
                $("#entity_name_edit").hide();
                if ($.trim($("#entity_name_text").val())) {
                    $("#entity_name").text($("#entity_name_text").val());
                    $("#entity_name").show();
                    $.ajax({
                        url: "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".html",
                        type: "POST",
                        cache: false,
                        data: {
                            "sakai:pooled-content-file-name": sakai.api.Security.escapeHTML($("#entity_name_text").val())
                        },
                        success: function(){
                            sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] = sakai.api.Security.escapeHTML($("#entity_name_text").val());
                            $("#contentpreview_download_button").attr("href", sakai_global.content_profile.content_data.smallPath + "/" + encodeURIComponent(sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"]));
                        }
                    });
                }
                else {
                    $("#entity_name").show();
                    $(".entity_editable").live("click", editData);
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
            sakai.api.Activity.createActivity("/p/" + sakai_global.content_profile.content_data.data["jcr:name"], "content", "default", activityData, function(responseData, success){
                if (success) {
                    // update the entity widget with the new activity
                    $(window).trigger("updateContentActivity.entity.sakai", activityMessage);
                }
            });
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

                var directorylocations = [];
                for(var dir in json.data.saveddirectory){
                    if(json.data.saveddirectory.hasOwnProperty(dir)){
                        var dirString = "";
                        for (var dirPiece in json.data.saveddirectory[dir]){
                            if(json.data.saveddirectory[dir].hasOwnProperty(dirPiece)){
                                dirString += sakai.api.Util.getValueForDirectoryKey(json.data.saveddirectory[dir][dirPiece]);
                                if(dirPiece < json.data.saveddirectory[dir].length - 1){
                                    dirString += "&nbsp;&#187;&nbsp;";
                                }
                            }
                        }
                        directorylocations.push(sakai.api.Util.applyThreeDots(dirString, $("#contentmetadata_locations_container").width() - 120, {max_rows: 1,whole_word: false}, "s3d-bold"));
                    }
                }
                json["directorylocations"] = directorylocations;

                $contentmetadataLocationsContainer.html(sakai.api.Util.TemplateRenderer(contentmetadataLocationsTemplate, json));
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

            for(var tag in tags){
                if (tags.hasOwnProperty(tag)) {
                    tags[tag] = tags[tag].replace(/\s+/g, " ");
                }
            }

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
         * Update the description of the content
         */
        var updateUrl = function(){
            var url = $("#contentmetadata_url_url").val();
            var preview = sakai.api.Content.getPreviewUrl(url);
            sakai_global.content_profile.content_data.data["sakai:pooled-content-url"] = url;
            sakai_global.content_profile.content_data.data["sakai:pooled-content-revurl"] = url;
            sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] = url;
            sakai_global.content_profile.content_data.data["sakai:preview-url"] = preview.url;
            sakai_global.content_profile.content_data.data["sakai:preview-type"] = preview.type;
            sakai_global.content_profile.content_data.data["sakai:preview-avatar"] = preview.avatar;
            sakai_global.content_profile.content_data.data["length"] = url.length;
            renderUrl(false);
            $.ajax({
                url: "/p/" + sakai_global.content_profile.content_data.data["jcr:name"] + ".html",
                type: "POST",
                cache: false,
                data: {
                    "sakai:pooled-content-url": url,
                    "sakai:pooled-content-revurl": url,
                    "sakai:pooled-content-file-name": url,
                    "sakai:preview-url": preview.url,
                    "sakai:preview-type": preview.type,
                    "sakai:preview-avatar": preview.avatar,
                    "length": url.length
                },
                success: function(){
                    createActivity("__MSG__UPDATED_URL__");
                    $(window).trigger("updated.version.content.sakai");
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
                        case "url":
                            renderUrl("edit");
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
                case "url":
                    updateUrl();
                    break;
                case "copyright":
                    updateCopyright();
                    break;
            }
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
            }, 400);
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
            renderUrl(false);
            renderCopyright(false);
            renderLocations(false);
            renderDetails(false);

            // Add binding
            addBinding();
        };

        $(window).bind("complete.fileupload.sakai", function(){
            $(window).trigger("load.content_profile.sakai", renderDetails);
        });

        $(window).bind("renderlocations.contentmetadata.sakai", function(ev, val){
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
        $(window).trigger("ready.contentmetadata.sakai");
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("contentmetadata");
});
