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

/*global $, Querystring, fluid, sakai */

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

    var $rootel = $("#" + tuid);

    // All files that need to have been uploaded
    var uploadedFiles;
    var tags = [];

    var setDescriptionandName = false;
    var filesUploaded = false;
    var filesTagged = false;
    var tagsCreated = false;
    var setPermissions = false;

    var groupContext = false;
    var newVersion = false;
    var oldVersionPath = "";
    var context = "";

    // Classes
    var multiFileRemove = ".MultiFile-remove";
    var fileUploadProgress = "fileupload_upload_progress";
    var multiFileList = ".MultiFile-list";

    // ID
    var fileUploadAddDescription = "#fileupload_add_description";
    var multiFileUpload = "#multifile_upload";
    var newUploaderForm = "#new_uploader form";
    //var uploadFileList = "#upload_file_list";
    var fileUploadAddTags = "#fileupload_add_tags";
    var fileUploadProgressId = "#fileupload_upload_progress";
    var fileUploadPermissionsSelect = "#fileupload_permissions_select";
    var fileUploadWidgetTitle= "#fileupload_widget_title";
    var fileUploadWidgetTitleNewVersion= "#fileupload_widget_title_new_version";
    var fileUploadAddVersionDescription = "#fileupload_add_version_description";

    // Form
    var multiFileForm = "#multifile_form";

    var cancelButton = "#fileupload_cancel";

    // Templates
    var fileUploadTaggingTemplate = "#fileupload_tagging_template";
    var fileUploadAddToTemplate = "#fileupload_add_to_template";
    var fileUploadNoLimitToUploadTemplate = "#fileupload_no_limit_to_upload_template";
    var fileUploadLimitToOneUploadTemplate = "#fileupload_limit_to_one_upload_template";

    // Containers
    var fileUploadRenderedTagging = "#fileupload_rendered_tagging";
    var fileUploadContainer = "#fileupload_container";
    var fileUploadAddToTemplateContainer = "#fileupload_add_to_template_container";
    var fileuploadLimitContainer = "#fileupload_limit_container";

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

    var contextData = {};


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * The plugin can't cope with giving limits after the input field
     * has already been rendered. So created two templates to render accordingly
     */
    var renderUnlimitedUpload = function(){
        var obj =[];
        var renderedTemplate = $.TemplateRenderer(fileUploadNoLimitToUploadTemplate, obj).replace(/\r/g, '');
        $(fileuploadLimitContainer).html(renderedTemplate);
        // Set multiFile on the rendered box
        $("input[type=file].multi").MultiFile();
    };

    /**
     * The plugin can't cope with giving limits after the input field
     * has already been rendered. So created two templates to render accordingly
     */
    var renderLimitedUpload = function(){
        var obj =[];
        var renderedTemplate = $.TemplateRenderer(fileUploadLimitToOneUploadTemplate, obj).replace(/\r/g, '');
        $(fileuploadLimitContainer).html(renderedTemplate);
        // Set multiFile on the rendered box
        $("input[type=file].multi").MultiFile();
    };

    /**
     * Gets the group id from the querystring
     */
    var getGroupId = function(){
        var qs = new Querystring();
        return qs.get("id", false);
    };

    /**
     * This function will render a group upload. This context needs more data than user or new upload context
     * The title of the group is retrieved from the url on initialisation of the widget
     * This context will add the user as a manager, the group as viewer and, depending on the settings, other users as viewers.
     */
    var renderGroupUpload = function(){
        // Render template to show title
        var groupName;

        // The group name can be used to add content to
        if ($("#groupbasicinfo_generalinfo_group_title").val() !== "") {
            groupName = $("#groupbasicinfo_generalinfo_group_title").val();
        }
        else {
            groupName = getGroupId();
        }
        // Fill the data needed for the group
        contextData = {
            "context": context,
            "name": groupName,
            "id": getGroupId()
        };
        // Render the template
        var renderedTemplate = $.TemplateRenderer(fileUploadAddToTemplate, contextData).replace(/\r/g, '');
        $(fileUploadAddToTemplateContainer, $rootel).html(renderedTemplate);

        // Show lightbox
        $(fileUploadContainer, $rootel).jqmShow();

        // Render multifile component
        renderUnlimitedUpload();
    };

    /**
     * This function checks if the upload box to be rendered is in a user context or a new upload context
     * The user context gives the user unlimited uploads and adds the user as a manager
     * The new upload context will upload a new file revision for an old file and only allow one upload at once
     */
    var renderUserOrNewUpload = function(){
        // Fill the data needed for the group
        // The context variable will be needed to tell the renderer which context to render
        contextData = {
            "context": context
        };
        // Render the template
        var renderedTemplate = $.TemplateRenderer(fileUploadAddToTemplate, contextData).replace(/\r/g, '');
        $(fileUploadAddToTemplateContainer, $rootel).html(renderedTemplate);

        // Show lightbox
        $(fileUploadContainer, $rootel).jqmShow();

        if (context === "new_version") {
            renderLimitedUpload();
        } else {
            renderUnlimitedUpload();
        }
    };

    /**
     * Public function that can be called from elsewhere
     * (e.g. chat and sites widget)
     * It initializes the fileupload widget and shows the jqmodal (ligthbox)
     */
    sakai.fileupload.initialise = function(){
        if (groupContext){
            renderGroupUpload();
        } else if (newVersion){
            renderUserOrNewUpload();
        } else {
            renderUserOrNewUpload();
        }
    };

    /**
     * Executed when the Multifile filebrowser has a file selected
     * @param {Object} extractedData Data that comes in containing the files to be uploaded
     */
    sakai.fileupload.MultiFileSelected = function(){
        // Render the template that enables tagging of uploads
        if ($(multiFileRemove).length === 0) {
            var renderedTemplate = $.TemplateRenderer(fileUploadTaggingTemplate, contextData).replace(/\r/g, '');
            $(fileUploadRenderedTagging).html(renderedTemplate);
        }
    };

    /**
     * Reset the fields and lists when the user closes the jqm box
     * @param {Object} hash jqm data
     */
    var closeUploadBox = function(hash){
        // Clear HTML, Clear file list, remove jqm box
        $(fileUploadRenderedTagging, $rootel).html("");
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
        uploadedFiles = [];

        // Clear HTML, Clear file list
        $(fileUploadRenderedTagging, $rootel).html("");

        // Close the jqm box
        $(fileUploadContainer).jqmHide();

        // Show notification
        if (context !== "new_version") {
            var notification = "";
            if (filesUploaded) {
                notification += $(fileupload_files_uploaded, $rootel).html();
            }
            else {
                notification += $(fileupload_files_not_uploaded, $rootel).html();
            }
            if (setDescriptionandName) {
                notification += $(fileupload_description_name_set, $rootel).html();
            }
            else {
                notification += $(fileupload_description_name_not_set, $rootel).html();
            }
            if (tagsCreated) {
                notification += $(fileupload_tags_created, $rootel).html();
            }
            else {
                notification += $(fileupload_tags_not_created, $rootel).html();
            }
            if (filesTagged) {
                notification += $(fileupload_files_tagged, $rootel).html();
            }
            else {
                notification += $(fileupload_files_not_tagged, $rootel).html();
            }
            if (setPermissions) {
                notification += $(fileupload_permissions_set, $rootel).html();
            }
            else {
                notification += $(fileupload_permissions_not_set, $rootel).html();
            }
            sakai.api.Util.notification.show($(fileupload_files_successfully_uploaded, $rootel).html(), notification);
        }

        // Reset booleans
        setDescriptionandName = false;
        filesUploaded = false;
        filesTagged = false;
        tagsCreated = false;
        setPermissions = false;
        groupContext = false;
        newVersion = false;
    };

    /**
     * Set the description of the uploaded files
     */
    var batchSetDescriptionAndName = function(){
        // Batch link the files with the tags
        var batchDescriptionData = [];
        for (var i in uploadedFiles) {
            var item = {
                "url": "/p/" + uploadedFiles[i].hashpath,
                "method" : "POST",
                "parameters" : {
                    "sakai:description" : $(fileUploadAddDescription).val(),
                    "sakai:pooled-content-file-name" : uploadedFiles[i].name
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
                // When this is a new revision of a file no more operations are executed
                // So close the lightbox and show the appropriate message
                if (context === "new_version"){
                    resetFields();
                }
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
                                ":viewer": contextData.id
                            }
                        };
                        data[data.length] = item;
                    }
                    break;
                // Public
                case "public":
                    var item = {
                        "url" : "/p/" + uploadedFiles[k].hashpath  + ".members.html",
                        "method": "POST",
                        "parameters" : {
                            ":viewer": ["everyone", "anonymous"]
                        }
                    };
                    data[data.length] = item;

                    if (groupContext) {
                        var item = {
                            "url": "/p/" + uploadedFiles[k].hashpath + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":viewer": contextData.id
                            }
                        };
                        data[data.length] = item;
                    }
                    break;
                case "group":
                    var item = {
                        "url": "/p/" + uploadedFiles[k].hashpath + ".members.html",
                        "method": "POST",
                        "parameters": {
                            ":viewer": contextData.id
                        }
                    };
                    data[data.length] = item;
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
     * Set the description that the user put in the textarea
     */
    var setVersionDescription = function(){
        $.ajax({
            url: "/p/" + uploadedFiles[0].hashpath,
            type: "POST",
            data: {
                "sakai:versiondescription": ($(fileUploadAddVersionDescription)[0].value).replace(/"/g, '')
            },
            success: function(data){
                // Set name on the file
                batchSetDescriptionAndName();
                sakai.api.Util.notification.show("New version uploaded", "New version successfully uploaded");
            },
            error: function(xhr, textStatus, thrownError){
                sakai.api.Util.notification.show("Description not set", "New version successfully uploaded but failed to set description");
            }
        });
    };

    /**
     * Set the uploaded file as a new version to an older file
     */
    var setAsNewVersion = function(){
        $.ajax({
            url: "/p/" + oldVersionPath + ".save.html",
            type : "POST",
            success: function(data){
                setVersionDescription();
            },
            error: function(xhr, textStatus, thrownError){
                sakai.api.Util.notification.show("Failed setting new version", "Uploading new version failed");
            },
            data: {
                "url": "/p/" + uploadedFiles[0].hashpath
            }
        });
    };

    /**
     * Set the various settings for the fluid uploader component
     */
    var initialiseUploader = function(){
        $(function(){
            $(multiFileUpload).MultiFile({
                list: multiFileList
            });

            // Set the form action attribute
            $(newUploaderForm).attr("action", uploadPath);

            $(multiFileForm).ajaxForm({
                success: function(data){
                    // Create DOM element to extract data from response
                    // Use an object to keep track of the data
                    var $responseData = $(data);
                    var extractedData = [];

                    // Webkit browser get results in a different way
                    if ($.browser.webkit) {
                        var json = $.parseJSON($responseData[0].innerHTML);
                        //loop over nodes to extract data
                        for (var i in json){
                            var obj = {};
                            obj.filename = i;
                            obj.hashpath = json[i];
                            extractedData.push(obj);
                        }
                    }
                    else {
                        //loop over nodes to extract data
                        $responseData.find(".prop").each(function(){
                            var obj = {};
                            obj.filename = $(this).text();
                            obj.hashpath = $(this).next().text().replace(/"/g, '');
                            extractedData.push(obj);
                        });
                    }

                    // Check if there were any files uploaded
                    if (extractedData.length === 0) {
                        // Add the button to the form and remove loader class
                        $(multiFileForm + " button").show();
                        $(fileUploadProgressId).removeClass(fileUploadProgress);
                        // Disable input fields
                        if (context !== "new_version") {
                            $(fileUploadAddTags)[0].disabled = false;
                            $(fileUploadAddDescription)[0].disabled = false;
                            $(fileUploadPermissionsSelect)[0].disabled = false;
                        } else {
                            $(fileUploadAddVersionDescription)[0].disabled = false;
                        }
                        $(".fileupload_file_name input").enable(true);
                        // Show a notification
                        sakai.api.Util.notification.show($(fileupload_no_files).html(),$(fileupload_no_files_were_uploaded).html());
                    }
                    else {
                        // Files uploaded
                        filesUploaded = true;

                        // Get the values out of the name boxes
                        $(multiFileList + " input").each(function(index){
                            extractedData[index].name = $(this)[0].value;
                        });

                        // Reset the MultiFile uploader
                        $(multiFileUpload).MultiFile('reset');
                        $(multiFileUpload).val('');

                        uploadedFiles = extractedData;

                        // If the file is a new version set is as one
                        // Else it is a new file and needs to have a description, permissions, tags, ...
                        if (context === "new_version") {
                            // Set this file as new version
                            setAsNewVersion();
                        }
                        else {
                            // Set the description data on the completed uploads
                            batchSetDescriptionAndName();

                            // Set permissions on the files
                            setFilePermissions();

                            // Link the files to the tags
                            if (tags.length !== 0) {
                                batchLinkTagsToContent();
                            }
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
        if (context !== "new_version") {
            $(fileUploadAddTags)[0].disabled = true;
            $(fileUploadAddDescription)[0].disabled = true;
            $(fileUploadPermissionsSelect)[0].disabled = true;
            // Initiate the tagging process
            formatTags($(fileUploadAddTags).val());
        } else {
            $(fileUploadAddVersionDescription)[0].disabled = true;
        }
        $(".fileupload_file_name input").enable(false);
        $(".MultiFile-remove").addClass("hide_remove_link");
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
    });

    $('#upload_content').live("click", function(ev){
        // Check if the uploads neet to be associated with a group or not

        if ($('#upload_content').hasClass("group_content")) {
            groupContext = true;
            context = "group";
            $('#uploadfilescontainer').show();
            sakai.fileupload.initialise();
        }
        else
            if ($('#upload_content').hasClass("new_version")) {
                // A new version of the file needs to be uploaded
                newVersion = true;
                $(fileUploadWidgetTitleNewVersion).show();
                $(fileUploadWidgetTitle).hide();
                oldVersionPath = $("#upload_content").data("hashpath").split("contentpath_")[1];
                context = "new_version";
                sakai.fileupload.initialise();
            }
            else {
                // Load the fileupload widget.
                context = "user";
                $('#uploadfilescontainer').show();
                sakai.fileupload.initialise();
            }
    });

    initialiseUploader();
};

sakai.api.Widgets.widgetLoader.informOnLoad("fileupload");