$(function() {
    var pageArray = ["/dev/my_sakai.html", "/dev/inbox.js", "/~user1", "/dev/directory.html", "/dev/profile_edit.html", "/dev/account_preferences.html", "/dev/search_people.html#q=*&facet=contacts"];
    var currentPage = "", activePage = "";
    $("table").tablesorter();
    var runProfiler = function(page) {
        console.log("starting profile on ", page);
        console.profile();
        $("#ifr").attr("src", page);
        $("#ifr").unbind("load");
        $("#ifr").bind("load", function() {
            // sometimes load event is fired twice, not sure why
            if (activePage === currentPage) {
                return;
            }
            activePage = currentPage;
            setTimeout(function() {
                console.profileEnd();
                var profile = fireunit.getProfile();
                var res = [];
                for (var i=0,j=profile.data.length; i<j; i++) {
                    var fn = profile.data[i];
                    if (fn.fileName.indexOf("jquery") === -1 && fn.fileName.indexOf("main.js") === -1 && fn.time > 50) {
                        res.push(fn);
                    }
                }
                for (var x=0,y=res.length; x<y; x++) {
                    var sfn = res[x];
                    $("table tbody").append("<tr><td>" + currentPage + "</td><td>" + sfn.name + "</td><td>" + sfn.fileName + "</td><td>" + sfn.calls + "</td><td>" + sfn.time + "</td><td>" + sfn.maxTime + "</td><td>" + sfn.avgTime + "</td></tr>");
                }
                $("table").trigger("update");
                currentPage = pageArray.pop();
                if (currentPage) {
                    runProfiler(currentPage);
                } else {
                    var sorting = [[4,1]]; 
                    $("table").trigger("sorton",[sorting]);
                }
            }, 10000);
        });
        
    };
    currentPage = pageArray.pop();
    runProfiler(currentPage);
});

