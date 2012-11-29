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

require(['jquery','sakai/sakai.api.core'], function($, sakai) {

    sakai_global.explore = function() {
        var doInit = function() {
            if (sakai.config.enableCategories) {
                sakai.api.Util.TemplateRenderer($('#explore_categories_template'), {}, $('#explore_categories'));
            }

            sakai.api.Util.TemplateRenderer($('#explore_content_template'), sakai.config.explore, $('#explore_content'));
        };
        doInit();
    };

    sakai.api.Widgets.Container.registerForLoad('explore');
});
