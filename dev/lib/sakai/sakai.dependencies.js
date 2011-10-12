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

/* Define globals */
sakai_global = {};
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
        methods = [ 'error', 'warn', 'info', 'debug', 'log', 'trace'],
        idx = methods.length;

    var createLogMethod = function(method) {
        that[method] = function() {
            if (!window.console) {
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
 * @name Array
 * @namespace
 * Array extensions for Sakai
 */
if (!(Array.indexOf || [].indexOf)) {

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

require(
    {
        baseUrl:"/dev/lib/",
        paths: {
            "jquery-plugins": "jquery/plugins",
            "jquery": "jquery/jquery-1.5.2",
            "jquery-ui": "jquery/jquery-ui-1.8.13.custom",
            "config": "../configuration"
        },
        priority: ["jquery"]
    }
);

require(
    [
        "jquery",
        "sakai/sakai.api.core",
        "sakai/sakai.jquery-extensions",
        "config/config",
        "config/config_custom",
        "jquery-ui",
        "jquery-plugins/jquery.validate",
        "jquery-plugins/jquery.autoSuggest.sakai-edited",
        "misc/l10n/globalize",
        "misc/underscore",
        "jquery-plugins/jquery.json",
        "misc/google/html-sanitizer",
        "misc/querystring",
        "fluid/3akai_Infusion",
        "jquery-plugins/jquery.timeago",
        "jquery-plugins/jqmodal.sakai-edited",
        "jquery-plugins/jquery.cookie",
        "jquery-plugins/jquery.ba-bbq",
        "jquery-plugins/jquery.fieldselection",
        "jquery-plugins/jquery.pager.sakai-edited",
        "jquery-plugins/jquery.threedots",
        "jquery-plugins/jquery.form",
        "jquery-plugins/jquery.fileupload",
        "jquery-plugins/jquery.MultiFile",
        "jquery-plugins/jquery.hoverIntent.sakai-edit",
        "jquery-plugins/jsTree/jquery.jstree.sakai-edit",
        "jquery-plugins/gritter/jquery.gritter.sakai-edit",
        "jquery-plugins/jquery.jcarousel.sakai-edit"
    ],
    function($, sakai) {
        require.ready(function() {
            sakai.api.User.loadMeData(function(success, data) {
                sakai.api.Util.startup(data);
                // Start i18n
                sakai.api.i18n.init(data);
            });
        });
        return sakai;
    }
);
