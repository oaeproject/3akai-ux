module("Internationalisation");

(function(){

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
                var tagText = $(child).clone().find("*").remove().end().text();

                // check title and alt attributes, and text within the tag
                // there is an issue getting tag attributes from javascript templates if it contains double quotes within template brackets, these will fail the unit test
                var titleText = $(child).attr("title");
                var valueText = $(child).attr("value");
                var altText = $(child).attr("alt");
                var alpha = new RegExp("^(.*)[a-zA-z](.*)+$");
                var regex = new RegExp("__MSG__(.*?)__");
                var templateRegex = new RegExp("^(.*?)(\\$*){(.*?)}(.*?)+$");
                var templateStartAlphaRegex = new RegExp("^([a-zA-z]+)(\\$*){(.*?)}+$");
                var templateMiddleAlphaRegex = new RegExp("^(\\$*){(.*?)}([a-zA-z]+)(\\$*){(.*?)}+$");
                var templateEndAlphaRegex = new RegExp("^(\\$*){(.*?)}([a-zA-z])+$");

                if (tagText) {
                    tagTextTest = tagText.replace(/\s+/g,'');
                    if (regex.test(tagTextTest) && tagTextTest.length > 0) {
                        //ok(true, "Page: " + page + ", String: " + tagText);
                    } else if (templateRegex.test(tagTextTest) && !(regex.test(tagTextTest) || templateStartAlphaRegex.test(tagTextTest) || templateEndAlphaRegex.test(tagTextTest) || templateMiddleAlphaRegex.test(tagTextTest)) && tagTextTest.length > 0 && template){
                        //ok(true, "Page: " + page + ", String: " + tagText);
                    } else if (alpha.test(tagTextTest) && tagTextTest.length > 0) {
                        ok(false, "Page: " + page + ", String: " + tagText);
                    }
                }
                if (titleText) {
                    titleTextTest = titleText.replace(/\s+/g,'');
                    if (regex.test(titleTextTest)){
                        //ok(true, "Page: " + page + ", String: " + titleText);
                    } else if (templateRegex.test(titleTextTest) && !(regex.test(titleTextTest) || templateStartAlphaRegex.test(titleTextTest) || templateEndAlphaRegex.test(titleTextTest) || templateMiddleAlphaRegex.test(titleTextTest)) && titleTextTest.length > 0 && template){
                        //ok(true, "Page: " + page + ", String: " + titleText);
                    } else if (alpha.test(titleTextTest)){
                        ok(false, "Page: " + page + ", String: " + titleText);
                    }
                }
                /*if (valueText) {
                    if (typeof(valueText) !== "string") {
                        valueText = valueText.toString();
                    }
                    valueTextTest = valueText.replace(/\s+/g,'');
                    if (regex.test(valueTextTest)){
                        ok(true, "Page: " + page + ", String: " + valueText);
                    } else if (templateRegex.test(valueTextTest) && !(regex.test(valueTextTest) || templateStartAlphaRegex.test(valueTextTest) || templateEndAlphaRegex.test(valueTextTest) || templateMiddleAlphaRegex.test(valueTextTest)) && valueTextTest.length > 0 && template){
                        ok(true, "Page: " + page + ", String: " + valueText);
                    } else if (alpha.test(valueTextTest)){
                        ok(false, "Page: " + page + ", String: " + valueText);
                    }
                }*/
                if (altText) {
                    altTextTest = altText.replace(/\s+/g,'');
                    if (regex.test(altTextTest)) {
                        //ok(true, "Page: " + page + ", String: " + altText);
                    } else if (templateRegex.test(altTextTest) && !(regex.test(altTextTest) || templateStartAlphaRegex.test(altTextTest) || templateEndAlphaRegex.test(altTextTest) || templateMiddleAlphaRegex.test(altTextTest)) && altTextTest.length > 0 && template) {
                        //ok(true, "Page: " + page + ", String: " + altText);
                    } else if (alpha.test(altTextTest)) {
                        ok(false, "Page: " + page + ", String: " + altText);
                    }
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
        "/dev/s23/s23_site.html",
        "/devwidgets/addcontent/addcontent.html",
        "/devwidgets/addtocontacts/addtocontacts.html",
        "/devwidgets/basiclti/basiclti.html",
        "/devwidgets/captcha/captcha.html",
        "/devwidgets/changepic/changepic.html",
        "/devwidgets/chat/chat.html",
        "/devwidgets/collections/collections.html",
        "/devwidgets/comments/comments.html",
        "/devwidgets/contentprofilebasicinfo/contentprofilebasicinfo.html",
        "/devwidgets/contentprofilefiledetails/contentprofilefiledetails.html",
        "/devwidgets/creategroup/creategroup.html",
        "/devwidgets/createpage/createpage.html",
        "/devwidgets/createsite/createsite.html",
        "/devwidgets/dashboard/dashboard.html",
        "/devwidgets/deletecontent/deletecontent.html",
        "/devwidgets/discussion/discussion.html",
        "/devwidgets/embedcontent/embedcontent.html",
        "/devwidgets/entity/entity.html",
        "/devwidgets/faceted/faceted.html",
        "/devwidgets/filerevisions/filerevisions.html",
        "/devwidgets/fileupload/fileupload.html",
        "/devwidgets/footer/footer.html",
        "/devwidgets/ggadget/ggadget.html",
        "/devwidgets/googlemaps/googlemaps.html",
        "/devwidgets/googlemaps/map.html",
        "/devwidgets/groupbasicinfo/groupbasicinfo.html",
        "/devwidgets/grouppermissions/grouppermissions.html",
        "/devwidgets/helloworld/helloworld.html",
        "/devwidgets/joinrequests/joinrequests.html",
        "/devwidgets/linktool/linktool.html",
        "/devwidgets/listgeneral/listgeneral.html",
        "/devwidgets/listpeople/listpeople.html",
        "/devwidgets/listpeoplewrappergroup/listpeoplewrappergroup.html",
        "/devwidgets/lists/lists.html",
        "/devwidgets/mycontacts/mycontacts.html",
        "/devwidgets/mycontent/mycontent.html",
        "/devwidgets/mygroups/mygroups.html",
        "/devwidgets/myprofile/myprofile.html",
        "/devwidgets/navigation/navigation.html",
        "/devwidgets/pickeradvanced/pickeradvanced.html",
        "/devwidgets/pickeruser/pickeruser.html",
        "/devwidgets/poll/poll.html",
        "/devwidgets/profilesection/profilesection.html",
        "/devwidgets/recentmessages/recentmessages.html",
        "/devwidgets/remotecontent/remotecontent.html",
        "/devwidgets/rss/rss.html",
        "/devwidgets/s23courses/s23courses.html",
        "/devwidgets/sakai2tools/sakai2tools.html",
        "/devwidgets/sendmessage/sendmessage.html",
        "/devwidgets/sitemembers/sitemembers.html",
        "/devwidgets/siterecentactivity/siterecentactivity.html",
        "/devwidgets/sites/sites.html",
        "/devwidgets/sitespages/sitespages.html",
        "/devwidgets/topnavigation/topnavigation.html",
        "/devwidgets/uploadcontent/uploadcontent.html",
        "/devwidgets/userprofile/userprofile.html",
        "/devwidgets/video/video.html"
    ];

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
test("Test for hard coded text in the HTML pages", function(){
    testInternationalisation();
});

})();