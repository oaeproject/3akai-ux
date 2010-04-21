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

/*global $, jQuery, fluid, TrimPath, Widgets, window, document, sdata */

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
 * Sends a Sakai message
 *
 * @param {Array} to Array with the uuids of the users to post a message to
 * @param {String} subject The subject for this message
 * @param {String} body The text that this message will contain
 * @param {String} category The category for this message
 * @param {String} reply The id of the message you are replying on
 * @param {Function} callback A callback function which is executed at the end of the operation
 *
 * @return {Void}
 */
sakai.api.Communication.sendMessage = function(to, subject, body, category, reply, callback) {


    // Basic message details
    var toSend = {
        "sakai:type": "internal",
        "sakai:sendstate": "pending",
        "sakai:messagebox": "outbox",
        "sakai:to": to,
        "sakai:from": sakai.data.me.user.userid,
        "sakai:subject": subject,
        "sakai:body":body,
        "_charset_":"utf-8"
    };

    // Message category
    if (category) {
        toSend["sakai:category"] = category;
    } else {
        toSend["sakai:category"] = "message";
    }

    // See if this is a reply or not
    if (reply) {
        toSend["sakai:previousmessage"] = reply;
    }

    // Send message
    $.ajax({
        url: "/_user" + sakai.data.me.profile.path + "/message.create.html",
        type: "POST",
        data: toSend,
        success: function(data) {

            if (typeof callback === "function") {
                callback(true, data);
            }
        },
        error: function(xhr, textStatus, thrownError) {

            fluid.log("sakai.api.Communication.sendMessage(): Could not send message to " + to);

            if (typeof callback === "function") {
                callback(false, xhr);
            }
        }
    });

};

/**
 * Sends a message to all members of a group
 *
 * @param {String} groupID The user ID of the recipient
 * @param {String} message The text of the message
 * @return {Boolean} true or false depending on whether the sending was successful or not
 */
sakai.api.Communication.sendMessageToGroup = function(groupID, message) {

};

/**
 * Invites a user to become a contact of the logged in user
 *
 * @param {String} groupID The user ID of the recipient
 * @param {String} message The text of the message
 * @return {Boolean} true or false depending on whether the sending was successful or not
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
 * @param {String} groupID The ID of the group we would like the user to become
 * a member of
 * @param {Function} callback Callback function executed at the end of the
 * operation
 * @returns true or false
 * @type Boolean
 */
sakai.api.Groups.addToGroup = function(groupID, callback) {

};


/**
 * Removes logged in user from a specified group
 *
 * @param {String} groupID The ID of the group we would like the user to be
 * removed from
 * @param {Function} callback Callback function executed at the end of the
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
 * @param {String} groupID The ID of the group we would like to get the members
 * of
 * @param {Function} callback Callback function executed at the end of the
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
 * <p>Internationalisation related functions for general page content, widget
 * content and UI elements.</p>
 * <p>This should only hold functions which are used across
 * multiple pages, and does not constitute functionality related to a single area/page.</p>
 *
 * @namespace
 * Internationalisation
 */
sakai.api.i18n = sakai.api.i18n || {};

/**
 * <p>Main i18n process</p>
 * <p>This function will be executed once the entire DOM has been loaded. The function will take
 * the HTML that's inside the body of the page, and load the default and user specific language
 * bundle. We then look for i18n keys inside the HTML, and replace with the values from the
 * language bundles. We always first check whether the key is available in the user specific
 * bundle and only if that one doesn't exist, we will take the value out of the default bundle.</p>
 */
sakai.api.i18n.init = function(){


    /////////////////////////////
    // CONFIGURATION VARIABLES //
    /////////////////////////////

    // Initialise the sakai.data.18n variable
    sakai.data.i18n = {};

    // Will contain all of the values for the default bundle
    sakai.data.i18n.defaultBundle = false;

    // Will contain all of the values for the bundle of the language chosen by the user
    sakai.data.i18n.localBundle = false;

    // Will contain all the i18n for widgets
    sakai.data.i18n.widgets = sakai.data.i18n.widgets || {};


    ////////////////////
    // HELP VARIABLES //
    ////////////////////

    /*
     * We take the HTML that is inside the body tag. We will use this to find string we want to
     * translate into the language chosen by the user
     */
    var tostring = $(document.body).html();


    ////////////////////////////
    // LANGUAGE BUNDLE LOADER //
    ////////////////////////////

    /**
     * Gets the site id if the user is currently on a site
     * if the user is on any other page then false is returned
     *
     * Proposed addin: Check to see if there is a siteid querystring parameter.
     * This will then i18n pages like site settings as well.
     */
    var getSiteId = function(){
        var site = false;
        var loc = ("" + document.location);
        var siteid = loc.indexOf(sakai.config.URL.SITE_CONFIGFOLDER.replace(/__SITEID__/, ""));
        if (siteid !== -1) {
            var mark = (loc.indexOf("?") === -1) ? loc.length : loc.indexOf("?");
            var uri = loc.substring(0, mark);
            site = uri.substring(siteid, loc.length).replace(sakai.config.URL.SITE_CONFIGFOLDER.replace(/__SITEID__/, ""), "");
            site = site.substring(0, site.indexOf("#"));
        }
        return site;
    };


    ////////////////////
    // I18N FUNCTIONS //
    ////////////////////

    /**
     * Once all of the i18n strings have been replaced, we will finish the i18n step.
     * The content of the body tag is hidden by default, in
     * order not to show the non-translated string before they are translated. When i18n has
     * finished, we can show the body again.
     * We then tell the container that pre-loading of the page has finished and that widgets are
     * now ready to be loaded. This will mostly mean that now the general page/container code
     * will be executed.
     * Finally, we will look for the definition of widgets inside the HTML code, which should look
     * like this:
     *  - Single instance: <div id="widget_WIDGETNAME" class="widget_inline"></div>
     *  - Multiple instance support: <div id="widget_WIDGETNAME_UID_PLACEMENT" class="widget_inline"></div>
     * and load them into the document
     */
    var finishI18N = function(){
        $(document.body).show();
        sdata.container.setReadyToLoad(true);
        sdata.widgets.WidgetLoader.insertWidgets(null, false);
    };

    /**
     * This will give the body's HTML string, the local bundle (if present) and the default bundle to the
     * general i18n function. This will come back with an HTML string where all of the i18n strings will
     * be replaced. We then change the HTML of the body tag to this new HTML string.
     * @param {Object} localjson
     *  JSON object where the keys are the keys we expect in the HTML and the values are the translated strings
     * @param {Object} defaultjson
     *  JSON object where the keys are the keys we expect in the HTML and the values are the translated strings
     *  in the default language
     */
    var doI18N = function(localjson, defaultjson){
        var newstring = sakai.api.i18n.General.process(tostring, localjson, defaultjson);
        // We actually use the old innerHTML function here because the jQuery.html() function will
        // try to reload all of the JavaScript files declared in the HTML, which we don't want as they
        // will already be loaded
        document.body.innerHTML = newstring;
        document.title = sakai.api.i18n.General.process(document.title, localjson, defaultjson);
        finishI18N();
    };

    /**
     * This function will load the general language bundle specific to the language chosen by
     * the user and will store it in a global variable. This language will either be the prefered
     * user language or the prefered server language. The language will be available in the me feed
     * and we'll use the global sakai.data.me object to extract it from. If there is no prefered langauge,
     * we'll use the default bundle to translate everything.
     */
    var loadLocalBundle = function(langCode){
        $.ajax({
            url: sakai.config.URL.I18N_BUNDLE_ROOT + langCode + ".json",
            success: function(data){
                sakai.data.i18n.localBundle = $.evalJSON(data);
                doI18N(sakai.data.i18n.localBundle, sakai.data.i18n.defaultBundle);
            },
            error: function(xhr, textStatus, thrownError){
                // There is no language file for the language chosen by the user
                // We'll switch to using the default bundle only
                doI18N(null, sakai.data.i18n.defaultBundle);
            }
        });
    };

    /**
     * Load the language for a specific site
     * @param {String} site The id of the site you want to load the language for
     */
    var loadSiteLanguage = function(site){
        $.ajax({
            url: sakai.config.URL.SITE_CONFIGFOLDER.replace("__SITEID__", site) + ".json",
            cache: false,
            success: function(data){
                var siteJSON = $.evalJSON(data);
                if (siteJSON.language && siteJSON.language !== "default_default") {
                    loadLocalBundle(siteJSON.language);
                }
                else if (sakai.data.me.user.locale) {
                    loadLocalBundle(sakai.data.me.user.locale.language + "_" + sakai.data.me.user.locale.country);
                }
                else {
                    // There is no locale set for the current user. We'll switch to using the default bundle only
                    doI18N(null, sakai.data.i18n.defaultBundle);
                }
            },
            error: function(xhr, textStatus, thrownError){
                loadLocalBundle();
            }
        });
    };

    /**
     * This will load the default language bundle and will store it in a global variable. This default bundle
     * will be saved in a file called _bundle/default.properties.
     */
    var loadDefaultBundle = function(){
        $.ajax({
            url: sakai.config.URL.I18N_BUNDLE_ROOT + "default.json",
            success: function(data){
                sakai.data.i18n.defaultBundle = $.evalJSON(data);
                var site = getSiteId();
                if (!site) {
                    if (sakai.data.me.user.locale) {
                        loadLocalBundle(sakai.data.me.user.locale.language + "_" + sakai.data.me.user.locale.country);
                    }
                    else {
                        // There is no locale set for the current user. We'll switch to using the default bundle only
                        doI18N(null, sakai.data.i18n.defaultBundle);
                    }
                }
                else {
                    loadSiteLanguage(site);
                }
            },
            error: function(xhr, textStatus, thrownError){
                // There is no default bundle, so we'll just show the interface without doing any translations
                finishI18N();
            }
        });
    };


    /////////////////////////////
    // INITIALIZATION FUNCTION //
    /////////////////////////////

    loadDefaultBundle();
};

/**
 * @class i18nGeneral
 *
 * @description
 * Internationalisation related functions for general page content and UI elements
 *
 * @namespace
 * General internationalisation functions
 */
sakai.api.i18n.General = sakai.api.i18n.General || {};

/**
 * General process functions that will replace all the messages in a string with their corresponding translation.
 * @example sakai.api.i18n.General.process(
 *     "&lt;h1&gt;__MSG__CHANGE_LAYOUT__&lt;/h1&gt",
 *     {"__MSG__CHANGE_LAYOUT__" : "verander layout"},
 *     {"__MSG__CHANGE_LAYOUT__" : "change layout"}
 * );
 * @param {String} toprocess
 *  HTML string in which we want to replace messages. Messages have the following
 *  format: __MSG__KEY__
 * @param {Object} localbundle
 *  JSON object where the keys are the keys we expect in the HTML and the values are the translated strings
 * @param {Object} defaultbundle
 *  JSON object where the keys are the keys we expect in the HTML and the values are the translated strings
 *  in the default language
 * @return {String} A processed string where all the messages are replaced with values from the language bundles
 */
sakai.api.i18n.General.process = function(toprocess, localbundle, defaultbundle) {

    var expression = new RegExp("__MSG__(.*?)__", "gm"), processed = "", lastend = 0;
    while(expression.test(toprocess)) {
        var replace = RegExp.lastMatch;
        var lastParen = RegExp.lastParen;
        var toreplace = sakai.api.i18n.General.getValueForKey(lastParen);
        processed += toprocess.substring(lastend,expression.lastIndex-replace.length) + toreplace;
        lastend = expression.lastIndex;
    }
    processed += toprocess.substring(lastend);
    return processed;

};

/**
 * Get the internationalised value for a specific key.
 * We expose this function so you can do internationalisation within JavaScript.
 * @example sakai.api.i18n.General.getValueForKey("__MSG__CHANGE_LAYOUT__");
 * @param {String} key The key that will be used to get the internationalised value
 * @return {String} The translated value for the provided key
 */
sakai.api.i18n.General.getValueForKey = function(key) {

    // First check if the key can be found in the locale bundle
    if (sakai.data.i18n.localBundle[key]) {
        return sakai.data.i18n.localBundle[key];
    }
    // If the key wasn't found in the localbundle, search in the default bundle
    else if (sakai.data.i18n.defaultBundle[key]) {
        return sakai.data.i18n.defaultBundle[key];
    }
    // If none of the about found something, log an error message
    else {
        fluid.log("sakai.api.i18n.General.getValueForKey: Not in local & default file. Key: " + key);
    }

};


/**
 * @class i18nWidgets
 *
 * @description
 * Internationalisation in widgets
 *
 * @namespace
 * Internationalisation in widgets
 */
sakai.api.i18n.Widgets = sakai.api.i18n.Widgets || {};

/**
 * Loads up language bundle for the widget, and exchanges messages found in content.
 * If no language bundle found, it attempts to load the default language bundle for the widget, and use that for i18n
 * @example sakai.api.i18n.Widgets.process(
 *     "myfriends",
 *     "&lt;div&gt;__MSG__YOU_CURRENTLY_HAVE_NO_CONTACTS__&lt;/div&gt;"
 * );
 * @param widgetname {String} The name of the widget
 * @param widget_html_content {String} The content html of the widget which contains the messages
 * @returns {String} The translated content html
 */
sakai.api.i18n.Widgets.process = function(widgetname, widget_html_content) {

    var translated_content = "";
    var current_locale_string = false;
    if (typeof sakai.data.me.user.locale === "object") {
        current_locale_string = sakai.data.me.user.locale.language + "_" + sakai.data.me.user.locale.country;
    }

    // If there is no i18n defined in Widgets, run standard i18n on content
    if (typeof Widgets.widgets[widgetname].i18n !== "object") {
        translated_content = sakai.api.i18n.General.process(widget_html_content, sakai.data.i18n.localBundle, sakai.data.i18n.defaultBundle);
        return translated_content;
    }

    // Load default language bundle for the widget if exists
    if (Widgets.widgets[widgetname].i18n["default"]) {

        $.ajax({
            url: Widgets.widgets[widgetname].i18n["default"],
            async: false,
            success: function(messages_raw){

                sakai.data.i18n.widgets[widgetname] = sakai.data.i18n.widgets[widgetname] || {};
                sakai.data.i18n.widgets[widgetname]["default"] = $.evalJSON(messages_raw);

            },
            error: function(xhr, textStatus, thrownError){
                //alert("Could not load default language bundle for widget: " + widgetname);
            }
        });

    }

    // Load current language bundle for the widget if exists
    if (Widgets.widgets[widgetname].i18n[current_locale_string]) {

        $.ajax({
            url: Widgets.widgets[widgetname].i18n[current_locale_string],
            async: false,
            success: function(messages_raw){

                sakai.data.i18n.widgets[widgetname] = sakai.data.i18n.widgets[widgetname] || {};
                sakai.data.i18n.widgets[widgetname][current_locale_string] = $.evalJSON(messages_raw);
            },
            error: function(xhr, textStatus, thrownError){
                //alert("Could not load default language bundle " + current_locale_string + "for widget: " + widgetname);
            }
        });
    }

    // Translate widget name and description
    if ((typeof sakai.data.i18n.widgets[widgetname][current_locale_string] === "object") && (typeof sakai.data.i18n.widgets[widgetname][current_locale_string].name === "string")) {
        Widgets.widgets[widgetname].name = sakai.data.i18n.widgets[widgetname][current_locale_string].name;
    }
    if ((typeof sakai.data.i18n.widgets[widgetname][current_locale_string] === "String") && (typeof sakai.data.i18n.widgets[widgetname][current_locale_string].description === "string")) {
        Widgets.widgets[widgetname].name = sakai.data.i18n.widgets[widgetname][current_locale_string].description;
    }

    // Change messages
    var expression = new RegExp("__MSG__(.*?)__", "gm");
    var lastend = 0;
    while (expression.test(widget_html_content)) {
        var replace = RegExp.lastMatch;
        var lastParen = RegExp.lastParen;
        var toreplace = sakai.api.i18n.Widgets.getValueForKey(widgetname, current_locale_string, lastParen);
        translated_content += widget_html_content.substring(lastend, expression.lastIndex - replace.length) + toreplace;
        lastend = expression.lastIndex;
    }
    translated_content += widget_html_content.substring(lastend);

    return translated_content;
};

/**
 * Get the value for a specific key in a specific widget.
 * @example sakai.api.i18n.Widgets.getValueForKey("myprofile", "en_US", "PREVIEW_PROFILE");
 * @param {String} widgetname The name of the widget
 * @param {String} locale The locale for the getting the value
 * @param {String} key The key which you want to be translated
 * @return {String} The value you wanted to translate for a specific widget
 */
sakai.api.i18n.Widgets.getValueForKey = function(widgetname, locale, key) {

    // Get a message key value in priority order: local widget language file -> widget default language file -> system local bundle -> system default bundle
    if ((typeof sakai.data.i18n.widgets[widgetname][locale] === "object") && (typeof sakai.data.i18n.widgets[widgetname][locale][key] === "string")){
        return sakai.data.i18n.widgets[widgetname][locale][key];

    } else if ((typeof sakai.data.i18n.widgets[widgetname]["default"][key] === "string") && (typeof sakai.data.i18n.widgets[widgetname]["default"] === "object")) {
        return sakai.data.i18n.widgets[widgetname]["default"][key];

    } else if (sakai.data.i18n.localBundle[key]) {
        return sakai.data.i18n.localBundle[key];

    } else if (sakai.data.i18n.defaultBundle[key]) {
        return sakai.data.i18n.defaultBundle[key];

    }

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
 * @return {String} The user's locale string in XXX format
 */
sakai.api.l10n.getUserLocale = function() {

};

/**
 * Get a site's locale
 *
 * @returns {String} The site's locale string in XXX format
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
 * @param {String} i_url The path to the preference where it needs to be
 * saved
 * @param {Object} i_data A JSON object whic we would like to save
 * (max 200 child object of each object)
 * @param {Function} callback A callback function which is executed at the
 * end of the operation
 *
 * @returns {Void}
 */
sakai.api.Server.saveJSON = function(i_url, i_data, callback) {

    // Argument check
    if (!i_url || !i_data) {
        fluid.log("sakai.api.Server.saveJSON: Not enough or empty arguments!");
        return;
    }

    /**
     * <p>Convert all the arrays in an object to an object with a unique key</p>
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
     * to
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
     * @param {Object} obj The Object that you want to use to convert all the arrays to objects
     * @return {Object} An object where all the arrays are converted into objects
     */
    var convertArrayToObject = function(obj) {

        // Since the native createTree method doesn't support an array of objects natively,
        // we need to write extra functionality for this.
        for(var i in obj){

            // Check if the element is an array, whether it is empty and if it contains any elements
            if(obj.hasOwnProperty(i) && $.isArray(obj[i]) && obj[i].length>0 && $.isObject(obj[i][0])){

                // Deep copy the array
                var arrayCopy = $.extend(true, [], obj[i]);

                // Set the original array to an empty object
                obj[i] = {};

                // Add all the elements that were in the original array to the object with a unique id
                for(var j = 0, jl = arrayCopy.length; j < jl ; j++){

                    // Run recursively over all the objects in the main object
                    convertArrayToObject(arrayCopy[j]);

                    // Copy each object from the array and add it to the object
                    obj[i]["__array__" + j + "__"] = arrayCopy[j];
                }
            }
        }

        return obj;
    };

    i_data = convertArrayToObject(i_data);

    // Send request
    $.ajax({
        url: i_url,
        type: "POST",
        data: {
            ":operation": "createTree",
            "tree": $.toJSON(i_data)
        },

        success: function(data){

            // If a callback function is specified in argument, call it
            if (typeof callback === "function") {
                callback(true, data);
            }
        },

        error: function(xhr, status, e){

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
 * @param {String} i_url The path to the preference which needs to be loaded
 * @param {Function} callback A callback function which is executed at the end
 * of the operation
 *
 * @returns {Void}
 */
sakai.api.Server.loadJSON = function(i_url, callback) {

    // Argument check
    if (!i_url) {
        fluid.log("sakai.api.Server.loadJSON: Not enough or empty arguments!");
        return;
    }

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
    var convertObjectToArray = function(specficObj, globalObj, objIndex){

        // Define the regural expression
        var expression = new RegExp("__array__(.*?)__", "gm");

        // Run over all the items in the object
        for (var i in specficObj) {

            if (specficObj.hasOwnProperty(i) && $.isObject(specficObj[i])) {
                var expressionExecute = expression.test(i);
                if (expressionExecute) {
                    var arr = [];
                    for (var j in specficObj) {
                        if (specficObj.hasOwnProperty(j)) {
                            arr[arr.length] = specficObj[j];
                        }
                    }
                    globalObj[objIndex] = arr;
                }
                convertObjectToArray(specficObj[i], specficObj, i);
            }

        }
        return specficObj;
    };

    $.ajax({
        url: i_url + ".infinity.json",
        cache: false,
        success: function(data) {

            // Transform JSON string to an object
            var returned_data = $.evalJSON(data);

            // Remove keys which are created by JCR or Sling
            sakai.api.Util.removeJCRObjects(returned_data);

            // Convert the special objects to arrays
            returned_data = convertObjectToArray(returned_data, null, null);

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
        fluid.log("sakai.api.Server.removeJSON: Not enough or empty arguments!");
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
            if (typeof callback === "function") {
                callback(true, data);
            }
        },

        error: function(xhr, status, e){

            // Log error
            fluid.log("sakai.api.Server.removeJSON: There was an error removing the JSON on: " + this.url);

            // If a callback function is specified in argument, call it
            if (typeof callback === "function") {
                callback(false, xhr);
            }
        }
    });
};

/**
 * Saves any type of data into one JCR node
 *
 * @param {String} i_url The path to the preference which needs to be loaded
 * @param {String|Object} i_data The data we want to save
 * @param {Function} callback A callback function which is executed at the end
 * of the operation
 * @return {Void}
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
 * @param {String} i_url The path to the preference which needs to be loaded
 * @param {Function} callback A callback function which is executed at the end
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
 * @param {String} url The URL pointing to the required CSS file
 */
sakai.api.Server.requireCSS = function(url) {

};

/**
 * Loads in a JS file at runtime from a given URL
 *
 * @param {String} url The URL pointing to the required JS file
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

/**
 * @class Forms
 *
 * @description
 * Form related functionality speeding up data retrieval, filling in initial
 * values or resetting a form.
 *
 * @namespace
 * UI Form related functions
 */
sakai.api.UI.Forms = {

    /**
     * Retrieves all data from a form and constructs a JSON object containing
     * all values.
     * <p>This function will look for input fields, selects and textareas and will get all of the values
     * out and store them in a JSON object. The keys for this object are the names (name attribute) of
     * the form fields. This function is useful as it saves you to do a .val() on every form field.
     * Form fields without a name attribute will be ignored. </p>
     *
     * @param {Object} formElement The jQuery object of the form we would like to
     * extract the data from
     *
     * @return {Object} <p>A JSON object containing name: value pair of form data.
     * The object that's returned will look like this:</p>
     * <pre><code>{
     *     inputBoxName : "Value 1",
     *     radioButtonGroup : "value2",
     *     checkBoxGroup : ["option1","option2"],
     *     selectElement : ["UK"],
     *     textAreaName : "This is some random text"
     * }</code></pre>
     */
    form2json: function(formElement){

        var finalFields = {};
        var fields = $("input, textarea, select", formElement);

        for(var i = 0, il = fields.length; i < il; i++) {

            var el = fields[i];
            var name = el.name;
            var nodeName = el.nodeName.toLowerCase();
            var type = el.type.toLowerCase() || "";

            if (name){
                if (nodeName === "input" || nodeName === "textarea") {
                    // Text fields and textareas
                    if (nodeName === "textarea" || (type === "text" || type === "password")) {
                        finalFields[name] = el.value;
                    // Checkboxes
                    } else if (type === "checkbox") {
                        finalFields[name] = finalFields[name] || [];
                        if (el.checked) {
                            finalFields[name][finalFields[name].length] = el.value;
                        }
                    // Radiobuttons
                    } else if (type === "radio" && el.checked) {
                        finalFields[name] = el.value;
                    }
                // Select dropdowns
                } else if (nodeName === "select"){
                    // An array as they have possibly multiple selected items
                    finalFields[name] = [];
                    for (var j = 0, jl = el.options.length; j < jl; j++) {
                        if (el.options[j].selected) {
                            finalFields[name] = el.options[j].value;
                        }
                    }
                }
            }
        }

        return finalFields;
    },


    /**
     * Function that will take in a JSON object and a container and will try to attempt to fill out
     * all form fields according to what's in the JSON object. A useful usecase for this would be to
     * have a user fill out a form, and store the serialization of it directly on the server. When the
     * user then comes back, we can get this value from the server and give that value to this function.
     * This will create the same form state as when it was saved by the user.
     *
     * @param {Object} formElement JQuery element that represents the container in which we are
     *  filling out the values
     * @param {Object} formDataJson JSON object that contains the names of the fields we want to populate (name attribute)
     *  as keys and the actual value (text for input text fields and textareas, and values for
     *  checkboxes, radio buttons and select dropdowns)
     *  <pre><code>{
     *     inputBoxName : "Value 1",
     *     radioButtonGroup : "value2",
     *     checkBoxGroup : ["option1","option2"],
     *     selectElement : ["UK"],
     *     textAreaName : "This is some random text"
     *  }</code></pre>
     *
     * @return {Boolean} true or false depending on the success of the operation
     */
    json2form: function(formElement, formDataJson){

        sakai.api.UI.Forms.resetForm(formElement);

        for (var name in formDataJson) {
            if (formDataJson[name]){
                var els = $('[name=' + name + ']', formElement);
                for (var i = 0, il = els.length; i < il; i++){
                    var el = els[i];
                    var nodeName = el.nodeName.toLowerCase();
                    var type = el.type.toLowerCase() || "";
                    if (nodeName === "textarea" || (nodeName === "input" && (type === "text" || type === "password"))){
                        el.value = formDataJson[name];
                    } else if (nodeName === "input" && type === "radio"){
                        if (el.value === formDataJson[name]){
                            el.checked = true;
                        }
                    } else if (nodeName === "input" && type === "checkbox"){
                        for (var j = 0, jl = formDataJson[name].length; j < jl; j++){
                            if (el.value === formDataJson[name][j]){
                                el.checked = true;
                            }
                        }
                    } else if (nodeName === "select"){
                        for (var select = 0; select < formDataJson[name].length; select++){
                            for (var k = 0, kl = el.options.length; k < kl; k++) {
                                if (el.options[k].value === formDataJson[name][select]) {
                                    el.options[k].selected = true;
                                }
                            }
                        }
                    }
                }
            }
        }

    },

    /**
     * Resets all the values of a given form . If it's an input textbox or a textarea, the value will
     * become an empty string. If it's a radio button or a checkbox, all will be unchecked.
     * If it's a select dropdown, then the first element will be selected
     * @param {Object} formElement JQuery element that represents the container in which we are
     *  resetting the form fields
     *
     * @return {Boolean} true or false depending on the success of the operation
     */
    resetForm: function(formElement){

        var fields = $("input, textarea, select", formElement);
        for (var i = 0, il = fields.length; i < il; i++){
            var el = fields[i];
            var nodeName = el.nodeName.toLowerCase();
            var type = el.type.toLowerCase() || "";
            if ((nodeName === "input" && (type === "text" || type === "password")) || nodeName === "textarea"){
                el.value = "";
            } else if (nodeName === "input"){
                el.checked = false;
            } else if (nodeName === "select"){
                el.selectedIndex = 0;
            }
        }

    }

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
 * @param {Function} callback A function which will be called when the information is retrieved from the server.
 * The first argument of the callback is a boolean whether it was successful or not, the second argument will contain the retrieved data or the xhr object
 * @return {Void}
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

            // Check for firstName and lastName property - if not present use "rep:userId" for both (admin for example)
            if (!sakai.data.me.profile.firstName) {
                sakai.data.me.profile.firstName = sakai.data.me.profile["rep:userId"];
            }
            if (!sakai.data.me.profile.lastName) {
                sakai.data.me.profile.lastName = sakai.data.me.profile["rep:userId"];
            }

            // Call callback function if set
            if (typeof callback === "function") {
                callback(true, sakai.data.me);
            }
        },
        error: function(xhr, textStatus, thrownError) {

            // Log error
            fluid.log("sakai.api.User.loadMeData: Could not load logged in user data from the me service!");

            // Call callback function if set
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
 * @param {String} s The string we would like to URL encode
 *
 * @returns Returns the URL encoded string
 * @type String
 */
sakai.api.Util.URLEncode = function(s) {


};

/**
 * URL decodes a given URL encoded string
 *
 * @param {String} s The string we would like to decode
 *
 * @returns Returns the decoded string
 * @type String
 */
sakai.api.Util.URLDecode = function(s) {


};

/**
 * Strip all HTML tags from a given string
 *
 * @param {String} s The string we would like to strip all tags from
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
 * @param {String} widgetID The ID of a Widget which needs to be loaded
 * @param {Function} callback The callback function which is called when the
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
 * @param {String} widgetID The ID of a Widget which needs to be rendered
 */
sakai.api.Widgets.renderWidget = function(widgetID) {

};

/**
 * Load the preference settings or data for a widget
 * @param {String} id The unique id of the widget
 * @param {Function} callback Callback function that gets executed after the load is complete
 */
sakai.api.Widgets.loadWidgetData = function(id, callback) {

    // Get the URL from the widgetloader
    var url = sdata.widgets.WidgetLoader.widgets[id] ? sdata.widgets.WidgetLoader.widgets[id].placement : false;

    // Send a GET request to get the data for the widget
    sakai.api.Server.loadJSON(url, callback);

};

/**
 * Save the preference settings or data for a widget
 *
 * @param {String} id The unique id of the widget
 * @param {Object} content A JSON object that contains the data for the widget
 * @param {Function} callback Callback function that gets executed after the save is complete
 * @return {Void}
 */
sakai.api.Widgets.saveWidgetData = function(id, content, callback) {

    // Get the URL from the widgetloader
    var url = sdata.widgets.WidgetLoader.widgets[id].placement;

    // Send a POST request to update/save the data for the widget
    sakai.api.Server.saveJSON(url, content, callback);

};

/**
 * Remove the preference settings or data for a widget
 *
 * @param {String} id The unique id of the widget
 * @param {Function} callback Callback function that gets executed after the delete is complete
 * @return {Void}
 */
sakai.api.Widgets.removeWidgetData = function(id, callback) {

    // Get the URL from the widgetloader
    var url = sdata.widgets.WidgetLoader.widgets[id].placement;

    // Send a DELETE request to remove the data for the widget
    sakai.api.Server.removeJSON(url, callback);

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
    * @param {String} s description
    * @param {Object} xhr xhr object
    * @param {String} status Status message
    * @param {Object} e Thrown error
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
    * @param {String|Object} templateElement The name of the template HTML ID or a jQuery selection object.
    * @param {Object} templateData JSON object containing the template data
    * @param {Object} outputElement (Optional) jQuery element in which the template needs to be rendered
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



// TODO remove and replace with &.isPlainObject as soon as we use jQuery1.4!
(function(jQuery){

    var toString = Object.prototype.toString, hasOwnProp = Object.prototype.hasOwnProperty;

    jQuery.isObject = function(obj){
        if (toString.call(obj) !== "[object Object]") {
            return false;
        }

        //own properties are iterated firstly,
        //so to speed up, we can test last one if it is not own

        var key;
        for (key in obj) {
        }

        return !key || hasOwnProp.call(obj, key);
    };

})(jQuery);



/**
 * Entry point for functions which needs to automatically start on each page
 * load.
 *
 * @returns {Void}
 */
sakai.api.autoStart = function() {

    $(document).ready(function(){

        // Load logged in user data
        sakai.api.User.loadMeData(function(success, data){

            // Start i18n
            sakai.api.i18n.init();

            // Start l10n
            sakai.api.l10n.init();
        });

        // Start Widget container functions
        sakai.api.Widgets.Container.init();

    });
};
sakai.api.autoStart();