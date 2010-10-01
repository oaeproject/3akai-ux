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

    var numberOfSelectedFiles = 0;

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

    var fileUploadLinkBox = "#fileupload_link_box";
    var fileUploadLinkBoxInput= "#fileupload_link_box_input";
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
     * Check if the input fields for description, name,... for uploads should be displayed
     * If the fields are displayed the input field for a link and the submit button are disabled
     */
    var checkSelectedFiles = function(){
        if (numberOfSelectedFiles !== 0) {
            $(fileUploadAddLinkButton).attr("disabled", "disabled");
            $(fileUploadLinkBoxInput).attr("disabled", "disabled");
            // Check to see if it's already rendered
            if ($(fileUploadRenderedTagging).html() === "") {
                var renderedTemplate = $.TemplateRenderer(fileUploadTaggingTemplate, contextData).replace(/\r/g, '');
                $(fileUploadRenderedTagging).html(renderedTemplate);
            }
        } else {
            $(fileUploadAddLinkButton).removeAttr("disabled");
            $(fileUploadLinkBoxInput).removeAttr("disabled");
            $(fileUploadRenderedTagging).html("");
        }
    };

    /**
     * Increase the number of selected files
     * Check if the detailed information should be displayed
     */
    sakai.fileupload.increaseSelectedFiles = function(){
        numberOfSelectedFiles++;
        checkSelectedFiles();
    };

    /**
     * Decrease the number of selected files
     * Check if the detailed information should be displayed
     */
    sakai.fileupload.decreaseSelectedFiles = function(){
        numberOfSelectedFiles--;
        checkSelectedFiles();
    };

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
        $(multiFileList).hide();
    };

    /**
     * This function will render a group upload. This context needs more data than user or new upload context
     * The title of the group is retrieved from the url on initialisation of the widget
     * This context will add the user as a manager, the group as viewer and, depending on the settings, other users as viewers.
     */
    var renderGroupUpload = function(){
        // Render template to show title
        var groupName = sakai.currentgroup.data.authprofile["sakai:group-title"];

        // Fill the data needed for the group
        contextData = {
            "context": context,
            "name": groupName,
            "id": sakai.currentgroup.id
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

        // Reset the MultiFile uploader
        $(multiFileUpload).MultiFile('reset');
        $(multiFileUpload).val('');

        // Reset booleans
        filesUploaded = false;
        groupContext = false;
        newVersion = false;
        uploadedLink = false;
    };

    /**
     * Set the description of the uploaded files
     */
    var batchSetDescriptionAndName = function(data){
        // Batch link the files with the tags
        var batchDescriptionData = [];
        // Check if it's a link that's been uploaded
        if (uploadedLink) {
            if (newVersionIsLink) {
                var item = {
                    "url": "/p/" + oldVersionPath,
                    "method": "POST",
                    "parameters": {
                        "sakai:pooled-content-revurl": $(fileUploadLinkBoxInput).val()
                    }
                };
                batchDescriptionData[batchDescriptionData.length] = item;
            }
            else {
                var pathHash, url;
                for (var k in data) {
                    if (data.hasOwnProperty(k)) {
                        pathHash = data[k];
                        url = k.substring(0,k.length-4); // remove .lnk from the end of it
                        break;
                    }
                }
                var item2 = {
                    "url": "/p/" + pathHash,
                    "method": "POST",
                    "parameters": {
                        "sakai:pooled-content-url": url,
                        "sakai:pooled-content-revurl": url,
                        "sakai:pooled-content-file-name": url,
                        "sakai:directory": "default",
                        "sakai:copyright": "creativecommons"
                    }
                };
                batchDescriptionData[batchDescriptionData.length] = item2;
            }
        } else {
            for (var i in uploadedFiles) {
                if (uploadedFiles.hasOwnProperty(i)) {
                    var item3 = {
                        "url": "/p/" + uploadedFiles[i].hashpath,
                        "method": "POST",
                        "parameters": {
                            "sakai:description": $(fileUploadAddDescription).val(),
                            "sakai:pooled-content-file-name": uploadedFiles[i].name,
                            "sakai:directory": "default",
                            "sakai:permissions": $(fileUploadPermissionsSelect).val(),
                            "sakai:copyright": "creativecommons"
                        }
                    };
                    batchDescriptionData[batchDescriptionData.length] = item3;
                }
            }
        }
        dataResponse = batchDescriptionData;
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
                // When this is a new revision of a file no more operations are executed
                // So close the lightbox and show the appropriate message
                if (context === "new_version"){
                    resetFields();
                }
            }
        });
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
        };
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
    };

    /**
     * Upload the validated link to a file
     * Execute checks to see if this link is a revision or not
     */
    var uploadLink = function(){
        var body = "";
        body = "--AAAAA\r\n";
        body = body + "Content-Disposition: form-data; name=\"*\"; filename=\"" + $(fileUploadLinkBoxInput).val() + ".lnk\"\r\n";
        body = body + "Content-Type: x-sakai/link\r\n";
        body = body + "sakai:pooled-content-url: " + $(fileUploadLinkBoxInput).val() + "\r\n";
        body = body + "Content-transfer-encoding: binary\r\n\r\n";
        body = body + $(fileUploadLinkBoxInput).val() + "\r\n";
        body = body + "--AAAAA--\r\n";

        var path = "";
        if (newVersionIsLink) {
            path = oldVersionPath;
        }
        else {
            path = uploadPath;
        }
        var url = path;
        if (context === "new_version") {
            url = "/p/" + path;
        }
        $.ajax({
            url: url,
            data: body,
            type: "POST",
            dataType: "json",
            contentType: "multipart/form-data; boundary=AAAAA",
            success: function(data){
                //loop over node to extract data
                var linkArray = [];
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        var obj = {};
                        obj.filename = i;
                        obj.hashpath = data[i];
                        linkArray.push(obj);
                    }
                }
                dataResponse = data;

                uploadedLink = true;
                filesUploaded = true;

                batchSetDescriptionAndName(data);

                newVersionIsLink = false;

                if (context === "group") {
                    setLinkAsGroupResource(data);
                } else {
                    // Set permissions on the files
                    sakai.api.Util.setFilePermissions("public", linkArray, function(permissionsSet){
                        resetFields();
                    });
                }

                $(fileUploadAddLinkButton).removeAttr("disabled");
                $(fileUploadLinkBoxInput).removeAttr("disabled");
            },
            error: function(err){
                $(fileUploadAddLinkButton).removeAttr("disabled");
                $(fileUploadLinkBoxInput).removeAttr("disabled");
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
                    var responseData = {};
                    if (jQuery.browser.webkit) {
                        responseData = $.parseJSON(data.split(">")[1].split("<")[0]);
                    }
                    else {
                        responseData = $.parseJSON(data.replace(/<pre>/i, "").replace(/<\/pre>/i, ""));
                    }
                    var extractedData = [];

                    //loop over nodes to extract data
                    for (var i in responseData) {
                        if (responseData.hasOwnProperty(i)) {
                            var obj = {};
                            obj.filename = i;
                            obj.hashpath = responseData[i];
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

                        // Get the values out of the name boxes
                        $(multiFileList + " input").each(function(index){
                            for (var i in extractedData){
                                if (extractedData.hasOwnProperty(i)) {
                                    if ($(this)[0].id === extractedData[i].filename.replace(/\./g, "_")) {
                                        extractedData[i].name = $(this)[0].value;
                                        break;
                                    }
                                }
                            }
                        });

                        uploadedFiles = extractedData;

                        // Initiate the tagging process
                        var tags = sakai.api.Util.formatTags($(fileUploadAddTags).val());
                        for (var file in uploadedFiles) {
                            if (uploadedFiles.hasOwnProperty(file)) {
                                sakai.api.Util.tagEntity("/p/" + uploadedFiles[file].hashpath, tags, [], function(){
                                });
                            }
                        }

                        // If the file is a new version set is as one
                        // Else it is a new file and needs to have a description, permissions, tags, ...
                        if (context !== "new_version") {
                            // Set the description data on the completed uploads
                            batchSetDescriptionAndName();

                            // Set permissions on the files
                            sakai.api.Util.setFilePermissions($(fileUploadPermissionsSelect).val(), uploadedFiles, function(permissionsSet){
                                resetFields();
                            });

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

    var performedSubmit = false;
    var invalidSubmit = 0;

    $("#fileupload_link_box form").validate({
        errorLabelContainer: "#error_msg_container",
        onclick:false,
        onkeyup:false,
        onfocusout:false,
        invalidHandler: function(form, validator) {
            if($(fileUploadLinkBoxInput).val().substring(0,7) !== "http://" && $(fileUploadLinkBoxInput).val().substring(0,6) !== "ftp://" && $(fileUploadLinkBoxInput).val().substring(0,8) !== "https://" && $.trim($(fileUploadLinkBoxInput).val()) !== ""){
                $(fileUploadLinkBoxInput).val("http://" + $(fileUploadLinkBoxInput).val());
                invalidSubmit = 1;
                $("#fileupload_link_box form button").trigger("submit");
            }
        }
    });

     $("#fileupload_link_box form").live("submit",function(){

         $(fileUploadAddLinkButton).attr("disabled", "disabled");
         $(fileUploadLinkBoxInput).attr("disabled", "disabled");

         if ($("#fileupload_link_box form").valid() && !($.trim(fileUploadLinkBoxInput) === "")) {
             if (invalidSubmit === 2) {
                 invalidSubmit = 0;
                 return false;
             }
             if (invalidSubmit === 1) {
                 invalidSubmit = 2;
             }
            if (context !== "new_version") {
                uploadLink();
            } else {
                newVersionIsLink = true;
                saveVersion();
            }
        } else {
            // Show a notification
            $(fileUploadAddLinkButton).removeAttr("disabled");
            $(fileUploadLinkBoxInput).removeAttr("disabled");
            performedSubmit = false;
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
        if (sakai.currentgroup && sakai.currentgroup.id && !$.isEmptyObject(sakai.currentgroup.id)) {
            groupContext = true;
            context = "group";
            $('#uploadfilescontainer').show();
            sakai.fileupload.initialise();
        }
        else
            if ($(fileUploadUploadContent).hasClass("new_version")) {
                // If the base version is a link then only a new link can be uploaded
                if($(fileUploadUploadContent).hasClass("new_link")){
                    $(multiFileForm).hide();
                } else{
                    $(multiFileForm + " p").hide();
                    $(fileUploadLinkBox).hide();
                }
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