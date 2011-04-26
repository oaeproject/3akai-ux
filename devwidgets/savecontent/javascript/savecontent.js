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
            $savecontent_close = $(".savecontent_close", $rootel),
            $savecontent_save = $("#savecontent_save", $rootel),
            $savecontent_buttons = $("#savecontent_widget button", $rootel);
        var dataCache = {};
        var currentSelected = false;

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
            currentSelected = false;
            $savecontent_widget.jqmHide();
        };

        /**
         * toggleSavecontent
         * Displays the widget
         */
        var toggleSavecontent = function(contentId, clickedEl) {
            
            currentSelected = contentId;
            $savecontent_buttons.removeAttr("disabled");
            
            var savecontentTop = clickedEl.offset().top + clickedEl.height() - 5;
            var savecontentLeft = clickedEl.offset().left + clickedEl.width() / 2 - 125;
                
            $savecontent_widget.css({
                top: savecontentTop,
                left: savecontentLeft
            });
                
            var json = {
                "content": dataCache[contentId],
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
                sakai.api.Content.addToLibrary(currentSelected, id, function(contentId, entityId){
                    if (entityId === sakai.data.me.user.userid) {
                        sakai.api.Util.notification.show($("#savecontent_my_add_library_title").html(), $("#savecontent_my_add_library_body").html());
                    } else {
                        var notificationBody = $("#savecontent_group_add_library_body").html();
                        notificationBody = notificationBody.replace("${groupid}", entityId);
                        notificationBody = notificationBody.replace("${grouplibrary}", $("#savecontent_select option:selected", $rootel).text());
                        sakai.api.Util.notification.show($("#savecontent_group_add_library_title").html(), notificationBody);
                    }
                    dataCache[currentSelected]["sakai:pooled-content-viewer"].push(entityId);
                    if (sakai_global.content_profile) {
                        sakai_global.content_profile.content_data.members.viewers.push({
                            "userid": entityId
                        }); 
                    }
                    hideSavecontent();
                });
            }
        };

        // bind savecontent cancel
        $savecontent_close.live("click", function(){
            hideSavecontent();
        });

        // bind savecontent save button
        $savecontent_save.live("click", function () {
            saveContent($("#savecontent_select option:selected", $rootel).val());
        });
        
        var loadSaveContent = function(contentId, clickedEl){
            hideSavecontent();
            toggleSavecontent(contentId, clickedEl);
        }

        $(".savecontent_trigger").live("click", function(){
            var clickedEl = $(this);
            var contentId = clickedEl.data("entityid");
            if (contentId){
                if (dataCache[contentId]){
                    loadSaveContent(contentId, clickedEl);
                } else {
                    $.ajax({
                        url: "/p/" + contentId + ".2.json",
                        type: "GET",
                        dataType: "json",
                        success: function(data){
                            dataCache[contentId] = data;
                            loadSaveContent(contentId, clickedEl);
                        }
                    })
                }
            }
        });

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("savecontent");
});
