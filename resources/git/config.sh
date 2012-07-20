#!/usr/bin/env bash

TOPLEVEL=$(git rev-parse --show-toplevel)
HOOKSDIR=${TOPLEVEL}/.git/hooks
MYDIR=${TOPLEVEL}/resources/git

git config core.whitespace 'tab-in-indent,tabwidth=4'

cp ${MYDIR}/prepare-commit-msg ${HOOKSDIR}/
cp ${MYDIR}/pre-commit ${HOOKSDIR}/
