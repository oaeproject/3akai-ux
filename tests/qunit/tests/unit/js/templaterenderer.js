/*global require, QUnit, sakai_global */
require(
    [
    'jquery',
    'sakai/sakai.api.core',
    'qunitjs/qunit',
    '../../../../tests/qunit/js/sakai_qunit_lib.js',
    '../../../../tests/qunit/js/dev.js',
    '../../../../tests/qunit/js/devwidgets.js'
    ],
    function($, sakai) {

    'use strict';

        QUnit.module('TemplateRenderer');

        var $container = $('#qunit_body'),
            $template1 = $('#qunit_body_template1'),
            $template2 = $('#qunit_body_template2'),
            $template3 = $('#qunit_body_template3'),
            $template4 = $('#qunit_body_template4'),
            $template5 = $('#qunit_body_template5'),
            $template6 = $('#qunit_body_template6'),
            $template7 = $('#qunit_body_template7'),
            $template8 = $('#qunit_body_template8'),
            $template9 = $('#qunit_body_template9'),
            $template10 = $('#qunit_body_template10'),
            data1 = 'Hi from Sakai',
            data2 = ['Hi', 'from', 'Sakai'],
            data3 = {
                hi: 'Hi',
                from: 'from',
                sakai: 'Sakai'
            },
            data4 = [
                {str: 'Hi'},
                {str: 'from'},
                {str: 'Sakai'}
            ],
            data5 = {
                nested: {
                    str: 'Hi from Sakai'
                }
            };

        var startTests = function() {
            QUnit.start();

            QUnit.test('Rendering a string in a template', function() {
                var html = sakai.api.Util.TemplateRenderer($template1, {data:data1});
                $container.html(html);
                QUnit.equal($.trim($container.html()), data1);

                sakai.api.Util.TemplateRenderer($template1, {data:data1}, $container);
                QUnit.equal($.trim($container.html()), data1, 'Testing html replacement via sakai.api.Util.TemplateRenderer');
            });

            QUnit.test('Rendering an array in a template', function() {
                sakai.api.Util.TemplateRenderer($template2, {data:data2}, $container);
                QUnit.equal($.trim($container.html()), data1);
            });

            QUnit.test('Rendering an object in a template', function() {
                sakai.api.Util.TemplateRenderer($template3, {data:data3}, $container);
                QUnit.equal($.trim($container.html()), data1);
            });

            QUnit.test('Rendering an array of objects in a template', function() {
                sakai.api.Util.TemplateRenderer($template4, {data:data4}, $container);
                QUnit.equal($.trim($container.html()), data1);
            });

            QUnit.test('Rendering a nested object in a template', function() {
                sakai.api.Util.TemplateRenderer($template5, {data:data5}, $container);
                QUnit.equal($.trim($container.html()), data1);
            });

            QUnit.test('Rendering null and undefined', function() {
                sakai.api.Util.TemplateRenderer($template6, {data:undefined}, $container);
                QUnit.equal($.trim($container.html()), '', 'Testing undefined');

                sakai.api.Util.TemplateRenderer($template6, {data:null}, $container);
                QUnit.equal($.trim($container.html()), '', 'Testing null');
            });

            QUnit.test('Testing if, elseif, and else conditionals', function() {
                sakai.api.Util.TemplateRenderer($template7, {data:'Hi'}, $container);
                QUnit.equal($.trim($container.html()), 'Hi', 'Testing if condition');

                sakai.api.Util.TemplateRenderer($template7, {data:'from'}, $container);
                QUnit.equal($.trim($container.html()), 'from', 'Testing elseif condition');

                sakai.api.Util.TemplateRenderer($template7, {data:'Sakai'}, $container);
                QUnit.equal($.trim($container.html()), 'Sakai', 'Testing else');
            });

            QUnit.test('Testing for and forelse', function() {
                sakai.api.Util.TemplateRenderer($template8, {data:['data']}, $container);
                QUnit.equal($.trim($container.html()), 'Data', 'Testing for condition');

                sakai.api.Util.TemplateRenderer($template8, {data:[]}, $container);
                QUnit.equal($.trim($container.html()), 'No data', 'Testing forelse condition with empty array');

                sakai.api.Util.TemplateRenderer($template8, {data:''}, $container);
                QUnit.equal($.trim($container.html()), 'No data', 'Testing forelse condition with empty string');

                sakai.api.Util.TemplateRenderer($template8, {data:null}, $container);
                QUnit.equal($.trim($container.html()), 'No data', 'Testing forelse condition with null');

                sakai.api.Util.TemplateRenderer($template8, {data:undefined}, $container);
                QUnit.equal($.trim($container.html()), 'No data', 'Testing forelse condition with undefined');
            });

            QUnit.test('Testing var', function() {
                sakai.api.Util.TemplateRenderer($template10, {data:data1}, $container);
                QUnit.equal($.trim($container.html()), data1);
            });
            $(window).trigger('addlocalbinding.qunit.sakai');
        };

        if ( sakai_global.qunit && sakai_global.qunit.ready ) {
            startTests();
        }
        else {
            $(window).on('ready.qunit.sakai', function() {
                startTests();
            });
        }

    }
);
