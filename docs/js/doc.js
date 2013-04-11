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
     * @param {String} type    The type of module to render the documentation for
     * @param {Object} docs    The documentation object as returned from the server
     * @param {String} name    The module name to render the documentation for
     * @param {String} id      The id to scroll to that id on the page
     */
    var renderDocumentation = function(type, documents, name, id) {
        if (type === "frontend") {
            oae.api.util.template().render($('#doc-ui-docs-template'), {
                'docs': documents,
                'module': name
            }, $('#doc-docs-container'));
        } else if (type = "backend") {
            oae.api.util.template().render($('#doc-docs-template'), {
                'docs': documents,
                'module': name
            }, $('#doc-docs-container'));
        }
        
        // Scroll to the module on the page
        if (id !== null && documents !== id) {
            scrollToSelectedId(id);
        }

        // Add on click listener for anchors in h4
        addEvent();
    };

    /**
     * Add onclick event to each anchor in a h4 element on the documentation page
     * When an anchor is clicked the url will be changed and the position of the page
     * will be set to the position of the element or module.
     */
    var addEvent = function() {
        $('h4 a').each(function() {
            var name = $(this).attr("name").replace('#', '');
            $(this).attr("href",name);
            $(this).on('click', function(evt) {
                evt.preventDefault();
                var currentSelectedItem = $(this).attr('href');
                history.pushState(null, null, currentSelectedItem);
                scrollToSelectedId(currentSelectedItem);
            });
        });
    };

    /**
     * Renders the navigation for the available modules
     * 
     * @param {String}      type             The type of the module to render the documentation for
     * @param {String[]}    modules          An Array of module names
     * @param {String}      currentModule    The name of the module that is currently shown in the UI
     */
    var renderNavigation = function(type, modules, currentModule) {
        if (type === "frontend") {
            oae.api.util.template().render($('#doc-ui-contents-template'), {
                'modules': modules,
                'moduleToLoad': currentModule,
                'type': "frontend" },
            $('#doc-ui-contents-container'));
        } else if ( type === "backend") {
            oae.api.util.template().render($('#doc-contents-template'), {
                'modules': modules,
                'moduleToLoad': currentModule,
                'type': "backend"},
            $('#doc-contents-container'));
        }
        addBinding();
    };

    /**
     * Gets the documentation for a specific module and passes it in a callback
     * 
     * @param {String}    type              The type of the module to get the documentation for
     * @param {String}    name              The name of the module to get the documentation for
     * @param {Function}  callback          Function executed after the documentation for the module has been retrieved
     * @param {Object}    callback.docs     Retrieved documentation for the specified module. This will be null when the documentation could not be retrieved
     */
    var getDocumentation = function(type, name, callback) {
        $.ajax({
            url: '/api/doc/' + type + '/' + name,
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
     * @param {String}      type                Type to select what kind of modules mus be loaded
     * @param {Function}    callback            Function executed after the list of modules has been retrieved
     * @param {String[]}    callback.modules    List of all of the available modules
     */
    var getNamesOfType = function(type, callback) {
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
        $('.bs-docs-sidenav li').on('click', function(evt) {
            evt.preventDefault();
            $('.bs-docs-sidenav li').removeClass('active');
            $(this).addClass('active'); 
            window.scrollTo(0, 0);
            var currentSelectedItem = $('a', $(this)).attr('href');
            history.pushState(null, null, currentSelectedItem);
            // If the current selected item contains backend
            if (currentSelectedItem.indexOf("backend") > 0) {
                currentSelectedItem = currentSelectedItem.substr(14);
                setDocumentTitle(currentSelectedItem);
                getDocumentation("backend", currentSelectedItem, function(docs) {
                    renderDocumentation("backend", docs, currentSelectedItem, null);
                });
            }
            // If the current selected item contains frontend
            if (currentSelectedItem.indexOf("frontend") > 0) {
                currentSelectedItem = currentSelectedItem.substr(15);
                setDocumentTitle("oae.api." + currentSelectedItem);
                getDocumentation("frontend", currentSelectedItem, function(docs) {
                    renderDocumentation("frontend", docs, currentSelectedItem, null);
                });
            }
        });
    };
    
    /**
     * Scroll the page to the id, if the id is empty
     * the value of the scroll is 0
     */
    var scrollToSelectedId = function(id) {
        var offset = 0;
        if (id.length > 0) {
            var $anchor = $('a[name="#' + id + '"]');
            if ($anchor.offset() !== undefined) {
                offset = $anchor.offset().top;
            } else {
                $anchor = $('a[name="' + id + '"]');
                if ($anchor.offset() !== undefined) {
                    offset = $anchor.offset().top;
                }
            }
        }
        window.scrollTo(0, offset);
    };
    
    /**
     * Initializes the API Docs UI
     */
    var doInit = function() {
        // Remove / from the pathname
        var pathname = window.location.pathname.split('/').join('');
        var currentElementToLoad = null;
        var _elements =[];
        var _modules = [];
        var elementId = null;
        var moduleId = null;

        // Get all the elements
        getNamesOfType("frontend", function(elements) {
            _elements = elements.sort();
            // Render the docs for the current module
            renderNavigation("frontend", _elements, currentElementToLoad);
            getNamesOfType("backend", function(modules) {
                _modules = modules.sort();
                // Render the docs for the current module
                renderNavigation("backend", _modules, currentElementToLoad);
                // Remove docs from the path
                pathname = pathname.slice(4);
                // Check the format of the pathname of the current page
                // If the length is greater than 0
                if (pathname.length > 0) {
                    // If the path starts with frontend or backend as first characters of the pathname
                    if (pathname.substring(0, 8) === 'frontend' || pathname.substring(0, 7) === 'backend') {
                        // If the pathname starts with frontend
                        if (pathname.substring(0, 8) === 'frontend') {
                            // Remove frontend from the pathname for the elementId
                            elementId = pathname.slice(8);
                            // Get the details of the element
                            var currentElementToLoadArray = elementId.split('.');
                            // The currentElementToLoad is the first string in the array
                            currentElementToLoad = currentElementToLoadArray[0];
                            // If the currentElementToLoad is empty load the first element in the _elements array
                            if (currentElementToLoad.length === 0) {
                                currentElementToLoad = _elements[0];
                            }
                            // Set the li active
                            $("#frontend"+currentElementToLoad).addClass('active');
                            // Set the document title to 
                            setDocumentTitle("oae.api." + currentElementToLoad);
                            // Load the documentation
                            getDocumentation("frontend", currentElementToLoad, function(docs) {
                                renderDocumentation("frontend", docs, currentElementToLoad, elementId);
                            });
                        } else if (pathname.substring(0, 7) === 'backend') {
                            // If the pathname starts with backend
                    
                            // Remove backend from the pathname for the moduleId
                            moduleId = pathname.slice(7);
                            // Get the details of the module
                            var currentModuleToLoadArray = moduleId.split('.');
                            // The currentElementToLoad is the first string in the array
                            currentElementToLoad = currentModuleToLoadArray[0];
                            // If the currentElementToLoad is empty load the first module in the _modules array
                            if (currentElementToLoad.length === 0) {
                                currentElementToLoad = _modules[0];
                            }
                            // Set the li active
                            $("#backend"+currentElementToLoad).addClass('active');
                            // Set the document title to
                            setDocumentTitle(currentElementToLoad);
                            // Load the documentation
                            getDocumentation("backend", currentElementToLoad, function(docs) {
                                renderDocumentation("backend", docs, currentElementToLoad, moduleId);
                            });
                        }
                    } else {
                        // If the path doesn't start with frontend or backend, load the first backend module
                        currentElementToLoad = _modules[0];
                        $("#backend" + currentElementToLoad).addClass('active');
                        getDocumentation("backend", currentElementToLoad, function(docs) {
                            renderDocumentation("backend", docs, currentElementToLoad, moduleId);
                        });
                        history.pushState(null, null, "/docs/backend/" + currentElementToLoad);
                    }
                } else {
                    // If the path is empty, load the first backend module
                    currentElementToLoad = _modules[0];
                    $("#backend" + currentElementToLoad).addClass('active');
                    getDocumentation("backend", currentElementToLoad, function(docs) {
                        renderDocumentation("backend", docs, currentElementToLoad, moduleId);
                    });
                    history.pushState(null, null, "/docs/backend/" + currentElementToLoad);
                }
            });
        });
    };
    doInit();
});
