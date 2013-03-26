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
        loginViewController:    '/mobile/js/controllers/loginViewController',
        homeViewController:     '/mobile/js/controllers/homeViewController'
    }
});

require(['jquery', 'underscore', 'oae.core', '/mobile/js/mobile.util.js'],function($, _, oae, mobileUtil) {

        /**
         * Init the view controller
         */
        var initMoobile = function() {

            // Properties
            var windowcontroller = new Moobile.WindowController;
            var viewStack = new Moobile.ViewControllerStack;

            console.log(windowcontroller);

            /**
             * Login
             */
            var LoginViewController = new Class({

                Extends: Moobile.ViewController,

                // Properties
                loginButton: null,

                // Methods
                loadView: function() {
                    console.log('[LoginViewController] loadView');
                    this.view = Moobile.View.at('/mobile/templates/views/login-view.html');
                },

                viewDidLoad: function() {
                    console.log('[loginViewController] viewDidLoad');
                    this.parent();
                    this.loginButton = this.view.getChildComponent('login-button');
                    this.loginButton.addEvent('tap', this.bound('onLoginButtonTap'));
                },

                destroy: function() {
                    console.log('[loginViewController] destroy');
                    this.loginButton.removeEvent('tap', this.bound('onLoginButtonTap'));
                    this.loginButton = this.view.getChildComponent('login-button');
                    this.parent();
                },

                onLoginButtonTap: function(e, sender) {
                    console.log("onLoginButtonTap");
                    viewStack.pushViewController(new HomeViewController, new Moobile.ViewTransition.Slide);
                }
            });

            /**
             * Home
             */
            var HomeViewController = new Class({

                Extends: Moobile.ViewController,

                // Methods
                loadView: function() {
                    console.log('[HomeViewController] loadView');
                    this.view = Moobile.View.at('/mobile/templates/views/home-view.html');
                },

                viewDidLoad: function() {
                    console.log('[HomeViewController] viewDidLoad');
                },

                destroy: function() {
                    console.log('[HomeViewController] destroy');
                }
            });

            // Add the loginview to the viewstack
            viewStack.pushViewController(new LoginViewController);

            // Set the viewstack as the root view controller
            windowcontroller.setRootViewController(viewStack);
        };

        /**
         * Initializes the mobile UI
         */
        var doInit = function() {
            // Initialize the side menu
            initMoobile();
        };

        doInit();
    }
);