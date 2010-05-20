module("StripTags");

var dummyHTML = "Just some <div id='demo'>data<span> to </span></div>strip";

var testStripTags = function(){
    var returned = $("<div>"+dummyHTML+"</div>").text();
    //var returned = $(dummyHTML).text();
    var expected = "Just some data to strip";
    same(returned, expected, "Checking if JQuery text strips tags correctly");
};

test("Test the strip tags method from JQuery", function(){
    testStripTags();
});