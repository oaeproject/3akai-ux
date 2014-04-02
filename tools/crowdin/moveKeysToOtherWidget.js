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
    .usage('Usage: $0 -w <Widget root dir> -k <i18n key>')

    .demand('k')
    .alias('k', 'i18nKey')
    .describe('k', 'i18n key to move to widget bundles (e.g. `UPLOADING_FILE`)')

    .demand('w')
    .alias('w', 'widgetDir')
    .describe('w', 'Absolute path to the widget root directory')

    .demand('o')
    .alias('o', 'otherWidgetDir')
    .describe('o', 'Absolute path to the widget root directory to move the key to')
    .argv;

var _ = require('underscore');
var fs = require('fs');

// Extract the i18nKey from the provided command line parameter
var i18nKey = argv.i18nKey;
// Extract the widget root directory
var widgetDir = argv.widgetDir;
var widgetBundlesDir = widgetDir + '/bundles';
var otherWidgetDir = argv.otherWidgetDir;
var otherWidgetBundlesDir = otherWidgetDir + '/bundles';

// Keep track of the i18n bundles for the widget
var widgetBundles = {};

// Keep track of the translations to move to the other widget bundles
var widgetI18n = {};

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
 * Add the key to the other widget bundles
 */
var addKeysToOtherWidget = function() {
    // For each key found we need to add it to the widget bundle
    _.each(widgetI18n, function(key, bundlePath) {
        // Read the widget bundle
        var otherWidgetBundle = fs.readFileSync(otherWidgetBundlesDir + '/' + bundlePath, 'utf-8');
        // Split the file on new lines
        otherWidgetBundle = otherWidgetBundle.split(/\n/g);
        // Add the key to the widget bundle
        otherWidgetBundle.push(key);
        // Sort the bundle
        otherWidgetBundle.sort(sortKeys);
        // Remove empty lines
        var newWidgetBundle = '';
        _.each(otherWidgetBundle, function(key) {
            if (key) {
                newWidgetBundle += key + '\n';
            }
        });
        // Add an extra new line at the end of the file as Crowdin will also do this and we don't
        // want the diff
        newWidgetBundle += '\n';
        // Write the bundle
        fs.writeFileSync(otherWidgetBundlesDir + '/' + bundlePath, newWidgetBundle, 'utf-8');
    });
};

/**
 * Delete the key from the widget bundles
 */
var deleteKeysFromWidget = function() {
    _.each(widgetBundles, function(bundle, bundlePath) {
        var newBundle = '';
        // Split the file on new lines
        bundle = bundle.split(/\n/g);
        // Loop over every line and, if the key doesn't match add it to the new bundle file we're writing
        _.each(bundle, function(key) {
            if (key && key.split('=')[0].trim() !== i18nKey) {
                newBundle += key + '\n';
            }
        });
        // Add an extra new line at the end of the file as Crowdin will also do this and we don't
        // want the diff
        newBundle += '\n';
        fs.writeFileSync(widgetBundlesDir + '/' + bundlePath, newBundle, 'utf-8');
    });
};

/**
 * Get the key to move to the other widget bundle from the widget bundles
 */
var getKeysToMove = function() {
    _.each(widgetBundles, function(bundle, bundlePath) {
        // Split the file on new lines
        bundle = bundle.split(/\n/g);
        // Loop over every line and, if the key matches the key we need to move, cache it in the `widgetI18n` variable
        _.each(bundle, function(key) {
            if (key && key.split('=')[0].trim() === i18nKey) {
                widgetI18n[bundlePath] = key;
            }
        });
    });
};

/**
 * Read all the available bundles for the provided widget and extract the keys to move to the other widget bundle
 */
var readWidgetBundles = function() {
    var availableWidgetBundles = fs.readdirSync(widgetBundlesDir);

    // Loop over all available bundles for the widget
    _.each(availableWidgetBundles, function(bundlePath) {
        // Read the bundle file
        widgetBundles[bundlePath] = fs.readFileSync(widgetBundlesDir + '/' + bundlePath, 'utf-8');
    });
};

readWidgetBundles();
getKeysToMove();
deleteKeysFromWidget();
addKeysToOtherWidget();
