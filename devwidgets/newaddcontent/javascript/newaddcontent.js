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
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */
/*global $ */

require(["jquery", "/dev/configuration/sakaidoc.js", "sakai/sakai.api.core"], function($, sakaidocConfig, sakai){

    /**
     * @name sakai_global.newaddcontent
     *
     * @class newaddcontent
     *
     * @description
     * Initialize the add content widget - This widget adds content to a site
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.newaddcontent = function(tuid, showSettings) {

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var $newaddcontentContainer = $("#newaddcontent_container");
        var $newaddcontentContainerNewItem = $("#newaddcontent_container_newitem");
        var $newaddcontentContainerSelectedItemsContainer = $("#newaddcontent_container_selecteditems_container");
        var $newaddcontentSelecteditemsEditDataContainer = $("#newaddcontent_selecteditems_edit_data_container");
        var newaddcontentSelecteditemsEditDataContainer = "#newaddcontent_selecteditems_edit_data_container";
        var $newaddcontentSelectedItemsEditPermissionsContainer = $("#newaddcontent_selecteditems_edit_permissions_container");
        var newaddcontentSelectedItemsEditPermissionsContainer = "#newaddcontent_selecteditems_edit_permissions_container";
        var $newaddcontentNewItemContainer = $(".newaddcontent_newitem_container");

        // Templates
        var newaddcontentUploadContentTemplate = "#newaddcontent_upload_content_template";
        var newaddcontentAddDocumentTemplate = "#newaddcontent_add_document_template";
        var newaddcontentExistingItemsListContainerList = "#newaddcontent_existingitems_list_container_list";
        var newaddcontentAddLinkTemplate = "#newaddcontent_add_link_template";
        var newaddcontentAddExistingTemplate = "#newaddcontent_add_existing_template";
        var newaddcontentSelectedItemsTemplate = "newaddcontent_selecteditems_template";
        var newaddcontentSelectedItemsEditPermissionsTemplates = "newaddcontent_selecteditems_edit_permissions_template";
        var newaddcontentSelectedItemsEditDataTemplate = "newaddcontent_selecteditems_edit_data_template";
        var newaddcontentExistingItemsTemplate = "newaddcontent_existingitems_template";

        // Elements
        var $newaddcontentContainerLHChoiceItem = $(".newaddcontent_container_lhchoice_item");
        var newaddcontentContainerLHChoiceSelectedSubitem = ".newaddcontent_container_lhchoice_selected_subitem";
        var $newaddcontentContainerLHChoiceSubItem = $(".newaddcontent_container_lhchoice_subitem");
        var $newaddcontentContainerNewItemAddToList = $(".newaddcontent_container_newitem_add_to_list");
        var newaddcontentContainerStartUploadButton = ".newaddcontent_container_start_upload";
        var newaddcontentSelectedItemsRemove = ".newaddcontent_selecteditems_remove";
        var newaddcontentSelectedItemsActionsEdit = ".newaddcontent_selecteditems_actions_edit";
        var newaddcontentSelectedItemsActionsPermissions = ".newaddcontent_selecteditems_actions_permissions";
        var newaddcontentSelectedItemsEditDataClose = ".newaddcontent_selecteditems_edit_data_close";
        var newaddcontentContainerNewItemSaveChanges = ".newaddcontent_container_newitem_save_changes";
        var newaddcontentSelectedItemsEditIndex = ".newaddcontent_selecteditems_edit_index";
        var $newaddcontentContainerNewItemRaquoRight = $("#newaddcontent_container_newitem_raquo_right");
        var $newaddcontentExistingItemsSearch = $(".newaddcontent_existingitems_search");
        var newaddcontentAddLinkURL = "#newaddcontent_add_link_url";
        var newaddcontentAddLinkTitle = "#newaddcontent_add_link_title";
        var newaddcontentAddLinkDescription = "#newaddcontent_add_link_description";
        var newaddcontentAddLinkTags = "#newaddcontent_add_link_tags";
        var newaddcontentUploadContentOriginalTitle = ".newaddcontent_upload_content_originaltitle";
        var newaddcontentUploadContentTitle = "#newaddcontent_upload_content_title";
        var newaddcontentUploadContentDescription = "#newaddcontent_upload_content_description";
        var newaddcontentUploadContentTags = "#newaddcontent_upload_content_tags";
        var newaddcontentUploadContentPermissions = "#newaddcontent_upload_content_permissions";
        var newaddcontentAddDocumentTitle = "#newaddcontent_add_document_title";
        var newaddcontentAddDocumentPermissions = "#newaddcontent_add_document_permissions";
        var newaddcontentAddDocumentDescription = "#newaddcontent_add_document_description";
        var newaddcontentAddDocumentTags = "#newaddcontent_add_document_tags";
        var newaddcontentExistingItemsListContainerListItemIcon = ".newaddcontent_existingitems_list_container_list_item_icon";
        var newaddcontentSelectedItemsEditDataTitle = "#newaddcontent_selecteditems_edit_data_title";
        var newaddcontentSelectedItemsEditDataDescription = " #newaddcontent_selecteditems_edit_data_description";
        var newaddcontentSelectedItemsEditDataTags = " #newaddcontent_selecteditems_edit_data_tags";
        var newaddcontentSelectedItemsEditPermissionsPermissions = "#newaddcontent_selecteditems_edit_permissions_permissions";
        var newaddcontentSelectedItemsEditPermissionsCopyright = "#newaddcontent_selecteditems_edit_permissions_copyright";
        var newaddcontentUploadContentFields = "#newaddcontent_upload_content_fields";
        var newaddcontentSaveTo = "#newaddcontent_saveto";

        // Classes
        var newaddcontentContainerLHChoiceSelectedItem = "newaddcontent_container_lhchoice_selected_item";
        var newaddcontentContainerLHChoiceItemClass = "newaddcontent_container_lhchoice_item";
        var newaddcontentContainerNewItemExtraRoundedBorderClass = "newaddcontent_container_newitem_extraroundedborder";
        var newaddcontentContainerLHChoiceSelectedSubitemClass = "newaddcontent_container_lhchoice_selected_subitem";
        var newaddcontentContainerNewItemRaquoRightDocumentsposition = "newaddcontent_container_newitem_raquo_right_documentsposition";
        var newaddcontentContainerNewItemAddToListDocumentsposition = "newaddcontent_container_newitem_add_to_list_documentsposition";
        var newaddcontentContainerNewItemAddToListExistingContentposition = "newaddcontent_container_newitem_add_to_list_existingcontentposition";
        var newaddcontentExistingItemsListContainerDisabledListItem = "newaddcontent_existingitems_list_container_disabled_list_item";

        // List Variables
        var itemsToUpload = [];
        var itemsUploaded = 0;
        var brandNewContent = {};
        var allNewContent = [];
        var lastUpload = [];
        var libraryToUploadTo = "";

        // Paths
        var uploadPath = "/system/pool/createfile";

        // Forms
        var $newaddcontentUploadContentForm = $("#newaddcontent_upload_content_form");
        var newAddContentForm = ".newaddcontent_form";
        var newaddcontentAddLinkForm = "#newaddcontent_add_link_form";
        var $newaddcontentAddLinkForm = $("#newaddcontent_add_link_form");
        var newaddcontentExistingContentForm = "#newaddcontent_existing_content_form";
        var newaddcontentAddDocumentForm = "#newaddcontent_add_document_form";
        var newaddcontentExistingClear = "#newaddcontent_existingitems_search_clear";
        var newaddcontentExistingCheckAll = "#newaddcontent_existingitems_list_container_actions_checkall";

        var multifileQueueAddAllowed = true;
        var contentUploaded = false;
        var hideAfterContentUpload = false;
        var currentExistingContext = false;

        var currentSelectedLibrary = sakai.data.me.user.userid;
        if (sakai_global.group2 && sakai_global.group2.groupId){
            currentSelectedLibrary = sakai_global.group2.groupId;
        }

        ////////////////////////////////
        // Get newly uploaded content //
        ////////////////////////////////

        sakai_global.newaddcontent.getNewList = function(_data, library, offset, max) {
            var data = $.extend({}, _data),
                newAdditions = 0,
                newContentLibrary = [];
            // grab all of the newly uploaded content, regardless of target library
            if (!library) {
                newContentLibrary = allNewContent;
            } else {
                newContentLibrary = brandNewContent[library];
            }
            if (newContentLibrary && newContentLibrary.length) {
                var newContent = $.merge([], newContentLibrary);
                // only use the amount from the current page number
                newContent = _.rest(newContent, offset * max);
                $.each(newContent, function(i, elt) {
                    var exists = false;
                    $.each(data.results, function(j, result) {
                        if (result._path === elt._path) {
                            exists = true;
                        }
                    });
                    if (!exists) {
                        // put the element as the first result
                        data.results = $.merge([elt], data.results);
                        // modify the results to be the proper length
                        data.results = _.first(data.results, max);
                        newAdditions++;
                    }
                });
            }
            data.total += newAdditions;
            return data;
        };

        var deleteContent = function(e, obj) {
            if (obj && obj.path) {
                $.each(obj.path, function(i, path) {
                    path = path.replace("/p/", "");
                    $.each(allNewContent, function(j, newContent) {
                        if (newContent._path === path) {
                            allNewContent.splice(j,1);
                        }
                    });
                    $.each(brandNewContent, function(lib, items) {
                        $.each(items, function(k, item) {
                            if (item._path === path) {
                                items.splice(k,1);
                            }
                        });
                    });
                });
            }
        };

        /////////////////
        // ITEMS QUEUE //
        /////////////////

        /**
         * Following 4 functions enable or disable the buttons that
         *  - add items to the queue
         *  - upload items to the repository
         */
        var enableAddToQueue = function(){
            $newaddcontentContainerNewItemAddToList.removeAttr("disabled");
        };

        var disableAddToQueue = function(){
            $newaddcontentContainerNewItemAddToList.attr("disabled","disabled");
        };

        var enableStartUpload = function(){
            $(newaddcontentContainerStartUploadButton).removeAttr("disabled");
        };

        var disableStartUpload = function(){
            $(newaddcontentContainerStartUploadButton).attr("disabled","disabled");
        };

        /**
         * Render the queue
         */
        var renderQueue = function(){
            $newaddcontentContainerSelectedItemsContainer.html(sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsTemplate, {
                "items": itemsToUpload,
                "sakai": sakai,
                "me": sakai.data.me,
                "currentSelectedLibrary": currentSelectedLibrary
            }));
        };

        var greyOutExistingInLibrary = function(){
            currentSelectedLibrary = $(newaddcontentSaveTo).val();
            renderQueue();
        };

        var resetQueue = function(){
            itemsToUpload = [];
            itemsUploaded = 0;
            disableAddToQueue();
            renderQueue();
            $(".MultiFile-remove").click();
        };

        /**
         * Add an item to the queue
         * @param {Object} contentToAdd Object containing data about the object to be added to the queue
         */
        var addContentToQueue = function(contentToAdd){
            itemsToUpload.push(contentToAdd);
            disableAddToQueue();
            enableStartUpload();
            renderQueue();
        };

        /**
         * Remove an item from the queue
         */
        var removeItemToAdd = function(){
            $newaddcontentSelectedItemsEditPermissionsContainer.hide();
            $newaddcontentSelecteditemsEditDataContainer.hide();

            var index = $(this).parent()[0].id.split("newaddcontent_selecteditems_")[1];
            var obj = itemsToUpload[index];

            switch (obj.type){
                case "content":
                    var $found = $("*:contains(\"" + obj.originaltitle + "\")");
                    $found.last().prev("a").click();
                    break;
                case "existing":
                    var $existing = $("input#" + obj.id);
                    $existing.removeAttr("disabled");
                    $existing.removeAttr("checked");
                    $existing.parent().removeClass(newaddcontentExistingItemsListContainerDisabledListItem);
                    break;
            }

            itemsToUpload.splice(index,1);

            if (!itemsToUpload.length){
                disableStartUpload();
            }

            renderQueue();
        };

        /**
         * Construct an item to add to the queue
         * Depending on the type of the item to add construct a different object
         */
        var constructItemToAdd = function(){
            switch($(this).prev().children(":visible").find(newAddContentForm)[0].id){
                case "newaddcontent_add_link_form":
                    var $linkForm = $(this).parent().find("form");
                    var linkObj = {
                        "url": $linkForm.find(newaddcontentAddLinkURL).val(),
                        "title": $linkForm.find(newaddcontentAddLinkTitle).val() || $linkForm.find(newaddcontentAddLinkURL).val(),
                        "description": $linkForm.find(newaddcontentAddLinkDescription).val(),
                        "tags":$linkForm.find(newaddcontentAddLinkTags).val(),
                        "permissions":"public",
                        "copyright":"creativecommons",
                        "css_class": "icon-url-sprite",
                        "type":"link"
                    };
                    addContentToQueue(linkObj);
                    $(this).parent().find(newaddcontentAddLinkForm).reset();
                    break;
                case "newaddcontent_upload_content_form":
                    var $contentForm = $(this).prev().children(":visible").find(newAddContentForm);
                    var originalTitle = $contentForm.find(newaddcontentUploadContentOriginalTitle)[0].id;
                    var contentObj = {
                        "originaltitle": originalTitle,
                        "title": $contentForm.find(newaddcontentUploadContentTitle).val(),
                        "description": $contentForm.find(newaddcontentUploadContentDescription).val(),
                        "tags": $contentForm.find(newaddcontentUploadContentTags).val(),
                        "permissions": $contentForm.find(newaddcontentUploadContentPermissions).val(),
                        "copyright": $("#newaddcontent_upload_content_copyright").val(),
                        "css_class": sakai.config.MimeTypes[sakai.config.Extensions[(originalTitle).slice(originalTitle.lastIndexOf(".") + 1, originalTitle.length).toLowerCase()] || "other"].cssClass || "icon-unknown-sprite",
                        "type": "content"
                    };
                    addContentToQueue(contentObj);
                    multifileQueueAddAllowed = true;
                    $contentForm.find(newaddcontentUploadContentTitle + ", " + newaddcontentUploadContentDescription + ", " + newaddcontentUploadContentTags).val("");
                    break;
                case "newaddcontent_add_document_form":
                    var $documentForm = $(this).prev().children(":visible").find(newAddContentForm);
                    var documentObj = {
                        "structure0": "TBD",
                        "title": $documentForm.find(newaddcontentAddDocumentTitle).val(),
                        "permissions": $documentForm.find(newaddcontentAddDocumentPermissions).val(),
                        "description": $documentForm.find(newaddcontentAddDocumentDescription).val(),
                        "tags": $documentForm.find(newaddcontentAddDocumentTags).val(),
                        "copyright": "creativecommons",
                        "css_class": "icon-sakaidoc-sprite",
                        "type": "document"
                    };
                    addContentToQueue(documentObj);
                    $documentForm.reset();
                    break;
                case "newaddcontent_existing_content_form":
                    var $existingContentForm = $(this).prev().children(":visible").find(newAddContentForm);
                    $.each($existingContentForm.find(":checked"), function(index, item){
                        if (!$(item).is(":disabled")) {
                            var viewers = [];
                            if ($(item).data("sakai-pooled-content-viewer")){
                                viewers = $(item).data("sakai-pooled-content-viewer").split(",");
                            }
                            var managers = [];
                            if ($(item).data("sakai-pooled-content-manager")){
                                managers = $(item).data("sakai-pooled-content-manager").split(",");
                            }
                            var contentObj = {
                                "title": $(item).next().text(),
                                "id": item.id,
                                "viewers": viewers,
                                "managers": managers,
                                "type": "existing",
                                "css_class": $(item).next().children(newaddcontentExistingItemsListContainerListItemIcon)[0].id
                            };
                            addContentToQueue(contentObj);
                            $(item).attr("disabled", "disabled");
                            $(item).parent().addClass(newaddcontentExistingItemsListContainerDisabledListItem);
                        }
                    });
                    break;
            }
        };

        /**
         * Show the pop up to enable the user to edit the permissions of a file in queue (permissions and copyright)
         */
        var changePermissions = function(){
            $newaddcontentSelecteditemsEditDataContainer.hide();
            var index = $(this).parents("li")[0].id.split("_")[2];
            $newaddcontentSelectedItemsEditPermissionsContainer.html(sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsEditPermissionsTemplates,{item: itemsToUpload[index], i:index, copyright:sakai.config.Permissions.Copyright, sakai:sakai}));
            $newaddcontentSelectedItemsEditPermissionsContainer.show();
            $newaddcontentSelectedItemsEditPermissionsContainer.css("left", $(this).parents("li").position().left + "px");
            $newaddcontentSelectedItemsEditPermissionsContainer.css("top", $(this).parents("li").position().top + 40 + "px");
        };

        /**
         * Show the pop up to enable the user to edit the data of a file in queue (description, tags and title)
         */
        var editData = function(){
            $newaddcontentSelectedItemsEditPermissionsContainer.hide();
            var index = $(this).parents("li")[0].id.split("_")[2];
            $newaddcontentSelecteditemsEditDataContainer.html(sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsEditDataTemplate,{item: itemsToUpload[index], i:index}));
            $newaddcontentSelecteditemsEditDataContainer.show();
            $newaddcontentSelecteditemsEditDataContainer.css("left", $(this).parents("li").position().left + "px");
            $newaddcontentSelecteditemsEditDataContainer.css("top", $(this).parents("li").position().top + 40 + "px");
        };

        /**
         * Close the edit popup
         */
        var closeEditData = function(){
            $(this).parent().parent().hide();
        };

        /**
         * Save the changes made to a file in the queue
         */
        var saveEdit = function(){
            var index = $(newaddcontentSelectedItemsEditIndex)[0].id;
            if ($newaddcontentSelecteditemsEditDataContainer.is(":visible")) {
                itemsToUpload[index].title = $(newaddcontentSelecteditemsEditDataContainer + " " + newaddcontentSelectedItemsEditDataTitle).val();
                itemsToUpload[index].description = $(newaddcontentSelecteditemsEditDataContainer + " " + newaddcontentSelectedItemsEditDataDescription).val();
                itemsToUpload[index].tags = $(newaddcontentSelecteditemsEditDataContainer + " " + newaddcontentSelectedItemsEditDataTags).val();
            }else{
                itemsToUpload[index].permissions = $(newaddcontentSelectedItemsEditPermissionsContainer + " " + newaddcontentSelectedItemsEditPermissionsPermissions).val();
                itemsToUpload[index].copyright = $(newaddcontentSelectedItemsEditPermissionsContainer + " " + newaddcontentSelectedItemsEditPermissionsCopyright).val();
            }
            $(this).parent().parent().hide();
            renderQueue();
        };


        ///////////////////////
        // UPLOADING ACTIONS //
        ///////////////////////

        /**
         * Check if all items have been uploaded
         */
        var checkUploadCompleted = function(files){
            if (files) {
                $.each(itemsToUpload, function(index, item){
                    if (item.type == "content") {
                        itemsUploaded++;
                    }
                });
            } else {
                itemsUploaded++;
            }
            if(itemsToUpload.length === itemsUploaded) {
                $(window).trigger("done.newaddcontent.sakai", [lastUpload, libraryToUploadTo]);
                brandNewContent[libraryToUploadTo] = brandNewContent[libraryToUploadTo] || [];
                _.uniq($.merge(brandNewContent[libraryToUploadTo], lastUpload));
                _.uniq($.merge(allNewContent, lastUpload));
                lastUpload = [];
                $newaddcontentContainer.jqmHide();
                var librarytitle = $(newaddcontentSaveTo + " option:selected").text();
                sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("LIBRARY"), sakai.api.Util.TemplateRenderer("newaddcontent_notification_finished_template", {
                    me: sakai.data.me,
                    libraryid: libraryToUploadTo,
                    librarytitle: librarytitle
                }));
            }
        };

        var proofTitle = function(input){
            return input.replace(/=/g,"_").replace(/\//g, "_");
        };

        /**
         * Creates a sakaidocument
         * @param {Object} documentObj Object containing data needed to create a sakai document
         */
        var createDocument = function(documentObj){
            var refID = sakai.api.Util.generateWidgetId();
            var document = {
                "sakai:pooled-content-file-name": proofTitle(documentObj.title),
                "sakai:description": documentObj.description,
                "sakai:permissions": documentObj.permissions,
                "sakai:copyright": documentObj.copyright,
                "structure0": $.toJSON({
                    "page1": {
                        "_ref": refID,
                        "_order": 0,
                        "_title": "Page Title 1",
                        "main": {
                            "_ref": refID,
                            "_order": 0,
                            "_title": "Page Title 1"
                        }
                    } 
                }),
                "sakai:custom-mimetype": "x-sakai/document"
            };

            $.ajax({
                url: uploadPath,
                data: document,
                type: "POST",
                dataType: "json",
                success: function(data) {
                    lastUpload.push(data._contentItem.item);
                    var content = {};
                    content[refID] = {
                        "page": sakaidocConfig.defaultContent
                    };
                    $.ajax({
                        url: "/p/" + data._contentItem.poolId + ".resource",
                        type: "POST",
                        dataType: "json",
                        data: {
                            ":operation": "import",
                            ":contentType": "json",
                            ":replace": true,
                            ":replaceProperties": true,
                            "_charset_":"utf-8",
                            ":content": $.toJSON(content)
                        },
                        success: function() {
                            // add pageContent in non-replace mode to support versioning
                            $.ajax({
                                url: "/p/" + data._contentItem.poolId + "/" + refID + ".save.json",
                                type: "POST",
                                data: {
                                    "sling:resourceType": "sakai/pagecontent",
                                    "sakai:pagecontent": content,
                                    "_charset_": "utf-8"
                                }
                            });
                            sakai.api.Util.tagEntity("/p/" + data._contentItem.poolId, documentObj.tags.split(","));
                            checkUploadCompleted();
                        },
                        error: function() {
                            checkUploadCompleted();
                        }
                    });
                    document.hashpath = data["_contentItem"].poolId;
                    document.permissions = document["sakai:permissions"];
                    sakai.api.Content.setFilePermissions([document], function(){
                        addToLibrary(data._contentItem, true);
                    });
                },
                error: function(err){
                    checkUploadCompleted();
                }
            });
        };

        /**
         * Upload a link
         * @param {Object} linkObj object containing all information necessary to upload a link
         */
        var uploadLink = function(linkObj){
            var preview = sakai.api.Content.getPreviewUrl(linkObj.url);
            var link = {
                "sakai:pooled-content-file-name": proofTitle(linkObj.title),
                "sakai:pooled-content-url": linkObj.url,
                "sakai:description": linkObj.description,
                "sakai:permissions": linkObj.permissions,
                "sakai:copyright": linkObj.copyright,
                "sakai:custom-mimetype": "x-sakai/link",
                "sakai:preview-url": preview.url,
                "sakai:preview-type": preview.type,
                "sakai:preview-avatar": preview.avatar
            };

            $.ajax({
                url: uploadPath,
                data: link,
                type: "POST",
                dataType: "JSON",
                success: function(data){
                    lastUpload.push(data._contentItem.item);
                    linkObj.hashpath = data._contentItem.poolId;
                    sakai.api.Util.tagEntity("/p/" + linkObj.hashpath.poolId, linkObj.tags.split(","));
                    sakai.api.Content.setFilePermissions([linkObj], function(){
                        addToLibrary(data._contentItem, true);
                        checkUploadCompleted();
                    });
                },
                error: function() {
                    checkUploadCompleted();
                }
            });
        };

        /**
         * Set extra data (title, description,...) on a piece of uploaded content
         * @param {Object} data Contains ID's returned from the server to construct the POST URL and title with
         */
        var setDataOnContent = function(data){
            var objArr = [];
            $.each(itemsToUpload, function(i,arrayItem){
                if(arrayItem.type == "content"){
                    $.each(data, function(ii, savedItem){
                        if (savedItem.filename == arrayItem.originaltitle) {
                            arrayItem.hashpath = savedItem.hashpath;
                            savedItem.permissions = arrayItem.permissions;
                            savedItem.hashpath = savedItem.hashpath.poolId;

                            objArr.push({
                                "url": "/p/" + savedItem.hashpath,
                                "method": "POST",
                                "parameters": {
                                    "sakai:description": arrayItem.description,
                                    "sakai:fileextension": savedItem.filename.substring(savedItem.filename.lastIndexOf("."), savedItem.filename.length),
                                    "sakai:pooled-content-file-name": proofTitle(arrayItem.title),
                                    "sakai:permissions": arrayItem.permissions,
                                    "sakai:copyright": arrayItem.copyright,
                                    "sakai:allowcomments": "true",
                                    "sakai:showcomments": "true"
                                }
                            });

                            if(libraryToUploadTo !== sakai.data.me.user.userid){
                                objArr.push({
                                    url: "/p/" + savedItem.hashpath + ".members.json",
                                    parameters: {
                                        ":viewer": libraryToUploadTo
                                    },
                                    method: "POST"
                                });
                            }

                            // Set initial version
                            objArr.push({
                                "url": "/p/" + savedItem.hashpath + ".save.json",
                                "method": "POST",
                                "parameters": {}
                            });
                        }
                    });
                }
            });

            sakai.api.Content.setFilePermissions(data, false);

            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                cache: false,
                data: {
                    requests: $.toJSON(objArr)
                },
                success: function(data){
                    // save tags
                    $.each(itemsToUpload, function(i,arrayItem){
                        if (arrayItem.hashpath && arrayItem.hashpath.poolId) {
                            sakai.api.Util.tagEntity("/p/" + arrayItem.hashpath.poolId, arrayItem.tags.split(","));
                        }
                    });

                    checkUploadCompleted(true);
                }, error: function(){
                    checkUploadCompleted(true);
                }
            });

        };

        /**
         * Execute the multifile upload
         */
        var uploadContent = function(){
            $newaddcontentUploadContentForm.attr("action", uploadPath);
            $newaddcontentUploadContentForm.ajaxForm({
                dataType: "json",
                success: function(data){
                    var extractedData = [];
                    for (var i in data) {
                        if (data.hasOwnProperty(i)) {
                            lastUpload.push(data[i].item);
                            var obj = {};
                            obj.filename = i;
                            obj.hashpath = data[i];
                            extractedData.push(obj);
                        }
                    }
                    setDataOnContent(extractedData);
                },
                error: function(){
                    checkUploadCompleted();
                }
            });
            $newaddcontentUploadContentForm.submit();
        };

        /**
         * Add an already existing item to your own library
         * @param {Object} item Item to be added to your own library
         */
        var addToLibrary = function(item, newitem){
            var doShare = true;
            // Check whether existing items already have it shared
            if (item.id) {
                if ($.inArray(libraryToUploadTo, item.managers) !== -1 || $.inArray(libraryToUploadTo, item.viewers) !== -1) {
                    doShare = false;
                }
            }
            if (newitem){
                if (libraryToUploadTo === sakai.data.me.user.userid){
                    doShare = false;
                }
            }
            if (doShare) {
                sakai.api.Content.addToLibrary(item.id || item.poolId, libraryToUploadTo);
            }
        };

        /**
         * Execute the upload of the files in the queue by calling the functions needed for the specific type of content
         */
        var doUpload = function(){
            libraryToUploadTo = $(newaddcontentSaveTo).val();
            $.each(itemsToUpload, function(index,item){
                switch(item.type){
                    case "link":
                        uploadLink(item);
                        break;
                    case "content":
                        if (!contentUploaded) {
                            uploadContent();
                            contentUploaded = true;
                        }
                        break;
                    case "document":
                        createDocument(item);
                        break;
                    case "existing":
                        addToLibrary(item);
                        lastUpload.push({
                            _path: item.id,
                            "sakai:pooled-content-file-name": $.trim(item.title)
                        });
                        checkUploadCompleted();
                        break;
                }
            });
        };


        ////////////////////////
        // MULTIFILE SPECIFIC //
        ////////////////////////

        /**
         * If the user selects another file after already selecting a first file
         * and has not added that first file to the list of files to be uploaded
         * the first file should be deleted from the multifile list as the user
         * hasn't indicated it wants that first file to be uploaded. In this case
         * it could be that the wrong file was selected, or the user changed his
         * mind.
         */
        var decideTrashPrev = function(){
            if (multifileQueueAddAllowed) {
                return false;
            } else {
                return true;
            }
        };

        /**
         * Prefill some of the extra data a file can have
         * @param {String} fileName Name of the selected file
         */
        var preFillContentFields = function(fileName){
            if (fileName.indexOf("\\") !== -1){
                fileName = fileName.split("\\")[fileName.split("\\").length - 1];
            }
            $(newaddcontentUploadContentFields + " " + newaddcontentUploadContentTitle).val(fileName);
            $(newaddcontentUploadContentFields + " " + newaddcontentUploadContentOriginalTitle)[0].id = fileName;
        };


        ///////////////
        // RENDERING //
        ///////////////

        /**
         * Check if a field is valid and the button to add to the list should be enabled
         */
        var checkFieldValidToAdd = function(){
            if ($(this).attr("type") == "text") {
                var val = $.trim($(this).val());
                if (val) {
                    enableAddToQueue();
                } else {
                    disableAddToQueue();
                }
            } else {
                if ($(newaddcontentExistingContentForm + " input[type=checkbox]:checked:enabled").length) {
                    enableAddToQueue();
                } else {
                    disableAddToQueue();
                }
            }
        };

        /**
         * Show a selected navigation item
         * @param {Object} $selected Selected navigation item
         */
        var showSelectedItem = function($selected){
            $newaddcontentNewItemContainer.hide();
            $selected.show();
        };

        /**
         * Show the interface to upload new content
         */
        var renderUploadNewContent = function(){
            showSelectedItem($(newaddcontentUploadContentTemplate));
            $("#newaddcontent_upload_content_form input").MultiFile({
                afterFileSelect: function(element, fileName, master_element){
                    var trashPrev = decideTrashPrev();
                    if (trashPrev){
                        // Remove the previously added file
                        $(".MultiFile-list").children().last().prev().find("a").click();
                    }
                    multifileQueueAddAllowed = false;
                    preFillContentFields(fileName);
                    enableAddToQueue();
                }
            });
            $("#newaddcontent_upload_content_copyright_container").html(sakai.api.Util.TemplateRenderer("newaddcontent_copyright_template", {
                copyright: sakai.config.Permissions.Copyright,
                sakai: sakai
            }));
        };

        /**
         * Show the interface to add a new document
         */
        var renderNewDocument = function(){
            showSelectedItem($(newaddcontentAddDocumentTemplate));
        };

        var searchPaging = function(pagenum){
            prepareContentSearch(pagenum);
        };

        var searchAndRenderExistingContent = function($container, q, pagenum){
            pagenum = pagenum || 1;
            var searchURL = "";
            switch(currentExistingContext){
                case "everything":
                    if (q === "*") {
                        searchURL = "/var/search/pool/all-all.infinity.json?items=10&page=" + (pagenum - 1);
                    } else {
                        searchURL = "/var/search/pool/all.infinity.json?items=10&page=" + (pagenum - 1) + "&q=" + q;
                    }
                    break;
                case "my_library":
                    searchURL = "/var/search/pool/manager-viewer.json?userid=" + sakai.data.me.user.userid + "&items=10&page=" + (pagenum - 1) + "&q=" + q;
                    break;
            }

            $.ajax({
                url: searchURL,
                type: "GET",
                success: function(data){
                    var existingIDs = [];
                    $.each(itemsToUpload, function(index, item){
                        if(item.type == "existing"){
                            existingIDs.push(item.id);
                        }
                    });
                    $container.html(sakai.api.Util.TemplateRenderer(newaddcontentExistingItemsTemplate, {"data": data, "query":q, "sakai":sakai, "queue":existingIDs, "context":currentExistingContext}));
                    var numberOfPages = Math.ceil(data.total / 10);
                    $("#newaddcontent_existingitems_paging").pager({
                        pagenumber: pagenum,
                        pagecount: numberOfPages,
                        buttonClickCallback: searchPaging
                    });
                    if (numberOfPages > 1){
                        $("#newaddcontent_existingitems_paging").show();
                    } else {
                        $("#newaddcontent_existingitems_paging").hide();
                    }
                },
                error: function(err){

                }
            });
        };

        /**
         * Decide what context to render to add existing content
         * @param {Object} context The context that will help decide what to render
         */
        var renderExistingContent = function(q, pagenum){
            if (!q) {
                q = "*";
            }
            switch(currentExistingContext){
                case "everything":
                    showSelectedItem($(newaddcontentAddExistingTemplate));
                    searchAndRenderExistingContent($(newaddcontentExistingItemsListContainerList), q, pagenum);
                    break;
                case "my_library":
                    showSelectedItem($(newaddcontentAddExistingTemplate));
                    searchAndRenderExistingContent($(newaddcontentExistingItemsListContainerList), q, pagenum);
                    break;
            }
        };

        /**
         * Show the interface to add a link
         */
        var renderAddLink = function(){
            showSelectedItem($(newaddcontentAddLinkTemplate));
        };


        ////////////////////
        // CONTENT SEARCH //
        ////////////////////

        /**
         * Clear the input of the search field and list all items
         */
        var clearSearchQuery = function(){
            if ($(".newaddcontent_existingitems_search").val()) {
                $(".newaddcontent_existingitems_search").val("");
                prepareContentSearch();
            }
        };

        /**
         * Check/uncheck all of the displayed results
         */
        var checkUncheckAll = function(){
            if ($(newaddcontentExistingCheckAll).is(':checked')){
                $(".newaddcontent_existingitems_select_checkbox:enabled", $(newaddcontentExistingItemsListContainerList)).attr("checked", "checked");
            } else {
                $(".newaddcontent_existingitems_select_checkbox:enabled", $(newaddcontentExistingItemsListContainerList)).removeAttr("checked");
            }
            checkFieldValidToAdd();
        };

        /**
         * Prepare and call the function to render existing content in a list
         */
        var prepareContentSearch = function(pagenum){
            var query = $.trim($newaddcontentExistingItemsSearch.val());
            renderExistingContent(query, pagenum);
        };


        ////////////////
        // NAVIGATION //
        ////////////////

        /**
         * Reset the menu to its original state
         */
        var resetMenu = function(){
            $newaddcontentContainerNewItem.removeClass(newaddcontentContainerNewItemExtraRoundedBorderClass);
            $newaddcontentContainerLHChoiceItem.removeClass(newaddcontentContainerLHChoiceSelectedItem);
            $("#newaddcontent_upload_content").addClass(newaddcontentContainerLHChoiceSelectedItem);

            if (sakai.config.Permissions.Content.defaultaccess){
                $("#newaddcontent_upload_content_permissions [value=" + sakai.config.Permissions.Content.defaultaccess + "]").attr("selected", "selected");
            }
            if (sakai.config.Permissions.Documents.defaultaccess){
                $("#newaddcontent_add_document_permissions [value=" + sakai.config.Permissions.Documents.defaultaccess + "]").attr("selected", "selected");
            }
        };

        /**
         * Decide what to render when the menu is navigated
         * Add/remove some CSS classes to show/hide rounded borders etc.
         */
        var navigateMenu = function(){
            disableAddToQueue();
            $newaddcontentContainerNewItemRaquoRight.removeClass(newaddcontentContainerNewItemRaquoRightDocumentsposition);
            $newaddcontentContainerNewItemAddToList.removeClass(newaddcontentContainerNewItemAddToListDocumentsposition);
            $newaddcontentContainerNewItemAddToList.removeClass(newaddcontentContainerNewItemAddToListExistingContentposition);
            if ($(this).prev().hasClass(newaddcontentContainerLHChoiceItemClass)) {
                $newaddcontentContainerNewItem.addClass(newaddcontentContainerNewItemExtraRoundedBorderClass);
            }
            else {
                $newaddcontentContainerNewItem.removeClass(newaddcontentContainerNewItemExtraRoundedBorderClass);
            }
            $newaddcontentContainerLHChoiceItem.removeClass(newaddcontentContainerLHChoiceSelectedItem);
            $(this).addClass(newaddcontentContainerLHChoiceSelectedItem);

            switch ($(this)[0].id) {
                case "newaddcontent_upload_content":
                    renderUploadNewContent();
                    break;
                case "newaddcontent_new_document":
                    renderNewDocument();
                    $newaddcontentContainerNewItemRaquoRight.addClass(newaddcontentContainerNewItemRaquoRightDocumentsposition);
                    $newaddcontentContainerNewItemAddToList.addClass(newaddcontentContainerNewItemAddToListDocumentsposition);
                    break;
                case "newaddcontent_add_link":
                    renderAddLink();
                    break;
                default: // No ID found on class -> subnav present
                    switch ($(this).children("ul").children(newaddcontentContainerLHChoiceSelectedSubitem)[0].id) {
                        case "newaddcontent_existing_content_everything":
                            currentExistingContext = "everything";
                            renderExistingContent($newaddcontentExistingItemsSearch.val());
                            $newaddcontentContainerNewItemAddToList.addClass(newaddcontentContainerNewItemAddToListExistingContentposition);
                            break;
                        case "newaddcontent_existing_content_my_library":
                            currentExistingContext = "my_library";
                            renderExistingContent($newaddcontentExistingItemsSearch.val());
                            $newaddcontentContainerNewItemAddToList.addClass(newaddcontentContainerNewItemAddToListExistingContentposition);
                            break;
                    }
                    break;
            }
        };

        /**
         * Executed when a subitem in the navigation has been clicked
         */
        var navigateSubItem = function(){
            $(newaddcontentContainerLHChoiceSelectedSubitem).removeClass(newaddcontentContainerLHChoiceSelectedSubitemClass);
            $(this).addClass(newaddcontentContainerLHChoiceSelectedSubitemClass);
        };


        /////////////
        // BINDING //
        /////////////

        /**
         * Remove binding on all elements
         */
        var removeBinding = function(){
            $newaddcontentContainerLHChoiceItem.unbind("click", navigateMenu);
            $newaddcontentContainerLHChoiceSubItem.unbind("click", navigateSubItem);
            $newaddcontentContainerNewItemAddToList.unbind("click", constructItemToAdd);
            $(newaddcontentContainerStartUploadButton).unbind("click", doUpload);
            $(newaddcontentSelectedItemsEditDataClose).die("click", closeEditData);
            $(newaddcontentContainerNewItemSaveChanges).die("click", saveEdit);
            $(newaddcontentSelectedItemsRemove).die("click", removeItemToAdd);
            $(newaddcontentSelectedItemsActionsPermissions).die("click", changePermissions);
            $(newaddcontentSelectedItemsActionsEdit).die("click", editData);
            $(window).unbind("init.deletecontent.sakai", deleteContent);
        };

        /**
         * Add binding to all elements
         */
        var addBinding = function(){
            $newaddcontentContainerLHChoiceItem.bind("click", navigateMenu);
            $newaddcontentContainerLHChoiceSubItem.bind("click", navigateSubItem);
            $newaddcontentContainerNewItemAddToList.bind("click", constructItemToAdd);
            $(newaddcontentContainerStartUploadButton).bind("click", doUpload);
            $(newaddcontentSelectedItemsEditDataClose).live("click", closeEditData);
            $(newaddcontentContainerNewItemSaveChanges).live("click", saveEdit);
            $(newaddcontentSelectedItemsRemove).live("click", removeItemToAdd);
            $(newaddcontentSelectedItemsActionsPermissions).live("click", changePermissions);
            $(newaddcontentSelectedItemsActionsEdit).live("click", editData);
            $newaddcontentExistingItemsSearch.keyup(prepareContentSearch);
            $(newaddcontentAddDocumentForm + " " + newaddcontentAddDocumentTitle).keyup(checkFieldValidToAdd);
            $(newaddcontentExistingContentForm + " input").live("click",checkFieldValidToAdd);
            $(newaddcontentExistingClear).live("click", clearSearchQuery);
            $(newaddcontentExistingCheckAll).live("change", checkUncheckAll);
            $(newaddcontentSaveTo).live("change", greyOutExistingInLibrary);

            $newaddcontentAddLinkForm.validate({
                success: function(){
                    enableAddToQueue();
                }
            });

            $(newaddcontentAddLinkForm + " " + newaddcontentAddLinkURL).blur(function(){
                $newaddcontentAddLinkForm.submit(function(){
                    return false;
                });
                if($newaddcontentAddLinkForm.validate().errorList.length){
                    disableAddToQueue();
                }
            });
            $(window).bind("done.deletecontent.sakai", deleteContent);
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Initialize the modal dialog
         */
        var initializeJQM = function(){
            $newaddcontentContainer.jqm({
                modal: true,
                overlay: 20,
                toTop: true
            });
            $newaddcontentContainer.jqmShow();
        };

        /**
         * Call all functions and reset all variables needed to get the widget
         * into the original startup state
         */
        var resetWidget = function(){
            removeBinding();
            resetQueue();
            resetMenu();
            disableAddToQueue();
            disableStartUpload();
            multifileQueueAddAllowed = true;
            contentUploaded = false;
            hideAfterContentUpload = false;
        };

        /**
         * Initialize the widget
         */
        var initialize = function(){
            initializeJQM();
            resetWidget();
            addBinding();
            renderUploadNewContent();
        };


        ////////////
        // EVENTS //
        ////////////

        $(window).bind("init.newaddcontent.sakai", function(e, data){
            initialize();
        });

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("newaddcontent");
});