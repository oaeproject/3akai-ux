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
            id: constants.views.login,
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
        };

        // Private methods
        var renderTemplate = function() {
            try{
                oae.api.util.template().render(_settings.template.templateID, null, $('#oae-mobile-viewport'));
            }catch(e){
                console.log('[LoginView] renderTemplate => rendering login-view-template into viewport failed');
                location.reload();
            }finally{
                oae.api.widget.insertWidget('mobilelogin', null, $('#mobile-login-widget-container'), null, constants);
            }
        };

        return LoginView;
    }
);
