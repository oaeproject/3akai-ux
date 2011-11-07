require([
    "jquery",
    "/tests/requirejs/2/javascript/core.js"], function() {
        console.log("here");
        require(["misc/domReady!"], function(doc){
            console.log("ready");
        });
    }
);