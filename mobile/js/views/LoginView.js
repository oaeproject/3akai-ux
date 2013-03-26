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

define(['exports', 'jquery', 'oae.core'], function(exports, $, oae) {

    return new Class({

        Extends: Moobile.ViewController,

        // Properties
        loginButton: null,

        // Methods
        loadView: function() {
            console.log('[loginViewController] loadView');
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
            console.log('[loginViewController] onLoginButtonTap');
        }
    });

});