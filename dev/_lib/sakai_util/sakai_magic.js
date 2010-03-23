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

/*global $, jQuery, fluid, TrimPath, Widgets, window, document */

/**
 * @name sakai
 * @namespace
 * Main sakai namespace
 *
 * @description
 * Main sakai namespace. This is where all the initial namespaces should be defined
 */
var sakai = sakai || {};
sakai.data = {};

/**
 * @name sakai.api
 *
 * @namespace
 * Main API Namespace
 *
 * @class api
 *
 * @description
 * Convenience functions to aid Sakai 3 front-end development.
 * This class is the basis of all Sakai 3 front-end development. This should
 * be included on all pages, along with the sakai_api.js which is an extension
 * of this class, providing higher level functions.
 *
 * @requires
 * jQuery-1.3.2, Fluid, Trimpath
 *
 * @version 0.0.1
 *
 */
sakai.api = {

    /** API Major version number */
    API_VERSION_MAJOR: 0,

    /** API minor version number */
    API_VERSION_MINOR: 0,

    /** API build number  */
    API_VERSION_BUILD: 1

};


(function(){


/**
 * @class Communication
 *
 * @description
 * Communication related convenience functions. This should only hold
 * functions which are used across multiple pages, and does not constitute
 * functionality related to a single area/pag
 *
 * @namespace
 * Communication related convenience functions
 */
sakai.api.Communication = sakai.api.Communication || {};


/**
 * Sends a message to a user
 *
 * @param userID {String} The user ID of the recipient
 *
 * @param message {String} The text of the message
 *
 * @returns true or false depending on whether the sending was successful or not
 * @type Boolean
 */
sakai.api.Communication.sendMessageToUser = function(userID, message) {

};

/**
 * Sends a message to all members of a group
 *
 * @param groupID {String} The user ID of the recipient
 *
 * @param message {String} The text of the message
 *
 * @returns true or false depending on whether the sending was successful or not
 * @type Boolean
 */
sakai.api.Communication.sendMessageToGroup = function(groupID, message) {

};

/**
 * Invites a user to become a contact of the logged in user
 *
 * @param groupID {String} The user ID of the recipient
 *
 * @param message {String} The text of the message
 *
 * @returns true or false depending on whether the sending was successful or not
 * @type Boolean
 */
sakai.api.Communication.inviteUser = function(userID) {

};





/**
 * @class Documents
 *
 * @description
 * Document related functionality, file management.This should only hold f
 * unctions which are used across multiple pages, and does not constitute
 * functionality related to a single area/page
 *
 * @namespace
 * Document and file management
 */
sakai.api.Documents = sakai.api.Documents || {};







/**
 * @class Groups
 *
 * @description
 * Group related convenience functions. This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Group related convenience functions
 */
sakai.api.Groups = sakai.api.Groups || {};


/**
 * Adds logged in user to a specified group
 *
 * @param groupID {String} The ID of the group we would like the user to become
 * a member of
 * @param callback {Function} Callback function executed at the end of the
 * operation
 * @returns true or false
 * @type Boolean
 */
sakai.api.Groups.addToGroup = function(groupID, callback) {

};


/**
 * Removes logged in user from a specified group
 *
 * @param groupID {String} The ID of the group we would like the user to be
 * removed from
 * @param callback {Function} Callback function executed at the end of the
 * operation
 *
 * @returns true or false
 * @type Boolean
 */
sakai.api.Groups.removeFromGroup = function(groupID, callback) {

};

/**
 * Returns all the users who are member of a certain group
 *
 * @param groupID {String} The ID of the group we would like to get the members
 * of
 * @param callback {Function} Callback function executed at the end of the
 * operation, containing the member user's data
 *
 * @returns true or false
 * @type Boolean
 */
sakai.api.Groups.getMembers = function(groupID, callback) {

};






/**
 * @class i18n
 *
 * @description
 * Internationalisation related functions for general page content, widget
 * content and UI elements This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Internationalisation
 */
sakai.api.i18n = sakai.api.i18n || {};

/**
 * Start general i18n process
 */
sakai.api.i18n.init = function() {

};

/**
 * Page UI and content related i18n process
 */
sakai.api.i18n.i18nGeneral = function() {

};

/**
 * Widget related i18n process
 */
sakai.api.i18n.i18nWidgets = function() {

};






/**
 * @class l10n
 *
 * @description
 * Localisation related functions for general page content, widget
 * content and UI elements This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Language localisation
 */
sakai.api.l10n = sakai.api.l10n || {};

/**
 * Start the general l10n process
 */
sakai.api.l10n.init = function() {

};

/**
 * Get the current logged in user's locale
 *
 * @returns The user's locale string in XXX format
 * @type String
 */
sakai.api.l10n.getUserLocale = function() {

};

/**
 * Get a site's locale
 *
 * @returns The site's locale string in XXX format
 * @type String
 */
sakai.api.l10n.getSiteLocale = function() {

};








/**
 * @class Security
 *
 * @description
 * Security and authorisation related related convenience functions
 * This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Security and authorisation related functionality
 */
sakai.api.Security = sakai.api.Security || {};

/** Description - TO DO */
sakai.api.Security.setPermissions = function(target, type, permissions_object) {

};

/** Description - TO DO */
sakai.api.Security.getPermissions = function(target, type, permissions_object) {

};






/**
 * @class Server
 *
 * @description
 * Server communication and batch processing. This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Server related convenience functions and communication
 */
sakai.api.Server = sakai.api.Server || {};

/** Description - TO DO */
sakai.api.Server.batchGet = function() {

};

/** Description - TO DO */
sakai.api.Server.batchPost = function() {

};

/**
 * Saves a specified JSON object to a specified URL in JCR. The structure of JSON data will be re-created in JCR as a node hierarchy.
 *
 * @param i_url {String} The path to the preference where it needs to be
 * saved
 * @param i_data {Object} A JSON object whic we would like to save
 * (max 200 child object of each object)
 * @param callback {Function} A callback function which is executed at the
 * end of the operation
 *
 * @returns {Void}
 */
sakai.api.Server.saveJSON = function(i_url, i_data, callback) {

    // Argument check
    if ((!i_url) || (i_url === "") || (!i_data)) {
        fluid.log("sakai.api.Server.saveJSON: Not enough or empty arguments!");
        return;
    }

    // Create JSON String from supplied object
    var json_string = $.toJSON(i_data);

    // Send request
    $.ajax({
            url: i_url,
            type: "POST",
            data: {
                ":operation": "createTree",
                "tree": json_string
        },

        success: function(data) {

            // If a callback function is specified in argument, call it
            if (typeof callback === "function") {
                callback(true, data);
            }
        },

        error: function(xhr, status, e) {

            // Log error
            fluid.log("sakai.api.Server.saveJSON: There was an error saving JSON data to: " + this.url);

            // If a callback function is specified in argument, call it
            if (typeof callback === "function") {
                callback(false, xhr);
            }
        }
    });
};

/**
 * Loads structured preference data from a specified URL (and it's node subtree)
 *
 * @param i_url {String} The path to the preference which needs to be loaded
 * @param callback {Function} A callback function which is executed at the end
 * of the operation
 *
 * @returns {Void}
 */
sakai.api.Server.loadJSON = function(i_url, callback) {

    $.ajax({
        url: i_url + ".infinity.json",
        cache: false,
        success: function(data) {

            // Transform JSON string to an object
            var returned_data = $.evalJSON(data);

            // Remove keys which are created by JCR or Sling
            sakai.api.Util.removeJCRObjects(returned_data);

            // Call callback function if present
            if (typeof callback === "function") {
                callback(true, returned_data);
            }
        },
        error: function(xhr, status, e) {

            // Log error
            fluid.log("sakai.api.Server.loadJSON: There was an error loading JSON data from: " + this.url);

            // Call callback function if present
            if (typeof callback === "function") {
                callback(false, xhr);
            }
        }
    });

};

/**
 * Saves any type of data into one JCR node
 *
 * @param i_url {String} The path to the preference which needs to be loaded
 * @param i_data {String|Object} The data we want to save
 * @param callback {Function} A callback function which is executed at the end
 * of the operation
 * @returns void
 */
sakai.api.Server.saveData = function(i_url, i_data, callback) {

    // Argument check
    if ((!i_url) || (i_url === "") || (!i_data)) {
        fluid.log("sakai.api.Server.saveData: Not enough or empty arguments!");
        return;
    }

    // Create JSON String from supplied data if it's not a string
    var data_string = "";
    if (typeof i_data !== "string") {
        data_string = $.toJSON(i_data);
    } else {
        data_string = i_data;
    }


    // Send request
    $.ajax({
            url: i_url,
            type: "POST",
            data: {
                "sakai:data": data_string
            },

        success: function(data) {

            // If a callback function is specified in argument, call it
            if (typeof callback === "function") {
                callback(true, data);
            }
        },

        error: function(xhr, status, e) {

            // Log error
            fluid.log("sakai.api.Server.saveData: There was an error saving data to: " + this.url);

            // If a callback function is specified in argument, call it
            if (typeof callback === "function") {
                callback(false, xhr);
            }
        }
    });
};


/**
 * Loads saved data from a JCR node
 *
 * @param i_url {String} The path to the preference which needs to be loaded
 * @param callback {Function} A callback function which is executed at the end
 * of the operation
 *
 * @returns {Void}
 */
sakai.api.Server.loadData = function(i_url, callback) {


    // Append a .json to the end of the URL if it isn't there to avoid Nakamura throwing 403
    // Saving to a node has to be without .json - loading has to be with it...
    if (i_url.substr(-5) !== ".json") {
        i_url = i_url + ".json";
    }

    $.ajax({
        url: i_url,
        cache: false,
        success: function(data) {

            var node_data = $.evalJSON(data);

            // Call callback function if present
            if (typeof callback === "function") {
                callback(true, node_data["sakai:data"]);
            }
        },
        error: function(xhr, status, e) {

            // Log error
            if (xhr.status === 404) {
                fluid.log("sakai.api.Server.loadData:" + this.url + " does not exist!");
            } else {
                fluid.log("sakai.api.Server.loadData: There was an error loading data from: " + this.url + " Status code: " + xhr.status);
            }

            // Call callback function if present
            if (typeof callback === "function") {
                callback(false, xhr);
            }
        }
    });

};


/**
 * Loads in a CSS file at runtime from a given URL
 *
 * @param url {String} The URL pointing to the required CSS file
 *
 * @returns true or false
 * @type Boolean
 */
sakai.api.Server.requireCSS = function(url) {

};

/**
 * Loads in a JS file at runtime from a given URL
 *
 * @param url {String} The URL pointing to the required JS file
 *
 * @returns true or false
 * @type Boolean
 */
sakai.api.Server.requireJS = function(url) {

};







/**
 * @class Site
 *
 * @description
 * Site related common functionality,
 * This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Site related convenience functions
 */
sakai.api.Site = sakai.api.Site || {};


/** Description - TO DO */
sakai.api.Site.updateSettings = function(siteID, settings) {


};

/** Description - TO DO */
sakai.api.Site.addSiteMember = function(userID, siteID, role) {


};

/** Description - TO DO */
sakai.api.Site.removeSiteMember = function(userID, siteID) {


};

/** Description - TO DO */
sakai.api.Site.loadSkin = function(siteID, skinID) {


};






/**
 * @class User
 *
 * @description
 * Advanced user related functionality, especially common actions
 * that originate from a logged in user. This should only hold functions which
 * are used across multiple pages, and does not constitute functionality related
 * to a single area/page
 *
 * @namespace
 * Advanced user related functionality, especially common actions
 * that originate from a logged in user.
 */
sakai.api.User = sakai.api.User || {};


/**
 * Retrieves all available information about a logged in user and stores it under sakai.data.me object. When ready it will call a specified callback function
 *
 * @param callback {Function} A function which will be called when the information is retrieved from the server.
 * The first argument of the callback is a boolean whether it was successful or not, the second argument will contain the retrieved data or the xhr object
 * @returns void
 */
sakai.api.User.loadMeData = function(callback) {

    // Get the service url from the config file
    var data_url = sakai.config.URL.ME_SERVICE;

    // Start a request to the service
    $.ajax({
        url: data_url,
        cache: false,
        success: function(data){

            sakai.data.me = $.evalJSON(data);

            if (typeof callback === "function") {
                callback(true, sakai.data.me);
            }
        },
        error: function(xhr, textStatus, thrownError) {

            fluid.log("sakai.api.User.loadMeData: Could not load logged in user data from the me service!");

            if (typeof callback === "function") {
                callback(false, xhr);
            }
        }
    });
};



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
 * @param {String|Integer} dateInput The date that needs to be converted to a JavaScript date object
 * @return {Date} JavaScript date
 */
sakai.api.Util.parseSakaiDate = function(dateInput) {

    // Define the regular expressions that look for the format of
    // the dateInput field
    var regexpInteger = /^\d+$/;
    var regexpISO8601 = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";

    // Test whether the format is in milliseconds
    if(regexpInteger.test(dateInput)) {
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
 * Removes JCR or Sling properties from a JSON object
 * @param {Object} i_object The JSON object you want to remove the JCR object from
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
        if ((i_object.hasOwnProperty(i)) && (typeof i_object[i] === "object")) {
          var next_object = i_object[i];
          sakai.api.Util.removeJCRObjects(next_object);
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
 * URL encodes a given string
 *
 * @param s {String} The string we would like to URL encode
 *
 * @returns Returns the URL encoded string
 * @type String
 */
sakai.api.Util.URLEncode = function(s) {


};

/**
 * URL decodes a given URL encoded string
 *
 * @param s {String} The string we would like to decode
 *
 * @returns Returns the decoded string
 * @type String
 */
sakai.api.Util.URLDecode = function(s) {


};

/**
 * Strip all HTML tags from a given string
 *
 * @param s {String} The string we would like to strip all tags from
 *
 * @returns Returns the input string without tags
 * @type String
 */
sakai.api.Util.stripTags = function(s) {


};


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








/**
 * @class Widgets
 *
 * @description Widget related convenience functions. This should only hold
 * functions which are used across multiple pages, and does not constitute
 * functionality related to a single area/page
 *
 * @namespace
 * Widget related convenience functions
 */
sakai.api.Widgets = sakai.api.Widgets || {};


/**
 * @class Container
 *
 * @description
 * Widget container functions which assist embedding the widgets into a page
 *
 * @namespace
 * Widget container functions
 *
 */
sakai.api.Widgets.Container = {

    /**
    * Initialises the widget container
    *
    */
    init: function() {

    }
};


/**
 * Loads an instance of a widget
 *
 * @param widgetID {String} The ID of a Widget which needs to be loaded
 * @param callback {Function} The callback function which is called when the
 * loading is complete.
 *
 * @returns true if successful, false if there was an error
 * @type Boolean
 */
sakai.api.Widgets.loadWidget = function(widgetID, callback) {

};

/**
 * Renders an instance of a widget
 *
 * @param widgetID {String} The ID of a Widget which needs to be rendered
 * @returns true if successful, false if there was an error
 * @type Boolean
 */
sakai.api.Widgets.renderWidget = function(widgetID) {

};

/**
 * Loads a named widget preference from the user's private personal storage
 * @param {string} prefname the preference name
 * @param {function} callback the function to call on sucess
 *
 */
sakai.api.Widgets.loadWidgetData = function(prefname, w_id, w_placement, callback, requireslogin) {

    var widget_id = w_id || "";
    var placement = w_placement  || "";
    var args = (requireslogin === false ? false : true);
    var url= "/_user" + sakai.data.me.profile.path + "/private/widgets/" + prefname + "_" + placement + "_" + widget_id;

    $.ajax ( {
        url: url,
        cache: false,
        success: function(response) {
            var result = $.evalJSON(response);
            if (typeof callback === "function") {
                callback(true, result.data);
            }
        },
        error: function(xhr, textStatus, thrownError) {
            if (typeof callback === "function") {
                callback(false, xhr);
            }
        },
        sendToLoginOnFail: args
    });

};



/**
 * Save a named widget preference to the user's personal private storage
 *
 * @param {string} prefname the preference name
 * @param prefcontent the content to be saved
 * @param {function} callback, the call back to call when the save is complete
 * @returns void
 */
sakai.api.Widgets.saveWidgetData = function(prefname, prefcontent, w_id, w_placement, callback, requireslogin) {

    var args = (requireslogin === false ? false : true);
    var widget_id = w_id || "";
    var placement = w_placement  || "";
    var url= "/_user" + sakai.data.me.profile.path + "/private/widgets/" + prefname + "_" + placement + "_" + widget_id;

    $.ajax({
        url:url,
        type: "POST",
        data: {
            "data": prefcontent,
            "jcr:mixinTypes": "sakai:propertiesmix",
            "_charset_": "utf-8"
        },
        success : function(data) {

            if (typeof callback === "function") {
                callback(true, data);
            }

        },
        error: function(xhr, textStatus, thrownError) {
            if (typeof callback === "function") {
                callback(false, xhr);
            }
        },
        sendToLoginOnFail: args
    });

};

/**
 * Delete a named widget preference from the user's personal private storage
 *
 * @param {string} prefname the preference name
 * @param prefcontent the content to be saved
 * @param {function} callback, the call back to call when the save is complete
 * @returns void
 */
sakai.api.Widgets.deleteWidgetData = function(prefname, w_id, w_placement, callback, requireslogin) {

    var args = (requireslogin === false ? false : true);
    var widget_id = w_id || "";
    var placement = w_placement  || "";
    var url= "/_user" + sakai.data.me.profile.path + "/private/widgets/" + prefname + "_" + placement + "_" + widget_id;

    $.ajax({
        url:url,
        type: "DELETE",
        success : function(data) {

            if (typeof callback === "function") {
                callback(true, data);
            }

        },
        error: function(xhr, textStatus, thrownError) {
            if (typeof callback === "function") {
                callback(false, xhr);
            }
        },
        sendToLoginOnFail: args
    });

};



})();












/**
 * @name $
 * @namespace
 * jQuery Plugins and overrides for Sakai.
 */


(function($){

    /**
    * Override default jQuery error behavior
    * @function
    * @param s {String} s description
    * @param xhr {Object} xhr object
    * @param status {String} Status message
    * @param e {Object} Thrown error
    */
    $.handleError = function (s, xhr, status, e) {

    };

})(jQuery);



/////////////////////////////////////
// jQuery TrimPath Template Plugin //
/////////////////////////////////////

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
(function($){

    /**
     * A cache that will keep a copy of every template we have parsed so far. Like this,
     * we avoid having to parse the same template over and over again.
     */
    var templateCache = [];

    /**
    * Trimpath Template Renderer: Renders the template with the given JSON object, inserts it into a certain HTML
    * element if required, and returns the rendered HTML string
    * @function
    * @param templateElement {String|Object} templateElement The name of the template HTML ID or a jQuery selection object.
    * @param templateData {Object} JSON object containing the template data
    * @param outputElement {Object} (Optional) jQuery element in which the template needs to be rendered
    */
    $.TemplateRenderer = function (templateElement, templateData, outputElement) {

        var templateName;

        // The template name and the context object should be defined
        if(!templateElement || !templateData){
            throw "$.TemplateRenderer: the template name or the templateData is not defined";
        }

        if(templateElement instanceof jQuery && templateElement[0]){
            templateName = templateElement[0].id;
        }
        else if (typeof templateElement === "string"){
            templateName = templateElement.replace("#", "");
            templateElement = $("#" + templateName);
        }
        else {
            throw "$.TemplateRenderer: The templateElement is not in a valid format or the template couldn't be found.";
        }

        if (!templateCache[templateName]) {
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
                templateCache[templateName] = TrimPath.parseTemplate(template, templateName);

            }
            else {
                throw "$.TemplateRenderer: The template '" + templateName + "' could not be found";
            }
        }

        // Run the template and feed it the given JSON object
        var render = templateCache[templateName].process(templateData);

        // Check it there was an output element defined
        // If so, put the rendered template in there
        if (outputElement) {
            outputElement.html(render);
        }

        return render;

    };

})(jQuery);



/**
 * @name Array
 * @namespace
 * Array extensions for Sakai
 */
if(Array.hasOwnProperty("indexOf") === false){

    /**
    * Finds the first occurrence of an element in an array and returns its
    * position. This only kicks in when the native .indexOf method is not
    * available in the browser.
    *
    * @param obj {Object/String/Integer} The element we are looking for
    * @param start {Integer} Where the search starts within the array
    *
    * @returns Returns the position of the first matched element
    * @type Integer
    */
    Array.prototype.indexOf = function(obj,start){

        for(var i=(start||0),j=this.length; i<j; i++){
            if(this[i]===obj){
                return i;
            }
        }
        return -1;

    };
}




/**
 * Entry point for functions which needs to automatically start on each page
 * load.
 *
 * @returns {Void}
 */
sakai.api.autoStart = function() {

    // Load logged in user data
    sakai.api.User.loadMeData(function(success, data){

        // Start i18n
        sakai.api.i18n.init();

        // Start l10n
        sakai.api.l10n.init();
    });

    // Start Widget container functions
    sakai.api.Widgets.Container.init();


};
sakai.api.autoStart();