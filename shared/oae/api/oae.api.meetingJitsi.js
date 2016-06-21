define(['exports', 'jquery'], function(exports, $) {

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

});