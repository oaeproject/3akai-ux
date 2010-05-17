module("Arrays");

var dummyArray = ["apple","pear","banana","cherry"];

/**
 * Test if the indexof returns the expected index
 */
var testCustomIndexOf = function(){

    //in IE the indexOf function from sakai_magic will be used
    var index = dummyArray.indexOf("pear");

    //check if it is the same as expected
    same(index, 1,"Finding the index of the item");
    start();
}

/**
 * Run an asynchronous test
 */
asyncTest("Arrays: Get the first occurence of an item in an array", function(){
    //send a message
	testCustomIndexOf();
});