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
/*global Config, $, sdata ,fluid displayContacts addDelBtn window*/

var sakai = sakai || {};

/**
 * @name sakai.flickr
 *
 * @class flickr
 *
 * @description
 * Initialize the flickr widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
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
    var $flickrPaggingInput = $('#flickr_pagging_input', rootel);
    var $flickrContacts = $("#flickr_contacts",rootel);
    var $flickrTagCloud = $(".flickr_contacts_cloud",rootel);
    var $flickrTagCloudBox = $('#flickr_tag_cloud',rootel);
    var $flickrUserDetails = $('#flickr_user_details',rootel);
    var $flickrText = $('.flickr_txt',rootel);
    var $flickrTxtPrev = $(".flickr_txt_prev",rootel);
    var $flickrPreviousUser = $('#flickr_previous_user',rootel);
    var $flickrSeperation = $('.flickr_seperation',rootel);

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

    /* Preview elements */
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
    var $flickrDeleteButton = $('#flickr_delete_button',rootel);

    //Global variables
    var key = "93a86c06dc382a19bff0d4d24872ecab"; // An api key required fron flickr when registering the widget
    var defaultvalue; // The default value of the input box
    var sortableObject = {
        horizontal: {
            helper: "clone", // Instead of dragging the real image a copy will be dragged
            connectWith: ["#flickr_sidebar ul"], // To be able to drag and drop an image to another image gallery they need to be connected
            cursor: 'pointer', //change the cursor when dragging
            appendTo: 'body', //When dropped the images need to be appended to the image gallery where they are dropped
            containment: rootel, //Make sure the user can't drag the images outside the widget
            revert: true, // if the user releases the image ouside the dropbox it'll return to it's original position
            zIndex: 9999
        },
        vertical: {
            appendTo: 'body', //When dropped the images need to be appended to the image gallery where they are dropped
            cursor: 'pointer', //Change the cursor
            helper: 'clone', //Instead of dragging the original image, drag a copy
            containment: rootel, //The dragged image can't get out of the widget
            connectWith: ["#flickr_image_slider_ul"], // To be able to drag and drop an image to another image gallery they need to be connected
            zIndex: 9999
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
    var userDetail;
    var previousUser = {
        'username': "",
        'userid': ""
    };
    var contacts;
    var prevcontactsArr = [];
    var contactsCounter = 0;
    var previousCheck = false;


    // Global variables of the 2nd accordeon
    var userDetailGlob;// A global variable that contains the user details
    var newPageKey = 3; // This variable is used when requesing new images, since the 2 first pages are allready loaded, it has to start at 3
    var currentPageKey; // This variable contains the page the user is currently on 
    var tagsGlob; // This variable contains the tags that the user has given 
    var draggedKey = 0;
    var totalImagesKey = 0;
    var totalKeyPages;
    var imageGalleryObject;

    // Global variables of the sidebar
    var cp = 1;
    var tp = 1;
    var firstdrop = true;

    // CSS classes
    var flickrInvisible = "flickr_hideArrow";
    var flickrVisible = "flickr_showArrow";

    // Templates
    var $flickrPersonGalleryPaggingTemplate = $("#flickr_person_gallery_pagging_template");
    var $flickrImageGalleryTemplate = $('#flickr_image_gallery_template');
    var $flickrResetTemplate = $('#flickr_reset_gallery_template',rootel);
    var $flickrKeyGalleryPaggingTemplate = $("#flickr_key_gallery_pagging_template");
    var $flickrImageGalleryPreviewTemplate = $('#flickr_image_gallery_preview_template',rootel);
    var $flickrPreviewGalleryPaggingTemplate = $('#flickr_preview_gallery_pagging_template',rootel);
    var $flickrSideGalleryPaggingTemplate = $("#flickr_side_gallery_pagging_template",rootel);
    var $flickrContactsTemplate = $('#flickr_contacts_template',rootel);
    var $flickrTagCloudTemplate = $('#flickr_tag_cloud_template',rootel);
    var $flickrDetailButtonTemplate = $('#flickr_detail_button_template',rootel);
    var $flickrDetailButton = $('#flickr_detail_button',rootel);
    var $flickrImageGallerySideTemplate =$("#flickr_img_side_gallery",rootel);


    // Config urls
    sakai.config.URL.flickrGetPhotosBySearchTerm = "/var/proxy/flickr/flickrKeyPictures.json";
    sakai.config.URL.flickrGetUserDetailsByEMail = "/var/proxy/flickr/flickrGetUserDetailsByEMail.json";
    sakai.config.URL.flickrGetUserDetailsByName = "/var/proxy/flickr/flickrGetUserDetailsByName.json";
    sakai.config.URL.flickrGetPicturesByUserId = "/var/proxy/flickr/flickrGetPicturesByUserId.json";
    sakai.config.URL.flickrGetFriendsFromUser = "/var/proxy/flickr/flickrGetFriendsFromUser.json";
    sakai.config.URL.flickrStaticImageUrl = "http://farm3.static.flickr.com/";

    // Error messages
    var $flickrInputError = $("#flickr_input_error",rootel);
    var $flickrInputSameError = $("#flickr_input_same_error",rootel);
    var $flickrInputPersonError = $("#flickr_input_person_error",rootel);
    var $flickrInputPersonSameError = $("#flickr_input_same_person_error",rootel);
    var $flickrNoPersonError = $("#flickr_no_person_error",rootel);
    var $flickrNoPublic = $("#flickr_no_public",rootel);

    //////////////
    // SETTINGS //
    //////////////

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
        sakai.api.Widgets.Container.informCancel(tuid);
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
         if(textbox.val() === defaultvalue){
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

       if (typeof(pictures) !== "object") {
           pictures = $.parseJSON(pictures);
       }

        //Array for all the pictures
        var pictureUrlArray = [];

        //Give the object a key in an array so it"s easier to address
        var parsedPics = {
            all: pictures.photos.photo
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
     * This function will calculate the correct total page.
     * @param {Integer} pages The total amount of images
     * @param {Integer} total The number everything is compared to
     * @example getPagesCorrect(10,300)
     * @return the correct amount of total pages
     */
    var getPagesCorrect = function(pages,total){

        if (Math.round(pages / total) < pages / total) {
            if (Math.round(pages / total) === 1) {
                return 1;
            }
            else {
                return Math.round(pages / total) + 1;
            }
        }else{
            return Math.round(pages/total);
        }
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
                "page":newPage,
                'per_page':5
            }
        });
    };

    
    /**
     * This function will check if both arrows have to be hidden
     */
    var checkBothArrows = function(){

        if (currentPage <= 1) {
            $("#flickr_person_prev_pagging",rootel).attr("class", flickrInvisible);
        }

        //Check if the current page is equal to the total amount of pages
        if (currentPage >= totalPages) {

            //Hide the next arrow
            $("#flickr_person_next_pagging",rootel).attr("class", flickrInvisible);
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
                totalPages = getPagesCorrect((totalImages - dragged),5);

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


    /**
     * This function will check if the next arrow should be hiden of the paging in the sidebar
     */
    var checkArrowSideNext = function(){
        if (cp === tp) {
            $flickrSideNextPagging.attr("class", flickrInvisible);
        }
        $flickrSidePrevPagging.attr("class", flickrVisible);
    };

    /**
     * This function will hide the current images and show the next 4
     */
    var nextImagesSide = function(){
        $('li', $flickSidebar).slice((cp - 1) * 4, ((cp * 4))).hide();
        $('li', $flickSidebar).slice(cp * 4, (((cp + 1) * 4))).show();
        cp = cp + 1;
        $flickrSidePagging.html(cp);
        checkArrowSideNext();
    };

    /**
     * This function will check if the previous arrow should be hidden of the paging in the sidebar
     */
    var checkArrowSidePrev = function(){
        if (cp === 1) {
            $flickrSidePrevPagging.attr("class", flickrInvisible);
        }
        $flickrSideNextPagging.attr("class", flickrVisible);
    };


    /**
     * This function will hide the current images and show the previous 4
     */
    var prevImagesSide = function(){
        $('li', $flickSidebar).slice((cp - 1) * 4, ((cp * 4))).hide();
        $('li', $flickSidebar).slice((cp - 2) * 4, (((cp -1) * 4))).show();
        cp = cp -1;
        $flickrSidePagging.html(cp);
        checkArrowSidePrev();
    };


     /**
     * This function will check if the previous and next arrows should be hidden of the paging in the sidebar
     */
    var checkBothArrowsSide = function(){
        if (cp === 1) {
            $flickrSidePrevPagging.attr("class", flickrInvisible);
        }else{
            $flickrSidePrevPagging.attr("class", 'flickr_showArrow');
        }
        if (cp === tp) {
            $flickrSideNextPagging.attr("class", flickrInvisible);
        }else{
            $flickrSideNextPagging.attr("class", 'flickr_showArrow');
        }
        
    };


    /**
     * This function will check if more than 5 images are dropped
     * If there are more than 5 images dropped, they only the last 5 will be shown
     */
    var checkAmountImages = function(){
        var shownImages = 0;
        var $lastitem;

        //Check if there are more than 4 ,8 , 12, 16 etc images
        if (($("li", $flickSidebar).length > ((cp * 4)))) {

            //Check if the user is dropping images on the last page
            if (cp === tp) {

                //Since the user is on the last page and it has 4 images, the images should be hidden
                $('li', $flickSidebar).slice((cp - 1) * 4, ((cp * 4))).hide();

                //Make an object with the totalamount of pages and the current page torender in the html
                var pageObject = {
                    'page': "",
                    'pages': ""
                };

                //Check if it's the first time the user drops something, so at this point the user is on the last page so 1/1 and 4 images have been dropped
                if (firstdrop) {

                    //set the current & totalpage
                    pageObject.page = cp;
                    pageObject.pages = tp + 1;
                    $flickrSidePaging.append($.TemplateRenderer($flickrSideGalleryPaggingTemplate, pageObject));
                    $flickrSideNextPagging = $('#flickr_side_next_pagging', rootel);
                    $flickrSidePrevPagging = $('#flickr_side_prev_pagging', rootel);

                    //Bind the clicks
                    $flickrSideNextPagging.click(nextImagesSide);
                    $flickrSidePrevPagging.click(prevImagesSide);
                    firstdrop = false;
                }else{
                    $flickrSidePaging.show();
                }

                //Increment the total pages and currentpage,since 4 images have been dropped
                $flickrSidePages = $("#flickr_side_pages", rootel);
                $flickrSidePagging = $('#flickr_side_pagging', rootel);
                cp = cp + 1;
                tp = tp + 1;
                $flickrSidePages.html(tp);
                $flickrSidePagging.html(cp);
                checkBothArrowsSide();

            //If the user isn't on the last page
            }else{

                //Loop over all the images and check which are hidden
                $('li', $flickSidebar).each(function(){
                    if($(this).css("display") !== "none"){

                        //Check how many images are shown
                        shownImages = shownImages  + 1;

                        //Save the last item
                        $lastitem = $(this);
                    }
                });

                //If 4 images are dropped, not on the last page , the last item should be hidden
                if((shownImages-1) %4 ===0){
                    $lastitem.hide();
                    if($('li', $flickSidebar).length % 4 === 1){
                        tp = tp + 1;
                        $flickrSidePages.html(tp);
                    }
                }
            }
        }
    };

    /**
     * This function will remove the delete button if it exists>
     * This function is executed on the mouseout
     */
    var removeDeleteButton = function(){
        $flickrDeleteButton = $('#flickr_delete_button',rootel);
        if ($($flickrDeleteButton, $(this))) {
            $($flickrDeleteButton, $(this)).remove();
        }
    };

    /**
     * This function will add plug-ins to the image gallery
     * @param {Object} imageGallery, an imagegallery
     */
    var addPluginsToGallery = function(imageGallery){

        // Get the current amount of pages, this is calculated by getting the previous totalImages - the amount of images that have been dragged and dropped, devided by 5
         totalPages = getPagesCorrect((totalImages - dragged),5);

        // Display a tooltip when the user goes over the images
        /*$("li",imageGallery).easyTooltip({
            tooltipId: "flickr_tooltip",
            content: $flickrTooltipText.html()
        }); */

        // This enables the user to drag an image from the image gallery to the sidebar
        $('ul',imageGallery).sortable(sortableObject.horizontal);

         // Remove the drop down image when the first picture is dropped
         $('ul',imageGallery).bind("sortremove", function(event, ui){
             droppedImage(event,ui,imageGallery);
             checkAmountImages();
             $("li",$flickSidebar).hover(addDelBtn,removeDeleteButton);
        });
    };


    /**
     * This function is will display the image gallery the first time, this is done with 10 pictures
     * @param {Object} data, the response gotten from the ajax call
     */
    var showPicturesFromPersonStart = function(data){

        data = $.parseJSON(data);

        //Show the refresh button
        $flickrRefreshImages.show();

        // Hide the error if there's one
        $flickrNoPublic.hide();

        // Hide the ajax loader
        $flickrLoadingPersonImage.hide();

        // Clone the data object
        imageGalleryObject = $.extend(data, {}, true);

        // The currentpage is 1 since there are 10 images now
        currentPage = 1;

        //Get the totaal amount of pages
        var pages = {
            "pages": getPagesCorrect(imageGalleryObject.photos.total,5)
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

            $flickrPaggingInput =  $('#flickr_pagging_input', rootel);
        }
        else {
            $flickrNoPublic.show();
        }
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
            url: sakai.config.URL.flickrGetPicturesByUserId,
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
                "page":page,
                "per_page":10
            }
        });
    };

    /**
     * This function will request all the contacts from a user
     * @param {Object} userId
     */
    var requestContactFomUsers = function(usrId){
        userId = usrId;
        // Ajax call to get the user's contacts
        $.ajax({
            url: sakai.config.URL.flickrGetFriendsFromUser ,
            success: function(data){
                  displayContacts(data);
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at the request for contacts");
            },
            data: {
                "userid": userId,
                "api_key":key
            }
        });
    };

    /**
     * 
     * @param {Object} userId the id of a user
     * @example getPicturesFromPerson(48506601@N03)
     */
    var getPicturesFromPerson = function(userId){

        //Reset the image gallery
        resetGallery($flickrKeyPersonGallery, $flickrPersonPagging);

        // Get the pictures of the user
        getPicturesByUserIdStart(userId, 1);

        $flickrText = $('.flickr_txt', rootel);

        requestContactFomUsers(userId);
    };

    /**
     * Get the pictures from the previous user
     */
    var getPreviousUser = function(){

        //Set a boolean to true, to indiciate that user clicked on previous user
        previousCheck = true;

        //Check if the previous user exists
        if (prevcontactsArr[contactsCounter - 1].userid) {
            contactsCounter = contactsCounter - 1;
            getPicturesFromPerson(prevcontactsArr[contactsCounter].userid);
        }
    };


    /**
     * This function will get the pictures from the selected friend
     */
    var getPicturesFormContact = function(){

        previousCheck = false;

        //Recash the variable and get the username and userid
        $flickrText = $('.flickr_txt',rootel);
        previousUser = {
            'username': $('span', $flickrText).html(),
            'userid': $flickrText.attr('id').split('id')[1].replace('X','@')
        };

        //Put the previous user in an array
        prevcontactsArr[contactsCounter] = previousUser ;

        //Increment the contactsCounter, so if the user presses previous that he gets the right person
        contactsCounter = contactsCounter +1;

        //Get the current user
        userDetail = {
            'username' : $('a',this).html(),
            'userid' : $(this).attr("id").split('id')[1].replace('X','@')
        };

        //Get the pictures from the current user
        getPicturesFromPerson(userDetail.userid);

    };


    /**
     * This function will display the requested contacts form a person
     * @param {Object} data the response gotten form the ajax call
     */
     var displayContacts = function(data){

        data = $.parseJSON(data);

        //Set an object that will be used to rendered the template
        contacts = $.extend(data, {}, true);

        $(contacts.contacts.contact).each(function(){
            $(this)[0].nsid = $(this)[0].nsid.replace('@','X');
        });

        //Check if the user clicked on previous user
        if(previousCheck === true){

            //Fill in the necessairy data
            contacts.user = prevcontactsArr[contactsCounter].username;
            contacts.userid = prevcontactsArr[contactsCounter].userid.replace('@','X');
            contacts.prevusr = previousUser;

        //check if userDetail is empty (in this object you can find the current user details)
        }else if (!userDetail) {
            contacts.user = userDetailGlob.user.username._content;
            contacts.userid = userDetailGlob.user.nsid.replace('@','X');
            contacts.prevusr = previousUser;
        }
        else {
            contacts.user = userDetail.username;
            contacts.userid = userDetail.userid.replace('@','X');
            contacts.prevusr = previousUser;
        }
        $flickrContacts.html($.TemplateRenderer($flickrContactsTemplate, contacts));

        $flickrPreviousUser = $('#flickr_previous_user',rootel);
        $flickrSeperation = $('.flickr_seperation',rootel);

        //Check if only 1 person had been requested, then the previous user shouldn't be showm
        if(!contactsCounter){
            $flickrPreviousUser.hide();
            $flickrSeperation.hide();
        }else{
            $flickrPreviousUser.show();
            $flickrSeperation.show();
        }

        $flickrPreviousUser.click(getPreviousUser);

        //This part will loop over all the contacts and then make 3 uls from it
        var contactsArr = [];
        var uls = '';
        $(contacts.contacts.contact).each(function(index){
            contactsArr.push(contacts.contacts.contact[index]);
        });
        var ul = [];
        ul[0] = [];
        ul[1] = [];
        ul[2] = [];
        while (contactsArr.length > 5) {
            for (var i = 0, il = Math.ceil(contactsArr.length / 5); i < il; i = i +1) {
                for (var j = 0, jl = contactsArr.length; j < jl; j = j+1) {
                    if (j < 5) {
                        ul[i][j] = (contactsArr.shift());
                    }
                }
            }
        }

        $(ul).each(function(index){
            var test = {
                "all" : ul[index]
            };

            uls += $.TemplateRenderer($flickrTagCloudTemplate, test);
        });

        $flickrTagCloudBox.html(uls);
        $flickrUserDetails = $('#flickr_user_details',rootel);
        $flickrTagCloud = $(".flickr_contacts_cloud", rootel);
        $flickrTxtPrev = $('.flickr_txt_prev', rootel);
        $('li', $flickrTagCloud).click(getPicturesFormContact);
        
    };

    /**
     * This function will delete the image and show the next hidden image
     */
    var deleteImage = function(){

        var visibleItems = 0;
        var $lsttitem;

        // Delete the image
        $(this).parent().remove();

        //Get the last visible item
        $('li', $flickSidebar).each(function(){
            if ($(this).css("display") !== "none") {
                //Save the last item
                visibleItems = visibleItems + 1;
                $lsttitem = $(this);
            }
        });

        if (visibleItems  !== 0) {
            //Show the image that is just after the last shown image
            $('li', $flickSidebar).slice($('li', $flickSidebar).index($lsttitem) + 1, $('li', $flickSidebar).index($lsttitem) + 2).show();
        }else{
            $('li', $flickSidebar).slice((cp - 2) * 4, (((cp - 1) * 4))).fadeIn(2000);
            cp = cp ===1 ?1: cp -1;
            $flickrSidePagging.html(cp);
        }

        tp = Math.round($('li', $flickSidebar).length/4) === 0 ? 1:getPagesCorrect($('li', $flickSidebar).length,4);
        if(!$('li', $flickSidebar).length){
            $flickrSidePaging.hide();
        }
        $flickrSidePages.html(tp);
        checkBothArrowsSide();
    };

    /**
     * This function is executed on the mouseover of an image in the sidebar 
     */
     var addDelBtn = function(){
        var emptyObject = {};
        $(this).append($.TemplateRenderer($flickrDeleteButton,emptyObject));
        $flickrDeleteButton = $('#flickr_delete_button',rootel);
        $($flickrDeleteButton,this).click(deleteImage);
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

    /**
     * This function will set the current page
     */
    var setCurrentPageKey = function(){

        currentPageKey = currentPageKey + 1;
        $flickrKeyPaggingInput = $('#flickr_key_pagging_input',rootel);
        $flickrKeyPaggingInput.html(currentPageKey);
    };

    /**
     * This function will append 5 new image to the gallery and then hide the current 5 (this is for the gallery in the 2nd accordion)
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
            $flickrNextPaggingKey.attr("class", flickrInvisible);
        }

        //Show the next arrow,because this  function is executed everytime the user presses previous
        $flickrPrevPaggingKey.attr("class", flickrVisible);
    };

    /**
     *  This function will check if the previous arrow should be hidden in the 2nd accordeon div
     */
    var checkPreviousArrowKey = function(){
        if (currentPageKey <= 1) {
            $flickrPrevPaggingKey.attr("class", flickrInvisible);
        }

        //Show the next arrow,because this  function is executed everytime the user presses previous
        $flickrNextPaggingKey.attr("class", flickrVisible);
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
        $flickrPaggingInput = $('#flickr_pagging_input', rootel);
        $flickrPaggingInput.html(currentPage - 1);
        currentPageKey = currentPageKey - 1;

        //Check if the previous arrow should be hidden
        checkPreviousArrowKey();

        $flickrKeyPaggingInput = $('#flickr_key_pagging_input', rootel);
        $flickrKeyPaggingInput.html(currentPageKey);
        
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
            dataType: "json",
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
                $('li', $flickrKeyGallery).slice((currentPageKey * 5) - 1, (currentPageKey * 5)).find("img").fadeIn(1000);

                //New total pages is calculated and displayed in the html
                totalKeyPages = Math.round(getPagesCorrect(totalImagesKey - draggedKey),5);

                // If the user is on page 0 he should be on page 1
                totalKeyPages = (totalKeyPages === 0) ? 1 : totalKeyPages;
                $flickrPage = $("#flickr_page", rootel);
                $flickrPage.html(totalPages);

                // If there is no image to add, a new request should be done
            }
            else {
                requestNewImagesKey();
            }
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
        /*$('li', $flickrKeyGallery).easyTooltip({
            tooltipId: "flickr_tooltip",
            content: $flickrTooltipText.html()
        });*/

        // This enables the user to drag an image from the image gallery to the sidebar
        $("ul", $flickrKeyGallery).sortable(sortableObject.horizontal);

        //Remove the drop down image when the first picture is dropped
        $('ul', $flickrKeyGallery).bind("sortremove", function(event, ui){
            removeDropNowImage();
            shiftImageKey();
            checkAmountImages();
            $("li",$flickSidebar).hover(addDelBtn,removeDeleteButton);
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

        if(typeof(pictures)!=='object'){
            pictures = $.parseJSON(pictures);
        }

        //Show the refreshbutton
        $flickrRefreshKeyButton.show();

        //Reset the image gallery
        resetGalleryKey($flickrKeyGallery,$flickrKeyPagging);

        //Because we got all the images now , we can hide the ajax loader
        $flickrLoadingImage.hide();

        //Render the image gallery
        $('ul', $flickrKeyGallery).append($.TemplateRenderer($flickrImageGalleryTemplate, makeImageGallery(pictures)));

        // The currentpage is 1 since there are 10 images now
        currentPageKey = 1;

        //Get the totaal amount of pages
        var pagesKey = {
            "pages": pictures.photos.pages * 2 
        };

        totalImagesKey = pictures.photos.total;

        totalKeyPages = pagesKey.pages;

        //Render pagging
        $flickrKeyPagging.html($.TemplateRenderer($flickrKeyGalleryPaggingTemplate, pagesKey));

         $('img', $flickrKeyGallery).hide();

        //Show the first 5 images
        $('img', $flickrKeyGallery).slice((currentPageKey - 1) * imgPerPage, (currentPageKey * imgPerPage)).fadeIn(1500);

        bindPluginsKey(pictures.photos.page,pagesKey);
    };

    /**
     * If the user is on the last page, the next arrow should be shown
     */
    var checkArrowNext = function(){

        //Check if the current page is equal to the total amount of pages
        if (currentPage >= totalPages) {

            //Hide the next arrow
            $("#flickr_person_next_pagging", rootel).attr("class", flickrInvisible);
        }

        //Show the previous arrow,because this  function is executed everytime the user presses next
        $("#flickr_person_prev_pagging", rootel).attr("class", flickrVisible);
    };

    /**
     * If the user is on the firstpagem the previous arrow shouldn't be shown
     */
    var checkArrowPrev = function(){

        //If the currentpage is 1, there shouldn't be a previous arrow
        if(currentPage <= 1){
            $("#flickr_person_prev_pagging",rootel).attr("class",flickrInvisible);
        }

        //Show the next arrow,because this  function is executed everytime the user presses previous
        $("#flickr_person_next_pagging",rootel).attr("class",flickrVisible);
    };

    /**
     * This function sets the currentPage (when clicking next or previous)
     */
    var setCurrentPage = function(){

        //Increment the currenpage
        currentPage = currentPage + 1;
        $flickrPaggingInput = 
        $flickrPaggingInput = $('#flickr_pagging_input', rootel);
        $flickrPaggingInput.html(currentPage);

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

        //Hide the images that were just shown
        $('img',$flickrKeyPersonGallery).slice(((currentPage - 1) * 5), ((currentPage ) * 5)).hide();

        //Show the next 5 images
        $('img',$flickrKeyPersonGallery).slice(((currentPage - 2) * 5), ((currentPage - 1) * 5)).show();

        //Set the current page
        $flickrPaggingInput = $('#flickr_pagging_input', rootel);
        $flickrPaggingInput.html(currentPage - 1);
        currentPage = currentPage - 1;

        //Check if the previous arrow should be hidden
        checkArrowPrev();
    };

    /**
     * Render the image gallery in the first accordeon div
     * @param {Object} data, the response gotten from an ajax call
     */
    var showPicturesFromPerson = function(data){

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
            url: sakai.config.URL.flickrGetPicturesByUserId,
            dataType: "json",
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
                "page":page,
                'per_page':5
            }
        });
    };

    /**
     * This function will bind all the events of the recently rendered paging
     * @param {Integer} page, the currentpage
     * @param {Integer} pages, the totalamount of pages
     * @example bindPaging(1,10)
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
        $flickrPaggingInput = $('#flickr_pagging_input',rootel);

        // Since everything is rendered now, the previous arrow should be hidden
        checkArrowPrev();
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
            dataType: "json",
            success: function(data){
                data = $.parseJSON(data);
                // Get the pictures based on the userid
                userDetailGlob = data;
                //Check if the user has been found, if not and error will be shown else the pictures will be shown
                if (data.stat === "fail") {

                    //Hide the image loader since there's an error
                    $flickrLoadingPersonImage.hide();
                    //Show the error
                    $flickrNoPersonError.show();
                }
                else {
                    getPicturesFromPerson(data.user.nsid);
                }
            },
            error: function(xhr, textStatus, thrownError){
                fluid.log("Error at getting the userdetails");
            },
            data: {
                "api_key": key,
                "name": name
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
            dataType: "json",
            success: function(data){

                //Get the pictures based on the userid
                data = $.parseJSON(data);
                userDetailGlob = data;
                getPicturesFromPerson(data.user.nsid);
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
     * @return true or false, depending on the string
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
            dataType: "json",
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

        getPicturesFromPerson(contacts.userid);
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
         sakai.api.Widgets.Container.informFinish(tuid);
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
        $("img",$('ul',$flickSidebar)).each(function(){
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
     * This function will add an image button to an image when the user does a mouseover
     */
    var addDeleteButtons = function(){
        $("li",$flickSidebar).hover(addDelBtn,removeDeleteButton);
    };

    /**
     * This function will fill in the sidebar and add paging to it
     * @param {Object} data This is the response from the ajax call, to get the images
     */
    var appendToSideBar = function(data){

        $($flickrDropHereImage.parent(), $flickSidebar).remove();

        //Give the object a key to render it
        var pictures = {
            "all": data
        };

        //Render the images in the sidebar
        $("ul", $flickSidebar).append($.TemplateRenderer($flickrImageGallerySideTemplate, pictures));
        $("li", $flickSidebar).hide();
 
        var pageObject = {
            'page': "",
            'pages': ""
        };

        //set the current & totalpage
        pageObject.page = 1;
        pageObject.pages = getPagesCorrect(($("img",$("ul",$flickSidebar)).length),4);
        cp = pageObject.page;
        tp = pageObject.pages;

        //Render the gallery and recash the pagging
        $flickrSidePaging.append($.TemplateRenderer($flickrSideGalleryPaggingTemplate, pageObject));
        $flickrSideNextPagging = $('#flickr_side_next_pagging', rootel);
        $flickrSidePrevPagging = $('#flickr_side_prev_pagging', rootel);

        $('li', $flickSidebar).slice((cp - 1) * 4, ((cp * 4))).fadeIn(2000);

        $flickrSidePages = $("#flickr_side_pages", rootel);
        $flickrSidePagging = $('#flickr_side_pagging', rootel);

        //Bind the clicks
        $flickrSideNextPagging.click(nextImagesSide);
        $flickrSidePrevPagging.click(prevImagesSide);
        firstdrop = false;

        //Add the mouse over to delte the images
        addDeleteButtons();

        //First check both images, because this will only hide the arrows
        checkBothArrowsSide();

        //Check the prev arrow because the user will be on page 1
        checkArrowSidePrev();
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
            $flickrPersonPreviewPrevPagging.attr('class', flickrInvisible);
        }

        //Show the Next arrow
         $flickrPersonPreviewNextPagging.attr('class',flickrVisible);
    };

    /**
     * This function will check if the both arrow should be hidden
     * @param {Object} pages , the total amount of pages
     */
    var checkBothArrowsPreview = function(pages){

        //Check if there is only 1 page, if there's only 1 page, hide both arrows
        if (curP <= 1) {
            $flickrPersonPreviewPrevPagging.attr('class', flickrInvisible);
        }
        if (curP >= pages.pages) {
            $flickrPersonPreviewNextPagging.attr('class', flickrInvisible);
        }
    };

    /**
     * Check if the Next arrow should be hidden in the preview view
     */
    var checkNextArrowPreview = function(pages){

        //Check if the currentpage is equal or bigger than the total amount of pages, if it is  then hide the next arrow
        if (curP >= pages.pages) {
            $flickrPersonPreviewNextPagging.attr('class', flickrInvisible);
        }

        //Show the previous arrow
        $flickrPersonPreviewPrevPagging.attr('class',flickrVisible);
    };

    /**
     * This function will be executed when the user clicks on the next arrow in the preview view
     */
    var nextPreview = function(gallery,pages){

        // Hide the current image
        $("li",gallery).slice((curP - 1) * 6, (curP * 6)).hide();

        //Show the next 5 images
        $("li",gallery).slice((curP * 6), ((curP + 1) * 6)).fadeIn('slow');

        curP = curP + 1;

        //Set the Currenpage
        $flickrPreviewPaggingInput.html(curP);

        //Check if the next arrow should be hidden
        checkNextArrowPreview(pages);
    };

    /**
     * This function will be executed when the user clicks on the prev arrow in the preview view
     */
    var prevPreview = function(gallery,pages){

        //Hide the images that were just shown
        $('li',gallery).slice(((curP - 1) * 6), ((curP ) * 6)).hide();

        //Show the next 5 images
        $('li',gallery).slice(((curP - 2) * 6), ((curP - 1) * 6)).fadeIn('slow');

        curP = curP - 1;

        //Set the currentpage
        $flickrPreviewPaggingInput.html(curP, pages);

        //Check if the previous arrow should be shown
        checkPreviousArrowPreview();
    };

    /**
     * This function will transform the response into an image gallery with medium sized images
     * @param {Object} data, this is the response from the ajax call
     * @return An Array of pictures
     */
    var makeMediumGallery = function (data){

        var imageArray = [];

        // Convert the object to an array
        for (var c in data) {
            if (data.hasOwnProperty(c)) {
                if (typeof(data[c]) === "object") {
                    imageArray.push(data[c]);
                }
            }
        }

        //Change the url for the images so a medium image will be displayed instead of a small one
        $(imageArray).each(function(){

            //Change the _s to _m
            var urlArr = $(this)[0].url.split($(this)[0].url.slice($(this)[0].url.length - 6, $(this)[0].url.length - 4));
            $(this)[0].url = urlArr[0] + "_m" + urlArr[1];
        });

        var pictures = {
            "all": imageArray
        };

        return pictures;
    };

    
    /**
     * This function will remove the delete button if it exists>
     * This function is executed on the mouseout
     */
    var removeExternalButton = function(){
        $flickrDetailButton = $('#flickr_detail_button', rootel);
        if ($($flickrDetailButton, $(this))) {
            $($flickrDetailButton, $(this)).remove();
        }
    };

    /**
     *  This funciton is executed on the mouseover
     */
    var addExternalImage = function(){

      var emptyObject = {};
        $(this).append($.TemplateRenderer($flickrDetailButtonTemplate,emptyObject));
        $flickrDetailButton = $('#flickr_detail_button',rootel);
    };

    var navigateToFlickr = function(){
        window.location.replace("http://flickr.com/photo.gne?id=" + $($("img",$(this).parent())[0]).attr('src').split('/')[4].split('_')[0]);
    };

    /**
     * This function will render the image gallery
     * @param {Object} data, the response from the ajax call
     */
    var makePreviewImageGallery = function(data){

        var pictures = makeMediumGallery(data);

        // Get a JSON string that contains the necessary information.

        $("ul", $flickrPreviewGallery).append($.TemplateRenderer($flickrImageGalleryPreviewTemplate,pictures));

        $flickrDetailButton = $('#flickr_detail_button',rootel);
        $flickrDetailButton.hide();

        curP = 1;

        $flickrKeyUlPreview = $("#flickr_key_ul_preview",rootel);

        //Hide all the images
        $('li', $flickrKeyUlPreview).hide();

        //Show the first 5 images
        $('li', $flickrKeyUlPreview).slice((curP - 1) * 6, ((curP * 6))).show();

        var pages = {
            "pages": getPagesCorrect(pictures.all.length,6)
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
        //$("#flickr_key_ul_preview",rootel).galleria(galleriaObject);

        $("li",$flickrKeyUlPreview).hover(addExternalImage, removeExternalButton);

        $flickrDetailButton = $('#flickr_detail_button',rootel);
        $flickrDetailButton.live('click',navigateToFlickr);

        //Set an image active, so it'll be shown big
        $($flickrKeyUlPreview.children()[1]).addClass('active');

        $('#flickr_key_ul_preview',rootel).sortable();

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

        //Check if the settings screen has to be shown or the widget itself
        if(showSettings){
            showSettingsContainer();
        }else{
            showPreview();
        }
    };
    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("flickr");