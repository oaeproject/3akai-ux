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
 * @param {Object} placement the url for the widget
 * @param {Object} showSettings boolean to check if the widget is in settingsmode or not
 */
sakai.flickr = function(tuid, placement, showSettings){


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
    var key = "93a86c06dc382a19bff0d4d24872ecab"; // An api key required fron flickr when regestering the widget
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

    var changeColorBlack = "changeColorBlack"; // Css class to change the textcolour
    var changeColorNormal = "changeColorNormal"; // Css class to change the textcolour
    var userId; //When the first call is done to get the user id this variabel gets a value

    //Template
    var flickrKeyTemplate = 'flickr_key_gallery_template';
    var flickrPersonGalleryPaggingTemplate = "flickr_person_gallery_pagging_template";

    //Config urls
    Config.URL.flickrGetPhotosBySearchTerm = "/var/proxy/flickr/flickrKeyPictures.json";
    Config.URL.flickrGetUserDetailsByEMail = "/var/proxy/flickr/flickrGetUserDetailsByEMail.json";
    Config.URL.flickrGetUserDetailsByName = "/var/proxy/flickr/flickrGetUserDetailsByName.json";
    Config.URL.flickrGetPicturesByUserId = "/var/proxy/flickr/flickrGetPicturesByUserId.json";
    
    Config.URL.flickrStaticImageUrl = "http://farm3.static.flickr.com/";

    /*Error messages*/
    var $flickrInputError = $("#flickr_input_error",rootel);
    var $flickrInputSameError = $("#flickr_input_same_error",rootel);
    var $flickrInputPersonError = $("#flickr_input_person_error",rootel);
    var $flickrInputPersonSameError = $("#flickr_input_same_person_error",rootel);
    var $flickrNoPersonError = $("#flickr_no_person_error",rootel);

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
        //If the drop now image existsm remove on the drop of an other image
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
     * @param {Object} pictures
     */
    var makeImageGallery = function(pictures){

        //Array for all the pictures
        var pictureUrlArray = [];

        //Convert the data to an object
        var pics = convertJsonToObject(pictures);

        //Give the object a key in an array so it"s easier to address
        var parsedPics = {
            all: pics.photos.photo
        };

        //Loop over the pictures in the array and add them transform them into a url and add them to the array
        for (var i = 0, il = parsedPics.all.length; i < il; i = i + 1) {
            var pic = parsedPics.all[i];
            pictureUrlArray.push(Config.URL.flickrStaticImageUrl + pic.server + "/" + pic.id + "_" + pic.secret + "_s.jpg");
        }

        //Add a key to the array so it's easier to addres the pictures in the jst
        var paredPictureUrlArray = {
            all: pictureUrlArray
        };

        return paredPictureUrlArray;
    };


    ////////////////////////
    // None-reusable code //
    ////////////////////////

    /**
     * This function will display the requested pictures and put them in a sortable list
     * @param {Object} pictures This is json where you can find all the requested pictures
     */
    var displayPhotos = function(pictures){

        //Conver the json into an array of images
        var paredPictureUrlArray =  makeImageGallery(pictures);

        //Because we got all the images now , we can hide the ajax loader
        $flickrLoadingImage.hide();

        //Render the pictures into html
        $flickrKeyGallery.html($.Template.render(flickrKeyTemplate,paredPictureUrlArray));

        //Display a tooltip when the user goes over the images
        $flickrKeyGallery.children('ul').easyTooltip({
            tooltipId: "flickr_tooltip",
            content: $flickrTooltipText.html()
        });

        // This enables the user to drag an image from the image gallery to the sidebar
        $flickrKeyGallery.children('ul').sortable(sortableObject.horizontal);

         //Remove the drop down image when the first picture is dropped
         $flickrKeyGallery.children('ul').bind("sortremove", function(event, ui){
            removeDropNowImage();
        });
    };


    /**
     * This function will bind all the events of the recently rendered paging
     * @param {Integer} page
     * @param {Integer} pages
     */
    var bindPaging = function(page,pages){

        //If there is only 1 page the previous arrow should be hidden
        if(page <= 1){
            $('#flickr_person_prev_pagging',rootel).hide();
        }

        //If the user is on the last page of all the pages , the next arrow is hidden
        if(page >= pages ){
            $('#flickr_person_next_pagging',rootel).hide();
        }

        //Binding of the previous arrow
        $('#flickr_person_prev_pagging',rootel).click (function(){
            getPicturesByUserId(userId,page - 1);
        });

        //Binding of the next arrow
        $('#flickr_person_next_pagging',rootel).click(function(){
            getPicturesByUserId(userId,page + 1);
        });

       //If the inputbox isn"t in focus it should be grey and should contain a default value
        $('#flickr_pagging_input',rootel).blur(function(){
            checkEmpty($('#flickr_pagging_input',rootel));
        });

        //If the textbox gets focussed change the colour of the text
        $('#flickr_pagging_input',rootel).focus(function(){
            changeColour($('#flickr_pagging_input',rootel));
        });

        //Put the current
        $('#flickr_pagging_input',rootel).val(page);

    };

    /**
     * Render the image gallery in the first accordeon div
     * @param {Object} data
     */
    var showPicturesFromPerson = function(data){

        // Convert the received data into a json object, so it can be rendered in the html
        var pictures = makeImageGallery(data);

        //Hide the image gallery
        $flickrKeyPersonGallery.css('opacity',0);

        //Hide the ajax loader
        $flickrLoadingPersonImage.hide();

        //Convert the data into an object so that the pages can be read
        imageGalleryObject = convertJsonToObject(data);

        //Render the pictures in html
        $flickrKeyPersonGallery.html($.Template.render(flickrKeyTemplate,pictures));

        //Get the pages
        var pages = {
            "pages":imageGalleryObject.photos.pages
        };

        //Render the paging for the gallery
        $flickrPersonPagging.html($.Template.render(flickrPersonGalleryPaggingTemplate, pages ));


        //Bind all the items that have just been rendered
        bindPaging(imageGalleryObject.photos.page,imageGalleryObject.photos.pages);

        //Display a tooltip when the user goes over the images
        $flickrKeyPersonGallery.children('ul').easyTooltip({
            tooltipId: "flickr_tooltip",
            content: $flickrTooltipText.html()
        });

        // This enables the user to drag an image from the image gallery to the sidebar
        $flickrKeyPersonGallery.children('ul').sortable(sortableObject.horizontal);

         //Remove the drop down image when the first picture is dropped
         $flickrKeyPersonGallery.children('ul').bind("sortremove", function(event, ui){
            removeDropNowImage();
        });

        //Animate the opacity , so that the gallery is visible
        $flickrKeyPersonGallery.animate({
            opacity: 1
        }, 1000);

        
    };

    /**
     * This function will do an ajax call to get the public pictures of a person
     * @param {Object} userid e.g.: 48506601%40N03
     * @param {Integer} page e.g. : 1
     */
    var getPicturesByUserId = function(userid,page){

        // Ajax call to get the user details
        $.ajax({
            url: Config.URL.flickrGetPicturesByUserId,
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
     * Convert the received userdetails to an object
     * jsonFlickrApi({"user":{"id":"48506601@N03", "nsid":"48506601@N03", "username":{"_content":"ojtwist7"}}, "stat":"ok"})
     * @param {Object} userDetails
     */
    var convertJsonToObject = function(data){

        // Because the json isn't valid, a regexp is needed to delete the first element in the json file
        data = data.replace(/[a-zA-Z0-9 ]*\(/, "");

        // Remove the last bracket in the file
        data = data.substr(0, data.length - 1);

        // Make an Object from the json 
        return $.evalJSON(data);
    };

    /**
     * This function will get the pictures from the user stored in the user details
     * @param {Object} userDetails
     */
    var getPicturesFromPerson = function(userDetails){

        // Convert the userDetails to an object
        var userObject = convertJsonToObject(userDetails);

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
            getPicturesByUserId(userId, 1);
        }
    };

    /**
     * This function will do an ajax call to the flickr api to get the user details based on the name
     * @param {String} name e.g.: Olivier
     */
    var getPicturesByName = function(name){

        // Ajax call to get the user details
        $.ajax({
            url: Config.URL.flickrGetUserDetailsByName,
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
     * @param {String} email e.g.: olivier_j@hotmail.com
     */
    var getPicturesByEMail = function(email){

        // Ajax call to get the user details
        $.ajax({
            url: Config.URL.flickrGetUserDetailsByEMail,
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
     */
    function isValidEmail(str){

        // Check if the string contains a "." and a "@"
        return (str.indexOf(".") > 2) && (str.indexOf("@") > 0);
    }

    var getPicturesByNameOrEmailCheck = function(input){

        //If there's an error hide it
        $flickrNoPersonError.hide();

        //Show the ajax loader
        $flickrLoadingPersonImage.show();

        // Check if the given string is an e-mail or a name
        if(isValidEmail(input)){

            // The input is an e-mail, so here an ajax call is done to get the userId by e-mail
            getPicturesByEMail(input);

        }else{

            // The input is a name, so here an ajax call is done to get the userId by name
            getPicturesByName(input);
        }
    };

    /**
     * This function will make the ajax call to get the pictures
     * @param {Object} tags
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
            url: Config.URL.flickrGetPhotosBySearchTerm,
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