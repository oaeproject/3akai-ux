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
 * @param  {Object}      callback.err           Error object
 * @param  {Object}      callback.allBundles    Object containing parsed bundles found on the path. Returns in the form of {'default.properties': ['401=401', '404=404', 'ACCESS_DENIED=Access denied'], 'es_ES.properties': ['401=401', '404=404', 'ACCESS_DENIED=Acceso denegado']}
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
    var errors = [];
    _.each(availableBundles, function(bundleName) {
        // Read the i18n bundle
        try {
            var bundle = fs.readFileSync(bundlesDir + '/' + bundleName, 'utf-8');
            allBundles[bundleName] = bundle.split(/\n/g);
        } catch (err) {
            errors.push(err);
        }
    });

    if (errors.length > 0) {
        callback(errors);
    } else {
        callback(null, allBundles);
    }
};

/**
 * Write bundles to a given directory
 *
 * @param  {Object}      bundles          Object containing parsed bundles in the form of {'default.properties': ['401=401', '404=404', 'ACCESS_DENIED=Access denied'], 'es_ES.properties': ['401=401', '404=404', 'ACCESS_DENIED=Acceso denegado']}
 * @param  {String}      path             The path to write the bundles to
 * @param  {Function}    callback         Standard callback function
 * @param  {Object}      callback.err     Error object
 */
var writeBundles = exports.writeBundles = function(bundles, path, callback) {
    var errors = [];
    _.each(bundles, function(bundle, bundleName) {
        // Convert the entries array to an entries string
        var bundleString = bundle.join('\n');
        // Write the bundle
        try {
            fs.writeFileSync(path + '/' + bundleName, bundleString, 'utf-8');
        } catch (err) {
            errors.push(err);
        }
    });

    if (errors.length > 0) {
        callback(errors);
    } else {
        callback();
    }
};

/**
 * Get the translations for a specific key in a given bundles object
 *
 * @param  {Object}      bundles                     Object containing parsed bundles in the form of {'default.properties': ['401=401', '404=404', 'ACCESS_DENIED=Access denied'], 'es_ES.properties': ['401=401', '404=404', 'ACCESS_DENIED=Acceso denegado']}
 * @param  {String}      key                         The key to retrieve for every language bundle
 * @param  {Function}    callback                    Standard callback function
 * @param  {Object}      callback.i18nEntries        Object containing the key and translation for every language it's available in. Returns in the form {'Bundle 1 name': 'key=translation', 'Bundle 2 name': 'key=translation'}
 */
var getKeyFromBundles = exports.getKeyFromBundles = function(bundles, key, callback) {
    var i18nEntries = {};
    _.each(bundles, function(bundle, bundlePath) {
        // Loop over every line and, if the key matches the key we need to move, cache it in the `i18nEntries` variable
        _.each(bundle, function(i18nEntry) {
            if (i18nEntry && i18nEntry.split('=')[0].trim() === key) {
                i18nEntries[bundlePath] = i18nEntry;
            }
        });
    });

    callback(i18nEntries);
};

/**
 * Add the translations for a specific key to the provided bundles
 *
 * @param  {Object}      bundles             Object containing parsed bundles in the form of {'default.properties': ['401=401', '404=404', 'ACCESS_DENIED=Access denied'], 'es_ES.properties': ['401=401', '404=404', 'ACCESS_DENIED=Acceso denegado']}
 * @param  {Object}      i18nEntries         Object containing the key and translation for every language it's available in
 * @param  {Function}    callback            Standard callback function
 * @param  {Object}      callback.err        Error object
 * @param  {Object}      callback.bundles    Object containing the bundles where the given key is added to. Returns in the form of {'default.properties': ['401=401', '404=404', 'ACCESS_DENIED=Access denied'], 'es_ES.properties': ['401=401', '404=404', 'ACCESS_DENIED=Acceso denegado']}
 */
var addKeyToBundles = exports.addKeyToBundles = function(bundles, i18nEntries, callback) {
    // Make sure that the key isn't already present in one of the bundles to move the key to
    // to avoid accidentally removing an existing translation
    var exists = [];
    _.each(bundles, function(bundle, bundlePath) {
        _.each(bundle, function(i18nEntry) {
            if (i18nEntries[bundlePath] && i18nEntries[bundlePath].split('=')[0].trim() === i18nEntry.split('=')[0].trim()) {
                exists.push(bundlePath);
            }
        });
    });

    if (exists.length > 0) {
        return callback(new Error('The key to add is already present in ' + exists))
    }

    // Add the entry to the different bundles
    _.each(bundles, function(bundle, bundlePath) {
        if (i18nEntries[bundlePath]) {
            bundle.push(i18nEntries[bundlePath]);
        }
    });

    sortBundles(bundles, function(bundles) {
        callback(null, bundles);
    });
};

/**
 * Delete a given key from the provided bundles
 *
 * @param  {Object}      bundles             Object containing parsed bundles in the form of {'default.properties': ['401=401', '404=404', 'ACCESS_DENIED=Access denied'], 'es_ES.properties': ['401=401', '404=404', 'ACCESS_DENIED=Acceso denegado']}
 * @param  {String}      key                 The key to delete from the bundles
 * @param  {Function}    callback            Standard callback function
 * @param  {Object}      callback.bundles    Object containing the bundles with the provided key removed. Returns in the form of {'default.properties': ['401=401', '404=404', 'ACCESS_DENIED=Access denied'], 'es_ES.properties': ['401=401', '404=404', 'ACCESS_DENIED=Acceso denegado']}
 */
var deleteKeyFromBundles = exports.deleteKeyFromBundles = function(bundles, key, callback) {
    _.each(bundles, function(bundle, bundlePath) {
        var newBundle = [];
        // Loop over every line and, if the key doesn't match add it to the new bundle file we're writing
        _.each(bundle, function(i18nEntry) {
            if (_.isString(i18nEntry) && i18nEntry.split('=')[0].trim() !== key) {
                newBundle.push(i18nEntry);
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
 * @param  {Object}      bundles             Object containing parsed bundles in the form of {'default.properties': ['401=401', '404=404', 'ACCESS_DENIED=Access denied'], 'es_ES.properties': ['401=401', '404=404', 'ACCESS_DENIED=Acceso denegado']}
 * @param  {Function}    callback            Standard callback function
 * @param  {Object}      callback.bundles    Object containing the sorted bundles. Returns in the form of {'default.properties': ['401=401', '404=404', 'ACCESS_DENIED=Access denied'], 'es_ES.properties': ['401=401', '404=404', 'ACCESS_DENIED=Acceso denegado']}
 */
var sortBundles = exports.sortBundles = function(bundles, callback) {
    _.each(bundles, function(i18nEntries, bundleName) {
        // Remove all empty lines from the bundle
        i18nEntries = _.compact(i18nEntries);
        // Sort the keys in the bundle alphabetically
        i18nEntries = i18nEntries.sort(_sortKeys);
        // Add 2 new lines to the end of the bundle as Crowdin will do this automatically
        // and we don't want the diff every time we run our scripts
        i18nEntries.push('');
        i18nEntries.push('');
        bundles[bundleName] = i18nEntries;
    });

    callback(bundles);
};
