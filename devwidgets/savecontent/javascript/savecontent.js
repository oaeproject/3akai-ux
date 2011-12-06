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
            $savecontent_save = $("#savecontent_save", $rootel);
        var newlyShared = {},
            allNewlyShared = [],
            contentObj = {},
            clickedEl = null;

        $savecontent_widget.jqm({
            modal: false,
            overlay: 0,
            zIndex: 1000,
            toTop: true
        });

        sakai_global.savecontent.getNewContent = function(library) {
            if (!library) {
                return allNewlyShared;
            } else if (newlyShared[library]) {
                return newlyShared[library];
            } else {
                return [];
            }
        };

        var deleteContent = function(e, paths) {
            if (paths && paths.length) {
                $.each(paths, function(i, path) {
                    $.each(allNewlyShared, function(j, newlyShared) {
                        if (newlyShared && newlyShared._path === path) {
                            allNewlyShared.splice(j,1);
                        }
                    });
                    $.each(newlyShared, function(lib, items) {
                        $.each(items, function(k, item) {
                            if (item && item._path === path) {
                                items.splice(k,1);
                            }
                        });
                    });
                });
            }
        };
        $(window).bind("done.deletecontent.sakai", deleteContent);

        /**
         * toggleSavecontent
         * Displays the widget
         */
        var toggleSavecontent = function() {

            $savecontent_save.removeAttr("disabled");

            var savecontentTop = clickedEl.offset().top + clickedEl.height() - 3;
            var savecontentLeft = clickedEl.offset().left + clickedEl.width() / 2 - 115;

            $savecontent_widget.css({
                top: savecontentTop,
                left: savecontentLeft
            });

            var json = {
                "files": contentObj.data,
                "me": sakai.data.me,
                "context": contentObj.context,
                "libraryHasIt": contentObj.libraryHasIt,
                "groups": contentObj.memberOfGroups,
                "sakai": sakai
            };
            $savecontent_container.html(sakai.api.Util.TemplateRenderer("#savecontent_template", json));
            enableDisableAddButton();
            $savecontent_widget.jqmShow();
        };

        var getFileIDs = function(){
            var tempArr = [];
            $.each(contentObj.data, function(i, content){
                tempArr.push(content.body["_path"]);
            });
            return tempArr;
        };

        /**
         * Checks if the content is a part of my library
         */
        var selectedAlreadyLibraryMember = function(){
            contentObj.libraryHasIt = true;
            $.each(contentObj.data, function(i, content){
                if(!sakai.api.Content.isContentInLibrary(content.body, sakai.data.me.user.userid)){
                    contentObj.libraryHasIt = false;
                }
            });
            toggleSavecontent();
        };

        /**
         * Determines if the selected content items are a part of any groups
         */
        var selectAlreadyInGroup = function(){
            $.each(contentObj.data, function(i, selectedContent){
                $.each(contentObj.memberOfGroups.entry, function(j, memberOfGroup){
                    // Check if content is part of the group
                    var isContentInGroup = sakai.api.Content.isContentInLibrary(selectedContent.body, memberOfGroup["sakai:group-id"]);
                    if (!isContentInGroup){
                        memberOfGroup.overrideAllSelectedAMember = true;
                    }
                });
            });
            selectedAlreadyLibraryMember();
        };

        /**
         * hideSavecontent
         * Hides the widget
         */
        var hideSavecontent = function() {
            $savecontent_widget.jqmHide();
        };

        /**
         * saveContent
         * Saves the content to the selected group
         * @param {String} id ID of the group we want to add as a viewer
         */
        var saveContent = function(id){
            if(!$("#savecontent_select option:selected", $rootel).data("redirect") === true){
                $savecontent_save.attr("disabled", "disabled");
                $.each(contentObj.data, function(i, content){
                    sakai.api.Content.addToLibrary(content.body["_path"], id, false, function(contentId, entityId) {
                        if (sakai_global.content_profile) {
                            sakai_global.content_profile.content_data.members.viewers.push({
                                "userid": entityId
                            });
                        }
                    });
                });
                $(window).trigger("done.newaddcontent.sakai");
                var notificationBody = decodeURIComponent($("#savecontent_group_add_library_body").html());
                notificationBody = notificationBody.replace("${groupid}", sakai.api.Security.safeOutput(id));
                notificationBody = notificationBody.replace("${grouplibrary}", sakai.api.Security.safeOutput($("#savecontent_select option:selected", $rootel).text()));
                sakai.api.Util.notification.show($("#savecontent_group_add_library_title").html(), notificationBody);
                hideSavecontent();
            } else {
                document.location = "/create#l=" + $("#savecontent_select", $rootel).val() + "&contentToAdd=" + getFileIDs().toString();
            }
        };

        enableDisableAddButton = function(){
            var dropdownSelection = $("#savecontent_select option:selected", $rootel);
            if (dropdownSelection.attr("disabled") || !dropdownSelection.val()){
                $savecontent_save.attr("disabled", "disabled");
            } else {
                $savecontent_save.removeAttr("disabled");
            }
        };

        // bind savecontent cancel
        $savecontent_close.live("click", function(){
            hideSavecontent();
        });

        // bind savecontent save button
        $savecontent_save.live("click", function(){
            var dropdownSelection = $("#savecontent_select option:selected", $rootel);
            if (!dropdownSelection.attr("disabled") && dropdownSelection.val()) {
                saveContent(dropdownSelection.val());
            }
        });

        $("#savecontent_select", $rootel).live("change", function(){
            enableDisableAddButton();
        });

        sakai.api.Util.hideOnClickOut(".savecontent_dialog", ".savecontent_trigger", hideSavecontent);

        $(".savecontent_trigger").live("click", function(el){
            clickedEl = $(this);
            contentObj.memberOfGroups = $.extend(true, {}, sakai.api.Groups.getMemberships(sakai.data.me.groups));
            contentObj.context = $(el.currentTarget).attr("data-entitycontext") || false;
            var idArr = $(".savecontent_trigger:visible").attr("data-entityid");
            if(idArr.length > 1 && !$.isArray(idArr)){
                idArr = idArr.split(",");
            }
            var batchRequests = [];
            $.each(idArr, function(i, id){
                batchRequests.push({
                    "url": "/p/" + id + ".2.json",
                    "method": "GET"
                });
            });
            sakai.api.Server.batch(batchRequests, function(success, data) {
                if (success) {
                    $.each(data.results, function(i, content){
                        data.results[i].body = $.parseJSON(data.results[i].body);
                    });
                    contentObj.data = data.results;
                    selectAlreadyInGroup();
                }
            });
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("savecontent");
});
