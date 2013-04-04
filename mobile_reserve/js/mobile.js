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

require.config({
    paths: {
        viewController      : '/mobile/js/controllers/ViewController',
        userController      : '/mobile/js/controllers/UserController'
    }
});

require(
    [
        'jquery','underscore','oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js',
        'viewController',
        'userController'
    ],
    function($, _, oae, constants, mobileUtil, viewController, userController) {

        // Properties
        var views = {};

        /**
         * Show the activity indicator
         */
        var showIndicator = function() {
            console.log('[mobile] showIndicator');
        };

        /**
         * Hide the activity indicator
         */
        var hideIndicator = function() {
            console.log('[mobile] hideIndicator');
        };

        /**
         * Initialize and render the view templates
         */
        var initViews = function() {
            views = {
                'loginView': {
                    templateId: '#login-view-template',
                    template:   '/mobile/templates/views/login-view.html'
                },
                'homeView': {
                    templateId: '#home-view-template',
                    template:   '/mobile/templates/views/home-view.html'
                },
                'detailView': {
                    templateId: '#detail-view-template',
                    template:   '/mobile/templates/views/detail-view.html'
                }
            };
        };

        /**
         * Bind events to document or elements
         */
        var initEventListeners = function() {
            $(document).on(constants.events.activitystart, showIndicator);
            $(document).on(constants.events.activityend, hideIndicator);
        };

        /**
         * Initializes all the controllers
         */
        var initControllers = function() {
            userController.initialize();
            viewController.initialize(views);
        };

        /**
         * Initializes the mobile UI
         */
        var doInit = function() {
            // Init views
            initViews();
            // Init binding
            initEventListeners();
            // Init controllers
            initControllers();
        };

        doInit();
    }
);