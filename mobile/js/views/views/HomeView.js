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
        'jquery.swipe'
    ],
    function($, _, oae, constants) {

        /////////////////////
        //// Properties /////
        /////////////////////

        /////////////////////
        //// Constructor ////
        /////////////////////

        var HomeView = function() {};

        ////////////////////
        // Public methods //
        ////////////////////

        // Settings for HomeView
        var settings = HomeView.prototype.settings = {
            name: "homeView",
            id: constants.views.home,
            template: {
                'templateID': "#home-view-template",
                'templateURL': "/mobile/templates/views/home-view.html"
            }
        };

        HomeView.prototype.initialize = function() {
            initializeTemplate();
        };

        HomeView.prototype.destroy = function() {
            removeBinding();
        };

        /////////////////////
        // Private methods //
        /////////////////////

        /**
         * Gets the view template and renders it into the viewport
         */
        var initializeTemplate = function() {
            // Try to render the template
            try {
                oae.api.util.template().render(settings.template.templateID, null, $('#oae-mobile-viewport'));

            // When template rendering fails, dispatch an event that will be handled in the MainController
            } catch(e) {
                var type = constants.alerts.types.error;
                var message = oae.api.i18n.translate('__MSG__UNABLE_TO_LOAD_THE_PAGE__' + '. ' + '__MSG__TRY_AGAIN__' + '?');
                $(document).trigger(constants.alerts.init, {'confirm': true, 'type': type, 'message': message,
                    'callback': function(response) {
                        if (response) {
                            location.reload();
                        }
                    }
                });

            // Insert the widget + set the view title and bind events
            } finally {
                oae.api.widget.insertWidget('mobileactivity', null, $('#mobile-activity-widget-container'), null, constants, function(e) {
                    setTitle(oae.data.me.tenant);
                    addBinding();
                });
            }
        };

        /**
         * Set page title {String} title        The title of the page
         *
         * @param title
         */
        var setTitle = function(title) {
            $('.oae-mobile-view-title').html(title);
        };

        /**
         * When the menubutton gets clicked an event is dispatched and handled in the MainController
         */
        var onToggleMenuClick = function() {
            $(document).trigger(constants.events.activities.menutoggle);
        };

        /**
         * When the logo in the topbar gets clicked an event is dispatched and handled in the ViewController
         */
        var onTopbarLogoClick = function() {
            $(document).trigger(constants.events.activities.viewchanged, constants.views.home);
        };

        ////////////////////////
        /////// BINDING ////////
        ////////////////////////

        /**
         * Add eventlisteners to components
         */
        var addBinding = function() {
            // When the logo in the topbar gets clicked
            $('.oae-mobile-topbar-logo').bind('click', onTopbarLogoClick);
            // When the menubutton gets clicked
            $('#btnMenu').bind('click', onToggleMenuClick);
            // When a swipe is detected on the homeview
            $('#home-view').touchSwipe(onToggleMenuClick);
        };

        /**
         * Remove eventlisteners from components
         */
        var removeBinding = function() {
            // When the logo in the topbar gets clicked
            $('.oae-mobile-topbar-logo').unbind('click', onTopbarLogoClick);
            // When the menubutton gets clicked
            $('#btnMenu').unbind('click', onToggleMenuClick);
            // When a swipe is detected on the homeview
            $('#home-view').unbindSwipe(onToggleMenuClick);
        };

        return HomeView;
    }
);
