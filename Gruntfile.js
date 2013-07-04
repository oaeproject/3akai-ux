/*!
 * Copyright 2013 Apereo Foundation (AF) Licensed under the
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
            'index': ['tests/qunit/tests/unit/*.html']
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
                            '!node_modules/shelljs/**',
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
                    'fileExclusionRegExp': /^(\.|<%= target %>|tests|tools|grunt|shelljs|underscore$|optimist|oae-release-tools)/,
                    'logLevel': 2
                }
            }
        },
        'ver': {
            'oae': {
                'basedir': '<%= target %>/optimized',
                'phases': [
                    {
                        // Rename and hash these folders
                        'folders': [
                            '<%= target %>/optimized/shared/bundles',
                            '<%= target %>/optimized/ui/bundles',
                            '<%= target %>/optimized/admin/bundles',
                            '<%= target %>/optimized/shared/vendor/js/l10n/cultures'
                        ],

                        // Rename and hash these files
                        'files': _hashFiles([
                            '<%= target %>/optimized/shared',
                            '<%= target %>/optimized/ui',
                            '<%= target %>/optimized/admin',
                            '<%= target %>/optimized/docs'
                        ], ['html', 'json', 'ico', 'less'], [
                            '!<%= target %>/optimized/shared/vendor/js/l10n/cultures.*/**',
                            '!<%= target %>/optimized/ui/bundles.*/**',
                            '<%= target %>/optimized/shared/oae/macros/*.html'
                        ]),

                        // Look for and replace references to the above (non-excluded) files and folders in these files
                        'references': [
                            '<%= target %>/optimized/shared/**/*.html',
                            '<%= target %>/optimized/shared/**/*.js',
                            '<%= target %>/optimized/shared/**/*.css',
                            '<%= target %>/optimized/ui/**/*.html',
                            '<%= target %>/optimized/ui/**/*.js',
                            '<%= target %>/optimized/ui/**/*.css',
                            '<%= target %>/optimized/admin/**/*.html',
                            '<%= target %>/optimized/admin/**/*.js',
                            '<%= target %>/optimized/admin/**/*.css',
                            '<%= target %>/optimized/docs/**/*.html',
                            '<%= target %>/optimized/docs/**/*.js',
                            '<%= target %>/optimized/docs/**/*.css',
                            '<%= target %>/optimized/node_modules/oae-*/**/*.html',
                            '<%= target %>/optimized/node_modules/oae-*/**/*.js',
                            '<%= target %>/optimized/node_modules/oae-*/**/*.css',
                            '<%= target %>/optimized/node_modules/oae-*/**/*.json'
                        ]
                    }
                ],
                'version': '<%= target %>/optimized/hashes.json'
            }
        },
        'git-describe': {
            'oae': {}
        },
        ghost: {
            dist: {
                filesSrc: ['tests/casperjs/suites/'],
                // CasperJS test command options
                options: {
                    // Specifies files to be included for each test file
                    includes: [
                      'tests/casperjs/util/users.js'
                    ],
                    // Adds tests from specified files before running the test suite
                    pre: ['tests/casperjs/util/prep.js'],
                    // Adds tests from specified files after running the test suite
                    post: ['tests/casperjs/util/cleanup.js'],
                    // Terminates test suite upon failure of first test
                    failFast: false,
                    // Prints the command given to CasperJS
                    printCommand: true
                }
            }
        }
    });

    // Load tasks from npm modules
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-git-describe');
    grunt.loadNpmTasks('grunt-ver');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-ghost');

    // Task to write the version to a file
    grunt.registerTask('writeVersion', function() {
        this.requires('git-describe');
        var json = grunt.template.process('{"oae:ux-version":"<%= meta.version %>"}');
        grunt.file.write(grunt.config('target') + '/optimized/ui/version.json', json);
    });

    // Task to fill out the nginx config template
    grunt.registerTask('configNginx', function() {
        var infile = './nginx/nginx.json';
        if (shell.test('-f', infile)) {
            var nginxConf = require(infile);
            var template = grunt.file.read('./nginx/nginx.conf');
            grunt.config.set('nginxConf', nginxConf);
            var conf = grunt.template.process(template);
            var outfile = grunt.config('target') + '/optimized/nginx/nginx.conf';
            grunt.file.write(outfile, conf);
            grunt.log.writeln('nginx.conf rendered at '.green + outfile.green);
        } else {
            var msg = 'No ' + infile + ' found, not rendering nginx.conf template';
            grunt.log.writeln(msg.yellow);
        }
    });

    // Task to hash files
    grunt.registerTask('hashFiles', function() {
        this.requires('requirejs');

        // Add the modules as phases to ver:oae
        var oaeModules = grunt.file.expand({filter:'isDirectory'}, grunt.config('target') + '/optimized/node_modules/oae-*/*');
        oaeModules.forEach(function(module) {
            grunt.log.writeln(module);
            var conf = {
                'folders': [ module + '/bundles' ],
                'files': _hashFiles([module], ['json']),
                'references': [
                    module + '/**/*.html',
                    module + '/**/*.js',
                    module + '/**/*.css',
                    module + '/*.json'
                ]
            };
            grunt.config.set('ver.' + module + '.basedir', module);
            grunt.config.set('ver.' + module + '.phases', [conf]);
            grunt.task.run('ver:' + module);
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

        shell.mkdir('-p', outputDir);
        shell.cp('-R', ['./' + grunt.config('target') + '/*', './README.md', './LICENSE', './COMMITTERS.txt'], outputDir);
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

    // Override the test task with the grunt-ghost task that runs casperjs
    grunt.registerTask('test', ['ghost']);

    // Default task.
    grunt.registerTask('default', ['clean', 'copy', 'git-describe', 'requirejs', 'hashFiles', 'writeVersion', 'configNginx']);
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
