module("JCR Removal");

var dummyObject = {
    "name":"dummy",
    "version":"dummy version",
    "jcr:primaryType":"dummy primary type",
    "jcr:created":"dummy created",
    "jcr:createdBy":"dummy createdby",
    "jcr:mixinTypes":"dummy mixin type"
};

/**
 * Test if the indexof returns the expected index
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
    start();
};

/**
 * Run an asynchronous test
 */
test("JCR Removal: test the removal of jcr objects in a json object", function(){
    //send a message
    testJCRRemoval();
});