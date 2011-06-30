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
define(["jquery",
        "/dev/configuration/config.js",
        "sakai/sakai.api.util",
        "sakai/sakai.api.server"],
        function($, sakai_config, sakai_util, sakai_serv) {

    var sakaii18nAPI = {
        data : {
            localBundle : false,
            defaultBundle : false,
            widgets : {},
            culture : "default",
            meData: false
        },

        /**
         * This changes properties file into a json object
         */
        changeToJSON : function(input){
            var json = {};
            var inputLine = input.split(/\n/);
            var i;
            for (i in inputLine) {
                // IE 8 i has indexof as well which breaks the page.
                if (inputLine.hasOwnProperty(i)) {
                    var keyValuePair = inputLine[i].split(/\s*\=\s*/);
                    var key = keyValuePair.shift();
                    var value = keyValuePair.join(" = ");
                    json[key] = value;
                }
            }
            return json;
        },

        /**
         * <p>Main i18n process</p>
         * <p>This function will be executed once the entire DOM has been loaded. The function will take
         * the HTML that's inside the body of the page, and load the default and user specific language
         * bundle. We then look for i18n keys inside the HTML, and replace with the values from the
         * language bundles. We always first check whether the key is available in the user specific
         * bundle and only if that one doesn't exist, we will take the value out of the default bundle.</p>
         *
         * @param {Object} meData the data from sakai.api.User.data.me
         */
        init : function(meData){
            ////////////////////
            // HELP VARIABLES //
            ////////////////////

            sakaii18nAPI.data.meData = meData;

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
                var siteid = loc.indexOf(sakai_config.URL.SITE_CONFIGFOLDER.replace(/__SITEID__/, ""));
                if (siteid !== -1) {
                    var mark = (loc.indexOf("?") === -1) ? loc.length : loc.indexOf("?");
                    var uri = loc.substring(0, mark);
                    site = uri.substring(siteid, loc.length).replace(sakai_config.URL.SITE_CONFIGFOLDER.replace(/__SITEID__/, ""), "");
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
                if (!sakai_config.anonAllowed) {
                    sakai_config.requireUser = sakai_config.requireUser.concat(sakai_config.requireUserAnonNotAllowed);
                    sakai_config.requireAnonymous = sakai_config.requireAnonymous.concat(sakai_config.requireAnonymousAnonNotAllowed);
                }
                if (meData && meData.user && meData.user.anon) {
                    if ($.inArray(currentPage, sakai_config.requireUser) > -1){
                        sakai_util.Security.sendToLogin();
                        return false;
                    }
                } else {
                    if ($.inArray(currentPage, sakai_config.requireAnonymous) > -1){
                        document.location = sakai_config.URL.MY_DASHBOARD_URL;
                        return false;
                    }
                }
                
                if ($.inArray(currentPage, sakai_config.requireProcessing) === -1 && window.location.pathname.substring(0, 2) !== "/~"){
                    sakai_util.Security.showPage();
                }
                require("sakai/sakai.api.widgets").initialLoad();
                sakaii18nAPI.done = true;
                $(window).trigger("done.i18n.sakai");
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
                var newstring = sakaii18nAPI.General.process(tostring, meData);
                // We actually use the old innerHTML function here because the $.html() function will
                // try to reload all of the JavaScript files declared in the HTML, which we don't want as they
                // will already be loaded
                if($i18nable.length > 0){
                    $i18nable[0].innerHTML = newstring;
                }
                document.title = sakaii18nAPI.General.process(document.title, meData);
                finishI18N();
            };

            /**
             * This function will load the general language bundle specific to the language chosen by
             * the user and will store it in a global variable. This language will either be the prefered
             * user language or the prefered server language. The language will be available in the me feed
             * and we'll use the global meData object to extract it from. If there is no prefered langauge,
             * we'll use the default bundle to translate everything.
             */
            var loadLocalBundle = function(langCode){
                // globalization
                var i10nCode = langCode.replace("_", "-");
                if (Globalization.cultures) { // check if jquery.glob has been defined yet, should always be but just a sanity check
                    if (Globalization.cultures[i10nCode]) { // probably will never be true, but just in case, no need to get the script again
                        Globalization.preferCulture(i10nCode);
                    } else {
                        $.getScript(sakai_config.URL.I10N_BUNDLE_URL.replace("__CODE__", i10nCode), function(success, textStatus) {
                            Globalization.preferCulture(i10nCode);
                        });
                    }
                }
                sakaii18nAPI.data.culture = i10nCode;
                // language bundles
                $.ajax({
                    url: sakai_config.URL.I18N_BUNDLE_ROOT + langCode + ".properties",
                    success: function(data){
                        data = sakaii18nAPI.changeToJSON(data);
                        sakaii18nAPI.data.localBundle = data;
                        doI18N(sakaii18nAPI.data.i18n.localBundle, sakaii18nAPI.data.defaultBundle);
                    },
                    error: function(xhr, textStatus, thrownError){
                        // There is no language file for the language chosen by the user
                        // We'll switch to using the default bundle only
                        doI18N(null, sakaii18nAPI.data.defaultBundle);
                    }
                });
            };

            /**
             * Load the language for a specific site
             * @param {String} site The id of the site you want to load the language for
             */
            var loadSiteLanguage = function(site){
                $.ajax({
                    url: sakai_config.URL.SITE_CONFIGFOLDER.replace("__SITEID__", site) + ".json",
                    cache: false,
                    success: function(data){
                        var siteJSON = data;
                        if (siteJSON.language && siteJSON.language !== "default_default") {
                            loadLocalBundle(siteJSON.language);
                        } else if (meData.user.locale) {
                            loadLocalBundle(meData.user.locale.language + "_" + meData.user.locale.country);
                        } else {
                            // There is no locale set for the current user. We'll switch to using the default bundle only
                            doI18N(null, sakaii18nAPI.data.defaultBundle);
                        }
                    },
                    error: function(xhr, textStatus, thrownError){
                        loadLocalBundle();
                    }
                });
            };

            /**
             * This will load the default language bundle and will store it in a global variable. This default bundle
             * will be saved in a file called bundle/default.properties.
             */
            var loadDefaultBundle = function(){
                $.ajax({
                    url: sakai_config.URL.I18N_BUNDLE_ROOT + "default.properties",
                    success: function(data){
                        data =sakaii18nAPI.changeToJSON(data);
                        sakaii18nAPI.data.defaultBundle = data;
                        var site = getSiteId();
                        if (!site) {
                            if (meData && meData.user && meData.user.locale) {
                                loadLocalBundle(meData.user.locale.language + "_" + meData.user.locale.country);
                            } else {
                                // There is no locale set for the current user. We'll switch to using the default bundle only
                                doI18N(null, sakaii18nAPI.data.defaultBundle);
                            }
                        } else {
                            loadSiteLanguage(site);
                        }
                    },
                    error: function(xhr, textStatus, thrownError){
                        // There is no default bundle, so we'll just show the interface without doing any translations
                        finishI18N();
                    }
                });
            };

            /**
             * This will load the default language bundle and will store it in a global variable. This default bundle
             * will be saved in a file called bundle/default.properties.
             * This function will load the general language bundle specific to the language chosen by
             * the user and will store it in a global variable. This language will either be the prefered
             * user language or the prefered server language. The language will be available in the me feed
             * and we'll use the global sakai.api.User.data.me object to extract it from. If there is no prefered langauge,
             * we'll use the default bundle to translate everything.
             */
            var loadLanguageBundles = function(){
                var localeSet = false;
                var getGlobalization = false;
                var langCode, i10nCode, loadDefaultBundleRequest, loadLocalBundleRequest, globalizationRequest; 

                if (meData && meData.user && meData.user.locale && meData.user.locale.country) {
                    langCode = meData.user.locale.language + "_" + meData.user.locale.country.replace("_", "-");
                    i10nCode = langCode.replace("_", "-");
                    localeSet = true;
                }

                if (Globalization.cultures) { // check if jquery.glob has been defined yet, should always be but just a sanity check
                    if (Globalization.cultures[i10nCode]) { // probably will never be true, but just in case, no need to get the script again
                        Globalization.preferCulture(i10nCode);
                    } else {
                        getGlobalization = true;
                    }
                }

                loadDefaultBundleRequest = {
                    "url": sakai_config.URL.I18N_BUNDLE_ROOT + "default.properties",
                    "method": "GET"
                };
                
                if (localeSet) {
                    loadLocalBundleRequest = {
                        "url": sakai_config.URL.I18N_BUNDLE_ROOT + langCode + ".properties",
                        "method":"GET"
                    };
                } else {
                    loadLocalBundleRequest = false;
                }

                if (getGlobalization && localeSet) {
                    globalizationRequest = {
                        "url": sakai_config.URL.I10N_BUNDLE_URL.replace("__CODE__", i10nCode),
                        "dataType": "script",
                        "method": "GET"
                    };
                } else {
                    globalizationRequest = false;
                }

                // bind response from batch request
                $(window).bind("complete.bundleRequest.Server.api.sakai", function(e, reqData) {
                    if (reqData.groupId === "i18n") {
                        var loadDefaultBundleSuccess, loadDefaultBundleData, loadLocalBundleSuccess, loadLocalBundleData, globalizationSuccess, globalizationData;
                        // loop through and allocate response data to their request
                        var i;
                        for (i in reqData.responseId) {
                            if (reqData.responseId.hasOwnProperty(i) && reqData.responseData[i]) {
                                if (reqData.responseId[i] === "loadDefaultBundle") {
                                    loadDefaultBundleSuccess = reqData.responseData[i].success;
                                    loadDefaultBundleData = reqData.responseData[i].body;
                                }
                                if (reqData.responseId[i] === "loadLocalBundle") {
                                    loadLocalBundleSuccess = reqData.responseData[i].success;
                                    loadLocalBundleData = reqData.responseData[i].body;
                                }
                                if (reqData.responseId[i] === "loadLocalBundle") {
                                    globalizationSuccess = reqData.responseData[i].success;
                                    globalizationData = reqData.responseData[i].body;
                                }
                            }
                        }
                        
                        // process the responses
                        if (loadDefaultBundleSuccess) {
                            loadDefaultBundleData = sakaii18nAPI.changeToJSON(loadDefaultBundleData);
                            sakaii18nAPI.data.defaultBundle = loadDefaultBundleData;
                            var site = getSiteId();
                            if (!site) {
                                if (localeSet) {
                                    if (getGlobalization && globalizationSuccess) {
                                        Globalization.preferCulture(i10nCode);
                                    }
                                    if (loadLocalBundleSuccess) {
                                        loadLocalBundleData = sakaii18nAPI.changeToJSON(loadLocalBundleData);
                                        sakaii18nAPI.data.localBundle = loadLocalBundleData;
                                        doI18N(sakaii18nAPI.data.localBundle, sakaii18nAPI.data.defaultBundle);
                                    } else {
                                        doI18N(null, sakaii18nAPI.data.defaultBundle);
                                    }
                                } else {
                                    // There is no locale set for the current user. We'll switch to using the default bundle only
                                    doI18N(null, sakaii18nAPI.data.defaultBundle);
                                }
                            } else {
                                loadSiteLanguage(site);
                            }
                        } else {
                            finishI18N();
                        }
                        
                    }
                });
                // add default language bundle to batch request
                sakai_serv.bundleRequests("i18n", 3, "loadDefaultBundle", loadDefaultBundleRequest);
                // add local language bundle to batch request
                sakai_serv.bundleRequests("i18n", 3, "loadLocalBundle", loadLocalBundleRequest);
                // add globalization script to batch request
                sakai_serv.bundleRequests("i18n", 3, "globalization", globalizationRequest);
            };


            /////////////////////////////
            // INITIALIZATION FUNCTION //
            /////////////////////////////

            //loadDefaultBundle();
            loadLanguageBundles();
        },

        /**
         * @class i18nGeneral
         *
         * @description
         * Internationalisation related functions for general page content and UI elements
         *
         * @namespace
         * General internationalisation functions
         */
        General : {

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
             *  in the default language
             * @param {Object} meData the data from sakai.api.User.data.me
             * @return {String} A processed string where all the messages are replaced with values from the language bundles
             */

            process : function(toprocess, meData) {

                if(!toprocess){
                    return "";
                }

                var expression = new RegExp("__MSG__(.*?)__", "gm"), processed = "", lastend = 0;

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
                    if (sakai_config.displayDebugInfo === true && meData.user && meData.user.locale && meData.user.locale.language === "lu" && meData.user.locale.country === "GB"){
                        toreplace = quotes + replace.substr(7, replace.length - 9) + quotes;
                        processed += toprocess.substring(lastend, expression.lastIndex - replace.length) + toreplace;
                        lastend = expression.lastIndex;
                    } else {
                        toreplace = quotes + this.getValueForKey(lastParen) + quotes;
                        processed += toprocess.substring(lastend, expression.lastIndex - replace.length) + toreplace;
                        lastend = expression.lastIndex;
                    }
                }
                processed += toprocess.substring(lastend);
                return processed;

            },

            /**
             * Get the internationalised value for a specific key.
             * We expose this function so you can do internationalisation within JavaScript.
             * @example sakai.api.i18n.General.getValueForKey("CHANGE_LAYOUT");
             * @param {String} key The key that will be used to get the internationalised value
             * @return {String} The translated value for the provided key
             */
            getValueForKey : function(key) {
                // Check for i18n debug
                if (sakaii18nAPI.data.meData.user && sakaii18nAPI.data.meData.user.locale && sakaii18nAPI.data.meData.user.locale.language === "lu" && sakaii18nAPI.data.meData.user.locale.country === "GB"){
                    return key;
                }
                // First check if the key can be found in the locale bundle
                else if (sakaii18nAPI.data.localBundle && sakaii18nAPI.data.localBundle[key]) {
                    return sakaii18nAPI.data.localBundle[key];
                }
                // If the key wasn't found in the localbundle, search in the default bundle
                else if (sakaii18nAPI.data.defaultBundle && sakaii18nAPI.data.defaultBundle[key]) {
                    return sakaii18nAPI.data.defaultBundle[key];
                }
                // If none of the about found something, log an error message
                else {
                    debug.warn("sakai.api.i18n.General.getValueForKey: Not in local & default file. Key: " + key);
                    return false;
                }
            }
        },

        /**
         * @class i18nWidgets
         *
         * @description
         * Internationalisation in widgets
         *
         * @namespace
         * Internationalisation in widgets
         */
        Widgets : {

            /**
             * Get the value for a specific key in a specific widget.
             * @example sakai.api.i18n.Widgets.getValueForKey("myprofile", "en_US", "PREVIEW_PROFILE");
             * @param {String} widgetname The name of the widget
             * @param {String|Object} locale The locale for the getting the value, either in string form or
             *                               the user's locale object from sakai.api.User.data.me.user.locale
             * @param {String} key The key which you want to be translated
             * @return {String} The value you wanted to translate for a specific widget
             */
            getValueForKey : function(widgetname, locale, key) {
                if ($.isPlainObject(locale) && locale.language && locale.country) {
                    locale = locale.language + "_" + locale.country;
                }
                // Get a message key value in priority order: local widget language file -> widget default language file -> system local bundle -> system default bundle
                if ((typeof sakaii18nAPI.data.widgets[widgetname][locale] === "object") && (typeof sakaii18nAPI.data.widgets[widgetname][locale][key] === "string")){
                    return sakaii18nAPI.data.widgets[widgetname][locale][key];

                } else if ((typeof sakaii18nAPI.data.widgets[widgetname]["default"][key] === "string") && (typeof sakaii18nAPI.data.widgets[widgetname]["default"] === "object")) {
                    return sakaii18nAPI.data.widgets[widgetname]["default"][key];

                } else if (sakaii18nAPI.data.localBundle[key]) {
                    return sakaii18nAPI.data.localBundle[key];

                } else if (sakaii18nAPI.data.defaultBundle[key]) {
                    return sakaii18nAPI.data.defaultBundle[key];

                }

            }
        }
    };

    return sakaii18nAPI;
});
