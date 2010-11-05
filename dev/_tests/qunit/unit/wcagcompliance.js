module("WCAG 2.0 Compliance");

(function(){

var checkElementText = function(element){
    var hasText = false;
    for (var i = 0; i < element.childNodes.length; i++) {
        if ($(element.childNodes[i]).clone().find("*").remove().end().text()) {
            return true;
        } else if (element.childNodes[i].firstChild) {
            if (checkElementText()){
                hasText = true;
            }
        }
    }
    return hasText;
}

var checkChildElements = function(element, page, template){
    if (element.firstChild) { // check for children elements
        var child = element.firstChild;

        while (child) { // check child elements
            if (child.nodeType === 8 && child.parentNode.nodeName.toLowerCase() === "div") { // if comment node is in a div its probably a javascript template
                var trimPathTemplate = document.createElement('div');
                trimPathTemplate.innerHTML = child.data;
                checkChildElements(trimPathTemplate, page, true);
            }
            if (child.nodeType === 1) { // if html element
                var previousImg = false;
                if (child.previousSibling && $(child).prev().context.nodeName.toLowerCase() === "img") {
                    previousImg = true;
                }

                var errorString = "";
                var pass = true;
                var testNodeName = child.nodeName.toLowerCase();

                var hasAlt = false;
                var hasTitle = false;
                var hasText = false;
                var hasChild = false;
                var hasElements = false;

                if ($(child).attr("alt"))
                    hasAlt = true;
                if ($(child).attr("title"))
                    hasTitle = true;
                if ($(child).clone().find("*").remove().end().text())
                    hasText = true;
                if (child.firstChild)
                    hasChild = true;

                if (testNodeName === "img"){
                    errorString = "IMG tag missing ";
                    if (!hasAlt && !previousImg) {
                        errorString = errorString + "ALT attribute, ";
                        pass = false;
                    }
                } else if (testNodeName === "applet"){
                    errorString = "APPLET tag missing ";
                    if (!hasAlt) {
                        errorString = errorString + "ALT attribute, ";
                        pass = false;
                    }
                } else if (testNodeName === "object"){
                    errorString = "OBJECT tag missing ";
                    if (!hasChild) {
                        errorString = errorString + "body, ";
                        pass = false;
                    }
                } else if (testNodeName === "area"){
                    errorString = "AREA tag missing ";
                    if (!hasAlt) {
                        errorString = errorString + "ALT attribute, ";
                        pass = false;
                    }
                } else if (testNodeName === "abbr"){
                    errorString = "ABBR tag missing ";
                    if (!hasTitle) {
                        errorString = errorString + "TITLE attribute, ";
                        pass = false;
                    }
                } else if (testNodeName === "a"){
                    var hasChildText = false;
                    for (var i = 0; i < child.childNodes.length; i++) {
                        if (child.childNodes[i].nodeName.toLowerCase() === "img" && $(child.childNodes[i]).attr("alt")) {
                            hasChildText = true;
                        } else if (checkElementText(child.childNodes[i])) {
                            hasChildText = true;
                        }
                    }
                    errorString = "A tag missing ";
                    if (!hasText && !hasChildText) {
                        errorString = errorString + "link text or IMG ALT attribute, ";
                        pass = false;
                    }
                }

                if (!pass) {
                    errorString = errorString + " String: " + $(child).clone().wrapAll("<div/>").parent().html();
                    ok(false, "Page: " + page + ", Error: " + errorString);
                }

                checkChildElements(child, page, template);
            }
        child = child.nextSibling;
        }
    }
};

/**
 * Check HTML pages and test for hard coded english
 */
var testInternationalisation = function(){
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
        "/dev/s23/s23_site.html"
    ];

    for (var i in Widgets.widgets) {
        if (Widgets.widgets.hasOwnProperty(i) && Widgets.widgets[i].url) {
            pageArray.push(Widgets.widgets[i].url);
        }
    }

    for (var i = 0; i < pageArray.length; i++) {
        var url = pageArray[i];
        $.ajax({
            url: url,
            async: false,
            success: function(data){
                var div = document.createElement('div');
                div.innerHTML = data;
                checkChildElements(div, url, false);
            }
        });
    }
};

/**
 * Run a test
 */
test("Test for WCAG 2.0 Compliance - 1.1.1 Non-text Content / Text Alternatives", function(){
    testInternationalisation();
});

})();