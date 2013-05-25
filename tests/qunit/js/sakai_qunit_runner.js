/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
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


require(
    [
        'jquery',
        'sakai/sakai.api.core',
        'qunitjs/qunit'
    ],
    function($, sakai) {

    /**
     * Make sure that arrays passed in as arguments are properly encoded
     */
    $.ajaxSettings.traditional = true;

    // Tracking variables
    var tests = [],
        startTime = 0,
        endTime = 0,
        currentTest = false,
        totalFailures = 0,
        totalSuccesses = 0,
        totalTime = 0;

    // HTML Elements
    var $run_all_current_test = $('#run_all_current_test'),
        $run_all_results_num_finished = $('#run_all_results_num_finished'),
        $run_all_results_num_to_go = $('#run_all_results_num_to_go');


    /**
     * Run an individual test
     *
     * @param {Object} test The test to run, should be in format
     * {url:'tests/mytest.html', title: 'My Test'}
     */
    var runTest = function(test) {
        currentTest = test;
        var $iframe = $('<iframe/>');
        $('#run_all_iframes').append($iframe);
        $iframe.attr('src', test.url);
        startTime = new Date();
        $run_all_current_test.text(test.title);
    };

    /**
     * runAllTests populates the tests array with any link in the index.html file
     * that contains a test class. It will then kick off the first test.
     */
    var runAllTests = function(which) {
        tests = [];
        var selector = 'a.test';
        if (which) {
            selector += '.' + which;
        }
        var $tests = $(selector);
        $.each($tests, function(i,val) {
            tests.push({url: $(val).attr('href'), title: $(val).text()});
        });
        tests.reverse();
        // clear the old results, clear the iframes
        $('#run_all_results_individual table tbody').empty();
        $('#run_all_results_individual table tfoot').empty();
        totalFailures = totalSuccesses = totalTime = startTime = endTime = 0;
        $('#run_all_iframes').empty();
        $run_all_results_num_finished.text('0');
        $run_all_results_num_to_go.text(tests.length);
        $('#run_all_results').show();

        runTest(tests.pop());

    };

    /**
     * Updates the status HTML text and add a row to the results table.
     *
     * @param {Object} obj The object from the sakai-qunit-done call
     */
    var finishCurrentTest = function(obj) {
        endTime = new Date();
        $run_all_results_num_finished.text(parseInt($run_all_results_num_finished.text(),10) + 1);
        $run_all_results_num_to_go.text(tests.length);
        totalFailures += obj.failures;
        totalSuccesses += (obj.total - obj.failures);
        totalTime += (endTime - startTime);
        $run_all_current_test.html('&nbsp;');
        // would have used Trimpath here but since we're testing trimpath
        // I thought it best to stick with some ugly html-in-js
        var html = '<tr id="' + currentTest.url + '"><td>' +
                    currentTest.title + '</td><td>' +
                    obj.failures + '</td><td>' +
                    (obj.total - obj.failures) + '</td><td>' +
                    ((endTime - startTime)/1000) + '</td></tr>';
        $('#run_all_results_individual table tbody').append(html);
        // keep scrolling as tests come in
        window.scrollTo(0,$('tbody tr:last').position().top);
    };

    /**
     * Adds the totals row to the results table
     */
    var finishTests = function() {
        // insert the results row
        var html = '<tr><td><strong>All tests</strong></td><td>' + totalFailures + '</td><td>' + totalSuccesses + '</td><td>' + totalTime/1000 + '</td></tr>';
        $('#run_all_results_individual table tfoot').append(html);
        // trigger an event for anything listening that we're done with our tests
        $(window).trigger('complete.tests.qunit.sakai', {failures: totalFailures, successes: totalSuccesses});
    };

    /**
     * The event sakai-qunit-done is called from sakai_qunit_lib.js which is
     * included in each qunit html file
     */
    $(document).on('done.qunit.sakai', function(e, obj) {
        finishCurrentTest(obj);
        if (tests.length) {
            runTest(tests.pop());
        } else {
            finishTests();
        }
    });

    // Bind to the show/hide test list link
    $('#show_list button').on('click', function() {
        if ($('#tests_list').is(':visible')) {
            $(this).text('Show Tests');
        } else {
            $(this).text('Hide Tests');
        }
        $('#tests_list').toggle();
    });

    // Bind to the run_all link to run all tests
    $('#run_all').on('click', function() {
        $('#show_list button').click();
        runAllTests();
    });

    $('#run_all_unit').on('click', function() {
        $('#show_list button').click();
        runAllTests('unit');
    });

    $('#run_all_integration').on('click', function() {
        $('#show_list button').click();
        runAllTests('integration');
    });

    // Handle clicks on the result rows to show the iframe with the results
    $('tr[id] td').on('click', function() {
        var $parent = $(this).parent('tr');
        // only hide the iframe if its not the one we want
        $('#run_all_iframes iframe[src!="' + $parent.attr('id') + '"]:visible').hide();
        $('#run_all_iframes iframe[src="' + $parent.attr('id') + '"]').show(0,function() {
            // scroll to the top of the iframe
            window.scrollTo(0,$('iframe:visible').position().top);
            // click the checkbox in the iframe to only show failed tests
            $($('#run_all_iframes iframe:visible')[0].contentWindow.document).find('#qunit-filter-pass:not(:checked)').click();
        });
    });

});
