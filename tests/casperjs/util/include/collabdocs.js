casper.echo('Include collabdoc utilities');

// Keeps track of the created collabdocs that are available for testing
var createdCollabDocs = [];

/**
 * Utility functions for collaborative documents
 *
 * @return  {Object}    Returns an object with referenced collabdoc utility functions
 */
var collabDocUtil = function() {

    /**
     * Creates a collabdoc
     *
     * @param {Function}   callback              Standard callback function
     * @param {Collabdoc}      callback.collabdoc    The collabdoc data coming back from the server
     */
    var createCollabDoc = function(callback) {
        var collabdoc = null;
        casper.start('http://test.oae.com/', function() {
            var rndString = mainUtil().generateRandomString();
            data = casper.evaluate(function(rndString) {
                return JSON.parse(__utils__.sendAJAX('/api/content/create', 'POST', {
                    'resourceSubType': 'collabdoc',
                    'displayName': 'collabdoc-' + rndString,
                    'description': '',
                    'visibility': 'public'
                }, false));
            }, rndString);

            casper.then(function() {
                if (data) {
                    casper.echo('Created collabdoc-' + rndString + '.');
                    createdCollabDocs.push(data);
                    collabdoc = data;
                } else {
                    casper.echo('Could not create collabdoc-' + rndString + '.', 'ERROR');
                }
            });
        });

        casper.then(function() {
            callback(collabdoc);
        });
    };

    return {
        'createCollabDoc': createCollabDoc,
        'createdCollabDocs': createdCollabDocs
    };
};
