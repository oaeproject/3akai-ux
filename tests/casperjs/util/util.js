/**
 * Takes a screenshot and stores it in tests/screenshots.
 * Incorporates an optional timeout of 1000ms to take page rendering into account.
 */
var takeScreenshot = function(timeout, callback) {
    var t = timeout ? 1000 : 1;
    casper.wait(t, function() {
        this.captureSelector('tests/casperjs/screenshots/' + testTime + '/' + new Date().getTime() + '.png', 'html');
        callback();
    });
};
