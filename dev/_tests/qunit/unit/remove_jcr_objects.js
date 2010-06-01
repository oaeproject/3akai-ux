module("JCR Removal");

(function(){

var dummyObject = {
    "name":"dummy",
    "version":"dummy version",
    "jcr:primaryType":"dummy primary type",
    "jcr:created":"dummy created",
    "jcr:createdBy":"dummy createdby",
    "jcr:mixinTypes":"dummy mixin type"
};

/**
 * Test if the JCR objects are removed correctly from the object
 */
var testJCRRemoval = function(){

    //remove all the jcr objects from the dummyobject
    sakai.api.Util.removeJCRObjects(dummyObject);

    //get the amount of properties
    var objCount=0;
    for(var p in dummyObject){
        if(dummyObject.hasOwnProperty(p)){
            objCount++;
        }
    }

    //check if it is the same as expected
    same(objCount, 2,"Checking if removal went well by checking amount of left properties");

};

/**
 * Run a test
 */
test("Test the removal of jcr objects in a JSON object", function(){
    testJCRRemoval();
});

})();