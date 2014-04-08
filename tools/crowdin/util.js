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

var _ = require('underscore');
var fs = require('fs');

/**
 * Read and parse the i18n bundles in a provided directory
 *
 * @param  {String}      bundlesDir             Absolute path to the bundles directory
 * @param  {Function}    callback               Standard callback function
 * @param  {Object}      callback.err           Error object containing error code and message
 * @param  {Object}      callback.allBundles    Object containing bundles found on the path. Returns in the form of {'Bundle 1 name': 'stringified bundle 1', 'Bundle 2 name': 'stringified bundle 2'}
 */
var readBundles = exports.readBundles = function(bundlesDir, callback) {
    var availableBundles = null;
    try {
        availableBundles = fs.readdirSync(bundlesDir);
    } catch (err) {
        return callback(err);
    }
    var allBundles = {};

    // Loop over all available bundles on the path
    _.each(availableBundles, function(bundleName) {
        // Read the i18n bundle
        try {
            allBundles[bundleName] = fs.readFileSync(bundlesDir + '/' + bundleName, 'utf-8');
        } catch (err) {
            return callback(err);
        }
    });

    callback(null, allBundles);
};

/**
 * Write bundles to a given directory
 *
 * @param  {Object}      bundles          Object containing bundles in the form of {'Bundle 1 name': 'stringified bundle 1', 'Bundle 2 name': 'stringified bundle 2'}
 * @param  {String}      path             The path to write the bundles to
 * @param  {Function}    callback         Standard callback function
 * @param  {Object}      callback.err     Error object containing error code and message
 */
var writeBundles = exports.writeBundles = function(bundles, path, callback) {
    _.each(bundles, function(bundle, bundleName) {
        // Add a new line to the end of the bundle as Crowdin will do this automatically
        // and we don't want the diff every time we run our scripts
        bundle += '\n';
        // Write the bundle
        try {
            fs.writeFileSync(path + '/' + bundleName, bundle, 'utf-8');
        } catch (err) {
            return callback(err);
        }
    });

    callback(null);
};

/**
 * Get the translations for a specific key in a given bundles object
 *
 * @param  {Object}      bundles                     Object containing bundles in the form of {'Bundle 1 name': 'stringified bundle 1', 'Bundle 2 name': 'stringified bundle 2'}
 * @param  {String}      key                         The key to retrieve for every language bundle
 * @param  {Function}    callback                    Standard callback function
 * @param  {Object}      callback.i18nEntries        Object containing the key and translation for every language it's available in. Returns in the form {'Bundle 1 name': 'key=translation', 'Bundle 2 name': 'key=translation'}
 */
var getKeyFromBundles = exports.getKeyFromBundles = function(bundles, key, callback) {
    var i18nEntries = {};
    _.each(bundles, function(bundle, bundlePath) {
        bundle = bundle.split(/\n/g);
        // Loop over every line and, if the key matches the key we need to move, cache it in the `i18nEntries` variable
        _.each(bundle, function(k) {
            if (k && k.split('=')[0].trim() === key) {
                i18nEntries[bundlePath] = k;
            }
        });
    });

    callback(i18nEntries);
};

/**
 * Add the translations for a specific key to the provided bundles
 *
 * @param  {Object}      bundles             Object containing bundles in the form of {'Bundle 1 name': 'stringified bundle 1', 'Bundle 2 name': 'stringified bundle 2'}
 * @param  {Object}      i18nEntries         Object containing the key and translation for every language it's available in
 * @param  {Function}    callback            Standard callback function
 * @param  {Object}      callback.bundles    Object containing the bundles where the given key is added to. Returns in the form of {'Bundle 1 name': 'stringified bundle 1', 'Bundle 2 name': 'stringified bundle 2'}
 */
var addKeyToBundles = exports.addKeyToBundles = function(bundles, i18nEntries, callback) {
    _.each(bundles, function(bundle, bundlePath) {
        bundle = bundle.split(/\n/g);
        // If the key is already in the other widget's bundle we need to replace it, keep track of
        // the index the key has in the `bundle` array
        var replaceKey = null;
        // Loop over the widget's bundle, if the key matches the key we need to add, set
        // `replaceKey` to the index the key has in the `bundle` to be able to replace
        // it later
        for (var i = 0; i < bundle.length; i++) {
            if (i18nEntries[bundlePath] && bundle[i].split('=')[0].trim() === i18nEntries[bundlePath].split('=')[0].trim()) {
                replaceKey = i;
                break;
            }
        }
        // If the key was already in the other widget's bundle it needs to be replaced
        if (replaceKey) {
            bundle.splice(_.indexOf(bundle, bundle[replaceKey]), 1, i18nEntries[bundlePath]);
        // If the key wasn't already in the other widget's bundle it needs to be added
        } else {
            bundle.push(i18nEntries[bundlePath]);
        }

        // Sort the bundle in the bundle alphabetically
        bundle.sort(_sortKeys);
        bundles[bundlePath] = _.compact(bundle).join('\n');
    });

    callback(bundles);
};

/**
 * Delete a given key from the provided bundles
 *
 * @param  {Object}      bundles             Object containing bundles in the form of {'Bundle 1 name': 'stringified bundle 1', 'Bundle 2 name': 'stringified bundle 2'}
 * @param  {String}      key                 The key to delete from the bundles
 * @param  {Function}    callback            Standard callback function
 * @param  {Object}      callback.bundles    Object containing the bundles with the provided key removed. Returns in the form of {'Bundle 1 name': 'stringified bundle 1', 'Bundle 2 name': 'stringified bundle 2'}
 */
var deleteKeyFromBundles = exports.deleteKeyFromBundles = function(bundles, key, callback) {
    _.each(bundles, function(bundle, bundlePath) {
        var newBundle = '';
        bundle = bundle.split(/\n/g);
        // Loop over every line and, if the key doesn't match add it to the new bundle file we're writing
        _.each(bundle, function(k) {
            if (k && k.split('=')[0].trim() !== key) {
                newBundle += k + '\n';
            }
        });
        bundles[bundlePath] = newBundle;
    });

    callback(bundles);
};

/**
 * Sort keys alphabetically based on the part before the `=`
 *
 * @see Array#sort
 * @api private
 */
var _sortKeys = function(a, b) {
    var aKey = a.split('=')[0];
    var bKey = b.split('=')[0];
    if (aKey < bKey) {
        return -1;
    } else if (bKey < aKey) {
        return 1;
    }
    return 0;
};

/**
 * Sort the given bundles alphabetically
 *
 * @param  {Object}      bundles             Object containing bundles in the form of {'Bundle 1 name': 'stringified bundle 1', 'Bundle 2 name': 'stringified bundle 2'}
 * @param  {Function}    callback            Standard callback function
 * @param  {Object}      callback.bundles    Object containing the sorted bundles. Returns in the form of {'Bundle 1 name': 'stringified bundle 1', 'Bundle 2 name': 'stringified bundle 2'}
 */
var sortBundles = exports.sortBundles = function(bundles, callback) {
    _.each(bundles, function(keys, bundleName) {
        keys = keys.split(/\n/g);
        // Sort the keys in the bundle alphabetically
        keys.sort(_sortKeys);
        // Join the keys by a new line and assign them back to the original object
        bundles[bundleName] = _.compact(keys).join('\n');
    });

    callback(bundles);
};
