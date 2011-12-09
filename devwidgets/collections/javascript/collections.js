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

// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.collections
     *
     * @class collections
     *
     * @description
     * My Hello World is a dashboard widget that says hello to the current user
     * with text in the color of their choosing
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.collections = function (tuid, showSettings) {

        var itemsToShow = 20;
        var contentToAdd = [];

        var subnavigationAddCollectionLink = "#subnavigation_add_collection_link";
        var collectorToggle = ".collector_toggle";
        var collectionsTotal = "#topnavigation_user_collections_total";
        var $collectionsWidget = $(".collections_widget");

        var collectionsNoCollections = "#collections_nocollections";
        var collectionsCollectionsList = "#collections_collections_list";

        // Buttons, links, etc.
        var collectionsCloseButton = "#collections_close_button";
        var collectionsNewButton = "#collections_new_button";
        var collectionsAddNewContainer = "#collections_add_new";
        var collectionsNewActionButtons = "#collections_new_action_buttons";
        var collectionsCancelNewButton = ".collections_cancel_new_button";
        var collectionsMainCancelNewButton = "#collections_main_cancel_new_button";
        var collectionsAddNewNextStepLabel = ".collections_add_new_nextsteplabel";
        var collectionsSeeAllButton = "#collections_see_all_button";
        var collectionsSeeAllButtonTotal = "#collections_see_all_total_count";
        var collectionsSaveNewButton = "#collections_save_new_button";
        var collectionsNewCollectionPermission = "#collections_newcollection_permissions";
        var collectionCountsContentCountsNew = "#collection_counts_content_counts_new";

        // Classes
        var collectionsAddNewSteps = ".collections_add_new_steps";
        var collectionsScrollArrow = ".collections_scroll_arrow";
        var collectionsLargePreview = "collections_large_preview";

        // New collection steps
        var collectionsAddNewStepOne = "#collections_add_new_stepone";
        var collectionsAddNewStepTwo = "#collections_add_new_steptwo";
        var collectionsAddNewStepThree = "#collections_add_new_stepthree";


        ///////////////////////////
        // CREATE NEW COLLECTION //
        ///////////////////////////

        var resetGUI = function(){
            $(collectionsAddNewSteps).hide();
            $(collectionsAddNewContainer).hide();
            $(collectionsNewActionButtons).hide();
            $(collectionsCollectionsList).hide();
            $(collectionsScrollArrow).hide();
            $(collectionsSeeAllButton).hide();
            $(collectionsAddNewStepOne).show();
            $(collectionsNewButton).show();
        };

        /**
        * Enable creation of collection and enable elements
        */
        var initializeNewCollectionsSetup = function(ev, _contentToAdd){
            resetGUI();
            contentToAdd = _contentToAdd || [];
            $(collectionCountsContentCountsNew).text("" + contentToAdd.length);
            $(collectionsNewButton).hide();
            $(collectionsNoCollections).hide();
            $(collectionsAddNewContainer).show();
            $(collectionsNewActionButtons).show();
            $("#collections_collection_title").focus();
            if (!$collectionsWidget.is(":visible")){
                $collectionsWidget.animate({
                    'margin-bottom': 'toggle',
                    'height': 'toggle',
                    'opacity': 'toggle',
                    'padding-top': 'toggle',
                    'padding-bottom': 'toggle'
               }, 400);
            }
        };

        /**
        * Determine the screen to display
        */
        var switchDisplay = function(collections){
            resetGUI();
            if(collections.total){
                collections.sakai = sakai;
                sakai.api.Util.TemplateRenderer("collections_collections_list_template", collections, $(collectionsCollectionsList));
                $(collectionsCollectionsList).show();
                $("#collections_carousel").jcarousel({
                    animation: "slow",
                    easing: "swing",
                    scroll: 4,
                    start: 0,
                    initCallback: carouselBinding,
                    itemFallbackDimension: 77
                });
                if (collections.total > 4) {
                    $(collectionsScrollArrow).show();
                    $(collectionsSeeAllButton).show();
                    $(collectionsSeeAllButtonTotal).text("" + sakai.api.Content.Collections.getMyCollectionsCount());
                } else {
                    $(collectionsScrollArrow).hide();
                    $(collectionsSeeAllButton).hide();
                }
                initializeDesktopDD(collections.results);
            } else {
                $(collectionsNoCollections).show();
            }
        }

        var carouselBinding = function(carousel){
            $("#collections_scroll_right").unbind("click");
            $("#collections_scroll_right").bind("click", function(){
                carousel.next();
            });
            $("#collections_scroll_left").unbind("click");
            $("#collections_scroll_left").bind("click", function(){
                carousel.prev();
            });
        };

        var expandCollection = function(){
            if($(this).hasClass(collectionsLargePreview) && !$(this).hasClass("fixed-collapsed")){
                var pageOn = parseInt($(this).attr("data-sakai-page"), 10);
                var collectionId = $(this).attr("data-sakai-collection-id");
                $("." + collectionsLargePreview + "[data-sakai-page='" + pageOn + "']").addClass("collapsed");
                $("." + collectionsLargePreview + "[data-sakai-page='" + pageOn + "'] .collections_collection_title_short").show();
                $("." + collectionsLargePreview + "[data-sakai-page='" + pageOn + "'] .collections_collection_title_long").hide();
                $(this).removeClass("collapsed");
                $(".collections_collection_title_short", $(this)).hide();
                $(".collections_collection_title_long", $(this)).show();
                getRecentContent(collectionId);
            }
        };

        var createNewCollection = function(){
            $("#collections_collection_title").attr("disabled", "disabled");
            sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey("CREATING_YOUR_COLLECTION", "collections"), sakai.api.i18n.getValueForKey("WONT_BE_LONG", "collections"));
            var title = $.trim($("#collections_collection_title").val()) || sakai.api.i18n.getValueForKey("UNTITLED_COLLECTION", "collections");
            var permissions = $(collectionsNewCollectionPermission).val();
            sakai.api.Content.Collections.createCollection(title, "", permissions, [], contentToAdd, [], function(){
                getCollections(false);
                $("#topnavigation_user_collections_total").text("" + sakai.api.Content.Collections.getMyCollectionsCount());
                sakai.api.Util.progressIndicator.hideProgressIndicator();
                $("#collections_collection_title").val("");
                $("#collections_collection_title").removeAttr("disabled");
                sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("COLLECTION_CREATED"), sakai.api.i18n.getValueForKey("COLLECTION_CREATED_LONG"));
                var t = setTimeout("$('#collection_title_0').focus()", 1000);
            });
        };

        ///////////////////////////////////////////
        // RETRIEVE RECENT CONTENT IN COLLECTION //
        ///////////////////////////////////////////

        var getRecentContent = function(collectionIds){
            if (_.isString(collectionIds)){
                collectionIds = [collectionIds];
            }
            var batchRequest = [];
            $.each(collectionIds, function(index, collectionId){
                batchRequest.push({
                    "url": sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER,
                    "method":"GET",
                    "cache":false,
                    "dataType":"json",
                    "parameters": {
                        "sortOn": "_lastModified",
                        "sortOrder": "desc",
                        "userid": sakai.api.Content.Collections.getCollectionGroupId(collectionId),
                        "items": 3,
                        "page": 0
                    }
                });
            });
            sakai.api.Server.batch(batchRequest, function(success, response){
                $.each(response.results, function(i, dataItem){
                    var contentItems = $.parseJSON(dataItem.body);
                    contentItems.sakai = sakai;
                    $("ul[data-sakai-collection-id='" + collectionIds[i] + "']").html(sakai.api.Util.TemplateRenderer("collections_collections_recentcontent_template", contentItems));
                });
            });
        }

        /////////////////////////////////////////
        // DRAG AND DROP ITEMS IN FROM DESKTOP //
        /////////////////////////////////////////

        var filesToUpload = [];

        var finishInitializeDD = function(collectionid, permissions){
            $("#collection_drop_" + collectionid).fileupload({
                url: "/system/pool/createfile",
                drop: function (ev, data) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    if (($(ev.target).is("#collection_drop_" + collectionid) || $("#collection_drop_" + collectionid).find($(ev.target)).length) && data.files){
                        $.each(data.files, function (index, file) {
                            if (file.size > 0){
                                filesToUpload.push(file);
                            }
                        });
                        if (filesToUpload.length){
                            sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey("UPLOADING_CONTENT_ADDING_TO_COLLECTION", "collections"), sakai.api.i18n.getValueForKey("WONT_BE_LONG", "collections"));
                            uploadFile(collectionid, permissions);
                        }
                    }
                }
            });
        };

        var addToCollectionCount = function(collectionId, amount){
            var $contentCountEl = $("." + collectionsLargePreview + "[data-sakai-collection-id='" + collectionId + "'] .collections_collection_content_count");
            var currentAmount = parseInt($contentCountEl.text(), 10);
            $contentCountEl.text("" + (currentAmount + amount));
            $contentCountEl.attr("title", "" + (currentAmount + amount) + " " + sakai.api.i18n.getValueForKey("CONTENT_ITEMS"));
        };

        var uploadFile = function(collectionId, permissions){
            if (filesToUpload.length){
                var fileToUpload = filesToUpload[0];
                var splitOnDot = fileToUpload.name.split(".");
                var xhReq = new XMLHttpRequest();
                xhReq.open("POST", "/system/pool/createfile", false);
                var formData = new FormData();
                formData.append("enctype", "multipart/form-data");
                formData.append("filename", fileToUpload.name);
                formData.append("file", fileToUpload);
                xhReq.send(formData);
                if (xhReq.status == 201){
                    var data = $.parseJSON(xhReq.responseText);
                    var poolid = data[fileToUpload.name].poolId;
                    var batchRequests = [];
                    batchRequests.push({
                        "url": "/p/" + poolid,
                        "method": "POST",
                        "parameters": {
                            "sakai:pooled-content-file-name": fileToUpload.name,
                            "sakai:permissions": permissions,
                            "sakai:copyright": "creativecommons",
                            "sakai:allowcomments": "true",
                            "sakai:showcomments": "true",
                            "sakai:fileextension": splitOnDot[splitOnDot.length - 1]
                        }
                    });
        
                    // Set initial version
                    batchRequests.push({
                        "url": "/p/" + poolid + ".save.json",
                        "method": "POST"
                    });
        
                    sakai.api.Server.batch(batchRequests, function(success, response){
                        // Set the correct file permissions
                        sakai.api.Content.setFilePermissions([{"hashpath": poolid, "permissions": permissions}], function(){
                            // Add it to the collection
                            sakai.api.Content.Collections.addToCollection(collectionId, poolid, function(){
                                addToCollectionCount(collectionId, 1);
                                filesToUpload.splice(0, 1);
                                uploadFile(collectionId, permissions);
                            });
                        });
                    });
                } else {
                    filesToUpload.splice(0, 1);
                    uploadFile(collectionId, permissions);
                }
            } else {
                setTimeout(function(){
                    getRecentContent(collectionId);
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                }, 500);
            }
        };

        var initializeDesktopDD = function(collections){
            // Initialize drag and drop from desktop
            $.each(collections, function(index, collection){
                finishInitializeDD(collection["_path"], collection["sakai:permissions"]);
            });
        };

        ////////////////////////////////////////
        // DRAG AND DROP ITEMS IN FROM SYSTEM //
        ////////////////////////////////////////

        $(window).bind("drop.collections.sakai", function(ev, data, target){
            var collectionId = target.attr("data-sakai-collection-id");
            var collectedContent = [];
            var collectedCollections = [];
            $.each(data, function(index, item){
                if (item.collection){
                    collectedCollections.push(item.entityid);
                } else {
                    collectedContent.push(item.entityid);
                }
            });
            if (collectedContent.length + collectedCollections.length > 0) {
                sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey("UPLOADING_CONTENT_ADDING_TO_COLLECTION", "collections"), sakai.api.i18n.getValueForKey("WONT_BE_LONG", "collections"));
                sakai.api.Content.Collections.addToCollection(collectionId, collectedContent, function(){
                    sakai.api.Content.Collections.shareCollection(collectedCollections, sakai.api.Content.Collections.getCollectionGroupId(collectionId), false, function(){
                        setTimeout(function(){
                            addToCollectionCount(collectionId, collectedCollections.length + collectedContent.length);
                            getRecentContent(collectionId);
                            sakai.api.Util.progressIndicator.hideProgressIndicator();
                        }, 1000);
                    });
                });
            } 
        });

        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Retrieve the collections and render the appropriate display
         */
        var getCollections = function(cache){
            // Get Collections
            sakai.api.Content.Collections.getMyCollections(0, itemsToShow, function(data){
                // Decide what screen to show depending on results
                switchDisplay(data);
                var recentContentToLoad = [];
                for (var i = 0; i < data.results.length; i = i + 4){
                    recentContentToLoad.push(data.results[i]["_path"]);
                };
                getRecentContent(recentContentToLoad);
            }, cache);
        };

        /**
         * Show/hide the collections inlay
         */
        var toggleCollectionsInlay = function(){
            $(collectionsScrollArrow).hide();
            $(collectionsCollectionsList).hide();
            $(collectionsSeeAllButton).hide();
            $(collectionsNoCollections).hide();
            $(collectionsAddNewContainer).hide();
            if (!$collectionsWidget.is(":visible")){
                getCollections();
            }
            $collectionsWidget.animate({
                'margin-bottom': 'toggle',
                height: 'toggle',
                opacity: 'toggle',
                'padding-top': 'toggle',
                'padding-bottom': 'toggle'
            }, 400, function(){
                if ($collectionsWidget.is(":visible")){
                    getCollections();
                    $("#collections_leftcolumn").focus();
                } else {
                    $(collectionsScrollArrow).hide();
                    $(collectionsCollectionsList).hide();
                    $(collectionsSeeAllButton).hide();
                    $(collectionsNoCollections).hide();
                }
            });
        };

        /**
         * Add binding to various elements in the widget
         */
        var addBinding = function(){
            $(subnavigationAddCollectionLink).live("click", initializeNewCollectionsSetup);
            $(collectionsCloseButton).live("click", toggleCollectionsInlay);
            $(collectorToggle).live("click", toggleCollectionsInlay);
            $(collectionsNewButton).live("click", initializeNewCollectionsSetup);
            $(collectionsCancelNewButton).live("click", getCollections);
            $("." + collectionsLargePreview).live("click", expandCollection);
            $(collectionsSaveNewButton).live("click", createNewCollection);
            $(window).bind("create.collections.sakai", initializeNewCollectionsSetup);
            // Save the new collection when enter is pressed
            $("#collections_collection_title").bind("keyup", function(ev, data){
                if (ev.keyCode === 13){
                    createNewCollection();
                }
            });
        };

        addBinding();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("collections");
});
