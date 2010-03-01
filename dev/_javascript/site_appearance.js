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

/*global $, Config, jQuery, sakai, sdata, Querystring, window, removeAreaSelect */

var sakai = sakai || {};

sakai.site_appearance_change = {};
sakai.site_appearance = function() {


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var appearance = {};
    var maxWidth = 500;
    var maxHeight = 300;
    var picture = false;
    var ratio = 1;
    var realHeight = 0;
    var realWidth = 0;
    var siteId = "";
    var siteInformation = "";
    var userSelection = null;

    //    These values are used in case there is no css width and heigth is specified for the thumbnail container.
    //    If you want to change the size of a thumbnail please do this in the CSS.
    var thumbnailWidth = 200;
    var thumbnailHeight = 100;

    // Id
    var siteAppearance = "#site_appearance";
    var siteAppearanceCancel = siteAppearance + "_cancel";
    var siteAppearanceLogo = siteAppearance + "_logo";
    var siteAppearancePreviewTitle = siteAppearance + "_preview_title";
    var siteAppearanceSave = siteAppearance + "_save";
    var siteAppearanceStyleContainer = siteAppearance + "_style_container";
    var siteAppearanceTab = siteAppearance + "_tab";
    var siteAppearanceTitle = siteAppearance + "_title";

    var siteAppearanceChange = siteAppearance + "_change";
    var siteAppearanceChangeContainer = siteAppearanceChange + "_container";
    var siteAppearanceChangeLogoTrigger = siteAppearanceChange + "_logo_trigger";
    var siteAppearanceChangePicture = siteAppearanceChange + "_picture";
    var siteAppearanceChangePictureMeasurer = siteAppearanceChangePicture + "_measurer";
    var siteAppearanceChangePictureMeasurerImage = siteAppearanceChangePictureMeasurer + "_image";
    var siteAppearanceChangePictureFull = siteAppearanceChangePicture + "_full";
    var siteAppearanceChangePictureSave = siteAppearanceChangePicture + "_save";
    var siteAppearanceChangePictureThumbnail = siteAppearanceChangePicture + "_thumbnail";
    var siteAppearanceChangePictureThumbnailContainer = siteAppearanceChangePictureThumbnail + "_container";

    // Tabs
    var siteAppearanceChangeSelect = siteAppearanceChange + "_select";
    var siteAppearanceChangeSelectContent = siteAppearanceChangeSelect + "_content";
    var siteAppearanceChangeSelectTab = siteAppearanceChangeSelect + "_tab";

    var siteAppearanceChangeUpload = siteAppearanceChange + "_upload";
    var siteAppearanceChangeUploadContent = siteAppearanceChangeUpload + "_content";
    var siteAppearanceChangeUploadForm = siteAppearanceChangeUpload + "_form";
    var siteAppearanceChangeUploadTab = siteAppearanceChangeUpload + "_tab";

    // Class
    var siteAppearanceClass = ".site_appearance";
    var siteAppearanceAppendIdToUrlClass = siteAppearanceClass + "_append_id_to_url";

    // Tab
    var tabActiveClass = "fl-tabs-active";

    // Template
    var siteAppearanceTemplate = "site_appearance";
    var siteAppearanceLogoTemplate = siteAppearanceTemplate + "_logo_template";
    var siteAppearanceStyleContainerTemplate = siteAppearanceTemplate + "_style_container_template";

    // Others
    var selectedClass = "selected";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Adds ?key=val to the url of ID of the DOM.
     * @param {String} id The DOM id
     * @param {String} key The key you wish to add
     * @param {String} value The value for the key.
     */
    var appendKeyToURL = function(id, key, value) {
        var url = $(id).attr('href');

        // If there is no question mark in the url we add it.
        url += (url.indexOf('?') === -1) ? "?" : "&";
        url += key + "=" + value;
        $(id).attr('href', url);
    };

    /**
     * Create the complete image path for the picture on the current site
     * @param {String} filename The name of the file (e.g.photo1.jpg)
     */
    var createImagePath = function(filename){
        return "/sites/" + siteId + "/" + "siteicon";
    };

    /**
     * Redirect the user to the main site page
     */
    var redirectToSitePage = function(){
        document.location = "/sites/" + siteId;
    };

    /**
     * Auto resize all the iframes on the page
     * source: http://sonspring.com/journal/jquery-iframe-sizing
     */
    var resizeIframes = function(){

        // Set specific variable to represent all iframe tags.
        var iFrames = document.getElementsByTagName('iframe');

        // Resize heights.
        function iResize()
        {
            // Iterate through all iframes in the page.
            for (var i = 0, j = iFrames.length; i < j; i++)
            {
                // Set inline style to equal the body height of the iframed content.
                iFrames[i].style.height = iFrames[i].contentWindow.document.body.offsetHeight + 'px';
            }
        }

        // Check if browser is Safari or Opera.
        if ($.browser.safari || $.browser.opera)
        {
            // Start timer when loaded.
            $('iframe').load(function()
                {
                    setTimeout(iResize, 0);
                }
            );

            // Safari and Opera need a kick-start.
            for (var i = 0, j = iFrames.length; i < j; i++)
            {
                var iSource = iFrames[i].src;
                iFrames[i].src = '';
                iFrames[i].src = iSource;
            }
        }
        else
        {
            // For other good browsers.
            $('iframe').load(function()
                {
                    // Set inline style to equal the body height of the iframed content.
                    this.style.height = this.contentWindow.document.body.offsetHeight + 'px';
                }
            );
        }
    };


    ////////////////////
    // Main functions //
    ////////////////////

    /**
     * Load the site style template
     */
    var loadTemplate = function(){

        // Change the src attribute for the iframe to load another site style template
        $("iframe").attr("src", "/dev/_skins/" + appearance.style.id + "/" + appearance.style.id + "_preview.html");

        // Auto resize the iframe
        //resizeIframes();
        $(".page_preview_iframe").css("height","497px");
    };

    /**
     * Update the site style on the appearance page
     */
    var updateSiteStyle = function(){

        // Check if the appearance object exists
        if(appearance.style){

            // Change the name of the template
            $(siteAppearancePreviewTitle).text(appearance.style.name);

            // Load the template inside the iframe
            loadTemplate();
        }
    };

    /**
     * Save the site style to the local object
     * @param {String} style The style id (you can find all styles in the configuration file)
     */
    var saveSiteStyle = function(style){

        // Set the global style object to the style the use has selected
        appearance.style = Config.Site.Styles[style];
        appearance.style.id = style;

        // Update the site style
        updateSiteStyle();
    };

    /**
     * Add all the site styles from the config file and render the template
     */
    var addSiteStyles = function(){

        // Initialize tempory variables which we use to pass with the template function
        var json_styles = {};
        var styles = [];

        // Get all the styles from the config file and add them to a global variable
        for (var i in Config.Site.Styles){

            // We need to use hasOwnProperty when we use for ... in to parse with JSLint
            // More information: http://ajaxian.com/archives/fun-with-browsers-for-in-loop
            if(Config.Site.Styles.hasOwnProperty(i)){
                var style = {};
                style.id = i;
                style.name = Config.Site.Styles[i].name;
                style.image = Config.Site.Styles[i].image;
                styles.push(style);
            }
        }
        json_styles.styles = styles;

        // Check if the site has a current style or not
        if(siteInformation.style){
            json_styles.selectedStyle = siteInformation.style;
            saveSiteStyle(siteInformation.style);
        }else{
            json_styles.selectedStyle = json_styles.styles[0].id;
            saveSiteStyle(json_styles.styles[0].id);
        }

        // Render the site style template
        $.Template.render(siteAppearanceStyleContainerTemplate, json_styles, $(siteAppearanceStyleContainer));
    };

    /**
     * Update the site picture
     */
    var updatePicture = function(){

        // Check if there is a picture available for the current site
        if(siteInformation.picture && $.evalJSON(siteInformation.picture).name){

            var json = $.evalJSON(siteInformation.picture);
            // Set the fullpath to the variable
            json.fullName = "/sites/" + siteId + "/200x100_siteicon" + "?sid=" + Math.random();

            // Render the image template
            $.Template.render(siteAppearanceLogoTemplate, json, $(siteAppearanceLogo));
        }
    };

    /**
     * This will fill in all the field settings for the site.
     */
    var fillData = function() {
        $.ajax({
            url: "/sites/" + siteId + ".json",
            cache: false,
            type: "GET",
            success: function(response) {

                // Parse the json respons
                var json = $.evalJSON(response);

                // Check if we are an owner for this site.
                // Otherwise we will redirect to the site page.
                var isMaintainer = sakai.lib.site.authz.isUserMaintainer(json);
                if (isMaintainer) {

                    // Fill in the info.
                    $(siteAppearanceTitle).text(json.name);

                    // Save the site information to the global variable
                    siteInformation = json;

                    // Update the picture on the site
                    updatePicture();

                    // Add the site styles
                    addSiteStyles();
                }
                else {

                    // The user is not an owner for this site. we redirect him/her to the site page.
                    redirectToSitePage();
                }
            },
            error: function(xhr, textStatus, thrownError) {

                // If we don't find or we are not able to get information about the current site id,
                // we redirect the user to the gateway url.
                document.location = Config.URL.GATEWAY_URL;
            }
        });
    };

    /**
     * Update the group def file for the current site
     */
    var updateGroupDef = function(){

        var tosave = {
            "name": thumbnailWidth + "x" + thumbnailHeight + "_siteicon",
            "_name": "siteicon"
        };

        // We edit the profile.json file with the new profile picture.
        var stringtosave = $.toJSON(tosave);

        // We edit the picture object in siteInformation.
        // This saves a request and will be checked in the doInit function later on.
        siteInformation.picture = stringtosave;

        // Update the groupdef file with the new information
        $.ajax({
            url: "/sites/" + siteId,
            type : "POST",
            data : {
            "picture": stringtosave,
            "_charset_":"utf-8"
        },
            success : function(data) {

                // Update picture on the page
                updatePicture();

                // Hide the layover.
                $(siteAppearanceChangeContainer).jqmHide();
            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error has occured");
            }
        });
    };

    // This is the function that will be called when a user has cut out a selection
    // and saves it.
    var savePicture = function(){

        //    The parameters for the cropit service.
        var data = {
            img: "/sites/" + siteId + "/siteicon",
            save: "/sites/" + siteId + "/",
            x: Math.floor(userSelection.x1 * ratio),
            y: Math.floor(userSelection.y1 * ratio),
            width: Math.floor(userSelection.width * ratio),
            height: Math.floor(userSelection.height * ratio),
            dimensions: "200x100"
        };

        // Post all of this to the server
        $.ajax({
            url: Config.URL.IMAGE_SERVICE,
            type: "POST",
            data: data,
            success: function(data){
                //if($.evalJSON(data).response === "OK"){
                    updateGroupDef();
                //}
            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error has occured");
            }
        });
    };


    ///////////////////
    // Tab functions //
    ///////////////////

    /**
     * Show a specific tab and load its contents
     * @param {String} tab The name of the tab you want to load
     */
    var showTab = function(tab){

        //Remove all the classes for the current active tabs
        $("." + tabActiveClass).removeClass(tabActiveClass);
        $(siteAppearanceTab).addClass(tabActiveClass);

        switch(tab){
            case "upload":

                // Remove the area select
                removeAreaSelect();

                $(siteAppearanceChangeUploadTab).addClass(tabActiveClass);

                $(siteAppearanceChangeSelectContent).hide();
                $(siteAppearanceChangeUploadContent).show();
                break;
            case "select":

                $(siteAppearanceChangeSelectTab).addClass(tabActiveClass);

                $(siteAppearanceChangeUploadContent).hide();
                $(siteAppearanceChangeSelectContent).show();
        }
    };

    /**
     * Clicked on the upload tab
     */
    $(siteAppearanceChangeUploadTab).bind("click", function(){
        showTab("upload");
    });

    /**
     * Clicked on the select tab
     */
    $(siteAppearanceChangeSelectTab).bind("click", function(){
        sakai.site_appearance_change.doInit();
    });


    /////////////////////////////
    // imgAreaSelect functions //
    /////////////////////////////

    /**
     * Remove the selecting box of an area on an image.
     */
    var removeAreaSelect = function(){

        // Hide and disable the area select
        $(siteAppearanceChangePictureFull).imgAreaSelect({
            hide: true,
            disable: true
        });
    };

    /**
     * Hide the layover for an area
     * @param {Object} hash The object that represents the layover
     */
    var hideArea = function(hash){
        removeAreaSelect();

        hash.w.hide();
        hash.o.remove();
    };

    /**
     * Show the layover for an area
     * @param {Object} hash The object that represents the layover
     */
    var showArea = function(hash){
        sakai.site_appearance_change.doInit();
        hash.w.show();
    };

    /**
     * When the user draws a square this function will be called by imgAreaSelect.
     * This will draw the thumbnail by modifying it's css values.
     * @param {Object} img The thumbnail image the user selected
     * @param {Object} selection The selection object from imgAreaSelect
     */
    function preview(img, selection){

        // Save the user his selection in a global variable.
        userSelection = selection;

        // How much has the user scaled down the image?
        var scaleX = thumbnailWidth / selection.width;
        var scaleY = thumbnailHeight / selection.height;

        // Change the thumbnail according to the user his selection via CSS.
        $(siteAppearanceChangePictureThumbnail).css({
            width: Math.round(scaleX * img.width) + 'px',
            height: Math.round(scaleY * img.height) + 'px',
            marginLeft: '-' + Math.round(scaleX * selection.x1) + 'px',
            marginTop: '-' + Math.round(scaleY * selection.y1) + 'px'
        });
    }

    /**
     * Add the selection element to the image area
     */
    var addImageArea = function(){
        $(siteAppearanceChangePictureFull).imgAreaSelect({
            aspectRatio: "2:1",
            disable: false,
            keys: true,
            hide: false,
            onSelectEnd: preview,
            selectionColor: 'white'
        });
    };

    /**
     * Check if the width and height of the image dont exceed the maximum values
     */
    var checkSize = function(){
        // Width > maxWidth ; Height < maxHeight => Width = maxWidth
        if (realWidth > maxWidth && (realHeight / (realWidth / maxWidth) < maxHeight)){
            ratio = realWidth / maxWidth;
            $(siteAppearanceChangePictureFull).width(maxWidth);

        // Width < maxWidth ; Height > maxHeight => Height = maxHeight
        } else if (realHeight > maxHeight && (realWidth / (realHeight / maxHeight) < maxWidth)) {
            ratio = realHeight / maxHeight;
            $(siteAppearanceChangePictureFull).height(maxHeight);

        // Width > maxWidth ; Height > maxHeight
        } else if (realHeight > maxHeight && (realWidth / (realHeight / maxHeight) > maxWidth)) {
            var heightonchangedwidth = realHeight / (realWidth / maxWidth);
            if (heightonchangedwidth > maxHeight){
                ratio = realHeight / maxHeight;
                $(siteAppearanceChangePictureFull).height(maxHeight);
            } else {
                ratio = realWidth / maxWidth;
                $(siteAppearanceChangePictureFull).height(maxWidth);
            }
        }
    };

    /*
     * Send a request to the server to get the site image
     */
    sakai.site_appearance_change.doInit = function(){
        picture = false;

        // Change the action of the form to the path you want to upload your picture to
        $(siteAppearanceChangeUploadForm).attr("action", "/sites/" + siteId);

        // Get the preferred size for the thumbnail.
        var prefThumbWidth = parseInt($(siteAppearanceChangePictureThumbnailContainer).css('width').replace(/px/gi,''), 10);
        var prefThumbHeight = parseInt($(siteAppearanceChangePictureThumbnailContainer).css('height').replace(/px/gi,''), 10);

        // Make sure we don't have 0
        thumbnailWidth  = (prefThumbWidth > 0) ? prefThumbWidth : thumbnailWidth;
        thumbnailHeight  = (prefThumbHeight > 0) ? prefThumbHeight : thumbnailHeight;

        if (siteInformation.picture) {
            picture = siteInformation.picture;
        }

        if (picture && $.evalJSON(picture)._name) {

            // The user has already uploaded a picture.
            // Show the edit tab.
            $(siteAppearanceChangeSelectTab).show();

            // Set the unvisible image to the full blown image. (make sure to filter the # out)
            $(siteAppearanceChangePictureMeasurer).html("<img src='" + "/sites/" + siteId + "/" + "siteicon" + "?sid=" + Math.random() + "' id='" + siteAppearanceChangePictureMeasurerImage.replace(/#/gi, '') + "' />");

            // Check the current picture's size
            $(siteAppearanceChangePictureMeasurerImage).bind("load", function(ev){

                // save the image size in global var.
                realWidth = $(siteAppearanceChangePictureMeasurerImage).width();
                realHeight = $(siteAppearanceChangePictureMeasurerImage).height();

                // Set the images
                $(siteAppearanceChangePictureFull).attr("src", "/sites/" + siteId + "/" + "siteicon" + "?sid=" + Math.random());
                $(siteAppearanceChangePictureThumbnail).attr("src", "/sites/" + siteId + "/" + "siteicon" + "?sid=" + Math.random());

                // Check if the current width and height dont exceed the maximum values
                checkSize();

                // Add the image area
                addImageArea();
            });

            showTab("select");

        }
        else {
            // If the user hasn't uploaded a picture yet, we show the upload pic tab.
            $(siteAppearanceChangeSelectTab).hide();
            showTab("upload");
        }
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /*
     * Bind all the style elements when you click on them
     * We use live because this part gets rendered by trimpath
     */
    $(siteAppearanceStyleContainer + " li a").live("click",function(e,ui){

            // Get the id for the parentnode
            var id = e.target.parentNode.parentNode.id;

            // Remove all the the selected classes
            $(siteAppearanceStyleContainer + " ." + selectedClass).removeClass(selectedClass);

            // Save the polltype you clicked on to the json object
            saveSiteStyle(id);

            // Add the active class to the element you clicked on
            $("#"+id).addClass(selectedClass);
    });

    /*
     * Bind the save button on the pop-up where you can change your picture
     */
    $(siteAppearanceChangePictureSave).click(savePicture);

    /*
     * Bind the general save button
     */
    $(siteAppearanceSave).click(function(){
        if(appearance.style.id){
            $.ajax({
                url: "/sites/" + siteId,
                type : "POST",
                data : {
                "sakai:skin":appearance.style.URL,
                "style":appearance.style.id,
                "_charset_":"utf-8"
            },
                success : function(data) {

                    // When the save is completed we redirect the user back to the main site page
                    redirectToSitePage();
                },
                error: function(xhr, textStatus, thrownError) {
                    alert("An error has occured");
                }
            });
        }
    });

    /*
     * Bind the main cancel button
     */
    $(siteAppearanceCancel).click(function(){

        // Redirect to the main page
        redirectToSitePage();
    });

    /*
     * This will make the widget popup as a lay over.
     */
    $(siteAppearanceChangeContainer).jqm({
        modal: true,
        toTop: true,
        trigger: siteAppearanceChangeLogoTrigger,
        onHide: hideArea,
        onShow: showArea,
        overlay: 20
    });


    //////////////////////////////
    // Initialisation functions //
    //////////////////////////////

    /**
     * Get the site id from the querystring in the browser
     */
    var getSiteId = function(){
        var qs = new Querystring();
        siteId = qs.get("siteid", false);
    };

    /**
     * Append the site id to multiple urls
     */
    var appendIdsToUrl = function(){

        // Add the site id to all the element with a specific class
        $(siteAppearanceAppendIdToUrlClass).each(function(i, el) {
            $(el).attr("href",$(el).attr("href") +  siteId);
        });
    };

    /**
     * initializes the site appearance page
        */
       var doInit = function(){

        // Get the site id and append it to various links on the page
        getSiteId();
        appendIdsToUrl();

        // Fill in the site data (Title, ...)
        fillData();
    };
    doInit();

    /**
     * When the file has been saved we will get a response back from JCR.
     * @param {Object} response
     */
    sakai.site_appearance_change.completeCallback = function(response){

        // Replace any <pre> tags the response might contain.
        response = response.replace(/<pre[^>]*>/ig,"").replace(/<\/pre[^>]*>/ig,"");

        var tosave = {
            "_name": "siteicon"
        };

        // We edit the groupdef.json file with the new site picture.
        var stringtosave = $.toJSON(tosave);

        // We edit the picture object in siteInformation.
        // This saves a request and will be checked in the doInit function later on.
        siteInformation.picture = stringtosave;

        $.ajax({
            url: "/sites/" + siteId,
            type : "POST",
            data : {
            "picture": stringtosave,
            "_charset_":"utf-8"
        },
            success : function(data) {

                // When the save is completed we initialize the site appearance pop-up again
                sakai.site_appearance_change.doInit();
            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error has occured");
            }
        });
    };

};

/**
 * This method gets called the second we submit the form
 */
sakai.site_appearance_change.startCallback = function(){
    return true;
};

/**
 * TODO replace with better code (maybe with the Fluid infusion Uploader plug-in)
 * We use this AIM method, which places an iframe on the page, to prevend reloading the page when uploading
 */
var AIM = {
    frame : function(c) {
        var n = 'f' + Math.floor(Math.random() * 99999);
        var d = document.createElement('DIV');
        d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="AIM.loaded(\''+n+'\')"></iframe>';
        document.body.appendChild(d);

        var i = document.getElementById(n);
        if (c && typeof(c.onComplete) === 'function') {
            i.onComplete = c.onComplete;
        }
        return n;
    },

    form : function(f, name) {
        f.setAttribute('target', name);
    },

    submit : function(f, c) {
        AIM.form(f, AIM.frame(c));
        if (c && typeof(c.onStart) === 'function') {
            return c.onStart();
        } else {
            return true;
        }
    },

    loaded : function(id) {
        var i = document.getElementById(id);
        var d = null;
        if (i.contentDocument) {
            d = i.contentDocument;
        } else if (i.contentWindow) {
            d = i.contentWindow.document;
        } else {
            d = window.frames[id].document;
        }
        if (d.location.href === "about:blank") {
            return;
        }

        if (typeof(i.onComplete) === 'function') {
            i.onComplete(d.body.innerHTML);
        }
    }
};

sdata.container.registerForLoad("sakai.site_appearance");