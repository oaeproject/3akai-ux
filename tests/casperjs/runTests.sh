#!/bin/sh
# Run the CasperJS and QUnit tests and keep track of the
# exit codes for each of the tests to exit at the end.

# Run the QUnit test suite
QUNITEXITCODE=0
runQunitTests() {
    grunt qunit:test.oae.com
    QUNITEXITCODE=$?
}

# Run the CasperJS test suite
CASPEREXITCODE=0
runCasperJSTests() {
    grunt ghost
    CASPEREXITCODE=$?
}

# Run the QUnit tests
runQunitTests
# Run the CasperJS tests
runCasperJSTests

# Determine to end tests with failure or success exit code
EXITCODE=$((CASPEREXITCODE+QUNITEXITCODE))
exit $EXITCODE
