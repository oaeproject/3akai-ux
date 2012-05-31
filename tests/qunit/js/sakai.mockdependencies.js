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
        methods = [ 'error', 'warn', 'info', 'debug', 'log', 'trace' ],
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

require({
    baseUrl:"../../../../dev/lib/",
    //If you change these paths, please check out
    //https://confluence.sakaiproject.org/x/sq_CB
    paths: {
        "jquery-plugins": "jquery/plugins",
        "jquery": "jquery/jquery-1.7.0",
        "jquery-ui": "jquery/jquery-ui-1.8.18.custom",
        "config": "../configuration",
        "mockjax": "../../tests/qunit/js/jquery.mockjax",
        "qunitjs": "../../tests/qunit/js",
        "underscore": "misc/underscore"
    },
    priority: ["jquery", "mockjax"]
});

require(
    [
        "jquery",
        "sakai/sakai.api.core",
        "sakai/sakai.jquery-extensions",
        "config/config",
        "config/config_custom",
        "jquery-ui",
        "jquery-plugins/jquery.validate",
        "jquery-plugins/jquery.autoSuggest",
        "misc/l10n/globalize",
        "misc/underscore",
        "misc/google/html-sanitizer",
        "jquery-plugins/jquery.timeago",
        "jquery-plugins/jqmodal.sakai-edited",
        "jquery-plugins/jquery.cookie",
        "jquery-plugins/jquery.ba-bbq",
        "jquery-plugins/jquery.pager.sakai-edited",
        "jquery-plugins/jquery.threedots",
        "jquery-plugins/jquery.form",
        "jquery-plugins/jquery.fileupload",
        "jquery-plugins/jquery.MultiFile.sakai-edited",
        "jquery-plugins/jsTree/jquery.jstree.sakai-edit",
        "jquery-plugins/gritter/jquery.gritter.sakai-edit",
        "jquery-plugins/jquery.jcarousel.sakai-edit",
        "mockjax",
        "qunitjs/mockcore",
        "qunitjs/mockme",
        "qunitjs/qunit"
    ],
    function($, sakai) {
        require(["misc/domReady!"], function(doc) {
            if (document.location.pathname !== "/tests/qunit/" && document.location.pathname !== "/tests/qunit/index.html") {
                sakai.api.User.loadMeData(function(success, data) {
                    // Start i18n
                    sakai.api.i18n.init(data);
                });
            }
        });
        return sakai;
    }
);