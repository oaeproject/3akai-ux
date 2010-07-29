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
/*global $, sdata, Config */

var sakai = sakai || {};

/**
 * @name sakai.sitemembers
 *
 * @class sitemembers
 *
 * @description
 * Initialize the sitemembers widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.sitemembers = function(tuid, showSettings){


    ///////////////
    // VARIABLES //
    ///////////////

    // This array will hold all the objects with the userinfo that are a member of this site.
    var allMembers = [];
    // this array will hold all the objects that are currently being displayed.
    var displayMembers = [];
    // This array will hold all the contacts that are part of this website
    var myContactsOnSite = [];
    // This determines if we are in 'all' mode or in 'contacts' mode.
    var viewMode = "all";
    // This site's id
    var siteid = sakai.site.currentsite.id;
    // The total amount of memebrs
    var totalMembers = 1;

    var widgetSettings = {};
    var rootel = $("#" + tuid); // Get the main div used by the widget
    var me = sakai.data.me;
    var contacts = [];
    var startPos = 0;
    var nrOfItems = 4; // The amount of members we should fetch in each request.
    var sortOn = "lastName"; // Sort the user on their lastname. Options are (lastName, firstName, id)
    var sortOrder = "asc"; // asc(Ascending) or desc(Descending)
    var gotAllMembers = false;

    /////////////
    // CSS IDS //
    /////////////

    var sitemembers = "sitemembers";
    var sitemembersID = "#" + sitemembers;
    var sitemembersClass = "." + sitemembers;

    // Settings
    var sitemembers_settings = sitemembersID + "_settings";
    var sitemembers_settings_save = sitemembers_settings + "_save";
    var sitemembers_settings_cancel = sitemembers_settings + "_cancel";
    var sitemembers_settings_data = sitemembers_settings + "_data";
    var sitemembers_settings_dataClass = sitemembersClass + "_settings_data";
    var sitemembers_settings_data_container = sitemembers_settings_data + "_container";
    var sitemembers_settings_display = sitemembers_settings + "_display";
    var sitemembers_settings_display_wide = sitemembers_settings_display + "_wide";
    var sitemembers_settings_display_compact = sitemembers_settings_display + "_compact";
    // Obsolete, backend only allows sorting on firstname and lastname.
    //var sitemembers_settings_sort = sitemembers_settings + "_sort";
    //var sitemembers_settings_sort_name = sitemembers_settings_sort + "_name";
    //var sitemembers_settings_sort_position = sitemembers_settings_sort + "_position";

    // Normal
    var sitemembers_wide = sitemembers + "_wide";
    var sitemembers_normal = sitemembersID + "_normal";
    var sitemembers_normalClass = sitemembersClass + "_normal";
    var sitemembers_normal_count = sitemembers_normalClass + "_count";
    var sitemembers_normal_nrFetched = sitemembers_normalClass + "_nrFetched";
    var sitemembers_normal_result = sitemembers_normalClass + "_result";
    var sitemembers_normal_result_message = sitemembers_normal_result + "_message";
    var sitemembers_normal_result_addtocontacts = sitemembers_normal_result + "_addtocontacts";
    var sitemembers_normal_container = sitemembers_normal + "_container";
    var sitemembers_normal_results_template = sitemembers_normal + "_results_template";

    var sitemembers_normal_data = sitemembers_normal + "_data";
    var sitemembers_normal_data_degrees = sitemembers_normal_data + "_degrees";
    var sitemembers_normal_data_talks = sitemembers_normal_data + "_talks";
    var sitemembers_normal_data_publications = sitemembers_normal_data + "_publications";
    var sitemembers_normal_data_profexperience = sitemembers_normal_data + "_profexperience";
    var sitemembers_normal_data_aboutme = sitemembers_normal_data + "_aboutme";
    var sitemembers_normal_data_hobbies = sitemembers_normal_data + "_hobbies";
    var sitemembers_normal_data_personalinterests = sitemembers_normal_data + "_personalinterests";
    var sitemembers_normal_data_academicinterests = sitemembers_normal_data + "_academicinterests";

    var sitemembers_normal_more = sitemembers_normalClass + "_more";
    var sitemembers_normal_loader = sitemembers_normalClass + "_loader";

    var sitemembers_normal_footer = sitemembers_normal + "_footer";
    var sitemembers_normal_footer_text = sitemembers_normal_footer + "_text";
    var sitemembers_normal_footer_filter = sitemembers_normal_footer + "_filter";
    var sitemembers_normal_footer_onlycontacts = sitemembers_normal_footer + "_onlycontacts";
    var sitemembers_normal_footer_all = sitemembers_normal_footer + "_all";

    // Full names for data that can be displayed
    var displaydata = {};
    displaydata.aboutme = "About me";
    displaydata.degrees = "Degrees";
    displaydata.academicinterests = "Academic interests";
    displaydata.talks = "Talks";
    displaydata.personalinterests = "Personal interests";
    displaydata.publications = "Publications";
    displaydata.hobbies = "Hobbies";
    displaydata.profexperience = "Professional experience";

    /////////////////
    // RENDERERS //
    /////////////////

    /**
     * Get the HTML for degrees for a user.
     * @param {Object} user
     */
    var displayDegrees = function(user){
        var json = {
            'degrees': []
        };
        if (user.education) {
            json = {
                'degrees': user.education
            };
        }
        return $.TemplateRenderer(sitemembers_normal_data_degrees.replace("#", ''), json);
    };

    /**
     * Get the HTML for the Talks rendering.
     * @param {Object} user
     */
    var displayTalks = function(user){
        var json = {
            'talks': []
        };
        if (user.talks) {
            json = {
                'talks': user.talks
            };
        }
        return $.TemplateRenderer(sitemembers_normal_data_talks.replace("#", ''), json);
    };


    /**
     * Get the HTML for the Publications rendering.
     * @param {Object} user
     */
    var displayPublications = function(user){
        var json = {
            'publications': []
        };
        if (user.academic) {
            json = {
                'publications': user.academic
            };
        }
        return $.TemplateRenderer(sitemembers_normal_data_publications.replace("#", ''), json);
    };

    /**
     * Get the HTML for the Professional experience rendering.
     * @param {Object} user
     */
    var displayProfExperience = function(user){
        var json = {
            'jobs': []
        };
        if (user.academic) {
            json = {
                'jobs': user.job
            };
        }
        return $.TemplateRenderer(sitemembers_normal_data_profexperience.replace("#", ''), json);
    };

    /**
     * Get the HTML for a default template like aboutme, hobbies, ...
     * @param {Object} key The key (like hobbies)
     * @param {Object} value The value
     * @param {Object} template The template to use.
     */
    var displayAboutMe = function(user, what, template){
        var json = {};
        json.hobbies = null;
        json.aboutme = null;
        json.personalinterests = null;
        json.academicinterests = null;
        if (user.aboutme) {
            if (what === "hobbies" && user.aboutme.hobbies) {
                json.hobbies = user.aboutme.hobbies;
            }
            else
                if (what === "aboutme" && user.aboutme.aboutme) {
                    json.aboutme = user.aboutme.aboutme;
                }
                else
                    if (what === "personalinterests" && user.aboutme.personalinterests) {
                        json.personalinterests = user.aboutme.personalinterests[0];
                    }
                    else
                        if (what === "academicinterests" && user.aboutme.academicinterests) {
                            json.academicinterests = user.aboutme.personalinterests[0];
                        }
        }

        return $.TemplateRenderer(template.replace("#", ''), json);
    };

    ////////////////////
    // FILTER MEMBERS //
    ////////////////////

    /**
     * Filters the members.
     */
    var filterMembers = function(){
        var filterOn = $(sitemembers_normal_footer_text).val().toUpperCase();
        var membersToDisplay = [];
        var membersToUse = [];
        if (viewMode === 'all') {
            membersToUse = allMembers;
        }
        else {
            membersToUse = myContactsOnSite;
        }

        if (filterOn === "") {
            membersToDisplay = membersToUse;
        }
        else {
            for (var i = 0, j = membersToUse.length; i < j; i++) {
                if (membersToUse[i].fullname.toUpperCase().indexOf(filterOn) > -1) {
                    membersToDisplay.push(membersToUse[i]);
                }
            }
        }
        // Clear the list
        clearList();
        // Add found results.
        renderAndAppendSiteMembers(membersToDisplay);
    };

    /**
     * Will filter the site members by only showing the ones that are in our contact list.
     */
    var showContactsOnly = function(){
        var membersToDisplay = [];
        for (var m = 0, totalMembers = allMembers.length; m < totalMembers; m++) {
            for (var i = 0, j = contacts.length; i < j; i++) {
                if (contacts[i].target === allMembers[m].userid) {
                    membersToDisplay.push(allMembers[m]);
                }
            }
        }
        // Clear the list
        clearList();
        // Add found results.
        renderAndAppendSiteMembers(membersToDisplay);
    };


    ///////////////////
    // AID FUNCTIONS //
    ///////////////////

    var getTotalAmountOfMembers = function(){
        $.ajax({
            url: sakai.config.URL.SEARCH_SITES + "?q=" + siteid,
            success: function(data){
                var json = data;
                if (json.results.length === 1) {
                    totalMembers = json.results[0]["member-count"];
                    $(sitemembers_normal_count, rootel).text(sakai.api.Security.saneHTML(totalMembers));
                }
            }
        });
    };

    /**
     * Set the status of the loader
     * @param {Boolean} show Wether to show the loader or not.
     */
    var loader = function(show){
        if (show) {
            $(sitemembers_normal_loader, rootel).show();
        }
        else {
            $(sitemembers_normal_loader, rootel).hide();
        }
    };

    /**
     * Checks if the provided user is a contact of us.
     * @param {Object} user
     */
    var checkIfContact = function(user){
        for (var i = 0, j = contacts.length; i < j; i++) {
            if (user.userid === contacts[i].target) {
                return true;
            }
        }
        return false;
    };

    /**
     * Clears the list
     */
    var clearList = function(){
        // Module var
        displayMembers = [];
        // HTML
        $(sitemembers_normal_container, rootel).html("");
    };

    /**
     * Renders the members into HTML.
     * @param {Object} members
     */
    var renderAndAppendSiteMembers = function(members){
        var json = {
            'members': members
        };
        // Add it too the global var.
        displayMembers = displayMembers.concat(members);
        // Render template.
        $(sitemembers_normal_container, rootel).append($.TemplateRenderer(sitemembers_normal_results_template.replace(/#/, ''), json));
        // Add rounded corners to results (Not fully working)
        // $(sitemembers_normal_result, rootel).corners();
    };

    /**
     * prepares the member objects..
     */
    var prepareSiteMembers = function(members){

        // Make sure we have properly formed data.
        for (var i = 0, j = members.length; i < j; i++) {
            var user = members[i];
            // profile information
            if (typeof user.firstName === "object") {
                user.firstName = user.firstName[0];
            }
            if (typeof user.lastName === "object") {
                user.lastName = user.lastName[0];
            }
            if (typeof user.email === "object") {
                user.email = user.email[0];
            }
            if (typeof user.picture === "object") {
                user.picture = user.picture[0];
            } else if (user.picture && $.parseJSON(user.picture).name) {
                user.picture = "/~" + user["rep:userId"] + "/public/profile/" + $.parseJSON(user.picture).name;
            }
            if (typeof user["rep:userId"] === "object") {
                user.userid = user["rep:userId"][0];
            }

            // Check if we are this user.
            user.isMe = false;
            if (user["rep:userId"] === me.user.userid) {
                user.isMe = true;
            }
            // Check to see if this user is a contact of us.
            user.isContact = checkIfContact(user);

            // The fullname for this user. (User for filtering)
            user.fullname = user.firstName + " " + user.lastName;

            user.basic = user.basic ? $.parseJSON(user.basic) : "";
            user.aboutme = user.aboutme ? $.parseJSON(user.aboutme) : "";
            user.education = user.education ? $.parseJSON(user.education) : "";
            user.talks = user.talks ? $.parseJSON(user.talks) : "";
            user.academic = user.academic ? $.parseJSON(user.academic) : "";
            user.job = user.job ? $.parseJSON(user.job) : "";


            // the information the admin wants displayed.
            user.displayedData = [];
            for (var di = 0, dj = widgetSettings.data.length; di < dj; di++) {
                var toShow = widgetSettings.data[di];
                var o = {};
                o.key = displaydata[toShow];

                if (toShow === "aboutme") {
                    o.value = displayAboutMe(user, "aboutme", sitemembers_normal_data_aboutme);
                }
                else
                    if (toShow === "hobbies") {
                        o.value = displayAboutMe(user, "hobbies", sitemembers_normal_data_hobbies);
                    }
                    else
                        if (toShow === "academicinterests") {
                            o.value = displayAboutMe(user, "academicinterests", sitemembers_normal_data_academicinterests);
                        }
                        else
                            if (toShow === "personalinterests") {
                                o.value = displayAboutMe(user, "personalinterests", sitemembers_normal_data_personalinterests);
                            }
                            else
                                if (toShow === "degrees") {
                                    o.value = displayDegrees(user);
                                }
                                else
                                    if (toShow === "talks") {
                                        o.value = displayTalks(user);
                                    }
                                    else
                                        if (toShow === "publications") {
                                            o.value = displayPublications(user);
                                        }
                                        else
                                            if (toShow === "profexperience") {
                                                o.value = displayProfExperience(user);
                                            }

                user.displayedData.push(o);
            }

            if (user.isContact) {
                myContactsOnSite.push(user);
            }

            members[i] = user;
        }

        return members;
    };

    /**
     * Display the more links, or the reached end.
     * @param {Boolean} more true = show more links, false = show reached end links
     */
    var displayMore = function(more){
        if (more) {
            $(sitemembers_normal_more, rootel).show();
        }
        else {
            $(sitemembers_normal_more, rootel).hide();
        }
    };

    /**
     * Does a request to the site.members.json servlet and retrieves all the members for this site.
     */
    var getSiteMembers = function(){
        // Show a prelaoder.
        loader(true);
        // Get a list of all the members.
        var url = sakai.config.URL.SITE_GET_MEMBERS_SERVICE.replace("__SITE__", siteid) + "?items=" + nrOfItems + "&sort=" + sortOn + "," + sortOrder + "&start=" + startPos;
        $.ajax({
            url: url,
            success: function(data){
                var json = data.results;

                // If we get an emty list, then we assume we have received all the members.
                if (json.length === 0) {
                    gotAllMembers = true;
                    displayMore(false);
                }
                else {
                    displayMore(true);
                    // Set the start param for next get.
                    startPos += json.length;
                    $(sitemembers_normal_nrFetched, rootel).text(startPos);

                    if (totalMembers <= startPos) {
                        displayMore(false);
                    }

                    // Make sure the formatting is correct.
                    var members = prepareSiteMembers(json);
                    // Add the new members to the list.
                    allMembers = allMembers.concat(members);
                    // Render it to the page.
                    renderAndAppendSiteMembers(members);
                }
                loader(false);
            },
            error: function(xhr, textStatus, thrownError) {
                if (xhr.status === 500) {
                    gotAllMembers = true;
                    displayMore(false);
                    loader(false);
                }
            }
        });
    };


    /**
     * Fetches the contacts for this user.
     */
    var getContacts = function(){
        $.ajax({
            url: sakai.config.URL.FRIEND_ACCEPTED_SERVICE,
            success: function(data){
                if (data.results) {
                    contacts = data.results;
                    getSiteMembers();
                }
            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error occured");
            }
        });
    };

    /**
     * Shows the normal viwe
     */
    var doPageView = function(){
        // Not fully working: $(sitemembers_normal_result, rootel).corners();
        getContacts();
        if (widgetSettings.display === "wide") {
            $(sitemembers_normal, rootel).attr('class', sitemembers_wide);
        }
    };

    ///////////////////
    // SETTINGS VIEW //
    ///////////////////

    /**
     * Displays the settings object.
     */
    var displaySettings = function(){
        // Is this a compact or wide widget.
        if (widgetSettings.display === "wide") {
            $(sitemembers_settings_display_wide).attr("checked", true);
        }
        else {
            $(sitemembers_settings_display_compact).attr("checked", true);
        }

        // Remove all checks
        $(sitemembers_settings_dataClass + " input", rootel).attr('checked', false);
        // Place correct checks
        for (var i = 0; i < widgetSettings.data.length; i++) {
            $(sitemembers_settings_dataClass + " input[value=" + widgetSettings.data[i] + "]").attr('checked', true);
        }

    };

    /**
     * Retrieves the settings object from JCR.
     */
    var getSiteMembersSettingsFromJCR = function(){
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){
            if (success) {
                widgetSettings = data;
                widgetSettings.data = $.parseJSON(widgetSettings.data);
                if (showSettings) {
                    displaySettings(widgetSettings);
                }
                else {
                    getTotalAmountOfMembers();
                    doPageView();
                }
            }
            else {
                widgetSettings.data = [];
                widgetSettings.display = "compact";
                widgetSettings.sort = "lastname";
                getTotalAmountOfMembers();
                doPageView();
            }
        });
    };

    /**
     * Builds the comments settings object.
     * @return Will return the object that holds all the setting values for the sitemembers widget.
     */
    var createSiteMembersSettings = function(){
        var settings = {};
        settings.sort = "lastname";
        settings.display = "compact";
        settings.data = [];

        // Get the checked values.
        $(sitemembers_settings_dataClass + " input:checked").each(function(){
            settings.data.push($(this).val());
        });
        // Get the display mode.
        if ($(sitemembers_settings_display_wide + ":checked", rootel).length === 1) {
            settings.display = "wide";
        }

        return settings;
    };

    /**
     * When the settings are saved to JCR, this function will be called.
     * It will notify the container that it can be closed.
     */
    var closeSettings = function(){
        // If this is in a dashboard then we just show the main view.
        // We check this by seeing if the dashboard element (or its parents) are visible or not
        if ($(".sakai_dashboard_page").is(":visible") && $('.sakai_dashboard_page').parents(':hidden').length === 0) {
            $(sitemembers_settings, rootel).hide();
            $(sitemembers_normal, rootel).show();
            showSettings = false;
            init();
        }
        else {
            sakai.api.Widgets.Container.informFinish(tuid, "sitemembers");
        }
    };

    /**
     * Start the process to save all the settings for the site members widget to JCR.
     */
    var saveSettings = function(){
        // gets the JSON-settings-object and converts it to a string
        var settings = createSiteMembersSettings();

        var toSend = {
            "sort": settings.sort,
            "display": settings.display,
            "data": $.toJSON(settings.data),
            "_charset_": "utf-8"
        };

        sakai.api.Widgets.saveWidgetData(tuid, toSend, function(success, data){

            if (success) {
                closeSettings();
            }
            else {
                alert("Failed to save settings");
            }

        });

    };

    ////////////////////
    // EVENT HANDLERS //
    ////////////////////
    /**
     * Save the settings.
     */
    $(sitemembers_settings_save, rootel).click(function(){
        // The settings for this widget should be saved.
        saveSettings();
    });

    /**
     * Cancel the settings.
     */
    $(sitemembers_settings_cancel, rootel).click(function(){
        closeSettings();
    });

    /**
     * Event for sending a message.
     * @param {Object} e
     * @param {Object} ui
     */
    $(sitemembers_normal_result_message, rootel).live("click", function(e, ui){
        var id = e.target.id.split('_');
        id = id[id.length - 1];
        var firstName = "First";
        var lastName = "Last";
        for (var i = 0, j = allMembers.length; i < j; i++) {
            if (allMembers[i].userid === id) {
                firstName = allMembers[i].firstName;
                lastName = allMembers[i].lastName;
            }
        }

        var o = {
            "uuid": id,
            'firstName': firstName,
            'lastName': lastName
        };
        sakai.sendmessage.initialise(o);
    });

    /**
     * Event for adding a contact.
     * @param {Object} e
     * @param {Object} ui
     */
    $(sitemembers_normal_result_addtocontacts, rootel).live("click", function(e, ui){
        var id = e.target.id.split('_');
        id = id[id.length - 1];
        sakai.addtocontacts.initialise(id, function(){
            renderAndAppendSiteMembers(allMembers);
        });
    });

    /**
     * Gets more site members.
     */
    $(sitemembers_normal_more, rootel).click(function(){
        getSiteMembers();
    });

    /**
     * The user wants to filter users.
     */
    $(sitemembers_normal_footer_filter, rootel).live("click", function(){
        filterMembers();
    });
    $(sitemembers_normal_footer_text, rootel).live("keyup", function(ev){
        if (ev.keyCode === 13) {
            filterMembers();
        }
    });

    /**
     * Only display the site members who are our contacts.
     */
    $(sitemembers_normal_footer_onlycontacts, rootel).live("click", function(){
        viewMode = 'contacts';
        // hide the more link
        $(sitemembers_normal_more, rootel).hide();
        // Only show our contacts.
        showContactsOnly();
        $(this).hide();
        $(sitemembers_normal_footer_all, rootel).show();
    });

    /**
     * Show our entire list.
     */
    $(sitemembers_normal_footer_all, rootel).live("click", function(){
        viewMode = 'all';
        if (!gotAllMembers) {
            $(sitemembers_normal_more, rootel).show();
        }
        // Clear the list
        clearList();
        // Add found results.
        renderAndAppendSiteMembers(allMembers);
        $(this).hide();
        $(sitemembers_normal_footer_onlycontacts, rootel).show();
    });

    ////////////////////
    // INITIALISATION //
    ////////////////////


    var init = function(){
        if (showSettings) {
            // Show the settings view.
            $(sitemembers_normal, rootel).hide();
            $(sitemembers_settings, rootel).show();
        }
        else {
            // Inserts the sendmessage-widget
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
        }
        // Get the settings, when the settings are received we either fill in the settings view or get all the members for the normal view.
        getSiteMembersSettingsFromJCR();
    };

    init();

};

sakai.api.Widgets.widgetLoader.informOnLoad("sitemembers");
