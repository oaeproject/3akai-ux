module("Shorten String");

var dummyString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In orci nibh, venenatis id aliquam vitae, porttitor quis lacus.";

/**
 * Test if the shortenstring method returns what we expect
 */
var testShortenString = function(){

    //apply the shortenString method to show only the first 30 chars
    var newString = sakai.api.Util.shortenString(dummyString,30);

    //we expect 33 chars (30 + 3 dots)
    same(newString.length,33, "Checking the length of the shortened string");
    ok(newString.match("\.\.\.$"),"The string ends with three dots");
    start();
}

test("Shorten String: Send message to one person", function(){
    //shorten a string
    testShortenString();
});