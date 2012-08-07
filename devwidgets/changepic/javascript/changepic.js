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

/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/imgareaselect/jquery.imgareaselect.js (imgAreaSelect)
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */

require(['jquery', 'sakai/sakai.api.core', '/dev/lib/jquery/plugins/imgareaselect/jquery.imgareaselect.js'], function($, sakai) {

    /**
     * @name sakai_global.changepic
     *
     * @class changepic
     *
     * @description
     * Changepic widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.changepic = function(tuid, showSettings) {


        //////////////////////
        // Config Variables //
        //////////////////////

        var realw = 0;
        var realh = 0;
        var picture = false;
        var ratio = 1;
        var userSelection = null; // The object returned by imgAreaSelect that contains the user his choice.
        var originalPic = null; // current or default selection area
        var me = null;
        var imageareaobject;
        var id = null;
        var mode = null;
        var fullPicHeight = 300;
        var fullPicWidth = 325;

        // These values are just in case there are no css values specified.
        // If you want to change the size of a thumbnail please do this in the CSS.
        var thumbnailWidth = 100;
        var thumbnailHeight = 100;


        //////////////
        // CSS IDS  //
        //////////////

        var containerTrigger = '#changepic_container_trigger'; // This is the id that will trigger this widget.

        // others
        var selectContentArea = '#changepic_selectpicture';
        var container = '#changepic_container';
        var picForm = '#changepic_form';
        var picInput = '#profilepicture';
        var picInputError = '#changepic_nofile_error';
        var uploadProcessing = '#changepic_uploading';
        var uploadNewButtons = '#changepic_uploadnew_buttons';
        var uploadNewCancel = '#profile_upload_cancel';
        var pictureMeasurer = '#picture_measurer';
        var pictureMeasurerImage = '#picture_measurer_image';
        var saveNewSelection = '#save_new_selection';
        var fullPicture = '#changepic_fullpicture_img';
        var fullPictureSpan = '#changepic_fullpicture';
        var thumbnail = '#thumbnail_img';
        var thumbnailSpan = '#thumbnail';
        var thumbnailContainer = '#thumbnail_container';
        var picInputErrorClass = 'changepic_input_error';
        var fileName = false;
        var existingPicture = false;

        // An array with selectors pointing to images that need to be changed.
        var imagesToChange = ['#picture_holder img', '#entity_profile_picture', '#myprofile_pic', '#profile_userinfo_picture'];


        ///////////////////
        // UTIL FUNCTIONS //
        ///////////////////

         /**
         * Hides and reset image select area
         */
        var hideSelectArea = function() {
            if (imageareaobject) {
                imageareaobject.setOptions({
                    hide: true,
                    disable: true
                });
                imageareaobject.update();
            }

            $(selectContentArea).hide();
            $(uploadNewCancel).show();
        };

         /**
         * Shows image select area
         */
        var showSelectArea = function() {
            $(uploadNewCancel).hide();
            $(selectContentArea).show();
        };

        /**
         * When the user has drawn a square this function will be called by imgAreaSelect.
         * This will draw the thumbnail by modifying it's css values.
         * @param {Object} img    The thumbnail
         * @param {Object} selection The selection object from imgAreaSelect
         */
        var preview = function(img, selection) {
            // Save the user his selection in a global variable.
            userSelection = selection;

            // How much has the user scaled down the image?
            var scaleX = thumbnailWidth / (selection.width || 1);
            var scaleY = thumbnailHeight / (selection.height || 1);

            // Change the thumbnail according to the user his selection via CSS.
            $(thumbnail).css({
                width: Math.round(scaleX * img.width) + 'px',
                height: Math.round(scaleY * img.height) + 'px',
                marginLeft: '-' + Math.round(scaleX * selection.x1) + 'px',
                marginTop: '-' + Math.round(scaleY * selection.y1) + 'px'
            });
        };

        /**
         * Shows file input error
         */
        var showInputError = function() {
            $(picInputError).show();
            $(picInput).addClass(picInputErrorClass);
            if ($(selectContentArea + ':visible') && imageareaobject) {
                imageareaobject.update();
            }
        };

        /**
         * Hides file input error
         */
        var hideInputError = function() {
            $(picInputError).hide();
            $(picInput).removeClass(picInputErrorClass);
            if ($(selectContentArea + ':visible') && imageareaobject) {
                imageareaobject.update();
            }
        };

         /**
         * Empty upload field by resetting the form
         */
        var resetUploadField = function() {
            $(picForm)[0].reset();
            hideInputError();
            $(uploadProcessing).hide();
            $(uploadNewButtons).show();
            $('#profile_upload').attr('disabled', 'disabled');
        };

        // Add click event to all cancel buttons in the overlay
        // Since file upload form is reset every time overlay closes do this in init function
        $('#changepic_container .jqmClose').click(function() {
            resetUploadField();
        });

        /**
         * On changepic form submit, check that a file has been selected
         * and submit the form.
         */
        $('#profile_upload').off('click').on('click', function() {
            // validate args
            // file extension allow for image
            var extensionArray = ['.png', '.jpg', '.jpeg','.gif'];
            // get file name
            fileName = $(picInput).val();
            // get extension from the file name.
            var extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
            var allowSubmit = false;

            for (var i = 0; i < extensionArray.length; i++) {
                 // extension is acceptable image format
                 if (extensionArray[i] === extension) {
                    allowSubmit = true;
                    break;
                 }
            }
            // if image format is acceptable
            if (allowSubmit) {
                hideInputError();
                $(uploadNewButtons).hide();
                $(uploadProcessing).show();
                fileName = 'tmp' + new Date().getTime() + '.jpg';
                $(picInput).attr('name',fileName);
                hideSelectArea();
                $(picForm).ajaxForm({
                    success: function(data) {
                        doInit(true);
                    },
                    error: function() {
                        showInputError();
                        return false;
                    }
                });
                $(picForm).submit();
            } else {
                // no input, show error
                showInputError();
                return false;
            }
        });

        /**
         * Initilise function
         * @param {boolean} newpic True if a new picture has just been uploaded
         */
        var doInit = function(newpic) {
            hideSelectArea();

            if (!id) {
                id = sakai.data.me.user.userid;
                mode = 'user';
            }

            var showPicture = true;
            var json;

            if (mode === 'group') {
                // fetch group data to check if it has a picture
                $.ajax({
                    url: '/~' + id + '/public.infinity.json',
                    async: false,
                    success: function(data) {
                        json = data.authprofile;
                    }
                });
            } else {
                // Check whether there is a base picture at all
                me = sakai.data.me;
                json = me.profile;
            }
            // If the image is freshly uploaded then reset the imageareaobject to reset all values on init
            if (newpic) {
                imageareaobject = null;
                picture = {
                    '_name': fileName,
                    'selectedx1':0,
                    'selectedy1':0,
                    'selectedx2':64,
                    'selectedy2':64
                };
            }
            else if (json.picture) {
                picture = $.parseJSON(json.picture);
            } else {
                showPicture = false;
            }

            $(picForm).attr('action', '/~' + sakai.api.Util.safeURL(id) + '/public/profile');

            // Get the preferred size for the thumbnail.
            var prefThumbWidth = parseInt($(thumbnailContainer).css('width').replace(/px/gi,''), 10);
            var prefThumbHeight = parseInt($(thumbnailContainer).css('height').replace(/px/gi,''), 10);

            // Make sure we don't have 0
            thumbnailWidth  = (prefThumbWidth > 0) ? prefThumbWidth : thumbnailWidth;
            thumbnailHeight  = (prefThumbHeight > 0) ? prefThumbHeight : thumbnailHeight;

            if (showPicture && picture && picture._name) {
                // The user has already uploaded a picture.
                // Show the image select area
                existingPicture = true;

                // Set the unvisible image to the full blown image. (make sure to filter the # out)
                $(pictureMeasurer).html(sakai.api.Security.saneHTML('<img src="' + '/~' + sakai.api.Util.safeURL(id) + '/public/profile/' + picture._name + '?sid=' + Math.random() + '" id="' + pictureMeasurerImage.replace(/#/gi, '') + '" />'));

                // Check the current picture's size
                $(pictureMeasurerImage).on('load', function(ev) {
                    resetUploadField();

                    // save the image size in global var.
                    realw = $(pictureMeasurerImage).width();
                    realh = $(pictureMeasurerImage).height();

                    // Set the images
                    $(fullPictureSpan).html('<img alt="' + $('#changepic_fullpicture_alt').html() + '" id="changepic_fullpicture_img" src="/~' + id + '/public/profile/' + picture._name + '?sid=' + Math.random() + '" />');
                    $(thumbnailSpan).html('<img alt="' + $('#thumbnail_alt').html() + '" id="thumbnail_img" src="/~' + id + '/public/profile/' + picture._name + '?sid=' + Math.random() + '" />');

                    // Reset ratio
                    ratio = 1;

                    // fullPicWidth (500) and fullPicHeight (300) set in config variables
                    // Width < 500 ; Height < 300 => set the original height and width
                    if (realw < fullPicWidth && realh < fullPicHeight) {
                        $(fullPicture).width(realw);
                        $(fullPicture).height(realh);

                    // Width > 500 ; Height < 300 => Width = 500
                    } else if (realw > fullPicWidth && (realh / (realw / fullPicWidth) < fullPicHeight)) {
                        ratio = realw / fullPicWidth;
                        $(fullPicture).width(fullPicWidth);
                        $(fullPicture).height(Math.floor(realh / ratio));

                    // Width < 500 ; Height > 300 => Height = 300
                    } else if (realh > fullPicHeight && (realw / (realh / fullPicHeight) < fullPicWidth)) {
                        ratio = realh / fullPicHeight;
                        $(fullPicture).height(fullPicHeight);
                        $(fullPicture).width(Math.floor(realw / ratio));

                    // Width > 500 ; Height > 300
                    } else if (realh > fullPicHeight && (realw / (realh / fullPicHeight) > fullPicWidth)) {

                        var heightonchangedwidth = realh / (realw / fullPicWidth);
                        if (heightonchangedwidth > fullPicHeight) {
                            ratio = realh / fullPicHeight;
                            $(fullPicture).height(fullPicHeight);
                        } else {
                            ratio = realw / fullPicWidth;
                            $(fullPicture).width(fullPicWidth);
                        }
                    }

                    var selectionObj = {
                        width : picture.selectedx2 - picture.selectedx1,
                        height :picture.selectedy2 - picture.selectedy1,
                        x1 : picture.selectedx1,
                        y1 : picture.selectedy1,
                        x2 : picture.selectedx2,
                        y2 : picture.selectedy2,
                        picture : picture._name
                    };
                    if (!newpic) {
                        originalPic = selectionObj;
                    }

                    // Set the imgAreaSelect to a function so we can access it later on
                    imageareaobject = $(fullPicture).imgAreaSelect({
                        aspectRatio: '1:1',
                        enable: true,
                        show: true,
                        instance: true,
                        onInit: function() {
                            // If the image gets loaded, make a first selection
                            imageareaobject.setSelection(picture.selectedx1, picture.selectedy1, picture.selectedx2, picture.selectedy2);
                            imageareaobject.setOptions({show: true, enable: true});
                            imageareaobject.update();
                            preview($('img' + fullPicture)[0], selectionObj);
                        },
                        onSelectChange: preview
                    });
                    showSelectArea();
                });

                // if there is upload error show the error message
                $(pictureMeasurerImage).on('error', function() {
                    showInputError();
                });
            }
        };

        // Remove error notification when a new file is chosen
        $(picInput).on('change', function() {
            hideInputError();
            $('#profile_upload').removeAttr('disabled');
        });

        // This is the function that will be called when a user has cut out a selection
        // and saves it.
        $(saveNewSelection).click(function(ev) {
            if (!userSelection) {
                userSelection = imageareaobject.getSelection();
                savePicture();
            } else if (originalPic &&
                (userSelection.x1 === originalPic.x1 &&
                userSelection.x2 === originalPic.x2 &&
                userSelection.y1 === originalPic.y1 &&
                userSelection.y2 === originalPic.y2 &&
                userSelection.picture === originalPic.picture)) {
                // no need to save if picture hasn't changed, so just close the dialog
                // Hide the layover.
                sakai.api.Util.Modal.close(container);
            } else {
                savePicture();
            }
        });

        /**
         * savePicture
         */
        var savePicture = function() {
            // The parameters for the cropit service.
            var data = {
                img: '/~' + id + '/public/profile/' + picture._name,
                save: '/~' + id + '/public/profile',
                x: Math.floor(userSelection.x1 * ratio),
                y: Math.floor(userSelection.y1 * ratio),
                width: Math.floor(userSelection.width * ratio),
                height:Math.floor(userSelection.height * ratio),
                dimensions: '256x256',
                '_charset_':'utf-8'
            };

            if (data.width === 0 || data.height === 0) {
                data.width = $(fullPicture).width();
                data.height = $(fullPicture).height();
                data.x = 0;
                data.y = 0;
            }

            // Post all of this to the server
            $.ajax({
                url: sakai.config.URL.IMAGE_SERVICE,
                type: 'POST',
                data: data,
                success: function(data) {

                    var tosave = {
                        'name': '256x256_' + picture._name,
                        '_name': picture._name,
                        '_charset_':'utf-8',
                        'selectedx1' : userSelection.x1,
                        'selectedy1' : userSelection.y1,
                        'selectedx2' : userSelection.width + userSelection.x1,
                        'selectedy2' : userSelection.height + userSelection.y1
                    };

                    var stringtosave = JSON.stringify(tosave);

                    sakai.data.me.profile.picture = stringtosave;

                    // Do a patch request to the profile info so that it gets updated with the new information.
                    $.ajax({
                        url: '/~' + sakai.api.Util.safeURL(id) + '/public/authprofile.profile.json',
                        type : 'POST',
                        data : {
                            'picture' : JSON.stringify(tosave),
                            '_charset_':'utf-8'
                        },
                        success : function(data) {
                            // Change the picture in the page. (This is for my_sakai.html)
                            // Math.random is for cache issues.
                            for (var i = 0; i < imagesToChange.length;i++) {
                                $(imagesToChange[i]).attr('src', '/~' + id + '/public/profile/' + tosave.name + '?sid=' + Math.random());
                            }

                            // Hide the layover.
                            sakai.api.Util.Modal.close(container);

                            if (sakai.currentgroup && sakai.currentgroup.data && sakai.currentgroup.data.authprofile) {
                                sakai.currentgroup.data.authprofile.picture = JSON.stringify(tosave);
                            }
                        },
                        error: function(xhr, textStatus, thrownError) {
                            sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('AN_ERROR_HAS_OCCURRED'),'',sakai.api.Util.notification.type.ERROR);
                        }
                    });

                },
                error: function(xhr, textStatus, thrownError) {
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('AN_ERROR_HAS_OCCURRED'),'',sakai.api.Util.notification.type.ERROR);
                }
            });

        };


        ////////////////////////////
        // jQuery Modal functions //
        ////////////////////////////

        /**
         * Hide the layover
         * @param {Object} hash the object that represents the layover
         */
        var hideArea = function(hash) {
            // Remove the selecting of an area on an image.
            if (imageareaobject) {
                imageareaobject.setOptions({
                    hide: true,
                    disable: true
                });
                imageareaobject.update();
            }

            hash.w.hide();
            hash.o.remove();
        };

        /**
         * Show the layover.
         * @param {Object} hash
         */
        var showArea = function(hash) {
            doInit();
            hash.w.show();
        };

        sakai.api.Util.Modal.setup(container, {
            modal: true,
            overlay: 20,
            toTop: true,
            onHide: hideArea,
            onShow: showArea
        });

        $(window).on('setData.changepic.sakai', function(e, _mode, _id) {
            mode = _mode;
            id = _id;
        });

        $(document).on('click', containerTrigger, function() {
            // This will make the widget popup as a layover.
            sakai.api.Util.Modal.open(container);
        });

        $(window).trigger('ready.changepic.sakai');
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('changepic');

});
