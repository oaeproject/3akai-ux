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

require(["jquery", "sakai/sakai.api.core"], function($, sakai){

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
    sakai_global.newaddcontent = function(tuid, showSettings){


        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var newaddcontentContainer = "#newaddcontent_container";
        var newaddcontentContainerNewItem = "#newaddcontent_container_newitem";
        var newaddcontentContainerSelectedItemsContainer = "#newaddcontent_container_selecteditems_container";
        var newaddcontentSelecteditemsEditDataContainer = "#newaddcontent_selecteditems_edit_data_container";
        var newaddcontentSelectedItemsEditPermissionsContainer = "#newaddcontent_selecteditems_edit_permissions_container";
        var newaddcontentSelectedItemsEditDataContainer = "#newaddcontent_selecteditems_edit_data_container";

        // Templates
        var newaddcontentUploadContentTemplate = "#newaddcontent_upload_content_template";
        var newaddcontentAddDocumentTemplate = "#newaddcontent_add_document_template";
        var newaddcontentExistingItemsListContainerList = "#newaddcontent_existingitems_list_container_list";
        var newaddcontentAddLinkTemplate = "#newaddcontent_add_link_template";
        var newaddcontentAddExistingTemplate = "#newaddcontent_add_existing_template";
        var newaddcontentSelectedItemsTemplate = "newaddcontent_selecteditems_template";
        var newaddcontentSelectedItemsEditPermissionsTemplates = "newaddcontent_selecteditems_edit_permissions_template";
        var newaddcontentSelectedItemsEditDataTemplate = "newaddcontent_selecteditems_edit_data_template";

        // Elements
        var newaddcontentContainerLHChoiceItem = ".newaddcontent_container_lhchoice_item";
        var newaddcontentContainerLHChoiceSelectedSubitem = ".newaddcontent_container_lhchoice_selected_subitem";
        var newaddcontentContainerLHChoiceSubItem = ".newaddcontent_container_lhchoice_subitem";
        var newaddcontentContainerNewItemAddToList = ".newaddcontent_container_newitem_add_to_list";
        var newaddcontentContainerStartUploadButton = ".newaddcontent_container_start_upload";
        var newaddcontentSelectedItemsRemove = ".newaddcontent_selecteditems_remove";
        var newaddcontentSelectedItemsActionsEdit = ".newaddcontent_selecteditems_actions_edit";
        var newaddcontentSelectedItemsActionsPermissions = ".newaddcontent_selecteditems_actions_permissions";
        var newaddcontentSelectedItemsEditDataClose = ".newaddcontent_selecteditems_edit_data_close";
        var newaddcontentContainerNewItemSaveChanges = ".newaddcontent_container_newitem_save_changes";
        var newaddcontentSelectedItemsEditIndex = ".newaddcontent_selecteditems_edit_index";
        var newaddcontentContainerNewItemRaquoRight = "#newaddcontent_container_newitem_raquo_right";
        var newaddcontentExistingItemsSearch = ".newaddcontent_existingitems_search";

        // Classes
        var newaddcontentContainerLHChoiceSelectedItem = "newaddcontent_container_lhchoice_selected_item";
        var newaddcontentContainerLHChoiceItemClass = "newaddcontent_container_lhchoice_item";
        var newaddcontentContainerNewItemExtraRoundedBorderClass = "newaddcontent_container_newitem_extraroundedborder";
        var newaddcontentContainerLHChoiceSelectedSubitemClass = "newaddcontent_container_lhchoice_selected_subitem";
        var newaddcontentContainerNewItemRaquoRightDocumentsposition = "newaddcontent_container_newitem_raquo_right_documentsposition";
        var newaddcontentContainerNewItemAddToListDocumentsposition = "newaddcontent_container_newitem_add_to_list_documentsposition";
        var newaddcontentContainerNewItemAddToListExistingContentposition = "newaddcontent_container_newitem_add_to_list_existingcontentposition";

        // List Variables
        var itemsToUpload = [];

        // Paths
        var uploadPath = "/system/pool/createfile";

        // Forms
        var newaddcontentUploadContentForm = "#newaddcontent_upload_content_form";

        var multifileQueueAddAllowed = true;
        var contentUploaded = false;
        var hideAfterContentUpload = false;


        /////////////////
        // ITEMS QUEUE //
        /////////////////

        var enableAddToQueue = function(){
            $(newaddcontentContainerNewItemAddToList).removeAttr("disabled");
        };

        var disableAddToQueue = function(){
            $(newaddcontentContainerNewItemAddToList).attr("disabled","disabled");
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
            $(newaddcontentContainerSelectedItemsContainer).html(sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsTemplate,{"items": itemsToUpload, "sakai":sakai}));
        };

        var resetQueue = function(){
            itemsToUpload = [];
            disableAddToQueue();
            $(newaddcontentContainerSelectedItemsContainer).html("");
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
            $(newaddcontentSelectedItemsEditPermissionsContainer).hide();
            $(newaddcontentSelectedItemsEditDataContainer).hide();

            var index = $(this).parent()[0].id.split("newaddcontent_selecteditems_")[1];
            var obj = itemsToUpload[index];

            if(obj.type == "content"){
                var $found = $("*:contains(\"" + obj.originaltitle + "\")");
                $found.last().prev("a").click();
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
            switch($(this).prev().children(":visible").find(".newaddcontent_form")[0].id){
                case "newaddcontent_add_link_form":
                    var $linkForm = $(this).parent().find("form");
                    var linkObj = {
                        "url": $linkForm.find("#newaddcontent_add_link_url").val(),
                        "title": $linkForm.find("#newaddcontent_add_link_title").val() || $linkForm.find("#newaddcontent_add_link_url").val(),
                        "description": $linkForm.find("#newaddcontent_add_link_description").val(),
                        "tags":$linkForm.find("#newaddcontent_add_link_tags").val(),
                        "permissions":"public",
                        "copyright":"creativecommons",
                        "css_class": "icon-url-sprite",
                        "type":"link"
                    };
                    addContentToQueue(linkObj);
                    $(this).parent().find("#newaddcontent_add_link_form").reset();
                    break;
                case "newaddcontent_upload_content_form":
                    var $contentForm = $(this).prev().children(":visible").find(".newaddcontent_form");
                    var contentObj = {
                        "originaltitle": $contentForm.find(".newaddcontent_upload_content_originaltitle")[0].id,
                        "title": $contentForm.find("#newaddcontent_upload_content_title").val(),
                        "description": $contentForm.find("#newaddcontent_upload_content_description").val(),
                        "tags": $contentForm.find("#newaddcontent_upload_content_tags").val(),
                        "permissions":$contentForm.find("#newaddcontent_upload_content_permissions").val(),
                        "copyright":"creativecommons",
                        "css_class": "icon-unknown-sprite",
                        "type":"content"
                    };
                    addContentToQueue(contentObj);
                    multifileQueueAddAllowed = true;
                    $contentForm.find("#newaddcontent_upload_content_title, #newaddcontent_upload_content_description, #newaddcontent_upload_content_tags").val("");
                    break;
                case "newaddcontent_add_document_form":
                    var $documentForm = $(this).prev().children(":visible").find(".newaddcontent_form");
                    var documentObj = {
                        "structure0": "TBD",
                        "title": $documentForm.find("#newaddcontent_add_document_title").val(),
                        "permissions": $documentForm.find("#newaddcontent_add_document_permissions").val(),
                        "description":$documentForm.find("#newaddcontent_add_document_description").val(),
                        "tags":$documentForm.find("#newaddcontent_add_document_tags").val(),
                        "copyright":"creativecommons",
                        "css_class": "icon-sakaidoc-sprite",
                        "type": "document"
                    };
                    addContentToQueue(documentObj);
                    $documentForm.reset();
                    break;
                case "newaddcontent_existing_content_form":
                    var $existingContentForm = $(this).prev().children(":visible").find(".newaddcontent_form");
                    $.each($existingContentForm.find(":checked"), function(index, item){
                        var contentObj = {
                            "title":$(item.nextElementSibling).text(),
                            "id":item.id,
                            "type":"existing",
                            "css_class": $(item).next().children(".newaddcontent_existingitems_list_container_list_item_icon")[0].classList[0]
                        };
                        addContentToQueue(contentObj);
                    });
                    break;
            }
        };

        /**
         * Show the pop up to enable the user to edit the permissions of a file in queue (permissions and copyright)
         */
        var changePermissions = function(){
            $(newaddcontentSelectedItemsEditDataContainer).hide();
            var index = $(this).parents("li")[0].id.split("_")[2];
            $(newaddcontentSelectedItemsEditPermissionsContainer).html(sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsEditPermissionsTemplates,{item: itemsToUpload[index], i:index, copyright:sakai.config.Permissions.Copyright, sakai:sakai}));
            $(newaddcontentSelectedItemsEditPermissionsContainer).show();
            $(newaddcontentSelectedItemsEditPermissionsContainer).css("left", $(this).parents("li").position().left + "px");
            $(newaddcontentSelectedItemsEditPermissionsContainer).css("top", $(this).parents("li").position().top + 40 + "px");
        };

        /**
         * Show the pop up to enable the user to edit the data of a file in queue (description, tags and title)
         */
        var editData = function(){
            $(newaddcontentSelectedItemsEditPermissionsContainer).hide();
            var index = $(this).parents("li")[0].id.split("_")[2];
            $(newaddcontentSelectedItemsEditDataContainer).html(sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsEditDataTemplate,{item: itemsToUpload[index], i:index}));
            $(newaddcontentSelecteditemsEditDataContainer).show();
            $(newaddcontentSelecteditemsEditDataContainer).css("left", $(this).parents("li").position().left + "px");
            $(newaddcontentSelecteditemsEditDataContainer).css("top", $(this).parents("li").position().top + 40 + "px");
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
            if ($(newaddcontentSelecteditemsEditDataContainer).is(":visible")) {
                itemsToUpload[index].title = $(newaddcontentSelecteditemsEditDataContainer + " #newaddcontent_selecteditems_edit_data_title").val();
                itemsToUpload[index].description = $(newaddcontentSelecteditemsEditDataContainer + " #newaddcontent_selecteditems_edit_data_description").val();
                itemsToUpload[index].tags = $(newaddcontentSelecteditemsEditDataContainer + " #newaddcontent_selecteditems_edit_data_tags").val();
            }else{
                itemsToUpload[index].permissions = $(newaddcontentSelectedItemsEditPermissionsContainer + " #newaddcontent_selecteditems_edit_permissions_permissions").val();
                itemsToUpload[index].copyright = $(newaddcontentSelectedItemsEditPermissionsContainer + " #newaddcontent_selecteditems_edit_permissions_copyright").val();
            }
            $(this).parent().parent().hide();
            renderQueue();
        };


        ///////////////////////
        // UPLOADING ACTIONS //
        ///////////////////////

        var triggerFilesUploaded = function(){
            sakai.api.Util.notification.show(sakai.api.i18n.General.getValueForKey("MY_LIBRARY"), sakai.api.i18n.General.getValueForKey("MY_LIBRARY_ADDED"));
            $(window).trigger("complete.fileupload.sakai");
        };

        var createDocument = function(documentObj){
            var document = {
                "sakai:pooled-content-file-name": documentObj.title,
                "sakai:description": documentObj.description,
                "sakai:permissions": documentObj.permissions,
                "sakai:copyright": documentObj.copyright,
                "sakai:tags":documentObj.tags,
                "structure0":documentObj["structure0"],
                "sakai:custom-mimetype": "x-sakai/document"
            };

            $.ajax({
                url: uploadPath,
                data: document,
                type: "POST",
                dataType: "JSON",
                success: function(data){
                    document.hashpath = data["_contentItem"];
                    document.permissions = document["sakai:permissions"];
                    sakai.api.Content.setFilePermissions([document], false);
                },
                error: function(err){

                }
            });
        };

        /**
         * Upload a link
         * @param {Object} linkObj object containing all information necessary to upload a link
         */
        var uploadLink = function(linkObj){
            var link = {
                "sakai:pooled-content-file-name": linkObj.title,
                "sakai:pooled-content-url": linkObj.url,
                "sakai:description": linkObj.description,
                "sakai:permissions": linkObj.permissions,
                "sakai:copyright": linkObj.copyright,
                "sakai:tags":linkObj.tags,
                "sakai:custom-mimetype": "x-sakai/link"
            };

            $.ajax({
                url: uploadPath,
                data: link,
                type: "POST",
                dataType: "JSON",
                success: function(data){
                    linkObj.hashpath = data["_contentItem"];
                    sakai.api.Content.setFilePermissions([linkObj], false);
                }
            });
        };

        var setDataOnContent = function(data){
            var objArr = [];
            $.each(itemsToUpload, function(i,arrayItem){
                if(arrayItem.type == "content"){
                    $.each(data, function(ii, savedItem){
                        if (savedItem.filename == arrayItem.originaltitle) {
                            savedItem.permissions = arrayItem.permissions;
                            var obj = {
                                "url": "/p/" + savedItem.hashpath,
                                "method": "POST",
                                "parameters": {
                                    "sakai:description": arrayItem.description,
                                    "sakai:fileextension": savedItem.filename.substring(savedItem.filename.lastIndexOf("."), savedItem.filename.length),
                                    "sakai:pooled-content-file-name": arrayItem.title,
                                    "sakai:permissions": arrayItem.permissions,
                                    "sakai:copyright": arrayItem.copyright,
                                    "sakai:allowcomments": "true",
                                    "sakai:showcomments": "true"
                                }
                            };
                            objArr.push(obj);
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
                    triggerFilesUploaded();
                    $(newaddcontentContainer).jqmHide();
                }, error: function(){
                    triggerFilesUploaded();
                    $(newaddcontentContainer).jqmHide();
                }
            });

        };

        var uploadContent = function(){
            $(newaddcontentUploadContentForm).attr("action", uploadPath);
            $(newaddcontentUploadContentForm).ajaxForm({
                success: function(data){
                    var responseData = {};
                    if (jQuery.browser.webkit) {
                        responseData = $.parseJSON(data.split(">")[1].split("<")[0]);
                    } else {
                        responseData = $.parseJSON(data.replace(/<pre>/i, "").replace(/<\/pre>/i, ""));
                    }
                    var extractedData = [];
                    for (var i in responseData) {
                        if (responseData.hasOwnProperty(i)) {
                            var obj = {};
                            obj.filename = i;
                            obj.hashpath = responseData[i];
                            extractedData.push(obj);
                        }
                    }
                    setDataOnContent(extractedData);
                },
                error: function(){
                    debug.log("error");
                }
            });
            $(newaddcontentUploadContentForm).submit();
        };

        var addToLibrary = function(item){
            sakai.api.Content.addToLibrary(item.id, sakai.data.me.user.userid, false);
        };

        /**
         * Execute the upload of the files in the queue by calling the functions needed for the specific type of content
         */
        var doUpload = function(){
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
                        break;
                }
            });
            if(contentUploaded){
                hideAfterContentUpload = true;
            }else{
                triggerFilesUploaded();
                $(newaddcontentContainer).jqmHide();
            }
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

        var preFillContentFields = function(fileName){
            $("#newaddcontent_upload_content_fields #newaddcontent_upload_content_title").val(fileName);
            $("#newaddcontent_upload_content_fields .newaddcontent_upload_content_originaltitle")[0].id = fileName;
        };


        ///////////////
        // RENDERING //
        ///////////////

        var checkFieldValidToAdd = function(){
            if ($(this).attr("type") == "text") {
                var val = $.trim($(this).val());
                if (val) {
                    enableAddToQueue();
                }
                else {
                    disableAddToQueue();
                }
            }else{
                if ($("#newaddcontent_existing_content_form input[type=checkbox]:checked").length) {
                    enableAddToQueue();
                }else{
                    disableAddToQueue();
                }
            }
        };

        var showSelectedItem = function($selected){
            $(".newaddcontent_newitem_container").hide();
            $selected.show();
        };

        /**
         * Show the interface to upload new content
         */
        var renderUploadNewContent = function(){
            showSelectedItem($(newaddcontentUploadContentTemplate));
            $("input[type=file].multi").MultiFile({
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
        };

        /**
         * Show the interface to add a new document
         */
        var renderNewDocument = function(){
            showSelectedItem($(newaddcontentAddDocumentTemplate));
        };

        var searchAndRenderExistingContent = function(context, $container, q){
            var searchURL = "";
            switch(context){
                case "everything":
                    searchURL = "/var/search/pool/all.infinity.json?items=10&q=" + q;
                    break;
                case "my_content":
                    searchURL = "/var/search/pool/me/manager.json?items=10&q=" + q;
                    break;
                case "shared_with_me":
                    searchURL = "/var/search/pool/me/viewer.json?items=10&q=" + q;
                    break;
            }

            $.ajax({
                url: searchURL,
                type: "GET",
                success: function(data){
                    $container.html(sakai.api.Util.TemplateRenderer("newaddcontent_existingitems_template", {"data": data, "sakai":sakai}));
                },
                error: function(err){

                }
            });
        };

        /**
         * Decide what context to render to add existing content
         * @param {Object} context The context that will help decide what to render
         */
        var renderExistingContent = function(context, q){
            if (!q) {
                q = "*";
            }
            $(newaddcontentExistingItemsSearch)[0].id = "search_" + context;
            switch(context){
                case "everything":
                    showSelectedItem($(newaddcontentAddExistingTemplate));
                    searchAndRenderExistingContent(context, $(newaddcontentExistingItemsListContainerList), q);
                    break;
                case "my_content":
                    showSelectedItem($(newaddcontentAddExistingTemplate));
                    searchAndRenderExistingContent(context, $(newaddcontentExistingItemsListContainerList), q);
                    break;
                case "shared_with_me":
                    showSelectedItem($(newaddcontentAddExistingTemplate));
                    searchAndRenderExistingContent(context, $(newaddcontentExistingItemsListContainerList), q);
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

        var prepareContentSearch = function(){
            var query = $.trim($(this).val());
            var context = $(this)[0].id.split("search_")[1];
            renderExistingContent(context, query);
        };


        ////////////////
        // NAVIGATION //
        ////////////////

        var resetMenu = function(){
            $(newaddcontentContainerNewItem).removeClass(newaddcontentContainerNewItemExtraRoundedBorderClass);
            $(newaddcontentContainerLHChoiceItem).removeClass(newaddcontentContainerLHChoiceSelectedItem);
            $("#newaddcontent_upload_content").addClass(newaddcontentContainerLHChoiceSelectedItem);
        };

        /**
         * Decide what to render when the menu is navigated
         * Add/remove some CSS classes to show/hide rounded borders etc.
         */
        var navigateMenu = function(){
            disableAddToQueue();
            $(newaddcontentContainerNewItemRaquoRight).removeClass(newaddcontentContainerNewItemRaquoRightDocumentsposition);
            $(newaddcontentContainerNewItemAddToList).removeClass(newaddcontentContainerNewItemAddToListDocumentsposition);
            $(newaddcontentContainerNewItemAddToList).removeClass(newaddcontentContainerNewItemAddToListExistingContentposition);
            if ($(this).prev().hasClass(newaddcontentContainerLHChoiceItemClass)) {
                $(newaddcontentContainerNewItem).addClass(newaddcontentContainerNewItemExtraRoundedBorderClass);
            }
            else {
                $(newaddcontentContainerNewItem).removeClass(newaddcontentContainerNewItemExtraRoundedBorderClass);
            }
            $(newaddcontentContainerLHChoiceItem).removeClass(newaddcontentContainerLHChoiceSelectedItem);
            $(this).addClass(newaddcontentContainerLHChoiceSelectedItem);

            switch ($(this)[0].id) {
                case "newaddcontent_upload_content":
                    renderUploadNewContent();
                    break;
                case "newaddcontent_new_document":
                    renderNewDocument();
                    $(newaddcontentContainerNewItemRaquoRight).addClass(newaddcontentContainerNewItemRaquoRightDocumentsposition);
                    $(newaddcontentContainerNewItemAddToList).addClass(newaddcontentContainerNewItemAddToListDocumentsposition);
                    break;
                case "newaddcontent_add_link":
                    renderAddLink();
                    break;
                case "": // No ID found on class -> subnav present
                    switch ($(this).children("ul").children(newaddcontentContainerLHChoiceSelectedSubitem)[0].id) {
                        case "newaddcontent_existing_content_everything":
                            renderExistingContent("everything");
                            $(newaddcontentContainerNewItemAddToList).addClass(newaddcontentContainerNewItemAddToListExistingContentposition);
                            break;
                        case "newaddcontent_existing_content_my_content":
                            renderExistingContent("my_content");
                            $(newaddcontentContainerNewItemAddToList).addClass(newaddcontentContainerNewItemAddToListExistingContentposition);
                            break;
                        case "newaddcontent_existing_content_shared_with_me":
                            renderExistingContent("shared_with_me");
                            $(newaddcontentContainerNewItemAddToList).addClass(newaddcontentContainerNewItemAddToListExistingContentposition);
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
            $(newaddcontentContainerLHChoiceItem).unbind("click", navigateMenu);
            $(newaddcontentContainerLHChoiceSubItem).unbind("click", navigateSubItem);
            $(newaddcontentContainerNewItemAddToList).unbind("click", constructItemToAdd);
            $(newaddcontentContainerStartUploadButton).unbind("click", doUpload);
            $(newaddcontentSelectedItemsEditDataClose).die("click", closeEditData);
            $(newaddcontentContainerNewItemSaveChanges).die("click", saveEdit);
            $(newaddcontentSelectedItemsRemove).die("click", removeItemToAdd);
            $(newaddcontentSelectedItemsActionsPermissions).die("click", changePermissions);
            $(newaddcontentSelectedItemsActionsEdit).die("click", editData);
        };

        /**
         * Add binding to all elements
         */
        var addBinding = function(){
            $(newaddcontentContainerLHChoiceItem).bind("click", navigateMenu);
            $(newaddcontentContainerLHChoiceSubItem).bind("click", navigateSubItem);
            $(newaddcontentContainerNewItemAddToList).bind("click", constructItemToAdd);
            $(newaddcontentContainerStartUploadButton).bind("click", doUpload);
            $(newaddcontentSelectedItemsEditDataClose).live("click", closeEditData);
            $(newaddcontentContainerNewItemSaveChanges).live("click", saveEdit);
            $(newaddcontentSelectedItemsRemove).live("click", removeItemToAdd);
            $(newaddcontentSelectedItemsActionsPermissions).live("click", changePermissions);
            $(newaddcontentSelectedItemsActionsEdit).live("click", editData);
            $(newaddcontentExistingItemsSearch).keyup(prepareContentSearch);
            $("#newaddcontent_add_document_form #newaddcontent_add_document_title").keyup(checkFieldValidToAdd);
            $("#newaddcontent_existing_content_form input").live("click",checkFieldValidToAdd);

            $("#newaddcontent_add_link_form").validate({
                success: function(){
                    enableAddToQueue();
                }
            });

            $("#newaddcontent_add_link_form #newaddcontent_add_link_url").blur(function(){
                $("#newaddcontent_add_link_form").submit(function(){
                    return false;
                });
                if($("#newaddcontent_add_link_form").validate().errorList.length){
                    disableAddToQueue();
                }
            });
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Initialize the modal dialog
         */
        var initializeJQM = function(){
            var $newaddcontentContainer = $(newaddcontentContainer);
            $(newaddcontentContainer).jqm({
                modal: true,
                overlay: 20,
                toTop: true
            });

            // position dialog box at users scroll position
            var htmlScrollPos = $("html").scrollTop();
            var docScrollPos = $(document).scrollTop();
            if (htmlScrollPos > 0) {
                $newaddcontentContainer.css({
                    "top": htmlScrollPos + 100 + "px"
                });
            } else if (docScrollPos > 0) {
                $newaddcontentContainer.css({
                    "top": docScrollPos + 100 + "px"
                });
            }
            $(newaddcontentContainer).jqmShow();
        };

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