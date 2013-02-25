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

define(['exports', 'jquery', 'oae.core'], function(exports, $, oae) {

    var changeToJSON = function(input) {
        var json = {};
        var inputLine = input.split(/\n/);
        var i;
        for (i in inputLine) {
            // IE 8 i has indexof as well which breaks the page.
            if (inputLine.hasOwnProperty(i)) {
                var keyValuePair = inputLine[i].split(/\=/);
                var key = $.trim(keyValuePair.shift());
                var value = $.trim(keyValuePair.join('='));
                json[key] = value;
            }
        }
        return json;
    }


    /**
     * Retrieves the bundle files from widgets
     */
    var loadWidgetBundles = exports.loadWidgetBundles = function(widgets, callback) {
        var widgetsToDo = 0;
        var widgetBundles = [];
        $.each(widgets, function(i, widget) {
            var widgetObj = {'id': widget.id, 'bundles': []};
            $.each(widget.i18n, function(i, bundle) {
                if (i === 'default') {
                    widgetObj.bundles.push(i);
                }
            });
            widgetBundles.push(widgetObj);
        });

        /**
         * Gets the bundles for a widget
         */
        var getBundles = function(widgetBundle) {
            var bundlesToDo = 0;

            /**
             * Gets the individual bundles in a widget
             */
            var getBundle = function() {
                $.ajax({
                    dataType: 'text',
                    url: '/node_modules/oae-core/' + widgetBundle.id + '/bundles/default.properties',
                    success: function(data) {
                        widgetBundles[widgetsToDo].i18n = widgetBundles[widgetsToDo].i18n || [];
                        widgetBundles[widgetsToDo].i18n['default'] = changeToJSON(data);
                        bundlesToDo++;
                        if (bundlesToDo === widgetBundle.bundles.length) {
                            widgetsToDo++;
                            if (widgetsToDo !== widgetBundles.length) {
                                getBundles(widgetBundles[widgetsToDo]);
                            } else {
                                $.ajax({
                                    dataType: 'text',
                                    url: '/ui/bundles/default.properties',
                                    success: function(data) {
                                        widgetBundles[widgetsToDo] = {};
                                        widgetBundles[widgetsToDo].i18n = {};
                                        widgetBundles[widgetsToDo].id = 'default bundle';
                                        widgetBundles[widgetsToDo].i18n['default'] = changeToJSON(data);
                                        callback(widgetBundles);
                                    }
                                });
                            }
                        } else {
                            getBundle();
                        }
                    }
                });
            };

            getBundle();
        };

        getBundles(widgetBundles[0]);
    };

    /**
     * Loads the widget manifests
     */
    var loadWidgets = exports.loadWidgets = function(callback) {
        $.ajax({
            url: '/api/ui/widgets',
            dataType: 'json',
            success: function(data) {
                callback(data);
            }
        });
    };

});
