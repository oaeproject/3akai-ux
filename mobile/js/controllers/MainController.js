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
        'oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js',
        './viewController',
        './userController'
    ],
    function(oae, constants, mobileUtil, viewController, userController) {

        // Properties
        var instance = null;
        var settings = null;

        // Constructor
        function MainController() {
            if(instance !== null) throw new Error("Cannot instantiate more than one MainController.");
            instance = this;
        }

        /**
         * Initialize UserController
         */
        MainController.prototype.initialize = function() {
            // Listen to events from controllers
            addBinding();
            // Load settings from JSON file
            loadSettings();
        };

        MainController.prototype.getSettings = function() {
            return settings;
        };

        // Private methods
        var loadSettings = function() {
            $.ajax({
                dataType: 'json',
                url: constants.paths.settings,
                success: function(data){
                    settings = data;
                    initControllers();
                },
                error: function(e){
                    console.log('[MainController] loadSettings => error');
                    console.log(e);
                }
            });
        };

        var initControllers = function() {
            userController.initialize();
            viewController.initialize();
        };

        var addBinding = function() {
            console.log('[MainController] addBinding');
        };

        // Singleton
        if(!instance) instance = new MainController();
        return instance;
    }
);