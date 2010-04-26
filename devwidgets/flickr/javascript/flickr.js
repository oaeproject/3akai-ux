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
/*global Config, $, sdata ,fluid */

var sakai = sakai || {};

/**
 * 
 * @param {Object} tuid , unique id for the widget
 * @param {Object} showSettings boolean to check if the widget is in settingsmode or not
 */
sakai.flickr = function(tuid, showSettings){


    ///////////////
    // VARIABLES //
    ///////////////

    var rootel = $("#" + tuid); // Get the main div used by the widget
    var $flickrContainer = $("#flickr_settings",rootel); //The entire settings flickr container
    var $flickrCancelSettings = $("#flickr_settings_cancel", rootel); // flickr settings cancel button
    var $flickrAccordion = $("#flickr_accordion",rootel); // The Main accordion div
    var $flickrTooltipText = $("#flickr_tooltip_text",rootel); // This is the text that will be displayed in the tooltip
    var $flickrDropHereImage = $(".flick_drop_here",rootel); // The drop here image
    var $flickrfinishSettings = $("#flickr_settings_submit",rootel); //The finish button
    var $flickrPreviewContainer = $(".flickr_preview_container",rootel); //The preview view
    var $flickrPreviewGallery = $('.flick_gallery',rootel);

    /* First Accordeon */
    var $flickrSearchPersonInput = $("#flickr_key_person_input",rootel); //The inputbox in the first accordeon div
    var $flickrSearchPersonKeyButton = $('#flickr_seach_people_button',rootel); //The button in the first accordeon div
    var $flickrKeyPersonGallery =$('#flickr_key_person_gallery',rootel); //The image gallery in the first accordeon div
    var $flickrLoadingPersonImage = $('#flickr_loading_person_img',rootel); // Ajax loader in the first accordeon div
    var $flickrPersonPagging = $("#flickr_person_pagging",rootel); //The pagging for the gallery in the first accordeon div
    var $flickrPage = $("#flickr_page",rootel);
    var $flickrRefreshImages = $("#flickr_refresh_button_person",rootel);

    /*Second Accordeon */
    var $flickrSearchInput = $("#flickr_key_input",rootel); // Input box
    var $flickrKeyGallery = $('#flickr_key_gallery',rootel); // Div where the images will be displayed
    var $flickrLoadingImage = $('#flickr_loading_img',rootel); // Ajax loader
    var $flickrSearchKeyButton = $("#flickr_seach_button",rootel);// The searchbutton
    var $flickrKeyPagging = $("#flickr_key_pagging",rootel);
    var $flickrPrevPaggingKey = $("#flickr_person_prev_key_pagging",rootel);
    var $flickrNextPaggingKey = $("#flickr_person_key_next_pagging",rootel);
    var $flickrKeyPaggingInput = $('#flickr_key_pagging_input',rootel);
    var $flickrRefreshKeyButton = $("#flickr_refresh_key_button",rootel);

    /* Preview elenemets */
    var $flickrPreviewPagging = $("#flickr_preview_pagging",rootel);
    var $flickrPersonPreviewNextPagging = $("#flickr_person_preview_next_pagging",rootel);
    var $flickrPersonPreviewPrevPagging = $("#flickr_person_prev_preview_pagging",rootel);
    var $flickrPreviewPaggingInput = $('#flickr_preview_pagging_input',rootel);
    var $flickrKeyUlPreview = $("#flickr_key_ul_preview",rootel);
    var $flickrSlideshowImages = $("#flickr_slideshow_images",rootel);
    var bindPaging;


    /*Sidebar */
    var $flickSidebar = $("#flickr_sidebar",rootel); // The sidebar
    var $flickrSidePaging = $("#flickr_side_paging",rootel);
    var $flickrSidePages = $("#flickr_side_pages",rootel);
    var $flickrSidePagging = $('#flickr_side_pagging',rootel);
    var $flickrSideNextPagging = $('#flickr_side_next_pagging',rootel);
    var $flickrSidePrevPagging = $('#flickr_side_prev_pagging',rootel);

    //Global variables
    var key = "93a86c06dc382a19bff0d4d24872ecab"; // An api key required fron flickr when registering the widget
    var defaultvalue; // The default value of the input box
    var sortableObject = {
        horizontal: {
            helper: "clone", // Instead of dragging the real image a copy will be dragged
            connectWith: ["#flickr_sidebar ul"], // To be able to drag and drop an image to another image gallery they need to be connected
            cursor: 'pointer', //change the cursor when dragging
            opacity: 0.50, //Change the opacity while dragging
            appendTo: $("#flickr_sidebar"), //When dropped the images need to be appended to the image gallery where they are dropped
            containment: rootel, //Make sure the user can't drag the images outside the widget
            revert: true // if the user releases the image ouside the dropbox it'll return to it's original position
        },
        vertical: {
            appendTo: $("#flickr_sidebar"), //When dropped the images need to be appended to the image gallery where they are dropped
            cursor: 'pointer', //Change the cursor
            opacity: 0.50, //When dragging change the opacity
            helper: 'clone', //Instead of dragging the original image, drag a copy
            containment: $("#flickr_sidebar"), //The dragged image can't get out of the widget
            connectWith: ["#flickr_image_slider_ul"] // To be able to drag and drop an image to another image gallery they need to be connected
        }
    };

    var changeColorBlack = "flickr_changeColorBlack"; // Css class to change the textcolour
    var changeColorNormal = "flickr_changeColorNormal"; // Css class to change the textcolour
    var userId; //When the first call is done to get the user id this variabel gets a value
    var currentPage = 0;  //The currentpage the user is on
    var allPages; //All the pages that are left
    var imgPerPage = 5; //How many images that will be displayed per page
    var totalImages; //totalImages in the gallery
    var newPage = currentPage + 3; //To request a new page, this will start at 3, since page 1 and 2 are allready loaded at the start
    var totalPages; //The total amount of page (this doesn't change)
    var dragged = 0; //How many images that have been dragged
    var curP = 0;

    //Global variables of the 2nd accordeon
    var userDetailGlob;//A global variable that contains the user details
    var newPageKey = 3; //This variable is used when requesing new images, since the 2 first pages are allready loaded, it has to start at 3
    var currentPageKey; //This variable contains the page the user is currently on 
    var tagsGlob; //This variable contains the tags that the user has given 
    var draggedKey = 0;
    var totalImagesKey = 0;
    var totalKeyPages;
    var imageGalleryObject;

    //Template
    var $flickrPersonGalleryPaggingTemplate = $("#flickr_person_gallery_pagging_template");
    var $flickrImageGalleryTemplate = $('#flickr_image_gallery_template');
    var $flickrResetTemplate = $('#flickr_reset_gallery_template',rootel);
    var $flickrKeyGalleryPaggingTemplate = $("#flickr_key_gallery_pagging_template");
    var $flickrImageGalleryPreviewTemplate = $('#flickr_image_gallery_preview_template',rootel);
    var $flickrPreviewGalleryPaggingTemplate = $('#flickr_preview_gallery_pagging_template',rootel);
    var $flickrSlideshowIconTemplate = $('#flickr_slideshow_icon_template',rootel);
    var $flickrSideGalleryPaggingTemplate = $("#flickr_side_gallery_pagging_template",rootel);


    //Config urls
    sakai.config.URL.flickrGetPhotosBySearchTerm = "/var/proxy/flickr/flickrKeyPictures.json";
    sakai.config.URL.flickrGetUserDetailsByEMail = "/var/proxy/flickr/flickrGetUserDetailsByEMail.json";
    sakai.config.URL.flickrGetUserDetailsByName = "/var/proxy/flickr/flickrGetUserDetailsByName.json";
    sakai.config.URL.flickrGetPicturesByUserId = "/var/proxy/flickr/flickrGetPicturesByUserId.json";
    sakai.config.URL.flickrGetPicturesByUserIdStart = "/var/proxy/flickr/flickrGetPicturesByUserIdStart.json";
    sakai.config.URL.flickrStaticImageUrl = "http://farm3.static.flickr.com/";

    //Error messages
    var $flickrInputError = $("#flickr_input_error",rootel);
    var $flickrInputSameError = $("#flickr_input_same_error",rootel);
    var $flickrInputPersonError = $("#flickr_input_person_error",rootel);
    var $flickrInputPersonSameError = $("#flickr_input_same_person_error",rootel);
    var $flickrNoPersonError = $("#flickr_no_person_error",rootel);
    var $flickrNoPublic = $("#flickr_no_public",rootel);

    //////////////
    // SETTINGS //
    //////////////

    ///////////////////
    // Reusable code //
    ///////////////////

    /**
     * Remove the drophere-image if it still exists
     */
    var removeDropNowImage = function(){
        //If the drop now image exists remove on the drop of an other image
        if ($flickrDropHereImage.size) {
            $flickrDropHereImage.parent().remove();
        }
    };

     /**
      * Closes the settings container.
      */
     var finishSettingsContainer = function() {
        sdata.container.informCancel(tuid);
     };

    /**
     * This is on the blur of the inputbox
     * If the inputbox is empty change the color and if it's empty fill in the default value
     */
     var checkEmpty = function(textbox){

         // Change the colour of the text in the inputbox
         textbox.removeClass(changeColorBlack);
         textbox.addClass(changeColorNormal);

         // Check if it's empty, if it is fill it in with the default value
         if(!textbox.val()){
             textbox.val(defaultvalue);
         }
     };

    /**
     * This is on the focus of the inputbox
     * If the value is the defaultvalue clear it and change the color of the text
     */
     var changeColour = function(textbox){

         // If the value is the default value, clear the inputbox
         if(textbox.val() ===defaultvalue){
             textbox.val('');
         }

         // Change the color of the text of the inputbox
         textbox.removeClass(changeColorNormal);
         textbox.addClass(changeColorBlack);
     };

    /**
     * This function will parse the json gotten from flickr into an array with pictures
     * @param {Object} pictures , The response gotten from the ajax call
     */
    var makeImageGallery = function(pictures){

        //Array for all the pictures
        var pictureUrlArray = [];

        //Convert the data to an object
        var pics = $.evalJSON(pictures);

        //Give the object a key in an array so it"s easier to address
        var parsedPics = {
            all: pics.photos.photo
        };

        //Loop over the pictures in the array and add them transform them into a url and add them to the array
        for (var i = 0, il = parsedPics.all.length; i < il; i = i + 1) {
            var pic = parsedPics.all[i];
            var picture = {
                "url":sakai.config.URL.flickrStaticImageUrl + pic.server + "/" + pic.id + "_" + pic.secret + "_s.jpg",
                "title": pic.title
            };
            pictureUrlArray.push(picture);
        }

        //Put the array in an object with a key
        var picz = {
            'all': pictureUrlArray
        };

        return picz;
    };

    /**
     * This function will add 5 new pictures to the gallery, this is executed after the drag and drop when there are no images left
     * @param {Object} data , response of the ajax call
     */
    var addPicturesToPersonGal = function(data){
        
        //Render the image gallery
        $('ul',$flickrKeyPersonGallery).append($.TemplateRenderer($flickrImageGalleryTemplate, makeImageGallery(data)));

        //Hide the just rendered images
        $('img',$flickrKeyPersonGallery).slice((currentPage * imgPerPage), ((currentPage + 1) * imgPerPage)).hide();
    };

    /**
     * This will get 5 new images when there are no images left after the user drags and drops images
     */
    var requestNewImagesPerson = function(){

        // Ajax call to get the user details
        $.ajax({
            url: sakai.config.URL.flickrGetPicturesByUserId ,
            success: function(data){
                newPage = newPage + 1;
                // Get the pictures based on the userid
                addPicturesToPersonGal(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at the request for new images after the drag and drop");
            },
            data: {
                "userid": userId,
                "api_key":key,
                "page":newPage
            }
        });
        
    };

    /**
     * This function will check if both arrows have to be hidden
     */
    var checkBothArrows = function(){

        if (currentPage <= 1) {
            $("#flickr_person_prev_pagging",rootel).attr("class", 'flickr_hideArrow');
        }

        //Check if the current page is equal to the total amount of pages
        if (currentPage >= totalPages) {

            //Hide the next arrow
            $("#flickr_person_next_pagging",rootel).attr("class", 'flickr_hideArrow');
        }
    };


    /**
     *  This function will be executed when an image is dropped
     * @param {Object} event, in this event you can get where the image is dropped
     * @param {Object} ui, in this object you can find what is beeing dragged
     * @param {Object} imageGallery, An object that contains an image gallery
     */
    var droppedImage = function(event, ui, imageGallery){

        // An image is dropped so the dragged is incremented
        dragged = dragged + 1;

        // Remove the drop down image
        removeDropNowImage();

        // When an image is removed from the gallery a new one is added
        // This if checks if the image that has to be added exists, or if the user is on the last page
        if (currentPage !== totalPages) {
            if ($('li', imageGallery).slice((currentPage * 5) - 1, (currentPage * 5)).find("img").length) {
            
                // The new image is displayed
                $('li', imageGallery).slice((currentPage * 5) - 1, (currentPage * 5)).find("img").fadeIn(1500);

                //New total pages is calculated and displayed in the html
                totalPages = Math.round(((totalImages - dragged) / 5));

                // If the user is on page 0 he should be on page 1
                totalPages = (totalPages === 0) ? 1 : totalPages;
                $flickrPage = $("#flickr_page",rootel);
                $flickrPage.html(totalPages);

                // If there is no image to add, a new request should be done
            }
            else {
                requestNewImagesPerson();
            }

            // If there is only 1 page left, no images should be shown
            checkBothArrows();
        }
    };

    var checkArrowSidePrev = function(){
        if (cp === 1) {
            $flickrSidePrevPagging.attr("class", 'flickr_hideArrow');
        }
        $flickrSideNextPagging.attr("class", "flickr_showArrow");
    };

    var checkBothArrowsSide = function(){
        if (cp === 1) {
            $flickrSidePrevPagging.attr("class", 'flickr_hideArrow');
        }
        if (cp === tp) {
            $flickrSideNextPagging.attr("class", 'flickr_hideArrow');
        }
    };

    var checkArrowSideNext = function(){
        if (cp === tp) {
            $flickrSideNextPagging.attr("class", 'flickr_hideArrow');
        }
        $flickrSidePrevPagging.attr("class", "flickr_showArrow");
    };

    var nextImagesSide = function(){
        $('li', $flickSidebar).slice((cp - 1) * 4, ((cp * 4))).hide();
        $('li', $flickSidebar).slice(cp * 4, (((cp + 1) * 4))).show();
        cp = cp + 1;
        $flickrSidePagging.html(cp);
        checkArrowSideNext();
    };

    var prevImagesSide = function(){
        $('li', $flickSidebar).slice((cp - 1) * 4, ((cp * 4))).hide();
        $('li', $flickSidebar).slice((cp - 2) * 4, (((cp -1) * 4))).show();
        cp = cp -1;
        $flickrSidePagging.html(cp);
        checkArrowSidePrev();
    };
 

    var cp = 1;
    var tp = 1;
    var firstdrop = true;
    /**
     * This function will check if more than 5 images are dropped
     * If there are more than 5 images dropped, they only the last 5 will be shown
     */
    var checkAmountImages = function(){
    var shownImages = 0;
    var lastitem;
        if (($("li", $flickSidebar).length > ((cp * 4)))) {
            if (cp === tp) {
                $('li', $flickSidebar).slice((cp - 1) * 4, ((cp * 4))).hide();

                var pageObject = {
                    'page': "",
                    'pages': ""
                };

                if (firstdrop) {
                    pageObject.page = cp;
                    pageObject.pages = tp + 1;
                    $flickrSidePaging.append($.TemplateRenderer($flickrSideGalleryPaggingTemplate, pageObject));
                    $flickrSideNextPagging = $('#flickr_side_next_pagging', rootel);
                    $flickrSidePrevPagging = $('#flickr_side_prev_pagging', rootel);
                    $flickrSideNextPagging.click(nextImagesSide);
                    $flickrSidePrevPagging.click(prevImagesSide);
                    firstdrop = false;
                }
                
                $flickrSidePages = $("#flickr_side_pages", rootel);
                $flickrSidePagging = $('#flickr_side_pagging', rootel);
                cp = cp + 1;
                tp = tp + 1;
                $flickrSidePages.html(tp);
                $flickrSidePagging.html(cp);
                checkBothArrowsSide();
            }else{
                $('li', $flickSidebar).each(function(){
                    if($(this).css("display") !== "none"){
                        shownImages = shownImages  + 1;
                        $lastitem = $(this);
                    }
                });
                if((shownImages-1) %4 ===0){
                    //$('li', $flickSidebar).slice((cp - 1) * 4, ((cp * 4))).hide();
                    $lastitem.hide();
                }
            }
        }
    };

    /**
     * This function will add plug-ins to the image gallery
     * @param {Object} imageGallery, an imagegallery
     */
    var addPluginsToGallery = function(imageGallery){

        // Get the current amount of pages, this is calculated by getting the previous totalImages - the amount of images that have been dragged and dropped, devided by 5
         totalPages = Math.round((((totalImages - dragged)+ 2) / 5));

        // Display a tooltip when the user goes over the images
        $("li",imageGallery).easyTooltip({
            tooltipId: "flickr_tooltip",
            content: $flickrTooltipText.html()
        });

        // This enables the user to drag an image from the image gallery to the sidebar
        $('ul',imageGallery).sortable(sortableObject.horizontal);

         // Remove the drop down image when the first picture is dropped
         $('ul',imageGallery).bind("sortremove", function(event, ui){
             droppedImage(event,ui,imageGallery);
             checkAmountImages();
        });
    };

    /**
     * This function will hide the currentimages and show the next five
     * @param {Object} gallery, an imagegallery
     * @param {Object} curPage, the current page
     */
    var showNextImages = function(gallery, curPage){

        // Hide the current image
        $("img",gallery).slice((curPage - 1) * imgPerPage, (curPage * imgPerPage)).hide();

        //Show the next 5 images
        $("img",gallery).slice((curPage * imgPerPage), ((curPage + 1) * imgPerPage)).show();

    };


    ////////////////////////
    // None-reusable code //
    ////////////////////////


    var setCurrentPageKey = function(){

        currentPageKey = currentPageKey + 1;
        $flickrKeyPaggingInput = $('#flickr_key_pagging_input',rootel);
        $flickrKeyPaggingInput.val(currentPageKey);
        //checkArrowNext();
    };

    /**
     * 
     * @param {Object} data, The response gotten from the ajax call
     */
    var appendNextImages = function(data){

        //Render the image gallery
        $flickrKeyGallery.children('ul').append($.TemplateRenderer($flickrImageGalleryTemplate, makeImageGallery(data)));

        //This function will hide the currentphotos and show the next ones
        showNextImages($flickrKeyGallery, currentPageKey);

        //show the recently loaded images
        $flickrKeyGallery.find('img').slice(((currentPageKey + 1) * 5), ((currentPageKey + 2) * 5)).hide();

        //Set the currentpage in the textbox
        setCurrentPageKey();
    };

    /**
     * This function will make the ajax call to get the pictures
     * @param {Object} tags , the value of the textbox
     * @example getPicturesByKeyAjaxCallNew("flower");
     */
    var getPicturesByKeyAjaxCallNew = function(tags,per_page,page){
        var media = "photo"; // only requesting pictures

        //Get the value from the inputbox
        $.ajax({
            url: sakai.config.URL.flickrGetPhotosBySearchTerm,
            success: function(data){

                appendNextImages(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at getting the pictures by tag");
            },
            data: {
                "key": key,
                "media": media,
                "per_page": per_page,
                "page":page,
                "tags": tags
            }
        });
    };

    /**
     * This function will check if the next arrow should be hidden in the 2nd accordeon div
     */
    var checkNextArrowKey = function(){

        if (currentPageKey >= totalKeyPages) {
            $flickrNextPaggingKey.attr("class", 'flickr_hideArrow');
        }

        //Show the next arrow,because this  function is executed everytime the user presses previous
        $flickrPrevPaggingKey.attr("class", "flickr_showArrow");
    };

    /**
     *  This function will check if the previous arrow should be hidden in the 2nd accordeon div
     */
    var checkPreviousArrowKey = function(){
        if (currentPageKey <= 1) {
            $flickrPrevPaggingKey.attr("class", 'flickr_hideArrow');
        }

        //Show the next arrow,because this  function is executed everytime the user presses previous
        $flickrNextPaggingKey.attr("class", "flickr_showArrow");
    };


    /**
     * This function gets executed when the user clicks on the next arrow
     * @param {Integer} page
     * @param {Integer} pages
     * @example prevImagesKey(1,200)
     */
    var prevImagesKey = function(page, pages){
    
        //Hide the images that were just shown
        $('img', $flickrKeyGallery).slice(((currentPageKey - 1) * 5), ((currentPageKey) * 5)).hide();

        //Show the next 5 images
        $('img', $flickrKeyGallery).slice(((currentPageKey - 2) * 5), ((currentPageKey - 1) * 5)).show();

        //Set the current page
        $('#flickr_pagging_input', rootel).val(currentPage - 1);
        currentPageKey = currentPageKey - 1;

        //Check if the previous arrow should be hidden
        checkPreviousArrowKey();

        $flickrKeyPaggingInput = $('#flickr_key_pagging_input', rootel);
        $flickrKeyPaggingInput.val(currentPageKey);
        
    };

    /**
     * This function will append the received images to the gallery
     * @param {Object} data, The response gotten from the ajax request
     */
    var appendNextImagesKey = function(data){

        //Render the image gallery
        $('ul',$flickrKeyGallery).append($.TemplateRenderer($flickrImageGalleryTemplate, makeImageGallery(data)));

        //Hide the just rendered images
        $('img',$flickrKeyGallery).slice((currentPageKey * imgPerPage), ((currentPageKey + 1) * imgPerPage)).hide();
    };

    /**
     * This function will request new images, when the user clicks on next
     * @param {Integer} per_page
     * @param {Integer} page
     * @example requestNewImagesKey(5,24)
     */
    var requestNewImagesKey = function(per_page,page){

        var media = "photo"; // only requesting pictures

        $.ajax({
            url: sakai.config.URL.flickrGetPhotosBySearchTerm,
            success: function(data){
                newPageKey = newPageKey + 1;
                appendNextImagesKey(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at getting the pictures by tag");
            },
            data: {
                "key": key,
                "media": media,
                "per_page": 5,
                "page":newPageKey,
                "tags": tagsGlob
            }
        });
    };

    /**
     * This function will be executed when an image is dropped
     */
    var shiftImageKey = function(){

        // An image is dropped so the dragged is incremented
        draggedKey = draggedKey + 1;

        // When an image is removed from the gallery a new one is added
        // This if checks if the image that has to be added exists, or if the user is on the last page
        if (currentPageKey !== totalKeyPages) {
            if ($('li', $flickrKeyGallery).slice((currentPageKey * 5) - 1, (currentPageKey * 5)).find("img").length) {
            
                // The new image is displayed
                $('li', $flickrKeyGallery).slice((currentPageKey * 5) - 1, (currentPageKey * 5)).find("img").show();
                
                //New total pages is calculated and displayed in the html
                totalKeyPages = Math.round(((totalImagesKey - draggedKey) / 5));
                
                // If the user is on page 0 he should be on page 1
                totalKeyPages = (totalKeyPages === 0) ? 1 : totalKeyPages;
                $flickrPage = $("#flickr_page", rootel);
                $flickrPage.html(totalPages);
                
                // If there is no image to add, a new request should be done
            }
            else {
                requestNewImagesKey();
            }

            // If there is only 1 page left, no images should be shown
            //checkBothArrows();
        }
    };


    /**
     * This function will be executed when clicking on next, it will check if new images should be requested
     * @param {Object} page
     * @param {Object} pages
     * @example nextImagesKey(5,10)
     */
    var nextImagesKey = function(page, pages){
        // Check if the user is currently on a page that has 2 pages in front of it or on the last page
        if ((($('img', $flickrKeyGallery).slice(((currentPageKey + 1) * 5), ((currentPageKey + 2) * 5)).length) && (($('img', $flickrKeyGallery).slice(((currentPageKey) * 5), ((currentPageKey + 1) * 5))).length)) || (currentPageKey + 1 === totalPages)) {

            // This function will hide the currentphotos and show the next ones
            showNextImages($flickrKeyGallery, currentPageKey);

            // Set the currenpage
            setCurrentPageKey();

            // Check if the user is on the last page
        }
        else 
            if (($('img', $flickrKeyGallery).slice(((currentPageKey) * 5), ((currentPageKey + 1) * 5))).length) {

                // Get new images, this has to be +2 because the next 5 images are allready on the page.
                getPicturesByKeyAjaxCallNew(tagsGlob,5, newPageKey);

                //New page has to be incremented
                newPageKey = newPageKey + 1;
            }
         checkNextArrowKey();
    };

    /**
     * Add the plugins to the image gallery in the second accordeon div
     */
    var bindPluginsKey = function(page,pages){

        // Display a tooltip when the user goes over the images
        $('li', $flickrKeyGallery).easyTooltip({
            tooltipId: "flickr_tooltip",
            content: $flickrTooltipText.html()
        });

        // This enables the user to drag an image from the image gallery to the sidebar
        $("ul", $flickrKeyGallery).sortable(sortableObject.horizontal);

        //Remove the drop down image when the first picture is dropped
        $('ul', $flickrKeyGallery).bind("sortremove", function(event, ui){
            removeDropNowImage();
            shiftImageKey();
            checkAmountImages();
        });

         //Recash the divsm since they've just been rendered
         $flickrPrevPaggingKey = $("#flickr_person_prev_key_pagging",rootel);
         $flickrNextPaggingKey = $("#flickr_person_key_next_pagging",rootel);

         //Check the if the previous image should be hidden
         checkPreviousArrowKey();

        //bind the clicks on the next and previous arrow
        $flickrNextPaggingKey.click(function(){
            nextImagesKey(page, pages);
        });
        $flickrPrevPaggingKey.click(function(){
            prevImagesKey(page, pages);
        });
    };

     /**
     * Reset the gallery
     * @param {Object} gallery, an image gallery
     * @param {Object} paging, the pagging div
     */
    var resetGalleryKey = function(gallery,paging){
        var object = {};
        gallery.html($.TemplateRenderer($flickrResetTemplate,object));
        paging.empty();
        totalKeyPages = 0;
        currentPageKey = 0;
        newPageKey =  3;
        draggedKey = 0;
    };


    /**
     * This function will display the requested pictures and put them in a sortable list
     * @param {Object} pictures This is json where you can find all the requested pictures
     */
    var displayPhotos = function(pictures){

        //Show the refreshbutton
        $flickrRefreshKeyButton.show();

        //Reset the image gallery
        resetGalleryKey($flickrKeyGallery,$flickrKeyPagging);

        //Because we got all the images now , we can hide the ajax loader
        $flickrLoadingImage.hide();

        //Render the image gallery
        $('ul', $flickrKeyGallery).append($.TemplateRenderer($flickrImageGalleryTemplate, makeImageGallery(pictures)));

        // Convert the data into an object so that the pages can be read
        var imageGalleryObjectKey = $.evalJSON(pictures);

        // The currentpage is 1 since there are 10 images now
        currentPageKey = 1;

        //Get the totaal amount of pages
        var pagesKey = {
            "pages": imageGalleryObjectKey.photos.pages * 2 
        };

        totalImagesKey = imageGalleryObjectKey.photos.total;

        totalKeyPages = pagesKey.pages;

        //Render pagging
        $flickrKeyPagging.html($.TemplateRenderer($flickrKeyGalleryPaggingTemplate, pagesKey));

         $('img', $flickrKeyGallery).hide();

        //Show the first 5 images
        $('img', $flickrKeyGallery).slice((currentPageKey - 1) * imgPerPage, (currentPageKey * imgPerPage)).fadeIn(1500);

        bindPluginsKey( imageGalleryObjectKey.photos.page,pagesKey);
    };

    /**
     * If the user is on the last page, the next arrow should be shown
     */
    var checkArrowNext = function(){

        //Check if the current page is equal to the total amount of pages
        if (currentPage >= totalPages) {

            //Hide the next arrow
            $("#flickr_person_next_pagging", rootel).attr("class", 'flickr_hideArrow');
        }

        //Show the previous arrow,because this  function is executed everytime the user presses next
        $("#flickr_person_prev_pagging", rootel).attr("class", "flickr_showArrow");
    };

    /**
     * If the user is on the firstpagem the previous arrow shouldn't be shown
     */
    var checkArrowPrev = function(){

        //If the currentpage is 1, there shouldn't be a previous arrow
        if(currentPage <= 1){
            $("#flickr_person_prev_pagging",rootel).attr("class",'flickr_hideArrow');
        }

        //Show the next arrow,because this  function is executed everytime the user presses previous
        $("#flickr_person_next_pagging",rootel).attr("class","flickr_showArrow");
    };

    /**
     * This function sets the currentPage (when clicking next or previous)
     */
    var setCurrentPage = function(){

        //Increment the currenpage
        currentPage = currentPage + 1;
        $('#flickr_pagging_input', rootel).val(currentPage);

        //Check if the next arrow should be hidden
        checkArrowNext();
    };

    /**
     * When the user clicks on the previous button, no new images should be loaded
     * So that's why it's in another function. 
     * The previous 5 images get shown
     * The current images that are displayed during the click will be hidden
     */
    var goPrevious = function(){

        //For example:
        //    H          S              H
        // ||01234|| ||56789|| ||10 11 12 13 14||
        //   page1     page2         page3
        //          Previous click
        //     S         H              H
        // ||01234|| ||56789|| ||10 11 12 13 14||
        //  page1      page2       page3
        
        //So the range from 0 -4  has to be shown so slice(((currentPage - 1) * 5), ((currentPage ) * 5)) will slice from the 5th element till the 10th element
        // and slice(((currentPage - 2) * 5), ((currentPage - 1) * 5)) will slice from the 0th element till the 5th element

        //Hide the images that were just shown
        $('img',$flickrKeyPersonGallery).slice(((currentPage - 1) * 5), ((currentPage ) * 5)).hide();

        //Show the next 5 images
        $('img',$flickrKeyPersonGallery).slice(((currentPage - 2) * 5), ((currentPage - 1) * 5)).show();

        //Set the current page
        $('#flickr_pagging_input', rootel).val(currentPage - 1);
        currentPage = currentPage - 1;

        //Check if the previous arrow should be hidden
        checkArrowPrev();
    };

    
    /**
     * This function is will display the image gallery the first time, this is done with 10 pictures
     * @param {Object} data, the response gotten from the ajax call
     */
    var showPicturesFromPersonStart = function(data){

        //Show the refresh button
        $flickrRefreshImages.show();

        // Hide the error if there's one
        $flickrNoPublic.hide();

        // Hide the ajax loader
        $flickrLoadingPersonImage.hide();

        // Convert the data into an object so that the pages can be read
         imageGalleryObject = $.evalJSON(data);

        // The currentpage is 1 since there are 10 images now
        currentPage = 1;

        //Get the totaal amount of pages
        var pages = {
            "pages": imageGalleryObject.photos.pages * 2 
        };

         //Get the total amount of images from the response
        totalImages = imageGalleryObject.photos.total;

        //Check if the user has public pictures, if not display an error
        if (parseInt(totalImages,10)) {

            //Render the paging for the gallery
            $flickrPersonPagging.html($.TemplateRenderer($flickrPersonGalleryPaggingTemplate, pages));

            //Render the image gallery
            $flickrKeyPersonGallery.children('ul').append($.TemplateRenderer($flickrImageGalleryTemplate, makeImageGallery(data)));

            //Bind all the items that have just been rendered
            bindPaging(imageGalleryObject.photos.page, pages);

            addPluginsToGallery($flickrKeyPersonGallery);

            //Hide all the images
            $('img',$flickrKeyPersonGallery).hide();

            //Show the first 5 images
            $('img',$flickrKeyPersonGallery).slice((currentPage - 1) * imgPerPage, (currentPage * imgPerPage)).fadeIn(1500);
        }
        else {
            $flickrNoPublic.show();
        }
    };


    /**
     * Render the image gallery in the first accordeon div
     * @param {Object} data, the response gotten from an ajax call
     */
    var showPicturesFromPerson = function(data){

        //Convert the data into an object so that the pages can be read
        imageGalleryObject = $.evalJSON(data);

        //Render the image gallery
        $flickrKeyPersonGallery.children('ul').append($.TemplateRenderer($flickrImageGalleryTemplate, makeImageGallery(data)));

        //This function will hide the currentphotos and show the next ones
        showNextImages($flickrKeyPersonGallery, currentPage);

        //show the recently loaded images
        $flickrKeyPersonGallery.find('img').slice(((currentPage + 1) * 5), ((currentPage + 2) * 5)).hide();

        //Set the currentpage in the textbox
        setCurrentPage();
    };


    /**
     * This function will do an ajax call to get the public pictures of a person
     * @param {Object} userid
     * @param {Integer} page
     * @example getPicturesByUserId(48506601%40N03, 1);
     */
    var getPicturesByUserId = function(userid,page){

        // Ajax call to get the user details
        $.ajax({
            url: sakai.config.URL.flickrGetPicturesByUserId ,
            success: function(data){

                // Get the pictures based on the userid
                showPicturesFromPerson(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at the initial request for pictures");
            },
            data: {
                "userid": userid,
                "api_key":key,
                "page":page
            }
        });
    };

    /**
     * This function will bind all the events of the recently rendered paging
     * @param {Integer} page, the currentpage
     * @param {Integer} pages, the totalamount of pages
     */
     bindPaging = function(page,pages){

        // Set a global variable pages, so it can be used everywhere
        allPages = pages;

        // Binding of the previous arrow
        $('#flickr_person_prev_pagging',rootel).click (function(){
            goPrevious(page);
        });

        // Binding of the next arrow
        $('#flickr_person_next_pagging',rootel).click(function(){

            // Check if the user is currently on a page that has 2 pages in front of it or on the last page
            if ((($('img',$flickrKeyPersonGallery).slice(((currentPage + 1)*5), ((currentPage + 2)*5)).length)&&(($('img',$flickrKeyPersonGallery).slice(((currentPage) * 5), ((currentPage + 1) * 5))).length))||(currentPage + 1 === totalPages)){

                // This function will hide the currentphotos and show the next ones
                showNextImages($flickrKeyPersonGallery,currentPage);

                // Set the currenpage
                setCurrentPage();

                // Check if the user is on the last page
            }else if(($('img',$flickrKeyPersonGallery).slice(((currentPage) * 5), ((currentPage + 1) * 5))).length){

                // Get new images, this has to be +2 because the next 5 images are allready on the page.
                getPicturesByUserId(userId,newPage );

                //New page has to be incremented
                newPage = newPage +1;
            }
        });

       // If the inputbox isn"t in focus it should be grey and should contain a default value
        $('#flickr_pagging_input',rootel).blur(function(){
            checkEmpty($('#flickr_pagging_input',rootel));
        });

        // If the textbox gets focussed change the colour of the text
        $('#flickr_pagging_input',rootel).focus(function(){
            changeColour($('#flickr_pagging_input',rootel));
        });

        //Since everything is rendered now, the previous arrow should be hidden
        checkArrowPrev();
    };

    /**
     * Reset the gallery
     * @param {Object} gallery, an image gallery
     * @param {Object} paging, the pagging div
     */
    var resetGallery = function(gallery,paging){
        var object = {};
        gallery.html($.TemplateRenderer($flickrResetTemplate,object));
        paging.empty();
        allPages = 0;
        currentPage = 0;
        newPage = currentPage + 3;
        dragged = 0;
    };


    /**
     * This function is only called at the initialization of the image gallery since it requests 10 pages
     * @param {Object} userId, the id of a user
     * @param {Object} page, the requested page
     * @example getPicturesByUserIdStart(48506601%40N03, 1);
     */
    var getPicturesByUserIdStart = function(userId,page){

        // Ajax call to get the user details
        $.ajax({
            url: sakai.config.URL.flickrGetPicturesByUserIdStart,
            success: function(data){

                // Get the pictures based on the userid
                showPicturesFromPersonStart(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at the initial request for pictures");
            },
            data: {
                "userid": userId,
                "api_key":key,
                "page":page
            }
        });
    };

    /**
     * This function will get the pictures from the user stored in the user details
     * @param {Object} userDetails, an object that contains all the userdetails
     */
    var getPicturesFromPerson = function(userDetails){

        //Save the data in a global variable since it has to be re-used later
        userDetailGlob = userDetails;

        //Reset the image gallery
        resetGallery($flickrKeyPersonGallery,$flickrPersonPagging);

        // Convert the userDetails to an object
        var userObject = $.evalJSON(userDetails);

        //Check if the user has been found, if not and error will be shown else the pictures will be shown
        if (userObject.stat === "fail") {

            //Hide the image loader since there's an error
            $flickrLoadingPersonImage.hide();

            //Show the error
            $flickrNoPersonError.show();
        }
        else {

            //Store the value of the userid in a global variable so when paging it hasn't got to be requested again
            userId = userObject.user.id;

            // Get the pictures of the user
            getPicturesByUserIdStart(userId, 1);
        }
    };

    /**
     * This function will do an ajax call to the flickr api to get the user details based on the name
     * @param {String} name
     * @example getPicturesByName("Olivier");
     */
    var getPicturesByName = function(name){

        // Ajax call to get the user details
        $.ajax({
            url: sakai.config.URL.flickrGetUserDetailsByName,
            success: function(data){

                // Get the pictures based on the userid
                getPicturesFromPerson(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at getting the userdetails");
            },
            data: {
                "api_key": key,
                "name":name
            }
        });
    };

    /**
     * This function will do an ajax call to the flickr api to get the user details based on the e-mail
     * @param {String} email
     * @example getPicturesByEMail("olivier_j@hotmail.com");
     */
    var getPicturesByEMail = function(email){

        // Ajax call to get the user details
        $.ajax({
            url: sakai.config.URL.flickrGetUserDetailsByEMail,
            success: function(data){

                //Get the pictures based on the userid
                getPicturesFromPerson(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at getting the user details");
            },
            data: {
                "api_key": key,
                "email":email
            }
        });
    };

    /**
     * This funtion will check if the given string is a valid e-mail
     * @param {String} str
     * @example getPicturesByEMail("olivier_j@hotmail.com");
     */
    function isEmail(str){

        // Check if the string contains a "." and a "@"
        return (str.indexOf(".") > 2) && (str.indexOf("@") > 0);
    }

    /**
     * 
     * @param {String} input , input of the textbox
     * @example getPicturesByNameOrEmailCheck("olivier_j@hotmail.com");
     */
    var getPicturesByNameOrEmailCheck = function(input){

        //If there's an error hide it
        $flickrNoPersonError.hide();

        //Show the ajax loader
        $flickrLoadingPersonImage.show();
        $flickrRefreshImages.show();

        // Check if the given string is an e-mail or a name
        if(isEmail(input)){

            // The input is an e-mail, so here an ajax call is done to get the userId by e-mail
            getPicturesByEMail(input);

        }else{

            // The input is a name, so here an ajax call is done to get the userId by name
            getPicturesByName(input);
        }
    };

    /**
     * This function will make the ajax call to get the pictures
     * @param {Object} tags , the value of the textbox
     * @example getPicturesByKeyAjaxCall("flower");
     */
    var getPicturesByKeyAjaxCall = function(tags,per_page){
        var media = "photo"; // only requesting pictures
        var page = 1;

        // Show the ajaxloader
        $flickrLoadingImage.show();

        //Get the value from the inputbox
        $.ajax({
            url: sakai.config.URL.flickrGetPhotosBySearchTerm,
            success: function(data){
            
                //If the token is received change the ui
                displayPhotos(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at getting the pictures by tag");
            },
            data: {
                "key": key,
                "media": media,
                "per_page": per_page,
                "tags": tags,
                "page" : page
            }
        });
    };

    /**
     * This function will show the necessairy errors when wrong input is given, else it will call a function to make an ajax call
     */
    var getPicturesByNameorEmail = function(){

        $flickrRefreshImages.hide();

        //Hide the error of there's one
        $flickrInputPersonError.hide();
        $flickrInputPersonSameError.hide();

        // Get the searchterm and see if it's empty
        var name = $flickrSearchPersonInput.val();

         //If the value of the textbox is still 'search' it can't be submitted
        if (name === defaultvalue) {
            $flickrInputPersonSameError.show();
        }
        else 
            if (name) {

                //Ajax call to get the images
                getPicturesByNameOrEmailCheck(name);
            }
            else {
                $flickrInputError.show();
            }
    };

    /**
     * This function will request pictures that are tagged with the keyword the user has entered
     */
    var getPicturesByKey = function(){

        // Hide the error (if there's one)
        $flickrInputError.hide();
        $flickrInputSameError.hide();
        
        // Get the searchterm and see if it's empty
        var tags = $flickrSearchInput.val();

        //Set the global variable tags, so it can be used during the paging
        tagsGlob = tags;

        //If the value of the textbox is still 'search' it can't be submitted
        if (tags === defaultvalue) {
            $flickrInputSameError.show();
        }
        else 
            if (tags) {

                //Ajax call to get the images
                getPicturesByKeyAjaxCall(tags,10);
            }
            else {
                $flickrInputError.show();
            }
    };

    /**
     * Make sure that the sidebar can be dragged to and that it"s an image gallery
     */
    var initializeSideBar = function(){
        $flickSidebar.children("ul").sortable(sortableObject.vertical);
    };

    /**
     * Refresh the imagegallery in the first image gallery
     */
    var refreshGallery = function(){
        getPicturesFromPerson(userDetailGlob);
        $flickrRefreshImages.hide();
    };

    /**
     * Refresh the image gallery in the 2nd accordeon
     */
    var refreshKeyGallery = function(){
        getPicturesByKeyAjaxCall(tagsGlob,10);
    };

    /**
     * This function will be executed after the data is saved
     */
    var closeContainer = function(){
         sdata.container.informFinish(tuid);
    };

    /**
     * This function will save the pictures to jcr
     */
    var savePictures = function(json){
        sakai.api.Widgets.saveWidgetData(tuid, json, closeContainer);
    };

    /**
     * This function is called when the user clicks on finish
     */
    var submitData =function(){
        var picturesObject = {};

        // Get all images from the sidebar
        $("img",$flickSidebar).each(function(){
            var pictureObject = {
                "url": '',
                "title": '',
                "photoid":$(this).attr('src').split('/')[4].split("_")[0]
            };
            pictureObject.url = $(this).attr('src');
            pictureObject.title = $(this).attr('title');
            var id = $(this).attr('src').split('/')[4].split("_")[0]+"_"+$(this).attr('src').split('/')[4].split("_")[1];
            picturesObject[id]=pictureObject;
        });

        //Save the object
        savePictures(picturesObject);
    };

    /**
     * This function will bind the focus,blur and click events on the init of the widget for the second accordeon div
     */
    var bindEventsFirstAccordeon = function(){

        //Bind the search button in the first accordeon
        $flickrSearchPersonKeyButton.click(getPicturesByNameorEmail);

        //If the inputbox isn"t in focus it should be grey and should contain a default value
        $flickrSearchPersonInput.blur(function(){
            checkEmpty($flickrSearchPersonInput);
        });

        //If the textbox gets focussed change the colour of the text
        $flickrSearchPersonInput.focus(function(){
            changeColour($flickrSearchPersonInput);
        });

        //The click functionality so that the user can refresh the gallery
        $flickrRefreshImages.click(refreshGallery);

        $flickrfinishSettings.click(submitData);
    };

    /**
     * This function will bind the focus,blur and click events at the init of the widget for the first accordeon div
     */
    var bindEventsSecondAccordeon = function(){

        //Bind the settings cancel button
        $flickrCancelSettings.click(finishSettingsContainer);

        //Bind the search button
        $flickrSearchKeyButton.click(getPicturesByKey);

        //If the inputbox isn"t in focus it should be grey and should contain a default value
        $flickrSearchInput.blur(function(){
            checkEmpty($flickrSearchInput);
        });

        //If the textbox gets focussed change the colour of the text
        $flickrSearchInput.focus(function(){
            changeColour($flickrSearchInput);
        });

        $flickrRefreshKeyButton.click(refreshKeyGallery);
    };

    /**
     * 
     * @param {Object} data This is the response from the ajax call, to get the images
     */
    var appendToSideBar = function(data){

        //Convert the data to an object
        var imgObject = $.evalJSON(data);

        //Give the object a key to render it
        var pictures = {
            "all":imgObject
        };

        //remove the drop now image
        $($flickrDropHereImage,$flickSidebar).remove();

        //Render the images in the sidebar
        $("ul", $flickSidebar).append($.TemplateRenderer($flickrImageGalleryPreviewTemplate, pictures));
        $("ul", $flickSidebar).hide();
        $("ul", $flickSidebar).fadeIn(2000);
    };

    /**
     * This function will get the images for in the sidebar
     */
    var getPreviousImage = function(){

        //Get the saved images
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){

            if (success) {
                appendToSideBar(data);
            }
            else {
                fluid.log('Error retrieving flickr data for the sidebar');
            }
        });
    };

    /**
     * This function will initialize the settingscontainer
     */
    var showSettingsContainer = function(){

            $flickrRefreshImages.hide();
            $flickrRefreshKeyButton.hide();
            
            //Show the entire flickr container
            $flickrContainer.show();
            
            // Hide the ajax loader
            $flickrLoadingImage.hide();
            
            //Initialize the sidebar
            initializeSideBar();
            
            //Get the default value of the inputbox
            defaultvalue = $flickrSearchInput.val();
            
            //Bind the click,blur and focus events
            bindEventsFirstAccordeon();
            
            //Bind the click,blur and focus events
            bindEventsSecondAccordeon();
            
            //Appy the accordion plugin on the page
            $flickrAccordion.accordion({
                clearStyle: true,
                alwaysOpen: false,
                active: true
            });

            //Get the saved images if there are any
            getPreviousImage();
    };
    /**
     * Check If the Previous arrow in the preview should be hidden
     * @param {Object} pages
     */
    var checkPreviousArrowPreview = function(){

        //Check if the current page is smaller or equal to 1, if it is bigger or equal to 1 hide it
        if (curP <= 1) {
            $flickrPersonPreviewPrevPagging.attr('class', 'flickr_hideArrow');
        }

        //Show the Next arrow
         $flickrPersonPreviewNextPagging.attr('class','flickr_showArrow');
    };

    var checkBothArrowsPreview = function(pages){

        //Check if there is only 1 page, if there's only 1 page, hide both arrows
        if (curP <= 1) {
            $flickrPersonPreviewPrevPagging.attr('class', 'flickr_hideArrow');
        }
        if (curP >= pages.pages) {
            $flickrPersonPreviewNextPagging.attr('class', 'flickr_hideArrow');
        }
    };

    /**
     * Check if the Next arrow should be hidden in the preview view
     */
    var checkNextArrowPreview = function(pages){

        //Check if the currentpage is equal or bigger than the total amount of pages, if it is  then hide the next arrow
        if (curP >= pages.pages) {
            $flickrPersonPreviewNextPagging.attr('class', 'flickr_hideArrow');
        }

        //Show the previous arrow
        $flickrPersonPreviewPrevPagging.attr('class','flickr_showArrow');
    };

    /**
     * This function will be executed when the user clicks on the next arrow in the preview view
     */
    var nextPreview = function(gallery,pages,icons){

        // Hide the current image
        $("li",gallery).slice((curP - 1) * 6, (curP * 6)).hide();

        //Show the next 5 images
        $("li",gallery).slice((curP * 6), ((curP + 1) * 6)).fadeIn('slow');

        // Hide the current image
        $("li",icons).slice((curP - 1) * 6, (curP * 6)).hide();

        //Show the next 5 images
        $("li",icons).slice((curP * 6), ((curP + 1) * 6)).fadeIn('slow');

        curP = curP + 1;

        //Set the Currenpage
        $flickrPreviewPaggingInput.val(curP);

        //Check if the next arrow should be hidden
        checkNextArrowPreview(pages);
    };

    /**
     * This function will be executed when the user clicks on the prev arrow in the preview view
     */
    var prevPreview = function(gallery,pages,icons){

        //Hide the images that were just shown
        $('li',gallery).slice(((curP - 1) * 6), ((curP ) * 5)).hide();

        //Show the next 5 images
        $('li',gallery).slice(((curP - 2) * 6), ((curP - 1) * 6)).fadeIn('slow');

        //Hide the images that were just shown
        $('li',icons).slice(((curP - 1) * 6), ((curP ) * 5)).hide();

        //Show the next 5 images
        $('li',icons).slice(((curP - 2) * 6), ((curP - 1) * 6)).fadeIn('slow');

        curP = curP - 1;

        //Set the currentpage
        $flickrPreviewPaggingInput.val(curP, pages);

        //Check if the previous arrow should be shown
        checkPreviousArrowPreview();
    };

    /**
     * This function will calculate the correct total page.
     * @param {Object} pages The total amount of images
     */
    var getPages = function(pages){

        return Math.round(pages/5);
    };

    /**
     * This function will render the image gallery
     * @param {Object} data, the response from the ajax call
     */
    var makePreviewImageGallery = function(data){

        //Convert the data to an object
        var imagesObject = $.evalJSON(data);
        var imageArray = [];

        // Convert the object to an array
        for (var c in imagesObject) {
            if (imagesObject.hasOwnProperty(c)) {
                if (typeof(imagesObject[c]) === "object") {
                    imageArray.push(imagesObject[c]);
                }
            }
        }

        //Change the url for the images so a medium image will be displayed instead of a small one
        $(imageArray).each(function(){
          $(this)[0].url =  $(this)[0].url.replace('_s','_m');
        });


        var pictures = {
            "all": imageArray
        };

        // Get a JSON string that contains the necessary information.
        $("ul", $flickrPreviewGallery).append($.TemplateRenderer($flickrImageGalleryPreviewTemplate, pictures));

        //Render the extra info icons underneath the images
        $flickrPreviewGallery.append($.TemplateRenderer($flickrSlideshowIconTemplate, pictures));

        curP = 1;

        $flickrKeyUlPreview = $("#flickr_key_ul_preview",rootel);
        $flickrSlideshowImages = $("#flickr_slideshow_images",rootel);

        //Hide the last 5 images
        $('li', $flickrKeyUlPreview).hide();
        $('li', $flickrSlideshowImages).hide();

        //Show the first 5 images
        $('li', $flickrKeyUlPreview).slice((curP - 1) * imgPerPage, (curP * 6)).fadeIn('slow');
        $('li', $flickrSlideshowImages).slice((curP - 1) * imgPerPage, (curP * 6)).fadeIn('slow');

        var pages = {
            "pages": getPages(imageArray.length)
        };

        //Render the paging
        $flickrPreviewPagging.html($.TemplateRenderer($flickrPreviewGalleryPaggingTemplate,pages));

        // Recash the variables
        $flickrPersonPreviewNextPagging = $("#flickr_person_preview_next_pagging",rootel);
        $flickrPersonPreviewPrevPagging = $("#flickr_person_prev_preview_pagging",rootel);
        $flickrPreviewPaggingInput = $('#flickr_preview_pagging_input',rootel);

        //Bind the click events
        $flickrPersonPreviewNextPagging.click( function(){
            nextPreview($flickrKeyUlPreview,pages,$flickrSlideshowImages);
        });
        $flickrPersonPreviewPrevPagging.click(function(){
            prevPreview($flickrKeyUlPreview,pages,$flickrSlideshowImages);
        });

        //Check if the arrows should be shown
        checkPreviousArrowPreview();
        checkBothArrowsPreview(pages);

        //Add the galleria plugin
        $("#flickr_key_ul_preview",rootel).galleria({
            insert : '#flickr_displayed_image', //The div where the image will be appended to
            history   : false, //Setting this to false will prevent the gallery from showing the image in the url
            onImage   : function(image,caption,thumb) { // let's add some image effects for demonstration purposes

                // fade in the image & caption
                if(! ($.browser.mozilla && navigator.appVersion.indexOf("Win")!==-1) ) { // FF/Win fades large images terribly slow
                    image.css('display','none').fadeIn(500);
                }
                caption.css('display','none').fadeIn(500);

                // fetch the thumbnail container
                var li = thumb.parents('li');

                // fade out inactive thumbnail
                li.siblings().children('img.selected').fadeTo(500,0.6);

                // fade in active thumbnail
                thumb.fadeTo('fast',1).addClass('selected');


            },
            onThumb: function(thumb){ // thumbnail effects goes here
                // fetch the thumbnail container
                var li = thumb.parents('li');

                // if thumbnail is active, fade all the way.
                var fadeTo = li.is('.active') ? '1' : '0.6';

                // fade in the thumbnail when finnished loading
                thumb.css({
                    display: 'none',
                    opacity: fadeTo
                }).fadeIn(500);

                // hover effects
                thumb.hover(function(){
                    thumb.fadeTo('fast', 1);
                }, function(){
                    li.not('.active').children('img').fadeTo('fast', 0.6);
                } // don't fade out if the parent is active
                );
            }
        });

        //Set an image active, so it'll be shown big
        $($flickrKeyUlPreview.children()[0]).addClass('active');

    };

    var showPreview = function(){

        //Show the site view
        $flickrPreviewContainer.show();

        //Load the images
        sakai.api.Widgets.loadWidgetData(tuid, function(success, data){

            if (success) {
                makePreviewImageGallery(data);
            }
            else {
                fluid.log('Error retrieving flickr data');
            }
        });
    };

    /**
     * This function is the first function that will be executed on the page
     */
    var init = function(){

        if(showSettings){
            showSettingsContainer();
        }else{
            showPreview();
        }
    };
    init();
};
sdata.widgets.WidgetLoader.informOnLoad("flickr");