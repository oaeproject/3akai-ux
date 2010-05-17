module("TemplateRenderer");

var dummyText = "Hello World";

/**
 * Check the data in the div with what we have entered
 */
var findDummyData = function(){

    //get the data out of the dummy div
    var data = $("#dummyDiv").html();

    //check if the data in the div is the same as the dummyText
    same(data,dummyText,"Checking the parsed template for correct data");

    //start the next test
    start();
}

/**
 * Render the template with some dummy data
 */
var testTemplateRenderer = function(){

    //create an object with dummy data
    var dummyData = {
        "all":dummyText
    }

    //Render the template with data
    $.TemplateRenderer("dummyTemplate",dummyData,$("#dummyDiv"));

    //check if the rendering happened correctly
    findDummyData();
}

/**
 * Run an asynchronous test
 */
asyncTest("TemplateRenderer:", function(){
    //render the template
    testTemplateRenderer();
});