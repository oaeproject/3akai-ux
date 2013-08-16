/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery', 'oae.core', 'qunitjs'], function($, oae) {

    // By default, QUnit runs tests when load event is triggered on the window.
    // We're loading tests asynchronsly and set this property to false, then call QUnit.start() once everything is loaded. 
    QUnit.config.autostart = false;

    /**
     * Run an individual test
     *
     * @param {Object} test The test to run, should be in format
     * {url:'tests/mytest.html', title: 'My Test'}
     */
    var runTest = function(test) {
        var $iframe = $('<iframe/>');
        $('#tests-run-all-container').append($iframe);
        $iframe.attr('src', test.url);
        startTime = new Date();
    };

    /**
     * runAllTests populates the tests array with any link in the index.html file
     * that contains a test class. It will then kick off the tests.
     */
    var runAllTests = function() {
        $('#tests-run-all-container').empty();

        var $tests = $('a.test');
        $.each($tests, function(i, val) {
            runTest({
                'url': $(val).attr('href'),
                'title': $(val).text()
            });
        });
    };

    $(document).on('click', '#tests-run-all', runAllTests);

});
