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
 * Provided with a bundles directory the script will sort the keys alphabetically
 */

var argv = require('optimist')
    .usage('Usage: $0 -b <Bundles root dir>')

    .demand('b')
    .alias('b', 'bundlesRoot')
    .describe('b', 'Absolute path to the root bundles directory')
    .argv;

var _ = require('underscore');
var fs = require('fs');

// Extract the bundles root directory
var bundlesDir = argv.bundlesRoot;

// Keep track of the i18n bundles for the widget
var allBundles = {};

/**
 * Sort keys alphabetically based on the part before the `=`
 *
 * @see Array#sort
 */
var sortKeys = function(a, b) {
    if (a.split('=')[0] < b.split('=')[0]) {
        return -1;
    } else if (b.split('=')[0] < a.split('=')[0]) {
        return 1;
    }
    return 0;
};

/**
 * Sort the keys and write the file
 */
var sortBundles = function() {
    _.each(allBundles, function(i, bundlePath) {
        // Read the global bundle
        var bundle = fs.readFileSync(bundlesDir + '/' + bundlePath, 'utf-8');
        // Split the file on new lines
        bundle = bundle.split(/\n/g);

        // Sort the bundle
        bundle.sort(sortKeys);
        // Remove empty lines
        var newBundle = '';
        _.each(bundle, function(key) {
            if (key) {
                newBundle += key + '\n';
            }
        });
        // Add an extra new line at the end of the file as Crowdin will also do this and we don't
        // want the diff
        newBundle += '\n';
        // Write the bundle
        fs.writeFileSync(bundlesDir + '/' + bundlePath, newBundle, 'utf-8');
    });
};

/**
 * Read all the available bundles
 */
var readBundles = function() {
    var availableBundles = fs.readdirSync(bundlesDir + '/');

    // Loop over all available global bundles
    _.each(availableBundles, function(bundlePath) {
        // Read the bundle file
        allBundles[bundlePath] = fs.readFileSync(bundlesDir + '/' + bundlePath, 'utf-8');
    });
};

readBundles();
sortBundles();
