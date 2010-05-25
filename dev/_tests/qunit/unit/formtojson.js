module("FormToJSON");

var dummyForm = "<form action='javascript:;' id='dummyForm'>" +
                    "<input type='text' name='name' value='john doe'/>" +
                    "<input type='text' value='should not be saved'/>" +
                    "<input type='radio' checked='true' name='gender' value='male'/>" +
                    "<input type='radio' name='gender' value='female'/>" +
                    "<input type='checkbox' checked='true' name='color' value='red'/>" +
                    "<input type='checkbox' name='color' value='green'/>" +
                    "<input type='checkbox' name='color' value='blue'/>" +
                    "<select name='shape'>" +
                    "<option value='square'>Square</option>" +
                    "<option value='circle'>Circle</option>" +
                    "<option value='rectangle'>Rectangle</option>" +
                    "<textarea rows='10' cols='30' name='description'>Demo text area</textarea>" +
                    "</select>" +
                "</form>";

/**
 * Append a dummy form to the page
 */
var createDummyForm = function(){
    $("body").append(dummyForm);
}

/**
 * Remove the dummy form from the page
 */
var removeDummyForm = function(){
    $("#dummyForm").remove();
}

/**
 * Convert the form into a JSON string
 * Test if the form is converted correctly into a json string
 */
var testFormToJSON = function(){

    //get the data of a form, converted into a json object
    var data = sakai.api.UI.Forms.form2json($("#dummyForm"));

    //check if it is the same as expected
    var counter = 0;
    for(var d in data){
        if(data.hasOwnProperty(d)){
            counter++;
        }
    }
    same(counter,5, "Check that there are five fields");
    ok(data.color,"The object contains a color property");
    ok(data.description,"The object contains a description property");
    ok(data.gender,"The object contains a gender property");
    ok(data.shape,"The object contains a shape property");
    ok(data.name,"The object contains a name property");

    //remove the dummy form
    removeDummyForm();
    start();
};

/**
 * Run a test to check if the values from a form are converted into a json string correctly
 */
test("FormToJSON: Convert the values of a form to a json object", function(){
    //create dummy form
    createDummyForm();

    //convert the form into json
    testFormToJSON();
});