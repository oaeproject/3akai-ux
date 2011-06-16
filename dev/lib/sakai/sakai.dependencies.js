
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

require({
    baseUrl:"/dev/lib/",
    paths: {
        "jquery": "jquery/jquery-1.5.2",
        "jquery-ui": "jquery/jquery-ui-1.8.13.custom"
    },
    priority: ["jquery"]
});

require(
    [
        "jquery",
        "sakai/sakai.api.core",
        "/dev/lib/sakai/sakai.jquery-extensions.js",
        "/dev/configuration/config.js",
        "/dev/configuration/config_custom.js",
        "jquery-ui",
        "/dev/lib/jquery/plugins/jquery.validate.js",
        "/dev/lib/jquery/plugins/jquery.autoSuggest.sakai-edited.js",
        "/dev/lib/misc/l10n/globalization.js",
        "/dev/lib/misc/underscore.js",
        "/dev/lib/jquery/plugins/jquery.json.js",
        "/dev/lib/misc/google/html-sanitizer.js",
        "/dev/lib/misc/querystring.js",
        "/dev/lib/fluid/3akai_Infusion.js",
        "/dev/lib/jquery/plugins/jquery.timeago.js",
        "/dev/lib/jquery/plugins/jqmodal.sakai-edited.js",
        "/dev/lib/jquery/plugins/jquery.cookie.js",
        "/dev/lib/jquery/plugins/jquery.ba-bbq.js",
        "/dev/lib/jquery/plugins/jquery.pager.js",
        "/dev/lib/jquery/plugins/jquery.threedots.js",
        "/dev/lib/jquery/plugins/jquery.form.js",
        "/dev/lib/jquery/plugins/jquery.MultiFile.js",
        "/dev/lib/jquery/plugins/jquery.hoverIntent.sakai-edit.js",
        "/dev/lib/jquery/plugins/jsTree/jquery.jstree.sakai-edit.js",
        "/dev/lib/jquery/plugins/gritter/jquery.gritter.js",
        "/dev/lib/jquery/plugins/jquery.jcarousel.js",
        "/dev/lib/jquery/plugins/jquery.fileupload.js"
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
