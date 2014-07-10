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
    var AuthenticationConstants = require(hilaryModules + 'oae-authentication/lib/constants').AuthenticationConstants;
    var ConfigTestUtil = require(hilaryModules + 'oae-config/lib/test/util');
    var Context = require(hilaryModules + 'oae-context').Context;
    var LoginId = require(hilaryModules + 'oae-authentication/lib/model').LoginId;
    var PrincipalsAPI = require(hilaryModules + 'oae-principals');
    var Tenant = require(hilaryModules + 'oae-tenants/lib/model').Tenant;
    var TenantsTestUtil = require(hilaryModules + 'oae-tenants/lib/test/util');
    var User = require(hilaryModules + 'oae-principals/lib/model.user').User;

    var TestsUtil = require(hilaryModules + 'oae-tests/lib/util');

    var config = require(hilaryRoot + 'config').config;
    var log = require(hilaryModules + 'oae-logger').logger('before-tests');

    // The Cassandra connection config that should be used for unit tests, using
    // a custom keyspace for just the tests
    config.cassandra.keyspace = 'oaeTest';

    // We'll stick all our redis data in a separate DB index.
    config.redis.dbIndex = 1;

    // log everything (except mocha output) to tests.log
    config.log.streams = [{
        'level': 'trace',
        'path': './tests.log'
    }];

    // Unit test will purge the rabbit mq queues when they're connected
    config.mq.purgeQueuesOnStartup = true;

    // In order to speed up some of the tests and to avoid mocha timeouts, we reduce the default time outs
    config.previews.enabled = false;

    config.search.index.name = 'oaetest';
    config.search.index.settings.number_of_shards = 1;
    config.search.index.settings.number_of_replicas = 0;
    config.search.index.settings.store = {'type': 'memory'};
    config.search.index.destroyOnStartup = true;

    config.servers.globalAdminHost = 'localhost:2000';

    /**
     * Create 2 default tenants that can be used for testing our REST endpoints.
     *
     * @param  {Function}    callback    Standard callback function that should be called when the tenants have been created and have started up
     */
    var setUpTenants = function(callback) {
        global.oaeTests = {'tenants': {}};

        // Create the Global Tenant admin context to authenticate with
        global.oaeTests.tenants.global = new Tenant(config.servers.globalAdminAlias, 'Global tenant', config.servers.globalAdminHost, {'isGlobalAdminServer': true});
        var globalAdminRestContext = TestsUtil.createGlobalAdminRestContext();

        // Create the test tenant
        TenantsTestUtil.createTenantAndWait(globalAdminRestContext, 'test', 'CasperJS Tenant', 'test.oae.com', function(err, tenant) {
            if (err) {
                log().error({'err': err});
                return callback(err);
            }

            ConfigTestUtil.updateConfigAndWait(globalAdminRestContext, null, {
                'oae-principals/recaptcha/enabled': false,
                'oae-principals/termsAndConditions/enabled': true,
                'oae-principals/termsAndConditions/text/default': '![OAE](/shared/oae/img/oae-logo.png) Default terms and conditions'
            }, function(err) {
                if (err) {
                    log().error({'err': err});
                    return callback(err);
                }

                callback();
            });
        });
    };

    TestsUtil.setUpBeforeTests(true, function() {
        // Set up a couple of test tenants.
        setUpTenants(function(err) {
            if (err) {
                return callback(new Error(err.msg));
            }
            return callback();
        });
    });
};
