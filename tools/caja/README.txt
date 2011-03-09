======================================================================

DESCRIPTION
The 2 files in this directory are used by google caja to build a
whitelist for use with the html sanatizer.

REFERENCE
https://jira.sakaiproject.org/browse/SAKIII-2473
http://code.google.com/p/google-caja/wiki/CajaWhitelists

UPDATED
10/03/2011

======================================================================

STEPS TO BUILD HTML SANATISER WITH WHITELIST MODIFICATIONS

1.  Check out the google caja source with subversion
    http://code.google.com/p/google-caja/source/checkout

2.  Replace the files in src\com\google\caja\lang\html with the 2 files
    in this directory (html4-attributes-extensions.json and
    html4-elements-extensions.json) with the whitelist changes

3.  Build google caja with ant (If you don't have ant you will need to set it up). EG:
    D:\google-caja-read-only>ant

4.  Combine the 3 output files into "html-sanitizer.js" in the 3akai-ux repo:
    The HTML sanatiser output directory is ant-lib\com\google\caja\plugin
    The file "html-sanitizer-minified.js" is the minified version of the
    sanitizer, which are these files:
    html4-defs.js
    css-defs.js
    html-sanitizer.js

    Copy and paste the contents of these files into html-sanitizer.js in the 3akai-ux repo.
    This is so we have a non-minified version of the file.
