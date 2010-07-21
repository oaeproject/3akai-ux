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
/*global $, Config, sdata, Querystring */

var sakai = sakai || {};
sakai.site_basic_settings = function(){

    //////////////////////
    // Config variables //
    //////////////////////

    var siteid = ""; //The siteid for the site we are editing.
    var siteinfo = {}; // The json object with all the info for this site.
    var editloc = false;

    /////////////
    // CSS IDs //
    /////////////

    var siteSettings = "#siteSettings";
    var siteSettingsClass = ".siteSettings";
    var siteSettingsName = "siteSettings";
    var siteSettingsAppendSiteIDtoURL = siteSettingsClass + "_appendSiteIDtoURL";

    var siteSettingsTitleClass = siteSettingsClass + "_title";
    var siteSettingsConfirm = siteSettings + "_confirm";
    var siteSettingsResponse = siteSettings + "_response";
    var siteSettingsSave = siteSettings + "_save";
    var siteSettingsCancel = siteSettings + "_cancel";

    //    Site info
    var siteSettingsInfo = siteSettings + "_info";
    var siteSettingsInfoTitle = siteSettingsInfo + "_title";
    var siteSettingsInfoDescription = siteSettingsInfo + "_description";
    var siteSettingsInfoSakaiDomain = siteSettingsInfo + "_sakaiDomain";
    var siteSettingsInfoSitePart = siteSettingsInfo + "_sitePart";
    var siteSettingsInfoSitePartText = siteSettingsInfoSitePart + "_text";
    var siteSettingsInfoSitePartTextLocation = siteSettingsInfoSitePartText + "_location";
    var siteSettingsInfoSitePartTextEdit = siteSettingsInfoSitePartText + "_edit";
    var siteSettingsInfoSitePartEdit = siteSettingsInfoSitePart + "_edit";
    var siteSettingsInfoSitePartEditInput = siteSettingsInfoSitePartEdit + "_input";
    var siteSettingsInfoSitePartEditInputTooltip = siteSettingsInfoSitePartEditInput + "_tooltip";
    var siteSettingsInfoSitePartEditSave = siteSettingsInfoSitePartEdit + "_save";
    var siteSettingsInfoSitePartEditCancel = siteSettingsInfoSitePartEdit + "_cancel";
    //    Status & access
    var siteSettingsStatus = siteSettings + "_status";
    var siteSettingsStatusOn = siteSettingsStatus + "_on";
    var siteSettingsStatusOff = siteSettingsStatus + "_off";
    var siteSettingsAccess = siteSettings + "_access";
    var siteSettingsAccessPublic = siteSettingsAccess + "_public";
    var siteSettingsAccessSakaiUsers = siteSettingsAccess + "_sakaiUsers";
    var siteSettingsAccessInvite = siteSettingsAccess + "_invite";
    var siteSettingsJoinable = siteSettings + "_joinable";
    var siteSettingsJoinableNo = siteSettingsJoinable + "_no";
    var siteSettingsJoinableWithAuth = siteSettingsJoinable + "_withauth";
    var siteSettingsJoinableYes = siteSettingsJoinable + "_yes";
    //    Delete
    var siteSettingsDelete = siteSettings + "_delete";
    var siteSettingsDeleteButton = siteSettingsDelete + "_button";
    var siteSettingsDeleteButtonContainer = siteSettingsDeleteButton + "_container";
    var siteSettingsDeleteContainer = siteSettingsDelete + "_container";
    var siteSettingsDeleteYes = siteSettingsDelete + "_yes";
    var siteSettingsDeleteNo = siteSettingsDelete + "_no";

    //    Errors
    var siteSettingsError = siteSettings + "_error";
    var siteSettingsErrorUnauthorized = siteSettingsError + "_unauthorized";
    var siteSettingsErrorSaveFail = siteSettingsError + "_saveFail";
    var siteSettingsErrorSaveSuccess = siteSettingsError + "_saveSuccess";

    // Language fields
    var siteSettingLanguageCmb = siteSettings + "_language";
    var siteSettingLanguageTemplate = siteSettingsName + "_languagesTemplate";



    /////////////////////////
    // Retrieval functions //
    /////////////////////////


    /**
     * Replace or remove malicious characters from the string
     * We use this function to modify the siteid
     * @param {String} input
     */
    var replaceCharacters = function(input){
        input = input.toLowerCase().replace(/ /g, "-");
        input = input.replace(/[:]|[?]|[=]|[&]/g, "_");
        return input;
    };

    /**
     * Puts the languages in a combobox
     * @param {Object} languages
     */
    var putLangsinCmb = function(languages, json){
        $(siteSettingLanguageCmb).html($.TemplateRenderer(siteSettingLanguageTemplate, languages));
        if (json.language) {
            $(siteSettingLanguageCmb + " option[value=" + json.language + "]").attr("selected", true);
        }
    };

    /**
     * Gets all the languages supported and puts them in a combobox
     */
    var getLanguages = function(json){
        $.ajax({
            url: "/dev/_configuration/languages.json",
            success: function(data){
                languages = $.extend(data, {}, true);
                putLangsinCmb(languages, json);
            },
            error: function(xhr, textStatus, thrownError) {
                alert("Failed to retrieve languages.");
            }
        });
    };

    /**
     * This will fill in all the field settings for the site.
     */
    var fillBasicSiteSettings = function(siteid){
        $.ajax({
            url: "/sites/" + siteid + ".json",
            cache: false,
            success: function(response){
                siteinfo = response;

                // Check if we are an owner for this site.
                // Otherwise we will redirect to the site page.
                if (sakai.lib.site.authz.isUserMaintainer(siteinfo)) {
                    var nameSaneHTML = sakai.api.Security.saneHTML(response.name)
                    // Fill in the info.
                    $("#sitetitle").text(nameSaneHTML);
                    $(siteSettingsInfoSakaiDomain).text(sakai.api.Security.saneHTML(document.location.protocol + "//" + document.location.host + sakai.config.URL.SITE_ROOT));
                    $(siteSettingsInfoDescription).val(response.description);
                    $(siteSettingsInfoTitle).val(response.name);
                    $(siteSettingsTitleClass).text(nameSaneHTML);
                    $(siteSettingsInfoSitePartTextLocation).text(sakai.api.Security.saneHTML(response.id));
                    getLanguages(response);

                    // Status
                    if (response.status && response.status === "offline") {
                        $(siteSettingsStatusOff).attr("checked", "checked");
                        //  Hide the other part.
                        $(siteSettingsAccess).hide();
                        $(siteSettingsJoinable).hide();
                    }
                    else {
                        $(siteSettingsStatusOn).attr("checked", "checked");
                    }

                    // Access
                    if (response.access && response.access.toLowerCase() === "sakaiusers") {
                        $(siteSettingsAccessSakaiUsers).attr("checked", "checked");
                    } else if (response.access && response.access.toLowerCase() === "invite") {
                        $(siteSettingsAccessInvite).attr("checked", "checked");
                    } else {
                        $(siteSettingsAccessPublic).attr("checked", "checked");
                    }
                        
                    // Joinability
                    if (response["sakai:joinable"] && response["sakai:joinable"].toLowerCase() === "yes") {
                        $(siteSettingsJoinableYes).attr("checked", "checked");
                    } else if (response["sakai:joinable"] && response["sakai:joinable"].toLowerCase() === "withauth") {
                        $(siteSettingsJoinableWithAuth).attr("checked", "checked");
                    } else {
                        $(siteSettingsJoinableNo).attr("checked", "checked");
                    }
                }
                else {
                    // The user is not an owner for this site. we redirect him/her to the site page.
                    //document.location = sakai.config.URL.SITE_URL_SITEID.replace(/__SITEID__/gi, siteid);
                }
            },
            error: function(xhr, textStatus, thrownError) {
                alert("Failed to get the site info.");
            }
        });
    };


    /**
     * This will fill in all the info in the various fields over the page
     */
    var fillPage = function(){
        // Start by setting the siteids in the various urls.
        var qs = new Querystring();
        siteid = qs.get("siteid", false);
        $(siteSettingsAppendSiteIDtoURL).each(function(i, el){
            $(el).attr('href', $(el).attr('href') + siteid);
        });

        // fill in the title, description, etc for this site.
        fillBasicSiteSettings(siteid);
    };

    ////////////////////////
    // Save site settings //
    ////////////////////////


    var saveSettingsDone = function(success, data, redirect_url){
        if (success) {
            $(siteSettingsResponse).text(sakai.api.Security.saneHTML($(siteSettingsErrorSaveSuccess).text()));

            // Go back to site
            document.location = sakai.config.URL.SITE_ROOT + redirect_url;

        }
        else {
            // The user has no sufficient rights.
            if (data === 401) {
                $(siteSettingsResponse).text(sakai.api.Security.saneHTML($(siteSettingsErrorUnauthorized).text()));
            }
            // Show a general error message.
            else {
                $(siteSettingsResponse).text(sakai.api.Security.saneHTML($(siteSettingsErrorSaveFail).text()));
            }
        }

        // Show the result
        $(siteSettingsConfirm).hide();
        $(siteSettingsResponse).show();

        // After x seconds we hide the response and show the buttons again.
        setTimeout(function(){
            $(siteSettingsResponse).hide();
            $(siteSettingsConfirm).show();
        }, 2500);
    };



    /**
     * This function will check if all the values have been filled in correctly.
     * It will add a class to those that aren't.
     * @return {Boolean} true = OK, false = something was filled in wrong.
     */
    var checkValues = function(){
        var descEL = $(siteSettingsInfoDescription);
        var titleEL = $(siteSettingsInfoTitle);
        var siteLocEL = $(siteSettingsInfoSitePartEditInput);
        var ok = true;
        if (titleEL.val() === '') {
            titleEL.addClass('invalid');
            ok = false;
        }
        /*
         if (descEL.val() === '') {
         descEL.addClass('invalid');
         ok = false;
         }
         */
        if (editloc && replaceCharacters(siteLocEL.val()) === '') {
            siteLocEL.addClass('invalid');
            ok = false;
        }
        return ok;
    };

    /**
     * This will do a request to the site service to update this site its basic settings.
     * If this succeeds it will do a request too the JCR PERMISSIONS function to set all the permissions
     * correctly.
     */
    var saveSettings = function(){
        // Check if everything is filled in correctly.
        if (checkValues()) {
            // we update the info.
            // values
            var descEL = $(siteSettingsInfoDescription);
            var titleEL = $(siteSettingsInfoTitle);
            var siteLocEL = $(siteSettingsInfoSitePartEditInput);

            // Get the status and access options.
            var status = ($(siteSettingsStatusOn + "[type=radio]").is(":checked")) ? "online" : "offline";
            var access = "everyone";
            if ($(siteSettingsAccessSakaiUsers + "[type=radio]").is(":checked")) {
                access = "sakaiUsers";
            }
            else
                if ($(siteSettingsAccessInvite + "[type=radio]").is(":checked")) {
                    access = "invite";
                }
            var joinable = "no";
            if ($(siteSettingsJoinableWithAuth + "[type=radio]").is(":checked")) {
                joinable = "withauth";
            } else if ($(siteSettingsJoinableYes + "[type=radio]").is(":checked")) {
                joinable = "yes";
            }

            var language = $(siteSettingLanguageCmb + " option:selected").val();
            var tosend = {
                "name": titleEL.val(),
                "description": descEL.val(),
                "status": status,
                "access": access,
                "sakai:joinable": joinable,
                "language": language,
                "_charset_":"utf-8"
            };

            // If the user edited the location we have to be sure that it is a valid one and adjust sent data accordingly
            var new_loc = "";
            if (editloc) {
                var new_site_id = replaceCharacters(siteLocEL.val());

                // Include adjusted ID in the data we send to the site node
                tosend["id"] = new_site_id;
            }

            // Do a request to the profile info so that it gets updated with the new information.
            $.ajax({
                url: siteinfo["jcr:path"],
                type: "POST",
                data: tosend,
                success: function(data){

                    // Register URL location change
                    if (editloc) {

                        $.ajax({
                            url: sakai.config.URL.SITE_CREATE_SERVICE,
                            type: "POST",
                            data: {
                                ":sitepath": "/" + new_site_id,
                                ":moveFrom": siteinfo["jcr:path"]
                            },
                            success: function(data) {
                                saveSettingsDone(true, data,"/" + new_site_id);
                            },
                            error: function(xhr, status, thrown) {
                                saveSettingsDone(false, xhr.status);
                            }
                        });

                    } else {
                        saveSettingsDone(true, data, "/" + siteinfo.id);
                    }


                },
                error: function(xhr, textStatus, thrownError) {
                    saveSettingsDone(false, xhr.status);
                }
            });
        }
    };

    ////////////
    // Delete //
    ////////////

    /**
     * Delete the site, after which a new site can be created at the same path.
     */
    var deleteThisSite = function(){
        $.ajax({
            url: "/sites/" + siteid + ".delete.html",
            type: "POST",
            success: function(data){
                alert("Your site has been successfully deleted");
                document.location = sakai.config.URL.MY_DASHBOARD_URL;
            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error has occurred: " + xhr.status + " " + xhr.statusText);
            }
        });
    };


    /////////////////////
    // Event listeners //
    /////////////////////

    // Site location

    /**
     * The user wants to edit the location for a site.
     * We will swap the text with an input box.
     */
    $(siteSettingsInfoSitePartTextEdit).bind("click", function(){
        editloc = true;
        $(siteSettingsInfoSitePartEditInput).val(siteinfo.location);
        $(siteSettingsInfoSitePartText).hide();
        $(siteSettingsInfoSitePartEdit).css("display", "inline");
    });

    /** The user cancelled the editing part of the location. */
    $(siteSettingsInfoSitePartEditCancel).bind("click", function(){
        editloc = false;
        $(siteSettingsInfoSitePartEdit).hide();
        $(siteSettingsInfoSitePartText).css("display", "inline");
    });


    /*
     * Edit location
     */
    $(siteSettingsInfoSitePartEditInput).focus(function(){
        var offset = $(siteSettingsInfoSitePartEditInput).offset();
        $(siteSettingsInfoSitePartEditInputTooltip).css("position", "absolute");
        $(siteSettingsInfoSitePartEditInputTooltip).css("left", offset.left);
        $(siteSettingsInfoSitePartEditInputTooltip).css("top", offset.top + 28);

        $(siteSettingsInfoSitePartEditInputTooltip).fadeIn("normal");
    });

    $(siteSettingsInfoSitePartEditInput).blur(function(){
        // Hide the tooltip
        $(siteSettingsInfoSitePartEditInputTooltip).hide();
        // Replace all the bad chars.
        $(siteSettingsInfoSitePartEditInput).val(replaceCharacters($(siteSettingsInfoSitePartEditInput).val()));
    });

    /*
     * The user wants the site offline, disable the other options
     */
    $(siteSettingsStatusOff).bind("click", function(){
        $(siteSettingsAccess).hide();
        $(siteSettingsJoinable).hide();
    });
    $(siteSettingsStatusOn).bind("click", function(){
        $(siteSettingsAccess).show();
        $(siteSettingsJoinable).show();
    });

    /*
     * Save all the settings
     */
    $(siteSettingsSave).bind("click", function(){
        saveSettings();
    });

    /*
     * Delete this site
     */
    $(siteSettingsDeleteButton).bind("click", function(){
        // Show the overlay.
        $(siteSettingsDeleteContainer).jqmShow();
    });
    $(siteSettingsDeleteContainer).jqm({
        modal: true,
        overlay: 20,
        toTop: true
    });
    $(siteSettingsDeleteYes).bind('click', function(){
        deleteThisSite();
    });
    $(siteSettingsDeleteNo).bind('click', function(){
        $(siteSettingsDeleteContainer).jqmHide();
    });

    fillPage();
};
sakai.api.Widgets.Container.registerForLoad("sakai.site_basic_settings");
