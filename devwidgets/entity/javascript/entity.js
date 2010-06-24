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

/*global $, sdata, Config, fluid, window */

var sakai = sakai || {};
sakai.api.UI.entity = sakai.api.UI.entity || {};
sakai.api.UI.entity.data = sakai.api.UI.entity.data || {};
sakai.api.UI.entity.render = sakai.api.UI.entity.render || {};

/**
 * Initialize the entity widget - this widget provides person / space and content information
 * http://jira.sakaiproject.org/browse/SAKIII-371
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.entity = function(tuid, showSettings){


    /////////////////////////////
    // CONFIGURATION VARIABLES //
    /////////////////////////////

    // Chat status
    var availableStatus = "chat_available_status_";
    var availableStatus_online = availableStatus + "online";
    var availableStatus_busy = availableStatus + "busy";
    var availableStatus_offline = availableStatus + "offline";

    var entitymodes = ["myprofile", "profile", "space", "content"];
    var entityconfig = {
        mode: entitymodes[0], // Set the default entity mode
        data: {
            profile: "",
            count: {
                messages_unread: 0
            }
        }
    };
    var profile_dummy_status;


    ///////////////////
    // CSS SELECTORS //
    ///////////////////

    var $rootel = $("#" + tuid);

    // Container
    var $entity_container = $("#entity_container", $rootel);
    var $entity_container_template = $("#entity_container_template", $rootel);
    var $entity_container_actions = $("#entity_container_actions", $rootel);
    var $entity_container_actions_template = $("#entity_container_actions_template", $rootel);

    // Profile
    var $entity_profile_status;
    var $entity_profile_status_input;
    var entity_profile_status_input_dummy = "entity_profile_status_input_dummy";
    var $entity_profile_status_input_dummy;
    var $entity_profile_status_input_saving;
    var $entity_profile_status_input_saving_failed;

    // Chat status
    var $entity_profile_chatstatus;
    var profileChatStatusClass = ".myprofile_chat_status";
    var profileChatStatusID = "#myprofile_chat_status_";

    // Actions
    var $entity_action_delete = $("#entity_action_delete", $rootel);
    var $entity_action_download = $("#entity_action_download", $rootel);
    var $entity_action_upload = $("#entity_action_upload", $rootel);


    ////////////////////
    // UTIL FUNCTIONS //
    ////////////////////

    /**
     * Convert a file size to a human readable format (4 MB)
     * @param {Integer} filesize The filesize you want to convert into a human readable one
     * @return {String} A human readable file size
     */
    var convertToHumanReadableFileSize = function(filesize){

        // Divide the length into its largest unit
        var units = [[1024 * 1024 * 1024, 'GB'], [1024 * 1024, 'MB'], [1024, 'KB'], [1, 'bytes']];
        var lengthunits;
        for (var i = 0, j=units.length; i < j; i++) {

            var unitsize = units[i][0];
            var unittext = units[i][1];

            if (filesize >= unitsize) {
                filesize = filesize / unitsize;
                // 1 decimal place
                filesize = Math.ceil(filesize * 10) / 10;
                lengthunits = unittext;
                break;
            }
        }

        // Return the human readable filesize
        return filesize + " " + lengthunits;

    };

    /**
     * Change the mode for the entity widget
     * @param {String} mode The mode of how you would like to load the entity widget (entitymodes)
     */
    var changeMode = function(mode){

        // Check if the mode value exists and whether it is a valid option
        if (mode && $.inArray(mode, entitymodes) !== -1) {
            entityconfig.mode = mode;
        }
        else {
            fluid.log("Entity widget - changeMode - The mode couldn't be changed: '" + mode + "'.");
        }

    };

    /**
     * Render the main entity template
     */
    var renderTemplate = function(){
        $.TemplateRenderer($entity_container_template, entityconfig, $entity_container);
        $.TemplateRenderer($entity_container_actions_template, entityconfig, $entity_container_actions);
        $entity_container.show();
        $entity_container_actions.show();
    };

    /**
     * Check whether there is a valid picture for the user
     * @param {Object} profile The profile object that could contain the profile picture
     * @return {String}
     * The complete URL of the profile picture
     * Will be an empty string if there is no picture
     */
    var constructProfilePicture = function(profile){

        if (profile.picture && profile.path) {
            return "/_user" + profile.path + "/public/profile/" + $.parseJSON(profile.picture).name;
        }
        else {
            return "";
        }

    };

    /**
     * Add the right status css class on an element.
     * @param {Object} element the jquery element you wish to add the class to
     * @param {Object} status the status
     */
    var updateChatStatusElement = function(element, status){
        if (element) {
            element.removeClass(availableStatus_online);
            element.removeClass(availableStatus_busy);
            element.removeClass(availableStatus_offline);
            element.addClass(availableStatus + status);
        }
    };

    /**
     * Update the chat statuses all across the page.
     * @param {Object} status
     */
    var updateChatStatus = function(status){
        $(profileChatStatusClass).hide();
        $(profileChatStatusID + status).show();

        // Update the userid in the chat
        $.each(["#user_link", "#myprofile_name", ".chat_available_name"], function(index, value){
            updateChatStatusElement($(value), status);
        });
    };

    /**
     * Change the chat status for the current user
     * @param {String} chatstatus The chatstatus you want to update the chatstatus with
     * @param {Function} [callback] A callback function that gets fired after the request
     */
    var changeChatStatus = function(chatstatus, callback){

        if (entityconfig.data.profile.chatstatus !== chatstatus){
            // Set the correct data for the Ajax request
            var data = {
                "chatstatus": chatstatus,
                "_charset_": "utf-8"
            };

            // Send the ajax request
            $.ajax({
                url: sakai.data.me.profile["jcr:path"],
                type: "POST",
                data: data,
                success: function(data){
                    updateChatStatus(chatstatus);
                    entityconfig.data.profile.chatstatus = chatstatus;
                    if (typeof callback === "function") {
                        callback(true, data);
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    if (typeof callback === "function") {
                        callback(false, xhr);
                    }
                    fluid.log("Entity widget - An error occurend when sending the status to the server.");
                }
            });
        }


    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add binding to the profile status elements
     */
    var addBindingProfileStatus = function(){

        // We need to reinitialise the jQuery objects after the rendering
        $entity_profile_status = $("#entity_profile_status", $rootel);
        $entity_profile_status_input = $("#entity_profile_status_input", $rootel);
        $entity_profile_status_input_dummy = $("#entity_profile_status_input_dummy", $rootel);
        $entity_profile_status_input_saving = $("#entity_profile_status_input_saving", $rootel);
        $entity_profile_status_input_saving_failed = $("#entity_profile_status_input_saving_failed", $rootel);

        // Add the focus event to the profile status status
        $entity_profile_status_input.bind("focus", function(){

            // If we don't have the dummy status (e.g. What are you doing) variable set yet, set it now.
            if (!profile_dummy_status) {
                profile_dummy_status = $entity_profile_status_input_dummy.text();
            }

            // Check whether the status field has the dummy class
            if ($entity_profile_status_input.hasClass(entity_profile_status_input_dummy)) {

                // Clear the current value for the input box and remove the dummy class
                $entity_profile_status_input.val("");
                $entity_profile_status_input.removeClass(entity_profile_status_input_dummy);
            }

        });

        // Add the blur event to the profile status
        $entity_profile_status_input.bind("blur", function(){

            // Check if it still has a dummy
            if (!$entity_profile_status_input.hasClass(entity_profile_status_input_dummy) && $.trim($entity_profile_status_input.val()) === "") {

                // Add the dummy class
                $entity_profile_status_input.addClass(entity_profile_status_input_dummy);

                // Set the input value to the dummy status (e.g. What are you doing)
                $entity_profile_status_input.val(profile_dummy_status);

            }
        });

        // Add the submit event to the status form
        $entity_profile_status.bind("submit", function(){

            var originalText = $("button span", $entity_profile_status).text();
            $("button span", $entity_profile_status).text($entity_profile_status_input_saving.text());

            // Get the correct input value from the user
            var inputValue = $entity_profile_status_input.hasClass(entity_profile_status_input_dummy) ? "" : $.trim($entity_profile_status_input.val());

            $.ajax({
                url: sakai.data.me.profile["jcr:path"],
                data: {
                    "_charset_": "utf-8",
                    "basic": $.toJSON(

                        // Merge two objects together
                        $.extend($.parseJSON(sakai.data.me.profile.basic),{
                            "status": inputValue
                        })

                    )
                },
                type: "POST",
                success: function(){

                    // Set the button back to it's original text
                    $("button span", $entity_profile_status).text(originalText);

                    // Create an activity item for the status update
                    var nodeUrl = sakai.data.me.profile["jcr:path"];
                    var activityMsg = "Status: " + inputValue;

                    var activityData = {
                        "sakai:activityMessage": activityMsg
                    };
                    sakai.api.Activity.createActivity(nodeUrl, "status", "default", activityData);

                },
                error: function(){

                    // Log an error message
                    fluid.log("Entity widget - the saving of the profile status failed");

                    // Show the message about a saving that failed to the user
                    $("button span", $entity_profile_status).text($entity_profile_status_input_saving_failed.text());

                    // Show the origin text after 5 min
                    window.setTimeout(function(){
                        $("button span", $entity_profile_status).text(originalText);
                    }, 5000);

                }
            });

        });

    };

    /**
     * Add binding to elements related to chat status
     */
    var addBindingChatStatus = function(){

        // Reinitialise the jQuery selector
        $entity_profile_chatstatus = $("#entity_profile_chatstatus", $rootel);

        // Add the change event to the chatstatus dropdown
        $entity_profile_chatstatus.bind("change", function(ev){
            changeChatStatus($(ev.target).val());
        });

    };

    /**
     * Add binding to the downlaod button
     */
    var addBindingDownload = function(){

        // Reinitialise the jQuery selector
        $entity_action_download = $($entity_action_download.selector);

        // Open the content in a new window
        $entity_action_download.bind("click", function(){
            window.open(entityconfig.data.profile.path);
        });

    };

    /**
     * Add binding to the delete button
     */
    var addBindingDelete = function(){

        // Reinitialise the jQuery selector
        $entity_action_delete = $($entity_action_delete.selector);

        // Open the delete content pop-up
        $entity_action_delete.bind("click", function(){
            sakai.deletecontent.init(entityconfig.data.profile);
        });
    };

    /**
     * Add binding to the upload buttons
     */
    var addBindingUpload = function(){

        // Reinitialise the jQuery selector
        $entity_action_upload = $($entity_action_upload.selector);

        // Initialise the uploadcontent widget
        $entity_action_upload.bind("click", function(){
            sakai.uploadcontent.init(entityconfig.data.profile);
        });

    };

    /**
     * Add binding to various elements on the entity widget
     */
    var addBinding = function(){

        if(entityconfig.mode === "profile" || entityconfig.mode === "myprofile"){

            // Add binding to the profile status elements
            addBindingProfileStatus();

            // Add binding related to chat status
            addBindingChatStatus();

        }
        else if(entityconfig.mode === "content"){

            // Add binding to the download button
            addBindingDownload();

            // Add binding to the delete button
            addBindingDelete();

            // Add binding to the upload button
            addBindingUpload();

        }

    };

    /**
     * Set the profile data for the user such as the status and profile picture
     */
    var setProfileData = function(){

        // Set the profile picture for the user you are looking at
        // /_user/a/ad/admin/public/profile/256x256_profilepicture
        entityconfig.data.profile.picture = constructProfilePicture(entityconfig.data.profile);

        // Set the status for the user you want the information from
        if (entityconfig.data.profile.basic) {
            entityconfig.data.profile.status = $.parseJSON(entityconfig.data.profile.basic).status;
        }

        if (!entityconfig.data.profile.chatstatus) {
            entityconfig.data.profile.chatstatus = "online";
        }

    };

    /**
     * Set the data for the content object information
     * @param {Object} data The data we need to parse
     */
    var setContentData = function(data){

        if(!data){
            fluid.log("Entity widget - setContentData - the data parameter is invalid:'" + data + "'");
            return;
        }

        var filedata = data.data;
        var jcr_content = filedata["jcr:content"];

        entityconfig.data.profile = {};

        // Check whether there is a jcr:content variable
        if (jcr_content) {

            // Set the person that last modified the resource
            if (jcr_content["jcr:lastModifiedBy"]) {
                entityconfig.data.profile.lastmodifiedby = jcr_content["jcr:lastModifiedBy"];
            }
            // Set the last modified date
            if (jcr_content["jcr:lastModified"]) {
                entityconfig.data.profile.lastmodified = $.timeago(new Date(jcr_content["jcr:lastModified"]));
            }
            // Set the size of the file
            if (jcr_content[":jcr:data"]) {
                entityconfig.data.profile.filesize = convertToHumanReadableFileSize(jcr_content[":jcr:data"]);
            }
            // Set the mimetype of the file
            if (jcr_content["jcr:mimeType"]) {
                entityconfig.data.profile.mimetype = jcr_content["jcr:mimeType"];
            }

        }

        // Set the created by and created (date) variables
        if (filedata["jcr:createdBy"]) {
            entityconfig.data.profile.createdby = filedata["jcr:createdBy"];
        }
        if (filedata["jcr:created"]) {
            entityconfig.data.profile.created = $.timeago(new Date(filedata["jcr:created"]));
        }

        // Set the filename of the file
        if(filedata["sakai:name"]){
            entityconfig.data.profile.name = filedata["sakai:name"];
        }
        // e.g. http://localhost:8080/_user/a/ad/admin/private/3739036439_2418af9b4d_o.jpg
        // to 3739036439_2418af9b4d_o.jpg
        else if(data.url){
            var splitslash = data.url.split("/");
            entityconfig.data.profile.name = splitslash[splitslash.length -1];
        }

        // Set the path of the resource
        if(data.url){
            entityconfig.data.profile.path = data.url;
        }

    };

    /**
     * Get the number of unread messages for the current user
     * @param {Object} callback
     */
    var getUnreadMessagesCount = function(callback){
        $.ajax({
            url: sakai.config.URL.MESSAGE_BOX_SERVICE,
            data: {
                box: sakai.config.Messages.Types.inbox
            },
            success: function(data){

                // Reset the count
                entityconfig.data.count.messages_unread = 0;

                // Run over all the messages of the current user and
                // check whether they are read
                for (var i = 0; i < data.results.length; i++) {
                    if (data.results[i]["sakai:read"] === false) {
                        entityconfig.data.count.messages_unread++;
                    }
                }
            },
            complete: function(){
                if (typeof callback === "function") {
                    callback();
                }
            }
        });
    };

    /**
     * Get the data for a specific mode
     * @param {String} mode The mode you want to get the data for
     * @param {Object} [data] The data you received from the page that called this (can be undefined)
     * @param {Function} [callback] A callback function that will be fired it is supplied
     */
    var getData = function(mode, data, callback){


        switch (mode) {
            case "profile":

                entityconfig.data.profile = $.extend(true, {}, data);

                // Set the correct profile data
                setProfileData();

                // Execute the callback (if there is one)
                if (typeof callback === "function") {
                    callback();
                }

                break;

            case "myprofile":

                getUnreadMessagesCount(function(){

                    // Set the profile for the entity widget to the personal profile information
                    // We need to clone the sakai.data.me.profile object so we don't interfere with it
                    entityconfig.data.profile = $.extend(true, {}, sakai.data.me.profile);

                    // Set the correct profile data
                    setProfileData();

                    // Execute the callback (if there is one)
                    if (typeof callback === "function") {
                        callback();
                    }

                });
                break;

            case "content":

                setContentData(data);

                // Execute the callback (if there is one)
                if (typeof callback === "function") {
                    callback();
                }
                break;

            default:

                fluid.log("Entity widget - getData - invalid mode");
                // Execute the callback (if there is one)
                if (typeof callback === "function") {
                    callback();
                }

        }

    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * Init function for the entity widget
     * @param {String} mode The mode in which you load the entity widget
     * @param {Object} data A JSON object containing the necessary data - the structure depends on the mode
     */

    sakai.api.UI.entity.render = function(mode, data){

        // Clear the previous containers
        $entity_container.empty().hide();
        $entity_container_actions.empty();

        // Change the mode for the entity widget
        changeMode(mode);

        // Get the data for the appropriate mode
        getData(entityconfig.mode, data, function(){

            if(entityconfig.mode ==="content" && !data){
                return;
            }

            // Render the main template
            renderTemplate();

            // Add binding
            addBinding();

        });

    };

    // Sometimes the trigger event is fired before it is actually bound
    // so we keep trying to execute the ready event
    var triggerReady = function(){
        if ($(window).data("events") && $(window).data("events").sakai) {

            // Send out an event that says the widget is ready.
            // This event can be picked up in a page JS code
            $(window).trigger("sakai.api.UI.entity.ready");
        }
        else {
            setTimeout(triggerReady, 100);
        }
    };
    triggerReady();

};
sakai.api.Widgets.widgetLoader.informOnLoad("entity");