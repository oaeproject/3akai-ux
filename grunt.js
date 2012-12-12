module.exports = function(grunt) {

    var shell = require('shelljs');

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
                'node_modules/oae-core/**/*.js'
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
                    paths: {
                        'jquery': 'vendor/js/jquery',
                        'jquery-plugins': 'vendor/js/jquery-plugins',
                        'jquery-ui': 'vendor/js/jquery-ui.custom',
                        'underscore': 'vendor/js/underscore'
                    },
                    dir: 'target/optimized',
                    optimize: 'uglify',
                    optimizeCss: 'standard',
                    cssImportIgnore: null,
                    inlineText: true,
                    useStrict: false,
                    pragmas: {},
                    skipPragmas: false,
                    skipModuleInsertion: false,
                    modules: [{
                        name: 'oae/api/oae.api'
                    }],
                    fileExclusionRegExp: /^(\.|tools|target|tests|node_modules(?!\/oae-core))/,
                    logLevel: 2
                }
            }
        },
        hashres: {
            oae: {
                // Hash these files
                files: [
                    // Warning these files will be renamed
                    'target/optimized/shared/**/*.js',
                    'target/optimized/shared/**/*.css',
                    'target/optimized/ui/**/*.js',
                    'target/optimized/ui/**/*.css',
                    'target/optimized/ui/**/*.properties',
                    'target/optimized/node_modules/oae-core/**/*.js',
                    'target/optimized/node_modules/oae-core/**/*.html',
                    'target/optimized/node_modules/oae-core/**/*.css',
                    'target/optimized/node_modules/oae-core/**/*.properties'
                ]
            }
        },
        inlineImg: {
            src: [
                'target/optimized/admin/**/*.css',
                'target/optimized/ui/**/*.css',
                'target/optimized/shared/**/*.css',
                'target/optimized/node_modules/oae-core/**/*.css'
                 ],
            ie8: true,
            base: __dirname
        }
    });

    // Load tasks from npm modules
    grunt.loadNpmTasks('grunt-clean');
    grunt.loadNpmTasks('grunt-git-describe');
    grunt.loadNpmTasks('grunt-hashres');
    grunt.loadNpmTasks('grunt-imagine');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Task to write the version to a file
    grunt.registerTask('writeVersion', function() {
        this.requires('describe');
        var json = grunt.template.process('{"sakai:ux-version":"<%= meta.version %>"}');
        grunt.file.write('target/optimized/ui/version.json', json);
    });

    // Task to hash files
    grunt.registerTask('hashFiles', function() {
        this.requires('requirejs');
        this.requires('inlineImg');
        var outFiles = shell.find('target/optimized/').filter(function(file) {
            return file.match(/^\(shared\/oae|ui|node_modules\/oae-core\)\/.*\.\(html|js|css|json\)$/) && shell.test('-f', file);
        });
        grunt.config.set('hashres.oae.out', outFiles);
        grunt.task.run('hashres');
    });

    // Override the test task with the qunit task
    grunt.registerTask('test', 'qunit');
    // Default task.
    grunt.registerTask('default', 'clean describe requirejs inlineImg hashFiles writeVersion');
};
