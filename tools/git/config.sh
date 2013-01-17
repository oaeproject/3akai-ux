#!/usr/bin/env bash

# Exit on error
set -e

TOPLEVEL=$(git rev-parse --show-toplevel)
HOOKSDIR=${TOPLEVEL}/.git/hooks
MYDIR=${TOPLEVEL}/tools/git

echo "Setting git whitespace options..."
git config core.whitespace 'tab-in-indent,tabwidth=4'

echo "Copying hooks..."
cp -- "${MYDIR}/prepare-commit-msg" "${HOOKSDIR}/"
cp -- "${MYDIR}/pre-commit" "${HOOKSDIR}/"

echo "Success!"
