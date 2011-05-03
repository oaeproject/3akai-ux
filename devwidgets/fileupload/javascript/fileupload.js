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
/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jquery.json.js (toJSON)
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.validate.sakai-edited.js (validate)
 * /dev/lib/misc/querystring.js (Querystring)
 * /dev/lib/jquery/plugins/jquery.form.js (ajaxForm)
 * /dev/lib/jquery/plugins/jquery.MultiFile.js (MultiFile)
 */
require(["jquery", "sakai/sakai.api.core"], function($, sakai){

    /**
     * @name sakai_global.fileupload
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
    sakai_global.fileupload = function(tuid, showSettings){


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
        var performedSubmit = false;
        var oldVersionPath = "";
        var context = "";
        var type = "file";
        var activityMessage = "";

        var numberOfSelectedFiles = 0;

        // Classes
        var fileUploadProgressClass = "fileupload_upload_progress";
        var $multiFileRemove = $(".MultiFile-remove", $rootel);
        var $multiFileList = $(".MultiFile-list", $rootel);
        var $fileUploadNameError = $(".fileupload_name_error", $rootel);

        // ID
        var $fileUploadAddDescription = $("#fileupload_add_description");
        var $multiFileUpload = $("#multifile_upload", $rootel);
        var $newUploaderForm = $("#new_uploader form", $rootel);
        var $fileUploadAddTags = $("#fileupload_add_tags");
        var $fileUploadProgressId = $("#fileupload_upload_progress", $rootel);
        var $fileUploadPermissionsSelect = $("#fileupload_permissions_select");
        var $fileUploadWidgetTitle = $("#fileupload_widget_title", $rootel);
        var $fileUploadWidgetTitleNewVersion = $("#fileupload_widget_title_new_version", $rootel);
        var $fileUploadAddVersionDescription = $("#fileupload_add_version_description", $rootel);
        var fileUploadAjaxLoader = "#fileupload_ajax_loader";

        var $fileUploadLinkBox = $("#fileupload_link_box", $rootel);
        var $fileUploadLinkBoxInput = $("#fileupload_link_box_input", $rootel);
        var $fileUploadAddLinkButton = $("#fileupload_add_link_button", $rootel);

        // Form
        var $multiFileForm = $("#multifile_form", $rootel);
        var $fileUploadUpdateSubmit = $("#fileupload_update_submit");
        var $cancelButton = $(".fileupload_close");

        // Templates
        var $fileUploadTaggingTemplate = $("#fileupload_tagging_template", $rootel);
        var $fileUploadAddToTemplate = $("#fileupload_add_to_template", $rootel);
        var $fileUploadNoLimitToUploadTemplate = $("#fileupload_no_limit_to_upload_template", $rootel);
        var $fileUploadLimitToOneUploadTemplate = $("#fileupload_limit_to_one_upload_template", $rootel);

        // Containers
        var $fileUploadRenderedTagging = $("#fileupload_rendered_tagging", $rootel);
        var $fileUploadRenderedTaggingLink = $("#fileupload_rendered_tagging_link", $rootel);
        var $fileUploadContainer = $("#fileupload_container", $rootel);
        var $fileUploadAddToTemplateContainer = $("#fileupload_add_to_template_container", $rootel);
        var $fileuploadLimitContainer = $("#fileupload_limit_container", $rootel);

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
        var fileUploadEnterNameFor = "#fileupload_enter_name_for";


        var contextData = {};
        var uploadingNewVersion = false;
        var uploadingNewLink = false;

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Check if the input fields for description, name,... for uploads should be displayed
         * If the fields are displayed the input field for a link and the submit button are disabled
         */
        var checkSelectedFiles = function(){
            if (numberOfSelectedFiles !== 0) {
                $fileUploadAddLinkButton.attr("disabled", "disabled");
                $fileUploadLinkBoxInput.attr("disabled", "disabled");
                // Check to see if it's already rendered
                if ($fileUploadRenderedTagging.html() === "") {
                    var json = {
                        "contextData": contextData,
                        "sakai": sakai
                    };
                    var renderedTemplate = sakai.api.Util.TemplateRenderer($fileUploadTaggingTemplate, json).replace(/\r/g, '');
                    $fileUploadRenderedTagging.html(renderedTemplate);
                    if (context !== "new_version") {
                        $("#multifile_upload_wrap_list").show();
                    }
                    $("#fileupload_add_link_option").hide();
                }
                // display tooltip
                tooltipData = {
                    "tooltipSelector": "#fileupload_form_submit",
                    "tooltipTitle": "TOOLTIP_UPLOAD_CONTENT",
                    "tooltipDescription": "TOOLTIP_UPLOAD_CONTENT_P3",
                    "tooltipArrow": "bottom",
                    "tooltipTop": -40,
                    "tooltipLeft": 20
                };
                $(window).trigger("update.tooltip.sakai", tooltipData);
            }
            else {
                $fileUploadAddLinkButton.removeAttr("disabled");
                $fileUploadLinkBoxInput.removeAttr("disabled");
                $multiFileList.hide();
                $("#fileupload_add_link_option").show();
                $fileUploadRenderedTagging.html("");
            }
        };

        /**
         * Increase the number of selected files
         * Check if the detailed information should be displayed
         */
        var increaseSelectedFiles = function(){
            numberOfSelectedFiles++;
            checkSelectedFiles();
        };

        $(window).bind("increaseSelectedFiles.fileupload.sakai", function(){
            increaseSelectedFiles();
        });

        /**
         * Decrease the number of selected files
         * Check if the detailed information should be displayed
         */
        var decreaseSelectedFiles = function(){
            numberOfSelectedFiles--;
            checkSelectedFiles();
        };

        $(window).bind("decreaseSelectedFiles.fileupload.sakai", function(){
            decreaseSelectedFiles();
        });

        /**
         * The plugin can't cope with giving limits after the input field
         * has already been rendered. So created two templates to render accordingly
         */
        var renderUnlimitedUpload = function(){
            var obj = [];
            var renderedTemplate = sakai.api.Util.TemplateRenderer($fileUploadNoLimitToUploadTemplate, obj).replace(/\r/g, '');
            $fileuploadLimitContainer.html(renderedTemplate);
            // Set multiFile on the rendered box
            $("input[type=file].multi").MultiFile();

            // add help text
            $("<p>", {
                "class": "fileupload_help",
                "text": $("#fileupload_help_text").html()
            }).insertAfter("input[type='file'].multi");

            // show add a link option
            $("#fileupload_add_link_option").show();
        };

        /**
         * The plugin can't cope with giving limits after the input field
         * has already been rendered. So created two templates to render accordingly
         */
        var renderLimitedUpload = function(){
            $newUploaderForm.attr("action", uploadPath + "." + oldVersionPath);
            var obj = [];
            var renderedTemplate = sakai.api.Util.TemplateRenderer($fileUploadLimitToOneUploadTemplate, obj).replace(/\r/g, '');
            $fileuploadLimitContainer.html(renderedTemplate);
            // Set multiFile on the rendered box
            $("input[type=file].multi").MultiFile();
            $multiFileList.hide();

            // add help text
            $("<p>", {
                "class": "fileupload_help",
                "text": $("#fileupload_help_text").html()
            }).insertAfter("input[type='file'].multi");

            // If the base version is a link then only a new link can be uploaded
            if (uploadingNewLink) {
                $fileUploadLinkBox.show();
                $("#new_uploader").hide();
                $("#fileupload_upload_option").hide();
            }
            else {
                $("#new_uploader").show();
                $(".fileupload_help").hide();
                $("#fileupload_add_link_option").hide();
            }
        };

        /**
         * This function will render a group upload. This context needs more data than user or new upload context
         * The title of the group is retrieved from the url on initialisation of the widget
         * This context will add the user as a manager, the group as viewer and, depending on the settings, other users as viewers.
         */
        var renderGroupUpload = function(){
            // Render template to show title
            var groupName = sakai_global.currentgroup.data.authprofile["sakai:group-title"];

            // Fill the data needed for the group
            contextData = {
                "context": context,
                "name": groupName,
                "id": sakai_global.currentgroup.id
            };
            // Render the template
            var renderedTemplate = sakai.api.Util.TemplateRenderer($fileUploadAddToTemplate, contextData).replace(/\r/g, '');
            $fileUploadAddToTemplateContainer.html(renderedTemplate);

            // Show lightbox
            $fileUploadContainer.jqmShow();

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
            var renderedTemplate = sakai.api.Util.TemplateRenderer($fileUploadAddToTemplate, contextData).replace(/\r/g, '');
            $fileUploadAddToTemplateContainer.html(renderedTemplate);

            // Show lightbox
            $fileUploadContainer.jqmShow();

            if (context === "new_version") {
                renderLimitedUpload();
            }
            else {
                renderUnlimitedUpload();
            }
        };

        /**
         * Public function that can be called from elsewhere
         * (e.g. chat and sites widget)
         * It initializes the fileupload widget and shows the jqmodal (ligthbox)
         */
        var initialise = function(){
            // position dialog box at users scroll position
            var htmlScrollPos = $("html").scrollTop();
            var docScrollPos = $(document).scrollTop();
            if (htmlScrollPos > 0) {
                $fileUploadContainer.css({
                    "top": htmlScrollPos + 100 + "px"
                });
            }
            else
                if (docScrollPos > 0) {
                    $fileUploadContainer.css({
                        "top": docScrollPos + 100 + "px"
                    });
                }

            // always appear in upload file mode
            $fileUploadLinkBox.hide();
            $("#new_uploader").show();
            $fileUploadLinkBoxInput.removeAttr("disabled");

            if (groupContext) {
                renderGroupUpload();
            }
            else
                if (newVersion) {
                    renderUserOrNewUpload();
                }
                else {
                    renderUserOrNewUpload();
                }
        };

        /**
         * Show the upload dialog box and reset the rootel
         * @param {Object} hash jqm data
         */
        var showUploadDialog = function(hash){
            hash.w.show();
            $rootel = $("#" + hash.w.attr("id") + "." + hash.w.attr("class").split(" ").join("."));
            $fileUploadAddDescription = $("#fileupload_add_description", $rootel);
            $fileUploadAddTags = $("#fileupload_add_tags", $rootel);
            $fileUploadCopyrightSelect = $("#fileupload_copyright_select", $rootel);
            $fileUploadPermissionsSelect = $("#fileupload_permissions_select", $rootel);
            $cancelButton = $(".fileupload_close", $rootel);
            $fileUploadUpdateSubmit = $("#fileupload_update_submit", $rootel);
            $multiFileList = $(".MultiFile-list", $rootel);
        };

        /**
         * Reset the fields and lists when the user closes the jqm box
         * @param {Object} hash jqm data
         */
        var closeUploadBox = function(hash){
            // Clear HTML, Clear file list, remove validation errors & jqm box
            $fileUploadLinkBoxInput.val("");
            $fileUploadRenderedTagging.html("");
            $fileUploadRenderedTaggingLink.html("");
            $("#fileupload_link_box form").validate().resetForm();

            // Remove files out of list
            $multiFileRemove.each(function(){
                $(this).click();
            });
            $rootel = $("#" + tuid);
            hash.o.remove();
            hash.w.hide();

            if (!filesUploaded) {
                // hide any tooltips if they are open
                $(window).trigger("done.tooltip.sakai");
            }
        };

        /**
         * Only reset the lists, don't close the jqm box
         */
        var resetFields = function(){
            // Clear HTML, Clear file list
            $fileUploadRenderedTagging.html("");
            $fileUploadRenderedTaggingLink.html("");
            $fileUploadLinkBoxInput.val("");

            // Close the jqm box
            $fileUploadContainer.jqmHide();
            $(window).trigger("complete.fileupload.sakai", {
                "files": dataResponse
            });

            // Show notification
            if (context !== "new_version") {
                if (uploadedLink) {
                    sakai.api.Util.notification.show($(fileUploadLinkUploaded).html(), $(fileUploadLinkSuccessfullyUploaded).html());
                }
                if (filesUploaded) {
                    sakai.api.Util.notification.show($(fileUploadFilesUploaded).html(), $(fileUploadFilesSuccessfullyUploaded).html());

                    // display tooltip
                    tooltipData = {
                        "tooltipSelector": "#systemtour_upload_file",
                        "tooltipTitle": "TOOLTIP_UPLOAD_CONTENT",
                        "tooltipDescription": "TOOLTIP_UPLOAD_CONTENT_P4",
                        "tooltipArrow": "top",
                        "tooltipTop": 25,
                        "tooltipLeft": 40,
                        "tooltipAutoClose": true
                    };
                    $(window).trigger("update.tooltip.sakai", tooltipData);
                }
            }
            else {
                if (newVersion) {
                    sakai.api.Util.notification.show($(fileUploadNewVersionUploaded).html(), $(fileUploadNewVersionForFileUploaded).html());
                }
            }

            // Reset the MultiFile uploader
            $multiFileUpload.MultiFile('reset');
            $multiFileUpload.val('');

            // Reset booleans
            filesUploaded = false;
            groupContext = false;
            newVersion = false;
            uploadedLink = false;
            performedSubmit = false;
        };

        /**
         * Set the description of the uploaded files
         */
        var batchSetDescriptionAndName = function(data){
            $fileUploadAddDescription = $($fileUploadAddDescription.selector);
            $fileUploadAddTags = $($fileUploadAddTags.selector);
            $fileUploadCopyrightSelect = $($fileUploadCopyrightSelect.selector);
            $fileUploadPermissionsSelect = $($fileUploadPermissionsSelect.selector);
            // Batch link the files with the tags
            var batchDescriptionData = [];
            // Check if it's a link that's been uploaded
            if (uploadedLink) {
                var preview = "";
                if (newVersionIsLink) {
                    preview = sakai.api.Content.getPreviewUrl($fileUploadLinkBoxInput.val());
                    var item = {
                        "url": "/p/" + oldVersionPath,
                        "method": "POST",
                        "parameters": {
                            "sakai:pooled-content-revurl": $fileUploadLinkBoxInput.val(),
                            "sakai:description": $fileUploadAddDescription.val(),
                            "sakai:permissions": $fileUploadPermissionsSelect.val(),
                            "sakai:copyright": $fileUploadCopyrightSelect.val(),
                            "sakai:directory": "default",
                            "sakai:preview-url": preview.url,
                            "sakai:preview-type": preview.type,
                            "sakai:preview-avatar": preview.avatar
                        }
                    };
                    batchDescriptionData[batchDescriptionData.length] = item;
                }
                else {

                    var url = $fileUploadLinkBoxInput.val();
                    preview = sakai.api.Content.getPreviewUrl(url);
                    $.each(data, function(index, path) {
                        var item2 = {
                            "url": "/p/" + path,
                            "method": "POST",
                            "parameters": {
                                "sakai:pooled-content-url": url,
                                "sakai:pooled-content-revurl": url,
                                "sakai:pooled-content-file-name": url,
                                "sakai:preview-url": preview.url,
                                "sakai:preview-type": preview.type,
                                "_mimeType": "x-sakai/link",
                                "length": url.length,
                                "sakai:directory": "default",
                                "sakai:description": $fileUploadAddDescription.val(),
                                "sakai:permissions": $fileUploadPermissionsSelect.val(),
                                "sakai:copyright": $fileUploadCopyrightSelect.val(),
                                "sakai:preview-avatar": preview.avatar
                            }
                        };
                        batchDescriptionData[batchDescriptionData.length] = item2;
                    });

                }

                // tag the link(s)
                tags = [];
                tags = sakai.api.Util.formatTags($fileUploadAddTags.val());
                for (var l in data) {
                    if (data.hasOwnProperty(l)) {
                        sakai.api.Util.tagEntity("/p/" + data[l], tags, []);
                    }
                }
            }
            else {
                for (var i in uploadedFiles) {
                    if (uploadedFiles.hasOwnProperty(i)) {
                        var item3 = {
                            "url": "/p/" + uploadedFiles[i].hashpath,
                            "method": "POST",
                            "parameters": {
                                "sakai:description": $fileUploadAddDescription.val(),
                                "sakai:originalfilename": uploadedFiles[i].filename,
                                "sakai:fileextension": uploadedFiles[i].filename.substring(uploadedFiles[i].filename.lastIndexOf("."), uploadedFiles[i].filename.length),
                                "sakai:pooled-content-file-name": uploadedFiles[i].name,
                                "sakai:directory": "default",
                                "sakai:permissions": $fileUploadPermissionsSelect.val(),
                                "sakai:copyright": $fileUploadCopyrightSelect.val(),
                                "sakai:allowcomments":"true",
                                "sakai:showcomments":"true"
                            }
                        };
                        batchDescriptionData[batchDescriptionData.length] = item3;
                    }
                }
            }
            dataResponse = batchDescriptionData;
            // Do the Batch request
            sakai.api.Server.batch(batchDescriptionData, function(success, data) {
                if (success) {
                    resetFields();
                }
            }, false, true);
        };

        /**
         * After uploading the link and if the context is 'group' the resource should be set as a group resource
         * @param {Object} data response from creating the link on the server
         */
        var setLinkAsGroupResource = function(results){
            // Create batch data
            var data = [];
            var permissions = {
                "url": "/p/" + results[$fileUploadLinkBoxInput.val()] + ".members.json",
                "method": "POST",
                "parameters": {
                    ":viewer": contextData.id
                }
            };
            data[data.length] = permissions;

            var properties = {
                "url": "/p/" + results[$fileUploadLinkBoxInput.val()],
                "method": "POST",
                "parameters": {
                    "sakai:groupresource": true,
                    "sakai:directory": "default",
                    "sakai:permissions": "private"
                }
            };
            data[data.length] = properties;
            sakai.api.Server.batch(data, function(success, data) {
                if (success) {
                    batchSetDescriptionAndName(results);
                } else {
                    sakai.api.Util.notification.show("Not linked", "Link could not be added to the group");
                }
            }, false);
        };

        /**
         * Upload the validated link to a file
         * Execute checks to see if this link is a revision or not
         */
        var uploadLink = function(){
            var target = $fileUploadLinkBoxInput.val();
            var link = {
                "sakai:pooled-content-file-name": target,
                "sakai:pooled-content-url": target
            };

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
                data: link,
                type: "POST",
                dataType: "json",
                success: function(data){
                    //loop over node to extract data
                    var linkArray = [];
                    $.each(data, function(filename, hashpath){
                        var obj = {
                            "filename": filename,
                            "hashpath": hashpath
                        };
                        linkArray.push(obj);
                    });
                    dataResponse = data;

                    uploadedLink = true;
                    filesUploaded = false;

                    batchSetDescriptionAndName(data);

                    newVersionIsLink = false;

                    if (context === "group") {
                        setLinkAsGroupResource(data);
                    }
                    else {
                        // Set permissions on the files
                        sakai.api.Content.setFilePermissions("public", linkArray, function(permissionsSet){
                        });
                    }

                    $(".fileupload_link_submit").removeAttr("disabled");
                    $fileUploadAddLinkButton.removeAttr("disabled");
                    $fileUploadLinkBoxInput.removeAttr("disabled");
                },
                error: function(err){
                    $fileUploadAddLinkButton.removeAttr("disabled");
                    $fileUploadLinkBoxInput.removeAttr("disabled");
                    sakai.api.Util.notification.show($(fileUploadCheckURL).html(), $(fileUploadEnterValidURL).html());
                }
            });
        };

        var getVersionDetails = function(){
            $.ajax({
                url: "/p/" + dataResponse[0].hashpath + ".2.json",
                type: "GET",
                success: function(data){
                    sakai_global.content_profile.content_data.data = data;
                    $(window).trigger("updated.version.content.sakai");
                    resetFields();
                }
            });
        };

        /**
         * Set the base file to be overwritten by a new file
         */
        var saveVersion = function(){
            $.ajax({
                url: "/p/" + oldVersionPath + ".save.json",
                type: "POST",
                success: function(data){
                    newVersion = true;
                    if (newVersionIsLink) {
                        uploadLink();
                    } else {
                        $multiFileForm.submit();
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
            $fileUploadRenderedTagging.find("button").show();
            $fileUploadProgressId.removeClass(fileUploadProgressClass);
            $fileUploadPermissionsSelect = $($fileUploadPermissionsSelect.selector);
            // Disable input fields
            if (context !== "new_version") {
                $fileUploadAddTags.removeAttr("disabled");
                $fileUploadAddDescription.removeAttr("disabled");
                $fileUploadPermissionsSelect.removeAttr("disabled");
                $fileUploadLinkBoxInput.removeAttr("disabled");
                $fileUploadAddLinkButton.removeAttr("disabled");
            }
            else {
                $fileUploadAddVersionDescription.removeAttr("disabled");
            }
            $(".fileupload_file_name input").enable(true);
            // Show a notification
            sakai.api.Util.notification.show($(fileUploadNoFiles).html(), $(fileUploadNoFilesWereUploaded).html());
        };

        /**
         * Set the file extension of the newly uploaded file
         * @param {String} extension eg '.jpg'
         */
        var setFileExtension = function(extension){
            var oldName = sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"].split(".");
            var oldExt = "." + oldName.pop();
            oldName = oldName.join(".");
            sakai_global.content_profile.content_data.path = "/p/" + oldVersionPath + "/" + oldName + extension;
            if (oldExt !== extension) {
                $.ajax({
                    url: "/p/" + oldVersionPath + ".json",
                    type: "POST",
                    data: {
                        "sakai:fileextension": extension,
                        "sakai:pooled-content-file-name": oldName + extension
                    },
                    complete: function(data){
                        // Get the version details in order to update the GUI
                        getVersionDetails();
                    }
                });
            } else {
              getVersionDetails();
            }
        };

        var handleCreateActivityResponse = function(responseData, success) {
            if (success) {
                // update the entity widget with the new activity
                $(window).trigger("updateContentActivity.entity.sakai", activityMessage);
            }
        };

        /**
         *
         */
        var initialiseUploader = function(){
            $multiFileUpload.MultiFile({
                list: $multiFileList
            });

            // Set the form action attribute
            $newUploaderForm.attr("action", uploadPath);
            $multiFileForm.ajaxForm({
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
                    dataResponse = extractedData;

                    // Check if there were any files uploaded
                    if (extractedData.length === 0) {
                        noFilesUploaded();
                    }
                    else {
                        // Files uploaded
                        filesUploaded = true;
                        $multiFileList = $($multiFileList.selector);
                        // Get the values out of the name boxes
                        $multiFileList.find("input").each(function(index){
                            for (var i in extractedData) {
                                if (extractedData.hasOwnProperty(i)) {
                                    // Fix IE7 issue where full path is used as a name for an upload
                                    // Cut off the extra path information with the following replace functions
                                    var replacedData = extractedData[i].filename.replace(/\./g, "_");
                                    if ($(this)[0].id === replacedData.substring(replacedData.lastIndexOf("\\") + 1, replacedData.length)) {
                                        extractedData[i].name = $(this).val();
                                        break;
                                    }
                                }
                            }
                        });

                        uploadedFiles = extractedData;

                        // Initiate the tagging process and create an activity
                        $fileUploadAddTags = $($fileUploadAddTags.selector);
                        tags = sakai.api.Util.formatTags($fileUploadAddTags.val());
                        activityMessage = "__MSG__UPLOADED_FILE__";
                        if (newVersion) {
                            activityMessage = "__MSG__UPLOADED_NEW_FILE_VERSION__";
                        }
                        var activityData = {
                            "sakai:activityMessage": activityMessage
                        };
                        for (var file in uploadedFiles) {
                            if (uploadedFiles.hasOwnProperty(file)) {
                                sakai.api.Util.tagEntity("/p/" + uploadedFiles[file].hashpath, tags, []);
                                sakai.api.Activity.createActivity("/p/" + uploadedFiles[file].hashpath, "content", "default", activityData, handleCreateActivityResponse);
                            }
                        }

                        // record that user uploaded a file
                        sakai.api.User.addUserProgress("uploadedContent");

                        // If the file is a new version set is as one
                        // Else it is a new file and needs to have a description, permissions, tags, ...
                        if (context !== "new_version") {
                            // Set the description data on the completed uploads

                            // Set permissions on the files
                            $fileUploadPermissionsSelect = $($fileUploadPermissionsSelect.selector);
                            sakai.api.Content.setFilePermissions($fileUploadPermissionsSelect.val(), uploadedFiles, function(permissionsSet){
                                batchSetDescriptionAndName();
                            }, contextData.id);

                        }
                        else {
                            // Set the new file extension
                            setFileExtension(uploadedFiles[0].filename.substring(uploadedFiles[0].filename.lastIndexOf("."), uploadedFiles[0].filename.length));
                        }
                    }
                },
                error: function(){
                    noFilesUploaded();
                }
            });
        };

        /**
         * Save the link
         */
        var linkFormSubmit = function(){
            $(".fileupload_link_submit").attr("disabled", "disabled");
            $fileUploadAddLinkButton.attr("disabled", "disabled");

            if ($("#fileupload_link_box form").valid() && !performedSubmit) {
                $fileUploadLinkBoxInput.attr("disabled", "disabled");
                performedSubmit = true;
                if (context !== "new_version") {
                    uploadLink();
                }
                else {
                    newVersionIsLink = true;
                    saveVersion();
                }
            }
            else {
                // validation plugin will show error
                $(".fileupload_link_submit").removeAttr("disabled");
                $fileUploadAddLinkButton.removeAttr("disabled");
                $fileUploadLinkBoxInput.removeAttr("disabled");
                performedSubmit = false;
            }
        };

        $("#fileupload_form_submit").die("click");
        $("#fileupload_form_submit").live("click", function(){
            if (type === "link") {
                linkFormSubmit();
            }
            else {
                var nameError = false;
                $fileUploadNameError.hide();
                $multiFileList.find("input").each(function(index){
                    if ($.trim($(this)[0].value).length === 0) {
                        var errorLabel = $(this).parent().next();
                        errorLabel.css("display", "block");
                        errorLabel.html($(fileUploadEnterNameFor).html() + " \"" + $(this)[0].defaultValue + "\"");
                        nameError = true;
                    }
                });
                if (!nameError) {
                    // hide cancel and add content buttons
                    $("#fileupload_form_submit").hide();
                    $("#fileupload_cancel").hide();
                    // show ajax loader
                    $(fileUploadAjaxLoader).show();
                    $multiFileForm.submit();
                }
            }
        });

        // Bind submit form for file upload
        $multiFileForm.live("submit", function(){
            $fileUploadNameError.hide();
            // Remove the button from the form and set loader class
            $fileUploadRenderedTagging.find("button").hide();
            $fileUploadProgressId.addClass(fileUploadProgressClass);
            $fileUploadPermissionsSelect = $($fileUploadPermissionsSelect.selector);
            // Disable input fields
            if (context !== "new_version") {
                $fileUploadAddTags.attr("disabled", "disabled");
                $fileUploadAddDescription.attr("disabled", "disabled");
                $fileUploadPermissionsSelect.attr("disabled", "disabled");
                $fileUploadLinkBoxInput.attr("disabled", "disabled");
                $fileUploadAddLinkButton.attr("disabled", "disabled");
            }
            else {
                $fileUploadAddVersionDescription.attr("disabled", "disabled");
            }
            $(".fileupload_file_name input").attr("disabled", "disabled");
            $(".MultiFile-remove").addClass("hide_remove_link");
        });


        jQuery.validator.addMethod("appendhttp", function(value, element){
            if (value.substring(0, 7) !== "http://" &&
            value.substring(0, 6) !== "ftp://" &&
            value.substring(0, 8) !== "https://" &&
            $.trim(value) !== "") {
                $(element).val("http://" + value);
            }
            return true;
        }, "No error message, this is just an appender");


        /** FORM VALIDATION **/
        $("#fileupload_link_box form").validate({
            onkeyup: false,
            messages: {
                url: $("#fileupload_enter_valid_url").html()
            }
        });

        $("#fileupload_link_box form").bind("submit", function(e){
            c();
            e.stopImmediatePropagation();
            return false;
        });

        $fileUploadContainer.jqm({
            modal: true,
            overlay: 20,
            zIndex: 5000,
            toTop: true,
            onHide: closeUploadBox,
            onShow: showUploadDialog
        });

        $cancelButton.die("click");
        $cancelButton.live("click", function(){
            // Clear HTML, Clear file list, remove validation errors and jqm box
            $fileUploadLinkBoxInput.val("");
            $fileUploadRenderedTagging.html("");
            $fileUploadRenderedTaggingLink.html("");
            $("#fileupload_link_box form").validate().resetForm();

            // Remove files out of list
            $multiFileRemove.each(function(){
                $(this).click();
            });
            $fileUploadContainer.jqmHide();
        });

        $fileUploadUpdateSubmit.die("click");
        $fileUploadUpdateSubmit.live("click", function(){
            saveVersion();
        });

        $(fileUploadCloseDialog).die("click");
        $(fileUploadCloseDialog).live("click", function(){
            $fileUploadContainer.jqmHide();
            // hide any tooltips if they are open
            $(window).trigger("done.tooltip.sakai");
        });

        /**
         * Invoke 'init.fileupload.sakai' to initialize the upload widget
         * There are 2 modes in which the widget can operate
         *
         * - The normal mode doesn't require any extra action by the developer, just fire the event and the widget pops up.
         *
         * - The new version mode requires an extra class to be added on the button that invokes the widget. The extra class is 'new_version'
         *   If you add another class 'new_link' then the new version will be considered to be a link.
         *
         * In both modes the button that invokes the uploader has the id 'upload_content'
         */
        $(window).unbind("init.fileupload.sakai");
        /**
         * Bind to init.fileupload.sakai
         *
         * @param {Object} ev The event
         * @param {Object} data Data to configure the fileupload widget. Can contain:
         {Boolean} newVersion If this is a new version, defaults to false
         {Boolean} isLink If this new version of a file is a link, defaults to false
         {String} contentPath The path to the existing content to add a new version to
         */
        $(window).bind("init.fileupload.sakai", function(ev, data){
            type = "file";
            var contentPath = "";
            if (data) {
                uploadingNewVersion = data.newVersion || false;
                uploadingNewLink = data.isLink || false;
                contentPath = data.contentPath || "";
            }
            // Check if the uploads need to be associated with a group or not
            if (sakai_global.currentgroup && sakai_global.currentgroup.id && !$.isEmptyObject(sakai_global.currentgroup.id)) {
                groupContext = true;
                context = "group";
                $('#uploadfilescontainer').show();
                initialise();
            }
            else {
                if (uploadingNewVersion) {
                    // If the base version is a link then only a new link can be uploaded
                    if (uploadingNewLink) {
                        $multiFileForm.hide();
                    }
                    else {
                        $multiFileForm.find("p").hide();
                        $fileUploadLinkBox.hide();
                    }
                    // A new version of the file needs to be uploaded
                    $fileUploadWidgetTitleNewVersion.show();
                    $fileUploadWidgetTitle.hide();
                    oldVersionPath = contentPath;
                    context = "new_version";
                    initialise();
                }
                else {
                    // Load the fileupload widget.
                    context = "user";
                    $('#uploadfilescontainer').show();
                    initialise();

                    // display tooltip
                    tooltipData = {
                        "tooltipSelector": "#fileupload_limit_container",
                        "tooltipTitle": "TOOLTIP_UPLOAD_CONTENT",
                        "tooltipDescription": "TOOLTIP_UPLOAD_CONTENT_P2",
                        "tooltipArrow": "top",
                        "tooltipTop": 10,
                        "tooltipLeft": 150
                    };
                    $(window).trigger("update.tooltip.sakai", tooltipData);
                }
            }
        });

        $("#fileupload_add_link").click(function(){
            type = "link";
            $("#new_uploader").hide();
            $fileUploadLinkBox.show();

            // render description, tag etc input fields
            if ($fileUploadRenderedTaggingLink.html() === "") {
                var json = {
                    "contextData": contextData,
                    "sakai": sakai
                };
                var renderedTemplate = sakai.api.Util.TemplateRenderer($fileUploadTaggingTemplate, json).replace(/\r/g, '');
                $fileUploadRenderedTaggingLink.html(renderedTemplate);
                $("#fileupload_rendered_tagging_link #fileupload_form_submit", $rootel).addClass("fileupload_link_submit");
            }
        });

        $("#fileupload_upload_file").click(function(){
            type = "file";
            $fileUploadLinkBox.hide();
            $("#new_uploader").show();
        });
        
        
        $("#ew_upload").bind("click", function(){
            initialise();
            $('#newentitywidget_widget').jqmHide();
        });

        initialiseUploader();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("fileupload");

});