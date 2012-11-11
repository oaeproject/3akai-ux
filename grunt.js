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
        concat: {
            //dist: {
            //  src: ['<banner:meta.banner>', '<file_strip_banner:lib/<%= pkg.name %>.js>'],
            //  dest: 'dist/<%= pkg.name %>.js'
            //}
        },
        min: {},
        qunit: {
            index: ['tests/qunit/tests/unit/*.html']
        },
        lint: {
            files: ['grunt.js', 'ui/**/*.js']//, 'widgets/**/*.js']
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
        uglify: {},
        clean: {
            folder: 'target/'
        },
        requirejs: {
            appDir: './',
            baseUrl: './shared',
            paths: {
                'jquery-plugins': 'js/jquery-plugins',
                'jquery': 'js/jquery',
                'jquery-ui': 'js/jquery-ui.custom',
                'jquery-cookie': 'js/jquery-plugins/jquery.cookie',
                'jquery-jstree': 'js/jquery-plugins/jsTree/jquery.jstree.sakai-edit',
                'jquery-fileupload': 'js/jquery-plugins/jquery.fileupload',
                'jquery-iframe-transport': 'js/jquery-plugins/jquery.iframe-transport',
                'jquery-pager': 'js/jquery-plugins/jquery.pager.sakai-edited',
                'jquery-tagcloud': 'js/jquery-plugins/jquery.tagcloud',
                'underscore': 'js/underscore',
                'config': '../ui/configuration'
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
                name: 'sakai/sakai.dependencies'
            }],
            dirExclusionRegExp: /^(\.|tools|target|tests|node_modules)/
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
                    'target/optimized/widgets/**/*.js',
                    'target/optimized/widgets/**/*.html',
                    'target/optimized/widgets/**/*.css',
                    'target/optimized/widgets/**/*.properties'
                ],
                // Update the paths to hashed files
                out: shell.find('target/optimized/').filter(function(file) {
                    return file.match(/^\(shared\/sakai|ui|widgets\)\/.*\.\(html|js|css|json\)$/) && shell.test('-f', file);
                })
            }
        }
    });

    // Load tasks from npm modules
    grunt.loadNpmTasks('grunt-clean');
    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-hashres');

    // Override the test task with the qunit task
    grunt.registerTask('test', 'qunit');
    // Default task.
    grunt.registerTask('default', 'clean requirejs hashres');
};
