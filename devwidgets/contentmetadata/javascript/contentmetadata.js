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

        // Elements
        var contentmetadataDescriptionDisplay = "#contentmetadata_description_display";
        var $collapsibleContainers = $(".collapsible_container");
        var contentmetadataViewRevisions = "#contentmetadata_view_revisions";
        var $contentmetadataEditable = $(".contentmetadata_editable");
        var contentmetadataCancelSave = ".contentmetadata_cancel_save";
        var contentmetadataSave = ".contentmetadata_save";
        var contentmetadataInputEdit = ".contentmetadata_edit_input";

        // Autosuggest
        var $contentmetadataAutosuggestElt = false;

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

        // i18n
        var $contentmetadataUpdatedCopyright = $("#contentmetadata_updated_copyright");

        // Edit vars
        // ID of Input element that's focused, defines what to update
        var editingElement = "";
        var contentType = "";

        ////////////////////////
        ////// RENDERING ///////
        ////////////////////////

        /**
         * Add binding to the input elements that allow editting
         * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
         */
        var addEditBinding = function( mode, tags ) {
            if (mode === "edit") {
                if ($(".contentmetadata_edit_input").length) {
                    $(".contentmetadata_edit_input").focus();
                }
                if ( !tags ) {
                    $(contentmetadataInputEdit).blur( editInputBlur );
                } else {
                    sakai.api.Util.hideOnClickOut( $( ".autosuggest_wrapper", $contentmetadataTagsContainer ) , "#assignlocation_container, " + $contentmetadataTagsContainer.selector + " .autosuggest_wrapper", function() {
                      editInputBlur(false, "tags");
                    });
                }
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
            $contentmetadataDescriptionContainer.toggleClass("contentmetadata_editing", mode === "edit");
            $contentmetadataDescriptionContainer.html(sakai.api.Util.TemplateRenderer(contentmetadataDescriptionTemplate, json));
            addEditBinding(mode);
        };

        /**
         * Render the URL template
         * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
         */
        var renderUrl = function(mode){
            sakai_global.content_profile.content_data.mode = mode;
            contentType = sakai.api.Content.getMimeType(sakai_global.content_profile.content_data.data);
            if(contentType === "x-sakai/link") {
                var json = {
                    data: sakai_global.content_profile.content_data,
                    sakai: sakai
                };
                sakai.api.Util.TemplateRenderer(contentmetadataUrlTemplate, json, $contentmetadataUrlContainer);
                $contentmetadataUrlContainer.show();
                $contentmetadataTagsContainer.removeClass("last");
            } else {
                $contentmetadataUrlContainer.hide();
            }
            addEditBinding(mode);
        };

        var renderName = function(mode){
            if (mode === "edit") {
                $("#entity_name").hide();
                $("#entity_name_text").val($.trim($("#entity_name").attr("data-original-title") || $("#entity_name").text()));
                $("#entity_name_edit").show();
                $("#entity_name_text").focus();
            }
            $("#entity_name_text").unbind("blur");
            $("#entity_name_text").bind("blur", function(){
                $("#entity_name_edit").hide();
                var newTitle = $("#entity_name_text").val();
                var newDottedTitle = sakai.api.Util.applyThreeDots(newTitle, 800, {
                    whole_word: false
                }, "");
                if ($.trim(newTitle)) {
                    $("#entity_name").text(newDottedTitle);
                    $("#entity_name").attr("data-original-title", newTitle);
                    $("#entity_name").show();
                    $.ajax({
                        url: "/p/" + sakai_global.content_profile.content_data.data["_path"] + ".html",
                        type: "POST",
                        cache: false,
                        data: {
                            "sakai:pooled-content-file-name": newTitle
                        },
                        success: function(){
                            if (sakai.api.Content.Collections.isCollection(sakai_global.content_profile.content_data.data)){
                                // Change the group title as well
                                var groupId = sakai.api.Content.Collections.getCollectionGroupId(sakai_global.content_profile.content_data.data);
                                $.ajax({
                                    "url": "/system/userManager/group/" + groupId + ".update.json",
                                    "type": "POST",
                                    "data": {
                                        "sakai:group-title": newTitle
                                    },
                                    "success": function(){
                                        // Update the me object
                                        var memberships = sakai.api.Groups.getMemberships(sakai.data.me.groups, true);
                                        $.each(memberships.entry, function(index, membership){
                                            if (membership["sakai:group-id"] === groupId){
                                                membership["sakai:group-title"] = newTitle;
                                            }
                                        });
                                        finishChangeTitle(newTitle);
                                    }
                                });
                            } else {
                                finishChangeTitle(newTitle);
                            }
                        }
                    });
                }
                else {
                    $("#entity_name").show();
                    $(".entity_editable").live("click", editData);
                }
            });
        };

        var finishChangeTitle = function(newTitle){
            sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] = sakai.api.Security.safeOutput(newTitle);
            // Export as IMS Package
            if (sakai.api.Content.getMimeType(sakai_global.content_profile.content_data.data) === "x-sakai/document"){
                $("#contentpreview_download_button").attr("href", "/imscp/" + sakai_global.content_profile.content_data.data["_path"] + "/" + sakai.api.Util.safeURL(sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"]) + ".zip");
            // Download as a normal file
            } else {
                $("#contentpreview_download_button").attr("href", sakai_global.content_profile.content_data.smallPath + "/" + sakai.api.Util.safeURL(sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"]));
            }
        };

        /**
         * Render the Tags template
         * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
         */
        var renderTags = function(mode){
            sakai_global.content_profile.content_data.mode = mode;
            var json = {
                data: sakai_global.content_profile.content_data,
                sakai: sakai,
                tags: sakai.api.Util.formatTags(sakai_global.content_profile.content_data.data["sakai:tags"])
            };
            $contentmetadataTagsContainer.html(sakai.api.Util.TemplateRenderer(contentmetadataTagsTemplate, json));
            $contentmetadataTagsContainer.toggleClass("contentmetadata_editing", mode === "edit");
            $contentmetadataTagsContainer.toggleClass("contentmetadata_editable", mode !== "edit");
            if (mode === "edit") {
                $contentmetadataAutosuggestElt = $( "#contentmetadata_tags_tags" );
                sakai.api.Util.AutoSuggest.setupTagAndCategoryAutosuggest($contentmetadataAutosuggestElt , null, $( ".list_categories", $contentmetadataTagsContainer ), sakai_global.content_profile.content_data.data["sakai:tags"] );
                $( ".as-selections", $contentmetadataTagsContainer ).addClass( "contentmetadata_edit_input" );
                $contentmetadataAutosuggestElt.focus();
            }
            addEditBinding( mode, true );
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
            $contentmetadataCopyrightContainer.toggleClass("contentmetadata_editing", mode === "edit");
            $contentmetadataCopyrightContainer.html(sakai.api.Util.TemplateRenderer(contentmetadataCopyrightTemplate, json));
            addEditBinding(mode);
        };

        /**
         * Render the Details template
         * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
         */
        var renderDetails = function(mode){
            sakai_global.content_profile.content_data.mode = mode;
            sakai.api.Content.getCreatorProfile(sakai_global.content_profile.content_data.data, function(success, profile) {
                var json = {
                    data: sakai_global.content_profile.content_data,
                    sakai: sakai,
                    creator: profile
                };
                sakai.api.Util.TemplateRenderer(contentmetadataDetailsTemplate, json, $contentmetadataDetailsContainer);
                addEditBinding(mode);
            });
        };

        var createActivity = function(activityMessage){
            var activityData = {
                "sakai:activityMessage": activityMessage
            };
            sakai.api.Activity.createActivity("/p/" + sakai_global.content_profile.content_data.data["_path"], "content", "default", activityData, function(responseData, success){
                if (success) {
                    // update the entity widget with the new activity
                    $(window).trigger("updateContentActivity.entity.sakai", activityMessage);
                }
            });
        };

        ////////////////////////
        /////// EDITTING ///////
        ////////////////////////

        var updateTags = function(){
            var tags = sakai.api.Util.AutoSuggest.getTagsAndCategories( $contentmetadataAutosuggestElt, true );
            sakai.api.Util.tagEntity("/p/" + sakai_global.content_profile.content_data.data["_path"], tags, sakai_global.content_profile.content_data.data["sakai:tags"], function(success, newTags){
                sakai_global.content_profile.content_data.data["sakai:tags"] = newTags;
                renderTags(false);
                // Create an activity
                createActivity("UPDATED_TAGS");
            });
        };

        /**
         * Update the description of the content
         */
        var updateDescription = function(){
            var description = $("#contentmetadata_description_description").val();
            var url = "/p/" + sakai_global.content_profile.content_data.data["_path"] + ".json";
            sakai.api.Server.saveJSON(url, {"sakai:description": description}, function(success, data) {
                if (success) {
                    sakai_global.content_profile.content_data.data["sakai:description"] = description;
                    createActivity("UPDATED_DESCRIPTION");
                    renderDescription(false);
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
            sakai_global.content_profile.content_data.data["sakai:preview-url"] = preview.url;
            sakai_global.content_profile.content_data.data["sakai:preview-type"] = preview.type;
            sakai_global.content_profile.content_data.data["sakai:preview-avatar"] = preview.avatar;
            sakai_global.content_profile.content_data.data["length"] = url.length;
            renderUrl(false);
            $.ajax({
                url: "/p/" + sakai_global.content_profile.content_data.data["_path"] + ".html",
                type: "POST",
                cache: false,
                data: {
                    "sakai:pooled-content-url": url,
                    "sakai:pooled-content-revurl": url,
                    "sakai:preview-url": preview.url,
                    "sakai:preview-type": preview.type,
                    "sakai:preview-avatar": preview.avatar,
                    "length": url.length
                },
                success: function(){
                    createActivity("UPDATED_URL");
                    $(window).trigger("updated.version.content.sakai");
                }
            });
        };

        /**
         * Update the copyright of the content
         */
        var updateCopyright = function(){
            var copyright = $("#contentmetadata_copyright_copyright").val();
            var url = "/p/" + sakai_global.content_profile.content_data.data["_path"] + ".json";
            sakai.api.Server.saveJSON(url, {"sakai:copyright": copyright}, function(success, data) {
                if (success) {
                    sakai_global.content_profile.content_data.data["sakai:copyright"] = copyright;
                    renderCopyright(false);
                    createActivity("UPDATED_COPYRIGHT");
                }
            });
        };

        /**
         * Trigger the template to render the edit mode
         * @param {Object} ev Trigger event
         */
        var editData = function(ev){
            if ( !$( ev.target ).is( "a, select, option, textarea" ) ) {
                $target = $( ev.target ).closest( ".contentmetadata_editable" );
                if ( $target.length ) {
                    // Need to clear out any active editingElements before creating a new one
                    if (editingElement !== "") {
                        editInputBlur(false, editingElement);
                    }
                    editingElement = $target.attr( "data-edit-field" );
                    switch ( editingElement ) {
                        case "description":
                            renderDescription("edit");
                            break;
                        case "tags":
                            renderTags("edit");
                            break;
                        case "url":
                            renderUrl("edit");
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
         * @param {Object} e Element that lost the focus
         * @param {String} forceElt Force the editingElement here, to indicate that only that should be blurred
         */
        var editInputBlur = function( e, forceElt ) {
            if ( !e && forceElt !== editingElement ) {
                return;
            }
            switch ( editingElement ) {
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
            editingElement = "";
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
                height: 'toggle',
                opacity: 'toggle',
                'padding-top': 'toggle',
                'padding-bottom': 'toggle'
            }, 400);
            $("#contentmetadata_show_more > div").toggle();
            if (contentType === "x-sakai/link") {
                $contentmetadataUrlContainer.toggleClass("last");
            } else {
                $contentmetadataTagsContainer.toggleClass("last");
            }
        };

        /**
         * Add binding/events to the elements in the widget
         */
        var addBinding = function(){
            $(".contentmetadata_editable_for_maintainers").toggleClass("contentmetadata_editable", sakai_global.content_profile.content_data.isManager);

            $contentmetadataShowMore.die("click").live("click", animateData);

            $(".contentmetadata_editable").die("click").live("click", editData);

            $(contentmetadataViewRevisions).die("click").live("click", function() {
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
            renderDetails(false);

            // Add binding
            addBinding();
        };

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
