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

/*global sdata, opensocial, Config, window, alert, $ */

var sakai = sakai || {};

sakai._changepic = {};
sakai.changepic = function(tuid, placement, showSettings){


    //////////////////////
    // Config Variables //
    //////////////////////

    var realw = 0;
    var realh = 0;
    var picture = false;
    var ratio = 1;
    var userSelection = null; // The object returned by imgAreaSelect that contains the user his choice.
    var me = null;

    // These values are just in case there are no css values specified.
    // If you want to change the size of a thumbnail please do this in the CSS.
    var thumbnailWidth = 100;
    var thumbnailHeight = 100;


    //////////////
    // CSS IDS    //
    //////////////

    var containerTrigger = '#changepic_container_trigger'; // This is the id that will trigger this widget.

    // tabs
    var tabSelect = "#changepic_select";
    var tabUpload = "#changepic_upload";
    var tabSelectContent = "#changepic_selectpicture";
    var tabUploadContent = "#changepic_uploadnew";
    var tabActiveClass = "fl-tabs-active";
    var tabSearchSelected = "search_tab_selected";

    // others
    var container = "#changepic_container";
    var picForm = "#changepic_form";
    var pictureMeasurer = "#picture_measurer";
    var pictureMeasurerImage = "#picture_measurer_image";
    var saveNewSelection = "#save_new_selection";
    var fullPicture = '#changepic_fullpicture';
    var thumbnail = "#thumbnail";
    var thumbnailContainer = "#thumbnail_container";

    // An array with selectors pointing to images that need to be changed.
    var imagesToChange = ["#picture_holder img", "#myprofile_pic", "#chat_available_me .chat_available_image img"];


    ///////////////////
    // TAB FUNCTIONS //
    ///////////////////

    /**
     * Will set the upload a new picture as the viewable tab.
     * The other tab will be hidden.
     */
    var showNewTab = function(){

        $(fullPicture).imgAreaSelect({
            hide: true,
            disable: true
        });

        $(tabSelect).removeClass(tabActiveClass);
        $(tabSelect).removeClass(tabSearchSelected);

        $(tabUpload).addClass(tabSearchSelected);
        $(tabUpload).addClass(tabActiveClass);

        $(tabSelectContent).hide();
        $(tabUploadContent).show();
    };

    /**
     * Will show the tab where the user can cut out a square.
     * The upload-a-pic tab will be hidden.
     */
    var showSelectTab = function(){

        $(tabSelect).addClass(tabActiveClass);
        $(tabSelect).addClass(tabSearchSelected);

        $(tabUpload).removeClass(tabSearchSelected);
        $(tabUpload).removeClass(tabActiveClass);

        $(tabSelectContent).show();
        $(tabUploadContent).hide();
    };

    /**
     * Clicked on the upload tab
     */
    $(tabUpload).click(function(){
        showNewTab();
    });

    /**
     * Clicked on the select tab
     */
    $(tabSelect).click(function(){
        sakai._changepic.doInit();
    });

    /**
     * When the user has drawn a square this function will be called by imgAreaSelect.
     * This will draw the thumbnail by modifying it's css values.
     * @param {Object} img    The thumbnail
     * @param {Object} selection The selection object from imgAreaSelect
     */
    function preview(img, selection){

        // Save the user his selection in a global variable.
        userSelection = selection;

        // How much has the user scaled down the image?
        var scaleX = thumbnailWidth / selection.width;
        var scaleY = thumbnailHeight / selection.height;

        // Change the thumbnail according to the user his selection via CSS.
        $(thumbnail).css({
            width: Math.round(scaleX * img.width) + 'px',
            height: Math.round(scaleY * img.height) + 'px',
            marginLeft: '-' + Math.round(scaleX * selection.x1) + 'px',
            marginTop: '-' + Math.round(scaleY * selection.y1) + 'px'
        });

    }

    sakai._changepic.doInit = function(){

        // Check whether there is a base picture at all
        me = sdata.me;
        var json = me.profile;

        picture = false;

        $(picForm).attr("action", Config.URL.SDATA_FETCH_PUBLIC_URL.replace(/__USERID__/,sdata.me.user.userid));

        // Get the preferred size for the thumbnail.
        var prefThumbWidth = parseInt($(thumbnailContainer).css('width').replace(/px/gi,''), 10);
        var prefThumbHeight = parseInt($(thumbnailContainer).css('height').replace(/px/gi,''), 10);

        // Make sure we don't have 0
        thumbnailWidth  = (prefThumbWidth > 0) ? prefThumbWidth : thumbnailWidth;
        thumbnailHeight  = (prefThumbHeight > 0) ? prefThumbHeight : thumbnailHeight;

        if (json.picture) {
            picture = $.evalJSON(json.picture);
        }

        if (picture && picture._name) {
            // The user has already uploaded a picture.
            // Show the edit tab.
            // Show tab in header
            $(tabSelect).show();


            // Set the unvisible image to the full blown image. (make sure to filter the # out)
            $(pictureMeasurer).html("<img src='" + "/_user/public/" + sdata.me.user.userid + "/" + picture._name + "?sid=" + Math.random() + "' id='" + pictureMeasurerImage.replace(/#/gi, '') + "' />");

            // Check the current picture's size
            $(pictureMeasurerImage).bind("complete", function(ev){

                // save the image size in global var.
                realw = $(pictureMeasurerImage).width();
                realh = $(pictureMeasurerImage).height();
                
                console.log("realw: " + realw + " realh: " + realh);

                // Set the images
                $(fullPicture).attr("src", "/_user/public/" + sdata.me.user.userid + "/" + picture._name + "?sid=" + Math.random());
                $(thumbnail).attr("src", "/_user/public/" + sdata.me.user.userid + "/" + picture._name + "?sid=" + Math.random());

                // Width < 500 ; Height < 300 => set the original height and width
                if (realw < 500 && realh < 300){
                    $(fullPicture).width(realw);
                    $(fullPicture).height(realh);

                // Width > 500 ; Height < 300 => Width = 500
                } else if (realw > 500 && (realh / (realw / 500) < 300)){
                    ratio = realw / 500;
                    $(fullPicture).width(500);
                    $(fullPicture).height(Math.floor(realh / ratio));

                // Width < 500 ; Height > 300 => Height = 300
                } else if (realh > 300 && (realw / (realh / 300) < 500)) {
                    ratio = realh / 300;
                    $(fullPicture).height(300);
                    $(fullPicture).width(Math.floor(realw / ratio));

                // Width > 500 ; Height > 300
                } else if (realh > 300 && (realw / (realh / 300) > 500)) {

                    var heightonchangedwidth = realh / (realw / 500);
                    if (heightonchangedwidth > 300){
                        ratio = realh / 300;
                        $(fullPicture).height(300);
                    } else {
                        ratio = realw / 500;
                        $(fullPicture).width(500);
                    }
                }

                // If the image gets loaded, make a first selection
                var initialSelection = function(img, selection){
                    var initialSelectionHeight = realh < 100 ? realh : 100;
                    var initialSelectionWidth = realw < 100 ? realw : 100;
                    console.log(initialSelectionWidth + " " + initialSelectionHeight);
                    imageareaobject.setSelection(0,0,initialSelectionHeight, initialSelectionWidth);
                    imageareaobject.setOptions({ show: true });
                    imageareaobject.update();
                    selection = imageareaobject.getSelection();
                    preview(img, selection);
                };

                // Set the imgAreaSelect to a function so we can access it later on
                var imageareaobject = $(fullPicture).imgAreaSelect({
                    aspectRatio: "1:1",
                    disable: false,
                    hide: false,
                    instance: true,
                    onInit: initialSelection,
                    onSelectChange: preview
                });
                
            });
            $(pictureMeasurerImage).unbind("complete");

            showSelectTab();

        }
        else {
            // The user hasn't uploaded a picture yet.
            // Show the upload pic tab.
            $(tabSelect).hide();
            showNewTab();
        }
    };

    // This is the function that will be called when a user has cut out a selection
    // and saves it.
    $(saveNewSelection).click(function(ev){

        // The parameters for the cropit service.
        var data = {
            img: "/_user/public/" + sdata.me.user.userStoragePrefix + picture._name,
            save: "/_user/public/" + sdata.me.user.userStoragePrefix,
            x: Math.floor(userSelection.x1 * ratio),
            y: Math.floor(userSelection.y1 * ratio),
            width: Math.floor(userSelection.width * ratio),
            height:Math.floor(userSelection.height * ratio),
            dimensions: "256x256",
            "_charset_":"utf-8"
        };

        // Post all of this to the server
        $.ajax({
            url: Config.URL.IMAGE_SERVICE,
            type: "POST",
            data: data,
            success: function(data){

                var tosave = {
                    "name": "256x256_" + picture._name,
                    "_name": picture._name,
                    "_charset_":"utf-8"
                };

                var stringtosave = $.toJSON(tosave);

                sdata.me.profile.picture = stringtosave;

                // Do a patch request to the profile info so that it gets updated with the new information.
                $.ajax({
                    url: "/_user/public/" + me.user.userid + "/authprofile",
                    type : "POST",
                    data : {
                        "picture" : $.toJSON(tosave),
                        "_charset_":"utf-8"
                    },
                    success : function(data) {
                        // Change the picture in the page. (This is for my_sakai.html)
                        // Math.random is for cache issues.
                        for (var i = 0; i < imagesToChange.length;i++) {
                            $(imagesToChange[i]).attr("src", "/_user/public/" + me.user.userid + "/" + tosave.name + "?sid=" + Math.random());
                        }

                        // Hide the layover.
                        $(container).jqmHide();

                    },
                    error: function(xhr, textStatus, thrownError) {
                        alert("An error has occured");
                    }
                });

            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error has occured");
            }
        });

    });


    ////////////////////////////
    // jQuery Modal functions //
    ////////////////////////////

    /**
     * Hide the layover
     * @param {Object} hash the object that represents the layover
     */
    var hideArea = function(hash){

        // Remove the selecting of an area on an image.
        $(fullPicture).imgAreaSelect({
            hide: true,
            disable: true
        });

        hash.w.hide();
        hash.o.remove();
    };

    /**
     * Show the layover.
     * @param {Object} hash
     */
    var showArea = function(hash){
        sakai._changepic.doInit();
        hash.w.show();
    };

    // This will make the widget popup as a layover.
    $(container).jqm({
        modal: true,
        trigger: containerTrigger,
        overlay: 20,
        toTop: true,
        onHide: hideArea,
        onShow: showArea
    });
};


/**
 * This method gets called the second we submit the form
 */
sakai._changepic.startCallback = function(){
    return true;
};

/**
 * When the file has been saved we will get a response back from JCR.
 * @param {Object} response
 */
sakai._changepic.completeCallback = function(response){

    // Replace any <pre> tags the response might contain.
    response = response.replace(/<pre[^>]*>/ig,"").replace(/<\/pre[^>]*>/ig,"");

    var tosave = {
        "_name": "profilepicture"
    };

    // We edit the profile.json file with the new profile picture.
    var stringtosave = $.toJSON(tosave);

    // We edit the me object in sdata.
    // This saves a request and will be checked in the doInit function later on.
    sdata.me.profile.picture = stringtosave;

    // the object we wish to insert into the profile.json file.
    var data = {"picture":stringtosave,"_charset_":"utf-8"};

    $.ajax({
        url: Config.URL.USER_EXISTENCE_SERVICE.replace(/__USERID__.json/,sdata.me.user.userid) + ".update.html",
        type : "POST",
        data : data,
        success : function(data) {

            // we have saved the profile, now do the widgets other stuff.
            sakai._changepic.doInit();
        },
        error: function(xhr, textStatus, thrownError) {
            alert("An error has occured");
        }
    });
};


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

sdata.widgets.WidgetLoader.informOnLoad("changepic");