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
     * @name sakai_global.savecontent
     *
     * @class savecontent
     *
     * @description
     * Savecontent dialog box
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.savecontent = function(tuid, showSettings) {

        var $rootel = $("#" + tuid);
        var $savecontent_widget = $("#savecontent_widget", $rootel),
            $savecontent_container = $("#savecontent_container", $rootel),
            $savecontent_template = $("#savecontent_template", $rootel),
            $savecontent_close = $(".savecontent_close", $rootel);
            $savecontent_buttons = $("#savecontent_widget button", $rootel);

        $savecontent_widget.jqm({
            modal: false,
            overlay: 0,
            zIndex: 1000,
            toTop: true
        });

        /**
         * hideSavecontent
         * Hides the widget
         */
        var hideSavecontent = function() {
            $savecontent_widget.jqmHide();
        };

        /**
         * toggleSavecontent
         * Displays the widget
         */
        var toggleSavecontent = function() {
            var savecontentTop = $("#entity_content_save").offset().top + $("#entity_content_save").height() + 5;
            var savecontentLeft = $("#entity_content_save").offset().left + $("#entity_content_save").width() - 150;

            $savecontent_widget.css({
                top: savecontentTop,
                left: savecontentLeft
            });

            var json = {
                "content": sakai_global.content_profile.content_data,
                "me": sakai.data.me,
                "sakai": sakai
            };

            $($savecontent_container).html(sakai.api.Util.TemplateRenderer("#savecontent_template", json));
            $savecontent_widget.jqmShow();
        };

        /**
         * saveContent
         * Saves the content to the selected group
         * @param {String} id ID of the group we want to add as a viewer
         */
        var saveContent = function(id){
            if (id) {
                $savecontent_buttons.attr("disabled", "disabled");
                if (id === "mylibrary") {
                    sakai.api.Content.addToLibrary(sakai_global.content_profile.content_data.data["jcr:path"], sakai.data.me.user.userid, function(contentId, userId){
                        sakai.api.Util.notification.show($("#content_profile_add_library_title").html(), $("#content_profile_add_library_body").html());
                        sakai_global.content_profile.content_data.members.viewers.push({"userid": userId});
                        hideSavecontent();
                    });
                } else {
                    var name = id;
                    // get group name
                    for (var i in sakai.data.me.groups) {
                        if (sakai.data.me.groups.hasOwnProperty(i)) {
                            if (sakai.data.me.groups[i]["sakai:group-id"] === id) {
                                name = sakai.data.me.groups[i]["sakai:group-title"];
                            }
                        }
                    }

                    // trigger content profile to add viewer
                    $(window).trigger("finished.savecontent.sakai", {
                        "toAdd": [id],
                        "toAddNames": [name],
                        "mode": "viewers"
                    });

                    // bind when content profile has added viewer, close the widget
                    $(window).bind("membersadded.content.sakai", function(){
                        hideSavecontent();
                    });
                }
            }
        };

        /**
         * addBinding
         */
        var addBinding = function(){
            // bind savecontent cancel
            $savecontent_close.unbind("click");
            $savecontent_close.bind("click", function(){
                hideSavecontent();
            });

            // bind savecontent save button
            $("#savecontent_save").unbind("click");
            $("#savecontent_save").bind("click", function () {
                saveContent($("#savecontent_select option:selected").val());
            });
        };

        $(window).unbind("init.savecontent.sakai");
        $(window).bind("init.savecontent.sakai", function() {
            $savecontent_buttons.removeAttr("disabled", "disabled");
            addBinding();
            toggleSavecontent();
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("savecontent");
});
