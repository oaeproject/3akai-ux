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

    //check for the last item in the array
    index = dummyArray.indexOf("cherry");
    same(index, dummyArray.length - 1, "Finding last item");

    //check for unknown item
    index = dummyArray.indexOf("foo");
    same(index, -1, "Not finding unknown item");

};

/**
 * Run a test
 */
test("Get the first occurence of an item in an array", function(){
    //test to see if the custom index of works correctly
    testCustomIndexOf();
});