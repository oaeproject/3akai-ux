/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
/*
 * Dependencies
 *
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */

/*global $, Config, addBinding */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.googlemaps
     *
     * @class googlemaps
     *
     * @description
     * Initialize the googlemaps widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.googlemaps = function(tuid, showSettings, widgetData) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var rootel = $('#' + tuid);
        var iframeContentWindow = {};
        var json = false;

        /**
         * To finish the widget
         */
        var finish = function() {
            sakai.api.Widgets.Container.informFinish(tuid, 'googlemaps');
        };

        /**
         * This will saved the map data to backend server
         */
        var saveToJCR = function() {
            json = $('#googlemaps_iframe_map', rootel)[0].contentWindow.getJSON();
            // Store the corresponded map data into backend server
            sakai.api.Widgets.saveWidgetData(tuid, json, finish);
        };

        /**
         * To set the map's center, zoom, info window content properties
         */
        var setMap = function() {
            if (json) {
                iframeContentWindow.setMap(json);
            }
        };

        /**
         * This is to get map zoom and center properties from backend server
         */
        var getFromJCR = function() {
            if (widgetData && widgetData.googlemaps) {
                renderMap(true, widgetData.googlemaps);
            } else {
                sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                    renderMap(success, data);
                });
            }
        };

        var renderMap = function(success, data) {
            if (success) {
                // Get data from the backend server
                json = data;
                setMap();
                // Set the initial value of search keyword input textbox
                $('#googlemaps_input_text_location', rootel).val(json.mapinput);
            } else {
                var tempJson = {
                    'lat': sakai.widgets.googlemaps.defaultLat,
                    'lng': sakai.widgets.googlemaps.defaultLng,
                    'mapzoom': sakai.widgets.googlemaps.defaultZoom
                };
                iframeContentWindow.setMap(tempJson);
            }

            // Set focus in location text box
            $('#googlemaps_input_text_location', rootel).focus();

        };

        /**
         * This is to init the google map and other controls
         */
        var init = function() {
            if (showSettings) {
                // Show the search input textfield and save, search, cancel buttons
                $('#googlemaps_form_search', rootel).show();
                $('#googlemaps_save_cancel_container', rootel).show();

                // Add a submit listener so that the search function can be executed
                $('#googlemaps_form_search', rootel).submit(function() {
                    var input = $('#googlemaps_input_text_location', rootel).val();
                    if (input) {
                        iframeContentWindow.search(input, '', sakai, $);
                    }
                    return false;
                });

                // Add listener to save button
                $('#googlemaps_save', rootel).on('click', function(e, ui) {
                    saveToJCR();
                });

                // Add listerner to cancel button
                $('#googlemaps_cancel', rootel).on('click', function(e, ui) {
                    sakai.api.Widgets.Container.informCancel(tuid, 'googlemaps');
                });
            }

            // hide main div to prevent showing default cambridge location while loading
            $('#googlemaps_iframe_map', rootel).load(function() {

                // To set the map iframe's content as the iframeContentWindow (var)
                iframeContentWindow = $('#googlemaps_iframe_map', rootel)[0].contentWindow;

                // Get the map zoom and center property data from backend server
                getFromJCR();
            });

        };

        init();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad('googlemaps');
});
