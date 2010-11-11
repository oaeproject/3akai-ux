module("WCAG 2.0 Compliance - 1.1.1 Non-text Content / Text Alternatives");

(function(){

var checkElements = function($elt){
    $.each($elt.find("img"), function(i, elt) {
        ok($(elt).attr("alt") || $(elt).prev('img').attr("src") === $(elt).attr("src"), "IMG tag has ALT attribute:" + $('<div/>').html(elt).html());
    });

    $.each($elt.find("applet"), function(i, elt) {
        ok($(elt).attr("alt"), "APPLET tag has ALT attribute: " + $('<div/>').html(elt).html());
    });

    $.each($elt.find("object"), function(i, elt) {
        ok($(elt).children().length > 0, "OBJECT tag has contents: " + $('<div/>').html(elt).html());
    });

    $.each($elt.find("area"), function(i, elt) {
        ok($(elt).attr("alt"), "AREA tag has ALT attribute: " + $('<div/>').html(elt).html());
    });

    $.each($elt.find("abbr"), function(i, elt) {
        ok($(elt).attr("title"), "ABBR tag has TITLE attribute: " + $('<div/>').html(elt).html());
    });

    $.each($elt.find("a"), function(i, elt) {
        ok($(elt).text() || $(elt).find("*").text(), "A tag has text or children that have text: " + $('<div/>').html(elt).html());
    });
};

/**
 * Check HTML pages and test for WCAG compliance
 */
var testWCAGCompliance = function(){
    var pageArray = ["/dev/403.html",
        "/dev/404.html",
        "/dev/500.html",
        "/dev/account_preferences.html",
        "/dev/acknowledgements.html",
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
        "/dev/s23/s23_site.html",
        "/dev/admin/widgets.html"
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
                });
            }
        });
    }
};

/**
 * Run the test
 */
testWCAGCompliance();

})();