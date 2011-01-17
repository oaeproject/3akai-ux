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
sakai.api.Util = sakai.api.Util || {};


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
sakai.api.Util.createSakaiDate = function(date, format, offset) {
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
};

/**
 * Convert a file's size to a human readable size
 * example: 2301 = 2.301kB
 *
 * @param (Integer) filesize The file's size to convert
 * @return (String) the file's size in human readable format
 */

sakai.api.Util.convertToHumanReadableFileSize = function(filesize) {
    if (filesize.indexOf("binary-length:") > -1) {
        filesize = filesize.replace("binary-length:", "");
    }
    // Divide the length into its largest unit
    var units = [[1024 * 1024 * 1024, 'GB'], [1024 * 1024, 'MB'], [1024, 'KB'], [1, 'bytes']];
    var lengthunits;
    for (var i = 0, j=units.length; i < j; i++) {

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
    return sakai.api.l10n.transformDecimal(filesize, 1) + " " + lengthunits;
};

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
sakai.api.Util.formatTags = function(inputTags){
    if ($.trim(inputTags) !== "") {
        var tags = [];
        var splitTags = $(inputTags.split(","));
        splitTags.each(function(index){
            if ($.trim(splitTags[index]).length) {
                tags.push($.trim(splitTags[index]));
            }
        });
        return tags;
    }
    else {
        return [];
    }
};

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
sakai.api.Util.formatTagsExcludeLocation = function(input){
    var inputTags = sakai.api.Util.formatTags(input);
    if (inputTags.length) {
        var tags = [];
        for (var item in inputTags){
            if (inputTags[item].split("/")[0] != "directory") {
                tags.push(inputTags[item]);
            }
        }
        return tags;
    } else {
        return [];
    }
};

/**
 * Formats a comma separated string of text to an array of usable directory tags
 * Returns the array of tags, if no tags were provided or none were valid an empty array is returned
 *
 * Example: inputTags = "tag1, directory/tag2, , , tag3, , directory/tag4" returns ["directory/tag2","directory/tag4"]
 *
 * @param {String} inputTags Unformatted, comma separated, string of tags put in by a user
 * @return {Array} Array of formatted tags
 */
sakai.api.Util.getDirectoryTags = function(input){
    var inputTags = sakai.api.Util.formatTags(input);
    if (inputTags.length) {
        var tags = [];
        for (var item in inputTags){
            if (inputTags.hasOwnProperty(item) && inputTags[item] && inputTags[item].split("/")[0] == "directory") {
                tags.push(inputTags[item].split("directory/")[1].split("/"));
            }
        }
        return tags;
    } else {
        return [];
    }
};

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

sakai.api.Util.tagEntity = function(tagLocation, newTags, currentTags, callback) {
    var setTags = function(tagLocation, tags, callback) {
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
            sakai.api.Server.batch($.toJSON(requests), function(success, data) {
                if (success) {
                    doSetTags(tags);
                } else {
                    debug.error(val + " failed to be created");
                    if ($.isFunction(callback)) {
                        callback();
                    }
                }
            });
        } else {
            if ($.isFunction(callback)) {
                callback();
            }
        }

        // set the tag on the entity
        var doSetTags = function(tags) {
            var requests = [];
            $(tags).each(function(i,val) {
                requests.push({
                    "url": tagLocation,
                    "method": "POST",
                    "parameters": {
                        "key": "/tags/" + val,
                        ":operation": "tag"
                    }
                });
            });
            sakai.api.Server.batch($.toJSON(requests), function(success, data) {
                if (success) {
                    if ($.isFunction(callback)) {
                        callback();
                    }
                } else {
                    debug.error(tagLocation + " failed to be tagged as " + val);
                }
            });
        };
    };

    /**
     * Delete tags on a given node
     *
     * @param (String) tagLocation the URL to the tag, ie. (~userid/public/authprofile)
     * @param (Array) tags Array of tags to be deleted from the entity
     * @param (Function) callback The callback function
     */

    var deleteTags = function(tagLocation, tags, callback) {
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
            sakai.api.Server.batch($.toJSON(requests), function(success, data) {
                if (!success) {
                    debug.error(val + " tag failed to be removed from " + tagLocation);
                }
                if ($.isFunction(callback)) {
                    callback();
                }
            });
        } else {
            if ($.isFunction(callback)) {
                callback();
            }
        }
    };

    var tagsToAdd = [];
    var tagsToDelete = [];
    // determine which tags to add and which to delete
    $(newTags).each(function(i,val) {
        val = $.trim(val).replace(/#/g,"");
        if (val && $.inArray(val,currentTags) == -1) {
            if (sakai.api.Security.escapeHTML(val) === val && val.length) {
                if ($.inArray(val, tagsToAdd) < 0) {
                    tagsToAdd.push(val);
                }
            }
        }
    });
    $(currentTags).each(function(i,val) {
        val = $.trim(val).replace(/#/g,"");
        if (val && $.inArray(val,newTags) == -1) {
            if (sakai.api.Security.escapeHTML(val) === val && val.length) {
                if ($.inArray(val, tagsToDelete) < 0) {
                    tagsToDelete.push(val);
                }
            }
        }
    });
    deleteTags(tagLocation, tagsToDelete, function() {
        setTags(tagLocation, tagsToAdd, function() {
            if ($.isFunction(callback)) {
                callback();
            }
        });
    });

};

/**
 * @class notification
 *
 * @description
 * Utility functions related to notifications messages in Sakai3
 *
 * @namespace
 * Notifications messages
 */
sakai.api.Util.notification = sakai.api.Util.notification || {};


/**
 * Show notification messages
 * @example sakai.api.Util.notification.show("Title Message", "z2", "z01");
 * @param {String} title The notification title (if it is an empty string, the title isn't shown)
 * @param {String} text The text you want to see appear in the body of the notification
 * @param {Constant} [type] The type of the notification. If this is not supplied, we use the type "information"
 * @param {Boolean} sticky The sticky (if it is true, the notification doesn't disappear without using action)
 */
sakai.api.Util.notification.show = function(title, text, type , sticky){

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
    var notification = type || sakai.api.Util.notification.type.INFORMATION;

    // Set the title and text
    notification.title = title;
    notification.text = text;
    notification.sticky = sticky;

    // Show a the actual notification to the user
    $.gritter.add(notification);

};


/**
 * Remove all the notification messages that are currently visible to the user
 */
sakai.api.Util.notification.removeAll = function(){

    // Remove gritter notification messages
    // We don't use the $.gritter.removeAll method since that causes pop-ups to flicker
    $('#gritter-notice-wrapper').remove();

};


/**
 * @class type
 *
 * @description
 * Namespace that contains all the different notification types
 *
 * @namespace
 * Notifications types
 */
sakai.api.Util.notification.type = sakai.api.Util.notification.type || {};


/**
 * Object containing settings for the information notification type
 */
sakai.api.Util.notification.type.INFORMATION = $.extend(true, {}, sakai.config.notification.type.INFORMATION);


/**
 * Object containing settings for the error notification type
 */
sakai.api.Util.notification.type.ERROR = $.extend(true, {}, sakai.config.notification.type.ERROR);


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
sakai.api.Util.parseSakaiDate = function(dateInput) {

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
};


/**
 * Parse an RFC822 date into a JavaScript date object.
 * Examples of RFC822 dates:
 * Wed, 02 Oct 2002 13:00:00 GMT
 * Wed, 02 Oct 2002 13:00:00 +0200
 *
 * @param {String} dateString
 * @return {Date}  a Javascript date object
 */
sakai.api.Util.parseRFC822Date = function(dateString) {

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

};


/**
 * Removes JCR or Sling properties from a JSON object
 * @param {Object} i_object The JSON object you want to remove the JCR object from
 * @returns void
 */
sakai.api.Util.removeJCRObjects = function(i_object) {

    if (i_object["jcr:primaryType"]) {
        delete i_object["jcr:primaryType"];
    }

    if (i_object["jcr:created"]) {
        delete i_object["jcr:created"];
    }

    if (i_object["jcr:createdBy"]) {
        delete i_object["jcr:createdBy"];
    }

    if (i_object["jcr:mixinTypes"]) {
        delete i_object["jcr:mixinTypes"];
    }

    // Loop through keys and call itself recursively for the next level if an object is found
    for (var i in i_object) {
        if (i_object.hasOwnProperty(i) && $.isPlainObject(i_object[i])) {
          sakai.api.Util.removeJCRObjects(i_object[i]);
        }
    }

};


/**
 * Shorten a string and add 3 dots if the string is too long
 *
 * @param {String} input The string you want to shorten
 * @param {Int} maxlength Maximum length of the string
 * @returns {String} The shortened string with 3 dots
 */
sakai.api.Util.shortenString = function(input, maxlength){

    var return_string = "";

    if ((typeof input === "string") && (input.length > maxlength)) {
        return_string = input.substr(0, maxlength) + "...";
    } else {
        return_string = input;
    }

    return return_string;
};


/**
 * Sets the chat bullets after update of status by
 * adding the right status css class on an element.
 * @param {Object} element the jquery element you wish to add the class to
 * @param {Object} status the status
 */
sakai.api.Util.updateChatStatusElement = function(element, chatstatus) {
    element.removeClass("chat_available_status_online");
    element.removeClass("chat_available_status_busy");
    element.removeClass("chat_available_status_offline");
    element.addClass("chat_available_status_" + chatstatus);
};


(function($){
    sakai.api.Util.include = {};
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
    var insertTag = function(tagname, attributes) {
        var tag = document.createElement(tagname);
        var head = document.getElementsByTagName('head').item(0);
        for (var a in attributes){
            if(attributes.hasOwnProperty(a)){
                tag[a] = attributes[a];
            }
        }
        head.appendChild(tag);
    };

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
    var checkForTag = function(tagname, attributes) {
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
    };

    /**
     * Load a JavaScript file into the document
     * @param {String} URL of the JavaScript file relative to the parent dom.
     */
    sakai.api.Util.include.js = function(url) {
        var attributes = {"src": url, "type": "text/javascript"};
        var existingScript = checkForTag("script", attributes);
        if (existingScript) {
            // Remove the existing script so we can place in a new one
            // We need to do this otherwise the init functions that need to be called
            // at the end of widgets never get called again
            existingScript.remove();
        }
        insertTag("script", {"src" : url, "type" : "text/javascript"});
    };

    /**
     * Load a CSS file into the document
     * @param {String} URL of the CSS file relative to the parent dom.
     */
    sakai.api.Util.include.css = function(url) {
        var attributes = {"href" : url, "type" : "text/css", "rel" : "stylesheet"};
        var existingStylesheet = checkForTag("link", attributes);
        // if the stylesheet already exists, don't add it again
        if (!existingStylesheet) {
            insertTag("link", attributes);
        }
    };

})(jQuery);

/**
 * @class Sorting
 *
 * @description
 * Sorting algorithms
 *
 * @namespace
 * Sorting functions
 */
sakai.api.Util.Sorting = {

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
};
