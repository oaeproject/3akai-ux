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

// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.welcome
     *
     * @class welcome
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.welcome = function(tuid, showSettings) {

        var $rootel = $('#' + tuid);
        var $welcomeWidget = $('.welcome_widget', $rootel);
        var welcomeTemplate = 'welcome_template';

        var addBinding = function() {
            $welcomeWidget.on('click', 'button[data-trigger]', function() {
                $(window).trigger($(this).attr('data-trigger'));
            });
        };

        var renderWidget = function() {
            $welcomeWidget.html(sakai.api.Util.TemplateRenderer(welcomeTemplate, {
                'anon': sakai.data.me.user.anon || false
            }));
        };

        renderWidget();
        addBinding();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('welcome');
});
