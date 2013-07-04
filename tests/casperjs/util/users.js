casper.echo('user util included');

var utilCalled = false;

var userUtil = function(callback) {
    console.log(utilCalled);
    utilCalled = true;
    casper.echo('user util called');
};
