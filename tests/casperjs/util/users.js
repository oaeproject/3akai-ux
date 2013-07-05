casper.echo('Include userUtil');

// Keeps track of the created users that are available for testing
var createdUsers = [];

/**
 * Utility functions for users
 *
 * @return  {Object}    Returns an object with referenced user utility functions
 */
var userUtil = function() {

    /**
     * Creates a given number of users
     *
     * @param  {Number} numToCreate The number of users to create
     */
    var createUsers = function(numToCreate) {
        var toCreate = numToCreate || 4;

        casper.test.comment('Create ' + toCreate + ' users');

        casper.start('http://cam.oae.com/').repeat(toCreate, function() {
            data = this.evaluate(function(url) {
                return JSON.parse(__utils__.sendAJAX('/api/user/create', 'POST', {
                    'username': 'roy-' + new Date().getTime(),
                    'password': 'password',
                    'displayName': 'Roy McBleh',
                    'visibility': 'public',
                    'email': 'roy@example.com',
                    'locale': 'en_GB',
                    'timezone': 'Europe/London',
                    'publicAlias': 'Roy'
                }, false));
            });

            casper.then(function() {
                casper.echo('Created user ' + data.id + '.', 'INFO');
                createdUsers.push(data);
            });
        });
    };

    return {
        'createUsers': createUsers,
        'createdUsers': createdUsers
    };
};
