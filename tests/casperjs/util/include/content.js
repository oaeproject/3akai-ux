casper.echo('Include content utilities');

// Keeps track of the created content that is available for testing
var createdContent = [];

/**
 * Utility functions for content
 *
 * @return  {Object}    Returns an object with referenced content utility functions
 */
var contentUtil = function() {

    /**
     * Creates a file through the UI and returns the URL to it
     *
     * @param  {[String]}     file       Optional URL to the file to create
     * @param  {Function}   callback   Standard callback function
     */
    var createFile = function(file, callback) {
        var fileToUpload = file || 'tests/casperjs/data/balloons.jpg';
        var contentUrl = null;

        casper.thenOpen('http://test.oae.com/me', function() {
            casper.waitForSelector('#me-clip-container .oae-clip-content > button', function() {
                casper.click('#me-clip-container .oae-clip-content > button');
                casper.click('.oae-trigger-upload');
                casper.wait(1000, function() {
                    casper.click('#me-clip-container .oae-clip-content > button');
                });
            });
            casper.then(function() {
                casper.fill('#upload-dropzone form', {
                    'file': fileToUpload
                }, false);
                casper.click('button#upload-upload');
                casper.waitForSelector('#oae-notification-container .alert', function() {
                    contentUrl = casper.getElementAttribute('#oae-notification-container .alert h4 + a', 'href');
                    casper.echo('Created content item at ' + contentUrl);
                    callback(contentUrl);
                });
            });
        });
    };

    return {
        'createFile': createFile
    };
};
