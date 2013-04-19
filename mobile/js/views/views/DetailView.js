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

        /////////////////////
        //// Constructor ////
        /////////////////////

        var DetailView = function() {};

        ////////////////////
        // Public methods //
        ////////////////////

        // Settings for DetailView
        var settings = DetailView.prototype.settings = {
            name: "detailView",
            id: constants.views.detail,
            template: {
                'templateID': "#detail-view-template",
                'templateURL': "/mobile/templates/views/detail-view.html"
            }
        };

        DetailView.prototype.initialize = function() {
            initializeWidget();
        };

        DetailView.prototype.destroy = function() {
            removeBinding();
        };

        /////////////////////
        // Private methods //
        /////////////////////

        /**
         * Gets the view template and renders it into the viewport
         */
        var initializeWidget = function() {
            try {
                oae.api.util.template().render(settings.template.templateID, null, $('#oae-mobile-viewport'));
            } catch(e) {
                // TODO: internationalise this
                var proceed = window.confirm('Unable to display the page. Try again?');
                if (proceed) {
                    location.reload();
                }
            } finally {
                var arrHash = window.location.hash.split(':');
                var id = arrHash.slice(1,arrHash.length).join(':').toString();
                switch(arrHash[1]) {
                    case 'g':
                        getGroupContent(id);
                        break;
                    case 'c':
                        getDocumentContent(id);
                        break;
                }
            }
        };

        /**
         * Gets content from group activity
         *
         * @param {String} groupId
         */
        var getGroupContent = function(groupId) {
            oae.api.group.getGroup(groupId, function(err, profile) {
                addWidget(profile);
            });
        };

        /**
         * Gets content from content created activity
         *
         * @param {String} contentId
         */
        var getDocumentContent = function(contentId) {
            oae.api.content.getContent(contentId, function(err, profile) {
                addWidget(profile);
            });
        };

        /**
         * Add the MobileContentDetail widget to the view
         *
         * @param {Object} profile
         */
        var addWidget = function(profile) {
            var data = {'constants': constants, 'profile': profile};
            oae.api.widget.insertWidget('mobilecontentdetail', null, $('#mobile-content-detail-widget-container'), null, data,
                function(e) {
                    // Hide activity indicator
                    $(document).trigger(constants.events.activities.activityend);
                    // Change view title
                    var title = profile.displayName;
                    if (!profile) {
                        title = oae.api.i18n.translate('__MSG__ERROR__');
                    }
                    setTitle(title);
                    addBinding();
                }
            );
        };

        /**
         * Set the view's title
         *
         * @param {String} title        The title of the page
         */
        var setTitle = function(title) {
            $('.oae-mobile-view-title').html(title);
        };

        /**
         * Bind events to components
         */
        var addBinding = function() {
            $('.oae-mobile-topbar-logo').bind('click', onTopbarLogoClick);
            $('#btnBack').bind('click', onBackButtonClick);
        };

        /**
         * Removes events from components
         */
        var removeBinding = function() {
            $('.oae-mobile-topbar-logo').unbind('click', onTopbarLogoClick);
            $('#btnBack').unbind('click', onBackButtonClick);
        };

        /**
         * When the logo in the topbar gets clicked
         */
        var onTopbarLogoClick = function() {
            $(document).trigger(constants.events.activities.viewchanged, constants.views.home);
        };

        /**
         * When the backbutton gets clicked
         */
        var onBackButtonClick = function() {
            $(document).trigger(constants.events.activities.viewchanged, constants.views.home);
        };

        return DetailView;
    }
);
