(function($, sakai) {

/**
 * Handle the sakai-qunit-done event
 * This is verbose, but its here for now in case we 
 * need to use this event on an individual test page in the future
 */
$(window).bind('sakai-qunit-done', function(e, obj) {
    // trigger this event in the parent document
    if (parent && $(parent.document).length) {
        parent.$(parent.document).trigger("sakai-qunit-done", obj);
    }
});

/**
 * QUnit calls this function when it has completed all of its tests
 * We simply define the function and it gets called
 */
QUnit.done = function(failures, total) {
    var location = window.location.href.split('/');
    location = "tests/" + location[location.length-1];
    $(window).trigger('sakai-qunit-done', {url: location, failures:failures, total:total});
};

/**
 * Define all the Javascript and HTML files to test
 * Anytime a new file is added, it should be added to this list
 *
 * TODO: generate this automatically via the ant build
 */
sakai.qunit = {};
sakai.qunit.jsFiles = [
    "/dev/javascript/account_preferences.js",
    "/dev/javascript/content_profile.js",
    "/dev/javascript/createnewaccount.js",
    "/dev/javascript/directory.js",
    "/dev/javascript/group.js",
    "/dev/javascript/group_edit.js",
    "/dev/javascript/inbox.js",
    "/dev/javascript/index.js",
    "/dev/javascript/logout.js",
    "/dev/javascript/mysakai.js",
    "/dev/javascript/people.js",
    "/dev/javascript/profile_edit.js",
    "/dev/javascript/sakai.403.js",
    "/dev/javascript/sakai.404.js",
    "/dev/javascript/sakai.500.js",
    "/dev/javascript/search.js",
    "/dev/javascript/search_content.js",
    "/dev/javascript/search_groups.js",
    "/dev/javascript/search_main.js",
    "/dev/javascript/search_people.js",
    "/dev/javascript/show.js",
    "/dev/javascript/_history/search_history.js",
    "/dev/javascript/_history/site_history.js",
    "/dev/lib/sakai_util/sakai_magic.js",
    "/dev/s23/javascript/s23_site.js",
    "/dev/admin/javascript/admin_widgets.js",
    "/dev/configuration/config.js",
    "/dev/configuration/config_custom.js",
    "/dev/configuration/widgets.js"
];
sakai.qunit.htmlFiles = [
    "/dev/403.html",
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
// Add all the widgets in
for (var x in sakai.widgets.widgets) {
    if (sakai.widgets.widgets.hasOwnProperty(x) && sakai.widgets.widgets[x].url) {
        sakai.qunit.jsFiles.push("/devwidgets/" + x + "/javascript/" + x + ".js");
        sakai.qunit.htmlFiles.push(sakai.widgets.widgets[x].url);
    }
}
})(jQuery, sakai);
