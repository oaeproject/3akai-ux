$(function() {
    var pageArray = [
        "/dev/my_sakai.html",
        "/dev/inbox.js",
        "/~user1",
        "/dev/directory.html",
        "/dev/profile_edit.html",
        "/dev/account_preferences.html",
        "/dev/search_people.html#q=*&facet=contacts",
        "http://localhost:8080/dev/search.html#q=user"
    ];

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
                    var data = $("table").html();
                    // POST results to the format_results_server
                    $.ajax({
                        url: "http://localhost:4567/",
                        type: "POST",
                        data: data,
                        contentType: "text/plain",
                        success: function(data) {
                            console.log("posted data successfully");
                        },
                        error: function() {
                            console.log("error posting data");
                        }
                    });
                }
            }, 10000);
        });
    };
    currentPage = pageArray.pop();
    runProfiler(currentPage);
});

