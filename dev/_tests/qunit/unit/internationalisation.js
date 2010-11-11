module("Internationalization");

(function(){

// attributes to test for
var attrs = ["alt", "title"];

// the regexes
var alpha = new RegExp("^(.*)[a-zA-z](.*)+$");
var regex = new RegExp("__MSG__(.*?)__");
var templateRegex = new RegExp("^(.*?)(\\$*){(.*?)}(.*?)+$");
var templateStartAlphaRegex = new RegExp("^([a-zA-z]+)(\\$*){(.*?)}+$");
var templateMiddleAlphaRegex = new RegExp("^(\\$*){(.*?)}([a-zA-z]+)(\\$*){(.*?)}+$");
var templateEndAlphaRegex = new RegExp("^(\\$*){(.*?)}([a-zA-z])+$");

/**
 * Test a string to make sure it is not a plain-text, non-internationalized string
 *
 * @param {String} str the string to test
 * @return {Boolean} true if the string is internationalized or a number, false otherwise
 */
var testString = function(str) {
    return (
                (
                    regex.test(str) ||
                    (
                        templateRegex(str) &&
                        !(
                            regex.test(str) ||
                            templateStartAlphaRegex.test(str) ||
                            templateEndAlphaRegex.test(str) ||
                            templateMiddleAlphaRegex.test(str)
                        )
                    )
                ) ||
                !alpha.test(str) // allow numbers to be non-internationalized
            );
};

/**
 * Check the element against the global array of attributes for internationalized strings
 *
 * @param {jQuery} $elt The element to check for attributes (and all its children)
 */
var checkAttrs = function($elt) {
    $.each(attrs, function(i, val) {
        // grab any element with the attribute, and filter out any empties
        $.each($elt.find("*[" + val + "]").filter(function(index) {
            return $(this).attr(val).trim() !== "";
        }), function(j,elt) {
            var attrText = $(elt).attr(val).trim();
            ok(testString(attrText) , val.toUpperCase() + " Text: " + attrText);
        });
    });
};

/**
 * Check the element's text for internationalized strings
 *
 * @param {jQuery} $elt The element to check (and all its children)
 */
var checkElements = function($elt){
    // check all elements with no children that have text, filtering out any empties (post-trim)
    $.each($elt.find("*:not(:empty)").filter(function(index){
        return $(this).children().length === 0 && $(this).text().trim() !== "";
    }), function(i,elt) {
        var tagText = $(elt).text().trim();
        ok(testString(tagText) , "String: " + tagText);
    });
};

/**
 * Check HTML pages and test for hard coded english
 */
var testInternationalization = function(){
    var pageArray = ["/dev/403.html",
        "/dev/404.html",
        "/dev/500.html",
        "/dev/account_preferences.html",
        "/dev/acknowledgements.html",
        "/dev/admin_widgets.html",
        "/dev/content_profile.html",
        "/dev/create_new_account.html",
        "/dev/directory.html",
        "/dev/group_edit.html",
        "/dev/inbox.html",
        "/dev/index.html",
        "/dev/logout.html",
        "/dev/my_sakai.html",
        "/dev/people.html",
        "/dev/profile_edit.html",
        "/dev/search.html",
        "/dev/search_content.html",
        "/dev/search_groups.html",
        "/dev/search_people.html",
        "/dev/show.html",
        "/dev/s23/s23_site.html"
    ];

    for (var i in Widgets.widgets) {
        if (Widgets.widgets.hasOwnProperty(i) && Widgets.widgets[i].url) {
            pageArray.push(Widgets.widgets[i].url);
        }
    }


    for (var j = 0; j < pageArray.length; j++) {
        var urlToCheck = pageArray[j];
        $.ajax({
            url: urlToCheck,
            async: false,
            success: function(data){
                var div = document.createElement('div');
                div.innerHTML = data;
                test(urlToCheck, function() {
                    checkElements($(div));
                    checkAttrs($(div));
                });
            }
        });
    }
};

/**
 * Run the test
 */
testInternationalization();

})();