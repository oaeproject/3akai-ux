module("FormToJSON");

/**
 * Test if the indexof returns the expected index
 */
var testFormToJSON = function(){

    //
	var data = sakai.api.UI.Forms.form2json($("#dummyForm"));

    //check if it is the same as expected
	var counter = 0;
    for(d in data) counter++;
    same(counter,5, "Check that there are five fields");
    ok(data.color,"The object contains a color property");
    ok(data.description,"The object contains a description property");
    ok(data.gender,"The object contains a gender property");
    ok(data.shape,"The object contains a shape property");
    ok(data.name,"The object contains a name property");
    start();
}

/**
 * Run an asynchronous test
 */
asyncTest("FormToJSON: Convert the values of a form to a json object", function(){
    //send a message
	testFormToJSON();
});

