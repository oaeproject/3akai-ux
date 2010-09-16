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

/*global $, Config */

var sakai = sakai || {};

/**
 * @name sakai.creategroup
 *
 * @class creategroup
 *
 * @description
 * Creategroup widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.creategroup = function(tuid, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var MAX_LENGTH = 30;

    // - ID
    var createGroup = "#creategroup";

    // Container
    var createGroupContainer = createGroup + "_container";

    // template containers
    var createGroupAddTemplate = "#noncourse_template_container";

    // Non course
    var createGroupAdd = createGroup + "_add";
    var createGroupAddCancel = createGroupAdd + "_cancel";
    var createGroupAddDescription = createGroupAdd + "_description";
    var createGroupAddId = createGroupAdd + "_id";
    var createGroupAddName = createGroupAdd + "_name";
    var createGroupAddProcess = createGroupAdd + "_process";
    var createGroupAddSave = createGroupAdd + "_save";
    var createGroupAddUrl = createGroupAdd + "_url";
    var createGroupAddUrlLength = createGroupAddUrl + "_length";
    var createGroupAddUrlMaxLength = createGroupAddUrl + "_max_length";

    // Error fields
    var createGroupAddNameEmpty = createGroupAddName + "_empty";
    var createGroupAddNameShort = createGroupAddName + "_short";
    var createGroupAddIdEmpty = createGroupAddId + "_empty";
    var createGroupAddIdTaken = createGroupAddId + "_taken";
    var createGroupAddIdShort = createGroupAddId + "_short";
    var errorFields = ".creategroup_error_msg";

    // CSS Classes
    var invalidFieldClass = "invalid";

    // Pages to be added to the group
    var pagestemplate = "defaultgroup";

    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Public function that can be called from elsewhere
     * (e.g. chat and sites widget)
     * It initializes the creategroup widget and shows the jqmodal (ligthbox)
     */
    sakai.creategroup.initialise = function(){
        $(".description_fields").show();
        $("#creategroup_add_container").show();
        $(createGroupAddTemplate).show();
        $(createGroupAddName).val("");
        $(createGroupAddDescription).val("");
        $(createGroupAddId).val("");
        $(createGroupContainer).jqmShow();
    };

    /**
     * Show or hide the process div and hide/shows the buttons
     * @param {Boolean} show
     *     true: show the process div and hide the buttons
     *     false: hide the process div and show the buttons
     */
    var showProcess = function(show){
        if(show){
            $(createGroupAddCancel).hide();
            $(createGroupAddSave).hide();
            $(createGroupAddProcess).show();
        } else {
            $(createGroupAddProcess).hide();
            $(createGroupAddCancel).show();
            $(createGroupAddSave).show();
        }
    };

    /**
     * Replace or remove malicious characters from the string
     * We use this function to modify the groupid
     * String to test against: test :?=&;\/?@+$<>#%'"''{}|\\^[]'
     * @param {Object} input The string where the characters need to be replaced
     */
    var replaceCharacters = function(input){

        input = $.trim(input); // Remove the spaces at the beginning and end of the id

        input = input.toLowerCase().replace(/ /g,"-");
        input = input.toLowerCase().replace(/'/g,"");
        input = input.toLowerCase().replace(/"/g,"");

        var regexp = new RegExp("[^a-z0-9_-]", "gi");
        input = input.replace(regexp,"_");

        return input;
    };


    ////////////////////
    // Error handling //
    ////////////////////

    var resetErrorFields = function(){
        $("input").removeClass(invalidFieldClass);
        $("textarea").removeClass(invalidFieldClass);
        $(errorFields).hide();
    };

    /**
     * Function that will visually mark a form field as an
     * invalid field.
     * @param String field
     *  JQuery selector of the input box we want to show as invalid
     * @param String errorField
     *  JQuery selector of the error message that needs to be shown.
     * @param boolean noReset
     *  Parameter that specifies whether we need to make all of the
     *  fiels valid again first
     */
    var setError = function(field,errorField, noReset){
        if (!noReset) {
            resetErrorFields();
        }
        $(field).addClass(invalidFieldClass);
        $(errorField).show();
    };

    var myClose = function(hash) {
        resetErrorFields();
        hash.o.remove();
        hash.w.hide();
    };


    ///////////////////
    // Create a group //
    ///////////////////

    /**
     * Check if the group is created correctly and exists
     * @param {String} groupid
     */
    var doCheckGroup = function(groupid){
        // Check if the group exists.
        var groupExists = false;

        $.ajax({
            url: "/~" + groupid + ".json",
            type: "GET",
            async: false,
            success: function(data, textStatus){
                groupExists = true;
            }
        });
        return groupExists;
    };

    /**
     * Create the group.
     * @param {String} groupid the id of the group that's being created
     * @param {String} grouptitle the title of the group that's being created
     * @param {String} groupdescription the description of the group that's being created
     * @param {String} groupidManagers the id of the managers group for the group that's being created
    */
    var doSaveGroup = function(groupid, grouptitle, groupdescription){
    // Create a group with the managers group

        $.ajax({
            url: sakai.config.URL.GROUP_CREATE_SERVICE,
            data: {
                "_charset_":"utf-8",
                ":name": groupid,
                ":sakai:manager": sakai.data.me.user.userid,
                "sakai:group-title" : grouptitle,
                "sakai:group-description" : groupdescription,
                "sakai:group-id": groupid,
                ":sakai:pages-template": "/var/templates/site/" + pagestemplate,
                "sakai:pages-visible": sakai.config.Permissions.Groups.visible.public
            },
            type: "POST",
            success: function(data, textStatus){
                // check if the group exists
                if (doCheckGroup(groupid)) {
                    // set default permissions for this group
                    sakai.api.Groups.setPermissions(groupid,
                        sakai.config.Permissions.Groups.joinable.manager_add,
                        sakai.config.Permissions.Groups.visible.public,
                        function (success, errorMessage) {
                            if(success) {
                                // show the group
                                document.location = "/dev/group_edit.html?id=" + groupid;
                            } else {
                                fluid.log("creategroup.js doSaveGroup failed to set group permissions: " + errorMessage);
                            }
                        });
                }
            },
            error: function(xhr, textStatus, thrownError){
                var groupCheck = doCheckGroup(groupid);
                if (groupCheck){
                    setError(createGroupAddId,createGroupAddIdTaken,true);
                } else {
                    fluid.log("An error has occurred: " + xhr.status + " " + xhr.statusText);
                }
                showProcess(false);
            }
        });
    };


    var saveGroup = function(){
        resetErrorFields();

        // Get the values from the input text and radio fields
        var grouptitle = $(createGroupAddName).val() || "";
        var groupdescription = $(createGroupAddDescription).val() || "";
        var groupid = replaceCharacters($(createGroupAddId).val());
        var inputError = false;

        // Check if there is a group id or group title defined
        if (grouptitle === "")
        {
            setError(createGroupAddName,createGroupAddNameEmpty,true);
            inputError = true;
        } else if (grouptitle.length < 3) {
            setError(createGroupAddName,createGroupAddNameShort,true);
            inputError = true;
        }
        if (!groupid)
        {
            setError(createGroupAddId,createGroupAddIdEmpty,true);
            inputError = true;
        } else if (groupid.length < 3) {
            setError(createGroupAddId,createGroupAddIdShort,true);
            inputError = true;
        }

        if (inputError)
        {
            return;
        }
        else
        {
            // Hide the buttons and show the process status
            showProcess(true);
            doSaveGroup(groupid, grouptitle, groupdescription);
        }
    };

    ////////////////////
    // Event Handlers //
    ////////////////////

    /*
     * Add jqModal functionality to the container.
     * This makes use of the jqModal (jQuery Modal) plugin that provides support
     * for lightboxes
     */
    $(createGroupContainer).jqm({
        modal: true,
        overlay: 20,
        toTop: true,
        onHide: myClose
    });

    /*
     * Add binding to the save button (create the group when you click on it)
     */
    $(createGroupAddSave).click(function(){
        saveGroup();
    });

    /*
     * When you change something in the name of the group, it first removes the bad characters
     * and then it shows the edited url in the span
     */
    $(createGroupAddName).bind("change", function(ev){
        var entered = replaceCharacters($(this).val());
        $(createGroupAddId).val(entered);
    });


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    var doInit = function(){

        // Hide error fields at start
        $(errorFields).hide();

        // Set the text of the span containing the url of the current group
        // e.g. http://celestine.caret.local:8080/~
        var url = document.location.protocol + "//" + document.location.host;
        url += "/~";
        // get max length value
        var maxLength = parseInt(MAX_LENGTH,10);

        // get length

        // if url is too long greater than 30 character
        // show only first 15 characters +...+ last 15 characters
        // e.g.http://sakai3-demo.uits.indiana.edu:8080/~
        // it will change to shorter form:
        // http://sakai3-...diana.edu:8080/~
        if (url.length > maxLength) {
            url = url.substr(0,15)+ "..."+ url.substr(url.length-15,url.length-1);
        }

        $(createGroupAddUrl).text(sakai.api.Security.saneHTML(url));
    };

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("creategroup");