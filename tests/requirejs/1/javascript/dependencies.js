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
    "order!/dev/lib/misc/google/html-sanitizer.js",
    "order!/dev/lib/sakai/sakai.api.core.js",
    "order!/dev/lib/sakai/sakai.api.util.js",
    "order!/dev/lib/sakai/sakai.api.i18n.js",
    "order!/dev/lib/sakai/sakai.api.l10n.js",
    "order!/dev/lib/sakai/sakai.api.user.js",
    "order!/dev/lib/sakai/sakai.api.widgets.js",
    "order!/dev/lib/sakai/sakai.api.groups.js",
    "order!/dev/lib/sakai/sakai.api.communication.js",
    "order!/dev/lib/sakai/sakai.api.content.js",
    "order!/dev/lib/misc/trimpath.template.js",
    "order!/dev/lib/misc/querystring.js",
    "order!/dev/lib/jquery/plugins/jquery.timeago.js",
    "order!/dev/lib/jquery/plugins/jqmodal.sakai-edited.js",
    "order!/dev/lib/jquery/plugins/jquery.cookie.js",
    "order!/dev/lib/jquery/plugins/jquery.ba-bbq.js",
    "order!/dev/lib/jquery/plugins/jquery.pager.sakai-edited.js",
    "order!/dev/lib/jquery/plugins/jquery.threedots.js",
    "order!/dev/lib/jquery/plugins/jquery.form.js",
    "order!/dev/lib/jquery/plugins/jquery.MultiFile.js",
    "order!/dev/lib/jquery/plugins/jsTree/jquery.jstree.sakai-edit.js",
    "order!/dev/lib/jquery/plugins/gritter/jquery.gritter.js",
    "order!/dev/requirejs/lib/core.js"
    
    ], function(){
        require(["misc/domReady!"], function(doc){
            debug.log("dependencies.js ready");
                        
            //require(["/dev/requirejs/javascript/page.js"]);
        });
    }
);
