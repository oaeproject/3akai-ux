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
        var _settings = DetailView.prototype.settings = {
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
            _templateId = null;
            deleteBinding();
        };

        // Private methods
        var renderTemplate = function() {
            try{
                oae.api.util.template().render(_settings.template.templateID, null, $('#oae-mobile-viewport'));
            }catch(e){
                console.log('[DetailView] renderTemplate => rendering detail-view-template into viewport failed');
                location.reload();
            }finally{
                var arrHash = window.location.hash.split(':');
                var contentId = arrHash.slice(1,arrHash.length).join(':').toString();
                oae.api.content.getContent(contentId, function(err, profile) {
                    var data = {'constants': constants, 'profile': profile};
                    oae.api.widget.insertWidget('mobilecontentpreview', null, $('#mobile-content-preview-widget-container'), null, data, function(e){
                        setTitle(profile.displayName);
                        addBinding();
                    });
                });
            }
        };

        /**
         * Set page title {String} title        The title of the page
         * @param title
         */
        var setTitle = function(title){
            $('.oae-mobile-view-title').html(title);
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
