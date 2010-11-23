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
    /**
     * @name sakai.data.i18n
     */
    sakai.data.i18n = {};

    // Will contain all of the values for the default bundle
    sakai.data.i18n.defaultBundle = false;

    // Will contain all of the values for the bundle of the language chosen by the user
    sakai.data.i18n.localBundle = false;

    // Will contain all the i18n for widgets
    sakai.data.i18n.widgets = sakai.data.i18n.widgets || {};

    // Will contain all the i18n for widgets
    sakai.data.i18n.changeToJSON = sakai.data.i18n.changeToJSON || {};


    ////////////////////
    // HELP VARIABLES //
    ////////////////////

    /*
     * Cache the jQuery i18nable element. This makes sure that only pages with
     * the class i18nable on the body element get i18n translations and won't do
     * it on other pages.
     * <body class="i18nable">
     */
    var $i18nable = $("body.i18nable");

    /*
     * We take the HTML that is inside the body tag. We will use this to find string we want to
     * translate into the language chosen by the user
     */
    var tostring = $i18nable.html();


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
        var currentPage = window.location.pathname;
        if (sakai.data.me.user.anon) {
            if ($.inArray(currentPage, sakai.config.requireUser) > -1){
                sakai.api.Security.sendToLogin();
                return false;
            }
        } else {
            if ($.inArray(currentPage, sakai.config.requireAnonymous) > -1){
                document.location = sakai.config.URL.MY_DASHBOARD_URL;
                return false;
            }
        }
        if ($.inArray(currentPage, sakai.config.requireProcessing) === -1 && window.location.pathname.substring(0, 2) !== "/~"){
            sakai.api.Security.showPage();
        }
        sakai.api.Widgets.Container.setReadyToLoad(true);
        sakai.api.Widgets.widgetLoader.insertWidgets(null, false);
        return true;
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
        // We actually use the old innerHTML function here because the $.html() function will
        // try to reload all of the JavaScript files declared in the HTML, which we don't want as they
        // will already be loaded
        if($i18nable.length > 0){
            $i18nable[0].innerHTML = newstring;
        }
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
        // globalization
        var i10nCode = langCode.replace("_", "-");
        if (Globalization.cultures) { // check if jquery.glob has been defined yet, should always be but just a sanity check
            if (Globalization.cultures[i10nCode]) { // probably will never be true, but just in case, no need to get the script again
                Globalization.preferCulture(i10nCode);
            } else {
                $.getScript(sakai.config.URL.I10N_BUNDLE_URL.replace("__CODE__", i10nCode), function(success, textStatus) {
                    Globalization.preferCulture(i10nCode);
                });
            }
        }
        // language bundles
        $.ajax({
            url: sakai.config.URL.I18N_BUNDLE_ROOT + langCode + ".properties",
            success: function(data){
                data = sakai.data.i18n.changeToJSON(data);
                sakai.data.i18n.localBundle = data;
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
                var siteJSON = data;
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
     * This change properties file into json object.
     */
    sakai.data.i18n.changeToJSON = function(input){
       var json = {};
        var inputLine = input.split(/\n/);
        for (var i in inputLine) {
            // IE 8 i has indexof as well which breaks the page.
            if (inputLine.hasOwnProperty(i)) {
                var keyValuePair = inputLine[i].split(/ \=\s*/);
                var key = keyValuePair[0];
                var value = keyValuePair[1];
                json[key] = value;
            }
        }
        return json;
    };

    /**
     * This will load the default language bundle and will store it in a global variable. This default bundle
     * will be saved in a file called bundle/default.properties.
     */
    var loadDefaultBundle = function(){
        $.ajax({
            url: sakai.config.URL.I18N_BUNDLE_ROOT + "default.properties",
            success: function(data){
                data = sakai.data.i18n.changeToJSON(data);
                sakai.data.i18n.defaultBundle = data;
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

    if(!toprocess){
        return "";
    }

    var expression = new RegExp(".{1}__MSG__(.*?)__", "gm"), processed = "", lastend = 0;

    while(expression.test(toprocess)) {
        var replace = RegExp.lastMatch;
        var lastParen = RegExp.lastParen;
        var quotes = "";

        // need to add quotations marks if key is adjacent to an equals sign which means its probably missing quotes - IE
        if (replace.substr(0,2) !== "__"){
            if (replace.substr(0,1) === "="){
                quotes = '"';
            }
            replace = replace.substr(1, replace.length);
        }
        var toreplace;
        // check for i18n debug
        if (sakai.config.displayDebugInfo === true && sakai.data.me.user.locale && sakai.data.me.user.locale.language === "lu" && sakai.data.me.user.locale.country === "GB"){
            toreplace = quotes + replace.substr(7, replace.length - 9) + quotes;
            processed += toprocess.substring(lastend, expression.lastIndex - replace.length) + toreplace;
            lastend = expression.lastIndex;
        } else {
            toreplace = quotes + sakai.api.i18n.General.getValueForKey(lastParen) + quotes;
            processed += toprocess.substring(lastend, expression.lastIndex - replace.length) + toreplace;
            lastend = expression.lastIndex;
        }
    }
    processed += toprocess.substring(lastend);
    return processed;

};

/**
 * Get the internationalised value for a specific key.
 * We expose this function so you can do internationalisation within JavaScript.
 * @example sakai.api.i18n.General.getValueForKey("CHANGE_LAYOUT");
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
        debug.warn("sakai.api.i18n.General.getValueForKey: Not in local & default file. Key: " + key);
        return false;
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