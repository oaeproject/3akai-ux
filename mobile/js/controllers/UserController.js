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
        '/mobile/js/mobile.util.js',
        './viewController'
    ],
    function(oae, mobileUtil, viewController) {

        // Properties
        var instance = null;

        // Constructor
        function UserController() {
            if(instance !== null) throw new Error("Cannot instantiate more than one UserController.");
            instance = this;
        }

        /**
         * Login via with the api
         *
         * @param obj               The object containing the login values
         * @param obj.username      The username
         * @param obj.password      The password
         * @param callback          Callback function
         */
        UserController.prototype.login = function(obj, callback) {
            oae.api.authentication.login(obj.username, obj.password, function(err) {
                if(err) {
                    console.log('[UserController] login -> fail');
                    console.log(err);
                    callback(err);
                }else{
                    console.log('[UserController] login -> success');
                    viewController.changeView({'target': 'home', 'transition': new Moobile.ViewTransition.None});
                    callback();
                }
            });
        };

        /**
         *  Logout with the api
         */
        UserController.prototype.logout = function() {
            oae.api.authentication.logout(function(err) {
                if(err) {
                    console.log('[UserController] logout -> fail');
                    console.log(err)
                }else{
                    console.log('[UserController] logout -> success');
                    viewController.changeView({'target': 'login', 'transition': new Moobile.ViewTransition.None});
                }
            });
        };

        // Singleton
        if(!instance) instance = new UserController();
        return instance;
    }
);