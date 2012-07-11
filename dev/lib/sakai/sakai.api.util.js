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
/**
 * @class Util
 *
 * @description
 * General utility functions which implement commonly used low level operations
 * and unifies practices across codebase.
 *
 * @namespace
 * General utility functions
 */
define(
    [
        "jquery",
        "sakai/sakai.api.server",
        "sakai/sakai.api.l10n",
        "sakai/sakai.api.i18n",
        "config/config_custom",
        "underscore",
        "misc/trimpath.template",
        "jquery-plugins/jquery.ba-bbq",
        "jquery-ui"
    ],
    function($, sakai_serv, sakai_l10n, sakai_i18n, sakai_conf, _) {

    var sakai_util = {
        data: {
            worldTemplates: false,
            pageTitle: ''
        },

        startup : function(meData) {
            // Start polling to keep session alive when logged in
            if (meData.user.userid) {
                setInterval(function() {
                    $.ajax({
                        url: sakai_conf.URL.ME_SERVICE,
                        success: function(data) {
                            if (!data.user.userid) {
                                document.location = "/";
                            }
                        }
                    });
                }, 60000);
            }
        },

        /**
         * Get the world templates from the server
         * If the worldTemplates are already fetched they will just be returned from the variable
         * @param {Function} callback Function executed after the templates have been fetched. 
         *                            The templates are passed through to the function
         */
        getTemplates: function(callback) {
            if (!sakai_util.data.worldTemplates) {
                sakai_util.data.worldTemplates = [];
                $.ajax({
                    url: sakai_conf.URL.WORLD_INFO_URL,
                    success: function(data) {
                        data = sakai_serv.removeServerCreatedObjects(data, ['jcr:']);
                        $.each(data, function(key, value) {
                            if ($.isPlainObject(value) && value.id) {
                                sakai_util.data.worldTemplates.push(value);
                            }
                        });
                        $.each(sakai_util.data.worldTemplates, function(i, temp) {
                            $.each(temp, function(k, templ) {
                                if ($.isPlainObject(temp[k])) {
                                    temp.templates = temp.templates || [];
                                    temp.templates.push(temp[k]);
                                }
                            });
                        });
                        sakai_util.data.worldTemplates = _.sortBy(sakai_util.data.worldTemplates, function(templ) {
                            return templ.order;
                        });
                        if ($.isFunction(callback)) {
                            callback(true, sakai_util.data.worldTemplates);
                        }
                    }, error: function(xhr, textStatus, thrownError) {
                        debug.error('Could not get the group templates');
                        if ($.isFunction(callback)) {
                            callback(false, xhr);
                        }
                    }
                });
            } else {
                if ($.isFunction(callback)) {
                    callback(true, sakai_util.data.worldTemplates);
                }
            }
        },

        /**
         * Parse a JavaScript date object to a JCR date string (2009-10-12T10:25:19)
         *
         * <p>
         *     Accepted values for the format [1-6]:
         *     <ol>
         *         <li>Year: YYYY (eg 1997)</li>
         *         <li>Year and month: YYYY-MM <br /> (eg 1997-07)</li>
         *         <li>Complete date: YYYY-MM-DD <br /> (eg 1997-07-16)</li>
         *         <li>Complete date plus hours and minutes: YYYY-MM-DDThh:mmTZD <br /> (eg 1997-07-16T19:20+01:00)</li>
         *         <li>Complete date plus hours, minutes and seconds: YYYY-MM-DDThh:mm:ssTZD <br /> (eg 1997-07-16T19:20:30+01:00)</li>
         *         <li>Complete date plus hours, minutes, seconds and a decimal fraction of a second YYYY-MM-DDThh:mm:ss.sTZD <br /> (eg 1997-07-16T19:20:30.45+01:00)</li>
         *     </ol>
         * </p>
         * <p>
         *     External links:
         *     <ul>
         *         <li><a href="http://www.w3.org/TR/NOTE-datetime">W3C datetime documentation</a></li>
         *         <li><a href="http://delete.me.uk/2005/03/iso8601.html">ISO8601 JavaScript function</a></li>
         *         <li><a href="http://confluence.sakaiproject.org/display/KERNDOC/KERN-643+Multiple+date+formats+in+the+back-end">Specification</a></li>
         *     </ul>
         * </p>
         * @param {Date} date
         *     JavaScript date object.
         *     If not set, the current date is used.
         * @param {Integer} format
         *     The format you want to put out
         * @param {String} offset
         *     Optional timezone offset +HH:MM or -HH:MM,
         *     if not set Z(ulu) or UTC is used
         * @return {String} a JCR date string
         */
        createSakaiDate : function(date, format, offset) {
            if (!format) { format = 5; }
            if (!date) { date = new Date(); }
            if (!offset) {
                offset = 'Z';
            } else {
                var d = offset.match(/([\-+])([0-9]{2}):([0-9]{2})/);
                var offsetnum = (Number(d[2]) * 60) + Number(d[3]);
                offsetnum *= ((d[1] === '-') ? -1 : 1);
                date = new Date(Number(Number(date) + (offsetnum * 60000)));
            }

            var zeropad = function (num) { return ((num < 10) ? '0' : '') + num; };

            var str = "";
            str += date.getUTCFullYear();
            if (format > 1) { str += "-" + zeropad(date.getUTCMonth() + 1); }
            if (format > 2) { str += "-" + zeropad(date.getUTCDate()); }
            if (format > 3) {
                str += "T" + zeropad(date.getUTCHours()) +
                    ":" + zeropad(date.getUTCMinutes());
            }
            if (format > 4) { str += ":" + zeropad(date.getUTCSeconds()); }
            if (format > 3) { str += offset; }
            if (format > 5) {
                str = date.getTime();
            }
            return str;
        },

        /**
         * Convert a file's size to a human readable size
         * example: 2301 = 2.301kB
         *
         * @param (Integer) filesize The file's size to convert
         * @return (String) the file's size in human readable format
         */

        convertToHumanReadableFileSize : function(filesize) {
            if (! filesize){
                filesize = 0;
            }
            var i;
            if (filesize.indexOf && filesize.indexOf("binary-length:") > -1) {
                filesize = filesize.replace("binary-length:", "");
            }
            // Divide the length into its largest unit
            var units = [[1024 * 1024 * 1024, 'GB'], [1024 * 1024, 'MB'], [1024, 'KB'], [1, 'bytes']];
            var lengthunits;
            for (i = 0, j=units.length; i < j; i++) {

                var unitsize = units[i][0];
                var unittext = units[i][1];

                if (filesize >= unitsize) {
                    filesize = filesize / unitsize;
                    // 1 decimal place
                    filesize = Math.ceil(filesize * 10) / 10;
                    lengthunits = unittext;
                    break;
                }
            }
            // Return the human readable filesize (and localized)
            return sakai_l10n.transformDecimal(filesize, 1) + " " + lengthunits;
        },

        /**
         * Formats a comma separated string of text to an array of usable tags
         * Filters out unwanted tags (eg empty tags)
         * Returns the array of tags, if no tags were provided or none were valid an empty array is returned
         *
         * Example: inputTags = "tag1, tag2, , , tag3, , tag4" returns ["tag1","tag2","tag3","tag4"]
         *
         * @param {String} inputTags Unformatted, comma separated, string of tags put in by a user
         * @return {Array} Array of formatted tags
         */
        formatTags : function(inputTags){
            if ( $.trim( inputTags ) !== "" || $.isArray( inputTags ) ) {
                var tags = [];
                var splitTags = inputTags;
                if ( !$.isArray( inputTags ) ) {
                    splitTags = $( inputTags.split( "," ) );
                }
                var sakai_i18n = require("sakai/sakai.api.i18n");
                $( splitTags ).each(function( index ) {
                    var tag = $.trim( splitTags[ index ] );
                    if ( tag.length ) {
                        if ( tag.indexOf( "directory/" ) === 0 ) {
                            var tag_val = sakai_util.getValueForDirectoryTag( tag );
                            var tagLink = "/category#l=";
                            $.each(tag.split("/"), function(i,dirPart) {
                                if ( dirPart !== "directory" ) {
                                    tagLink += sakai_util.safeURL(dirPart);
                                    if (i !== tag.split("/").length -1 ) {
                                        tagLink += "-";
                                    }
                                }
                            });
                            tag = {
                                original: tag,
                                value: sakai_util.Security.safeOutput(tag_val),
                                tagShort: tag_val,
                                tagShorter: tag_val,
                                link: tagLink,
                                linkTitle: sakai_i18n.getValueForKey("SEARCH_CONTENT_LOCATED_AT") + " " + sakai_util.Security.safeOutput(tag_val)
                            };
                        } else {
                            tag = {
                                original: tag,
                                value: sakai_util.Security.safeOutput(tag),
                                tagShort: sakai_util.applyThreeDots(tag, 680, {max_rows: 1, whole_word: true}, ""),
                                tagShorter: sakai_util.applyThreeDots(tag, 125, {max_rows: 1, whole_word: true}, ""),
                                link: "/search#q=&refine=" + sakai_util.safeURL(tag),
                                linkTitle: sakai_i18n.getValueForKey("SEARCH_CONTENT_TAGGED_WITH") + " " + sakai_util.Security.safeOutput(tag)
                            };
                        }
                        tags.push( tag );
                    }
                });
                tags.sort(function(a,b) {
                    return sakai_util.Sorting.naturalSort(a.value,b.value);
                });
                return tags;
            } else {
                return [];
            }
        },

        /**
         * Add and delete tags from an entity
         * The two arrays, newTags and currentTags, represent the state of tags on the entity
         * newTags should be the tags that you want on the entity, the whole set
         * currentTags should be the set of tags the entity had before the user modified it
         * tagEntity will delete any tags in currentTags but not in newTags, and add any in
         * newTags that aren't in currentTags
         *
         * @param (String) tagLocation the URL to the tag, ie. (~userid/public/authprofile)
         * @param (Array) newTags The set of tags you wish to be on the entity
         * @param (Array) currentTags The set of tags on the current entity
         * @param (Function) callback The callback function
         */

        tagEntity : function(tagLocation, newTags, currentTags, callback) {
            var setTags = function(tagLocation, tags, setTagsCallback) {
                // set the tag on the entity
                var doSetTags = function(tags, doSetTagsCallback) {
                    var tagArray = [];
                    $(tags).each(function(i,val) {
                        tagArray.push("/tags/" + val);
                    });
                    $.ajax({
                        url: tagLocation,
                        type: "POST",
                        traditional: true,
                        data: {
                            ":operation": "tag",
                            "key": tagArray
                        },
                        success: function(data) {
                            if ($.isFunction(doSetTagsCallback)) {
                                doSetTagsCallback(true);
                            }
                        },
                        error: function(xhr){
                            debug.error(tagLocation + " failed to be tagged as " + tagArray);
                            if ($.isFunction(doSetTagsCallback)) {
                                doSetTagsCallback(false);
                            }
                        }
                    });
                };

                if (tags.length) {
                    doSetTags(tags, function(_success) {
                        setTagsCallback(_success);
                    });
                } else {
                    if ($.isFunction(setTagsCallback)) {
                        setTagsCallback();
                    }
                }

            };

            /**
             * Delete tags on a given node
             *
             * @param (String) tagLocation the URL to the tag, ie. (~userid/public/authprofile)
             * @param (Array) tags Array of tags to be deleted from the entity
             * @param (Function) callback The callback function
             */
            var deleteTags = function(tagLocation, tags, deleteTagsCallback) {
                if (tags.length) {
                    var requests = [];
                    $(tags).each(function(i,val) {
                        requests.push({
                            "url": tagLocation,
                            "method": "POST",
                            "parameters": {
                                "key": "/tags/" + val,
                                ":operation": "deletetag"
                            }
                        });
                    });
                    sakai_serv.batch(requests, function(success, data) {
                        if (!success) {
                            debug.error(val + " tag failed to be removed from " + tagLocation);
                        }
                        if ($.isFunction(deleteTagsCallback)) {
                            deleteTagsCallback(success);
                        }
                    }, true);
                } else {
                    if ($.isFunction(deleteTagsCallback)) {
                        deleteTagsCallback();
                    }
                }
            };

            var tagsToAdd = [];
            var tagsToDelete = [];
            // determine which tags to add and which to delete
            $(newTags).each(function(i,val) {
                if (val.indexOf("directory/") !== 0) {
                    val = newTags[i] = sakai_util.makeSafeTag($.trim(val));
                }
                if (val && (!currentTags || $.inArray(val,currentTags) === -1)) {
                    if (val.length) {
                        if ($.inArray(val, tagsToAdd) < 0) {
                            tagsToAdd.push(val);
                        }
                    }
                }
            });
            $(currentTags).each(function(i,val) {
                if (val.indexOf("directory/") !== 0) {
                    val = currentTags[i] = sakai_util.makeSafeTag($.trim(val));
                }
                if (val && $.inArray(val,newTags) == -1) {
                    if (val.length) {
                        if ($.inArray(val, tagsToDelete) < 0) {
                            tagsToDelete.push(val);
                        }
                    }
                }
            });
            currentTags = currentTags || [];
            // determine the tags the entity has
            var tags = $.unique($.merge($.merge([], currentTags), tagsToAdd)),
                finalTags = [];

            $(tags).each(function(i,val) {
                if (val.indexOf("directory/") !== 0) {
                    val = sakai_util.makeSafeTag(val);
                }
                if ($.inArray(val, tagsToDelete) > -1) {
                    tags.splice(tags.indexOf(val), 1);
                } else if (val && $.trim(val) !== ""){
                    finalTags.push(val);
                }
            });
            deleteTags(tagLocation, tagsToDelete, function(deleteSuccess) {
                setTags(tagLocation, tagsToAdd, function(addSuccess) {
                    if ($.isFunction(callback)) {
                        callback(addSuccess || deleteSuccess, finalTags);
                    }
                });
            });

        },

        /**
         * Truncate a string of text using the threedots plugin
         * @param {String} body String of text to be truncated
         * @param {int} width Width of the parent element
         * @param {Object} params Object containing parameters, Threedots plugin specific. The row limit for widget headers should be 4 rows.
         * @param {String} Optional class(es) to give container div. Used to give specific mark-up to the content to avoid wrong calculations. e.g. s3d-bold
         */
        applyThreeDots : function(body, width, params, optClass, alreadySecure){
            body = sakai_util.Security.safeOutput(body);
            // IE7 and IE6 have trouble with width
            if(!jQuery.support.leadingWhitespace || jQuery.browser.webkit){
                width = width - 15;
            } else {
                width = width - 5;
            }

            // Create elements to apply threedots
            var $container = $("<div class=\"" + optClass + "\" style=\"width:" + width + "px; ; word-wrap:break-word; visibility:hidden;\"><span style=\"word-wrap:break-word;\" class=\"ellipsis_text\">" + body + "</span></div>");
            $("body").append($container);

            // There seems to be a race condition where the
            // newly-added element returns a height of zero.  This
            // would cause ThreeDots to truncate the input string to
            // the first letter.  Try a couple of times for a non-zero
            // height and then give up.
            for (var attempt = 0; attempt < 10; attempt++) {
                if ($container.height() > 0) {
                    $container.ThreeDots(params);
                    break;
                }
            }

            var dotted = $container.children("span").text();
            $container.remove();
            if (!alreadySecure) {
                dotted = sakai_util.Security.safeOutput(dotted);
            }
            // if params contains middledots = true then the string is threedotted in the middle
            if(params && params.middledots && body.length > dotted.length){
                var maxlength = dotted.length - 3;
                if (!alreadySecure) {
                    body = sakai_util.Security.safeOutput(body);
                }
                var prepend = body.slice(0, maxlength / 2);
                var append = body.slice(body.length - (maxlength / 2), body.length);
                return prepend + "..." + append;
            }
            return dotted;
        },

        /**
         * Search for and replace parameters in a template (replaces both keys and properties)
         * primarily used for making unique IDs for the group/course templates in config.js
         *
         * @param {Object} variables The variables to replace in the template with, ie. "groupid"
         * @param {Object} replaceIn The object to modify
         * @return {Object} the template structure with replaced variables
         */
        replaceTemplateParameters : function(variables, replaceIn) {
            var loopAndReplace = function(structure, variable, replace) {
                var toReplace = "${" + variable + "}";
                var regex = new RegExp("\\$\\{" + variable + "\\}", 'g');
                for (var i in structure) {
                    if (structure.hasOwnProperty(i)) {
                        if (_.isString(structure[i]) && structure[i].indexOf(toReplace) !== -1) {
                            structure[i] = structure[i].replace(regex, replace);
                        } else if ($.isPlainObject(structure[i])) {
                            structure[i] = loopAndReplace(structure[i], variable, replace);
                        } else if ($.isArray(structure[i])) {
                            for (var j = 0; j < structure[i].length; j++){
                                structure[i][j] = loopAndReplace(structure[i][j], variable, replace);
                            }
                        }
                        if (i.indexOf(toReplace) !== -1) {
                            var newKey = i.replace(regex, replace);
                            structure[newKey] = structure[i];
                            delete structure[i];
                        }
                    }
                }
                return structure;
            };

            $.each(variables, function(variable,value) {
                replaceIn = loopAndReplace(replaceIn, variable, value);
            });

            return replaceIn;
        },

        /**
         * Check whether there is a valid picture for the user
         * @param {Object} profile The profile object that could contain the profile picture
         * @param {String} type The type of profile we're getting the picture for (group or user)
         * @return {String}
         * The link of the profile picture
         * Will be an empty string if there is no picture
         */
        constructProfilePicture : function(profile, type){
            // profile.basic.elements object should not have picture information
            // if there is profile picture and userId
            // return the picture links
            var imgUrl = sakai_conf.URL.USER_DEFAULT_ICON_URL;
            if (type === 'group' ||
                profile['sakai:category'] === 'group' ||
                profile['sakai:pseudoGroup']) {
                    imgUrl = sakai_conf.URL.GROUP_DEFAULT_ICON_URL;
            }
            var id = null, picture_name = null;
            if (profile["rep:userId"] || profile["sakai:group-id"] || profile["uuid"] || profile["userid"]){
                if (profile["rep:userId"]){
                    id = profile["rep:userId"];
                } else if (profile["sakai:group-id"]){
                    id = profile["sakai:group-id"];
                } else if (profile["uuid"]){
                    id = profile["uuid"];
                } else if (profile["userid"]){
                    id = profile["userid"];
                }
                if (profile.picture) {
                    if (profile.picture.name) {
                        picture_name = profile.picture.name;
                    } else {
                        //change string to json object and get name from picture object
                        try {
                            picture_name = $.parseJSON(profile.picture).name;
                        } catch (e) {
                            picture_name = profile.picture;
                        }
                    }
                    imgUrl = "/~" + sakai_util.safeURL(id) + "/public/profile/" + sakai_util.safeURL(picture_name);
                } else if (profile.basic && profile.basic.elements && profile.basic.elements.picture && profile.basic.elements.picture.value) {
                    if (profile.basic.elements.picture.value.name) {
                        picture_name = profile.basic.elements.picture.value.name;
                    } else {
                        //change string to json object and get name from picture object
                        picture_name = $.parseJSON(profile.basic.elements.picture.value).name;
                    }
                    //change string to json object and get name from picture object
                    return "/~" + id + "/public/profile/" + picture_name;
                } else if (profile.basic && profile.basic.elements && profile.basic.elements.picture && _.isString(profile.basic.elements.picture)) {
                    return profile.basic.elements.picture;
                } else {
                    return imgUrl;
                }
            }
            return imgUrl;
        },

        /**
         * Do some checks on the content to see if it's the default Tinymce content or just empty
         * @param {String} content Content in the form of a string
         * @return{Boolean} True indicates that content is present, False indicates that there is no content
         */
        determineEmptyContent: function(content) {
            var $el = $('<div/>').html(content);
            // Filter out tinyMCE instances
            $('.mceEditor', $el).each(function(index, item) {
                $(item).remove();
            });
            var textPresent = $.trim($el.text());
            var elementArr = ['img', 'iframe', 'frame', 'input', 'select', 'option'];
            var containsElement = false;
            $.each(elementArr, function(i, el) {
                if ($(el, $el).length) {
                    containsElement = true;
                    return false;
                }
            });
            return textPresent || containsElement;
        },

        /**
         * @class notification
         *
         * @description
         * Utility functions related to notifications messages in Sakai3
         *
         * @namespace
         * Notifications messages
         */
        notification : {

            /**
             * Show notification messages
             * @example sakai.api.Util.notification.show("Title Message", "z2", "z01");
             * @param {String} title The notification title (if it is an empty string, the title isn't shown)
             * @param {String} text The text you want to see appear in the body of the notification
             * @param {Constant} [type] The type of the notification. If this is not supplied, we use the type "information"
             * @param {Boolean} sticky The sticky (if it is true, the notification doesn't disappear without using action)
             */
            show : function(title, text, type, sticky){

                // Check whether the text parameter is supplied.
                if(!text){

                    // Log an error message
                    debug.info("sakai.api.Util.notification.show: You need to fill out the 'text' parameter");

                    // Make sure the execution in this function stops
                    return;

                }

                // Check whether the type is an actual object if it is supplied
                if (type && !$.isPlainObject(type)) {

                    // Log an error message
                    debug.info("sakai.api.Util.notification.show: Make sure you supplied a correct type parameter");

                    // Stop the function execution
                    return;

                }

                // Set the notification type
                var notification = type || this.type.INFORMATION;

                // Set the title and text
                notification.title = title;
                notification.text = text;
                notification.sticky = sticky;

                // Show a the actual notification to the user
                $.gritter.add(notification);

            },


            /**
             * Remove all the notification messages that are currently visible to the user
             */
            removeAll : function(){

                // Remove gritter notification messages
                // We don't use the $.gritter.removeAll method since that causes pop-ups to flicker
                $('#gritter-notice-wrapper').remove();

            },


            /**
             * @class type
             *
             * @description
             * Namespace that contains all the different notification types
             *
             * @namespace
             * Notifications types
             */
            type : {

                /**
                 * Object containing settings for the information notification type
                 */
                INFORMATION : $.extend(true, {}, sakai_conf.notification.type.INFORMATION),

                /**
                 * Object containing settings for the error notification type
                 */
                ERROR : $.extend(true, {}, sakai_conf.notification.type.ERROR)
                }
        },

        /**
         * Allows you to show a progress indicator on the screen. Example of where this is done are the Add Content
         * and the Create World widgets
         */
        progressIndicator: {

            /**
             * Show the progress indicator on the screen
             * @param {Object} title    Title of the indicator screen
             * @param {Object} body     Additional text to be shown in the indicator
             */
            showProgressIndicator: function(title, body){
                // Create the HTML for the progress indicator if it doesn't exist yet
                if ($("#sakai_progressindicator").length === 0){
                    var htmlCode = '<div id="sakai_progressindicator" class="s3d-dialog s3d-dialog-container" style="display:none;">';
                    htmlCode += '<h1 id="sakai_progressindicator_title" class="s3d-dialog-header"></h1><p id="sakai_progressindicator_body"></p>';
                    htmlCode += '<div class="s3d-inset-shadow-container"><img src="/dev/images/progress_bar.gif"/></div></div>';
                    var notification = $(htmlCode);
                    $('body').append(notification);
                    sakai_util.Modal.setup('#sakai_progressindicator', {
                        modal: true,
                        overlay: 20,
                        zIndex: 40003,
                        toTop: true
                    });
                }
                // Fill out the title and the body
                $("#sakai_progressindicator_title").html(title);
                $("#sakai_progressindicator_body").html(body);
                // Show the indicator
                sakai_util.Modal.open('#sakai_progressindicator');
            },

            /**
             * Hide the existing progress indicator (if there is one)
             */
            hideProgressIndicator: function(){
                sakai_util.Modal.close('#sakai_progressindicator');
            }            

        },

        /**
         * Parse a ISO8601 date into a JavaScript date object.
         *
         * <p>
         *     Supported date formats:
         *     <ul>
         *         <li>2010</li>
         *         <li>2010-02</li>
         *         <li>2010-02-18</li>
         *         <li>2010-02-18T07:44Z</li>
         *         <li>1997-07-16T19:20+01:00</li>
         *         <li>1997-07-16T19:20:30+01:00</li>
         *         <li>1269331220896</li>
         *     </ul>
         * </p>
         *
         * <p>
         *     External links:
         *     <ul>
         *         <li><a href="http://www.w3.org/TR/NOTE-datetime">W3C datetime documentation</a></li>
         *         <li><a href="http://delete.me.uk/2005/03/iso8601.html">ISO8601 JavaScript function</a></li>
         *         <li><a href="http://confluence.sakaiproject.org/display/KERNDOC/KERN-643+Multiple+date+formats+in+the+back-end">Specification</a></li>
         *     </ul>
         * </p>
         *
         * @param {String|Integer} dateInput
         *     The date that needs to be converted to a JavaScript date object.
         *     If the format is in milliseconds, you need to provide an integer, otherwise a string
         * @return {Date} JavaScript date object
         */
        parseSakaiDate : function(dateInput) {

            // Define the regular expressions that look for the format of
            // the dateInput field
            var regexpInteger = /^\d+$/;
            var regexpISO8601 = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
                "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" +
                "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";

            // Test whether the format is in milliseconds
            if(regexpInteger.test(dateInput) && typeof dateInput !== "string") {
               return new Date(dateInput);
            }

            // Test whether you get an ISO8601 format back
            var d = dateInput.match(new RegExp(regexpISO8601));

            var offset = 0;
            var date = new Date(d[1], 0, 1);
            var dateOutput = new Date();

            if (d[3]) { date.setMonth(d[3] - 1); }
            if (d[5]) { date.setDate(d[5]); }
            if (d[7]) { date.setHours(d[7]); }
            if (d[8]) { date.setMinutes(d[8]); }
            if (d[10]) { date.setSeconds(d[10]); }
            if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
            if (d[14]) {
                offset = (Number(d[16]) * 60) + Number(d[17]);
                offset *= ((d[15] === '-') ? 1 : -1);
            }

            // Set the timezone for the date object
            offset -= date.getTimezoneOffset();
            var time = (Number(date) + (offset * 60 * 1000));
            dateOutput.setTime(Number(time));

            // Return the date output
            return dateOutput;
        },


        /**
         * Parse an RFC822 date into a JavaScript date object.
         * Examples of RFC822 dates:
         * Wed, 02 Oct 2002 13:00:00 GMT
         * Wed, 02 Oct 2002 13:00:00 +0200
         *
         * @param {String} dateString
         * @return {Date}  a Javascript date object
         */
        parseRFC822Date : function(dateString) {

            var dateOutput = new Date();

            var dateElements = dateString.split(" ");
            var dateElementsTime = dateElements[4].split(":");

            var months = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
            var zones = {
                "UT": 0,
                "GMT": 0,
                "EST": -5,
                "EDT": -4,
                "CST": -6,
                "CDT": -5,
                "MST": -7,
                "MDT": -6,
                "PST": -8,
                "PDT": -7,
                "Z": 0,
                "A":-1,
                "M":-12,
                "N": 1,
                "Y": 12
            };

            // Set day
            if (dateElements[1]) { dateOutput.setDate(Number(dateElements[1])); }

            //Set month
            if (dateElements[2]) { dateOutput.setMonth(months[dateElements[2]]); }

            // Set year
            if (dateElements[3]) { dateOutput.setFullYear(Number(dateElements[3])); }

            // Set hour
            if (dateElements[4] && dateElementsTime[0]) {

                // Take timezone offset into account
                if (zones[dateElements[5]]) {
                    dateOutput.setHours(Number(dateElementsTime[0]) + zones[dateElements[5]]);
                } else if (!isNaN(parseInt(dateElements[5], 10))) {
                    var zoneTimeHour = Number(dateElements[5].substring(0,2));
                    dateOutput.setHours(Number(dateElementsTime[0]) + zoneTimeHour);
                }
            }

            // Set minutes
            if (dateElements[4] && dateElementsTime[1]) {

                if (!isNaN(parseInt(dateElements[5], 10))) {
                    var zoneTimeMinutes = Number(dateElements[5].substring(3,4));
                    dateOutput.setMinutes(Number(dateElementsTime[1]) + zoneTimeMinutes);
                } else {
                    dateOutput.setMinutes(Number(dateElementsTime[1]));
                }
            }

            // Set seconds
            if (dateElements[4] && dateElementsTime[2]) { dateOutput.setSeconds(dateElementsTime[2]); }

            return dateOutput;

        },

        include : {
            /**
             * Generic function that will insert an HTML tag into the head of the document. This
             * will be used to both insert CSS and JS files
             * @param {Object} tagname
             *  Name of the tag we want to insert. This is supposed to be "link" or "script".
             * @param {Object} attributes
             *  A JSON object that contains all of the attributes we want to attach to the tag we're
             *  inserting. The keys in this object are the attribute names, the values in the object
             *  are the attribute values
             */
            insertTag : function(tagname, attributes) {
                var tag = document.createElement(tagname);
                var head = document.getElementsByTagName('head').item(0);
                for (var a in attributes){
                    if(attributes.hasOwnProperty(a)){
                        tag[a] = attributes[a];
                    }
                }
                head.appendChild(tag);
            },

            /**
             * Check to see if the tag+attributes combination currently exists in the DOM
             *
             * @param {Object} tagname
             *  Name of the tag we want to insert. This is supposed to be "link" or "script".
             * @param {Object} attributes
             *  A JSON object that contains all of the attributes we want to attach to the tag we're
             *  inserting. The keys in this object are the attribute names, the values in the object
             *  are the attribute values
             * @return {jQuery|Boolean} returns the selected objects if found, otherwise returns false
             */
            checkForTag : function(tagname, attributes) {
                var selector = tagname;
                for (var i in attributes) {
                    if (i && attributes.hasOwnProperty(i)) {
                        selector += "[" + i + "*='" + attributes[i] + "']";
                    }
                }
                if ($(selector).length) {
                    return $(selector);
                }
                else {
                    return false;
                }
            },

            /**
             * Load a JavaScript file into the document
             * @param {String} URL of the JavaScript file relative to the parent dom.
             */
            js : function(url) {
                var attributes = {"src": url, "type": "text/javascript"};
                var existingScript = this.checkForTag("script", attributes);
                if (existingScript) {
                    // Remove the existing script so we can place in a new one
                    // We need to do this otherwise the init functions that need to be called
                    // at the end of widgets never get called again
                    existingScript.remove();
                }
                this.insertTag("script", {"src" : url, "type" : "text/javascript"});
            },
            /**
             * Load a CSS file into the document
             * @param {String} URL of the CSS file relative to the parent dom.
             */
            css : function(url) {
                var attributes = {"href" : url, "type" : "text/css", "rel" : "stylesheet"};
                var existingStylesheet = this.checkForTag("link", attributes);
                // if the stylesheet already exists, don't add it again
                if (!existingStylesheet) {
                    this.insertTag("link", attributes);
                }
            }

        },

        /**
         * @class Sorting
         *
         * @description
         * Sorting algorithms
         *
         * @namespace
         * Sorting functions
         */
        Sorting : {

            /**
            * Natural sorting algorithm, for sorting file lists etc.
            * @example sakai.api.Util.Sorting("z1", "z2", "z01");
            * @param {String|Integer|Number} a The first element you want to sort
            * @param {String|Integer|Number} b The second element you want to sort
            * @return {Integer} [0 | 1 | -1]
            *     <ul>
            *         <li>-1: sort a so it has a lower index than b</li>
            *         <li>0: a and b are equal</li>
            *         <li>1: sort b so it has a lower index than a</li>
            *     </ul>
            */
           naturalSort: function(a, b) {

                /*
                 * Natural Sort algorithm for Javascript - Version 0.5 - Released under MIT license
                 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
                 * Contributors: Mike Grier (mgrier.com), Clint Priest, Kyle Adams, guillermo
                 * Released under MIT license.
                 * http://code.google.com/p/js-naturalsort/source/browse/trunk/naturalSort.js
                 */

                // setup temp-scope variables for comparison evauluation
                var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|-?[0-9]+)/gi,
                    sre = /(^[ ]*|[ ]*$)/g,
                    hre = /^0x[0-9a-f]+$/i,
                    dre = /(^[0-9\-\.\/]{5,}$)|[0-9]+:[0-9]+|( [0-9]{4})/i,
                    ore = /^0/,
                    // convert all to strings and trim()
                    x = a ? a.toString().toLowerCase().replace(sre, '') || '' : '',
                    y = b ? b.toString().toLowerCase().replace(sre, '') || '' : '',
                    // chunk/tokenize
                    xN = x.replace(re, String.fromCharCode(0) + "$1" + String.fromCharCode(0)).replace(/\0$/,'').replace(/^\0/,'').split(String.fromCharCode(0)),
                    yN = y.replace(re, String.fromCharCode(0) + "$1" + String.fromCharCode(0)).replace(/\0$/,'').replace(/^\0/,'').split(String.fromCharCode(0)),
                    // numeric, hex or date detection
                    xD = parseInt(x.match(hre), 10) || (xN.length != 1 && x.match(dre) && (new Date(x)).getTime()),
                    yD = parseInt(y.match(hre), 10) || xD && (new Date(y)).getTime() || null;
                // natural sorting of hex or dates - prevent '1.2.3' valid date
                if (yD) {
                    if ( xD < yD ) {return -1;}
                    else if ( xD > yD ) {return 1;}
                }
                // natural sorting through split numeric strings and default strings
                for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
                    // find floats not starting with '0', string or 0 if not defined (Clint Priest)
                    oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
                    oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
                    // handle numeric vs string comparison - number < string - (Kyle Adams)
                    if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
                        return (isNaN(oFxNcL)) ? 1 : -1;
                    }
                    // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
                    else if (typeof oFxNcL !== typeof oFyNcL) {
                        oFxNcL += '';
                        oFyNcL += '';
                    }
                    if (oFxNcL < oFyNcL) {return -1;}
                    if (oFxNcL > oFyNcL) {return 1;}
                }
                if (x === y) {
                    if (a < b) {return -1;}
                    if (a > b) {return 1;}
                }
                return 0;
           }
        },

        /**
         * loadSkins
         * Loads in any skins defined in sakai.config.skinCSS
         */
        loadSkinsFromConfig : function() {
            if (sakai_conf.skinCSS && sakai_conf.skinCSS.length) {
                $(sakai_conf.skinCSS).each(function(i,val) {
                    sakai_util.include.css(val);
                });
            }
        },

        // TODO need to refactor this, this won't work with the new system
        getPageContext : function() {
            if (sakai_global.content_profile) {
                return "content";
            } else if (sakai_global.group || sakai_global.groupedit) {
                return "group";
            } else if (sakai_global.directory) {
                return "directory";
            } else if (sakai_global.content_profile || sakai_global.profile){
                return "user";
            } else {
                return false;
            }
        },

        /**
         * Sets the browsers title
         *
         * @param {String} title The string to be added to the page title
         * @param {Boolean} append Determines if the title should apply to future title changes for the current page
         * @param {Boolean} overwrite Determines if the title should overwrite the current page title
         */
        setPageTitle : function(title, append, overwrite) {
            var pageTitle = sakai_util.data.pageTitle + title;
            if (overwrite) {
                sakai_util.data.pageTitle = title;
                pageTitle = sakai_util.data.pageTitle;
            } else if (append) {
                sakai_util.data.pageTitle += title;
                pageTitle = sakai_util.data.pageTitle;
            }
            document.title = pageTitle;
        },

        getDirectoryStructure : function(){
            /**
             * Converts directory array into a node structure
             * so that it can be rendered into the jstree.
             *
             * @param {Object} directory list of directories
             * @return result the json object in the structure necessary to render in jstree
             */
            var convertToHierarchy = function(directory){
                var item, path;

                var result = [];
                // loop through all the directory
                for (item in directory) {
                    if (directory.hasOwnProperty(item) && !directory[item].divider) {
                        // url for the first level nodes
                        var url = item;
                        // call buildnoderecursive to get the node structure to render.
                        result.push(buildNodeRecursive(item, directory, url));
                    }
                }
                return result;
            };

            /**
             * Recursive method that create the node structure
             * so that it can be rendered into the jstree.
             *
             * @param {String} node_id  the unique id for each node for example firstyearcourses
             * @param {Object} directory directory list json object for example "collegeofengineering": { ... }
             * @param {String} url the url of the page to render when directory node is clicked for example /directory#collegeofengineering
             *
             * @return node the json object in the structure necessary to render in jstree
             */
            var buildNodeRecursive = function(node_id, directory, url, parent_title){
                // node title
                var p_title = directory[node_id].title;
                // node id
                var p_id = node_id;
                // icon url
                var p_url = directory[node_id].icon;
                // description
                var p_description = directory[node_id].description;

                // create the node based on the parameters
                var node = {
                    attr: {
                        id: p_id,
                        "data-url": p_url,
                        "data-description": p_description
                    },
                    data: {
                        title: p_title,
                        attr: {
                            "data-path": url,
                            "data-id": p_id,
                            "title": p_title
                        }
                    },
                    children: []
                };
                if ( parent_title ) {
                    node.data.attr["data-long-title"] = parent_title + " » " + p_title;
                    node.data.attr["data-parent"] = false;
                } else {
                    node.data.attr["data-long-title"] = p_title;
                    node.data.attr["data-parent"] = true;
                }
                // if current node has any children
                // call buildNoderecursive method create the node structure for
                // all level of child
                for (var child in directory[node_id].children) {
                    if (directory[node_id].children.hasOwnProperty(child)) {
                        // for each child node, call buildnoderecursive to build the node structure
                        // pass current child(id), the list of all sibligs(json object) and url append/child
                        // for example first level node /directory#courses/firstyearcourses
                        // for second level node /directory#course/firstyearcourses/chemistry
                        node.children.push(buildNodeRecursive(child, directory[node_id].children, url + "/" + child, p_title));
                    }
                }
                return node;
            };

            return convertToHierarchy(sakai_conf.Directory);
        },

        /**
         * Recursive function that gets the title corresponding to an ID in the directory
         * @param {Object} key Key to get title for
         * @param {Object} child Object to check for children next, if not supplied start with first child
         */
        getValueForDirectoryKey : function( key, _directory ) {
            var directory = _directory ? _directory : this.getDirectoryStructure();

            var searchDirectoryForKey = function(key, child){
                var ret = false;

                if (key == child.attr.id) {
                    ret = child.data.title;
                } else {
                    if (child.children) {
                        for (var item in child.children) {
                            if (child.children.hasOwnProperty(item)) {
                                var result = searchDirectoryForKey(key, child.children[item]);
                                if (result) {
                                    ret = result;
                                }
                            }
                        }
                    }
                }
                return ret;
            };

            var l = directory.length;
            var result;
            for (var i=0; i<l; i++) {
                result = searchDirectoryForKey(key, directory[i]);
                if (result) {
                    break;
                }
            }
            return result;
        },

        /**
         * Get the string value for a directory tag
         * directory/medicineanddentistry/clinicalmedicine => Medicine and Dentistry » Clinical Medicine
         *
         * @param {String} tag The directory tag
         * @return {String} The printable tag
         */
        getValueForDirectoryTag: function( tag ) {
            var ret = "";
            var directoryItems = tag.split("/");
            for ( var i = 1; i < directoryItems.length; i++ ) {
                ret += sakai_util.getValueForDirectoryKey( directoryItems[ i ] ) + " » ";
            }
            // Remove the trailing »
            ret = ret.substr( 0, ret.length - 3 );
            return ret;
        },

        Activity : {
            /**
             * Wrapper function for creating a Nakamura activity
             *
             * @param nodeUrl {String} The URL of the node we would like the activity to be
             * stored on
             * @param appID {String} The ID of the application/functionality creating the
             * activity
             * @param templateID {String} The ID of the activity template
             * @param extraData {Object} Any extra data which will be stored on the activity
             * node
             * @param callback {Function} Callback function executed at the end of the
             * operation
             * @returns void
             */
             createActivity : function(nodeUrl, appID, templateID, extraData, callback) {

                // Check required params
                if (typeof appID !== "string" || appID === "") {
                    debug.error("sakai.api.Activity.createActivity(): appID is required argument!");
                    return;
                }
                if (typeof templateID !== "string" || templateID === "") {
                    debug.error("sakai.api.Activity.createActivity(): templateID is required argument!");
                }

                // Create event url with appropriate selector
                var activityUrl = nodeUrl + ".activity.json";
                // Create data object to send
                var dataToSend = {
                    "sakai:activity-appid": appID,
                    "sakai:activity-templateid": templateID
                };
                for (var i in extraData) {
                    if (extraData.hasOwnProperty(i)) {
                        dataToSend[i] = extraData[i];
                    }
                }

                // Send request to create the activity
                $.ajax({
                    url: activityUrl,
                    traditional: true,
                    type: "POST",
                    data: dataToSend,
                    success: function(data){
                        if ($.isFunction(callback)) {
                            callback(data, true);
                        }
                    },
                    error: function(xhr, textStatus, thrownError) {

                        if ($.isFunction(callback)) {
                            callback(xhr.status, false);
                        }
                    }
                });
            }
        },
        Datetime: {
            /**
             * Returns the current time in GMT milliseconds from the epoch
             */
            getCurrentGMTTime : function() {
                var d = new Date();
                d = sakai_util.Datetime.toGMT(d);
                return d.getTime();
            },
            getCurrentTime : function(meData) {
                var d = new Date();
                d = sakai_util.Datetime.toGMT(d);
                d = sakai_l10n.fromGMT(d, meData);
                return d;
            },
            parseDateString : function(dateString){
                var d = new Date();
                d.setFullYear(parseInt(dateString.substring(0,4),10));
                d.setMonth(parseInt(dateString.substring(5,7),10) - 1);
                d.setDate(parseInt(dateString.substring(8,10),10));
                d.setHours(parseInt(dateString.substring(11,13),10));
                d.setMinutes(parseInt(dateString.substring(14,16),10));
                d.setSeconds(parseInt(dateString.substring(17,19),10));
                return d;
            },
            toGMT : function(date){
                date.setFullYear(date.getUTCFullYear());
                date.setMonth(date.getUTCMonth());
                date.setDate(date.getUTCDate());
                date.setHours(date.getUTCHours());
                return date;
            }
        },
        /*
         * Functionality that allows you to create HTML Templates and give that template
         * a JSON object. That template will then be rendered and all of the values from
         * the JSON object can be used to insert values into the rendered HTML. More information
         * and examples can be found over here:
         *
         * http://code.google.com/p/trimpath/wiki/JavaScriptTemplates
         *
         * Template should be defined like this:
         *  <div><!--
         *   // Template here
         *  --></div>
         *
         *  IMPORTANT: There should be no line breaks in between the div and the <!-- declarations,
         *  because that line break will be recognized as a node and the template won't show up, as
         *  it's expecting the comments tag as the first one.
         *
         *  We do this because otherwise a template wouldn't validate in an HTML validator and
         *  also so that our template isn't visible in our page.
         */

        /**
         * A version of encodeURIComponent that does not encode i18n characters
         * when using utf8.  The javascript global encodeURIComponent works on
         * the ascii character set, meaning it encodes all the reserved characters
         * for URI components, and then all characters above Char Code 127. This
         * version uses the regular encodeURIComponent function for ascii
         * characters, and passes through all higher char codes.
         *
         * At the time of writing I couldn't find a version with these symantics
         * (which may or may not be legal according to various RFC's), but this
         * implementation can be swapped out with one if it presents itself.
         *
         * @param {String} String to be encoded.
         * @returns Encoded string.
         */
        safeURL: function(str) {
            // First, ensure that the incoming value is treated as a string.
            str = "" + str;
            var togo="";
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) < 127) {
                    togo += encodeURIComponent(str[i]);
                } else {
                    togo += str[i];
                }
            }
            return togo;
        },

        /**
         * Convert a string into something that is safe to put into an HTML attribute.
         * This is made available as a modifier to TrimPath templates, as we can't call
         * the .data() function of jQuery whilst rendering a template
         * @param {Object} str    String to be transformed into a string safe for use in an attribute
         */
        saneHTMLAttribute: function(str) {
            if (str) {
                return sakai_util.Security.safeOutput(str.replace(/"/g, "\\\"").replace(/'/g, "\\\'"));
            } else {
                return "";
            }
        },

        /**
         * A cache that will keep a copy of every template we have parsed so far. Like this,
         * we avoid having to parse the same template over and over again.
         */
        templateCache : [],

        macroCache : { macros: {}},
        
        trimpathModifiers : {
            safeURL: function(str) {
                return sakai_util.safeURL(str);
            },
            escapeHTML: function(str) {
                return sakai_util.Security.escapeHTML(str);
            },
            saneHTML: function(str) {
                return sakai_util.Security.saneHTML(str);
            },
            safeOutput: function(str) {
                return sakai_util.Security.safeOutput(str);
            },
            saneHTMLAttribute: function(str) {
                return sakai_util.saneHTMLAttribute(str);
            }
        },

        /**
          * Process trimpath macros in html file at url, which will then be available 
          * with the macro function inside regular rendering. The optional asyncreq option allows
          * the request to be syncronous, which would mostly be for on-demand loading (because
          * that is happening during rendering and it needs the template to continue. )
          * @function
          * @param {String} url with macros to load
          * @param {Boolean} Optional parameter to distinguish whether the loading should happen
          * syncronously. Default is true (async)
          */
        processMacros : function (url, asyncreq) {
            var asyncsetting = true;
            if (asyncreq === false) {
                asyncsetting = asyncreq;
            }
            var mc = this.macroCache;
            $.ajax({
                url: url, 
                async: asyncsetting, // Sometimes we need to immediately return this value for on-demand loading.
                success: function(data) { 
                  mc._MODIFIERS = sakai_util.trimpathModifiers; 
                  sakai_i18n.General.process(data).process(mc);
                }
            });
        },

        /**
          * While the processMacros function allows a way to make macros that can
          * be shared and discovered between widgets automatically, this function
          * allows for a simpler use case where a widget developer may just want some
          * macros for their specific widget. In this case they can put all their
          * macros in a template element ( similar to regular template elements),
          * and then get a macro set back that can be used in between the rest of
          * the templates they have defined in their page. 
          *
          * @param {String|jQuery} Raw String or jQuery element containing the 
          * text of the macro definitions.
          * @return An object containing the macro functions. This can be added to the
          * context of subsequent TemplateRenderers and called like regular trimpath
          * macros.
          */
        processLocalMacros : function(templateElement) {
            var templateStr = "";
            if (templateElement instanceof jQuery && templateElement.length){
                var firstNode = templateElement.contents(":first-child");
                if (firstNode.length) {
                    var firstNodeDomElem = firstNode.get(0);
                    if (firstNodeDomElem.nodeType === 8 || firstNodeDomElem.nodeType === 4) {
                        templateStr = firstNodeDomElem.data;
                    }
                    else {
                        templateStr = templateElement.html();
                    }
                }
            }
            else if (_.isString(templateElement)) {
                templateStr = templateElement;
            }
            var contextdata = { macros: {} };
            contextdata._MODIFIERS = sakai_util.trimpathModifiers;
            sakai_i18n.General.process(templateStr).process(contextdata);
            return contextdata.macros;
        },

        /**
        * Trimpath Template Renderer: Renders the template with the given JSON object, inserts it into a certain HTML
        * element if required, and returns the rendered HTML string
        * @function
        * @param {String|Object} templateElement The name of the template HTML ID or a jQuery selection object.
        * @param {Object} templateData JSON object containing the template data
        * @param {Object} outputElement (Optional) jQuery element in which the template needs to be rendered
        * @param {Boolean} doSanitize (Optional) perform html sanitization. Defaults to true
        */
        TemplateRenderer : function (templateElement, templateData, outputElement, doSanitize) {

            var templateName;
            var sanitize = true;
            if (doSanitize !== undefined) {
                sanitize = doSanitize;
            }

            // The template name and the context object should be defined
            if(!templateElement || !templateData){
                throw " TemplateRenderer: the template name or the templateData is not defined";
            }

            if(templateElement instanceof jQuery && templateElement[0]){
                templateName = templateElement[0].id;
            }
            else if (typeof templateElement === "string"){
                templateName = templateElement.replace("#", "");
                templateElement = $("#" + templateName);
            }
            else {
                debug.error(templateElement);
                throw "TemplateRenderer: The templateElement '" + templateElement + "' is not in a valid format or the template couldn't be found.";
            }

            if (!this.templateCache[templateName]) {
                var templateNode = templateElement.get(0);
                if (templateNode) {
                    var firstNode = templateNode.firstChild;
                    var template = null;
                    // Check whether the template is wrapped in <!-- -->
                    if (firstNode && (firstNode.nodeType === 8 || firstNode.nodeType === 4)) {
                        template = firstNode.data.toString();
                    }
                    else {
                        template = templateNode.innerHTML.toString();
                    }
                    // Parse the template through TrimPath and add the parsed template to the template cache
                    try {
                        this.templateCache[templateName] = TrimPath.parseTemplate(template, templateName);
                    } catch (e) {
                        debug.error("TemplateRenderer: parsing failed: " + e);
                    }


                }
                else {
                    debug.error("TemplateRenderer: The template '" + templateName + "' could not be found");
                }
            }

            /* A grep of the code base indicates no one is using _MODIFIERS at
             * the moment.
             */
            if (templateData._MODIFIERS) {
                debug.error("Someone has passed data to sakai.api.util.TemplateRenderer with _MODIFIERS");
            }
            templateData._MODIFIERS = sakai_util.trimpathModifiers;
            if (templateData.macro) {
                debug.error("Someone has passed data to sakai.api.util.TemplateRenderer with macro()");
            }
            templateData.macro = function() {
                var macroname = arguments[0];
                var args = []; 
                for (var i = 1; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                if (!sakai_util.macroCache.macros[macroname]) {
                    var dot = macroname.lastIndexOf('.');
                    if (dot > -1) { 
                        sakai_util.processMacros('/dev/macros/'+macroname.slice(0,dot)+'.html',false);
                        if (sakai_util.macroCache.macros[macroname]) {
                            return sakai_util.macroCache.macros[macroname].apply(this, args);
                        }
                    }
                }
                else {
                    return sakai_util.macroCache.macros[macroname].apply(this, args);
                }
            };

            // Run the template and feed it the given JSON object
            var render = "";
            try {
                render = this.templateCache[templateName].process(templateData, {"throwExceptions": true});
            } catch (err) {
                debug.error("TemplateRenderer: rendering of Template \"" + templateName + "\" failed: " + err);
            }

            delete templateData._MODIFIERS;
            delete templateData.macro;

            // Run the rendered html through the sanitizer
            if (sanitize) {
                render = sakai_util.Security.saneHTML(render);
            }

            // Check it there was an output element defined
            // If so, put the rendered template in there
            if (outputElement) {
                outputElement.html(render);
                sakai_util.Draggable.setupDraggable({}, outputElement);
                sakai_util.Droppable.setupDroppable({}, outputElement);

                // tell MathJax about the updated element
                //MathJax.Hub.Queue(["Typeset", MathJax.Hub, outputElement]);
            }

            return render;
        },
        Security: {
            /**
             * Encodes the HTML characters inside a string so that the HTML characters (e.g. <, >, ...)
             * are treated as text and not as HTML entities
             *
             * @param {String} inputString  String of which the HTML characters have to be encoded
             *
             * @returns {String} HTML Encoded string
             */
            escapeHTML : function(inputString){
                if (inputString) {
                    return $("<div/>").text(inputString).html().replace(/\"/g,"&quot;");
                } else {
                    return "";
                }
            },

            /**
             * Unescapes HTML entities in a string
             *
             * @param {String} inputString  String of which the HTML characters have to be unescaped
             *
             * @returns {String} normal HTML string
             */
            unescapeHTML : function(inputString) {
                if (inputString) {
                    return $("<div/>").html(inputString).text();
                } else {
                    return "";
                }
            },

            sanitizeObject : function(data) {
                var newobj;
                if ($.isPlainObject(data)) {
                    newobj = $.extend(true, {}, data);
                } else if ($.isArray(data)) {
                    newobj = $.merge([], data);
                }
                $.each(newobj, function(key,val) {
                    if ($.isPlainObject(val) || $.isArray(val)) {
                        newobj[key] = sakai_util.Security.safeDataSave(newobj[key]);
                    } else {
                        newobj[key] = sakai_util.Security.safeOutput(val);
                    }
                });
                return newobj;
            },

            safeOutput: function(data) {
                return sakai_util.Security.saneHTML(sakai_util.Security.escapeHTML(data));
            },

            /**
             * Represent URL if any in an anchor tag.
             * @param {Object} message Message that user has entered.
             */
            replaceURL : function(message){
                // link is already wrap in anchor tag do nothing
                // but if it is not wrap in the anchor tag, wrap in the anchor tag.
                return message.replace(/(<a[^>]*>)?((\w+):\/\/[\S]+([^<br]\b|$))/g, function($0,$1){
                    return $1?$0:"<a href='"+$0+"' class='my_link s3d-regular-links s3d-bold' target='_blank'>"+$0+"</a>";
                });
            },

            /**
             * Sanitizes HTML content. All untrusted (user) content should be run through
             * this function before putting it into the DOM
             *
             * @param inputHTML {String} The content string we would like to sanitize
             *
             * @returns {String} Escaped and sanitized string
             */
            saneHTML : function(inputHTML) {

                if (inputHTML === "") {
                    return "";
                }

                // Filter which runs through every url in inputHTML
                var filterUrl = function(url) {

                    // test for javascript in the URL and remove it
                    try {
                        var testUrl = decodeURIComponent(url.replace(/\s+/g, ""));
                        var js = "javascript"; // for JSLint to be happy, this needs to be broken up
                        js += ":;";
                        var jsRegex = new RegExp("^(.*)javascript:(.*)+$");
                        var vbRegex = new RegExp("^(.*)vbscript:(.*)+$");
                        if ((jsRegex.test(testUrl) || vbRegex.test(testUrl)) && testUrl !== js) {
                            url = null;
                        } else if (testUrl !== js) {
                            // check for utf-8 unicode encoding without semicolons
                            testUrl = testUrl.replace(/&/g, ";&");
                            testUrl = testUrl.replace(";&", "&") + ";";

                            var nulRe = /\0/g;
                            testUrl = html.unescapeEntities(testUrl.replace(nulRe, ''));

                            if (jsRegex.test(testUrl) || vbRegex.test(testUrl)) {
                                url = null;
                            }
                        }
                    } catch (err){
                        debug.error("Error occured when decoding URI Component");
                    }

                    return url;

                };

                // Filter which runs through every name id and class
                var filterNameIdClass = function(nameIdClass) {

                    return nameIdClass;

                };

                html4.ELEMENTS["video"] = 0;
                html4.ATTRIBS["video::src"] = 0;
                html4.ATTRIBS["video::class"] = 0;
                html4.ATTRIBS["video::autoplay"] = 0;
                html4.ATTRIBS["li::data-sakai-ref"] = 0;
                html4.ATTRIBS["li::data-sakai-path"] = 0;
                html4.ATTRIBS["span::sakai-entityid"] = 0;
                html4.ATTRIBS["button::sakai-entityid"] = 0;
                html4.ATTRIBS["button::sakai-entityname"] = 0;
                html4.ATTRIBS["button::sakai-entitytype"] = 0;
                html4.ATTRIBS["button::sakai-entitypicture"] = 0;
                html4.ATTRIBS["button::entitypicture"] = 0;
                html4.ATTRIBS["div::sakai-worldid"] = 0;
                html4.ATTRIBS["a::data-reset-hash"] = 0;
                html4.ATTRIBS["a::aria-haspopup"] = 0;
                html4.ATTRIBS["a::role"] = 0;
                html4.ATTRIBS["ul::aria-hidden"] = 0;
                html4.ATTRIBS["ul::role"] = 0;

                /**
                 * Remove expressions from a CSS style (only an issue in IE)
                 * @param {String} cssStyle The CSS style we want to remove expressions from
                 * @return {String} A CSS style that doesn't contain an expression
                 */
                var removeExpression = function(cssStyle) {

                    // Sometimes cssStyle will be undefined/null
                    // if that is the case, we just return it
                    if (!cssStyle) {
                        return cssStyle;
                    }

                    // We first need to filter out all the comments
                    // since we also need to catch expr/*XSS*/ession
                    var regex = /\/\*.+?\*\//g;
                    cssStyle = cssStyle.replace(regex, '');

                    // If we encounter an expression, we remove the complete CSS style
                    regex = /expression\(/g;
                    if (cssStyle.search(regex) !== -1) {
                        cssStyle = '';
                    }
                    return cssStyle;
                };

                // A slightly modified version of Caja's sanitize_html function to allow style="display:none;"
                var sakaiHtmlSanitize = function(htmlText, opt_urlPolicy, opt_nmTokenPolicy) {
                    var out = [];
                    html.makeHtmlSanitizer(
                        function sanitizeAttribs(tagName, attribs) {
                            for (var i = 0; i < attribs.length; i += 2) {
                                var attribName = attribs[i];
                                var value = attribs[i + 1];
                                var atype = null, attribKey;
                                if (html4.ATTRIBS.hasOwnProperty(tagName + '::' + attribName)) {
                                    attribKey = tagName + '::' + attribName;
                                    atype = html4.ATTRIBS[attribKey];
                                } else if (html4.ATTRIBS.hasOwnProperty('*::' + attribName)) {
                                    attribKey = '*::' + attribName;
                                    atype = html4.ATTRIBS[attribKey];
                                } else if (attribName.indexOf('data-') === 0) {
                                    atype = html4.atype.IDREFS;
                                }
                                if (atype !== null) {
                                    switch (atype) {
                                        case html4.atype.SCRIPT:
                                        case html4.atype.STYLE:
                                            var accept = ["color", "display", "background-color", "font-weight", "font-family",
                                                          "padding", "padding-left", "padding-right", "text-align", "font-style",
                                                          "text-decoration", "border", "visibility", "font-size", "width"];
                                            var sanitizedValue = "";
                                            if (value){
                                                var vals = value.split(";");
                                                for (var attrid = 0; attrid < vals.length; attrid++){
                                                    var attrValue = $.trim(vals[attrid].split(":")[0]).toLowerCase();
                                                    if ($.inArray(attrValue, accept) !== -1){
                                                        sanitizedValue += removeExpression(vals[i]);
                                                    }
                                                }
                                                if (!sanitizedValue) {
                                                    value = null;
                                                }
                                            } else {
                                                value = sanitizedValue;
                                            }
                                            break;
                                        case html4.atype.IDREF:
                                        case html4.atype.IDREFS:
                                        case html4.atype.GLOBAL_NAME:
                                        case html4.atype.LOCAL_NAME:
                                        case html4.atype.CLASSES:
                                            value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
                                            break;
                                        case html4.atype.URI:
                                            value = opt_urlPolicy && opt_urlPolicy(value);
                                            break;
                                        case html4.atype.URI_FRAGMENT:
                                            if (value && '#' === value.charAt(0)) {
                                                value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
                                                if (value) {
                                                    value = '#' + value;
                                                }
                                            } else {
                                                value = null;
                                            }
                                            break;
                                    }
                                } else {
                                    value = null;
                                }
                                attribs[i + 1] = value;
                            }
                            return attribs;
                        })(htmlText, out);
                    return out.join('');
                };

                // Call a slightly modified version of Caja's sanitizer
                return sakaiHtmlSanitize(inputHTML, filterUrl, filterNameIdClass);

            },

            /**
             * Function that can be called by pages that can't find the content they are supposed to
             * show.
             */
            send404 : function(){
                var redurl = window.location.pathname + window.location.hash;
                document.location = "/404?url=" + escape(window.location.pathname + window.location.search + window.location.hash);
                return false;
            },

            /**
             * Function that can be called by pages that don't have the permission to show the content
             * they should be showing
             */
            send403 : function(){
                var redurl = window.location.pathname + window.location.hash;
                document.location = "/403?url=" + escape(window.location.pathname + window.location.search + window.location.hash);
                return false;
            },

            /**
             * Function that can be called by pages that require a login first
             */
            sendToLogin : function(){
                var redurl = window.location.pathname + window.location.hash;
                document.location = sakai_conf.URL.GATEWAY_URL + "?url=" + escape(window.location.pathname + window.location.search + window.location.hash);
                return false;
            },

            showPage : function(callback) {
                // Show the background images used on anonymous user pages
                if ($.inArray(window.location.pathname, sakai_conf.requireAnonymous) > -1) {
                    $('html').addClass('requireAnon');
                // Show the normal background
                } else {
                    $('html').addClass('requireUser');
                }
                sakai_util.loadSkinsFromConfig();

                // Put the title inside the page
                var pageTitle = require('sakai/sakai.api.i18n').getValueForKey(sakai_conf.PageTitles.prefix);
                if (sakai_conf.PageTitles.pages[window.location.pathname]) {
                    pageTitle += ' ' + require('sakai/sakai.api.i18n').getValueForKey(sakai_conf.PageTitles.pages[window.location.pathname]);
                }
                sakai_util.setPageTitle(pageTitle, false, true);
                // Show the actual page content
                $('body').removeClass('i18nable');
                if ($.isFunction(callback)) {
                    callback();
                }
            }
        },

        loadedMathJax: false,
        loadMathJax: function() {
            if (!sakai_util.loadedMathJax) {
                sakai_util.loadedMathJax = true;
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = '/dev/lib/MathJax/MathJax.js';

                var config =
                    'MathJax.Hub.Config({' +
                        'messageStyle: "none",' +
                        'config: "default.js",' +
                        'styles: {"#MathJax_Message": {display: "none !important"}}' +
                    '}); ' +
                    'MathJax.Hub.Startup.onload();';

                if (window.opera) {
                    script.innerHTML = config;
                } else {
                    script.text = config;
                }

                $('head')[0].appendChild(script);
            }
        },

        /**
        * Runs MathJax over an element replacing any math TeX with rendered
        * formulas
        *
        * @param element {String} The element (or it's id) that should be checked for math
        */
        renderMath : function(element) {
            if (element instanceof jQuery && element[0]) {
                element = element[0];
            }
            // Check whether a MathJax formula is available
            var elementContent = $(element).html();
            if (elementContent && elementContent.indexOf('$$') !== -1) {
                // Check whether MathJax has already been loaded
                if (!window['MathJax'] || !MathJax.Hub) {
                    sakai_util.loadMathJax();
                }
                // Try to render the formula. This will fail if MathJax hasn't finished
                // loading yet. If that's the case, the system will retry after 200ms
                try {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, element]);
                } catch (err) {
                    setTimeout(function() {
                        sakai_util.renderMath(element);
                    }, 200);
                }
            }
        },

        // :?=&;\/?@+$<>#%'"''{}|\\^[]'
        makeSafeURL : function(url, replacement) {
            if (!replacement) {
                replacement = "-";
            }
            url = $.trim(url);
            url = url.replace(/[:;<>#%{}|~`@%&!$,.="'\^\+\/\?\(\)\*\s\\\\\[\]]/gi, replacement);
            url = url.replace(new RegExp("[" + replacement + "]+", "gi"), replacement);
            return url;
        },

        /**
         * Sling doesn't like certain characters in the tags
         * So we escape them here
         * /:;,[]*'"|
         */
        makeSafeTag : function(tag) {
            if (tag) {
                tag = tag.replace(/[\\\/:;,\[\]\*'"|]/gi, "");
            }
            return tag;
        },

        generateWidgetId: function(){
            return "id" + Math.round(Math.random() * 10000000);
        },

        /**
         * Make a unique URL, given a primary and secondary desired url
         * and a structure passed in to ensure uniqueness of the key.
         * The first argument will be used as the primary URL, and used if possible.
         * The second argument will be used if passed, but if none of these work,
         * or if the second argument isn't passed and the first argument doesn't work,
         * the first argument will be appended with '0', '1', etc until a unique
         * key for the structure is found. That string will be returned.
         *
         * @param {String} desiredURL The URL (or object key) you'd like to use first
         * @param {String} secondaryURL The URL (or orject key) that you'd like to use as
         *                  a backup in case the desiredURL isn't available. Pass null here
         *                  if you want to use the number-append feature
         * @param {Object} structure The structure to test against its top-level keys for
         *                  uniqueneness of the URL/key
         */
        makeUniqueURL : function(desiredURL, secondaryURL, structure) {
            desiredURL = sakai_util.makeSafeURL(desiredURL);
            if (!structure[desiredURL]) {
                return desiredURL;
            } else if (secondaryURL && !structure[secondaryURL]) {
                return secondaryURL;
            } else {
                var ret = "",
                    count = 0;
                while (ret === "") {
                    if (!structure[desiredURL + count]) {
                        ret = desiredURL + count;
                    }
                    count++;
                }
                return ret;
            }
        },

        /**
         * Sets up events to hide a dialog when the user clicks outside it
         *
         * @param elementToHide {String} a jquery selector, jquery object, dom element, or array thereof containing the element to be hidden, clicking this element or its children won't cause it to hide
         * @param ignoreElements any elements that match a jquery.is(ignoreElements) will not hide the target element when clicked
         * @param callback {function} a function to be called instead of the default jquery.hide()
         */
        hideOnClickOut : function(elementToHide, ignoreElements, callback) {
            $(document).click(function(e){
                var $clicked = $(e.target);
                if (! $.isArray(elementToHide)){
                    elementToHide = [elementToHide];
                }
                $.each(elementToHide, function(index, el){
                    if (el instanceof jQuery){
                        $el = el;
                    } else {
                        $el = $(el);
                    }
                    if ($el.is(":visible") && ! ($.contains($el.get(0), $clicked.get(0)) || $clicked.is(ignoreElements) || $(ignoreElements).has($clicked.get(0)).length)) {
                        if ($.isFunction(callback)){
                            callback();
                        } else {
                            $el.hide();
                        }
                    }
                });
            });
        },

        Modal: {
            /**
             * Sets jqmodal options
             *
             * @param dialogContainer {String} a jquery selector or jquery object, that is the dialog container
             * @param options {Object} object containing options to pass to the jqmodal plugin
             * @param addClose {String} a jquery selector or jquery object used in the jqmAddClose function
             */
            setup : function(dialogContainer, options, addClose) {
                var $dialogContainer = $(dialogContainer);

                if (addClose) {
                    $dialogContainer.jqm(options).jqmAddClose(addClose);
                } else {
                    $dialogContainer.jqm(options);
                }
            },

            /**
             * Opens the dialog box
             *
             * @param {String} dialogContainer a jquery selector or jquery object, that is the dialog container
             * @param {Object} openOptions optional object containing options to apply when opening the dialog:
             *                              positionDialog {Boolean} true to position the dialog at the scroll position
             *                              positionOffset {Integer} dialog height position offset
             *                              bindKeyboardFocus {Boolean} true to trap keyboard focus inside the dialog
             *                              bindKeyboardFocusIgnoreElements {String} optional jquery selector for start/end elements to be ignored
             *                              bindKeyboardCloseFunction {Function} optional function to be called when the user hits the escape key
             */
            open : function(dialogContainer, openOptions) {
                var $dialogContainer = $(dialogContainer);

                var positionDialog = true;
                var positionOffset = false;
                var bindKeyboardFocus = true;
                var bindKeyboardFocusIgnoreElements = false;
                var bindKeyboardCloseFunction = false;

                if (openOptions) {
                    if (openOptions.positionDialog) {
                        positionDialog = openOptions.positionDialog;
                    }
                    positionOffset = openOptions.positionOffset;
                    if (openOptions.bindKeyboardFocus) {
                        bindKeyboardFocus = openOptions.bindKeyboardFocus;
                    }
                    bindKeyboardFocusIgnoreElements = openOptions.bindKeyboardFocusIgnoreElements;
                    bindKeyboardCloseFunction = openOptions.bindKeyboardCloseFunction;
                }

                if (positionDialog) {
                    sakai_util.Modal.positionDialogBox($dialogContainer, positionOffset);
                }
                if (bindKeyboardFocus) {
                    sakai_util.Modal.bindDialogFocus($dialogContainer, bindKeyboardFocusIgnoreElements, bindKeyboardCloseFunction);
                }

                $dialogContainer.jqmShow();
            },

            /**
             * Closes the dialog box
             *
             * @param {String} dialogContainer a jquery selector or jquery object, that is the dialog container
             */
            close : function(dialogContainer) {
                var $dialogContainer = $(dialogContainer);
                $dialogContainer.jqmHide();
            },

            /**
             * Positions the dialog box at the users scroll position
             *
             * @param {String} el a jquery selector or jquery object, to position
             * @param {Integer} offset optional numeric value to add to the dialog position offset
             */
            positionDialogBox : function(el, offset) {
                var $el = $(el);

                var dialogOffset = 50;
                if (offset && $.isNumeric(offset)) {
                    dialogOffset = parseInt(offset, 10);
                }

                var htmlScrollPos = parseInt($('html').scrollTop(), 10);
                var docScrollPos = parseInt($(document).scrollTop(), 10);
                if (htmlScrollPos > 0) {
                    $el.css({'top': htmlScrollPos + dialogOffset + 'px'});
                } else if (docScrollPos >= 0) {
                    $el.css({'top': docScrollPos + dialogOffset + 'px'});
                }
            },

            /**
             * Sets up events to keep keyboard focus within the dialog box and close it when the escape key is pressed
             *
             * @param {String} dialogContainer a jquery selector or jquery object which is the dialog container
             * @param {String} ignoreElements an optional jquery selector for start/end elements to be ignored
             * @param {Function} closeFunction an optional function to be called when the user hits the escape key
             */
            bindDialogFocus : function(dialogContainer, ignoreElements, closeFunction) {
                var origFocus = $(':focus');
                var $dialogContainer = $(dialogContainer);

                var bindFunction = function(e) {
                    if ($dialogContainer.is(':visible') && $dialogContainer.has(':focus').length && e.which === $.ui.keyCode.ESCAPE) {
                        if ($.isFunction(closeFunction)) {
                            closeFunction();
                        } else {
                            $dialogContainer.jqmHide();
                        }
                        origFocus.focus();
                    } else if ($dialogContainer.is(':visible') && e.which === $.ui.keyCode.TAB) {
                        // determine which elements are keyboard navigable
                        var $focusable = $('a:visible, input:visible, button:visible:not(:disabled), textarea:visible', $dialogContainer);
                        if (ignoreElements) {
                            $focusable = $focusable.not(ignoreElements);
                        }
                        var $focused = $(':focus');
                        var index = $focusable.index($focused);
                        if (e.shiftKey && $focusable.length && (index === 0)) {
                            // if shift tabbing from the start of the dialog box, shift focus to the last element
                            $focusable.last().focus();
                            return false;
                        } else if (!e.shiftKey && $focusable.length && (index === $focusable.length - 1)) {
                            // if tabbing from the end of the dialog box, shift focus to the first element
                            $focusable.first().focus();
                            return false;
                        }
                    }
                };
                $(dialogContainer).off('keydown');
                $(dialogContainer).keydown(bindFunction);
            }
        },

        /**
         * Extracts the entity ID from the URL
         * also handles encoded URLs
         * Example:
         *   input: "/~user1"
         *   return: "user1"
         * Encoded Exmaple:
         *   input: "/%7E%D8%B4%D8%B3"
         *   return: "شس"
         *
         * @param {String} pathname The window.location.pathname
         * @return {String} The entity ID
         */
        extractEntity : function(pathname) {
            var entity = null;
            if (pathname.substring(1,4) === "%7E") {
                pathname = pathname.replace("%7E", "~");
            }
            if (pathname.substring(0,2) === "/~") {
                entity = decodeURIComponent(pathname.substring(2));
            }
            return entity;
        },

        AutoSuggest: {
            /**
            * Autosuggest for users and groups (for other data override the source parameter). setup method creates a new
            * autosuggest on the element (a jQuery object or selector string that is passed to jQuery) and also sets a
            * namespace .data() so autosuggest won't be created more than once, with the original element as its value.
            * The original element is retrieved in the destroy method to replace the autosuggest.
            *
            * @param {String|Object} jQuery selection object or selector string.
            * @param {Object} JavaScript object of optional parameters to extend or override defaults
            * @param {function} optional callback to be executed after calling autosuggest plugin
            *
            * @returns {Object} new jQuery object with autosuggest
            */
            setup: function( element, options, callback, _dataFn ) {
                require(['jquery-plugins/jquery.autoSuggest.sakai-edited', 'sakai/sakai.api.i18n', 'sakai/sakai.api.user'], function(autoSuggest, sakaii18nAPI, user) {
                    // Translate the jquery.autosuggest plugin
                    var dataFn = _dataFn || function( query, add ) {
                        var q = sakai_serv.createSearchString(query);
                        var searchoptions = {
                            'page': 0,
                            'items': 15
                        };
                        var searchUrl = sakai_conf.URL.SEARCH_USERS_GROUPS;
                        if (q === '*' || q === '**') {
                            searchUrl = sakai_conf.URL.SEARCH_USERS_GROUPS_ALL;
                        } else {
                            searchoptions['q'] = q;
                        }
                        sakai_serv.loadJSON(searchUrl.replace('.json', ''), function(success, data) {
                            if (success) {
                                var suggestions = [];
                                $.each(data.results, function(i) {
                                    if (data.results[i]['rep:userId'] && data.results[i]['rep:userId'] !== user.data.me.user.userid) {
                                        if (!options.filterUsersGroups || $.inArray(data.results[i]['rep:userId'], options.filterUsersGroups) === -1) {
                                            suggestions.push({
                                                'value': data.results[i]['rep:userId'],
                                                'name': user.getDisplayName(data.results[i]),
                                                'picture': sakai_util.constructProfilePicture(data.results[i], 'user'),
                                                'type': 'user'
                                            });
                                        }
                                    } else if (data.results[i]['sakai:group-id']) {
                                        if (!options.filterUsersGroups || $.inArray(data.results[i]['sakai:group-id'], options.filterUsersGroups) === -1) {
                                            suggestions.push({
                                                'value': data.results[i]['sakai:group-id'],
                                                'name': sakai_util.Security.safeOutput(data.results[i]['sakai:group-title']),
                                                'picture': sakai_util.constructProfilePicture(data.results[i], 'group'),
                                                'type': 'group'
                                            });
                                        }
                                    }
                                });
                                add(suggestions, query);
                            }
                        }, searchoptions);
                    };

                    var defaults = {
                        selectedItemProp: 'name',
                        searchObjProps: 'name',
                        startText: sakaii18nAPI.getValueForKey('ENTER_NAME_HERE'),
                        emptyText: sakaii18nAPI.getValueForKey('NO_RESULTS_FOUND'),
                        limitText: sakaii18nAPI.getValueForKey('NO_MORE_SELECTIONS_ALLOWED'),
                        scroll: true,
                        canGenerateNewSelections: false,
                        usePlaceholder: true,
                        showResultListWhenNoMatch: true
                    };

                    var opts = $.extend(defaults, options);
                    var namespace = opts.namespace || 'api_util_autosuggest';
                    element = (element instanceof jQuery) ? element : $(element);

                    // already an autosuggest so for now return element, could also call destroy and setup again
                    if (element.data(namespace)) {
                        return element;
                    }

                    var orig_element = element.clone(true);
                    element.autoSuggest(dataFn, opts).data(namespace, orig_element);

                    if ($.isFunction(callback)) {
                        callback();
                    }

                    return element;
                });
            },
            /**
            * Resets the autosuggest without destroying/creating. Use this
            * when the autosuggest is in an element whose visibility is toggled, e.g. via a "Cancel" button
            * which should have the effect of clearing the autosuggest. The autosuggest plugin has no reset
            * method, and it maintains a "prev" variable that holds the last typed character. Clearing the
            * input field isn't sufficient, if the same character is typed next time it will match the stored
            * character and return false, so the keydown after clearing the input clears the var in the plugin.
            *
            * @param {String} $element The element (or a jQuery selector string) for the text input for the autosuggest
            *
            * @returns {Object} the jQuery object created from setup method
            */
            reset: function( $element ){
                $element = ( $element instanceof jQuery ) ? $element: $( $element );
                $element.val( "" ).trigger( "keydown" );
                $element.parents( ".as-selections" ).find( ".as-close" ).click(); // created by autosuggest plugin
                return $element;
            },
            /**
            * Removes the autosuggest and replaces it with the original element stored in .data() under the
            * 'namespace' key when the autosuggest was created. Because it stores the original element, and this isn't
            * a jQuery plugin that iterates over all matching selectors, this method only works if a single element
            * is passed in. In practice it's probably not likely to pass multiple elements in the selector when
            * creating the autosuggest (if that's really needed, then modifications to the plugin are more appropriate).
            *
            * @param element {Object} The autosuggest element (a jQuery object); usually the returned from the setup method
            * @param {Object} JavaScript object of optional parameters; currently only the namespace key
            *
            * @returns {Object} original jQuery object without autosuggest
            */
            destroy: function( element, options ){
                var opts = $.extend( {}, options );
                var namespace = opts.namespace || "api_util_autosuggest";
                if( !element || ( element.length !== 1 && !element.data( namespace ) ) ){
                    return false; // may want to return element?
                }
                var ascontainer = $( "#as-selections-" + element.attr( "id" ) ).replaceWith( element.data( namespace ) );
                $( "#as-results-" + element.attr( "id" ) ).remove();
                return $( ascontainer );
            },

            /**
             * Set up the tag + category autosuggest box
             *
             * @param {jQuery} $elt The element to set up as the autosuggest box
             * @param {Object} options Options to pass through to the autoSuggest setup
             * @param {jQuery} $list_categories_button The button that should trigger the assignlocation overlay
             * @param {Array} initialSelections The inital selections for the autosuggest, direct from the profile
             * @param {Function} callback Function to call after setup is complete
             */
            setupTagAndCategoryAutosuggest: function( $elt, options, $list_categories_button, initialSelections, callback ) {
                require(['jquery-plugins/jquery.autoSuggest.sakai-edited', 'sakai/sakai.api.i18n'], function(autoSuggest, sakaii18nAPI) {
                    var defaults = {
                        selectedItemProp: 'value',
                        searchObjProps: 'value',
                        canGenerateNewSelections: true,
                        scroll: true,
                        showResultListWhenNoMatch: false,
                        startText: sakaii18nAPI.getValueForKey('ENTER_TAGS_OR_CATEGORIES'),
                        beforeRetrieve: function(userinput) {
                            return $.trim(userinput);
                        },
                        processNewSelection: function(userinput) {
                            return sakai_util.Security.safeOutput(sakai_util.makeSafeTag(userinput));
                        }
                    };

                    // Set up the directory structure for autoSuggesting
                    var getTranslatedCategories = function() {
                        var ret = [];
                        var directory = sakai_util.getDirectoryStructure();
                        $.each( directory, function(i, dir) {
                            ret.push({
                                value: dir.data.title,
                                id: dir.attr.id,
                                path: dir.attr.id,
                                parent: true,
                                category: true
                            });
                            $.each( dir.children, function(i, child) {
                                ret.push({
                                    value: dir.data.title + ' » ' + child.data.title,
                                    path: dir.attr.id + '/' + child.attr.id,
                                    id: child.attr.id,
                                    parent: false,
                                    category: true
                                });
                            });
                        });
                        return ret;
                    };

                    // Set up the assignlocation widget
                    var setupAssignLocation = function() {
                        if (!$('#assignlocation_container').length) {
                            $('<div id="assignlocation_container">').appendTo('body');
                            $('<div id="widget_assignlocation" class="widget_inline"/>').appendTo('#assignlocation_container');
                            require('sakai/sakai.api.widgets').widgetLoader.insertWidgets('#assignlocation_container', false );
                        }
                        $list_categories_button.off('click').on('click', function(e) {
                            var currentlySelected = sakai_util.AutoSuggest.getTagsAndCategories($elt, false, true).categories;
                            $(window).trigger('init.assignlocation.sakai', [currentlySelected, e, function(categories) {
                                // add newly selected categories to the autoSuggest
                                currentlySelected = sakai_util.AutoSuggest.getTagsAndCategories($elt, false, true).categories;
                                var currentCatIDs = [];
                                var catsFromOverlay = [];
                                // Get the current category IDs
                                $.each(currentlySelected, function(i, currentCat) {
                                    currentCatIDs.push(currentCat.id);
                                });
                                // Add new items
                                $.each(categories, function(i, category) {
                                    if ($.inArray(category.id, currentCatIDs) === -1) {
                                        $elt.autoSuggest('add_selected_item', category);
                                    }
                                    catsFromOverlay.push(category.id);
                                });
                                // Remove items removed in the dialog
                                $.each(currentlySelected, function(i, currentCat) {
                                    if ($.inArray(currentCat.id, catsFromOverlay) === -1) {
                                        var elt = $elt.parents('.as-selections').find('li[data-value="' + currentCat.value + '"]');
                                        $elt.autoSuggest('remove_item', currentCat.value, elt, $(elt).data('data'));
                                    }
                                });
                            }]);
                        });
                    };

                    // Parse the tags and set them up to be displayed in the autosuggest
                    var setInitialSelections = function() {
                        var directory = sakai_util.getDirectoryStructure();
                        var preFill = [];
                        $.each(initialSelections, function (idx, tag) {
                            var tagObj = {};
                            if (!tag.indexOf('directory/')) {
                                var tagValue = sakai_util.getValueForDirectoryTag(tag);
                                var directoryItems = tag.split('/');
                                tagObj = {
                                    value: tagValue,
                                    id: directoryItems[directoryItems.length - 1],
                                    parent: directoryItems.length > 2,
                                    category: true,
                                    path: tag.replace('directory/', '')
                                };
                            } else {
                                tagObj = {
                                    id: sakai_util.Security.safeOutput(sakai_util.makeSafeTag(tag)),
                                    value: sakai_util.Security.safeOutput(sakai_util.makeSafeTag(tag))
                                };
                            }
                            preFill.push(tagObj);
                        });
                        return preFill;
                    };

                    if (initialSelections) {
                        defaults.preFill = setInitialSelections();
                    }

                    $.extend(defaults, options);

                    var data = getTranslatedCategories();

                    sakai_util.AutoSuggest.destroy($elt);
                    sakai_util.AutoSuggest.setup($elt, defaults, callback, data);

                    setupAssignLocation();
                });
            },

            /**
             * Get the tags and categories from the autosuggest box
             *
             * @param {jQuery} $elt The element which you passed to the autoSuggest setup method
             * @param {Boolean} merge If the tags and categories should be merged on return
             * @param {Boolean} longform When true, the categories returned will be the full object
             *                           instead of just the path string ("directory/category/child")
             * @return {Object} Two arrays, categories and tags - OR - one array of tags and categories if merge === true
             */
            getTagsAndCategories: function( $elt, merge, longform ) {
                // Add any tags that haven't yet been added to the list
                $elt.trigger($.Event("keydown", { keyCode: 13 }));
                var tags_cats = $elt.autoSuggest( "get_selections" );
                var ret = {
                    categories: [],
                    tags: []
                };
                $.each(tags_cats, function( i, tc ) {
                    if ( tc.category ) {
                        if ( longform ) {
                            ret.categories.push( tc );
                        } else {
                            ret.categories.push( "directory/" + tc.path );
                        }
                    } else {
                        ret.tags.push( sakai_util.Security.unescapeHTML(tc.value) );
                    }
                });
                if ( merge ) {
                    ret = $.merge(ret.tags, ret.categories);
                }
                return ret;
            }

        },

        Forms : {
            /**
             * A wrapper for jquery.validate, so we can perform the same
             * errorPlacement on each form, without any duplicated code
             *
             * @param {jQuery} $form the jQuery element of the form in question
             * @param {Object} opts options to pass through to jquery.validate
             *    NOTE: There is one additional option you can pass in -- an error callback function
             *    When there is an error in validation detected, it will be called
             *    NOTE: Additional option 'errorsShown' can hold a function that is executed after
             *    the error labels have been displayed on screen.
             * @param {Function} [invalidCallback] The function to call when an error is detected
             * @param {Boolean} [insertAfterLabel] Insert the error span after the label, not before
             */
            validate: function($form, opts, insertAfterLabel) {

                // Load the plug-in when necessary
                require(['jquery-plugins/jquery.validate'], function() {
                    var options = {
                        onclick: false,
                        onkeyup: false,
                        onfocusout: false
                    };

                    // When you set onclick to true, you actually just don't set it
                    // to false, because onclick is a handler function, not a boolean
                    if (opts) {
                        $.each(options, function(key,val) {
                            if (opts.hasOwnProperty(key) && opts[key] === true) {
                                delete opts[key];
                                delete options[key];
                            }
                        });
                    }
                    options.errorElement = 'span';
                    options.errorClass = insertAfterLabel ? 's3d-error-after' : 's3d-error';

                    // We need to handle success and invalid in the framework first
                    // then we can pass it to the caller
                    var successCallback = false;
                    var invalidCallback = false;

                    if (opts) {
                        if (opts.hasOwnProperty('success') && $.isFunction(opts.success)) {
                            successCallback = opts.success;
                            delete opts.success;
                        }

                        if (opts && opts.hasOwnProperty('invalidCallback') && $.isFunction(opts.invalidCallback)) {
                            invalidCallback = opts.invalidCallback;
                            delete opts.invalidCallback;
                        }
                    }

                    // Don't allow spaces in the field
                    $.validator.addMethod('nospaces', function(value, element) {
                        return this.optional(element) || (value.indexOf(' ') === -1);
                    }, sakai_i18n.getValueForKey('NO_SPACES_ARE_ALLOWED'));

                    // Appends http:// or ftp:// or https:// when necessary
                    $.validator.addMethod('appendhttp', function(value, element) {
                        if (value.substring(0,7) !== 'http://' &&
                            value.substring(0,6) !== 'ftp://' &&
                            value.substring(0,8) !== 'https://' &&
                            $.trim(value) !== '') {
                                $(element).val('http://' + value);
                        }
                        return true;
                    });

                    // Add the methods that were being passed in
                    if (opts && opts.hasOwnProperty('methods')) {
                        $.each(opts.methods, function(key, value) {
                            $.validator.addMethod(key, value.method, value.text);
                        });
                        delete opts.methods;
                    }

                    // Include the passed in options
                    $.extend(true, options, opts);

                    // Success is a callback on each individual field being successfully validated
                    options.success = function($label) {
                        // For autosuggest clearing, since we have to put the error on the ul instead of the element
                        if (insertAfterLabel && $label.next('ul.as-selections').length) {
                            $label.next('ul.as-selections').removeClass('s3d-error');
                        } else if ($label.prev('ul.as-selections').length) {
                            $label.prev('ul.as-selections').removeClass('s3d-error');
                        }
                        $label.remove();
                        if ($.isFunction(successCallback)) {
                            successCallback($label);
                        }
                    };

                    options.errorPlacement = function($error, $element) {
                        if ($element.hasClass('s3d-error-calculate')) {
                            // special element with variable left margin
                            // calculate left margin and width, set it directly on the error element
                            $error.css({
                                'margin-left': $element.position().left,
                                'width': $element.width()
                            });
                        }
                        // Get the closest-previous label in the DOM
                        var $prevLabel = $form.find('label[for="' + $element.attr('id') + '"]');
                        $error.attr('id', $element.attr('name') + '_error');
                        $element.attr('aria-describedby', $element.attr('name') + '_error');
                        if (insertAfterLabel) {
                            $error.insertAfter($prevLabel);
                        } else {
                            $error.insertBefore($prevLabel);
                        }
                    };

                    options.invalidHandler = function($thisForm, validator) {
                        $form.find('.s3d-error').attr('aria-invalid', 'false');
                        if ($.isFunction(invalidCallback)) {
                            invalidCallback($thisForm, validator);
                        }
                    };

                    options.showErrors = function(errorMap, errorList) {
                        if (errorList.length !== 0 && $.isFunction(options.error)) {
                            options.error();
                        }
                        $.each(errorList, function(i,error) {
                            $(error.element).attr('aria-invalid', 'true');
                            // Handle errors on autosuggest
                            if ($(error.element).hasClass('s3d-error-autosuggest')) {
                                $(error.element).parents('ul.as-selections').addClass('s3d-error');
                            }
                        });
                        this.defaultShowErrors();
                        if ($.isFunction(options.errorsShown)) {
                            options.errorsShown();
                        }
                    };

                    // Set up the form with these options in jquery.validate
                    $form.validate(options);
                });
            },

            clearValidation: function($form) {
                $form.find("span.s3d-error, span.s3d-error-after").remove();
                $form.find(".s3d-error").removeClass("s3d-error");
                $form.find(".s3d-error-after").removeClass("s3d-error-after");
                $form.find("*[aria-invalid]").removeAttr("aria-invalid");
                $form.find("*[aria-describedby]").removeAttr("aria-describedby");
            }
        },

        Draggable: {
            getDraggableMessage: function(items){
                var message = "";
                if(items > 1){
                    message = require("sakai/sakai.api.i18n").getValueForKey("MOVING") + " " + items + " " + require("sakai/sakai.api.i18n").getValueForKey("ITEMS_PL");
                } else {
                    message = require("sakai/sakai.api.i18n").getValueForKey("MOVING") + " " + items + " " + require("sakai/sakai.api.i18n").getValueForKey("ITEM");
                }
                return message;
            },
            /*
             * Gets data from a helper and returns an array
             */
            getDraggableData: function(helper){
                var draggableData = [];
                if($(helper.children()).length > 1){
                    $.each(helper.children(), function(i, draggable){
                        draggableData.push($(draggable).data());
                    });
                } else {
                    draggableData.push(helper.children().data());
                }
                return draggableData;
            },
            /**
             * Sets and overrides default parameters for the jQuery Droppable plugin
             * @param {Object} params Optional parameters that override defaults
             */
            setDraggableParameters: function(params) {
                return {
                    distance: 30,
                    revert: true,
                    revertDuration: 0,
                    scrollSensitivity: 100,
                    opacity: 0.5,
                    cursor: 'move',
                    zIndex: 100000,
                    cursorAt: {
                        top: 10,
                        left: 5
                    },
                    stop: function(event, ui) {
                        sakai_util.Draggable.removeIFrameFix();
                        $('.s3d-draggable-draggingitems').remove();
                        $(document).trigger('stop.drag.sakai');
                        if ($(this).data('stopdragevent')) {
                            $(window).trigger($(this).data('stopdragevent'), sakai_util.Draggable.getDraggableData(ui.helper));
                        }
                    },
                    start: function(event, ui) {
                        sakai_util.Draggable.setIFrameFix();
                        $('body').append('<div class="s3d-draggable-draggingitems">' + sakai_util.Draggable.getDraggableMessage($(ui.helper).children().length) + '</div>');
                        $(document).trigger('start.drag.sakai');
                        if ($(this).data('startdragevent')) {
                            $(window).trigger($(this).data('startdragevent'), sakai_util.Draggable.getDraggableData(ui.helper));
                        }
                    },
                    helper: function() {
                        var $selected = $('.s3d-draggable-select:checked')
                            .parents('li:not(.contentauthoring_row_container)');
                        if ($selected.length === 0) {
                          $selected = $(this);
                        }
                        var $container = $('<div/>').attr('id', 's3d-draggeditems-container');
                        $container.append($selected.clone());
                        return $container;
                    },
                    drag: function(ev, data) {
                        $('.s3d-draggable-draggingitems').offset({
                            left: data.offset.left - 10,
                            top: data.offset.top - 12
                        });
                    }
                };
            },
            /**
             * Sets up draggables accross the page
             * @param {Object} params Optional parameters that override defaults
             * @param {Object} $container Optional container element to add draggables, defaults to $("html") if not set
             */
            setupDraggable: function(params, $container){
                if (!require("sakai/sakai.api.user").data.me.user.anon) {
                    $(".s3d-draggable-container", $container).each(function(index, draggable){
                        if (!$(draggable).hasClass("ui-draggable")) {
                            // HTML overrides default, JS overrides HTML
                            // Override default parameters with attribute defined parameters
                            var htmlParams = $.extend(true, sakai_util.Draggable.setDraggableParameters(params), $(draggable).data());
                            // Override attribute defined parameters with JS defined ones
                            params = $.extend(true, htmlParams, params);
                            $(".s3d-draggable-container", $container || $("html")).draggable(params);
                        }
                    });
                }
            },

            /**
             * When dragging elements over the screen, there are issues with iframes as they can make the
             * drag action hang when hovering over them. Therefore, we apply an almost transparent div on
             * top of the screen. This avoids the iframe events to be triggered and allows for smooth
             * dragging and dropping
             */
            setIFrameFix: function() {
                $('<div class="ui-resizable-iframeFix" style="background: #fff;"></div>').css({
                    width: $(document).width() + 'px', height: $(document).height() + 'px',
                    top: '0px', left: '0px',
                    position: 'absolute', opacity: '0.001', zIndex: 100000
                }).appendTo('body');
            },

            /**
             * Remove the transparant div that makes sure that dragging is smooth despite iFrames
             * being present on the screen
             */
            removeIFrameFix: function() {
                $('div.ui-resizable-iframeFix').remove();
            }

        },
        Droppable: {
            /**
             * Sets and overrides default parameters for the jQuery Draggable plugin
             * @param {Object} params Optional parameters that override defaults
             */
            setDroppableParameters: function(){
                return {
                    tolerance: "touch",
                    hoverClass: "s3d-droppable-hover",
                    drop: function(event, ui) {
                        $(".s3d-draggable-draggingitems").remove();
                        if($(this).data("dropevent")){
                            $(window).trigger($(this).data("dropevent"), [sakai_util.Draggable.getDraggableData(ui.helper), $(this)]);
                        }
                    },
                    over: function(event, ui) {
                        if($(this).data("overdropevent")){
                            $(window).trigger($(this).data("overdropevent"), [sakai_util.Draggable.getDraggableData(ui.helper), $(this)]);
                        }
                    }
                };
            },
            /**
             * Sets up droppables accross the page
             * @param {Object} params Optional parameters that override defaults
             * @param {Object} $container Optional container element to add droppables, defaults to $("html") if not set
             */
            setupDroppable: function(params, $container){
                if (!require("sakai/sakai.api.user").data.me.user.anon) {
                    $(".s3d-droppable-container", $container).each(function(index, droppable){
                        if (!$(droppable).hasClass("ui-droppable")) {
                            // HTML overrides default, JS overrides HTML
                            // Override default parameters with attribute defined parameters
                            var htmlParams = $.extend(true, sakai_util.Droppable.setDroppableParameters(), $(droppable).data());
                            // Override attribute defined parameters with JS defined ones
                            params = $.extend(true, htmlParams, params);
                            $(".s3d-droppable-container", $container || $("html")).droppable(params);
                        }
                    });
                }
            }
        },

        /**
         * Do a deep search and replace in an object
         *
         * @param {Object} obj The object to replace values in
         * @param {String} toReplace The value to search for
         * @param {String} replacement The string to replace the value with
         * @return {Object} The object with the string replaced in all occurrences
         */
        replaceInObject: function(obj, toReplace, replacement) {
            var ret = false;
            if ($.isPlainObject(obj)) {
                 ret = $.extend(true, {}, obj);
            } else if ($.isArray(obj)) {
                ret = $.merge([], obj);
            }
            $.each(ret, function(key, val) {
                if ($.isPlainObject(val) || $.isArray(val)) {
                    ret[key] = sakai_util.replaceInObject(val, toReplace, replacement);
                } else if (_.isString(val) && val.indexOf(toReplace) !== -1) {
                    ret[key] = val.replace(toReplace, replacement);
                }
            });
            return ret;
        }
    };

    return sakai_util;
});
