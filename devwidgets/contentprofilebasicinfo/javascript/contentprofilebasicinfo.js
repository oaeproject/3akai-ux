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

/*global $, Config, fluid, window, document */

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
    var userId = sakai.data.me.user.userid;
    var userStoragePrefix = sakai.data.me.user.userStoragePrefix;
    var tagsPath = "/~" + userId + "/public/tags/";
    var tagsPathForLinking = "/_user/" + userStoragePrefix + "public/tags/";

    // JSON
    var data = {};

    // Containers
    var contentProfileBasicInfoContainer = "#content_profile_basic_info_container";

    // Tag variables
    var currentTags = [];

    // Form
    var contentProfileBasicInfoForm = "#content_profile_basic_info_form";
    var contentProfileBasicInfoFormName = "#content_profile_basic_info_form_name";
    var contentProfileBasicInfoFormTags = "#content_profile_basic_info_form_tags";
    var contentProfileBasicInfoFormDescription = "#content_profile_basic_info_form_description";
    var contentProfileBasicInfoFormCopyrightSelect = "#content_profile_basic_info_copyright_select";
    var contentProfileBasicInfoFormPermissionsSelect = "#content_profile_basic_info_permissions_select";

    // i18n
    var contentProfileBasicInfoUpdatedBasicInfo = "#contentprofilebasicinfo_updated_basic_info";
    var contentProfileBasicInfoFileBasicInfoUpdated = "#contentprofilebasicinfo_file_basic_info_been_updated";
    var contentProfileBasicInfoFailedUpdatingBasicInfo = "#contentprofilebasicinfo_failed_updating_basic_info";
    var contentProfileBasicInfoFileBasicInfoNotUpdated = "#contentprofilebasicinfo_file_basic_info_not_updated";
    var contentProfileBasicInfoFailedLoadingData = "#contentprofilebasicinfo_failed_loading_data";
    var contentProfileBasicInfoFailedLoadingFileData = "#contentprofilebasicinfo_failed_loading_file_data";
    var contentProfileBasicInfoSelectDirectory = "#contentprofilebasicinfo_select_directory";
    var contentProfileBasicInfoSelectAtLeastOneDirectory = "#contentprofilebasicinfo_select_at_least_one_directory";

    var directoryJSON = [];

    var contentProfileBasicInfoDirectoryLvlOne = ".content_profile_basic_info_directory_lvlone";
    var contentProfileBasicInfoDirectoryLvlTwo = ".content_profile_basic_info_directory_lvltwo";
    var contentProfileBasicInfoDirectoryLvlThree = ".content_profile_basic_info_directory_lvlthree";
    var contentProfileBasicInfoSavedDirectory = ".content_profile_basic_info_saveddirectory";

    var contentProfileBasicInfoThirdLevelTemplateContainer = "#content_profile_basic_info_thirdlevel_template_container";
    var contentProfileBasicInfoSecondLevelTemplateContainer = "#content_profile_basic_info_secondlevel_template_container";

    var contentProfileBasicInfoSecondLevelTemplate = "#content_profile_basic_info_secondlevel_template";
    var contentProfileBasicInfoThirdLevelTemplate = "#content_profile_basic_info_thirdlevel_template";
    var contentProfileBasicInfoAddAnotherLocation = "#content_profile_basic_info_add_another_location";
    var contentProfileBasicInfoAddAnotherLocationLink = contentProfileBasicInfoAddAnotherLocation + "_link";
    var contentProfileBasicInfoRemoveNewLocation = ".content_profile_basic_info_remove_new_location";
    var contentProfileBasicInfoRemoveLocation = ".content_profile_basic_info_remove_location";

    ///////////////////
    // Functionality //
    ///////////////////

    /**
     * Get a list of nodes representing the directory structure to be rendered
     */
    var getDirectoryStructure = function(){
        // Get directory structure from config file
        for (var i in sakai.config.Directory) {
            if (sakai.config.Directory.hasOwnProperty(i)) {
                // Create first level of content
                var temp = {};
                temp.name = i;

                // Create second level of content
                temp.secondlevels = [];
                for (var j in sakai.config.Directory[i]) {
                    if (sakai.config.Directory[i].hasOwnProperty(j)) {
                        var secondlevel = {};
                        secondlevel.name = j;

                        // Create third level of content
                        secondlevel.thirdlevels = [];
                        for (var k in sakai.config.Directory[i][j]) {
                            if (sakai.config.Directory[i][j].hasOwnProperty(k)) {
                                var thirdlevel = {};
                                thirdlevel.name = sakai.config.Directory[i][j][k];
                                secondlevel.thirdlevels.push(thirdlevel);
                            }
                        }

                        temp.secondlevels.push(secondlevel);
                    }
                }
                directoryJSON.push(temp);
            }
        }
    };

    /**
     * Get the values from the basic information form
     */
    var getFormValues = function(init){
        // initialize a data object
        data = {};

        // Set all the different values of the current item
        data["sakai:pooled-content-file-name"] = sakai.api.Security.escapeHTML($.trim($(contentProfileBasicInfoFormName).val()));
        data["sakai:description"] = sakai.api.Security.escapeHTML($.trim($(contentProfileBasicInfoFormDescription).val()));

        // For tags we need to do something special, since they are comma separated
        data["sakai:tags"] = [];

        // Get all the tags
        if ($(contentProfileBasicInfoFormTags).length) {
            var tags = $(contentProfileBasicInfoFormTags).val().split(",");
            $(tags).each(function(i, tag){
                tag = $.trim(tag);
                if (sakai.api.Security.escapeHTML(tag) === tag && tag.replace(/\\/g, "").length) {
                    if ($.inArray(tag, data["sakai:tags"]) < 0) {
                        data["sakai:tags"].push(tag.replace(/\\/g, ""));
                    }
                }
            })

            // Create tags for the directory structure
            // For every content_profile_basic_info_added_directory we create tags
            // Filter out ',' since that causes unwanted behavior when rendering
            $(".content_profile_basic_info_added_directory").each(function(){
                var directoryString = "directory/";
                if ($.inArray($(this).find(contentProfileBasicInfoDirectoryLvlOne).selected().val().replace(/,/g, ""), data["sakai:tags"]) < 0) {
                    data["sakai:tags"].push($(this).find(contentProfileBasicInfoDirectoryLvlOne).selected().val().replace(/,/g, ""));
                }
                directoryString += $(this).find(contentProfileBasicInfoDirectoryLvlOne).selected().val().replace(/,/g, "");

                if ($(this).find(contentProfileBasicInfoDirectoryLvlTwo).selected().val() !== "no_value") {
                    if ($.inArray($(this).find(contentProfileBasicInfoDirectoryLvlTwo).selected().val().replace(/,/g, ""), data["sakai:tags"]) < 0) {
                        data["sakai:tags"].push($(this).find(contentProfileBasicInfoDirectoryLvlTwo).selected().val().replace(/,/g, ""));
                    }
                    directoryString += "/" + $(this).find(contentProfileBasicInfoDirectoryLvlTwo).selected().val().replace(/,/g, "");

                    if ($(this).find(contentProfileBasicInfoDirectoryLvlThree).selected().val() !== "no_value") {
                        if ($.inArray($(this).find(contentProfileBasicInfoDirectoryLvlThree).selected().val().replace(/,/g, ""), data["sakai:tags"]) < 0) {
                            data["sakai:tags"].push($(this).find(contentProfileBasicInfoDirectoryLvlThree).selected().val().replace(/,/g, ""));
                        }
                        directoryString += "/" + $(this).find(contentProfileBasicInfoDirectoryLvlThree).selected().val().replace(/,/g, "");
                    }

                }
                // Add string for all levels to tag array
                if ($.inArray(directoryString, data["sakai:tags"]) < 0) {
                    data["sakai:tags"].push(directoryString);
                }
            });
        }

        // Add the directory tags to the array that were already saved
        $(contentProfileBasicInfoSavedDirectory + " li").each(function(){
            var splitValues = this.className.split(",");
            var savedDirString = "directory/" + splitValues[0];
            if(splitValues.length > 1){
                savedDirString += "/" + splitValues[1];
                if(splitValues.length > 2){
                    savedDirString += "/" + splitValues[2];
                }
            }
            if ($.inArray(savedDirString, data["sakai:tags"]) < 0) {
                data["sakai:tags"].push(savedDirString);
            }
        });

        if (!init) {
            // Set the tags
            sakai.api.Util.tagEntity(contentPath, data["sakai:tags"], currentTags, function(){
                currentTags = data["sakai:tags"];
                // TODO show a valid message to the user instead of reloading the page
                $(window).trigger('hashchange');
                sakai.api.Util.notification.show($(contentProfileBasicInfoUpdatedBasicInfo).html(), $(contentProfileBasicInfoFileBasicInfoUpdated).html());
            });
        }

        data["sakai:copyright"] = $(contentProfileBasicInfoFormCopyrightSelect).val();

        data["sakai:permissions"] = $(contentProfileBasicInfoFormPermissionsSelect).val();

        // Return the data object
        return data;
    };

    /**
     * Enable or disable all fields on the basic info widget
     */
    var enableDisableBasicInfoFields = function(bool){
        $(contentProfileBasicInfoFormCopyrightSelect)[0].disabled = bool;
        $(contentProfileBasicInfoFormPermissionsSelect)[0].disabled = bool;
        $(contentProfileBasicInfoFormTags)[0].disabled = bool;
        $(contentProfileBasicInfoFormDescription)[0].disabled = bool;
        $(contentProfileBasicInfoFormName)[0].disabled = bool;
        $(contentProfileBasicInfoForm)[0].disabled = bool;
    };

    var updateBasicInfo = function(){

        // Get all the value for the form
        data = getFormValues();

        // Create object of file to be updated
        var obj = {
            "hashpath": contentPath.replace("/p/","")
        }

        // Set permissions on the files
        sakai.api.Util.setFilePermissions(data["sakai:permissions"], [obj], function(permissionsSet){
            resetFields();
        });

        // Disable basic info fields
        enableDisableBasicInfoFields(true);

        // Send the Ajax request
        $.ajax({
            url: globalJSON.url,
            data: data,
            traditional: true,
            type: "post",
            error: function(xhr, textStatus, thrownError){
                // Enable basic info fields and show error message
                enableDisableBasicInfoFields(false);
                sakai.api.Util.notification.show($(contentProfileBasicInfoFailedUpdatingBasicInfo).html(), $(contentProfileBasicInfoFileBasicInfoNotUpdated).html());
            }
        });
    };

    /**
     * Add binding to the basic info
     */
    var addBindingBasicinfo = function(){
        // Submitting of the form
        $(contentProfileBasicInfoForm).bind("submit", function(){
            // Check if there are any faulty values in directory selection
            var valueSelected = true;
            $(".content_profile_basic_info_added_directory select").each(function(){
                if($(this).selected().val() === "no_value"){
                    if($(this).hasClass("content_profile_basic_info_directory_lvlone")){
                        valueSelected = false;
                    }
                }
            });
            // If all values are selected execute the update
            if (valueSelected) {
                updateBasicInfo();
            } else {
                sakai.api.Util.notification.show($(contentProfileBasicInfoSelectDirectory).html(), $(contentProfileBasicInfoSelectAtLeastOneDirectory).html());
            }
        });
    };


    /**
     * Load the content profile for the current content path
     */
    var loadContentProfile = function(){
        if (sakai.content_profile.content_data && sakai.content_profile.content_data.data) {
            sakai.content_profile.content_data.anon = anon;
            sakai.content_profile.content_data.directory = directoryJSON;
            globalJSON = $.extend(true, {}, sakai.content_profile.content_data);
            if($(contentProfileBasicInfoFormCopyrightSelect).val()){
                sakai.content_profile.content_data.data["sakai:copyright"] = $(contentProfileBasicInfoFormCopyrightSelect).val();
            }
            if($(contentProfileBasicInfoFormPermissionsSelect).val()){
                sakai.content_profile.content_data.data["sakai:permissions"] = $(contentProfileBasicInfoFormPermissionsSelect).val();
            }
            postLoadContentData();
        } else {
            sakai.content_profile.loadContentProfile(function(success) {
                if (success) {
                    sakai.content_profile.content_data.anon = anon;
                    sakai.content_profile.content_data.directory = directoryJSON;
                    globalJSON = $.extend(true, {}, sakai.content_profile.content_data);
                    postLoadContentData();
                } else {
                    sakai.api.Util.notification.show($(contentProfileBasicInfoFailedLoadingData).html(), $(contentProfileBasicInfoFailedLoadingFileData).html());
                }
            });
        }
    };

    var postLoadContentData = function() {
        // And render the basic information
        var renderedTemplate = $.TemplateRenderer("content_profile_basic_info_template", sakai.content_profile.content_data);
        var renderedDiv = $(document.createElement("div"));
        renderedDiv.html(renderedTemplate);
        $(contentProfileBasicInfoContainer).html(renderedDiv);
        // Show the basic info container
        $(contentProfileBasicInfoContainer).show();

        addBindingBasicinfo();

        // Data needs to be populated with the initial saved data
        // A value of 'true' is sent to make clear this is init functionality
        data = getFormValues(true);
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
                            break;
                        }
                        else {
                            anon = true;
                        }
                    }
                }
                else {
                    anon = true;
                }
                loadContentProfile();
            },
            error: function(xhr, textStatus, thrownError){
                anon = true;
                loadContentProfile();
            }
        });
    };

    var addAnotherLocation = function(){
        var renderedTemplate = $.TemplateRenderer("content_profile_basic_info_firstlevel_template", sakai.content_profile.content_data);
        var renderedDiv = $(document.createElement("div"));
        renderedDiv.html(renderedTemplate);
        $("#content_profile_basic_info_add_another_container").append(renderedDiv);
        // Apply style to the rendered div
        $(renderedDiv).addClass("content_profile_basic_info_added_directory");
        $(contentProfileBasicInfoAddAnotherLocationLink).text(sakai.api.Security.saneHTML($("#content_profile_basic_info_add_another_text").text()));
    }

    /**
     * Update the select boxes on the stage
     * @param {String} select Containing ID to check which box value has been changed
     * @param {String} changedboxvalue Containing selected value
     * @param {String} firstlevelvalue Containing value of first select box
     */
    var updateDirectoryDisplay = function(select, changedboxvalue, firstlevelvalue){
        var obj = {
            "firstlevelvalue":firstlevelvalue.selected().val(),
            "changedboxvalue" : changedboxvalue.selected().val(),
            "directory": directoryJSON
        };
        if(select === contentProfileBasicInfoDirectoryLvlTwo){
            $(firstlevelvalue.parent().children("#content_profile_basic_info_secondlevel_template_container")).html($.TemplateRenderer(contentProfileBasicInfoSecondLevelTemplate, obj));
        }else{
            $(firstlevelvalue.parent().children("#content_profile_basic_info_thirdlevel_template_container")).html($.TemplateRenderer(contentProfileBasicInfoThirdLevelTemplate, obj));
        }
    };

    var removeDirectoryLocation = function(clickedParent){
        // Get current tags up to date
        currentTags = data["sakai:tags"];
        // Extract tags from clickedParent
        var tags = []
        tags = clickedParent[0].className.split(",");
        tags.push("directory/" + tags.toString().replace(/,/g,"/"));

        var tagsAfterDeletion = currentTags.slice(0);
        for (var tag = 0 in tags){
            if(jQuery.inArray(tags[tag],tagsAfterDeletion) > -1){
                tagsAfterDeletion.splice(jQuery.inArray(tags[tag],tagsAfterDeletion), 1);
            }
        }

        sakai.api.Util.tagEntity(contentPath, tagsAfterDeletion, currentTags, function(){
            currentTags = currentTags.splice(tags);
            // TODO show a valid message to the user instead of reloading the page
            $(window).trigger('hashchange');
            sakai.api.Util.notification.show($(contentProfileBasicInfoUpdatedBasicInfo).html(), $(contentProfileBasicInfoFileBasicInfoUpdated).html());
        });
    }

    /**
     * Bind the widget's internal Cancel and Save Settings button
     */
    var addBinding = function(){

        $(contentProfileBasicInfoDirectoryLvlOne).live("change", function(){
            $(this).parent().children(contentProfileBasicInfoThirdLevelTemplateContainer).html("");
            $(this).children("option[value='no_value']").remove();
            updateDirectoryDisplay(contentProfileBasicInfoDirectoryLvlTwo, $($(this).parent()).children(contentProfileBasicInfoDirectoryLvlOne), $($(this).parent()).children(contentProfileBasicInfoDirectoryLvlOne));
        });

        $(contentProfileBasicInfoDirectoryLvlTwo).live("change", function(){
            $(this).children("option[value='no_value']").remove();
            updateDirectoryDisplay(contentProfileBasicInfoDirectoryLvlThree, $($(this).parent()).children(contentProfileBasicInfoDirectoryLvlTwo), $($(this).parent().parent()).children(contentProfileBasicInfoDirectoryLvlOne));
        });

        $(contentProfileBasicInfoDirectoryLvlThree).live("change", function(){
            $(this).children("option[value='no_value']").remove();
        });

        $(contentProfileBasicInfoAddAnotherLocation).live("click", function(){
            addAnotherLocation();
        });

        $(contentProfileBasicInfoRemoveLocation).live("click", function(){
            removeDirectoryLocation($(this).parent());
        });

        $(contentProfileBasicInfoRemoveNewLocation).live("click", function(){
            $(this).parent().remove();
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
        $(window).bind('hashchange', function(){
            handleHashChange();
        });

        handleHashChange();
    };

    var handleHashChange = function() {
        contentPath = $.bbq.getState("content_path") || "";
        if (sakai.data.me.user.anon) {
            anon = true;
            loadContentProfile();
        }
        else {
            checkFileManager();
        }
    };

    if (sakai.content_profile.content_data && sakai.content_profile.content_data.data) {
        doInit();
    } else {
        $(window).bind("sakai-contentprofile-ready", function() {
            doInit();
        });
    }

};
sakai.api.Widgets.widgetLoader.informOnLoad("contentprofilebasicinfo");