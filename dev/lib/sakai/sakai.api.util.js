/**
 *
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
 *
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
define(["jquery",
        "sakai/sakai.api.server",
        "sakai/sakai.api.l10n",
        "/dev/configuration/config.js",
        "/dev/lib/misc/trimpath.template.js"],
        function($, sakai_serv, sakai_l10n, sakai_conf) {
    
    var util = {
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
            if ($.trim(inputTags) !== "") {
                var tags = [];
                var splitTags = $(inputTags.split(","));
                splitTags.each(function(index){
                    if ($.trim(splitTags[index]).length) {
                        tags.push($.trim(splitTags[index]));
                    }
                });
                return tags;
            } else {
                return [];
            }
        },

        /**
         * Formats a comma separated string of text to an array of usable tags
         * Filters out unwanted tags (eg empty tags) and especially location tags (start with "directory/")
         * Returns the array of tags, if no tags were provided or none were valid an empty array is returned
         *
         * Example: inputTags = "tag1, tag2, , , tag3, , tag4" returns ["tag1","tag2","tag3","tag4"]
         *
         * @param {String} input Unformatted, comma separated, string of tags put in by a user
         * @return {Array} Array of formatted tags
         */
        formatTagsExcludeLocation : function(input){
            var item;
            var inputTags = this.formatTags(input);
            if (inputTags.length) {
                var tags = [];
                $.each(inputTags, function(index, value){
                    if (value.split("/")[0] !== "directory") {
                        tags.push(value);
                    }
                });
                return tags;
            } else {
                return [];
            }
        },

        /**
         * Formats a comma separated string of text to an array of usable directory tags
         * Returns the array of tags, if no tags were provided or none were valid an empty array is returned
         *
         * Example: inputTags = "tag1, directory/tag2, , , tag3, , directory/tag4" returns ["directory/tag2","directory/tag4"]
         *
         * @param {String} inputTags Unformatted, comma separated, string of tags put in by a user
         * @return {Array} Array of formatted tags
         */
        getDirectoryTags : function(input){
            var item;
            var inputTags = this.formatTags(input);
            if (inputTags.length) {
                var tags = [];
                for (item in inputTags){
                    if (inputTags.hasOwnProperty(item) && inputTags[item] && inputTags[item].split("/")[0] === "directory") {
                        tags.push(inputTags[item].split("directory/")[1].split("/"));
                    }
                }
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
                if (tags.length) {
                    var requests = [];
                    $(tags).each(function(i, val){
                        requests.push({
                            "url": "/tags/" + val,
                            "method": "POST",
                            "parameters": {
                                "sakai:tag-name": val,
                                "sling:resourceType": "sakai/tag"
                            }
                        });
                    });
                    sakai_serv.batch($.toJSON(requests), function(success, data) {
                        if (success) {
                            doSetTags(tags, function(_success) {
                                setTagsCallback(_success);
                            });
                        } else {
                            debug.error(val + " failed to be created");
                            if ($.isFunction(setTagsCallback)) {
                                setTagsCallback();
                            }
                        }
                    }, false, true);
                } else {
                    if ($.isFunction(setTagsCallback)) {
                        setTagsCallback();
                    }
                }

                // set the tag on the entity
                var doSetTags = function(tags, doSetTagsCallback) {
                    var setTagsRequests = [];
                    $(tags).each(function(i,val) {
                        setTagsRequests.push({
                            "url": tagLocation,
                            "method": "POST",
                            "parameters": {
                                "key": "/tags/" + val,
                                ":operation": "tag"
                            }
                        });
                    });
                    sakai_serv.batch($.toJSON(setTagsRequests), function(success, data) {
                        if (!success) {
                            debug.error(tagLocation + " failed to be tagged as " + val);
                        }
                        if ($.isFunction(doSetTagsCallback)) {
                            doSetTagsCallback(success);
                        }
                    }, false, true);
                };
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
                    sakai_serv.batch($.toJSON(requests), function(success, data) {
                        if (!success) {
                            debug.error(val + " tag failed to be removed from " + tagLocation);
                        }
                        if ($.isFunction(deleteTagsCallback)) {
                            deleteTagsCallback();
                        }
                    }, false, true);
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
                val = $.trim(val).replace(/#/g,"");
                if (val && (!currentTags || $.inArray(val,currentTags) === -1)) {
                    if (util.Security.escapeHTML(val) === val && val.length) {
                        if ($.inArray(val, tagsToAdd) < 0) {
                            tagsToAdd.push(val);
                        }
                    }
                }
            });
            $(currentTags).each(function(i,val) {
                val = $.trim(val).replace(/#/g,"");
                if (val && $.inArray(val,newTags) == -1) {
                    if (util.Security.escapeHTML(val) === val && val.length) {
                        if ($.inArray(val, tagsToDelete) < 0) {
                            tagsToDelete.push(val);
                        }
                    }
                }
            });
            deleteTags(tagLocation, tagsToDelete, function() {
                setTags(tagLocation, tagsToAdd, function(success) {
                    if ($.isFunction(callback)) {
                        callback(success);
                    }
                });
            });

        },

        /**
         * Truncate a string of text using the threedots plugin
         * @param {String} body String of text to be truncated
         * @param {int} width Width of the parent element
         * @param {Object} params Object containing parameters, Threedots plugin specific. The row limit for widget headers should be 4 rows.
         */
        applyThreeDots : function(body, width, params, optClass){
            $container = $("<div class=\"" + optClass + "\" style=\"width:" + width + "px; ; word-wrap:break-word; display:hidden;\"><span style=\"word-wrap:break-word;\" class=\"ellipsis_text\">" + body + "</span></div>");
            $("body").append($container);
            $container.ThreeDots(params);
            var dotted = $container.children("span").text();
            $container.remove();
            return (dotted);
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
                    dateOutput.setHours(dateElementsTime[0] + zones[dateElements[5]]);
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

        /**
         * Shorten a string and add 3 dots if the string is too long
         *
         * @param {String} input The string you want to shorten
         * @param {Int} maxlength Maximum length of the string
         * @returns {String} The shortened string with 3 dots
         */
        shortenString : function(input, maxlength){

            var return_string = "";

            if ((typeof input === "string") && (input.length > maxlength)) {
                return_string = input.substr(0, maxlength) + "...";
            } else {
                return_string = input;
            }

            return return_string;
        },


        /**
         * Sets the chat bullets after update of status by
         * adding the right status css class on an element.
         * @param {Object} element the jquery element you wish to add the class to
         * @param {Object} status the status
         */
        updateChatStatusElement : function(element, chatstatus) {
            element.removeClass("chat_available_status_online");
            element.removeClass("chat_available_status_busy");
            element.removeClass("chat_available_status_offline");
            element.addClass("chat_available_status_" + chatstatus);
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
                        selector += "[" + i + "*=" + attributes[i] + "]";
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
                 * Natural Sort algorithm for Javascript
                 * Version 0.3
                 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
                 *  optimizations and safari fix by Mike Grier (mgrier.com)
                 * Released under MIT license.
                 * http://code.google.com/p/js-naturalsort/source/browse/trunk/naturalSort.js
                 */

                // Setup temp-scope variables for comparison evalutation
                var re = /(-?[0-9\.]+)/g,
                    x = a.toString().toLowerCase() || '',
                    y = b.toString().toLowerCase() || '',
                    nC = String.fromCharCode(0),
                    xN = x.replace( re, nC + '$1' + nC ).split(nC),
                    yN = y.replace( re, nC + '$1' + nC ).split(nC),
                    xD = (new Date(x)).getTime(),
                    yD = xD ? (new Date(y)).getTime() : null;
                // Natural sorting of dates
                if (yD) {
                    if (xD < yD) { return -1; }
                    else if (xD > yD) { return 1; }
                }
                // Natural sorting through split numeric strings and default strings
                for( var cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++ ) {
                    var oFxNcL = parseFloat(xN[cLoc]) || xN[cLoc];
                    var oFyNcL = parseFloat(yN[cLoc]) || yN[cLoc];
                    if (oFxNcL < oFyNcL) { return -1; }
                    else if (oFxNcL > oFyNcL) { return 1; }
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
                    this.include.css(val);
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
                    if (directory.hasOwnProperty(item)) {
                        // url for the first level nodes
                        var url = "/directory#" + item;
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
            var buildNodeRecursive = function(node_id, directory, url){
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
                            "href": url,
                            "title": p_title
                        }
                    },
                    children: []
                };

                // if current node has any children
                // call buildNoderecursive method create the node structure for
                // all level of child
                for (var child in directory[node_id].children) {
                    if (directory[node_id].children.hasOwnProperty(child)) {
                        // for each child node, call buildnoderecursive to build the node structure
                        // pass current child(id), the list of all sibligs(json object) and url append/child
                        // for example first level node /directory#courses/firstyearcourses
                        // for second level node /directory#course/firstyearcourses/chemistry
                        node.children.push(buildNodeRecursive(child, directory[node_id].children, url + "/" + child));
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
        getValueForDirectoryKey : function(key){
            var directory = this.getDirectoryStructure();

            var searchDirectoryForKey = function(key, child){
                var ret;
                if (!child) {
                    child = directory[0];
                }
                if (key == child.attr.id) {
                    ret = child.data.title;
                }
                else {
                    if (child.children) {
                        for (var item in child.children) {
                            if (child.children.hasOwnProperty(item)) {
                                var result = searchDirectoryForKey(key, child.children[item]);
                                if(result){
                                    ret = result;
                                }
                            }
                        }
                    }
                }
                return ret;
            };

            return searchDirectoryForKey(key, false);
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
            },
            getTimeAgo : function(date){
                if (date !== null) {
                    // convert date input to GMT time
                    date = this.toGMT(date);

                    var currentDate = new Date();
                    // convert current date to GMT time
                    currentDate = this.toGMT(currentDate);

                    var iTimeAgo = (currentDate - date) / (1000);
                    if (iTimeAgo < 60) {
                        if (Math.floor(iTimeAgo) === 1) {
                            return Math.floor(iTimeAgo) +" " + require("sakai/sakai.api.i18n").General.getValueForKey("SECOND");
                        }
                        return Math.floor(iTimeAgo) + " "+ require("sakai/sakai.api.i18n").General.getValueForKey("SECONDS");
                    } else if (iTimeAgo < 3600) {
                        if (Math.floor(iTimeAgo / 60) === 1) {
                            return Math.floor(iTimeAgo / 60) + " "+ require("sakai/sakai.api.i18n").General.getValueForKey("MINUTE");
                        }
                        return Math.floor(iTimeAgo / 60) + " "+ require("sakai/sakai.api.i18n").General.getValueForKey("MINUTES");
                    } else if (iTimeAgo < (3600 * 60)) {
                        if (Math.floor(iTimeAgo / (3600)) === 1) {
                            return Math.floor(iTimeAgo / (3600)) + " "+require("sakai/sakai.api.i18n").General.getValueForKey("HOUR");
                        }
                        return Math.floor(iTimeAgo / (3600)) + " "+require("sakai/sakai.api.i18n").General.getValueForKey("HOURS");
                    } else if (iTimeAgo < (3600 * 60 * 30)) {
                        if (Math.floor(iTimeAgo / (3600 * 60)) === 1) {
                            return Math.floor(iTimeAgo / (3600 * 60)) + " "+require("sakai/sakai.api.i18n").General.getValueForKey("DAY");
                        }
                        return Math.floor(iTimeAgo / (3600 * 60)) + " "+require("sakai/sakai.api.i18n").General.getValueForKey("DAYS");
                    } else if (iTimeAgo < (3600 * 60 * 30 * 12)) {
                        if (Math.floor(iTimeAgo / (3600 * 60 * 30)) === 1) {
                            return Math.floor(iTimeAgo / (3600 * 60 * 30)) + " "+require("sakai/sakai.api.i18n").General.getValueForKey("MONTH");
                        }
                        return Math.floor(iTimeAgo / (3600 * 60 * 30)) + " "+require("sakai/sakai.api.i18n").General.getValueForKey("MONTHS");
                    } else {
                        if (Math.floor(iTimeAgo / (3600 * 60 * 30 * 12) === 1)) {
                            return Math.floor(iTimeAgo / (3600 * 60 * 30 * 12)) + " "+require("sakai/sakai.api.i18n").General.getValueForKey("YEAR");
                        }
                        return Math.floor(iTimeAgo / (3600 * 60 * 30 * 12)) + " "+require("sakai/sakai.api.i18n").General.getValueForKey("YEARS");
                    }
                }
                return null;
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
         * A cache that will keep a copy of every template we have parsed so far. Like this,
         * we avoid having to parse the same template over and over again.
         */
        templateCache : [],

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
                        debug.error("TemplateRenderer:", e);
                    }
                    

                }
                else {
                    throw "TemplateRenderer: The template '" + templateName + "' could not be found";
                }
            }

            // Run the template and feed it the given JSON object
            var render = "";
            try {
                render = this.templateCache[templateName].process(templateData);
            } catch (err) {
                debug.error("TemplateRenderer:", err);
            }
            

            // Run the rendered html through the sanitizer
            if (sanitize) {
                render = util.Security.saneHTML(render);
            }

            // Check it there was an output element defined
            // If so, put the rendered template in there
            if (outputElement) {
                outputElement.html(render);
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
                    return $("<div/>").text(inputString).html().replace(/"/g,"&quot;");
                } else {
                    return "";
                }
            },

            /**
             * Represent URL if any in an anchor tag.
             * @param {Object} message Message that user has entered.
             */
            replaceURL : function(message){
                // get the regex code from
                // http://www.codeproject.com/KB/scripting/replace_url_in_ajax_chat.aspx
                return message.replace(/(\w+):\/\/[\S]+(\b|$)/gim,'<a href="$&" class="my_link s3d-regular-links s3d-bold" target="_blank">$&</a>');
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
                    var testUrl = decodeURIComponent(url.replace(/\s+/g,""));
                    var js = "javascript"; // for JSLint to be happy, this needs to be broken up
                    js += ":;";
                    var jsRegex = new RegExp("^(.*)javascript:(.*)+$");
                    var vbRegex = new RegExp("^(.*)vbscript:(.*)+$");
                    if ((jsRegex.test(testUrl) || vbRegex.test(testUrl)) && testUrl !== js) {
                        url = null;
                    } else if (testUrl !== js) {
                        // check for utf-8 unicode encoding without semicolons
                        testUrl = testUrl.replace(/&/g,";&");
                        testUrl = testUrl.replace(";&","&") + ";";

                        var nulRe = /\0/g;
                        testUrl = html.unescapeEntities(testUrl.replace(nulRe, ''));

                        if (jsRegex.test(testUrl) || vbRegex.test(testUrl)) {
                            url = null;
                        }
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
                html4.ELEMENTS["embed"] = 0;
                html4.ELEMENTS["i"] = 0;
                html4.ATTRIBS["embed::src"] = 0;
                html4.ATTRIBS["embed::class"] = 0;
                html4.ATTRIBS["embed::autostart"] = 0;
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
                                }
                                if (atype !== null) {
                                    switch (atype) {
                                        case html4.atype.SCRIPT:
                                        case html4.atype.STYLE:
                                            var accept = ["color", "display", "background-color", "font-weight", "font-family",
                                                          "padding", "padding-left", "padding-right", "text-align", "font-style",
                                                          "text-decoration", "border"];
                                            var sanitizedValue = "";
                                            if (value){
                                                var vals = value.split(";");
                                                for (var attrid = 0; attrid < vals.length; attrid++){
                                                    var attrValue = $.trim(vals[attrid].split(":")[0]).toLowerCase();
                                                    if ($.inArray(attrValue, accept)){
                                                        sanitizedValue += vals[i];
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


            /** Description - TO DO */
            setPermissions : function(target, type, permissions_object) {

            },

            /** Description - TO DO */
            getPermissions : function(target, type, permissions_object) {

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

            showPage : function(callback){
                // Show the background images used on anonymous user pages
                if ($.inArray(window.location.pathname, sakai_conf.requireAnonymous) > -1){
                    $('html').addClass("requireAnon");
                // Show the normal background
                } else {
                    $('html').addClass("requireUser");
                }
                util.loadSkinsFromConfig();

                // Put the title inside the page
                var pageTitle = require("sakai/sakai.api.i18n").General.getValueForKey(sakai_conf.PageTitles.prefix);
                if (sakai_conf.PageTitles.pages[window.location.pathname]){
                    pageTitle += require("sakai/sakai.api.i18n").General.getValueForKey(sakai_conf.PageTitles.pages[window.location.pathname]);
                }
                document.title = pageTitle;
                // Show the actual page content
                $('body').show();
                if ($.isFunction(callback)) {
                    callback();
                }
            }
        },
        /**
        * Runs MathJax over an element replacing any math TeX with rendered 
        * rendered formulas
        *
        * @param element {String} The element (or it's id) that should be checked for math
        */
        renderMath : function(element) {
            if (element instanceof jQuery && element[0])
            {
                element = element[0];
            }
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
        }
    };
    
    return util;
});
