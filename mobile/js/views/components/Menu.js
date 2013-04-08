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
        var mainController = null;

        var _settings = Menu.prototype.settings = {
            name: "menu",
            items: [],
            template: {
                'templateID':   "#menu-template",
                'templateURL':  "/mobile/templates/components/menu.html"
            }
        };

        /////////////////////
        //// Constructor ////
        /////////////////////

        function Menu(_mainController) {
            mainController = _mainController;
            this.initialize();
        }

        ////////////////////
        // Public methods //
        ////////////////////

        Menu.prototype.initialize = function() {
            console.log('[Menu] initialize');
            _settings.items = mainController.getSettings()['menu'].items;
            renderTemplate();
        };

        Menu.prototype.destroy = function() {
            console.log('[Menu] destroy');
            deleteBinding();
            destroyTemplate();
        };

        /////////////////////
        // Private methods //
        /////////////////////

        var renderTemplate = function() {
            console.log('[Menu] render template');
            var id = _settings.template.templateID;
            var url = _settings.template.templateURL;
            var target = $('#oae-mobile-menu-container');
            mobileUtil.renderComponent(id, url, target, _settings, function(err){
                if(!err) addBinding();
            });
        };

        var destroyTemplate = function() {
            console.log('[Menu] destroy template');
        };

        var addBinding = function() {
            console.log('[Menu] addBinding');
            $('#oae-mobile-menu').find('li').bind('click', onItemClickHandler);
        };

        var deleteBinding = function() {
            console.log('[Menu] deleteBinding');
            $('#oae-mobile-menu').find('li').unbind('click', onItemClickHandler);
        };

        var onItemClickHandler = function(e) {
            console.log('[Menu] onItemClickHandler');
        };

        return Menu;
    }
);