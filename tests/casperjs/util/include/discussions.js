/**
 * Utility functions for discussions
 *
 * @return  {Object}    Returns an object with referenced discussions utility functions
 */
var discussionUtil = function() {

    /**
     * Creates a discussion
     *
     * @param  {Function}     callback               Standard callback function
     * @param  {Discussion}   callback.discussion    The created discussion object
     */
    var createDiscussion = function(callback) {
        var discussion = null;
        var rndString = mainUtil().generateRandomString();
        data = casper.evaluate(function(rndString) {
            return JSON.parse(__utils__.sendAJAX('/api/discussion/create', 'POST', {
                'displayName': 'Discussion ' + rndString,
                'description': 'Talk about all the things!',
                'visibility': 'public'
            }, false));
        }, rndString);

        casper.then(function() {
            if (data) {
                discussion = data;
            } else {
                casper.echo('Could not create discussion \'Discussion' + rndString + '\'.', 'ERROR');
            }
        });

        casper.then(function() {
            callback(discussion);
        });
    };

    return {
        'createDiscussion': createDiscussion
    };
};
