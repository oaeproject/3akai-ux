# Open Academic Environment (OAE Project)

3akai-ux is the front-end for the Open Academic Environment project.

## Build status
[![Build Status](https://travis-ci.org/oaeproject/3akai-ux.png?branch=master)](https://travis-ci.org/oaeproject/3akai-ux)

## Installing OAE

Documentation on how to install and configure OAE can be found in the [back-end repository](https://github.com/oaeproject/Hilary).

## Off-line Development

By default 3akai-ux uses the Open Sans font family available from Google's Web Font CDN. When developing locally without a live internet connection, that CDN will be inaccessible. To ensure maximum visual fidelity, those fonts can be installed as system fonts on the local machine. The entire collection can be downloaded from [Google](http://www.google.com/fonts#UsePlace:use/Collection:Open+Sans).

## Widget development

Documentation (WIP) on how to create custom OAE widgets can be found on the [Widget Wiki](https://github.com/oaeproject/3akai-ux/wiki/Widget-Development-%5BWIP%5D)

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
