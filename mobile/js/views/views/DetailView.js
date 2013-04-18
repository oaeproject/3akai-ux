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

        // Properties
        var settings = DetailView.prototype.settings = {
            name: "detailView",
            id: constants.views.detail,
            template: {
                'templateID': "#detail-view-template",
                'templateURL': "/mobile/templates/views/detail-view.html"
            }
        };

        // Constructor
        function DetailView() {}

        // Public methods
        DetailView.prototype.initialize = function() {
            renderTemplate();
        };

        DetailView.prototype.destroy = function() {
            deleteBinding();
        };

        // Private methods
        var renderTemplate = function() {
            try {
                oae.api.util.template().render(settings.template.templateID, null, $('#oae-mobile-viewport'));
            } catch(e) {
                location.reload();
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
         * Set page title {String} title        The title of the page
         * @param title
         */
        var setTitle = function(title){
            $('.oae-mobile-view-title').html(title);
        };

        // Get group content from api
        var getGroupContent = function(groupId) {
            oae.api.group.getGroup(groupId, function(err, profile) {
                addWidget(profile);
            });
        };

        // Get document content from api
        var getDocumentContent = function(contentId) {
            oae.api.content.getContent(contentId, function(err, profile) {
                addWidget(profile);
            });
        };

        var addWidget = function(profile) {
            var data = {'constants': constants, 'profile': profile};
            oae.api.widget.insertWidget('mobilecontentdetail', null, $('#mobile-content-detail-widget-container'), null, data,
                function(e) {
                    // Hide activity indicator
                    $(document).trigger(constants.events.activities.activityend);
                    // Change view title
                    var title = null;
                    if (profile && profile != null) {
                        if (profile.displayName.length > 24) {
                            title = profile.displayName.substr(0,21) + "...";
                        } else {
                            title = profile.displayName;
                        }
                    } else {
                        title = oae.api.i18n.translate('__MSG__ERROR__');
                    }
                    setTitle(title);
                    // Bind events after rendering html
                    addBinding();
                }
            );
        };

        var addBinding = function() {
            $('.oae-mobile-topbar-logo').bind('click', onTopbarLogoClick);
            $('#btnBack').bind('click', onBackButtonClick);
        };

        var deleteBinding = function() {
            $('.oae-mobile-topbar-logo').unbind('click', onTopbarLogoClick);
            $('#btnBack').unbind('click', onBackButtonClick);
        };

        var onTopbarLogoClick = function() {
            $(document).trigger(constants.events.activities.viewchanged, constants.views.home);
        };

        var onBackButtonClick = function() {
            $(document).trigger(constants.events.activities.viewchanged, constants.views.home);
        };

        return DetailView;
    }
);
