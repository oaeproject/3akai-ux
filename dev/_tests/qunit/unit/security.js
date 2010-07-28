module("Security");

(function(){

/*
 * Test the escape HTML function
 */

test("Escape HTML", function(){

    var htmlString = "<a href='http://www.google.com'>Advertising my script enabled site with redirect</a>";
    var escapedExpected = "&lt;a href='http://www.google.com'&gt;Advertising my script enabled site with redirect&lt;/a&gt;";

    htmlString = sakai.api.Security.escapeHTML(htmlString);
    equals(htmlString, escapedExpected, "The escaped string is correct");

});

})();