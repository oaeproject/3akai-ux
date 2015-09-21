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
 * Move a provided i18n key from a bundle directory to a different bundle directory
 */

var argv = require('optimist')
    .usage('Usage: $0 -k1 <original i18n key name> -k2 <new i18n key name> -f <bundle directory>')

    .demand('f')
    .alias('f', 'fromI18nKey')
    .describe('f', 'Original i18n key name (e.g. `CONTENT_UPLOADING_FILE`)')

    .demand('t')
    .alias('t', 'toI18nKey')
    .describe('t', 'New i18n key name (e.g. `UPLOADING_FILE`)')

    .demand('b')
    .alias('b', 'bundleDir')
    .describe('b', 'Absolute path to the bundles directory that contains the i18n key to rename')
    .argv;

var util = require('./util');

// Extract the original and new key name
var fromI18nKey = argv.fromI18nKey;
var toI18nKey = argv.toI18nKey;

// Extract the directory in which to rename the key
var bundleDir = argv.bundleDir;

// Read the bundles that hold the key to rename
util.readBundles(bundleDir, function(err, bundles) {
    if (err) {
        return console.error('Error reading the bundles that hold the key to move', err);
    }

    // Rename the keys in the specified bundles
    util.renameKeyInBundles(bundles, fromI18nKey, toI18nKey, function(err, renamedBundles) {
        if (err) {
            return console.error('Error renaming the key in the bundles', err);
        }

        // Save the bundles with the key renamed
        util.writeBundles(renamedBundles, bundleDir, function(err) {
            if (err) {
                return console.error('Error saving the bundles with the key renamed', err);
            }

            console.log('Finished renaming ' + fromI18nKey + ' to ' + toI18nKey + ' in ' + bundleDir);
        });
    });
});
