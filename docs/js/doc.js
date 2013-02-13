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
     * @param {Object} docs    The documentation object as returned from the server
     * @param {String} module  The module name to render the documentation for
     */
    var renderModuleDocs = function(docs, module) {
        oae.api.util.renderTemplate($('#doc_docs_template'), {
            'docs': docs,
            'module': module
        }, $('#doc_docs_container'));

        // Scroll to the appropriate place on the page. This will be the top of the page most of the time, unless
        // a direct link to a function has been clicked (e.g. http://cambridge.oae.com/docs#oae-authentication.api.removeStrategies)
        // In this case, we scroll to the function's documentation
        var offset = 0;
        var hash = window.location.hash.replace('#', '');
        if (hash && hash !== module){
            var $anchor = $('a[name="#' + hash + '"]');
            offset = $anchor.offset().top;
        }
        window.scrollTo(0, offset);
    };

    /**
     * Renders the navigation for the available modules
     * 
     * @param {String[]}    modules          An Array of module names
     * @param {String}      currentModule    The name of the module that is currently shown in the UI
     */
    var renderNavigation = function(modules, currentModule) {
        oae.api.util.renderTemplate($('#doc_contents_template'), {
            'modules': modules,
            'moduleToLoad': currentModule
        }, $('#doc_contents_container'));
    };

    /**
     * Gets the documentation for a specific module and passes it in a callback
     * 
     * @param {String}    module            The name of the module to get the documentation for
     * @param {Function}  callback          Function executed after the documentation for the module has been retrieved
     * @param {Object}    callback.docs     Retrieved documentation for the specified module. This will be null when the documentation could not be retrieved
     */
    var getModuleDocs = function(module, callback) {
        $.ajax({
            url: '/api/doc/module/' + module,
            success: function(docs) {
                callback(docs);
            }, error: function(err) {
                callback(null);
            }
        });
    };

    /**
     * Gets the available OAE modules and passes them in a callback
     * 
     * @param {Function}    callback            Function executed after the list of modules has been retrieved
     * @param {String[]}    callback.modules    List of all of the available OAE modules
     */
    var getAvailableModules = function(callback) {
        $.ajax({
            url: '/api/doc/modules',
            success: callback
        });
    };

    /**
     * Gets and returns the currently selected module by retrieving the hash from the URL
     * 
     * @return {String}         The currently selected module
     */
    var getSelectedModule = function() {
        var moduleToLoad = window.location.hash.replace('#', '');
        // As it is possible to reference a specific function in an API directly 
        // (e.g. http://cambridge.oae.com/docs#oae-authentication.api.removeStrategies),
        // we strip it out to just get the current module
        moduleToLoad = moduleToLoad.split('.')[0];
        return moduleToLoad;
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
        $(window).hashchange(function() {
            var moduleToLoad = getSelectedModule();
            setDocumentTitle(moduleToLoad);
            getModuleDocs(moduleToLoad, function(docs) {
                $('.bs-docs-sidenav li').removeClass('active');
                $('#' + moduleToLoad).addClass('active');
                renderModuleDocs(docs, moduleToLoad);
            });
        });
    };

    /**
     * Initializes the API Docs UI
     */
    var doInit = function() {
        addBinding();
        // Load the list of the available modules
        getAvailableModules(function(modules) {
            modules.sort();

            // Get the currently selected module. If there is no selected module,
            // we select the first one in the list
            var moduleToLoad = getSelectedModule() || modules[0];

            // Render the docs for the current module
            setDocumentTitle(moduleToLoad);
            renderNavigation(modules, moduleToLoad);
            getModuleDocs(moduleToLoad, function(docs) {
                renderModuleDocs(docs, moduleToLoad);
            });
        });
    };

    doInit();

});
