# Open Academic Environment (OAE Project)

3akai-ux is the front-end for the Open Academic Environment project.

## Build status
[![Build Status](https://travis-ci.org/oaeproject/3akai-ux.png?branch=master)](https://travis-ci.org/oaeproject/3akai-ux)

## Installing OAE

Documentation on how to install and configure OAE can be found in the [back-end repository](https://github.com/oaeproject/Hilary).

## Widget development

Documentation on how to create custom OAE widgets and an overview of the available widgets can be found at the [Widget Library](http://oae-widgets.sakaiproject.org/)

## Functional tests

### PhantomJS

In order to run the front-end test suite, [PhantomJS](http://phantomjs.org/) needs be installed. The instructions on how to install PhantomJS can be found on the [PhantomJS download page](http://phantomjs.org/download.html).

### CasperJS

In order to run the front-end test suite, [CasperJS](http://casperjs.org/), which relies on PhantomJS, needs to be installed. The instructions on how to install CasperJS can be found on the [CasperJS download page](http://casperjs.org/installation.html).

### Install NPM dependencies

NPM is the package manager that downloads all the Node.js dependencies on which the 3akai-ux test suite relies. To tell NPM to download all the dependencies, run this command in your 3akai-ux directory:

```
npm install -d
```

### Running the tests

The front-end test suite can be run using Grunt:

```
grunt test
```

Note that Hilary and its dependencies should be installed and running on your system before the tests can be run successfully.
