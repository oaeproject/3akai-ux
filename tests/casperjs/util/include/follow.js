/**
 * Utility functions for following users
 *
 * @return  {Object}    Returns an object with referenced follow utility functions
 */
var followUtil = function() {

    /**
     * Follow a user
     *
     * @param  {String}      userId            Id of the user to follow
     * @param  {Function}    callback          Standard callback function
     */
    var follow = function(userId, callback) {
        casper.thenEvaluate(function(userId) {
            require('oae.core').api.follow.follow(userId);
        }, userId);
        casper.wait(1000, callback);
    };

    /**
     * Unfollow a user you are already following
     *
     * @param  {String}      userId            Id of the user to unfollow
     * @param  {Function}    callback          Standard callback function
     */
    var unfollow = function(userId, callback) {
        casper.thenEvaluate(function(userId) {
            require('oae.core').api.follow.unfollow(userId);
        }, userId);
        casper.wait(1000, callback);
    };

    return {
        'follow': follow,
        'unfollow': unfollow,
    };
};
