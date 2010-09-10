var History = {
    prev_url : -1,
    
    history_change : function(e) {
        if (e == undefined) return;
        var url = e.fragment;
        if (url != History.prev_url){ // should be checking individual params, not just the string composition
            if (url){
                if (sakai._search.doSearch) {
                  sakai._search.doSearch($.bbq.getState('page'), $.bbq.getState('q'), $.bbq.getState('filter'));
                  History.prev_url = url;
                } else { // is hasn't loaded in yet, so lets try every 10ms, using the jQuery animate version of setTimeout
                  $('html').animate({ borderWidth:0},10, function() { 
                    $(window).trigger('hashchange');
                  });
                }
            } else {
                if (sakai._search.reset) {
                  sakai._search.reset();
                  History.prev_url = url;
                } else { 
                  $('html').animate({ borderWidth:0},10, function() { 
                    $(window).trigger('hashchange');
                  }); 
                }
            }
        }
    },
    
    addBEvent : function(page, query, filter) {
      var state = {};
      state['q'] = query;
      state['filter'] = filter || "";
      state['page'] = page || "1";
      $.bbq.pushState(state);
    }

}

$(function() {
  var cache = {
    '': $(".search-container")
  };
  
  $(window).bind('hashchange', function(e) {
    History.history_change(e);
  });
  
  $(window).trigger('hashchange');
});