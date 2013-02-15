module.exports = function(grunt) {

    var shell = require('shelljs');
    var vm = require('vm');

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        qunit: {
            index: ['tests/qunit/tests/unit/*.html']
        },
        lint: {
            files: [
                'grunt.js',
                'admin/**/*.js',
                'shared/**/*.js',
                'ui/**/*.js',
                'node_modules/oae-*/**/*.js'
            ]
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint test'
        },
        jshint: {
            options: {
                sub: true
            },
            globals: {
                exports: true,
                module: false
            }
        },
        clean: {
            folder: 'target/'
        },
        requirejs: {
            optimize: {
                options: {
                    appDir: './',
                    baseUrl: './shared',
                    mainConfigFile: './shared/oae/api/oae.bootstrap.js',
                    dir: 'target/optimized',
                    optimize: 'uglify',
                    preserveLicenseComments: false,
                    optimizeCss: 'standard',
                    cssImportIgnore: null,
                    inlineText: true,
                    useStrict: false,
                    pragmas: {},
                    skipPragmas: false,
                    skipModuleInsertion: false,
                    modules: [{
                        name: 'oae.core',
                        exclude: ['jquery']
                    }],
                    fileExclusionRegExp: /^(\.|tools|target|tests|grunt|shelljs)/,
                    logLevel: 2
                }
            }
        },
        ver: {
            oae: {
                basedir: 'target/optimized',
                phases: [
                    {
                        // Rename and hash these folders
                        folders: [
                            'target/optimized/shared/bundles',
                            'target/optimized/ui/bundles',
                            'target/optimized/admin/bundles',
                            'target/optimized/shared/vendor/js/l10n/cultures'
                        ],

                        // Rename and hash these files
                        files: [
                            'target/optimized/shared/**/*.js',
                            'target/optimized/shared/**/*.css',
                            'target/optimized/ui/**/*.js',
                            'target/optimized/ui/**/*.css',
                            'target/optimized/admin/**/*.js',
                            'target/optimized/admin/**/*.css'
                        ],

                        // Exclude these files from being renamed/hashed
                        excludeFiles: [
                            'target/optimized/shared/vendor/js/l10n/cultures.*/**'
                        ],

                        // Look for and replace references to the above (non-excluded) files and folders in these files
                        references: [
                            'target/optimized/shared/**/*.js',
                            'target/optimized/shared/**/*.css',
                            'target/optimized/ui/**/*.html',
                            'target/optimized/ui/**/*.js',
                            'target/optimized/ui/**/*.css',
                            'target/optimized/admin/**/*.html',
                            'target/optimized/admin/**/*.js',
                            'target/optimized/admin/**/*.css'
                        ]
                    }
                ],
                version: 'target/hashes.json'
            }
        },
        inlineImg: {
            src: [
                'target/optimized/admin/**/*.css',
                'target/optimized/ui/**/*.css',
                'target/optimized/shared/**/*.css',
                'target/optimized/node_modules/oae-*/**/*.css'
                 ],
            ie8: false,
            base: __dirname
        }
    });

    // Load tasks from npm modules
    grunt.loadNpmTasks('grunt-clean');
    grunt.loadNpmTasks('grunt-git-describe');
    grunt.loadNpmTasks('grunt-ver');
    grunt.loadNpmTasks('grunt-imagine');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Task to write the version to a file
    grunt.registerTask('writeVersion', function() {
        this.requires('describe');
        var json = grunt.template.process('{"sakai:ux-version":"<%= meta.version %>"}');
        grunt.file.write('target/optimized/ui/version.json', json);
    });

    // Task to fill out the nginx config template
    grunt.registerTask('configNginx', function() {
        var infile = './nginx.json';
        if (shell.test('-f', infile)) {
            var nginxConf = require(infile);
            var template = grunt.file.read('./nginx.conf');
            grunt.config.set('nginxConf', nginxConf);
            var conf = grunt.template.process(template);
            grunt.file.write('./target/optimized/nginx.conf', conf);
            grunt.log.writeln('nginx.conf rendered at ./target/optimized/nginx.conf'.green);
        } else {
            var msg = 'No ' + infile + ' found, not rendering nginx.conf template';
            grunt.log.writeln(msg.yellow);
        }
    });

    // Task to hash files
    grunt.registerTask('hashFiles', function() {
        this.requires('requirejs');
        this.requires('inlineImg');

        // Add the modules as phases to ver:oae
        var oaeModules = grunt.file.expandDirs('target/optimized/node_modules/oae-*/*');
        oaeModules.forEach(function(module) {
            grunt.log.writeln(module);
            var conf = {
                folders: [ module + 'bundles' ],
                files: [
                    module + '**/*.html',
                    module + '**/*.js',
                    module + '**/*.css'
                ],
                references: [
                    module + '**/*.html',
                    module + '**/*.js',
                    module + '**/*.css',
                    module + '*.json'
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

        var hashedPaths = require('./' + grunt.config.get('ver.oae.version'));
        var bootstrapPath = hashedPaths['target/optimized/shared/oae/api/oae.bootstrap.js'];
        var bootstrap = grunt.file.read(bootstrapPath);
        var regex = /paths: ?\{[^}]*\}/;
        var match = bootstrap.match(regex);
        var scriptPaths = 'paths = {' + bootstrap.match(regex) + '}';
        var paths = vm.runInThisContext(scriptPaths).paths;

        // Update the bootstrap file with the hashed paths
        Object.keys(paths).forEach(function(key) {
            var prefix = 'target/optimized/shared/';
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

    // Override the test task with the qunit task
    grunt.registerTask('test', 'qunit');

    // Default task.
    grunt.registerTask('default', 'clean describe requirejs inlineImg hashFiles writeVersion configNginx');
};
