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

sakai.createsite = function(tuid, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    // - ID
    var createSite = "#createsite";

    // Class
    var createSiteNoncourseTemplateClass = "createsite_noncourse_template";

    // Container
    var createSiteContainer = createSite + "_container";

    // Course
    var createSiteCourse = createSite + "_course";
    var createSiteCourseContainer = createSiteCourse + "_container";
    //var createSiteCourseDetails = createSiteCourse + "_details"; TODO
    var createSiteCourseRequest = createSiteCourse + "_request";

    // Course requested
    var createSiteCourseRequested = createSiteCourse + "_requested";
    var createSiteCourseRequestedContainer = createSiteCourseRequested + "_container";

    // Coursesite
    var createSiteCoursesiteContainer = createSite + "_coursesite_container";

    // Non course
    var createSiteNoncourse = createSite + "_noncourse";
    var createSiteNoncourseCancel = createSiteNoncourse + "_cancel";
    var createSiteNoncourseContainer = createSiteNoncourse + "_container";
    var createSiteNoncourseDescription = createSiteNoncourse + "_description";
    var createSiteNoncourseId = createSiteNoncourse + "_id";
    var createSiteNoncourseName = createSiteNoncourse + "_name";
    var createSiteNoncourseProcess = createSiteNoncourse + "_process";
    var createSiteNoncourseSave = createSiteNoncourse + "_save";
    var createSiteNoncourseUrl = createSiteNoncourse + "_url";

    // Option
    var createSiteOption = createSite + "_option";
    var createSiteOptionCourse = createSiteOption + "_course";
    var createSiteOptionNoncourse = createSiteOption + "_noncourse";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    var withMembers  = false;

    /**
     * Public function that can be called from elsewhere
     * (e.g. chat and sites widget)
     * It initializes the createsite widget and shows the jqmodal (ligthbox)
     */
    sakai.createsite.initialise = function(members){
        if (members){

            // Filter out myself
            var todelete = -1;
            for (var i = 0; i < members.items.length; i++){
                if (members.items[i].userid == sakai.data.me.user.userid){
                    todelete = i;
                }
            }
            if (todelete != -1) {
                members.items.splice(todelete, 1);
            }

            // Put me in as first element
            var item = {};
            item.name = sakai.data.me.profile.firstName + " " + sakai.data.me.profile.lastName;
            item.userid = sakai.data.me.user.userid;
            item.picture = sakai.config.URL.USER_DEFAULT_ICON_URL;
            if (sakai.data.me.profile.picture && $.evalJSON(sakai.data.me.profile.picture).name){
                item.picture = "/_user/public/" + sakai.data.me.user.userid + "/" + $.evalJSON(sakai.data.me.profile.picture).name;
            }
            members.items.unshift(item);

            withMembers = members;

            $(".description_fields").hide();
            $(".member_fields").show();
            $("#members_to_add").html($.TemplateRenderer("members_to_add_template", members));

        } else {
            $(".description_fields").show();
            $(".member_fields").hide();
            withMembers = false;
        }
        $("#createsite_course_requested_container").hide();
        $("#createsite_course_container").hide();
        $("#createsite_noncourse_container").show();
        $("#createsite_coursesite_container").show();
        $(createSiteContainer).jqmShow();
    };

    /**
     * Show or hide the process div and hide/shows the buttons
     * @param {Boolean} show
     *     true: show the process div and hide the buttons
     *     false: hide the process div and show the buttons
     */
    var showProcess = function(show){
        if(show){
            $(createSiteNoncourseCancel).hide();
            $(createSiteNoncourseSave).hide();
            $(createSiteNoncourseProcess).show();
        }else{
            $(createSiteNoncourseProcess).hide();
            $(createSiteNoncourseCancel).show();
            $(createSiteNoncourseSave).show();
        }
    };

    /**
     * Show or hide the course/noncourse containers
     * @param {Boolean} show
     *     true: show the course container and hide the noncourse container
     *     false: hide the course container and show the noncourse container
     */
    var showCourse = function(show){
        if(show){
            $(createSiteNoncourseContainer).hide();
            $(createSiteCourseContainer).show();
        }else{
            $(createSiteCourseContainer).hide();
            $(createSiteNoncourseContainer).show();
        }
    };

    /**
     * Replace or remove malicious characters from the string
     * We use this function to modify the siteid
     * String to test against: test :?=&;\/?@+$<>#%'"''{}|\\^[]'
     * @param {Object} input The string where the characters need to be replaced
     */
    var replaceCharacters = function(input){
        input = input.toLowerCase().replace(/ /g,"-");
        input = input.toLowerCase().replace(/'/g,"");
        input = input.toLowerCase().replace(/"/g,"");

        var regexp = new RegExp("[^a-z0-9_-]", "gi");
        input = input.replace(regexp,"_");

        return input;
    };


    ////////////////////
    // Request a site //
    ////////////////////

    /**
     * TODO (for now it just hides/shows divs)
     */
    var requestSite = function(){
        $(createSiteCourseContainer).hide();
        $(createSiteCoursesiteContainer).hide();
        $(createSiteCourseRequestedContainer).show();
    };


    ///////////////////
    // Create a site //
    ///////////////////

    /**
     * Create the actual site.
     * Sends information to the server about the site you are making.
     */
    var doSaveSite = function(siteid, sitetitle, sitedescription, sitetemplate){
    // Create a site node based on the template.
        $.ajax({
            url: "/sites.createsite.json",
            data: {
                "_charset_":"utf-8",
                ":sitepath": "/" + siteid,
                "name" : sitetitle,
                "description" : sitedescription,
                "id" : siteid,
                "sakai:site-template" : "/templates/" + sitetemplate
            },
            type: "POST",
            success: function(data, textStatus){
                document.location = "/sites/" + siteid;
            },
            // error: error,
            error: function(xhr, textStatus, thrownError){
                alert("An error has occurred: " + xhr.status + " " + xhr.statusText);
            }
        });
    };

    var saveSite = function(){

        // Get the values from the input text and radio fields
        var sitetitle = $(createSiteNoncourseName).val() || "";
        var sitedescription = $(createSiteNoncourseDescription).val() || "";
        var siteid = replaceCharacters($(createSiteNoncourseId).val());

        // Check if there is a site id or site title defined
        if (!siteid || sitetitle === "")
        {
            alert("Please specify a id and title.");
            return;
        }

        // Add the correct params send to the create site request
        // Site type is course/project or default

        var sitetemplate = $('input[name=' + createSiteNoncourseTemplateClass + ']:checked').val();

        // Hide the buttons and show the process status
        showProcess(true);
        doSaveSite(siteid, sitetitle, sitedescription, sitetemplate);
    };

    ////////////////////
    // Event Handlers //
    ////////////////////

    /*
     * Add jqModal functionality to the container.
     * This makes use of the jqModal (jQuery Modal) plugin that provides support
     * for lightboxes
     */
    $(createSiteContainer).jqm({
        modal: true,
        overlay: 20,
        toTop: true
    });

    /*
     * Add binding to the save button (create the site when you click on it)
     */
    $(createSiteNoncourseSave).click(function(){
        saveSite();
    });

    /*
     * Add binding to the request button
     * Sends an email to the server with details about the request;
     */
    $(createSiteCourseRequest).click(function(){
        requestSite();
    });

    /*
     * When you change something in the name of the site, it first removes the bad characters
     * and then it shows the edited url in the span
     */
    $(createSiteNoncourseName).bind("change", function(ev){
        var entered = replaceCharacters($(this).val());
        $(createSiteNoncourseId).val(entered);
    });

    /*
     * Show the course window
     */
    $(createSiteOptionCourse).bind("click", function(ev){
        showCourse(true);
    });

    /*
     * Show the noncourse window
     */
    $(createSiteOptionNoncourse).bind("click", function(ev){
        showCourse(false);
    });


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    var doInit = function(){

        // Set the text of the span containing the url of the current site
        // e.g. http://celestine.caret.local:8080/site/
        $(createSiteNoncourseUrl).text(document.location.protocol + "//" + document.location.host + "/sites/");
    };

    doInit();
};

sdata.widgets.WidgetLoader.informOnLoad("createsite");