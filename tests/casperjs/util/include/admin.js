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
     * @param  {String}     alias             The alias of the tenant
     * @param  {String}     displayName       The display name of the tenant
     * @param  {String}     host              The host name of the tenant
     * @param  {Function}   callback          Standard callback function
     * @param  {String}     callback.alias    The alias of the tenant that was created
     *
     * @return {String}     tenantID    The ID of the generated tenant
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

    /**
     * Writes configuration values for a specific tenant
     *
     * @param  {String}       tenantID          The ID of the tenant to save configuration of
     * @param  {Object}       config            The configuration changes that need to be made
     * @param  {Funcction}    callback          Standard callback function
     */
    var writeConfig = function(tenantID, config, callback) {
        casper.start('http://admin.oae.com/', function() {
            data = casper.evaluate(function(tenantID, config) {
                return JSON.parse(__utils__.sendAJAX('/api/config/' + tenantID, 'POST', config, false));
            }, tenantID, config);

            casper.then(function() {
                casper.echo('Saved configuration for ' + tenantID + '.');
            });
        });

        casper.then(function() {
            if (callback) {
                callback();
            }
        });
    };

    return {
        'createTenant': createTenant,
        'writeConfig': writeConfig
    };
};
