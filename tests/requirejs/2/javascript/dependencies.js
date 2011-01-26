window.debug = (function() {
    var that = {},
        methods = [ 'error', 'warn', 'info', 'debug', 'log' ],
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
require(
    {
        baseUrl: "/dev/lib/"
    },
    [
        "order!jquery",
        "order!/dev/lib/sakai/sakai.jquery-extensions.js",
        "order!/dev/configuration/widgets.js",
        "order!/var/widgets.json?callback=sakai.storeWidgets",
        "order!/dev/configuration/config.js",
        "order!/dev/configuration/config_custom.js",
        "order!/dev/lib/jquery/jquery-ui.full.js",
        "order!/dev/lib/jquery/plugins/jquery.validate.sakai-edited.js",
        "order!/dev/lib/jquery/plugins/jquery.autoSuggest.sakai-edited.js",
        "order!/dev/lib/fluid/3akai_Infusion.js",
        "order!/dev/lib/misc/l10n/globalization.js",
        "order!/dev/lib/jquery/plugins/jquery.json.js",
        "order!/dev/lib/misc/google/html-sanitizer-minified.js",
        "order!sakai/sakai.api.core",
        "order!/dev/lib/misc/querystring.js",
        "order!/dev/lib/jquery/plugins/jquery.timeago.js",
        "order!/dev/lib/jquery/plugins/jqmodal.sakai-edited.js",
        "order!/dev/lib/jquery/plugins/jquery.cookie.js",
        "order!/dev/lib/jquery/plugins/jquery.ba-bbq.js",
        "order!/dev/lib/jquery/plugins/jquery.pager.js",
        "order!/dev/lib/jquery/plugins/jquery.threedots.js",
        "order!/dev/lib/jquery/plugins/jquery.form.js",
        "order!/dev/lib/jquery/plugins/jquery.MultiFile.js",
        "order!/dev/lib/jquery/plugins/jsTree/jquery.jstree.sakai-edit.js",
        "order!/dev/lib/jquery/plugins/gritter/jquery.gritter.js"
    ],
    function($, a, b, c, d, e, f, g, h, i, j, k, l, m, sakai) {
        require.ready(function(){
            debug.log("dependencies.js ready");
                        
            //require(["/dev/requirejs/javascript/page.js"]);
        });
    }
);

/*
require(["order!jquery",
    "order!/dev/configuration/widgets.js",
    "order!/var/widgets.json?callback=sakai.storeWidgets",
    "order!/dev/configuration/config.js",
    "order!/dev/configuration/config_custom.js",
    "order!/dev/lib/jquery/jquery-ui.full.js",
    "order!/dev/lib/jquery/plugins/jquery.validate.sakai-edited.js",
    "order!/dev/lib/jquery/plugins/jquery.autoSuggest.sakai-edited.js",
    "order!/dev/lib/fluid/3akai_Infusion.js",
    "order!/dev/lib/misc/l10n/globalization.js",
    "order!/dev/lib/jquery/plugins/jquery.json.js",
    "order!/dev/lib/misc/google/html-sanitizer-minified.js",
    "order!/dev/lib/sakai/sakai.api.core.js",
    "order!/dev/lib/misc/querystring.js",
    "order!/dev/lib/jquery/plugins/jquery.timeago.js",
    "order!/dev/lib/jquery/plugins/jqmodal.sakai-edited.js",
    "order!/dev/lib/jquery/plugins/jquery.cookie.js",
    "order!/dev/lib/jquery/plugins/jquery.ba-bbq.js",
    "order!/dev/lib/jquery/plugins/jquery.pager.js",
    "order!/dev/lib/jquery/plugins/jquery.threedots.js",
    "order!/dev/lib/jquery/plugins/jquery.form.js",
    "order!/dev/lib/jquery/plugins/jquery.MultiFile.js",
    "order!/dev/lib/jquery/plugins/jsTree/jquery.jstree.sakai-edit.js",
    "order!/dev/lib/jquery/plugins/gritter/jquery.gritter.js"
 ]);
 
 
 ["order!jquery",
     "order!/dev/lib/sakai/sakai.jquery-extensions.js",
     "order!/dev/configuration/widgets.js",
     "order!/var/widgets.json?callback=sakai.storeWidgets",
     "order!/dev/configuration/config.js",
     "order!/dev/configuration/config_custom.js",
     "order!/dev/lib/jquery/jquery-ui.full.js",
     "order!/dev/lib/jquery/plugins/jquery.validate.sakai-edited.js",
     "order!/dev/lib/jquery/plugins/jquery.autoSuggest.sakai-edited.js",
     "order!/dev/lib/jquery/plugins/jquery.json.js",
     "order!/dev/lib/misc/google/html-sanitizer-minified.js",
     "order!/dev/lib/sakai/sakai.api.core.js"]
*/