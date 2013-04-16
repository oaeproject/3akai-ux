/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['jquery', 'oae.core'], function($, oae) {
    
    /**
     * Renders the documentation for a specific module
     * 
     * @param {String} type     The type of module to render the documentation for
     * @param {Object} docs     The documentation object as returned from the server
     * @param {String} name     The module name to render the documentation for
     * @param {String} item     The item to scroll down the page to that item
     */
    var renderDocumentation = function(type, docs, name, item) {
        if (type === 'frontend') {
            oae.api.util.template().render($('#doc-ui-docs-template'), {
                'docs': docs,
                'module': name
            }, $('#doc-docs-container'));
        } else if (type === 'backend') {
            oae.api.util.template().render($('#doc-docs-template'), {
                'docs': docs,
                'module': name
            }, $('#doc-docs-container'));
        }
        
        // Scroll to the module on the page
        if (item !== null) {
            scrollToSelectedItem(item);
        }

        // Add on click listener for anchors in h4
        addClickEventDocumentation();
    };

    /**
     * Add onclick event to each anchor in a h4 element on the documentation page
     * When an anchor is clicked the url will be changed and the position of the page
     * will be set to the position of the element or module.
     */
    var addClickEventDocumentation = function() {
        $('h4 a').each(function() {
            var name = $(this).attr('name').replace('#', '');
            $(this).attr('href',name);
            $(this).on('click', function(ev) {
                ev.preventDefault();
                var currentSelectedItem = $(this).attr('href');
                history.pushState(null, null, currentSelectedItem);
                scrollToSelectedItem(currentSelectedItem);
            });
        });
    };

    /**
     * Renders the navigation for the available modules
     * 
     * @param {String}      type             The type of the module to render the documentation for
     * @param {String[]}    modules          An Array of modules
     * @param {String}      currentModule    The name of the module that is currently shown in the UI
     */
    var renderNavigation = function(type, modules, currentModule) {
        if (type === 'frontend') {
            oae.api.util.template().render($('#doc-ui-contents-template'), {
                'modules': modules,
                'moduleToLoad': currentModule,
                'type': 'frontend' 
            },
            $('#doc-ui-contents-container'));
        } else if (type === 'backend') {
            oae.api.util.template().render($('#doc-contents-template'), {
                'modules': modules,
                'moduleToLoad': currentModule,
                'type': 'backend'
            },
            $('#doc-contents-container'));
        }
        addBinding();
    };

    /**
     * Gets the documentation for a specific module and passes it in a callback
     * 
     * @param {String}    type              The type of the module to get the documentation for
     * @param {String}    moduleId          The module to get the documentation for
     * @param {Function}  callback          Function executed after the documentation for the module has been retrieved
     * @param {Object}    callback.docs     Retrieved documentation for the specified module. This will be null when the documentation could not be retrieved
     */
    var getDocumentation = function(type, moduleId, callback) {
        $.ajax({
            url: '/api/doc/' + type + '/' + moduleId,
            success: function(docs) {
                callback(docs);
            }, error: function(err) {
                callback(null);
            }
        });
    };

    /**
     * Gets the available modules depending on the selected type
     * 
     * @param {String}      type                The type of modules to be loaded
     * @param {Function}    callback            Function executed after the list of modules has been retrieved
     * @param {String[]}    callback.modules    List of all of the available modules
     */
    var getAvailableModulesForType = function(type, callback) {
        $.ajax({
            url: '/api/doc/' + type,
            success: callback
        });
    };

    /**
     * Gets and returns the currently selected module by retrieving the hash from the URL
     * 
     * @return {String}         The currently selected module
     */
    var getSelectedElement = function() {
        return window.location.hash.replace('/', '');
    };

    /**
     * Sets the title of the document to `Sakai OAE - API Reference - title`
     * 
     * @param {String}  title   The title to be added to the document title
     */
    var setDocumentTitle = function(title) {
        oae.api.util.setBrowserTitle(['API Reference', title]);
    };

    /**
     * Adds binding to various elements and events in the UI
     */
    var addBinding = function() {
        // Bind the click event
        $('.bs-docs-sidenav li').on('click', function(ev) {
            ev.preventDefault();
            $('.bs-docs-sidenav li').removeClass('active');
            $(this).addClass('active'); 
            window.scrollTo(0, 0);
            var selectedLinkToShow = $('a', $(this)).attr('href');
            history.pushState(null, null, selectedLinkToShow);
            var nameOfModuleToLoad = null;
            // If the current selected item contains backend
            if (selectedLinkToShow.indexOf('backend') > 0) {
                //Subtract the link to get the name of the module, in this case /docs/backend/
                nameOfModuleToLoad = selectedLinkToShow.substr(14);
                setDocumentTitle(nameOfModuleToLoad);
                getDocumentation('backend', nameOfModuleToLoad, function(docs) {
                    renderDocumentation('backend', docs, nameOfModuleToLoad);
                });
            } else if (selectedLinkToShow.indexOf('frontend') > 0) {
                // If the current selected item contains frontend
                //Subtract the link to get the name of the module, in this case /docs/frontend/
                nameOfModuleToLoad = selectedLinkToShow.substr(15);
                setDocumentTitle('oae.api.' + nameOfModuleToLoad);
                getDocumentation('frontend', nameOfModuleToLoad, function(docs) {
                    renderDocumentation('frontend', docs, nameOfModuleToLoad);
                });
            }
        });
    };
    
    /**
     * Scroll the page to the element that has a name-attribute equal to item, if the item is empty the value of the scroll is 0
     *
     * @param {String}  item   The name of the element
     */
    var scrollToSelectedItem = function(item) {
        var offset = 0;
        if (item) {
            $anchor = $('a[name="' + item + '"]');
            if ($anchor.offset() !== undefined) {
                offset = $anchor.offset().top;
            }
        }
        window.scrollTo(0, offset);
    };
    
    /**
     * Initializes the API Docs UI
     */
    var doInit = function() {
        // Remove all slashes from the pathname to get the name of the module
        var pathname = window.location.pathname.replace(/\//g,'');
        var currentElementToLoad = null;
        var element = null;
        var module = null;

        // Get all the elements
        getAvailableModulesForType('frontend', function(elements) {
            elements.sort();
            // Render the docs for the current module
            renderNavigation('frontend', elements, currentElementToLoad);
            getAvailableModulesForType('backend', function(modules) {
                modules.sort();
                // Render the docs for the current module
                renderNavigation('backend', modules, currentElementToLoad);
                // Remove docs from the path
                pathname = pathname.slice(4);
                // Check if the pathname isn't empty otherwise load the first backend module
                if (pathname) {
                    // If the path contains 'frontend' or 'backend'
                    if (pathname.indexOf('frontend') > -1 || pathname.indexOf('backend') > -1) {
                        // If the pathname contains 'frontend'
                        if (pathname.indexOf('frontend') > -1) {
                            // Remove frontend from the pathname for the element
                            element = pathname.slice(8);
                            // Get the details of the element
                            var currentElementToLoadArray = element.split('.');
                            // The currentElementToLoad is the first string in the array
                            currentElementToLoad = currentElementToLoadArray[0];
                            // If the currentElementToLoad is empty load the first element in the _elements array
                            if (currentElementToLoad.length === 0) {
                                currentElementToLoad = elements[0];
                            }
                            // Set the li active
                            console.log(currentElementToLoad);
                            $('#frontend-' + currentElementToLoad).addClass('active');
                            // Set the document title to 
                            setDocumentTitle('oae.api.' + currentElementToLoad);
                            // Load the documentation
                            getDocumentation('frontend', currentElementToLoad, function(docs) {
                                renderDocumentation('frontend', docs, currentElementToLoad, element);
                            });
                        } else if (pathname.indexOf('backend') > -1) {
                            // If the pathname contains 'backend'
                            // Remove backend from the pathname for the module
                            module = pathname.slice(7);
                            // Get the details of the module
                            var currentModuleToLoadArray = module.split('.');
                            // The currentElementToLoad is the first string in the array
                            currentElementToLoad = currentModuleToLoadArray[0];
                            // If the currentElementToLoad is empty load the first module in the _modules array
                            if (currentElementToLoad.length === 0) {
                                currentElementToLoad = modules[0];
                            }
                            // Set the li active
                            $('#backend-' + currentElementToLoad).addClass('active');
                            // Set the document title to
                            setDocumentTitle(currentElementToLoad);
                            // Load the documentation
                            getDocumentation('backend', currentElementToLoad, function(docs) {
                                renderDocumentation('backend', docs, currentElementToLoad, module);
                            });
                        }
                    } else {
                        // If the path doesn't start with frontend or backend, load the first backend module
                        currentElementToLoad = modules[0];
                        $('#backend-' + currentElementToLoad).addClass('active');
                        getDocumentation('backend', currentElementToLoad, function(docs) {
                            renderDocumentation('backend', docs, currentElementToLoad);
                        });
                        history.pushState(null, null, '/docs/backend/' + currentElementToLoad);
                    }
                } else {
                    // If the path is empty, load the first backend module
                    currentElementToLoad = modules[0];
                    $('#backend-' + currentElementToLoad).addClass('active');
                    getDocumentation('backend', currentElementToLoad, function(docs) {
                        renderDocumentation('backend', docs, currentElementToLoad);
                    });
                    history.pushState(null, null, '/docs/backend/' + currentElementToLoad);
                }
            });
        });
    };

    doInit();

});
