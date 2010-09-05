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

    // When variable is true user can not change the resource
    var anon = false;

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
    var contentProfileBasicInfoFormCopyrightSelect = "#content_profile_basic_info_copyright_select";
    var contentProfileBasicInfoFormPermissionsSelect= "#content_profile_basic_info_permissions_select";

    // i18n
    var contentProfileBasicInfoUpdatedBasicInfo = "#contentprofilebasicinfo_updated_basic_info";
    var contentProfileBasicInfoFileBasicInfoUpdated = "#contentprofilebasicinfo_file_basic_info_been_updated";
    var contentProfileBasicInfoFailedUpdatingBasicInfo = "#contentprofilebasicinfo_failed_updating_basic_info";
    var contentProfileBasicInfoFileBasicInfoNotUpdated = "#contentprofilebasicinfo_file_basic_info_not_updated";
    var contentProfileBasicInfoFailedLoadingData = "#contentprofilebasicinfo_failed_loading_data";
    var contentProfileBasicInfoFailedLoadingFileData = "#contentprofilebasicinfo_failed_loading_file_data";

    var directoryJSON = [];

    var contentProfileBasicInfoDirectoryLvlOne = "#content_profile_basic_info_directory_lvlone";
    var contentProfileBasicInfoDirectoryLvlTwo = "#content_profile_basic_info_directory_lvltwo";
    var contentProfileBasicInfoDirectoryLvlThree = "#content_profile_basic_info_directory_lvlthree";

    var contentProfileBasicInfoThirdLevelTemplateContainer = "#content_profile_basic_info_thirdlevel_template_container";
    var contentProfileBasicInfoSecondLevelTemplateContainer = "#content_profile_basic_info_secondlevel_template_container";

    var contentProfileBasicInfoSecondLevelTemplate = "#content_profile_basic_info_secondlevel_template";
    var contentProfileBasicInfoThirdLevelTemplate = "#content_profile_basic_info_thirdlevel_template";


    ///////////////////
    // Functionality //
    ///////////////////

    /**
     * Get a list of nodes representing the directory structure to be rendered
     */
    var getDirectoryStructure = function(){
        // Get directory structure from config file
        for(var i in sakai.config.Directory){
            // Create first level of content
            var temp = new Object();
            temp.name = i;

            // Create second level of content
            temp.secondlevels = [];
            for(var j in sakai.config.Directory[i]){
                var secondlevel = new Object();
                secondlevel.name = j;

                // Create third level of content
                secondlevel.thirdlevels = []
                for (var k in sakai.config.Directory[i][j]){
                    var thirdlevel = new Object();
                    thirdlevel.name = sakai.config.Directory[i][j][k];
                    secondlevel.thirdlevels.push(thirdlevel);
                }

                temp.secondlevels.push(secondlevel);
            }
            directoryJSON.push(temp);
        }
    };

    /**
     * Update the select boxes on the stage
     * @param {String} select Containing ID to check which box value has been changed
     * @param {String} changedboxvalue Containing selected value
     * @param {String} firstlevelvalue Containing value of first select box
     */
    var updateDirectoryDisplay = function(select, changedboxvalue, firstlevelvalue){
        var obj = {
            "firstlevelvalue":firstlevelvalue,
            "changedboxvalue" : changedboxvalue,
            "directory": directoryJSON,
        }
        if(select === contentProfileBasicInfoDirectoryLvlTwo){
            $(contentProfileBasicInfoSecondLevelTemplateContainer).html($.TemplateRenderer(contentProfileBasicInfoSecondLevelTemplate, obj));
        }else{
            $(contentProfileBasicInfoThirdLevelTemplateContainer).html($.TemplateRenderer(contentProfileBasicInfoThirdLevelTemplate, obj));
        }
    };

    /**
     * Set permissions on the files that were uploaded
     */
    var setFilePermissions = function(){
        // Get the value from the dropdown list
        var permissions = $(contentProfileBasicInfoFormPermissionsSelect).val();
        // Check which value was selected and fill in the data object accordingly
        var data = [];
        switch (permissions) {
            // Logged in only
            case "everyone":
                var item = {
                    "url": contentPath + ".members.html",
                    "method": "POST",
                    "parameters": {
                        ":viewer": "everyone",
                        ":viewer@Delete": "anonymous"
                    }
                };
                data[data.length] = item;
                break;
            // Public
            case "public":
                var item = {
                    "url": contentPath + ".members.html",
                    "method": "POST",
                    "parameters": {
                        ":viewer": ["everyone", "anonymous"]
                    }
                };
                data[data.length] = item;
                break;
            // Myself only
            case "private":
                var item = {
                    "url": contentPath + ".members.html",
                    "method": "POST",
                    "parameters": {
                        ":viewer@Delete": ["anonymous", "everyone"]
                    }
                };
                data[data.length] = item;
                break;
        }

        $.ajax({
            url: sakai.config.URL.BATCH,
            traditional: true,
            type: "POST",
            cache: false,
            data: {
                requests: $.toJSON(data)
            },
            success: function(data){

            },
            error: function(xhr, textStatus, thrownError){

            }
        });

    };

    /**
     * Get the values from the basic information form
     */
    var getFormValues = function(){
        // Create a data object
        var data = {};

        // Set all the different values of the current item
        data["sakai:pooled-content-file-name"] = $.trim($(contentProfileBasicInfoFormName).val());
        data["sakai:description"] = $.trim($(contentProfileBasicInfoFormDescription).val());

        data["sakai:directory"] = $(contentProfileBasicInfoDirectoryLvlOne).selected().val() + ":" + $(contentProfileBasicInfoDirectoryLvlTwo).selected().val() + ":" + $(contentProfileBasicInfoDirectoryLvlThree).selected().val();

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

        data["sakai:copyright"] = $(contentProfileBasicInfoFormCopyrightSelect)[0].value;

        data["sakai:permissions"] = $(contentProfileBasicInfoFormPermissionsSelect)[0].value;

        // Return the data object
        return data;
    };

    /**
     * Enable or disable all fields on the basic info widget
     */
    var enableDisableBasicInfoFields = function(bool){
        $(contentProfileBasicInfoFormCopyrightSelect)[0].disabled = bool;
        $(contentProfileBasicInfoFormTags)[0].disabled = bool;
        $(contentProfileBasicInfoFormDescription)[0].disabled = bool;
        $(contentProfileBasicInfoFormName)[0].disabled = bool;
        $(contentProfileBasicInfoForm)[0].disabled = bool;
    };

    var updateBasicInfo = function(){
        // Set permissions on the file
        setFilePermissions();

        // Get all the value for the form
        var data = getFormValues();

        // Disable basic info fields
        enableDisableBasicInfoFields(true);

        // Send the Ajax request
        $.ajax({
            url: globalJSON.url,
            data: data,
            traditional: true,
            type: "post",
            success: function(){
                // TODO show a valid message to the user instead of reloading the page
                $(window).trigger('hashchange');
                sakai.api.Util.notification.show($(contentProfileBasicInfoUpdatedBasicInfo).html(), $(contentProfileBasicInfoFileBasicInfoUpdated).html());
            },
            error: function(xhr, textStatus, thrownError){
                // Enable basic info fields and show error message
                enableDisableBasicInfoFields(false);
                sakai.api.Util.notification.show($(contentProfileBasicInfoFailedUpdatingBasicInfo).html(), $(contentProfileBasicInfoFileBasicInfoNotUpdated).html());
            }
        });
    }

    /**
     * Add binding to the basic info
     */
    var addBindingBasicinfo = function(){
        // Submitting of the form
        $(contentProfileBasicInfoForm).bind("submit", function(){
            if ($(contentProfileBasicInfoDirectoryLvlOne).selected().val() !== "no_value" && $(contentProfileBasicInfoDirectoryLvlTwo).selected().val() !== "no_value" && $(contentProfileBasicInfoDirectoryLvlThree).selected().val() !== "no_value") {
                updateBasicInfo();
            }
            else {
                sakai.api.Util.notification.show("Select level", "Select all three levels before updating");
            }
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
                        url: contentPath,
                        anon: anon,
                        directory : directoryJSON,
                        saveddirectory : (data["sakai:directory"]).split(":")
                    };

                    // Set the global JSON object (we also need this in other functions + don't want to modify this)
                    globalJSON = $.extend(true, {}, json);

                    // And render the basic information
                    var renderedTemplate = $.TemplateRenderer("content_profile_basic_info_template", json);
                    var renderedDiv = $(document.createElement("div"));
                    renderedDiv.html(renderedTemplate)
                    $(contentProfileBasicInfoContainer).html(renderedDiv);
                    // Show the basic info container
                    $(contentProfileBasicInfoContainer).show();

                    addBindingBasicinfo();
                },
                error: function(xhr, textStatus, thrownError){
                    sakai.api.Util.notification.show($(contentProfileBasicInfoFailedLoadingData).html(), $(contentProfileBasicInfoFailedLoadingFileData).html());
                }
            });
        }
    };

    /**
     * Check if the user is a manager or not and set the anon variable accordingly
     */
    var checkFileManager = function(){
        $.ajax({
            url: contentPath + ".members.json",
            success: function(data){
                var managers = $.parseJSON(data).managers;
                if (managers.length !== 0) {
                    for (var i in managers) {
                        if (managers[i].userid === sakai.data.me.user.userid) {
                            anon = false;
                            loadContentProfile();
                            break;
                        }
                        else {
                            anon = true;
                        }
                    }
                }
                else {
                    anon = true;
                    loadContentProfile();
                }
            },
            error: function(xhr, textStatus, thrownError){
                anon = true;
                loadContentProfile();
            }
        });
    };

    /**
     * Bind the widget's internal Cancel and Save Settings button
     */
    var addBinding = function(){
        $(contentProfileBasicInfoDirectoryLvlOne).live("change", function(){
            $(contentProfileBasicInfoThirdLevelTemplateContainer).html("");
            $(contentProfileBasicInfoDirectoryLvlOne + " option[value='no_value']").remove();
            updateDirectoryDisplay(contentProfileBasicInfoDirectoryLvlTwo, $(contentProfileBasicInfoDirectoryLvlOne).selected().val(), $(contentProfileBasicInfoDirectoryLvlOne).selected().val());
        });

        $(contentProfileBasicInfoDirectoryLvlTwo).live("change", function(){
            $(contentProfileBasicInfoDirectoryLvlTwo + " option[value='no_value']").remove();
            updateDirectoryDisplay(contentProfileBasicInfoDirectoryLvlThree, $(contentProfileBasicInfoDirectoryLvlTwo).selected().val(), $(contentProfileBasicInfoDirectoryLvlOne).selected().val());
        });

        $(contentProfileBasicInfoDirectoryLvlThree).live("change", function(){
            $(contentProfileBasicInfoDirectoryLvlThree + " option[value='no_value']").remove();
        });
    };

    /**
     * Initialize the widget
     */
    var doInit = function(){

        addBinding();

        getDirectoryStructure();

        // Bind an event to window.onhashchange that, when the history state changes,
        // loads all the information for the current resource
        $(window).bind('hashchange', function(e){
            contentPath = e.getState("content_path") || "";

            if (sakai.data.me.user.anon) {
                anon = true;
                loadContentProfile();
            }
            else {
                checkFileManager();
            }
        });
        // Since the event is only triggered when the hash changes, we need to trigger
        // the event now, to handle the hash the page may have loaded with.
        $(window).trigger('hashchange');
    };

    doInit();

};
sakai.api.Widgets.widgetLoader.informOnLoad("contentprofilebasicinfo");