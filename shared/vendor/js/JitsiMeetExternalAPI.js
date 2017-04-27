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

/*!
 * This is an adaptation of the file jitsi-meet project external API available on https://github.com/jitsi/jitsi-meet/blob/master/modules/API/external/external_api.js the differences being:
 * Using requireJS
 * Removed the original logger
 * Changed the url of the frame regardless of HTTP / HTTPS
 * Some linting
 * Removed the spread operator from argumentsList in executeCommand
 */

define(['postis'],
    function(postisInit) {

        /**
         * Implements API class that embeds Jitsi Meet in external applications.
         */

        /**
         * The minimum width for the Jitsi Meet frame
         * @type {number}
         */
        var MIN_WIDTH = 790;

        /**
         * The minimum height for the Jitsi Meet frame
         * @type {number}
         */
        var MIN_HEIGHT = 300;

        /**
         * Last id of api object
         * @type {number}
         */
        var id = 0;

        /**
         * Maps the names of the commands expected by the API with the name of the
         * commands expected by jitsi-meet
         */
        var commands = {
            "displayName": "display-name",
            "toggleAudio": "toggle-audio",
            "toggleVideo": "toggle-video",
            "toggleFilmStrip": "toggle-film-strip",
            "toggleChat": "toggle-chat",
            "toggleContactList": "toggle-contact-list",
            "toggleShareScreen": "toggle-share-screen",
            "hangup": "video-hangup",
            "email": "email",
            "avatarUrl": "avatar-url"
        };

        /**
         * Maps the names of the events expected by the API with the name of the
         * events expected by jitsi-meet
         */
        var events = {
            "incomingMessage": "incoming-message",
            "outgoingMessage": "outgoing-message",
            "displayNameChange": "display-name-change",
            "participantJoined": "participant-joined",
            "participantLeft": "participant-left",
            "videoConferenceJoined": "video-conference-joined",
            "videoConferenceLeft": "video-conference-left",
            "readyToClose": "video-ready-to-close"
        };

        /**
         * Sends the passed object to Jitsi Meet
         * @param postis {Postis object} the postis instance that is going to be used
         * to send the message
         * @param object the object to be sent
         * - method {sting}
         * - params {object}
         */
        function sendMessage(postis, object) {
            postis.send(object);
        }

        /**
         * Adds given number to the numberOfParticipants property of given APIInstance.
         * @param {JitsiMeetExternalAPI} APIInstance the instance of the
         * JitsiMeetExternalAPI
         * @param {int} number - the number of participants to be added to
         * numberOfParticipants property (this parameter can be negative number if the
         * numberOfParticipants should be decreased).
         */
        function changeParticipantNumber(APIInstance, number) {
            APIInstance.numberOfParticipants += number;
        }

        /**
         * Constructs new API instance. Creates iframe element that loads
         * Jitsi Meet.
         * @param domain the domain name of the server that hosts the conference
         * @param room_name the name of the room to join
         * @param width width of the iframe
         * @param height height of the iframe
         * @param parent_node the node that will contain the iframe
         * @param configOverwrite object containing configuration options defined in
         * config.js to be overridden.
         * @param interfaceConfigOverwrite object containing configuration options
         * defined in interface_config.js to be overridden.
         * @param noSsl if the value is true https won't be used
         * @constructor
         */
        function JitsiMeetExternalAPI(domain, room_name, width, height, parentNode,
            configOverwrite, interfaceConfigOverwrite, noSsl) {
            if (!width || width < MIN_WIDTH)
                width = MIN_WIDTH;
            if (!height || height < MIN_HEIGHT)
                height = MIN_HEIGHT;

            this.parentNode = null;
            if (parentNode) {
                this.parentNode = parentNode;
            } else {
                var scriptTag = document.scripts[document.scripts.length - 1];
                this.parentNode = scriptTag.parentNode;
            }

            this.iframeHolder =
                this.parentNode.appendChild(document.createElement("div"));
            this.iframeHolder.id = "jitsiConference" + id;
            if(width)
                this.iframeHolder.style.width = width + "px";
            if(height)
                this.iframeHolder.style.height = height + "px";
            this.frameName = "jitsiConferenceFrame" + id;
            // this.url = (noSsl) ? "http" : "https" +"://" + domain + "/";
            this.url = domain;

            if(room_name)
                this.url += room_name;
            this.url += "#jitsi_meet_external_api_id=" + id;

            var key;
            if (configOverwrite) {
                for (key in configOverwrite) {
                    if (!configOverwrite.hasOwnProperty(key) ||
                        typeof key !== 'string')
                        continue;
                    this.url += "&config." + key + "=" + configOverwrite[key];
                }
            }

            if (interfaceConfigOverwrite) {
                for (key in interfaceConfigOverwrite) {
                    if (!interfaceConfigOverwrite.hasOwnProperty(key) ||
                        typeof key !== 'string')
                        continue;
                    this.url += "&interfaceConfig." + key + "=" +
                        interfaceConfigOverwrite[key];
                }
            }

            this.frame = document.createElement("iframe");
            this.frame.src = this.url;
            this.frame.name = this.frameName;
            this.frame.id = this.frameName;
            this.frame.width = "100%";
            this.frame.height = "100%";
            this.frame.setAttribute("allowFullScreen","true");
            this.frame = this.iframeHolder.appendChild(this.frame);

            this.postis = postisInit({
                window: this.frame.contentWindow,
                scope: "jitsi_meet_external_api_" + id
            });

            this.eventHandlers = {};

            // Map<{string} event_name, {boolean} postis_listener_added>
            this.postisListeners = {};

            this.numberOfParticipants = 1;
            this._setupListeners();

            id++;
        }

        /**
         * Executes command. The available commands are:
         * displayName - sets the display name of the local participant to the value
         * passed in the arguments array.
         * toggleAudio - mutes / unmutes audio with no arguments
         * toggleVideo - mutes / unmutes video with no arguments
         * filmStrip - hides / shows the film strip with no arguments
         * If the command doesn't require any arguments the parameter should be set
         * to empty array or it may be omitted.
         * @param name the name of the command
         * @param arguments array of arguments
         */
        JitsiMeetExternalAPI.prototype.executeCommand = function(name, argumentsList) {
            if(!(name in commands)) {
                return;
            }
            sendMessage(this.postis, {method: commands[name], params: argumentsList});
        };

        /**
         * Executes commands. The available commands are:
         * displayName - sets the display name of the local participant to the value
         * passed in the arguments array.
         * toggleAudio - mutes / unmutes audio. no arguments
         * toggleVideo - mutes / unmutes video. no arguments
         * filmStrip - hides / shows the film strip. no arguments
         * toggleChat - hides / shows chat. no arguments.
         * toggleContactList - hides / shows contact list. no arguments.
         * toggleShareScreen - starts / stops screen sharing. no arguments.
         * @param object the object with commands to be executed. The keys of the
         * object are the commands that will be executed and the values are the
         * arguments for the command.
         */
        JitsiMeetExternalAPI.prototype.executeCommands = function(object) {
            for(var key in object)
                this.executeCommand(key, object[key]);
        };

        /**
         * Adds event listeners to Meet Jitsi. The object key should be the name of
         * the event and value - the listener.
         * Currently we support the following
         * events:
         * incomingMessage - receives event notifications about incoming
         * messages. The listener will receive object with the following structure:
         * {{
         *  "from": from,//JID of the user that sent the message
         *  "nick": nick,//the nickname of the user that sent the message
         *  "message": txt//the text of the message
         * }}
         * outgoingMessage - receives event notifications about outgoing
         * messages. The listener will receive object with the following structure:
         * {{
         *  "message": txt//the text of the message
         * }}
         * displayNameChanged - receives event notifications about display name
         * change. The listener will receive object with the following structure:
         * {{
         * jid: jid,//the JID of the participant that changed his display name
         * displayname: displayName //the new display name
         * }}
         * participantJoined - receives event notifications about new participant.
         * The listener will receive object with the following structure:
         * {{
         * jid: jid //the jid of the participant
         * }}
         * participantLeft - receives event notifications about the participant that
         * left the room.
         * The listener will receive object with the following structure:
         * {{
         * jid: jid //the jid of the participant
         * }}
         * video-conference-joined - receives event notifications about the local user
         * has successfully joined the video conference.
         * The listener will receive object with the following structure:
         * {{
         * roomName: room //the room name of the conference
         * }}
         * video-conference-left - receives event notifications about the local user
         * has left the video conference.
         * The listener will receive object with the following structure:
         * {{
         * roomName: room //the room name of the conference
         * }}
         * readyToClose - all hangup operations are completed and Jitsi Meet is ready
         * to be disposed.
         * @param object
         */
        JitsiMeetExternalAPI.prototype.addEventListeners = function(object) {
            for(var i in object)
                this.addEventListener(i, object[i]);
        };

        /**
         * Adds event listeners to Meet Jitsi. Currently we support the following
         * events:
         * incomingMessage - receives event notifications about incoming
         * messages. The listener will receive object with the following structure:
         * {{
         *  "from": from,//JID of the user that sent the message
         *  "nick": nick,//the nickname of the user that sent the message
         *  "message": txt//the text of the message
         * }}
         * outgoingMessage - receives event notifications about outgoing
         * messages. The listener will receive object with the following structure:
         * {{
         *  "message": txt//the text of the message
         * }}
         * displayNameChanged - receives event notifications about display name
         * change. The listener will receive object with the following structure:
         * {{
         * jid: jid,//the JID of the participant that changed his display name
         * displayname: displayName //the new display name
         * }}
         * participantJoined - receives event notifications about new participant.
         * The listener will receive object with the following structure:
         * {{
         * jid: jid //the jid of the participant
         * }}
         * participantLeft - receives event notifications about participant the that
         * left the room.
         * The listener will receive object with the following structure:
         * {{
         * jid: jid //the jid of the participant
         * }}
         * video-conference-joined - receives event notifications fired when the local
         * user has joined the video conference.
         * The listener will receive object with the following structure:
         * {{
         * roomName: room //the room name of the conference
         * }}
         * video-conference-left - receives event notifications fired when the local
         * user has joined the video conference.
         * The listener will receive object with the following structure:
         * {{
         * roomName: room //the room name of the conference
         * }}
         * @param event the name of the event
         * @param listener the listener
         */
        JitsiMeetExternalAPI.prototype.addEventListener = function(event, listener) {
            if(!(event in events)) {
                return;
            }
            // We cannot remove listeners from postis that's why we are handling the
            // callback that way.
            if(!this.postisListeners[event]) {
                this.postis.listen(events[event], function(data) {
                    if((event in this.eventHandlers) &&
                        typeof this.eventHandlers[event] === "function")
                        this.eventHandlers[event].call(null, data);
                }.bind(this));
                this.postisListeners[event] = true;
            }
            this.eventHandlers[event] = listener;
        };

        /**
         * Removes event listener.
         * @param event the name of the event.
         */
        JitsiMeetExternalAPI.prototype.removeEventListener = function(event) {
            if(!(event in this.eventHandlers)){
                return;
            }
            delete this.eventHandlers[event];
        };

        /**
         * Removes event listeners.
         * @param events array with the names of the events.
         */
        JitsiMeetExternalAPI.prototype.removeEventListeners = function(events) {
            for(var i = 0; i < events.length; i++)
                this.removeEventListener(events[i]);
        };

        /**
         * Returns the number of participants in the conference.
         * NOTE: the local participant is included.
         * @returns {int} the number of participants in the conference.
         */
        JitsiMeetExternalAPI.prototype.getNumberOfParticipants = function() {
            return this.numberOfParticipants;
        };

        /**
         * Setups listeners that are used internally for JitsiMeetExternalAPI.
         */
        JitsiMeetExternalAPI.prototype._setupListeners = function() {
            this.postis.listen("participant-joined",
                changeParticipantNumber.bind(null, this, 1));
            this.postis.listen("participant-left",
                changeParticipantNumber.bind(null, this, -1));
        };

        /**
         * Removes the listeners and removes the Jitsi Meet frame.
         */
        JitsiMeetExternalAPI.prototype.dispose = function() {
            this.postis.destroy();
            var frame = document.getElementById(this.frameName);
            if(frame)
                frame.src = 'about:blank';
            var self = this;
            window.setTimeout(function () {
                self.iframeHolder.removeChild(self.frame);
                self.iframeHolder.parentNode.removeChild(self.iframeHolder);
            }, 10);
        };

        // module.exports = JitsiMeetExternalAPI;

        return JitsiMeetExternalAPI;
    }
);