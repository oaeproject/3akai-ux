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

require(['jquery', 'underscore', 'oae.core'], function($, _, oae) {

    sakai_global = sakai_global || {};
    sakai.widgets = sakai.widgets || {};
    sakai.widgets = {};
    sakai_global.qunit = sakai_global.qunit || {};
    sakai_global.qunit.widgets = sakai_global.qunit.widgets || [];
    sakai_global.qunit.widgetsdone = false;

    /**
     * An array of all of the widgets in the system
     */
    var widgetList = _.keys(oae.api.widget.getWidgetManifests());


    /**
     * Grab all the widget config files
     *
     * This does the same thing as /var/widgets.json does, but
     * since we have to be able to do this without a sever, we recreate
     * the effect here
     */

    var loadWidgets = function() {
        sakai_global.qunit.allJSFiles = $.merge([], sakai_global.qunit.devJsFiles);
        sakai_global.qunit.allCssFiles = $.merge([], sakai_global.qunit.devCssFiles);
        sakai_global.qunit.allHtmlFiles = $.merge([], sakai_global.qunit.devHtmlFiles);
        for (var i=0, j=widgetList.length; i<j; i++) {
            var widget = widgetList[i];

            (function(widgetName) {
                var widgetJS = '/devwidgets/' + widgetName + '/javascript/' + widgetName + '.js';
                var widgetCSS = '/devwidgets/' + widgetName + '/css/' + widgetName + '.css';;
                var widgetHTML = false;
                $.ajax({
                    url: '/devwidgets/' + widgetName + '/config.json',
                    dataType: 'json',
                    success: function(data) {
                        sakai.widgets[widgetName] = data;
                        widgetHTML = sakai.widgets[widgetName].url;
                        sakai_global.qunit.widgets.push({name:widgetName, html: widgetHTML, css: widgetCSS, js: widgetJS});
                        if (widgetList.length === sakai_global.qunit.widgets.length) {
                            sakai_global.qunit.widgetsdone = true;
                            $(window).trigger('widgetsdone.qunit.sakai');
                        }
                    }
                });
            })(widget);
        }
    };

    if (sakai_global.qunit.devfilesdone) {
        loadWidgets();
    } else {
        $(window).on('devfilesdone.qunit.sakai', function() {
            loadWidgets();
        });
    }


});
