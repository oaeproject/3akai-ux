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
        './viewController'
    ],
    function(oae, constants, mobileUtil, viewController) {

        // Properties
        var instance = null;

        // Constructor
        function UserController() {
            if(instance !== null) throw new Error("Cannot instantiate more than one UserController.");
            instance = this;
        }

        /**
         * Initialize UserController
         */
        UserController.prototype.initialize = function() {
            addBinding();
        };

        /**
         * Login
         *
         * @param {Event}       e                   The dispatched event
         * @param {Object}      obj                 The object containing the login values
         * @param {String}      obj.username        The username
         * @param {String}      obj.password        The password
         * @param {Function}    obj.callback        The callback function
         */
        var login = function(e, obj) {
            $(document).trigger(constants.events.activitystart);
            oae.api.authentication.login(obj.username, obj.password, function(err) {
                $(document).trigger(constants.events.activityend);
                if(err) {
                    obj.callback(err);
                }else{
                    obj.callback();
                    oae.init(function(e){
                        $(document).trigger(constants.user.loginsuccess);
                    });
                }
            });
        };

        /**
         * Logout
         *
         * @param {Event}       e                   The dispatched event
         * @param {Object}      obj                 The parameters
         * @param {Function}    obj.callback        The callback function
         */
        var logout = function(e, obj) {
            $(document).trigger(constants.events.activitystart);
            oae.api.authentication.logout(function(err) {
                $(document).trigger(constants.events.activityend);
                if(err) {
                    obj.callback(err);
                }else{
                    obj.callback();
                    oae.init(function(e){
                        $(document).trigger(constants.user.logoutsuccess);
                    });
                }
            });
        };

        // Private methods
        var addBinding = function() {
            $(document).on(constants.user.loginattempt, login);
            $(document).on(constants.user.logoutattempt, logout);
        };

        // Singleton
        if(!instance) instance = new UserController();
        return instance;
    }
);