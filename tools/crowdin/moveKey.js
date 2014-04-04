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
 * Provided with a translation, a widget path to move a key from and a widget path to move a key to
 * this script will extract all the keys from the widget bundle and add them to the other widget's bundles.
 */

var argv = require('optimist')
    .usage('Usage: $0 -k <i18n key> -f <moveFromDir> -t <moveToDir>')

    .demand('k')
    .alias('k', 'i18nKey')
    .describe('k', 'i18n key to move (e.g. `UPLOADING_FILE`)')

    .demand('f')
    .alias('f', 'moveFromDir')
    .describe('f', 'Absolute path to the bundles directory where the key to move lives')

    .demand('t')
    .alias('t', 'moveToDir')
    .describe('t', 'Absolute path to the bundles directory to move the key to')
    .argv;

var util = require('./util');

// Extract the key to move
var i18nKey = argv.i18nKey;

// Extract the directory to move the key from
var moveFromDir = argv.moveFromDir;

// Extract the directory to move the key to
var moveToDir = argv.moveToDir;

// Read the bundles that hold the key to move
util.readBundles(moveFromDir, function(err, fromBundles) {
    // Get the key to move from those bundles
    util.getKeyFromBundles(fromBundles, i18nKey, function(err, keysToMove) {
        // Delete the key to move from those bundles
        util.deleteKeyFromBundles(fromBundles, i18nKey, function(err, bundles) {
            // Write the new bundles without the key that is moved
            util.writeBundles(bundles, moveFromDir, function(err, bundles) {
                // Read the bundles that hold the key to move
                util.readBundles(moveToDir, function(err, bundles) {
                    // Add the key to move to the other bundles
                    util.addKeyToBundles(bundles, keysToMove, function(err, bundles) {
                        // Write the other bundles
                        util.writeBundles(bundles, moveToDir, function(err, bundles) {});
                    });
                });
            });
        });
    });
});
