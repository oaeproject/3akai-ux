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
        var newaddcontentContainerNewItemFields = "#newaddcontent_container_newitem_fields";
        var newaddcontentContainerSelectedItemsContainer = "#newaddcontent_container_selecteditems_container";

        // Templates
        var newaddcontentUploadContentTemplate = "newaddcontent_upload_content_template";
        var newaddcontentAddDocumentTemplate = "newaddcontent_add_document_template";
        var newaddcontentAddExistingTemplate = "newaddcontent_add_existing_template";
        var newaddcontentAddLinkTemplate = "newaddcontent_add_link_template";
        var newaddcontentSelectedItemsTemplate = "newaddcontent_selecteditems_template";

        // Elements
        var newaddcontentContainerLHChoiceItem = ".newaddcontent_container_lhchoice_item";
        var newaddcontentContainerLHChoiceSelectedSubitem = ".newaddcontent_container_lhchoice_selected_subitem";
        var newaddcontentContainerLHChoiceSubItem = ".newaddcontent_container_lhchoice_subitem";
        var newaddcontentContainerNewItemAddToList = ".newaddcontent_container_newitem_add_to_list";
        var newaddcontentContainerStartUploadButton = ".newaddcontent_container_start_upload";
        var newaddcontentSelectedItemsRemove = ".newaddcontent_selecteditems_remove";

        // Classes
        var newaddcontentContainerLHChoiceSelectedItem = "newaddcontent_container_lhchoice_selected_item";
        var newaddcontentContainerLHChoiceItemClass = "newaddcontent_container_lhchoice_item";
        var newaddcontentContainerNewItemExtraRoundedBorderClass = "newaddcontent_container_newitem_extraroundedborder";
        var newaddcontentContainerLHChoiceSelectedSubitemClass = "newaddcontent_container_lhchoice_selected_subitem";

        // List Variables
        var itemsToUpload = [];

        // Paths
        var uploadPath = "/system/pool/createfile";


        /////////////////
        // ITEMS QUEUE //
        /////////////////

        var addContentToQueue = function(contentToAdd){
            itemsToUpload.push(contentToAdd);
            $(newaddcontentContainerSelectedItemsContainer).html(sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsTemplate,{"items": itemsToUpload}));
        };

        var removeItemToAdd = function(){
            itemsToUpload.splice($(this).parent()[0].id.split("newaddcontent_selecteditems_")[1],1);
            $(this).parent().remove();
            $(newaddcontentContainerSelectedItemsContainer).html(sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsTemplate,{"items": itemsToUpload}));
        };

        var constructItemToAdd = function(){
            switch($(this).parent().find("form")[0].id){
                case "newaddcontent_add_link_form":
                    var $linkForm = $(this).parent().find("form");
                    var linkObj = {
                        "url": $linkForm.find("#newaddcontent_add_link_url").val(),
                        "title": $linkForm.find("#newaddcontent_add_link_title").val(),
                        "description": $linkForm.find("#newaddcontent_add_link_description").val(),
                        "tags":$linkForm.find("#newaddcontent_add_link_tags").val(),
                        "css_class": "icon-url-sprite",
                        "type":"link"
                    }
                    addContentToQueue(linkObj);
                    break;
            }
            $(this).parent().find("form").reset();
        };

        ///////////////////////
        // UPLOADING ACTIONS //
        ///////////////////////

        var uploadLink = function(linkObj){
            var link = {
                "sakai:pooled-content-file-name": linkObj.title,
                "sakai:pooled-content-url": linkObj.url,
                "sakai:description": linkObj.description,
                "sakai:tags":linkObj.tags,
                "_mimeType": "x-sakai/link"
            };

            $.ajax({
                url: uploadPath,
                data: link,
                type: "POST",
                dataType: "JSON",
                success: function(data){
                    
                },
                error: function(err){
                    
                }
            });
        };

        var doUpload = function(){
            $.each(itemsToUpload, function(index,item){
                switch(item.type){
                    case "link":
                        uploadLink(item);
                        break;
                }
            });
            $(newaddcontentContainer).jqmHide();
        };

        ///////////////
        // RENDERING //
        ///////////////

        var renderUploadNewContent = function(){
            $(newaddcontentContainerNewItemFields).html(sakai.api.Util.TemplateRenderer(newaddcontentUploadContentTemplate,{}));
        };

        var renderNewDocument = function(){
            $(newaddcontentContainerNewItemFields).html(sakai.api.Util.TemplateRenderer(newaddcontentAddDocumentTemplate,{}));
        };

        var renderExistingContent = function(context){
            switch(context){
                case "everything":
                    $(newaddcontentContainerNewItemFields).html(sakai.api.Util.TemplateRenderer(newaddcontentAddExistingTemplate,{}));
                    break;
                case "my_content":
                    $(newaddcontentContainerNewItemFields).html(sakai.api.Util.TemplateRenderer(newaddcontentAddExistingTemplate,{}));
                    break;
                case "shared_with_me":
                    $(newaddcontentContainerNewItemFields).html(sakai.api.Util.TemplateRenderer(newaddcontentAddExistingTemplate,{}));
                    break;
            }
        };

        var renderAddLink = function(){
            $(newaddcontentContainerNewItemFields).html(sakai.api.Util.TemplateRenderer(newaddcontentAddLinkTemplate,{}));
        };

        ////////////////////
        // INITIALIZATION //
        ////////////////////

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


        /////////////
        // BINDING //
        /////////////

        var navigateMenu = function(){
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
                    break;
                case "newaddcontent_add_link":
                    renderAddLink();
                    break;
                case "": // No ID found on class -> subnav present
                    switch ($(this).children("ul").children(newaddcontentContainerLHChoiceSelectedSubitem)[0].id) {
                        case "newaddcontent_existing_content_everything":
                            renderExistingContent("everything");
                            break;
                        case "newaddcontent_existing_content_my_content":
                            renderExistingContent("my_content");
                            break;
                        case "newaddcontent_existing_content_shared_with_me":
                            renderExistingContent("shared_with_me");
                            break;
                    }
                    break;
            }
        };

        var navigateSubItem = function(){
            $(newaddcontentContainerLHChoiceSelectedSubitem).removeClass(newaddcontentContainerLHChoiceSelectedSubitemClass);
            $(this).addClass(newaddcontentContainerLHChoiceSelectedSubitemClass);
        };

        var removeBinding = function(){
            $(newaddcontentContainerLHChoiceItem).unbind("click", navigateMenu);
            $(newaddcontentContainerLHChoiceSubItem).unbind("click", navigateSubItem);
            $(newaddcontentContainerNewItemAddToList).unbind("click", constructItemToAdd);
            $(newaddcontentSelectedItemsRemove).die("click", removeItemToAdd);
            $(newaddcontentContainerStartUploadButton).unbind("click", doUpload);
        };

        var addBinding = function(){
            removeBinding();
            $(newaddcontentContainerLHChoiceItem).bind("click", navigateMenu);
            $(newaddcontentContainerLHChoiceSubItem).bind("click", navigateSubItem);
            $(newaddcontentContainerNewItemAddToList).bind("click", constructItemToAdd);
            $(newaddcontentSelectedItemsRemove).live("click", removeItemToAdd);
            $(newaddcontentContainerStartUploadButton).bind("click", doUpload);
        };

        var initialize = function(data){
            initializeJQM();
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