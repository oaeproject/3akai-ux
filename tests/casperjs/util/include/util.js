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
        'generateRandomString': generateRandomString
    };
};
