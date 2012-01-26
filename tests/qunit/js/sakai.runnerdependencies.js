require({
    baseUrl:"../../dev/lib/",
    //If you change these paths, please check out
    //https://confluence.sakaiproject.org/x/sq_CB
    paths: {
        "jquery-plugins": "jquery/plugins",
        "jquery": "jquery/jquery-1.7.0",
        "jquery-ui": "jquery/jquery-ui-1.8.16.custom",
        "config": "../configuration",
        "mockjax": "../../tests/qunit/js/jquery.mockjax",
        "qunitjs": "../../tests/qunit/js",
        "underscore": "misc/underscore"
    },
    priority: ["jquery"]
});

require(
    [
        "jquery",
        "sakai/sakai.api.core",
        "jquery-ui",
        "qunitjs/qunit"
    ],
    function($, sakai) {
        require(["misc/domReady!"], function(doc) {
            if (document.location.pathname !== "/tests/qunit/" && document.location.pathname.indexOf("/tests/qunit/index.html") === -1) {
                sakai.api.User.loadMeData(function(success, data) {
                    // Start i18n
                    sakai.api.i18n.init(data);
                });
            }
        });
        return sakai;
    }
);