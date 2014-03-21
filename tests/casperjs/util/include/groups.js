// Keeps track of the created groups that are available for testing
var createdGroups = [];

/**
 * Utility functions for groups
 *
 * @return  {Object}    Returns an object with referenced group utility functions
 */
var groupUtil = function() {

    /**
     * Creates a group
     *
     * @param {Function}   callback          Standard callback function
     * @param {Group}      callback.group    The group data coming back from the server
     */
    var createGroup = function(members, managers, callback) {
        var group = null;

        var rndString = mainUtil().generateRandomString();
        data = casper.evaluate(function(rndString, members, managers) {
            return JSON.parse(__utils__.sendAJAX('/api/group/create', 'POST', {
                'displayName': 'group-' + rndString,
                'description': '',
                'visibility': 'public',
                'joinable': 'yes',
                'members': members,
                'managers': managers
            }, false));
        }, rndString, members, managers);

        casper.then(function() {
            if (data) {
                createdGroups.push(data);
                group = data;
            } else {
                casper.echo('Could not create group-' + rndString + '.', 'ERROR');
            }
        });

        casper.then(function() {
            callback(group);
        });
    };

    return {
        'createGroup': createGroup,
        'createdGroups': createdGroups
    };
};
