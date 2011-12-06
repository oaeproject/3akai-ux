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
define(
    [
        "jquery",
        "config/config_custom",
        "sakai/sakai.api.util",
        "sakai/sakai.api.server"
    ],
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
                translateJqueryPlugins();
                translateDirectory(sakai_config.Directory);
                require("sakai/sakai.api.widgets").initialLoad();
                sakaii18nAPI.done = true;
                $(window).trigger("done.i18n.sakai");
                return true;
            };

            /**
             * Function that will internationalize the different jquery plugins
             * we use. For example, we want to make sure that the previous and next
             * buttons in the pager plugin are properly using the current user's
             * locale settings
             */
            var translateJqueryPlugins = function(){
                // Translate the jquery.timeago.js plugin
                $.timeago.settings.strings = {
                    prefixAgo: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_PREFIXAGO"),
                    prefixFromNow: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_PREFIXFROMNOW"),
                    suffixAgo: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_SUFFIXAGO"),
                    suffixFromNow: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_SUFFIXFROMNOW"),
                    seconds: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_SECONDS"),
                    minute: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_MINUTE"),
                    minutes: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_MINUTES"),
                    hour: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_HOUR"),
                    hours: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_HOURS"),
                    day: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_DAY"),
                    days: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_DAYS"),
                    month: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_MONTH"),
                    months: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_MONTHS"),
                    year: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_YEAR"),
                    years: sakaii18nAPI.getValueForKey("JQUERY_TIMEAGO_YEARS")
                };
                // Translate the jquery.pager.js plugin
                $.fn.pager.defaults.htmlparts = {
                    "first" : sakaii18nAPI.getValueForKey("FIRST"),
                    "last" : sakaii18nAPI.getValueForKey("LAST"),
                    "prev" : '<span><div class=\"sakai_pager_prev\"></div> <a href="javascript:;" class="t" title="' + sakaii18nAPI.getValueForKey("PREVIOUS_PAGE") + '">' + sakaii18nAPI.getValueForKey("PREV") + '</span></a>',
                    "next" : '<span><a href="javascript:;" class="t" title="' + sakaii18nAPI.getValueForKey("NEXT_PAGE") + '">' + sakaii18nAPI.getValueForKey("NEXT") + '</a><div class=\"sakai_pager_next\"></div></span>',
                    "current": '<li class="page-number"><a href="javascript:;" title="' + sakaii18nAPI.getValueForKey("PAGE") + ' ${page}">${page}</a></li>'
                };

            };

            /**
             * Translate all of the elements inside of the directory into the current's
             * language
             */
            var translateDirectory = function(directory){
                for (var dir in directory){
                    if (directory.hasOwnProperty(dir)){
                        directory[dir].title = sakaii18nAPI.General.process(directory[dir].title);
                        if (directory[dir].children){
                            translateDirectory(directory[dir].children);
                        }
                    }
                }
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
                var newstring = sakaii18nAPI.General.process(tostring);
                // We actually use the old innerHTML function here because the $.html() function will
                // try to reload all of the JavaScript files declared in the HTML, which we don't want as they
                // will already be loaded
                if($i18nable.length > 0){
                    $i18nable[0].innerHTML = newstring;
                }
                finishI18N();
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
                var langCode, i10nCode, loadDefaultBundleRequest, loadLocalBundleRequest;

                if (meData && meData.user && meData.user.locale && meData.user.locale.country) {
                    langCode = meData.user.locale.language + "_" + meData.user.locale.country.replace("_", "-");
                    localeSet = true;
                } else {
                    langCode = sakai_config.defaultLanguage;
                }
                i10nCode = langCode.replace("_", "-");

                // set the language attribute for the html tag
                $("html").attr("lang", langCode.substr(0, 2));

                if (Globalize.cultures && Globalize.cultures[i10nCode]) {
                    Globalize.culture(i10nCode);
                } else {
                    $.getScript(sakai_config.URL.I10N_BUNDLE_URL.replace("__CODE__", i10nCode), function(success, textStatus) {
                        Globalize.culture(i10nCode);
                    });
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

                // callback function for response from batch request
                var bundleReqFunction = function(success, reqData){
                    if (success){
                        var loadDefaultBundleSuccess, loadDefaultBundleData, loadLocalBundleSuccess, loadLocalBundleData;
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
                            }
                        }

                        // process the responses
                        if (loadDefaultBundleSuccess) {
                            loadDefaultBundleData = sakaii18nAPI.changeToJSON(loadDefaultBundleData);
                            sakaii18nAPI.data.defaultBundle = loadDefaultBundleData;
                            if (localeSet) {
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
                            finishI18N();
                        }
                    }
                };
                // add default language bundle to batch request
                sakai_serv.bundleRequests("i18n", 2, "loadDefaultBundle", loadDefaultBundleRequest, bundleReqFunction);
                // add local language bundle to batch request
                sakai_serv.bundleRequests("i18n", 2, "loadLocalBundle", loadLocalBundleRequest);
            };


            /////////////////////////////
            // INITIALIZATION FUNCTION //
            /////////////////////////////

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
             * @param {String} widget optional widget name. This will cause the widget language
             *                 bundles to be checked for a translation first
             * @return {String} A processed string where all the messages are replaced with values from the language bundles
             */

            process : function(toprocess, widget) {

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
                    if (sakai_config.displayDebugInfo === true && sakaii18nAPI.data.meData.user && sakaii18nAPI.data.meData.user.locale && sakaii18nAPI.data.meData.user.locale.language === "lu" && sakaii18nAPI.data.meData.user.locale.country === "GB"){
                        toreplace = quotes + replace.substr(7, replace.length - 9) + quotes;
                        processed += toprocess.substring(lastend, expression.lastIndex - replace.length) + toreplace;
                        lastend = expression.lastIndex;
                    } else {
                        toreplace = quotes + sakaii18nAPI.getValueForKey(lastParen, widget) + quotes;
                        processed += toprocess.substring(lastend, expression.lastIndex - replace.length) + toreplace;
                        lastend = expression.lastIndex;
                    }
                }
                processed += toprocess.substring(lastend);
                return processed;

            }
        },

        /**
         * Get the internationalised value for a specific key.
         * We expose this function so you can do internationalisation within JavaScript.
         * If the key isn't found in a translation bundle, the key will be returned unmodified
         *
         * @example sakai.api.i18n.getValueForKey("CHANGE_LAYOUT", ["widgetid"]);
         * @param {String} key The key that will be used to get the translation
         * @param {String} optional widget name. This will cause the widget language
         *                 bundles to be checked for a translation first
         * @return {String} The translated value for the provided key
         */
        getValueForKey: function(key, widgetname) {
            // Get the user's current locale from the me object
            var locale = sakaii18nAPI.getUserLocale();
            // Check for i18n debug language
            //   Because the debug language has to be a valid Java locale, 
            //   we are currently using lu_GB to identify the debug language
            if (locale === "lu_GB") {
                return key;
            } else {
                // First check the bundle for the widget, if provided
                if (widgetname) {
                    if (typeof sakaii18nAPI.data.widgets[widgetname]) {
                        // First check if the key can be found in the widget's locale bundle
                        if ($.isPlainObject(sakaii18nAPI.data.widgets[widgetname][locale]) && _.isString(sakaii18nAPI.data.widgets[widgetname][locale][key])) {
                            return sakaii18nAPI.processUTF16ToText(sakaii18nAPI.data.widgets[widgetname][locale][key]);
                        }
                        // If the key wasn't found in the widget's locale bundle, search in the widget's default bundle
                        else if ($.isPlainObject(sakaii18nAPI.data.widgets[widgetname]["default"]) && _.isString(sakaii18nAPI.data.widgets[widgetname]["default"][key])) {
                            return sakaii18nAPI.processUTF16ToText(sakaii18nAPI.data.widgets[widgetname]["default"][key]);
                        }
                    }
                }
                // First check if the key can be found in the general locale bundle
                if (sakaii18nAPI.data.localBundle && _.isString(sakaii18nAPI.data.localBundle[key])) {
                    return sakaii18nAPI.processUTF16ToText(sakaii18nAPI.data.localBundle[key]);
                }
                // If the key wasn't found in the general locale bundle, search in the general default bundle
                else if (sakaii18nAPI.data.defaultBundle && _.isString(sakaii18nAPI.data.defaultBundle[key])) {
                    return sakaii18nAPI.processUTF16ToText(sakaii18nAPI.data.defaultBundle[key]);
                } 
                // If none of the about found something, log an error message
                else {
                    debug.warn("sakai.api.i18n.getValueForKey: Not found in any bundles. Key: " + key);
                    return key;
                }
            }
        },

        /**
         * Utility regular expression that is used to find
         * escaped unicode characters in translation string
         */
        UnicodeExpression: new RegExp("[\\][u][A-F0-9]{4}", "g"),

        /**
         * Utility function that will take a translation string
         * and replace escaped unicode characters with the actual unicode
         * character
         * @param {String} translation   Translation key that we want to scan for escaped unicode
         * @return {String} Translation key where all escaped unicode characters
         *                  have been replaced by the actual unicode character
         */
        processUTF16ToText: function(translation){
            var matches =  translation.match(sakaii18nAPI.UnicodeExpression);
            if (matches) {
                for (var r = 0; r < matches.length; r++) {
                    var replace = matches[r];
                    translation = translation.replace("\\" + replace, String.fromCharCode(parseInt(replace.substring(1), 16)));
                }
            }
            return $.trim(translation);
        },

        /**
         * Function that will return the current user's locale
         *     Example: en_GB
         */
        getUserLocale: function(){
            var locale = false;
            if (sakaii18nAPI.data.meData.user && sakaii18nAPI.data.meData.user.locale) {
                locale = sakaii18nAPI.data.meData.user.locale.language + "_" + sakaii18nAPI.data.meData.user.locale.country;
            }
            return locale;
        }

    };

    return sakaii18nAPI;
});
