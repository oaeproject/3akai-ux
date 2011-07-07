require({
    baseUrl:"../../dev/lib/",
    paths: {
        "jquery-plugins": "jquery/plugins",
        "jquery": "jquery/jquery-1.5.2",
        "jquery-ui": "jquery/jquery-ui-1.8.13.custom",
        "config": "../configuration",
        "mockjax": "../../tests/qunit/js/jquery.mockjax",
        "qunitjs": "../../tests/qunit/js"
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
        require.ready(function() {
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