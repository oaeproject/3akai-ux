/*!
 * Copyright 2015 Apereo Foundation (AF) Licensed under the
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

casper.test.begin('Widget - Tenant Landing Page', function(test) {

    /**
     * Verify that landing page is rendered properly
     */
    var verifyLandingPage = function() {
        // Verify that all sizes of the landing page are present
        test.assertExists('.tenantlandingpage-widget > .visible-xs', 'Extra small landing page is present');
        test.assertExists('.tenantlandingpage-widget > .visible-sm', 'Small landing page is present');
        test.assertExists('.tenantlandingpage-widget > .visible-md', 'Medium landing page is present');
        test.assertExists('.tenantlandingpage-widget > .visible-lg', 'Large landing page is present');
    };

    /**
     * Starts the browser and points it to the landing page.
     */
    casper.start(configUtil.tenantUI, function() {
        // Wait for the landing page to load
        casper.then(function() {
            casper.echo('# Verify that the landing page is visible to anonymous users', 'INFO');
            casper.waitForSelector('.tenantlandingpage-widget', verifyLandingPage);
        });
    });

    casper.run(function() {
        this.test.done();
    });
});
