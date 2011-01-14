$(function() {
    var Y = YUI().use("profiler", function(Y){
        var profile = [
            {
                "namespace": ["sakai", "api", "Security"],
                "functions": ["saneHTML"]
            },
            {
                "namespace": ["sakai", "api", "Widgets", "widgetLoader"],
                "functions": ["loadWidgets"]
            },
            {
                "namespace": ["$"],
                "functions": ["TemplateRenderer", "trim", "curCSS", "parseJSON", "ajax"]
            },
            {
                "namespace": ["sakai", "api", "i18n", "General"],
                "functions": ["process", "getValueForKey"]
            }
        ];
        var allFns = [];
        $("#ifr").attr("src", "/dev/my_sakai.html");
        console.log($("#ifr")[0].contentWindow.document);
        $("#ifr").bind("load", function() {
            console.log("iframe loaded, attaching profilers");
            for (var i=0, j=profile.length; i<j; i++) {
                var ns = profile[i].namespace;
                var fns = profile[i].functions;

                // construct the namespace of the function properly
                var nsobj = $("#ifr")[0].contentWindow[ns[0]];
                for (var x=1, y=ns.length; x<y; x++) {
                    nsobj = nsobj[ns[x]];
                }
                // Register each function in this namespace to be profiled
                for (var k=0,l=fns.length; k<l; k++) {
                    Y.Profiler.registerFunction(fns[k], nsobj);
                    allFns.push(fns[k]);
                }
            }
            setTimeout(function() {
                // get the report for all the registered function
                var report = Y.Profiler.getFullReport();
                console.log(report);
            },5000);

        });
    });
});