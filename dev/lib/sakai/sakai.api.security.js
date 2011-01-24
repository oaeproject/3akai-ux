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
define(["jquery", "/dev/configuration/config.js", "sakai/sakai.api.util", "sakai/sakai.api.i18n"], function($, sakai_conf, sakai_util, sakai_i18n) {
    return {

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
        isValidPermissionsProperty : function(permissionsProperty, value) {
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
            document.location = "/dev/404.html?url=" + escape(window.location.pathname + window.location.search + window.location.hash);
            return false;
        },

        /**
         * Function that can be called by pages that don't have the permission to show the content
         * they should be showing
         */
        send403 : function(){
            var redurl = window.location.pathname + window.location.hash;
            document.location = "/dev/403.html?url=" + escape(window.location.pathname + window.location.search + window.location.hash);
            return false;
        },

        /**
         * Function that can be called by pages that require a login first
         */
        sendToLogin : function(){
            var redurl = window.location.pathname + window.location.hash;
            document.location = sakai_conf.config.URL.GATEWAY_URL + "?url=" + escape(window.location.pathname + window.location.search + window.location.hash);
            return false;
        },

        showPage : function(callback){
            // Show the background images used on anonymous user pages
            if ($.inArray(window.location.pathname, sakai_conf.config.requireAnonymous) > -1){
                $('html').addClass("requireAnon");
            // Show the normal background
            } else {
                $('html').addClass("requireUser");
            }
            sakai_util.loadSkinsFromConfig();
            // Put the title inside the page
            var pageTitle = sakai_i18n.General.getValueForKey(sakai_conf.config.PageTitles.prefix);
            if (sakai_conf.config.PageTitles.pages[window.location.pathname]){
                pageTitle += sakai_i18n.General.getValueForKey(sakai_conf.config.PageTitles.pages[window.location.pathname]);
            }
            document.title = pageTitle;
            // Show the actual page content
            $('body').show();
            if ($.isFunction(callback)) {
                callback();
            }
        }
    };
});

