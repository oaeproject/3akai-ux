var History = {
    prev_url : -1,

    history_change : function(e) {
        if (e === undefined) {
            return;
        }
        var url = e.fragment;
        if (url != History.prev_url){ // should be checking individual params, not just the string composition
            if (url){
                if (sakai.sitespages.openPageH) {
                    if ($.bbq.getState("page") === "") {
                        sakai.sitespages.openPageH(url);
                    } else {
                        sakai.sitespages.openPageH($.bbq.getState("page"));
                    }
                    History.prev_url = url;
                } else { // is hasn't loaded in yet, so lets try every 10ms, using the jQuery animate version of setTimeout
                    $('html').animate({ borderWidth:0},10, function() {
                        $(window).trigger('hashchange');
                    });
                }
            } else {
                sakai.sitespages.openPageH();
                History.prev_url = url;
            }
        }
    },

    addBEvent : function(page, url) {
        var state = {};
        state['page'] = page || "";
        $.bbq.pushState(state);
    }
};


$(function() {
    var cache = {
        '': $(".show")
    };

    $(window).bind('hashchange', function(e) {
        History.history_change(e);
    });

  //$(window).trigger('hashchange'); // don't need to trigger here, site.js does that for us when its ready
});