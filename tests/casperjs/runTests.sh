#!/bin/sh
# Run the full set of tests and keep track of the
# exit codes for each of the tests to exit at the end.

# Function to lint the source code
LINTEXITCODE=0
runLint() {
    node_modules/.bin/grunt lint
    LINTEXITCODE=$?
}

# Function to run the QUnit test suite
QUNITEXITCODE=0
runQunitTests() {
    node_modules/.bin/grunt qunit:test.oae.com
    QUNITEXITCODE=$?
}

# Function to run the CasperJS test suite
CASPEREXITCODE=0
runCasperJSTests() {
    node_modules/.bin/grunt ghost
    CASPEREXITCODE=$?
}

# Lint the source code
runLint
# Run the QUnit tests
runQunitTests
# Run the CasperJS tests
runCasperJSTests

# Determine to end tests with failure or success exit code
EXITCODE=$((CASPEREXITCODE+QUNITEXITCODE+LINTEXITCODE))
exit $EXITCODE
