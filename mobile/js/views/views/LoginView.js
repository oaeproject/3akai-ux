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
        var _settings = LoginView.prototype.settings = {
            name: "loginView",
            template: {
                'templateID': "#login-view-template",
                'templateURL': "/mobile/templates/views/login-view.html"
            }
        };

        // Constructor
        function LoginView() {}

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
            oae.api.util.template().render(_settings.template.templateID, null, $('#oae-mobile-viewport'));
            addBinding();
        };

        var addBinding = function() {
            $('#btnLogin').bind('click', doLogin);
            $('#btnTwitter').bind('click', doSocialLogin);
        };

        var deleteBinding = function() {
            $('#btnLogin').unbind('click', doLogin);
            $('#btnTwitter').bind('click', doSocialLogin);
        };

        var doLogin = function(event) {
            var username = $('#txtUsername').val();
            var password = $('#txtPassword').val();
            if(username && password){
                $(document).trigger(
                    constants.authentication.events.loginattempt,
                    {
                        username: username,
                        password: password,
                        callback: function(err){
                            if(err){

                                // TODO: Replace with custom modal view
                                var message = "Wrong username and/or password";
                                window.alert(message);

                                // TODO: set message as event message object
                                $(document).trigger(constants.alerts.init);
                            }
                        }
                    }
                );
            }else{

                // TODO: Replace with custom modal view

                var message = oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_PASSWORD_AND_USERNAME__');
                window.alert(message);

                // TODO: set message as event message object
                $(document).trigger(constants.alerts.init);
            }
            return false;
        };

        /**
         * Login using social network credentials
         * @param {Event}   e                   The dispatched event
         * @param {Object}  currentTarget       The dispatcher
         */
        var doSocialLogin = function(e) {
            var type = null;
            var id = e.currentTarget.id;
            switch(id){
                case 'btnTwitter':
                    type = constants.authentication.types.twitter;
                    break;
            }
            $(document).trigger(
                constants.authentication.events.socialloginattempt, type,
                function(err){
                    if(err){
                        console.log('[LoginView] doSocialLogin callback');
                        console.log(err);
                    }
                }
            );
        };

        return LoginView;
    }
);
