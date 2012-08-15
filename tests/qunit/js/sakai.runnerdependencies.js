require({
    baseUrl:'../../dev/lib/',
    //If you change these paths, please check out
    //https://confluence.sakaiproject.org/x/sq_CB
    paths: {
        'jquery-plugins': 'jquery/plugins',
        'jquery': 'jquery/jquery-1.7.0',
        'jquery-ui': 'jquery/jquery-ui-1.8.20.custom',
        'jquery-cookie': 'jquery/plugins/jquery.cookie',
        'jquery-jstree': 'jquery/plugins/jsTree/jquery.jstree.sakai-edit',
        'jquery-fileupload': 'jquery/plugins/jquery.fileupload',
        'jquery-iframe-transport': 'jquery/plugins/jquery.iframe-transport',
        'jquery-pager': 'jquery/plugins/jquery.pager.sakai-edited',
        'jquery-tagcloud': 'jquery/plugins/jquery.tagcloud',
        'config': '../configuration',
        'mockjax': '../../tests/qunit/js/jquery.mockjax',
        'qunitjs': '../../tests/qunit/js',
        'underscore': 'misc/underscore'
    },
    priority: ['jquery']
});

require(
    [
        'jquery',
        'sakai/sakai.api.core',
        'jquery-ui',
        'qunitjs/qunit'
    ],
    function($, sakai) {
        if (document.location.pathname !== '/tests/qunit/' && document.location.pathname.indexOf('/tests/qunit/index.html') === -1) {
            sakai.api.User.loadMeData(function(success, data) {
                // Start i18n
                sakai.api.i18n.init(data);
            });
        }
        return sakai;
    }
);
