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
     * @param {String} moduleId The id to render the documentation for
     * @param {String} item     The item to scroll down the page to that item
     */
    var renderDocumentation = function(type, docs, moduleId, item) {
        if (type === 'frontend') {
            oae.api.util.template().render($('#doc-ui-docs-template'), {
                'docs': docs,
                'module': moduleId
            }, $('#doc-docs-container'));
        } else if (type === 'backend') {
            oae.api.util.template().render($('#doc-docs-template'), {
                'docs': docs,
                'module': moduleId
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
     * Get and renders the documentation for a specific module
     * 
     * @param {String} type     The type of module to render the documentation for
     * @param {String} moduleId The id to render the documentation for
     * @param {String} item     The item to scroll down the page to that item
     */
    var getAndRenderDocumentation = function(type, moduleId, item) {
        getDocumentation(type, moduleId, function(docs) {
            renderDocumentation(type, docs, moduleId, item);
        });    
    }

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
            var moduleId = null;
            // If the current selected item contains backend
            if (selectedLinkToShow.indexOf('backend') > 0) {
                //Subtract the link to get the name of the module, in this case /docs/backend/
                moduleId = selectedLinkToShow.substr(14);
                setDocumentTitle(moduleId);
                getAndRenderDocumentation('backend', moduleId);
            } else {
                //Subtract the link to get the name of the module, in this case /docs/frontend/
                moduleId = selectedLinkToShow.substr(15);
                setDocumentTitle('oae.api.' + moduleId);
                getAndRenderDocumentation('frontend', moduleId);
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
     * Load the documentation for a module and update the navigation 
     *
     * @param {String}      type        The type of the module
     * @param {String}      item        The id of the module
     * @param {String[]}    modules     List of all available modules
     */
    var loadDocumentation = function(type, item, modules) {
        // Get the moduleId from the item, it's the first part before a . 
        var moduleId = item.substr(0, item.indexOf('.'));
        // If the moduleId is empty load the first module from the modules array
        if (moduleId.length === 0) {
            moduleId = modules[0];
        }
        // Set the li active -> twitter bootstrap
        $('#'+ type + '-' + moduleId).addClass('active');
        // Get and render the documentation
        getAndRenderDocumentation(type, moduleId, item);
    };
    
    /**
     * Initializes the API Docs UI
     */
    var doInit = function() {
        // Remove all slashes from the pathname to get the name of the module
        var pathname = window.location.pathname.replace(/\//g,'');

        // Get all the frontend modules
        getAvailableModulesForType('frontend', function(modulesFrontend) {
            modulesFrontend.sort();
            // Render the frontend navigation without a specific module
            renderNavigation('frontend', modulesFrontend, null);
            // Get all the backend modules
            getAvailableModulesForType('backend', function(modulesBackend) {
                modulesBackend.sort();
                // Render the backend navigation without a specific module
                renderNavigation('backend', modulesBackend, null);
                // Add binding for the navigation
                addBinding();
                // Remove docs from the path
                pathname = pathname.slice(4);
                // Check the pathname
                if (pathname.indexOf('frontend') > -1) {
                    // Remove frontend from path
                    var item = pathname.slice(8);
                    setDocumentTitle('oae.api.' + item);
                    loadDocumentation('frontend', item, modulesFrontend);
                } else {
                    // Remove backend from path
                    var item = pathname.slice(7);
                    setDocumentTitle(item);
                    loadDocumentation('backend', item, modulesBackend);
                }
            });
        });
    };

    doInit();

});
