/**
 *
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 */


/**
 * @class Communication
 *
 * @description
 * Communication related convenience functions. This should only hold
 * functions which are used across multiple pages, and does not constitute
 * functionality related to a single area/pag
 *
 * @namespace
 * Communication related convenience functions
 */
define(["jquery", "sakai/sakai.api.user", "sakai/sakai.api.l10n", "sakai/sakai.api.i18n", "sakai/sakai.api.util", "/dev/configuration/config.js"], function($, sakai_user, sakai_l10n, sakai_i18n, sakai_util, sakai_conf) {
    var sakaiCommmunicationsAPI =  {
        /**
         * Sends a Sakai message to one or more users. If a group id is received, the
         * message is sent to users that are members of that group.
         *
         * @param {Array|String} to Array with the ids of the users or groups to post a
         *   message to or a String with one user or group id.
         * @param {String} meData Who the message is from - sakai.data.me (or equivolent profile)
         * @param {String} subject The subject for this message
         * @param {String} body The text that this message will contain
         * @param {String} [category="message"] The category for this message
         * @param {String} [reply] The id of the message you are replying on
         * @param {Function} [callback] A callback function which is executed at the end of the operation
         * @param {Boolean} [sendMail] True if a mail needs to be sent, False if no mail is needed. Unles specified false the default will be true and a mail will be sent
         * @param {Boolean|String} [context] String used in switch to set sakai:templatePath and sakai:templateParams
         *
         */
        sendMessage : function(to, meData, subject, body, category, reply, callback, sendMail, context) {

            var toUsers = "";              // aggregates all message recipients
            var sendDone = false;          // has the send been issued?

            ///////////////////////
            // UTILITY FUNCTIONS //
            ///////////////////////

            /**
             * Adds the given userids (String or Array) to the current list of recipients
             * @param {Array|String} userids Either a single userid (String) or a list
             * of userids (Array) to be added to the current list of recipients
             * @return None
             */
            var addRecipient = function(userids) {
                // append comma if the list already exists
                if(toUsers) {
                    toUsers += ",";
                }
                if(typeof(userids) === "string" && $.trim(userids) !== "") {
                    userids = $.trim(userids);
                    toUsers += "internal:" + userids;
                } else if(typeof(userids) === "object") {
                    toUsers += "internal:" + userids.join(",internal:");
                    toUsers = toUsers.replace(/internal\:\,/g, "");
                }
            };

            var buildEmailParams = function(){
                var toSend = {
                    "sakai:type": "smtp",
                    "sakai:sendstate": "pending",
                    "sakai:messagebox": "pending",
                    "sakai:to": toUsers,
                    "sakai:from": meData.user.userid,
                    "sakai:subject": subject,
                    "sakai:body": body,
                    "sakai:category": "message",
                    "_charset_": "utf-8"
                };

                switch(context){
                    case "new_message":
                        toSend["sakai:templatePath"] = "/var/templates/email/new_message";
                        toSend["sakai:templateParams"] = "sender=" + meData.profile.basic.elements.firstName.value + " " + meData.profile.basic.elements.lastName.value +
                        "|system=" + sakai_i18n.General.getValueForKey("SAKAI") + "|subject=" + subject + "|body=" + body + "|link=" + sakai_conf.SakaiDomain + sakai_conf.URL.INBOX_URL;
                        break;
                    case "join_request":
                        toSend["sakai:templatePath"] = "/var/templates/email/join_request";
                        toSend["sakai:templateParams"] = "sender=" + meData.profile.basic.elements.firstName.value + " " + meData.profile.basic.elements.lastName.value + 
                        "|system=Sakai|name=" + sakai_global.currentgroup.data.authprofile["sakai:group-title"] +
                        "|profilelink=" + sakai_conf.SakaiDomain + "/~" + meData.user.userid + 
                        "|acceptlink=" + sakai_conf.SakaiDomain + sakai_conf.URL.GROUP_EDIT_URL + "?id=" +  sakai_global.currentgroup.id;
                        break;
                    case "group_invitation":
                        toSend["sakai:templatePath"] = "/var/templates/email/group_invitation";
                        toSend["sakai:templateParams"] = "sender=" + meData.profile.basic.elements.firstName.value + " " + meData.profile.basic.elements.lastName.value + 
                        "|system=Sakai|name=" + sakai_global.currentgroup.data.authprofile["sakai:group-title"] +
                        "|body=" + body + 
                        "|link=" + sakai_conf.SakaiDomain + "/~" + sakai_global.currentgroup.id;
                        break;
                    case "shared_content":
                        toSend["sakai:templatePath"] = "/var/templates/email/shared_content";
                        toSend["sakai:templateParams"] = "sender=" + meData.profile.basic.elements.firstName.value + " " + meData.profile.basic.elements.lastName.value + 
                        "|system=Sakai|name=" + sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] +
                        "|description=" + (sakai_global.content_profile.content_data.data["sakai:description"] || "none")+
                        "|body=" + body + 
                        "|link=" + sakai_global.content_profile.content_data.url;
                        break;
                    case "contact_invitation":
                        toSend["sakai:templatePath"] = "/var/templates/email/contact_invitation";
                        toSend["sakai:templateParams"] = "sender=" + meData.profile.basic.elements.firstName.value + " " + meData.profile.basic.elements.lastName.value + 
                        "|system=Sakai|body=" + body +
                        "|link=" + sakai_conf.SakaiDomain + "/~" + meData.user.userid +"?accepttrue";
                        break;
                }
                return toSend;
            };

            var doSendMail = function(){
                // Basic message details
                var toSend = buildEmailParams();
                // Send message
                $.ajax({
                    url: "/~" + meData.user.userid + "/message.create.html",
                    type: "POST",
                    data: toSend,
                    success: function(data) {
                        if ($.isFunction(callback)) {
                            callback(true, data);
                        }
                    },
                    error: function(xhr, textStatus, thrownError) {
                        if ($.isFunction(callback)) {
                            callback(false, xhr);
                        }
                    }
                });
                sendDone = true;
            };

            var doSendMessage = function() {
                // Basic message details
                var toSend = {
                    "sakai:type": "internal",
                    "sakai:sendstate": "pending",
                    "sakai:messagebox": "outbox",
                    "sakai:to": toUsers,
                    "sakai:from": meData.user.userid,
                    "sakai:subject": subject,
                    "sakai:body":body,
                    "_charset_":"utf-8"
                };

                // Message category
                if (category) {
                    toSend["sakai:category"] = category;
                } else {
                    toSend["sakai:category"] = "message";
                }

                // See if this is a reply or not
                if (reply) {
                    toSend["sakai:previousmessage"] = reply;
                }
                // Send message
                $.ajax({
                    url: "/~" + meData.user.userid + "/message.create.html",
                    type: "POST",
                    data: toSend,
                    success: function(data){
                        if (sendMail) {
                            doSendMail();
                        }else if($.isFunction(callback)) {
                            callback(true, data);
                        }
                    },
                    error: function(xhr, textStatus, thrownError){
                        if ($.isFunction(callback)) {
                            callback(false, xhr);
                        }
                    }
                });
                // the send has been issued
                sendDone = true;
            };

            //////////////////
            // MAIN ROUTINE //
            //////////////////

            var reqs = [];
            if (typeof(to) === "string") {
                var id = to;
                to = [];
                to[0] = id;
            }

            if (typeof(to) === "object") {
                for (i = 0; i < to.length; i++) {
                    reqs[reqs.length] = {
                        "url": "/~" + to[i] + "/public/authprofile.json",
                        "method": "GET"
                    };
                }
            } else {
                // unrecognized type
                debug.warn("sakai.api.Communication.sendMessage(): invalid argument ('to' not an Array or String).");

                if ($.isFunction(callback)) {
                    callback(false, xhr);
                }
            }
            $.ajax({
                url: "/system/batch",
                method: "POST",
                data: {
                    "requests": $.toJSON(reqs)
                },
                success: function(data){
                    // array of recipients
                    addRecipient(to);
                    // send now if we have only a list of users ("thread" safe?)
                    if (!sendDone) {
                        doSendMessage();
                    }
                }
            });
        },

        deleteMessages : function(messagePaths, hardDelete, callback) {
            var requests = [],
                params = {};

            if (hardDelete) {
                params = {":operation": "delete"};
            } else {
                params = {"sakai:messagebox": "trash"};
            }
            if (typeof messagePaths === 'string'){
                messagePaths = [messagePaths];
            }
            $.each(messagePaths, function(i, val){
                var req = {
                    "url": val,
                    "method": "POST",
                    "parameters": params
                };
                requests.push(req);
            });

            $.ajax({
                url: sakai_conf.URL.BATCH,
                traditional: true,
                type: "POST",
                data: {
                    requests: $.toJSON(requests)
                },
                success: function(data) {
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    if ($.isFunction(callback)) {
                        callback(false, {});
                    }
                }
            });
        },

        markMessagesAsRead : function(messagePaths, callback) {
            var requests = [];

            if (typeof messagePaths === 'string'){
                messagePaths = [messagePaths];
            }

            $.each(messagePaths, function(i, message) {
               var req = {url: message + ".json", method: "POST", parameters: {"sakai:read": "true"}}; 
               requests.push(req);
            });

            $.ajax({
                url: sakai_conf.URL.BATCH,
                traditional: true,
                type: "POST",
                data: {
                    "requests": $.toJSON(requests)
                },
                success: function(data) {
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    if ($.isFunction(callback)) {
                        callback(false, {});
                    }
                }
            });
        },

        /**
         * Processes the messages from the server, stripping out everything we don't need
         */
        processMessages : function(data) {
            var messages = {},
                ret = $.extend(true, {}, data);
            $.each(ret, function(i, msg) {
                if (!$.isEmptyObject(msg)) {
                    var newMsg = {};
                    newMsg.replyAll = [];
                    var userFrom = _.first(msg.userFrom);
                    newMsg.from = {
                        name:  userFrom.userid ? sakai_user.getDisplayName(userFrom) : userFrom["sakai:group-title"],
                        picture: sakai_util.constructProfilePicture(userFrom),
                        userObj : {
                            uuid: userFrom.userid ? userFrom.userid : userFrom.groupid,
                            username: userFrom.userid ? sakai_user.getDisplayName(userFrom) : userFrom["sakai:group-title"],
                            type: userFrom.userid ? "user" : "group"
                        }
                    };
                    if (newMsg.from.userObj.uuid !== sakai_user.data.me.user.userid) {
                        newMsg.replyAll.push(newMsg.from.userObj);
                    }
                    newMsg.to = [];
                    newMsg.toList = [];
                    $.each(msg.userTo, function(i, user) {
                        var tmpUsr = {
                            name : user.userid ? sakai_user.getDisplayName(user) : user["sakai:group-title"],
                            picture : sakai_util.constructProfilePicture(user),
                            userObj : {
                                uuid: user.userid ? user.userid : user.groupid,
                                username: user.userid ? sakai_user.getDisplayName(user) : user["sakai:group-title"],
                                type: user.userid ? "user" : "group"
                            }
                        };
                        if (user.userid !== sakai_user.data.me.user.userid) {
                            newMsg.replyAll.push(tmpUsr.userObj);
                        }
                        newMsg.toList.push(tmpUsr.name);
                        newMsg.to.push(tmpUsr);
                    });
                    newMsg.body = sakai_util.Security.replaceURL($.trim(msg["sakai:body"].replace(/\n/gi, "<br />")));
                    newMsg.body_nolinebreaks = $.trim(msg["sakai:body"].replace(/\n/gi, " "));
                    newMsg.subject = msg["sakai:subject"];
                    newMsg.date = sakai_l10n.transformDateTimeShort(sakai_l10n.parseDateLong(msg["_created"], sakai_user.data.me));
                    newMsg.id = msg.id;
                    newMsg.read = msg["sakai:read"];
                    newMsg.path = msg["_path"];
                    if (msg.previousMessage) {
                        newMsg.previousMessage = sakaiCommmunicationsAPI.processMessages([msg.previousMessage]);
                        $.each(newMsg.previousMessage, function(i,val){
                            newMsg.previousMessage = val;
                        });
                    }
                    messages[newMsg.id] = newMsg;
                }
            });
            ret = messages;
            return ret;
        },

        /**
        * Gets all messages from a box
        * 
        * @param {String} box The name of the box to get messages from
        * @param {String} category The type of messages to get from the box
        * @param {Number} messagesPerPage The number of messages to fetch
        * @param {Number} currentPage The page offset to start from
        * @param {String} sortBy The name of the field to sort on
        * @param {String} sortOrder Sort messages asc or desc
        * @param {Function} callback The function that will be called on completion
        * @param {Boolean} doProcessing process the messages after they come back to make them easier to deal with
        *                               defaults to true
        * @param {Boolean} doFlip Flip the to and from
        */  
        getAllMessages : function(box, category, search, messagesPerPage, currentPage, sortBy, sortOrder, callback, doProcessing, doFlip) {
            var parameters = {
                "box": box,
                "items": messagesPerPage,
                "page": currentPage,
                "sortOn": sortBy,
                "sortOrder": sortOrder
            }

            // Set up optional, additional params
            if (search) {
                parameters.q = search;
            }
            if (category) {
                parameters.category = category;
            }

            // Set the base URL for the search
            if (search) {
                url = sakai_conf.URL.MESSAGE_BOXCATEGORY_SERVICE;
            } else if (category) {
                url = sakai_conf.URL.MESSAGE_BOXCATEGORY_ALL_SERVICE;
            } else {
                url = sakai_conf.URL.MESSAGE_BOX_SERVICE;
            }
            $.ajax({
                url: url,
                data: parameters,
                cache: true,
                success: function(data){
                    if (doProcessing !== false) {
                        data.results = sakaiCommmunicationsAPI.processMessages(data.results, doFlip);
                    }
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    if ($.isFunction(callback)) {
                        callback(false, {});
                    }
                }
            });
        },

        getMessage : function(id, callback){
            var url = "/~" + sakai_user.data.me.user.userid + "/message/inbox/" + id + ".json";
            $.ajax({
                url: url,
                cache: false,
                async: false,
                dataType: "json",
                success: function(data){
                    if ($.isFunction(callback)) {
                        sakai_user.getUser(data["sakai:from"], function(success,profiledata){
                            data.userFrom = [];
                            data.userFrom[0] = profiledata;
                            callback(data);
                        });
                    }
                },
                error: function(xhr, textStatus, thrownError){
                    if ($.isFunction(callback)) {
                        callback({});
                    }
                }
            });
        },

        /**
         * Gets a count of the unread messages for each box belonging to
         * the current user
         */
        getUnreadMessagesCountOverview : function(box, callback) {
            var url = "/~" + sakai_user.data.me.user.userid + "/message.count.json?filters=sakai:messagebox,sakai:read&values=" + box + ",false&groupedby=sakai:category";
            $.ajax({
                url: url,
                cache: false,
                success: function(data){
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    if ($.isFunction(callback)) {
                        callback(false,{});
                    }
                }
            });
        },

        /**
         * Gets a count of the unread messages in a box belonging 
         * to the current user
         */
        getUnreadMessageCount : function(box, callback, category) {
            var url = "/~" + sakai_user.data.me.user.userid + "/message.count.json?filters=sakai:messagebox,sakai:read&values=" + box + ",false&groupedby=sakai:category";
            $.ajax({
                url: url,
                cache: false,
                success: function(data){
                    var count = 0;
                    if (category){
                        // {"count":[{"group":"message","count":3},{"group":"invitation","count":2}]}
                        if (data.count && data.count.length){
                            for (var i = 0; i < data.count.length; i++){
                                if (data.count[i].group && data.count[i].group === category && data.count[i].count){
                                    count = data.count[i].count;
                                }
                            }
                        }
                    } else {
                        if (data.count && data.count[0] && data.count[0].count) {
                            count = data.count[0].count;
                        }
                    }
                    if ($.isFunction(callback)) {
                        callback(true, count);
                    }
                },
                error: function(xhr, textStatus, thrownError) {
                    if ($.isFunction(callback)) {
                        callback(false,{});
                    }
                }
            });
        },

        /**
         * Sends a message to all members of a group
         *
         * @param {String} groupID The user ID of the recipient
         * @param {String} message The text of the message
         * @return {Boolean} true or false depending on whether the sending was successful or not
         */
        sendMessageToGroup : function(groupID, message) {
            /**
             * SAKIII-599: Unable to currently send a message via:
             *  - /~userid/message.create.html or
             *  - /~groupid/message.create.html
             *
             * Until backend support is available, sakai.api.Communication.sendMessage
             * has been modified to support groupids. Any groupids included in the 'to'
             * list argument will be expanded and messages sent to those users.
             *
             * Once backend support to message a group directly is available, it will be
             * important to complete this function to support posting messages to group
             * pages directly and to track messages sent to groups as opposed to
             * individual users (i.e. Message sent to: "user1, user2, group5" instead of
             * Message sent to: "user1, user2, [list of users in group5]")
             */
        },

        /**
         * Invites a user to become a contact of the logged in user
         *
         * @param {String} groupID The user ID of the recipient
         * @param {String} message The text of the message
         * @return {Boolean} true or false depending on whether the sending was successful or not
         */
        inviteUser : function(userID) {

        }
    };
    return sakaiCommmunicationsAPI;
});
