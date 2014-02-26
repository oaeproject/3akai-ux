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
var shell = require('shelljs');
var util = require('util');
var vm = require('vm');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        'pkg': '<json:package.json>',
        'meta': {
            'banner': '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                      '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        'target': process.env['DESTDIR'] || 'target',
        'qunit': {
            'files': ['tests/qunit/tests/*.html']
        },
        'lint': {
            'files': [
                'grunt.js',
                'admin/**/*.js',
                'shared/**/*.js',
                'ui/**/*.js',
                'node_modules/oae-*/**/*.js',
                '!node_modules/oae-release-tools/**'
            ]
        },
        'watch': {
            'files': '<config:lint.files>',
            'tasks': 'lint test'
        },
        'jshint': {
            'options': {
                'sub': true
            },
            'globals': {
                'exports': true,
                'module': false
            }
        },
        'clean': {
            'folder': '<%= target %>/'
        },
        'copy': {
            'main': {
                'files': [
                    {
                        'expand': true,
                        'src': [
                            '**',
                            '!<%= target %>/**',
                            '!tests/**',
                            '!tools/**',
                            '!node_modules/.*/**',
                            '!node_modules/grunt*/**',
                            '!node_modules/oae-release-tools/**',
                            '!node_modules/optimist/**',
                            '!node_modules/properties-parser/**',
                            '!node_modules/readdirp/**',
                            '!node_modules/underscore/**'
                        ],
                        'dest': '<%= target %>/original'
                    }
                ]
            }
        },
        'requirejs': {
            'optimize': {
                'options': {
                    'appDir': './',
                    'baseUrl': './shared',
                    'mainConfigFile': './shared/oae/api/oae.bootstrap.js',
                    'dir': '<%= target %>/optimized',
                    'optimize': 'uglify',
                    'preserveLicenseComments': false,
                    'optimizeCss': 'standard',
                    'cssImportIgnore': null,
                    'inlineText': true,
                    'useStrict': false,
                    'pragmas': {},
                    'skipPragmas': false,
                    'skipModuleInsertion': false,
                    'modules': [{
                        'name': 'oae.core',
                        'exclude': ['jquery']
                    }],
                    'fileExclusionRegExp': /^(\.|<%= target %>|tests|tools|grunt|optimist|properties-parser|readdirp|underscore$|shelljs$|oae-release-tools)/,
                    'logLevel': 2
                }
            }
        },
        'ver': {
            'oae': {
                'basedir': '<%= target %>/optimized',
                'phases': [

                    /*!
                     * In the first phase, we hash all the bundle and culture folders and replace
                     * their references in just the shared JS files as those are the only places
                     * we have references to them.
                     */
                    {
                        'folders': [
                            '<%= target %>/optimized/shared/bundles',
                            '<%= target %>/optimized/ui/bundles',
                            '<%= target %>/optimized/admin/bundles',
                            '<%= target %>/optimized/shared/vendor/js/l10n/cultures'
                        ],
                        'references': _replacementReferences(['shared'], ['js'])
                    },

                    /*!
                     * In the second phase, we hash just files that are not going to have
                     * references to other hashed files. That's basically everything except
                     * JS and CSS files so those file extensions are excluded. Additionally,
                     * the following types of files are excluded:
                     *
                     *  * We do not hash HTML files because they aren't cached
                     *  * We do not hash the JSON files (e.g., manifest.json)
                     *  * We do not hash the favicon (ico) because it is a browser standard file
                     *  * We do not hash less files because they are programmatically access
                     *  * We exclude the directories that have already been hashed (bundles and cultures)
                     *
                     * TODO: Remove "custom" when there is a proper landing page customization strategy
                     */
                    {
                        'files': _hashFiles([
                            '<%= target %>/optimized/admin',
                            '<%= target %>/optimized/custom',
                            '<%= target %>/optimized/docs',
                            '<%= target %>/optimized/shared',
                            '<%= target %>/optimized/ui'
                        ], ['css', 'html', 'ico', 'js', 'json', 'less'], [
                            '!<%= target %>/optimized/shared/vendor/js/l10n/cultures.*/**',
                            '!<%= target %>/optimized/ui/bundles.*/**'
                        ]),
                        'references': _replacementReferences([
                            'admin',
                            'custom',
                            'docs',
                            'node_modules/oae-*',
                            'shared',
                            'ui'
                        ], ['css', 'html', 'js'], [
                            '<%= target %>/optimized/shared/oae/macros/*.html'
                        ])
                    },

                    /*!
                     * In the third phase, we hash the macros and apply any replacements to the JS
                     * files in the shared directory.
                     */
                    {
                        'files': ['<%= target %>/optimized/shared/oae/macros/*.html'],
                        'references': ['<%= target %>/optimized/shared/**/*.js']
                    },

                    /*!
                     * In the fourth phase, we hash JavaScript, CSS, HTML (macro) files of the /shared
                     * directory and replace all HTML and JS files with them. CSS files don't
                     * need replacement because a CSS file will never references another CSS
                     * or JavaScript (@import statements are inlined). Here we don't worry about
                     * JS-to-JS references because those are aliased inside oae.bootstrap.js
                     *
                     * TODO: Remove "custom" when there is a proper landing page customization strategy
                     */
                    {
                        'files': [
                            '<%= target %>/optimized/shared/**/*.js',
                            '<%= target %>/optimized/shared/**/*.css',
                            '!<%= target %>/optimized/shared/vendor/js/l10n/cultures.*/**'
                        ],
                        'references': _replacementReferences([
                            'admin',
                            'custom',
                            'docs',
                            'node_modules/oae-*',
                            'shared',
                            'ui'
                        ], ['html', 'js'], [
                            '<%= target %>/optimized/shared/oae/macros/*.html'
                        ])
                    },

                    /*!
                     * In the fifth phase, we hash the JS directories of all the actual UIs like
                     * /admin, /ui etc... We need to hash the directory because there are JS-to-JS
                     * references that can't be reliably processed such that hashes are created
                     * after inline replacement of paths have occurred. By hashing the directory we
                     * ensure that all JS files are invalidated as a group and so don't wind up with
                     * indirect references that don't properly update a hash.
                     *
                     * We also hash the CSS files and perform the necessary replacements.
                     *
                     * TODO: Remove "custom" when there is a proper landing page customization strategy
                     */
                    {
                        'folders': [
                            '<%= target %>/optimized/admin/js',
                            '<%= target %>/optimized/custom/js',
                            '<%= target %>/optimized/docs/js',
                            '<%= target %>/optimized/ui/js'
                        ],
                        'files': [
                            '<%= target %>/optimized/admin/**/*.css',
                            '<%= target %>/optimized/docs/**/*.css',
                            '<%= target %>/optimized/custom/**/*.css',
                            '<%= target %>/optimized/ui/**/*.css'
                        ],
                        'references': _replacementReferences([
                            'admin',
                            'custom',
                            'docs',
                            'node_modules/oae-*',
                            'ui'
                        ], ['html', 'js'], [
                            '<%= target %>/optimized/shared/oae/macros/*.html'
                        ])
                    }
                ],
                'version': '<%= target %>/optimized/hashes.json'
            }
        },
        'git-describe': {
            'oae': {}
        },
        'casperjs': {
            options: {},
            files: ['tests/casperjs/suites/*.js']
        }
    });

    // Load tasks from npm modules
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-git-describe');
    grunt.loadNpmTasks('grunt-ver');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-casperjs');

    // Task to write the version to a file
    grunt.registerTask('writeVersion', function() {
        this.requires('git-describe');
        var json = grunt.template.process('{"oae:ux-version":"<%= meta.version %>"}');
        grunt.file.write(grunt.config('target') + '/optimized/ui/version.json', json);
    });

    // Task to fill out the nginx config template
    grunt.registerTask('configNginx', function() {
        var infile = './nginx/nginx.json';
        if (grunt.file.exists(infile)) {
            var nginxConfig = require(infile);
            var template = grunt.file.read('./nginx/nginx.conf');
            grunt.config.set('nginxConf', nginxConfig);
            var config = grunt.template.process(template);
            var outfile = grunt.config('target') + '/optimized/nginx/nginx.conf';
            grunt.file.write(outfile, config);
            grunt.log.writeln('nginx.conf rendered at '.green + outfile.green);
        } else {
            var msg = 'No ' + infile + ' found, not rendering nginx.conf template';
            grunt.log.writeln(msg.yellow);
        }
    });

    // Task to place an update slug on the oae.bootstrap.js file so that it always gets a new hash in a
    // build. This is needed because we do post-hash updates on the file to update module references and
    // if module reference hashes change, it's possible the oae.bootstrap.js file won't get a new hash
    // as a result
    grunt.registerTask('touchBootstrap', function() {
        // Just place a comment in the file with the current timestamp
        util.format('\n// Date Built: %d', Date.now()).toEnd(util.format('%s/optimized/shared/oae/api/oae.bootstrap.js', grunt.config('target')));
    });

    // Task to hash files
    grunt.registerTask('hashFiles', function() {
        this.requires('requirejs');
        this.requires('touchBootstrap');

        // Add a new ver task for each module that needs to be optimized
        var oaeModules = grunt.file.expand({filter:'isDirectory'}, grunt.config('target') + '/optimized/node_modules/oae-*/*');
        oaeModules.forEach(function(module) {
            grunt.log.writeln(module);

            var moduleReferences = [
                util.format('%s/**/*.css', module),
                util.format('%s/**/*.html', module),
                util.format('%s/**/*.js', module),
                util.format('%s/**/*.json', module)
            ];

            var phases = [

                /*!
                 * First, hash all files that do not have references to other files. That's
                 * basically everything except HTML, JS, CSS files. Additionally, we
                 * don't hash the following:
                 *
                 *  * properties files aren't hashed, because the bundles directory itself
                 *    is hashed
                 *  * JSON files (manifest.json) aren't hashed because it needs to have a
                 *    deterministic name
                 */
                {
                    'files': _hashFiles([module], ['css', 'html', 'js', 'json', 'properties']),
                    'references': moduleReferences.slice()
                },

                /*!
                 * Second, hash the bundles directories of the widgets
                 */
                {
                    'folders': [
                        util.format('%s/bundles', module)
                    ],
                    'references': moduleReferences.slice()
                },

                /*!
                 * Third, hash the remainder of the files (CSS, HTML and JS)
                 *
                 * TODO:
                 *
                 * Hashing JS files only once in this way is rather unstable. There is an issue such
                 * that if one JS file references another, and that other JS file changes, the hash
                 * of the JS file that references it will not get updated. Either the hashing cycle
                 * needs to happen a safe number of times (e.g., hashing 3 times may secure JS
                 * reference chains of depth 3), or there should be a better strategy to catch changes
                 * in JS files. Directory hashing on the js/ directory does not work because it
                 * results in all strings of "js" to be replaced in the widget files, which catches
                 * things like: /shared/vendor/js/... for example, thus breaking those references.
                 *
                 * At this time there is no known manifestation of this issue in widgets, but it
                 * needs to be addressed before chains of JS files using require.js is possible in
                 * widgets.
                 *
                 * See https://github.com/oaeproject/3akai-ux/issues/3551 for more information.
                 */
                {
                    'files': [
                        util.format('%s/**/*.css', module),
                        util.format('%s/**/*.html', module),
                        util.format('%s/**/*.js', module)
                    ],
                    'references': moduleReferences.slice()
                }
            ];

            grunt.config.set(util.format('ver.%s.basedir', module), module);
            grunt.config.set(util.format('ver.%s.phases', module), phases);
            grunt.task.run(util.format('ver:%s', module));
        });

        grunt.task.run('ver:oae');
        grunt.task.run('updateBootstrapPaths');

    });

    // Task to update the paths in oae.bootstrap to the hashed versions
    grunt.registerTask('updateBootstrapPaths', function() {
        this.requires('ver:oae');

        var basedir = grunt.config('target') + '/optimized/';
        var hashedPaths = require('./' + grunt.config.get('ver.oae.version'));
        var bootstrapPath = basedir + hashedPaths['/shared/oae/api/oae.bootstrap.js'];
        var bootstrap = grunt.file.read(bootstrapPath);
        var regex = /("|')?paths("|')?: ?\{[^}]*\}/;
        var scriptPaths = 'paths = {' + bootstrap.match(regex)[0] + '}';

        var paths = vm.runInThisContext(scriptPaths).paths;

        // Update the bootstrap file with the hashed paths
        Object.keys(paths).forEach(function(key) {
            var prefix = '/shared/';
            var path = prefix + paths[key] + '.js';
            var hashedPath = '';
            if (hashedPaths[path]) {
                hashedPath = hashedPaths[path];
                // trim off prefix and .js
                paths[key] = hashedPath.substring(prefix.length, hashedPath.length - 3);
            }
        });
        bootstrap = bootstrap.replace(regex, 'paths:' + JSON.stringify(paths));
        grunt.file.write(bootstrapPath, bootstrap);
        grunt.log.writeln('Boots strapped'.green);
    });

    // A task that will copy the release files to a directory of your choosing
    grunt.registerTask('copyReleaseArtifacts', function(outputDir) {
        if (!outputDir) {
            return grunt.log.writeln('Please provide a path where the release files should be copied to'.red);
        }

        var config = {
            'files': [
                {
                    'expand': true,
                    'src': ['./<%= grunt.config("target") %>/*', './README.md', './LICENSE', './COMMITTERS.txt'],
                    'dest': outputDir
                }
            ]
        };
        grunt.config.set('copy.release', config);
        grunt.task.run('copy:release');
    });

    // Release task.
    // This essentially runs the default task and then copies the target directory to the `outputDir`
    //
    // Example:
    //    grunt release:/tmp/release
    //
    // This will run the entire UI build (minification, hashing, nginx config, etc, ..) and create the following folders:
    //    /tmp/release/optimized  -  contains the minified UI sources
    //    /tmp/release/original   -  contains the original UI files
    grunt.registerTask('release', function(outputDir) {
        if (!outputDir) {
            return grunt.log.writeln('Please provide a path where the release files should be copied to'.red);
        }

        // Run the default task that will minify and hash all the UI files.
        grunt.task.run('default');

        // Copy the minified and original files to the output directory
        // and give them the proper names so no config changes in Hilary need to occur
        grunt.task.run('copyReleaseArtifacts:' + outputDir);
    });

    // Wrap the QUnit task
    grunt.renameTask('qunit', 'contrib-qunit');
    grunt.registerTask('qunit', function(host) {
        // Fall back to the `qunit-host` option
        host = host || grunt.option('qunit-host');
        if (!host) {
            return grunt.fail.fatal('Please provide a link to a running OAE instance. e.g. `grunt qunit:tenant1.oae.com` or `grunt qunit --qunit-host tenant1.oae.com`');
        }

        var urls = _.map(grunt.file.expand(grunt.config.get('qunit.files')), function(file) {
            return 'http://' + host + '/' + file;
        });
        var config = {'options': {'urls': urls}};
        grunt.config.set('contrib-qunit.all', config);
        grunt.task.run('contrib-qunit');
    });

    // Run the CasperJS and QUnit tests
    grunt.registerTask('test', ['casperjs', 'qunit']);

    // Default task for production build
    grunt.registerTask('default', ['clean', 'copy', 'git-describe', 'requirejs', 'touchBootstrap', 'hashFiles', 'writeVersion', 'configNginx']);
};

/**
 * Generate the standard replacement references for the given resource directories, and also
 * include the provided "extra" replacement files.
 *
 * @param  {String[]}   dirs            The directory names (located in <target>/optimized) whose resource paths should be replaced
 * @param  {String[]}   includeExts     The file extensions that should have replacement performed
 * @param  {String[]}   extra           Additional replacements to perform
 * @return {String[]}                   The full derived list of all resources that replacement should be performed
 */
var _replacementReferences = function(dirs, includeExts, extra) {
    var replacements = (_.isArray(extra)) ? extra.slice() : [];

    _.each(dirs, function(dir) {
        _.each(includeExts, function(ext) {
            replacements.push(util.format('<%= target %>/optimized/%s/**/*.%s', dir, ext));
        });
    });

    return replacements;
};

/**
 * Generate the glob expressions to match all files that have extensions that are supposed to be hashed (as defined
 * by `HASHED_EXTENSIONS`). You can optionally exclude extensions for special cases.
 *
 * @param  {String[]}   directories     The list of directories whose files to hash
 * @param  {String[]}   [excludeExts]   The extensions to exclude from the list of `HASHED_EXTENSIONS`, if any
 * @param  {String[]}   [extra]         Extra glob patterns to append, in addition to the ones added for the extensions
 * @return {String[]}                   An array of glob expressions that match the files to hash in the directories
 * @api private
 */
var _hashFiles = function(directories, excludeExts, extra) {
    excludeExts = excludeExts || [];
    var globs = [];
    directories.forEach(function(directory) {
        globs.push(util.format('%s/**', directory));
        excludeExts.forEach(function(ext) {
            // Exclude both direct children of the exlucded extensions, and all grandchildren
            globs.push(util.format('!%s/*.%s', directory, ext));
            globs.push(util.format('!%s/**/*.%s', directory, ext));
        });
    });

    return (extra) ? _.union(globs, extra) : globs;
};
