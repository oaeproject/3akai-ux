(function($){

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

})(jQuery);