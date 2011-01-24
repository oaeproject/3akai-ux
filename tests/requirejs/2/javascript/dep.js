require([
    "jquery",
    "/tests/requirejs/2/javascript/core.js"], function() {
        console.log("here");
        require.ready(function(){
            console.log("ready");
        });
    }
);