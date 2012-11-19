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

/**
 * Creates a new user with an internal login strategy.
 *
 * @param  {String}         username                        The username this user can login with.
 * @param  {String}         password                        The password for this user.
 * @param  {String}         displayName                     The display name for the user
 * @param  {Object}         [additionalOptions]             Additional optional parameters that need to be passed.
 * @param  {String}         [additionalOptions.visibility]  The user's visibility setting. This can be public, loggedin or private.
 * @param  {String}         [additionalOptions.locale]      The user's locale
 * @param  {String}         [additionalOptions.timezone]    The user's timezone
 * @param  {String}         [additionalOptions.publicAlias] The publically-available alias for users to see when the user's display name is protected
 * @param  {Function}       [callback]                      Standard callback method
 * @param  {Object}         [callback.err]                  Error object containing error code and error message
 * @param  {User}           [callback.response]             A User object representing the created user
 */
var createUser = module.exports.createUser = function(username, password, displayName, additionalOptions, callback) {};

/**
 * Gets the currently logged in user
 * 
 * @param  {Function}       callback            Standard callback method takes arguments `err` and `resp`
 * @param  {Object}         callback.err        Error object containing error code and error message
 * @param  {Object}         callback.response   The user's me feed
 */
var getMe = module.exports.getMe = function(callback) {};

/**
 * Get a user's basic profile
 * 
 * @param  {String}         userId              User id of the profile you wish to retrieve
 * @param  {Function}       callback            Standard callback method
 * @param  {Object}         callback.err        Error object containing error code and error message
 * @param  {User}           callback.response   The user's basic profile
 */
var getUser = module.exports.getUser = function(restCtx, userId, callback) {};

/**
 * Update the current user's basic profile
 * 
 * @param  {Object}         params              Object representing the profile fields that need to be updated. The keys are the profile fields, the values are the profile field values
 * @param  {Function}       [callback]          Standard callback method
 * @param  {Object}         [callback.err]      Error object containing error code and error message
 */
var updateUser = module.exports.updateUser = function(restCtx, userId, params, callback) {};

