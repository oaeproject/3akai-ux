/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['exports', 'jquery'], function(exports, $) {

    // Variable that will be used to cache the config values set for the current tenant
    var config = null;

    /**
     * Initialize all config functionality by loading the configuration settings for the current tenant
     *
     * @param  {Function}   callback      Standard callback function
     * @param  {Object}     callback.err  Error object containing error code and message
     * @api private
     */
    var init = exports.init = function(callback) {
        $.ajax({
            'url': '/api/config',
            'success': function(data) {
                config = data;
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get a configuration value from the cached config values.
     *
     * @param  {String}                          module                The module to get the config value for. e.g. `oae-authentication`
     * @param  {String}                          feature               The feature to get the config value for. e.g. `twitter`
     * @param  {String}                          element               The element to get the config value for. e.g. `enabled`
     * @return {Boolean|String|Number|Object}                          The requested config value e.g. `true`. This will be null if the config element cannot be found.
     * @throws {Error}                                                 Error thrown when no module, feature or element has been provided
     */
    var getValue = exports.getValue = function(module, feature, element) {
        if (!module || !config[module]) {
            throw new Error('A valid module id should be provided when getting a config value');
        } else if (!feature || !config[module][feature]) {
            throw new Error('A valid feature should be provided when getting a config value');
        } else if (!element || config[module][feature][element] === undefined) {
            throw new Error('A valid element should be provided when getting a config value');
        }

        return config[module][feature][element];
    };

});
