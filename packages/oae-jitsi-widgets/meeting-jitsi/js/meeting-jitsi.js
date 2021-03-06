/*!
 * Copyright 2017 Apereo Foundation (AF) Licensed under the
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

define(['jquery', 'oae.core', 'postis', 'JitsiMeetExternalAPI'], function ($, oae, postis, JitsiMeetExternalAPI) {

    return function (uid, showSettings, widgetData) {

        // getting meetingId to use as room id
        var meetingId = widgetData.id.replace(/\:/g, '-');

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
                if (err) {
                    throw new Error(err.code, err.msg);
                }

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

            if (widgetData.chat === true) {
                toggleChat();
            }
            if (widgetData.contactList === true) {
                toggleContactList();
            }
        };

        /**
         * Render the meeting room.
         */
        var renderMeeting = function () {

            var domain = oae.api.config.getValue('oae-jitsi', 'server', 'host');
            var room = meetingId;
            var width = 700;
            var height = 700;
            var container = document.querySelector('#meeting-jitsi-room');

            // we're not allowing HTTP
            api = new JitsiMeetExternalAPI(domain, room, width, height, container, null, null, false);

            setUpRoomOptions();

        };

        /**
         * Change css to make the videoConference responsive
         */
        var changeCSS = function(){
            // Height
            // On page loading
            changeHeight();

            // On resizing
            $(window).resize(function() {
                changeHeight();
            });

            // Width
            $('#jitsiConference0').css('width', '100%');
        };

        /**
         * Change height jitsi frame
         */
        var changeHeight = function(){

            if ($(window).height() < 700 && $(window).height() > 500) {
                $('#jitsiConference0').css('height', $(window).height() - 40 + 'px');
            } else if ($(window).height() <= 500) {
                $('#jitsiConference0').css('height', '460px');
            } else {
                $('#jitsiConference0').css('height', '700px');
            }

        };

        renderMeeting();
        changeCSS();
    };
});
