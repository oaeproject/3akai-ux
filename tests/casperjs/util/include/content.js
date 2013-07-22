casper.echo('Include contentUtil');

// Keeps track of the created content that is available for testing
var createdContent = [];

/**
 * Utility functions for content
 *
 * @return  {Object}    Returns an object with referenced content utility functions
 */
var contentUtil = function() {

    casper.page.customHeaders = {
        "Referer" : "http://test.oae.com/"
    };

    var createFile = function(numToCreate, callback) {

    };

    return {
        'createFile': createFile
    };
};
