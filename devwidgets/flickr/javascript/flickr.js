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

    /* First Accordeon */
    var $flickrSearchPersonInput = $("#flickr_key_person_input",rootel); //The inputbox in the first accordeon div
    var $flickrSearchPersonKeyButton = $('#flickr_seach_people_button',rootel); //The button in the first accordeon div
    var $flickrKeyPersonGallery =$('#flickr_key_person_gallery',rootel); //The image gallery in the first accordeon div
    var $flickrLoadingPersonImage = $('#flickr_loading_person_img',rootel); // Ajax loader in the first accordeon div
    var $flickrPersonPagging = $("#flickr_person_pagging",rootel); //The pagging for the gallery in the first accordeon div

    /*Second Accordeon */
    var $flickrSearchInput = $("#flickr_key_input",rootel); // Input box
    var $flickrKeyGallery = $('#flickr_key_gallery',rootel); // Div where the images will be displayed
    var $flickrLoadingImage = $('#flickr_loading_img',rootel); // Ajax loader
    var $flickrSeconHeader = $("#flickr_second_header",rootel); // The second accordeon header
    var $flickrSearchKeyButton = $("#flickr_seach_button",rootel);// The searchbutton
    var $flickrSearchText = $("#flickr_search_text",rootel); // The text next to the search input and box

    /*Sidebar */
    var $flickSidebar = $("#flickr_sidebar",rootel); // The sidebar

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

    //Template
    var $flickrPersonGalleryPaggingTemplate = $("#flickr_person_gallery_pagging_template");
    var $flickrImageGalleryTemplate = $('#flickr_image_gallery_template');

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
            $flickrDropHereImage.remove();
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
        $('img',$flickrKeyPersonGallery).slice((currentPage * imgPerPage), ((currentPage + 1) * imgPerPage)).attr("class", 'flickr_hiddenImage');
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
                fluid.log("Error");
            },
            data: {
                "userid": userId,
                "api_key":key,
                "page":newPage
            }
        });
        
    };


    /**
     *  This function will be executed when an image is dropped
     * @param {Object} event, in this event you can get where the image is dropped
     * @param {Object} ui, in this object you can find what is beeing dragged
     * @param {Object} imageGallery, An object that contains an image gallery
     */
    var droppedImage = function(event,ui,imageGallery){

            // An image is dropped so the dragged is incremented
            dragged = dragged + 1;

            // Remove the drop down image
            removeDropNowImage();

            // When an image is removed from the gallery a new one is added
            // This if checks if the image that has to be added exists, or if the user is on the last page
            if(currentPage === totalPages){

            } else if($('li',imageGallery).slice((currentPage * 5) - 1, (currentPage * 5)).find("img").length) {

                // The new image is displayed
                $('li',imageGallery).slice((currentPage * 5) - 1, (currentPage * 5)).find("img").attr("class", 'flick_showImage');

                //New total pages is calculated and displayed in the html
                totalPages = Math.round(((totalImages - dragged) / 5));

                // If the user is on page 0 he should be on page 1
                totalPages = (totalPages === 0) ? 1 : totalPages;
                $("#flickr_page", rootel).html(totalPages);

            // If there is no image to add, a new request should be done
            }else{
                requestNewImagesPerson();
            }

            // If there is only 1 page left, no images should be shown
            checkBothArrows();
    };

    /**
     * This function will add plug-ins to the image gallery
     * @param {Object} imageGallery, an imagegallery
     */
    var addPluginsToGallery = function(imageGallery){

        // Get the current amount of pages, this is calculated by getting the previous totalImages - the amount of images that have been dragged and dropped, devided by 5
         totalPages = Math.round(((totalImages - dragged) / 5));

        // Display a tooltip when the user goes over the images
        //$("li", imageGallery).e
        $("li",imageGallery).easyTooltip({
            tooltipId: "flickr_tooltip",
            content: $flickrTooltipText.html()
        });

        // This enables the user to drag an image from the image gallery to the sidebar
        $('ul',imageGallery).sortable(sortableObject.horizontal);

         // Remove the drop down image when the first picture is dropped
         $('ul',imageGallery).bind("sortremove", function(event, ui){
             droppedImage(event,ui,imageGallery);
        });

    };

    /**
     * This function will hide the currentimages and show the next five
     * @param {Object} gallery, an imagegallery
     * @param {Object} curPage, the current page
     */
    var showNextImages = function(gallery, curPage){

        // Hide the current image
        $("img",gallery).slice((curPage - 1) * imgPerPage, (curPage * imgPerPage)).attr("class", 'flickr_hiddenImage');

        //Show the next 5 images
        $("img",gallery).slice((curPage * imgPerPage), ((curPage + 1) * imgPerPage)).attr("class", 'flick_showImage');

    };


    ////////////////////////
    // None-reusable code //
    ////////////////////////

    /**
     * This function will display the requested pictures and put them in a sortable list
     * @param {Object} pictures This is json where you can find all the requested pictures
     */
    var displayPhotos = function(pictures){

        //Because we got all the images now , we can hide the ajax loader
        $flickrLoadingImage.hide();

            //Render the image gallery
            $('ul',$flickrKeyPersonGallery).append($.TemplateRenderer($flickrImageGalleryTemplate, makeImageGallery(pictures)));

        //Display a tooltip when the user goes over the images
        $('li',$flickrKeyGallery).easyTooltip({
            tooltipId: "flickr_tooltip",
            content: $flickrTooltipText.html()
        });

        // This enables the user to drag an image from the image gallery to the sidebar
        $("ul",$flickrKeyGallery).sortable(sortableObject.horizontal);

         //Remove the drop down image when the first picture is dropped
         $('ul',$flickrKeyGallery).bind("sortremove", function(event, ui){
            removeDropNowImage();
            $("li",imageGallery).slice(index-1,index).find("img").attr("class", 'flick_showImage');
        });
    };

    /**
     * If the user is on the last page, the next arrow should be shown
     */
    var checkArrowNext = function(){

        //Check if the current page is equal to the total amount of pages
        if(currentPage >= totalPages){

            //Hide the next arrow
            $("#flickr_person_next_pagging",rootel).attr("class",'flickr_hideArrow');
        }

        //Show the previous arrow,because this  function is executed everytime the user presses next
        $("#flickr_person_prev_pagging",rootel).attr("class","flickr_showArrow");
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
        $('img',$flickrKeyPersonGallery).slice(((currentPage - 1) * 5), ((currentPage ) * 5)).attr("class", 'flickr_hiddenImage');

        //Show the next 5 images
        $('img',$flickrKeyPersonGallery).slice(((currentPage - 2) * 5), ((currentPage - 1) * 5)).attr("class", 'flick_showImage');

        //Set the current page
        $('#flickr_pagging_input', rootel).val(currentPage - 1);
        currentPage = currentPage - 1;

        //Check if the previous arrow should be hidden
        checkArrowPrev();
    };

    /**
     * This function will bind all the events of the recently rendered paging
     * @param {Integer} page, the currentpage
     * @param {Integer} pages, the totalamount of pages
     */
    var bindPaging = function(page,pages){

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
     * This function is will display the image gallery the first time, this is done with 10 pictures
     * @param {Object} data, the response gotten from the ajax call
     */
    var showPicturesFromPersonStart = function(data){

        //Hide the error if there's one
        $flickrNoPublic.hide();

        //Hide the ajax loader
        $flickrLoadingPersonImage.hide();

        //Convert the data into an object so that the pages can be read
        imageGalleryObject = $.evalJSON(data);

        //The currentpage is 1 since there are 10 images now
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

            //Show the first 5 images
            $('img',$flickrKeyPersonGallery).slice((currentPage - 1) * imgPerPage, (currentPage * imgPerPage)).attr("class", 'flick_showImage');

            //Hide the last 5 images
            $('img',$flickrKeyPersonGallery).slice((currentPage * imgPerPage), ((currentPage + 1) * imgPerPage)).attr("class", 'flickr_hiddenImage');
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
        $flickrKeyPersonGallery.find('img').slice(((currentPage + 1) * 5), ((currentPage + 2) * 5)).attr("class", 'flickr_hiddenImage');

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
                fluid.log("Error");
            },
            data: {
                "userid": userid,
                "api_key":key,
                "page":page
            }
        });
    };

    /**
     * Reset the gallery
     * @param {Object} gallery, an image gallery
     * @param {Object} paging, the pagging div
     */
    var resetGallery = function(gallery,paging){
        gallery.html("<ul id='flickr_key_ul></ul>");
        paging.html("");
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
                fluid.log("Error");
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
                fluid.log("Error");
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
                fluid.log("Error");
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
    var getPicturesByKeyAjaxCall = function(tags){
        var privacy_filter = 1; // Return photos only matching a certain privacy level. This only applies when making an authenticated call to view photos you own.
        var safe_search = 1; // only safe pictures will be returned
        var media = "photo"; // only requesting pictures
        var per_page = "5"; // only return 5pictures

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
                fluid.log("Error");
            },
            data: {
                "key": key,
                "privacy_filter": privacy_filter,
                "safe_search": safe_search,
                "media": media,
                "per_page": per_page,
                "tags": tags
            }
        });
    };

    /**
     * This function will show the necessairy errors when wrong input is given, else it will call a function to make an ajax call
     */
    var getPicturesByNameorEmail = function(){

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

        //If the value of the textbox is still 'search' it can't be submitted
        if (tags === defaultvalue) {
            $flickrInputSameError.show();
        }
        else 
            if (tags) {

                //Ajax call to get the images
                getPicturesByKeyAjaxCall(tags);
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
    };

    /**
     * This function is the first function that will be executed on the page
     */
    var init = function(){

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
            clearStyle : true,
            alwaysOpen: false,
            active: true
        });
    };
    init();
};
sdata.widgets.WidgetLoader.informOnLoad("flickr");