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

/*global $, Config */

var sakai = sakai || {};

/**
 * @name sakai.createpage
 *
 * @class createpage
 *
 * @description
 * createpage widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.createpage = function(tuid, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    // jQuery DOM objects
    var $rootel = $("#" + tuid);
    var $createpageContainer = $("#createpage_container", $rootel);
    var $selectPageType = $("#createpage_page_type", $rootel);
    var $inputPageTitleContainer = $("#createpage_title_container", $rootel);
    var $inputPageTitle = $("#createpage_title", $rootel);
    var $createpageForm = $("#createpage_form", $rootel);
    var $createpageSubmit = $("#createpage_save", $rootel);
    var $createpageCancel = $("#createpage_cancel", $rootel);
    var $createpageProcessing = $("#createpage_processing", $rootel);
    var $createpageTemplates = $("#createpage_templates", $rootel);
    var $createpageTemplatesTemplate = $("#createpage_templates_template", $rootel);
    
    // CSS Selectors
    var errorMsgClass = "createpage_error_msg";
    var invalidFieldClass = "invalid";
    var buttonClass = "s3d-button";
    var radioButtons = "createpagetemplate_radio";

    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * This function is called before the jqModal hides. It removes any error
     * notices, resets values for select and text inputs and hides templates
     */
    var resetModalDialog = function (hash) {
        // hide the overlay
        hash.w.hide();
        hash.o.remove();

        // remove any errors
        $("." + errorMsgClass).hide();
        $inputPageTitle.removeClass(invalidFieldClass);

        // clear input
        $inputPageTitle.val("");

        // reset page type select element
        $selectPageType.val("blank");
        
        // hide templates
        $createpageTemplates.hide();
    };

    /**
     * Mark the page title field as erroneous and show an error message
     */
    var showPageTitleError = function () {
        $("." + errorMsgClass).show();
        $inputPageTitle.addClass(invalidFieldClass);
        $inputPageTitle.focus();
    };

    /**
     * Show page templates available to the user
     */
    var showTemplates = function () {
        var json = {
            templates: []
        };
        if(sakai.sitespages && sakai.sitespages.mytemplates) {
            // create a custom list of templates with just the info we care about
            for(t in sakai.sitespages.mytemplates) {
                if(sakai.sitespages.mytemplates.hasOwnProperty(t)) {
                    var template = {
                        "id": t,
                        "name": sakai.sitespages.mytemplates[t].name,
                        "desc": sakai.sitespages.mytemplates[t].description
                    };
                    json.templates.push(template);
                }
            }
        }
        // pass the array to HTML view
        $createpageTemplates.html($.TemplateRenderer($createpageTemplatesTemplate,
            json));
        $createpageTemplates.show();

        // select the first item
        $("input:radio:first", $createpageContainer).attr("checked","checked");

        // if no templates, hide the create button
        if(json.templates.length === 0) {
            $createpageSubmit.hide();
        }
    };

    /**
     * Toggle between showing or hiding the "Processing..." message to the user
     */
    var toggleProcessing = function(){
        if($createpageProcessing.is(":visible")) {
            $createpageProcessing.hide();
            $("#createpage_container " + "." + buttonClass).show();
        } else {
            $("#createpage_container " + "." + buttonClass).hide();
            $createpageProcessing.show();
        }
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /**
     * Validate input and initiate creating pages when the user submits the form
     */
    $createpageForm.submit(function () {
        // check if we have valid input
        var pageTitle = $inputPageTitle.val();
        if(!pageTitle) {
            showPageTitleError();
        } else {
            // we've got a valid title
            toggleProcessing();  // display "Processing..."
            var pageType = $selectPageType.val();
            if(pageType === "blank") {
                sakai.sitespages.createNewPage("", handleNewPageCreation, pageTitle);
            } else if(pageType === "template") {
                // fetch the selected template and its content to create a new page
                var selectedTemplate = $("input:radio:checked", $createpageContainer).val();
                sakai.sitespages.createNewPage(
                    sakai.sitespages.mytemplates[selectedTemplate]["pageContent"]["sakai:pagecontent"],
                    handleNewPageCreation, pageTitle);
            } else {
                sakai.sitespages.addDashboardPage(pageTitle, handleNewPageCreation);
            }
        }
    });

    /**
     * Callback function called upon completion of sakai.sitespages.createNewPage
     * called on submit event of the create page form.
     * @param {Boolean} success true if the call succeeded, false otherwise
     */
    var handleNewPageCreation = function (success) { 
        toggleProcessing();  // hide "Processing..."
        if(success) {
            // hide the modal
            $createpageContainer.jqmHide();
        } else {
            fluid.log("createpage.js - handleNewPageCreation: creating page failed.");
            alert("Sorry, your page could not be created at this time. Please try again later or contact your administrator for assistance.");
        }
    };

    /**
     * Show available templates when the user selects Create page from template
     * in the page type dropdown. If the other types are selected, focus the 
     * input are immediately.
     */
    $selectPageType.change(function () {
        var pageType = $selectPageType.val();
        if(pageType === "template") {
            // display templates
            showTemplates();
        } else {
            // hide templates, ensure submit button is visible
            $createpageTemplates.hide();
            $createpageSubmit.show();
        }
        $inputPageTitle.focus();
    });

    /**
     * Delete the template when the user clicks the delete link
     */
    $createpageContainer.delegate("a.createpage_delete_template_link", "click",
    function () {
        var templateDeleted = this.id.split("_")[1];
        delete sakai.sitespages.mytemplates[templateDeleted];
        // Save updated template preferences
        // -- this has a bug right now. The save is not overwriting the templates
        // -- at /~userid/private/templates as expected - maybe a special jcr flag (i.e. :replace)?
        sakai.api.Server.saveJSON("/~" + sakai.data.me.user.userid + "/private/templates",
            sakai.sitespages.mytemplates, function(success, response) {
            if (success) {
                showTemplates();
            } else {
                fluid.log("createpage.js: Failed to delete template with id="+templateDeleted);
            }
        });
    });

    //////////////////////////////
    // Initialization function  //
    //////////////////////////////

    /**
     * Public init function that shows the createpage modal dialog
     */
    sakai.createpage.initialise = function(){
        // add jqModal functionality to the container
        $createpageContainer.jqm({
            modal: true,
            overlay: 20,
            toTop: true,
            onHide: resetModalDialog
        })
        .jqmAddClose($createpageCancel);
        
        // show container
        $createpageContainer.jqmShow();
        $inputPageTitle.focus();
    };

};

sakai.api.Widgets.widgetLoader.informOnLoad("createpage");