define(['exports', 'jquery', 'underscore'], function(exports, $, _) {

    /**
     * Create a new meeting.
     */
    var createMeeting = exports.createMeeting = function (displayName, description, chat, contactList, visibility, managers, members, callback) {

        if (!displayName) {
            throw new Error('A valid document name should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'displayName': displayName,
            'description': description,
            'chat': chat,
            'contactList': contactList,
            'visibility': visibility,
            'managers': managers,
            'members': members
        };

        $.ajax({
            'url': '/api/meetingJitsi/create',
            'type': 'POST',
            'data': data,
            'success': function (data) {
                return callback(null, data);
            },
            'error': function (jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

    /**
     * Get a meeting data.
     */
    var getMeeting = exports.getMeeting = function (meetingId, callback) {

        if (!meetingId) throw new Error('A valid meeting id should be provided');

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting-jitsi/' + meetingId,
            'success': function (data) {
                return callback(null, data);
            },
            'error': function (jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

    /**
     * Get all the invitations for a meeting.
     */
    var getInvitations = exports.getInvitations = function (meetingId, callback) {

        if (!meetingId) throw new Error('A valid meeting id should be provided');

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};
        
        $.ajax({
            'url': '/api/meeting-jitsi/' + meetingId + '/invitations',
            'success': function (data) {
                return callback(null, data);
            },
            'error': function (jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

    /**
     * Update a meeting's metadata.
     */
    var updateMeeting = exports.updateMeeting = function (meetingId, params, callback) {

        if (!meetingId) 
            throw new Error('A valid meeting id should be provided');
        else if (!params || _.keys(params).length === 0)
            throw new Error('At least one update parameter should be updated');
        
        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        $.ajax({
            'url': '/api/meeting-jitsi/' + meetingId,
            'type': 'PUT',
            'data': params,
            'success': function (data) {
                return callback(null, data);
            },
            'error': function (jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });

    };

});