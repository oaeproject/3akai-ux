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
 * Delete the provided i18n key from all bundles in a provided directory
 */

var argv = require('optimist')
    .usage('Usage: $0 -k <i18nKey> -b <bundlesDir>')

    .demand('k')
    .alias('k', 'i18nKey')
    .describe('k', 'i18n key to delete from the bundles (e.g. `UPLOADING_FILE`)')

    .demand('b')
    .alias('b', 'bundlesDir')
    .describe('b', 'Absolute path to the bundles directory')
    .argv;

var util = require('./util');

// Extract the i18n key from the provided command line parameter
var i18nKey = argv.i18nKey;

// Extract the bundles directory
var bundlesDir = argv.bundlesDir;

// Read the bundles that hold the key to delete
util.readBundles(bundlesDir, function(err, bundles) {
    if (err) {
        return console.error('Error reading the bundles that hold the key to delete', err);
    }
    // Delete the key
    util.deleteKeyFromBundles(bundles, i18nKey, function(bundles) {
        // Save the bundles with the key removed
        util.writeBundles(bundles, bundlesDir, function(err) {
            if (err) {
                return console.error('Error saving the bundles with the key removed', err);
            }
            console.log('Finished deleting ' + i18nKey + ' from ' + bundlesDir);
        });
    });
});
