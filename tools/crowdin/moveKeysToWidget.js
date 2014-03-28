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
 * Provided with a translation key and a widget path this script will extract all the keys
 * from the widget bundle and add them to the global bundles. The following steps are taken:
 *     - Read the available bundles for the widget
 *     - Cache the key and delete it from the bundles for the widget
 *     - For every key from the widget bundles add it to the global bundle
 *         - Only add it if it's not already there
 */

var argv = require('optimist')
    .usage('Usage: $0 -w <Widget root dir> -k <i18n key>')

    .demand('k')
    .alias('k', 'i18nKey')
    .describe('k', 'i18n key to move to widget bundles (e.g. `UPLOADING_FILE`)')

    .demand('w')
    .alias('w', 'widgetDir')
    .describe('w', 'Absolute path to the widget root directory')
    .argv;

var _ = require('underscore');
var fs = require('fs');

// Extract the i18nKey from the provided command line parameter
var i18nKey = argv.i18nKey;
// Extract the widget root directory
var widgetDir = argv.widgetDir;
var widgetBundlesDir = widgetDir + '/bundles';
var globalBundlesDir = widgetDir + '../../../ui/bundles/';

// Keep track of the i18n bundles for the widget
var globalBundles = {};

// Keep track of the translations to move to the widget bundles
var globalI18n = {};

/**
 * Add the key to the widget bundles
 */
var addKeysToWidget = function() {
    // For each key found we need to add it to the widget bundle
    _.each(globalI18n, function(key, bundlePath) {
        // Read the widget bundle
        var widgetBundle = fs.readFileSync(widgetBundlesDir + '/' + bundlePath, 'utf-8');
        // Split the file on new lines
        widgetBundle = widgetBundle.split(/\n/g);
        // Add the key to the widget bundle
        widgetBundle.push(key);
        // Sort the bundle
        widgetBundle.sort();
        // Remove empty lines
        var newWidgetBundle = '';
        _.each(widgetBundle, function(key) {
            if (key) {
                newWidgetBundle += key + '\n';
            }
        });
        // Write the bundle
        fs.writeFileSync(widgetBundlesDir + '/' + bundlePath, newWidgetBundle, 'utf-8');
    });
};

/**
 * Delete the key from the global bundles as it will be moved to the widget bundles
 */
var deleteKeysFromGlobal = function() {
    _.each(globalBundles, function(bundle, bundlePath) {
        var newBundle = '';
        // Split the file on new lines
        bundle = bundle.split(/\n/g);
        // Loop over every line and, if the key doesn't match add it to the new bundle file we're writing
        _.each(bundle, function(key) {
            if (key && key.split('=')[0].trim() !== i18nKey) {
                newBundle += key + '\n';
            }
        });
        fs.writeFileSync(globalBundlesDir + bundlePath, newBundle, 'utf-8');
    });
};

/**
 * Get the key to move to the widget bundle from the global bundles
 */
var getKeysToMove = function() {
    _.each(globalBundles, function(bundle, bundlePath) {
        // Split the file on new lines
        bundle = bundle.split(/\n/g);
        // Loop over every line and, if the key matches the key we need to move, cache it in the `globalI18n` variable
        _.each(bundle, function(key) {
            if (key && key.split('=')[0].trim() === i18nKey) {
                globalI18n[bundlePath] = key;
            }
        });
    });
};

/**
 * Read all the available global bundles
 */
var readGlobalBundles = function() {
    var availableGlobalBundles = fs.readdirSync(globalBundlesDir);

    // Loop over all available global bundles
    _.each(availableGlobalBundles, function(bundlePath) {
        // Read the bundle file
        globalBundles[bundlePath] = fs.readFileSync(globalBundlesDir + bundlePath, 'utf-8');
    });
};

readGlobalBundles();
getKeysToMove();
deleteKeysFromGlobal();
addKeysToWidget();
