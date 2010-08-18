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

/*global $, sakai, document */

/**
 * @name sakai.fileupload
 *
 * @class fileupload
 *
 * @description
 * Initialize the fileupload widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.fileupload = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    // Variable used to check if all tags have been created and linking them to the uploaded files can start
    var checkTaggingAgain;
    // All files that need to have been uploaded
    var uploadedFiles;
    var tags = [];
    var fileNames = [];

    var setDescriptionandName = false;
    var filesUploaded = false;
    var filesTagged = false;
    var tagsCreated = false;
    var setPermissions = false;

    var groupContext = false;

    // Classes
    var multiFileRemove = ".MultiFile-remove";
    var fileUploadProgress = "fileupload_upload_progress";

    // ID
    var fileUploadAddDescription = "#fileupload_add_description";
    var multiFileUpload = "#multifile_upload";
    var newUploaderForm = "#new_uploader form";
    var uploadFileList = "#upload_file_list";
    var fileUploadAddTags = "#fileupload_add_tags";
    var fileUploadProgressId = "#fileupload_upload_progress";
    var fileUploadPermissionsSelect = "#fileupload_permissions_select";

    // Form
    var multiFileForm = "#multifile_form";

    var cancelButton = "#fileupload_cancel";

    // Templates
    var fileUploadTaggingTemplate = "#fileupload_tagging_template";
    var fileUploadResultsTemplate = "#fileupload_results_template";
    var fileUploadAddToTemplate = "#fileupload_add_to_template";

    // Containers
    var fileUploadRenderedTagging = "#fileupload_rendered_tagging";
    var fileUploadContainer = "#fileupload_container";
    var fileUploadAddToTemplateContainer = "#fileupload_add_to_template_container";

    // Paths
    var uploadPath = "/system/pool/createfile";
    var userId = sakai.data.me.user.userid;
    var userStoragePrefix = sakai.data.me.user.userStoragePrefix;
    var tagsPath = "/~" + userId + "/public/tags/";
    var tagsPathForLinking = "/_user/" + userStoragePrefix + "public/tags/";

    // i18n
    var fileupload_files_uploaded = "#fileupload_files_uploaded";
    var fileupload_files_not_uploaded = "#fileupload_files_not_uploaded";
    var fileupload_description_name_set= "#fileupload_description_name_set";
    var fileupload_description_name_not_set = "#fileupload_description_name_not_set";
    var fileupload_tags_created = "#fileupload_tags_created";
    var fileupload_tags_not_created = "#fileupload_tags_not_created";
    var fileupload_files_tagged = "#fileupload_files_tagged";
    var fileupload_files_not_tagged = "#fileupload_files_not_tagged";
    var fileupload_permissions_set = "#fileupload_permissions_set";
    var fileupload_permissions_not_set = "#fileupload_permissions_not_set";
    var fileupload_files_successfully_uploaded = "#fileupload_files_successfully_uploaded";
    var fileupload_no_files = "#fileupload_no_files";
    var fileupload_no_files_were_uploaded = "#fileupload_no_files_were_uploaded";

    var groupContextData = {};


    ///////////////////////
    // Utility functions //
    ///////////////////////

    var getGroupId = function(){
        var qs = new Querystring();
        return qs.get("id", false);
    }

    /**
     * Public function that can be called from elsewhere
     * (e.g. chat and sites widget)
     * It initializes the fileupload widget and shows the jqmodal (ligthbox)
     */
    sakai.fileupload.initialise = function(){
        // Render template to show title
        var groupName;
        // If not name for the group has been set use the original groupname
        if ($("#groupbasicinfo_generalinfo_group_title").val() !== "") {
            groupName = $("#groupbasicinfo_generalinfo_group_title").val()
        }
        else {
            groupName = getGroupId();
        }
        // Fill the data needed for the group
        groupContextData = {
            "groupContext": groupContext,
            "groupName": groupName,
            "groupId": getGroupId()
        };
        // Render the template
        var renderedTemplate = $.TemplateRenderer(fileUploadAddToTemplate, groupContextData).replace(/\r/g, '');
        var renderedDiv = $(document.createElement("div"));
        $(fileUploadAddToTemplateContainer).html(renderedTemplate);

        // Show lightbox
        $(fileUploadContainer).jqmShow();
    };

    /**
     * Executed when the Multifile filebrowser has a file selected
     * @param {Object} extractedData Data that comes in containing the files to be uploaded
     */
    sakai.fileupload.MultiFileSelected = function(){
        // Render the template that enables tagging of uploads
        if ($(multiFileRemove).length == 0) {
            var renderedTemplate = $.TemplateRenderer(fileUploadTaggingTemplate, groupContextData).replace(/\r/g, '');
            var renderedDiv = $(document.createElement("div"));
            $(fileUploadRenderedTagging).html(renderedTemplate);
        }
        var inputId = $(multiFileRemove);
    };

    /**
     * Reset the fields and lists when the user closes the jqm box
     * @param {Object} hash jqm data
     */
    var closeUploadBox = function(hash){
        // Clear HTML, Clear file list, remove jqm box
        $(fileUploadRenderedTagging).html("");
        // Remove files out of list
        $(multiFileRemove).each(function(){
            $(this).click();
        });
        hash.o.remove();
        hash.w.hide();
    };

    /**
     * Only reset the lists, don't close the jqm box
     */
    var resetFields = function(){
        // Reset some variables
        tags = [];
        uploadedFiles = []

        // Clear HTML, Clear file list
        $(fileUploadRenderedTagging).html("");

        // Close the jqm box
        $(fileUploadContainer).jqmHide();

        // Show notification
        var notification = "";
        if (filesUploaded) {
            notification += $(fileupload_files_uploaded).html();
        } else {
            notification += $(fileupload_files_not_uploaded).html();
        }
        if (setDescriptionandName) {
            notification += $(fileupload_description_name_set).html();
        } else{
            notification += $(fileupload_description_name_not_set).html();
        }
        if (tagsCreated) {
            notification += $(fileupload_tags_created).html();
        } else {
            notification += $(fileupload_tags_not_created).html();
        }
        if (filesTagged) {
            notification += $(fileupload_files_tagged).html();
        } else {
            notification += $(fileupload_files_not_tagged).html();
        }
        if (setPermissions){
            notification += $(fileupload_permissions_set).html();
        } else {
            notification += $(fileupload_permissions_not_set).html();
        }
        sakai.api.Util.notification.show($(fileupload_files_successfully_uploaded).html(), notification);

        // Reset booleans
        setDescriptionandName = false;
        filesUploaded = false;
        filesTagged = false;
        tagsCreated = false;
        setPermissions = false;
    };

    /**
     * Set the description of the uploaded files
     */
    var batchSetDescriptionAndNameAndPermissions = function(){
        // Batch link the files with the tags
        var batchDescriptionData = [];
        for (var i in uploadedFiles) {
            var item = {
                "url": "/p/" + uploadedFiles[i].hashpath,
                "method" : "POST",
                "parameters" : {
                    "sakai:description" : $(fileUploadAddDescription).val(),
                    "sakai:name" : uploadedFiles[i].name
                }
            };
            batchDescriptionData[batchDescriptionData.length] = item;
        }
        // Do the Batch request
        $.ajax({
            url: sakai.config.URL.BATCH,
            traditional: true,
            type : "POST",
            cache: false,
            data: {
                requests: $.toJSON(batchDescriptionData)
            },
            success: function(data){
                // Description and name set
                setDescriptionandName = true;
            },
            error: function(xhr, textStatus, thrownError){
                // Description and name not set
                setDescriptionandName = false;
            }
        });
    };

    /**
     * Link the tags to the uploaded content
     * @param {Object} tags Array of tags
     */
    var batchLinkTagsToContent = function(){
        // Batch link the files with the tags
        var batchLinkTagsToContentData = [];
        for (var k in uploadedFiles) {
            for (var i in tags) {
                var item = {
                    "url" : "/p/" + uploadedFiles[k].hashpath,
                    "method": "POST",
                    "parameters": {
                        "key": tagsPathForLinking + tags[i].trim(),
                        ":operation": "tag"
                    }
                };
                batchLinkTagsToContentData[batchLinkTagsToContentData.length] = item;
            }
        }
        // Do the Batch request
        $.ajax({
            url: sakai.config.URL.BATCH,
            traditional: true,
            type : "POST",
            cache: false,
            data: {
                requests: $.toJSON(batchLinkTagsToContentData)
            },
            success: function(data){
                // Files tagged
                filesTagged = true;
            },
            error: function(xhr, textStatus, thrownError){
                // Files not tagged
                filesTagged = false;
            }
        });
    };

    /**
     * Create the tags before linking them to the uploads
     * @param {Object} tags array of tags to be created
     */
    var batchCreateTags = function(){
        // Create the data to send with the batch request
        var batchCreateTagsData = [];
        for (var i in tags) {
            var item = {
                "url": tagsPath + tags[i].trim(),
                "method": "POST",
                "parameters": {
                    "./jcr:primaryType": "nt:folder",
                    "./jcr:mixinTypes": "sakai:propertiesmix",
                    "./sakai:tag-name": tags[i].trim(),
                    "./sling:resourceType": "sakai/tag"
                }
            };
            batchCreateTagsData[batchCreateTagsData.length] = item;
        }
        // Do the Batch request
        $.ajax({
            url: sakai.config.URL.BATCH,
            traditional: true,
            type : "POST",
            cache: false,
            data: {
                requests: $.toJSON(batchCreateTagsData)
            },
            success: function(data){
                // Tags created
                tagsCreated = true;
            },
            error: function(xhr, textStatus, thrownError){
                // Tags not created
                tagsCreated = false;
            }
        });
    };

    /**
     * Format tags so that they can be created
     * Remove spaces and split up in an array
     * Call createTags to create the tags
     * @param {Object} tags Unformatted string of tags put in by a user
     */
    var formatTags = function(inputTags){
        if (inputTags.trim() !== "") {
            // Split up tags
            tags = inputTags.split(",");
            // Create tags
            batchCreateTags();
        }
    };

    /**
     * Set permissions on the files that were uploaded
     */
    var setFilePermissions = function(){
        // Get the value from the dropdown list
        var permissions = $(fileUploadPermissionsSelect).val();
        // Check which value was selected and fill in the data object accordingly
        var data = [];
        for (var k in uploadedFiles) {
            switch (permissions) {
                // Logged in only
                case "everyone":
                    var item = {
                        "url" : "/p/" + uploadedFiles[k].hashpath + ".members.html",
                        "method": "POST",
                        "parameters" : {
                            ":viewer": "everyone"
                        }
                    };

                    data[data.length] = item;
                    if(groupContext){
                        var item = {
                            "url" : "/p/" + uploadedFiles[k].hashpath + ".members.html",
                            "method": "POST",
                            "parameters" : {
                                ":viewer": groupContextData.groupId
                            }
                        };
                        data[data.length] = item;
                    }
                    fluid.log("logged in only");
                    break;
                // Public
                case "public":
                    var item = {
                        "url" : "/p/" + uploadedFiles[k].hashpath  + ".members.html",
                        "method": "POST",
                        "parameters" : {
                            ":viewer": "everyone"
                        }
                    };

                    data[data.length] = item;
                    // Due to a bug in the batch request servlet we have to create 2 seperate requests for the parameters.
                    // Parameters should be able to have the same name in the future.
                    var item = {
                        "url" : "/p/" + uploadedFiles[k].hashpath  + ".members.html",
                        "method": "POST",
                        "parameters" : {
                            ":viewer": "anonymous"
                        }
                    };
                    data[data.length] = item;

                    if (groupContext) {
                        var item = {
                            "url": "/p/" + uploadedFiles[k].hashpath + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":viewer": groupContextData.groupId
                            }
                        };
                        data[data.length] = item;
                    }
                    fluid.log("public");
                    break;
                case "group":
                    var item = {
                        "url": "/p/" + uploadedFiles[k].hashpath + ".members.html",
                        "method": "POST",
                        "parameters": {
                            ":viewer": groupContextData.groupId
                        }
                    };
                    data[data.length] = item;
                    fluid.log("group");
                    break;
            }
        }
        // Execute ajax call if the permissions are not set to private
        // Private permissions are the default so there is no need for an Ajax call
        if (permissions !== "private"){
            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                cache: false,
                data: {
                    requests: $.toJSON(data)
                },
                success: function(data){
                    setPermissions = true;
                    resetFields();
                },
                error: function(xhr, textStatus, thrownError){
                    setPermissions = false;
                }
            });
        } else{
            resetFields();
        }
    };

    /**
     * Set the various settings for the fluid uploader component
     */
    var initialiseUploader = function(){
        $(function(){
            $(multiFileUpload).MultiFile({
                list: uploadFileList
            });

            // Set the form action attribute
            $(newUploaderForm).attr("action", uploadPath);

            $(multiFileForm).ajaxForm({
                success: function(data){
                    // Create DOM element to extract data from response
                    // Use an object to keep track of the data
                    var $responseData = $(data);
                    var extractedData = [];

                    //loop over nodes to extract data
                    $responseData.find(".prop").each(function(){
                        var obj = {};
                        obj.filename = $(this).text();
                        obj.hashpath = $(this).next().text().replace(/"/g, '');
                        extractedData.push(obj);
                    });

                    // Check if there were any files uploaded
                    if (extractedData.length === 0) {
                        // Add the button to the form and remove loader class
                        $(multiFileForm + " button").show();
                        $(fileUploadProgressId).removeClass(fileUploadProgress);
                        // Disable input fields
                        $(fileUploadAddTags)[0].disabled = false;
                        $(fileUploadAddDescription)[0].disabled = false;
                        // Show a notification
                        sakai.api.Util.notification.show($(fileupload_no_files).html(),$(fileupload_no_files_were_uploaded).html());
                    }
                    else {
                        // Files uploaded
                        filesUploaded = true;

                        // Get the values out of the name boxes
                        $(uploadFileList + " input").each(function(index){
                            extractedData[index]["name"] = $(this)[0].value;
                        });

                        // Reset the MultiFile uploader
                        $(multiFileUpload).MultiFile('reset');
                        $(multiFileUpload).val('');

                        uploadedFiles = extractedData;

                        // Set the description data on the completed uploads
                        batchSetDescriptionAndNameAndPermissions();

                        // Set permissions on the files
                        setFilePermissions();

                        // Link the files to the tags
                        if (tags.length !== 0) {
                            batchLinkTagsToContent();
                        }
                    }
                }
            });
        });
    };

    // Bind submit form for file upload
    $(multiFileForm).live("submit", function(){
        // Remove the button from the form and set loader class
        $(multiFileForm + " button").hide();
        $(fileUploadProgressId).addClass(fileUploadProgress);
        // Disable input fields
        $(fileUploadAddTags)[0].disabled = true;
        $(fileUploadAddDescription)[0].disabled = true;
        // Initiate the tagging process
        formatTags($(fileUploadAddTags).val());
    });

    $(fileUploadContainer).jqm({
        modal: true,
        overlay: 20,
        toTop: true,
        onHide: closeUploadBox
    });

    $(cancelButton).live("click", function(){
        // Clear HTML, Clear file list, remove jqm box
        $(fileUploadRenderedTagging).html("");
        // Remove files out of list
        $(multiFileRemove).each(function(){
            $(this).click();
        });
        $(fileUploadContainer).jqmHide();
    })

    $('#upload_content').bind("click", function(ev){
        // Check if the uploads neet to be associated with a group or not
        if ($('#upload_content').hasClass("group_content")) {
            groupContext = true;
            $('#uploadfilescontainer').show();
            sakai.fileupload.initialise();
        }
        else {
            // Load the fileupload widget.
            $('#uploadfilescontainer').show();
            sakai.fileupload.initialise();
        }
    });

    initialiseUploader();
};

sakai.api.Widgets.widgetLoader.informOnLoad("fileupload");