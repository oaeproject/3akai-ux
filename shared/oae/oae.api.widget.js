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

define(['exports'], function(exports) {

    /**
     * Get a widget's config.json file.
     * 
     * @param  {String}     widgetName      The name of the widget we want to retrieve
     * @return {Object}                     JSON Object representing the widget's config file. This will be null if no widget can be found for the given widget id
     */
    var getWidgetConfig = exports.getWidgetConfig = function(widgetName) {};
    
    /**
     * Get a list of all of the available widgets that have a certain property in their config file and their actual config files.
     * 
     * @param  {String}     [property]      Property that should be set on the widget's config file before it will return in the final list, so only the widgets we need are returned. If this is not provided, all widgets will be returned.
     * @return {Object}                     JSON Object where the keys represent all of the available widgets and the values are the widget's config files.
     */
    var getWidgetConfigs = exports.getAllWidgetConfigs = function(property) {};
    
    /**
     * Find all of the widgets declared inside of the provided container, and load them into
     * the page.
     * 
     * Widgets are declared in the following way:
     * 
     * <div id='widgetId' data-widget='widgetName' />
     * 
     * @param  {Element|String}     container       HTML container in which we want to look for widgets and load them. This can either be a jQuery Element object or a jQuery selector string
     * @param  {Boolean}            showSettings    Whether or not to show the widget's settings view. If this is not set, the widget's view mode will be shown.
     * @param  {Function}           [callback]      Standard callback function executed when all widgets have finished loading and rendering
     * @param  {Object}             [callback.err]  Error containing the error code and message
     * 
     */
    var loadWidgets = exports.loadWidgets = function(container, showSettings, callback) {};
    
    /**
     * Insert a widget into a container into the provided viewmode.
     * 
     * @param  {String}             widgetName      The name of the widget we want to load into the provided container
     * @param  {String}             [widgetId]      The widget's unique id. If this is not provided, a random id wil be generated
     * @param  {Element|String}     container       HTML container in which we want to insert the widget. This can either be a jQuery Element object or a jQuery selector string.
     * @param  {Boolean}            showSettings    Whether or not to show the widget's settings view. If this is not set, the widget's view mode will be shown.
     * @param  {Function}           [callback]      Standard callback function executed when the widgets has finished loading and rendering
     * @param  {Object}             [callback.err]  Error containing the error code and message
     */
    var insertWidget = exports.insertWidget = function(widgetName, widgetId, container, showSettings, callback) {};

});