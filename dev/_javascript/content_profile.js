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
/*global $, fluid, window, sdata */

var sakai = sakai || {};

sakai.content_profile = function(){


    //////////////////////
    // Config variables //
    //////////////////////

    var content_path = ""; // The current path of the content
    var globalJSON;
    var ready_event_fired = 0;


    ///////////////////
    // CSS Selectors //
    ///////////////////

    var $content_profile_basic_info_container = $("#content_profile_basic_info_container");
    var $content_profile_basic_info_container_template = $("#content_profile_basic_info_container_template");
    var $content_profile_error_container = $("#content_profile_error_container");
    var $content_profile_error_container_template = $("#content_profile_error_container_template");
    var $content_profile_form = $("#content_profile_form");
    var $content_profile_form_description = $("#content_profile_form_description");
    var $content_profile_form_name = $("#content_profile_form_name");
    var $content_profile_form_tags = $("#content_profile_form_tags");


    //////////////////////////
    // Global functionality //
    //////////////////////////

    /**
     * Show a general error message to the user
     * @param {String} error
     * A key for an error message - we use the key and not the text for i18n
     */
    var showError = function(error){

        $.TemplateRenderer($content_profile_error_container_template, {"error": error}, $content_profile_error_container);

    };

    /**
     * Get the values for the main form
     */
    var getFormValues = function(){

        // Create a data object
        var data = {};

        // Set all the different values of the current item
        data["sakai:name"] = $.trim($content_profile_form_name.val());
        data["sakai:description"] = $.trim($content_profile_form_description.val());

        // For tags we need to do something special, since they are comma separated
        data["sakai:tags"] = "";

        // Get all the tags
        var tagValues = $.trim($content_profile_form_tags.val());
        if (tagValues) {
            data["sakai:tags"] = tagValues.split(",");

            // Set the correct typehint
            data["sakai:tags@TypeHint"] = "String[]";

            // Temporary array of tags
            var tagArray = [];

            // Remove all the begin and end spaces in the tags
            // Also remove the empty tags
            for (var i = 0, il = data["sakai:tags"].length; i < il; i++) {
                var tagValue = $.trim(data["sakai:tags"][i]);
                if (tagValue) {
                    tagArray.push(tagValue);
                }
            }

            // Set the tags property to the temporary tag array
            data["sakai:tags"] = tagArray;

        }
        else {
            data["sakai:tags"] = "";
        }

        // Set the correct mixintype
        data["jcr:mixinTypes"] = "sakai:propertiesmix";

        // Return the data object
        return data;

    };

    /**
     * Add binding to the basic info
     */
    var addBindingBasicinfo = function(){

        // Reinitialise jQuery Selectors
        $content_profile_form = $($content_profile_form.selector);
        $content_profile_form_description = $($content_profile_form_description.selector);
        $content_profile_form_name = $($content_profile_form_name.selector);
        $content_profile_form_tags = $($content_profile_form_tags.selector);

        // Submitting of the form
        $content_profile_form.bind("submit", function(){

            // Get all the value for the form
            var data = getFormValues();

            // Send the Ajax request
            $.ajax({
                url: globalJSON.url,
                data: data,
                traditional: true,
                type:"post",
                success: function(){
                    // TODO show a valid message to the user instead of reloading the page
                    $(window).trigger('hashchange');
                },
                error: function(){
                    // TODO show a valid error message
                }
            });

        });

    };

    /**
     * General add binding function
     */
    var addBinding = function(){

        // Add binding to the basic info
        addBindingBasicinfo();

    };

    /**
     * Load the content profile for the current content path
     */
    var loadContentProfile = function(){

        // Hide + clear the basic information
        $content_profile_basic_info_container.hide();

        // Clear the error container
        $content_profile_error_container.empty();

        // Check whether there is actually a content path in the URL
        if (content_path) {

            $.ajax({
                url: sakai.config.SakaiDomain + content_path + ".2.json",
                success: function(data){

                    // Construct the JSON object
                    var json = {
                        data: data,
                        mode: "content",
                        url: sakai.config.SakaiDomain + content_path
                    };

                    // Set the global JSON object (we also need this in other functions + don't want to modify this)
                    globalJSON = $.extend(true, {}, json);

                    // The request was successful so initialise the entity widget
                    if (ready_event_fired > 0) {
                        sakai.api.UI.entity.render("content", json);
                    }
                    else {
                        $(window).bind("sakai.api.UI.entity.ready", function(e){
                            sakai.api.UI.entity.render("content", json);
                            ready_event_fired++;
                        });
                    }

                    // And render the basic information
                    $.TemplateRenderer($content_profile_basic_info_container_template, json, $content_profile_basic_info_container);

                    // Add binding to various jQuery elements
                    addBinding();

                    // Show the basic info container
                    $content_profile_basic_info_container.show();

                },
                error: function(xhr, textStatus, thrownError){

                    // Show an appropriate error message
                    showError("invalid_url");

                    // Log a more descriptive message to the console
                    fluid.log("sakai.content_profile - loadContentProfile - Loading the content for the following path: '" + this.url + "' failed.");

                    // Render the entity widget
                    if (ready_event_fired > 0) {
                        sakai.api.UI.entity.render("content", false);
                    }
                    else {
                        $("body").bind("sakai.api.UI.entity.ready", function(e){
                            sakai.api.UI.entity.render("content", false);
                            ready_event_fired++;
                        });
                    }

                }
            });

        }else{

            // Show an appropriate error message
            showError("invalid_query");

            // Also log an error message to the console
            fluid.log("sakai.content_profile - loadContentProfile - The content_path variable is invalid: '" + content_path + "'.");

            // Render the entity widget
            if (ready_event_fired > 0) {
                sakai.api.UI.entity.render("content", false);
            }
            else {
                $("body").bind("sakai.api.UI.entity.ready", function(e){
                    sakai.api.UI.entity.render("content", false);
                    ready_event_fired++;
                });
            }

        }

    };


    ////////////////////
    // Initialisation //
    ////////////////////

    /**
     * Initialise the content profile page
     */
    var init = function(){

        // Bind an event to window.onhashchange that, when the history state changes,
        // loads all the information for the current resource
        $(window).bind('hashchange', function(e){

            content_path = e.getState("content_path") || "";

            loadContentProfile();

        });

        // Since the event is only triggered when the hash changes, we need to trigger
        // the event now, to handle the hash the page may have loaded with.
        $(window).trigger('hashchange');

    };

    // Initialise the content profile page
    init();

};

sakai.api.Widgets.Container.registerForLoad("sakai.content_profile");