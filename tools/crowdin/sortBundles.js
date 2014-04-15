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
 * Sort the i18n keys alphabetically for all bundles in a provided directory
 */

var argv = require('optimist')
    .usage('Usage: $0 -b <bundlesDir>')

    .demand('b')
    .alias('b', 'bundlesDir')
    .describe('b', 'Absolute path to the bundles directory')
    .argv;

var util = require('./util');

// Extract the bundles directory
var bundlesDir = argv.bundlesDir;

// Read the bundles to sort
util.readBundles(bundlesDir, function(err, bundles) {
    if (err) {
        return console.error('Error reading the bundles to sort', err);
    }
    // Sort the bundles
    util.sortBundles(bundles, function(bundles) {
        // Save the sorted bundles
        util.writeBundles(bundles, bundlesDir, function(err) {
            if (err) {
                return console.error('Error saving the sorted bundles', err);
            }
            console.log('Finished sorting ' + bundlesDir);
        });
    });
});
