module("TemplateRenderer");
var container = "<div id='dummyContainer'><div id='dummyDiv'></div><div id='dummyTemplate'><!--${all}--></div></div>";
var dummyText = "Hello World";

/**
 * Create a dummy container with a output div and a template div
 */
var createDummyDivs = function(){
    $("body").append(container);
}

/**
 * Remove the dummy container and all its children
 */
var removeDummyDivs = function(){
    $("#dummyContainer").remove();
}

/**
 * Check the data in the div with what we have entered
 */
var findDummyData = function(){

    //get the data out of the dummy div
    var data = $("#dummyDiv").html();

    //check if the data in the div is the same as the dummyText
    same(data,dummyText,"Checking the parsed template for correct data");

    //remove all dummy divs
    removeDummyDivs();

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
 * Run test
 */
test("TemplateRenderer:", function(){
    //create a div and a template
    createDummyDivs();

    //render the template
    testTemplateRenderer();
});