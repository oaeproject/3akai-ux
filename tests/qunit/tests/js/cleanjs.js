require(
    [
        'oae.core',
        'qunitjs',
        'jquery',
        '../js/util.js',
        '../js/jshint.js'
    ], function(oae) {

        module("Clean JavaScript");

        var consoleregex = new RegExp(/console\.(?:log|warn|error|debug|trace)/g);
        var alertregex = new RegExp(/alert\([.\s\S]*\)/g);

        /**
         * Checks for console.log('') statements in the code
         * @param  {String}   file        The contents of the file in the form of a string
         * @param  {String}   filename    The path to the file
         */
        var checkForConsoleLog = function(file, filename) {
            var matches = consoleregex.exec(file);
            if (matches && matches.length) {
                for (var i=0,j=matches.length; i<j; i++) {
                    ok(false, 'found console.(log|warn|error|debug|trace)');
                }
            } else {
                ok(true, 'No console.(log|warn|error|debug|trace) calls');
            }
        };

        /**
         * Checks for alert() statements in the code
         * @param  {String}   file    The contents of the file in the form of a string
         */
        var checkForAlert = function(file) {
            var matches = alertregex.exec(file);
            if (matches && matches.length) {
                for (var i=0,j=matches.length; i<j; i++) {
                    ok(false, 'found alert()');
                }
            } else {
                ok(true, 'No alert() found');
            }
        };

        /**
         * Runs the file through JSHint
         * @param  {String}     file        The contents of the file in the form of a string
         * @param  {Function}   callback    Function executed after checking for JSHint errors is complete
         */
        var JSHintfile = function(data, callback) {
            var result = JSHINT(data, {
                // http://www.jshint.com/options/
                sub:true // ignore dot notation recommendations - ie ['userid'] should be .userid
            });
            if (result) {
                ok(result, 'JSHint clean');
            } else {
                for (var i=0,j=JSHINT.errors.length; i<j; i++) {
                    var error = JSHINT.errors[i];
                    if (error) {
                        console.log(error);
                        ok(false, 'JSHint error on line ' + error.line + ' character ' + error.character + ': ' + error.reason + ', ' + error.evidence);
                    }
                }
            }
            callback();
        };

        /**
         * Creates an asynchronous test and calls checks for console.log(), alert() and JSHint errors
         * @param  {String}    filename    The path to the file
         */
        var makeCleanJSTest = function(filename) {
            asyncTest(filename, function() {
                $.ajax({
                    dataType: 'text',
                    url: filename,
                    success: function(data) {
                        checkForConsoleLog(data, filename);
                        checkForAlert(data);
                        JSHintfile(data, function() {
                            start();
                        });
                    }
                });
            });
        };

        /**
         * Initializes the clean JS Test module
         * @param  {Object}   widgets    Object containing the manifests of all widgets in node_modules/oae-core.
         */
        var cleanJSTest = function(widgets) {
            QUnit.load();
            $.each(widgets, function(i, widget) {
                makeCleanJSTest('/node_modules/oae-core/' + widget.id + '/js/' + widget.id + '.js');
            });
        };

        $(window).on('widgetsdone.qunit.oae', function(ev, widgets) {
            cleanJSTest(widgets);
        });
    }
);
