/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/**
 * Admin utility functions
 */
var adminUtil = (function() {

    /**
     * Verify if a tenant has already been created.
     *
     * @param  {String}     alias                   The alias of the tenant
     * @param  {Function}   callback                Standard callback function
     * @param  {Boolean}    callback.tenantExists   `true` if the tenant already exists
     * @api private
     */
    var verifyTenantExists = function(alias, callback) {
        var tenantExists = null;
        var err = null;

        mainUtil.callInternalAPI('admin', 'getTenants', null, function(_err, tenants) {
            if (_err) {
                casper.echo('Could not retrieve the list of tenants. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                err = _err;
            } else {
                for (var i in tenants) {
                    if (tenants[i].alias === alias) {
                        tenantExists = true;
                        break;
                    }
                }
                tenantExists = tenantExists || false;
            }
        });

        casper.waitFor(function() {
            return tenantExists !== null || err !== null;
        }, function() {
            callback(err, tenantExists);
        });
    };

    /**
     * Verify if an object of configuration values for a tenant has already been persisted.
     *
     * @param  {String}     alias                 The alias of the tenant
     * @param  {Object}     configToStore         The configuration to check
     * @param  {Function}   callback              Standard callback function
     * @param  {Boolean}    callback.configSet    Standard callback function
     * @api private
     */
    var verifyConfigSet = function(alias, configToStore, callback) {
        storedConfig = casper.evaluate(function(alias) {
            return JSON.parse(__utils__.sendAJAX('/api/config/' + alias, 'GET', null, false));
        }, alias);

        var configSet = true;
        for (var c in configToStore) {
            var configKey = c.split('/');
            if (configKey.length > 3) {
                if (storedConfig[configKey[0]][configKey[1]][configKey[2]][configKey[3]] !== configToStore[c]) {
                    configSet = false;
                }
            } else {
                if (storedConfig[configKey[0]][configKey[1]][configKey[2]] !== configToStore[c]) {
                    configSet = false;
                }
            }
        }

        casper.then(function() {
            callback(configSet);
        });
    };

    /**
     * Creates a new tenant with a random name and returns the ID in the callback.
     * If the tenant already exists the step will be skipped.
     *
     * @param  {String}     alias             The alias of the tenant
     * @param  {String}     displayName       The display name of the tenant
     * @param  {String}     host              The host name of the tenant
     * @param  {Function}   callback          Standard callback function
     * @param  {String}     callback.tenant   The profile of the tenant that was created
     * @return {String}     tenantID    The ID of the generated tenant
     */
    var createTenant = function(alias, displayName, host, callback) {
        casper.then(function() {
            verifyTenantExists(alias, function(_err, exists) {
                // If the test tenant already exists continue
                if (exists) {
                    casper.echo('The test tenant already exists.');

                    casper.then(function() {
                        if (callback) {
                            return callback(null, alias);
                        }
                    });
                // If the test tenant doesn't exist yet, create it and continue
                } else {
                    var tenant = null;
                    var err = null;
                    var rndString = mainUtil.generateRandomString();
                    alias = alias || rndString;
                    displayName = displayName || rndString + ' Tenant';
                    host = host || rndString + '.oae.com';

                    mainUtil.callInternalAPI('admin', 'createTenant', [alias, displayName, host], function(_err, _tenant) {
                        if (_err) {
                            casper.echo('Could not create tenant ' + displayName + '. Error ' + _err.code + ': ' + _err.msg, 'ERROR');
                            err = _err;
                        } else {
                            tenant = _tenant;
                            casper.echo('Successfully created tenant ' + displayName + '.');
                        }
                    });

                    casper.waitFor(function() {
                        return tenant !== null || err !== null;
                    }, function() {
                        return callback(err, tenant);
                    });
                }
            });
        });
    };

    /**
     * Writes configuration values for a specific tenant.
     *
     * @param  {String}       tenantID          The ID of the tenant to save configuration of
     * @param  {Object}       config            The configuration changes that need to be made
     * @param  {Funcction}    callback          Standard callback function
     */
    var writeConfig = function(tenantID, config, callback) {
        casper.then(function() {
            data = casper.evaluate(function(tenantID, config) {
                return JSON.parse(__utils__.sendAJAX('/api/config/' + tenantID, 'POST', config, false));
            }, tenantID, config);

            casper.then(function() {
                verifyConfigSet(tenantID, config, function(configSet) {
                    if (configSet) {
                        casper.echo('Successfully saved the tenant configuration.');
                        if (callback) {
                            callback();
                        }
                    } else {
                        casper.echo('Could not save the tenant configuration, stopping test.', 'ERROR');
                        casper.exit();
                    }
                });
            });
        });
    };

    return {
        'createTenant': createTenant,
        'writeConfig': writeConfig
    };
})();
