# Open Academic Environment (OAE Project)

3akai-ux is the front-end for the Open Academic Environment project.

### Installing OAE

Documentation on how to install and configure OAE can be found in the [back-end repository](https://github.com/oaeproject/Hilary).

### Widget development

Documentation on how to create custom OAE widgets and an overview of the available widgets can be found at the [Widget Library](http://oae-widgets.sakaiproject.org/)

### Functional tests

[Casperjs](http://casperjs.org/) should be installed to run the functional tests. Casperjs relies on [phantomjs](http://phantomjs.org/) and both can be installed using [homebrew](http://mxcl.github.io/homebrew/) `brew install casperjs`. Once these are installed and you've also run `npm install -d` to install other dependencies the tests can be run with `grunt test`. Note that Hilary and its dependencies should be running on your system.
