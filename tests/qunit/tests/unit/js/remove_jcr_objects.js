require(
    [
    "jquery",
    "sakai/sakai.api.core",
    "../../../../tests/qunit/js/qunit.js",
    "../../../../tests/qunit/js/sakai_qunit_lib.js"
    ], 
    function($, sakai) {

    require(["misc/domReady!"], function(doc) {

    module("Server Object Removal");

    var serverObject = {
        "name":"dummy",
        "version":"dummy version",
        "jcr:primaryType":"dummy primary type",
        "_created":"dummy created",
        "_createdBy":"dummy createdby",
        "jcr:mixinTypes":"dummy mixin type",
        "objects": {
            "jcr:object1": "object1",
            "object2": [
                "jcr:arrayVal1",
                "arrayVal2"
            ],
            "object3": "zzzz"
        },
        "arrayOfObjects": [
            {
                "jcr:nestedObj1": "nestedObj1"
            },
            {
                "jcr:nestedObj2": "nestedObj2"
            },
            {
                "nestedObj3": "nestedObj3"
            }
        ]
    };

    var cleanedObj = {
        "name":"dummy",
        "version":"dummy version",
        "objects": {
            "object2": [
                "jcr:arrayVal1",
                "arrayVal2"
            ],
            "object3": "zzzz"
        },
        "arrayOfObjects": [
            {},
            {},
            {
                "nestedObj3": "nestedObj3"
            }
        ]
    };

    /**
     * Test if the JCR objects are removed correctly from the object
     */
    var testJCRRemoval = function(){

        // remove all the jcr: and _-prefixed objects from the dummyobject
        var thisCleanedObj = sakai.api.Server.removeServerCreatedObjects(serverObject, ["_", "jcr:"]);

        same(thisCleanedObj, cleanedObj,"Checking if removal went well by checking amount of left properties");

    };

    /**
     * Run a test
     */
    test("Test the removal of jcr objects in a JSON object", function(){
        testJCRRemoval();
    });

    });
});
