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

/*global $, Config, fluid, window */

var sakai = sakai || {};

sakai.contentprofilebasicinfo = function(tuid, showSettings){


    ///////////////
    // Variables //
    ///////////////

    // Path variables
    var contentPath = "";
    var globalJSON;

    // Containers
    var contentProfileBasicInfoContainer = "#content_profile_basic_info_container";

    // Templates
    var contentProfileBasicInfoContainerTemplate = "content_profile_basic_info_template";

    // Form
    var contentProfileBasicInfoForm = "#content_profile_basic_info_form";
    var contentProfileBasicInfoFormName = "#content_profile_basic_info_form_name";
    var contentProfileBasicInfoFormTags = "#content_profile_basic_info_form_tags";
    var contentProfileBasicInfoFormDescription = "#content_profile_basic_info_form_description";
    var contentProfileBasicInfoFormPermissionsSelect = "#content_profile_basic_info_permissions_select";

    /**
     * Get the values from the basic information form
     */
    var getFormValues = function(){
        // Create a data object
        var data = {};

        // Set all the different values of the current item
        data["sakai:name"] = $.trim($(contentProfileBasicInfoFormName).val());
        data["sakai:description"] = $.trim($(contentProfileBasicInfoFormDescription).val());

        // For tags we need to do something special, since they are comma separated
        data["sakai:tags"] = "";

        // Get all the tags
        var tagValues = $.trim($(contentProfileBasicInfoFormTags).val());
        if (tagValues) {
            data["sakai:tags"] = tagValues.split(",");

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

        data["jcr:copyright"] = $(contentProfileBasicInfoFormPermissionsSelect)[0].value;

        // Set the correct mixintype
        data["jcr:mixinTypes"] = "sakai:propertiesmix";

        // Return the data object
        return data;
    };

    /**
     * Enable or disable all fields on the basic info widget
     */
    var enableDisableBasicInfoFields = function(bool){
        $(contentProfileBasicInfoFormPermissionsSelect)[0].disabled = bool;
        $(contentProfileBasicInfoFormTags)[0].disabled = bool;
        $(contentProfileBasicInfoFormDescription)[0].disabled = bool;
        $(contentProfileBasicInfoFormName)[0].disabled = bool;
        $(contentProfileBasicInfoForm)[0].disabled = bool;
    };

    /**
     * Add binding to the basic info
     */
    var addBindingBasicinfo = function(){
        // Submitting of the form
        $(contentProfileBasicInfoForm).bind("submit", function(){
            // Get all the value for the form
            var data = getFormValues();
            // Disable basic info fields
            enableDisableBasicInfoFields(true);

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
                error: function(xhr, textStatus, thrownError){
                    // Enable basic info fields and show error message
                    enableDisableBasicInfoFields(false);
                }
            });
        });
    };


    /**
     * Load the content profile for the current content path
     */
    var loadContentProfile = function(){
        // Check whether there is actually a content path in the URL
        if (contentPath) {
            $.ajax({
                url: contentPath + ".2.json",
                success: function(data){
                    // Construct the JSON object
                    var json = {
                        data: data,
                        mode: "content",
                        url: contentPath
                    };

                    // Set the global JSON object (we also need this in other functions + don't want to modify this)
                    globalJSON = $.extend(true, {}, json);

                    // And render the basic information
                    var renderedTemplate = $.TemplateRenderer("content_profile_basic_info_template", json);
                    var renderedDiv = $(document.createElement("div"));
                    renderedDiv.html(renderedTemplate)
                    $("#content_profile_basic_info_container").html(renderedDiv);
                    // Show the basic info container
                    $("#content_profile_basic_info_container").show();

                    addBindingBasicinfo();
                },
                error: function(xhr, textStatus, thrownError){
                    
                }
            });
        }
    }

    /**
     * Initialize the widget
     */
    var doInit = function(){
        // Bind an event to window.onhashchange that, when the history state changes,
        // loads all the information for the current resource
        $(window).bind('hashchange', function(e){
            contentPath = e.getState("content_path") || "";

            loadContentProfile();
        });

        // Since the event is only triggered when the hash changes, we need to trigger
        // the event now, to handle the hash the page may have loaded with.
        $(window).trigger('hashchange');
    }

    doInit();

};
sakai.api.Widgets.widgetLoader.informOnLoad("contentprofilebasicinfo");