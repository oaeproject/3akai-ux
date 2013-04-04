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
        var templateId = '#home-view-template';

        // Constructor
        function HomeView() {
            console.log('[HomeView] constructor');
            this.initialize();
        }

        // Public methods
        HomeView.prototype.initialize = function() {
            console.log('[HomeView] initialize');
            renderTemplate();
        };

        HomeView.prototype.destroy = function() {
            console.log('[HomeView] destroy');
            deleteBinding();
        };

        // Private methods
        var renderTemplate = function() {
            console.log('[HomeView] renderTemplate');
            oae.api.util.template().render(templateId, null, $('#viewport'));
            addBinding();
        };

        var addBinding = function() {
            console.log('[HomeView] addBinding');
            $('#btnLogout').bind('click', onLogoutClick);
        };

        var deleteBinding = function() {
            console.log('[HomeView] deleteBinding');
            $('#btnLogout').unbind('click', onLogoutClick);
        };

        var onLogoutClick = function(event) {
            $(document).trigger(
                constants.user.logoutattempt,
                {
                    callback: function(err){
                        // TODO: do something if error occurs (e.g. warning)
                    }
                }
            );
        };

        return HomeView;
    }
);