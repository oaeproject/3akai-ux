require(
    [
    'jquery',
    'underscore',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ],
    function($, _, sakai) {

        module('JSON - load / save & remove');

        var testJSON = {
            'boolean': true,
            'integer': 1,
            'string': 'value',
            'array_singlestring': {
                'items': ['asdasd']
            },
            'array_object': [{
                'key1': 'value1',
                'key2': 'value2',
                'key3': 'value3'
            }, {
                'key4': 'value4',
                'key5': 'value5',
                'key6': 'value6'
            }, {
                'key7': 'value7'
            }, {
                'key8': [{
                    'key9': 'value9',
                    'key10': 'value10'
                }, {
                    'key11': 'value11',
                    'key12': 'value12'
                }, {
                    'key13': 'value13',
                    'key14': [{
                        'key15': 'value15',
                        'key16': 'value16'
                    }]
                }]
            }],
            'array_string': ['value1', 'value2', 'value3', 'value4', 'value5'],
            'array_int': [1, 2, 3, 4, 5],
            'array_boolean': [true, false, true, true, false]
        };
        var testJSON2 = {
            'columns': {
                'column1': [{
                    'name': 'myfriends',
                    'visible': 'block',
                    'uid': 'id4299438144022'
                }],
                'column2': [{
                    'name': 'myprofile',
                    'visible': 'block',
                    'uid': 'id8955496030554'
                }, {
                    'name': 'sites',
                    'visible': 'block',
                    'uid': 'id4199484876783'
                }]
            },
            'layout': 'dev'
        };
        // We use this to check whether a value can be changed correctly
        var testJSON3 = $.extend(true, {}, testJSON2);
        testJSON3.layout = 'threecolumn';

        var testURL = '/~admin/public/test';
        var testURL2 = '/~admin/public/test2';

        var testCallbackCount = 0;

        var testCallback = function() {
            if (testCallbackCount === 1) {
                ok(true, 'The callback function was successfully invoked');
            } else {
                ok(false, 'The callback function was not invoked');
            }
        };

        var load = function(url, json, callback) {
            var loadCallback = function(success, data) {
                data = sakai.api.Server.removeServerCreatedObjects(data, ['_', 'jcr:']);
                ok(_.isEqual(data, json), 'The saved JSON is the same as the loaded JSON');
                start();
                callback();
            };
            sakai.api.Server.loadJSON(url, loadCallback);
        };

        var remove = function(url, callback) {
            var removeCallback = function(success, data) {
                if (success) {
                    ok(true, 'Successfuly deleted JSON object');
                } else {
                    ok(false, 'Could not delete the JSON object');
                }
                start();
                callback();
            };
            sakai.api.Server.removeJSON(url, removeCallback);
        };

        var loadSaveRemoveTest = function() {
            $(window).trigger('addlocalbinding.qunit.sakai');
            sakai_global.qunit.loginWithAdmin();
            saveJSON1();
        };

        var saveJSON1 = function() {
            asyncTest('Save a JSON file - big structure', function() {
                sakai.api.Server.saveJSON(testURL, testJSON, function(success, data) {
                    ok(success, 'JSON File Saved');
                    start();
                    saveJSON2();
                });
            });
        };
        var saveJSON2 = function() {
            asyncTest('Save a JSON file - my_sakai example', function() {
                sakai.api.Server.saveJSON(testURL2, testJSON2, function(success, data) {
                    ok(success, 'JSON File Saved');
                    start();
                    saveJSON3();
                });
            });
        };
        var saveJSON3 = function() {
            asyncTest('Save a JSON file - my_sakai example - changed', function() {
                sakai.api.Server.saveJSON(testURL2, testJSON3, function(success, data) {
                    ok(success, 'JSON File Saved');
                    start();
                    saveJSON4();
                });
            });
        };
        var saveJSON4 = function() {
            asyncTest('Save a JSON file - bad parameters', function() {
                testCallbackCount = 0;
                sakai.api.Server.saveJSON(true, false, function() {
                    testCallbackCount++;
                });
                testCallback();
                start();
                loadJSON1();
            });
        };

        var loadJSON1 = function() {
            asyncTest('Load a JSON file - big structure', function() {
                load(testURL, testJSON, loadJSON2);
            });
        };
        var loadJSON2 = function() {
            asyncTest('Load a JSON file - my_sakai example - changed', function() {
                load(testURL2, testJSON3, loadJSON3);
            });
        };
        var loadJSON3 = function() {
            asyncTest('Load a JSON file - bad parameters', function() {
                testCallbackCount = 0;
                sakai.api.Server.loadJSON(false, function() {
                    testCallbackCount++;
                });
                testCallback();
                start();
                removeJSON1();
            });
        };

        var removeJSON1 = function() {
            asyncTest('Remove a JSON file - big structure', function() {
                remove(testURL, removeJSON2);
            });
        };
        var removeJSON2 = function() {
            asyncTest('Remove a JSON file - my_sakai example', function() {
                remove(testURL2, removeJSON3);
            });
        };
        var removeJSON3 = function() {
            asyncTest('Remove a JSON file - bad parameters', function() {
                testCallbackCount = 0;
                sakai.api.Server.removeJSON(false, function() {
                    testCallbackCount++;
                });
                testCallback();
                start();
            });
        };

        if (sakai_global.qunit && sakai_global.qunit.ready) {
            loadSaveRemoveTest();
        } else {
            $(window).on('ready.qunit.sakai', function() {
                loadSaveRemoveTest();
            });
        }

    }
);
