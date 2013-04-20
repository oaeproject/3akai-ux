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
     */
    var renderModuleDocs = function() {
        // Extract the selected module from the History.js state
        var module = History.getState().data.module;

        // Change the browser title
        setDocumentTitle(module);
        // Make the correct left hand nav item selected
        $('.bs-docs-sidenav li').removeClass('active');
        $('#' + module).addClass('active');

        // Get the current requested module from the History.js 
        // Retrieve the documentation for the current module from the server
        getModuleDocs(module, function(docs) {
            oae.api.util.template().render($('#doc-module-template'), {
                'docs': docs,
                'module': module
            }, $('#doc-module-container'));
    
            // Scroll to the appropriate place on the page. This will be the top of the page most of the time, unless
            // a direct link to a function has been clicked (e.g. http://cambridge.oae.com/docs#oae-authentication.api.removeStrategies)
            // In this case, we scroll to the function's documentation
            var offset = 0;
            var apiFunction = History.getState().data.apiFunction;
            if (apiFunction){
                var $anchor = $('a[name="' + module + '.' + apiFunction + '"]');
                offset = $anchor.offset().top;
            }
            window.scrollTo(0, offset);
        });
    };

    /**
     * Renders the navigation for the available modules
     * 
     * @param {String[]}    modules          An Array of module names
     * @param {String}      currentModule    The name of the module that is currently shown in the UI
     */
    var renderNavigation = function(modules, currentModule) {
        oae.api.util.template().render($('#doc-modules-template'), {
            'modules': modules,
            'moduleToLoad': currentModule
        }, $('#doc-modules-container'));
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
     * Sets the title of the document to `Sakai OAE - API Reference - title`
     * 
     * @param {String}  title   The title to be added to the document title
     */
    var setDocumentTitle = function(title) {
        oae.api.util.setBrowserTitle(['API Reference', title]);
    };

    /**
     * Every time an new module is clicked, we push a new state using
     * History.js, containing the name of the module that should be loaded next.
     */
    var selectModule = function() {
        // Push the state and render the selected module
        History.pushState({
            'module': $(this).attr('id')
        }, null, $('a', $(this)).attr('href'));
        return false;
    }

    /**
     * Adds binding to various elements and events in the UI
     */
    var addBinding = function() {
        // Module switching
        $(document).on('click', '#doc-modules-container ul li', selectModule)
        // The statechange event will be triggered every time the browser back or forward button 
        // is pressed or state is pushed/replaced using Hisory.js.
        $(window).on('statechange', renderModuleDocs);
    };

    /**
     * Initializes the API Docs UI
     */
    var doInit = function() {
        addBinding();
        // Load the list of the available modules
        getAvailableModules(function(loadedModules) {
            modules = loadedModules.sort();

            // Extract the currently selected module from the URL. We parse the URL fragment that's 
            // inside of the current History.js state. The expected URL structure is `/docs/module/<moduleId>/<apiFunction>`. 
            var initialState = $.url(History.getState().hash);
            var moduleToLoad = initialState.segment(3) || modules[0];
            var apiFunction = initialState.segment(4);

            // Render the left hand navigation
            renderNavigation(modules, moduleToLoad);

            // Replace the current History.js state to have the selected module. This is necessary 
            // because a newly loaded page will not contain the data object in its state. Calling the 
            // replaceState function will automatically trigger the statechange event, which will take care 
            // of the documentation rendering for the module. However, we also need to add a random number 
            // to the data object to make sure that the statechange event is triggered after a page reload.
            History.replaceState({
                'module': moduleToLoad,
                'apiFunction': apiFunction,
                '_': Math.random()
            });
        });
    };

    doInit();

});
