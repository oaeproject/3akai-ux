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

var argv = require('optimist')
    .usage('Usage: $0 -a <crowdin API key>')

    .demand('a')
    .alias('a', 'apiKey')
    .describe('a', 'Crowdin API key')

    .demand('r')
    .alias('r', 'rootDir')
    .describe('r', 'Absolute path to the 3akai-ux root directory')
    .argv;

var _ = require('underscore');
var fs = require('fs');
var propertiesParser = require('properties-parser');
var readdirp = require('readdirp');
var shelljs = require('shelljs');
var util = require('util');

// Extract the API key from the provided command line parameter
// @see http://crowdin.net/project/apereo-oae/settings
var apiKey = argv.apiKey;
// Extract the 3akai-ux root directory
var rootDir = argv.rootDir;
var crowdinDir = rootDir + '/tools/crowdin';


/**
 * Download the crowdin synchronization JAR file. If the file is already in place, it will
 * not be re-downloaded
 *
 * @param  {Function}     callback              Standard callback function
 */
var downloadCrowdinLibrary = function(callback) {
    // Check whether or not the JAR file is already in place
    var exists = fs.existsSync(crowdinDir + '/crowdin-cli.jar');
    if (exists) {
        callback();
    } else {
        // Download the JAR file
        console.log('Downloading crowdin JAR file');
        shelljs.exec(util.format('curl http://crowdin.net/downloads/crowdin-cli.jar > %s/crowdin-cli.jar', crowdinDir), {}, callback);
    }
};

/**
 * Generate the YAML file that will be used to communicate with the crowdin synchronization API
 * @see http://crowdin.net/page/cli-tool
 */
var generateYaml = function() {
    // Read the YAML template file
    var data = fs.readFileSync(crowdinDir + '/crowdin.template', 'utf-8');

    // Parse the underscore.js template and render it with the provided API key and root directory
    var template = _.template(data);
    var yaml = template({
        'apiKey': apiKey,
        'rootDir': rootDir
    });

    // Save the YAML template file
    fs.writeFileSync(crowdinDir + '/crowdin.yaml', yaml, 'utf-8');
    console.log('Generated YAML file');
};

/**
 * Synchronize the translations in the current branch with the translations on crowdin.
 *
 *  1. Upload the latest keys to crowdin
 *  2. Upload the latest translations to crowdin
 *  3. Download the latest translations from crowdin
 *
 * @param  {Function}     callback              Standard callback function
 */
var synchronizeTranslations = function(callback) {
    // Upload the latest set of available i18n keys to crowdin. This will add new keys to the list of keys
    // to translate and will remove keys that have been removed in the codebase from the list of keys to
    // translate
    shelljs.exec(util.format('cd %s; java -jar crowdin-cli.jar upload sources', crowdinDir), {}, function() {
        // Upload the latest translations to crowdin. This will update any translations that have been updated
        // in the codebase directly on crowdin. This is done before downloading the translations from crowdin, as
        // core development will end up updating the translations directly most of the time, and we want to avoid
        // overriding those changes with the translations on crowdin
        shelljs.exec(util.format('cd %s; java -jar crowdin-cli.jar upload translations', crowdinDir), {}, function() {
            // Download the latest updated translations from crowdin
            shelljs.exec(util.format('cd %s; java -jar crowdin-cli.jar download', crowdinDir), {}, function() {
                callback();
            });
        });
    });
};

/**
 * Extract the paths of all the available bundles (.properties files) in the code base
 *
 * @param  {Function}     callback              Standard callback function
 * @param  {String[]}     callback.bundles      List of paths for the available bundles
 */
var collectBundles = function(callback) {
    var bundles = [];

    // Loop through all available core and widget translation bundles and store their paths
    readdirp({ 'root': rootDir, 'fileFilter': '*.properties' }, function(entry) {
        bundles.push(entry.fullPath);
    }, function(err, res) {
        callback(bundles);
    });
};

/**
 * Remove the empty language bundles from the list of provided bundles
 *
 * @param  {String[]}     bundles               List of paths for the available bundles
 * @return {String[]}                           Updated list of paths for the available bundles, excluding all empty bundles
 */
var removeEmptyBundles = function(bundles) {
    // Keep track of all empty bundles
    var bundlesToRemove = [];

    _.each(bundles, function(bundle) {
        var i18nKeys = propertiesParser.read(bundle);
        // Remove empty bundles from the file system
        if (_.keys(i18nKeys).length === 0) {
            bundlesToRemove.push(bundle);
            fs.unlinkSync(bundle);
            console.log('Removed empty bundle: ' + bundle);
        }
    });

    // Remove the empty bundles from the list of bundles
    return _.difference(bundles, bundlesToRemove);
};

/**
 * Update the widget manifest files to reflect the available languages for each widget
 *
 * @param  {String[]}     bundles               List of paths for the available bundles
 */
var updateWidgetManifests = function(bundles) {
    // Loop through all widget manifests
    readdirp({ 'root': rootDir, 'fileFilter': 'manifest.json' }, function(entry) {
        // Load the widget manifest
        var widgetManifest = require(entry.fullPath);

        // Get the list of bundles with translations for this widget
        var widgetLanguages = {};
        _.each(bundles, function(bundle) {
            if (bundle.indexOf(entry.fullParentDir + '/') === 0) {
                var language = bundle.split('/').pop().split('.')[0];
                widgetLanguages[language] = 'bundles/' + language + '.properties';
            }
        });

        // Add the languages to the widget manifest file
        if (_.keys(widgetLanguages).length) {
            widgetManifest['i18n'] = widgetLanguages;
        // If no languages are available for the current widget, the i18n property
        // is removed from the manifest file
        } else {
            delete widgetManifest['i18n'];
        }

        // Re-publish the manifest file
        fs.writeFileSync(entry.fullPath, JSON.stringify(widgetManifest, null, 4) + '\n');
    }, function() {});
};


// 1. Download the crowdin JAR file
downloadCrowdinLibrary(function() {
    // 2. Generate the YAML file
    generateYaml();
    // 3. Synchronize the translations in the current branch with the translations on crowdin
    synchronizeTranslations(function() {
        // 4. Collect the available language bundles
        collectBundles(function(bundles) {
            // 5. Remove the bundles that don't have any translations in them
            bundles = removeEmptyBundles(bundles);
            // 6. Update widget manifests to only include existing bundles
            updateWidgetManifests(bundles);
        });
    });
});
