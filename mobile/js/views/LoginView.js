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
        '/mobile/js/mobile.util.js'
    ],
    function($, _, oae, constants, mobileUtil) {

        // Properties
        var _templateId = null;

        // Constructor
        function LoginView(templateId) {
            _templateId = templateId;
            this.initialize();
        }

        // Public methods
        LoginView.prototype.initialize = function() {
            renderTemplate();
        };

        LoginView.prototype.destroy = function() {
            _templateId = null;
            deleteBinding();
        };

        // Private methods
        var renderTemplate = function() {
            oae.api.util.template().render(_templateId, null, $('#viewport'));
            addBinding();
        };

        var addBinding = function() {
            $('#btnLogin').bind('click', onLoginClick);
        };

        var deleteBinding = function() {
            $('#btnLogin').unbind('click', onLoginClick);
        };

        var onLoginClick = function(event) {
            var username = $('#txtUsername').val();
            var password = $('#txtPassword').val();
            if(username && password){
                $(document).trigger(
                    constants.user.loginattempt,
                    {
                        username: username,
                        password: password,
                        callback: function(err){
                            if(err){
                                // TODO: do something if error occurs (e.g. warning)
                            }
                        }
                    }
                );
            }else{
                console.log('[LoginView] username and/or password are empty');
            }
        };

        return LoginView;
    }
);