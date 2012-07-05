/*
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
 */

/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.personinfo
     *
     * @class personinfo
     *
     * @description
     * Personinfo dialog box
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.personinfo = function(tuid, showSettings) {

        var $rootel = $("#" + tuid);
        var $personinfo_widget = $("#personinfo_widget", $rootel);
        var $personinfo_container = $("#personinfo_container", $rootel);
        var $personinfo_template = $("#personinfo_template", $rootel);
        var $personinfo_close = $(".personinfo_close", $rootel);
        var $personinfo_message = $("#personinfo_message", $rootel);
        var $personinfo_invite = $("#personinfo_invite", $rootel);
        var $personinfo_invited = $("#personinfo_invited", $rootel);
        var $personinfo_pending = $("#personinfo_pending", $rootel);
        var dataCache = {};
        var open = false;
        var userId;

        $personinfo_widget.jqm({
            modal: false,
            overlay: 0,
            zIndex: 900,
            toTop: true
        });

        /**
         * hidePersonInfo
         * Hides the widget
         */
        var hidePersonInfo = function() {
            open = false;
            $personinfo_widget.jqmHide();

            // unbind the close event
            $(document).unbind("click.personinfo_close");
        };

        /**
         * showPersonInfo
         * Shows the widget
         */
        var showPersonInfo = function($clickedEl) {
            var personinfoTop = $clickedEl.offset().top + $clickedEl.height();
            var personinfoLeft = $clickedEl.offset().left + $clickedEl.width() / 2 - 125;

            $personinfo_widget.css({
                top: personinfoTop,
                left: personinfoLeft
            });

            $personinfo_widget.jqmShow();
        };

        /**
         * showConnectionButton
         * Display appropriate connection button according to users connection state
         */
        var showConnectionButton = function() {
            $personinfo_message.hide();
            $personinfo_invite.hide();
            $personinfo_invited.hide();
            $personinfo_pending.hide();
            if (userId !== sakai.data.me.user.userid && !sakai.data.me.user.anon) {
                $personinfo_message.show();
                if (!dataCache[userId].connectionState || dataCache[userId].connectionState === "NONE") {
                    $personinfo_invite.show();
                } else if (dataCache[userId].connectionState === "PENDING") {
                    $personinfo_pending.show();
                } else if (dataCache[userId].connectionState === "INVITED") {
                    $personinfo_invited.show();
                }
            }
        };

        /**
         * togglePersonInfo
         * Displays the widget
         */
        var togglePersonInfo = function($clickedEl) {
            showConnectionButton();

            var json = {
                "user": dataCache[userId],
                "me": sakai.data.me,
                "sakai": sakai
            };

            $($personinfo_container).html(sakai.api.Util.TemplateRenderer("#personinfo_template", json));
            showPersonInfo($clickedEl);
        };

        /**
         * fetchPersonInfo
         * Fetches data about the user
         */
        var fetchPersonInfo = function($clickedEl) {
            if (dataCache[userId]) {
                togglePersonInfo($clickedEl);
            } else {
                // display loading message
                $($personinfo_container).html(sakai.api.Util.TemplateRenderer("#personinfo_loading_template", {"me": sakai.data.me}));
                showPersonInfo($clickedEl);
                sakai.api.User.getUser(userId, function(success, data) {
                    if (success) {
                        dataCache[userId] = data;

                        // check if user is a contact and their connection state
                        sakai.api.User.getConnectionState(userId, function(state) {
                            dataCache[userId].connectionState = state;
                        });

                        // get display pic
                        var displayPicture = sakai.api.Util.constructProfilePicture(dataCache[userId]);
                        if (!displayPicture) {
                            displayPicture = sakai.config.URL.USER_DEFAULT_ICON_URL;
                        }
                        dataCache[userId].displayPicture = displayPicture;
                        dataCache[userId].displayName = sakai.api.User.getDisplayName(dataCache[userId]);

                        // get content items for the user
                        $.ajax({
                            url: sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER,
                            data: {
                                "page": 0,
                                "items": 20,
                                "userid": userId
                            },
                            success: function(data){
                                // Truncate long filenames
                                if (data && data.results) {
                                    for (var item in data.results) {
                                        if (data.results.hasOwnProperty(item)) {
                                            if (data.results[item]["sakai:pooled-content-file-name"]) {
                                                data.results[item]["sakai:pooled-content-file-name"] = sakai.api.Util.applyThreeDots(data.results[item]["sakai:pooled-content-file-name"], 165, {
                                                    max_rows: 1,
                                                    whole_word: false
                                                }, "s3d-bold");
                                            }
                                        }
                                    }
                                }

                                // add user content to their data object
                                dataCache[userId].contentItems = data;

                                // check user still has widget open before rendering results
                                if (open) {
                                    togglePersonInfo($clickedEl);
                                }
                            }
                        });
                    } else {
                        dataCache[userId] = {
                            displayName: sakai.api.i18n.getValueForKey('PRIVATE_USER', 'personinfo'),
                            displayPicture: sakai.config.URL.USER_DEFAULT_ICON_URL,
                            isPrivate: true
                        };
                        if (open) {
                            togglePersonInfo($clickedEl);
                        }
                    }
                });
            }
        };

        // bind personinfo cancel
        $personinfo_close.live("click", function(){
            hidePersonInfo();
        });

        // bind personinfo message button
        $personinfo_message.live("click", function () {
            var sendMessageUserObj = {};
            sendMessageUserObj.uuid = userId;
            sendMessageUserObj.username = sakai.api.User.getDisplayName(dataCache[userId]);
            sendMessageUserObj.type = "user";
            // initialize the sendmessage-widget
            $(document).trigger('initialize.sendmessage.sakai', [sendMessageUserObj, false, false, null, null, null]);
        });

        // bind personinfo request connection button
        $personinfo_invite.live("click", function(){
            $(document).trigger('initialize.addToContacts.sakai', [dataCache[userId]]);
        });

        // bind personinfo request connection button
        $personinfo_invited.live("click", function(){
            sakai.api.User.acceptContactInvite(userId, function(success) {
                if (success) {
                    $personinfo_invited.hide();
                }
            });
        });

        // bind hashchange to close dialog
        $(window).bind("hashchange hashchanged.inbox.sakai", function(){
            hidePersonInfo();
        });

        // bind click trigger
        $(".personinfo_trigger_click").live("click", function(){
            doInit($(this));
        });

        // bind addtocontact contact request
        $(window).bind("sakai.addToContacts.requested", function(ev, userToAdd){
            if (dataCache[userToAdd.userid]){
                dataCache[userToAdd.userid].connectionState = "PENDING";
                $personinfo_invite.hide();
                $personinfo_pending.show();
            }
        });


        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function that is run when the widget is triggered.
         * Determines which events to bind to and fetches user data if the widget
         * is not already opened.
         */
        var doInit = function ($clickedEl) {
            userId = $clickedEl.data("userid");

            // bind outside click to close widget
            $(document).bind("click.personinfo_close", function (e) {
                var $clicked = $(e.target);
                // Check if one of the parents is the tooltip
                if (!$clicked.parents().is("#personinfo") && $personinfo_widget.is(":visible")) {
                    hidePersonInfo();
                }
            });

            if (!open && userId){
                open = true;
                fetchPersonInfo($clickedEl);
            }
        };
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("personinfo");
});
