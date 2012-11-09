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

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * Renders the documentation for a specific module
     * @param {Object} docs    The documentation object as returned from the server
     * @param {String} module  The module name to render the documentation for
     */
    var renderDocs = function(docs, module) {
        sakai.api.Util.TemplateRenderer('doc_docs_template', {
            'docs': docs,
            'module': module
        }, $('#doc_docs_container'));

        // Scroll to the appropriate place on the page
        var offset = 0;
        var hash = getHash();
        if (hash !== getModule()){
            var $anchor = $('a[name="#' + hash + '"]');
            offset = $anchor.offset().top;
        }
        window.scrollTo(0, offset);
    };

    /**
     * Renders the navigation for the available modules
     * @param {Array<String>}  modules       An Array of module names
     * @param {String}         moduleToLoad  The name of the module that is currently shown in the UI
     */
    var renderDocModules = function(modules, moduleToLoad) {
        sakai.api.Util.TemplateRenderer('doc_contents_template', {
            'modules': modules,
            'moduleToLoad': moduleToLoad
        }, $('#doc_contents_container'));
    };

    /**
     * Gets the documentation for a specific module and passes it in a callback
     * @param {String}    module    The name of the module to get the documentation of
     * @param {Function}  callback  Function executed after the documentation for the module has been retrieved
     */
    var getDocsForModule = function(module, callback) {
        $.ajax({
            url: '/api/doc/module/' + module,
            success: function(docs) {
                callback(docs);
            }, error: function(err) {
                callback(err.status);
            }
        });
    };

    /**
     * Gets the available oae modules and passes them in a callback
     * @param {Function} callback Function executed after the list of modules has been retrieved
     */
    var getDocModules = function(callback) {
        $.ajax({
            url: '/api/doc/modules',
            success: function(modules) {
                callback(modules);
            }
        });
    };

    /**
     * Gets and returns the hash from the URL
     * @return {String} Returns the hash from the URL
     */
    var getHash = function() {
        return window.location.hash.replace('#', '');
    };

    /**
     * Gets and returns the module name
     * @return {String} Returns the module requested in the url
     */
    var getModule = function() {
        var moduleToLoad = getHash();
        //Trim to just the part before the first '.'
        if (moduleToLoad.indexOf('.') > -1) {
            moduleToLoad = moduleToLoad.substring(0, moduleToLoad.indexOf('.'));
        }
        return moduleToLoad;
    };

    /**
     * Sets the title of the document to `title API Reference - Sakai OAE`
     * @param {String} title The title to be prefixed to the base document title
     */
    var setDocumentTitle = function(title) {
        document.title = title + ' API Reference - Sakai OAE';
    };

    /**
     * Adds binding to various elements and events in the UI
     */
    var addBinding = function() {
        $(window).hashchange(function() {
            var moduleToLoad = getModule();
            setDocumentTitle(moduleToLoad);
            getDocsForModule(moduleToLoad, function(docs) {
                $('.bs-docs-sidenav li').removeClass('active');
                $('#' + moduleToLoad).addClass('active');

                renderDocs(docs, moduleToLoad);
            });
        });
    };

    /**
     * Initializes the API Docs UI
     */
    var doInit = function() {

        addBinding();

        var moduleToLoad = getModule();

        getDocModules(function(modules) {
            modules.sort();

            if (!moduleToLoad) {
                moduleToLoad = modules[0];
            }

            setDocumentTitle(moduleToLoad);

            renderDocModules(modules, moduleToLoad);

            getDocsForModule(moduleToLoad, function(docs) {
                renderDocs(docs, moduleToLoad);
            });
        });
    };

    doInit();

});
