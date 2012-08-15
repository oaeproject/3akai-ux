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

        module('Arrays');

        var dummyArray = ['apple','pear','banana','cherry'];

        /**
         * Test if the indexof returns the expected index
         */
        var testCustomIndexOf = function() {
            asyncTest('Get the first occurence of an item in an array', function() {
                //in IE the indexOf function from sakai.api.core.js will be used
                var index = dummyArray.indexOf('pear');

                //check if it is the same as expected
                same(index, 1,'Finding the index of the item');

                //check for the last item in the array
                index = dummyArray.indexOf('cherry');
                same(index, dummyArray.length - 1, 'Finding last item');

                //check for unknown item
                index = dummyArray.indexOf('foo');
                same(index, -1, 'Not finding unknown item');
                start();
            });
        };

        var startTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            testCustomIndexOf();
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
