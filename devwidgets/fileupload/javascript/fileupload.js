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

/*global $, Querystring, fluid, sakai, window */

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
    var dataResponse = false;

    var filesUploaded = false;

    var groupContext = false;
    var newVersion = false;
    var uploadedLink = false;
    var newVersionIsLink = false;
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
    var fileUploadUploadContent = "#upload_content";
    var fileUploadAddTags = "#fileupload_add_tags";
    var fileUploadProgressId = "#fileupload_upload_progress";
    var fileUploadPermissionsSelect = "#fileupload_permissions_select";
    var fileUploadWidgetTitle= "#fileupload_widget_title";
    var fileUploadWidgetTitleNewVersion= "#fileupload_widget_title_new_version";
    var fileUploadAddVersionDescription = "#fileupload_add_version_description";

    var fileUploadLinkBoxInput= "#fileupload_link_box_input";
    var fileUploadLinkForm = "#link_form";
    var fileUploadAddLinkButton = "#fileupload_add_link_button";

    // Form
    var multiFileForm = "#multifile_form";
    var fileUploadSubmit = "#fileupload_submit";

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
    var fileUploadNoFiles = "#fileupload_no_files";
    var fileUploadNoFilesWereUploaded = "#fileupload_no_files_were_uploaded";
    var fileUploadEnterValidURL = "#fileupload_enter_valid_url";
    var fileUploadCheckURL = "#fileupload_check_url";
    var fileUploadNewVersionUploaded = "#fileupload_new_version_uploaded";
    var fileUploadNewVersionForFileUploaded = "#fileupload_new_version_for_file_uploaded";
    var fileUploadLinkUploaded = "#fileupload_link_uploaded";
    var fileUploadLinkSuccessfullyUploaded = "#fileupload_link_successfully_uploaded";
    var fileUploadFailedSavingVersion = "#fileupload_failed_saving_version";
    var fileUploadSavingNewVersionFailed = "#fileupload_saving_new_version_failed";
    var fileUploadFilesUploaded = "#fileupload_files_uploaded";
    var fileUploadFilesNotUploaded = "#fileupload_files_not_uploaded";
    var fileUploadFilesSuccessfullyUploaded = "#fileupload_files_successfully_uploaded";
    var fileUploadCloseDialog = "#fileupload_close_dialog";


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
        $(newUploaderForm).attr("action", uploadPath + ".createfile." + oldVersionPath);
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
        if ($("#groupbasicinfo_generalinfo_group_title").val() !== "" && $("#groupbasicinfo_generalinfo_group_title").val() !== undefined) {
            groupName = $("#groupbasicinfo_generalinfo_group_title").val();
        }
        else {
            groupName = getGroupId().replace("g-", "");
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
        // Clear HTML, Clear file list
        $(fileUploadRenderedTagging, $rootel).html("");
        $(fileUploadLinkBoxInput).val("");

        // Close the jqm box
        $(fileUploadContainer).jqmHide();
        $(window).trigger("sakai-fileupload-complete", {"files": dataResponse});
        // Show notification
        if (context !== "new_version") {
            if (uploadedLink) {
                if (filesUploaded) {
                    sakai.api.Util.notification.show($(fileUploadLinkUploaded, $rootel).html(), $(fileUploadLinkSuccessfullyUploaded, $rootel).html());
                } else {
                    sakai.api.Util.notification.show("", $(fileUploadFilesNotUploaded, $rootel).html());
                }
            }
            else {
                if (filesUploaded) {
                    sakai.api.Util.notification.show($(fileUploadFilesUploaded, $rootel).html(), $(fileUploadFilesSuccessfullyUploaded, $rootel).html());
                } else {
                    sakai.api.Util.notification.show("", $(fileUploadFilesNotUploaded, $rootel).html());
                }
            }
        } else {
            if(newVersion){
                sakai.api.Util.notification.show($(fileUploadNewVersionUploaded).html(), $(fileUploadNewVersionForFileUploaded).html());
            }
        }

        // Reset booleans
        filesUploaded = false;
        groupContext = false;
        newVersion = false;
        uploadedLink = false;
    };

    /**
     * Set the description of the uploaded files
     */
    var batchSetDescriptionAndName = function(){
        // Batch link the files with the tags
        var batchDescriptionData = [];
        for (var i in uploadedFiles) {
            if (uploadedFiles.hasOwnProperty(i)) {
                var item = {
                    "url": "/p/" + uploadedFiles[i].hashpath,
                    "method": "POST",
                    "parameters": {
                        "sakai:description": $(fileUploadAddDescription).val(),
                        "sakai:pooled-content-file-name": uploadedFiles[i].name,
                        "sakai:directory": "default",
                        "sakai:permissions" : $(fileUploadPermissionsSelect).val(),
                        "sakai:groupresource" : true
                    }
                };
                batchDescriptionData[batchDescriptionData.length] = item;
            }
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
                dataResponse = batchDescriptionData;
                // When this is a new revision of a file no more operations are executed
                // So close the lightbox and show the appropriate message
                if (context === "new_version"){
                    resetFields();
                }
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
            if (uploadedFiles.hasOwnProperty(k)) {
                for (var i in tags) {
                    if (tags.hasOwnProperty(i)) {
                        var item = {
                            "url": "/p/" + uploadedFiles[k].hashpath,
                            "method": "POST",
                            "parameters": {
                                "key": tagsPathForLinking + $.trim(tags[i]),
                                ":operation": "tag"
                            }
                        };
                        batchLinkTagsToContentData[batchLinkTagsToContentData.length] = item;
                    }
                }
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
            if (tags.hasOwnProperty(i)) {
                var item = {
                    "url": tagsPath + $.trim(tags[i]),
                    "method": "POST",
                    "parameters": {
                        "./jcr:primaryType": "nt:folder",
                        "./jcr:mixinTypes": "sakai:propertiesmix",
                        "./sakai:tag-name": $.trim(tags[i]),
                        "./sling:resourceType": "sakai/tag"
                    }
                };
                batchCreateTagsData[batchCreateTagsData.length] = item;
            }
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
                batchLinkTagsToContent();
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
        if ($.trim(inputTags) !== "") {
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
            if (uploadedFiles.hasOwnProperty(k)) {
                switch (permissions) {
                    // Logged in only
                    case "everyone":
                        var item = {
                            "url": "/p/" + uploadedFiles[k].hashpath + ".members.html",
                            "method": "POST",
                            "parameters": {
                                ":viewer": "everyone"
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
                    // Public
                    case "public":
                        var item = {
                            "url": "/p/" + uploadedFiles[k].hashpath + ".members.html",
                            "method": "POST",
                            "parameters": {
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
                    resetFields();
                }
            });
        } else{
            resetFields();
        }
    };

    /**
     * After uploading the link and if the context is 'group' the resource should be set as a group resource
     * @param {Object} data response from creating the link on the server
     */
    var setLinkAsGroupResource = function(results){
        // Create batch data
        var data = [];
        var permissions = {
            "url": "/p/" + results[$(fileUploadLinkBoxInput).val()] + ".members.json",
            "method": "POST",
            "parameters": {
                ":viewer": contextData.id
            }
        };
        data[data.length] = permissions;

        var properties = {
            "url": "/p/" + results[$(fileUploadLinkBoxInput).val()],
            "method": "POST",
            "parameters": {
                "sakai:groupresource" : true,
                "sakai:directory": "default",
                "sakai:permissions": "group"
            }
        }
        data[data.length] = properties;

        $.ajax({
            url: sakai.config.URL.BATCH,
            traditional: true,
            type: "POST",
            cache: false,
            data: {
                requests: $.toJSON(data)
            },
            success: function(data){
                resetFields();
            },
            error: function(){
                sakai.api.Util.notification.show("Not linked", "Link could not be added to the group");
            }
        });
    }

    /**
     * Upload the validated link to a file
     * Execute checks to see if this link is a revision or not
     */
    var uploadLink = function(){
        var body = "--AAAAA\r\n";
        body = body + "Content-Disposition: form-data; name=\"*\"; filename=\"" + $(fileUploadLinkBoxInput).val() + "\" \r\n";
        body = body + "Content-Type: x-sakai/link \r\n";
        body = body + "Content-Transfer-Encoding: binary\r\n\r\n";
        body = body + $(fileUploadLinkBoxInput).val() + "\r\n";
        body = body + "--AAAAA--\r\n";

        var path = "";
        if (newVersionIsLink){
            path = oldVersionPath;
        } else {
            path = uploadPath;
        }
        $.ajax({
            url: path,
            data: body,
            type: "POST",
            dataType: "json",
            beforeSend : function(xmlReq){
                xmlReq.setRequestHeader("Content-type", "multipart/form-data; boundary=AAAAA");
            },
            success: function(data){
                dataResponse = data;
                newVersionIsLink = false;
                uploadedLink = true;
                filesUploaded = true;
                if (context === "group") {
                    setLinkAsGroupResource(dataResponse);
                }else {
                    resetFields();
                }

            },
            error : function(err){
                sakai.api.Util.notification.show($(fileUploadCheckURL).html(), $(fileUploadEnterValidURL).html());
            }
        });
    };

    /**
     * Set the base file to be overwritten by a new file
     */
    var saveVersion = function(){
        $.ajax({
            url: "/p/" + oldVersionPath + ".save.json",
            type : "POST",
            success: function(data){
                newVersion = true;
                if (newVersionIsLink){
                    uploadLink();
                }else {
                    $(multiFileForm).trigger("submit");
                }
            },
            error: function(xhr, textStatus, thrownError){
                sakai.api.Util.notification.show($(fileUploadFailedSavingVersion).html(), $(fileUploadSavingNewVersionFailed).html());
            }
        });
    };

    /**
     * There was an error uploading files
     * Buttons and boxes should be enabled
     */
    var noFilesUploaded = function(){
        // Add the button to the form and remove loader class
        $(multiFileForm + " button").show();
        $(fileUploadProgressId).removeClass(fileUploadProgress);
        // Disable input fields
        if (context !== "new_version") {
            $(fileUploadAddTags).removeAttr("disabled");
            $(fileUploadAddDescription).removeAttr("disabled");
            $(fileUploadPermissionsSelect).removeAttr("disabled");
            $(fileUploadLinkBoxInput).removeAttr("disabled");
            $(fileUploadAddLinkButton).removeAttr("disabled");
        }
        else {
            $(fileUploadAddVersionDescription).removeAttr("disabled");
        }
        $(".fileupload_file_name input").enable(true);
        // Show a notification
        sakai.api.Util.notification.show($(fileUploadNoFiles).html(), $(fileUploadNoFilesWereUploaded).html());
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
                    // reset some variables
                    uploadedFiles = [];
                    tags = [];

                    // Create DOM element to extract data from response
                    // Use an object to keep track of the data
                    var $responseData = $.parseJSON(data.replace("<pre>", "").replace("</pre>", ""));
                    var extractedData = [];

                    //loop over nodes to extract data
                    for (var i in $responseData) {
                        if ($responseData.hasOwnProperty(i)) {
                            var obj = {};
                            obj.filename = i;
                            obj.hashpath = $responseData[i];
                            extractedData.push(obj);
                        }
                    }

                    // Check if there were any files uploaded
                    if (extractedData.length === 0) {
                        noFilesUploaded();
                    }
                    else {
                        // Files uploaded
                        filesUploaded = true;

                        // Initiate the tagging process
                        formatTags($(fileUploadAddTags).val());

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
                        if (context !== "new_version") {
                            // Set the description data on the completed uploads
                            batchSetDescriptionAndName();

                            // Set permissions on the files
                            setFilePermissions();
                        } else {
                            resetFields();
                        }
                    }
                },
                error : function(){
                    noFilesUploaded();
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
            $(fileUploadAddTags).attr("disabled", "disabled");
            $(fileUploadAddDescription).attr("disabled", "disabled");
            $(fileUploadPermissionsSelect).attr("disabled", "disabled");
            $(fileUploadLinkBoxInput).attr("disabled", "disabled");
            $(fileUploadAddLinkButton).attr("disabled", "disabled");
        } else {
            $(fileUploadAddVersionDescription).attr("disabled", "disabled");
        }
        $(".fileupload_file_name input").attr("disabled", "disabled");
        $(".MultiFile-remove").addClass("hide_remove_link");
    });

     $(fileUploadLinkForm).live("submit",function(){
         // Test if the link is valid before saving it
        var regEx = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (regEx.test($(fileUploadLinkBoxInput).val())){
            if (context !== "new_version") {
                uploadLink();
            }else{
                newVersionIsLink = true;
                saveVersion();
            }
        }else{
            // Show a notification
            sakai.api.Util.notification.show($(fileUploadCheckURL).html(), $(fileUploadEnterValidURL).html());
        }
        return false;
    });

    $(fileUploadContainer).jqm({
        modal: true,
        overlay: 20,
        zIndex: 4000,
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

    $(fileUploadSubmit).live("click", function(){
        saveVersion();
    });

    $(fileUploadCloseDialog).live("click", function() {
        $(fileUploadContainer).jqmHide();
    });

    $(fileUploadUploadContent).live("click", function(ev){
        // Check if the uploads need to be associated with a group or not
        if ($(fileUploadUploadContent).hasClass("group_content")) {
            groupContext = true;
            context = "group";
            $('#uploadfilescontainer').show();
            sakai.fileupload.initialise();
        }
        else
            if ($(fileUploadUploadContent).hasClass("new_version")) {
                // A new version of the file needs to be uploaded
                $(fileUploadWidgetTitleNewVersion).show();
                $(fileUploadWidgetTitle).hide();
                oldVersionPath = $(fileUploadUploadContent).data("hashpath").split("contentpath_")[1];
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