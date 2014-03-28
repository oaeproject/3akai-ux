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
 * Provided with a translation key and a widget path this script will delete the key
 * from the widget bundles.
 */

var argv = require('optimist')
    .usage('Usage: $0 -w <Widget root dir> -k <i18n key>')

    .demand('k')
    .alias('k', 'i18nKey')
    .describe('k', 'i18n key to delete from the widget (e.g. `ACCESS_DENIED`)')

    .demand('w')
    .alias('w', 'widgetDir')
    .describe('w', 'Absolute path to the widget root directory')
    .argv;

var _ = require('underscore');
var fs = require('fs');

// Extract the i18nKey from the provided command line parameter
var i18nKey = argv.i18nKey;
// Extract the widget root directory
var widgetBundlesDir = argv.widgetDir + '/bundles/';

// Keep track of the i18n bundles for the widget
var widgetBundles = {};

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
            if (key && key.indexOf(i18nKey) !== 0) {
                newBundle += key + '\n';
            }
        });
        fs.writeFileSync(widgetBundlesDir + bundlePath, newBundle, 'utf-8');
    });
};

/**
 * Read all the available bundles for the provided widget
 */
var readWidgetBundles = function() {
    var availableWidgetBundles = fs.readdirSync(widgetBundlesDir);

    // Loop over all available bundles for the widget
    _.each(availableWidgetBundles, function(bundlePath) {
        // Read the bundle file
        widgetBundles[bundlePath] = fs.readFileSync(widgetBundlesDir + bundlePath, 'utf-8');
    });
};

readWidgetBundles();
deleteKeysFromWidget();
