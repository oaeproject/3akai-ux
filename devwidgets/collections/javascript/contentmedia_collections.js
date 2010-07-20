/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global $, sdata, Config, fluid, AIM, window, doPaging, get_cookie, Querystring */

var sakai = sakai || {};

sakai.collectionscontent = function(){

    ////////////////////
    // Help variables //
    ////////////////////

    var options = {};                // Contains the different search options
    var globaldata = {};            // Contains the data of the files for the current page
    var selectedFiles = {};            // Object with the files that are currently selected
    var basicUploadFilename = "";    // The filename when you use the basic upload
    var enableFolder = false;        // Enable seeing folder or not
    var imagesOnly = false;

    // Paging
    var pageCurrent = 0;            // The page you are currently on
    var pageSize = 1000;            // How many items you want to see on 1 page

    // Search URL mapping
    var searchURLmap = {
        allfiles : sakai.config.URL.SEARCH_ALL_FILES_SERVICE,
        mybookmarks : sakai.config.URL.SEARCH_MY_BOOKMARKS,
        mycontacts : sakai.config.URL.SEARCH_MY_CONTACTS,
        myfiles : sakai.config.URL.SEARCH_MY_FILES,
        mysites : sakai.config.URL.SEARCH_MY_SITES
    };


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var jqPagerClass = ".jq_pager";

    var contentmediaId = "#contentmedia";

    var contentmediaFilesContainer = contentmediaId + "_files_container";
    var contentmediaUploaderBasicSuccessful = contentmediaId + "_uploader_basic_successful";

    var resourceDetailsContainer = "#resource_details_container";

    // Class
    var contentmediaAccordionListClass = "contentmedia_accordion_list";
    var contentmediaDisabledClass = "contentmedia_disabled";
    var contentmediaHiddenClass = "contentmedia_hidden";
    var contentmediaFileClass = "contentmedia_file";
    var contentmediaFileSelectedClass = "contentmedia_file_selected";
    var contentmediaSelectedItemClass = "contentmedia_selecteditem";
    var contentmediaViewClass = "contentmedia_view";
    var contentmediaViewThumbnailClass = contentmediaViewClass + "_thumbnail";

    // Template
    var contentmediaAccordionListSiteTemplate = "contentmedia_accordion_list_site_template";
    var contentmediaFilesContainerTemplate = "contentmedia_files_container_template";
    var contentmediaListTitleTemplate = "contentmedia_list_title_template";
    var resourceDetailsContainerTemplate = "resource_details_container_template";

    // Accordion
    var contentmediaAccordion = contentmediaId + "_accordion";
    var contentmediaAccordionList = contentmediaAccordion + "_list";
    var contentmediaAccordionListSite = contentmediaAccordionList  + "_site";
    var contentmediaAccordionListSiteBookmarks = contentmediaAccordionListSite + "_bookmarks";
    var contentmediaAccordionListTag =  contentmediaAccordionList  + "_tag";

    // Actions
    var contentmediaActionsView = contentmediaId + "_actions_view";
    var contentmediaActionsViewList = contentmediaActionsView + "_list";
    var contentmediaActionsViewThumbnail = contentmediaActionsView + "_thumbnail";

    // Context
    var contentmediaContextFilter = contentmediaId + "_context_filters";
    var contentmediaContextFilterMyfiles = contentmediaContextFilter + "_myfiles";

    // Dialogs
    var contentmediaDialog = contentmediaId + "_dialog";

    // List
    var contentmediaListTitle = contentmediaId + "_list_title";

    // Search
    var contentmediaSearch = contentmediaId + "_search";
    var contentmediaSearchButton = contentmediaSearch + "_button";

    // File Ownership
    var searchMyFiles = "#search_my_files";
    var searchAllFiles = "#search_all_files";

    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Method to sort a select element with different option elements
     * @param {Object} element The select element that needs to be sorted
     */
    var sortOptions = function(element){
        var sortedVals = $.makeArray($(element + ' option')).sort(function(a,b){
            return $(a).text() > $(b).text() ? 1: -1;
        });
        $(element).empty().html(sortedVals);
    };

    /**
     * Returns a formated file size
     * @param {Int} bytes Number of bytes you want to show
     * @param {Array} suffixes Array of suffixes used to show the formated filesize
     */
    var filesizeFormat = function(bytes, suffixes){
        var b = parseInt(bytes, 10);
        var s = suffixes || ['byte', 'bytes', 'KB', 'MB', 'GB'];
        if (isNaN(b) || b === 0) { return '0 ' + s[0]; }
        if (b == 1)              { return '1 ' + s[0]; }
        if (b < 1024)            { return  b.toFixed(2) + ' ' + s[1]; }
        if (b < 1048576)         { return (b / 1024).toFixed(2) + ' ' + s[2]; }
        if (b < 1073741824)      { return (b / 1048576).toFixed(2) + ' '+ s[3]; }
        else                     { return (b / 1073741824).toFixed(2) + ' '+ s[4]; }
    };

    /**
     * Format the date for a file
     * @param {String} date_input Date that needs to be formatted
     */
    var dateFormat = function(date_input){
        var date = new Date(date_input);
        return $.L10N.transformDate(date);
    };


    /**
     *
     * @param {Object} data  JSON object with all of the files to be displayed on the
     * screen. An example of the data model can be found in /devwidgets/contentmedia/json/files.json
     */

    var doFileRenderFiltered = function(data){
       resultWrapper = {};
       resultWrapper.results = data;
       resultWrapper.total = data.length;
       // Set the globaldata variable
       globaldata = resultWrapper;

       // only display images
       if (imagesOnly) {
         filteredResults = [];
         for(var j = 0; j < globaldata.results.length; j++){
           var contentType = globaldata.results[j]["Content-Type"];
            if (contentType.split("/")[0] == "image") {
              if (contentType.split("/")[1] != 'tiff' && contentType.split("/")[1] != 'vnd.microsoft.icon') {
                filteredResults.push(globaldata.results[j]);
              }
            }
         }
         globaldata.results = filteredResults;
       }

       // Set the formatted file size and format the date

       for(var i = 0; i < globaldata.results.length; i++){
           if(globaldata.results[i]["Content-Length"]) {
               globaldata.results[i].formattedFilesize = filesizeFormat(globaldata.results[i]["Content-Length"]);
           }
           if(globaldata.results[i]["lastmodified"]) {
             globaldata.results[i].formattedDateModified = dateFormat(sakai.api.Util.parseSakaiDate(globaldata.results[i]["lastmodified"]));
           }
       }

       // Render files
       $.TemplateRenderer(contentmediaFilesContainerTemplate, resultWrapper, $(contentmediaFilesContainer));
       $.TemplateRenderer(resourceDetailsContainerTemplate, resultWrapper, $(resourceDetailsContainer));
     };

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

        // Make sure we have actual values
        options.context = _options.context || "myfiles";
        options.search = _options.search || "*";
        options.tag = _options.tag || false;
        options.site = _options.site || false;

        // Set the title of the file list
        //$(contentmediaListTitle).html($.TemplateRenderer(contentmediaListTitleTemplate, options));

        var url = "";

        // Check if there is a site defined, if so we need to change the url to all files
        if(options.site.length > 0){
            url = searchURLmap.allfiles;
        }else {
            url = searchURLmap[options.context];

            if(options.context === "myfiles"){
                $(contentmediaContextFilterMyfiles).addClass(contentmediaSelectedItemClass);
            }
        }

        var usedIn = [];
        if(options.site[0]){
            usedIn = options.site[0].path;
        }

        // Until search service is fixed we attach a star to the options
        if (options.search !== "*") {
            options.search = options.search + "*";
        }

        // Request the file data
        $.ajax({
            url: url,
            data: {
                "context" : options.context,
                "search" : options.search,
                //"type" : type,
                "page" : pageCurrent,
                "items" : pageSize,
                "sakai:tags" : options.tag,
                "usedin" : usedIn
            },
            cache: false,
            success: function(data){
              doFileRenderFiltered(data);
            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error has occured");
            }
        });
    };



    /**
     * Set the context filter to a specific term
     * @param {String} term The term that needs to be searched
     */
    var setContextFilter = function(term){

        // Set the value of the context filter to the term passed by the function
        options.context = term;
    };

    /**
     * Set the site filter for the site
     * @param {String} site The site that needs to be set
     */
    var setSiteFilter = function(sitepath, sitename){

        // Set the site object to an empty array
        options.site = [];

        // Construct the site object with a path and name
        var site = {
            path : sitepath,
            name : sitename
        };

        // Set the site filter
        options.site.push(site);
    };

    /**
     * Remove the context filter
     */
    var removeContextFilter = function(){

        // Set the value of the context filter to an empty string
        options.context = "";

        // Remove the selected status of the current selected context and site
        $(contentmediaContextFilter + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
        //$(contentmediaAccordionListSite + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
    };

    /**
     * Remove the site filter
     */
    var removeSiteFilter = function(){

        // Set the value of the site filter to an empty array
        options.site = [];

        // Remove the selected status of the current selected context and site
        //$(contentmediaContextFilter + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
        $(contentmediaAccordionListSite + " ." + contentmediaSelectedItemClass).removeClass(contentmediaSelectedItemClass);
    };

    /**
     * Remove the context site filter
     */
    var removeContextSiteFilter = function(){

        removeContextFilter();
        removeSiteFilter();
    };

    /**
     * Add a file to the selected files
     * @param {Integer} index The index of the selected file
     */
    var addToSelectedFiles = function(index){

        // Add the file to the selected files array
        selectedFiles.items.push(globaldata.results[index]);

        updateMaintainerSelectedFiles();
    };

    /**
     * Remove a file from the selected files
     * @param {Object} index The index of the file that needs to removed from the list
     */
    var removeFromSelectedFiles = function(index){

        // Run across files in the selected files array
        // and remove the file where the URL is the same as the globaldata index file
        // (the URL is the only unique thing)
        for(var i = 0; i < selectedFiles.items.length; i++){
            if(selectedFiles.items[i].URL === globaldata.results[index].URL){
                selectedFiles.items.splice(i, 1);
                break;
            }
        }

        updateMaintainerSelectedFiles();
    };



    /**
     * Set the view for listing the files
     * @param {Object} view
     */
    var setView = function(view){

        // Set the class name
        var className = contentmediaViewClass + "_" + view;

        // Check if the files container already has that class
        if(!$(contentmediaFilesContainer).hasClass(className)){

            // If not, remove all classes
            $(contentmediaFilesContainer).removeClass();

            // Add the new class
            $(contentmediaFilesContainer).addClass(className);
        }
    };


    ////////////////////
    // Event Handlers //
    ////////////////////
    /**
     * Search by file owner
     */
    $(searchMyFiles).live("click", function(ev) {
      options.context = "myfiles";
      options.search = "*";
      options.site = [];
      doFileSearch(options);
    });

    $(searchAllFiles).live("click", function(ev) {
      options.context = "allfiles";
      options.search = "*";
      options.site = [];
      doFileSearch(options);
    });

    $("#clear_search_link").live("click", function(ev) {
      $(this).hide();
      $("#search_text").val('');
      options.search = "*";
      doFileSearch(options);
    });

    // enable the tabs
      $("#embedresource_tabs ul li").live('click', function() {
        var which = $(this).attr("id").split("-")[1];
        // reset them, hide them both, then show the right one
        $("#embedresource_tabs ul li").removeClass("tab_active").addClass("tab_inactive");
        $(this).addClass("tab_active").removeClass("tab_inactive");

        $(".embedresource_tab").removeClass("embedresource_active").removeClass("embedresource_inactive");
        $(".embedresource_tab").addClass("embedresource_inactive");
        $("#embedresource_tab-"+which).removeClass("embedresource_inactive").addClass("embedresource_active");

      });


    /**
     * This will select / deselect files when clicked
     */
    $("." + contentmediaFileClass).live("click", function(ev){

        // Get the index of the file
        var splitId = this.id.split("_");
        var index = parseInt(splitId[splitId.length -1], 10);
        $("." + contentmediaFileSelectedClass).removeClass(contentmediaFileSelectedClass);
        $(this).addClass(contentmediaFileSelectedClass);
        $(".contentmedia_fileinfo").hide();
        $("#contentmedia_fileinfo_" + index).show();
        $(".mceActionPanel input").removeAttr('disabled');
    });

    /**
     * Set or remove the context filter
     */
    $("#contentmedia_accordion_list_site a").live("click", function(){
        if ($(this).hasClass(contentmediaSelectedItemClass)){

            // Remove the context/site filter
            removeContextSiteFilter();
        }else{

            // Remove the context/site filter
            removeContextSiteFilter();

            // Add the selected class to the site you selected
            $(this).addClass(contentmediaSelectedItemClass);

            // Set the site filter
            var allText = $(this).text();
            var pathText = $("." + contentmediaHiddenClass, this).text();
            setSiteFilter(pathText, allText.replace(pathText, ""));
        }
        options.context = "allfiles"; // always search within allfiles instead of myfiles
        options.search = "*";
        // Fetch the files with or without a context filter
        doFileSearch(options);
    });


    /**
     * When the search input gets focus from the cursor, add the
     * selected class and empty the input box
     */
    $(contentmediaSearch + " input").focus(function(){
        if (!$(this).hasClass("selected")){
            $(this).addClass("selected");

            // Empty the input box
            $(this).val("");
        }
    });


    /**
     * Submit/Validation Bindings
     */

     // handle focusin on the resource_url for the embed from web
     $("input[name='resource_url']").live('focusin', function() {
          $(".mceActionPanel input#choose_image").attr('disabled','disabled');
        });

        // validate each keystroke against a URL regexp, if valid, enable the submit button
        $("input[name='resource_url']").live('click keyup', function() {
          var regexp = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i; // from jquery validate plugin
       var resource_url = $.trim($("input[name='resource_url']").val());
       if (regexp.test(resource_url)) {
         $(".mceActionPanel input#choose_image").removeAttr('disabled');
       } else {
         $(".mceActionPanel input#choose_image").attr('disabled','disabled');
       }
        });


    ///////////////////////
    // Initial functions //
    ///////////////////////

    /**
     * Initialise the search box
     */
    var initialiseSearch = function(){
        // Catch the search for files
        $(contentmediaSearch + " form").submit(function(){

            // Get the value from the input box
            var searchvalue = $(contentmediaSearch + " form input").val();

            // Check if there is anything in the search box
            if(searchvalue.replace(/ /g,'').length > 0){

                // Set the search option to the value the person entered
                options.search = searchvalue;
                options.site = [];
                options.context = "allfiles"; // because its single-mode, default to allfiles
                // Fetch the list of files
                doFileSearch(options);
            }else {

                // We check if there is a current search keyword or not
                // if there is one, we remove the search filter, otherwise we do nothing
                if(options.search){

                    // Set the search option to false
                    options.search = false;

                    // Fetch the files without the search filter
                    options.site = [];
                    options.context = "allfiles"; // because its single-mode, default to allfiles
                    doFileSearch(options);
                }
            }

            return false;
        });

        /**
         * Bind the search button
         */
        $(contentmediaSearchButton).live("click", function(){

            $("#clear_search_link").show();
            // Execute the submit event on the parent form
            $(this).parents().filter("form").trigger("submit");
        });

    };

    /**
     * Parse the querystring from the browser
     */
    var parseQueryString = function(){
        var querystring = new Querystring();

        // Check if the querystring contains the site id of a site
        if(querystring.contains("siteid")){
            var siteid = querystring.get("siteid");

            $.ajax({
                url: sakai.config.URL.SITE_CONFIGFOLDER.replace("__SITEID__", siteid) + ".json",
                cache: false,
                success: function(data){
                    var parsedData = data;
                    setSiteFilter(sakai.config.URL.SITE_CONFIGFOLDER.replace("__SITEID__", siteid), parsedData.name);

                    // Fetch the initial list of files
                    doFileSearch(options);
                },
                error: function(xhr, textStatus, thrownError) {
                    //alert("An error has occured");
                }
            });
        }else{
            // Fetch the initial list of files
            doFileSearch(options);
        }
    };

    /**
     * Load sites for the current user
     * @param {Object} sites Object response from JSON
     */
    var loadSites = function(sites){
        var jsonSites = {};
        jsonSites.items = sites;
        // Render the template with the selected files
        $.TemplateRenderer(contentmediaAccordionListSiteTemplate, jsonSites, $(contentmediaAccordionListSite));
    };

    /**
     * Initialise the sites tab
     */
    var initialiseSites = function(){
        $.ajax({
            url: sakai.config.URL.SITES_SERVICE,
            cache: false,
            success: function(data){
                loadSites(data);
            }
        });
    };

    /**
     * Initialise the pickresource
     * @param {Object} _options  identifier for the current context, initial search
     *   query and initial tag filter
     *   {
     *        "context" : "All Files" or "/sites/siteid",
     *        "search" : false or "searchquery",
     *        "tag" : false or ["tag1","tag2","tag3"],
     *         "page" : 0
     *    }
     */
    sakai.collectionscontent.initialise = function(_options, _imagesOnly){
        // Save options object
        options = _options;
        imagesOnly = _imagesOnly;

        // Initialize the selected files object
       // resetSelectedFiles();

        // Disable the edit and delete link on startup
        //updateMaintainerSelectedFiles();

        // Show the lightbox


        // Set the view to thumbnails
        setView("list");

        // Parse the querystring in the browser
        parseQueryString();


        // Accordion functionality
        $(contentmediaAccordion).accordion({
            //fillSpace: true
            autoHeight: false
        });

        // Initialise search
        initialiseSearch();

        // Initialise the sites tab
        initialiseSites();


    };

    sakai.collectionscontent.initialise({
        "context" : "myfiles",
        "search" : false,
        "tag" : [],
        "site" : []
    });
};

sakai.api.Widgets.widgetLoader.informOnLoad("collections");