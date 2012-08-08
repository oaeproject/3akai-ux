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

        module('Searches');

        var simpleSearch = 'Abe Lincoln',
            simpleSearchTransformed = 'Abe AND Lincoln',
            simpleSearch1 = 'Abe and Lincoln',
            simpleSearchTransformed1 = 'Abe AND and AND Lincoln',
            simpleSearch2 = 'Abe or Lincoln',
            simpleSearchTransformed2 = 'Abe AND or AND Lincoln',
            advancedSearch = 'sakai AND project',
            advancedSearchTransformed1 = 'sakai AND \'project\'',
            advancedSearch1 = 'sakai \'project\''
            advancedSearch2 = 'sakai _project_',
            advancedSearch3 = 'sakai -project-',
            advancedSearch4 = 'sakai OR project';

        var SearchTest = function() {
            asyncTest('Simple Searches', 3, function() {
                same(sakai.api.Server.createSearchString(simpleSearch), simpleSearchTransformed, 'Correctly tranformed simple search query');
                same(sakai.api.Server.createSearchString(simpleSearch1), simpleSearchTransformed1, 'Correctly tranformed simple search query');
                same(sakai.api.Server.createSearchString(simpleSearch2), simpleSearchTransformed2, 'Correctly tranformed simple search query');
                start();
            });

            asyncTest('Advanced Searches', 5, function() {
                same(sakai.api.Server.createSearchString(advancedSearch), advancedSearch, 'Correctly left advanced search query alone');
                same(sakai.api.Server.createSearchString(advancedSearch1), advancedSearchTransformed1, 'Correctly left advanced search query alone');
                same(sakai.api.Server.createSearchString(advancedSearch2), advancedSearch2, 'Correctly left advanced search query alone');
                same(sakai.api.Server.createSearchString(advancedSearch3), advancedSearch3, 'Correctly left advanced search query alone');
                same(sakai.api.Server.createSearchString(advancedSearch4), advancedSearch4, 'Correctly left advanced search query alone');
                start();
            });
        };

        var startTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            SearchTest();
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            startTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                startTest();
            });
        }

    }
);
