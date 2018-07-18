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
 * permissions and limitations under the License.  getTransferByEmail
 */

define(['exports', 'jquery'], function(exports, $) {

    /**
     * Create a transfer
     *
     * @param  {String}            originalEmail              The email origine
     * @param  {String}            targetEmail              The email target
     * @param  {String}            originalUserId             The id of the user who want to creates a transfer in his account
     * @param  {Function}          [callback]               Standard callback function
     * @param  {Object}            [callback.err]           Error object containing error code and error message
     * @param  {Transfer}          [callback.transfer]      A transfer object representing the created transfer
     * @throws {Error}                                      Error thrown when not all of the required parameters have been provided
     */
	var initiateTransfer = exports.initiateTransfer = function(originalEmail, targetEmail, originalUserId, callback) {
        if (!originalEmail) {
            throw new Error('A valid originalEmail should be provided');
        }
        if (!targetEmail) {
            throw new Error('A valid targetEmail should be provided');
        }
        if (!originalUserId) {
            throw new Error('A valid user id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'originalEmail': originalEmail,
            'targetEmail': targetEmail,
            'originalUserId': originalUserId
        };

        $.ajax({
            'url': '/api/transfer',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
        return false;
    };

    /**
     * Get a transfer
     *
     * @param  {String}       originalUserId        The id of the user who created to transfer 
     * @param  {Function}     callback            Standard callback function
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Transfer}     callback.transfer   The transfer object representing the requested transfer
     * @throws {Error}                            Error thrown when no transfer has been provided
     */
    var getTransferById = exports.getTransferById = function(originalUserId, callback) {
        if (!originalUserId) {
            throw new Error('A valid email should be provided');
        }

        $.ajax({
            'url': '/api/transfer/' + originalUserId,
            'type': 'GET',
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
        return false;
    };

    /**
     * Complete a transfer
     *
     * @param  {String}       originalEmail       The email origin
     * @param  {String}       code                The secured code
     * @param  {String}       targetEmail         The email target
     * @param  {String}       targetUserId        The id of the target user
     * @param  {Function}     callback            Standard callback function
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Transfer}     callback.transfer   The transfer object representing the requested transfer
     * @throws {Error}                            Error thrown when no transfer has been provided or when the code is wrong
     */
    var completeTransfer = exports.completeTransfer = function(originalEmail, code, targetEmail, targetUserId, callback) {
		if (!originalEmail) {
            throw new Error('A valid originalEmail should be provided');
        }
        if (!targetEmail) {
            throw new Error('A valid targetEmail should be provided');
        }
        if (!code) {
            throw new Error('A valid code should be provided');
        }
        if (!targetUserId) {
            throw new Error('A valid user id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'originalEmail': originalEmail, 
            'code': code, 
            'targetEmail': targetEmail,
            'status': 'completed'
        };

        $.ajax({
            'url': '/api/transfer/' + targetUserId,
            'type': 'PUT',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
        return false;
    };

    /**
     * Cancel a transfer
     *
     * @param  {String}       originalEmail       The email origine
     * @param  {Function}     callback            Standard callback function
     * @param  {Object}       callback.err        Error object containing error code and error message
     * @param  {Transfer}     callback.transfer   The transfer object representing the requested transfer
     * @throws {Error}                            Error thrown when no transfer has been provided or when the code is wrong
     */
    var cancelTransfer = exports.cancelTransfer = function(originalEmail, code, originalUserId, callback) {
        if (!originalEmail) {
            throw new Error('A valid email should be provided');
        }
        if (!code) {
            throw new Error('A valid code should be provided');
        }
        if (!originalUserId) {
            throw new Error('A valid user id should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'originalEmail': originalEmail,
            'code': code,
            'status': 'canceled'
        };

        $.ajax({
            'url': '/api/transfer/' + originalUserId,
            'type': 'PUT',
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
        return false;
    };
});
