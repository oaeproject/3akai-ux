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
        var template = '/mobile/templates/views/detail-view.html';
        var templateId = '#detail-view-template';

        // Constructor
        function DetailView() {
            console.log('[DetailView] constructor');
            this.initialize();
        }

        // Public methods
        DetailView.prototype.initialize = function() {
            console.log('[DetailView] initialize');
            renderTemplate();
        };

        DetailView.prototype.destroy = function() {
            console.log('[DetailView] destroy');
            deleteBinding();
        };

        // Private methods
        var renderTemplate = function() {
            console.log('[DetailView] render template');
            mobileUtil.renderPageTemplate(template, function(err){
                if(!err){
                    oae.api.util.template().render(templateId, null, $('#viewport'));
                    addBinding();
                }
            });
        };

        var addBinding = function() {
            console.log('[DetailView] addBinding');
        };

        var deleteBinding = function() {
            console.log('[DetailView] deleteBinding');
        };

        return DetailView;
    }
);