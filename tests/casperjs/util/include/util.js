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

/**
 * General utility functions
 *
 * @return  {Object}    Returns an object with referenced utility functions
 */
var mainUtil = function() {

    /**
     * Utility function that calls an internal OAE UI API function
     *
     * @param  {String}     api                 Name of the API to which the function that needs to be called belongs
     * @param  {String}     apiFunction         The name of the API function that needs to be called
     * @param  {Object[]}   [params]            The parameters that need to be passed into the API function
     * @param  {Function}   callback            Standard callback function
     * @param  {Object}     callback.err        Error object containing error code and error message as returned by the OAE UI API function
     * @param  {Object}     callback.data       The response data as returned by the OAE UI API function
     * @api private
     */
    var callInternalAPI = function(api, apiFunction, params, callback) {
        // Before continuing we need to make sure that the internal API has loaded.
        casper.waitForSelector('html[lang]', function() {
            var rndString = mainUtil().generateRandomString();

            // Bind the event called when the API call finishes
            casper.on(rndString + '.finished', function(data) {
                return callback(data.err, data.data);
            });

            // Execute the internal API call
            casper.evaluate(function(rndString, api, apiFunction, params) {
                // Add the internal callback function
                params = params || [];
                params.push(function(err, data) {
                    window.callPhantom({
                        'cbId': rndString,
                        'err': err,
                        'data': data
                    });
                });
                require('oae.api.' + api)[apiFunction].apply(this, params);
            }, rndString, api, apiFunction, params);
        });

    };

    /**
     * Generates a random 10 character sequence of upper and lowercase letters.
     *
     * @return {String}   Random 10 character sequence of upper and lowercase letters
     */
    var generateRandomString = function() {
        var rndString = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        for (var i = 0; i < 10; i++) {
            rndString += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return rndString;
    };

    return {
        'callInternalAPI': callInternalAPI,
        'generateRandomString': generateRandomString
    };
};
