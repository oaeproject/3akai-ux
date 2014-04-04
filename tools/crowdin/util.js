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
 * Read and return bundles in a given path
 *
 * @param  {String}      bundlesDir       Absolute path to the bundles directory
 * @param  {Function}    callback         Standard callback function
 * @param  {Object}      callback.err     Error object containing error code and message
 * @param  {Object}      callback.data    Object containing bundles found on the path
 */
var readBundles = exports.readBundles = function(bundlesDir, callback) {
    var availableBundles = fs.readdirSync(bundlesDir);
    var allBundles = {};

    // Loop over all available bundles on the path
    _.each(availableBundles, function(bundleName) {
        // Parse the i18n bundle
        allBundles[bundleName] = fs.readFileSync(bundlesDir + '/' + bundleName, 'utf-8');
    });

    callback(null, allBundles);
};

/**
 * Write bundles to a given path
 *
 * @param  {Object}      bundles          Object containing bundles
 * @param  {String}      path             The path to write the bundles to
 * @param  {Function}    callback         Standard callback function
 * @param  {Object}      callback.err     Error object containing error code and message
 */
var writeBundles = exports.writeBundles = function(bundles, path, callback) {
    _.each(bundles, function(bundle, bundleName) {
        // Add a new line to the end of the bundle
        bundle += '\n';
        // Write the bundle
        fs.writeFileSync(path + '/' + bundleName, bundle, 'utf-8');
    });

    callback(null);
};

/**
 * Get the translations for a specific key in a given bundles object
 *
 * @param  {Object}      bundles                     Object containing bundles
 * @param  {String}      keyToGet                    The key to retrieve for every language bundle
 * @param  {Function}    callback                    Standard callback function
 * @param  {Object}      callback.err                Error object containing error code and message
 * @param  {Object}      callback.keysPerLanguage    Object containing keys to move
 */
var getKeyFromBundles = exports.getKeyFromBundles = function(bundles, keyToGet, callback) {
    var keysPerLanguage = {};
    _.each(bundles, function(keys, bundlePath) {
        keys = keys.split(/\n/g);
        // Loop over every line and, if the key matches the key we need to move, cache it in the `keysPerLanguage` variable
        _.each(keys, function(key) {
            if (key && key.split('=')[0].trim() === keyToGet) {
                keysPerLanguage[bundlePath] = key;
            }
        });
    });
    callback(null, keysPerLanguage);
};

/**
 * Add the translations for a specific key to the given bundles
 *
 * @param  {Object}      bundles             Object containing bundles
 * @param  {Object}      keysToAdd           The key to add for every language bundle
 * @param  {Function}    callback            Standard callback function
 * @param  {Object}      callback.err        Error object containing error code and message
 * @param  {Object}      callback.bundles    Object containing the bundles where the given key is added to
 */
var addKeyToBundles = exports.addKeyToBundles = function(bundles, keysToAdd, callback) {
    _.each(bundles, function(keys, bundlePath) {
        keys = keys.split(/\n/g);
        // If the key is already in the other widget's bundle we need to replace it, keep track of
        // the index the key has in the `keys` array
        var replaceKey = null;
        // Loop over the widget's bundle, if the key matches the key we need to add, set
        // `replaceKey` to the index the key has in the `keys` to be able to replace
        // it later
        for (var i = 0; i < keys.length; i++) {
            if (keysToAdd[bundlePath] && keys[i].split('=')[0].trim() === keysToAdd[bundlePath].split('=')[0].trim()) {
                replaceKey = i;
                break;
            }
        }
        // If the key was already in the other widget's bundle it needs to be replaced
        if (replaceKey) {
            keys.splice(_.indexOf(keys, keys[replaceKey]), 1, keysToAdd[bundlePath]);
        // If the key wasn't already in the other widget's bundle it needs to be added
        } else {
            keys.push(keysToAdd[bundlePath]);
        }

        // Sort the keys in the bundle alphabetically
        keys.sort(_sortKeys);
        bundles[bundlePath] = _.compact(keys).join('\n');
    });

    callback(null, bundles);
};

/**
 * Delete a given key from the bundles
 *
 * @param  {Object}      bundles             Object containing bundles
 * @param  {String}      keyToDelete         The key to delete from the bundles
 * @param  {Function}    callback            Standard callback function
 * @param  {Object}      callback.err        Error object containing error code and message
 * @param  {Object}      callback.bundles    Object containing the bundles where the given key is removed from
 */
var deleteKeyFromBundles = exports.deleteKeyFromBundles = function(bundles, keyToDelete, callback) {
    _.each(bundles, function(keys, bundlePath) {
        var newBundle = '';
        keys = keys.split(/\n/g);
        // Loop over every line and, if the key doesn't match add it to the new bundle file we're writing
        _.each(keys, function(key) {
            if (key && key.split('=')[0].trim() !== keyToDelete) {
                newBundle += key + '\n';
            }
        });
        bundles[bundlePath] = newBundle;
    });

    callback(null, bundles);
};

/**
 * Sort keys alphabetically based on the part before the `=`
 *
 * @see Array#sort
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
 * @param  {Object}      bundles             Object containing bundles
 * @param  {Function}    callback            Standard callback function
 * @param  {Object}      callback.err        Error object containing error code and message
 * @param  {Object}      callback.bundles    Object containing the sorted bundles
 */
var sortBundles = exports.sortBundles = function(bundles, callback) {
    _.each(bundles, function(keys, bundleName) {
        keys = keys.split(/\n/g);
        // Sort the keys in the bundle alphabetically
        keys.sort(_sortKeys);
        // Join the keys by a new line and assign them back to the original object
        bundles[bundleName] = _.compact(keys).join('\n');
    });

    callback(null, bundles);
};
