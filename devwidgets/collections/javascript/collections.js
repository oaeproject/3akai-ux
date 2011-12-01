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
        var collectionsSaveNewButton = "#collections_save_new_button";
        var collectionsNewCollectionPermission = "#collections_newcollection_permissions";

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

        //var showNextStep = function(){
        //    var nextStep = $(this).data("next-step");
        //    var currentStep = $(this).data("current-step");
        //    $("#" + currentStep).hide();
        //    $("#" + nextStep).show();
        //};

        /**
        * Enable creation of collection and enable elements
        */
        var initializeNewCollectionsSetup = function(){
            resetGUI();
            $(collectionsNewButton).hide();
            $(collectionsNoCollections).hide();
            $(collectionsAddNewContainer).show();
            $(collectionsNewActionButtons).show();
        };

        /**
        * Determine the screen to display
        */
        var switchDisplay = function(collections){
            resetGUI();
            if(collections.total){
                $(collectionsCollectionsList).show();
                $(collectionsScrollArrow).show();
                $(collectionsSeeAllButton).show();
            } else {
                $(collectionsNoCollections).show();
            }
        }

        var expandCollection = function(){
            if($(this).hasClass(collectionsLargePreview)){
                $("." + collectionsLargePreview).addClass("collapsed");
                $(this).removeClass("collapsed");
            }
        };

        var createNewCollection = function(){
            var title = $.trim($("#collections_collection_title").val()) || sakai.api.i18n.getValueForKey("UNTITLED_COLLECTION", "collections");
            var permissions = $(collectionsNewCollectionPermission).val();
            sakai.api.Content.Collections.createCollection(title, "", permissions, [], [], [], function(){
                alert("Created");
                getCollections();
            });
        };

        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
        * Retrieve the collections and render the appropriate display
        */
         var getCollections = function(){
             // Get Collections
             sakai.api.Content.Collections.getMyCollections(0, 8, function(data){
                 // Decide what screen to show depending on results
                 switchDisplay(data);
             });
         };

        /**
        * Show/hide the collections inlay
        */
        var toggleCollectionsInlay = function(){
            $collectionsWidget.animate({
                'margin-bottom': 'toggle',
                height: 'toggle',
                opacity: 'toggle',
                'padding-top': 'toggle',
                'padding-bottom': 'toggle'
            }, 400, function(){
                if ($collectionsWidget.is(":visible")){
                    getCollections();
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
            $(subnavigationAddCollectionLink).live("click", toggleCollectionsInlay);
            $(collectionsCloseButton).live("click", toggleCollectionsInlay);
            $(collectorToggle).live("click", toggleCollectionsInlay);
            $(collectionsNewButton).live("click", initializeNewCollectionsSetup);
            $(collectionsCancelNewButton).live("click", switchDisplay);
            //$(collectionsAddNewNextStepLabel).live("click", showNextStep);
            $("." + collectionsLargePreview).live("click", expandCollection);
            $(collectionsSaveNewButton).live("click", createNewCollection);
        };

        var doInit = function(){
            addBinding();
        };

        doInit();

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("collections");
});
