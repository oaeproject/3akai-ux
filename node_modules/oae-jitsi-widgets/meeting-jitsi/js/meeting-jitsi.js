define(['jquery', 'oae.core', 'JitsiMeetExternalAPI'], function ($, oae, JitsiMeetExternalAPI) {

    return function (uid, showSettings, widgetData) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable used to cache the jitsi api
        var api = null;

        // Variable user to cache the current user
        var user = null;

        /**
         * Set up the user name instead of the default "me" 
         */
        var setUpUserName = function () {

            oae.api.user.getMe(function (err, me) {
                if (err) throw new Error(err.code, err.msg);

                user = me;
                api.executeCommand('displayName', [user.displayName]);
            });

        };

        /**
         * Toggle the video chat
         */
        var toggleChat = function () {
            api.executeCommand('toggleChat', []);
        };

        /**
         * Toggle the video contact list
         */
        var toggleContactList = function () {
            api.executeCommand('toggleContactList', []);
        };

        /**
         * Set up the room options
         */
        var setUpRoomOptions = function () {
            setUpUserName();

            if (widgetData.chat === true) toggleChat();
            if (widgetData.contactList === true) toggleContactList();
        };

        /**
         * Render the meeting room.
         */
        var renderMeeting = function () {

            var domain = oae.api.config.getValue('oae-jitsi', 'server', 'host');
            var room = "JitsiMeetAPIExample";
            var width = 700;
            var height = 700;
            var container = document.querySelector('#meeting-jitsi-room');
            api = new JitsiMeetExternalAPI(domain, room, width, height, container);

            setUpRoomOptions();

        };
        
        renderMeeting();
    
    }

});