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

    var createTagError = 0;
    // Tags created in the back end that are to be linked to uploaded files
    var tagsToBeLinked = [];
    var tagsCreated = false;
    // Variables to keep track of which file has been tagged already
    // and to keep track of which tags have already been linked to a file
    var currentFile = 0;
    var currentTag = 0;

    var userId = sakai.data.me.user.userid;
    var userStoragePrefix = sakai.data.me.user.userStoragePrefix;

    // Variable used to check if all tags have been created and linking them to the uploaded files can start
    var checkTaggingAgain;

    var uploadedFiles;

    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Public function that can be called from elsewhere
     * (e.g. chat and sites widget)
     * It initializes the fileupload widget and shows the jqmodal (ligthbox)
     */
    sakai.fileupload.initialise = function(){
        $("#fileupload_container").jqmShow();
    };

    $("#fileupload_container").jqm({
        modal: true,
        overlay: 20,
        toTop: true
    });

    sakai.fileupload.MultiFileSelected = function(extractedData){
        // Render the template that enables tagging of uploads
        var obj={};
        obj.uploads = extractedData;
        var renderedTemplate = $.TemplateRenderer("#fileupload_tagging_template", obj).replace(/\r/g, '');
        var renderedDiv = $(document.createElement("div"));
        $("#fileupload_rendered_tagging").html(renderedTemplate);
    };
    
    /**
     * Create the tags before linking them to the uploads
     * @param {Object} tags array of tags to be created
     */
    var createTags = function(tags){
        // Create the tags that are stored in the array
        // Trim front end ending space characters to avoid errors
        var data = {
            "./jcr:primaryType" : "nt:folder",
            "./jcr:mixinTypes" : "sakai:propertiesmix",
            "./sakai:tag-name" : tags[0].trim(),
            "./sling:resourceType" : "sakai/tag"
            };
        $.ajax({
            url: "/~" + userId + "/public/tags/" + tags[0].trim(),
            type: "POST",
            success: function(data){
                // Add the tag to the array that contains tags to be linked to content
                tagsToBeLinked.push(tags[0]);
                // Remove the created tag from the array
                tags.splice(0,1);
                // Check if more tags need to be created
                if (tags.length > 0){
                    // Call this function again to create other tags
                    createTags(tags);
                } else {
                    // Variable that will be used to link the tags to the files once they are uploaded
                    tagsCreated = true;
                    fluid.log("Tags created");
                }
                // Reset the error count
                createTagError = 0;
                fluid.log("tag created");
            },
            error: function(xhr, textStatus, thrownError){
                // The tag could not be created. Try again two times and then skip the tag
                if (createTagError != 1) {
                    createTagError ++;
                    createTags(tags);
                } else {
                    // Reset error count and remove faulty tag to try another one
                    createTagError = 0;
                    tags.splice(0, 1);
                    // Check if more tags need to be created
                    if (tags.length > 0) {
                        // Call this function again to create other tags
                        createTags(tags);
                    }
                }
            },
            data: data
        });
    };

    /**
     * Format tags so that they can be created
     * Remove spaces and split up in an array
     * Call createTags to create the tags
     * @param {Object} tags Unformatted string of tags put in by a user
     */
    var formatTags = function(tags){
        // Split up tags
        splitTags = tags.split(",");
        // Create tags
        createTags(splitTags);
    };

    /**
     * Tag the uploaded files with the provided tags
     */
    var tagUploads = function() {
        clearTimeout(checkTaggingAgain);
        // Check if all tags have been created
        if (tagsCreated) {
            // Check if there are any more files that need tagging
            if (uploadedFiles.length > 0) {
                var data = {
                    "key": "/_user/" + userStoragePrefix + "public/tags/" + tagsToBeLinked[currentTag].trim(),
                    ":operation": "tag"
                }
                // The tag has been created and the file uploaded so link the two together
                $.ajax({
                    url: "/p/" + uploadedFiles[0].hashpath,
                    type: "POST",
                    success: function(data){
                        fluid.log("File " + uploadedFiles[0].filename + " linked with tag " + tagsToBeLinked[currentTag]);
                        // The tag has been linked to the file
                        // Increase the currentTag with one and check if there is another file to be tagged
                        currentTag++;
                        if (currentTag === tagsToBeLinked.length) {
                            // All tags have been linked for this file
                            // Remove the file from the array and start over for the next new file if there is one
                            fluid.log("Removed from list: " + uploadedFiles[0].filename);
                            uploadedFiles.splice(0, 1);
                            currentTag = 0;
                            tagUploads();
                        }
                        else {
                            // There are still some tags to be linked to this file
                            tagUploads();
                        }
                    },
                    error: function(xhr, textStatus, thrownError){
                        // The tag could not be linked to the file
                        alert("An error has occured when linking the tag to your upload.");
                    },
                    data: data
                });
            }
            else {
                // Finished tagging
                currentFile = 0;
                currentTag = 0;
            }
        } else {
            fluid.log("CHECK AGAIN LATER!");
            // Not all tags have been created, check again in half a second
            checkTaggingAgain = setTimeout(tagUploads,2000);
        }
    };

    /**
     * Set the various settings for the fluid uploader component
     */
    var initialiseUploader = function(){
        $(function(){
            $("#multifile_upload").MultiFile({
                list: '#upload_file_list'
            });
            
            $("#new_uploader form").attr("action", "/system/pool/createfile");
            
            $("#multifile_form").ajaxForm({
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

                    $("#multifile_upload").MultiFile('reset');
                    $("#multifile_upload").val('');

                    uploadedFiles = extractedData;

                    tagUploads();
                }
            });
        });
    };

    // Bind submit form for file upload
    $("#multifile_form").live("submit", function(){
        // Clear old tags
        tagsToBeLinked = [];
        // Initiate the tagging process
        formatTags($("#fileupload_add_tags").val());
    });

    initialiseUploader();
};

sakai.api.Widgets.widgetLoader.informOnLoad("fileupload");