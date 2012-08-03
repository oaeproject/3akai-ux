Git Hooks
=========

Make sure you have ruby installed and run `config.sh` it will copy the hook
scripts to .git/hooks and set git's whitespace options to match the code style
guide.

The pre-commit hook uses regular expressions to check for conformance to the
style guide.  Due to the nature of irregular languages, sometimes there will
be false positives (and probably some false negatives as well). If you ever
need to skip the tests just run

    git commit --no-verify

The prepare-commit-msg hook just looks for branch names that start with
`SAKIII-` or `KERN-` and puts that string into the commit message template for
you.
