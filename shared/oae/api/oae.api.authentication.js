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

define(['exports', 'jquery'], function(exports, $) {

    /**
     * Log in as an internal user
     * 
     * @param  {String}                 username            Username for the user logging in.
     * @param  {String}                 password            The user's password
     * @param  {Function}               callback            Standard callback method
     * @param  {Object}                 callback.err        Error object containing error code and error message       
     * @throws {Error}                                      Error thrown when not all of the required parameters have been provided                 
     */
    var login = exports.login = function(username, password, callback) {
        if (!username) {
            throw new Error('A valid username should be provided');
        }
        if (!password) {
            throw new Error('A valid password should be provided');
        }

        $.ajax({
            'url': '/api/auth/login',
            'type': 'POST',
            'data': {
                'username': username,
                'password': password
            },
            'success': function() {
                callback(null);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };
    
    /**
     * Log out the currently signed in user
     * 
     * @param  {Function}               [callback]          Standard callback method
     * @param  {Object}                 [callback.err]      Error object containing error code and error message   
     */
    var logout = exports.logout = function(callback) {};
    
    /**
     * Change the password of the currently logged in user
     * 
     * @param  {String}                 oldPassword         The user's current password
     * @param  {String}                 newPassword         The user's new password
     * @param  {Function}               [callback]          Standard callback method
     * @param  {Object}                 [callback.err]      Error object containing error code and error message
     */
    var changePassword = exports.changePassword = function(oldPassword, newPassword, callback) {};

});
