casper.test.begin('Widget - Create meeting', function (test) {

    casper.start(configUtil.tenantUI, function () {
        casper.then(function() {
            casper.echo('# Verify create meeting', 'INFO');
        });
    });

    casper.run(function () {
        test.done();
    });

});