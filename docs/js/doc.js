/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

require(['jquery', 'oae.core', 'jquery.history'], function($, oae) {

    /**
     * Renders the documentation for a specific module
     */
    var renderModuleDocs = function() {
        // Extract the selected module and type from the History.js state
        var module = History.getState().data.module;
        var type = History.getState().data.type;

        // Change the browser title
        setDocumentTitle(module);
        // Make the correct left hand nav item selected
        $('.bs-docs-sidenav li').removeClass('active');
        $('[data-id="' + module + '"]').addClass('active');

        // Get the current requested module from the History.js
        // Retrieve the documentation for the current module from the server
        getModuleDocs(module, type, function(docs) {
            oae.api.util.template().render($('#doc-module-template'), {
                'docs': docs,
                'module': module
            }, $('#doc-module-container'));

            // Scroll to the appropriate place on the page. This will be the top of the page most of the time, unless
            // a direct link to a function has been clicked (e.g. http://cambridge.oae.com/docs/backend/oae-authentication/createUser)
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
     * @param  {String[]}    modules          An Array of module names
     * @param  {String}      currentModule    The name of the module that is currently shown in the UI
     */
    var renderNavigation = function(modules, currentModule) {
        oae.api.util.template().render($('#doc-modules-template'), modules, $('#doc-modules-container'));
    };

    /**
     * Gets the documentation for a specific module and passes it in a callback
     *
     * @param  {String}    module            The name of the module to get the documentation for
     * @param  {String}    type              The type of the module being loaded. Accepted values are `backend` and `frontend`
     * @param  {Function}  callback          Function executed after the documentation for the module has been retrieved
     * @param  {Object}    callback.docs     Retrieved documentation for the specified module. This will be null when the documentation could not be retrieved
     */
    var getModuleDocs = function(module, type, callback) {
        $.ajax({
            url: '/api/doc/' + type + '/' + module,
            success: function(docs) {
                callback(docs);
            }, error: function(err) {
                callback(null);
            }
        });
    };

    /**
     * Get the available OAE back-end and front-end modules.
     *
     * @param  {Function}    callback            Function executed after the list of modules has been retrieved
     * @param  {Object}      callback.modules    Object where the keys are "frontend" and "backend" and the values are an array of available modules
     */
    var getAvailableModules = function(callback) {
        var modules = {};
        // Get the available front-end modules
        $.ajax({
            url: '/api/doc/frontend',
            success: function(frontendModules) {
                modules.frontend = frontendModules;
                // Get the available back-end modules
                 $.ajax({
                    url: '/api/doc/backend',
                    success: function(backendModules) {
                        modules.backend = backendModules;
                        callback(modules);
                    }
                });
            }
        });
    };

    /**
     * Sets the title of the document to `Open Academic Environment - API Reference - title`
     *
     * @param  {String}  title   The title to be added to the document title
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
            'type': $(this).attr('data-type'),
            'module': $(this).attr('data-id')
        }, $('title').text(), $('a', $(this)).attr('href'));
        return false;
    };

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
        getAvailableModules(function(modules) {
            modules.frontend.sort();
            modules.backend.sort();

            // Extract the currently selected module from the URL by parsing the URL fragment that's
            // inside of the current History.js hash. The expected URL structure is `/docs/module/<moduleId>/<apiFunction>`.
            var initialState = $.url(History.getState().hash);
            var type = initialState.segment(2) || 'frontend';
            var moduleToLoad = initialState.segment(3) || modules[type][0];
            var apiFunction = initialState.segment(4);

            // Render the left hand navigation
            renderNavigation(modules, moduleToLoad);

            // When the page loads, the History.js state data object will either be empty (when having
            // followed a link or entering the URL directly) or will contain the previous state data when
            // refreshing the page. This is why we use the URL to determine the initial state. We want
            // to replace the initial state with all of the required state data for the requested URL so
            // we have the correct state data in all circumstances. Calling the `replaceState` function
            // will automatically trigger the statechange event, which will take care of the documentation rendering.
            // for the requested module. However, as the page can already have the History.js state data
            // when only doing a page refresh, we need to add a random number to make sure that History.js
            // recognizes this as a new state and triggers the `statechange` event.
            History.replaceState({
                'type': type,
                'module': moduleToLoad,
                'apiFunction': apiFunction,
                '_': Math.random()
            }, $('title').text(), History.getState().cleanUrl);
        });
    };

    doInit();

});
