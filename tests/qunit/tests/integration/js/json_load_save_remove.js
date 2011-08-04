require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../tests/qunit/js/qunit.js",
    "../../../../tests/qunit/js/sakai_qunit_lib.js"
    ], 
    function($, sakai) {
    
    require.ready(function() {
        

        module("JSON - load / save & remove");

        var testJSON = {
            "boolean": true,
            "integer": 1,
            "string": "value",
            "array_empty": [],
            "array_singlestring": {
                "items": ["asdasd"]
            },
            "array_object": [{
                "key1": "value1",
                "key2": "value2",
                "key3": "value3"
            }, {
                "key4": "value4",
                "key5": "value5",
                "key6": "value6"
            }, {
                "key7": "value7"
            }, {
                "key8": [{
                    "key9": "value9",
                    "key10": "value10"
                }, {
                    "key11": "value11",
                    "key12": "value12"
                }, {
                    "key13": "value13",
                    "key14": [{
                        "key15": "value15",
                        "key16": "value16"
                    }]
                }]
            }],
            "array_string": ["value1", "value2", "value3", "value4", "value5"],
            "array_int": [1, 2, 3, 4, 5],
            "array_boolean": [true, false, true, true, false]
        };
        var testJSON2 = {
            "columns": {
                "column1": [{
                    "name": "myfriends",
                    "visible": "block",
                    "uid": "id4299438144022"
                }],
                "column2": [{
                    "name": "myprofile",
                    "visible": "block",
                    "uid": "id8955496030554"
                }, {
                    "name": "sites",
                    "visible": "block",
                    "uid": "id4199484876783"
                }]
            },
            "layout": "dev"
        };
        // We use this to check whether a value can be changed correctly
        var testJSON3 = $.extend(true, {}, testJSON2);
        testJSON3.layout = "threecolumn";

        var testURL = "/~admin/public/test";
        var testURL2 = "/~admin/public/test2";

        var testCallbackCount = 0;

        var testCallback = function(){
            if (testCallbackCount === 1) {
                ok(true, "The callback function was successfully invoked");
            }
            else {
                ok(false, "The callback function was not invoked");
            }
        };

        sakai_global.qunit.loginWithAdmin();

        asyncTest("Save a JSON file - big structure", function(){
            sakai.api.Server.saveJSON(testURL, testJSON, function(success, data) {
                ok(success, "JSON File Saved");
                start();
            });
        });
        asyncTest("Save a JSON file - my_sakai example", function(){
            sakai.api.Server.saveJSON(testURL2, testJSON2, function(success, data) {
                ok(success, "JSON File Saved");
                start();
            });
        });
        asyncTest("Save a JSON file - my_sakai example - changed", function(){
            sakai.api.Server.saveJSON(testURL2, testJSON3, function(success, data) {
                ok(success, "JSON File Saved");
                start();
            });
        });
        test("Save a JSON file - bad parameters", function(){

            testCallbackCount = 0;

            sakai.api.Server.saveJSON(true, false, function(){
                testCallbackCount++;
            });

            testCallback();
        });

        var load = function(url, json){

            var loadCallback = function(success, data){
                data = sakai.api.Server.removeServerCreatedObjects(data, ["_", "jcr:"]);
                same(data, json, "The saved JSON is the same as the loaded JSON");
                start();
            };

            sakai.api.Server.loadJSON(url, loadCallback);
        };

        asyncTest("Load a JSON file - big structure", function(){
            load(testURL, testJSON);
        });
        asyncTest("Load a JSON file - my_sakai example - changed", function(){
            load(testURL2, testJSON3);
        });
        test("Load a JSON file - bad parameters", function(){

            testCallbackCount = 0;

            sakai.api.Server.loadJSON(false, function(){
                testCallbackCount++;
            });

            testCallback();
        });

        var remove = function(url){
            var removeCallback = function(success, data){
                //same(data, testJSON, "The saved JSON is the same as the loaded JSON");
                if (success) {
                    ok(true, "Successfuly deleted JSON object");
                }
                else {
                    ok(false, "Could not delete the JSON object");
                }
                start();
            };

            sakai.api.Server.removeJSON(url, removeCallback);

        };
        asyncTest("Remove a JSON file - big structure", function(){
            remove(testURL);
        });
        asyncTest("Remove a JSON file - my_sakai example", function(){
            remove(testURL2);
        });

        test("Remove a JSON file - bad parameters", function(){

            testCallbackCount = 0;

            sakai.api.Server.removeJSON(false, function(){
                testCallbackCount++;
            });

            testCallback();
        });
    });
});
