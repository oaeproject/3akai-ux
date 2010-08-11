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

    var options = {}; // Contains the different search options
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

    /**
     *
     * @param {Object} options  identifier for the current context, initial search
     *   query and initial tag filter
     *   {
     *        "context" : "myfiles", "allfiles", ...,
     *        "site": false or ["/sites/test"]
     *        "search" : false or "searchquery",
     *        "tag" : false or ["tag1","tag2","tag3"],
     *        "page" : 0
     *    }
     */
    var doFileSearch = function(_options){

    };

    /**
     * This event is fired at the end of an upload cycle when all the files have either been uploaded,
     * failed to upload, the user stopped the upload cycle,
     * or there was an unrecoverable error in the upload process and the upload cycle was stopped.
     * @param {Array} fileList The list of File objects that "completed" (either succeeded or failed), in this upload.
     */
    var uploadCompleteListener = function(fileList){
        doFileSearch(options);
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
                success: function(){
                    $("#multifile_upload").MultiFile('reset');
                    $("#multifile_upload").val('');
                    //uploadCompleteListener();
                }
            });
        });
    };

    initialiseUploader();
};

sakai.api.Widgets.widgetLoader.informOnLoad("fileupload");