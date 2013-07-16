casper.echo('Include general utilities');

/**
 * General utility functions
 *
 * @return  {Object}    Returns an object with referenced utility functions
 */
var mainUtil = function() {

    /**
     * Generates a random 10 character sequence of upper and lowercase letters.
     *
     * @return {String}   Random 10 character sequence of upper and lowercase letters
     */
    var generateRandomString = function() {
        var rndString = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        for (var i = 0; i < 10; i++) {
            rndString += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return rndString;
    };

    return {
        'generateRandomString': generateRandomString
    };
};
