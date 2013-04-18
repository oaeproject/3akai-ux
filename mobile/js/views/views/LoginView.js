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
        '/mobile/js/constants/constants.js'
    ],
    function($, _, oae, constants) {

        /////////////////////
        //// Properties /////
        /////////////////////

        // Settings for LoginView
        var settings = LoginView.prototype.settings = {
            name: "loginView",
            id: constants.views.login,
            template: {
                'templateID': "#login-view-template",
                'templateURL': "/mobile/templates/views/login-view.html"
            }
        };

        /////////////////////
        //// Constructor ////
        /////////////////////

        function LoginView() {}

        ////////////////////
        // Public methods //
        ////////////////////

        LoginView.prototype.initialize = function() {
            renderTemplate();
        };

        LoginView.prototype.destroy = function() {

        };

        /////////////////////
        // Private methods //
        /////////////////////

        /**
         * Gets the view template and renders it into the viewport
         */
        var renderTemplate = function() {
            try {
                oae.api.util.template().render(settings.template.templateID, null, $('#oae-mobile-viewport'));
            } catch(e) {
                location.reload();
            } finally {
                oae.api.widget.insertWidget('mobilelogin', null, $('#mobile-login-widget-container'), null, constants);
            }
        };

        return LoginView;
    }
);
