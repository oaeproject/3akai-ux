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
        var $personinfo_widget = $("#personinfo_widget", $rootel),
            $personinfo_container = $("#personinfo_container", $rootel),
            $personinfo_template = $("#personinfo_template", $rootel),
            $personinfo_close = $(".personinfo_close", $rootel),
            $personinfo_message = $("#personinfo_message", $rootel),
            $personinfo_invite = $("#personinfo_invite", $rootel);
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
        };

        /**
         * showPersonInfo
         * Shows the widget
         */
        var showPersonInfo = function(clickedEl) {
            var personinfoTop = clickedEl.offset().top + clickedEl.height() - 1;
            var personinfoLeft = clickedEl.offset().left + clickedEl.width() / 2 - 125;

            $personinfo_widget.css({
                top: personinfoTop,
                left: personinfoLeft
            });

            $personinfo_widget.jqmShow();
        };

        /**
         * togglePersonInfo
         * Displays the widget
         */
        var togglePersonInfo = function(clickedEl) {
            var json = {
                "user": dataCache[userId],
                "me": sakai.data.me,
                "sakai": sakai
            };

            $($personinfo_container).html(sakai.api.Util.TemplateRenderer("#personinfo_template", json));
            showPersonInfo(clickedEl);
        };

        /**
         * fetchPersonInfo
         * Fetches data about the user
         */
        var fetchPersonInfo = function(clickedEl) {
            $personinfo_invite.hide();
            userId = clickedEl.data("userid");

            // check if user is a contact and their connection state
            sakai.api.User.getConnectionState(userId, function(state){
                if (!state && userId !== sakai.data.me.user.userid){
                    $personinfo_invite.show();
                }
            });

            if (!open) {
                open = true;
                if (userId) {
                    if (dataCache[userId]) {
                        togglePersonInfo(clickedEl);
                    } else {
                        // display loading message
                        $($personinfo_container).html(sakai.api.Util.TemplateRenderer("#personinfo_loading_template", {"me": sakai.data.me}));
                        showPersonInfo(clickedEl);
                        sakai.api.User.getUser(userId, function(success, data){
                            if (success) {
                                dataCache[userId] = data;

                                // get display pic
                                var displayPicture = sakai.api.Util.constructProfilePicture(dataCache[userId]);
                                if (!displayPicture){
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
                                            togglePersonInfo(clickedEl);
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            }
        };

        // bind personinfo cancel
        $personinfo_close.live("click", function(){
            hidePersonInfo();
        });

        // bind personinfo message button
        $personinfo_message.live("click", function () {
            sendMessageUserObj = dataCache[userId];
            sendMessageUserObj.uuid = userId;
            sendMessageUserObj.username = sakai.api.User.getDisplayName(dataCache[userId]);;
            sendMessageUserObj.type = "user";
            // initialize the sendmessage-widget
            $(window).trigger("initialize.sendmessage.sakai", [sendMessageUserObj, false, false, null, null, null]);
        });

        // bind personinfo request connection button
        $personinfo_invite.live("click", function(){
            $(window).trigger("initialize.addToContacts.sakai", [dataCache[userId]]);
        });

        // bind hashchange to close dialog
        $(window).bind("hashchange hashchanged.newinbox.sakai", function(){
            hidePersonInfo();
        });

        // bind mouse hover trigger
        $(".personinfo_trigger").live("mouseenter", function(){
            fetchPersonInfo($(this));
        });

        // bind click trigger
        $(".personinfo_trigger_click").live("click", function(){
            fetchPersonInfo($(this));
        });

        // bind outside click to close widget
        $(document).unbind("click.personinfo_close").bind("click.personinfo_close", function (e) {
            var $clicked = $(e.target);
            // Check if one of the parents is the tooltip
            if (!$clicked.parents().is("#personinfo") && $personinfo_widget.is(":visible")) {
                hidePersonInfo();
            }
        });

        // bind hover out to close widget
        $personinfo_widget.bind("mouseleave", function(){
            hidePersonInfo();
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("personinfo");
});
