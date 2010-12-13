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
 * @name sakai
 * @namespace
 * Main sakai namespace
 *
 * @description
 * Main sakai namespace. This is where all the initial namespaces should be defined
 */
var sakai = sakai || {};

/**
 * @name sakai.data
 */
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

/**
 * window.debug, a console dot log wrapper
 * adapted from html5boilerplate.com's window.log and Ben Alman's window.debug
 *
 * Only logs information when sakai.config.displayDebugInfo is switched on
 *
 * debug.log, debug.error, debug.warn, debug.debug, debug.info
 * usage: debug.log("argument", {more:"arguments"})
 *
 * paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
 * benalman.com/projects/javascript-debug-console-log/
 * https://gist.github.com/466188
 */
window.debug = (function() {
    var that = {},
        methods = [ 'error', 'warn', 'info', 'debug', 'log' ],
        idx = methods.length;

    var createLogMethod = function(method) {
        that[method] = function() {
            if (!window.console || !sakai.config.displayDebugInfo) {
                return;
            }
            if (console.firebug) {
                console[method].apply(console, arguments);
            } else if (console[method]) {
                console[method](Array.prototype.slice.call(arguments));
            } else {
                console.log(Array.prototype.slice.call(arguments));
            }
        };
    };

    while (--idx>=0) {
        createLogMethod(methods[idx]);
    }

    return that;
})();

/**
 * @class Activity
 *
 * @description
 * Activity related convenience functions which build on the top of Nakamura's
 * event system.
 * This should only hold functions which are used across multiple pages,
 * and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Events related functions
 */
sakai.api.Activity = sakai.api.Activity || {};


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
sakai.api.Activity.createActivity = function(nodeUrl, appID, templateID, extraData, callback) {

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
};

/**
 * @class Skinning
 *
 * @description
 * <p>Skinning support for Sakai</p>
 */
sakai.api.Skinning = sakai.api.Skinning || {};

/**
 * loadSkins
 * Loads in any skins defined in sakai.config.skinCSS
 */
sakai.api.Skinning.loadSkinsFromConfig = function() {
    if (sakai.config.skinCSS && sakai.config.skinCSS.length) {
        $(sakai.config.skinCSS).each(function(i,val) {
            sakai.api.Util.include.css(val);
        });
    }
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

/**
 * Encodes the HTML characters inside a string so that the HTML characters (e.g. <, >, ...)
 * are treated as text and not as HTML entities
 *
 * @param {String} inputString  String of which the HTML characters have to be encoded
 *
 * @returns {String} HTML Encoded string
 */
sakai.api.Security.escapeHTML = function(inputString){
    if (inputString) {
        return $("<div/>").text(inputString).html().replace(/"/g,"&quot;");
    } else {
        return "";
    }
};

/**
 * Sanitizes HTML content. All untrusted (user) content should be run through
 * this function before putting it into the DOM
 *
 * @param inputHTML {String} The content string we would like to sanitize
 *
 * @returns {String} Escaped and sanitized string
 */
sakai.api.Security.saneHTML = function(inputHTML) {

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

};


/**
 * Checks whether the given value is valid as defined by the given
 * permissionsProperty.
 *
 * @param {Object} permissionsProperty Permissions property object
 *   (i.e. sakai.config.Permissions.Groups.joinable) with valid values to check
 *   against
 * @param {Object} value Value to investigate
 * @return true if the value has a valid property value, false otherwise
 */
sakai.api.Security.isValidPermissionsProperty = function(permissionsProperty, value) {
    if(!value || value === "") {
        // value is empty - not valid
        return false;
    }
    for(var index in permissionsProperty) {
        if(permissionsProperty.hasOwnProperty(index)) {
            if(value === permissionsProperty[index]) {
                // value is valid
                return true;
            }
        }
    }
    // value is not valid
    return false;
};


/** Description - TO DO */
sakai.api.Security.setPermissions = function(target, type, permissions_object) {

};

/** Description - TO DO */
sakai.api.Security.getPermissions = function(target, type, permissions_object) {

};

/**
 * Function that can be called by pages that can't find the content they are supposed to
 * show.
 */
sakai.api.Security.send404 = function(){
    var redurl = window.location.pathname + window.location.hash;
    document.location = "/dev/404.html?redurl=" + escape(window.location.pathname + window.location.search + window.location.hash);
    return false;
};

/**
 * Function that can be called by pages that don't have the permission to show the content
 * they should be showing
 */
sakai.api.Security.send403 = function(){
    var redurl = window.location.pathname + window.location.hash;
    document.location = "/dev/403.html?redurl=" + escape(window.location.pathname + window.location.search + window.location.hash);
    return false;
};

/**
 * Function that can be called by pages that require a login first
 */
sakai.api.Security.sendToLogin = function(){
    var redurl = window.location.pathname + window.location.hash;
    document.location = sakai.config.URL.GATEWAY_URL + "?url=" + escape(window.location.pathname + window.location.search + window.location.hash);
    return false;
};

sakai.api.Security.showPage = function(callback){
    // Show the background images used on anonymous user pages
    if ($.inArray(window.location.pathname, sakai.config.requireAnonymous) > -1){
        $('html').addClass("requireAnon");
    // Show the normal background
    } else {
        $('html').addClass("requireUser");
    }
    sakai.api.Skinning.loadSkinsFromConfig();
    // Put the title inside the page
    var pageTitle = sakai.api.i18n.General.getValueForKey(sakai.config.PageTitles.prefix);
    if (sakai.config.PageTitles.pages[window.location.pathname]){
        pageTitle += sakai.api.i18n.General.getValueForKey(sakai.config.PageTitles.pages[window.location.pathname]);
    }
    document.title = pageTitle;
    // Show the actual page content
    $('body').show();
    if ($.isFunction(callback)) {
        callback();
    }
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
 * @param {String} i_url The path to the preference where it needs to be
 * saved
 * @param {Object} i_data A JSON object which we would like to save
 * (max 200 child object of each object)
 * @param {Function} callback A callback function which is executed at the
 * end of the operation
 *
 * @returns {Void}
 */
sakai.api.Server.saveJSON = function(i_url, i_data, callback) {

    // Argument check
    if (!i_url || !i_data) {

        // Log the error message
        debug.warn("sakai.api.Server.saveJSON: Not enough or empty arguments!");

        // Still invoke the callback function
        if ($.isFunction(callback)) {
            callback(false, "The supplied arguments were incorrect.");
        }

        // Make sure none of the other code in this function is executed
        return;
    }

    /**
     * <p>Convert all the arrays in an object to an object with a unique key.<br />
     * Mixed arrays (arrays with multiple types) are not supported.
     * </p>
     * <code>
     * {
     *     "boolean": true,
     *     "array_object": [{ "key1": "value1", "key2": "value2"}, { "key1": "value1", "key2": "value2"}]
     * }
     * </code>
     * to
     * <code>
     * {
     *     "boolean": true,
     *     "array_object": {
     *         "__array__0__": { "key1": "value1", "key2": "value2"},
     *         "__array__1__": { "key1": "value1", "key2": "value2"}
     *     }
     * }
     * </code>
     * @param {Object} obj The Object that you want to use to convert all the arrays to objects
     * @return {Object} An object where all the arrays are converted into objects
     */
    var convertArrayToObject = function(obj) {

        // Since the native createTree method doesn't support an array of objects natively,
        // we need to write extra functionality for this.
        for(var i in obj){

            // Check if the element is an array, whether it is empty and if it contains any elements
            if (obj.hasOwnProperty(i) && $.isArray(obj[i]) && obj[i].length > 0) {

                // Deep copy the array
                var arrayCopy = $.extend(true, [], obj[i]);

                // Set the original array to an empty object
                obj[i] = {};

                // Add all the elements that were in the original array to the object with a unique id
                for (var j = 0, jl = arrayCopy.length; j < jl; j++) {

                    // Copy each object from the array and add it to the object
                    obj[i]["__array__" + j + "__"] = arrayCopy[j];

                    // Run recursively
                    convertArrayToObject(arrayCopy[j]);
                }
            }

            // If there are array elements inside
            else if ($.isPlainObject(obj[i])) {
                convertArrayToObject(obj[i]);
            }

        }

        return obj;
    };

    // Convert the array of objects to only objects
    // We also need to deep copy the object so we don't modify the input parameter
    i_data = convertArrayToObject($.extend(true, {}, i_data));

    // Send request
    $.ajax({
        url: i_url,
        type: "POST",
        data: {
            ":operation": "import",
            ":contentType": "json",
            ":content": $.toJSON(i_data),
            ":replace": true,
            ":replaceProperties": true
        },
        dataType: "json",

        success: function(data){

            // If a callback function is specified in argument, call it
            if ($.isFunction(callback)) {
                callback(true, data);
            }
        },

        error: function(xhr, status, e){

            // Log error
            debug.error("sakai.api.Server.saveJSON: There was an error saving JSON data to: " + this.url);

            // If a callback function is specified in argument, call it
            if ($.isFunction(callback)) {
                callback(false, xhr);
            }
        }
    });

};

/**
 * Loads structured preference data from a specified URL (and it's node subtree)
 *
 * @param {String} i_url The path to the preference which needs to be loaded
 * @param {Function} callback A callback function which is executed at the end
 * of the operation
 * @param {Object} data The data to pass to the url
 *
 * @returns {Void}
 */
sakai.api.Server.loadJSON = function(i_url, callback, data) {
    // Argument check
    if (!i_url) {

        // Log the error message
        debug.info("sakai.api.Server.loadJSON: Not enough or empty arguments!");

        // Still invoke the callback function
        if ($.isFunction(callback)) {
            callback(false, "The supplied arguments were incorrect.");
        }

        // Make sure none of the other code in this function is executed
        return;
    }

    // append .infinity.json if .json isn't present in the url
    if (i_url.indexOf(".json") === -1) {
        i_url += ".infinity.json";
    }

    $.ajax({
        url: i_url,
        cache: false,
        dataType: "json",
        data: data,
        success: function(data) {

            // Remove keys which are created by JCR or Sling
            sakai.api.Util.removeJCRObjects(data);

            // Convert the special objects to arrays
            data = sakai.api.Server.loadJSON.convertObjectToArray(data, null, null);

            // Call callback function if present
            if ($.isFunction(callback)) {
                callback(true, data);
            }
        },
        error: function(xhr, status, e) {

            // Log error
            debug.warn("sakai.api.Server.loadJSON: There was an error loading JSON data from: " + this.url);

            // Call callback function if present
            if ($.isFunction(callback)) {
                callback(false, xhr);
            }
        }
    });
};

/**
 * <p>Convert all the objects with format __array__?__ in an object to an array</p>
 * <code>
 * {
 *     "boolean": true,
 *     "array_object": {
 *         "__array__0__": {
 *             "key1": "value1",
 *             "key2": "value2"
 *         }
 *     }
 * }
 * </code>
 * to
 * <code>
 * {
 *     "boolean": true,
 *     "array_object": [
 *         {
 *             "key1": "value1",
 *             "key2": "value2"
 *        }
 *     ]
 * }
 * </code>
 * @param {Object} specficObj The Object that you want to use to convert all the objects with the special format to arrays
 * @param {Object} [globalObj] The parent object, we need this to run over the elements recursively
 * @param {Object} [objIndex] The index of the parent object
 * @return {Object} An object where all the objects with the special format are converted into arrays
 */
sakai.api.Server.loadJSON.convertObjectToArray = function(specficObj, globalObj, objIndex){

    // Run over all the items in the object
    for (var i in specficObj) {

        // If exists and it's an object recurse
        if (specficObj.hasOwnProperty(i)) {

            // If it's a non-empty array-object it will have a first element with the key "__array__0__"
            if (i === "__array__0__") {

                // We need to get the number of items in the object
                var arr = [];
                var count = 0;
                for (var j in specficObj) {
                    if (specficObj.hasOwnProperty(j)) {
                        count++;
                    }
                }

                // Construct array of objects
                for(var k = 0, kl = count; k < kl; k ++){
                    arr.push(specficObj["__array__"+k+"__"]);
                }

                globalObj[objIndex] = arr;
            }

            if ($.isPlainObject(specficObj[i])) {
                sakai.api.Server.loadJSON.convertObjectToArray(specficObj[i], specficObj, i);
            }
        }

    }
    return specficObj;
};

/**
 * Remove the JSON for a specific node in JCR
 *
 * @param {String} i_url The path of the node you want to remove
 * @param {Function} callback Callback function which is executed at the
 * end of the operation
 *
 * @returns {Void}
 */
sakai.api.Server.removeJSON = function(i_url, callback){

    // Argument check
    if (!i_url) {

        // Log the error message
        debug.info("sakai.api.Server.removeJSON: Not enough or empty arguments!");

        // Still invoke the callback function
        if ($.isFunction(callback)) {
            callback(false, "The supplied arguments were incorrect.");
        }

        // Make sure none of the other code in this function is executed
        return;
    }

    // Send request
    $.ajax({
        url: i_url,
        // Note that the type DELETE doesn't work with sling if you do /test.json
        // You can only perform a DELETE on /test (without extension)
        // http://sling.apache.org/site/manipulating-content-the-slingpostservlet-servletspost.html
        type: "POST",
        data: {
            ":operation" : "delete"
        },
        success: function(data){

            // If a callback function is specified in argument, call it
            if ($.isFunction(callback)) {
                callback(true, data);
            }
        },

        error: function(xhr, status, e){

            // Log error
            debug.error("sakai.api.Server.removeJSON: There was an error removing the JSON on: " + this.url);

            // If a callback function is specified in argument, call it
            if ($.isFunction(callback)) {
                callback(false, xhr);
            }
        }
    });
};

sakai.api.Server.JCRPropertiesToDelete = ["rep:policy", "jcr:path"];

sakai.api.Server.filterJCRProperties = function(data) {
    $(sakai.api.Server.JCRPropertiesToDelete).each(function(i,val) {
        if (data[val]) {
            delete data[val];
        }
    });

    // Also run over the other objects within this object
    for (var i in data) {
        if (data.hasOwnProperty(i) && $.isPlainObject(data[i])) {
          sakai.api.Server.filterJCRProperties(data[i]);
        }
    }
};

/**
 * Create a search string for the server
 * This method exists to transform a user's search string which
 * they type in into the string we should pass to the server
 *
 * Strings with AND, OR, '"', '-', '_' are treated as advanced search queries
 * and left alone. Those without are transformed into term* AND term2*
 *
 * @param {String} searchString The user's search
 * @return {String} The string to send to the server
 */
sakai.api.Server.createSearchString = function(searchString) {
    var ret = "";
    var advancedSearchRegex = new RegExp("(AND|OR|\"|-|_)", "g");

    if (advancedSearchRegex.test(searchString)) {
        ret = searchString;
    } else {
        ret = $.trim(searchString).split(" ").join("* AND ") + "*";
    }

    return ret;
};

/**
 * @class UI
 *
 * @description
 * User interface elements within Sakai 3 which require JS to work.
 * All UI element init functions should be defined here.
 *
 * @namespace
 * Standard Sakai 3 UI elements
 */
sakai.api.UI = sakai.api.UI || {};



// -----------------------------------------------------------------------------

/**
 * @name $
 * @namespace
 * jQuery Plugins and overrides for Sakai.
 */


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
    * @param {String|Object} templateElement The name of the template HTML ID or a jQuery selection object.
    * @param {Object} templateData JSON object containing the template data
    * @param {Object} outputElement (Optional) jQuery element in which the template needs to be rendered
    * @param {Boolean} doSanitize (Optional) perform html sanitization. Defaults to true
    */
    $.TemplateRenderer = function (templateElement, templateData, outputElement, doSanitize) {

        var templateName;
        var sanitize = true;
        if (doSanitize !== undefined) {
            sanitize = doSanitize;
        }

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
            throw "$.TemplateRenderer: The templateElement '" + templateElement + "' is not in a valid format or the template couldn't be found.";
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

        // Run the rendered html through the sanitizer
        if (sanitize) {
            render = sakai.api.Security.saneHTML(render);
        }

        // Check it there was an output element defined
        // If so, put the rendered template in there
        if (outputElement) {
            outputElement.html(render);
        }

        return render;

    };

})(jQuery);



///////////////////////////
// jQuery AJAX extention //
///////////////////////////

/*
 * We override the standard $.ajax error function, which is being executed when
 * a request fails. We will check whether the request has failed due to an authorization
 * required error, by checking the response code and then doing a request to the me service
 * to find out whether we are no longer logged in. If we are no longer logged in, and the
 * sendToLoginOnFail variable has been set in the options of the request, we will redirect
 * to the login page with the current URL encoded in the url. This will cause the system to
 * redirect to the page we used to be on once logged in.
 */
(function($){

    /**
    * Override default jQuery error behavior
    * @function
    * @param {String} s description
    * @param {Object} xhr xhr object
    * @param {String} status Status message
    * @param {Object} e Thrown error
    */
    $.handleError = function (s, xhr, status, e) {

        var requestStatus = xhr.status;

        // Sometimes jQuery comes back with a parse-error, although the request
        // was completely successful. In order to prevent the error method to be called
        // in this case, we need this if clause.
        if (requestStatus === 200) {
            if (s.success) {
                s.success(xhr.responseText);
            }
        }
        else {
            // if the sendToLoginOnFail hasn't been set, we assume that we want to redirect when
            // a 403 comes back
            s.sendToLoginOnFail = s.sendToLoginOnFail || true;
            if (requestStatus === 403 && s.sendToLoginOnFail) {

                var decideLoggedIn = function(response, exists){
                    var originalURL = document.location;
                    originalURL = $.URLEncode(originalURL.pathname + originalURL.search + originalURL.hash);
                    var redirecturl = sakai.config.URL.GATEWAY_URL + "?url=" + originalURL;
                    if (exists && response.preferences && (response.preferences.uuid === "anonymous" || !response.preferences.uuid)) {
                        document.location = redirecturl;
                    }
                };

                $.ajax({
                    url: sakai.config.URL.ME_SERVICE,
                    cache: false,
                    success: function(data){
                        decideLoggedIn(data, true);
                    }
                });

            }

        // Handle HTTP conflicts thrown back by K2 (409) (for example when somebody tries to write to the same node at the very same time)
        // We do this by re-sending the original request with the data transparently, behind the curtains, until it succeeds.
        // This still does not eliminate a possibility of another conflict, but greatly reduces
        // the chance and works in the background until the request is successful (ie jQuery will try to re-send the initial request until the response is not 409
        // WARNING: This does not solve the locking/overwriting problem entirely, it merely takes care of high volume request related issues. Users
        // should be notified in advance by the UI when somebody else is editing a piece of content, and should actively try reduce the possibility of
        // overwriting.
/*        if (requestStatus === 409) {
            // Retry initial post
            $.ajax(s);
        }*/

        // Call original error handler, but not in the case of 409 as we want that to be transparent for users
        if ((s.error) && (requestStatus !== 409)) {
          s.error(xhr, status, e);
        }

        if (s.global) {
          $.event.trigger("ajaxError", [xhr, status, e]);
        }
          }

    };

})(jQuery);


/**
 * Extend jQuery to include a serializeObject function
 * which uses $.serializeArray to serialize the form
 * and then creates an object from that array
 *
 * http://stackoverflow.com/questions/1184624/serialize-form-to-json-with-jquery
 */
(function($){
    $.fn.serializeObject = function()
    {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
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
    * @param {Object/String/Integer} obj The element we are looking for
    * @param {Integer} start Where the search starts within the array
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

    // When DOM is ready...
    $(function(){

        // Load logged in user data
        sakai.api.User.loadMeData(function(success, data){

            // Start i18n
            sakai.api.i18n.init();

        });

    });
};
sakai.api.autoStart();