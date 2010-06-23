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
    var $membersContainer = $("#members_to_add");

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

    // template containers
    var createSitePortfolioTemplate = "#portfolio_template_container";
    var createSiteNoncourseTemplate = "#noncourse_template_container";

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
    var createSiteOptionPortfolio = createSiteOption + "_eport";

    var createSiteType = "noncourse";

    // Error fields
    var createSiteNoncourseNameEmpty = createSiteNoncourseName + "_empty";
    var createSiteNoncourseIdEmpty = createSiteNoncourseId + "_empty";
    var createSiteNoncourseIdTaken = createSiteNoncourseId + "_taken";
    var createSiteNoncourseDescriptionLong = createSiteNoncourseDescription + "_long";
    var createSiteNoncourseDescriptionLongCount = createSiteNoncourseDescriptionLong + "_count";
    var errorFields = ".create_site_error_msg";

    // CSS Classes
    var invalidFieldClass = "invalid";

    // Members
    var sitegroup = false;

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
            if (sakai.data.me.profile.picture && $.parseJSON(sakai.data.me.profile.picture).name){
                item.picture = "/_user/public/" + sakai.data.me.user.userid + "/" + $.parseJSON(sakai.data.me.profile.picture).name;
            }
            members.items.unshift(item);

            withMembers = members;

            $(".description_fields").hide();
            $(".member_fields").show();
            $membersContainer.html($.TemplateRenderer("members_to_add_template", members));

        } else {
            $(".description_fields").show();
            $(".member_fields").hide();
            withMembers = false;
        }
        $("#createsite_course_requested_container").hide();
        $("#createsite_course_container").hide();
        $("#createsite_noncourse_container").show();
        $("#createsite_coursesite_container").show();
        $(createSitePortfolioTemplate).hide();
        $(createSiteNoncourseTemplate).show();
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
     * Show the course container (and hide other containers)
     */
    var showCourse = function(){
       $(createSitePortfolioTemplate).hide();
       $(createSiteNoncourseTemplate).hide();

       $(createSiteNoncourseContainer).hide();
       $(createSiteCourseContainer).show();
    };

    /**
     * Show the non-course container (and hide other containers)
     */
    var showNoncourse = function(){
       $(createSitePortfolioTemplate).hide();
       $(createSiteNoncourseTemplate).show();

       $(createSiteNoncourseContainer).show();
       $(createSiteCourseContainer).hide();
    };

    /**
     * Show the portfolio container (and hide other containers)
     */
    var showPortfolio = function(){
       $(createSitePortfolioTemplate).show();
       $(createSiteNoncourseTemplate).hide();

       $(createSiteNoncourseContainer).show();
       $(createSiteCourseContainer).hide();
    };

    /**
     * Replace or remove malicious characters from the string
     * We use this function to modify the siteid
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
    // Create a site //
    ///////////////////

    /**
     * Add the selected users as members of the site.
     * @param {Object} sitemembers A list of users to add
     */
    var doSaveMembers = function(sitemembers){
        $.ajax({
            url: "/system/userManager/group/" + sitegroup + ".update.html",
            type: "POST",
            traditional: true,
            data: {
                ":member": sitemembers,
                "_charset_":"utf-8"
            },
            error: function(xhr, textStatus, thrownError) {
                fluid.log("Failed to add these members.");
            }
        });
    };

    /**
     * Check if the site is created correctly and exists
     * @param {String} siteid
     */
    var doCheckSite = function(siteid){
    // Check if the site exists.
        var siteExists = false;

        $.ajax({
            url: "/sites/" + siteid + ".json",
            type: "GET",
            async: false,
            success: function(data, textStatus){
                siteExists = true;
                var authorizables = data["sakai:authorizables"];
                for(auth in authorizables){
                    if(authorizables.hasOwnProperty(auth)){
                        if(authorizables[auth].match(sakai.config.Site.DefaultMember)){
                            sitegroup = authorizables[auth];
                        }
                    }
                }
            }
        });
        return siteExists;
    };

    /**
     * Create the website, get the groupIDs for that website and add all the checked users as members to the site.
     * We have to do this in three calls because it's POST/GET/POST (no batch post possible)
     * We absolutely need to get the groupIDs to be able to add the members.
     * TODO Change the service in the back-end to be able to do this process in 1 call automatically adding the members
     * @param {String} siteid the id of the site that's being created
     * @param {String} sitetitle the title of the site that's being created
     * @param {String} sitedescription the description of the site that's being created
     * @param {String} sitetemplate the template for the site
     * @param {Array} sitemembers a list of users that have to be set as members of the site
    */
    var doSaveSite = function(siteid, sitetitle, sitedescription, sitetemplate, sitemembers){
    // Create a site node based on the template.
        $.ajax({
            url: sakai.config.URL.SITE_CREATE_SERVICE,
            data: {
                "_charset_":"utf-8",
                ":sitepath": "/" + siteid,
                "name" : sitetitle,
                "description" : sitedescription,
                "id" : siteid,
                "sakai:site-template" : sakai.config.URL.SITE_TEMPLATE.replace("__TEMPLATE__",sitetemplate),
                "sakai:site-type": createSiteType
            },
            type: "POST",
            success: function(data, textStatus){
                //check if the site exists and get the group id for viewers from the site
                if (doCheckSite(siteid)) {

                    //add all the users as members to the site
                    doSaveMembers(sitemembers);

                    // Create an activity item for the site creation
                    var nodeUrl = "/sites/" + siteid;
                    var activityMsg = "Created a new site: <a href=\"/sites/"+siteid+"\">" + sitetitle + "</a>";
                    var activityData = {
                        "sakai:activityMessage": activityMsg,
                        "sakai:activitySiteName": sitetitle,
                        "sakai:activitySiteId": siteid
                    };
                    sakai.api.Activity.createActivity(nodeUrl, "site", "default", activityData, function(activitySuccess){
                        //redirect the user to the site once the activity node is set
                        document.location = "/sites/" + siteid;
                    });
                }
            },
            // error: error,
            error: function(xhr, textStatus, thrownError){
                var siteCheck = doCheckSite(siteid);
                if (siteCheck){
                    setError(createSiteNoncourseId,createSiteNoncourseIdTaken,true);
                } else {
                    fluid.log("An error has occurred: " + xhr.status + " " + xhr.statusText);
                }
                showProcess(false);
            }
        });
    };

    var saveSite = function(){
        resetErrorFields();

        // Get the values from the input text and radio fields
        var sitetitle = $(createSiteNoncourseName).val() || "";
        var sitedescription = $(createSiteNoncourseDescription).val() || "";
        var siteid = replaceCharacters($(createSiteNoncourseId).val());
        var inputError = false;
        var sitemembers = [];

        // Check if there is a site id or site title defined
        if (sitetitle === "")
        {
            setError(createSiteNoncourseName,createSiteNoncourseNameEmpty,true);
            inputError = true;
        }
        if (!siteid)
        {
            setError(createSiteNoncourseId,createSiteNoncourseIdEmpty,true);
            inputError = true;
        }
        if (sitedescription.length > 80)
        {
            $(createSiteNoncourseDescriptionLongCount).html(sitedescription.length);
            setError(createSiteNoncourseDescription,createSiteNoncourseDescriptionLong,true);
            inputError = true;
        }

        //get all the names of the selected members for the site
        $("input:checked", $membersContainer).each(function(){
            sitemembers.push($(this).val());
        });

        if (inputError)
        {
            return;
        }
        else
        {
            // Add the correct params send to the create site request
            // Site type is course/project or default

            var sitetemplate = $('input[name=' + createSiteNoncourseTemplateClass + ']:checked').val();

            // Hide the buttons and show the process status
            showProcess(true);
            doSaveSite(siteid, sitetitle, sitedescription, sitetemplate, sitemembers);
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
    $(createSiteContainer).jqm({
        modal: true,
        overlay: 20,
        toTop: true,
        onHide: myClose
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
        createSiteType = "course";
        showCourse();
    });

    /*
     * Show the noncourse window
     */
    $(createSiteOptionNoncourse).bind("click", function(ev){
        createSiteType = "noncourse";
        showNoncourse();
    });

    /*
     * Show the portfolio window
     */
    $(createSiteOptionPortfolio).bind("click", function(ev){
        createSiteType = "portfolio";
        showPortfolio();
    });


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    var doInit = function(){

        // Hide error fields at start
        $(errorFields).hide();

        // Set the text of the span containing the url of the current site
        // e.g. http://celestine.caret.local:8080/site/
        $(createSiteNoncourseUrl).text(document.location.protocol + "//" + document.location.host + "/sites/");
    };

    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("createsite");