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

        var views = [];
        var activeView = null;
        var oldView = null;

        // Constructor
        function ViewController() {
            if(instance !== null) throw new Error("Cannot instantiate more than one ViewController.");
            instance = this;
        }

        /**
         * Initialize ViewController
         */
        ViewController.prototype.initialize = function() {
            instance.changeView(oae.data.me.anon ? constants.views.login : constants.views.home);
            addBinding();
        };

        /**
         * Push a new view into the stack
         * @param {String} view          The new view that will be pushed into the stack
         */
        ViewController.prototype.changeView = function(view) {
            if(activeView){
                oldView = activeView;
                oldView.destroy();
            }
            switch(view){
                case constants.views.login:
                    activeView = new LoginView();
                    break;
                case constants.views.home:
                    activeView = new HomeView();
                    break;
                case constants.views.detail:
                    activeView = new DetailView();
                    break;
            }
        };

        /**
         * Pop the current view from the stack
         * @param {String} view         The view that needs to be popped from the stack
         */
        ViewController.prototype.popView = function(view) {
            console.log('[ViewController] popView: ' + view);
            $(document).trigger(constants.events.viewpopped, [view]);
        };

        // Private methods
        var addBinding = function() {
            $(document).on(constants.user.loginsuccess, onLoginSuccess);
            $(document).on(constants.user.logoutsuccess, onLogoutSuccess);
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