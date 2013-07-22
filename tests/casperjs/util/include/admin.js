casper.echo('Include admin utilities');

/**
 * General utility functions
 *
 * @return  {Object}    Returns an object with referenced utility functions
 */
var adminUtil = function() {

    /**
     * Creates a new tenant with a random name and returns the ID in the callback
     *
     * @return {String}   tenantID    The ID of the generated tenant
     */
    var createTenant = function(alias, displayName, host, callback) {
        var tenantID = '';
        var rndString = mainUtil().generateRandomString();
        alias = alias || rndString;
        displayName = displayName || rndString + ' Tenant';
        host = host || rndString + '.oae.com';

        casper.start('http://admin.oae.com/', function() {
            data = casper.evaluate(function(alias, displayName, host) {
                return JSON.parse(__utils__.sendAJAX('/api/tenant/create', 'POST', {
                    'alias': alias,
                    'displayName': displayName,
                    'host': host
                }, false));
            }, alias, displayName, host);

            casper.then(function() {
                if (!data) {
                    casper.echo('Did not create tenant ' + displayName + '. It probably already exists.');
                } else {
                    casper.echo('Created tenant ' + displayName + '.');
                }
            });
        });

        casper.then(function() {
            if (callback) {
                callback(alias);
            }
        });
    };

    return {
        'createTenant': createTenant
    };
};
