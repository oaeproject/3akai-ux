require({
    baseUrl:"../../dev/lib/",
    paths: {
        "jquery": "jquery/jquery-1.5.2",
        "jquery-ui": "jquery/jquery-ui-1.8.13.custom"
    },
    priority: ["jquery"]
});

require(
    {
        baseUrl: "../../dev/lib/"
    },
    [
        "jquery",
        "sakai/sakai.api.core",
        "jquery-ui",
        "../../tests/qunit/js/qunit.js"
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