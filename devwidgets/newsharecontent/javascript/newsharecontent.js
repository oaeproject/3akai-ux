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

require(["jquery", "sakai/sakai.api.core"], function($, sakai){

    /**
     * @name sakai_global.newsharecontent
     *
     * @class newsharecontent
     *
     * @description
     * Content Share widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.newsharecontent = function(tuid, showSettings){

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var $newsharecontentContainer = $("#newsharecontent_widget");
        var $newsharecontentMessageContainer = $("#newsharecontent_message_container");

        // Elements
        var $newsharecontentLinkURL = $("#newsharecontent_linkurl");
        var $newsharecontentSharelist = $("#newsharecontent_sharelist");
        var $newsharecontentMessage = $("#newsharecontent_message");
        var $newsharecontentSendButton = $("#sharecontent_send_button");
        var newsharecontentListItem = ".as-selection-item";
        var newsharecontentShareListContainer = "#newsharecontent_sharelist_container";
        var $newsharecontentMessageToggle = $('label.toggletext',$newsharecontentContainer);
        var $newsharecontentMessageArrow = $('#newsharecontent_message_arrow');
        var $newsharecontentHeading = $('#newsharecontent_heading');
        var $newsharecontentAnon = $('.newsharecontent_anon_function');
        var $newsharecontentUser = $('.newsharecontent_user_function');
        var $newsharecontent_form = $("#newsharecontent_form");

        // Classes
        var newsharecontentRequiredClass = "newsharecontent_required";

        // Content object
        var contentObj = {};

        
        ///////////////
        // RENDERING //
        ///////////////

        var fillShareData = function(hash){
            $newsharecontentLinkURL.val(contentObj.shareUrl);
            var filenames = sakai.api.Util.TemplateRenderer("newsharecontent_filenames_template", {"files": contentObj.data});
            var shareURLs = sakai.api.Util.TemplateRenderer("newsharecontent_fileURLs_template", {"files": contentObj.data, sakai: sakai});
            var shareData = {
                "filename": filenames,
                "data": contentObj.data,
                "path": shareURLs,
                "user": sakai.api.Security.safeOutput(sakai.data.me.profile.basic.elements.firstName.value)
            };
            $newsharecontentMessage.html(sakai.api.Util.TemplateRenderer("newsharecontent_share_message_template", shareData));

            if (hash) {
                hash.w.show();
            }
            var tbx = $('#toolbox');
            if(tbx.find('a').length===0){
                var svcs = {facebook: 'Facebook', twitter: 'Twitter', delicious:'Delicious', stumbleupon: 'StumbleUpon', blogger:'Blogger', wordpress:'Wordpress', google:'Google', expanded: 'More'};
                for (var s in svcs) {
                    tbx.append('<a class="addthis_button_'+s+'" addthis:url="'+contentObj.shareUrl+'"></a>');
                }
                addthis.toolbox("#toolbox");
            }
        };

        var resetWidget = function(hash){
            $newsharecontentMessage.removeClass(newsharecontentRequiredClass);
            $(newsharecontentShareListContainer).removeClass(newsharecontentRequiredClass);
            sakai.api.Util.AutoSuggest.reset($newsharecontentSharelist);
            hash.w.hide();
        };

        ///////////
        // SHARE //
        ///////////

        var getSelectedList = function() {
            var list = $("#as-values-" + tuid).val();
            // this value is a comma-delimited list
            // split it and get rid of any empty values in the array
            list = list.split(",");
            var removed = 0;
            $(list).each(function(i, val) {

               if (val === "") {
                   list.splice(i - removed, 1);
                   removed += 1;
               }
            });

            // Create list to show in the notification
            var toAddNames = [];
            $("#newsharecontent_container .as-selection-item").each(function(){
                // In IE 7 </A> is returned and in firefox </a>
                toAddNames.push($(this).html().split(/<\/[aA]?>/g)[1]);
            });
            var returnValue = {"list":list, "toAddNames":toAddNames};

            return returnValue;
        };

        var createActivity = function(activityMessage){
            var activityData = {
                "sakai:activityMessage": activityMessage
            };
            $.each(contentObj.data, function(i, content){
                sakai.api.Activity.createActivity("/p/" + content.body["_path"], "content", "default", activityData);
            });
            $(window).trigger("load.content_profile.sakai", function(){
                $(window).trigger("render.entity.sakai", ["content", contentObj]);
            });
        };

        var doShare = function(event, userlist, message, contentobj, canmanage){
            var userList = userlist || getSelectedList();
            var messageText = message || $.trim($newsharecontentMessage.val());
            contentObj = contentobj || contentObj;
            $newsharecontentMessage.removeClass(newsharecontentRequiredClass);
            $(newsharecontentShareListContainer).removeClass(newsharecontentRequiredClass);
            if (userList && userList.list && userList.list.length && messageText && contentObj && contentObj.data) {
                var toAddList = userList.list.slice();
                userList.list = toAddList;
                if (toAddList.length) {
                    sakai.api.Communication.sendMessage(userList.list, sakai.data.me, sakai.api.i18n.getValueForKey("I_WANT_TO_SHARE", "newsharecontent") + sakai.api.Util.TemplateRenderer("newsharecontent_filenames_template", {"files": contentObj.data}), messageText, "message", false, false, true, "shared_content");
                    $.each(contentObj.data, function(i, content){
                        if (sakai.api.Content.Collections.isCollection(content.body)){
                            sakai.api.Content.Collections.shareCollection(content.body["_path"], toAddList, canmanage);
                        } else {
                            sakai.api.Content.addToLibrary(content.body["_path"], toAddList, canmanage);
                        }
                    });
                    sakai.api.Util.notification.show(false, $("#newsharecontent_users_added_text").text() + " " + userList.toAddNames.join(", "), "");
                    createActivity("__MSG__ADDED_A_MEMBER__");
                    $newsharecontentContainer.jqmHide();
                }
            } else {
                if (!messageText) {
                    $newsharecontentMessage.addClass(newsharecontentRequiredClass);
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("NO_MESSAGE_PROVIDED", "newsharecontent"), sakai.api.i18n.getValueForKey("A_MESSAGE_SHOULD_BE_PROVIDED_TO_SHARE", "newsharecontent"));
                }
                if (!userList.list.length) {
                    $(newsharecontentShareListContainer).addClass(newsharecontentRequiredClass);
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("NO_USERS_SELECTED", "newsharecontent"), sakai.api.i18n.getValueForKey("NO_USERS_TO_SHARE_FILE_WITH", "newsharecontent"));
                }
                if (!contentObj || !contentObj.data) {
                    $(newsharecontentShareListContainer).addClass(newsharecontentRequiredClass);
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey("AN_ERROR_OCCURRED", "newsharecontent"), sakai.api.i18n.getValueForKey("AN_ERROR_OCCURRED_FULL_MESSAGE", "newsharecontent"));
                }
            }
        };

        //////////////
        // BINDINGS //
        //////////////

        var addBinding = function(){
            $newsharecontentContainer.jqm({
                modal: false,
                overlay: 0,
                toTop: true,
                zIndex: 3000,
                onShow: fillShareData,
                onHide: resetWidget
            });

            $('.share_trigger_click').live('click',function(){
                sakai.api.Util.Forms.clearValidation($newsharecontent_form);
                var idArr = $(this).attr("data-entityid");
                if(idArr.length > 1 && !$.isArray(idArr)){
                    idArr = idArr.split(",");
                }
                var $this = $(this);
                $newsharecontentContainer.css({'top':$this.offset().top + $this.height() - 5,'left':$this.offset().left + $this.width() / 2 - 119});
                // Fetch data for content items
                var batchRequests = [];
                $.each(idArr, function(i, id){
                    batchRequests.push({
                        "url": "/p/" + id + ".json",
                        "method": "GET"
                    });
                });
                sakai.api.Server.batch(batchRequests, function(success, data) {
                    if (success) {
                        $.each(data.results, function(i, result){
                            data.results[i].body = $.parseJSON(data.results[i].body);
                        });
                        contentObj = {
                            "data": data.results
                        }
                        if (window["addthis"]) {
                            $newsharecontentContainer.jqmShow();
                        }
                    }
                });
            });

            $.validator.addMethod("requiredsuggest", function(value, element){
                return $.trim($(element).next("input.as-values").val()).replace(/,/g, "") !== "";
            }, sakai.api.i18n.getValueForKey("AUTOSUGGEST_REQUIRED_ERROR", "newsharecontent"));

            var validateOpts = {
                submitHandler: doShare
            };
            sakai.api.Util.Forms.validate($newsharecontent_form, validateOpts, true);
        };

        $newsharecontentMessageToggle.add($newsharecontentMessageArrow).bind('click',function(){
            $newsharecontentMessageArrow.toggleClass('arrow_down');
            $newsharecontentMessageContainer.stop(true, true).slideToggle();
        });

        sakai.api.Util.hideOnClickOut(".newsharecontent_dialog", ".share_trigger_click", function(){
            $newsharecontentContainer.jqmHide();
        });

        $(window).bind("finished.sharecontent.sakai",doShare);

        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var init = function(){
            if (!sakai.data.me.user.anon){
                $newsharecontentAnon.hide();
                $newsharecontentUser.show();
            }
            addBinding();
            var ajaxcache = $.ajaxSettings.cache;
            $.ajaxSettings.cache = true;
            $.getScript('//s7.addthis.com/js/250/addthis_widget.js?%23pubid=' + sakai.widgets.newsharecontent.defaultConfiguration.newsharecontent.addThisAccountId + '&domready=1');
            $.ajaxSettings.cache = ajaxcache;
            sakai.api.Util.AutoSuggest.setup( $newsharecontentSharelist, {
                asHtmlID: tuid,
                scrollHeight: 120
            });
            $("label#newsharecontent_autosuggest_for").attr("for", tuid);
        };

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("newsharecontent");
});
