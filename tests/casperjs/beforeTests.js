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

module.exports = function(callback) {
    var hilaryRoot = __dirname + '/../../../Hilary/';
    var hilaryModules = hilaryRoot + 'node_modules/';

    // Set our bootstrapping log level before loading other modules that will use logging
    process.env['OAE_BOOTSTRAP_LOG_LEVEL'] = 'trace';
    process.env['OAE_BOOTSTRAP_LOG_FILE'] = './tests.log';

    var AuthenticationAPI = require(hilaryModules + 'oae-authentication');
    var AuthenticationConstants = require(hilaryModules +
        'oae-authentication/lib/constants').AuthenticationConstants;
    var ConfigTestUtil = require(hilaryModules + 'oae-config/lib/test/util');
    var Context = require(hilaryModules + 'oae-context').Context;
    var LoginId = require(hilaryModules + 'oae-authentication/lib/model')
        .LoginId;
    var PrincipalsAPI = require(hilaryModules + 'oae-principals');
    var Tenant = require(hilaryModules + 'oae-tenants/lib/model').Tenant;
    var TenantsTestUtil = require(hilaryModules + 'oae-tenants/lib/test/util');
    var User = require(hilaryModules + 'oae-principals/lib/model.user').User;

    var TestsUtil = require(hilaryModules + 'oae-tests/lib/util');

    var log = require(hilaryModules + 'oae-logger').logger('before-tests');

    /**
     * Create 2 default tenants that can be used for testing our REST endpoints.
     *
     * @param  {Object}      config      JSON object containing configuration values for Cassandra, Redis, logging and telemetry
     * @param  {Function}    callback    Standard callback function that should be called when the tenants have been created and have started up
     */
    var setUpTenants = function(config, callback) {
        global.oaeTests = { tenants: {} };

        // Create the Global Tenant admin context to authenticate with
        global.oaeTests.tenants.global = new Tenant(
            config.servers.globalAdminAlias,
            'Global tenant',
            config.servers.globalAdminHost,
            { isGlobalAdminServer: true },
        );
        var globalAdminRestContext = TestsUtil.createGlobalAdminRestContext();

        // Create the test tenant
        TenantsTestUtil.createTenantAndWait(
            globalAdminRestContext,
            'test',
            'CasperJS Tenant',
            'test.oae.com',
            null,
            function(err, tenant) {
                if (err) {
                    log().error({ err: err });
                    return callback(err);
                }

                ConfigTestUtil.updateConfigAndWait(
                    globalAdminRestContext,
                    null,
                    {
                        'oae-principals/recaptcha/enabled': false,
                        'oae-principals/termsAndConditions/enabled': true,
                        'oae-principals/termsAndConditions/text/default':
                            '![OAE](/shared/oae/img/oae-logo.png) Default terms and conditions',
                    },
                    function(err) {
                        if (err) {
                            log().error({ err: err });
                            return callback(err);
                        }

                        return callback();
                    },
                );
            },
        );
    };

    // Create the configuration for the test
    var config = TestsUtil.createInitialTestConfig();

    // Re-enable the poller so it only collects automatically
    config.activity.collectionPollingFrequency = 1;
    config.activity.numberOfProcessingBuckets = 1;

    TestsUtil.setUpBeforeTests(config, true, function() {
        // Set up a test tenant
        setUpTenants(config, function(err) {
            if (err) {
                return callback(new Error(err.msg));
            }
            return callback();
        });
    });
};
