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
        viewController:         '/mobile/js/controllers/ViewController',
        userController:         '/mobile/js/controllers/UserController',
        loginViewController:    '/mobile/js/views/LoginView',
        homeViewController:     '/mobile/js/views/HomeView',
        detailViewController:   '/mobile/js/views/DetailView'
    }
});

require(
    [
        'jquery','underscore','oae.core',
        '/mobile/js/mobile.util.js',
        'viewController',
        'userController',
        'loginViewController',
        'homeViewController',
        'detailViewController'
    ],
    function($, _, oae, mobileUtil, viewController, userController, loginViewController, homeViewController, detailViewController) {

        // Properties
        var viewPort = {},
            activeView = {};

        /**
         * Init the view controller
         */
        var initFrontcontroller = function() {

            // Set windowcontroller and viewstack
            var windowcontroller = new Moobile.WindowController;
            viewPort = new Moobile.ViewControllerStack;

            // Listen to mainController
            viewController.addEvent('VIEWCHANGED', switchView);
            viewController.addEvent('VIEWPOPPED', popView);

            // Set the first view (according whether the user is logged in or not)
            activeView = (oae.data.me.anon)
                ? new loginViewController
                : new homeViewController;
            viewPort.pushViewController(activeView);

            // Set the viewstack as the root view controller
            windowcontroller.setRootViewController(viewPort);
        };

        /**
         * Handles the dispatched event from a page
         *
         * @param data              The parameters
         * @param data.target       The panel that needs to be shown
         * @param data.transition   The transition between the views
         * @param sender            The dispatcher
         */
        var switchView = function(data, sender) {
            if(data && data != null){
                var newView = {};
                if(data.target != null){
                    switch(data.target){
                        case 'login':
                            newView = new loginViewController;
                            break;
                        case 'home':
                            newView = new homeViewController;
                            break;
                        case 'detail':
                            newView = new detailViewController;
                            break;
                    }
                    viewPort.pushViewController(newView, data.transition);
                }
            }
        };

        /**
         * Pops the previous view from the stack
         */
        var popView = function() {
            viewPort.popViewController();
        };

        /**
         * Initializes the mobile UI
         */
        var doInit = function() {
            // Initialize the side menu
            initFrontcontroller();
        };

        doInit();
    }
);