module("FormToJSON");

(function(){

var dummyForm = "<form action='javascript:;' id='dummyForm'>" +
                    "<input type='text' name='name' value='john doe'/>" +
                    "<input type='text' value='should not be saved'/>" +
                    "<input type='radio' name='gender' value='male'/>" +
                    "<input type='radio' checked='true' name='gender' value='female'/>" +
                    "<input type='checkbox' name='color' value='red'/>" +
                    "<input type='checkbox' checked='true' name='color' value='green'/>" +
                    "<input type='checkbox' name='color' value='blue'/>" +
                    "<select name='shape'>" +
                    "<option value='square'>Square</option>" +
                    "<option value='circle' selected='selected'>Circle</option>" +
                    "<option value='rectangle'>Rectangle</option>" +
                    "</select>" +
                    "<textarea rows='10' cols='30' name='description'>Demo text area</textarea>" +
                "</form>";

/**
 * Append a dummy form to the page
 */
var createDummyForm = function(){
    $("body").append(dummyForm);
};

/**
 * Remove the dummy form from the page
 */
var removeDummyForm = function(){
    $("#dummyForm").remove();
};

/**
 * Fill in a form with the data from a json string
 * @param {String} data JSON string containing the data to fill in the form 
 */
var jsonToForm = function(data){

    //fill the form
    result = sakai.api.UI.Forms.json2form($("#dummyForm"),data);

    //check the fields to contain the correct data
    same($("input[name=name]").val(),"john doe","Filled in the 'name' field.");
    same($("input[name=gender]:checked").val(),"female","Filled in the 'gender' field.");
    same($("input[name=color]:checked").val(),"green","Filled in the 'color' field.");
    same($("select[name=shape] option:selected").val(),"circle","Filled in the 'shape' field.");
    same($("textarea[name=description]").val(),"Demo text area","Filled in the 'description' field.");
};

/**
 * Reset all values from the form.
 */
var resetForm = function(){

    //reset the form
    var result = sakai.api.UI.Forms.resetForm($("#dummyForm"));

    //check the fields to be empty/unselected
    same($("input[name=name]").val(),"","Resetted the 'name' field.");
    $("input[name=gender]").each(function(){
        same($(this).attr("checked"),false,"Resetted the '"+$(this).val()+"' field.");
    });
    $("input[name=color]").each(function(){
        same($(this).attr("checked"),false,"Resetted the '"+$(this).val()+"' checkbox.");
    });
    same($("select[name=shape]").val(),"square","Resetted the 'shape' field.");
    same($("textarea[name=description]").val(),"","Resetted the 'description' field.");
};

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
    same(data.color[0],"green","The object contains a color property");
    same(data.description,"Demo text area","The object contains a description property");
    same(data.gender,"female","The object contains a gender property");
    same(data.shape,"circle","The object contains a shape property");
    same(data.name,"john doe","The object contains a name property");

    //reset the form
    resetForm();

    //convert the JSON back to a Form
    jsonToForm(data);

    //remove the dummy form
    removeDummyForm();
};

/**
 * Run a test to check if the values from a form are converted into a json string correctly
 */
test("Convert the values of a form to a json object", function(){
    //create dummy form
    createDummyForm();

    //convert the form into json
    testFormToJSON();
});

})();