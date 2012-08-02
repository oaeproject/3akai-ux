require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ],
    function($, sakai) {

        var testURL = '/~admin/public/test123';

        var SaveDataEscapingTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            asyncTest('Ensure escapedHTML is returned correctly', function() {
                var xssString = '<script>alert(\'xss\');</script>';
                var escapedString = sakai.api.Security.escapeHTML(xssString);
                var data = {'name': escapedString};
                sakai.api.Server.saveJSON(testURL, data, function(success, data) {
                    sakai.api.Server.loadJSON(testURL, function(success, data) {
                        equal(escapedString, data.name, 'The escaped string returned as it was saved');
                        start();
                    });
                });
            });
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            SaveDataEscapingTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                SaveDataEscapingTest();
            });
        }

    }
);