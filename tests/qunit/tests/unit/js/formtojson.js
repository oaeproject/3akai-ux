require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ], 
    function($, sakai) {

    module('Forms');

    var FormTest = function() {

        asyncTest('Convert the values of a form to a json object', function(){
            //get the data of a form, converted into a json object
            var data = $('#dummyForm').serializeObject();
    
            //check if it is the same as expected
            var counter = 0;
            for(var d in data){
                if(data.hasOwnProperty(d)){
                    counter++;
                }
            }
            same(counter,5, 'Check that there are five fields');
            same(data.color,'green','The object contains a color property');
            same(data.description,'Demo text area','The object contains a description property');
            same(data.gender,'female','The object contains a gender property');
            same(data.shape,'circle','The object contains a shape property');
            same(data.name,'john doe','The object contains a name property');
            start();
        });
    
        asyncTest('Resetting the form', function(){
            //reset the form
            var result = $('#dummyForm').clearForm();
    
            //check the fields to be empty/unselected
            same($('input[name="name"]').val(),'','Reset the "name" field.');
            $('input[name="gender"]').each(function(){
                same($(this).attr('checked'),undefined,'Reset the "'+$(this).val()+'" field.');
            });
            $('input[name="color"]').each(function(){
                same($(this).attr('checked'),undefined,'Reset the "'+$(this).val()+'" checkbox.');
            });
            same($('select[name="shape"] option:selected').val(),undefined,'Reset the "shape" field.');
            same($('textarea[name="description"]').val(),'','Reset the "description" field.');
            start();
        });

    };

    var startTest = function() {
        $(window).trigger('addlocalbinding.qunit.sakai');
        FormTest();
    };

    if (sakai_global.qunit && sakai_global.qunit.ready) {
        startTest();
    } else {
        $(window).bind('ready.qunit.sakai', function() {
            startTest();
        });
    }

});
