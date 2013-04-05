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

define(
    [
        'jquery','underscore','oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js',
        '/mobile/js/views/LoginView.js',
        '/mobile/js/views/HomeView.js',
        '/mobile/js/views/DetailView.js'
    ],
    function($, _, oae, constants, mobileUtil, LoginView, HomeView, DetailView) {

        // Properties
        var instance = null;

        var $helper =  $('#oae-mobile-template-helper');

        var _views = null;
        var _templates = null;
        var _activeView = null;
        var _oldView = null;

        // Constructor
        function ViewController() {
            if(instance !== null) throw new Error("Cannot instantiate more than one ViewController.");
            instance = this;
        }

        /**
         * Initialize ViewController
         */
        ViewController.prototype.initialize = function() {
            // Listen to events from controllers
            addBinding();
            // Init views
            initViews();
            // Render all templates
            renderAllTemplates();
        };

        /**
         * Push a new view into the stack
         * @param {String} view          The new view that will be pushed into the stack
         */
        ViewController.prototype.changeView = function(view) {
            if(_activeView){
                _oldView = _activeView;
                _oldView.destroy();
            }
            switch(view){
                case constants.views.login:
                    _activeView = new LoginView(_views[0]['loginView']['templateId']);
                    break;
                case constants.views.home:
                    _activeView = new HomeView(_views[1]['homeView']['templateId']);
                    break;
                case constants.views.detail:
                    _activeView = new DetailView(_views[2]['detailView']['templateId']);
                    break;
            }
        };

        /**
         * Pop the current view from the stack
         * @param {String} view         The view that needs to be popped from the stack
         */
        ViewController.prototype.popView = function(view) {
            $(document).trigger(constants.events.viewpopped, [view]);
        };

        // Private methods

        /**
         * Initialize and render the view templates
         */
        var initViews = function() {
            _views = [
                {
                    'loginView': {
                        templateId  : '#login-view-template',
                        template    : '/mobile/templates/views/login-view.html'
                    }
                },
                {
                    'homeView': {
                        templateId  : '#home-view-template',
                        template    : '/mobile/templates/views/home-view.html'
                    }
                },
                {
                    'detailView': {
                        templateId  : '#detail-view-template',
                        template    : '/mobile/templates/views/detail-view.html'
                    }
                }
            ];
        };

        /**
         * Listen to events dispatched from controllers
         */
        var addBinding = function() {
            $(document).on(constants.events.templatesready, onTemplatesReady);
            $(document).on(constants.user.loginsuccess, onLoginSuccess);
            $(document).on(constants.user.logoutsuccess, onLogoutSuccess);
        };

        /**
         * Renders all the templates and caches them
         */
        var renderAllTemplates = function() {
            _templates = {};
            _.each(_views, function(view){
                for(var key in view){
                    var total = _views.length;
                    var index = _views.indexOf(view) + 1;
                    mobileUtil.renderPageTemplate(key, view[key], index, total, function(err, obj){
                        _templates[obj.name] = {
                            'template': obj.template,
                            'templateId': obj.templateId,
                            'el': obj.el
                        };
                    });
                }
            });
        };

        /**
         * Called when all templates are rendered
         * Add templates to the helper element and initialize startup view
         */
        var onTemplatesReady = function() {
            for(var template in _templates) $helper.append(_templates[template]['el']);
            setStartupView();
        };

        /**
         * Set startup view, depends if user is logged in or not
         */
        var setStartupView = function() {
            var newView = oae.data.me.anon ? constants.views.login : constants.views.home;
            instance.changeView(newView);
        };

        var onLoginSuccess = function() {
            instance.changeView(constants.views.home);
        };

        var onLogoutSuccess = function() {
            instance.changeView(constants.views.login);
        };

        // Singleton
        if(!instance) instance = new ViewController();
        return instance;
    }
);