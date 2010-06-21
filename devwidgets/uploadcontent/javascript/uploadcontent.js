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

/*global sdata, fluid, window, $ */

var sakai = sakai || {};

/**
 * Widget that uploads content (files + links) to Sakai3
 * @param {String} tuid The unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget
 */
sakai.uploadcontent = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var uploaddata = {};

    // default POST URL
    var now = new Date();
    var defaultposturl = "/_user" + sakai.data.me.profile.path + "/public/" + now.getFullYear() + "/" + (now.getMonth() + 1) + "/";


    ///////////////////
    // CSS Selectors //
    ///////////////////

    var $rootel = $("#" + tuid);

    var $uploadcontent_action_addcontent = $("#uploadcontent_action_addcontent", $rootel);
    var $uploadcontent_dialog = $("#uploadcontent_dialog", $rootel);
    var $uploadcontent_error_badurlformat = $("#uploadcontent_error_badurlformat", $rootel);
    var $uploadcontent_error_container = $("#uploadcontent_error_container", $rootel);
    var $uploadcontent_error_filenotuploaded = $("#uploadcontent_error_filenotuploaded", $rootel);
    var $uploadcontent_error_linkcouldnotbesaved = $("#uploadcontent_error_linkcouldnotbesaved", $rootel);
    var $uploadcontent_form_content = $("#uploadcontent_form_content", $rootel);
    var $uploadcontent_form_link = $("#uploadcontent_form_link", $rootel);
    var $uploadcontent_form_link_input = $("#uploadcontent_form_link_input");
    var $uploadcontent_main_container = $("#uploadcontent_main_container", $rootel);
    var $uploadcontent_main_container_template = $("#uploadcontent_main_container_template", $rootel);


    ///////////////////////////
    // Utilisation functions //
    ///////////////////////////

    /**
     * Check whether a URL is in a valid format or not
     * @param {String} url The input string you want to test
     * @return {Boolean} true if the supplied parameter is a valid URL
     */
    var isValidURL = function(url){

        // Use regular expressions to check whether the URL is valid or not
        return (/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i).test(url);

    };


    ///////////////////////////
    // General functionality //
    ///////////////////////////

    /**
     * Reset the values in the form
     */
    var resetForm = function(){

        // Empty the form link input
        $uploadcontent_form_link_input.val("");

    };

    /**
     * Render the general template
     */
    var renderTemplate = function(){

        $.TemplateRenderer($uploadcontent_main_container_template, {}, $uploadcontent_main_container);

        // Show the main container
        $uploadcontent_main_container.show();

    };

    /**
     * Show an error message to the user
     * @param {String} [error] Supply a key for the error message
     */
    var showError = function(error){

        // If there is no error message supplied, hide the container
        if(!error){
            $uploadcontent_error_container.hide();
            return;
        }

        if(error === "badurlformat"){
            $uploadcontent_error_container.html($uploadcontent_error_badurlformat.html());
        }
        else if(error === "linkcouldnotbesaved"){
            $uploadcontent_error_container.html($uploadcontent_error_linkcouldnotbesaved.html());
        }
        else if(error === "filenotuploaded"){
            $uploadcontent_error_container.html($uploadcontent_error_filenotuploaded.html());
        }

        // Show the container to the user
        $uploadcontent_error_container.show();

    };

    /**
     * Save the link to the back-end
     * @param {Object} link
     */
    var saveLink = function(link){

        var actionlink = defaultposturl;

        $.ajax({
            url: actionlink + link.split("//")[1].replace(/\./g, "_"),
            type: "POST",
            data: {
                "sakai:link": link,
                "sling:resourcetype": "sakai/link"
            },
            success: function(data){

                // Redirect to the profile page of the newly updated link
                document.location = "/dev/content_profile.html#content_path=" + this.url;

                // Reset the current form
                resetForm();

                // Hide the current dialog
                $uploadcontent_dialog.jqmHide();


            },
            error: function(){

               // Show an error message to the user to let him/her know the URL couldn't be saved
               showError("linkcouldnotbesaved");

            }
        });
    };


    /////////////
    // Binding //
    /////////////

    /**
     * Add binding to the main form element when you submit the form
     */
    var addBindingForm = function(){

        // Reinitialise the jQuery selector
        $uploadcontent_form_link = $($uploadcontent_form_link.selector);
        $uploadcontent_form_content = $($uploadcontent_form_content.selector);

        // Add the submit event
        $uploadcontent_form_link.submit(function(){

            // Hide previous errors
            showError();

            // Reinitialise jQuery variables
            $uploadcontent_form_link_input = $($uploadcontent_form_link_input.selector);

            // Check whether there was any URL inserted into the link field
            var linkvalue = $.trim($uploadcontent_form_link_input.val());
            if(linkvalue){

                // Check whether the supplied string is a valid URL
                if(isValidURL(linkvalue)){

                    // Save the link
                    saveLink(linkvalue);

                }else{

                    // Show a message that the supplied URL is invalid
                    showError("badurlformat");
                }

                // Don't do anything else within this function
                return false;

            }

        });

        $uploadcontent_form_content.attr("action", defaultposturl.substr(0, defaultposturl.length -1));
        $uploadcontent_form_content.ajaxForm({
            beforeSubmit: function(a,f,o) {
                $('#uploadOutput').html('Submitting...');
            },
            clearForm:true,
            success: function(data) {

                // The data we get back is always in a bad format (html)
                // so we just need to check if there is any was any error when uploading the file
                if (data.indexOf("<div id=\"Status\">200</div>") > -1) {
                    document.location = sakai.config.URL.MY_DASHBOARD_URL;
                }
                else {
                    showError("filenotuploaded");
                }

            }
        });

    };

    /**
     * General add binding function
     */
    var addBinding = function(){

        // Add binding to the form
        addBindingForm();

    };


    ////////////////////
    // Initialisation //
    ////////////////////

    sakai.uploadcontent.init = function(data){

        // Check for valid parameters
        if(!data || typeof data !== "object"){

            // If the parameters aren't valid, log an error message
            fluid.log("Upload Content widget - sakai.uploadcontent.init - the supplied data parameter is invalid: '" + data + "'");

            // Quit the execution of this function
            return;

        }

        // Clone the original data object
        uploaddata = $.extend(true, {}, data);

        // Show the jqModal
        $uploadcontent_dialog.jqmShow();

    };

    /**
     * Initial function for the widget
     * Everything in here is done before showing the widget to the user
     */
    var init = function(){

        // Initialise the jqModal
        $uploadcontent_dialog.jqm({
            modal: true,
            toTop: true
        });

        // Render the templates
        renderTemplate();

        // Add binding
        addBinding();

    };

    // Execute the init function
    init();

};

// Inform the widget loader that this widget is loaded
sakai.api.Widgets.widgetLoader.informOnLoad("uploadcontent");