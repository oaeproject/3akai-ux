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
        'csslint': {
            'options': {
                'ids': false        // ignore "Don't use IDs in CSS selectors" warning
            },
            'files': [
                'admin/**/*.css',
                'shared/oae/**/*.css',
                'ui/**/*.css',
                'node_modules/oae-*/**/*.css',
                '!node_modules/oae-release-tools/**'
            ]
        },
        'jshint': {
            'options': {
                'sub': true
            },
            'files': [
                'admin/**/*.js',
                'shared/oae/**/*.js',
                'ui/**/*.js',
                'node_modules/oae-*/**/*.js',
                '!node_modules/oae-release-tools/**'
            ]
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
                    // TODO: Replace this with a saner value
                    // @see https://github.com/jrburke/r.js/pull/653
                    'cssImportIgnore': '//fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,400,300,600,700&subset=latin,cyrillic-ext,latin-ext,greek-ext',
                    'inlineText': true,
                    'useStrict': false,
                    'pragmas': {},
                    'skipPragmas': false,
                    'skipModuleInsertion': false,
                    'modules': [{
                        'name': 'oae.core',
                        'exclude': ['jquery']
                    }],
                    'fileExclusionRegExp': /^(\.|<%= target %>|tests|tools|grunt|optimist|properties-parser|readdirp|underscore$|shelljs$|oae-release-tools|robots\.txt)/,
                    'logLevel': 2
                }
            }
        },
        'ver': {
            'oae': {
                'basedir': '<%= target %>/optimized',
                'phases': [

                    /*!
                     * In the first phase, we hash the contents of all the shared bundle and culture
                     * folders and rename the foler to contain the hash. All references to the
                     * original folder name are replaced with the hashed version in just the shared
                     * JS files as those are the only places we have references to them.
                     */
                    {
                        'folders': [
                            '<%= target %>/optimized/shared/oae/bundles/ui',
                            '<%= target %>/optimized/shared/oae/bundles/email',
                            '<%= target %>/optimized/shared/vendor/js/l10n/cultures'
                        ],
                        'references': [
                            '<%= target %>/optimized/shared/**/*.js'
                        ]
                    },

                    /*!
                     * In the second phase, we hash just files that are not going to have
                     * references to other hashed files. That's basically everything except
                     * JS and CSS files so those file extensions are excluded. Additionally,
                     * the following types of files are excluded:
                     *
                     *  * We do not hash HTML files because they aren't cached
                     *  * We do not hash JS and CSS files because they are handled separately in a later phase
                     *  * We do not hash the JSON files (e.g., manifest.json) because they are not referenced as assets by the UI, only by the oae-ui Hilary module
                     *  * We do not hash the favicon (*.ico) because it is a browser standard file
                     *  * We do not hash less files because they are programmatically accessed
                     *  * We exclude the directories that have already been hashed (bundles and cultures)
                     *
                     * TODO: Remove "custom" when there is a proper landing page customization strategy
                     */
                    {
                        'files': _hashFiles({
                            'directories': [
                                '<%= target %>/optimized/admin',
                                '<%= target %>/optimized/custom',
                                '<%= target %>/optimized/docs',
                                '<%= target %>/optimized/shared',
                                '<%= target %>/optimized/ui'
                            ],
                            'excludeExts': [
                                'css',
                                'html',
                                'ico',
                                'js',
                                'json',
                                'less'
                            ],
                            'extra': [
                                '!<%= target %>/optimized/shared/oae/bundles/email.*/**',
                                '!<%= target %>/optimized/shared/oae/bundles/ui.*/**',
                                '!<%= target %>/optimized/shared/vendor/js/l10n/cultures.*/**'
                            ]
                        }),
                        'references': _replacementReferences({
                            'directories': [
                                '<%= target %>/optimized/admin',
                                '<%= target %>/optimized/custom',
                                '<%= target %>/optimized/docs',
                                '<%= target %>/optimized/node_modules/oae-*',
                                '<%= target %>/optimized/shared',
                                '<%= target %>/optimized/ui'
                            ],
                            'includeExts': [
                                'css',
                                'html',
                                'js'
                            ],
                            'extra': [
                                '<%= target %>/optimized/shared/oae/macros/*.html'
                            ]
                        })
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
                        'references': _replacementReferences({
                            'directories': [
                                '<%= target %>/optimized/admin',
                                '<%= target %>/optimized/custom',
                                '<%= target %>/optimized/docs',
                                '<%= target %>/optimized/node_modules/oae-*',
                                '<%= target %>/optimized/shared',
                                '<%= target %>/optimized/ui'
                            ],
                            'includeExts': [
                                'html',
                                'js'
                            ],
                            'extra': [
                                '<%= target %>/optimized/shared/oae/macros/*.html'
                            ]
                        })
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
                        'references': _replacementReferences({
                            'directories': [
                                '<%= target %>/optimized/admin',
                                '<%= target %>/optimized/custom',
                                '<%= target %>/optimized/docs',
                                '<%= target %>/optimized/node_modules/oae-*',
                                '<%= target %>/optimized/ui'
                            ],
                            'includeExts': [
                                'html',
                                'js'
                            ],
                            'extra': [
                                '<%= target %>/optimized/shared/oae/macros/*.html'
                            ]
                        })
                    }
                ],
                'version': '<%= target %>/optimized/hashes.json'
            }
        },
        'replace': {
            'url': 'URL pointing to a CDN that gets set by the cdn task',
            'main': {
                'src': [
                    'target/optimized/ui/*.html',
                    'target/optimized/ui/custom/*.html',
                    'target/optimized/admin/*.html',
                    'target/optimized/shared/oae/api/oae.bootstrap.*.js',
                    'target/optimized/shared/oae/api/oae.core.*.js'
                ],
                'overwrite': true,
                'replacements': [
                    {
                        'from': /(src)="\/(.+?)"/ig,
                        'to': function(matchedWord, index, fullText, regexMatches) {
                            return _cdnifyStaticAsset(grunt.config('replace').url, matchedWord, index, fullText, regexMatches);
                        }
                    },
                    {
                        'from': /(data-loadmodule)="\/(.+?)"/ig,
                        'to': function(matchedWord, index, fullText, regexMatches) {
                            return _cdnifyStaticAsset(grunt.config('replace').url, matchedWord, index, fullText, regexMatches);
                        }
                    },
                    {
                        'from': /(data-main)="\/(.+?)"/ig,
                        'to': function(matchedWord, index, fullText, regexMatches) {
                            return _cdnifyStaticAsset(grunt.config('replace').url, matchedWord, index, fullText, regexMatches);
                        }
                    },
                    {
                        'from': /(<link.*?href)="\/(.+?)"/ig,
                        'to': function(matchedWord, index, fullText, regexMatches) {
                            return _cdnifyStaticAsset(grunt.config('replace').url, matchedWord, index, fullText, regexMatches);
                        }
                    },
                    {
                        // Replace the require base URL
                        'from': /requirejs\.config\(\{baseUrl:"\/shared\/",/,
                        'to': function(matchedWord, index, fullText, regexMatches) {
                            // The URL of our CDN
                            var cdn = grunt.config('replace').url;

                            // Return the attribute with our CDN in it
                            return util.format('requirejs.config({baseUrl:"%s/shared/",', cdn);
                        }
                    },
                    {
                        // We're loading in a globalize culture dynamically that can
                        // be loaded from our CDN
                        'from': /require\(\["\/shared\/vendor\/js\/l10n\/cultures\./,
                        'to': function(matchedWord, index, fullText, regexMatches) {
                            // The URL of our CDN
                            var cdn = grunt.config('replace').url;

                            // Return the attribute with our CDN in it
                            return util.format('require(["%s/shared/vendor/js/l10n/cultures\.', cdn);
                        }
                    }
                ]
            },
            'core-widgets': {
                'src': [
                    'target/optimized/node_modules/oae-core/**/*.html'
                ],
                'overwrite': true,
                'replacements': [
                    {
                        // Replace the CSS paths in the oae-core widgets
                        'from': /href="css\/([a-z]+?)\.([a-z0-9]+?).css"/,
                        'to': function(matchedWord, index, fullText, regexMatches) {
                            var cdn = grunt.config('replace').url;
                            return util.format('href="%s/node_modules/oae-core/%s/css/%s.%s.css"', cdn, regexMatches[0], regexMatches[0], regexMatches[1]);
                        }
                    },
                    {
                        // Replace the JS paths in the oae-core widgets
                        'from': /src="js\/([a-z]+?)\.([a-z0-9]+?).js"/,
                        'to': function(matchedWord, index, fullText, regexMatches) {
                            var cdn = grunt.config('replace').url;
                            return util.format('src="%s/node_modules/oae-core/%s/js/%s.%s.js"', cdn, regexMatches[0], regexMatches[0], regexMatches[1]);
                        }
                    }
                ]
            },
            'admin-widgets': {
                'src': [
                    'target/optimized/node_modules/oae-admin/**/*.html'
                ],
                'overwrite': true,
                'replacements': [,
                    {
                        'from': /href="css\/([a-z]+?)\.([a-z0-9]+?).css"/,
                        'to': function(matchedWord, index, fullText, regexMatches) {
                            var cdn = grunt.config('replace').url;
                            return util.format('href="%s/node_modules/oae-admin/%s/css/%s.%s.css"', cdn, regexMatches[0], regexMatches[0], regexMatches[1]);
                        }
                    },
                    {
                        'from': /src="js\/([a-z]+?)\.([a-z0-9]+?).js"/,
                        'to': function(matchedWord, index, fullText, regexMatches) {
                            var cdn = grunt.config('replace').url;
                            return util.format('src="%s/node_modules/oae-admin/%s/js/%s.%s.js"', cdn, regexMatches[0], regexMatches[0], regexMatches[1]);
                        }
                    }
                ]
            }
        },
        'git-describe': {
            'oae': {}
        },
        'ghost': {
            'dist': {
                'filesSrc': [
                    'node_modules/oae-*/*/tests/*.js',
                    'shared/oae/**/tests/*.js',
                    'ui/tests/*.js'
                ],
                // CasperJS test command options
                'options': {
                    // Specify the files to be included in each test
                    'includes': [
                        'tests/casperjs/util/include/admin.js',
                        'tests/casperjs/util/include/config.js',
                        'tests/casperjs/util/include/content.js',
                        'tests/casperjs/util/include/discussions.js',
                        'tests/casperjs/util/include/folders.js',
                        'tests/casperjs/util/include/follow.js',
                        'tests/casperjs/util/include/groups.js',
                        'tests/casperjs/util/include/ui.js',
                        'tests/casperjs/util/include/users.js',
                        'tests/casperjs/util/include/util.js'
                    ],
                    // Prepare te testing environment before starting the tests
                    'pre': ['tests/casperjs/util/prep.js'],
                    // Don't stop casperjs after first test failure
                    'failFast': false
                }
            }
        },
        'exec': {
            'runCasperTest': {
                'cmd': function(path) {
                    var includes = grunt.config('ghost').dist.options.includes;
                    var pre = grunt.config('ghost').dist.options.pre;

                    return 'casperjs test --includes=' + includes + ' --pre=' + pre + ' ' + path;
                }
            },
            'startDependencies': {
                cmd: 'node tests/casperjs/startDependencies.js'
            }
        }
    });

    // Load tasks from npm modules
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-git-describe');
    grunt.loadNpmTasks('grunt-ver');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-ghost');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-text-replace');

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
                    'files': _hashFiles({
                        'directories': [module],
                        'excludeExts': ['css', 'html', 'js', 'json', 'properties']
                    }),
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
                 * Third, hash just the JS files and CSS files so their references can be updated in
                 * the HTML files.
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
                 * In this replacement phase, we are only replacing references in HTML files, since
                 * any references to these files by non-HTML files will otherwise result in less
                 * obvious issues that can only be caught with meticulous cache-upgrade testing which
                 * is difficult to get right and very time consuming.
                 *
                 * See https://github.com/oaeproject/3akai-ux/issues/3551 for more information.
                 */
                {
                    'files': [
                        util.format('%s/**/*.css', module),
                        util.format('%s/**/*.js', module)
                    ],
                    'references': [util.format('%s/**/*.html', module)]
                },

                /*!
                 * Fourth, now that references for all other files have been replaced, finally
                 * hash the HTML files of the widget, replacing the reference in the `manifest.json`
                 * file, as that is the only place the optimization workflow has accounted for them
                 * to be referenced.
                 *
                 * This optimization phase is intentionally only accounting for the setup that the
                 * `manifest.json` file is the only reference to a widget HTML file. If a situation
                 * arises that the `manifest.json` is not the only file that references an HTML file
                 * (e.g., a JS file referencing an HTML widget macro file), then there are indirect
                 * cache invalidation issues that will almost certainly start happeningf if the macro
                 * file is updated and gets a new hash, but the JS file is not. By limiting this to
                 * the `manifest.json` for now, we can more explicitly visit this issue when it is
                 * obvious in testing, rather than it becoming an intermittent production cache issue
                 * first.
                 */
                {
                    'files': [util.format('%s/**/*.html', module)],
                    'references': [util.format('%s/**/*.json', module)]
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

    // Task to update the paths so static assets are pulled from the CDN.
    // The CDN URL can be provided as
    //  - an environment variable: e.g., `CDN_URL="https://cdn.example.com" grunt cdn`
    //  - a grunt parameter: e.g., `grunt cdn:https\://cdn.example.com`
    // If no CDN is provided, this task will do nothing
    grunt.registerTask('cdn', function(url) {
        url = url || process.env['CDN_URL'];
        if (url) {
            // Pass the URL of the CDN to the replacement task
            grunt.config.set('replace.url', url);

            // Start replacing paths
            grunt.task.run('replace:main');
            grunt.task.run('replace:core-widgets');
            grunt.task.run('replace:admin-widgets');
        } else {
            var msg = 'No cdn provided, not performing cdn task';
            grunt.log.writeln(msg.yellow);
        }
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

    // Lint tasks (JavaScript only for now, too many errors in css)
    grunt.registerTask('lint', ['jshint' /*, 'csslint' */ ]);

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

    // Task to start prerequisites for CasperJS tests
    grunt.registerTask('startDependencies', function(path) {
        grunt.task.run('exec:startDependencies');
    });

    // Task to run the CasperJS and QUnit tests
    grunt.registerTask('test', ['startDependencies']);

    // Task to run an individual CasperJS test
    grunt.registerTask('test-file', function(path) {
        path = path || grunt.option('path');

        if (!path) {
            return grunt.fail.fatal('Please provide a path to a CasperJS test file. e.g. `grunt test-file --path=node_modules/oae-core/preferences/tests/preferences.js`');
        }

        grunt.task.run('exec:runCasperTest:' + path);
    });

    // Default task for production build
    grunt.registerTask('default', ['clean', 'copy', 'git-describe', 'requirejs', 'touchBootstrap', 'hashFiles', 'cdn', 'writeVersion', 'configNginx']);
};

/**
 * Generate the standard replacement references for the given resource directories, and also
 * include the provided "extra" replacement files.
 *
 * @param  {Object}     options                 An options object that specifies what files to hash
 * @param  {String[]}   options.directories     A list of directories whose resource paths should be replaced
 * @param  {String[]}   [options.includeExts]   The file extensions that should have replacement performed
 * @param  {String[]}   [options.extra]         Additional replacements to perform
 * @return {String[]}                           The full derived list of all resources that replacement should be performed
 * @api private
 */
var _replacementReferences = function(options) {
    options.includeExts = options.includeExts || [];
    options.extra = options.extra || [];

    var globs = [];
    _.each(options.directories, function(directory) {
        _.each(options.includeExts, function(ext) {
            globs.push(util.format('%s/**/*.%s', directory, ext));
        });
    });

    return _.union(globs, options.extra);
};

/**
 * Generate the glob expressions to match all extensions of files in the provided set of
 * directories. Any file with an extension that is found in the `excludeExts` option  will not be
 * hashed
 *
 * @param  {Object}     options                 An options object that specifies what files to hash
 * @param  {String[]}   options.directories     The list of directories whose files to hash
 * @param  {String[]}   [options.excludeExts]   The extensions of files to ignore when hashing files
 * @param  {String[]}   [options.extra]         Extra glob patterns to append, in addition to the ones added for the extensions
 * @return {String[]}                           An array of glob expressions that match the files to hash in the directories
 * @api private
 */
var _hashFiles = function(options) {
    options.excludeExts = options.excludeExts || [];
    options.extra = options.extra || [];

    var globs = [];
    _.each(options.directories, function(directory) {
        globs.push(util.format('%s/**', directory));
        _.each(options.excludeExts, function(ext) {
            // Exclude both direct children of the excluded extensions, and all grand-children
            globs.push(util.format('!%s/*.%s', directory, ext));
            globs.push(util.format('!%s/**/*.%s', directory, ext));
        });
    });

    return _.union(globs, options.extra);
};


/**
 * Prepend the CDN url for those static assets that are not delivered by either
 * the OAE APIs or other external hosts
 *
 * @param  {String}         cdn                 The url of the cdn to prepend before static asset urls
 * @param  {String}         matchedWord         The full match. For example, `src="/shared/oae/css/oae.core.123456.css`
 * @param  {Number}         index               The index where the match was found in the `fullText`
 * @param  {String}         fullText            The full original text of the file
 * @param  {String[]}       regexMatches        The matches that were made by the configured regex
 * @return {String}                             The string that will replace `matchedWord`
 * @api private
 */
var _cdnifyStaticAsset = function(cdn, matchedWord, index, fullText, regexMatches) {
    // Get the name of the attribute (e.g., `src`, `data-main`, ...)
    var attr = regexMatches[0];

    // Do not replace anything that already points to an outside source
    // e.g., do not cdnify src="//www.youtube" or href="https://foo.com/asset.jpg"
    if (regexMatches[1].indexOf('/') === 0 || regexMatches[1].indexOf('api') === 0) {
        return matchedWord;
    }

    // Return the attribute with our CDN in it
    return util.format('%s="%s/%s"', attr, cdn, regexMatches[1]);
};
