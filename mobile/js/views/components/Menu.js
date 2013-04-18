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

        // Instance of MainController
        var mainController = null;
        // Whether the menu is active or not
        var active = false;

        //////////////////////
        //// Constructor /////
        //////////////////////

        var Menu = function(controller) {
            mainController = controller;
        };

        ///////////////////////
        /// Public methods ////
        ///////////////////////

        // Settings for Menu
        var settings = Menu.prototype.settings = {
            name: "menu",
            items: [],
            template: {
                'templateID':   "#menu-template",
                'templateURL':  "/mobile/templates/components/menu.html"
            }
        };

        // Initialize Menu
        Menu.prototype.initialize = function() {
            settings.items = mainController.getSettings()['menu'].items;
            renderTemplate();
        };

        // Destroy Menu
        Menu.prototype.destroy = function() {
            destroyBinding();
        };

        ///////////////////////
        // Getters & Setters //
        ///////////////////////

        Menu.prototype.getActive = function() {
            return active;
        };

        Menu.prototype.setActive = function(val) {
            active = val;
        };

        ///////////////////////
        /// Private methods ///
        ///////////////////////

        // Renders the template + inserts navigation widget
        var renderTemplate = function() {
            oae.api.util.template().render(settings.template.templateID, null, $('#oae-mobile-menu-container'));
            oae.api.widget.insertWidget('mobilenavigation', null, $('#mobile-navigation-widget-container'), null, {'settings': settings, 'constants': constants},
                function() {
                    addBinding();
                }
            );
        };

        // Add binding
        var addBinding = function() {
            $('#oae-mobile-menu').find('li').bind('click', onItemClickHandler);
        };

        // Destroy binding
        var destroyBinding = function() {
            $('#oae-mobile-menu').find('li').unbind('click', onItemClickHandler);
        };

        // When menu item gets clicked
        var onItemClickHandler = function(e) {
            var action = $(e.currentTarget).attr('data-action');
            $(document).trigger(constants.events.activities.menuclicked, action);
        };

        return Menu;
    }
);
