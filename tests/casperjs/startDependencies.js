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

var childProcess = require('child_process');

var hilaryModules = __dirname + '/../../../Hilary/node_modules/';

var TestsUtil = require(hilaryModules + 'oae-tests/lib/util');

require('./beforeTests.js')(function() {
    // Start the CasperJS tests
    var testRunner = childProcess.spawn(__dirname + '/runTests.sh', [], {
        detached: true,
    });

    // Print test output in the console
    testRunner.stdout.on('data', function(data) {
        process.stdout.write(data.toString());
    });

    // Print test errors in the console
    testRunner.stderr.on('data', function(data) {
        process.stderr.write(data.toString());
    });

    // Pass on the exit code after the tests finish and stop the child process
    testRunner.on('exit', function(exitCode) {
        TestsUtil.cleanUpAfterTests(function() {
            process.exit(exitCode);
        });
    });
});
