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

    // Tags created in the back end that are to be linked to uploaded files
    var tagsToBeLinked = [];
    var tagsCreated = false;
    // Variables to keep track of which file has been tagged already
    // and to keep track of which tags have already been linked to a file
    var currentFile = 0;
    var currentTag = 0;
    // Variable used to check if all tags have been created and linking them to the uploaded files can start
    var checkTaggingAgain;
    // All files that need to have been uploaded
    var uploadedFiles;

    // Result variables that tell the user success or failure of upload
    var createTagErrors = 0;
    var linkTagErrors = 0;
    var setDescriptionErrors = 0;

    var createdTags = 0;
    var linkedTags = 0;
    var setDescriptions = 0;

    // Classes
    var multiFileRemove = ".MultiFile-remove";

    // ID
    var fileUploadAddDescription = "#fileupload_add_description";
    var multiFileUpload = "#multifile_upload";
    var newUploaderForm = "#new_uploader form";
    var uploadFileList = "#upload_file_list";
    var fileUploadAddTags = "#fileupload_add_tags";

    // Form
    var multiFileForm = "#multifile_form";

    // Templates
    var fileUploadTaggingTemplate = "#fileupload_tagging_template";
    var fileUploadResultsTemplate = "#fileupload_results_template";

    // Containers
    var fileUploadRenderedTagging = "#fileupload_rendered_tagging";
    var fileUploadContainer = "#fileupload_container";

    // Paths
    var uploadPath = "/system/pool/createfile";
    var userId = sakai.data.me.user.userid;
    var userStoragePrefix = sakai.data.me.user.userStoragePrefix;
    var tagsPath = "/~" + userId + "/public/tags/";
    var tagsPathForLinking = "/_user/" + userStoragePrefix + "public/tags/";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Public function that can be called from elsewhere
     * (e.g. chat and sites widget)
     * It initializes the fileupload widget and shows the jqmodal (ligthbox)
     */
    sakai.fileupload.initialise = function(){
        $(fileUploadContainer).jqmShow();
    };

    sakai.fileupload.MultiFileSelected = function(extractedData){
        // Render the template that enables tagging of uploads
        var obj = {};
        obj.uploads = extractedData;
        if ($(multiFileRemove).length == 0) {
            var renderedTemplate = $.TemplateRenderer(fileUploadTaggingTemplate, obj).replace(/\r/g, '');
        }
        var renderedDiv = $(document.createElement("div"));
        $(fileUploadRenderedTagging).html(renderedTemplate);
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
        })
        hash.o.remove();
        hash.w.hide();
    }

    /**
     * Only reset the lists, don't close the jqm box
     */
    var resetFields = function(){
        // Show notification of success or failure
        sakai.api.Util.notification.show("Upload results", "Created " + createdTags + " tags, failed " + createTagErrors + ". Linked " + linkedTags + " tags to uploads, failed " + linkTagErrors + ". Set " + setDescriptions + " descriptions on uploads, failed " + setDescriptionErrors + ".");
        // Clear HTML, Clear file list
        $(fileUploadRenderedTagging).html("");
        // Render the results
        var obj = {
            "results": {
                "createTagErrors" : createTagErrors,
                "linkTagErrors" : linkTagErrors,
                "setDescriptionErrors" : setDescriptionErrors,
                "setDescriptions" : setDescriptions,
                "linkedTags" : linkedTags,
                "createdTags" : createdTags
            }
        };
        //obj.results.push("createTagErrors", createTagErrors);
        var renderedTemplate = $.TemplateRenderer(fileUploadResultsTemplate, obj).replace(/\r/g, '');
        var renderedDiv = $(document.createElement("div"));
        $(fileUploadRenderedTagging).html(renderedTemplate);
        // Remove files out of list
        $(multiFileRemove).each(function(){
            $(this).click();
        })
        // Reset variables
        createTagErrors = 0;
        linkTagErrors = 0;
        setDescriptionErrors = 0;
        setDescriptions = 0;
        linkedTags = 0;
        createdTags = 0;
    }

    var batchLinkTagsToContent = function(tags){
        var extractedData = [];
        //loop over nodes to extract data
        for (var i in tags){
            tagsToBeLinked.push(tags[i].url);
        };
        // Batch link the files with the tags
    }

    /**
     * Create the tags before linking them to the uploads
     * @param {Object} tags array of tags to be created
     */
    var batchCreateTags = function(tags){
        // Create the data to send with the batch request
        var batchData = [];
        for (var i in tags) {
            var item = {
                "url": tagsPath + tags[i].trim(),
                "method" : "POST",
                "parameters" : {
                    "./jcr:primaryType": "nt:folder",
                    "./jcr:mixinTypes": "sakai:propertiesmix",
                    "./sakai:tag-name": tags[i].trim(),
                    "./sling:resourceType": "sakai/tag"
                }
            };
            batchData[batchData.length] = item;
        }
        // Do the Batch request
        $.ajax({
            url: sakai.config.URL.BATCH,
            traditional: true,
            type : "POST",
            cache: false,
            data: {
                requests: $.toJSON(batchData)
            },
            success: function(data){
                batchLinkTagsToContent(data);
            },
            error: function(xhr, textStatus, thrownError){
                alert(textStatus);
            }
        });

    }

    /**
     * Format tags so that they can be created
     * Remove spaces and split up in an array
     * Call createTags to create the tags
     * @param {Object} tags Unformatted string of tags put in by a user
     */
    var formatTags = function(tags){
        if (tags != "") {
            // Split up tags
            splitTags = tags.split(",");
            // Create tags
            //createTags(splitTags);
            batchCreateTags(splitTags);
        }
        else {
            tagsCreated = true;
        }
    };

    var setDescription = function(){
        // The current file has all tags linked, now add the description to it
        var data = {
            "sakai:description": $(fileUploadAddDescription).val()
        }
        // Add the description
        $.ajax({
            url: "/p/" + uploadedFiles[0].hashpath,
            type: "POST",
            success: function(data){
                // The description has been set for this file
                setDescriptions++;
                // Remove the file from the array and start over for the next new file if there is one
                uploadedFiles.splice(0, 1);
                currentTag = 0;
                tagUploads();
            },
            error: function(xhr, textStatus, thrownError){
                // The description could not be set to the file
                setDescriptionErrors++;
            },
            data: data
        });
    }

    /**
     * Tag the uploaded files with the provided tags
     */
    var tagUploads = function(){
        clearTimeout(checkTaggingAgain);
        // Check if all tags have been created
        if (tagsCreated) {
            // Check if there are any more files that need tagging
            if (uploadedFiles.length > 0) {
                if (tagsToBeLinked.length != 0) {
                    var data = {
                        "key": tagsPathForLinking + tagsToBeLinked[currentTag].trim(),
                        ":operation": "tag"
                    }
                    // The tag has been created and the file uploaded so link the two together
                    $.ajax({
                        url: "/p/" + uploadedFiles[0].hashpath,
                        type: "POST",
                        success: function(data){
                            // The tag has been linked to the file
                            linkedTags ++;
                            // Increase the currentTag with one and check if there is another file to be tagged
                            currentTag++;
                            if (currentTag === tagsToBeLinked.length) {
                                if ($(fileUploadAddDescription).val() != "") {
                                    setDescription();
                                } else {
                                    uploadedFiles.splice(0, 1);
                                    currentTag = 0;
                                    tagUploads();
                                }
                            }
                            else {
                                // There are still some tags to be linked to this file
                                tagUploads();
                            }
                        },
                        error: function(xhr, textStatus, thrownError){
                            // The tag could not be linked to the file
                            linkTagErrors++;
                        },
                        data: data
                    });
                }
                else {
                    // There are no tags so just put in the description
                    
                    if ($(fileUploadAddDescription).val() != "") {
                        setDescription();
                    }
                    else {
                        uploadedFiles.splice(0, 1);
                        currentTag = 0;
                        tagUploads();
                    }
                }
            }
            else {
                // Finished tagging
                currentFile = 0;
                currentTag = 0;
                resetFields();
            }
        }
        else {
            // Not all tags have been created, check again in two seconds
            checkTaggingAgain = setTimeout(tagUploads, 2000);
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

                    $(multiFileUpload).MultiFile('reset');
                    $(multiFileUpload).val('');

                    uploadedFiles = extractedData;
                }
            });
        });
    };

    // Bind submit form for file upload
    $(multiFileForm).live("submit", function(){
        // Clear old tags
        tagsToBeLinked = [];
        // Initiate the tagging process
        formatTags($(fileUploadAddTags).val());
    });

    $(fileUploadContainer).jqm({
        modal: true,
        overlay: 20,
        toTop: true,
        onHide: closeUploadBox
    });

    initialiseUploader();
};

sakai.api.Widgets.widgetLoader.informOnLoad("fileupload");