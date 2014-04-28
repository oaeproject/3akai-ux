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
    .usage('Usage: $0 -k <i18n key> -f <moveFromDir> -t <moveToDir>')

    .demand('k')
    .alias('k', 'i18nKey')
    .describe('k', 'i18n key to move (e.g. `UPLOADING_FILE`)')

    .demand('f')
    .alias('f', 'moveFromDir')
    .describe('f', 'Absolute path to the bundles directory from which to move the i18n key')

    .demand('t')
    .alias('t', 'moveToDir')
    .describe('t', 'Absolute path to the bundles directory to which to move the i18n key')
    .argv;

var util = require('./util');

// Extract the key to move
var i18nKey = argv.i18nKey;

// Extract the directory from which to move the key
var moveFromDir = argv.moveFromDir;

// Extract the directory to move the key to
var moveToDir = argv.moveToDir;

// Read the bundles that hold the key to move
util.readBundles(moveFromDir, function(err, fromBundles) {
    if (err) {
        return console.error('Error reading the bundles that hold the key to move', err);
    }
    // Read the bundles to which the key should be moved
    util.readBundles(moveToDir, function(err, toBundles) {
        if (err) {
            return console.error('Error reading the bundles to which the key should be moved', err);
        }
        // Get the entries to move
        util.getKeyFromBundles(fromBundles, i18nKey, function(entriesToMove) {
            // Move the key to the bundles to which the key needs to be moved
            util.addKeyToBundles(toBundles, entriesToMove, function(err, toBundles) {
                if (err) {
                    return console.error('Error moving the key to the bundles to which they should be moved', err);
                }
                // Save the bundles to which the key has been moved
                util.writeBundles(toBundles, moveToDir, function(err) {
                    if (err) {
                        return console.error('Error saving the bundles to which the key has been moved', err);
                    }
                    // Delete the key from the bundles from which the key is being moved
                    util.deleteKeyFromBundles(fromBundles, i18nKey, function(fromBundles) {
                        // Save the bundles with the key removed
                        util.writeBundles(fromBundles, moveFromDir, function(err, fromBundles) {
                            if (err) {
                                return console.error('Error saving the bundles with the key removed', err);
                            }
                            console.log('Finished moving ' + i18nKey + ' from ' + moveFromDir + ' to ' + moveToDir);
                        });
                    });
                });
            });
        });
    });
});
